import type { Quote, LineItem } from '../types';

// n8n webhook base URL
const N8N_WEBHOOK_URL = import.meta.env.VITE_N8N_WEBHOOK_URL || '';

// Check if n8n is configured
export const isN8nConfigured = Boolean(N8N_WEBHOOK_URL);

// Local storage key for demo mode
const DEMO_QUOTES_KEY = 'quotemyav-demo-quotes';

// Helper to get demo quotes from localStorage
const getDemoQuotes = (): Quote[] => {
  const stored = localStorage.getItem(DEMO_QUOTES_KEY);
  return stored ? JSON.parse(stored) : [];
};

// Helper to save demo quotes to localStorage
const saveDemoQuotes = (quotes: Quote[]) => {
  localStorage.setItem(DEMO_QUOTES_KEY, JSON.stringify(quotes));
};

// Helper for n8n API calls
const n8nFetch = async (path: string, options: RequestInit = {}) => {
  const url = `${N8N_WEBHOOK_URL}${path}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`n8n request failed: ${response.statusText}`);
  }

  return response.json();
};

export const quoteService = {
  // Fetch all quotes for the current user
  async getQuotes(userId: string): Promise<{ quotes: Quote[]; error: Error | null }> {
    if (!isN8nConfigured) {
      // Demo mode - use localStorage
      const quotes = getDemoQuotes().filter((q) => q.userId === userId);
      return { quotes, error: null };
    }

    try {
      const response = await n8nFetch(`/quotes?userId=${encodeURIComponent(userId)}`);
      const quotes = response.quotes || [];
      return { quotes, error: null };
    } catch (err) {
      console.error('Failed to fetch quotes from n8n:', err);
      // Fallback to localStorage
      const quotes = getDemoQuotes().filter((q) => q.userId === userId);
      return { quotes, error: err as Error };
    }
  },

  // Fetch a single quote by ID
  async getQuote(quoteId: string): Promise<{ quote: Quote | null; error: Error | null }> {
    if (!isN8nConfigured) {
      // Demo mode
      const quotes = getDemoQuotes();
      const quote = quotes.find((q) => q.id === quoteId) || null;
      return { quote, error: null };
    }

    try {
      const response = await n8nFetch(`/quotes/${quoteId}`);
      return { quote: response.quote || null, error: null };
    } catch (err) {
      console.error('Failed to fetch quote from n8n:', err);
      // Fallback to localStorage
      const quotes = getDemoQuotes();
      const quote = quotes.find((q) => q.id === quoteId) || null;
      return { quote, error: err as Error };
    }
  },

  // Create a new quote
  async createQuote(quote: Omit<Quote, 'id' | 'createdAt' | 'updatedAt'>): Promise<{ quote: Quote | null; error: Error | null }> {
    // Always save to localStorage first (as backup)
    const localQuote: Quote = {
      ...quote,
      id: `QM-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const localQuotes = getDemoQuotes();
    localQuotes.unshift(localQuote);
    saveDemoQuotes(localQuotes);

    if (!isN8nConfigured) {
      return { quote: localQuote, error: null };
    }

    try {
      const response = await n8nFetch('/quotes', {
        method: 'POST',
        body: JSON.stringify(quote),
      });

      const savedQuote = response.quote || localQuote;

      // Update localStorage with the server-generated ID
      if (response.quote) {
        const updatedQuotes = localQuotes.map((q) =>
          q.id === localQuote.id ? savedQuote : q
        );
        saveDemoQuotes(updatedQuotes);
      }

      return { quote: savedQuote, error: null };
    } catch (err) {
      console.error('Failed to save quote to n8n:', err);
      // Quote is already in localStorage, so return it
      return { quote: localQuote, error: err as Error };
    }
  },

  // Update a quote
  async updateQuote(quoteId: string, updates: Partial<Quote>): Promise<{ quote: Quote | null; error: Error | null }> {
    // Update localStorage first
    const quotes = getDemoQuotes();
    const index = quotes.findIndex((q) => q.id === quoteId);
    if (index !== -1) {
      quotes[index] = {
        ...quotes[index],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      saveDemoQuotes(quotes);
    }

    if (!isN8nConfigured) {
      return { quote: index !== -1 ? quotes[index] : null, error: null };
    }

    try {
      const response = await n8nFetch(`/quotes/${quoteId}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });

      const updatedQuote = response.quote;

      // Sync with localStorage
      if (updatedQuote && index !== -1) {
        quotes[index] = updatedQuote;
        saveDemoQuotes(quotes);
      }

      return { quote: updatedQuote || quotes[index], error: null };
    } catch (err) {
      console.error('Failed to update quote in n8n:', err);
      return { quote: index !== -1 ? quotes[index] : null, error: err as Error };
    }
  },

  // Delete a quote
  async deleteQuote(quoteId: string): Promise<{ error: Error | null }> {
    // Remove from localStorage
    const quotes = getDemoQuotes().filter((q) => q.id !== quoteId);
    saveDemoQuotes(quotes);

    if (!isN8nConfigured) {
      return { error: null };
    }

    try {
      await n8nFetch(`/quotes/${quoteId}`, {
        method: 'DELETE',
      });
      return { error: null };
    } catch (err) {
      console.error('Failed to delete quote from n8n:', err);
      return { error: err as Error };
    }
  },

  // Line item operations (stored within the quote JSON)
  async getLineItems(quoteId: string): Promise<{ lineItems: LineItem[]; error: Error | null }> {
    const { quote, error } = await this.getQuote(quoteId);
    return { lineItems: quote?.lineItems || [], error };
  },

  async addLineItem(quoteId: string, item: Omit<LineItem, 'id'>): Promise<{ lineItem: LineItem | null; error: Error | null }> {
    const { quote, error: fetchError } = await this.getQuote(quoteId);
    if (!quote) {
      return { lineItem: null, error: fetchError || new Error('Quote not found') };
    }

    const newItem: LineItem = {
      ...item,
      id: `item-${Date.now()}`,
    };

    const updatedLineItems = [...quote.lineItems, newItem];
    const totalAmount = updatedLineItems.reduce((sum, i) => sum + i.total, 0);

    const { error: updateError } = await this.updateQuote(quoteId, {
      lineItems: updatedLineItems,
      totalAmount,
    });

    return { lineItem: newItem, error: updateError };
  },

  async updateLineItem(quoteId: string, itemId: string, updates: Partial<LineItem>): Promise<{ lineItem: LineItem | null; error: Error | null }> {
    const { quote, error: fetchError } = await this.getQuote(quoteId);
    if (!quote) {
      return { lineItem: null, error: fetchError || new Error('Quote not found') };
    }

    let updatedItem: LineItem | null = null;
    const updatedLineItems = quote.lineItems.map((item) => {
      if (item.id === itemId) {
        updatedItem = { ...item, ...updates };
        return updatedItem;
      }
      return item;
    });

    const totalAmount = updatedLineItems.reduce((sum, i) => sum + i.total, 0);

    const { error: updateError } = await this.updateQuote(quoteId, {
      lineItems: updatedLineItems,
      totalAmount,
    });

    return { lineItem: updatedItem, error: updateError };
  },

  async deleteLineItem(quoteId: string, itemId: string): Promise<{ error: Error | null }> {
    const { quote, error: fetchError } = await this.getQuote(quoteId);
    if (!quote) {
      return { error: fetchError || new Error('Quote not found') };
    }

    const updatedLineItems = quote.lineItems.filter((item) => item.id !== itemId);
    const totalAmount = updatedLineItems.reduce((sum, i) => sum + i.total, 0);

    return this.updateQuote(quoteId, {
      lineItems: updatedLineItems,
      totalAmount,
    });
  },
};

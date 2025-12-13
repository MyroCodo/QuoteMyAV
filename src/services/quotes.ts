import type { Quote, LineItem } from '../types';
import { apiGet, apiPost, apiPatch, apiDelete, isApiConfigured } from './api-client';

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

// Re-export for backward compatibility
export { isApiConfigured };

export const quoteService = {
  // Fetch all quotes for the current user
  async getQuotes(_userId: string): Promise<{ quotes: Quote[]; error: Error | null }> {
    if (!isApiConfigured) {
      // Demo mode - use localStorage
      const quotes = getDemoQuotes();
      return { quotes, error: null };
    }

    try {
      const response = await apiGet<Quote[]>('/v1/quotes');
      const quotes = response.data || [];
      return { quotes, error: null };
    } catch (err) {
      console.error('Failed to fetch quotes from API:', err);
      // Fallback to localStorage
      const quotes = getDemoQuotes();
      return { quotes, error: err as Error };
    }
  },

  // Fetch a single quote by ID
  async getQuote(quoteId: string): Promise<{ quote: Quote | null; error: Error | null }> {
    if (!isApiConfigured) {
      // Demo mode
      const quotes = getDemoQuotes();
      const quote = quotes.find((q) => q.id === quoteId) || null;
      return { quote, error: null };
    }

    try {
      const response = await apiGet<Quote>(`/v1/quotes/${quoteId}`);
      return { quote: response.data || null, error: null };
    } catch (err) {
      console.error('Failed to fetch quote from API:', err);
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

    if (!isApiConfigured) {
      return { quote: localQuote, error: null };
    }

    try {
      const response = await apiPost<Quote>('/v1/quotes', {
        clientName: quote.clientName,
        clientEmail: quote.clientEmail,
        eventName: quote.eventName,
        eventDate: quote.eventDate,
        venue: quote.venue,
        lineItems: quote.lineItems,
        notes: quote.notes,
      });

      const savedQuote = response.data || localQuote;

      // Update localStorage with the server-generated ID
      if (response.data) {
        const updatedQuotes = localQuotes.map((q) =>
          q.id === localQuote.id ? savedQuote : q
        );
        saveDemoQuotes(updatedQuotes);
      }

      return { quote: savedQuote, error: null };
    } catch (err) {
      console.error('Failed to save quote to API:', err);
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

    if (!isApiConfigured) {
      return { quote: index !== -1 ? quotes[index] : null, error: null };
    }

    try {
      const response = await apiPatch<Quote>(`/v1/quotes/${quoteId}`, updates);

      const updatedQuote = response.data;

      // Sync with localStorage
      if (updatedQuote && index !== -1) {
        quotes[index] = updatedQuote;
        saveDemoQuotes(quotes);
      }

      return { quote: updatedQuote || quotes[index], error: null };
    } catch (err) {
      console.error('Failed to update quote in API:', err);
      return { quote: index !== -1 ? quotes[index] : null, error: err as Error };
    }
  },

  // Delete a quote
  async deleteQuote(quoteId: string): Promise<{ error: Error | null }> {
    // Remove from localStorage
    const quotes = getDemoQuotes().filter((q) => q.id !== quoteId);
    saveDemoQuotes(quotes);

    if (!isApiConfigured) {
      return { error: null };
    }

    try {
      await apiDelete(`/v1/quotes/${quoteId}`);
      return { error: null };
    } catch (err) {
      console.error('Failed to delete quote from API:', err);
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

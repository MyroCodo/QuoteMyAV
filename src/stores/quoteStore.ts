import { create } from 'zustand';
import type { Quote, LineItem, QuoteChangeType, QuoteVersion } from '../types';
import { quoteService } from '../services/quotes';
import { useVersionStore } from './versionStore';

interface QuoteState {
  quotes: Quote[];
  currentQuote: Quote | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchQuotes: (userId: string) => Promise<void>;
  fetchQuote: (quoteId: string) => Promise<void>;
  addQuote: (quote: Quote) => void;
  createQuote: (quote: Omit<Quote, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Quote | null>;
  updateQuote: (id: string, updates: Partial<Quote>) => Promise<void>;
  deleteQuote: (id: string) => Promise<void>;

  // Line item operations
  addLineItem: (quoteId: string, item: Omit<LineItem, 'id'>) => Promise<void>;
  updateLineItem: (quoteId: string, itemId: string, updates: Partial<LineItem>) => Promise<void>;
  removeLineItem: (quoteId: string, itemId: string) => Promise<void>;

  // Versioning operations
  createVersionSnapshot: (quoteId: string, changeType: QuoteChangeType, description?: string) => void;
  revertToVersion: (version: QuoteVersion) => Promise<void>;

  // Local state updates (for optimistic UI)
  setQuotes: (quotes: Quote[]) => void;
  setCurrentQuote: (quote: Quote | null) => void;
  clearError: () => void;
}

export const useQuoteStore = create<QuoteState>((set, get) => ({
  quotes: [],
  currentQuote: null,
  isLoading: false,
  error: null,

  setQuotes: (quotes) => set({ quotes }),
  setCurrentQuote: (quote) => set({ currentQuote: quote }),
  clearError: () => set({ error: null }),

  fetchQuotes: async (userId) => {
    set({ isLoading: true, error: null });
    const { quotes, error } = await quoteService.getQuotes(userId);
    if (error) {
      set({ isLoading: false, error: error.message });
    } else {
      set({ quotes, isLoading: false });
    }
  },

  fetchQuote: async (quoteId) => {
    set({ isLoading: true, error: null });
    const { quote, error } = await quoteService.getQuote(quoteId);
    if (error) {
      set({ isLoading: false, error: error.message });
    } else {
      set({ currentQuote: quote, isLoading: false });
    }
  },

  // For local/optimistic updates
  addQuote: (quote) => set((state) => ({
    quotes: [quote, ...state.quotes]
  })),

  createQuote: async (quoteData) => {
    set({ isLoading: true, error: null });
    const { quote, error } = await quoteService.createQuote(quoteData);
    if (error) {
      set({ isLoading: false, error: error.message });
      return null;
    }
    if (quote) {
      set((state) => ({
        quotes: [quote, ...state.quotes],
        isLoading: false,
      }));
    }
    return quote;
  },

  updateQuote: async (id, updates) => {
    // Optimistic update
    set((state) => ({
      quotes: state.quotes.map((q) => (q.id === id ? { ...q, ...updates } : q)),
      currentQuote: state.currentQuote?.id === id
        ? { ...state.currentQuote, ...updates }
        : state.currentQuote,
    }));

    const { error } = await quoteService.updateQuote(id, updates);
    if (error) {
      // Revert on error - refetch quotes
      const { quotes } = get();
      const userId = quotes[0]?.userId;
      if (userId) {
        const { quotes: freshQuotes } = await quoteService.getQuotes(userId);
        set({ quotes: freshQuotes, error: error.message });
      }
    }
  },

  deleteQuote: async (id) => {
    // Optimistic update
    const { quotes, currentQuote } = get();
    set({
      quotes: quotes.filter((q) => q.id !== id),
      currentQuote: currentQuote?.id === id ? null : currentQuote,
    });

    const { error } = await quoteService.deleteQuote(id);
    if (error) {
      // Revert on error
      set({ quotes, error: error.message });
    }
  },

  addLineItem: async (quoteId, item) => {
    const { lineItem, error } = await quoteService.addLineItem(quoteId, item);
    if (error) {
      set({ error: error.message });
      return;
    }
    if (lineItem) {
      set((state) => ({
        quotes: state.quotes.map((q) => {
          if (q.id === quoteId) {
            const newItems = [...q.lineItems, lineItem];
            return {
              ...q,
              lineItems: newItems,
              totalAmount: newItems.reduce((sum, i) => sum + i.total, 0),
            };
          }
          return q;
        }),
        currentQuote: state.currentQuote?.id === quoteId
          ? {
              ...state.currentQuote,
              lineItems: [...state.currentQuote.lineItems, lineItem],
              totalAmount: [...state.currentQuote.lineItems, lineItem].reduce((sum, i) => sum + i.total, 0),
            }
          : state.currentQuote,
      }));
    }
  },

  updateLineItem: async (quoteId, itemId, updates) => {
    const { error } = await quoteService.updateLineItem(quoteId, itemId, updates);
    if (error) {
      set({ error: error.message });
      return;
    }
    set((state) => ({
      quotes: state.quotes.map((q) => {
        if (q.id === quoteId) {
          const newItems = q.lineItems.map((i) => (i.id === itemId ? { ...i, ...updates } : i));
          return {
            ...q,
            lineItems: newItems,
            totalAmount: newItems.reduce((sum, i) => sum + i.total, 0),
          };
        }
        return q;
      }),
      currentQuote: state.currentQuote?.id === quoteId
        ? {
            ...state.currentQuote,
            lineItems: state.currentQuote.lineItems.map((i) =>
              i.id === itemId ? { ...i, ...updates } : i
            ),
            totalAmount: state.currentQuote.lineItems
              .map((i) => (i.id === itemId ? { ...i, ...updates } : i))
              .reduce((sum, i) => sum + i.total, 0),
          }
        : state.currentQuote,
    }));
  },

  removeLineItem: async (quoteId, itemId) => {
    const { error } = await quoteService.deleteLineItem(quoteId, itemId);
    if (error) {
      set({ error: error.message });
      return;
    }
    set((state) => ({
      quotes: state.quotes.map((q) => {
        if (q.id === quoteId) {
          const newItems = q.lineItems.filter((i) => i.id !== itemId);
          return {
            ...q,
            lineItems: newItems,
            totalAmount: newItems.reduce((sum, i) => sum + i.total, 0),
          };
        }
        return q;
      }),
      currentQuote: state.currentQuote?.id === quoteId
        ? {
            ...state.currentQuote,
            lineItems: state.currentQuote.lineItems.filter((i) => i.id !== itemId),
            totalAmount: state.currentQuote.lineItems
              .filter((i) => i.id !== itemId)
              .reduce((sum, i) => sum + i.total, 0),
          }
        : state.currentQuote,
    }));
  },

  // Versioning operations
  createVersionSnapshot: (quoteId, changeType, description) => {
    const { quotes, currentQuote } = get();
    const quote = currentQuote?.id === quoteId ? currentQuote : quotes.find(q => q.id === quoteId);

    if (quote) {
      const versionStore = useVersionStore.getState();
      versionStore.createVersion(quote, changeType, description || '', 'auto');
    }
  },

  revertToVersion: async (version) => {
    const { quotes, currentQuote } = get();
    const quoteId = version.quoteId;
    const snapshot = version.snapshot;

    // First create a version of the current state before reverting
    const currentQuoteData = currentQuote?.id === quoteId ? currentQuote : quotes.find(q => q.id === quoteId);
    if (currentQuoteData) {
      const versionStore = useVersionStore.getState();
      versionStore.createVersion(
        currentQuoteData,
        'manual_snapshot',
        `Snapshot before reverting to v${version.versionNumber}`,
        'auto'
      );
    }

    // Apply the snapshot data
    const updates: Partial<Quote> = {
      eventName: snapshot.eventName,
      eventDate: snapshot.eventDate,
      venue: snapshot.venue,
      status: snapshot.status,
      totalAmount: snapshot.totalAmount,
      lineItems: snapshot.lineItems,
    };

    // Update local state
    set((state) => ({
      quotes: state.quotes.map((q) => (q.id === quoteId ? { ...q, ...updates } : q)),
      currentQuote: state.currentQuote?.id === quoteId
        ? { ...state.currentQuote, ...updates }
        : state.currentQuote,
    }));

    // Persist to service
    const { error } = await quoteService.updateQuote(quoteId, updates);
    if (error) {
      set({ error: error.message });
    } else {
      // Create a version for the revert
      const updatedQuote = get().quotes.find(q => q.id === quoteId);
      if (updatedQuote) {
        const versionStore = useVersionStore.getState();
        versionStore.createVersion(
          updatedQuote,
          'manual_snapshot',
          `Reverted to v${version.versionNumber}`,
          'manual'
        );
      }
    }
  },
}));

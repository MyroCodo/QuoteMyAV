import { create } from 'zustand';
import type { LineItem } from '../types';

// Types for AI edit operations
export interface AIChange {
  id: string;
  type: 'added' | 'removed' | 'modified';
  category: string;
  description: string;
  oldValue?: Partial<LineItem>;
  newValue?: Partial<LineItem>;
  priceDelta: number;
}

export interface AIEditResult {
  modifiedLineItems: LineItem[];
  changes: AIChange[];
  summary: string;
  totalSavings: number;
  percentageChange: number;
}

interface AIEditState {
  // State
  isOpen: boolean;
  isProcessing: boolean;
  error: string | null;
  pendingResult: AIEditResult | null;
  commandHistory: string[];

  // Actions
  openSidebar: () => void;
  closeSidebar: () => void;
  toggleSidebar: () => void;
  setProcessing: (processing: boolean) => void;
  setError: (error: string | null) => void;
  setPendingResult: (result: AIEditResult | null) => void;
  addToHistory: (command: string) => void;
  clearPendingResult: () => void;
  reset: () => void;
}

export const useAIEditStore = create<AIEditState>((set) => ({
  // Initial state
  isOpen: false,
  isProcessing: false,
  error: null,
  pendingResult: null,
  commandHistory: [],

  // Actions
  openSidebar: () => set({ isOpen: true }),
  closeSidebar: () => set({ isOpen: false }),
  toggleSidebar: () => set((state) => ({ isOpen: !state.isOpen })),

  setProcessing: (processing) => set({ isProcessing: processing, error: null }),
  setError: (error) => set({ error, isProcessing: false }),

  setPendingResult: (result) => set({ pendingResult: result, isProcessing: false }),

  addToHistory: (command) =>
    set((state) => ({
      commandHistory: [command, ...state.commandHistory.slice(0, 9)], // Keep last 10
    })),

  clearPendingResult: () => set({ pendingResult: null }),

  reset: () =>
    set({
      isOpen: false,
      isProcessing: false,
      error: null,
      pendingResult: null,
    }),
}));

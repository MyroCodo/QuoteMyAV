import { create } from 'zustand';
import type {
  Quote,
  QuoteVersion,
  QuoteSnapshot,
  QuoteChangeType,
  QuoteVersionDiff,
  VersionChange,
  LineItem,
} from '../types';

interface VersionState {
  // Versions indexed by quoteId
  versionsByQuote: Record<string, QuoteVersion[]>;

  // Currently selected version for comparison
  selectedVersionA: QuoteVersion | null;
  selectedVersionB: QuoteVersion | null;

  // UI state
  isHistoryOpen: boolean;
  isCompareModalOpen: boolean;

  // Actions
  createVersion: (
    quote: Quote,
    changeType: QuoteChangeType,
    description: string,
    trigger?: 'auto' | 'manual'
  ) => QuoteVersion;

  getVersionsForQuote: (quoteId: string) => QuoteVersion[];
  getLatestVersion: (quoteId: string) => QuoteVersion | null;
  getVersionById: (quoteId: string, versionId: string) => QuoteVersion | null;

  compareVersions: (versionA: QuoteVersion, versionB: QuoteVersion) => QuoteVersionDiff;

  setSelectedVersions: (versionA: QuoteVersion | null, versionB: QuoteVersion | null) => void;
  openHistory: () => void;
  closeHistory: () => void;
  openCompareModal: () => void;
  closeCompareModal: () => void;

  loadVersionsFromStorage: () => void;
  clearVersions: (quoteId: string) => void;
}

// Helper to create a snapshot from a quote
function createSnapshot(quote: Quote): QuoteSnapshot {
  return {
    eventName: quote.eventName,
    eventDate: quote.eventDate,
    venue: quote.venue,
    status: quote.status,
    totalAmount: quote.totalAmount,
    lineItems: JSON.parse(JSON.stringify(quote.lineItems)), // Deep copy
  };
}

// Helper to generate a description for auto-versions
function generateAutoDescription(changeType: QuoteChangeType): string {
  switch (changeType) {
    case 'created':
      return 'Quote created';
    case 'items_added':
      return 'Line items added';
    case 'items_removed':
      return 'Line items removed';
    case 'items_modified':
      return 'Line items modified';
    case 'status_changed':
      return 'Status updated';
    case 'ai_edit_applied':
      return 'AI edit applied';
    case 'manual_snapshot':
      return 'Manual snapshot';
    default:
      return 'Quote updated';
  }
}

// Helper to calculate diff between two line item arrays
function calculateLineItemDiff(
  oldItems: LineItem[],
  newItems: LineItem[]
): VersionChange[] {
  const changes: VersionChange[] = [];

  // Map items by ID for easy lookup
  const oldMap = new Map(oldItems.map(item => [item.id, item]));
  const newMap = new Map(newItems.map(item => [item.id, item]));

  // Find added items
  for (const newItem of newItems) {
    if (!oldMap.has(newItem.id)) {
      changes.push({
        type: 'added',
        category: newItem.category,
        description: newItem.description,
        newValue: {
          quantity: newItem.quantity,
          unitPrice: newItem.unitPrice,
          total: newItem.total,
        },
        priceDelta: newItem.total,
      });
    }
  }

  // Find removed items
  for (const oldItem of oldItems) {
    if (!newMap.has(oldItem.id)) {
      changes.push({
        type: 'removed',
        category: oldItem.category,
        description: oldItem.description,
        oldValue: {
          quantity: oldItem.quantity,
          unitPrice: oldItem.unitPrice,
          total: oldItem.total,
        },
        priceDelta: -oldItem.total,
      });
    }
  }

  // Find modified items
  for (const newItem of newItems) {
    const oldItem = oldMap.get(newItem.id);
    if (oldItem) {
      const hasChanges =
        oldItem.quantity !== newItem.quantity ||
        oldItem.unitPrice !== newItem.unitPrice ||
        oldItem.description !== newItem.description;

      if (hasChanges) {
        changes.push({
          type: 'modified',
          category: newItem.category,
          description: newItem.description,
          oldValue: {
            quantity: oldItem.quantity,
            unitPrice: oldItem.unitPrice,
            total: oldItem.total,
          },
          newValue: {
            quantity: newItem.quantity,
            unitPrice: newItem.unitPrice,
            total: newItem.total,
          },
          priceDelta: newItem.total - oldItem.total,
        });
      }
    }
  }

  return changes;
}

const STORAGE_KEY = 'quotemyav_versions';

export const useVersionStore = create<VersionState>((set, get) => ({
  versionsByQuote: {},
  selectedVersionA: null,
  selectedVersionB: null,
  isHistoryOpen: false,
  isCompareModalOpen: false,

  createVersion: (quote, changeType, description, trigger = 'auto') => {
    const { versionsByQuote } = get();
    const existingVersions = versionsByQuote[quote.id] || [];
    const nextVersionNumber = existingVersions.length + 1;

    const newVersion: QuoteVersion = {
      id: `ver-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      quoteId: quote.id,
      versionNumber: nextVersionNumber,
      createdAt: new Date().toISOString(),
      trigger,
      description: description || generateAutoDescription(changeType),
      changeType,
      snapshot: createSnapshot(quote),
    };

    const updatedVersions = [...existingVersions, newVersion];

    set({
      versionsByQuote: {
        ...versionsByQuote,
        [quote.id]: updatedVersions,
      },
    });

    // Persist to localStorage
    try {
      const allVersions = {
        ...versionsByQuote,
        [quote.id]: updatedVersions,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(allVersions));
    } catch (e) {
      console.error('Failed to save versions to storage:', e);
    }

    return newVersion;
  },

  getVersionsForQuote: (quoteId) => {
    return get().versionsByQuote[quoteId] || [];
  },

  getLatestVersion: (quoteId) => {
    const versions = get().versionsByQuote[quoteId] || [];
    return versions.length > 0 ? versions[versions.length - 1] : null;
  },

  getVersionById: (quoteId, versionId) => {
    const versions = get().versionsByQuote[quoteId] || [];
    return versions.find(v => v.id === versionId) || null;
  },

  compareVersions: (versionA, versionB) => {
    const changes = calculateLineItemDiff(
      versionA.snapshot.lineItems,
      versionB.snapshot.lineItems
    );

    const summary = {
      itemsAdded: changes.filter(c => c.type === 'added').length,
      itemsRemoved: changes.filter(c => c.type === 'removed').length,
      itemsModified: changes.filter(c => c.type === 'modified').length,
      totalAmountDelta: versionB.snapshot.totalAmount - versionA.snapshot.totalAmount,
      percentageChange: versionA.snapshot.totalAmount > 0
        ? ((versionB.snapshot.totalAmount - versionA.snapshot.totalAmount) / versionA.snapshot.totalAmount) * 100
        : 0,
    };

    return {
      versionA,
      versionB,
      changes,
      summary,
    };
  },

  setSelectedVersions: (versionA, versionB) => {
    set({ selectedVersionA: versionA, selectedVersionB: versionB });
  },

  openHistory: () => set({ isHistoryOpen: true }),
  closeHistory: () => set({ isHistoryOpen: false }),

  openCompareModal: () => set({ isCompareModalOpen: true }),
  closeCompareModal: () => set({ isCompareModalOpen: false, selectedVersionA: null, selectedVersionB: null }),

  loadVersionsFromStorage: () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        set({ versionsByQuote: parsed });
      }
    } catch (e) {
      console.error('Failed to load versions from storage:', e);
    }
  },

  clearVersions: (quoteId) => {
    const { versionsByQuote } = get();
    const updated = { ...versionsByQuote };
    delete updated[quoteId];

    set({ versionsByQuote: updated });

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to update storage:', e);
    }
  },
}));

import type { Quote, QuoteVersion, QuoteSnapshot, QuoteChangeType } from '../types';

const STORAGE_KEY = 'quotemyav_versions';

// Helper to create a snapshot from a quote
export function createSnapshotFromQuote(quote: Quote): QuoteSnapshot {
  return {
    eventName: quote.eventName,
    eventDate: quote.eventDate,
    venue: quote.venue,
    status: quote.status,
    totalAmount: quote.totalAmount,
    lineItems: JSON.parse(JSON.stringify(quote.lineItems)),
  };
}

// Generate a unique version ID
export function generateVersionId(): string {
  return `ver-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Generate description for change type
export function getChangeTypeDescription(changeType: QuoteChangeType): string {
  const descriptions: Record<QuoteChangeType, string> = {
    created: 'Quote created',
    items_added: 'Line items added',
    items_removed: 'Line items removed',
    items_modified: 'Line items modified',
    status_changed: 'Status updated',
    ai_edit_applied: 'AI edit applied',
    manual_snapshot: 'Manual snapshot saved',
  };
  return descriptions[changeType] || 'Quote updated';
}

// Get change type icon name
export function getChangeTypeIcon(changeType: QuoteChangeType): string {
  const icons: Record<QuoteChangeType, string> = {
    created: 'plus-circle',
    items_added: 'plus',
    items_removed: 'minus',
    items_modified: 'pencil',
    status_changed: 'flag',
    ai_edit_applied: 'bolt',
    manual_snapshot: 'camera',
  };
  return icons[changeType] || 'document';
}

// Get change type color class
export function getChangeTypeColor(changeType: QuoteChangeType): string {
  const colors: Record<QuoteChangeType, string> = {
    created: 'text-emerald-400',
    items_added: 'text-emerald-400',
    items_removed: 'text-red-400',
    items_modified: 'text-amber-400',
    status_changed: 'text-blue-400',
    ai_edit_applied: 'text-teal-400',
    manual_snapshot: 'text-purple-400',
  };
  return colors[changeType] || 'text-slate-400';
}

// Format version number for display
export function formatVersionNumber(versionNumber: number): string {
  return `v${versionNumber}`;
}

// Format version timestamp
export function formatVersionDate(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
}

// Local storage operations
export function loadVersionsFromStorage(): Record<string, QuoteVersion[]> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to load versions from storage:', e);
  }
  return {};
}

export function saveVersionsToStorage(versions: Record<string, QuoteVersion[]>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(versions));
  } catch (e) {
    console.error('Failed to save versions to storage:', e);
  }
}

export function deleteVersionsForQuote(quoteId: string): void {
  try {
    const stored = loadVersionsFromStorage();
    delete stored[quoteId];
    saveVersionsToStorage(stored);
  } catch (e) {
    console.error('Failed to delete versions:', e);
  }
}

// Export a version as JSON (for download)
export function exportVersionAsJson(version: QuoteVersion): string {
  return JSON.stringify(version, null, 2);
}

// Create downloadable blob for version
export function downloadVersion(version: QuoteVersion): void {
  const json = exportVersionAsJson(version);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `quote-${version.quoteId}-v${version.versionNumber}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

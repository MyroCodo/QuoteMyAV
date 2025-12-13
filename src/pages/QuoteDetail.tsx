import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Button, Card, Badge } from '../components/ui';
import { VersionHistoryPanel, VersionCompareModal } from '../components/quote';
import { useQuoteStore } from '../stores/quoteStore';
import { useVersionStore } from '../stores/versionStore';
import type { Quote, QuoteVersion, QuoteVersionDiff } from '../types';

// Handle edit navigation
const handleEdit = (navigate: ReturnType<typeof useNavigate>, quoteId: string) => {
  navigate(`/quotes/${quoteId}/edit`);
};

// Dynamic import to avoid loading jspdf until needed
const handleDownloadPDF = async (quote: Quote) => {
  const { downloadQuotePDF } = await import('../services/pdf-export');
  downloadQuotePDF(quote);
};

// Export quote as JSON file
const handleExportJSON = (quote: Quote) => {
  const dataStr = JSON.stringify(quote, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Quote-${quote.id}-${quote.eventName.replace(/[^a-zA-Z0-9]/g, '_')}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const statusColors: Record<string, 'default' | 'success' | 'warning' | 'error' | 'info' | 'teal'> = {
  draft: 'warning',
  pending_review: 'info',
  approved: 'teal',
  sent: 'info',
  accepted: 'success',
  rejected: 'error',
  expired: 'default',
  revision_requested: 'warning',
};

const categoryColors: Record<string, string> = {
  audio: 'border-l-teal-500',
  video: 'border-l-blue-500',
  lighting: 'border-l-emerald-500',
  staging: 'border-l-purple-500',
  rigging: 'border-l-orange-500',
  cables: 'border-l-gray-400',
  signal: 'border-l-cyan-500',
  decor: 'border-l-pink-500',
  power: 'border-l-yellow-500',
  comms: 'border-l-indigo-500',
  labor: 'border-l-amber-500',
  other: 'border-l-slate-500',
};

const categoryLabels: Record<string, string> = {
  audio: 'Audio',
  video: 'Video',
  lighting: 'Lighting',
  staging: 'Staging',
  rigging: 'Rigging & Truss',
  cables: 'Cables',
  signal: 'Signal / Switching',
  decor: 'Drape & Decor',
  power: 'Power Distribution',
  comms: 'Communications',
  labor: 'Labor',
  other: 'Other',
};

// Define category display order
const categoryOrder = [
  'audio',
  'video',
  'signal',
  'lighting',
  'rigging',
  'staging',
  'decor',
  'cables',
  'power',
  'comms',
  'labor',
  'other',
];

export function QuoteDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { quotes, revertToVersion } = useQuoteStore();
  const {
    isHistoryOpen,
    openHistory,
    closeHistory,
    compareVersions,
    loadVersionsFromStorage,
    getVersionsForQuote,
  } = useVersionStore();

  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [compareDiff, setCompareDiff] = useState<QuoteVersionDiff | null>(null);

  const quote = quotes.find((q) => q.id === id);

  // Load versions from storage on mount
  useEffect(() => {
    loadVersionsFromStorage();
  }, [loadVersionsFromStorage]);

  // Get version count for this quote
  const versionCount = id ? getVersionsForQuote(id).length : 0;

  // Handle version comparison
  const handleCompare = (versionA: QuoteVersion, versionB: QuoteVersion) => {
    const diff = compareVersions(versionA, versionB);
    setCompareDiff(diff);
    setIsCompareOpen(true);
  };

  // Handle revert to version
  const handleRevert = async (version: QuoteVersion) => {
    await revertToVersion(version);
    closeHistory();
  };

  if (!quote) {
    return (
      <Card className="text-center py-16 max-w-md mx-auto mt-12">
        <div className="w-16 h-16 bg-slate-700/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-white mb-2">Quote Not Found</h2>
        <p className="text-slate-400 mb-6">The quote you're looking for doesn't exist or has been deleted.</p>
        <Link to="/dashboard">
          <Button>Back to Dashboard</Button>
        </Link>
      </Card>
    );
  }

  // Group line items by category
  const groupedItems = quote.lineItems.reduce(
    (acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    },
    {} as Record<string, typeof quote.lineItems>
  );

  const subtotal = quote.lineItems.reduce((sum, item) => sum + item.total, 0);
  const taxRate = 0.0825; // 8.25%
  const tax = subtotal * taxRate;
  const total = subtotal + tax;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link
          to="/quotes"
          className="inline-flex items-center text-slate-400 hover:text-teal-400 mb-6 transition-colors group"
        >
          <svg className="w-5 h-5 mr-1.5 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Quotes
        </Link>
      </div>

      {/* Quote Card */}
      <Card className="mb-6">
        {/* Quote Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6 pb-6 border-b border-slate-700/50">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-teal-500/20">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Quote #{quote.id.slice(0, 8)}</h1>
                <p className="text-slate-400 text-sm">
                  Created {new Date(quote.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => handleEdit(navigate, quote.id)}>
              <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              Edit
            </Button>
            <Button
              variant={isHistoryOpen ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => isHistoryOpen ? closeHistory() : openHistory()}
              className={isHistoryOpen ? 'ring-2 ring-purple-500/30' : ''}
            >
              <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              History
              {versionCount > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 text-xs bg-purple-500/20 text-purple-400 rounded-full font-medium">
                  {versionCount}
                </span>
              )}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => handleDownloadPDF(quote)}>
              <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              PDF
            </Button>
            <Button variant="secondary" size="sm">
              <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Email
            </Button>
          </div>
        </div>

        {/* Event Info */}
        <div className="mb-6 pb-6 border-b border-slate-700/50">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-white mb-2">{quote.eventName}</h2>
              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
                {quote.venue && (
                  <span className="flex items-center gap-1.5">
                    <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {quote.venue}
                  </span>
                )}
                {quote.eventDate && (
                  <span className="flex items-center gap-1.5">
                    <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {new Date(quote.eventDate).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                )}
                {quote.clientName && (
                  <span className="flex items-center gap-1.5">
                    <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    {quote.clientName}
                  </span>
                )}
              </div>
            </div>
            <Badge variant={statusColors[quote.status] || 'default'} size="lg">
              {quote.status.replace('_', ' ')}
            </Badge>
          </div>
        </div>

        {/* Line Items by Category */}
        <div className="space-y-8">
          {categoryOrder
            .filter((category) => groupedItems[category])
            .map((category) => {
              const items = groupedItems[category];
              const categoryTotal = items.reduce((sum, item) => sum + item.total, 0);
              return (
                <div key={category}>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${categoryColors[category]?.replace('border-l-', 'bg-') || 'bg-slate-500'}`}></span>
                      {categoryLabels[category] || category}
                      <span className="text-slate-500 font-normal normal-case">({items.length})</span>
                    </h3>
                    <span className="text-sm text-slate-400 font-mono">
                      ${categoryTotal.toLocaleString()}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className={`flex justify-between items-center py-3 px-4 bg-slate-800/40 backdrop-blur-sm rounded-lg border-l-4 hover:bg-slate-700/40 transition-colors ${categoryColors[category] || 'border-l-slate-500'}`}
                      >
                        <div className="flex-1 min-w-0">
                          <span className="text-white">{item.description}</span>
                          {item.quantity > 1 && (
                            <span className="text-slate-500 text-sm ml-2">
                              ({item.quantity} x ${item.unitPrice.toLocaleString()})
                            </span>
                          )}
                        </div>
                        <span className="text-white font-mono ml-4 font-medium">${item.total.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
        </div>

        {/* Totals */}
        <div className="mt-8 pt-6 border-t border-slate-700/50">
          <div className="flex justify-end">
            <div className="w-64 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Subtotal</span>
                <span className="text-white font-mono">${subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Tax (8.25%)</span>
                <span className="text-white font-mono">${tax.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-xl font-bold pt-3 mt-3 border-t border-slate-600/50">
                <span className="text-white">Total</span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-teal-300 font-mono">
                  ${total.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Notes & Terms */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-white">Notes</h3>
          </div>
          <ul className="text-sm text-slate-300 space-y-2.5">
            <li className="flex items-start gap-2">
              <span className="text-blue-400 mt-0.5">-</span>
              Pricing based on rental period
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400 mt-0.5">-</span>
              Delivery and pickup included within 25 miles
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400 mt-0.5">-</span>
              Technician available at $65/hr if needed
            </li>
          </ul>
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-amber-500/10 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-white">Terms & Conditions</h3>
          </div>
          <ul className="text-sm text-slate-300 space-y-2.5">
            <li className="flex items-start gap-2">
              <span className="text-amber-400 mt-0.5">-</span>
              50% deposit required to confirm
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-400 mt-0.5">-</span>
              Balance due on delivery
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-400 mt-0.5">-</span>
              Quote valid for 30 days
            </li>
          </ul>
        </Card>
      </div>

      {/* Action Buttons */}
      <Card className="mt-8" padding="sm">
        <div className="flex flex-wrap justify-center gap-3">
          <Button variant="outline" size="lg" onClick={() => handleDownloadPDF(quote)}>
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            Download PDF
          </Button>
          <Button variant="outline" size="lg" onClick={() => handleExportJSON(quote)}>
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export JSON
          </Button>
          <Button variant="secondary" size="lg">
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Email Client
          </Button>
          <Button size="lg" onClick={() => handleEdit(navigate, quote.id)}>
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            Edit Quote
          </Button>
        </div>
      </Card>

      {/* Version History Sidebar */}
      {isHistoryOpen && id && (
        <div className="fixed inset-y-0 right-0 z-40 shadow-xl">
          <VersionHistoryPanel
            quoteId={id}
            onRevert={handleRevert}
            onCompare={handleCompare}
            onClose={closeHistory}
          />
        </div>
      )}

      {/* Version Compare Modal */}
      <VersionCompareModal
        isOpen={isCompareOpen}
        onClose={() => {
          setIsCompareOpen(false);
          setCompareDiff(null);
        }}
        diff={compareDiff}
      />
    </div>
  );
}

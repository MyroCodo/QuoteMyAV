import type { QuoteVersionDiff, VersionChange, LineItemCategory } from '../../types';
import { Button, Modal, Card } from '../ui';
import { formatVersionNumber, formatVersionDate } from '../../services/versions';
import { formatCurrency, categoryLabels } from './constants';

interface VersionCompareModalProps {
  isOpen: boolean;
  onClose: () => void;
  diff: QuoteVersionDiff | null;
}

function ChangeRow({ change }: { change: VersionChange }) {
  const getChangeStyle = () => {
    switch (change.type) {
      case 'added':
        return 'bg-emerald-500/10 border-emerald-500/30';
      case 'removed':
        return 'bg-red-500/10 border-red-500/30';
      case 'modified':
        return 'bg-amber-500/10 border-amber-500/30';
    }
  };

  const getChangeLabel = () => {
    switch (change.type) {
      case 'added':
        return <span className="text-emerald-400">Added</span>;
      case 'removed':
        return <span className="text-red-400">Removed</span>;
      case 'modified':
        return <span className="text-amber-400">Modified</span>;
    }
  };

  const getChangeIcon = () => {
    switch (change.type) {
      case 'added':
        return (
          <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
        );
      case 'removed':
        return (
          <div className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </div>
        );
      case 'modified':
        return (
          <div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </div>
        );
    }
  };

  return (
    <div className={`p-3 rounded-lg border ${getChangeStyle()}`}>
      <div className="flex items-start gap-3">
        {getChangeIcon()}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {getChangeLabel()}
            <span className="text-xs text-slate-500">
              {categoryLabels[change.category as LineItemCategory] || change.category}
            </span>
          </div>
          <p className="text-sm text-white">{change.description}</p>

          {/* Show old/new values for modifications */}
          {change.type === 'modified' && change.oldValue && change.newValue && (
            <div className="flex items-center gap-4 mt-2 text-xs">
              <div className="text-slate-400">
                <span className="text-slate-500">Was:</span>{' '}
                {change.oldValue.quantity} × {formatCurrency(change.oldValue.unitPrice || 0)} ={' '}
                <span className="font-mono">{formatCurrency(change.oldValue.total || 0)}</span>
              </div>
              <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
              <div className="text-white">
                <span className="text-slate-500">Now:</span>{' '}
                {change.newValue.quantity} × {formatCurrency(change.newValue.unitPrice || 0)} ={' '}
                <span className="font-mono">{formatCurrency(change.newValue.total || 0)}</span>
              </div>
            </div>
          )}

          {/* Show value for added/removed */}
          {change.type === 'added' && change.newValue && (
            <div className="mt-1 text-xs text-slate-400">
              {change.newValue.quantity} × {formatCurrency(change.newValue.unitPrice || 0)} ={' '}
              <span className="font-mono text-emerald-400">+{formatCurrency(change.newValue.total || 0)}</span>
            </div>
          )}
          {change.type === 'removed' && change.oldValue && (
            <div className="mt-1 text-xs text-slate-400">
              {change.oldValue.quantity} × {formatCurrency(change.oldValue.unitPrice || 0)} ={' '}
              <span className="font-mono text-red-400">-{formatCurrency(change.oldValue.total || 0)}</span>
            </div>
          )}
        </div>

        {/* Price delta */}
        <div className={`text-sm font-mono ${
          change.priceDelta > 0 ? 'text-red-400' : change.priceDelta < 0 ? 'text-emerald-400' : 'text-slate-400'
        }`}>
          {change.priceDelta > 0 ? '+' : ''}{formatCurrency(change.priceDelta)}
        </div>
      </div>
    </div>
  );
}

export function VersionCompareModal({ isOpen, onClose, diff }: VersionCompareModalProps) {
  if (!diff) return null;

  const { versionA, versionB, changes, summary } = diff;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Compare Versions"
      size="lg"
    >
      <div className="space-y-6">
        {/* Version headers */}
        <div className="grid grid-cols-2 gap-4">
          <Card padding="sm" className="text-center">
            <div className="text-xs text-slate-400 mb-1">From</div>
            <div className="text-lg font-semibold text-white">
              {formatVersionNumber(versionA.versionNumber)}
            </div>
            <div className="text-xs text-slate-500">{formatVersionDate(versionA.createdAt)}</div>
            <div className="text-sm font-mono text-slate-300 mt-1">
              {formatCurrency(versionA.snapshot.totalAmount)}
            </div>
          </Card>
          <Card padding="sm" className="text-center">
            <div className="text-xs text-slate-400 mb-1">To</div>
            <div className="text-lg font-semibold text-white">
              {formatVersionNumber(versionB.versionNumber)}
            </div>
            <div className="text-xs text-slate-500">{formatVersionDate(versionB.createdAt)}</div>
            <div className="text-sm font-mono text-slate-300 mt-1">
              {formatCurrency(versionB.snapshot.totalAmount)}
            </div>
          </Card>
        </div>

        {/* Summary stats */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-700/30 rounded-lg">
          <div className="flex items-center gap-4 text-sm">
            {summary.itemsAdded > 0 && (
              <span className="text-emerald-400">+{summary.itemsAdded} added</span>
            )}
            {summary.itemsRemoved > 0 && (
              <span className="text-red-400">-{summary.itemsRemoved} removed</span>
            )}
            {summary.itemsModified > 0 && (
              <span className="text-amber-400">{summary.itemsModified} modified</span>
            )}
            {changes.length === 0 && (
              <span className="text-slate-400">No changes</span>
            )}
          </div>
          <div className={`text-sm font-mono font-medium ${
            summary.totalAmountDelta > 0 ? 'text-red-400' : summary.totalAmountDelta < 0 ? 'text-emerald-400' : 'text-slate-400'
          }`}>
            {summary.totalAmountDelta > 0 ? '+' : ''}{formatCurrency(summary.totalAmountDelta)}
            <span className="text-slate-500 ml-1">
              ({summary.percentageChange > 0 ? '+' : ''}{summary.percentageChange.toFixed(1)}%)
            </span>
          </div>
        </div>

        {/* Changes list */}
        {changes.length > 0 ? (
          <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
            {changes.map((change, index) => (
              <ChangeRow key={index} change={change} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-slate-400">These versions are identical</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end pt-2 border-t border-slate-700">
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}

import type { AIChange } from '../../stores/aiEditStore';
import { formatCurrency } from './constants';

interface ChangeLogItemProps {
  change: AIChange;
}

export function ChangeLogItem({ change }: ChangeLogItemProps) {
  const getChangeIcon = () => {
    switch (change.type) {
      case 'added':
        return (
          <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
            <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
        );
      case 'removed':
        return (
          <div className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
            <svg className="w-3.5 h-3.5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </div>
        );
      case 'modified':
        return (
          <div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
            <svg className="w-3.5 h-3.5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </div>
        );
    }
  };

  const getChangeLabel = () => {
    switch (change.type) {
      case 'added':
        return 'Added';
      case 'removed':
        return 'Removed';
      case 'modified':
        return 'Modified';
    }
  };

  const getPriceDeltaDisplay = () => {
    if (change.priceDelta === 0) return null;

    const isPositive = change.priceDelta > 0;
    const color = isPositive ? 'text-red-400' : 'text-emerald-400';
    const sign = isPositive ? '+' : '';

    return (
      <span className={`text-xs font-mono ${color}`}>
        {sign}{formatCurrency(change.priceDelta)}
      </span>
    );
  };

  return (
    <div className="flex items-start gap-3 py-2">
      {getChangeIcon()}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-400 uppercase">
            {getChangeLabel()}
          </span>
          <span className="text-xs text-slate-500 capitalize">
            {change.category}
          </span>
        </div>
        <p className="text-sm text-white mt-0.5 line-clamp-2">{change.description}</p>
      </div>
      {getPriceDeltaDisplay()}
    </div>
  );
}

interface ChangeLogProps {
  changes: AIChange[];
  totalSavings: number;
  percentageChange: number;
}

export function ChangeLog({ changes, totalSavings, percentageChange }: ChangeLogProps) {
  const addedCount = changes.filter((c) => c.type === 'added').length;
  const removedCount = changes.filter((c) => c.type === 'removed').length;
  const modifiedCount = changes.filter((c) => c.type === 'modified').length;

  return (
    <div className="space-y-3">
      {/* Summary stats */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-3">
          {addedCount > 0 && (
            <span className="text-emerald-400">+{addedCount} added</span>
          )}
          {removedCount > 0 && (
            <span className="text-red-400">-{removedCount} removed</span>
          )}
          {modifiedCount > 0 && (
            <span className="text-amber-400">{modifiedCount} modified</span>
          )}
        </div>
        <div className={`font-mono font-medium ${totalSavings > 0 ? 'text-emerald-400' : totalSavings < 0 ? 'text-red-400' : 'text-slate-400'}`}>
          {totalSavings > 0 ? 'Save ' : totalSavings < 0 ? '+' : ''}
          {formatCurrency(Math.abs(totalSavings))}
          <span className="text-slate-500 ml-1">
            ({percentageChange > 0 ? '+' : ''}{percentageChange.toFixed(1)}%)
          </span>
        </div>
      </div>

      {/* Change list */}
      <div className="divide-y divide-slate-700/50 max-h-48 overflow-y-auto">
        {changes.map((change) => (
          <ChangeLogItem key={change.id} change={change} />
        ))}
      </div>
    </div>
  );
}

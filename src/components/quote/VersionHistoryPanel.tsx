import { useState } from 'react';
import type { QuoteVersion } from '../../types';
import { Button, Card } from '../ui';
import { useVersionStore } from '../../stores/versionStore';
import {
  formatVersionNumber,
  formatVersionDate,
  getChangeTypeDescription,
  getChangeTypeColor,
} from '../../services/versions';
import { formatCurrency } from './constants';

interface VersionHistoryPanelProps {
  quoteId: string;
  onRevert: (version: QuoteVersion) => void;
  onCompare: (versionA: QuoteVersion, versionB: QuoteVersion) => void;
  onClose: () => void;
}

export function VersionHistoryPanel({
  quoteId,
  onRevert,
  onCompare,
  onClose,
}: VersionHistoryPanelProps) {
  const { getVersionsForQuote } = useVersionStore();
  const versions = getVersionsForQuote(quoteId);

  const [compareMode, setCompareMode] = useState(false);
  const [selectedForCompare, setSelectedForCompare] = useState<QuoteVersion[]>([]);
  const [revertConfirm, setRevertConfirm] = useState<QuoteVersion | null>(null);

  const handleToggleCompare = (version: QuoteVersion) => {
    if (selectedForCompare.find((v) => v.id === version.id)) {
      setSelectedForCompare(selectedForCompare.filter((v) => v.id !== version.id));
    } else if (selectedForCompare.length < 2) {
      setSelectedForCompare([...selectedForCompare, version]);
    }
  };

  const handleCompare = () => {
    if (selectedForCompare.length === 2) {
      // Sort by version number so older is A, newer is B
      const sorted = [...selectedForCompare].sort(
        (a, b) => a.versionNumber - b.versionNumber
      );
      onCompare(sorted[0], sorted[1]);
      setCompareMode(false);
      setSelectedForCompare([]);
    }
  };

  const handleRevertClick = (version: QuoteVersion) => {
    setRevertConfirm(version);
  };

  const handleConfirmRevert = () => {
    if (revertConfirm) {
      onRevert(revertConfirm);
      setRevertConfirm(null);
    }
  };

  const getChangeIcon = (changeType: QuoteVersion['changeType']) => {
    switch (changeType) {
      case 'created':
        return (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'items_added':
        return (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        );
      case 'items_removed':
        return (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
          </svg>
        );
      case 'items_modified':
        return (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        );
      case 'status_changed':
        return (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
          </svg>
        );
      case 'ai_edit_applied':
        return (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        );
      case 'manual_snapshot':
        return (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
    }
  };

  // Reverse to show newest first
  const sortedVersions = [...versions].reverse();

  return (
    <div className="w-80 bg-slate-800 border-l border-slate-700 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-sm font-semibold text-white">Version History</h3>
        </div>
        <button
          onClick={onClose}
          className="p-1 text-slate-400 hover:text-white transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Compare mode toggle */}
      <div className="px-4 py-2 border-b border-slate-700/50">
        <Button
          variant={compareMode ? 'secondary' : 'ghost'}
          size="sm"
          onClick={() => {
            setCompareMode(!compareMode);
            setSelectedForCompare([]);
          }}
          className="w-full justify-center"
        >
          <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          {compareMode ? 'Cancel Compare' : 'Compare Versions'}
        </Button>
        {compareMode && selectedForCompare.length > 0 && (
          <div className="mt-2 text-xs text-slate-400 text-center">
            {selectedForCompare.length}/2 selected
            {selectedForCompare.length === 2 && (
              <Button
                size="sm"
                onClick={handleCompare}
                className="ml-2"
              >
                Compare
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Version list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {sortedVersions.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-slate-400 text-sm">No version history yet</p>
            <p className="text-slate-500 text-xs mt-1">Changes will be tracked automatically</p>
          </div>
        ) : (
          sortedVersions.map((version, index) => {
            const isLatest = index === 0;
            const isSelected = selectedForCompare.find((v) => v.id === version.id);

            return (
              <Card
                key={version.id}
                padding="sm"
                className={`cursor-pointer transition-all ${
                  compareMode
                    ? isSelected
                      ? 'ring-2 ring-purple-500 bg-purple-500/10'
                      : 'hover:bg-slate-700/50'
                    : 'hover:bg-slate-700/50'
                }`}
                onClick={() => compareMode && handleToggleCompare(version)}
              >
                <div className="flex items-start gap-3">
                  {/* Version indicator */}
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      isLatest ? 'bg-purple-500/20' : 'bg-slate-700'
                    }`}>
                      <span className={getChangeTypeColor(version.changeType)}>
                        {getChangeIcon(version.changeType)}
                      </span>
                    </div>
                    {index < sortedVersions.length - 1 && (
                      <div className="w-px h-4 bg-slate-600 mt-1" />
                    )}
                  </div>

                  {/* Version info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-white">
                        {formatVersionNumber(version.versionNumber)}
                      </span>
                      {isLatest && (
                        <span className="text-xs px-1.5 py-0.5 bg-purple-500/20 text-purple-400 rounded">
                          Latest
                        </span>
                      )}
                      {version.trigger === 'manual' && (
                        <span className="text-xs px-1.5 py-0.5 bg-slate-600 text-slate-300 rounded">
                          Manual
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {getChangeTypeDescription(version.changeType)}
                    </p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-slate-500">
                        {formatVersionDate(version.createdAt)}
                      </span>
                      <span className="text-xs font-mono text-slate-400">
                        {formatCurrency(version.snapshot.totalAmount)}
                      </span>
                    </div>

                    {/* Actions (not in compare mode) */}
                    {!compareMode && !isLatest && (
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRevertClick(version);
                          }}
                          className="text-xs text-teal-400 hover:text-teal-300 transition-colors"
                        >
                          Restore this version
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Compare checkbox */}
                  {compareMode && (
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                      isSelected
                        ? 'border-purple-500 bg-purple-500'
                        : 'border-slate-500'
                    }`}>
                      {isSelected && (
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  )}
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-slate-700 text-center">
        <p className="text-xs text-slate-500">
          {versions.length} version{versions.length !== 1 ? 's' : ''} saved
        </p>
      </div>

      {/* Revert Confirmation Modal */}
      {revertConfirm && (
        <div className="absolute inset-0 bg-slate-900/80 flex items-center justify-center p-4 z-50">
          <Card className="max-w-sm">
            <div className="flex items-start gap-3 mb-4">
              <div className="flex-shrink-0 w-10 h-10 bg-amber-500/20 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h4 className="text-white font-medium">Restore Version?</h4>
                <p className="text-slate-400 text-sm mt-1">
                  This will restore your quote to {formatVersionNumber(revertConfirm.versionNumber)}
                  ({formatCurrency(revertConfirm.snapshot.totalAmount)}).
                  A new version will be created with your current state.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setRevertConfirm(null)}>
                Cancel
              </Button>
              <Button onClick={handleConfirmRevert}>
                Restore
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

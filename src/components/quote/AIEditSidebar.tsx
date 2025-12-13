import { useState } from 'react';
import { Button, Card } from '../ui';
import { QuickActionButtons } from './QuickActionButtons';
import { ChangeLog } from './ChangeLogItem';
import { useAIEditStore } from '../../stores/aiEditStore';
import { sendAIEditCommand, executeQuickAction, type QuickAction } from '../../services/ai-edit';
import type { LineItem } from '../../types';

interface AIEditSidebarProps {
  lineItems: LineItem[];
  eventContext?: {
    eventName: string;
    eventType: string;
    venue: string;
  };
  onApplyChanges: (newLineItems: LineItem[]) => void;
  onClose: () => void;
}

export function AIEditSidebar({
  lineItems,
  eventContext,
  onApplyChanges,
  onClose,
}: AIEditSidebarProps) {
  const [command, setCommand] = useState('');
  const {
    isProcessing,
    error,
    pendingResult,
    setProcessing,
    setError,
    setPendingResult,
    clearPendingResult,
    addToHistory,
  } = useAIEditStore();

  const handleSendCommand = async () => {
    if (!command.trim() || isProcessing) return;

    setProcessing(true);
    addToHistory(command);

    try {
      const result = await sendAIEditCommand({
        command: command.trim(),
        currentLineItems: lineItems,
        eventContext,
      });
      setPendingResult(result);
      setCommand('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process command');
    }
  };

  const handleQuickAction = async (action: QuickAction) => {
    if (isProcessing) return;

    setProcessing(true);

    try {
      const result = await executeQuickAction(action, lineItems, eventContext);
      setPendingResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to execute action');
    }
  };

  const handleApply = () => {
    if (pendingResult) {
      onApplyChanges(pendingResult.modifiedLineItems);
      clearPendingResult();
    }
  };

  const handleDiscard = () => {
    clearPendingResult();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendCommand();
    }
  };

  return (
    <div className="w-80 bg-slate-800 border-l border-slate-700 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <h3 className="text-sm font-semibold text-white">AI Edit Assistant</h3>
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

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Command input */}
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-2">
            Tell AI what to change
          </label>
          <div className="relative">
            <textarea
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="e.g., reduce cost by 15%, add more lighting, remove all rigging..."
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
              rows={3}
              disabled={isProcessing}
            />
            <button
              onClick={handleSendCommand}
              disabled={!command.trim() || isProcessing}
              className="absolute bottom-2 right-2 p-1.5 bg-teal-500 hover:bg-teal-600 disabled:bg-slate-600 disabled:cursor-not-allowed rounded text-white transition-colors"
            >
              {isProcessing ? (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Error display */}
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* Quick actions */}
        {!pendingResult && (
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-2">
              Quick Actions
            </label>
            <QuickActionButtons
              onAction={handleQuickAction}
              disabled={isProcessing}
            />
          </div>
        )}

        {/* Processing indicator */}
        {isProcessing && (
          <Card className="text-center py-6">
            <div className="w-10 h-10 mx-auto mb-3 relative">
              <div className="absolute inset-0 border-3 border-teal-500/30 rounded-full"></div>
              <div className="absolute inset-0 border-3 border-teal-500 rounded-full border-t-transparent animate-spin"></div>
            </div>
            <p className="text-sm text-slate-300">AI is analyzing your quote...</p>
            <p className="text-xs text-slate-500 mt-1">This may take a few seconds</p>
          </Card>
        )}

        {/* Pending changes */}
        {pendingResult && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-2">
                Proposed Changes
              </label>
              <Card padding="sm" variant="teal">
                <p className="text-sm text-white mb-3">{pendingResult.summary}</p>
                <ChangeLog
                  changes={pendingResult.changes}
                  totalSavings={pendingResult.totalSavings}
                  percentageChange={pendingResult.percentageChange}
                />
              </Card>
            </div>

            {/* Apply/Discard buttons */}
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDiscard}
                className="flex-1"
              >
                Discard
              </Button>
              <Button
                size="sm"
                onClick={handleApply}
                className="flex-1"
              >
                Apply Changes
              </Button>
            </div>
          </div>
        )}

        {/* Tips */}
        {!pendingResult && !isProcessing && (
          <div className="mt-4 p-3 bg-slate-700/30 rounded-lg">
            <p className="text-xs text-slate-400">
              <span className="font-medium text-slate-300">Tips:</span> Try commands like
              "cut costs by 20%", "upgrade audio to premium", or "add 2 more followspots"
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-slate-700 text-center">
        <p className="text-xs text-slate-500">
          AI suggestions are estimates. Always review before applying.
        </p>
      </div>
    </div>
  );
}

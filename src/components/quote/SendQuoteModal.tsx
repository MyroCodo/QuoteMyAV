import { useState } from 'react';
import { Button, Input } from '../ui';
import type { Quote } from '../../types';
import { apiPost } from '../../services/api-client';

interface SendQuoteModalProps {
  isOpen: boolean;
  quote: Quote;
  onClose: () => void;
  onSuccess: (result: SendResult) => void;
}

interface SendResult {
  sentAt: string;
  trackingId: string;
  recipientEmail: string;
  expiresAt: string;
  viewQuoteUrl: string;
  emailSent: boolean;
}

export function SendQuoteModal({ isOpen, quote, onClose, onSuccess }: SendQuoteModalProps) {
  const [recipientEmail, setRecipientEmail] = useState(quote.clientEmail || '');
  const [customMessage, setCustomMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSend = async () => {
    if (!recipientEmail) {
      setError('Please enter a recipient email');
      return;
    }

    // Basic email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipientEmail)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsSending(true);
    setError(null);

    try {
      const response = await apiPost<SendResult>(`/v1/quotes/${quote.id}/send`, {
        recipientEmail,
        message: customMessage || undefined,
      });

      if (response.data) {
        onSuccess(response.data);
        onClose();
      }
    } catch (err) {
      console.error('Failed to send quote:', err);
      setError(err instanceof Error ? err.message : 'Failed to send quote. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const formattedTotal = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(quote.totalAmount);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-slate-800 rounded-2xl shadow-2xl border border-slate-700/50 w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-700/50 bg-gradient-to-r from-teal-500/10 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-teal-600 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Send Quote</h2>
              <p className="text-sm text-slate-400">Email this quote to your client</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-5 space-y-5">
          {/* Quote Summary */}
          <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-700/50">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-slate-400">Quote for</p>
                <p className="text-white font-medium">{quote.eventName}</p>
                <p className="text-sm text-slate-500">{quote.clientName}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-400">Total</p>
                <p className="text-xl font-bold text-teal-400">{formattedTotal}</p>
              </div>
            </div>
          </div>

          {/* Recipient Email */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Recipient Email <span className="text-red-400">*</span>
            </label>
            <Input
              type="email"
              value={recipientEmail}
              onChange={(e) => {
                setRecipientEmail(e.target.value);
                setError(null);
              }}
              placeholder="client@example.com"
            />
          </div>

          {/* Custom Message */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Personal Message <span className="text-slate-500">(optional)</span>
            </label>
            <textarea
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder="Add a personal note to your client..."
              rows={3}
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 resize-none"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-sm text-red-400 flex items-center gap-2">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </p>
            </div>
          )}

          {/* Info Note */}
          <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <p className="text-sm text-blue-300 flex items-start gap-2">
              <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>
                Your client will receive a professional email with the quote details and a link to view the full quote online.
                The quote status will change to "Sent".
              </span>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-900/30 border-t border-slate-700/50 flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose} disabled={isSending}>
            Cancel
          </Button>
          <Button onClick={handleSend} disabled={isSending}>
            {isSending ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Sending...
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                Send Quote
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

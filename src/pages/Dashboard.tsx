import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useQuoteStore } from '../stores/quoteStore';
import { useAuthStore } from '../stores/authStore';
import { useSubscriptionStore } from '../stores/subscriptionStore';
import { Card, Badge, Button } from '../components/ui';
import { PLAN_DETAILS } from '../types';
import type { Quote } from '../types';

const statusVariants: Record<string, 'default' | 'success' | 'warning' | 'error' | 'info' | 'teal'> = {
  draft: 'warning',
  sent: 'info',
  accepted: 'success',
  rejected: 'error',
};

export function Dashboard() {
  const { quotes, fetchQuotes, createQuote } = useQuoteStore();
  const { user } = useAuthStore();
  const {
    subscription,
    initialize: initializeSubscription,
    getQuotaUsage,
  } = useSubscriptionStore();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const [showUpgradeSuccess, setShowUpgradeSuccess] = useState(false);

  // Check for upgrade success message
  useEffect(() => {
    if (searchParams.get('upgraded') === 'true' || searchParams.get('success') === 'true') {
      setShowUpgradeSuccess(true);
      // Clear the query param
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('upgraded');
      newParams.delete('success');
      setSearchParams(newParams, { replace: true });
      // Auto-dismiss after 5 seconds
      setTimeout(() => setShowUpgradeSuccess(false), 5000);
    }
  }, [searchParams, setSearchParams]);

  // Fetch quotes when user is available
  useEffect(() => {
    if (user?.id) {
      fetchQuotes(user.id);
      initializeSubscription(user.id);
    }
  }, [user?.id, fetchQuotes, initializeSubscription]);

  // Handle JSON file import
  const handleImportJSON = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const importedQuote: Quote = JSON.parse(text);

      // Create new quote from imported data (with new ID)
      const quoteData = {
        userId: user?.id || 'demo-user',
        clientName: importedQuote.clientName || '',
        clientEmail: importedQuote.clientEmail || '',
        eventName: importedQuote.eventName || 'Imported Quote',
        eventDate: importedQuote.eventDate || new Date().toISOString(),
        venue: importedQuote.venue || '',
        status: 'draft' as const,
        totalAmount: importedQuote.totalAmount || 0,
        lineItems: importedQuote.lineItems || [],
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      };

      const newQuote = await createQuote(quoteData);
      if (newQuote) {
        navigate(`/quotes/${newQuote.id}`);
      }
    } catch (error) {
      console.error('Failed to import JSON:', error);
      alert('Failed to import JSON file. Please check the file format.');
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const stats = {
    totalQuotes: quotes.length,
    pendingQuotes: quotes.filter((q) => q.status === 'sent').length,
    acceptedQuotes: quotes.filter((q) => q.status === 'accepted').length,
    totalRevenue: quotes
      .filter((q) => q.status === 'accepted')
      .reduce((sum, q) => sum + q.totalAmount, 0),
  };

  return (
    <div>
      {/* Upgrade Success Notification */}
      {showUpgradeSuccess && (
        <div className="mb-6 bg-teal-500/10 border border-teal-500/30 rounded-lg p-4 animate-fade-in">
          <div className="flex items-start gap-3">
            <svg className="w-6 h-6 text-teal-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="flex-1">
              <h3 className="text-teal-400 font-semibold">Upgrade Successful!</h3>
              <p className="text-teal-300/80 text-sm mt-1">
                Your plan has been upgraded to {subscription ? PLAN_DETAILS[subscription.plan].name : 'Pro'}. You now have{' '}
                {subscription && PLAN_DETAILS[subscription.plan].quotesPerMonth === 'unlimited'
                  ? 'unlimited quotes'
                  : `${subscription?.quotesLimit || 0} quotes per month`}
                .
              </p>
            </div>
            <button
              onClick={() => setShowUpgradeSuccess(false)}
              className="text-teal-400 hover:text-teal-300 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Welcome back{user?.fullName ? `, ${user.fullName}` : ''}!
          </h1>
          <p className="text-slate-400 mt-1">Here's what's happening with your quotes.</p>
        </div>
        <div className="flex gap-3">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImportJSON}
            accept=".json"
            className="hidden"
          />
          <Button variant="secondary" size="lg" onClick={() => fileInputRef.current?.click()}>
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Import JSON
          </Button>
          <Link to="/quotes/new">
            <Button size="lg">+ New Quote</Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card variant="teal" className="group hover:border-teal-500/50 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Total Quotes</p>
              <p className="text-3xl font-bold text-white mt-1">{stats.totalQuotes}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-teal-500/10 flex items-center justify-center group-hover:bg-teal-500/20 transition-colors">
              <svg className="w-6 h-6 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </Card>
        <Card className="group hover:border-amber-500/30 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Pending</p>
              <p className="text-3xl font-bold text-amber-400 mt-1">{stats.pendingQuotes}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center group-hover:bg-amber-500/20 transition-colors">
              <svg className="w-6 h-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </Card>
        <Card variant="green" className="group hover:border-emerald-500/50 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Accepted</p>
              <p className="text-3xl font-bold text-emerald-400 mt-1">{stats.acceptedQuotes}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
              <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </Card>
        <Card variant="blue" className="group hover:border-blue-500/50 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Revenue</p>
              <p className="text-3xl font-bold text-blue-400 mt-1">
                ${stats.totalRevenue.toLocaleString()}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
              <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </Card>
      </div>

      {/* Usage Bar */}
      {subscription && (() => {
        const usage = getQuotaUsage();
        const planDetails = PLAN_DETAILS[subscription.plan];
        const isUnlimited = usage.limit === Infinity;

        return (
          <Card className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-medium text-white">Monthly Quote Usage</h3>
                <p className="text-xs text-slate-400">
                  {planDetails.name} Plan
                  {!isUnlimited && ` - ${usage.limit - usage.used} quotes remaining`}
                </p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-white font-mono">
                  {usage.used}
                  {!isUnlimited && <span className="text-slate-400 text-sm font-normal"> / {usage.limit}</span>}
                </p>
                {isUnlimited && <p className="text-xs text-teal-400">Unlimited</p>}
              </div>
            </div>

            {!isUnlimited && (
              <div className="w-full bg-slate-700 rounded-full h-2 mb-3">
                <div
                  className={`h-2 rounded-full transition-all ${
                    usage.percentage >= 90 ? 'bg-red-500' :
                    usage.percentage >= 75 ? 'bg-amber-500' : 'bg-teal-500'
                  }`}
                  style={{ width: `${Math.min(usage.percentage, 100)}%` }}
                />
              </div>
            )}

            {subscription.plan === 'free' && (
              <div className="flex items-center justify-between pt-3 border-t border-slate-700">
                <p className="text-xs text-slate-400">
                  Upgrade to create more quotes and unlock AI features
                </p>
                <Link to="/settings">
                  <Button size="sm" variant="secondary">Upgrade Plan</Button>
                </Link>
              </div>
            )}
          </Card>
        );
      })()}

      {/* Recent Quotes */}
      <Card padding="none">
        <div className="px-6 py-4 border-b border-slate-700/50 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Recent Quotes</h2>
          {quotes.length > 0 && (
            <Link to="/quotes" className="text-sm text-teal-400 hover:text-teal-300 transition-colors">
              View all
            </Link>
          )}
        </div>
        {quotes.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-slate-700/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-slate-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-white mb-2">No quotes yet</h3>
            <p className="text-slate-400 mb-6">
              Create your first quote to get started
            </p>
            <Link to="/quotes/new">
              <Button>Create Quote</Button>
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-700/50">
            {quotes.slice(0, 5).map((quote) => (
              <Link
                key={quote.id}
                to={`/quotes/${quote.id}`}
                className="flex items-center justify-between px-6 py-4 hover:bg-slate-700/30 transition-all duration-200 group"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white group-hover:text-teal-400 transition-colors truncate">{quote.eventName}</p>
                  <p className="text-sm text-slate-500">{quote.clientName || 'No client'}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-medium text-white font-mono">
                      ${quote.totalAmount.toLocaleString()}
                    </p>
                  </div>
                  <Badge variant={statusVariants[quote.status] || 'default'} size="sm">
                    {quote.status}
                  </Badge>
                  <svg className="w-5 h-5 text-slate-600 group-hover:text-teal-400 group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

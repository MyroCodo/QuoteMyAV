import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuoteStore } from '../stores/quoteStore';
import { useAuthStore } from '../stores/authStore';
import { Card, Badge, Button, Input, Select } from '../components/ui';
import type { QuoteStatus } from '../types';

const statusVariants: Record<string, 'default' | 'success' | 'warning' | 'error' | 'info' | 'teal'> = {
  draft: 'warning',
  pending_review: 'info',
  approved: 'teal',
  sent: 'info',
  accepted: 'success',
  rejected: 'error',
  expired: 'default',
  revision_requested: 'warning',
};

const statusLabels: Record<QuoteStatus, string> = {
  draft: 'Draft',
  pending_review: 'Pending Review',
  approved: 'Approved',
  sent: 'Sent',
  accepted: 'Accepted',
  rejected: 'Rejected',
  expired: 'Expired',
  revision_requested: 'Revision Requested',
};

export function Quotes() {
  const { quotes, fetchQuotes, deleteQuote } = useQuoteStore();
  const { user } = useAuthStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'name'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Fetch quotes when user is available
  useEffect(() => {
    if (user?.id) {
      fetchQuotes(user.id);
    }
  }, [user?.id, fetchQuotes]);

  // Filter and sort quotes
  const filteredQuotes = quotes
    .filter((quote) => {
      // Search filter
      const matchesSearch =
        searchTerm === '' ||
        quote.eventName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quote.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quote.venue?.toLowerCase().includes(searchTerm.toLowerCase());

      // Status filter
      const matchesStatus = statusFilter === 'all' || quote.status === statusFilter;

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'date':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'amount':
          comparison = a.totalAmount - b.totalAmount;
          break;
        case 'name':
          comparison = a.eventName.localeCompare(b.eventName);
          break;
      }

      return sortOrder === 'desc' ? -comparison : comparison;
    });

  const handleDelete = async (quoteId: string, eventName: string) => {
    if (confirm(`Are you sure you want to delete "${eventName}"?`)) {
      await deleteQuote(quoteId);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Quotes</h1>
          <p className="text-slate-400 mt-1">
            {filteredQuotes.length} quote{filteredQuotes.length !== 1 ? 's' : ''}
            {statusFilter !== 'all' && (
              <span className="text-teal-400"> ({statusLabels[statusFilter as QuoteStatus]})</span>
            )}
          </p>
        </div>
        <Link to="/quotes/new">
          <Button size="lg">
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Quote
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card className="mb-6" padding="sm">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="md:col-span-2 relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <Input
              placeholder="Search by event, client, or venue..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: 'all', label: 'All Statuses' },
              { value: 'draft', label: 'Draft' },
              { value: 'pending_review', label: 'Pending Review' },
              { value: 'approved', label: 'Approved' },
              { value: 'sent', label: 'Sent' },
              { value: 'accepted', label: 'Accepted' },
              { value: 'rejected', label: 'Rejected' },
              { value: 'expired', label: 'Expired' },
            ]}
          />
          <Select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [sort, order] = e.target.value.split('-');
              setSortBy(sort as 'date' | 'amount' | 'name');
              setSortOrder(order as 'asc' | 'desc');
            }}
            options={[
              { value: 'date-desc', label: 'Newest First' },
              { value: 'date-asc', label: 'Oldest First' },
              { value: 'amount-desc', label: 'Highest Amount' },
              { value: 'amount-asc', label: 'Lowest Amount' },
              { value: 'name-asc', label: 'Name A-Z' },
              { value: 'name-desc', label: 'Name Z-A' },
            ]}
          />
        </div>
      </Card>

      {/* Quotes List */}
      {filteredQuotes.length === 0 ? (
        <Card className="text-center py-12">
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
          {quotes.length === 0 ? (
            <>
              <h3 className="text-lg font-medium text-white mb-2">No quotes yet</h3>
              <p className="text-slate-400 mb-6">Create your first quote to get started</p>
              <Link to="/quotes/new">
                <Button>Create Quote</Button>
              </Link>
            </>
          ) : (
            <>
              <h3 className="text-lg font-medium text-white mb-2">No matching quotes</h3>
              <p className="text-slate-400">Try adjusting your search or filters</p>
            </>
          )}
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredQuotes.map((quote) => (
            <Card key={quote.id} padding="none" className="hover:border-slate-600 transition-colors">
              <div className="flex items-center justify-between p-4">
                <Link to={`/quotes/${quote.id}`} className="flex-1 min-w-0">
                  <div className="flex items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-medium text-white truncate">{quote.eventName}</h3>
                        <Badge variant={statusVariants[quote.status] || 'default'}>
                          {statusLabels[quote.status as QuoteStatus] || quote.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-slate-400">
                        {quote.clientName && (
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            {quote.clientName}
                          </span>
                        )}
                        {quote.venue && (
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {quote.venue}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {new Date(quote.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>

                <div className="flex items-center gap-4 ml-4">
                  <div className="text-right">
                    <p className="text-lg font-bold text-white font-mono">
                      ${quote.totalAmount.toLocaleString()}
                    </p>
                    <p className="text-xs text-slate-400">
                      {quote.lineItems.length} item{quote.lineItems.length !== 1 ? 's' : ''}
                    </p>
                  </div>

                  <div className="flex items-center gap-1">
                    <Link to={`/quotes/${quote.id}/edit`}>
                      <Button variant="ghost" size="sm" title="Edit">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      title="Delete"
                      onClick={() => handleDelete(quote.id, quote.eventName)}
                      className="text-slate-400 hover:text-red-400"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

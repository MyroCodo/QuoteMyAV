import { useState, useMemo } from 'react';
import type { LineItem, LineItemCategory } from '../../types';
import { Button, Card, Modal } from '../ui';
import { EditableLineItem } from './EditableLineItem';
import { AddLineItemModal } from './AddLineItemModal';
import { QuoteTotals } from './QuoteTotals';
import { AIEditSidebar } from './AIEditSidebar';
import { useAIEditStore } from '../../stores/aiEditStore';
import {
  categoryColors,
  categoryLabels,
  categoryOrder,
  formatCurrency,
} from './constants';

interface LiveQuoteEditorProps {
  lineItems: LineItem[];
  onChange: (lineItems: LineItem[]) => void;
  selectedCategories?: string[];
  onGenerateAI?: () => void;
  isGenerating?: boolean;
  eventContext?: {
    eventName: string;
    eventType: string;
    venue: string;
  };
}

export function LiveQuoteEditor({
  lineItems,
  onChange,
  selectedCategories = [],
  onGenerateAI,
  isGenerating = false,
  eventContext,
}: LiveQuoteEditorProps) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    itemId: string | null;
    description: string;
  }>({
    isOpen: false,
    itemId: null,
    description: '',
  });

  // AI Edit sidebar state
  const { isOpen: isSidebarOpen, openSidebar, closeSidebar } = useAIEditStore();

  // Handle AI edit changes
  const handleApplyAIChanges = (newLineItems: LineItem[]) => {
    onChange(newLineItems);
  };

  // Group items by category
  const groupedItems = useMemo(() => {
    return lineItems.reduce(
      (acc, item) => {
        if (!acc[item.category]) {
          acc[item.category] = [];
        }
        acc[item.category].push(item);
        return acc;
      },
      {} as Record<string, LineItem[]>
    );
  }, [lineItems]);

  // Calculate category subtotals
  const categorySubtotals = useMemo(() => {
    return Object.entries(groupedItems).reduce(
      (acc, [cat, items]) => {
        acc[cat] = items.reduce((sum, item) => sum + item.total, 0);
        return acc;
      },
      {} as Record<string, number>
    );
  }, [groupedItems]);

  // Update a line item
  const handleUpdateItem = (itemId: string, updates: Partial<LineItem>) => {
    const newItems = lineItems.map((item) => {
      if (item.id === itemId) {
        const updated = { ...item, ...updates };
        // Recalculate total if quantity or unitPrice changed
        if (updates.quantity !== undefined || updates.unitPrice !== undefined) {
          updated.total = updated.quantity * updated.unitPrice;
        }
        return updated;
      }
      return item;
    });
    onChange(newItems);
  };

  // Add a new line item
  const handleAddItem = (item: Omit<LineItem, 'id'>) => {
    const newItem: LineItem = {
      ...item,
      id: `manual-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
    onChange([...lineItems, newItem]);
  };

  // Remove a line item
  const handleRemoveItem = (itemId: string) => {
    onChange(lineItems.filter((item) => item.id !== itemId));
    setDeleteConfirm({ isOpen: false, itemId: null, description: '' });
  };

  // Request delete confirmation
  const handleRequestDelete = (itemId: string) => {
    const item = lineItems.find((i) => i.id === itemId);
    if (item) {
      setDeleteConfirm({
        isOpen: true,
        itemId,
        description: item.description,
      });
    }
  };

  // Get categories to suggest in the add modal
  const suggestedCategories = selectedCategories.length > 0
    ? (selectedCategories as LineItemCategory[])
    : (['audio', 'video', 'lighting', 'labor'] as LineItemCategory[]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-white">Line Items</h2>
          <p className="text-sm text-slate-400 mt-1">
            {lineItems.length} item{lineItems.length !== 1 ? 's' : ''} • Click to edit
          </p>
        </div>
        <div className="flex gap-3">
          {onGenerateAI && (
            <Button
              variant="secondary"
              size="sm"
              onClick={onGenerateAI}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <svg
                    className="w-4 h-4 mr-2 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Generating...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                  AI Generate
                </>
              )}
            </Button>
          )}
          <Button size="sm" onClick={() => setIsAddModalOpen(true)}>
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Item
          </Button>
          {lineItems.length > 0 && (
            <Button
              variant={isSidebarOpen ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => isSidebarOpen ? closeSidebar() : openSidebar()}
              className={isSidebarOpen ? 'ring-2 ring-teal-500/30' : ''}
            >
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              AI Edit
            </Button>
          )}
        </div>
      </div>

      {/* Empty State */}
      {lineItems.length === 0 && (
        <Card className="text-center py-12">
          <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-white mb-2">No line items yet</h3>
          <p className="text-slate-400 mb-6 max-w-sm mx-auto">
            Add items manually or use AI to generate a complete equipment list based on your event details.
          </p>
          <div className="flex justify-center gap-3">
            {onGenerateAI && (
              <Button variant="secondary" onClick={onGenerateAI} disabled={isGenerating}>
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                AI Generate Items
              </Button>
            )}
            <Button onClick={() => setIsAddModalOpen(true)}>
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Manually
            </Button>
          </div>
        </Card>
      )}

      {/* Categorized Line Items */}
      {lineItems.length > 0 && (
        <div className="space-y-6">
          {categoryOrder
            .filter((category) => groupedItems[category])
            .map((category) => {
              const items = groupedItems[category];
              const subtotal = categorySubtotals[category];

              return (
                <div key={category}>
                  {/* Category Header */}
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
                      {categoryLabels[category as LineItemCategory] || category}
                    </h3>
                    <span className="text-xs text-slate-500">
                      {items.length} item{items.length !== 1 ? 's' : ''}
                    </span>
                  </div>

                  {/* Items */}
                  <div className="space-y-2">
                    {items.map((item) => (
                      <EditableLineItem
                        key={item.id}
                        item={item}
                        categoryColor={categoryColors[item.category] || 'border-l-slate-500'}
                        onUpdate={handleUpdateItem}
                        onRemove={handleRequestDelete}
                      />
                    ))}
                  </div>

                  {/* Category Subtotal */}
                  <div className="flex justify-end mt-2 text-sm">
                    <span className="text-slate-400 mr-4">Subtotal:</span>
                    <span className="text-white font-mono">{formatCurrency(subtotal)}</span>
                  </div>
                </div>
              );
            })}

          {/* Quote Totals */}
          <QuoteTotals lineItems={lineItems} showTax />
        </div>
      )}

      {/* Add Line Item Modal */}
      <AddLineItemModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddItem}
        suggestedCategories={suggestedCategories}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, itemId: null, description: '' })}
        title="Delete Line Item"
        size="sm"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <div>
              <p className="text-white">Are you sure you want to delete this item?</p>
              <p className="text-slate-400 text-sm mt-1 line-clamp-2">
                "{deleteConfirm.description}"
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button
              variant="ghost"
              onClick={() => setDeleteConfirm({ isOpen: false, itemId: null, description: '' })}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => deleteConfirm.itemId && handleRemoveItem(deleteConfirm.itemId)}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>

      {/* AI Edit Sidebar */}
      {isSidebarOpen && (
        <div className="fixed inset-y-0 right-0 z-40 shadow-xl">
          <AIEditSidebar
            lineItems={lineItems}
            eventContext={eventContext}
            onApplyChanges={handleApplyAIChanges}
            onClose={closeSidebar}
          />
        </div>
      )}
    </div>
  );
}

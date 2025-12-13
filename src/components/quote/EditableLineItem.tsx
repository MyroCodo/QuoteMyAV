import { useState, useRef, useEffect } from 'react';
import type { LineItem } from '../../types';
import { Button } from '../ui';
import { formatCurrency } from './constants';

interface EditableLineItemProps {
  item: LineItem;
  categoryColor: string;
  onUpdate: (itemId: string, updates: Partial<LineItem>) => void;
  onRemove: (itemId: string) => void;
}

export function EditableLineItem({
  item,
  categoryColor,
  onUpdate,
  onRemove,
}: EditableLineItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValues, setEditValues] = useState({
    description: item.description,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
  });
  const descriptionRef = useRef<HTMLInputElement>(null);

  // Focus description input when entering edit mode
  useEffect(() => {
    if (isEditing && descriptionRef.current) {
      descriptionRef.current.focus();
    }
  }, [isEditing]);

  // Update local values when item prop changes
  useEffect(() => {
    setEditValues({
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
    });
  }, [item]);

  const handleSave = () => {
    const updates: Partial<LineItem> = {
      description: editValues.description,
      quantity: Math.max(1, editValues.quantity),
      unitPrice: Math.max(0, editValues.unitPrice),
      total: Math.max(1, editValues.quantity) * Math.max(0, editValues.unitPrice),
    };
    onUpdate(item.id, updates);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValues({
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
    });
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const calculatedTotal = editValues.quantity * editValues.unitPrice;

  if (isEditing) {
    return (
      <div
        className={`flex flex-col sm:flex-row sm:items-center gap-3 py-3 px-4 bg-slate-700/50 rounded-lg border-l-4 ${categoryColor}`}
      >
        {/* Description */}
        <div className="flex-1">
          <input
            ref={descriptionRef}
            type="text"
            value={editValues.description}
            onChange={(e) =>
              setEditValues((prev) => ({ ...prev, description: e.target.value }))
            }
            onKeyDown={handleKeyDown}
            className="w-full px-3 py-1.5 bg-slate-800 border border-slate-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            placeholder="Item description"
          />
        </div>

        {/* Quantity */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-400 sm:hidden">Qty:</label>
          <input
            type="number"
            min="1"
            value={editValues.quantity}
            onChange={(e) =>
              setEditValues((prev) => ({
                ...prev,
                quantity: parseInt(e.target.value) || 1,
              }))
            }
            onKeyDown={handleKeyDown}
            className="w-20 px-3 py-1.5 bg-slate-800 border border-slate-600 rounded text-white text-sm text-center focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
        </div>

        {/* Unit Price */}
        <div className="flex items-center gap-2">
          <span className="text-slate-400 text-sm">×</span>
          <span className="text-slate-400 text-sm">$</span>
          <input
            type="number"
            min="0"
            step="0.01"
            value={editValues.unitPrice}
            onChange={(e) =>
              setEditValues((prev) => ({
                ...prev,
                unitPrice: parseFloat(e.target.value) || 0,
              }))
            }
            onKeyDown={handleKeyDown}
            className="w-24 px-3 py-1.5 bg-slate-800 border border-slate-600 rounded text-white text-sm text-right focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
        </div>

        {/* Calculated Total */}
        <div className="flex items-center gap-2">
          <span className="text-slate-400 text-sm">=</span>
          <span className="text-white font-mono text-sm w-24 text-right">
            {formatCurrency(calculatedTotal)}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSave}
            className="text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCancel}
            className="text-slate-400 hover:text-slate-300"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Button>
        </div>
      </div>
    );
  }

  // Display mode
  return (
    <div
      className={`flex items-center justify-between py-3 px-4 bg-slate-800/50 rounded-lg border-l-4 ${categoryColor} group hover:bg-slate-800/70 transition-colors`}
    >
      <div className="flex-1 min-w-0">
        <span className="text-white truncate block">{item.description}</span>
        {item.quantity > 1 && (
          <span className="text-slate-400 text-sm">
            ({item.quantity} × {formatCurrency(item.unitPrice)})
          </span>
        )}
      </div>

      <div className="flex items-center gap-3 ml-4">
        <span className="text-white font-mono">{formatCurrency(item.total)}</span>

        {/* Action buttons - visible on hover */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => setIsEditing(true)}
            className="p-1.5 text-slate-400 hover:text-teal-400 hover:bg-slate-700 rounded transition-colors"
            title="Edit item"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
              />
            </svg>
          </button>
          <button
            onClick={() => onRemove(item.id)}
            className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded transition-colors"
            title="Remove item"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

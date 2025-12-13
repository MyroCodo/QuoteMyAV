import { useState } from 'react';
import type { LineItem, LineItemCategory } from '../../types';
import { Modal, Button, Input, Select } from '../ui';
import { categoryLabels, allCategories, formatCurrency } from './constants';

interface AddLineItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (item: Omit<LineItem, 'id'>) => void;
  suggestedCategories?: LineItemCategory[];
}

const categoryOptions = allCategories.map((cat) => ({
  value: cat,
  label: categoryLabels[cat],
}));

export function AddLineItemModal({
  isOpen,
  onClose,
  onAdd,
  suggestedCategories = [],
}: AddLineItemModalProps) {
  const [formData, setFormData] = useState({
    category: suggestedCategories[0] || ('audio' as LineItemCategory),
    description: '',
    quantity: 1,
    unitPrice: 0,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const calculatedTotal = formData.quantity * formData.unitPrice;

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    if (formData.quantity < 1) {
      newErrors.quantity = 'Quantity must be at least 1';
    }
    if (formData.unitPrice < 0) {
      newErrors.unitPrice = 'Price cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    onAdd({
      category: formData.category,
      description: formData.description.trim(),
      quantity: formData.quantity,
      unitPrice: formData.unitPrice,
      total: calculatedTotal,
    });

    // Reset form
    setFormData({
      category: suggestedCategories[0] || 'audio',
      description: '',
      quantity: 1,
      unitPrice: 0,
    });
    setErrors({});
    onClose();
  };

  const handleClose = () => {
    setFormData({
      category: suggestedCategories[0] || 'audio',
      description: '',
      quantity: 1,
      unitPrice: 0,
    });
    setErrors({});
    onClose();
  };

  // Sort categories: suggested first, then others
  const sortedOptions = [...categoryOptions].sort((a, b) => {
    const aIsSuggested = suggestedCategories.includes(a.value as LineItemCategory);
    const bIsSuggested = suggestedCategories.includes(b.value as LineItemCategory);
    if (aIsSuggested && !bIsSuggested) return -1;
    if (!aIsSuggested && bIsSuggested) return 1;
    return 0;
  });

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add Line Item" size="md">
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Category */}
        <Select
          label="Category"
          value={formData.category}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              category: e.target.value as LineItemCategory,
            }))
          }
          options={sortedOptions}
        />

        {/* Description */}
        <Input
          label="Description"
          placeholder="e.g., L'Acoustics A10 Line Array"
          value={formData.description}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, description: e.target.value }))
          }
          error={errors.description}
        />

        {/* Quantity and Unit Price */}
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Quantity"
            type="number"
            min="1"
            value={formData.quantity}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                quantity: parseInt(e.target.value) || 1,
              }))
            }
            error={errors.quantity}
          />
          <Input
            label="Unit Price ($)"
            type="number"
            min="0"
            step="0.01"
            value={formData.unitPrice}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                unitPrice: parseFloat(e.target.value) || 0,
              }))
            }
            error={errors.unitPrice}
          />
        </div>

        {/* Calculated Total Preview */}
        <div className="bg-slate-700/50 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Line Item Total:</span>
            <span className="text-xl font-bold text-teal-400 font-mono">
              {formatCurrency(calculatedTotal)}
            </span>
          </div>
          {formData.quantity > 1 && (
            <p className="text-sm text-slate-500 mt-1">
              {formData.quantity} × {formatCurrency(formData.unitPrice)}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit">Add Item</Button>
        </div>
      </form>
    </Modal>
  );
}

import { useMemo } from 'react';
import type { LineItem } from '../../types';
import { TAX_RATE, formatCurrency } from './constants';

interface QuoteTotalsProps {
  lineItems: LineItem[];
  showTax?: boolean;
  className?: string;
}

export function QuoteTotals({
  lineItems,
  showTax = true,
  className = '',
}: QuoteTotalsProps) {
  const calculations = useMemo(() => {
    const subtotal = lineItems.reduce((sum, item) => sum + item.total, 0);
    const tax = showTax ? subtotal * TAX_RATE : 0;
    const total = subtotal + tax;

    return { subtotal, tax, total };
  }, [lineItems, showTax]);

  return (
    <div className={`mt-8 pt-6 border-t border-slate-700 ${className}`}>
      <div className="flex justify-end">
        <div className="space-y-2 w-64">
          {/* Subtotal */}
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Subtotal:</span>
            <span className="text-white font-mono">
              {formatCurrency(calculations.subtotal)}
            </span>
          </div>

          {/* Tax */}
          {showTax && (
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Tax ({(TAX_RATE * 100).toFixed(2)}%):</span>
              <span className="text-white font-mono">
                {formatCurrency(calculations.tax)}
              </span>
            </div>
          )}

          {/* Total */}
          <div className="flex justify-between text-lg font-bold pt-2 border-t border-slate-600">
            <span className="text-white">Total:</span>
            <span className="text-teal-400 font-mono">
              {formatCurrency(calculations.total)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

import type { InputHTMLAttributes, ReactNode } from 'react';
import { forwardRef } from 'react';
import { Check } from 'lucide-react';

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: ReactNode;
  helperText?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, helperText, className = '', ...props }, ref) => {
    return (
      <div className="flex items-start">
        <div className="relative flex items-center">
          <input
            ref={ref}
            type="checkbox"
            className={`
              peer sr-only
              ${className}
            `}
            {...props}
          />
          <div
            className="
              w-5 h-5 rounded border-2 border-slate-600/50
              bg-slate-800/60 backdrop-blur-sm
              peer-checked:bg-gradient-to-r peer-checked:from-teal-500 peer-checked:to-teal-600
              peer-checked:border-teal-500
              peer-focus:ring-2 peer-focus:ring-teal-500/50 peer-focus:ring-offset-2 peer-focus:ring-offset-slate-900
              peer-disabled:opacity-50 peer-disabled:cursor-not-allowed
              transition-all duration-200 cursor-pointer
              flex items-center justify-center
            "
          >
            <Check
              size={14}
              className="text-white opacity-0 peer-checked:opacity-100 transition-opacity duration-200"
              strokeWidth={3}
            />
          </div>
        </div>
        {(label || helperText) && (
          <div className="ml-3 flex-1">
            {label && (
              <label className="block text-sm font-medium text-slate-300 cursor-pointer">
                {label}
              </label>
            )}
            {helperText && (
              <p className="mt-0.5 text-xs text-slate-400">{helperText}</p>
            )}
          </div>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';

import type { HTMLAttributes, ReactNode } from 'react';

type CardVariant = 'default' | 'teal' | 'green' | 'blue' | 'purple' | 'selected' | 'glass';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant?: CardVariant;
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  glow?: boolean;
}

const variantStyles: Record<CardVariant, string> = {
  default: 'bg-slate-800/80 backdrop-blur-sm border-slate-700/50',
  teal: 'bg-slate-800/80 backdrop-blur-sm border-teal-500/30',
  green: 'bg-slate-800/80 backdrop-blur-sm border-emerald-500/30',
  blue: 'bg-slate-800/80 backdrop-blur-sm border-blue-500/30',
  purple: 'bg-slate-800/80 backdrop-blur-sm border-purple-500/30',
  selected: 'bg-slate-800/90 backdrop-blur-sm border-teal-500 ring-2 ring-teal-500/20',
  glass: 'bg-slate-800/40 backdrop-blur-md border-slate-600/30',
};

const paddingStyles = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

export function Card({
  children,
  variant = 'default',
  hover = false,
  padding = 'md',
  glow = false,
  className = '',
  ...props
}: CardProps) {
  return (
    <div
      className={`
        rounded-xl border transition-all duration-200
        ${variantStyles[variant]}
        ${paddingStyles[padding]}
        ${hover ? 'hover:border-teal-500/50 hover:bg-slate-800/90 hover:shadow-lg hover:shadow-teal-500/5 cursor-pointer' : ''}
        ${glow ? 'shadow-lg shadow-teal-500/10' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}

import type { LineItemCategory } from '../../types';

// Category color classes for left border (consistent with QuoteDetail.tsx)
export const categoryColors: Record<LineItemCategory, string> = {
  audio: 'border-l-teal-500',
  video: 'border-l-blue-500',
  lighting: 'border-l-emerald-500',
  staging: 'border-l-purple-500',
  rigging: 'border-l-orange-500',
  cables: 'border-l-gray-400',
  signal: 'border-l-cyan-500',
  decor: 'border-l-pink-500',
  power: 'border-l-yellow-500',
  comms: 'border-l-indigo-500',
  labor: 'border-l-amber-500',
  other: 'border-l-slate-500',
};

// Human-readable category labels
export const categoryLabels: Record<LineItemCategory, string> = {
  audio: 'Audio',
  video: 'Video',
  lighting: 'Lighting',
  staging: 'Staging',
  rigging: 'Rigging & Truss',
  cables: 'Cables',
  signal: 'Signal / Switching',
  decor: 'Drape & Decor',
  power: 'Power Distribution',
  comms: 'Communications',
  labor: 'Labor',
  other: 'Other',
};

// Display order for categories
export const categoryOrder: LineItemCategory[] = [
  'audio',
  'video',
  'signal',
  'lighting',
  'rigging',
  'staging',
  'decor',
  'cables',
  'power',
  'comms',
  'labor',
  'other',
];

// All available categories for dropdowns
export const allCategories: LineItemCategory[] = [
  'audio',
  'video',
  'lighting',
  'staging',
  'rigging',
  'cables',
  'signal',
  'decor',
  'power',
  'comms',
  'labor',
  'other',
];

// Tax rate for quote calculations
export const TAX_RATE = 0.0825; // 8.25%

// Format currency consistently
export const formatCurrency = (amount: number): string => {
  return `$${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

// Format currency without decimals for display
export const formatCurrencyShort = (amount: number): string => {
  return `$${amount.toLocaleString()}`;
};

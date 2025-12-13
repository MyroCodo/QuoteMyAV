import { quickActions, type QuickAction } from '../../services/ai-edit';

interface QuickActionButtonsProps {
  onAction: (action: QuickAction) => void;
  disabled?: boolean;
  compact?: boolean;
}

export function QuickActionButtons({
  onAction,
  disabled = false,
  compact = false,
}: QuickActionButtonsProps) {
  if (compact) {
    return (
      <div className="flex flex-wrap gap-2">
        {quickActions.map((action) => (
          <button
            key={action.id}
            onClick={() => onAction(action.id)}
            disabled={disabled}
            className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm text-white transition-colors flex items-center gap-1.5"
            title={action.description}
          >
            <span>{action.icon}</span>
            <span>{action.label}</span>
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2">
      {quickActions.map((action) => (
        <button
          key={action.id}
          onClick={() => onAction(action.id)}
          disabled={disabled}
          className="p-3 bg-slate-700/50 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-left transition-colors group"
          title={action.description}
        >
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">{action.icon}</span>
            <span className="text-sm font-medium text-white group-hover:text-teal-400 transition-colors">
              {action.label}
            </span>
          </div>
          <p className="text-xs text-slate-400 line-clamp-2">{action.description}</p>
        </button>
      ))}
    </div>
  );
}

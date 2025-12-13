import { Card } from '../ui';

export type QuoteType = 'rental' | 'install' | 'production';

interface QuoteTypeSelectorProps {
  selected: QuoteType | null;
  onChange: (type: QuoteType) => void;
}

const quoteTypes: { type: QuoteType; icon: string; title: string; description: string }[] = [
  {
    type: 'rental',
    icon: '🎤',
    title: 'Rental',
    description: 'Equipment rental for events',
  },
  {
    type: 'install',
    icon: '🔧',
    title: 'Install',
    description: 'Permanent installation or service',
  },
  {
    type: 'production',
    icon: '🎬',
    title: 'Full Production',
    description: 'Complete package: gear + labor + crew + travel',
  },
];

export function QuoteTypeSelector({ selected, onChange }: QuoteTypeSelectorProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-white">What type of quote?</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {quoteTypes.map(({ type, icon, title, description }) => (
          <Card
            key={type}
            variant={selected === type ? 'selected' : 'default'}
            hover
            onClick={() => onChange(type)}
            className="text-center"
          >
            <div className="text-4xl mb-3">{icon}</div>
            <h3 className="text-lg font-semibold text-white mb-1">{title}</h3>
            <p className="text-sm text-slate-400">{description}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}

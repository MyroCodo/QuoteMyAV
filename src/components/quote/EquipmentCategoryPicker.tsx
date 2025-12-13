import { Card, Input, Textarea } from '../ui';

export type EquipmentCategory =
  | 'audio'
  | 'video'
  | 'lighting'
  | 'staging'
  | 'rigging'
  | 'cables'
  | 'signal'
  | 'decor'
  | 'power'
  | 'comms';

export interface EquipmentSelection {
  categories: EquipmentCategory[];
  budgetRange: string;
  specificRequests: string;
}

interface EquipmentCategoryPickerProps {
  data: EquipmentSelection;
  onChange: (data: EquipmentSelection) => void;
}

const categories: { id: EquipmentCategory; icon: string; title: string; description: string }[] = [
  { id: 'audio', icon: '🔊', title: 'Audio', description: 'Speakers, mics, mixers, monitors' },
  { id: 'video', icon: '📺', title: 'Video', description: 'Projectors, screens, LED walls, cameras' },
  { id: 'lighting', icon: '💡', title: 'Lighting', description: 'Stage wash, movers, spots, effects' },
  { id: 'staging', icon: '🎭', title: 'Staging', description: 'Risers, stairs, skirting, lecterns' },
  { id: 'rigging', icon: '🏗️', title: 'Rigging', description: 'Truss, bases, motors, hardware' },
  { id: 'cables', icon: '🔌', title: 'Cables', description: 'Audio, video, power, data cables' },
  { id: 'signal', icon: '📡', title: 'Signal/Switching', description: 'Switchers, scalers, distribution' },
  { id: 'decor', icon: '🎪', title: 'Drape & Decor', description: 'Pipe & drape, backdrops, soft goods' },
  { id: 'power', icon: '⚡', title: 'Power', description: 'Distro, generators, tie-ins' },
  { id: 'comms', icon: '📻', title: 'Comms', description: 'Intercom, walkies, IFB' },
];

export function EquipmentCategoryPicker({ data, onChange }: EquipmentCategoryPickerProps) {
  const toggleCategory = (category: EquipmentCategory) => {
    const newCategories = data.categories.includes(category)
      ? data.categories.filter((c) => c !== category)
      : [...data.categories, category];
    onChange({ ...data, categories: newCategories });
  };

  const handleFieldChange = (field: keyof Omit<EquipmentSelection, 'categories'>, value: string) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-white">What do they need?</h2>

      <div>
        <p className="text-sm text-slate-400 mb-4">Select equipment categories needed:</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {categories.map(({ id, icon, title, description }) => {
            const isSelected = data.categories.includes(id);
            return (
              <Card
                key={id}
                variant={isSelected ? 'selected' : 'default'}
                hover
                onClick={() => toggleCategory(id)}
                className="relative"
              >
                {/* Checkbox indicator */}
                <div
                  className={`
                    absolute top-3 right-3 w-5 h-5 rounded border-2 flex items-center justify-center
                    ${isSelected ? 'bg-teal-500 border-teal-500' : 'border-slate-500'}
                  `}
                >
                  {isSelected && (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>

                <div className="text-3xl mb-2">{icon}</div>
                <h3 className="text-base font-semibold text-white">{title}</h3>
                <p className="text-sm text-slate-400">{description}</p>
              </Card>
            );
          })}
        </div>
      </div>

      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 space-y-5">
        <Input
          label="Budget Range (optional)"
          placeholder="$10,000 - $20,000"
          value={data.budgetRange}
          onChange={(e) => handleFieldChange('budgetRange', e.target.value)}
        />

        <Textarea
          label="Specific Requests (optional)"
          placeholder="L'Acoustics preferred. Need 2 PTZ cameras."
          rows={3}
          value={data.specificRequests}
          onChange={(e) => handleFieldChange('specificRequests', e.target.value)}
        />
      </div>
    </div>
  );
}

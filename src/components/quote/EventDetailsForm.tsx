import { Input, Select, Textarea } from '../ui';

export interface EventDetails {
  eventName: string;
  eventType: string;
  venueSize: string;
  venueName: string;
  startDate: string;
  endDate: string;
  setupDays: number;
  strikeDays: number;
  notes: string;
}

interface EventDetailsFormProps {
  data: EventDetails;
  onChange: (data: EventDetails) => void;
}

const eventTypes = [
  { value: 'corporate', label: 'Corporate' },
  { value: 'wedding', label: 'Wedding' },
  { value: 'concert', label: 'Concert' },
  { value: 'conference', label: 'Conference' },
  { value: 'festival', label: 'Festival' },
  { value: 'tradeshow', label: 'Trade Show' },
  { value: 'gala', label: 'Gala' },
  { value: 'other', label: 'Other' },
];

const venueSizes = [
  { value: '50', label: 'Up to 50 attendees' },
  { value: '100', label: '50-100 attendees' },
  { value: '250', label: '100-250 attendees' },
  { value: '500', label: '250-500 attendees' },
  { value: '1000', label: '500-1000 attendees' },
  { value: '2500', label: '1000-2500 attendees' },
  { value: '5000', label: '2500-5000 attendees' },
  { value: '5000+', label: '5000+ attendees' },
];

export function EventDetailsForm({ data, onChange }: EventDetailsFormProps) {
  const handleChange = (field: keyof EventDetails, value: string | number) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-white">Tell us about the event</h2>

      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 space-y-5">
        <Input
          label="Event Name"
          placeholder="Annual Sales Conference 2025"
          value={data.eventName}
          onChange={(e) => handleChange('eventName', e.target.value)}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Select
            label="Event Type"
            options={eventTypes}
            placeholder="Select event type"
            value={data.eventType}
            onChange={(e) => handleChange('eventType', e.target.value)}
          />
          <Select
            label="Venue Size"
            options={venueSizes}
            placeholder="Select venue size"
            value={data.venueSize}
            onChange={(e) => handleChange('venueSize', e.target.value)}
          />
        </div>

        <Input
          label="Venue Name"
          placeholder="Marriott Downtown Grand Ballroom"
          value={data.venueName}
          onChange={(e) => handleChange('venueName', e.target.value)}
        />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          <Input
            type="date"
            label="Start Date"
            value={data.startDate}
            onChange={(e) => handleChange('startDate', e.target.value)}
          />
          <Input
            type="date"
            label="End Date"
            value={data.endDate}
            onChange={(e) => handleChange('endDate', e.target.value)}
          />
          <Input
            type="number"
            label="Setup Days"
            min={0}
            max={10}
            value={data.setupDays}
            onChange={(e) => handleChange('setupDays', parseInt(e.target.value) || 0)}
          />
          <Input
            type="number"
            label="Strike Days"
            min={0}
            max={10}
            value={data.strikeDays}
            onChange={(e) => handleChange('strikeDays', parseInt(e.target.value) || 0)}
          />
        </div>

        <Textarea
          label="Notes (optional)"
          placeholder="Main stage + 3 breakout rooms. Client wants premium look. Budget approximately $15k."
          rows={3}
          value={data.notes}
          onChange={(e) => handleChange('notes', e.target.value)}
        />
      </div>
    </div>
  );
}

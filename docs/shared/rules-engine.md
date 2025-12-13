# QuoteMyAV - Rules Engine Specification

## Overview

The Rules Engine translates customer inputs into accurate line items. It ensures quotes are realistic, properly staffed, and account for real-world constraints like load-in times and venue limitations.

**Processing Flow:**
```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  User Input  │────▶│  Rules Engine│────▶│ Claude AI    │────▶│ Final Quote  │
│  (Form Data) │     │  (Pre-calc)  │     │ (Refinement) │     │ (Line Items) │
└──────────────┘     └──────────────┘     └──────────────┘     └──────────────┘
                            │
                            ▼
                     ┌──────────────┐
                     │  Base Quote  │
                     │  Suggestions │
                     └──────────────┘
```

The Rules Engine generates a "base quote" with suggested equipment and labor. Claude then refines it based on context, adds custom notes, and ensures completeness.

---

## 1. Input Parameters

### 1.1 Event Profile Inputs
```javascript
const eventProfile = {
  // Basic Info
  event_type: 'corporate' | 'concert' | 'wedding' | 'conference' | 'festival' | 'theater' | 'house_of_worship' | 'broadcast',
  event_name: string,

  // Venue
  venue_type: 'indoor' | 'outdoor' | 'hybrid',
  venue_name: string,
  room_dimensions: { length_ft: number, width_ft: number, ceiling_ft: number },
  capacity: number,  // audience size

  // Schedule
  event_date: date,
  show_start: time,
  show_end: time,
  setup_date: date,
  strike_date: date,
  load_in_time: time,
  load_out_time: time,

  // Categories Needed
  needs_audio: boolean,
  needs_video: boolean,
  needs_lighting: boolean,
  needs_staging: boolean,
  needs_power: boolean,
  needs_rigging: boolean,

  // Extras
  is_outdoor: boolean,
  has_venue_sound: boolean,  // existing house system
  has_venue_video: boolean,
  requires_union_labor: boolean,
  budget_range: 'economy' | 'standard' | 'premium' | 'unlimited'
};
```

### 1.2 Category-Specific Inputs
```javascript
const audioInputs = {
  presenter_count: number,      // people who need mics
  wireless_handheld: number,    // requested wireless handhelds
  wireless_lav: number,         // requested lavs
  playback_sources: number,     // laptops, phones, etc.
  needs_recording: boolean,
  needs_broadcast_feed: boolean,
  needs_confidence_monitors: boolean,
  pa_coverage: 'front_only' | 'full_room' | '360'
};

const videoInputs = {
  screen_count: number,
  projection_surfaces: ['front' | 'rear' | 'floor' | 'led_wall'],
  camera_count: number,
  needs_recording: boolean,
  needs_streaming: boolean,
  needs_playback: boolean,
  resolution: '1080p' | '4K',
  content_sources: number  // laptops presenting
};

const lightingInputs = {
  stage_size: 'small' | 'medium' | 'large',
  look_complexity: 'basic' | 'standard' | 'complex' | 'theatrical',
  needs_moving_lights: boolean,
  needs_followspot: boolean,
  color_scheme: string[],
  has_video_content: boolean  // affects color temp matching
};

const stagingInputs = {
  stage_dimensions: { width_ft: number, depth_ft: number, height_ft: number },
  needs_stairs: boolean,
  needs_ramp: boolean,
  needs_skirting: boolean,
  surface_type: 'carpet' | 'vinyl' | 'plywood'
};
```

---

## 2. Equipment Selection Rules

### 2.1 Audio Package Rules

```javascript
const AUDIO_RULES = {
  // PA System Selection based on capacity
  pa_sizing: [
    { max_capacity: 50,   room_max_sqft: 1000,  package: 'pa_small',    description: 'Portable PA (2x 12" tops)' },
    { max_capacity: 150,  room_max_sqft: 3000,  package: 'pa_medium',   description: 'Line Array (4x elements/side)' },
    { max_capacity: 500,  room_max_sqft: 10000, package: 'pa_large',    description: 'Line Array (8x elements/side) + subs' },
    { max_capacity: 2000, room_max_sqft: 50000, package: 'pa_arena',    description: 'Large Format Array + distributed' },
    { max_capacity: null, room_max_sqft: null,  package: 'pa_festival', description: 'Festival System (custom)' }
  ],

  // Wireless Mic Rules
  wireless_per_presenter: 1,
  wireless_backup_ratio: 0.25,  // 1 backup per 4 mics
  wireless_min_backups: 1,

  // Monitor Rules
  monitors_per_performer: 1,
  stage_monitors_max: 8,
  iem_for_musicians: true,

  // Console Selection
  console_by_channel_count: [
    { max_channels: 16,  console: 'compact_digital',   description: 'Behringer X32 Compact' },
    { max_channels: 32,  console: 'mid_digital',       description: 'Yamaha TF3 / A&H SQ-5' },
    { max_channels: 64,  console: 'large_digital',     description: 'DiGiCo SD11 / Yamaha CL3' },
    { max_channels: null, console: 'flagship_digital', description: 'DiGiCo SD10 / Yamaha PM5D' }
  ],

  // Channel Count Estimation
  channels_per_presenter: 1,
  channels_per_musician: 4,  // average (vocals, DI, etc.)
  channels_playback: 2,
  channels_audience_mics: 2,
  channels_broadcast: 4
};
```

### 2.2 Video Package Rules

```javascript
const VIDEO_RULES = {
  // Projector Selection by throw distance and screen size
  projector_sizing: [
    { max_width_ft: 8,   min_lumens: 5000,   package: 'proj_small',    description: '5K Laser Projector' },
    { max_width_ft: 12,  min_lumens: 8000,   package: 'proj_medium',   description: '8K Laser Projector' },
    { max_width_ft: 20,  min_lumens: 15000,  package: 'proj_large',    description: '15K Laser Projector' },
    { max_width_ft: 30,  min_lumens: 25000,  package: 'proj_xlarge',   description: '25K+ Laser Projector' },
    { max_width_ft: null, min_lumens: 40000, package: 'proj_stadium',  description: '40K+ Laser (Barco/Christie)' }
  ],

  // Screen Selection
  screen_types: {
    'portable_tripod': { max_width: 10, use_case: 'small meetings' },
    'fastfold': { max_width: 20, use_case: 'standard events' },
    'truss_hung': { max_width: 30, use_case: 'large stages' },
    'led_wall': { max_width: null, use_case: 'premium/outdoor' }
  },

  // Camera Rules
  camera_for_imag: true,  // always add if screen_count > 0 and capacity > 100
  camera_for_recording: 1,
  camera_for_streaming: 1,
  cameras_per_stage_width: 0.5,  // 1 camera per 20ft stage width

  // Switching
  switcher_by_sources: [
    { max_sources: 4,  switcher: 'basic',    description: 'ATEM Mini Pro' },
    { max_sources: 8,  switcher: 'mid',      description: 'ATEM 2 M/E' },
    { max_sources: 16, switcher: 'large',    description: 'ATEM 4 M/E' },
    { max_sources: null, switcher: 'broadcast', description: 'Ross/Grass Valley' }
  ],

  // LED Wall Rules (pixels per foot)
  led_wall_pixel_pitch: {
    'indoor_close': 2.5,   // viewers < 15ft
    'indoor_mid': 3.9,     // viewers 15-30ft
    'indoor_far': 5.0,     // viewers > 30ft
    'outdoor': 5.9         // outdoor daylight readable
  }
};
```

### 2.3 Lighting Package Rules

```javascript
const LIGHTING_RULES = {
  // Fixture Count by Stage Size
  stage_packages: {
    'small': {  // < 16ft wide
      wash_fixtures: 4,
      spot_fixtures: 2,
      led_bars: 2,
      moving_heads: 0,
      followspots: 0
    },
    'medium': {  // 16-32ft wide
      wash_fixtures: 8,
      spot_fixtures: 4,
      led_bars: 4,
      moving_heads: 4,
      followspots: 0
    },
    'large': {  // 32-60ft wide
      wash_fixtures: 12,
      spot_fixtures: 6,
      led_bars: 8,
      moving_heads: 8,
      followspots: 1
    },
    'xl': {  // > 60ft wide
      wash_fixtures: 20,
      spot_fixtures: 10,
      led_bars: 12,
      moving_heads: 16,
      followspots: 2
    }
  },

  // Complexity Multipliers
  complexity_multipliers: {
    'basic': 0.5,      // half fixtures, static looks
    'standard': 1.0,   // standard package
    'complex': 1.5,    // more fixtures, programming time
    'theatrical': 2.0  // full theatrical rig
  },

  // Truss Requirements (per 20ft span)
  truss_per_stage_width: 1,  // 20ft truss sections
  truss_depth_rows: {
    'basic': 1,
    'standard': 2,
    'complex': 3
  },

  // Console Selection
  console_by_fixture_count: [
    { max_fixtures: 20,   console: 'basic',   description: 'ChamSys MQ50' },
    { max_fixtures: 50,   console: 'mid',     description: 'MA3 Light / ChamSys MQ70' },
    { max_fixtures: 150,  console: 'large',   description: 'MA3 Compact / ChamSys MQ250' },
    { max_fixtures: null, console: 'flagship', description: 'MA3 Full / grandMA2' }
  ],

  // Haze Machine
  haze_required_for_beams: true,
  haze_per_sqft: 5000  // 1 hazer per 5000 sqft
};
```

### 2.4 Power & Rigging Rules

```javascript
const POWER_RULES = {
  // Amperage Estimation
  amps_per_category: {
    'audio_small': 20,
    'audio_medium': 60,
    'audio_large': 100,
    'audio_arena': 200,
    'video_small': 20,
    'video_medium': 40,
    'video_large': 80,
    'lighting_small': 60,
    'lighting_medium': 100,
    'lighting_large': 200,
    'lighting_xl': 400
  },

  // Generator Sizing (with 25% headroom)
  generator_headroom: 1.25,
  generator_sizes: [20, 45, 60, 100, 150, 200, 300, 500],  // kW options

  // Distro Requirements
  distro_per_100_amps: 1
};

const RIGGING_RULES = {
  // Points per Truss Section
  points_per_20ft: 2,
  motor_capacity_default: '1ton',  // CM Lodestar

  // Weight Calculations
  truss_weight_per_ft: 10,  // lbs
  fixture_weight_avg: 35,   // lbs per lighting fixture
  speaker_weight_avg: 80,   // lbs per array element

  // Safety Factor
  rigging_safety_factor: 5  // 5:1 working load limit
};
```

---

## 3. Labor Calculation Rules

### 3.1 Crew Roles & Rates

```javascript
const LABOR_ROLES = {
  roles: {
    'audio_a1': { title: 'Audio Engineer (A1)', rate_8hr: 550, rate_ot: 82.50 },
    'audio_a2': { title: 'Audio Tech (A2)', rate_8hr: 400, rate_ot: 60.00 },
    'video_v1': { title: 'Video Engineer (V1)', rate_8hr: 550, rate_ot: 82.50 },
    'video_v2': { title: 'Video Tech (V2)', rate_8hr: 400, rate_ot: 60.00 },
    'video_cam': { title: 'Camera Operator', rate_8hr: 450, rate_ot: 67.50 },
    'lighting_ld': { title: 'Lighting Designer (LD)', rate_8hr: 600, rate_ot: 90.00 },
    'lighting_tech': { title: 'Lighting Tech', rate_8hr: 350, rate_ot: 52.50 },
    'followspot': { title: 'Followspot Operator', rate_8hr: 300, rate_ot: 45.00 },
    'stagehand': { title: 'Stagehand', rate_8hr: 300, rate_ot: 45.00 },
    'rigger': { title: 'Rigger', rate_8hr: 450, rate_ot: 67.50 },
    'head_rigger': { title: 'Head Rigger', rate_8hr: 600, rate_ot: 90.00 },
    'truck_driver': { title: 'Truck Driver', rate_8hr: 400, rate_ot: 60.00 },
    'td': { title: 'Technical Director', rate_8hr: 700, rate_ot: 105.00 }
  },

  // Overtime Rules
  overtime_after_hours: 8,    // OT after 8 hours
  double_time_after: 12,      // DT after 12 hours
  weekend_premium: 1.5,       // 1.5x on weekends
  holiday_premium: 2.0        // 2x on holidays
};
```

### 3.2 Setup Time Estimation

```javascript
const SETUP_TIME_RULES = {
  // Base Setup Hours by Package Size
  base_setup_hours: {
    'audio_small': 2,
    'audio_medium': 4,
    'audio_large': 8,
    'audio_arena': 16,
    'video_small': 2,
    'video_medium': 4,
    'video_large': 8,
    'lighting_small': 2,
    'lighting_medium': 4,
    'lighting_large': 8,
    'lighting_xl': 16,
    'staging_small': 1,
    'staging_medium': 2,
    'staging_large': 4
  },

  // Strike is typically faster
  strike_multiplier: 0.75,  // strike = 75% of setup time

  // Rigging adds time
  rigging_hours_per_point: 0.5,  // 30 min per rigging point

  // LED Wall Setup (hours per panel)
  led_wall_hours_per_panel: 0.25,

  // Complexity Multipliers
  venue_complexity: {
    'easy_access': 1.0,      // ground floor, loading dock
    'stairs': 1.3,           // stairs involved
    'freight_elevator': 1.2, // elevator moves
    'difficult': 1.5         // rooftop, no dock, etc.
  }
};
```

### 3.3 Crew Count Rules

```javascript
const CREW_RULES = {
  // Audio Crew
  audio_crew: {
    'pa_small': { a1: 1, a2: 0 },
    'pa_medium': { a1: 1, a2: 1 },
    'pa_large': { a1: 1, a2: 2 },
    'pa_arena': { a1: 1, a2: 3, monitor_eng: 1 }
  },

  // Video Crew
  video_crew: {
    'basic': { v1: 1, v2: 0, cam_ops: 0 },
    'mid': { v1: 1, v2: 1, cam_ops: 'per_camera' },
    'large': { v1: 1, v2: 2, cam_ops: 'per_camera', graphics: 1 }
  },

  // Lighting Crew
  lighting_crew: {
    'basic': { ld: 0, tech: 1, spots: 0 },
    'standard': { ld: 1, tech: 1, spots: 'per_spot' },
    'complex': { ld: 1, tech: 2, spots: 'per_spot', programmer: 1 },
    'theatrical': { ld: 1, tech: 3, spots: 'per_spot', programmer: 1, board_op: 1 }
  },

  // Stagehands for Load
  stagehands_per_truck: 4,
  stagehands_min: 2,

  // Technical Director
  td_required_threshold: 15000,  // Add TD if quote > $15K
  td_required_crew_count: 10     // Or if crew > 10 people
};
```

### 3.4 Call Time Calculations

```javascript
const CALL_TIME_RULES = {
  // Minimum Call Lengths
  minimum_call_hours: 4,

  // Show Call Timing
  audio_call_before_show: 1,     // A1 call 1hr before show
  video_call_before_show: 1,     // V1 call 1hr before show
  lighting_call_before_show: 0.5, // LD call 30min before show

  // Setup Day vs Show Day
  setup_day: {
    call_time: 'load_in_time',
    duration: 'calculated_setup_hours',
    meal_break: 6  // meal after 6 hours
  },

  show_day: {
    audio_call: 'show_start - 1hr',
    video_call: 'show_start - 1hr',
    lighting_call: 'show_start - 30min',
    duration: '(show_end - call_time) + 1hr_wrap'
  },

  strike_day: {
    call_time: 'show_end',
    duration: 'calculated_strike_hours'
  }
};
```

---

## 4. Load-In Constraints

### 4.1 Venue Restrictions

```javascript
const VENUE_CONSTRAINTS = {
  // Door Dimensions (affects equipment choices)
  door_clearance: {
    'standard': { width: 36, height: 80 },    // 36" x 80" standard door
    'double': { width: 72, height: 80 },      // double doors
    'freight': { width: 96, height: 96 },     // freight elevator/dock
    'loading_dock': { width: 120, height: 120 } // full dock
  },

  // Equipment that requires specific access
  equipment_clearance: {
    'line_array': { min_width: 48, min_height: 60 },
    'led_wall_panel': { min_width: 36, min_height: 40 },
    'truss_10ft': { min_width: 120, min_height: 30 },
    'truss_20ft': { min_width: 240, min_height: 30 },  // may need split
    'grand_piano': { min_width: 60, min_height: 60 },
    'drum_riser': { min_width: 96, min_height: 24 }
  },

  // Elevator Constraints
  elevator_limits: {
    'standard_passenger': { weight_lbs: 2500, fit_cases: 'small_only' },
    'freight_small': { weight_lbs: 4000, fit_cases: 'most_cases' },
    'freight_large': { weight_lbs: 6000, fit_cases: 'all_cases' }
  }
};
```

### 4.2 Time Window Constraints

```javascript
const TIME_CONSTRAINTS = {
  // Venue Access Windows
  typical_windows: {
    'hotel_ballroom': {
      earliest_access: '07:00',
      latest_access: '00:00',
      noise_restrictions: { start: '22:00', end: '08:00' }
    },
    'convention_center': {
      earliest_access: '06:00',
      latest_access: '02:00',
      noise_restrictions: null
    },
    'corporate_office': {
      earliest_access: '06:00',
      latest_access: '22:00',
      noise_restrictions: { start: '18:00', end: '08:00' }  // after hours
    },
    'outdoor_venue': {
      earliest_access: '06:00',
      latest_access: '23:00',
      noise_restrictions: 'varies_by_permit'
    }
  },

  // Union Restrictions
  union_rules: {
    'iatse': {
      min_call: 4,
      meal_penalty_after: 6,
      turnaround_hours: 8,  // min hours between calls
      consecutive_days_max: 6
    }
  },

  // Warnings to Generate
  constraint_warnings: [
    { condition: 'setup_hours > access_window', message: 'Setup time exceeds venue access window' },
    { condition: 'strike_end > venue_close', message: 'Strike may extend past venue hours' },
    { condition: 'load_in_overlaps_other_event', message: 'Venue may have conflicting events' }
  ]
};
```

---

## 5. Override System

### 5.1 Override Types

```javascript
const OVERRIDE_TYPES = {
  // Quantity Overrides
  quantity: {
    description: 'Change item quantity',
    affects: ['line_total', 'labor_if_crew_tied'],
    example: { item: 'wireless_handheld', original: 4, override: 6 }
  },

  // Item Swap
  swap: {
    description: 'Replace one item with another',
    affects: ['line_total', 'may_affect_labor'],
    example: { original: 'shure_ulxd', replacement: 'sennheiser_ew', reason: 'client preference' }
  },

  // Price Override
  price: {
    description: 'Adjust unit price',
    affects: ['line_total', 'margin'],
    requires: 'pro_plan',  // only Pro users
    example: { item: 'projector_15k', original_rate: 800, override_rate: 650, reason: 'volume discount' }
  },

  // Labor Override
  labor: {
    description: 'Adjust crew count or hours',
    affects: ['labor_total'],
    example: { role: 'stagehand', original_count: 4, override_count: 6, reason: 'tight timeline' }
  },

  // Add Custom Line
  custom: {
    description: 'Add non-standard line item',
    affects: ['subtotal'],
    example: { description: 'Custom scenic element', category: 'misc', price: 2500 }
  },

  // Remove Item
  remove: {
    description: 'Remove suggested item',
    affects: ['subtotal', 'may_trigger_warning'],
    example: { item: 'haze_machine', reason: 'venue restriction' }
  }
};
```

### 5.2 Override Validation Rules

```javascript
const OVERRIDE_VALIDATION = {
  // Quantity Limits
  quantity_rules: {
    min: 0,
    max_multiplier: 10,  // can't exceed 10x suggested qty
    requires_reason_above: 3  // must explain if > 3x original
  },

  // Price Limits (Pro only)
  price_rules: {
    min_percentage: 50,   // can't go below 50% of standard rate
    max_percentage: 200,  // can't exceed 200% of standard rate
    margin_warning: 20    // warn if margin drops below 20%
  },

  // Labor Limits
  labor_rules: {
    min_crew: 1,  // can't have zero crew if equipment selected
    max_hours_per_person: 16,  // safety limit
    overtime_warning: 10  // warn if > 10 hours
  },

  // Dependencies - removing one item may require removing others
  dependencies: {
    'pa_system': ['audio_console', 'audio_snake'],
    'projector': ['screen', 'video_cable'],
    'led_wall': ['led_processor', 'led_rigging'],
    'moving_lights': ['lighting_console', 'dmx_cable']
  },

  // Incompatibilities
  incompatible: [
    ['rear_projection_screen', 'front_projection_only_projector'],
    ['outdoor_event', 'indoor_only_equipment']
  ]
};
```

### 5.3 Recalculation on Override

```javascript
const RECALC_RULES = {
  // What triggers recalculation
  recalc_triggers: {
    'quantity_change': ['line_total', 'subtotal', 'tax', 'total'],
    'price_change': ['line_total', 'subtotal', 'tax', 'total', 'margin'],
    'item_add': ['subtotal', 'tax', 'total', 'labor_estimate'],
    'item_remove': ['subtotal', 'tax', 'total', 'labor_estimate', 'dependency_check'],
    'labor_change': ['labor_total', 'total'],
    'swap': ['line_total', 'subtotal', 'tax', 'total', 'labor_if_different']
  },

  // Preserve user intent
  preserve_on_recalc: [
    'custom_notes',
    'manual_line_items',
    'price_overrides',
    'quantity_overrides'
  ],

  // Warning generation
  generate_warnings: [
    { condition: 'margin < 20%', level: 'warning', message: 'Low margin on this quote' },
    { condition: 'crew_hours > 12', level: 'info', message: 'Overtime will apply' },
    { condition: 'removed_dependency', level: 'error', message: 'Required item was removed' }
  ]
};
```

---

## 6. Claude AI Integration

### 6.1 Rules Engine Output → Claude Input

```javascript
// The Rules Engine generates this structure for Claude
const rulesEngineOutput = {
  suggested_equipment: [
    {
      category: 'audio',
      item_code: 'pa_medium',
      description: 'Line Array System (4x elements/side)',
      quantity: 1,
      unit: 'event',
      unit_price: 1800,
      rule_matched: 'capacity 150, room 3000 sqft',
      confidence: 'high'
    },
    // ... more items
  ],

  suggested_labor: [
    {
      role: 'audio_a1',
      title: 'Audio Engineer (A1)',
      days: 2,  // setup + show
      hours_day1: 8,
      hours_day2: 6,
      rate: 550,
      rule_matched: 'pa_medium requires A1'
    },
    // ... more roles
  ],

  calculated_totals: {
    equipment_subtotal: 0,
    labor_subtotal: 0,
    subtotal: 0,
    tax_rate: 0.0825,
    tax_amount: 0,
    total: 0
  },

  constraints_identified: [
    { type: 'time', message: 'Setup window is tight - consider adding crew' },
    { type: 'access', message: 'Freight elevator required for truss' }
  ],

  context_for_ai: {
    event_summary: 'Corporate conference, 200 attendees, hotel ballroom',
    special_considerations: ['carpeted venue', 'ceiling height 12ft', 'no rigging points'],
    client_notes: 'First-time client, emphasize reliability'
  }
};
```

### 6.2 Claude Refinement Prompt

```javascript
const CLAUDE_REFINEMENT_PROMPT = `
You are refining an AV quote generated by the rules engine.

RULES ENGINE OUTPUT:
{rules_engine_output}

YOUR TASKS:
1. Verify equipment selections make sense for the event
2. Add any missing items the rules may have overlooked
3. Adjust quantities if context suggests different needs
4. Add professional notes and recommendations
5. Flag any concerns or upsell opportunities

OUTPUT the refined quote as JSON maintaining the same structure.

IMPORTANT:
- Keep all overrides the user made (in 'overrides' field)
- Don't second-guess explicit user quantities
- Add notes explaining any AI adjustments
- Be conservative - don't over-spec
`;
```

---

## 7. Implementation Notes

### 7.1 Where Rules Live

```
n8n Workflow Structure:
┌─────────────────────────────────────────────────────────────────┐
│  Webhook: /api/quote/generate                                   │
│                                                                  │
│  1. [Code Node] Validate Input                                  │
│  2. [Code Node] RULES ENGINE ← This document                    │
│  3. [Code Node] Apply User Overrides                            │
│  4. [Claude Node] Refine Quote                                  │
│  5. [Code Node] Calculate Finals                                │
│  6. [Supabase Node] Save Quote                                  │
│  7. [Response Node] Return Quote                                │
└─────────────────────────────────────────────────────────────────┘
```

### 7.2 Rules Engine Code Node (n8n)

```javascript
// This is the main rules engine function for n8n Code Node
function applyRules(input) {
  const equipment = [];
  const labor = [];

  // AUDIO RULES
  if (input.needs_audio) {
    // Find matching PA package
    const paRule = AUDIO_RULES.pa_sizing.find(r =>
      input.capacity <= r.max_capacity &&
      input.room_sqft <= r.room_max_sqft
    );
    equipment.push({
      category: 'audio',
      item_code: paRule.package,
      description: paRule.description,
      // ... pricing lookup
    });

    // Wireless mics
    const wirelessCount = input.presenter_count * AUDIO_RULES.wireless_per_presenter;
    const backupCount = Math.max(
      AUDIO_RULES.wireless_min_backups,
      Math.ceil(wirelessCount * AUDIO_RULES.wireless_backup_ratio)
    );
    equipment.push({
      category: 'audio',
      item_code: 'wireless_handheld',
      quantity: wirelessCount + backupCount,
      // ...
    });

    // Crew
    const audioCrew = CREW_RULES.audio_crew[paRule.package];
    if (audioCrew.a1) labor.push({ role: 'audio_a1', count: audioCrew.a1 });
    if (audioCrew.a2) labor.push({ role: 'audio_a2', count: audioCrew.a2 });
  }

  // VIDEO RULES
  if (input.needs_video) {
    // Similar pattern...
  }

  // LIGHTING RULES
  if (input.needs_lighting) {
    // Similar pattern...
  }

  // LABOR TIME CALCULATIONS
  const setupHours = calculateSetupHours(equipment, input.venue_complexity);
  const strikeHours = setupHours * SETUP_TIME_RULES.strike_multiplier;

  return { equipment, labor, setupHours, strikeHours };
}
```

### 7.3 Frontend Integration

The frontend uses the rules engine for **real-time estimates** as users fill the form:

```javascript
// React hook for live pricing
function useQuoteEstimate(formData) {
  const [estimate, setEstimate] = useState(null);

  useEffect(() => {
    // Debounce to avoid too many calculations
    const timer = setTimeout(() => {
      const quickEstimate = calculateQuickEstimate(formData);
      setEstimate(quickEstimate);
    }, 300);

    return () => clearTimeout(timer);
  }, [formData]);

  return estimate;
}

// Simplified rules for frontend (subset of full engine)
function calculateQuickEstimate(formData) {
  let total = 0;

  // Quick PA estimate
  if (formData.needs_audio) {
    if (formData.capacity < 50) total += 800;
    else if (formData.capacity < 150) total += 2500;
    else if (formData.capacity < 500) total += 5000;
    else total += 10000;
  }

  // Quick video estimate
  if (formData.needs_video && formData.screen_count > 0) {
    total += formData.screen_count * 1200;
  }

  // Quick lighting estimate
  if (formData.needs_lighting) {
    const multiplier = LIGHTING_RULES.complexity_multipliers[formData.look_complexity];
    total += 1500 * multiplier;
  }

  // Labor (rough 30% of equipment)
  total *= 1.3;

  return {
    estimate_low: Math.round(total * 0.8),
    estimate_high: Math.round(total * 1.2),
    confidence: 'rough'
  };
}
```

---

## 8. Pro User Features

### 8.1 Custom Pricing Profiles

```javascript
// Pro users can save custom pricing
const CUSTOM_PRICING_SCHEMA = {
  profile_name: string,
  user_id: uuid,

  // Category markups/discounts
  category_modifiers: {
    'audio': 1.0,      // 100% (no change)
    'video': 1.1,      // 110% (10% markup)
    'lighting': 0.95,  // 95% (5% discount)
    'labor': 1.15      // 115% (15% markup)
  },

  // Specific item overrides
  item_overrides: {
    'projector_15k': { daily_rate: 750 },  // custom rate
    'wireless_handheld': { daily_rate: 65 }
  },

  // Labor rate overrides
  labor_overrides: {
    'audio_a1': { rate_8hr: 600 },  // custom A1 rate
    'stagehand': { rate_8hr: 275 }
  },

  // Default terms
  default_tax_rate: 0.0825,
  default_payment_terms: 'Net 30',
  default_valid_days: 30
};
```

### 8.2 Equipment Library Integration

```javascript
// Pro users with equipment library get personalized suggestions
async function getEquipmentSuggestions(userId, category, requirements) {
  // First check user's library
  const userEquipment = await supabase
    .from('equipment')
    .select('*')
    .eq('user_id', userId)
    .eq('category', category);

  if (userEquipment.length > 0) {
    // Match user's actual inventory
    return matchFromUserLibrary(userEquipment, requirements);
  }

  // Fall back to generic suggestions
  return matchFromGenericLibrary(category, requirements);
}
```

---

## Summary

The Rules Engine provides:

1. **Deterministic Base Quotes** - Consistent starting point based on inputs
2. **Realistic Labor Estimates** - Proper crew counts and call times
3. **Constraint Awareness** - Flags venue/time limitations
4. **Override Flexibility** - Power users can customize everything
5. **AI Enhancement** - Claude refines the mechanical output

This hybrid approach combines the reliability of rules-based systems with the nuance of AI refinement.

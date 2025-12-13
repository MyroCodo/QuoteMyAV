# QuoteMyAV - Questionnaire Field Reference

## Overview

This document defines all 14 sections of the quote intake questionnaire. These fields are used by:
- **MVP:** Manual form mode
- **Phase 2:** AI chat mode and upload extraction

---

## Section Priority

| Priority | Sections | When to Show |
|----------|----------|--------------|
| **Critical** | 1, 2, 3, 12 | Always required |
| **Conditional** | 4-8 | Based on equipment selections |
| **Recommended** | 9, 14 | Shown but optional |
| **Optional** | 10, 11, 13 | Collapsed by default |

---

## 1. Client & Event Overview (Critical)

| Field | Type | Required | Options/Notes |
|-------|------|----------|---------------|
| company_name | text | Yes | |
| contact_name | text | Yes | |
| contact_email | email | Yes | |
| contact_phone | tel | Yes | |
| event_name | text | Yes | |
| event_description | textarea | No | Brief description |
| event_type | select | Yes | corporate, concert, wedding, conference, festival, worship, theater, awards, other |
| event_goals | textarea | No | "high-impact lighting", "broadcast-quality", etc. |

---

## 2. Dates, Schedule & Show Flow (Critical)

| Field | Type | Required | Options/Notes |
|-------|------|----------|---------------|
| event_dates | date[] | Yes | Can be multiple days |
| load_in_date | datetime | Yes | |
| load_in_duration | number | No | Hours |
| strike_date | datetime | Yes | |
| strike_duration | number | No | Hours |
| show_times | time[] | No | Multiple show times |
| soundcheck_time | time | No | |
| doors_time | time | No | |
| curfew_time | time | No | Hard curfew for noise/venue |
| multiple_performances | boolean | No | Same day multiple shows? |
| is_recorded | boolean | No | |
| is_streamed | boolean | No | |
| stream_platform | text | No | YouTube, Zoom, etc. |

---

## 3. Venue & Rigging (Critical)

| Field | Type | Required | Options/Notes |
|-------|------|----------|---------------|
| venue_name | text | Yes | |
| venue_address | text | Yes | |
| venue_contact | text | No | Name and phone |
| room_name | text | No | Main room, ballroom, etc. |
| room_dimensions | object | No | { length, width, height } |
| audience_capacity | number | Yes | |
| seating_type | select | No | seated, standing, mixed |
| has_house_av | boolean | No | |
| house_av_notes | textarea | No | What's available |
| rigging_points | number | No | |
| trim_height | number | No | Feet |
| weight_limits | text | No | |
| power_available | text | No | Services, locations |
| loading_type | select | No | dock, street, elevator |
| loading_distance | number | No | Feet to stage |
| noise_restrictions | text | No | dB limits, time restrictions |

---

## 4. Stage, Scenic & Backstage (Conditional)

*Show if: staging equipment selected*

| Field | Type | Required | Options/Notes |
|-------|------|----------|---------------|
| stage_type | select | No | house, riser_build, custom |
| stage_dimensions | object | No | { width, depth, height } |
| thrust_needed | boolean | No | |
| scenic_elements | multiselect | No | drapes, led_wall, projection_surface, custom_build |
| scenic_description | textarea | No | |
| backline_needed | multiselect | No | drums, amps, keyboards, dj_gear |
| green_rooms_needed | number | No | |
| quick_change_area | boolean | No | |
| production_office | boolean | No | |

---

## 5. Audio Requirements (Conditional)

*Show if: audio equipment selected*

| Field | Type | Required | Options/Notes |
|-------|------|----------|---------------|
| program_type | select | No | music, speech, both |
| music_genre | text | No | Rock, EDM, jazz, etc. |
| spl_expectation | select | No | low, medium, high, concert |
| coverage_areas | multiselect | No | main_floor, balcony, overflow, lobby |
| mix_position | select | No | foh_center, foh_side, backstage |
| use_house_pa | boolean | No | |
| wireless_handheld_count | number | No | |
| wireless_lav_count | number | No | |
| wireless_iem_count | number | No | |
| monitor_type | select | No | wedges, iems, both |
| wedge_mixes | number | No | |
| sidefills_needed | boolean | No | |
| drum_fill_needed | boolean | No | |
| playback_type | select | No | laptop, phone, playback_rig, qlab |
| recording_type | select | No | none, two_track, multitrack |

---

## 6. Lighting & Visual Design (Conditional)

*Show if: lighting equipment selected*

| Field | Type | Required | Options/Notes |
|-------|------|----------|---------------|
| lighting_style | select | No | concert, corporate, broadcast, theatrical, minimal |
| lighting_for | multiselect | No | performers, presenters, audience, scenic |
| use_house_rig | boolean | No | |
| followspot_count | number | No | |
| haze_allowed | boolean | No | |
| fog_allowed | boolean | No | |
| moving_lights_preferred | boolean | No | |
| color_palette | text | No | Brand colors, themes |
| timecode_needed | boolean | No | |

---

## 7. Video, Projection & LED (Conditional)

*Show if: video equipment selected*

| Field | Type | Required | Options/Notes |
|-------|------|----------|---------------|
| screen_count | number | No | |
| screen_locations | text | No | |
| screen_sizes | text | No | Approximate dimensions |
| aspect_ratio | select | No | 16:9, 4:3, custom |
| projection_or_led | select | No | projection, led, both |
| led_pixel_pitch | select | No | 2.9mm, 3.9mm, 4.8mm, etc. |
| content_sources | multiselect | No | laptop_mac, laptop_pc, playback, cameras, remote |
| camera_count | number | No | |
| camera_style | select | No | imag, cinematic, broadcast |
| confidence_monitors | boolean | No | |
| stream_needed | boolean | No | |
| stream_platform | text | No | |
| graphics_provider | select | No | client, vendor, tbd |

---

## 8. Staging, Rigging & Power (Conditional)

*Show if: staging or rigging selected*

| Field | Type | Required | Options/Notes |
|-------|------|----------|---------------|
| risers_needed | boolean | No | |
| riser_count | number | No | |
| riser_sizes | text | No | |
| guardrails_needed | boolean | No | |
| stairs_needed | boolean | No | |
| truss_config | multiselect | No | front, mid, rear, side, flown_subs |
| motion_control | boolean | No | Kinesys, winches, etc. |
| power_distro_by | select | No | vendor, venue, client |
| generator_needed | boolean | No | |

---

## 9. Crew, Labor & Union Rules (Recommended)

| Field | Type | Required | Options/Notes |
|-------|------|----------|---------------|
| crew_provided_by | select | No | vendor, client, mix |
| positions_needed | multiselect | No | a1, a2, ld, l1, v1, td, sm, stagehands |
| daily_call_length | number | No | Hours |
| union_venue | boolean | No | |
| union_rules | textarea | No | Minimums, breaks, etc. |
| special_certs_needed | text | No | Riggers, electricians, etc. |

---

## 10. Safety, Compliance & Policies (Optional)

| Field | Type | Required | Options/Notes |
|-------|------|----------|---------------|
| fire_marshal_constraints | text | No | |
| pyro_planned | boolean | No | |
| lasers_planned | boolean | No | |
| cryo_planned | boolean | No | |
| insurance_required | boolean | No | |
| risk_assessment_required | boolean | No | |
| accessibility_requirements | text | No | ADA, hearing assist, etc. |

---

## 11. Audience Experience & FOH (Optional)

| Field | Type | Required | Options/Notes |
|-------|------|----------|---------------|
| audience_type | select | No | public_ticketed, invited_corporate, vip_industry |
| vip_areas | boolean | No | |
| meet_greet | boolean | No | |
| foh_location | text | No | |
| foh_footprint | text | No | Size constraints |
| interactive_elements | multiselect | No | live_polling, qa, social_wall, crowd_mics |

---

## 12. Budget, Logistics & Approvals (Critical)

| Field | Type | Required | Options/Notes |
|-------|------|----------|---------------|
| budget_range | select | Yes | under_5k, 5k_15k, 15k_50k, 50k_100k, 100k_plus, tbd |
| budget_flexibility | select | No | fixed, flexible, unknown |
| quote_format | select | No | single, good_better_best, itemized |
| crew_travel_by | select | No | vendor, client |
| trucking_needed | boolean | No | |
| po_required | boolean | No | |
| payment_terms | select | No | net_30, net_15, deposit_balance |
| quote_deadline | date | No | |
| decision_deadline | date | No | |
| decision_maker | text | No | |

---

## 13. Content, Artists & Rights (Optional)

*Show if: concert, festival, or awards event type*

| Field | Type | Required | Options/Notes |
|-------|------|----------|---------------|
| artists_confirmed | textarea | No | Names, riders attached? |
| rider_attached | boolean | No | |
| content_provider | select | No | client, vendor, artists |
| content_deadline | date | No | |
| licensing_needed | boolean | No | Music, broadcast rights |

---

## 14. Success Criteria & Special Instructions (Recommended)

| Field | Type | Required | Options/Notes |
|-------|------|----------|---------------|
| must_go_right | textarea | No | Top 3 priorities |
| risks_to_mitigate | textarea | No | Top 3 concerns |
| reference_shows | textarea | No | Links or descriptions |
| do_not_want | textarea | No | Avoid these things |
| additional_notes | textarea | No | Anything else |

---

## Conditional Logic Rules

```javascript
const CONDITIONAL_SECTIONS = {
  // Section 4: Stage/Scenic
  'stage_scenic': {
    showIf: (form) => form.equipment_categories?.includes('staging')
  },

  // Section 5: Audio
  'audio': {
    showIf: (form) => form.equipment_categories?.includes('audio')
  },

  // Section 6: Lighting
  'lighting': {
    showIf: (form) => form.equipment_categories?.includes('lighting')
  },

  // Section 7: Video
  'video': {
    showIf: (form) => form.equipment_categories?.includes('video')
  },

  // Section 8: Staging/Rigging/Power
  'staging_rigging': {
    showIf: (form) =>
      form.equipment_categories?.includes('staging') ||
      form.equipment_categories?.includes('rigging')
  },

  // Section 13: Content/Artists
  'content_artists': {
    showIf: (form) =>
      ['concert', 'festival', 'awards'].includes(form.event_type)
  }
};
```

---

## Form Completion Scoring

```javascript
const FIELD_WEIGHTS = {
  // Critical (must have)
  event_type: 10,
  venue_name: 10,
  event_dates: 10,
  audience_capacity: 10,
  equipment_categories: 10,
  budget_range: 10,

  // Important (should have)
  load_in_date: 5,
  strike_date: 5,
  venue_address: 5,
  contact_email: 5,

  // Nice to have
  room_dimensions: 2,
  show_times: 2,
  curfew_time: 2,
  // ... etc
};

function calculateCompletion(form) {
  let score = 0;
  let maxScore = 0;

  for (const [field, weight] of Object.entries(FIELD_WEIGHTS)) {
    maxScore += weight;
    if (form[field] != null && form[field] !== '') {
      score += weight;
    }
  }

  return Math.round((score / maxScore) * 100);
}
```

---

## Related Documents

- `../mvp/01-architecture.md` - MVP form fields subset
- `../phase-2/03-chat-interface.md` - How AI fills these fields via chat
- `../phase-2/02-upload-mode.md` - How AI extracts these from documents

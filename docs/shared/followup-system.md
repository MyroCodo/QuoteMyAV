# QuoteMyAV - Follow-Up Bot & AI Nudge System

## Overview

This document defines the automated follow-up system for incomplete forms and the AI-powered nudge suggestions that help users complete their quotes.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        FOLLOW-UP SYSTEM ARCHITECTURE                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌─────────────┐     ┌─────────────┐     ┌─────────────┐                  │
│   │  Incomplete │     │   n8n Bot   │     │   Client    │                  │
│   │    Form     │────▶│  (Triggers) │────▶│  Receives   │                  │
│   └─────────────┘     └─────────────┘     └─────────────┘                  │
│         │                    │                   │                          │
│         │                    ▼                   │                          │
│         │           ┌─────────────┐              │                          │
│         │           │  AI Crafts  │              │                          │
│         │           │  Personal   │              │                          │
│         │           │  Follow-Up  │              │                          │
│         │           └─────────────┘              │                          │
│         │                    │                   │                          │
│         ▼                    ▼                   ▼                          │
│   ┌─────────────────────────────────────────────────────┐                  │
│   │              IN-APP CHAT NUDGES                      │                  │
│   │  • Real-time suggestions while filling form          │                  │
│   │  • Context-aware prompts based on partial answers    │                  │
│   │  • "Either/or" choices to reduce friction            │                  │
│   └─────────────────────────────────────────────────────┘                  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 1. Field Priority System

### 1.1 Completion Signals

Every field is categorized by its impact on quote accuracy:

```javascript
const FIELD_PRIORITIES = {
  // CRITICAL - Block quoting if missing
  critical: {
    fields: [
      'client_overview.company_name',
      'client_overview.primary_contact.email',
      'client_overview.event_type',
      'dates_schedule.event_dates',
      'venue_rigging.venue_info.name',
      'venue_rigging.room_dimensions.capacity'
    ],
    followup_urgency: 'immediate',
    block_quote: true
  },

  // IMPORTANT - Trigger follow-ups
  important: {
    fields: [
      'venue_rigging.venue_info.address',
      'venue_rigging.room_dimensions',
      'dates_schedule.venue_access',
      'budget_logistics.budget_range',
      'audio.primary_content',
      'audio.audience_coverage.audience_size',
      'video_led.broadcast_recording.is_streamed'
    ],
    followup_urgency: 'within_24h',
    block_quote: false
  },

  // NICE-TO-HAVE - Only follow up if user is engaged
  optional: {
    fields: [
      'client_overview.event_goals',
      'success_criteria.*',
      'safety_compliance.*',
      'audience_foh.*',
      'content_artists.riders'
    ],
    followup_urgency: 'only_if_engaged',
    block_quote: false
  }
};
```

### 1.2 Follow-Up Priority Order

When deciding what to ask, follow this hierarchy:

```javascript
const FOLLOWUP_PRIORITY_ORDER = [
  // Tier 1: Can't quote without these
  { priority: 1, field: 'dates_schedule.event_dates', label: 'Event date(s)' },
  { priority: 2, field: 'venue_rigging.venue_info.name', label: 'Venue name' },
  { priority: 3, field: 'venue_rigging.room_dimensions.capacity', label: 'Audience size' },
  { priority: 4, field: 'client_overview.event_type', label: 'Event type' },

  // Tier 2: Significantly affects quote accuracy
  { priority: 5, field: 'budget_logistics.budget_range', label: 'Budget range' },
  { priority: 6, field: 'venue_rigging.room_dimensions', label: 'Room dimensions' },
  { priority: 7, field: 'dates_schedule.venue_access', label: 'Load-in/out times' },
  { priority: 8, field: 'video_led.broadcast_recording', label: 'Streaming/recording' },

  // Tier 3: Department-specific (only ask if category selected)
  { priority: 9, field: 'audio.*', label: 'Audio details', condition: 'needs_audio' },
  { priority: 10, field: 'lighting.*', label: 'Lighting details', condition: 'needs_lighting' },
  { priority: 11, field: 'video_led.*', label: 'Video details', condition: 'needs_video' }
];
```

---

## 2. n8n Follow-Up Bot Workflow

### 2.1 Workflow Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    n8n WORKFLOW: form-followup-bot                          │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Schedule   │────▶│   Supabase   │────▶│   Filter     │
│   (hourly)   │     │   Query      │     │   Incomplete │
└──────────────┘     └──────────────┘     └──────────────┘
                                                  │
                     ┌────────────────────────────┘
                     ▼
              ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
              │   Analyze    │────▶│   AI: Craft  │────▶│   Choose     │
              │   Missing    │     │   Personal   │     │   Channel    │
              │   Fields     │     │   Message    │     │              │
              └──────────────┘     └──────────────┘     └──────────────┘
                                                               │
                     ┌────────────────┬────────────────────────┤
                     ▼                ▼                        ▼
              ┌──────────────┐ ┌──────────────┐        ┌──────────────┐
              │   Send       │ │   Send       │        │   In-App     │
              │   Email      │ │   SMS        │        │   Notification│
              └──────────────┘ └──────────────┘        └──────────────┘
                     │                │                        │
                     └────────────────┴────────────────────────┤
                                                               ▼
                                                        ┌──────────────┐
                                                        │   Log to DB  │
                                                        │   (tracking) │
                                                        └──────────────┘
```

### 2.2 Trigger Schedule

```javascript
const FOLLOWUP_SCHEDULE = {
  // First nudge: 24 hours after form started
  first_nudge: {
    delay_hours: 24,
    tone: 'light',
    channel: ['email'],
    max_questions: 3
  },

  // Second nudge: 3 days after form started
  second_nudge: {
    delay_hours: 72,
    tone: 'specific',
    channel: ['email', 'sms'],
    max_questions: 2
  },

  // Final nudge: 7 days after form started
  final_nudge: {
    delay_hours: 168,
    tone: 'last_call',
    channel: ['email'],
    max_questions: 1,
    include_pause_option: true
  },

  // Event proximity override (if event date is known)
  urgent_nudge: {
    trigger: 'event_date - 14 days',
    tone: 'time_sensitive',
    channel: ['email', 'sms'],
    override_other_nudges: true
  }
};
```

### 2.3 Supabase Query for Incomplete Forms

```sql
-- Find forms that need follow-up
SELECT
  i.id,
  i.user_id,
  i.form_data,
  i.created_at,
  i.updated_at,
  u.email,
  u.raw_user_meta_data->>'first_name' as first_name,
  u.raw_user_meta_data->>'phone' as phone,
  f.nudge_count,
  f.last_nudge_at
FROM intake_forms i
JOIN auth.users u ON i.user_id = u.id
LEFT JOIN followup_tracking f ON i.id = f.form_id
WHERE
  -- Not submitted
  i.submitted_at IS NULL
  -- Has critical fields missing
  AND i.completion_percentage < 100
  -- Not opted out
  AND NOT EXISTS (
    SELECT 1 FROM followup_optouts
    WHERE form_id = i.id
  )
  -- Ready for next nudge based on timing
  AND (
    -- First nudge after 24h
    (f.nudge_count IS NULL AND i.created_at < NOW() - INTERVAL '24 hours')
    OR
    -- Subsequent nudges with appropriate delay
    (f.nudge_count = 1 AND f.last_nudge_at < NOW() - INTERVAL '48 hours')
    OR
    (f.nudge_count = 2 AND f.last_nudge_at < NOW() - INTERVAL '96 hours')
  )
  -- Max 3 nudges
  AND COALESCE(f.nudge_count, 0) < 3
ORDER BY
  i.created_at ASC
LIMIT 50;
```

### 2.4 n8n Code Node: Analyze Missing Fields

```javascript
// Analyze what's missing and determine follow-up strategy

function analyzeIncompleteForm(formData, fieldPriorities) {
  const missing = {
    critical: [],
    important: [],
    optional: []
  };

  // Check critical fields
  for (const field of fieldPriorities.critical.fields) {
    if (!getNestedValue(formData, field)) {
      missing.critical.push({
        field,
        label: getFieldLabel(field),
        impact: 'Cannot generate quote without this'
      });
    }
  }

  // Check important fields
  for (const field of fieldPriorities.important.fields) {
    if (!getNestedValue(formData, field)) {
      missing.important.push({
        field,
        label: getFieldLabel(field),
        impact: 'Affects quote accuracy'
      });
    }
  }

  // Determine what to ask (max 3 questions per nudge)
  const toAsk = [
    ...missing.critical.slice(0, 2),
    ...missing.important.slice(0, 1)
  ].slice(0, 3);

  // Extract context for personalization
  const context = {
    eventName: formData.client_overview?.event_name || 'your event',
    eventType: formData.client_overview?.event_type,
    venue: formData.venue_rigging?.venue_info?.name,
    date: formData.dates_schedule?.event_dates?.start,
    audienceSize: formData.venue_rigging?.room_dimensions?.capacity,
    goals: formData.client_overview?.event_goals,
    tone: detectTone(formData)  // formal/informal based on their writing
  };

  return { missing, toAsk, context };
}

function detectTone(formData) {
  // Analyze text fields for formality indicators
  const textFields = [
    formData.client_overview?.event_description,
    formData.client_overview?.event_goals,
    formData.success_criteria?.top_priorities
  ].filter(Boolean).join(' ');

  const informalIndicators = ['!', 'awesome', 'cool', 'gonna', 'wanna', 'yeah'];
  const formalIndicators = ['please', 'kindly', 'would appreciate', 'regarding'];

  const informalScore = informalIndicators.filter(i => textFields.toLowerCase().includes(i)).length;
  const formalScore = formalIndicators.filter(i => textFields.toLowerCase().includes(i)).length;

  return formalScore > informalScore ? 'formal' : 'casual';
}
```

---

## 3. AI-Crafted Follow-Up Messages

### 3.1 Claude Prompt for Personalized Follow-Ups

```javascript
const FOLLOWUP_GENERATION_PROMPT = `
You are writing a follow-up message for an incomplete AV quote request.

CLIENT CONTEXT:
- Name: {{first_name}}
- Event: {{event_name}}
- Event Type: {{event_type}}
- Venue: {{venue}}
- Date: {{date}}
- Audience Size: {{audience_size}}
- Their stated goals: {{goals}}
- Tone to match: {{tone}}

WHAT'S MISSING (prioritized):
{{missing_fields}}

NUDGE NUMBER: {{nudge_count}} of 3
CHANNEL: {{channel}} (email/sms)

RULES:
1. Mirror their language - if they said "high energy rock show", use that phrase
2. Reference specific details they provided to show you read their info
3. Ask only 1-3 questions, framed as either/or choices when possible
4. Keep SMS under 160 characters, emails under 150 words
5. Include a human escape hatch ("reply 'call' for a quick walkthrough")
6. If nudge 3: add option to pause/cancel ("reply 'pause' if plans changed")
7. Be helpful, not pushy - you're a smart TD in text form

TONE GUIDE:
- Nudge 1: Light, value-focused ("just need a few more details")
- Nudge 2: More specific ("missing date and venue is blocking us")
- Nudge 3: Last call but still friendly ("checking if still planning")

OUTPUT FORMAT:
{
  "subject": "Email subject line (skip for SMS)",
  "message": "The follow-up message",
  "questions": ["List of specific questions being asked"]
}
`;
```

### 3.2 Follow-Up Templates by Scenario

```javascript
const FOLLOWUP_TEMPLATES = {

  // ══════════════════════════════════════════════════════════════════════════
  // EVENT BASICS MISSING
  // ══════════════════════════════════════════════════════════════════════════

  event_basics_missing: {
    email: {
      subject: "Quick details needed for {{event_name}}",
      template: `Hi {{first_name}},

Thanks for starting your quote request for **{{event_name}}**. To put together an accurate proposal, we need a few key details:

{{#if missing_date}}
• **Event date(s)** – When is the show?
{{/if}}
{{#if missing_venue}}
• **Venue name and city** – Where are you holding it?
{{/if}}
{{#if missing_audience}}
• **Expected attendance** – Roughly how many people?
{{/if}}

You can update your form here: {{form_link}}

Or just reply to this email with the info and we'll fill it in for you.

If you'd rather talk it through, reply "call" and we'll schedule a quick chat.`
    },
    sms: {
      template: `Hi {{first_name}}, your quote for {{event_name}} is almost ready. Just need: {{missing_summary}}. Update here: {{short_link}}`
    }
  },

  // ══════════════════════════════════════════════════════════════════════════
  // HAS BASICS, MISSING TECHNICAL
  // ══════════════════════════════════════════════════════════════════════════

  technical_details_missing: {
    email: {
      subject: "A few tech questions for your {{event_type}} on {{date}}",
      template: `Hi {{first_name}},

We've got the basics for your **{{event_type}}** at **{{venue}}** on **{{date}}**. To size audio, lighting, and video correctly, the team needs a bit more detail:

{{#if missing_audio}}
• Is this primarily music, spoken word, or a mix?
• How many performers/presenters will need mics?
{{/if}}
{{#if missing_video}}
• Will you need screens for IMAG or content playback?
• Planning to stream or record?
{{/if}}
{{#if missing_lighting}}
• What's the vibe: "rock show", "clean corporate", or something else?
{{/if}}

Should take 2-3 minutes: {{form_link}}

Or reply with quick answers and we'll handle the rest.`
    }
  },

  // ══════════════════════════════════════════════════════════════════════════
  // BUDGET/LOGISTICS MISSING
  // ══════════════════════════════════════════════════════════════════════════

  budget_missing: {
    email: {
      subject: "One more thing for {{event_name}}",
      template: `Hi {{first_name}},

Your {{event_type}} details for **{{event_name}}** look great. Before we finalize the quote:

• **Budget range** – Do you have a target in mind? Even a rough range helps us recommend the right level of package.
• **Quote style** – Would you prefer one turnkey option, or "good / better / best" choices?

You can add these here: {{form_link}}

Or just reply with your preference!`
    }
  },

  // ══════════════════════════════════════════════════════════════════════════
  // CONTEXT-AWARE (uses their previous answers)
  // ══════════════════════════════════════════════════════════════════════════

  context_aware: {
    rock_show_no_audio: {
      template: `Hi {{first_name}},

For your **{{audience_size}}-person rock show** at {{venue}}, do you prefer:
• A full touring-style PA with flown arrays, or
• Using the house system if it's suitable?

Also, how many acts/bands will perform, and do they travel with their own monitor engineers?

Quick reply or update here: {{form_link}}`
    },

    corporate_no_video: {
      template: `Hi {{first_name}},

To keep your "{{goals}}" look for the **{{event_type}}**, we need to know:
• Will you have presentation content on screens?
• Any remote participants joining via Zoom/Teams?
• Is this being recorded or streamed?

Takes 1 minute: {{form_link}}`
    },

    festival_no_power: {
      template: `Hi {{first_name}},

For your outdoor festival at {{venue}}:
• Do you need us to provide generator power, or is shore power available?
• What's the distance from power to the stage area?

This affects our gear and crew plan significantly.

Update here: {{form_link}}`
    }
  },

  // ══════════════════════════════════════════════════════════════════════════
  // LAST CALL (Nudge 3)
  // ══════════════════════════════════════════════════════════════════════════

  last_call: {
    email: {
      subject: "Still planning {{event_name}}?",
      template: `Hi {{first_name}},

Quick check-in on your quote request for **{{event_name}}**.

We're holding your spot in the workflow, but still need {{missing_count}} detail(s) before we can finalize your proposal.

• **Continue**: {{form_link}}
• **Talk instead**: Reply "call"
• **Plans changed**: Reply "pause" and we'll close this out

No worries either way – just want to make sure we're not holding a spot you don't need.`
    }
  },

  // ══════════════════════════════════════════════════════════════════════════
  // URGENT (Event date approaching)
  // ══════════════════════════════════════════════════════════════════════════

  urgent_event_soon: {
    email: {
      subject: "⏰ {{event_name}} is coming up – need your details",
      template: `Hi {{first_name}},

Your event **{{event_name}}** is {{days_until}} days away, and we still need a few details to lock in gear and crew:

{{missing_list}}

Production timelines are tight, so if you still need our support, please complete your form ASAP: {{form_link}}

If you've already booked elsewhere, a quick reply letting us know would be helpful.`
    },
    sms: {
      template: `{{first_name}}: {{event_name}} is {{days_until}} days out. We need {{missing_summary}} to confirm your AV. Complete here: {{short_link}}`
    }
  }
};
```

### 3.3 Either/Or Question Converter

```javascript
// Convert vague missing fields into actionable choices

const EITHER_OR_QUESTIONS = {
  'audio.pa_preference': {
    context_needed: ['audience_size', 'venue'],
    question: (ctx) => ctx.audience_size > 300
      ? "For {{audience_size}} guests, should we design for full-room coverage with flown PA, or keep it ground-stacked to manage cost?"
      : "Would you like us to bring a full PA system, or see if the house system is suitable first?"
  },

  'lighting.style': {
    context_needed: ['event_type'],
    question: (ctx) => ctx.event_type === 'corporate_general_session'
      ? "For the lighting, do you want simple room wash only, or would you like some movement and color for walk-ins/walk-outs?"
      : "When you picture the show, are you thinking 'concert rock show', 'theatrical drama', or 'clean and corporate'?"
  },

  'video_led.screens': {
    context_needed: ['event_type', 'audience_size'],
    question: (ctx) => ctx.audience_size > 200
      ? "With {{audience_size}} guests, do you want screens for IMAG (live camera), content only, or both?"
      : "Will you need screens for presentation content, or is this more of an audio-only event?"
  },

  'budget_logistics.budget_range': {
    context_needed: ['event_type'],
    question: () => "Do you have a target budget we should design around, or would you prefer to see options at different price points?"
  },

  'staging_power.generator': {
    context_needed: ['venue_type'],
    question: (ctx) => ctx.venue_type === 'outdoor'
      ? "For your outdoor event, would you rather we design for a full concert experience or a more modest community event feel?"
      : "Is adequate power available at the venue, or do we need to plan for generator?"
  }
};

function generateEitherOrQuestion(missingField, formContext) {
  const template = EITHER_OR_QUESTIONS[missingField];
  if (!template) return null;

  // Check if we have required context
  const hasContext = template.context_needed.every(f => formContext[f]);
  if (!hasContext) return null;

  return template.question(formContext);
}
```

---

## 4. In-App Chat Nudges

### 4.1 Real-Time Suggestions While Filling Form

```javascript
// Nudge suggestions that appear in the chat panel as user fills form

const IN_APP_NUDGES = {

  // Triggered when user pauses on a field for >30 seconds
  field_stuck: {
    trigger: 'idle_on_field',
    delay_seconds: 30,
    suggestions: {
      'venue_rigging.rigging_info': "Not sure about rigging? You can skip this and we'll ask the venue directly.",
      'audio.input_list': "Don't have an exact input list? A rough estimate is fine – we'll confirm details later.",
      'dates_schedule.daily_schedule': "Schedule still being finalized? Just give us what you know and we'll work with you."
    }
  },

  // Triggered when they complete a section
  section_complete: {
    trigger: 'section_finished',
    suggestions: {
      'client_overview': "Great! Now let's talk about dates and schedule. When's the event?",
      'dates_schedule': "Got it! Next: tell us about the venue so we can plan logistics.",
      'venue_rigging': "Venue info locked in. Now, which production categories do you need help with?"
    }
  },

  // Triggered by specific answers
  contextual_followup: {
    trigger: 'field_answered',
    rules: [
      {
        condition: 'event_type == "concert_tour" && !audio.primary_content',
        nudge: "For a concert/tour, we'll need audio details. Is there a rider we should reference, or should we design from scratch?"
      },
      {
        condition: 'broadcast_recording.is_streamed == true && !video_led.streaming_platform',
        nudge: "You mentioned streaming – which platform(s)? YouTube, Zoom, or something else?"
      },
      {
        condition: 'audience_size > 500 && !lighting.needs_followspots',
        nudge: "With {{audience_size}} guests, do you want followspots for performers/speakers?"
      },
      {
        condition: 'venue_type == "outdoor" && !staging_power.needs_generator',
        nudge: "Outdoor event – do you have shore power, or should we plan for generator?"
      }
    ]
  },

  // Escape hatches (always available)
  escape_hatches: [
    {
      text: "Not sure about something? Type 'help' and I'll explain.",
      alwaysShow: false,
      showAfterIdleMinutes: 2
    },
    {
      text: "Rather talk to a human? Type 'call' to schedule a walkthrough.",
      alwaysShow: true
    },
    {
      text: "Want us to make standard assumptions? Type 'skip tech' and we'll use industry defaults.",
      showIf: 'completion > 60%'
    }
  ]
};
```

### 4.2 Smart Suggestions Based on Partial Data

```javascript
// AI generates contextual suggestions as user fills form

async function generateInAppSuggestion(currentForm, lastUpdatedField) {
  const context = extractContext(currentForm);
  const missingCritical = getMissingCritical(currentForm);
  const nextLogicalField = getNextLogicalField(currentForm, lastUpdatedField);

  const prompt = `
User is filling an AV quote form. Generate a helpful nudge for the chat panel.

JUST FILLED: ${lastUpdatedField} = ${getNestedValue(currentForm, lastUpdatedField)}
CONTEXT: ${JSON.stringify(context)}
STILL MISSING (critical): ${missingCritical.join(', ')}
NEXT LOGICAL FIELD: ${nextLogicalField}

Generate a brief, helpful suggestion (under 100 chars) that:
1. Acknowledges what they just entered
2. Guides them to the next logical question
3. Offers to make assumptions if appropriate

Return JSON: { "suggestion": "...", "type": "guide|offer|clarify" }
`;

  const response = await claude.messages.create({
    model: 'claude-3-5-haiku-20241022',
    max_tokens: 100,
    messages: [{ role: 'user', content: prompt }]
  });

  return JSON.parse(response.content[0].text);
}
```

---

## 5. Payment Follow-Up System

### 5.1 Quote Sent → Payment Pending Flow

```javascript
const PAYMENT_FOLLOWUP_SCHEDULE = {
  // After quote is sent to client
  quote_sent: {
    trigger: 'quote.status == sent',
    reminders: [
      {
        delay_days: 3,
        condition: '!payment_received && !quote_accepted',
        template: 'gentle_quote_reminder'
      },
      {
        delay_days: 7,
        condition: '!payment_received && !quote_accepted',
        template: 'quote_expiring_soon'
      },
      {
        delay_days: 14,
        condition: '!payment_received && !quote_accepted && !quote_rejected',
        template: 'quote_expired_check_in'
      }
    ]
  },

  // After quote is accepted, payment pending
  accepted_pending_payment: {
    trigger: 'quote.status == accepted && !payment_received',
    reminders: [
      {
        delay_days: 1,
        template: 'payment_link_reminder'
      },
      {
        delay_days: 4,
        template: 'payment_gentle_nudge'
      },
      {
        delay_days: 7,
        template: 'payment_needed_to_confirm'
      }
    ]
  },

  // Event approaching, payment still pending
  urgent_payment: {
    trigger: 'event_date - 14 days && !payment_received',
    template: 'payment_urgent_event_soon'
  }
};
```

### 5.2 Payment Reminder Templates

```javascript
const PAYMENT_TEMPLATES = {

  gentle_quote_reminder: {
    subject: "Your quote for {{event_name}} is ready",
    template: `Hi {{first_name}},

Just a quick reminder that your production quote for **{{event_name}}** is ready to review.

**Quote Total:** {{total}}
**Valid Until:** {{valid_until}}

You can view the full proposal and accept here: {{quote_link}}

If you have questions or need adjustments, just reply to this email.`
  },

  payment_link_reminder: {
    subject: "Complete your booking for {{event_name}}",
    template: `Hi {{first_name}},

Thanks for accepting our quote for **{{event_name}}**! To confirm your production slot and lock in gear and crew, please complete payment:

**Amount Due:** {{deposit_amount}}
**Payment Link:** {{payment_link}}

Once payment is received, we'll send you a confirmation and your assigned Project Manager will reach out to begin detailed planning.

If you need to split payment or discuss terms, just reply and we'll work something out.`
  },

  payment_gentle_nudge: {
    subject: "Friendly reminder: payment for {{event_name}}",
    template: `Hi {{first_name}},

Quick reminder that payment for **{{event_name}}** is still pending. Your spot and current pricing are held, but we need payment to fully confirm.

**Amount Due:** {{deposit_amount}}
**Pay Here:** {{payment_link}}

If something doesn't look right on the invoice or you're waiting on internal approvals, reply 'update' and we'll note it in our system.`
  },

  payment_needed_to_confirm: {
    subject: "Action needed: {{event_name}} production slot",
    template: `Hi {{first_name}},

We're still holding your production slot for **{{event_name}} on {{event_date}}**, but without payment we can't fully confirm gear and crew.

To proceed:
• **Pay now:** {{payment_link}}
• **Need more time:** Reply "delay" with expected date
• **Plans changed:** Reply "cancel" so we can release the hold

We'd love to help make your show a success – just need to know where things stand!`
  },

  payment_urgent_event_soon: {
    subject: "⏰ {{event_name}} is {{days_until}} days away – payment needed",
    template: `Hi {{first_name}},

Your event **{{event_name}}** is coming up on **{{event_date}}**, and payment is still outstanding.

To guarantee your production support, please complete payment ASAP:
**Amount Due:** {{deposit_amount}}
**Pay Here:** {{payment_link}}

After **{{cutoff_date}}**, we may need to release held equipment and crew. Please let us know your status!`
  }
};
```

---

## 6. Tracking & Database Schema

### 6.1 Follow-Up Tracking Table

```sql
-- Track all follow-up attempts
CREATE TABLE followup_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id UUID REFERENCES intake_forms(id),
  user_id UUID REFERENCES auth.users(id),

  -- Nudge details
  nudge_count INT DEFAULT 0,
  nudge_type TEXT,  -- 'form_incomplete', 'quote_pending', 'payment_pending'
  channel TEXT,     -- 'email', 'sms', 'in_app'

  -- Timing
  last_nudge_at TIMESTAMP,
  next_nudge_at TIMESTAMP,

  -- Content sent
  message_sent TEXT,
  questions_asked TEXT[],

  -- Response tracking
  responded_at TIMESTAMP,
  response_type TEXT,  -- 'completed_form', 'replied', 'called', 'paused', 'ignored'

  -- Metadata
  created_at TIMESTAMP DEFAULT now()
);

-- Opt-outs
CREATE TABLE followup_optouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id UUID REFERENCES intake_forms(id),
  user_id UUID REFERENCES auth.users(id),
  reason TEXT,  -- 'user_requested', 'unsubscribed', 'project_cancelled'
  created_at TIMESTAMP DEFAULT now()
);

-- Indexes
CREATE INDEX idx_followup_tracking_form ON followup_tracking(form_id);
CREATE INDEX idx_followup_tracking_next ON followup_tracking(next_nudge_at);
```

### 6.2 Analytics Queries

```sql
-- Follow-up effectiveness
SELECT
  nudge_count,
  COUNT(*) as total_sent,
  SUM(CASE WHEN response_type = 'completed_form' THEN 1 ELSE 0 END) as completed,
  ROUND(AVG(CASE WHEN response_type = 'completed_form' THEN 1.0 ELSE 0.0 END) * 100, 1) as conversion_rate
FROM followup_tracking
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY nudge_count
ORDER BY nudge_count;

-- Best performing templates
SELECT
  message_sent,
  COUNT(*) as times_used,
  SUM(CASE WHEN responded_at IS NOT NULL THEN 1 ELSE 0 END) as responses,
  ROUND(AVG(CASE WHEN responded_at IS NOT NULL THEN 1.0 ELSE 0.0 END) * 100, 1) as response_rate
FROM followup_tracking
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY message_sent
HAVING COUNT(*) > 10
ORDER BY response_rate DESC;

-- Average time to complete after nudge
SELECT
  AVG(EXTRACT(EPOCH FROM (i.submitted_at - f.last_nudge_at)) / 3600) as avg_hours_to_complete
FROM followup_tracking f
JOIN intake_forms i ON f.form_id = i.id
WHERE f.response_type = 'completed_form'
  AND i.submitted_at IS NOT NULL;
```

---

## 7. Implementation Summary

### 7.1 n8n Workflows to Create

1. **`form-followup-scheduler`** - Runs hourly, identifies incomplete forms needing nudges
2. **`followup-message-sender`** - Generates personalized message via Claude, sends via email/SMS
3. **`payment-reminder-scheduler`** - Tracks quotes/payments, sends reminders
4. **`inapp-nudge-generator`** - Webhook for real-time suggestions (called by frontend)

### 7.2 Frontend Components

1. **`NudgeChat.jsx`** - Chat panel showing AI suggestions
2. **`ProgressIndicator.jsx`** - Shows completion % and what's missing
3. **`EscapeHatchButtons.jsx`** - "Call me", "Skip tech", "Pause" buttons

### 7.3 Key Principles

| Principle | Implementation |
|-----------|----------------|
| **Mirror their language** | AI extracts key phrases and reuses them |
| **Ask 1-3 questions max** | Priority system limits follow-up scope |
| **Either/or choices** | Reduce friction with binary options |
| **Context-aware** | Different templates for rock show vs corporate |
| **Respect their time** | Offer to make assumptions, provide escape hatches |
| **Human fallback** | "Reply 'call'" option in every message |

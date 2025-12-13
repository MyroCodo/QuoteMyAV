# QuoteMyAV - Phase 2 Features

## Overview

Phase 2 features build on the MVP foundation to add more powerful intake methods and Pro-tier features. These are implemented after MVP is live and validated.

---

## Feature Roadmap

| Feature | Tier | Priority | Complexity |
|---------|------|----------|------------|
| Upload Mode (Document Parsing) | All | High | Medium |
| Chat Interface (Conversational Intake) | All | High | Medium |
| Custom Templates | Pro | Medium | Low |
| Equipment Library | Pro | Medium | Medium |
| White-Label PDF Branding | Pro | Low | Low |
| Follow-Up Bot (Automated Nudges) | All | Medium | Medium |

---

## 1. Upload Mode (Document Parsing)

**Goal:** Let users drop RFPs, rider PDFs, or event briefs and have Claude extract requirements automatically.

### User Flow
1. User drags PDF/DOCX/TXT onto upload zone
2. File uploads to n8n webhook
3. n8n extracts text (pdf-parse, mammoth for DOCX)
4. Claude analyzes text, extracts structured data
5. System pre-fills quote form with extracted values
6. User reviews/edits, then generates quote

### n8n Workflow: Document Parser
```
[Webhook: /parse-document]
    ↓
[Code: Extract text from file]
    - PDF → pdf-parse
    - DOCX → mammoth
    - TXT → direct read
    ↓
[Claude: Extract requirements]
    System: "Extract event requirements from this document..."
    ↓
[Code: Map to form fields]
    ↓
[Return: Pre-filled form data]
```

### Claude Extraction Prompt
```
You are an expert at extracting event production requirements from documents.

Given the following document text, extract structured data for an AV quote.

OUTPUT FORMAT (JSON):
{
  "event_name": "",
  "event_type": "",
  "venue": { "name": "", "address": "", "capacity": null },
  "dates": { "event": "", "load_in": "", "strike": "" },
  "equipment_needed": {
    "audio": { "needed": true/false, "details": "" },
    "video": { "needed": true/false, "details": "" },
    "lighting": { "needed": true/false, "details": "" },
    "staging": { "needed": true/false, "details": "" }
  },
  "labor": { "crew_provided_by": "", "notes": "" },
  "budget": { "range": "", "notes": "" },
  "special_requirements": [],
  "confidence": 0.0-1.0,
  "missing_info": []
}

If information is not found, use null. List missing critical info in "missing_info".
```

### UI Components
- `QuoteUpload.jsx` - Drag-drop zone with file preview
- File type icons and progress indicator
- Extraction status with spinning animation
- Pre-filled form with highlighted AI-filled fields
- Edit mode for corrections before quote generation

### Database Changes
```sql
-- Add to quotes table
ALTER TABLE quotes ADD COLUMN source_document_url TEXT;
ALTER TABLE quotes ADD COLUMN extraction_confidence DECIMAL;
```

---

## 2. Chat Interface (Conversational Intake)

**Goal:** Let users describe their event naturally in chat, with AI filling the form as they talk.

### User Flow
1. User opens chat interface
2. AI greets: "Tell me about your event..."
3. User describes event in natural language
4. AI asks clarifying questions, fills form fields
5. Side panel shows form being populated in real-time
6. User confirms when ready, generates quote

### n8n Workflow: Chat Handler
```
[Webhook: /chat]
    Input: { user_id, session_id, message, current_form_state }
    ↓
[Claude: Conversational agent]
    - Analyze message
    - Extract any form values
    - Determine next question
    ↓
[Return: { response, form_updates, next_question }]
```

### Claude Chat System Prompt
```
You are a friendly AV production assistant helping gather event requirements.

Your job:
1. Have a natural conversation about their event
2. Extract form field values from what they say
3. Ask focused follow-up questions for missing critical info
4. Keep responses concise (2-3 sentences max)

Current form state: {current_form_state}

After each user message, respond with:
{
  "response": "Your conversational response",
  "form_updates": {
    "field_name": "extracted_value",
    ...
  },
  "completion_percentage": 0-100,
  "next_priority_question": "If under 80%, what to ask next"
}

Critical fields: event_type, venue, dates, equipment_categories
Stop asking when critical fields are filled (80%+).
```

### UI Components
- `QuoteChat.jsx` - Chat interface with message history
- Split view: Chat on left, form preview on right
- Real-time form field highlighting as AI fills them
- Typing indicator while AI processes
- "Generate Quote" button appears when form is sufficiently complete

### Session Management
```sql
-- Chat sessions table
CREATE TABLE chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  quote_id UUID REFERENCES quotes(id),
  messages JSONB DEFAULT '[]',
  form_state JSONB DEFAULT '{}',
  status TEXT DEFAULT 'active', -- active, completed, abandoned
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);
```

---

## 3. Custom Templates (Pro)

**Goal:** Let Pro users save and reuse quote templates for common event types.

### Features
- Save current quote as template
- Name and categorize templates
- Apply template to pre-fill new quote form
- Edit template defaults
- Share templates within organization (future)

### Database Schema
```sql
CREATE TABLE templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  category TEXT, -- corporate, concert, wedding, etc.
  form_defaults JSONB, -- pre-filled form values
  quote_defaults JSONB, -- default line items, terms
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT now()
);
```

### UI Components
- `TemplateSelector.jsx` - Dropdown to apply template when starting new quote
- `TemplateSaveModal.jsx` - Save current quote as template
- `TemplateManager.jsx` - List, edit, delete templates in settings

---

## 4. Equipment Library (Pro)

**Goal:** Let Pro users maintain their own equipment catalog with custom pricing.

### Features
- Add/edit/delete equipment items
- Set daily, weekly, and monthly rates
- Organize by category
- Import from CSV
- Equipment shows in quote form for quick add
- Custom items override AI suggestions

### Database Schema
```sql
CREATE TABLE equipment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  category TEXT, -- audio, video, lighting, staging, other
  subcategory TEXT,
  description TEXT,
  daily_rate DECIMAL,
  weekly_rate DECIMAL,
  monthly_rate DECIMAL,
  specs JSONB, -- { "brand": "", "model": "", "power": "", ... }
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_equipment_user_category ON equipment(user_id, category);
```

### UI Components
- `EquipmentLibrary.jsx` - Full CRUD interface for equipment
- `EquipmentImport.jsx` - CSV import wizard
- `EquipmentPicker.jsx` - Searchable dropdown in quote form
- Category filters and search

### CSV Import Format
```csv
name,category,subcategory,daily_rate,weekly_rate,description
"Shure SM58","audio","microphones",15.00,45.00,"Dynamic vocal mic"
"QSC K12.2","audio","speakers",75.00,225.00,"12-inch powered speaker"
```

---

## 5. White-Label PDF Branding (Pro)

**Goal:** Let Pro users customize PDF quote exports with their branding.

### Features
- Upload company logo
- Set company colors (primary, secondary)
- Custom header/footer text
- Custom terms and conditions
- Custom payment terms
- "Powered by QuoteMyAV" badge (removable for Pro)

### Database Schema
```sql
CREATE TABLE branding (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) UNIQUE,
  company_name TEXT,
  logo_url TEXT,
  primary_color TEXT DEFAULT '#3B82F6',
  secondary_color TEXT DEFAULT '#1E3A5F',
  header_text TEXT,
  footer_text TEXT,
  default_terms TEXT[],
  default_payment_terms TEXT,
  show_powered_by BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT now()
);
```

### UI Components
- `BrandingSettings.jsx` - Logo upload, color pickers, text editors
- `PDFPreview.jsx` - Live preview of branded PDF
- PDF template system using user's branding settings

---

## 6. Follow-Up Bot (Automated Nudges)

**Goal:** Automatically follow up with users who have incomplete forms or pending quotes.

> **Full specification:** See `../shared/followup-system.md`

### Summary
- n8n scheduled workflow checks for incomplete forms daily
- AI crafts personalized follow-up messages
- Nudge schedule: 24h (light), 3 days (specific), 7 days (last call)
- Tracks nudge history and conversion rates
- Supports email and in-app notifications

### Database Changes
```sql
CREATE TABLE nudges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  quote_id UUID REFERENCES quotes(id),
  nudge_type TEXT, -- incomplete_form, payment_pending, quote_expiring
  nudge_number INT, -- 1, 2, 3
  channel TEXT, -- email, in_app, sms
  message TEXT,
  sent_at TIMESTAMP DEFAULT now(),
  opened_at TIMESTAMP,
  clicked_at TIMESTAMP,
  converted_at TIMESTAMP
);
```

---

## Implementation Priority

### Phase 2a (First Wave)
1. **Upload Mode** - High value, medium effort
2. **Chat Interface** - High value, medium effort

### Phase 2b (Second Wave)
3. **Custom Templates** - Pro upsell, low effort
4. **Follow-Up Bot** - Retention, medium effort

### Phase 2c (Polish)
5. **Equipment Library** - Pro upsell, medium effort
6. **White-Label PDF** - Pro upsell, low effort

---

## Related Documents

- `02-upload-mode.md` - Detailed upload mode specification
- `03-chat-interface.md` - Detailed chat mode specification
- `04-equipment-library.md` - Equipment library specification
- `../shared/questionnaire-fields.md` - Full 14-section field reference
- `../shared/followup-system.md` - Follow-up bot specification

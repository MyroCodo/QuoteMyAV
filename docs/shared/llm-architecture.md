# QuoteMyAV - LLM Architecture & Integration

## Overview

This document defines how the LLM (Claude) integrates with QuoteMyAV - what jobs it does, what it doesn't do, and how it interfaces with deterministic code and databases.

**Core Principle:** LLM handles text, interpretation, and suggestions. Code handles math, pricing, and business rules.

**Stack:**
- LLM: Claude API (Anthropic) via n8n
- Backend: n8n workflows + Supabase (Postgres)
- Frontend: React + Vite
- Orchestration: n8n Code Nodes (no LangChain - keeping it simple)

---

## 1. LLM Roles & Responsibilities

### 1.1 What the LLM DOES

```
┌─────────────────────────────────────────────────────────────────────┐
│                        LLM RESPONSIBILITIES                         │
├─────────────────────────────────────────────────────────────────────┤
│  INTERPRET     │ Parse natural language event descriptions         │
│                │ Extract: event type, venue, capacity, dates, needs │
│                │ Ask clarifying questions when info is missing      │
├────────────────┼────────────────────────────────────────────────────┤
│  MAP           │ Map user requirements to equipment categories      │
│                │ Suggest appropriate gear from catalog results      │
│                │ Recommend crew roles based on equipment selected   │
├────────────────┼────────────────────────────────────────────────────┤
│  VALIDATE      │ Check if selections make sense together           │
│                │ Flag potential issues (e.g., outdoor + indoor-only)│
│                │ Suggest missing items (forgot cables, cases, etc.) │
├────────────────┼────────────────────────────────────────────────────┤
│  WRITE         │ Generate professional proposal text                │
│                │ Write scope of work descriptions                   │
│                │ Create client-facing notes and recommendations     │
├────────────────┼────────────────────────────────────────────────────┤
│  CONVERSE      │ Handle multi-turn clarification dialogues          │
│                │ Explain why certain items were suggested           │
│                │ Answer questions about the quote                   │
└────────────────┴────────────────────────────────────────────────────┘
```

### 1.2 What the LLM DOES NOT DO

```
┌─────────────────────────────────────────────────────────────────────┐
│                    CODE/DB RESPONSIBILITIES                         │
│                  (LLM is NOT allowed to do these)                   │
├─────────────────────────────────────────────────────────────────────┤
│  PRICING       │ All rates come from DB (equipment.daily_rate)     │
│                │ LLM never invents or modifies prices               │
│                │ Discounts calculated by rules, not LLM             │
├────────────────┼────────────────────────────────────────────────────┤
│  MATH          │ Line item totals: qty × rate (code)               │
│                │ Tax calculations (code)                            │
│                │ Labor hour calculations (rules engine)             │
├────────────────┼────────────────────────────────────────────────────┤
│  VALIDATION    │ Item exists in catalog (DB check)                 │
│                │ User has quota remaining (DB check)                │
│                │ Quantities within allowed limits (code)            │
├────────────────┼────────────────────────────────────────────────────┤
│  STORAGE       │ Saving quotes (Supabase)                          │
│                │ User authentication (Supabase Auth)                │
│                │ Payment processing (Stripe)                        │
└────────────────┴────────────────────────────────────────────────────┘
```

### 1.3 LLM Job Definitions

```javascript
const LLM_JOBS = {
  // Job 1: Interpret User Input
  interpret_request: {
    input: 'Natural language event description',
    output: {
      event_type: 'corporate|concert|wedding|conference|...',
      venue_type: 'indoor|outdoor|hybrid',
      capacity: number,
      dates: { start, end, setup_days, strike_days },
      needs: ['audio', 'video', 'lighting', 'staging'],
      special_requirements: string[],
      missing_info: string[]  // what to ask user
    },
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 1000
  },

  // Job 2: Ask Clarifying Questions
  clarify_requirements: {
    input: 'Parsed request + missing_info list',
    output: {
      questions: [
        { field: 'capacity', question: 'How many attendees are expected?' },
        { field: 'venue_type', question: 'Is this indoor or outdoor?' }
      ]
    },
    model: 'claude-3-5-haiku-20241022',  // fast, cheap for simple questions
    max_tokens: 500
  },

  // Job 3: Select Equipment (with tool calls)
  select_equipment: {
    input: 'Validated requirements + catalog search results',
    output: {
      selections: [
        { item_id: 'uuid', reason: 'Why this item fits' }
      ],
      warnings: string[],
      suggestions: string[]
    },
    tools: ['search_catalog', 'get_package', 'check_compatibility'],
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 2000
  },

  // Job 4: Write Proposal
  write_proposal: {
    input: 'Structured quote data (equipment, labor, totals)',
    output: {
      summary: 'Brief event overview',
      scope_of_work: 'Detailed description of what client gets',
      equipment_notes: 'Per-category explanations',
      terms_narrative: 'Human-readable terms',
      recommendations: 'Optional upsells or considerations'
    },
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 3000
  },

  // Job 5: Conversational Refinement
  refine_quote: {
    input: 'Current quote + user feedback/question',
    output: {
      action: 'add|remove|swap|adjust|explain',
      changes: [...],
      explanation: string
    },
    tools: ['search_catalog', 'get_item_details'],
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 1500
  }
};
```

---

## 2. Database Exposure & Catalog API

### 2.1 Safe API Layer

The LLM accesses data through controlled endpoints - never direct DB queries.

```javascript
// Catalog API - Exposed to LLM as Tools
const CATALOG_API = {

  // Search equipment by criteria
  search_catalog: {
    description: 'Search equipment catalog by category, specs, or keywords',
    parameters: {
      category: 'audio|video|lighting|staging|power|rigging',
      keywords: string,
      min_capacity: number,  // e.g., "speakers for 200 people"
      max_daily_rate: number,
      in_stock: boolean
    },
    returns: [{
      id: 'uuid',
      name: string,
      category: string,
      description: string,
      daily_rate: number,  // READ-ONLY, LLM cannot change
      specs: object,
      tags: string[]
    }],
    max_results: 20  // Prevent overwhelming context
  },

  // Get specific package details
  get_package: {
    description: 'Get details of a predefined equipment package',
    parameters: {
      package_id: string
    },
    returns: {
      id: string,
      name: string,
      description: string,
      includes: [{ item_id, quantity }],
      total_daily_rate: number,
      suitable_for: string[]  // event types
    }
  },

  // Estimate labor requirements
  estimate_labor: {
    description: 'Get labor estimate based on equipment selections',
    parameters: {
      equipment_ids: string[],
      event_duration_hours: number,
      setup_complexity: 'easy|standard|complex',
      venue_type: string
    },
    returns: {
      roles: [{
        role: string,
        title: string,
        count: number,
        hours: number,
        rate: number  // READ-ONLY
      }],
      setup_hours: number,
      strike_hours: number,
      total_labor_cost: number  // Calculated by code, not LLM
    }
  },

  // Check item compatibility
  check_compatibility: {
    description: 'Check if items work together',
    parameters: {
      item_ids: string[]
    },
    returns: {
      compatible: boolean,
      issues: string[],
      suggestions: string[]
    }
  },

  // Get best practices (RAG retrieval)
  get_best_practices: {
    description: 'Retrieve relevant AV best practices for context',
    parameters: {
      event_type: string,
      categories: string[],
      venue_type: string
    },
    returns: {
      practices: [{
        topic: string,
        content: string,
        source: string
      }]
    }
  }
};
```

### 2.2 RAG Layer for Best Practices

Instead of stuffing all AV knowledge into prompts, use retrieval:

```javascript
// RAG Configuration
const RAG_CONFIG = {
  // Vector store for AV knowledge base
  vector_store: 'supabase_vectors',  // pgvector extension
  embedding_model: 'text-embedding-3-small',  // OpenAI, cheap

  // Knowledge base categories
  collections: {
    'event_types': {
      description: 'Best practices by event type',
      examples: [
        'Corporate conferences typically need...',
        'Concert productions require...'
      ]
    },
    'venue_considerations': {
      description: 'Venue-specific guidance',
      examples: [
        'Hotel ballrooms usually have...',
        'Outdoor events require weather...'
      ]
    },
    'equipment_guides': {
      description: 'Equipment selection guidance',
      examples: [
        'For audiences over 200, use line array...',
        'LED walls need specific power...'
      ]
    },
    'common_mistakes': {
      description: 'Things to avoid/check',
      examples: [
        'Always confirm ceiling height before...',
        'Outdoor events need backup power...'
      ]
    }
  },

  // Retrieval settings
  retrieval: {
    top_k: 5,  // Return top 5 most relevant chunks
    similarity_threshold: 0.7,
    max_tokens_per_chunk: 500
  }
};

// RAG Query Function (in n8n Code Node)
async function retrieveBestPractices(query, categories) {
  // Generate embedding for query
  const embedding = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: query
  });

  // Search vector store
  const results = await supabase.rpc('match_knowledge', {
    query_embedding: embedding.data[0].embedding,
    match_threshold: 0.7,
    match_count: 5,
    filter_categories: categories
  });

  return results.map(r => ({
    topic: r.topic,
    content: r.content,
    relevance: r.similarity
  }));
}
```

### 2.3 Database Schema for Catalog

```sql
-- Equipment Catalog (system-wide, not user-specific)
CREATE TABLE catalog (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sku TEXT UNIQUE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,  -- audio, video, lighting, staging, power, rigging
  subcategory TEXT,        -- speakers, mics, projectors, etc.
  description TEXT,
  daily_rate DECIMAL(10,2) NOT NULL,
  weekly_rate DECIMAL(10,2),
  specs JSONB,             -- { "watts": 1000, "weight_lbs": 50, ... }
  tags TEXT[],             -- searchable tags
  compatible_with UUID[],  -- related items
  requires UUID[],         -- dependencies (projector requires screen)
  suitable_for TEXT[],     -- event types
  indoor_only BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT now()
);

-- Pre-built Packages
CREATE TABLE packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  items JSONB NOT NULL,    -- [{ "catalog_id": "...", "quantity": 2 }]
  total_daily_rate DECIMAL(10,2),
  suitable_for TEXT[],
  min_capacity INT,
  max_capacity INT,
  created_at TIMESTAMP DEFAULT now()
);

-- Knowledge Base for RAG
CREATE TABLE knowledge_base (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,
  topic TEXT NOT NULL,
  content TEXT NOT NULL,
  embedding VECTOR(1536),  -- OpenAI embedding dimension
  metadata JSONB,
  created_at TIMESTAMP DEFAULT now()
);

-- Index for vector similarity search
CREATE INDEX ON knowledge_base
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);
```

---

## 3. Main Quote Flow

### 3.1 Complete Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           QUOTE GENERATION FLOW                             │
└─────────────────────────────────────────────────────────────────────────────┘

     USER                    FRONTEND                 N8N/BACKEND              LLM
       │                        │                          │                    │
       │  1. Describe Event     │                          │                    │
       │ ─────────────────────▶ │                          │                    │
       │  "Corporate event,     │  2. Send to webhook      │                    │
       │   200 people..."       │ ────────────────────────▶│                    │
       │                        │                          │                    │
       │                        │                          │  3. Interpret      │
       │                        │                          │ ──────────────────▶│
       │                        │                          │                    │
       │                        │                          │  4. Structured     │
       │                        │                          │◀────────────────── │
       │                        │                          │  requirements      │
       │                        │                          │                    │
       │                        │         5. Check if info complete             │
       │                        │         ───────────────────────               │
       │                        │                          │                    │
       │                        │  [IF MISSING INFO]       │                    │
       │  6. Answer questions   │◀─────────────────────────│                    │
       │ ─────────────────────▶ │                          │                    │
       │                        │ ────────────────────────▶│                    │
       │                        │                          │                    │
       │                        │         7. Requirements complete              │
       │                        │         ─────────────────────────             │
       │                        │                          │                    │
       │                        │         8. Rules Engine  │                    │
       │                        │         (deterministic)  │                    │
       │                        │         ─────────────────│                    │
       │                        │                          │                    │
       │                        │                          │  9. Retrieve       │
       │                        │                          │  best practices    │
       │                        │                          │ ──────────────────▶│
       │                        │                          │                    │
       │                        │                          │  10. Select/refine │
       │                        │                          │  equipment         │
       │                        │                          │◀────────────────── │
       │                        │                          │                    │
       │                        │        11. Validate selections                │
       │                        │        (all items exist in DB)                │
       │                        │        ───────────────────────                │
       │                        │                          │                    │
       │                        │        12. Calculate pricing                  │
       │                        │        (deterministic code)                   │
       │                        │        ─────────────────────                  │
       │                        │                          │                    │
       │                        │                          │ 13. Write proposal │
       │                        │                          │ ──────────────────▶│
       │                        │                          │                    │
       │                        │                          │ 14. Proposal text  │
       │                        │                          │◀────────────────── │
       │                        │                          │                    │
       │                        │        15. Save to DB    │                    │
       │                        │        ─────────────────                      │
       │                        │                          │                    │
       │ 16. Show quote         │◀─────────────────────────│                    │
       │ ◀───────────────────── │                          │                    │
       │                        │                          │                    │
```

### 3.2 Flow Steps in Detail

```javascript
// n8n Workflow: Quote Generation

// STEP 1-2: Receive user input
const userInput = $input.first().json;
// { message: "I need AV for a corporate conference...", user_id: "..." }

// STEP 3-4: LLM Interprets
const interpretation = await claude.messages.create({
  model: 'claude-3-5-sonnet-20241022',
  max_tokens: 1000,
  system: `You are an AV quote assistant. Extract structured event details from the user's description.

  OUTPUT FORMAT (JSON only):
  {
    "event_type": "corporate|concert|wedding|conference|...",
    "venue": { "type": "indoor|outdoor|hybrid", "name": "", "capacity": 0, "dimensions": {} },
    "dates": { "event_date": "", "setup_date": "", "strike_date": "" },
    "needs": { "audio": bool, "video": bool, "lighting": bool, "staging": bool },
    "details": { ... any extracted specifics ... },
    "missing_info": ["list of required info not provided"],
    "confidence": "high|medium|low"
  }`,
  messages: [{ role: 'user', content: userInput.message }]
});

const requirements = JSON.parse(interpretation.content[0].text);

// STEP 5-6: Check completeness, ask clarifying questions if needed
if (requirements.missing_info.length > 0) {
  const clarification = await claude.messages.create({
    model: 'claude-3-5-haiku-20241022',
    max_tokens: 500,
    system: 'Generate friendly clarifying questions for a quote request.',
    messages: [{
      role: 'user',
      content: `Missing info: ${JSON.stringify(requirements.missing_info)}\nContext: ${JSON.stringify(requirements)}`
    }]
  });

  return {
    status: 'needs_clarification',
    questions: clarification.content[0].text,
    partial_requirements: requirements
  };
}

// STEP 7-8: Requirements complete → Run Rules Engine
const rulesResult = applyRulesEngine(requirements);
// Returns: { suggested_equipment: [...], suggested_labor: [...], constraints: [...] }

// STEP 9: Retrieve relevant best practices
const bestPractices = await retrieveBestPractices(
  `${requirements.event_type} ${requirements.venue.type}`,
  ['event_types', 'venue_considerations']
);

// STEP 10: LLM refines equipment selection with catalog tools
const refinement = await claude.messages.create({
  model: 'claude-3-5-sonnet-20241022',
  max_tokens: 2000,
  tools: [searchCatalogTool, getPackageTool, checkCompatibilityTool],
  system: `You are refining an AV equipment selection.

  RULES ENGINE SUGGESTIONS:
  ${JSON.stringify(rulesResult.suggested_equipment)}

  BEST PRACTICES:
  ${bestPractices.map(p => p.content).join('\n\n')}

  Review the suggestions. Use tools to:
  1. Verify items exist in catalog
  2. Check compatibility
  3. Add any missing essential items
  4. Suggest alternatives if appropriate

  OUTPUT: JSON with your refined selections and reasoning.`,
  messages: [{ role: 'user', content: JSON.stringify(requirements) }]
});

// STEP 11: Validate all selections exist in DB
const validatedItems = await validateSelections(refinement.selections);
// Throws error if any item_id doesn't exist in catalog

// STEP 12: Calculate pricing (DETERMINISTIC - no LLM)
const pricing = calculatePricing(validatedItems, requirements);
// {
//   line_items: [...],
//   equipment_subtotal: 5000,
//   labor_subtotal: 2400,
//   subtotal: 7400,
//   tax: 610.50,
//   total: 8010.50
// }

// STEP 13-14: LLM writes proposal text
const proposal = await claude.messages.create({
  model: 'claude-3-5-sonnet-20241022',
  max_tokens: 3000,
  system: `You are writing a professional AV proposal.

  Write a client-facing proposal based on this structured quote data.
  Be professional but friendly. Explain what the client is getting and why.

  DO NOT mention specific prices in the narrative - those are shown separately.
  Focus on the scope of work, what's included, and any recommendations.`,
  messages: [{
    role: 'user',
    content: JSON.stringify({
      event: requirements,
      equipment: validatedItems,
      pricing: pricing
    })
  }]
});

// STEP 15: Save to database
const quote = await supabase.from('quotes').insert({
  user_id: userInput.user_id,
  quote_type: requirements.event_type,
  request_data: requirements,           // Original interpreted request
  equipment_data: validatedItems,       // Structured equipment list
  labor_data: pricing.labor,            // Structured labor
  pricing_data: pricing,                // All numbers
  proposal_text: proposal.content[0].text,  // LLM narrative (separate!)
  status: 'draft',
  version: 1
}).select().single();

// STEP 16: Return to frontend
return {
  quote_id: quote.data.id,
  equipment: validatedItems,
  pricing: pricing,
  proposal: proposal.content[0].text,
  status: 'draft'
};
```

### 3.3 Data Storage Structure

```javascript
// What gets stored in the quotes table
const quoteRecord = {
  id: 'uuid',
  user_id: 'uuid',

  // Structured data (source of truth for numbers)
  request_data: {
    event_type: 'corporate',
    venue: { type: 'indoor', capacity: 200 },
    dates: { event: '2025-02-15', setup: '2025-02-14' },
    needs: { audio: true, video: true, lighting: true }
  },

  equipment_data: [
    { catalog_id: 'uuid', name: 'Line Array System', quantity: 1, daily_rate: 1800 },
    { catalog_id: 'uuid', name: 'Wireless Handheld', quantity: 6, daily_rate: 75 }
  ],

  labor_data: [
    { role: 'audio_a1', hours: 14, rate: 68.75, total: 962.50 },
    { role: 'stagehand', count: 4, hours: 8, rate: 37.50, total: 1200 }
  ],

  pricing_data: {
    equipment_subtotal: 4500,
    labor_subtotal: 2162.50,
    subtotal: 6662.50,
    tax_rate: 0.0825,
    tax_amount: 549.66,
    total: 7212.16
  },

  // LLM-generated text (separate field, not source of truth for numbers)
  proposal_text: "We are pleased to present this proposal for your corporate conference...",

  // Metadata
  status: 'draft',  // draft, sent, accepted, rejected, expired
  version: 1,
  locked_at: null,  // Set when sent to client
  created_at: timestamp,
  updated_at: timestamp
};
```

---

## 4. Backend Orchestration

### 4.1 n8n Workflow Structure (No LangChain)

We're using n8n for orchestration instead of LangChain. Simpler, visual, and you already know it.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    n8n WORKFLOW: generate-quote                             │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Webhook    │────▶│  Validate    │────▶│    Check     │
│   Trigger    │     │   Input      │     │    Quota     │
└──────────────┘     └──────────────┘     └──────────────┘
                                                  │
                     ┌────────────────────────────┘
                     ▼
              ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
              │   Claude:    │────▶│   IF: needs  │────▶│   Claude:    │
              │  Interpret   │     │ clarification│     │   Ask Qs     │
              └──────────────┘     └──────────────┘     └──────────────┘
                                          │                    │
                                          │ (no)               │ (return to user)
                                          ▼                    ▼
                                   ┌──────────────┐     ┌──────────────┐
                                   │    Rules     │     │   Response   │
                                   │   Engine     │     │   (partial)  │
                                   └──────────────┘     └──────────────┘
                                          │
                     ┌────────────────────┘
                     ▼
              ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
              │   Supabase:  │────▶│   Claude:    │────▶│  Validate    │
              │  RAG Query   │     │   Refine     │     │  Selections  │
              └──────────────┘     └──────────────┘     └──────────────┘
                                                               │
                     ┌─────────────────────────────────────────┘
                     ▼
              ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
              │  Calculate   │────▶│   Claude:    │────▶│   Supabase:  │
              │   Pricing    │     │   Proposal   │     │    Save      │
              └──────────────┘     └──────────────┘     └──────────────┘
                                                               │
                                                               ▼
                                                        ┌──────────────┐
                                                        │   Response   │
                                                        │   (quote)    │
                                                        └──────────────┘
```

### 4.2 Tool Definitions for Claude

```javascript
// Tools that Claude can call during quote generation

const CLAUDE_TOOLS = [
  {
    name: 'search_catalog',
    description: 'Search the equipment catalog by category, keywords, or specifications',
    input_schema: {
      type: 'object',
      properties: {
        category: {
          type: 'string',
          enum: ['audio', 'video', 'lighting', 'staging', 'power', 'rigging'],
          description: 'Equipment category to search'
        },
        keywords: {
          type: 'string',
          description: 'Search terms (e.g., "wireless microphone", "LED wall")'
        },
        min_capacity: {
          type: 'integer',
          description: 'Minimum audience capacity the equipment should support'
        },
        max_daily_rate: {
          type: 'number',
          description: 'Maximum daily rental rate in USD'
        }
      },
      required: ['category']
    }
  },
  {
    name: 'get_package',
    description: 'Get details of a predefined equipment package',
    input_schema: {
      type: 'object',
      properties: {
        package_id: {
          type: 'string',
          description: 'The package ID to retrieve'
        }
      },
      required: ['package_id']
    }
  },
  {
    name: 'check_compatibility',
    description: 'Check if selected equipment items are compatible with each other',
    input_schema: {
      type: 'object',
      properties: {
        item_ids: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array of catalog item IDs to check'
        }
      },
      required: ['item_ids']
    }
  },
  {
    name: 'get_labor_estimate',
    description: 'Get estimated labor requirements for equipment selections',
    input_schema: {
      type: 'object',
      properties: {
        equipment_ids: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array of selected equipment IDs'
        },
        event_hours: {
          type: 'number',
          description: 'Duration of the event in hours'
        },
        setup_complexity: {
          type: 'string',
          enum: ['easy', 'standard', 'complex'],
          description: 'Venue setup complexity'
        }
      },
      required: ['equipment_ids', 'event_hours']
    }
  }
];

// Tool handler in n8n Code Node
async function handleToolCall(toolName, toolInput) {
  switch (toolName) {
    case 'search_catalog':
      const { data } = await supabase
        .from('catalog')
        .select('id, name, category, description, daily_rate, specs, tags')
        .eq('category', toolInput.category)
        .textSearch('name', toolInput.keywords || '', { type: 'websearch' })
        .limit(20);
      return data;

    case 'get_package':
      const pkg = await supabase
        .from('packages')
        .select('*')
        .eq('id', toolInput.package_id)
        .single();
      return pkg.data;

    case 'check_compatibility':
      // Check if all items exist and are compatible
      const items = await supabase
        .from('catalog')
        .select('id, name, compatible_with, requires, indoor_only')
        .in('id', toolInput.item_ids);

      const issues = [];
      for (const item of items.data) {
        // Check required dependencies
        if (item.requires?.length > 0) {
          const missing = item.requires.filter(r => !toolInput.item_ids.includes(r));
          if (missing.length > 0) {
            issues.push(`${item.name} requires additional items`);
          }
        }
      }
      return { compatible: issues.length === 0, issues };

    case 'get_labor_estimate':
      return applyLaborRules(toolInput);

    default:
      throw new Error(`Unknown tool: ${toolName}`);
  }
}
```

### 4.3 Guardrails & Validation

```javascript
// Validation layer - runs AFTER LLM selections, BEFORE pricing

const GUARDRAILS = {
  // Budget limits
  max_quote_total: 500000,  // $500K sanity check
  max_line_items: 200,      // Prevent runaway selections

  // Quantity limits
  max_quantity_per_item: 100,

  // Only allow items from our catalog
  validate_item_exists: true,

  // Price bounds (detect anomalies)
  min_daily_rate: 10,       // Nothing should be < $10/day
  max_daily_rate: 50000,    // Nothing should be > $50K/day
};

async function validateLLMSelections(selections, userId) {
  const errors = [];
  const validated = [];

  for (const selection of selections) {
    // 1. Check item exists in catalog
    const { data: item } = await supabase
      .from('catalog')
      .select('*')
      .eq('id', selection.item_id)
      .single();

    if (!item) {
      errors.push(`Item ${selection.item_id} not found in catalog`);
      continue;
    }

    // 2. Validate quantity
    if (selection.quantity < 1 || selection.quantity > GUARDRAILS.max_quantity_per_item) {
      errors.push(`Invalid quantity ${selection.quantity} for ${item.name}`);
      continue;
    }

    // 3. Validate rate is from DB (LLM didn't make up a price)
    if (selection.daily_rate && selection.daily_rate !== item.daily_rate) {
      // Use DB rate, not LLM's hallucinated rate
      selection.daily_rate = item.daily_rate;
    }

    // 4. Check indoor-only items aren't used outdoors
    if (item.indoor_only && selection.venue_type === 'outdoor') {
      errors.push(`${item.name} is indoor-only, cannot be used outdoors`);
      continue;
    }

    validated.push({
      catalog_id: item.id,
      name: item.name,
      category: item.category,
      quantity: selection.quantity,
      daily_rate: item.daily_rate,  // ALWAYS from DB
      line_total: selection.quantity * item.daily_rate
    });
  }

  // 5. Check total count
  if (validated.length > GUARDRAILS.max_line_items) {
    errors.push(`Too many line items (${validated.length}), max is ${GUARDRAILS.max_line_items}`);
  }

  if (errors.length > 0) {
    throw new ValidationError(errors);
  }

  return validated;
}
```

---

## 5. Frontend Integration

### 5.1 UI Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          QUOTE BUILDER PAGE                                 │
├────────────────────────────────────┬────────────────────────────────────────┤
│                                    │                                        │
│     CONVERSATION PANEL             │           QUOTE PANEL                  │
│     (LLM-powered chat)             │           (Structured data)            │
│                                    │                                        │
│  ┌──────────────────────────────┐  │  ┌────────────────────────────────┐   │
│  │ "I need AV for a corporate   │  │  │  EVENT DETAILS                 │   │
│  │  event, 200 people..."       │  │  │  ────────────────              │   │
│  └──────────────────────────────┘  │  │  Type: Corporate Conference    │   │
│                                    │  │  Capacity: 200                 │   │
│  ┌──────────────────────────────┐  │  │  Venue: Indoor                 │   │
│  │ "Got it! A few questions:    │  │  │  Date: Feb 15, 2025            │   │
│  │  - Indoor or outdoor?        │  │  └────────────────────────────────┘   │
│  │  - Do you need video?"       │  │                                        │
│  └──────────────────────────────┘  │  ┌────────────────────────────────┐   │
│                                    │  │  EQUIPMENT                     │   │
│  ┌──────────────────────────────┐  │  │  ────────────────              │   │
│  │ "Indoor, yes to video with   │  │  │  □ Line Array System   $1,800 │   │
│  │  2 screens and cameras"      │  │  │    Qty: 1  [+][-]             │   │
│  └──────────────────────────────┘  │  │                                │   │
│                                    │  │  □ Wireless Handhelds   $450  │   │
│  ┌──────────────────────────────┐  │  │    Qty: 6  [+][-]             │   │
│  │ "Perfect! I've put together  │  │  │                                │   │
│  │  a quote for you..."         │  │  │  [+ Add Item]                  │   │
│  └──────────────────────────────┘  │  └────────────────────────────────┘   │
│                                    │                                        │
│  ┌────────────────────────────┐    │  ┌────────────────────────────────┐   │
│  │  Type a message...    [Send]│   │  │  PRICING                       │   │
│  └────────────────────────────┘    │  │  ────────────────              │   │
│                                    │  │  Equipment:    $4,500.00       │   │
│                                    │  │  Labor:        $2,162.50       │   │
│                                    │  │  ─────────────────────         │   │
│                                    │  │  Subtotal:     $6,662.50       │   │
│                                    │  │  Tax (8.25%):    $549.66       │   │
│                                    │  │  ═════════════════════         │   │
│                                    │  │  TOTAL:        $7,212.16       │   │
│                                    │  └────────────────────────────────┘   │
│                                    │                                        │
│                                    │  [Save Draft] [Preview] [Send Quote]  │
└────────────────────────────────────┴────────────────────────────────────────┘
```

### 5.2 React Components

```jsx
// QuoteBuilder.jsx - Main quote building page

import { useState, useCallback } from 'react';
import { ConversationPanel } from './ConversationPanel';
import { QuotePanel } from './QuotePanel';
import { useQuoteBuilder } from '../hooks/useQuoteBuilder';

export function QuoteBuilder() {
  const {
    messages,
    quote,
    isLoading,
    sendMessage,
    updateQuantity,
    addItem,
    removeItem,
    recalculate
  } = useQuoteBuilder();

  return (
    <div className="flex h-screen">
      {/* Left: Conversation */}
      <ConversationPanel
        messages={messages}
        onSend={sendMessage}
        isLoading={isLoading}
      />

      {/* Right: Structured Quote */}
      <QuotePanel
        quote={quote}
        onQuantityChange={updateQuantity}
        onAddItem={addItem}
        onRemoveItem={removeItem}
        onRecalculate={recalculate}
      />
    </div>
  );
}
```

```javascript
// useQuoteBuilder.js - Hook managing quote state and API calls

import { useState, useCallback } from 'react';
import { api } from '../lib/api';

export function useQuoteBuilder() {
  const [messages, setMessages] = useState([]);
  const [quote, setQuote] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = useCallback(async (text) => {
    // Add user message to chat
    setMessages(prev => [...prev, { role: 'user', content: text }]);
    setIsLoading(true);

    try {
      // Call n8n webhook
      const response = await api.post('/quote/message', {
        message: text,
        quote_id: quote?.id,
        context: quote?.request_data
      });

      // Handle response
      if (response.status === 'needs_clarification') {
        // LLM is asking questions
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: response.questions
        }]);
      } else if (response.status === 'quote_ready') {
        // Full quote generated
        setQuote(response.quote);
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: response.proposal
        }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, {
        role: 'error',
        content: 'Sorry, something went wrong. Please try again.'
      }]);
    } finally {
      setIsLoading(false);
    }
  }, [quote]);

  // Manual quantity adjustment
  const updateQuantity = useCallback(async (itemId, newQuantity) => {
    // Optimistic update
    setQuote(prev => ({
      ...prev,
      equipment_data: prev.equipment_data.map(item =>
        item.catalog_id === itemId
          ? { ...item, quantity: newQuantity }
          : item
      )
    }));

    // Recalculate on server (deterministic pricing)
    const response = await api.post('/quote/recalculate', {
      quote_id: quote.id,
      changes: [{ item_id: itemId, quantity: newQuantity }]
    });

    setQuote(response.quote);

    // Optionally ask LLM to update proposal text
    if (response.needs_proposal_update) {
      const proposalResponse = await api.post('/quote/update-proposal', {
        quote_id: quote.id
      });
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `Updated the quote. ${proposalResponse.summary}`
      }]);
    }
  }, [quote]);

  return {
    messages,
    quote,
    isLoading,
    sendMessage,
    updateQuantity,
    // ... other methods
  };
}
```

### 5.3 Manual Override Flow

```javascript
// When user manually adjusts quantities or items

async function handleManualOverride(quoteId, changes) {
  // 1. Apply changes to quote data
  const updatedQuote = applyChanges(quote, changes);

  // 2. Recalculate pricing (deterministic - no LLM)
  const newPricing = await api.post('/quote/recalculate', {
    quote_id: quoteId,
    equipment_data: updatedQuote.equipment_data,
    labor_data: updatedQuote.labor_data
  });

  // 3. Optionally regenerate proposal text
  if (changes.significant) {  // e.g., > 20% price change
    const newProposal = await api.post('/quote/regenerate-proposal', {
      quote_id: quoteId
    });
    return { ...newPricing, proposal_text: newProposal.text };
  }

  return newPricing;
}
```

---

## 6. Generating & Sharing Quotes

### 6.1 Price Locking

```javascript
// Once a quote is sent to client, lock the prices

async function sendQuoteToClient(quoteId, clientEmail) {
  // 1. Get current quote
  const { data: quote } = await supabase
    .from('quotes')
    .select('*')
    .eq('id', quoteId)
    .single();

  // 2. Lock the quote - snapshot current prices
  const lockedQuote = await supabase
    .from('quotes')
    .update({
      status: 'sent',
      locked_at: new Date().toISOString(),
      locked_pricing: quote.pricing_data,  // Snapshot
      sent_to: clientEmail,
      sent_at: new Date().toISOString(),
      valid_until: addDays(new Date(), 30).toISOString()
    })
    .eq('id', quoteId)
    .select()
    .single();

  // 3. Generate PDF
  const pdf = await generateQuotePDF(lockedQuote.data);

  // 4. Create client view link
  const clientLink = await createClientLink(quoteId);
  // e.g., https://quotemyav.com/view/abc123

  // 5. Send email
  await sendQuoteEmail({
    to: clientEmail,
    quote: lockedQuote.data,
    pdf: pdf,
    viewLink: clientLink
  });

  return { quote: lockedQuote.data, clientLink };
}
```

### 6.2 PDF Generation

```javascript
// PDF generation using structured data (not LLM text for numbers)

async function generateQuotePDF(quote) {
  const doc = new PDFDocument();

  // Header with branding (Pro users get custom branding)
  if (quote.user_branding) {
    doc.image(quote.user_branding.logo, ...);
  } else {
    doc.image(DEFAULT_LOGO, ...);
  }

  // Quote metadata
  doc.text(`Quote #${quote.id.slice(0, 8).toUpperCase()}`);
  doc.text(`Date: ${formatDate(quote.created_at)}`);
  doc.text(`Valid Until: ${formatDate(quote.valid_until)}`);

  // Proposal text (LLM-generated)
  doc.moveDown();
  doc.text('Scope of Work', { heading: true });
  doc.text(quote.proposal_text);

  // Equipment table (structured data - source of truth)
  doc.moveDown();
  doc.text('Equipment & Services', { heading: true });

  const table = {
    headers: ['Item', 'Qty', 'Rate', 'Total'],
    rows: quote.equipment_data.map(item => [
      item.name,
      item.quantity,
      formatCurrency(item.daily_rate),
      formatCurrency(item.line_total)
    ])
  };
  doc.table(table);

  // Labor section
  if (quote.labor_data?.length > 0) {
    doc.moveDown();
    doc.text('Labor', { heading: true });
    // ... labor table
  }

  // Pricing summary (from pricing_data, not calculated fresh)
  doc.moveDown();
  doc.text('─'.repeat(40));
  doc.text(`Equipment Subtotal: ${formatCurrency(quote.pricing_data.equipment_subtotal)}`);
  doc.text(`Labor Subtotal: ${formatCurrency(quote.pricing_data.labor_subtotal)}`);
  doc.text(`Subtotal: ${formatCurrency(quote.pricing_data.subtotal)}`);
  doc.text(`Tax (${quote.pricing_data.tax_rate * 100}%): ${formatCurrency(quote.pricing_data.tax_amount)}`);
  doc.text(`TOTAL: ${formatCurrency(quote.pricing_data.total)}`, { bold: true });

  // Terms
  doc.moveDown();
  doc.text('Terms & Conditions', { heading: true });
  doc.text(quote.terms || DEFAULT_TERMS);

  return doc.toBuffer();
}
```

### 6.3 Client View Page

```jsx
// Public quote view page (no auth required, uses token)

export function QuoteView({ token }) {
  const { quote, isLoading, error } = useQuoteByToken(token);

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage>Quote not found or expired</ErrorMessage>;

  return (
    <div className="max-w-4xl mx-auto p-8">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1>Quote #{quote.id.slice(0, 8).toUpperCase()}</h1>
          <p className="text-gray-500">
            Valid until {formatDate(quote.valid_until)}
          </p>
        </div>
        <QuoteStatus status={quote.status} />
      </div>

      {/* Proposal */}
      <section className="mb-8">
        <h2>Scope of Work</h2>
        <p className="whitespace-pre-wrap">{quote.proposal_text}</p>
      </section>

      {/* Equipment & Pricing (read-only) */}
      <section className="mb-8">
        <h2>Equipment & Services</h2>
        <QuoteTable equipment={quote.equipment_data} />
      </section>

      {/* Total */}
      <section className="mb-8 bg-gray-900 p-4 rounded">
        <div className="flex justify-between">
          <span>Total</span>
          <span className="text-2xl font-bold">
            {formatCurrency(quote.pricing_data.total)}
          </span>
        </div>
      </section>

      {/* Actions */}
      {quote.status === 'sent' && (
        <div className="flex gap-4">
          <Button onClick={() => acceptQuote(quote.id)}>
            Accept Quote
          </Button>
          <Button variant="outline" onClick={() => requestChanges(quote.id)}>
            Request Changes
          </Button>
        </div>
      )}

      {/* Download */}
      <Button variant="ghost" onClick={() => downloadPDF(quote.id)}>
        Download PDF
      </Button>
    </div>
  );
}
```

---

## 7. Feedback Loop & Tuning

### 7.1 Logging Schema

```sql
-- Log every quote generation for analysis
CREATE TABLE quote_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id UUID REFERENCES quotes(id),
  user_id UUID REFERENCES auth.users(id),

  -- Input
  original_input TEXT,           -- What user typed
  interpreted_request JSONB,     -- LLM's interpretation

  -- LLM Selections
  llm_suggested_equipment JSONB, -- What LLM initially suggested
  rules_suggested_equipment JSONB, -- What rules engine suggested

  -- Final Outcome
  final_equipment JSONB,         -- What was actually used
  user_overrides JSONB,          -- Manual changes user made

  -- Metrics
  llm_tokens_used INT,
  generation_time_ms INT,
  user_edit_count INT,           -- How many changes user made

  -- Quality Signals
  quote_accepted BOOLEAN,        -- Did client accept?
  quote_total DECIMAL,
  margin_percentage DECIMAL,

  created_at TIMESTAMP DEFAULT now()
);

-- Index for analysis queries
CREATE INDEX idx_quote_logs_created ON quote_logs(created_at);
CREATE INDEX idx_quote_logs_accepted ON quote_logs(quote_accepted);
```

### 7.2 Analysis Queries

```sql
-- Find items LLM suggests that users always remove
SELECT
  item->>'name' as item_name,
  COUNT(*) as times_suggested,
  SUM(CASE WHEN item->>'name' NOT IN (
    SELECT jsonb_array_elements(final_equipment)->>'name'
  ) THEN 1 ELSE 0 END) as times_removed
FROM quote_logs,
LATERAL jsonb_array_elements(llm_suggested_equipment) as item
GROUP BY item->>'name'
HAVING SUM(CASE WHEN item->>'name' NOT IN (...) THEN 1 ELSE 0 END) > 10
ORDER BY times_removed DESC;

-- Find common user additions (LLM missed these)
SELECT
  item->>'name' as item_name,
  COUNT(*) as times_added
FROM quote_logs,
LATERAL jsonb_array_elements(user_overrides) as override
WHERE override->>'action' = 'add'
GROUP BY item->>'name'
ORDER BY times_added DESC
LIMIT 20;

-- Quote acceptance rate by event type
SELECT
  interpreted_request->>'event_type' as event_type,
  COUNT(*) as total_quotes,
  SUM(CASE WHEN quote_accepted THEN 1 ELSE 0 END) as accepted,
  ROUND(AVG(CASE WHEN quote_accepted THEN 1.0 ELSE 0.0 END) * 100, 1) as acceptance_rate
FROM quote_logs
GROUP BY interpreted_request->>'event_type'
ORDER BY total_quotes DESC;
```

### 7.3 Prompt Tuning Process

```javascript
// Monthly prompt review process

const PROMPT_TUNING_WORKFLOW = {
  // 1. Gather data
  gather_metrics: async () => {
    const stats = await db.query(`
      SELECT
        AVG(user_edit_count) as avg_edits,
        AVG(CASE WHEN quote_accepted THEN 1 ELSE 0 END) as acceptance_rate,
        -- ... more metrics
      FROM quote_logs
      WHERE created_at > NOW() - INTERVAL '30 days'
    `);
    return stats;
  },

  // 2. Identify problem areas
  find_issues: async () => {
    // Items frequently removed
    const overSuggested = await db.query(ITEMS_OFTEN_REMOVED_QUERY);

    // Items frequently added
    const underSuggested = await db.query(ITEMS_OFTEN_ADDED_QUERY);

    // Event types with low acceptance
    const problemEventTypes = await db.query(LOW_ACCEPTANCE_QUERY);

    return { overSuggested, underSuggested, problemEventTypes };
  },

  // 3. Generate prompt updates
  suggest_improvements: (issues) => {
    const suggestions = [];

    if (issues.overSuggested.length > 0) {
      suggestions.push({
        type: 'reduce_suggestion',
        items: issues.overSuggested,
        prompt_change: `Be more conservative suggesting: ${issues.overSuggested.map(i => i.name).join(', ')}`
      });
    }

    if (issues.underSuggested.length > 0) {
      suggestions.push({
        type: 'add_reminder',
        items: issues.underSuggested,
        prompt_change: `Remember to suggest these commonly needed items: ${issues.underSuggested.map(i => i.name).join(', ')}`
      });
    }

    return suggestions;
  },

  // 4. A/B test new prompts
  run_ab_test: async (newPrompt, duration = '7 days') => {
    // 50% of requests use new prompt
    // Compare metrics after duration
  }
};
```

### 7.4 Recommended Packages (Auto-Generated)

```javascript
// Promote frequently-used combinations to first-class packages

async function generateRecommendedPackages() {
  // Find equipment combinations that appear together often
  const combinations = await db.query(`
    WITH equipment_pairs AS (
      SELECT
        e1.catalog_id as item1,
        e2.catalog_id as item2,
        COUNT(*) as co_occurrence
      FROM quote_logs ql,
        LATERAL jsonb_array_elements(final_equipment) e1,
        LATERAL jsonb_array_elements(final_equipment) e2
      WHERE e1.catalog_id < e2.catalog_id  -- Avoid duplicates
        AND ql.quote_accepted = true
      GROUP BY e1.catalog_id, e2.catalog_id
      HAVING COUNT(*) > 20
    )
    SELECT * FROM equipment_pairs
    ORDER BY co_occurrence DESC
    LIMIT 50
  `);

  // Cluster into packages
  const packages = clusterIntoPackages(combinations);

  // For each potential package:
  for (const pkg of packages) {
    // Check if similar package already exists
    const existing = await findSimilarPackage(pkg);
    if (!existing) {
      // Create as "AI Recommended" package
      await db.insert('packages', {
        name: `${pkg.eventType} Package (AI Recommended)`,
        items: pkg.items,
        source: 'auto_generated',
        confidence: pkg.frequency / totalQuotes
      });
    }
  }
}

// Run monthly
schedule('0 0 1 * *', generateRecommendedPackages);
```

---

## Summary

**LLM Jobs:**
1. Interpret natural language → structured requirements
2. Ask clarifying questions when info is missing
3. Select equipment using catalog tools (validated against DB)
4. Write professional proposal text
5. Handle conversational refinement

**Code Jobs:**
1. All pricing calculations
2. Validation (items exist, quantities valid)
3. Quota enforcement
4. PDF generation
5. Data storage

**Key Principles:**
- LLM never sets prices - rates come from DB
- All LLM selections validated before use
- Structured data is source of truth, not LLM text
- Prices locked once quote is sent
- Everything logged for continuous improvement

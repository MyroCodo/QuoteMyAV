# QuoteMyAV

AI-powered quote generation for AV rental companies, event production houses, and integrators.

## Overview

QuoteMyAV transforms event briefs into professional AV equipment quotes using AI. Fill out a guided form describing your event, and get a detailed quote with equipment recommendations, labor estimates, and pricing.

## Features

### Current (MVP + v1.x)

- **Multi-step Quote Wizard** - Guided form: Type → Event Details → Equipment → Review
- **AI Quote Generation** - Claude-powered equipment recommendations based on event requirements
- **Live Quote Editor** - Inline editing of line items with real-time totals
- **AI Edit Assistant** - Natural language commands ("reduce cost by 15%", "add streaming package")
- **Quick Actions** - One-click optimizations (Hit Budget, Premium Version, Add Recording, etc.)
- **Quote Versioning** - Track changes, compare versions, restore previous states
- **PDF Export** - Professional quotes ready to send to clients
- **12 Equipment Categories** - Audio, Video, Lighting, Staging, Rigging, Cables, Signal, Decor, Power, Comms, Labor, Other

### Planned (v2.x+)

See [docs/ROADMAP.md](docs/ROADMAP.md) for the complete feature roadmap including:

- Equipment Catalog & Packages
- Inventory & Availability
- Labor & Logistics
- Multi-Layer Pricing & Approvals
- Documents & E-Signature
- Client Portal
- CRM & Reporting
- Audit Trail & Admin

## Tech Stack

- **Frontend:** React 19 + TypeScript + Vite
- **Styling:** Tailwind CSS v4
- **State:** Zustand
- **AI:** n8n + Claude API
- **Auth/DB:** Supabase
- **PDF:** jsPDF

## Getting Started

### Prerequisites

- Node.js 18+
- n8n instance (local or cloud)
- Supabase project (optional for demo mode)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/quotemyav.git
cd quotemyav

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Start development server
npm run dev
```

### Environment Variables

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_N8N_WEBHOOK_URL=your_n8n_webhook_url
VITE_N8N_AI_WEBHOOK_URL=your_ai_webhook_url
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_key
```

## Project Structure

```
src/
├── components/
│   ├── auth/          # Authentication components
│   ├── layout/        # Navbar, Footer
│   ├── quote/         # Quote builder components
│   │   ├── LiveQuoteEditor.tsx
│   │   ├── AIEditSidebar.tsx
│   │   ├── VersionHistoryPanel.tsx
│   │   └── ...
│   └── ui/            # Reusable UI components
├── pages/
│   ├── Dashboard.tsx
│   ├── QuoteBuilder.tsx
│   ├── QuoteDetail.tsx
│   └── ...
├── stores/
│   ├── quoteStore.ts
│   ├── aiEditStore.ts
│   ├── versionStore.ts
│   └── ...
├── services/
│   ├── ai-quote.ts
│   ├── ai-edit.ts
│   ├── versions.ts
│   └── ...
├── types/
│   └── index.ts
└── App.tsx
```

## Documentation

- [Architecture](docs/mvp/01-architecture.md) - Technical architecture
- [Roadmap](docs/ROADMAP.md) - Feature roadmap
- [Quote Lifecycle](docs/shared/quote-lifecycle.md) - Status workflow
- [Rules Engine](docs/shared/rules-engine.md) - Equipment selection logic

## Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

## License

Proprietary - All rights reserved

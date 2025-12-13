# @quotemyav/sdk

Official TypeScript SDK for the QuoteMyAV API.

## Installation

```bash
npm install @quotemyav/sdk
```

## Quick Start

```typescript
import { QuoteMyAV } from '@quotemyav/sdk';

// Initialize with API key (Pro/Enterprise)
const client = new QuoteMyAV({
  apiKey: 'qmav_live_xxxxx'
});

// Or with JWT token (web dashboard)
const client = new QuoteMyAV({
  accessToken: 'eyJhbGciOiJIUzI1NiIs...'
});
```

## Usage Examples

### List Quotes

```typescript
const { data: quotes, meta } = await client.quotes.list({
  status: 'draft',
  limit: 20,
  offset: 0
});

console.log(`Found ${meta.total} quotes`);
quotes.forEach(q => console.log(q.eventName));
```

### Create a Quote

```typescript
const { data: quote } = await client.quotes.create({
  requestBody: {
    clientName: 'Acme Corp',
    clientEmail: 'events@acme.com',
    eventName: 'Annual Gala 2024',
    eventDate: '2024-06-15',
    venue: 'Grand Ballroom, Hilton Downtown'
  }
});

console.log(`Created quote: ${quote.id}`);
```

### Add Line Items

```typescript
await client.quotes.items.add({
  quoteId: 'QM-abc123',
  requestBody: {
    category: 'audio',
    description: 'Shure SM58 Microphone',
    quantity: 4,
    unitPrice: 25
  }
});
```

### Generate Quote with AI

```typescript
// Option 1: Manual polling
const { data: job } = await client.ai.generate({
  requestBody: {
    eventDetails: {
      eventName: 'Corporate Conference',
      eventType: 'conference',
      venueSize: 'large'
    },
    equipment: {
      categories: ['audio', 'video', 'lighting'],
      budgetRange: { min: 10000, max: 25000 }
    }
  }
});

// Poll for result
const result = await client.ai.getJob({ jobId: job.jobId });

// Option 2: Automatic polling (recommended)
const result = await client.ai.generateAndWait({
  eventDetails: { eventName: 'Conference', eventType: 'conference' },
  equipment: { categories: ['audio', 'video'] }
}, {
  interval: 1000,  // Poll every 1 second
  timeout: 60000   // Give up after 60 seconds
});

console.log(`Generated ${result.result.lineItems.length} line items`);
console.log(`Total: $${result.result.totalAmount}`);
```

### Edit Quote with AI

```typescript
const result = await client.ai.editAndWait({
  quoteId: 'QM-abc123',
  command: 'reduce costs by 20% while maintaining quality'
});

// Or use quick actions
const result = await client.ai.editAndWait({
  quoteId: 'QM-abc123',
  quickAction: 'hit_budget',
  targetBudget: 15000
});
```

### Manage API Keys

```typescript
// List existing keys
const { data: keys } = await client.me.apiKeys.list();

// Create a new key
const { data: newKey, warning } = await client.me.apiKeys.create({
  requestBody: {
    name: 'Production Integration',
    scopes: ['quotes:read', 'quotes:write'],
    expiresInDays: 365
  }
});

console.log(`New key: ${newKey.key}`); // Only shown once!
console.log(warning);

// Revoke a key
await client.me.apiKeys.revoke({ keyId: 'key_abc123' });
```

### Webhooks (Enterprise)

```typescript
// Create a webhook endpoint
const { data: webhook } = await client.webhooks.create({
  requestBody: {
    url: 'https://yourapp.com/webhooks/quotemyav',
    events: ['quote.accepted', 'quote.rejected']
  }
});

console.log(`Webhook secret: ${webhook.secret}`); // Store securely!

// Test the webhook
const { data: result } = await client.webhooks.test({
  webhookId: webhook.id
});

console.log(`Test ${result.success ? 'passed' : 'failed'}`);
```

## Configuration Options

```typescript
const client = new QuoteMyAV({
  // Authentication (use one)
  apiKey: 'qmav_live_xxxxx',      // For programmatic access
  accessToken: 'jwt_token',       // For web dashboard

  // Optional
  baseUrl: 'https://api.quotemyav.com/v1',  // API base URL
  timeout: 30000                             // Request timeout (ms)
});
```

## Error Handling

```typescript
import { QuoteMyAV, ApiError } from '@quotemyav/sdk';

try {
  await client.quotes.get({ quoteId: 'invalid' });
} catch (error) {
  if (error.status === 404) {
    console.log('Quote not found');
  } else if (error.status === 429) {
    console.log('Rate limited - try again later');
  } else {
    console.error('API error:', error.message);
  }
}
```

## TypeScript Support

Full TypeScript support with all types exported:

```typescript
import type {
  Quote,
  QuoteCreate,
  QuoteStatus,
  LineItem,
  LineItemCategory,
  AIJob,
  Subscription
} from '@quotemyav/sdk';

const createQuote = async (data: QuoteCreate): Promise<Quote> => {
  const { data: quote } = await client.quotes.create({ requestBody: data });
  return quote;
};
```

## Requirements

- Node.js 18+ or modern browser
- TypeScript 4.7+ (for TypeScript users)

## License

MIT

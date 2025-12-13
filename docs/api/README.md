# QuoteMyAV API Documentation

## Overview

The QuoteMyAV API provides programmatic access to the quote generation platform. The API follows REST conventions and uses JSON for request and response bodies.

## Base URL

| Environment | URL |
|-------------|-----|
| Production | `https://api.quotemyav.com/v1` |
| Staging | `https://api-staging.quotemyav.com/v1` |
| Local | `http://localhost:3000/v1` |

## Authentication

The API supports two authentication methods:

### JWT Authentication (Web Users)

For web dashboard users, include the Supabase JWT token in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

### API Key Authentication (Pro/Enterprise)

For programmatic access (available to Pro and Enterprise tiers), include the API key in the X-API-Key header:

```
X-API-Key: qmav_live_xxxxx
```

API keys can be created and managed at `/v1/me/api-keys`.

## Rate Limits

| Tier | API Calls/Day | AI Calls/Hour |
|------|---------------|---------------|
| Free | No API access | N/A |
| Starter | No API access | N/A |
| Pro | 100 | 20 |
| Enterprise | 10,000 | 500 |

Rate limit information is included in response headers:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 87
X-RateLimit-Reset: 1702540800
```

## Quotas

| Tier | Monthly Quote Limit |
|------|---------------------|
| Free | 3 |
| Starter | 25 |
| Pro | Unlimited |
| Enterprise | Unlimited |

Quota information is included in response headers for quote operations:

```
X-Quota-Limit: 25
X-Quota-Used: 12
X-Quota-Reset: 2024-02-01T00:00:00Z
```

## Quick Start

### 1. Create an API Key

```bash
curl -X POST https://api.quotemyav.com/v1/me/api-keys \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{"name": "My Integration"}'
```

Response:
```json
{
  "data": {
    "id": "key_abc123",
    "key": "qmav_live_xxxxxxxxxxxxx",
    "name": "My Integration"
  },
  "warning": "Store this API key securely. It will not be shown again."
}
```

### 2. List Quotes

```bash
curl https://api.quotemyav.com/v1/quotes \
  -H "X-API-Key: qmav_live_xxxxxxxxxxxxx"
```

### 3. Create a Quote

```bash
curl -X POST https://api.quotemyav.com/v1/quotes \
  -H "X-API-Key: qmav_live_xxxxxxxxxxxxx" \
  -H "Content-Type: application/json" \
  -d '{
    "clientName": "Acme Corp",
    "clientEmail": "events@acme.com",
    "eventName": "Annual Gala 2024",
    "eventDate": "2024-06-15",
    "venue": "Grand Ballroom, Hilton Downtown"
  }'
```

### 4. Generate Quote with AI

```bash
curl -X POST https://api.quotemyav.com/v1/ai/generate \
  -H "X-API-Key: qmav_live_xxxxxxxxxxxxx" \
  -H "Content-Type: application/json" \
  -d '{
    "eventDetails": {
      "eventName": "Corporate Conference",
      "eventType": "conference",
      "venueSize": "large",
      "venueName": "Convention Center"
    },
    "equipment": {
      "categories": ["audio", "video", "lighting"],
      "budgetRange": {"min": 10000, "max": 25000}
    }
  }'
```

Response:
```json
{
  "data": {
    "jobId": "job-abc123xyz456",
    "status": "processing",
    "message": "AI generation started. Poll /v1/ai/jobs/:jobId for status."
  }
}
```

### 5. Poll for AI Job Result

```bash
curl https://api.quotemyav.com/v1/ai/jobs/job-abc123xyz456 \
  -H "X-API-Key: qmav_live_xxxxxxxxxxxxx"
```

## OpenAPI Specification

The complete API specification is available in OpenAPI 3.0 format:

- **File**: [openapi.yaml](./openapi.yaml)
- **Swagger UI**: `https://api.quotemyav.com/docs` (coming soon)

## SDKs

### TypeScript/JavaScript

```bash
npm install @quotemyav/sdk
```

```typescript
import { QuoteMyAV } from '@quotemyav/sdk';

const client = new QuoteMyAV({
  apiKey: 'qmav_live_xxxxxxxxxxxxx'
});

// List quotes
const { data: quotes } = await client.quotes.list({ status: 'draft' });

// Generate with AI
const { data: result } = await client.ai.generate({
  eventDetails: { eventName: 'Conference', eventType: 'conference' },
  equipment: { categories: ['audio', 'video'] }
});
```

## Webhooks (Enterprise)

Enterprise customers can receive real-time notifications for quote events:

### Available Events

| Event | Description |
|-------|-------------|
| `quote.created` | New quote created |
| `quote.updated` | Quote modified |
| `quote.sent` | Quote sent to client |
| `quote.viewed` | Client viewed quote |
| `quote.accepted` | Client accepted quote |
| `quote.rejected` | Client rejected quote |
| `quote.expired` | Quote expired |
| `ai.job.completed` | AI generation completed |
| `ai.job.failed` | AI generation failed |

### Webhook Payload

```json
{
  "id": "evt_abc123",
  "type": "quote.accepted",
  "apiVersion": "2024-01-01",
  "createdAt": "2024-01-15T10:30:00Z",
  "data": {
    "quote": {
      "id": "QM-xyz789",
      "clientName": "Acme Corp",
      "totalAmount": 15000
    }
  }
}
```

### Signature Verification

Webhooks include an HMAC-SHA256 signature in the `X-QuoteMyAV-Signature` header. Verify this signature using your webhook secret:

```typescript
import crypto from 'crypto';

function verifySignature(payload: string, signature: string, secret: string): boolean {
  const expected = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}
```

## Error Handling

All errors follow a consistent format:

```json
{
  "error": {
    "code": "QUOTE_NOT_FOUND",
    "message": "Quote not found",
    "details": {
      "quoteId": "QM-xyz789"
    },
    "requestId": "req_abc123"
  }
}
```

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `AUTH_REQUIRED` | 401 | Missing authentication |
| `AUTH_INVALID` | 401 | Invalid token or API key |
| `API_KEY_REVOKED` | 401 | API key has been revoked |
| `TIER_REQUIRED` | 403 | Feature requires higher tier |
| `QUOTA_EXCEEDED` | 403 | Monthly quota exceeded |
| `RATE_LIMITED` | 429 | Rate limit exceeded |
| `VALIDATION_ERROR` | 400 | Invalid request data |
| `QUOTE_NOT_FOUND` | 404 | Quote does not exist |
| `QUOTE_READONLY` | 422 | Quote cannot be modified |

## Idempotency

For POST requests that create resources, include an `Idempotency-Key` header to safely retry requests:

```bash
curl -X POST https://api.quotemyav.com/v1/quotes \
  -H "X-API-Key: qmav_live_xxxxxxxxxxxxx" \
  -H "Idempotency-Key: 550e8400-e29b-41d4-a716-446655440000" \
  -H "Content-Type: application/json" \
  -d '...'
```

If the same idempotency key is used within 24 hours, the original response is returned.

## Support

- **Documentation**: https://docs.quotemyav.com
- **API Status**: https://status.quotemyav.com
- **Email**: api-support@quotemyav.com

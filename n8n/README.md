# QuoteMyAV - n8n + S3 Backend Setup

This guide explains how to set up n8n workflows to handle quote storage using AWS S3.

## Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   React     │────▶│    n8n      │────▶│    AWS S3   │
│   Frontend  │◀────│  Webhooks   │◀────│   Bucket    │
└─────────────┘     └─────────────┘     └─────────────┘
```

## S3 Bucket Structure

```
quotemyav-data/
├── quotes/
│   ├── {quoteId}.json          # Individual quote files
│   └── ...
└── users/
    └── {userId}/
        └── index.json          # List of user's quote IDs
```

## AWS Setup

### 1. Create S3 Bucket

1. Go to AWS S3 Console
2. Create bucket: `quotemyav-data` (or your preferred name)
3. Region: Choose closest to your users
4. Keep "Block all public access" enabled
5. Enable versioning (optional, good for recovery)

### 2. Create IAM User for n8n

1. Go to AWS IAM Console
2. Create new user: `quotemyav-n8n`
3. Attach policy (create custom):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::quotemyav-data",
        "arn:aws:s3:::quotemyav-data/*"
      ]
    }
  ]
}
```

4. Create access key and save credentials

### 3. Configure n8n AWS Credentials

1. In n8n, go to Credentials
2. Add new: AWS
3. Enter Access Key ID and Secret Access Key
4. Region: Same as your bucket

## n8n Workflows

Import the workflow JSON files from this folder, or create manually:

---

### Workflow 1: Create Quote

**Webhook:** `POST /webhook/quotes`

```
[Webhook] → [Set Quote ID] → [S3 Put Object] → [Update User Index] → [Respond]
```

**Nodes:**

1. **Webhook**
   - Method: POST
   - Path: quotes
   - Response Mode: Last Node

2. **Set** (Generate Quote ID)
   ```javascript
   const quoteId = 'QM-' + Date.now();
   const quote = {
     ...items[0].json.body,
     id: quoteId,
     createdAt: new Date().toISOString(),
     updatedAt: new Date().toISOString()
   };
   return { json: { quote, quoteId } };
   ```

3. **AWS S3** (Put Object)
   - Operation: Upload
   - Bucket: quotemyav-data
   - File Name: `quotes/{{ $json.quoteId }}.json`
   - Binary Data: No
   - File Content: `{{ JSON.stringify($json.quote) }}`

4. **Respond to Webhook**
   - Response Body: `{{ JSON.stringify({ success: true, quote: $json.quote }) }}`

---

### Workflow 2: Get User Quotes

**Webhook:** `GET /webhook/quotes`

```
[Webhook] → [S3 List Objects] → [S3 Get Objects Loop] → [Respond]
```

**Nodes:**

1. **Webhook**
   - Method: GET
   - Path: quotes
   - Query: userId

2. **AWS S3** (List Objects)
   - Operation: List
   - Bucket: quotemyav-data
   - Prefix: `quotes/`

3. **Split In Batches** + **S3 Get Object** (loop through files)

4. **Code** (Filter by userId)
   ```javascript
   const userId = $('Webhook').first().json.query.userId;
   const quotes = items
     .map(item => JSON.parse(item.json.Body))
     .filter(quote => quote.userId === userId)
     .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
   return { json: { quotes } };
   ```

5. **Respond to Webhook**

---

### Workflow 3: Get Single Quote

**Webhook:** `GET /webhook/quotes/:id`

```
[Webhook] → [S3 Get Object] → [Respond]
```

---

### Workflow 4: Update Quote

**Webhook:** `PUT /webhook/quotes/:id`

```
[Webhook] → [S3 Get Object] → [Merge Updates] → [S3 Put Object] → [Respond]
```

---

### Workflow 5: Delete Quote

**Webhook:** `DELETE /webhook/quotes/:id`

```
[Webhook] → [S3 Delete Object] → [Respond]
```

---

## Environment Variables

Add to your `.env` file:

```env
# n8n Webhook Base URL
VITE_N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook

# Or for local development
VITE_N8N_WEBHOOK_URL=http://localhost:5678/webhook
```

## Quick Start with Workflow JSON

Import `workflows/quotes-crud.json` into n8n to get all workflows at once.

## Security Notes

1. **CORS**: Configure n8n to allow requests from your frontend domain
2. **Auth**: Add authentication header check in webhooks for production
3. **Rate Limiting**: Consider adding rate limiting in n8n

## Testing

Use the n8n webhook test feature or curl:

```bash
# Create quote
curl -X POST http://localhost:5678/webhook/quotes \
  -H "Content-Type: application/json" \
  -d '{"userId":"user123","eventName":"Test Event","lineItems":[]}'

# Get user quotes
curl "http://localhost:5678/webhook/quotes?userId=user123"

# Get single quote
curl "http://localhost:5678/webhook/quotes/QM-123456789"

# Delete quote
curl -X DELETE "http://localhost:5678/webhook/quotes/QM-123456789"
```

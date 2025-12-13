import Anthropic from '@anthropic-ai/sdk';
import { getAnthropicApiKey } from './secrets.js';

// Lazy-initialized Anthropic client
let anthropicClient: Anthropic | null = null;

/**
 * Get or create the Anthropic client
 */
async function getClient(): Promise<Anthropic> {
  if (anthropicClient) return anthropicClient;

  const apiKey = await getAnthropicApiKey();
  anthropicClient = new Anthropic({ apiKey });

  return anthropicClient;
}

/**
 * Line item structure for quotes
 */
export interface QuoteLineItem {
  id: string;
  category: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  notes?: string;
}

/**
 * Quote generation request
 */
export interface GenerateQuoteRequest {
  eventDetails: {
    eventName: string;
    eventType: string;
    venueSize: string;
    venueName: string;
    dates: string;
    guestCount?: number;
    indoorOutdoor?: string;
  };
  equipment: {
    categories: string[];
    budgetRange?: string;
    specificRequests?: string;
  };
}

/**
 * Quote generation response
 */
export interface GenerateQuoteResponse {
  lineItems: QuoteLineItem[];
  totalAmount: number;
  summary: string;
  recommendations?: string[];
}

/**
 * Quote edit request
 */
export interface EditQuoteRequest {
  currentQuote: {
    lineItems: QuoteLineItem[];
    totalAmount: number;
  };
  command: string;
  quickAction?: string;
}

/**
 * Quote edit response
 */
export interface EditQuoteResponse {
  lineItems: QuoteLineItem[];
  totalAmount: number;
  changes: Array<{
    type: 'added' | 'removed' | 'modified';
    description: string;
    before?: QuoteLineItem;
    after?: QuoteLineItem;
  }>;
  explanation: string;
}

// System prompts for the AI
const QUOTE_GENERATION_SYSTEM_PROMPT = `You are an expert AV (Audio/Video) production quote generator. Your role is to create detailed, professional equipment quotes for events.

You have extensive knowledge of:
- Professional audio equipment (speakers, microphones, mixers, wireless systems)
- Video equipment (projectors, LED walls, cameras, switchers)
- Lighting equipment (moving heads, LED fixtures, conventional lights, control systems)
- Staging and rigging equipment
- Production infrastructure (power distribution, cabling, networking)

When generating quotes:
1. Be specific with equipment models and brands when appropriate
2. Include realistic quantities based on venue size and event type
3. Use industry-standard rental pricing
4. Group items by category (Audio, Video, Lighting, Staging, Rigging, Labor, Production)
5. Consider the client's budget range if provided
6. Include labor for setup, operation, and strike

Respond ONLY with valid JSON matching the requested format. Do not include any explanatory text outside the JSON.`;

const QUOTE_EDIT_SYSTEM_PROMPT = `You are an expert AV quote editor. You help modify existing quotes based on client requests.

Common modifications include:
- Adjusting quantities
- Swapping equipment for alternatives
- Adding or removing items
- Hitting a specific budget target
- Upgrading or downgrading equipment quality
- Simplifying or enhancing certain categories

When editing quotes:
1. Preserve the overall structure and format
2. Make targeted changes based on the request
3. Explain what you changed and why
4. Ensure the quote remains coherent and complete
5. Recalculate totals after changes

Respond ONLY with valid JSON matching the requested format. Do not include any explanatory text outside the JSON.`;

/**
 * Generate a quote using Claude
 */
export async function generateQuote(
  request: GenerateQuoteRequest
): Promise<GenerateQuoteResponse> {
  const client = await getClient();

  const userPrompt = `Generate a professional AV equipment quote for the following event:

Event Details:
- Event Name: ${request.eventDetails.eventName}
- Event Type: ${request.eventDetails.eventType}
- Venue: ${request.eventDetails.venueName} (${request.eventDetails.venueSize})
- Date: ${request.eventDetails.dates}
${request.eventDetails.guestCount ? `- Guest Count: ${request.eventDetails.guestCount}` : ''}
${request.eventDetails.indoorOutdoor ? `- Setting: ${request.eventDetails.indoorOutdoor}` : ''}

Equipment Requirements:
- Categories: ${request.equipment.categories.join(', ')}
${request.equipment.budgetRange ? `- Budget Range: ${request.equipment.budgetRange}` : ''}
${request.equipment.specificRequests ? `- Specific Requests: ${request.equipment.specificRequests}` : ''}

Respond with JSON in this exact format:
{
  "lineItems": [
    {
      "id": "unique-id",
      "category": "Audio|Video|Lighting|Staging|Rigging|Labor|Production",
      "description": "Item description with brand/model",
      "quantity": 1,
      "unitPrice": 100,
      "total": 100,
      "notes": "Optional notes"
    }
  ],
  "totalAmount": 0,
  "summary": "Brief summary of the quote",
  "recommendations": ["Optional recommendations for the client"]
}`;

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    system: QUOTE_GENERATION_SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userPrompt }],
  });

  // Extract the text response
  const textContent = response.content.find((c) => c.type === 'text');
  if (!textContent || textContent.type !== 'text') {
    throw new Error('No text response from Claude');
  }

  // Parse JSON from the response
  try {
    const result = JSON.parse(textContent.text) as GenerateQuoteResponse;

    // Recalculate totals to ensure accuracy
    result.lineItems = result.lineItems.map((item) => ({
      ...item,
      total: item.quantity * item.unitPrice,
    }));
    result.totalAmount = result.lineItems.reduce((sum, item) => sum + item.total, 0);

    return result;
  } catch (error) {
    console.error('Failed to parse Claude response:', textContent.text);
    throw new Error('Failed to parse quote response');
  }
}

/**
 * Edit an existing quote using Claude
 */
export async function editQuote(
  request: EditQuoteRequest
): Promise<EditQuoteResponse> {
  const client = await getClient();

  const userPrompt = `Edit the following quote based on the client's request:

Current Quote:
${JSON.stringify(request.currentQuote, null, 2)}

${request.quickAction ? `Quick Action: ${request.quickAction}` : ''}
Client Request: ${request.command}

Respond with JSON in this exact format:
{
  "lineItems": [/* Updated line items array */],
  "totalAmount": 0,
  "changes": [
    {
      "type": "added|removed|modified",
      "description": "What was changed",
      "before": {/* Previous item if modified/removed */},
      "after": {/* New item if added/modified */}
    }
  ],
  "explanation": "Brief explanation of the changes made"
}`;

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    system: QUOTE_EDIT_SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userPrompt }],
  });

  // Extract the text response
  const textContent = response.content.find((c) => c.type === 'text');
  if (!textContent || textContent.type !== 'text') {
    throw new Error('No text response from Claude');
  }

  // Parse JSON from the response
  try {
    const result = JSON.parse(textContent.text) as EditQuoteResponse;

    // Recalculate totals
    result.lineItems = result.lineItems.map((item) => ({
      ...item,
      total: item.quantity * item.unitPrice,
    }));
    result.totalAmount = result.lineItems.reduce((sum, item) => sum + item.total, 0);

    return result;
  } catch (error) {
    console.error('Failed to parse Claude response:', textContent.text);
    throw new Error('Failed to parse edit response');
  }
}

/**
 * Simple text completion for other AI features
 */
export async function complete(
  prompt: string,
  options: {
    system?: string;
    maxTokens?: number;
    temperature?: number;
  } = {}
): Promise<string> {
  const client = await getClient();

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: options.maxTokens || 1024,
    system: options.system,
    messages: [{ role: 'user', content: prompt }],
  });

  const textContent = response.content.find((c) => c.type === 'text');
  if (!textContent || textContent.type !== 'text') {
    throw new Error('No text response from Claude');
  }

  return textContent.text;
}

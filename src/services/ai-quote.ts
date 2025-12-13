import type { LineItem, LineItemCategory } from '../types';

// Input types for the AI quote generation
export interface EventDetails {
  eventName: string;
  eventType: string;
  venueSize: string;
  venueName: string;
  startDate: string;
  endDate: string;
  setupDays: number;
  strikeDays: number;
  notes?: string;
}

export interface EquipmentNeeds {
  categories: string[];
  budgetRange: string;
  specificRequests?: string;
}

// AI response types
export interface AIQuoteResponse {
  lineItems: LineItem[];
  totalAmount: number;
  summary: string;
  rawResponse?: string;
}

interface AILineItem {
  category: LineItemCategory;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface AIResponseData {
  lineItems: AILineItem[];
  totalAmount: number;
  summary: string;
}

interface N8NWebhookResponse {
  output: string;
}

/**
 * Check if the AI service is configured
 */
export function isAIConfigured(): boolean {
  const webhookUrl = import.meta.env.VITE_N8N_AI_WEBHOOK_URL;
  return typeof webhookUrl === 'string' && webhookUrl.length > 0;
}

/**
 * Extract JSON from AI response that may contain markdown or extra text
 */
function extractJSON(text: string): any {
  // Try to parse directly first
  try {
    return JSON.parse(text);
  } catch {
    // Look for JSON in markdown code blocks
    const codeBlockMatch = text.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
    if (codeBlockMatch) {
      return JSON.parse(codeBlockMatch[1]);
    }

    // Look for JSON object anywhere in the text
    const jsonMatch = text.match(/\{[\s\S]*"lineItems"[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    throw new Error('Could not extract JSON from AI response');
  }
}

/**
 * Validate that the AI response has the expected structure
 */
function validateAIResponse(data: any): data is AIResponseData {
  if (!data || typeof data !== 'object') return false;
  if (!Array.isArray(data.lineItems)) return false;
  if (typeof data.totalAmount !== 'number') return false;
  if (typeof data.summary !== 'string') return false;

  // Validate each line item
  for (const item of data.lineItems) {
    if (typeof item.category !== 'string') return false;
    if (typeof item.description !== 'string') return false;
    if (typeof item.quantity !== 'number') return false;
    if (typeof item.unitPrice !== 'number') return false;
    if (typeof item.total !== 'number') return false;
  }

  return true;
}

/**
 * Generate AI-powered quote using n8n webhook
 */
export async function generateAIQuote(
  eventDetails: EventDetails,
  equipment: EquipmentNeeds
): Promise<AIQuoteResponse> {
  const webhookUrl = import.meta.env.VITE_N8N_AI_WEBHOOK_URL;

  if (!webhookUrl) {
    throw new Error('AI service not configured. Please set VITE_N8N_AI_WEBHOOK_URL in .env');
  }

  // Build the prompt message
  const message = `Generate an AV equipment quote for:
Event: ${eventDetails.eventName}
Type: ${eventDetails.eventType}
Venue: ${eventDetails.venueName} (${eventDetails.venueSize})
Dates: ${eventDetails.startDate} to ${eventDetails.endDate}
Setup: ${eventDetails.setupDays} days, Strike: ${eventDetails.strikeDays} days
Categories needed: ${equipment.categories.join(', ')}
Budget: ${equipment.budgetRange}
Special requests: ${equipment.specificRequests || 'None'}
Notes: ${eventDetails.notes || 'None'}

Return a JSON object with this structure:
{
  "lineItems": [
    { "category": "audio|video|lighting|staging|rigging|cables|signal|decor|power|comms|labor|other", "description": "Item name", "quantity": number, "unitPrice": number, "total": number }
  ],
  "totalAmount": number,
  "summary": "Brief quote summary"
}`;

  try {
    // Call the n8n webhook
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    });

    if (!response.ok) {
      throw new Error(`n8n webhook returned ${response.status}: ${response.statusText}`);
    }

    const data: N8NWebhookResponse = await response.json();

    // Extract and parse the AI's response
    const aiData = extractJSON(data.output);

    // Validate the structure
    if (!validateAIResponse(aiData)) {
      throw new Error('AI response does not match expected format');
    }

    // Add IDs to line items (frontend will need these)
    const lineItems: LineItem[] = aiData.lineItems.map((item, index) => ({
      ...item,
      id: `ai-${Date.now()}-${index}`,
    }));

    return {
      lineItems,
      totalAmount: aiData.totalAmount,
      summary: aiData.summary,
      rawResponse: data.output,
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to generate AI quote: ${error.message}`);
    }
    throw new Error('Failed to generate AI quote: Unknown error');
  }
}

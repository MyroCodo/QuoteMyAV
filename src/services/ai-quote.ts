import type { LineItem, LineItemCategory } from '../types';
import { apiPost, isApiConfigured, apiGet } from './api-client';

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

// AI Job types
interface AIJob {
  jobId: string;
  type: string;
  status: 'processing' | 'completed' | 'failed';
  result?: AIResponseData;
  error?: { code: string; message: string };
  createdAt: string;
  completedAt?: string;
}

/**
 * Check if the AI service is configured
 */
export function isAIConfigured(): boolean {
  return isApiConfigured;
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
 * Poll for AI job completion
 */
async function pollAIJob(jobId: string, timeout = 60000, interval = 1000): Promise<AIJob> {
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    const response = await apiGet<AIJob>(`/v1/ai/jobs/${jobId}`);
    const job = response.data;

    if (!job) {
      throw new Error(`Job ${jobId} not found`);
    }

    if (job.status === 'completed') {
      return job;
    }

    if (job.status === 'failed') {
      throw new Error(job.error?.message || 'AI generation failed');
    }

    // Wait before polling again
    await new Promise((resolve) => setTimeout(resolve, interval));
  }

  throw new Error(`AI job ${jobId} timed out after ${timeout}ms`);
}

/**
 * Generate AI-powered quote using the API
 */
export async function generateAIQuote(
  eventDetails: EventDetails,
  equipment: EquipmentNeeds
): Promise<AIQuoteResponse> {
  if (!isApiConfigured) {
    throw new Error('API service not configured. Please set VITE_API_URL in .env');
  }

  try {
    // Start the AI generation job
    const startResponse = await apiPost<{ jobId: string; status: string }>('/v1/ai/generate', {
      eventDetails: {
        eventName: eventDetails.eventName,
        eventType: eventDetails.eventType,
        venueSize: eventDetails.venueSize,
        venueName: eventDetails.venueName,
        dates: `${eventDetails.startDate} to ${eventDetails.endDate}`,
      },
      equipment: {
        categories: equipment.categories,
        budgetRange: equipment.budgetRange,
        specificRequests: equipment.specificRequests,
      },
    });

    const jobId = startResponse.data?.jobId;
    if (!jobId) {
      throw new Error('Failed to start AI generation job');
    }

    // Poll for completion
    const job = await pollAIJob(jobId);

    // Extract the result
    const aiData = job.result;
    if (!aiData || !validateAIResponse(aiData)) {
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
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to generate AI quote: ${error.message}`);
    }
    throw new Error('Failed to generate AI quote: Unknown error');
  }
}

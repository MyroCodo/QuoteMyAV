import type { LineItem, LineItemCategory } from '../types';
import type { AIEditResult, AIChange } from '../stores/aiEditStore';
import { apiPost, apiGet, isApiConfigured } from './api-client';

// Quick action types
export type QuickAction =
  | 'hit_budget'
  | 'premium_version'
  | 'simplify_rigging'
  | 'add_recording'
  | 'add_streaming'
  | 'reduce_labor';

export interface QuickActionConfig {
  id: QuickAction;
  label: string;
  description: string;
  icon: string;
  prompt: string;
}

// Available quick actions
export const quickActions: QuickActionConfig[] = [
  {
    id: 'hit_budget',
    label: 'Hit Budget',
    description: 'Reduce costs to meet target budget',
    icon: '💰',
    prompt: 'Reduce the total quote cost by approximately 15-20% while maintaining essential equipment quality. Prioritize removing redundant items and downgrading to cost-effective alternatives.',
  },
  {
    id: 'premium_version',
    label: 'Premium',
    description: 'Upgrade to top-tier equipment',
    icon: '⭐',
    prompt: 'Upgrade all equipment to premium/top-tier versions. Replace standard items with flagship models and add professional-grade accessories.',
  },
  {
    id: 'simplify_rigging',
    label: 'Simplify Setup',
    description: 'Reduce rigging complexity and labor',
    icon: '🔧',
    prompt: 'Simplify the rigging and staging setup. Remove complex truss configurations, reduce motor counts, and minimize labor hours while maintaining safety.',
  },
  {
    id: 'add_recording',
    label: 'Add Recording',
    description: 'Add video recording package',
    icon: '🎬',
    prompt: 'Add a professional video recording package including cameras, recorders, media, and a recording technician.',
  },
  {
    id: 'add_streaming',
    label: 'Add Streaming',
    description: 'Add live streaming capability',
    icon: '📡',
    prompt: 'Add a professional live streaming package including encoder, streaming platform integration, graphics overlay capability, and streaming technician.',
  },
  {
    id: 'reduce_labor',
    label: 'Cut Labor',
    description: 'Minimize labor costs',
    icon: '👷',
    prompt: 'Reduce labor costs by optimizing crew size. Remove redundant positions, combine roles where possible, and reduce setup/strike time estimates.',
  },
];

// AI Edit request payload
export interface AIEditRequest {
  command: string;
  currentLineItems: LineItem[];
  eventContext?: {
    eventName: string;
    eventType: string;
    venue: string;
  };
  constraints?: {
    targetBudget?: number;
    preserveCategories?: LineItemCategory[];
    maxPercentageChange?: number;
  };
}

// AI response structure
interface AIEditResponseData {
  lineItems: Array<{
    id?: string;
    category: LineItemCategory;
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  changes: Array<{
    type: 'added' | 'removed' | 'modified';
    category: string;
    description: string;
    oldValue?: { quantity?: number; unitPrice?: number };
    newValue?: { quantity?: number; unitPrice?: number };
    priceDelta: number;
  }>;
  summary: string;
}

/**
 * Check if AI edit service is configured
 */
export function isAIEditConfigured(): boolean {
  return isApiConfigured;
}

/**
 * Extract JSON from AI response
 */
function extractJSON(text: string): AIEditResponseData {
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
 * Build the prompt for AI edit command
 */
function buildEditPrompt(request: AIEditRequest): string {
  const currentTotal = request.currentLineItems.reduce((sum, item) => sum + item.total, 0);

  const itemsList = request.currentLineItems
    .map((item) => `- ${item.category}: ${item.description} (${item.quantity} × $${item.unitPrice} = $${item.total})`)
    .join('\n');

  let prompt = `You are an AV equipment quote editor. Modify the following quote based on the user's request.

CURRENT QUOTE (Total: $${currentTotal.toLocaleString()}):
${itemsList}

USER REQUEST: ${request.command}

`;

  if (request.eventContext) {
    prompt += `EVENT CONTEXT:
- Event: ${request.eventContext.eventName}
- Type: ${request.eventContext.eventType}
- Venue: ${request.eventContext.venue}

`;
  }

  if (request.constraints?.targetBudget) {
    prompt += `TARGET BUDGET: $${request.constraints.targetBudget.toLocaleString()}\n`;
  }

  if (request.constraints?.preserveCategories?.length) {
    prompt += `DO NOT MODIFY these categories: ${request.constraints.preserveCategories.join(', ')}\n`;
  }

  prompt += `
RESPOND WITH JSON ONLY in this exact format:
{
  "lineItems": [
    { "id": "existing-id-or-new", "category": "audio|video|lighting|staging|rigging|cables|signal|decor|power|comms|labor|other", "description": "Item name", "quantity": 1, "unitPrice": 100, "total": 100 }
  ],
  "changes": [
    { "type": "added|removed|modified", "category": "category", "description": "What changed", "priceDelta": 100 }
  ],
  "summary": "Brief summary of changes made"
}

IMPORTANT:
- Keep existing item IDs when modifying items
- Generate new IDs for new items (format: "ai-edit-timestamp-index")
- Calculate total = quantity × unitPrice for each item
- List ALL items in lineItems (not just changed ones)
- priceDelta should be positive for cost increases, negative for savings`;

  return prompt;
}

// AI Job types for edit
interface AIEditJob {
  jobId: string;
  type: string;
  status: 'processing' | 'completed' | 'failed';
  result?: AIEditResponseData;
  error?: { code: string; message: string };
  createdAt: string;
  completedAt?: string;
}

/**
 * Poll for AI edit job completion
 */
async function pollAIEditJob(jobId: string, timeout = 60000, interval = 1000): Promise<AIEditJob> {
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    const response = await apiGet<AIEditJob>(`/v1/ai/jobs/${jobId}`);
    const job = response.data;

    if (!job) {
      throw new Error(`Job ${jobId} not found`);
    }

    if (job.status === 'completed') {
      return job;
    }

    if (job.status === 'failed') {
      throw new Error(job.error?.message || 'AI edit failed');
    }

    // Wait before polling again
    await new Promise((resolve) => setTimeout(resolve, interval));
  }

  throw new Error(`AI edit job ${jobId} timed out after ${timeout}ms`);
}

/**
 * Send edit command to AI and get modified quote
 */
export async function sendAIEditCommand(request: AIEditRequest): Promise<AIEditResult> {
  if (!isApiConfigured) {
    throw new Error('API not configured');
  }

  console.log('Sending AI edit command:', request.command);

  // Start the AI edit job
  const startResponse = await apiPost<{ jobId: string; status: string }>('/v1/ai/edit', {
    quoteId: (request as AIEditRequest & { quoteId?: string }).quoteId,
    command: request.command,
    quickAction: (request as AIEditRequest & { quickAction?: string }).quickAction,
    targetBudget: request.constraints?.targetBudget,
  });

  const jobId = startResponse.data?.jobId;
  if (!jobId) {
    throw new Error('Failed to start AI edit job');
  }

  // Poll for completion
  const job = await pollAIEditJob(jobId);
  const parsed = job.result;

  if (!parsed) {
    throw new Error('AI edit returned no result');
  }

  // Process and validate the response
  const modifiedLineItems: LineItem[] = parsed.lineItems.map((item, index) => ({
    id: item.id || `ai-edit-${Date.now()}-${index}`,
    category: item.category,
    description: item.description,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    total: item.quantity * item.unitPrice,
  }));

  const changes: AIChange[] = parsed.changes.map((change, index) => ({
    id: `change-${Date.now()}-${index}`,
    type: change.type,
    category: change.category,
    description: change.description,
    priceDelta: change.priceDelta,
    oldValue: change.oldValue,
    newValue: change.newValue,
  }));

  const oldTotal = request.currentLineItems.reduce((sum, item) => sum + item.total, 0);
  const newTotal = modifiedLineItems.reduce((sum, item) => sum + item.total, 0);
  const totalSavings = oldTotal - newTotal;
  const percentageChange = oldTotal > 0 ? ((newTotal - oldTotal) / oldTotal) * 100 : 0;

  return {
    modifiedLineItems,
    changes,
    summary: parsed.summary,
    totalSavings,
    percentageChange,
  };
}

/**
 * Execute a quick action
 */
export async function executeQuickAction(
  action: QuickAction,
  currentLineItems: LineItem[],
  eventContext?: AIEditRequest['eventContext'],
  targetBudget?: number
): Promise<AIEditResult> {
  const actionConfig = quickActions.find((a) => a.id === action);
  if (!actionConfig) {
    throw new Error(`Unknown quick action: ${action}`);
  }

  return sendAIEditCommand({
    command: actionConfig.prompt,
    currentLineItems,
    eventContext,
    constraints: {
      targetBudget,
    },
  });
}

/**
 * Calculate diff between two line item arrays (for local comparison)
 */
export function calculateDiff(
  oldItems: LineItem[],
  newItems: LineItem[]
): { added: LineItem[]; removed: LineItem[]; modified: Array<{ old: LineItem; new: LineItem }> } {
  const oldMap = new Map(oldItems.map((item) => [item.id, item]));
  const newMap = new Map(newItems.map((item) => [item.id, item]));

  const added: LineItem[] = [];
  const removed: LineItem[] = [];
  const modified: Array<{ old: LineItem; new: LineItem }> = [];

  // Find added and modified
  for (const newItem of newItems) {
    const oldItem = oldMap.get(newItem.id);
    if (!oldItem) {
      added.push(newItem);
    } else if (
      oldItem.quantity !== newItem.quantity ||
      oldItem.unitPrice !== newItem.unitPrice ||
      oldItem.description !== newItem.description
    ) {
      modified.push({ old: oldItem, new: newItem });
    }
  }

  // Find removed
  for (const oldItem of oldItems) {
    if (!newMap.has(oldItem.id)) {
      removed.push(oldItem);
    }
  }

  return { added, removed, modified };
}

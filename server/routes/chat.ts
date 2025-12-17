import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import Anthropic from '@anthropic-ai/sdk';
import { getAnthropicApiKey } from '../lib/secrets.js';
import { Errors } from '../lib/errors.js';
import type { Variables } from '../../api/index.js';

const router = new Hono<{ Variables: Variables }>();

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

// System prompt for QMAV Assistant
const SYSTEM_PROMPT = `You are QMAV Assistant, the AI helper for QuoteMyAV - a modern platform for creating professional AV (Audio/Video) equipment quotes.

## Your Role
You help users with:
- Questions about AV equipment (audio, video, lighting, staging, rigging)
- Quote creation and management
- Pricing guidance and budget planning
- Feature navigation and how-to questions
- Event planning advice for AV needs

## Knowledge Areas
- **Audio**: speakers, microphones, mixers, wireless systems, line arrays, monitors
- **Video**: projectors, LED walls, cameras, switchers, streaming equipment
- **Lighting**: moving heads, LED fixtures, conventional lights, DMX control
- **Staging**: platforms, risers, pipe and drape, scenic elements
- **Rigging**: truss, motors, chain hoists, safety equipment
- **Production**: power distribution, cabling, networking, labor

## Tone & Style
- Be helpful, friendly, and professional
- Keep responses concise (2-3 paragraphs max for most questions)
- Use simple language - avoid excessive technical jargon
- Guide users to relevant features when appropriate
- Be encouraging about their events and projects

## Platform Features You Can Help With
- Creating new quotes from event details
- Editing existing quotes with AI assistance
- Adding/removing equipment line items
- Adjusting budgets and pricing
- Exporting quotes as PDFs
- Managing quote versions
- Understanding subscription tiers

## Important Guidelines
1. Don't make up specific pricing - pricing varies by market and time
2. Encourage users to use the quote generation feature for detailed pricing
3. If you don't know something specific about the platform, be honest
4. Guide users to contact support for account-specific issues
5. Keep conversations focused on AV and the QuoteMyAV platform

## Context Awareness
You may receive context about:
- Current page (Dashboard, Quote Creation, etc.)
- User's subscription tier (free, starter, pro, enterprise)
- Quote ID if they're viewing/editing a specific quote
- Event type if relevant

Use this context to give more relevant, targeted help.`;

// Validation schema
const chatMessageSchema = z.object({
  message: z.string().min(1).max(2000),
  context: z.object({
    currentPage: z.string().optional(),
    subscriptionTier: z.enum(['free', 'starter', 'pro', 'enterprise']).optional(),
    quoteId: z.string().optional(),
    eventType: z.string().optional(),
  }).optional(),
  conversationHistory: z.array(
    z.object({
      role: z.enum(['user', 'assistant']),
      content: z.string(),
    })
  ).optional(),
});

// POST /v1/chat/message - Send a message and get AI response
router.post(
  '/message',
  zValidator('json', chatMessageSchema),
  async (c) => {
    // Note: userId and userTier available via c.get() if needed for future features
    const body = c.req.valid('json');

    // Get Anthropic client
    const client = await getClient();

    // Build context string if provided
    let contextString = '';
    if (body.context) {
      const parts: string[] = [];
      if (body.context.currentPage) {
        parts.push(`User is currently on: ${body.context.currentPage}`);
      }
      if (body.context.subscriptionTier) {
        parts.push(`User's subscription tier: ${body.context.subscriptionTier}`);
      }
      if (body.context.quoteId) {
        parts.push(`User is viewing quote: ${body.context.quoteId}`);
      }
      if (body.context.eventType) {
        parts.push(`Event type: ${body.context.eventType}`);
      }
      if (parts.length > 0) {
        contextString = `\n\nCurrent Context:\n${parts.join('\n')}`;
      }
    }

    // Build conversation messages
    const messages: Anthropic.MessageParam[] = [];

    // Add conversation history if provided (limit to last 10 messages for context)
    if (body.conversationHistory && body.conversationHistory.length > 0) {
      const recentHistory = body.conversationHistory.slice(-10);
      for (const msg of recentHistory) {
        messages.push({
          role: msg.role,
          content: msg.content,
        });
      }
    }

    // Add current message with context
    messages.push({
      role: 'user',
      content: body.message + contextString,
    });

    try {
      // Call Claude API
      const response = await client.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages,
      });

      // Extract the text response
      const textContent = response.content.find((c) => c.type === 'text');
      if (!textContent || textContent.type !== 'text') {
        throw Errors.aiGenerationFailed('No text response from Claude');
      }

      // Return response
      return c.json({
        data: {
          response: textContent.text,
        },
      });

    } catch (error) {
      console.error('[Chat] Claude API error:', error);

      // Handle specific errors
      if (error instanceof Anthropic.APIError) {
        if (error.status === 429) {
          throw Errors.aiRateLimited(Date.now() + 60000); // Try again in 1 minute
        }
        if (error.status === 401) {
          throw Errors.internal('AI service authentication failed');
        }
        throw Errors.aiGenerationFailed(error.message);
      }

      throw Errors.aiGenerationFailed('Failed to process chat message');
    }
  }
);

// GET /v1/chat/health - Check if chat service is available
router.get('/health', async (c) => {
  try {
    // Try to get the API key to verify configuration
    await getAnthropicApiKey();

    return c.json({
      data: {
        status: 'ok',
        service: 'chat',
        model: 'claude-sonnet-4-20250514',
      },
    });
  } catch (error) {
    console.error('[Chat] Health check failed:', error);

    return c.json({
      data: {
        status: 'error',
        service: 'chat',
        error: 'AI service not configured',
      },
    }, 503);
  }
});

export default router;

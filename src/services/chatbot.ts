import { apiFetch } from './api-client';

export interface ChatContext {
  currentPage?: string;
  subscriptionTier?: 'free' | 'starter' | 'pro' | 'enterprise';
  quoteId?: string;
  eventType?: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface SendChatMessageRequest {
  message: string;
  context?: ChatContext;
  conversationHistory?: ChatMessage[];
}

export interface SendChatMessageResponse {
  response: string;
  suggestions?: string[];
}

// Check if API is available
const isApiAvailable = Boolean(import.meta.env.VITE_API_URL);

/**
 * Demo mode responses based on keywords
 */
function getDemoResponse(message: string, context?: ChatContext): string {
  const lowerMessage = message.toLowerCase();

  // Simulate thinking delay
  const responses: { keywords: string[]; response: string }[] = [
    {
      keywords: ['hello', 'hi', 'hey', 'greetings'],
      response: "Hello! 👋 I'm QMAV Assistant, here to help you with AV quotes and equipment recommendations. How can I assist you today?",
    },
    {
      keywords: ['price', 'cost', 'pricing', 'expensive', 'cheap', 'budget'],
      response: "For pricing, it depends on the event size and equipment needs. Here's a general guide:\n\n• **Small events** (up to 50 people): $500-$2,000\n• **Medium events** (50-200 people): $2,000-$8,000\n• **Large events** (200+ people): $8,000+\n\nWould you like me to help you create a custom quote? Head to the Quote Builder to get started!",
    },
    {
      keywords: ['microphone', 'mic', 'audio', 'sound', 'speaker'],
      response: "Great question about audio! For events, I typically recommend:\n\n• **Wireless lavs** for speakers and presenters\n• **Handheld mics** for Q&A sessions\n• **Powered speakers** sized for your venue\n\nShure, Sennheiser, and Audio-Technica are excellent brands. Need specific recommendations for your event size?",
    },
    {
      keywords: ['projector', 'screen', 'display', 'video', 'visual'],
      response: "For video/display equipment, consider:\n\n• **Projectors**: 5,000+ lumens for large venues, 3,000 for smaller rooms\n• **LED walls**: Great for high-impact presentations\n• **Confidence monitors**: Help speakers see their slides\n\nThe right choice depends on room size, ambient light, and content type. What kind of event are you planning?",
    },
    {
      keywords: ['lighting', 'lights', 'uplighting', 'stage light'],
      response: "Lighting transforms any event! Here are the essentials:\n\n• **Uplighting**: Creates ambiance (8-16 fixtures for most venues)\n• **Stage wash**: Ensures presenters are well-lit\n• **Spotlights**: For awards, speakers, or special moments\n• **Intelligent lighting**: Moving heads for dynamic effects\n\nWant me to suggest a lighting package for your event?",
    },
    {
      keywords: ['wedding', 'reception', 'ceremony'],
      response: "Congratulations! 🎉 For weddings, I recommend:\n\n• **Ceremony**: Wireless mics for officiant, readers; small PA system\n• **Reception**: DJ setup or band PA, wireless mic for toasts\n• **Lighting**: Uplighting, pin spots for centerpieces, dance floor lighting\n• **Video**: Screen for slideshows, optional live streaming\n\nOur Quote Builder has wedding-specific packages!",
    },
    {
      keywords: ['corporate', 'conference', 'meeting', 'presentation'],
      response: "For corporate events, professionalism is key:\n\n• **Audio**: Wireless mics, clear sound reinforcement\n• **Video**: Projector/screens, confidence monitors\n• **Recording**: Capture presentations for later viewing\n• **Streaming**: Reach remote attendees\n\nHead to the Quote Builder and select 'Corporate' to see tailored packages!",
    },
    {
      keywords: ['help', 'how', 'what', 'can you'],
      response: "I can help you with:\n\n• **Equipment recommendations** for your event type\n• **Pricing guidance** and budgeting\n• **Quote creation** - just head to the Quote Builder\n• **Technical questions** about AV gear\n• **Best practices** for event production\n\nWhat would you like to know more about?",
    },
    {
      keywords: ['quote', 'estimate', 'builder'],
      response: `Perfect! To create a quote:\n\n1. Go to **Quote Builder** in the sidebar\n2. Select your event type\n3. Choose equipment categories\n4. Fill in event details\n5. Get your instant estimate!\n\n${context?.currentPage === 'Quote Builder' ? "I see you're already there - go ahead and fill out the form!" : 'Click "New Quote" in the sidebar to get started!'}`,
    },
    {
      keywords: ['plan', 'subscription', 'upgrade', 'pro', 'enterprise'],
      response: "Our subscription plans:\n\n• **Free**: 3 quotes/month - great for trying us out\n• **Starter** ($29/mo): 15 quotes, priority support\n• **Pro** ($79/mo): 50 quotes, API access, analytics\n• **Enterprise** ($199/mo): Unlimited quotes, dedicated support\n\nVisit Settings to upgrade your plan anytime!",
    },
  ];

  // Find matching response
  for (const item of responses) {
    if (item.keywords.some(keyword => lowerMessage.includes(keyword))) {
      return item.response;
    }
  }

  // Default response
  return "Thanks for your question! As QMAV Assistant, I'm here to help with:\n\n• AV equipment recommendations\n• Pricing and budgeting\n• Quote creation guidance\n• Technical setup advice\n\nCould you tell me more about what you're looking for? What type of event are you planning?";
}

/**
 * Send a chat message to the AI assistant
 * @param message - User's message
 * @param context - Optional context about the user's current state
 * @param conversationHistory - Optional conversation history for context
 * @returns Promise with the AI's response
 */
export async function sendChatMessage(
  message: string,
  context?: ChatContext,
  conversationHistory?: ChatMessage[]
): Promise<string> {
  // Demo mode: return mock responses
  if (!isApiAvailable) {
    // Simulate network delay for realistic feel
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 700));
    return getDemoResponse(message, context);
  }

  try {
    const response = await apiFetch<SendChatMessageResponse>('/v1/chat/message', {
      method: 'POST',
      body: JSON.stringify({
        message,
        context,
        conversationHistory: conversationHistory || [],
      }),
    });

    if (response.error) {
      throw new Error(response.error.message || 'Failed to get chat response');
    }

    return response.data?.response || 'I apologize, but I encountered an error. Please try again.';
  } catch (error) {
    console.error('[Chatbot] Error sending message:', error);

    // User-friendly error messages
    if (error instanceof Error) {
      if (error.message.includes('network') || error.message.includes('fetch')) {
        return "I'm having trouble connecting right now. Please check your internet connection and try again.";
      }
      if (error.message.includes('rate limit')) {
        return "You've sent a lot of messages recently. Please wait a moment before sending another message.";
      }
      if (error.message.includes('authentication') || error.message.includes('unauthorized')) {
        return "I'm having trouble verifying your account. Please try signing in again.";
      }
    }

    return "I apologize, but I'm having trouble processing your request right now. Please try again in a moment.";
  }
}

/**
 * Send a chat message with retry logic
 * @param message - User's message
 * @param context - Optional context
 * @param conversationHistory - Optional conversation history
 * @param maxRetries - Maximum number of retry attempts (default: 2)
 * @returns Promise with the AI's response
 */
export async function sendChatMessageWithRetry(
  message: string,
  context?: ChatContext,
  conversationHistory?: ChatMessage[],
  maxRetries: number = 2
): Promise<string> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await sendChatMessage(message, context, conversationHistory);
    } catch (error) {
      lastError = error as Error;

      // Don't retry on auth errors
      if (error instanceof Error && error.message.includes('authentication')) {
        throw error;
      }

      // Wait before retrying (exponential backoff)
      if (attempt < maxRetries) {
        const waitTime = Math.pow(2, attempt) * 1000; // 1s, 2s, 4s
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }

  // All retries failed
  console.error('[Chatbot] All retry attempts failed:', lastError);
  return "I'm experiencing technical difficulties. Please try again later.";
}

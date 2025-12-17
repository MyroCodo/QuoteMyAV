# ChatWidget Component

AI-powered chat assistant for QuoteMyAV application.

## Overview

The ChatWidget provides an interactive AI assistant that's available globally throughout the application. It features a modern, animated interface that matches the QMAV dark theme with teal accents.

## Components

### Main Components

1. **ChatWidget** - Main container that manages the open/closed state
   - Location: `src/components/ChatWidget/ChatWidget.tsx`
   - Fixed position: bottom-right corner
   - z-index: 50 (above most content)

2. **ChatBubble** - Floating action button (collapsed state)
   - Size: 56x56px circular button
   - Teal gradient background with shadow
   - Hover effects: scale and shadow enhancement
   - Icon: MessageCircle from lucide-react

3. **ChatWindow** - Expanded chat interface
   - Desktop: 350px wide × 500px tall
   - Mobile: Full screen × 600px tall
   - Header with "QMAV Assistant" branding
   - Scrollable message area
   - Input field with send button

4. **ChatMessage** - Individual message bubble
   - Props: `message` (ChatMessage object)
   - User messages: right-aligned, teal gradient
   - Assistant messages: left-aligned, slate background
   - Timestamp display
   - Avatar icons (User/Bot)

5. **TypingIndicator** - Loading animation
   - Three bouncing dots
   - CSS-based animation (1.4s cycle)
   - Shows when `isLoading` is true

## State Management

### Zustand Store (`src/stores/chatStore.ts`)

```typescript
interface ChatStore {
  isOpen: boolean;           // Chat window open/closed state
  messages: ChatMessage[];   // Array of all messages
  isLoading: boolean;        // Assistant typing indicator
  toggleOpen: () => void;    // Toggle chat window
  setOpen: (open: boolean) => void;
  addMessage: (role, content) => void;  // Add new message
  setLoading: (loading: boolean) => void;
  clearMessages: () => void; // Clear chat history
}
```

### LocalStorage Persistence

Messages are automatically persisted to localStorage using Zustand's persist middleware:
- Key: `qmav-chat-storage`
- Only messages are persisted (not UI state)
- Automatic rehydration on page load

## Usage

### Basic Integration

Already integrated in `src/App.tsx`:

```typescript
import { ChatWidget } from './components/ChatWidget';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* All your routes */}
      </Routes>

      <ChatWidget />  {/* Available on all pages */}
    </BrowserRouter>
  );
}
```

### Using the Chat Store

```typescript
import { useChatStore } from './stores/chatStore';

function MyComponent() {
  const { addMessage, setLoading } = useChatStore();

  const handleSendMessage = async (userMessage: string) => {
    // Add user message
    addMessage('user', userMessage);

    // Show typing indicator
    setLoading(true);

    // Call your AI API
    const response = await callAIAPI(userMessage);

    // Add AI response
    addMessage('assistant', response);
    setLoading(false);
  };
}
```

## Styling

### Theme Colors

- **Background:** `slate-800`, `slate-900`
- **Text:** `white`, `slate-300`, `slate-400`
- **Accents:** `teal-500`, `teal-600`
- **Borders:** `slate-700`, `slate-600`

### Custom CSS Classes

Added to `src/index.css`:

```css
.animate-typing-bounce  /* Bouncing dots */
.animate-fade-in        /* Message fade-in */
.animate-scale-in       /* Chat window/bubble scale-in */
.custom-scrollbar       /* Styled scrollbar */
```

## Features

### Current Features

- ✅ Floating action button (collapsed state)
- ✅ Expandable chat window
- ✅ Message history with user/assistant distinction
- ✅ Typing indicator animation
- ✅ LocalStorage persistence
- ✅ Responsive design (mobile/desktop)
- ✅ Dark theme matching QMAV design
- ✅ Smooth animations and transitions
- ✅ Auto-scroll to latest message
- ✅ Keyboard support (Enter to send)
- ✅ Claude API backend integration
- ✅ Context-aware responses (knows current page, subscription tier)
- ✅ Demo mode with intelligent mock responses
- ✅ Retry logic with exponential backoff

### Demo Mode

When running without `VITE_API_URL` set, the chatbot operates in demo mode:
- Keyword-based intelligent responses
- Covers 10+ topic areas (pricing, equipment, weddings, corporate, etc.)
- Simulated typing delay (800-1500ms)
- No API calls made

### Planned Enhancements

- 🔄 Streaming responses (real-time token display)
- 🔄 Quick action buttons (e.g., "Create Quote", "View Pricing")
- 🔄 Markdown rendering in messages
- 🔄 File attachment support
- 🔄 Voice input option
- 🔄 Notification badge for new messages
- 🔄 Export chat transcript
- 🔄 Database persistence for conversation history

## AI Integration (Complete) ✅

The chat is now connected to the Claude API backend:

### Backend Endpoint (`server/routes/chat.ts`)
- **POST `/v1/chat/message`** - Send message to Claude
- Uses `claude-sonnet-4-20250514` model
- Max tokens: 1024 for fast responses
- Context-aware system prompt for AV expertise
- Conversation history support (last 10 messages)

### Frontend Service (`src/services/chatbot.ts`)
- `sendChatMessage()` - Core API call function
- `sendChatMessageWithRetry()` - With exponential backoff (1s, 2s, 4s)
- Automatic demo mode detection (no `VITE_API_URL`)
- User-friendly error messages

### System Prompt Context
The AI assistant knows about:
- AV equipment categories (audio, video, lighting, staging, rigging)
- Subscription tiers and pricing
- Quote creation workflow
- Platform features and navigation

## Mobile Responsiveness

- **Desktop (md+):** 350px wide, bottom-right corner
- **Mobile (<md):** Full width, 600px tall
- Touch-friendly button sizes (56px FAB)
- Swipe gestures support (via native scrolling)

## Accessibility

- **ARIA labels:** Buttons have descriptive labels
- **Keyboard navigation:** Enter to send, Escape to close (can be added)
- **Focus management:** Auto-focus on input when opened
- **Color contrast:** WCAG AA compliant

## Performance

- **Lazy rendering:** Only renders when open
- **Virtual scrolling:** Can be added for 1000+ messages
- **Optimized animations:** CSS-based (GPU accelerated)
- **Small bundle size:** ~10KB gzipped (excluding AI SDK)

## Testing

### Manual Testing Checklist

- [ ] Click chat bubble to open
- [ ] Click X to close
- [ ] Send messages with Enter key
- [ ] Send messages with Send button
- [ ] Verify messages persist on refresh
- [ ] Test on mobile viewport
- [ ] Test typing indicator animation
- [ ] Verify scrolling with many messages
- [ ] Check theme consistency across pages

## Files Created

```
src/
├── components/
│   └── ChatWidget/
│       ├── ChatWidget.tsx       # Main container
│       ├── ChatBubble.tsx       # FAB button
│       ├── ChatWindow.tsx       # Expanded interface
│       ├── ChatMessage.tsx      # Message bubble
│       ├── TypingIndicator.tsx  # Loading animation
│       └── index.ts             # Barrel export
├── stores/
│   └── chatStore.ts             # Zustand store
└── index.css                    # Updated with animations

docs/
└── ChatWidget-README.md         # This file
```

## Support

For questions or issues with the ChatWidget:
1. Check this documentation
2. Review the component source code
3. Test with the dev server: `npm run dev`
4. Check browser console for errors

---

**Built with:** React 19, TypeScript, TailwindCSS v4, Zustand, Lucide React, Anthropic Claude API
**Status:** ✅ Complete - AI backend integrated, demo mode available

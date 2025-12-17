import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { X, Send, Sparkles } from 'lucide-react';
import { useChatStore } from '../../stores/chatStore';
import { ChatMessage } from './ChatMessage';
import { TypingIndicator } from './TypingIndicator';
import { Button } from '../ui/Button';
import { sendChatMessageWithRetry } from '../../services/chatbot';
import type { ChatContext } from '../../services/chatbot';

export function ChatWindow() {
  const { messages, isLoading, setOpen, addMessage, setLoading } = useChatStore();
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const location = useLocation();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSend = async () => {
    const trimmedValue = inputValue.trim();
    if (!trimmedValue || isLoading) return;

    // Add user message
    addMessage('user', trimmedValue);
    setInputValue('');
    setLoading(true);

    try {
      // Build context from current page and location
      const context: ChatContext = {
        currentPage: getCurrentPageName(),
      };

      // Get conversation history for context (last 10 messages)
      const conversationHistory = messages.slice(-10).map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      // Call the chatbot API
      const response = await sendChatMessageWithRetry(
        trimmedValue,
        context,
        conversationHistory
      );

      // Add AI response
      addMessage('assistant', response);
    } catch (error) {
      console.error('[ChatWindow] Error sending message:', error);
      addMessage(
        'assistant',
        "I apologize, but I'm having trouble right now. Please try again in a moment."
      );
    } finally {
      setLoading(false);
    }
  };

  // Helper to get current page name from location
  const getCurrentPageName = (): string => {
    const path = location.pathname;
    if (path === '/' || path === '/landing') return 'Landing Page';
    if (path === '/dashboard') return 'Dashboard';
    if (path === '/quotes/new') return 'Create Quote';
    if (path.startsWith('/quotes/')) return 'Quote Details';
    if (path === '/settings') return 'Settings';
    if (path === '/billing') return 'Billing';
    return 'QuoteMyAV';
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="w-full md:w-[350px] h-[600px] md:h-[500px] bg-slate-800 border border-slate-700 rounded-xl shadow-2xl flex flex-col animate-scale-in overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-slate-800 to-slate-800/90 border-b border-slate-700 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-teal-500 to-teal-600 flex items-center justify-center shadow-lg shadow-teal-500/20">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">QMAV Assistant</h3>
            <p className="text-[10px] text-slate-400">AI-powered support</p>
          </div>
        </div>
        <button
          onClick={() => setOpen(false)}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-700/50 transition-colors"
          aria-label="Close chat"
        >
          <X className="w-5 h-5 text-slate-400 hover:text-white transition-colors" />
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 bg-slate-900/50 custom-scrollbar">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-teal-500/20 to-teal-600/20 border border-teal-500/30 flex items-center justify-center mb-4">
              <Sparkles className="w-8 h-8 text-teal-400" />
            </div>
            <h4 className="text-sm font-semibold text-white mb-2">
              Welcome to QMAV Assistant
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Ask me anything about AV quotes, equipment recommendations, or pricing.
            </p>
          </div>
        )}

        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}

        {isLoading && <TypingIndicator />}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="px-4 py-3 bg-slate-800 border-t border-slate-700">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="
              flex-1 px-4 py-2.5
              bg-slate-700
              border border-slate-600
              rounded-lg
              text-sm text-white
              placeholder:text-slate-400
              focus:outline-none
              focus:ring-2
              focus:ring-teal-500/50
              focus:border-teal-500/50
              transition-all
            "
            disabled={isLoading}
          />
          <Button
            onClick={handleSend}
            disabled={!inputValue.trim() || isLoading}
            variant="primary"
            size="md"
            className="!px-4"
            aria-label="Send message"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

import { Bot, User } from 'lucide-react';
import type { ChatMessage as ChatMessageType } from '../../stores/chatStore';

interface ChatMessageProps {
  message: ChatMessageType;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';

  return (
    <div
      className={`flex gap-3 mb-4 animate-fade-in ${
        isUser ? 'flex-row-reverse' : 'flex-row'
      }`}
    >
      {/* Avatar */}
      <div
        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          isUser
            ? 'bg-teal-500/20 border border-teal-500/50'
            : 'bg-slate-700 border border-slate-600'
        }`}
      >
        {isUser ? (
          <User className="w-4 h-4 text-teal-400" />
        ) : (
          <Bot className="w-4 h-4 text-slate-300" />
        )}
      </div>

      {/* Message Bubble */}
      <div
        className={`flex-1 max-w-[75%] ${
          isUser ? 'flex justify-end' : 'flex justify-start'
        }`}
      >
        <div
          className={`px-4 py-2.5 rounded-2xl ${
            isUser
              ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-tr-sm'
              : 'bg-slate-700 text-slate-100 rounded-tl-sm border border-slate-600/50'
          }`}
        >
          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
            {message.content}
          </p>
          <p
            className={`text-[10px] mt-1.5 ${
              isUser ? 'text-teal-100/70' : 'text-slate-400'
            }`}
          >
            {new Date(message.timestamp).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>
      </div>
    </div>
  );
}

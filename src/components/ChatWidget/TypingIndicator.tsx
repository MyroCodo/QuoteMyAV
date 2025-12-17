import { Bot } from 'lucide-react';

export function TypingIndicator() {
  return (
    <div className="flex gap-3 mb-4">
      {/* Avatar */}
      <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-slate-700 border border-slate-600">
        <Bot className="w-4 h-4 text-slate-300" />
      </div>

      {/* Typing Bubble */}
      <div className="flex-1 flex justify-start">
        <div className="px-5 py-3 rounded-2xl rounded-tl-sm bg-slate-700 border border-slate-600/50">
          <div className="flex gap-1.5">
            <span className="dot w-2 h-2 bg-slate-400 rounded-full animate-typing-bounce [animation-delay:0ms]" />
            <span className="dot w-2 h-2 bg-slate-400 rounded-full animate-typing-bounce [animation-delay:150ms]" />
            <span className="dot w-2 h-2 bg-slate-400 rounded-full animate-typing-bounce [animation-delay:300ms]" />
          </div>
        </div>
      </div>
    </div>
  );
}

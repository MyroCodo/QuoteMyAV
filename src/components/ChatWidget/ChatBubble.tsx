import { MessageCircle } from 'lucide-react';
import { useChatStore } from '../../stores/chatStore';

export function ChatBubble() {
  const toggleOpen = useChatStore((state) => state.toggleOpen);

  return (
    <button
      onClick={toggleOpen}
      className="
        w-14 h-14 rounded-full
        bg-gradient-to-r from-teal-500 to-teal-600
        shadow-xl shadow-teal-500/30
        flex items-center justify-center
        hover:shadow-2xl hover:shadow-teal-500/40
        hover:scale-110
        active:scale-95
        transition-all duration-200
        group
        animate-scale-in
      "
      aria-label="Open chat"
    >
      <MessageCircle className="w-6 h-6 text-white group-hover:scale-110 transition-transform duration-200" />
    </button>
  );
}

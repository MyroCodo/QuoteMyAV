import { useChatStore } from '../../stores/chatStore';
import { ChatBubble } from './ChatBubble';
import { ChatWindow } from './ChatWindow';

export function ChatWidget() {
  const isOpen = useChatStore((state) => state.isOpen);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen ? <ChatWindow /> : <ChatBubble />}
    </div>
  );
}

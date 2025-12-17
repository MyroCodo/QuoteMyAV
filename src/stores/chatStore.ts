import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { nanoid } from 'nanoid';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatStore {
  isOpen: boolean;
  messages: ChatMessage[];
  isLoading: boolean;
  toggleOpen: () => void;
  setOpen: (open: boolean) => void;
  addMessage: (role: 'user' | 'assistant', content: string) => void;
  setLoading: (loading: boolean) => void;
  clearMessages: () => void;
}

export const useChatStore = create<ChatStore>()(
  persist(
    (set) => ({
      isOpen: false,
      messages: [],
      isLoading: false,

      toggleOpen: () => set((state) => ({ isOpen: !state.isOpen })),

      setOpen: (open: boolean) => set({ isOpen: open }),

      addMessage: (role: 'user' | 'assistant', content: string) =>
        set((state) => ({
          messages: [
            ...state.messages,
            {
              id: nanoid(),
              role,
              content,
              timestamp: new Date(),
            },
          ],
        })),

      setLoading: (loading: boolean) => set({ isLoading: loading }),

      clearMessages: () => set({ messages: [] }),
    }),
    {
      name: 'qmav-chat-storage',
      partialize: (state) => ({
        messages: state.messages,
      }),
    }
  )
);

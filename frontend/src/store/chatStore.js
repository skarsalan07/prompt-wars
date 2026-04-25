import { create } from 'zustand'

export const useChatStore = create((set, get) => ({
  messages: [],         // { id, role, content, timestamp }
  isLoading: false,
  topicContext: null,

  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, { id: Date.now(), timestamp: new Date(), ...message }],
    })),

  setLoading: (isLoading) => set({ isLoading }),

  setTopicContext: (topicContext) => set({ topicContext }),

  clearMessages: () => set({ messages: [] }),

  loadHistory: (history) =>
    set({
      messages: history.map((m, i) => ({
        id: i,
        role: m.role,
        content: m.content,
        timestamp: m.timestamp ? new Date(m.timestamp) : new Date(),
      })),
    }),
}))

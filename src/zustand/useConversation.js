// zustand/useConversation.js
import { create } from "zustand";

const useConversation = create((set) => ({
  selectedUser: null,
  setSelectedUser: (user) => set({ selectedUser: user }),

  messages: [],
  setMessages: (msgs) => set({ messages: msgs }),
}));

export default useConversation;

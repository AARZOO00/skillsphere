import { createSlice } from '@reduxjs/toolkit';

const chatSlice = createSlice({
  name: 'chat',
  initialState: { conversations: [], activeConversation: null, messages: [], typing: {}, onlineUsers: [] },
  reducers: {
    setConversations:    (s, { payload }) => { s.conversations = payload; },
    setActiveConversation:(s, { payload }) => { s.activeConversation = payload; },
    setMessages:         (s, { payload }) => { s.messages = payload; },
    addMessage:          (s, { payload }) => { s.messages.push(payload); },
    setTyping:           (s, { payload }) => { s.typing[payload.userId] = payload.isTyping; },
    updateLastMessage:   (s, { payload }) => {
      const c = s.conversations.find(c => c._id === payload.conversationId);
      if (c) c.lastMessage = payload.message;
    },
    setUserOnline:       (s, { payload }) => { if (!s.onlineUsers.includes(payload)) s.onlineUsers.push(payload); },
    setUserOffline:      (s, { payload }) => { s.onlineUsers = s.onlineUsers.filter(id => id !== payload); }
  }
});

export const { setConversations, setActiveConversation, setMessages, addMessage, setTyping, updateLastMessage, setUserOnline, setUserOffline } = chatSlice.actions;
export default chatSlice.reducer;

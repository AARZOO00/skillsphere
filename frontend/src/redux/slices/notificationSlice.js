import { createSlice } from '@reduxjs/toolkit';

const notifSlice = createSlice({
  name: 'notifications',
  initialState: { notifications: [], unreadCount: 0 },
  reducers: {
    setNotifications: (s, { payload }) => {
      s.notifications = payload.notifications;
      s.unreadCount   = payload.unreadCount || payload.notifications.filter(n => !n.isRead).length;
    },
    addNotification: (s, { payload }) => { s.notifications.unshift(payload); s.unreadCount++; },
    markAllRead:     (s) => { s.notifications = s.notifications.map(n => ({ ...n, isRead: true })); s.unreadCount = 0; }
  }
});

export const { setNotifications, addNotification, markAllRead } = notifSlice.actions;
export default notifSlice.reducer;

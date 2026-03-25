import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useDispatch, useSelector } from 'react-redux';
import { addMessage, setTyping, updateLastMessage, setUserOnline, setUserOffline } from '../redux/slices/chatSlice';
import { addNotification } from '../redux/slices/notificationSlice';
import toast from 'react-hot-toast';

let socketInstance = null;

export const useSocket = () => {
  const { token, user } = useSelector(s => s.auth);
  const dispatch = useDispatch();
  const initialized = useRef(false);

  useEffect(() => {
    if (!token || !user || initialized.current) return;
    initialized.current = true;

    socketInstance = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000', {
      auth: { token }, transports: ['websocket'], reconnection: true
    });

    socketInstance.on('connect', () => console.log('Socket connected'));
    socketInstance.on('connect_error', e => console.log('Socket error:', e.message));

    socketInstance.on('new_message', msg => {
      dispatch(addMessage(msg));
      dispatch(updateLastMessage({ conversationId: msg.conversation, message: msg }));
    });
    socketInstance.on('user_typing',      ({ userId, name }) => dispatch(setTyping({ userId, isTyping: true })));
    socketInstance.on('user_stop_typing', ({ userId }) => dispatch(setTyping({ userId, isTyping: false })));
    socketInstance.on('user_online',      ({ userId }) => dispatch(setUserOnline(userId)));
    socketInstance.on('user_offline',     ({ userId }) => dispatch(setUserOffline(userId)));
    socketInstance.on('notification',     data => {
      dispatch(addNotification(data));
      toast(data.title || 'New notification', { icon: '🔔', style: { background: '#0d0d1a', color: '#e2e2f0', border: '1px solid rgba(0,212,255,0.2)' } });
    });

    return () => {
      socketInstance?.disconnect();
      socketInstance = null;
      initialized.current = false;
    };
  }, [token, user]);
};

export const getSocket = () => socketInstance;

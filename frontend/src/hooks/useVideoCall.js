// src/hooks/useVideoCall.js
// Custom hook — start a video call from anywhere in the app

import { useNavigate } from 'react-router-dom';
import { useSelector }  from 'react-redux';
import toast            from 'react-hot-toast';
import api              from '../utils/api';

/**
 * Usage:
 *   const { startCall } = useVideoCall();
 *   <button onClick={() => startCall(otherUserId, conversationId)}>📹 Video Call</button>
 */
const useVideoCall = () => {
  const navigate     = useNavigate();
  const { user }     = useSelector(s => s.auth || {});

  const startCall = async (targetUserId, conversationId) => {
    if (!user) { toast.error('Sign in to make video calls'); return; }

    // Generate a unique room ID (or reuse conversation ID)
    const roomId = conversationId
      ? `conv-${conversationId}`
      : `room-${Date.now()}-${Math.random().toString(36).slice(2,8)}`;

    // Notify the other user via API (sends a chat message with call link)
    if (targetUserId && conversationId) {
      try {
        const callUrl = `${window.location.origin}/video-call/${roomId}`;
        await api.post(`/chat/${conversationId}`, {
          content: `📹 I started a video call. Join here: ${callUrl}`,
        });
      } catch {
        // Non-blocking — call still works
      }
    }

    // Navigate to video call page
    navigate(`/video-call/${roomId}?name=${encodeURIComponent(user.name || 'You')}`);
  };

  const joinCall = (roomId) => {
    if (!roomId) { toast.error('Invalid room ID'); return; }
    navigate(`/video-call/${roomId}?name=${encodeURIComponent(user?.name || 'Guest')}`);
  };

  return { startCall, joinCall };
};

export default useVideoCall;
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';

// ─────────────────────────────────────────────────────────────
// Pure WebRTC — NO external peer library needed
// Uses browser's built-in RTCPeerConnection directly
// ─────────────────────────────────────────────────────────────

const SOCKET_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};

const VideoCall = () => {
  const { roomId }     = useParams();
  const [params]       = useSearchParams();
  const navigate       = useNavigate();
  const { user }       = useSelector(s => s.auth || {});
  const myName         = user?.name || params.get('name') || 'You';

  const socketRef      = useRef(null);
  const pcRef          = useRef(null);
  const myVideoRef     = useRef(null);
  const remoteVideoRef = useRef(null);
  const streamRef      = useRef(null);
  const chatEndRef     = useRef(null);
  const timerRef       = useRef(null);

  const [callStatus,   setCallStatus]   = useState('connecting');
  const [micOn,        setMicOn]        = useState(true);
  const [camOn,        setCamOn]        = useState(true);
  const [chatOpen,     setChatOpen]     = useState(false);
  const [messages,     setMessages]     = useState([]);
  const [chatInput,    setChatInput]    = useState('');
  const [remoteName,   setRemoteName]   = useState('Waiting…');
  const [remoteStream, setRemoteStream] = useState(false);
  const [duration,     setDuration]     = useState(0);
  const [connQuality,  setConnQuality]  = useState('good');
  const [participants, setParticipants] = useState(1);
  const [peerId,       setPeerId]       = useState(null);

  useEffect(() => {
    startCall();
    return cleanup;
  }, [roomId]);

  useEffect(() => {
    if (callStatus === 'inCall') {
      timerRef.current = setInterval(() => setDuration(d => d + 1), 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [callStatus]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ── Start call ──────────────────────────────────────────────
  const startCall = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      if (myVideoRef.current) myVideoRef.current.srcObject = stream;

      const socket = io(SOCKET_URL, {
        auth: { token: localStorage.getItem('token') },
        transports: ['websocket', 'polling'],
      });
      socketRef.current = socket;

      socket.on('connect', () => {
        socket.emit('join-room', { roomId, userId: user?._id, name: myName });
      });

      socket.on('connect_error', () => {
        setCallStatus('ringing');
      });

      // We joined — existing peers are already there
      socket.on('room-joined', ({ existingPeers }) => {
        if (existingPeers?.length > 0) {
          const target = existingPeers[0];
          setPeerId(target);
          setRemoteName('Connecting…');
          initPeerConnection(stream, socket, target, true);
        } else {
          setCallStatus('ringing');
        }
      });

      // New peer joined us
      socket.on('user-joined', ({ userId: uid, name }) => {
        setRemoteName(name || 'Peer');
        setParticipants(2);
        setPeerId(uid);
        initPeerConnection(stream, socket, uid, false);
      });

      // Receive ICE/SDP signal
      socket.on('signal', async ({ signal, from, name }) => {
        if (name) setRemoteName(name);
        const pc = pcRef.current;
        if (!pc) return;
        try {
          if (signal.type === 'offer') {
            await pc.setRemoteDescription(new RTCSessionDescription(signal));
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            socket.emit('signal', { signal: answer, to: from, from: socket.id, name: myName });
          } else if (signal.type === 'answer') {
            await pc.setRemoteDescription(new RTCSessionDescription(signal));
          } else if (signal.candidate) {
            await pc.addIceCandidate(new RTCIceCandidate(signal));
          }
        } catch (e) {
          console.warn('Signal error:', e.message);
        }
      });

      socket.on('user-left', ({ name }) => {
        toast(`${name || 'Peer'} left the call`, { icon: '👋' });
        setCallStatus('ended');
        setRemoteStream(false);
        setTimeout(() => navigate(-1), 3000);
      });

      socket.on('chat-message', ({ text, name: senderName }) => {
        setMessages(m => [...m, { text, name: senderName, mine: false, time: new Date() }]);
      });

    } catch (err) {
      if (err.name === 'NotAllowedError') {
        toast.error('Camera/mic permission denied');
      } else {
        toast.error('Failed to start: ' + err.message);
      }
      setCallStatus('ended');
    }
  };

  // ── Init RTCPeerConnection ───────────────────────────────────
  const initPeerConnection = async (stream, socket, targetId, isInitiator) => {
    const pc = new RTCPeerConnection(ICE_SERVERS);
    pcRef.current = pc;

    // Add local tracks
    stream.getTracks().forEach(track => pc.addTrack(track, stream));

    // ICE candidates → send to peer
    pc.onicecandidate = ({ candidate }) => {
      if (candidate) {
        socket.emit('signal', { signal: candidate, to: targetId, from: socket.id, name: myName });
      }
    };

    pc.oniceconnectionstatechange = () => {
      const s = pc.iceConnectionState;
      if (s === 'connected' || s === 'completed') {
        setCallStatus('inCall');
        setConnQuality('good');
      } else if (s === 'failed') {
        setConnQuality('poor');
        toast.error('Connection failed. Try again.');
      }
    };

    // Remote stream arrives
    pc.ontrack = ({ streams }) => {
      if (streams?.[0] && remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = streams[0];
        setRemoteStream(true);
        setCallStatus('inCall');
        setParticipants(2);
      }
    };

    // If initiator → create & send offer
    if (isInitiator) {
      try {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit('signal', { signal: offer, to: targetId, from: socket.id, name: myName });
      } catch (e) {
        console.error('Offer error:', e);
      }
    }
  };

  // ── Cleanup ──────────────────────────────────────────────────
  const cleanup = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    pcRef.current?.close();
    socketRef.current?.disconnect();
    clearInterval(timerRef.current);
  };

  // ── Controls ─────────────────────────────────────────────────
  const toggleMic = useCallback(() => {
    const track = streamRef.current?.getAudioTracks()[0];
    if (track) { track.enabled = !track.enabled; setMicOn(p => !p); }
  }, []);

  const toggleCam = useCallback(() => {
    const track = streamRef.current?.getVideoTracks()[0];
    if (track) { track.enabled = !track.enabled; setCamOn(p => !p); }
  }, []);

  const shareScreen = useCallback(async () => {
    try {
      const screen = await navigator.mediaDevices.getDisplayMedia({ video: true });
      const vTrack = screen.getVideoTracks()[0];
      const sender = pcRef.current?.getSenders().find(s => s.track?.kind === 'video');
      if (sender) sender.replaceTrack(vTrack);
      if (myVideoRef.current) myVideoRef.current.srcObject = screen;
      vTrack.onended = () => {
        const orig = streamRef.current?.getVideoTracks()[0];
        if (orig && sender) sender.replaceTrack(orig);
        if (myVideoRef.current) myVideoRef.current.srcObject = streamRef.current;
        toast('Screen sharing ended');
      };
      toast.success('Screen sharing started');
    } catch { toast.error('Screen share failed or cancelled'); }
  }, []);

  const endCall = useCallback(() => {
    socketRef.current?.emit('leave-room', { roomId });
    cleanup();
    setCallStatus('ended');
    setTimeout(() => navigate(-1), 1500);
  }, [roomId]);

  const sendChat = () => {
    if (!chatInput.trim()) return;
    const msg = { text: chatInput.trim(), name: myName, mine: true, time: new Date() };
    setMessages(m => [...m, msg]);
    socketRef.current?.emit('chat-message', { roomId, text: chatInput.trim(), name: myName });
    setChatInput('');
  };

  const copyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/video-call/${roomId}`);
    toast.success('Link copied! Share with your contact');
  };

  const fmt = (s) =>
    `${String(Math.floor(s / 3600)).padStart(2, '0')}:${String(Math.floor((s % 3600) / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const qColor = { good: '#22c55e', fair: '#fbbf24', poor: '#ef4444' };

  // ── UI helpers ───────────────────────────────────────────────
  const Btn = ({ onClick, active, danger, children, title, wide }) => (
    <button onClick={onClick} title={title} style={{
      width: wide ? 68 : 52, height: 52, borderRadius: 16, cursor: 'pointer', border: 'none',
      display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .2s',
      background: danger ? 'linear-gradient(135deg,#dc2626,#ef4444)'
                 : active === false ? 'rgba(239,68,68,0.25)' : 'rgba(255,255,255,0.09)',
      boxShadow: danger ? '0 4px 20px rgba(239,68,68,0.4)' : 'none',
      color: danger ? '#fff' : active === false ? '#ef4444' : '#F1F5F9',
    }}
      onMouseEnter={e => { if (!danger) { e.currentTarget.style.background = 'rgba(99,102,241,0.2)'; } }}
      onMouseLeave={e => { if (!danger) { e.currentTarget.style.background = active === false ? 'rgba(239,68,68,0.25)' : 'rgba(255,255,255,0.09)'; } }}>
      {children}
    </button>
  );

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#080C18', display: 'flex', flexDirection: 'column', fontFamily: "'Plus Jakarta Sans',sans-serif", overflow: 'hidden', position: 'relative' }}>

      {/* BG orbs */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: '-20%', left: '-10%', width: '70%', height: '70%', background: 'radial-gradient(circle,rgba(99,102,241,0.1) 0%,transparent 60%)', filter: 'blur(80px)' }} />
        <div style={{ position: 'absolute', bottom: '-20%', right: '-10%', width: '60%', height: '60%', background: 'radial-gradient(circle,rgba(34,211,238,0.07) 0%,transparent 60%)', filter: 'blur(70px)' }} />
      </div>

      {/* ── TOP BAR ── */}
      <div style={{ position: 'relative', zIndex: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 24px', background: 'rgba(8,12,24,0.85)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: 'linear-gradient(135deg,#6366F1,#4f46e5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>⚡</div>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#F1F5F9' }}>SkillSphere Meet</span>
          </div>
          <div style={{ height: 16, width: 1, background: 'rgba(255,255,255,0.1)' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: callStatus === 'inCall' ? '#22c55e' : '#fbbf24', boxShadow: `0 0 8px ${callStatus === 'inCall' ? '#22c55e' : '#fbbf24'}` }} />
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>
              {callStatus === 'connecting' ? 'Connecting…' : callStatus === 'ringing' ? 'Waiting for peer…' : callStatus === 'inCall' ? fmt(duration) : 'Call ended'}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace' }}>Room: {roomId?.slice(0, 8).toUpperCase()}</span>
          <button onClick={copyLink} style={{ padding: '5px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.55)', fontSize: 11, cursor: 'pointer', fontFamily: 'inherit' }}>🔗 Copy invite</button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>👥 {participants}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{ width: 3, height: 4 + i * 3, borderRadius: 2, background: i <= (connQuality === 'good' ? 3 : connQuality === 'fair' ? 2 : 1) ? qColor[connQuality] : 'rgba(255,255,255,0.15)', transition: 'all .3s' }} />
            ))}
            <span style={{ fontSize: 10, color: qColor[connQuality], marginLeft: 4 }}>{connQuality}</span>
          </div>
        </div>
      </div>

      {/* ── VIDEO AREA ── */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative' }}>

        {/* Remote video */}
        <div style={{ flex: 1, position: 'relative', background: '#0a0e1a' }}>
          {remoteStream ? (
            <video ref={remoteVideoRef} autoPlay playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
              <div style={{ width: 90, height: 90, borderRadius: '50%', background: 'linear-gradient(135deg,#6366F1,#22D3EE)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, fontWeight: 900, color: '#fff', boxShadow: '0 0 60px rgba(99,102,241,0.35)', animation: callStatus === 'ringing' ? 'pulse 2s ease-in-out infinite' : 'none' }}>
                {remoteName[0]?.toUpperCase() || '?'}
              </div>
              <p style={{ fontSize: 18, fontWeight: 700, color: '#F1F5F9', margin: 0 }}>{remoteName}</p>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', margin: 0, animation: 'blink 1.5s ease-in-out infinite' }}>
                {callStatus === 'ringing' ? 'Waiting for someone to join…' : callStatus === 'connecting' ? 'Setting up call…' : 'Camera is off'}
              </p>
              {callStatus === 'ringing' && (
                <div style={{ marginTop: 12, padding: '8px 18px', background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 10, fontSize: 12, color: '#a5b4fc' }}>
                  Share the room link to invite someone
                </div>
              )}
            </div>
          )}
          {callStatus === 'inCall' && (
            <div style={{ position: 'absolute', bottom: 16, left: 16, padding: '5px 12px', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)', borderRadius: 999, fontSize: 12, fontWeight: 600, color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }}>
              {remoteName}
            </div>
          )}
        </div>

        {/* My video PiP */}
        <div style={{ position: 'absolute', bottom: 90, right: chatOpen ? 340 : 16, width: 190, height: 120, borderRadius: 14, overflow: 'hidden', border: '2px solid rgba(99,102,241,0.5)', boxShadow: '0 8px 32px rgba(0,0,0,0.5)', transition: 'right .3s', zIndex: 20 }}>
          {camOn ? (
            <video ref={myVideoRef} autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div style={{ width: '100%', height: '100%', background: '#111827', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg,#4f46e5,#6366F1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: '#fff', fontWeight: 700 }}>{myName[0]?.toUpperCase()}</div>
              <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>Camera off</span>
            </div>
          )}
          <div style={{ position: 'absolute', bottom: 5, left: 8, fontSize: 10, color: '#fff', fontWeight: 600, background: 'rgba(0,0,0,0.5)', padding: '1px 6px', borderRadius: 999 }}>
            You {!micOn && '🔇'}
          </div>
        </div>

        {/* ── CHAT PANEL ── */}
        {chatOpen && (
          <div style={{ width: 300, background: 'rgba(10,14,26,0.97)', backdropFilter: 'blur(20px)', borderLeft: '1px solid rgba(99,102,241,0.2)', display: 'flex', flexDirection: 'column', zIndex: 15 }}>
            <div style={{ padding: '14px 18px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#F1F5F9' }}>💬 Chat</span>
              <button onClick={() => setChatOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', fontSize: 18 }}>×</button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {messages.length === 0 && <div style={{ textAlign: 'center', marginTop: 40, color: 'rgba(255,255,255,0.2)', fontSize: 13 }}>No messages yet</div>}
              {messages.map((m, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: m.mine ? 'flex-end' : 'flex-start' }}>
                  <div style={{ maxWidth: '80%' }}>
                    {!m.mine && <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginBottom: 2 }}>{m.name}</div>}
                    <div style={{ padding: '8px 12px', borderRadius: m.mine ? '12px 12px 3px 12px' : '12px 12px 12px 3px', background: m.mine ? 'linear-gradient(135deg,#4f46e5,#6366F1)' : 'rgba(255,255,255,0.08)', color: '#F1F5F9', fontSize: 13 }}>
                      {m.text}
                    </div>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', marginTop: 2, textAlign: m.mine ? 'right' : 'left' }}>
                      {m.time?.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
            <div style={{ padding: '10px 12px', borderTop: '1px solid rgba(255,255,255,0.07)', display: 'flex', gap: 8 }}>
              <input value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendChat()} placeholder="Message…" style={{ flex: 1, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '8px 12px', color: '#F1F5F9', fontSize: 13, fontFamily: 'inherit', outline: 'none' }} />
              <button onClick={sendChat} style={{ width: 36, height: 36, borderRadius: 9, background: '#4f46e5', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="m22 2-7 20-4-9-9-4 20-7z" /><path d="M22 2 11 13" /></svg>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── CONTROLS ── */}
      <div style={{ position: 'relative', zIndex: 10, padding: '14px 24px', background: 'rgba(8,12,24,0.9)', backdropFilter: 'blur(20px)', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>

        {/* Mic */}
        <Btn onClick={toggleMic} active={micOn} title={micOn ? 'Mute' : 'Unmute'}>
          {micOn
            ? <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" /></svg>
            : <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="1" y1="1" x2="23" y2="23" /><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" /><path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23" /><line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" /></svg>
          }
        </Btn>

        {/* Camera */}
        <Btn onClick={toggleCam} active={camOn} title={camOn ? 'Turn off camera' : 'Turn on camera'}>
          {camOn
            ? <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" /></svg>
            : <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2m5.66 0H14a2 2 0 0 1 2 2v3.34l1 1L23 7v10" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
          }
        </Btn>

        {/* Screen share */}
        <Btn onClick={shareScreen} title="Share screen">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></svg>
        </Btn>

        {/* Chat */}
        <div style={{ position: 'relative' }}>
          <Btn onClick={() => setChatOpen(o => !o)} title="Chat" active={chatOpen ? undefined : undefined}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={chatOpen ? '#818CF8' : 'currentColor'} strokeWidth="2" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
          </Btn>
          {messages.filter(m => !m.mine).length > 0 && !chatOpen && (
            <div style={{ position: 'absolute', top: -4, right: -4, width: 16, height: 16, borderRadius: '50%', background: '#6366F1', color: '#fff', fontSize: 9, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {messages.filter(m => !m.mine).length}
            </div>
          )}
        </div>

        <div style={{ width: 1, height: 30, background: 'rgba(255,255,255,0.1)' }} />

        {/* End call */}
        <Btn onClick={endCall} danger wide title="End call">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A2 2 0 0 1 10 16M1 1l22 22" /></svg>
        </Btn>
      </div>

      {/* ── ENDED OVERLAY ── */}
      {callStatus === 'ended' && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(16px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>📞</div>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: '#F1F5F9', fontFamily: 'Syne,sans-serif', marginBottom: 8 }}>Call ended</h2>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', marginBottom: 24 }}>Duration: {fmt(duration)}</p>
          <button onClick={() => navigate(-1)} style={{ padding: '11px 28px', borderRadius: 14, background: 'linear-gradient(135deg,#6366F1,#4f46e5)', border: 'none', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Go Back</button>
        </div>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        @keyframes pulse { 0%,100%{box-shadow:0 0 30px rgba(99,102,241,0.3)} 50%{box-shadow:0 0 60px rgba(99,102,241,0.7)} }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.4} }
        video { background:#000; }
        input::placeholder { color:rgba(255,255,255,0.3); }
        ::-webkit-scrollbar { width:4px; }
        ::-webkit-scrollbar-thumb { background:rgba(99,102,241,0.4); border-radius:2px; }
        * { box-sizing:border-box; }
      `}</style>
    </div>
  );
};

export default VideoCall;
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import api from '../utils/api';
import useVideoCall from '../hooks/useVideoCall';
import toast from 'react-hot-toast';

// ─────────────────────────────────────────────────────────────
// Chat API routes — tries the most common patterns
// YOUR backend chat route: check routes/chat.routes.js
// Common patterns:
//   GET  /chat               → get all conversations
//   GET  /chat/:id           → get messages for conversation
//   POST /chat/:id           → send message
// OR
//   GET  /messages           → conversations
//   GET  /messages/:id       → messages
//   POST /messages/:id       → send
// ─────────────────────────────────────────────────────────────

const GRAD = [
  'linear-gradient(135deg,#1A56DB,#1A56DB)',
  'linear-gradient(135deg,#0ea5e9,#22D3EE)',
  'linear-gradient(135deg,#10b981,#34d399)',
  'linear-gradient(135deg,#f59e0b,#fbbf24)',
  'linear-gradient(135deg,#ec4899,#f43f5e)',
];

const ChatPage = () => {
  const { user }     = useSelector(s => s.auth || {});
  const { startCall } = useVideoCall();
  const [params]     = useSearchParams();
  const targetUserId = params.get('userId');

  const [conversations, setConversations] = useState([]);
  const [messages,      setMessages]      = useState([]);
  const [activeConv,    setActiveConv]    = useState(null);
  const [newMsg,        setNewMsg]        = useState('');
  const [loading,       setLoading]       = useState(true);
  const [sending,       setSending]       = useState(false);
  const [typing,        setTyping]        = useState(false);
  const [search,        setSearch]        = useState('');

  const bottomRef  = useRef(null);
  const inputRef   = useRef(null);
  const typingTimer = useRef(null);

  useEffect(() => { fetchConversations(); }, []);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:'smooth' }); }, [messages]);

  // ── Fetch conversations ──────────────────────────────────────
  const fetchConversations = async () => {
    setLoading(true);
    try {
      const res  = await api.get('/chat');
      const d    = res.data;
      const list = Array.isArray(d)               ? d
                 : Array.isArray(d?.conversations) ? d.conversations
                 : Array.isArray(d?.data)          ? d.data
                 : [];
      setConversations(list);

      // Auto-open conversation if userId passed in URL
      if (targetUserId && list.length > 0) {
        const match = list.find(c =>
          Array.isArray(c.participants) && c.participants.some(p => (p._id||p) === targetUserId)
        );
        if (match) openConversation(match);
      }
    } catch {
      setConversations([]);
    } finally {
      setLoading(false);
    }
  };

  // ── Open conversation & load messages ───────────────────────
  const openConversation = async (conv) => {
    setActiveConv(conv);
    setMessages([]);
    inputRef.current?.focus();

    // Don't fetch if demo conversation (non-MongoId)
    if (!conv._id || conv._id.length !== 24) return;

    try {
      const res  = await api.get('/chat/' + conv._id);
      const d    = res.data;
      // Handle both { messages: [] } and plain array responses
      const list = Array.isArray(d)          ? d
                 : Array.isArray(d?.messages) ? d.messages
                 : Array.isArray(d?.data)     ? d.data
                 : [];
      setMessages(list);
    } catch (err) {
      // 500 = server error, still show empty chat (don't crash)
      console.error('Chat load error:', err?.response?.status, err?.message);
      setMessages([]);
    }
  };

  // ── Send message ─────────────────────────────────────────────
  const sendMessage = async () => {
    const content = newMsg.trim();
    if (!content || !activeConv || sending) return;

    setSending(true);
    const tempId = `temp-${Date.now()}`;
    const temp   = { _id:tempId, content, sender:{ _id:user?._id, name:user?.name }, createdAt:new Date().toISOString(), temp:true };
    setMessages(p => [...p, temp]);
    setNewMsg('');

    try {
      const res  = await api.post('/chat/' + activeConv._id, { content });
      const sent = res.data?.message || res.data;
      setMessages(p => p.map(m => m._id===tempId ? { ...(sent||temp), temp:false } : m));
      // Update last message preview
      setConversations(p => p.map(c => c._id===activeConv._id ? { ...c, lastMessage:{ content } } : c));
    } catch (err) {
      setMessages(p => p.filter(m => m._id!==tempId));
      setNewMsg(content);
      const msg = err?.response?.status === 404
        ? 'Chat route not found — check backend /chat routes'
        : 'Failed to send message';
      toast.error(msg);
    } finally {
      setSending(false);
    }
  };

  // ── Typing handler ──────────────────────────────────────────
  const handleTyping = (e) => {
    setNewMsg(e.target.value);
    // Clear previous timer
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {}, 1000);
  };

  // ── Helpers ─────────────────────────────────────────────────
  const getOther = (conv) => {
    if (!Array.isArray(conv?.participants)) return { name:'User' };
    return conv.participants.find(p => (p._id||p) !== user?._id) || { name:'User' };
  };

  const fmtTime = (d) => {
    if (!d) return '';
    const now  = new Date(), date = new Date(d), diff = now - date;
    if (diff < 60000)    return 'just now';
    if (diff < 3600000)  return `${Math.floor(diff/60000)}m ago`;
    if (diff < 86400000) return date.toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit',hour12:true});
    return date.toLocaleDateString('en-IN',{day:'numeric',month:'short'});
  };

  // ── Demo data when API returns empty ────────────────────────
  const demoConvs = [
    { _id:'d1', participants:[{_id:'u1',name:'Rahul Kumar',isOnline:true},{_id:user?._id}],  lastMessage:{content:'Can we discuss the project timeline?'}, updatedAt:new Date(), unread:2 },
    { _id:'d2', participants:[{_id:'u2',name:'Priya Sharma',isOnline:false},{_id:user?._id}],lastMessage:{content:'I have submitted the first draft.'},     updatedAt:new Date(Date.now()-3600000), unread:0 },
    { _id:'d3', participants:[{_id:'u3',name:'Arjun Verma',isOnline:true},{_id:user?._id}],  lastMessage:{content:'Payment has been processed.'},           updatedAt:new Date(Date.now()-86400000), unread:1 },
    { _id:'d4', participants:[{_id:'u4',name:'Meera Singh',isOnline:false},{_id:user?._id}],  lastMessage:{content:'Thank you for the opportunity!'},        updatedAt:new Date(Date.now()-172800000), unread:0 },
  ];

  const demoMsgs = activeConv ? [
    { _id:'m1', content:'Hello! I saw your job posting. I have 5 years of experience in React.', sender:{_id:'u1'}, createdAt:new Date(Date.now()-3600000) },
    { _id:'m2', content:'Great! Can you share your portfolio or some previous work?',             sender:{_id:user?._id}, createdAt:new Date(Date.now()-3540000) },
    { _id:'m3', content:"Sure! Here's my GitHub: github.com/example. I've built 40+ React apps.", sender:{_id:'u1'}, createdAt:new Date(Date.now()-3480000) },
    { _id:'m4', content:'Looks solid! What timeline are you thinking for a 3-page dashboard?',   sender:{_id:user?._id}, createdAt:new Date(Date.now()-3420000) },
    { _id:'m5', content:'I can deliver in 10 working days. Ready to start immediately.',          sender:{_id:'u1'}, createdAt:new Date(Date.now()-600000) },
  ] : [];

  const displayConvs = conversations.length > 0 ? conversations : demoConvs;
  const displayMsgs  = messages.length > 0 ? messages : (activeConv ? demoMsgs : []);
  const filteredConvs = !search ? displayConvs : displayConvs.filter(c => getOther(c).name?.toLowerCase().includes(search.toLowerCase()));
  const otherUser     = activeConv ? getOther(activeConv) : null;

  // ── Styles ───────────────────────────────────────────────────
  const inputStyle = { flex:1, background:'transparent', border:'none', outline:'none', resize:'none', fontSize:14, color:'#111827', fontFamily:'inherit', lineHeight:1.6, maxHeight:120, overflow:'auto' };

  return (
    <div style={{ height:'calc(100vh - 64px)', display:'flex', background:'#f8fafc', fontFamily:"'Plus Jakarta Sans',sans-serif", overflow:'hidden' }}>

      {/* ── SIDEBAR ── */}
      <div style={{ width:300, flexShrink:0, background:'#fff', borderRight:'1px solid #e5e7eb', display:'flex', flexDirection:'column' }}>

        {/* Header */}
        <div style={{ padding:'18px 18px 12px', borderBottom:'1px solid #f1f5f9' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
            <h2 style={{ fontSize:17, fontWeight:800, color:'#111827' }}>Messages</h2>
            <span style={{ fontSize:12, fontWeight:700, padding:'3px 9px', borderRadius:999, background:'#ede9fe', color:'#1A56DB' }}>
              {displayConvs.filter(c=>c.unread>0).length || 0} new
            </span>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:8, background:'#f8fafc', border:'1px solid #e5e7eb', borderRadius:10, padding:'9px 13px' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2.5" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input type="text" placeholder="Search messages…" value={search} onChange={e=>setSearch(e.target.value)} style={{ background:'transparent', border:'none', outline:'none', fontSize:13, color:'#374151', fontFamily:'inherit', width:'100%' }} />
          </div>
        </div>

        {/* Conversation list */}
        <div style={{ flex:1, overflowY:'auto' }}>
          {loading ? (
            [1,2,3,4].map(i=>(
              <div key={i} style={{ display:'flex', gap:10, padding:'12px 18px', borderBottom:'1px solid #f9fafb' }}>
                <div style={{ width:42, height:42, borderRadius:'50%', background:'#f1f5f9', flexShrink:0, animation:'shimmer 1.5s ease-in-out infinite' }} />
                <div style={{ flex:1 }}>
                  <div style={{ height:13, background:'#f1f5f9', borderRadius:6, marginBottom:6, width:'50%', animation:'shimmer 1.5s ease-in-out infinite' }} />
                  <div style={{ height:11, background:'#f1f5f9', borderRadius:6, width:'70%', animation:'shimmer 1.5s ease-in-out infinite' }} />
                </div>
              </div>
            ))
          ) : filteredConvs.length === 0 ? (
            <div style={{ padding:'48px 18px', textAlign:'center' }}>
              <div style={{ fontSize:36, marginBottom:10 }}>💬</div>
              <p style={{ color:'#9ca3af', fontSize:13 }}>No conversations yet</p>
            </div>
          ) : filteredConvs.map((conv, ci) => {
            const other    = getOther(conv);
            const isActive = activeConv?._id === conv._id;
            return (
              <div key={conv._id} onClick={()=>openConversation(conv)}
                style={{ display:'flex', gap:11, padding:'13px 18px', cursor:'pointer', transition:'background 0.15s', background:isActive?'#f5f3ff':'transparent', borderLeft:`3px solid ${isActive?'#1E40AF':'transparent'}`, borderBottom:'1px solid #f9fafb' }}
                onMouseEnter={e=>{ if(!isActive) e.currentTarget.style.background='#fafafa'; }}
                onMouseLeave={e=>{ if(!isActive) e.currentTarget.style.background='transparent'; }}>
                {/* Avatar + online dot */}
                <div style={{ position:'relative', flexShrink:0 }}>
                  <div style={{ width:42, height:42, borderRadius:'50%', background:GRAD[ci%5], display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, fontWeight:800, color:'#fff' }}>
                    {other.name?.[0]?.toUpperCase()||'U'}
                  </div>
                  {other.isOnline && <div style={{ position:'absolute', bottom:1, right:1, width:10, height:10, borderRadius:'50%', background:'#22c55e', border:'2px solid #fff' }} />}
                </div>
                {/* Text */}
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:3 }}>
                    <span style={{ fontSize:14, fontWeight:conv.unread>0?700:600, color:'#111827', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{other.name||'User'}</span>
                    <span style={{ fontSize:11, color:'#9ca3af', flexShrink:0, marginLeft:6 }}>{fmtTime(conv.updatedAt)}</span>
                  </div>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <span style={{ fontSize:12, color:'#6b7280', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', flex:1 }}>{conv.lastMessage?.content||'No messages yet'}</span>
                    {conv.unread>0 && <span style={{ width:19, height:19, borderRadius:'50%', background:'#1E40AF', color:'#fff', fontSize:10, fontWeight:800, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, marginLeft:6, boxShadow:'0 2px 6px rgba(26,86,219,0.35)' }}>{conv.unread}</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── MAIN CHAT ── */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
        {activeConv && otherUser ? (
          <>
            {/* Top bar */}
            <div style={{ padding:'13px 24px', background:'#fff', borderBottom:'1px solid #e5e7eb', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                <div style={{ position:'relative' }}>
                  <div style={{ width:40, height:40, borderRadius:'50%', background:GRAD[0], display:'flex', alignItems:'center', justifyContent:'center', fontSize:15, fontWeight:800, color:'#fff' }}>
                    {otherUser.name?.[0]?.toUpperCase()||'U'}
                  </div>
                  {otherUser.isOnline && <div style={{ position:'absolute', bottom:1, right:1, width:9, height:9, borderRadius:'50%', background:'#22c55e', border:'2px solid #fff' }} />}
                </div>
                <div>
                  <div style={{ fontSize:15, fontWeight:700, color:'#111827' }}>{otherUser.name||'User'}</div>
                  <div style={{ fontSize:12, color:otherUser.isOnline?'#16a34a':'#9ca3af', display:'flex', alignItems:'center', gap:4 }}>
                    <div style={{ width:6, height:6, borderRadius:'50%', background:otherUser.isOnline?'#22c55e':'#d1d5db', display:'inline-block' }} />
                    {typing ? <span style={{ color:'#1E40AF' }}>typing…</span> : otherUser.isOnline ? 'Online' : 'Offline'}
                  </div>
                </div>
              </div>
              <div style={{ display:'flex', gap:8 }}>
                <button onClick={()=>startCall(otherUser?._id, activeConv?._id)} style={{ padding:'7px 14px', borderRadius:9, background:'#f5f3ff', border:'1px solid #ede9fe', color:'#1A56DB', fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>📹 Video</button>
                <button onClick={()=>toast('Voice call — coming soon!',{icon:'📞'})} style={{ padding:'7px 14px', borderRadius:9, background:'#f8fafc', border:'1px solid #e5e7eb', color:'#374151', fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>📞 Call</button>
              </div>
            </div>

            {/* Messages */}
            <div style={{ flex:1, overflowY:'auto', padding:'20px 24px', display:'flex', flexDirection:'column', gap:10 }}>
              {/* Day divider */}
              <div style={{ display:'flex', alignItems:'center', gap:12, margin:'4px 0 8px' }}>
                <div style={{ flex:1, height:1, background:'#f1f5f9' }} />
                <span style={{ fontSize:11, color:'#9ca3af', fontWeight:500 }}>Today</span>
                <div style={{ flex:1, height:1, background:'#f1f5f9' }} />
              </div>

              {displayMsgs.map((msg,i) => {
                const isMine = msg.sender?._id===user?._id || msg.sender===user?._id;
                const showAvatar = !isMine && (i===0 || displayMsgs[i-1]?.sender?._id !== msg.sender?._id);
                return (
                  <div key={msg._id||i} style={{ display:'flex', justifyContent:isMine?'flex-end':'flex-start', alignItems:'flex-end', gap:8 }}>
                    {!isMine && (
                      <div style={{ width:28, height:28, borderRadius:'50%', background:GRAD[0], display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:800, color:'#fff', flexShrink:0, opacity:showAvatar?1:0 }}>
                        {otherUser.name?.[0]?.toUpperCase()||'U'}
                      </div>
                    )}
                    <div style={{ maxWidth:'66%' }}>
                      <div style={{
                        padding:'11px 16px',
                        borderRadius: isMine ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                        background: isMine ? 'linear-gradient(135deg,#1E40AF,#1A56DB)' : '#fff',
                        color: isMine ? '#fff' : '#111827',
                        fontSize:14, lineHeight:1.6,
                        boxShadow: isMine ? '0 4px 14px rgba(26,86,219,0.25)' : '0 2px 6px rgba(0,0,0,0.06)',
                        border: isMine ? 'none' : '1px solid #e5e7eb',
                        opacity: msg.temp ? 0.65 : 1,
                        transition: 'opacity 0.3s',
                      }}>{msg.content}</div>
                      <div style={{ fontSize:10, color:'#9ca3af', marginTop:3, textAlign:isMine?'right':'left' }}>
                        {fmtTime(msg.createdAt)}{msg.temp && ' · Sending…'}
                        {isMine && !msg.temp && <span style={{ marginLeft:4 }}>✓✓</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>

            {/* Input bar */}
            <div style={{ padding:'14px 24px', background:'#fff', borderTop:'1px solid #e5e7eb', display:'flex', gap:10, alignItems:'flex-end' }}>
              {/* Attachment */}
              <button onClick={()=>toast('File upload coming soon',{icon:'📎'})} style={{ width:40, height:40, borderRadius:10, background:'#f8fafc', border:'1px solid #e5e7eb', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', flexShrink:0, fontSize:16, color:'#9ca3af', transition:'all 0.2s' }}
                onMouseEnter={e=>{e.target.style.background='#f1f5f9';e.target.style.color='#6b7280';}}
                onMouseLeave={e=>{e.target.style.background='#f8fafc';e.target.style.color='#9ca3af';}}>
                📎
              </button>

              {/* Text area */}
              <div style={{ flex:1, background:'#f8fafc', border:'1.5px solid #e5e7eb', borderRadius:14, padding:'10px 16px', transition:'border-color 0.2s' }}
                onFocus={e=>e.currentTarget.style.borderColor='#1A56DB'}
                onBlur={e=>e.currentTarget.style.borderColor='#e5e7eb'}>
                <textarea
                  ref={inputRef}
                  value={newMsg}
                  onChange={handleTyping}
                  onKeyDown={e=>{ if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendMessage();} }}
                  placeholder="Type a message… (Enter to send)"
                  rows={1}
                  style={inputStyle}
                />
              </div>

              {/* Send */}
              <button onClick={sendMessage} disabled={sending||!newMsg.trim()}
                style={{ width:44, height:44, borderRadius:12, background:newMsg.trim()?'#1E40AF':'#f1f5f9', border:'none', color:newMsg.trim()?'#fff':'#d1d5db', cursor:newMsg.trim()?'pointer':'not-allowed', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, boxShadow:newMsg.trim()?'0 4px 12px rgba(26,86,219,0.3)':'none', transition:'all 0.25s' }}>
                {sending ? (
                  <div style={{ width:16, height:16, border:'2px solid rgba(255,255,255,0.4)', borderTopColor:'#fff', borderRadius:'50%', animation:'spin 0.7s linear infinite' }} />
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m22 2-7 20-4-9-9-4 20-7z"/><path d="M22 2 11 13"/>
                  </svg>
                )}
              </button>
            </div>
          </>
        ) : (
          /* Empty state */
          <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:32 }}>
            <div style={{ width:80, height:80, borderRadius:24, background:'#f1f5f9', display:'flex', alignItems:'center', justifyContent:'center', fontSize:36, marginBottom:20 }}>💬</div>
            <h3 style={{ fontSize:20, fontWeight:700, color:'#374151', marginBottom:8 }}>Your Messages</h3>
            <p style={{ fontSize:14, color:'#9ca3af', textAlign:'center', maxWidth:260, lineHeight:1.7, marginBottom:24 }}>
              Select a conversation from the left to start chatting
            </p>
            {/* Quick start buttons */}
            {displayConvs.slice(0,3).map((c,i) => (
              <button key={c._id} onClick={()=>openConversation(c)} style={{ padding:'9px 20px', borderRadius:10, background:'#f5f3ff', border:'1px solid #ede9fe', color:'#1A56DB', fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'inherit', marginBottom:8, width:200, transition:'all 0.2s' }}
                onMouseEnter={e=>e.target.style.background='#ede9fe'}
                onMouseLeave={e=>e.target.style.background='#f5f3ff'}>
                💬 Chat with {getOther(c).name?.split(' ')[0]||`Contact ${i+1}`}
              </button>
            ))}
          </div>
        )}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        @keyframes shimmer{0%,100%{opacity:1}50%{opacity:0.4}}
        @keyframes spin{to{transform:rotate(360deg)}}
        textarea::placeholder{color:#9ca3af}
        ::-webkit-scrollbar{width:5px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:#e5e7eb;border-radius:3px}
      `}</style>
    </div>
  );
};

export default ChatPage;
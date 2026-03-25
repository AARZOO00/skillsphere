import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import api from '../utils/api';
import toast from 'react-hot-toast';

const ChatPage = () => {
  const { user } = useSelector(s => s.auth || {});

  const [conversations, setConversations] = useState([]);
  const [messages,      setMessages]      = useState([]);
  const [activeConv,    setActiveConv]    = useState(null);
  const [newMsg,        setNewMsg]        = useState('');
  const [loading,       setLoading]       = useState(true);
  const [sending,       setSending]       = useState(false);
  const [search,        setSearch]        = useState('');
  const bottomRef = useRef(null);

  useEffect(() => { fetchConversations(); }, []);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:'smooth' }); }, [messages]);

  const fetchConversations = async () => {
    setLoading(true);
    try {
      // Try multiple possible API endpoints
      let data = [];
      try {
        const res = await api.get('/chat/conversations');
        data = Array.isArray(res.data) ? res.data : Array.isArray(res.data?.conversations) ? res.data.conversations : [];
      } catch {
        try {
          const res = await api.get('/messages/conversations');
          data = Array.isArray(res.data) ? res.data : [];
        } catch { data = []; }
      }
      setConversations(data);
    } catch { setConversations([]); }
    finally  { setLoading(false); }
  };

  const openConversation = async (conv) => {
    setActiveConv(conv);
    setMessages([]);
    try {
      // Try multiple possible API endpoints
      let data = [];
      try {
        const res = await api.get(`/chat/conversations/${conv._id}/messages`);
        data = Array.isArray(res.data) ? res.data : Array.isArray(res.data?.messages) ? res.data.messages : [];
      } catch {
        try {
          const res = await api.get(`/messages/${conv._id}`);
          data = Array.isArray(res.data) ? res.data : [];
        } catch { data = []; }
      }
      setMessages(data);
    } catch { setMessages([]); }
  };

  const sendMessage = async () => {
    if (!newMsg.trim() || !activeConv || sending) return;
    const content = newMsg.trim();
    setSending(true);
    const temp = { _id:`temp-${Date.now()}`, content, sender:{ _id:user?._id }, createdAt:new Date().toISOString(), temp:true };
    setMessages(p => [...p, temp]);
    setNewMsg('');
    try {
      let sent = null;
      try {
        const res = await api.post(`/chat/conversations/${activeConv._id}/messages`, { content });
        sent = res.data?.message || res.data;
      } catch {
        try {
          const res = await api.post(`/messages`, { conversationId:activeConv._id, content });
          sent = res.data?.message || res.data;
        } catch { throw new Error('Send failed'); }
      }
      setMessages(p => p.map(m => m.temp ? (sent||temp) : m));
      // Update last message in conversation list
      setConversations(p => p.map(c => c._id===activeConv._id ? {...c, lastMessage:{content}} : c));
    } catch {
      setMessages(p => p.filter(m => !m.temp));
      setNewMsg(content);
      toast.error('Failed to send. Please try again.');
    } finally { setSending(false); }
  };

  const getOther = (conv) => {
    if (!Array.isArray(conv?.participants)) return { name:'User' };
    return conv.participants.find(p => (p._id||p) !== user?._id) || { name:'User' };
  };

  const fmtTime = (d) => {
    if (!d) return '';
    const now = new Date(), date = new Date(d);
    const diff = now - date;
    if (diff < 60000)    return 'just now';
    if (diff < 3600000)  return `${Math.floor(diff/60000)}m ago`;
    if (diff < 86400000) return date.toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit',hour12:true});
    return date.toLocaleDateString('en-IN',{day:'numeric',month:'short'});
  };

  // Demo conversations
  const demoConvs = [
    { _id:'dc1', participants:[{_id:'u1',name:'Rahul Kumar',isOnline:true},{_id:user?._id}],  lastMessage:{content:'Can we discuss the project timeline?'}, updatedAt:new Date(), unread:2 },
    { _id:'dc2', participants:[{_id:'u2',name:'Priya Sharma',isOnline:false},{_id:user?._id}], lastMessage:{content:'I have submitted the first draft.'}, updatedAt:new Date(Date.now()-3600000), unread:0 },
    { _id:'dc3', participants:[{_id:'u3',name:'Arjun Verma',isOnline:true},{_id:user?._id}],  lastMessage:{content:'Payment has been processed.'}, updatedAt:new Date(Date.now()-86400000), unread:1 },
    { _id:'dc4', participants:[{_id:'u4',name:'Meera Singh',isOnline:false},{_id:user?._id}],  lastMessage:{content:'Thank you for the opportunity!'}, updatedAt:new Date(Date.now()-172800000), unread:0 },
  ];

  const demoMessages = activeConv ? [
    { _id:'m1', content:`Hello! I'm interested in the project.`, sender:{_id:'u1'}, createdAt:new Date(Date.now()-3600000).toISOString() },
    { _id:'m2', content:`Great! Can you share your portfolio?`, sender:{_id:user?._id}, createdAt:new Date(Date.now()-3000000).toISOString() },
    { _id:'m3', content:`Sure, I've worked on similar projects before. Here's my GitHub: github.com/rahul`, sender:{_id:'u1'}, createdAt:new Date(Date.now()-2400000).toISOString() },
    { _id:'m4', content:`Looks good! What's your timeline for this project?`, sender:{_id:user?._id}, createdAt:new Date(Date.now()-1800000).toISOString() },
    { _id:'m5', content:`I can complete it in 2 weeks. When can we start?`, sender:{_id:'u1'}, createdAt:new Date(Date.now()-600000).toISOString() },
  ] : [];

  const displayConvs = conversations.length > 0 ? conversations : demoConvs;
  const displayMsgs  = messages.length > 0 ? messages : (activeConv ? demoMessages : []);
  const filteredConvs = displayConvs.filter(c => !search || getOther(c).name?.toLowerCase().includes(search.toLowerCase()));
  const otherUser    = activeConv ? getOther(activeConv) : null;

  const AVATAR_COLORS = ['linear-gradient(135deg,#6366F1,#8b5cf6)', 'linear-gradient(135deg,#0ea5e9,#22D3EE)', 'linear-gradient(135deg,#10b981,#34d399)', 'linear-gradient(135deg,#f59e0b,#fbbf24)'];

  return (
    <div style={{ height:'calc(100vh - 64px)', display:'flex', background:'#f8fafc', fontFamily:"'Plus Jakarta Sans', sans-serif", overflow:'hidden' }}>

      {/* ── LEFT SIDEBAR ── */}
      <div style={{ width:300, flexShrink:0, background:'#fff', borderRight:'1px solid #e5e7eb', display:'flex', flexDirection:'column' }}>

        {/* Sidebar header */}
        <div style={{ padding:'20px 18px 14px' }}>
          <h2 style={{ fontSize:18, fontWeight:800, color:'#111827', marginBottom:14 }}>Messages</h2>
          <div style={{ display:'flex', alignItems:'center', gap:8, background:'#f8fafc', border:'1px solid #e5e7eb', borderRadius:10, padding:'9px 13px' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2.5" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input type="text" placeholder="Search…" value={search} onChange={e=>setSearch(e.target.value)} style={{ background:'transparent', border:'none', outline:'none', fontSize:13, color:'#374151', fontFamily:'inherit', width:'100%' }} />
          </div>
        </div>

        {/* Conversation list */}
        <div style={{ flex:1, overflowY:'auto' }}>
          {loading ? (
            [1,2,3].map(i=>(
              <div key={i} style={{ display:'flex', gap:10, padding:'12px 18px' }}>
                <div style={{ width:40, height:40, borderRadius:'50%', background:'#f1f5f9', flexShrink:0, animation:'shimmer 1.5s ease-in-out infinite' }} />
                <div style={{ flex:1 }}>
                  <div style={{ height:12, background:'#f1f5f9', borderRadius:6, marginBottom:6, width:'55%', animation:'shimmer 1.5s ease-in-out infinite' }} />
                  <div style={{ height:10, background:'#f1f5f9', borderRadius:6, width:'75%', animation:'shimmer 1.5s ease-in-out infinite' }} />
                </div>
              </div>
            ))
          ) : filteredConvs.length === 0 ? (
            <div style={{ padding:'40px 18px', textAlign:'center' }}>
              <div style={{ fontSize:36, marginBottom:10 }}>💬</div>
              <p style={{ color:'#9ca3af', fontSize:13 }}>No conversations yet</p>
            </div>
          ) : filteredConvs.map((conv, ci) => {
            const other    = getOther(conv);
            const isActive = activeConv?._id === conv._id;
            return (
              <div key={conv._id} onClick={()=>openConversation(conv)}
                style={{ display:'flex', gap:11, padding:'12px 18px', cursor:'pointer', transition:'background 0.15s', background:isActive?'#f5f3ff':'transparent', borderLeft:`3px solid ${isActive?'#4f46e5':'transparent'}`, borderBottom:'1px solid #f9fafb' }}
                onMouseEnter={e=>{ if(!isActive) e.currentTarget.style.background='#fafafa'; }}
                onMouseLeave={e=>{ if(!isActive) e.currentTarget.style.background='transparent'; }}>
                {/* Avatar */}
                <div style={{ position:'relative', flexShrink:0 }}>
                  <div style={{ width:40, height:40, borderRadius:'50%', background:AVATAR_COLORS[ci%4], display:'flex', alignItems:'center', justifyContent:'center', fontSize:15, fontWeight:800, color:'#fff' }}>
                    {other.name?.[0]?.toUpperCase()||'U'}
                  </div>
                  {other.isOnline && <div style={{ position:'absolute', bottom:1, right:1, width:9, height:9, borderRadius:'50%', background:'#22c55e', border:'1.5px solid #fff' }} />}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:2 }}>
                    <span style={{ fontSize:13, fontWeight:conv.unread>0?700:600, color:'#111827', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{other.name||'User'}</span>
                    <span style={{ fontSize:10, color:'#9ca3af', flexShrink:0, marginLeft:6 }}>{fmtTime(conv.updatedAt)}</span>
                  </div>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <span style={{ fontSize:12, color:'#6b7280', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', flex:1 }}>{conv.lastMessage?.content||'No messages'}</span>
                    {conv.unread>0 && <span style={{ width:18, height:18, borderRadius:'50%', background:'#4f46e5', color:'#fff', fontSize:10, fontWeight:800, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, marginLeft:6 }}>{conv.unread}</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── CHAT AREA ── */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
        {activeConv && otherUser ? (
          <>
            {/* Chat top bar */}
            <div style={{ padding:'14px 24px', background:'#fff', borderBottom:'1px solid #e5e7eb', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                <div style={{ width:38, height:38, borderRadius:'50%', background:AVATAR_COLORS[0], display:'flex', alignItems:'center', justifyContent:'center', fontSize:15, fontWeight:800, color:'#fff', position:'relative' }}>
                  {otherUser.name?.[0]?.toUpperCase()||'U'}
                  {otherUser.isOnline && <div style={{ position:'absolute', bottom:1, right:1, width:9, height:9, borderRadius:'50%', background:'#22c55e', border:'1.5px solid #fff' }} />}
                </div>
                <div>
                  <div style={{ fontSize:15, fontWeight:700, color:'#111827' }}>{otherUser.name||'User'}</div>
                  <div style={{ fontSize:12, color: otherUser.isOnline?'#16a34a':'#9ca3af', display:'flex', alignItems:'center', gap:4 }}>
                    <div style={{ width:6, height:6, borderRadius:'50%', background:otherUser.isOnline?'#22c55e':'#d1d5db' }} />
                    {otherUser.isOnline?'Online':'Offline'}
                  </div>
                </div>
              </div>
              <div style={{ display:'flex', gap:8 }}>
                <button style={{ padding:'7px 14px', borderRadius:9, background:'#f5f3ff', border:'1px solid #ede9fe', color:'#7c3aed', fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}
                  onClick={()=>toast('Video call feature coming soon',{icon:'📹'})}>
                  📹 Video Call
                </button>
                <button style={{ padding:'7px 14px', borderRadius:9, background:'#f8fafc', border:'1px solid #e5e7eb', color:'#374151', fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>
                  ⋮ More
                </button>
              </div>
            </div>

            {/* Messages */}
            <div style={{ flex:1, overflowY:'auto', padding:'20px 24px', display:'flex', flexDirection:'column', gap:10 }}>
              {/* Date divider */}
              <div style={{ display:'flex', alignItems:'center', gap:12, margin:'4px 0 8px' }}>
                <div style={{ flex:1, height:1, background:'#f1f5f9' }} />
                <span style={{ fontSize:11, color:'#9ca3af', fontWeight:500, whiteSpace:'nowrap' }}>Today</span>
                <div style={{ flex:1, height:1, background:'#f1f5f9' }} />
              </div>

              {displayMsgs.map((msg, i) => {
                const isMine = msg.sender?._id === user?._id || msg.sender === user?._id;
                return (
                  <div key={msg._id||i} style={{ display:'flex', justifyContent:isMine?'flex-end':'flex-start', alignItems:'flex-end', gap:8 }}>
                    {!isMine && (
                      <div style={{ width:28, height:28, borderRadius:'50%', background:AVATAR_COLORS[0], display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:800, color:'#fff', flexShrink:0 }}>
                        {otherUser.name?.[0]?.toUpperCase()||'U'}
                      </div>
                    )}
                    <div style={{ maxWidth:'65%' }}>
                      <div style={{
                        padding:'11px 15px',
                        borderRadius: isMine ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                        background: isMine ? '#4f46e5' : '#fff',
                        color: isMine ? '#fff' : '#111827',
                        fontSize:14, lineHeight:1.6,
                        boxShadow: isMine ? '0 4px 12px rgba(79,70,229,0.25)' : '0 2px 6px rgba(0,0,0,0.06)',
                        border: isMine ? 'none' : '1px solid #e5e7eb',
                        opacity: msg.temp ? 0.65 : 1,
                        transition: 'opacity 0.3s',
                      }}>{msg.content}</div>
                      <div style={{ fontSize:10, color:'#9ca3af', marginTop:3, textAlign:isMine?'right':'left' }}>
                        {fmtTime(msg.createdAt)} {msg.temp&&'· Sending…'}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>

            {/* Message input */}
            <div style={{ padding:'14px 24px', background:'#fff', borderTop:'1px solid #e5e7eb', display:'flex', gap:10, alignItems:'flex-end' }}>
              {/* Attachment */}
              <button style={{ width:40, height:40, borderRadius:10, background:'#f8fafc', border:'1px solid #e5e7eb', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', flexShrink:0, fontSize:16, color:'#9ca3af', transition:'all 0.2s' }}
                onMouseEnter={e=>{e.target.style.background='#f1f5f9';e.target.style.color='#6b7280';}}
                onMouseLeave={e=>{e.target.style.background='#f8fafc';e.target.style.color='#9ca3af';}}
                onClick={()=>toast('File attachment coming soon',{icon:'📎'})}>
                📎
              </button>

              {/* Text input */}
              <div style={{ flex:1, background:'#f8fafc', border:'1.5px solid #e5e7eb', borderRadius:14, padding:'10px 16px', transition:'border-color 0.2s', display:'flex', alignItems:'flex-end', gap:8 }}>
                <textarea
                  value={newMsg}
                  onChange={e=>setNewMsg(e.target.value)}
                  onKeyDown={e=>{ if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendMessage();} }}
                  placeholder="Type a message… (Enter to send, Shift+Enter for new line)"
                  rows={1}
                  style={{ flex:1, background:'transparent', border:'none', outline:'none', resize:'none', fontSize:14, color:'#111827', fontFamily:'inherit', lineHeight:1.6, maxHeight:120, overflow:'auto' }}
                />
              </div>

              {/* Send button */}
              <button onClick={sendMessage} disabled={sending||!newMsg.trim()}
                style={{ width:44, height:44, borderRadius:12, background:newMsg.trim()?'#4f46e5':'#f1f5f9', border:'none', color:newMsg.trim()?'#fff':'#9ca3af', cursor:newMsg.trim()?'pointer':'not-allowed', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, boxShadow:newMsg.trim()?'0 4px 12px rgba(79,70,229,0.3)':'none', transition:'all 0.2s' }}>
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
          /* Empty / select conversation state */
          <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
            <div style={{ width:80, height:80, borderRadius:24, background:'#f1f5f9', display:'flex', alignItems:'center', justifyContent:'center', fontSize:36, marginBottom:20 }}>💬</div>
            <h3 style={{ fontSize:20, fontWeight:700, color:'#374151', marginBottom:8 }}>Your Messages</h3>
            <p style={{ fontSize:14, color:'#9ca3af', textAlign:'center', maxWidth:260, lineHeight:1.7 }}>
              Select a conversation from the left panel to start chatting
            </p>
            <div style={{ marginTop:24, display:'flex', gap:10 }}>
              {displayConvs.slice(0,3).map((c,i)=>(
                <button key={c._id} onClick={()=>openConversation(c)} style={{ padding:'9px 18px', borderRadius:10, background:'#f5f3ff', border:'1px solid #ede9fe', color:'#7c3aed', fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'inherit', transition:'all 0.2s' }}
                  onMouseEnter={e=>e.target.style.background='#ede9fe'}
                  onMouseLeave={e=>e.target.style.background='#f5f3ff'}>
                  {getOther(c).name?.split(' ')[0]||`Chat ${i+1}`}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        @keyframes shimmer { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes spin { to { transform: rotate(360deg); } }
        textarea::placeholder { color: #9ca3af; }
        ::-webkit-scrollbar { width:5px; }
        ::-webkit-scrollbar-track { background:transparent; }
        ::-webkit-scrollbar-thumb { background:#e5e7eb; border-radius:3px; }
      `}</style>
    </div>
  );
};

export default ChatPage;
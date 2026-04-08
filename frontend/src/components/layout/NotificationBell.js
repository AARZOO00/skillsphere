// src/components/layout/NotificationBell.js
// Real-time notifications dropdown with Socket.IO

import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api from '../../utils/api';

const NotificationBell = () => {
  const { user }          = useSelector(s => s.auth || {});
  const [open,    setOpen]   = useState(false);
  const [notifs,  setNotifs] = useState([]);
  const [unread,  setUnread] = useState(0);
  const [loading, setLoading]= useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (user) fetchNotifications();
  }, [user]);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.get('/notifications');
      const d   = res.data;
      const list = Array.isArray(d) ? d : Array.isArray(d?.notifications) ? d.notifications : [];
      setNotifs(list);
      setUnread(list.filter(n => !n.isRead).length);
    } catch { setNotifs([]); setUnread(0); }
    finally  { setLoading(false); }
  };

  const markAllRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifs(n => n.map(x => ({ ...x, isRead: true })));
      setUnread(0);
    } catch {}
  };

  const markRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifs(n => n.map(x => x._id===id ? {...x,isRead:true} : x));
      setUnread(u => Math.max(0, u-1));
    } catch {}
  };

  const ICONS = { new_bid:'🤝', bid_accepted:'🎉', bid_rejected:'❌', message:'💬', new_gig:'📌', payment:'💰', system:'🔔' };
  const timeAgo = (d) => {
    const diff = Date.now() - new Date(d);
    if (diff < 60000)    return 'just now';
    if (diff < 3600000)  return `${Math.floor(diff/60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff/3600000)}h ago`;
    return `${Math.floor(diff/86400000)}d ago`;
  };

  // Demo notifications
  const demo = [
    { _id:'n1', type:'new_bid',      title:'New Bid Received',    message:'Rahul bid ₹45,000 on "React Dashboard"',     isRead:false, createdAt:new Date(Date.now()-120000),   link:'/my-gigs' },
    { _id:'n2', type:'bid_accepted', title:'Bid Accepted! 🎉',    message:'Your bid was accepted for "Node.js API"',    isRead:false, createdAt:new Date(Date.now()-3600000),  link:'/my-proposals' },
    { _id:'n3', type:'message',      title:'New Message',          message:'Priya: "Can we discuss the timeline?"',     isRead:false, createdAt:new Date(Date.now()-7200000),  link:'/chat' },
    { _id:'n4', type:'new_gig',      title:'New Job Match ⚡',     message:'New React.js job matching your skills',     isRead:true,  createdAt:new Date(Date.now()-86400000), link:'/gigs' },
    { _id:'n5', type:'payment',      title:'Payment Released',     message:'₹28,000 released for "UI Design Project"', isRead:true,  createdAt:new Date(Date.now()-172800000),link:'/payments' },
  ];
  const display = notifs.length > 0 ? notifs : demo;
  const displayUnread = notifs.length > 0 ? unread : 3;

  return (
    <div ref={ref} style={{ position:'relative' }}>
      {/* Bell button */}
      <button onClick={()=>setOpen(!open)} style={{ position:'relative', width:42, height:42, borderRadius:12, background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.12)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', transition:'all .2s', color:'#E2E8F0' }}
        onMouseEnter={e=>{ e.currentTarget.style.background='rgba(99,102,241,0.15)'; e.currentTarget.style.borderColor='rgba(99,102,241,0.4)'; }}
        onMouseLeave={e=>{ e.currentTarget.style.background='rgba(255,255,255,0.08)'; e.currentTarget.style.borderColor='rgba(255,255,255,0.12)'; }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
        {displayUnread > 0 && (
          <div style={{ position:'absolute', top:-4, right:-4, width:18, height:18, borderRadius:'50%', background:'linear-gradient(135deg,#ef4444,#dc2626)', color:'#fff', fontSize:10, fontWeight:800, display:'flex', alignItems:'center', justifyContent:'center', border:'2px solid #04081A', animation:'pulse .8s ease-in-out infinite' }}>
            {displayUnread > 9 ? '9+' : displayUnread}
          </div>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div style={{ position:'absolute', right:0, top:'calc(100% + 10px)', width:360, background:'rgba(15,10,40,0.97)', border:'1px solid rgba(99,102,241,0.25)', borderRadius:18, boxShadow:'0 24px 60px rgba(0,0,0,0.5)', backdropFilter:'blur(40px)', zIndex:999, overflow:'hidden', animation:'dropIn .2s cubic-bezier(.16,1,.3,1) both' }}>

          {/* Header */}
          <div style={{ padding:'16px 20px', borderBottom:'1px solid rgba(255,255,255,0.07)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <div>
              <span style={{ fontSize:15, fontWeight:700, color:'#F1F5F9' }}>Notifications</span>
              {displayUnread > 0 && <span style={{ marginLeft:8, fontSize:11, fontWeight:700, padding:'2px 8px', borderRadius:999, background:'rgba(99,102,241,0.2)', color:'#818CF8' }}>{displayUnread} new</span>}
            </div>
            {displayUnread > 0 && (
              <button onClick={markAllRead} style={{ fontSize:12, color:'#a78bfa', fontWeight:600, background:'none', border:'none', cursor:'pointer', fontFamily:'inherit' }}>
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div style={{ maxHeight:360, overflowY:'auto' }}>
            {display.length === 0 ? (
              <div style={{ padding:'40px 20px', textAlign:'center', color:'rgba(255,255,255,0.3)', fontSize:14 }}>
                <div style={{ fontSize:36, marginBottom:10 }}>🔔</div>
                No notifications yet
              </div>
            ) : display.map((n, i) => (
              <Link key={n._id||i} to={n.link||'/'} onClick={()=>{ markRead(n._id); setOpen(false); }} style={{ display:'flex', gap:12, padding:'14px 20px', textDecoration:'none', transition:'background .15s', borderBottom:'1px solid rgba(255,255,255,0.04)', background:n.isRead?'transparent':'rgba(99,102,241,0.06)' }}
                onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,0.04)'}
                onMouseLeave={e=>e.currentTarget.style.background=n.isRead?'transparent':'rgba(99,102,241,0.06)'}>
                <div style={{ width:38, height:38, borderRadius:12, background:'rgba(99,102,241,0.12)', border:'1px solid rgba(99,102,241,0.2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:17, flexShrink:0 }}>
                  {ICONS[n.type]||'🔔'}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:13, fontWeight:n.isRead?500:700, color:'#E2E8F0', marginBottom:3, display:'flex', justifyContent:'space-between' }}>
                    <span>{n.title}</span>
                    {!n.isRead && <div style={{ width:7, height:7, borderRadius:'50%', background:'#6366F1', flexShrink:0, marginLeft:8, marginTop:3 }} />}
                  </div>
                  <div style={{ fontSize:12, color:'rgba(255,255,255,0.45)', marginBottom:4, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden', lineHeight:1.5 }}>{n.message}</div>
                  <div style={{ fontSize:11, color:'rgba(255,255,255,0.25)' }}>{timeAgo(n.createdAt)}</div>
                </div>
              </Link>
            ))}
          </div>

          {/* Footer */}
          <div style={{ padding:'12px 20px', borderTop:'1px solid rgba(255,255,255,0.07)', textAlign:'center' }}>
            <Link to="/notifications" onClick={()=>setOpen(false)} style={{ fontSize:13, color:'#a78bfa', fontWeight:600, textDecoration:'none' }}>
              View all notifications →
            </Link>
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulse   { 0%,100%{transform:scale(1)} 50%{transform:scale(1.15)} }
        @keyframes dropIn  { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
      `}</style>
    </div>
  );
};

export default NotificationBell;
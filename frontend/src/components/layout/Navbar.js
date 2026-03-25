import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../redux/slices/authSlice';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { user } = useSelector(s => s.auth);

  const [scrolled,      setScrolled]      = useState(false);
  const [profileOpen,   setProfileOpen]   = useState(false);
  const [notifOpen,     setNotifOpen]     = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount,   setUnreadCount]   = useState(0);
  const [notifLoading,  setNotifLoading]  = useState(false);

  const profileRef = useRef(null);
  const notifRef   = useRef(null);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', h);
    return () => window.removeEventListener('scroll', h);
  }, []);

  useEffect(() => {
    const h = e => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
      if (notifRef.current   && !notifRef.current.contains(e.target))   setNotifOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  useEffect(() => {
    if (!user) return;
    api.get('/notifications?limit=1')
      .then(res => setUnreadCount(res.data?.unreadCount || 0))
      .catch(() => {});
  }, [user]);

  const openNotifications = async () => {
    const next = !notifOpen;
    setNotifOpen(next);
    if (next && user) {
      setNotifLoading(true);
      try {
        const res  = await api.get('/notifications');
        const data = res.data;
        const list = Array.isArray(data?.notifications) ? data.notifications
                   : Array.isArray(data) ? data : [];
        setNotifications(list);
        setUnreadCount(data?.unreadCount ?? 0);
      } catch { setNotifications([]); }
      finally  { setNotifLoading(false); }
    }
  };

  const markAllRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setUnreadCount(0);
      setNotifications(p => p.map(n => ({ ...n, isRead: true })));
    } catch { toast.error('Could not mark as read'); }
  };

  const handleLogout = () => {
    dispatch(logout());
    setProfileOpen(false);
    navigate('/login');
    toast.success('Logged out');
  };

  const active = path => location.pathname === path || location.pathname.startsWith(path + '/');

  const nlStyle = path => ({
    color: active(path) ? '#818CF8' : '#94A3B8',
    textDecoration: 'none', fontSize: 14, fontWeight: 500,
    padding: '6px 12px', borderRadius: 8, transition: 'all 0.2s',
    background: active(path) ? 'rgba(99,102,241,0.1)' : 'transparent',
    display: 'inline-block',
  });

  const notifIconMap = { new_gig:'⚡', new_bid:'🤝', bid_accepted:'🎉', bid_rejected:'❌', message:'💬', system:'🔔' };

  const iconBtn = (active_) => ({
    width: 36, height: 36, borderRadius: 10, cursor: 'pointer',
    background: active_ ? 'rgba(99,102,241,0.12)' : 'rgba(255,255,255,0.05)',
    border: `1px solid ${active_ ? 'rgba(99,102,241,0.35)' : 'rgba(255,255,255,0.08)'}`,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 16, transition: 'all 0.2s', position: 'relative',
  });

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 200,
      height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 36px',
      background: scrolled ? 'rgba(11,15,26,0.96)' : 'rgba(11,15,26,0.85)',
      borderBottom: '1px solid rgba(255,255,255,0.07)',
      backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
      transition: 'background 0.3s',
      fontFamily: 'Plus Jakarta Sans, sans-serif',
    }}>

      {/* LOGO */}
      <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 9 }}>
        <div style={{ width: 34, height: 34, borderRadius: 10, background: 'linear-gradient(135deg,#6366F1,#22D3EE)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, boxShadow: '0 4px 14px rgba(99,102,241,0.45)' }}>⚡</div>
        <span style={{ fontFamily: 'Syne, Plus Jakarta Sans, sans-serif', fontWeight: 800, fontSize: 19, background: 'linear-gradient(135deg,#a5b4fc,#22D3EE)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>SkillSphere</span>
      </Link>

      {/* CENTER NAV */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Link to="/gigs"        style={nlStyle('/gigs')}        onMouseEnter={e=>{if(!active('/gigs'))       {e.currentTarget.style.color='#E2E8F0';e.currentTarget.style.background='rgba(255,255,255,0.06)';}}} onMouseLeave={e=>{if(!active('/gigs'))       {e.currentTarget.style.color='#94A3B8';e.currentTarget.style.background='transparent';}}}>Browse Jobs</Link>
        <Link to="/freelancers" style={nlStyle('/freelancers')} onMouseEnter={e=>{if(!active('/freelancers')){e.currentTarget.style.color='#E2E8F0';e.currentTarget.style.background='rgba(255,255,255,0.06)';}}} onMouseLeave={e=>{if(!active('/freelancers')){e.currentTarget.style.color='#94A3B8';e.currentTarget.style.background='transparent';}}}>Find Talent</Link>
        {user && <Link to="/dashboard"    style={nlStyle('/dashboard')}    onMouseEnter={e=>{if(!active('/dashboard'))   {e.currentTarget.style.color='#E2E8F0';e.currentTarget.style.background='rgba(255,255,255,0.06)';}}} onMouseLeave={e=>{if(!active('/dashboard'))   {e.currentTarget.style.color='#94A3B8';e.currentTarget.style.background='transparent';}}}>Dashboard</Link>}
        {user?.role==='client'     && <Link to="/my-gigs"      style={nlStyle('/my-gigs')}      onMouseEnter={e=>{if(!active('/my-gigs'))     {e.currentTarget.style.color='#E2E8F0';e.currentTarget.style.background='rgba(255,255,255,0.06)';}}} onMouseLeave={e=>{if(!active('/my-gigs'))     {e.currentTarget.style.color='#94A3B8';e.currentTarget.style.background='transparent';}}}>My Gigs</Link>}
        {user?.role==='freelancer' && <Link to="/my-proposals" style={nlStyle('/my-proposals')} onMouseEnter={e=>{if(!active('/my-proposals')){e.currentTarget.style.color='#E2E8F0';e.currentTarget.style.background='rgba(255,255,255,0.06)';}}} onMouseLeave={e=>{if(!active('/my-proposals')){e.currentTarget.style.color='#94A3B8';e.currentTarget.style.background='transparent';}}}>My Bids</Link>}
        {user?.role==='admin'      && <Link to="/admin"        style={nlStyle('/admin')}        onMouseEnter={e=>{if(!active('/admin'))       {e.currentTarget.style.color='#E2E8F0';e.currentTarget.style.background='rgba(255,255,255,0.06)';}}} onMouseLeave={e=>{if(!active('/admin'))       {e.currentTarget.style.color='#94A3B8';e.currentTarget.style.background='transparent';}}}>⚙ Admin</Link>}
      </div>

      {/* RIGHT */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {user ? (
          <>
            {/* Chat */}
            <Link to="/chat" style={{ ...iconBtn(active('/chat')), color: active('/chat') ? '#22D3EE' : '#94A3B8', textDecoration: 'none' }}
              onMouseEnter={e=>{e.currentTarget.style.background='rgba(34,211,238,0.1)';e.currentTarget.style.borderColor='rgba(34,211,238,0.3)';}}
              onMouseLeave={e=>{e.currentTarget.style.background=active('/chat')?'rgba(99,102,241,0.12)':'rgba(255,255,255,0.05)';e.currentTarget.style.borderColor=active('/chat')?'rgba(99,102,241,0.35)':'rgba(255,255,255,0.08)';}}>
              💬
            </Link>

            {/* Notifications */}
            <div ref={notifRef} style={{ position: 'relative' }}>
              <button onClick={openNotifications} style={{ ...iconBtn(notifOpen), border: 'none' }}
                onMouseEnter={e=>{if(!notifOpen){e.currentTarget.style.background='rgba(99,102,241,0.12)';e.currentTarget.style.borderColor='rgba(99,102,241,0.35)';}}}
                onMouseLeave={e=>{if(!notifOpen){e.currentTarget.style.background='rgba(255,255,255,0.05)';}}}>
                🔔
                {unreadCount > 0 && (
                  <div style={{ position:'absolute', top:-4, right:-4, width:18, height:18, borderRadius:'50%', background:'linear-gradient(135deg,#6366F1,#22D3EE)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:800, color:'#fff', border:'2px solid #0B0F1A', boxShadow:'0 0 8px rgba(99,102,241,0.6)' }}>
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </div>
                )}
              </button>

              {notifOpen && (
                <div style={{ position:'absolute', top:'calc(100% + 10px)', right:0, width:340, background:'#111827', border:'1px solid rgba(99,102,241,0.25)', borderRadius:16, boxShadow:'0 20px 60px rgba(0,0,0,0.6)', zIndex:300, overflow:'hidden' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'14px 18px', borderBottom:'1px solid rgba(255,255,255,0.07)' }}>
                    <span style={{ fontSize:14, fontWeight:700, color:'#F1F5F9' }}>
                      Notifications
                      {unreadCount > 0 && <span style={{ background:'rgba(99,102,241,0.2)', color:'#818CF8', fontSize:11, padding:'2px 7px', borderRadius:999, marginLeft:6 }}>{unreadCount} new</span>}
                    </span>
                    {unreadCount > 0 && <button onClick={markAllRead} style={{ background:'none', border:'none', color:'#6366F1', fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:'Plus Jakarta Sans, sans-serif' }}>Mark all read</button>}
                  </div>

                  <div style={{ maxHeight:360, overflowY:'auto' }}>
                    {notifLoading ? (
                      <div style={{ padding:32, textAlign:'center', color:'#475569', fontSize:13 }}>Loading…</div>
                    ) : notifications.length === 0 ? (
                      <div style={{ padding:'40px 24px', textAlign:'center' }}>
                        <div style={{ fontSize:36, marginBottom:10 }}>🔔</div>
                        <p style={{ color:'#64748B', fontSize:13 }}>No notifications yet</p>
                      </div>
                    ) : notifications.map((n, i) => (
                      <div key={n._id || i}
                        onClick={() => { if (n.link) navigate(n.link); setNotifOpen(false); }}
                        style={{ display:'flex', gap:12, padding:'13px 18px', borderBottom:'1px solid rgba(255,255,255,0.05)', cursor:n.link?'pointer':'default', background:n.isRead?'transparent':'rgba(99,102,241,0.06)', transition:'background 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.background='rgba(99,102,241,0.1)'}
                        onMouseLeave={e => e.currentTarget.style.background=n.isRead?'transparent':'rgba(99,102,241,0.06)'}
                      >
                        <div style={{ width:36, height:36, borderRadius:10, flexShrink:0, background:n.isRead?'rgba(255,255,255,0.05)':'rgba(99,102,241,0.15)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, border:n.isRead?'1px solid rgba(255,255,255,0.07)':'1px solid rgba(99,102,241,0.3)' }}>
                          {notifIconMap[n.type] || '🔔'}
                        </div>
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ fontSize:13, fontWeight:600, color:n.isRead?'#94A3B8':'#E2E8F0', marginBottom:2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{n.title}</div>
                          <div style={{ fontSize:12, color:'#64748B', lineHeight:1.5, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>{n.message}</div>
                          {n.createdAt && <div style={{ fontSize:11, color:'#475569', marginTop:3 }}>{new Date(n.createdAt).toLocaleDateString('en-IN',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})}</div>}
                        </div>
                        {!n.isRead && <div style={{ width:7, height:7, borderRadius:'50%', background:'#6366F1', flexShrink:0, marginTop:4, boxShadow:'0 0 6px #6366F1' }} />}
                      </div>
                    ))}
                  </div>

                  <div style={{ padding:'10px 18px', borderTop:'1px solid rgba(255,255,255,0.07)', textAlign:'center' }}>
                    <button onClick={()=>setNotifOpen(false)} style={{ background:'none', border:'none', color:'#6366F1', fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'Plus Jakarta Sans, sans-serif' }}>Close</button>
                  </div>
                </div>
              )}
            </div>

            {/* Profile */}
            <div ref={profileRef} style={{ position:'relative' }}>
              <button onClick={()=>setProfileOpen(v=>!v)} style={{ display:'flex', alignItems:'center', gap:8, background:profileOpen?'rgba(99,102,241,0.1)':'rgba(255,255,255,0.05)', border:`1px solid ${profileOpen?'rgba(99,102,241,0.35)':'rgba(255,255,255,0.1)'}`, borderRadius:10, padding:'5px 12px 5px 5px', cursor:'pointer', transition:'all 0.2s' }}>
                <div style={{ width:28, height:28, borderRadius:'50%', background:'linear-gradient(135deg,#6366F1,#22D3EE)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:800, color:'#fff' }}>{user?.name?.[0]?.toUpperCase()||'U'}</div>
                <span style={{ fontSize:13, fontWeight:600, color:'#E2E8F0' }}>{user?.name?.split(' ')[0]||'User'}</span>
                <svg width="10" height="6" viewBox="0 0 10 6" fill="none"><path d="M1 1l4 4 4-4" stroke="#64748B" strokeWidth="1.5" strokeLinecap="round"/></svg>
              </button>

              {profileOpen && (
                <div style={{ position:'absolute', top:'calc(100% + 10px)', right:0, minWidth:200, background:'#111827', border:'1px solid rgba(255,255,255,0.1)', borderRadius:14, boxShadow:'0 16px 48px rgba(0,0,0,0.6)', overflow:'hidden', zIndex:300 }}>
                  <div style={{ padding:'14px 16px', borderBottom:'1px solid rgba(255,255,255,0.07)' }}>
                    <div style={{ fontSize:14, fontWeight:700, color:'#F1F5F9' }}>{user?.name}</div>
                    <div style={{ fontSize:12, color:'#64748B', marginTop:2 }}>{user?.email}</div>
                    <div style={{ marginTop:6 }}>
                      <span style={{ fontSize:11, fontWeight:700, padding:'2px 10px', borderRadius:999, background:'rgba(99,102,241,0.15)', color:'#818CF8', border:'1px solid rgba(99,102,241,0.25)', textTransform:'capitalize' }}>{user?.role}</span>
                    </div>
                  </div>

                  {[
                    { icon:'👤', label:'My Profile', to:`/profile/${user?._id}` },
                    { icon:'⚙️', label:'Settings',   to:'/settings' },
                    ...(user?.role==='client'     ? [{icon:'📌',label:'My Gigs',     to:'/my-gigs'}]      : []),
                    ...(user?.role==='freelancer'  ? [{icon:'📋',label:'My Bids',     to:'/my-proposals'}] : []),
                    ...(user?.role==='admin'       ? [{icon:'🛡️',label:'Admin Panel', to:'/admin'}]        : []),
                    { icon:'💳', label:'Payments', to:'/payments' },
                  ].map(item => (
                    <Link key={item.to} to={item.to} onClick={()=>setProfileOpen(false)}
                      style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 16px', color:'#94A3B8', textDecoration:'none', fontSize:13, fontWeight:500, transition:'all 0.15s' }}
                      onMouseEnter={e=>{e.currentTarget.style.background='rgba(99,102,241,0.1)';e.currentTarget.style.color='#E2E8F0';}}
                      onMouseLeave={e=>{e.currentTarget.style.background='transparent';e.currentTarget.style.color='#94A3B8';}}>
                      <span style={{ fontSize:15 }}>{item.icon}</span>{item.label}
                    </Link>
                  ))}

                  <div style={{ height:1, background:'rgba(255,255,255,0.07)', margin:'4px 0' }} />
                  <button onClick={handleLogout} style={{ display:'flex', alignItems:'center', gap:10, width:'100%', padding:'10px 16px', background:'transparent', border:'none', color:'#F87171', fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'Plus Jakarta Sans, sans-serif', textAlign:'left' }}
                    onMouseEnter={e=>e.currentTarget.style.background='rgba(248,113,113,0.08)'}
                    onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                    <span style={{ fontSize:15 }}>🚪</span> Sign Out
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <Link to="/login"><button style={{ padding:'8px 18px', borderRadius:10, background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', color:'#94A3B8', fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'Plus Jakarta Sans, sans-serif', transition:'all 0.2s' }} onMouseEnter={e=>{e.target.style.color='#fff';e.target.style.background='rgba(255,255,255,0.1)';}} onMouseLeave={e=>{e.target.style.color='#94A3B8';e.target.style.background='rgba(255,255,255,0.05)';}}>Login</button></Link>
            <Link to="/register"><button style={{ padding:'8px 18px', borderRadius:10, background:'linear-gradient(135deg,#6366F1,#22D3EE)', border:'none', color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'Plus Jakarta Sans, sans-serif', boxShadow:'0 4px 14px rgba(99,102,241,0.4)', transition:'all 0.2s' }} onMouseEnter={e=>{e.target.style.boxShadow='0 6px 22px rgba(99,102,241,0.65)';e.target.style.transform='translateY(-1px)';}} onMouseLeave={e=>{e.target.style.boxShadow='0 4px 14px rgba(99,102,241,0.4)';e.target.style.transform='translateY(0)';}}>Get Started</button></Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
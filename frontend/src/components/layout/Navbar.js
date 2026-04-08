import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../redux/slices/authSlice';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const Navbar = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const dispatch  = useDispatch();
  const { user }  = useSelector(s => s.auth || {});

  const [scrolled,     setScrolled]     = useState(false);
  const [profileOpen,  setProfileOpen]  = useState(false);
  const [notifOpen,    setNotifOpen]    = useState(false);
  const [searchOpen,   setSearchOpen]   = useState(false);
  const [searchQ,      setSearchQ]      = useState('');
  const [notifs,       setNotifs]       = useState([]);
  const [unread,       setUnread]       = useState(0);
  const [notifLoading, setNotifLoading] = useState(false);

  const profileRef = useRef(null);
  const notifRef   = useRef(null);
  const searchRef  = useRef(null);
  const searchInp  = useRef(null);

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', h);
    return () => window.removeEventListener('scroll', h);
  }, []);

  useEffect(() => {
    const h = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
      if (notifRef.current   && !notifRef.current.contains(e.target))   setNotifOpen(false);
      if (searchRef.current  && !searchRef.current.contains(e.target))  setSearchOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  // Fetch unread count
  useEffect(() => {
    if (!user) return;
    api.get('/notifications').then(r => {
      const list = r.data?.notifications || r.data || [];
      setNotifs(Array.isArray(list) ? list.slice(0, 6) : []);
      setUnread(Array.isArray(list) ? list.filter(n => !n.isRead).length : 0);
    }).catch(() => {});
  }, [user]);

  const openNotifs = async () => {
    setNotifOpen(n => !n);
    setProfileOpen(false);
    if (!notifOpen && user) {
      setNotifLoading(true);
      try {
        const r = await api.get('/notifications');
        const list = r.data?.notifications || r.data || [];
        setNotifs(Array.isArray(list) ? list.slice(0, 8) : []);
        setUnread(Array.isArray(list) ? list.filter(n=>!n.isRead).length : 0);
      } catch { setNotifs([]); }
      finally { setNotifLoading(false); }
    }
  };

  const markAllRead = async () => {
    try { await api.patch('/notifications/read-all'); setUnread(0); setNotifs(n => n.map(x => ({...x,isRead:true}))); }
    catch {}
  };

  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem('token');
    toast.success('Signed out');
    navigate('/login');
    setProfileOpen(false);
  };

  const handleSearch = (e) => {
    if (e.key === 'Enter' && searchQ.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQ.trim())}`);
      setSearchOpen(false);
      setSearchQ('');
    }
  };

  const openSearch = () => {
    setSearchOpen(true);
    setProfileOpen(false);
    setNotifOpen(false);
    setTimeout(() => searchInp.current?.focus(), 100);
  };

  const timeAgo = (d) => {
    if (!d) return '';
    const diff = Date.now() - new Date(d);
    if (diff < 60000) return 'just now';
    if (diff < 3600000) return `${Math.floor(diff/60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff/3600000)}h ago`;
    return `${Math.floor(diff/86400000)}d ago`;
  };

  const NOTIF_ICONS = { new_bid:'🤝', bid_accepted:'🎉', bid_rejected:'❌', message:'💬', new_gig:'📌', payment:'💰', system:'🔔' };
  const PLAN_BADGE  = { pro: { label:'PRO', color:'#818CF8', bg:'rgba(99,102,241,0.2)' }, elite: { label:'ELITE', color:'#fbbf24', bg:'rgba(245,158,11,0.2)' } };

  // Nav links config
  const NAV_LINKS = [
    { label: 'Browse Jobs',   to: '/gigs',        roles: null },
    { label: 'Find Talent',   to: '/freelancers',  roles: null },
    { label: 'Dashboard',     to: '/dashboard',    roles: ['client','freelancer','admin'] },
    { label: 'My Gigs',       to: '/my-gigs',      roles: ['client'] },
    { label: 'My Proposals',  to: '/my-proposals', roles: ['freelancer'] },
  ];

  const visibleLinks = NAV_LINKS.filter(l => !l.roles || (user && l.roles.includes(user.role)));

  // Profile dropdown items
  const dropItems = [
    { icon:'👤', label:'My Profile',    to:`/profile/${user?._id}`,       roles:null },
    { icon:'⚙️', label:'Settings',      to:'/settings',                    roles:null },
    ...(user?.role==='client'    ? [{ icon:'📌', label:'My Gigs',       to:'/my-gigs'        }] : []),
    ...(user?.role==='freelancer'? [{ icon:'📋', label:'My Proposals',  to:'/my-proposals'   }] : []),
    ...(user?.role==='freelancer'? [{ icon:'📊', label:'Dashboard',     to:'/freelancer-dashboard'}] : []),
    { icon:'💳', label:'Payments',      to:'/payments',                    roles:null },
    { icon:'⚡', label:'Upgrade to Pro', to:'/subscription',              roles:null, highlight:true },
    { icon:'🎁', label:'Referral & Rewards',to:'/referral',               roles:null },
    ...(user?.role==='admin'     ? [{ icon:'🛡️', label:'Admin Panel',   to:'/admin'          }] : []),
  ];

  const nb = { fontFamily:"'Plus Jakarta Sans',sans-serif" };

  return (
    <>
      <nav style={{ position:'fixed', top:0, left:0, right:0, zIndex:1000, transition:'all .3s', ...nb,
        background: scrolled ? 'rgba(4,8,26,0.95)' : 'rgba(4,8,26,0.85)',
        backdropFilter: 'blur(20px)',
        borderBottom: `1px solid ${scrolled ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.06)'}`,
        boxShadow: scrolled ? '0 4px 24px rgba(0,0,0,0.4)' : 'none',
      }}>
        <div style={{ maxWidth:1300, margin:'0 auto', padding:'0 28px', display:'flex', alignItems:'center', height:64, gap:0 }}>

          {/* ── LOGO ── */}
          <Link to="/" style={{ display:'flex', alignItems:'center', gap:10, textDecoration:'none', marginRight:36, flexShrink:0 }}>
            <div style={{ width:36, height:36, borderRadius:11, background:'linear-gradient(135deg,#6366F1,#4f46e5)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:17, boxShadow:'0 4px 14px rgba(99,102,241,0.5)' }}>⚡</div>
            <span style={{ fontSize:17, fontWeight:800, color:'#F1F5F9', fontFamily:'Syne,sans-serif', letterSpacing:'-0.3px' }}>SkillSphere</span>
          </Link>

          {/* ── NAV LINKS ── */}
          <div style={{ display:'flex', alignItems:'center', gap:2, flex:1 }}>
            {visibleLinks.map(link => (
              <Link key={link.to} to={link.to} style={{
                padding:'8px 14px', borderRadius:10, fontSize:13, fontWeight:600,
                color: isActive(link.to) ? '#a5b4fc' : 'rgba(255,255,255,0.55)',
                textDecoration:'none', transition:'all .2s',
                background: isActive(link.to) ? 'rgba(99,102,241,0.15)' : 'transparent',
              }}
                onMouseEnter={e=>{ if(!isActive(link.to)){ e.target.style.color='#E2E8F0'; e.target.style.background='rgba(255,255,255,0.06)'; }}}
                onMouseLeave={e=>{ if(!isActive(link.to)){ e.target.style.color='rgba(255,255,255,0.55)'; e.target.style.background='transparent'; }}}>
                {link.label}
              </Link>
            ))}
          </div>

          {/* ── RIGHT ACTIONS ── */}
          <div style={{ display:'flex', alignItems:'center', gap:8, flexShrink:0 }}>

            {/* Search icon */}
            <div ref={searchRef} style={{ position:'relative' }}>
              <button onClick={openSearch} style={{ width:38, height:38, borderRadius:10, background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.1)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'rgba(255,255,255,0.6)', transition:'all .2s' }}
                onMouseEnter={e=>{ e.currentTarget.style.background='rgba(99,102,241,0.15)'; e.currentTarget.style.borderColor='rgba(99,102,241,0.35)'; }}
                onMouseLeave={e=>{ e.currentTarget.style.background='rgba(255,255,255,0.07)'; e.currentTarget.style.borderColor='rgba(255,255,255,0.1)'; }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              </button>
              {/* Search popup */}
              {searchOpen && (
                <div style={{ position:'absolute', right:0, top:'calc(100% + 10px)', width:320, background:'rgba(10,12,30,0.98)', border:'1px solid rgba(99,102,241,0.3)', borderRadius:16, boxShadow:'0 20px 60px rgba(0,0,0,0.6)', backdropFilter:'blur(40px)', overflow:'hidden', animation:'dropIn .2s ease both', zIndex:200 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:10, padding:'12px 16px', borderBottom:'1px solid rgba(255,255,255,0.07)' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(99,102,241,0.7)" strokeWidth="2.5" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                    <input ref={searchInp} type="text" placeholder="Search jobs, skills, freelancers..." value={searchQ} onChange={e=>setSearchQ(e.target.value)} onKeyDown={handleSearch}
                      style={{ flex:1, background:'transparent', border:'none', outline:'none', color:'#F1F5F9', fontSize:13, ...nb }} />
                    <span style={{ fontSize:11, color:'rgba(255,255,255,0.2)', background:'rgba(255,255,255,0.07)', padding:'2px 7px', borderRadius:5 }}>Enter ↵</span>
                  </div>
                  <div style={{ padding:'10px 12px' }}>
                    <div style={{ fontSize:11, color:'rgba(255,255,255,0.3)', letterSpacing:1, textTransform:'uppercase', marginBottom:8, padding:'0 4px' }}>Quick links</div>
                    {[
                      { icon:'💻', label:'React.js developers',  q:'React.js' },
                      { icon:'🎨', label:'UI/UX Designers',       q:'UI Design' },
                      { icon:'🤖', label:'Python ML engineers',   q:'Python Machine Learning' },
                      { icon:'📱', label:'Flutter developers',    q:'Flutter' },
                    ].map(s => (
                      <div key={s.q} onClick={()=>{ navigate(`/search?q=${encodeURIComponent(s.q)}`); setSearchOpen(false); setSearchQ(''); }} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 10px', borderRadius:10, cursor:'pointer', transition:'background .15s' }}
                        onMouseEnter={e=>e.currentTarget.style.background='rgba(99,102,241,0.12)'}
                        onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                        <span style={{ fontSize:16 }}>{s.icon}</span>
                        <span style={{ fontSize:13, color:'rgba(255,255,255,0.65)' }}>{s.label}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ padding:'10px 16px', borderTop:'1px solid rgba(255,255,255,0.07)', textAlign:'center' }}>
                    <Link to="/search" onClick={()=>setSearchOpen(false)} style={{ fontSize:12, color:'#818CF8', fontWeight:600, textDecoration:'none' }}>Open full search →</Link>
                  </div>
                </div>
              )}
            </div>

            {/* Pro badge (if subscribed) */}
            {user && user.subscriptionPlan && user.subscriptionPlan !== 'free' && (
              <Link to="/subscription" style={{ textDecoration:'none' }}>
                <span style={{ fontSize:10, fontWeight:800, padding:'3px 9px', borderRadius:999, background: PLAN_BADGE[user.subscriptionPlan]?.bg, color: PLAN_BADGE[user.subscriptionPlan]?.color, letterSpacing:1 }}>
                  {PLAN_BADGE[user.subscriptionPlan]?.label}
                </span>
              </Link>
            )}

            {/* Subscription upgrade (not subscribed) */}
            {user && (!user.subscriptionPlan || user.subscriptionPlan === 'free') && (
              <Link to="/subscription" style={{ textDecoration:'none' }}>
                <button style={{ padding:'7px 14px', borderRadius:10, background:'linear-gradient(135deg,rgba(99,102,241,0.2),rgba(34,211,238,0.1))', border:'1px solid rgba(99,102,241,0.4)', color:'#a5b4fc', fontSize:12, fontWeight:700, cursor:'pointer', ...nb, transition:'all .2s', display:'flex', alignItems:'center', gap:5 }}
                  onMouseEnter={e=>{ e.currentTarget.style.background='linear-gradient(135deg,rgba(99,102,241,0.35),rgba(34,211,238,0.15))'; e.currentTarget.style.boxShadow='0 4px 14px rgba(99,102,241,0.3)'; }}
                  onMouseLeave={e=>{ e.currentTarget.style.background='linear-gradient(135deg,rgba(99,102,241,0.2),rgba(34,211,238,0.1))'; e.currentTarget.style.boxShadow='none'; }}>
                  ⚡ Upgrade
                </button>
              </Link>
            )}

            {/* Chat */}
            {user && (
              <Link to="/chat">
                <button style={{ width:38, height:38, borderRadius:10, background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.1)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'rgba(255,255,255,0.6)', transition:'all .2s', position:'relative' }}
                  onMouseEnter={e=>{ e.currentTarget.style.background='rgba(99,102,241,0.15)'; e.currentTarget.style.borderColor='rgba(99,102,241,0.35)'; }}
                  onMouseLeave={e=>{ e.currentTarget.style.background='rgba(255,255,255,0.07)'; e.currentTarget.style.borderColor='rgba(255,255,255,0.1)'; }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                </button>
              </Link>
            )}

            {/* Notifications */}
            {user && (
              <div ref={notifRef} style={{ position:'relative' }}>
                <button onClick={openNotifs} style={{ width:38, height:38, borderRadius:10, background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.1)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'rgba(255,255,255,0.6)', transition:'all .2s', position:'relative' }}
                  onMouseEnter={e=>{ e.currentTarget.style.background='rgba(99,102,241,0.15)'; e.currentTarget.style.borderColor='rgba(99,102,241,0.35)'; }}
                  onMouseLeave={e=>{ e.currentTarget.style.background='rgba(255,255,255,0.07)'; e.currentTarget.style.borderColor='rgba(255,255,255,0.1)'; }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                  {unread > 0 && <div style={{ position:'absolute', top:-4, right:-4, width:17, height:17, borderRadius:'50%', background:'linear-gradient(135deg,#ef4444,#dc2626)', color:'#fff', fontSize:9, fontWeight:800, display:'flex', alignItems:'center', justifyContent:'center', border:'2px solid #04081A', animation:'pulse .8s ease-in-out infinite' }}>{unread > 9 ? '9+' : unread}</div>}
                </button>

                {/* Notification dropdown */}
                {notifOpen && (
                  <div style={{ position:'absolute', right:0, top:'calc(100% + 10px)', width:360, background:'rgba(10,12,30,0.98)', border:'1px solid rgba(99,102,241,0.25)', borderRadius:18, boxShadow:'0 24px 60px rgba(0,0,0,0.5)', backdropFilter:'blur(40px)', overflow:'hidden', animation:'dropIn .2s ease both', zIndex:200 }}>
                    <div style={{ padding:'14px 18px', borderBottom:'1px solid rgba(255,255,255,0.07)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                        <span style={{ fontSize:14, fontWeight:700, color:'#F1F5F9' }}>Notifications</span>
                        {unread > 0 && <span style={{ fontSize:10, fontWeight:800, padding:'2px 8px', borderRadius:999, background:'rgba(99,102,241,0.2)', color:'#818CF8' }}>{unread} new</span>}
                      </div>
                      {unread > 0 && <button onClick={markAllRead} style={{ fontSize:12, color:'#a78bfa', fontWeight:600, background:'none', border:'none', cursor:'pointer', ...nb }}>Mark all read</button>}
                    </div>
                    <div style={{ maxHeight:340, overflowY:'auto' }}>
                      {notifLoading ? (
                        <div style={{ padding:'32px', textAlign:'center', color:'rgba(255,255,255,0.3)', fontSize:13 }}>Loading…</div>
                      ) : notifs.length === 0 ? (
                        <div style={{ padding:'40px 20px', textAlign:'center' }}>
                          <div style={{ fontSize:36, marginBottom:10 }}>🔔</div>
                          <p style={{ color:'rgba(255,255,255,0.3)', fontSize:13, margin:0 }}>No notifications yet</p>
                        </div>
                      ) : notifs.map((n, i) => (
                        <Link key={n._id||i} to={n.link||'/'} onClick={()=>setNotifOpen(false)}
                          style={{ display:'flex', gap:12, padding:'13px 18px', textDecoration:'none', transition:'background .15s', borderBottom:'1px solid rgba(255,255,255,0.04)', background: n.isRead?'transparent':'rgba(99,102,241,0.05)' }}
                          onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,0.04)'}
                          onMouseLeave={e=>e.currentTarget.style.background=n.isRead?'transparent':'rgba(99,102,241,0.05)'}>
                          <div style={{ width:36, height:36, borderRadius:10, background:'rgba(99,102,241,0.12)', border:'1px solid rgba(99,102,241,0.2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, flexShrink:0 }}>
                            {NOTIF_ICONS[n.type]||'🔔'}
                          </div>
                          <div style={{ flex:1, minWidth:0 }}>
                            <div style={{ fontSize:13, fontWeight:n.isRead?400:700, color:'#E2E8F0', marginBottom:3, display:'flex', justifyContent:'space-between' }}>
                              <span>{n.title}</span>
                              {!n.isRead && <div style={{ width:6, height:6, borderRadius:'50%', background:'#6366F1', flexShrink:0, marginLeft:6, marginTop:4 }} />}
                            </div>
                            <div style={{ fontSize:12, color:'rgba(255,255,255,0.4)', marginBottom:4, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>{n.message}</div>
                            <div style={{ fontSize:11, color:'rgba(255,255,255,0.2)' }}>{timeAgo(n.createdAt)}</div>
                          </div>
                        </Link>
                      ))}
                    </div>
                    <div style={{ padding:'12px 18px', borderTop:'1px solid rgba(255,255,255,0.07)', textAlign:'center' }}>
                      <Link to="/notifications" onClick={()=>setNotifOpen(false)} style={{ fontSize:12, color:'#a78bfa', fontWeight:600, textDecoration:'none' }}>View all notifications →</Link>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Profile / Auth */}
            {user ? (
              <div ref={profileRef} style={{ position:'relative' }}>
                <button onClick={()=>{ setProfileOpen(o=>!o); setNotifOpen(false); }} style={{ display:'flex', alignItems:'center', gap:9, padding:'6px 12px 6px 6px', borderRadius:12, background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.1)', cursor:'pointer', transition:'all .2s', ...nb }}
                  onMouseEnter={e=>{ e.currentTarget.style.background='rgba(99,102,241,0.15)'; e.currentTarget.style.borderColor='rgba(99,102,241,0.35)'; }}
                  onMouseLeave={e=>{ e.currentTarget.style.background='rgba(255,255,255,0.07)'; e.currentTarget.style.borderColor='rgba(255,255,255,0.1)'; }}>
                  <div style={{ width:28, height:28, borderRadius:8, background:'linear-gradient(135deg,#6366F1,#22D3EE)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:800, color:'#fff', flexShrink:0 }}>
                    {user.name?.[0]?.toUpperCase()||'U'}
                  </div>
                  <span style={{ fontSize:13, fontWeight:600, color:'#E2E8F0', maxWidth:90, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user.name?.split(' ')[0]||'User'}</span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2.5" strokeLinecap="round" style={{ transition:'transform .2s', transform:profileOpen?'rotate(180deg)':'rotate(0deg)' }}><path d="m6 9 6 6 6-6"/></svg>
                </button>

                {/* Profile dropdown */}
                {profileOpen && (
                  <div style={{ position:'absolute', right:0, top:'calc(100% + 10px)', width:240, background:'rgba(10,12,30,0.98)', border:'1px solid rgba(99,102,241,0.2)', borderRadius:18, boxShadow:'0 24px 60px rgba(0,0,0,0.5)', backdropFilter:'blur(40px)', overflow:'hidden', animation:'dropIn .2s ease both', zIndex:200 }}>
                    {/* User info header */}
                    <div style={{ padding:'16px 18px', borderBottom:'1px solid rgba(255,255,255,0.07)' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:10 }}>
                        <div style={{ width:40, height:40, borderRadius:12, background:'linear-gradient(135deg,#6366F1,#22D3EE)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, fontWeight:800, color:'#fff', boxShadow:'0 4px 12px rgba(99,102,241,0.4)' }}>
                          {user.name?.[0]?.toUpperCase()||'U'}
                        </div>
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ fontSize:14, fontWeight:700, color:'#F1F5F9', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user.name}</div>
                          <div style={{ fontSize:11, color:'rgba(255,255,255,0.4)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user.email}</div>
                        </div>
                      </div>
                      <div style={{ display:'flex', gap:6 }}>
                        <span style={{ fontSize:10, fontWeight:700, padding:'3px 9px', borderRadius:999, background:'rgba(99,102,241,0.15)', color:'#818CF8', textTransform:'capitalize' }}>{user.role}</span>
                        {user.isPro && <span style={{ fontSize:10, fontWeight:700, padding:'3px 9px', borderRadius:999, background:'rgba(99,102,241,0.2)', color:'#a5b4fc' }}>PRO ⚡</span>}
                        {user.isVerified && <span style={{ fontSize:10, fontWeight:700, padding:'3px 9px', borderRadius:999, background:'rgba(34,197,94,0.12)', color:'#4ade80' }}>✓ Verified</span>}
                      </div>
                    </div>

                    {/* Menu items */}
                    <div style={{ padding:'8px' }}>
                      {dropItems.map(item => (
                        <Link key={item.to} to={item.to} onClick={()=>setProfileOpen(false)}
                          style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 12px', borderRadius:10, color: item.highlight ? '#a5b4fc' : 'rgba(255,255,255,0.65)', textDecoration:'none', fontSize:13, fontWeight: item.highlight ? 700 : 500, transition:'all .15s', background: item.highlight ? 'rgba(99,102,241,0.08)' : 'transparent', border: item.highlight ? '1px solid rgba(99,102,241,0.2)' : '1px solid transparent', marginBottom: item.highlight ? 4 : 0 }}
                          onMouseEnter={e=>{ e.currentTarget.style.background = item.highlight ? 'rgba(99,102,241,0.18)' : 'rgba(255,255,255,0.07)'; e.currentTarget.style.color='#F1F5F9'; }}
                          onMouseLeave={e=>{ e.currentTarget.style.background = item.highlight ? 'rgba(99,102,241,0.08)' : 'transparent'; e.currentTarget.style.color = item.highlight ? '#a5b4fc' : 'rgba(255,255,255,0.65)'; }}>
                          <span style={{ fontSize:15, width:20, textAlign:'center', flexShrink:0 }}>{item.icon}</span>
                          {item.label}
                          {item.highlight && <span style={{ marginLeft:'auto', fontSize:10, background:'linear-gradient(135deg,#6366F1,#22D3EE)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', fontWeight:800 }}>NEW</span>}
                        </Link>
                      ))}
                    </div>

                    {/* Credits & referral */}
                    {user.credits > 0 && (
                      <div style={{ margin:'0 8px 8px', padding:'10px 12px', background:'rgba(251,191,36,0.08)', border:'1px solid rgba(251,191,36,0.2)', borderRadius:10 }}>
                        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                          <span style={{ fontSize:12, color:'rgba(255,255,255,0.5)' }}>🪙 Credits</span>
                          <span style={{ fontSize:14, fontWeight:800, color:'#fbbf24' }}>{user.credits?.toLocaleString()}</span>
                        </div>
                      </div>
                    )}

                    {/* Sign out */}
                    <div style={{ padding:'8px', borderTop:'1px solid rgba(255,255,255,0.07)' }}>
                      <button onClick={handleLogout} style={{ width:'100%', display:'flex', alignItems:'center', gap:10, padding:'9px 12px', borderRadius:10, color:'#f87171', background:'transparent', border:'none', cursor:'pointer', fontSize:13, fontWeight:600, ...nb, transition:'all .15s', textAlign:'left' }}
                        onMouseEnter={e=>{ e.currentTarget.style.background='rgba(239,68,68,0.1)'; }}
                        onMouseLeave={e=>{ e.currentTarget.style.background='transparent'; }}>
                        <span style={{ fontSize:15, width:20, textAlign:'center' }}>🚪</span>
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Not logged in */
              <div style={{ display:'flex', gap:8 }}>
                <Link to="/login">
                  <button style={{ padding:'8px 18px', borderRadius:10, background:'transparent', border:'1px solid rgba(255,255,255,0.15)', color:'rgba(255,255,255,0.7)', fontSize:13, fontWeight:600, cursor:'pointer', ...nb, transition:'all .2s' }}
                    onMouseEnter={e=>{ e.target.style.borderColor='rgba(99,102,241,0.5)'; e.target.style.color='#a5b4fc'; }}
                    onMouseLeave={e=>{ e.target.style.borderColor='rgba(255,255,255,0.15)'; e.target.style.color='rgba(255,255,255,0.7)'; }}>
                    Sign In
                  </button>
                </Link>
                <Link to="/register">
                  <button style={{ padding:'8px 18px', borderRadius:10, background:'linear-gradient(135deg,#6366F1,#4f46e5)', border:'none', color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer', ...nb, boxShadow:'0 4px 14px rgba(99,102,241,0.4)', transition:'all .2s' }}
                    onMouseEnter={e=>{ e.target.style.boxShadow='0 6px 20px rgba(99,102,241,0.6)'; }}
                    onMouseLeave={e=>{ e.target.style.boxShadow='0 4px 14px rgba(99,102,241,0.4)'; }}>
                    Get Started
                  </button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Spacer for fixed navbar */}
      <div style={{ height:64 }} />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        @keyframes dropIn  { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse   { 0%,100%{transform:scale(1)} 50%{transform:scale(1.2)} }
        ::-webkit-scrollbar { width:4px; }
        ::-webkit-scrollbar-thumb { background:rgba(99,102,241,0.4); border-radius:2px; }
      `}</style>
    </>
  );
};

export default Navbar;
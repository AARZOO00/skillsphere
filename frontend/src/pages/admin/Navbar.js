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

  const [scrolled,    setScrolled]    = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen,   setNotifOpen]   = useState(false);
  const [searchOpen,  setSearchOpen]  = useState(false);
  const [searchQ,     setSearchQ]     = useState('');
  const [notifs,      setNotifs]      = useState([]);
  const [unread,      setUnread]      = useState(0);

  const profileRef = useRef(null);
  const notifRef   = useRef(null);
  const searchRef  = useRef(null);
  const searchInp  = useRef(null);

  const isActive = (p) => location.pathname === p || location.pathname.startsWith(p+'/');

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

  useEffect(() => {
    if (!user) return;
    api.get('/notifications').then(r => {
      const list = r.data?.notifications || [];
      setNotifs(list.slice(0,6));
      setUnread(list.filter(n=>!n.isRead).length);
    }).catch(()=>{});
  }, [user]);

  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast.success('Signed out');
    navigate('/login');
    setProfileOpen(false);
  };

  const handleSearch = (e) => {
    if (e.key==='Enter' && searchQ.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQ.trim())}`);
      setSearchOpen(false); setSearchQ('');
    }
  };

  const markAllRead = () => {
    api.patch('/notifications/read-all').catch(()=>{});
    setUnread(0); setNotifs(n=>n.map(x=>({...x,isRead:true})));
  };

  const timeAgo = (d) => {
    if (!d) return '';
    const diff = Date.now()-new Date(d);
    if (diff<60000) return 'just now';
    if (diff<3600000) return `${Math.floor(diff/60000)}m ago`;
    if (diff<86400000) return `${Math.floor(diff/3600000)}h ago`;
    return `${Math.floor(diff/86400000)}d ago`;
  };

  const NAV_LINKS = [
    { label:'Browse Jobs',  to:'/gigs',           roles:null },
    { label:'Find Talent',  to:'/freelancers',     roles:null },
    { label:'Dashboard',    to:'/dashboard',       roles:['client','freelancer','admin'] },
    { label:'My Gigs',      to:'/my-gigs',         roles:['client'] },
    { label:'My Proposals', to:'/my-proposals',    roles:['freelancer'] },
  ];

  const DROP_ITEMS = [
    { icon:'👤', label:'My Profile',       to:`/profile/${user?._id}` },
    { icon:'⚙️', label:'Settings',         to:'/settings' },
    ...(user?.role==='client'     ? [{ icon:'📌', label:'My Gigs',       to:'/my-gigs' }]         : []),
    ...(user?.role==='freelancer' ? [{ icon:'📋', label:'My Proposals',  to:'/my-proposals' }]    : []),
    { icon:'💳', label:'Payments',          to:'/payments' },
    { icon:'⚡', label:'Upgrade to Pro',    to:'/subscription', gold:true },
    { icon:'🎁', label:'Referral & Rewards',to:'/referral' },
    ...(user?.role==='admin'      ? [{ icon:'🛡️', label:'Admin Panel',   to:'/admin' }]           : []),
  ];

  const F = { fontFamily:"'Plus Jakarta Sans',sans-serif" };
  const visibleLinks = NAV_LINKS.filter(l=>!l.roles||(user&&l.roles.includes(user.role)));

  const iconBtn = (onClick, children, badge=0, ref=null) => (
    <button ref={ref} onClick={onClick} style={{ width:38,height:38,borderRadius:10,background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.1)',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',color:'rgba(255,255,255,0.6)',transition:'all .2s',position:'relative',...F }}
      onMouseEnter={e=>{e.currentTarget.style.background='rgba(96,165,250,0.12)';e.currentTarget.style.borderColor='rgba(96,165,250,0.35)';}}
      onMouseLeave={e=>{e.currentTarget.style.background='rgba(255,255,255,0.06)';e.currentTarget.style.borderColor='rgba(255,255,255,0.1)';}}>
      {children}
      {badge>0&&<div style={{position:'absolute',top:-4,right:-4,width:17,height:17,borderRadius:'50%',background:'linear-gradient(135deg,#D4AF37,#F59E0B)',color:'#020918',fontSize:9,fontWeight:800,display:'flex',alignItems:'center',justifyContent:'center',border:'2px solid #020918',animation:'ss-pulse .9s ease-in-out infinite'}}>{badge>9?'9+':badge}</div>}
    </button>
  );

  const NOTIF_ICONS = {new_bid:'🤝',bid_accepted:'🎉',bid_rejected:'❌',message:'💬',new_gig:'📌',payment:'💰',system:'🔔'};

  return (
    <>
      <nav style={{ position:'fixed',top:0,left:0,right:0,zIndex:1000,...F,
        background: scrolled?'rgba(2,9,24,0.97)':'rgba(2,9,24,0.88)',
        backdropFilter:'blur(20px)',
        borderBottom:`1px solid ${scrolled?'rgba(212,175,55,0.18)':'rgba(255,255,255,0.06)'}`,
        boxShadow: scrolled?'0 4px 24px rgba(0,0,0,0.5)':'none',
        transition:'all .3s',
      }}>

        {/* Gold accent line at top */}
        <div style={{ position:'absolute',top:0,left:0,right:0,height:2,background:'linear-gradient(90deg,transparent,rgba(212,175,55,0.5),rgba(96,165,250,0.5),transparent)' }} />

        <div style={{ maxWidth:1300,margin:'0 auto',padding:'0 28px',display:'flex',alignItems:'center',height:64,gap:0 }}>

          {/* Logo */}
          <Link to="/" style={{ display:'flex',alignItems:'center',gap:10,textDecoration:'none',marginRight:36,flexShrink:0 }}>
            <div style={{ width:36,height:36,borderRadius:11,background:'linear-gradient(135deg,#1A56DB,#1E40AF)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:17,boxShadow:'0 4px 14px rgba(26,86,219,0.5)' }}>⚡</div>
            <span style={{ fontSize:17,fontWeight:800,background:'linear-gradient(135deg,#93C5FD,#D4AF37)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',fontFamily:"'Syne',sans-serif",letterSpacing:'-0.3px' }}>SkillSphere</span>
          </Link>

          {/* Nav links */}
          <div style={{ display:'flex',alignItems:'center',gap:2,flex:1 }}>
            {visibleLinks.map(link=>(
              <Link key={link.to} to={link.to} style={{ padding:'7px 13px',borderRadius:9,fontSize:13,fontWeight:600,color:isActive(link.to)?'#60A5FA':'rgba(255,255,255,0.5)',textDecoration:'none',transition:'all .2s',background:isActive(link.to)?'rgba(26,86,219,0.15)':'transparent',borderBottom:isActive(link.to)?'2px solid rgba(96,165,250,0.6)':'2px solid transparent' }}
                onMouseEnter={e=>{if(!isActive(link.to)){e.target.style.color='#E2E8F0';e.target.style.background='rgba(255,255,255,0.05)';}}}
                onMouseLeave={e=>{if(!isActive(link.to)){e.target.style.color='rgba(255,255,255,0.5)';e.target.style.background='transparent';}}}>
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right actions */}
          <div style={{ display:'flex',alignItems:'center',gap:8,flexShrink:0 }}>

            {/* Search */}
            <div ref={searchRef} style={{ position:'relative' }}>
              {iconBtn(()=>{ setSearchOpen(o=>!o); setProfileOpen(false); setNotifOpen(false); setTimeout(()=>searchInp.current?.focus(),80); },
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              )}
              {searchOpen && (
                <div style={{ position:'absolute',right:0,top:'calc(100% + 10px)',width:310,background:'rgba(2,9,24,0.98)',border:'1px solid rgba(212,175,55,0.2)',borderRadius:16,boxShadow:'0 20px 60px rgba(0,0,0,0.6)',backdropFilter:'blur(40px)',overflow:'hidden',animation:'ss-dropIn .2s ease both',zIndex:200 }}>
                  <div style={{ display:'flex',alignItems:'center',gap:10,padding:'11px 15px',borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(212,175,55,0.7)" strokeWidth="2.5" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                    <input ref={searchInp} type="text" placeholder="Search jobs, skills, freelancers..." value={searchQ} onChange={e=>setSearchQ(e.target.value)} onKeyDown={handleSearch}
                      style={{ flex:1,background:'transparent',border:'none',outline:'none',color:'#F1F5F9',fontSize:13,...F }} />
                    <kbd style={{ fontSize:10,color:'rgba(255,255,255,0.2)',background:'rgba(255,255,255,0.06)',padding:'2px 7px',borderRadius:5,border:'1px solid rgba(255,255,255,0.1)' }}>↵</kbd>
                  </div>
                  <div style={{ padding:'8px' }}>
                    {[{icon:'💻',q:'React.js developer'},{icon:'🎨',q:'UI/UX Designer'},{icon:'🤖',q:'Python ML engineer'},{icon:'📱',q:'Flutter developer'}].map(s=>(
                      <div key={s.q} onClick={()=>{ navigate(`/search?q=${encodeURIComponent(s.q)}`); setSearchOpen(false); setSearchQ(''); }} style={{ display:'flex',alignItems:'center',gap:10,padding:'8px 10px',borderRadius:9,cursor:'pointer',transition:'background .15s',fontSize:13,color:'rgba(255,255,255,0.6)' }}
                        onMouseEnter={e=>e.currentTarget.style.background='rgba(212,175,55,0.08)'}
                        onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                        <span style={{ fontSize:15 }}>{s.icon}</span>{s.q}
                      </div>
                    ))}
                  </div>
                  <div style={{ padding:'10px 15px',borderTop:'1px solid rgba(255,255,255,0.06)',textAlign:'center' }}>
                    <Link to="/search" onClick={()=>setSearchOpen(false)} style={{ fontSize:12,color:'#D4AF37',fontWeight:600,textDecoration:'none' }}>Open full search →</Link>
                  </div>
                </div>
              )}
            </div>

            {/* Upgrade button */}
            {user && (!user.subscriptionPlan || user.subscriptionPlan==='free') && (
              <Link to="/subscription" style={{ textDecoration:'none' }}>
                <button style={{ padding:'7px 14px',borderRadius:10,background:'linear-gradient(135deg,rgba(212,175,55,0.18),rgba(251,191,36,0.1))',border:'1px solid rgba(212,175,55,0.38)',color:'#D4AF37',fontSize:12,fontWeight:700,cursor:'pointer',...F,transition:'all .22s',display:'flex',alignItems:'center',gap:5 }}
                  onMouseEnter={e=>{ e.currentTarget.style.background='linear-gradient(135deg,rgba(212,175,55,0.3),rgba(251,191,36,0.18))'; e.currentTarget.style.boxShadow='0 4px 14px rgba(212,175,55,0.3)'; }}
                  onMouseLeave={e=>{ e.currentTarget.style.background='linear-gradient(135deg,rgba(212,175,55,0.18),rgba(251,191,36,0.1))'; e.currentTarget.style.boxShadow='none'; }}>
                  ✦ Upgrade
                </button>
              </Link>
            )}

            {/* PRO/ELITE badge */}
            {user?.subscriptionPlan && user.subscriptionPlan!=='free' && (
              <Link to="/subscription" style={{ textDecoration:'none' }}>
                <span style={{ fontSize:10,fontWeight:800,padding:'4px 10px',borderRadius:999,background:'linear-gradient(135deg,rgba(26,86,219,0.2),rgba(212,175,55,0.2))',color:'#D4AF37',border:'1px solid rgba(212,175,55,0.38)',letterSpacing:1 }}>
                  {user.subscriptionPlan==='elite'?'👑 ELITE':'⚡ PRO'}
                </span>
              </Link>
            )}

            {/* Chat */}
            {user && <Link to="/chat">{iconBtn(()=>{}, <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>)}</Link>}

            {/* Notifications */}
            {user && (
              <div ref={notifRef} style={{ position:'relative' }}>
                {iconBtn(()=>{ setNotifOpen(o=>!o); setProfileOpen(false); },
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
                  unread
                )}
                {notifOpen && (
                  <div style={{ position:'absolute',right:0,top:'calc(100% + 10px)',width:360,background:'rgba(2,9,24,0.98)',border:'1px solid rgba(212,175,55,0.2)',borderRadius:18,boxShadow:'0 24px 60px rgba(0,0,0,0.6)',backdropFilter:'blur(40px)',overflow:'hidden',animation:'ss-dropIn .2s ease both',zIndex:200 }}>
                    <div style={{ padding:'13px 18px',borderBottom:'1px solid rgba(255,255,255,0.06)',display:'flex',justifyContent:'space-between',alignItems:'center' }}>
                      <div style={{ display:'flex',alignItems:'center',gap:8 }}>
                        <span style={{ fontSize:14,fontWeight:700,color:'#F1F5F9' }}>Notifications</span>
                        {unread>0&&<span style={{ fontSize:10,fontWeight:800,padding:'2px 8px',borderRadius:999,background:'rgba(212,175,55,0.15)',color:'#D4AF37',border:'1px solid rgba(212,175,55,0.3)' }}>{unread} new</span>}
                      </div>
                      {unread>0&&<button onClick={markAllRead} style={{ fontSize:12,color:'#60A5FA',fontWeight:600,background:'none',border:'none',cursor:'pointer',...F }}>Mark all read</button>}
                    </div>
                    <div style={{ maxHeight:340,overflowY:'auto' }}>
                      {notifs.length===0
                        ? <div style={{ padding:'40px',textAlign:'center',color:'rgba(255,255,255,0.25)',fontSize:13 }}>No notifications yet</div>
                        : notifs.map((n,i)=>(
                          <Link key={n._id||i} to={n.link||'/'} onClick={()=>setNotifOpen(false)}
                            style={{ display:'flex',gap:12,padding:'12px 18px',textDecoration:'none',transition:'background .15s',borderBottom:'1px solid rgba(255,255,255,0.04)',background:n.isRead?'transparent':'rgba(212,175,55,0.04)' }}
                            onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,0.04)'}
                            onMouseLeave={e=>e.currentTarget.style.background=n.isRead?'transparent':'rgba(212,175,55,0.04)'}>
                            <div style={{ width:34,height:34,borderRadius:9,background:'rgba(26,86,219,0.15)',border:'1px solid rgba(96,165,250,0.2)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:15,flexShrink:0 }}>{NOTIF_ICONS[n.type]||'🔔'}</div>
                            <div style={{ flex:1,minWidth:0 }}>
                              <div style={{ fontSize:13,fontWeight:n.isRead?400:700,color:'#E2E8F0',marginBottom:3,display:'flex',justifyContent:'space-between' }}>
                                <span>{n.title}</span>
                                {!n.isRead&&<div style={{ width:6,height:6,borderRadius:'50%',background:'#D4AF37',flexShrink:0,marginLeft:6,marginTop:4 }} />}
                              </div>
                              <div style={{ fontSize:12,color:'rgba(255,255,255,0.38)',marginBottom:3 }}>{n.message}</div>
                              <div style={{ fontSize:11,color:'rgba(255,255,255,0.2)' }}>{timeAgo(n.createdAt)}</div>
                            </div>
                          </Link>
                        ))
                      }
                    </div>
                    <div style={{ padding:'10px 18px',borderTop:'1px solid rgba(255,255,255,0.06)',textAlign:'center' }}>
                      <Link to="/notifications" onClick={()=>setNotifOpen(false)} style={{ fontSize:12,color:'#D4AF37',fontWeight:600,textDecoration:'none' }}>View all →</Link>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Profile */}
            {user ? (
              <div ref={profileRef} style={{ position:'relative' }}>
                <button onClick={()=>{ setProfileOpen(o=>!o); setNotifOpen(false); }} style={{ display:'flex',alignItems:'center',gap:8,padding:'5px 11px 5px 5px',borderRadius:12,background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.1)',cursor:'pointer',transition:'all .2s',...F }}
                  onMouseEnter={e=>{ e.currentTarget.style.background='rgba(96,165,250,0.1)'; e.currentTarget.style.borderColor='rgba(96,165,250,0.35)'; }}
                  onMouseLeave={e=>{ e.currentTarget.style.background='rgba(255,255,255,0.06)'; e.currentTarget.style.borderColor='rgba(255,255,255,0.1)'; }}>
                  <div style={{ width:28,height:28,borderRadius:8,background:'linear-gradient(135deg,#1A56DB,#D4AF37)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:800,color:'#fff',flexShrink:0 }}>
                    {user.name?.[0]?.toUpperCase()||'U'}
                  </div>
                  <span style={{ fontSize:13,fontWeight:600,color:'#E2E8F0',maxWidth:80,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{user.name?.split(' ')[0]||'User'}</span>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.38)" strokeWidth="2.5" strokeLinecap="round" style={{ transition:'transform .2s',transform:profileOpen?'rotate(180deg)':'rotate(0deg)' }}><path d="m6 9 6 6 6-6"/></svg>
                </button>

                {profileOpen && (
                  <div style={{ position:'absolute',right:0,top:'calc(100% + 10px)',width:235,background:'rgba(2,9,24,0.98)',border:'1px solid rgba(212,175,55,0.18)',borderRadius:18,boxShadow:'0 24px 60px rgba(0,0,0,0.6)',backdropFilter:'blur(40px)',overflow:'hidden',animation:'ss-dropIn .2s ease both',zIndex:200 }}>
                    {/* User header */}
                    <div style={{ padding:'15px 17px',borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
                      <div style={{ display:'flex',alignItems:'center',gap:10,marginBottom:9 }}>
                        <div style={{ width:38,height:38,borderRadius:11,background:'linear-gradient(135deg,#1A56DB,#D4AF37)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:15,fontWeight:800,color:'#fff',boxShadow:'0 4px 12px rgba(26,86,219,0.4)' }}>
                          {user.name?.[0]?.toUpperCase()||'U'}
                        </div>
                        <div style={{ flex:1,minWidth:0 }}>
                          <div style={{ fontSize:13,fontWeight:700,color:'#F1F5F9',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{user.name}</div>
                          <div style={{ fontSize:11,color:'rgba(255,255,255,0.38)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{user.email}</div>
                        </div>
                      </div>
                      <div style={{ display:'flex',gap:5,flexWrap:'wrap' }}>
                        <span style={{ fontSize:10,fontWeight:700,padding:'2px 8px',borderRadius:999,background:'rgba(26,86,219,0.18)',color:'#60A5FA',border:'1px solid rgba(96,165,250,0.28)',textTransform:'capitalize' }}>{user.role}</span>
                        {user.isPro&&<span style={{ fontSize:10,fontWeight:700,padding:'2px 8px',borderRadius:999,background:'rgba(212,175,55,0.15)',color:'#D4AF37',border:'1px solid rgba(212,175,55,0.3)' }}>PRO ⚡</span>}
                        {user.isVerified&&<span style={{ fontSize:10,fontWeight:700,padding:'2px 8px',borderRadius:999,background:'rgba(34,197,94,0.1)',color:'#4ade80',border:'1px solid rgba(34,197,94,0.25)' }}>✓ Verified</span>}
                      </div>
                    </div>

                    <div style={{ padding:'7px' }}>
                      {DROP_ITEMS.map(item=>(
                        <Link key={item.to} to={item.to} onClick={()=>setProfileOpen(false)}
                          style={{ display:'flex',alignItems:'center',gap:9,padding:'8px 11px',borderRadius:9,color:item.gold?'#D4AF37':'rgba(255,255,255,0.6)',textDecoration:'none',fontSize:13,fontWeight:item.gold?700:500,transition:'all .15s',background:item.gold?'rgba(212,175,55,0.06)':'transparent',border:item.gold?'1px solid rgba(212,175,55,0.18)':'1px solid transparent',marginBottom:item.gold?3:0 }}
                          onMouseEnter={e=>{ e.currentTarget.style.background=item.gold?'rgba(212,175,55,0.15)':'rgba(96,165,250,0.1)'; e.currentTarget.style.color=item.gold?'#FBBF24':'#F1F5F9'; }}
                          onMouseLeave={e=>{ e.currentTarget.style.background=item.gold?'rgba(212,175,55,0.06)':'transparent'; e.currentTarget.style.color=item.gold?'#D4AF37':'rgba(255,255,255,0.6)'; }}>
                          <span style={{ fontSize:14,width:20,textAlign:'center',flexShrink:0 }}>{item.icon}</span>
                          {item.label}
                          {item.gold&&<span style={{ marginLeft:'auto',fontSize:9,background:'linear-gradient(135deg,#1A56DB,#D4AF37)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',fontWeight:800,letterSpacing:0.5 }}>NEW</span>}
                        </Link>
                      ))}
                    </div>

                    {user.credits>0&&(
                      <div style={{ margin:'0 7px 7px',padding:'9px 11px',background:'rgba(212,175,55,0.07)',border:'1px solid rgba(212,175,55,0.2)',borderRadius:10,display:'flex',justifyContent:'space-between',alignItems:'center' }}>
                        <span style={{ fontSize:12,color:'rgba(255,255,255,0.42)' }}>🪙 Credits</span>
                        <span style={{ fontSize:14,fontWeight:800,color:'#D4AF37' }}>{user.credits?.toLocaleString()}</span>
                      </div>
                    )}

                    <div style={{ padding:'7px',borderTop:'1px solid rgba(255,255,255,0.06)' }}>
                      <button onClick={handleLogout} style={{ width:'100%',display:'flex',alignItems:'center',gap:9,padding:'8px 11px',borderRadius:9,color:'#f87171',background:'transparent',border:'none',cursor:'pointer',fontSize:13,fontWeight:600,...F,transition:'all .15s',textAlign:'left' }}
                        onMouseEnter={e=>e.currentTarget.style.background='rgba(239,68,68,0.1)'}
                        onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                        <span style={{ fontSize:14,width:20,textAlign:'center' }}>🚪</span>Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ display:'flex',gap:8 }}>
                <Link to="/login"><button style={{ padding:'8px 18px',borderRadius:10,background:'transparent',border:'1px solid rgba(255,255,255,0.14)',color:'rgba(255,255,255,0.65)',fontSize:13,fontWeight:600,cursor:'pointer',...F,transition:'all .2s' }}
                  onMouseEnter={e=>{ e.target.style.borderColor='rgba(96,165,250,0.5)'; e.target.style.color='#60A5FA'; }}
                  onMouseLeave={e=>{ e.target.style.borderColor='rgba(255,255,255,0.14)'; e.target.style.color='rgba(255,255,255,0.65)'; }}>Sign In</button></Link>
                <Link to="/register"><button style={{ padding:'8px 18px',borderRadius:10,background:'linear-gradient(135deg,#D4AF37,#F59E0B)',border:'none',color:'#020918',fontSize:13,fontWeight:800,cursor:'pointer',...F,boxShadow:'0 4px 14px rgba(212,175,55,0.38)',transition:'all .2s' }}
                  onMouseEnter={e=>{ e.target.style.boxShadow='0 6px 20px rgba(212,175,55,0.58)'; e.target.style.transform='translateY(-1px)'; }}
                  onMouseLeave={e=>{ e.target.style.boxShadow='0 4px 14px rgba(212,175,55,0.38)'; e.target.style.transform='translateY(0)'; }}>Get Started</button></Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      <div style={{ height:64 }} />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        @keyframes ss-dropIn { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes ss-pulse  { 0%,100%{transform:scale(1)} 50%{transform:scale(1.2)} }
        @keyframes ss-spin   { to{transform:rotate(360deg)} }
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-thumb{background:rgba(96,165,250,0.3);border-radius:2px}
      `}</style>
    </>
  );
};

export default Navbar;
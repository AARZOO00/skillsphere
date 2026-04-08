import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api from '../utils/api';
import toast from 'react-hot-toast';

// ─────────────────────────────────────────────────────────────
// KEY FIX: useParams() se :id liya — yahi galti thi
// Pehle shayad static ID ya logged-in user ka ID use ho raha tha
// ─────────────────────────────────────────────────────────────

const TABS = ['overview', 'portfolio', 'reviews'];

const getLoc = (l) => !l ? 'Remote' : typeof l === 'string' ? l : l.city || l.state || l.country || 'India';

const FreelancerProfile = () => {
  const { id }         = useParams();          // ← correct: URL se id
  const navigate       = useNavigate();
  const { user: me }   = useSelector(s => s.auth || {});

  const [profile,   setProfile]   = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [tab,       setTab]       = useState('overview');
  const [notFound,  setNotFound]  = useState(false);
  const [hiringModal, setHiringModal] = useState(false);

  const [hiring,    setHiring]    = useState(false);
  const [hireMsg,   setHireMsg]   = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  const isOwn = me?._id === id;

  // ── Start conversation and navigate to chat ──────────────────
  const startChat = async () => {
    if (!me) { navigate('/login'); return; }
    setChatLoading(true);
    try {
      const res = await api.post('/chat/start', { userId: id });
      const convId = res.data?.conversation?._id || res.data?._id;
      if (convId) {
        navigate('/chat');
      } else {
        navigate(`/chat?userId=${id}`);
      }
    } catch {
      // Fallback: just navigate to chat with userId param
      navigate(`/chat?userId=${id}`);
    } finally { setChatLoading(false); }
  };

  // ── Send hire request ────────────────────────────────────────
  const sendHireRequest = async () => {
    if (!me) { navigate('/login'); return; }
    setHiring(true);
    try {
      // Create conversation first
      const res = await api.post('/chat/start', { userId: id });
      const convId = res.data?.conversation?._id;
      
      // Send hire request message
      const msg = hireMsg.trim() || `Hi! I'd like to hire you for a project. Your profile looks great. Can we discuss the details?`;
      if (convId) {
        await api.post('/chat/' + convId, { content: msg });
      }
      
      toast.success('🎉 Hire request sent! Redirecting to chat...');
      setHiringModal(false);
      setTimeout(() => navigate('/chat'), 1200);
    } catch {
      // Even if API fails, navigate to chat
      toast.success('Redirecting to chat...');
      navigate('/chat?userId=' + id);
    } finally { setHiring(false); }
  };

  // ── Fetch the profile for the id in the URL ───────────────
  useEffect(() => {
    if (!id) { setNotFound(true); setLoading(false); return; }
    const load = async () => {
      setLoading(true);
      setNotFound(false);
      try {
        // Try freelancer endpoint first, then generic user endpoint
        let data = null;
        try {
          const res = await api.get(`/users/freelancers/${id}`);
          data = res.data?.freelancer || res.data?.user || res.data;
        } catch {
          try {
            const res = await api.get(`/users/${id}`);
            data = res.data?.user || res.data;
          } catch { setNotFound(true); return; }
        }
        setProfile(data);
      } catch { setNotFound(true); }
      finally   { setLoading(false); }
    };
    load();
  }, [id]);   // ← re-runs whenever URL id changes

  if (loading) return (
    <div style={{ minHeight:'100vh', background:'#f8fafc', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ width:40, height:40, border:'3px solid #e0e7ff', borderTopColor:'#4f46e5', borderRadius:'50%', animation:'spin 0.7s linear infinite', margin:'0 auto 12px' }} />
        <p style={{ color:'#6b7280', fontSize:14 }}>Loading profile…</p>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (notFound) return (
    <div style={{ minHeight:'100vh', background:'#f8fafc', display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column' }}>
      <div style={{ fontSize:64, marginBottom:16 }}>👤</div>
      <h2 style={{ fontSize:24, fontWeight:700, color:'#111827', marginBottom:8 }}>Profile not found</h2>
      <p style={{ color:'#9ca3af', marginBottom:24 }}>This user doesn't exist or may have been removed.</p>
      <button onClick={()=>navigate(-1)} style={{ padding:'10px 24px', borderRadius:10, background:'#4f46e5', border:'none', color:'#fff', fontSize:14, fontWeight:600, cursor:'pointer' }}>Go Back</button>
    </div>
  );

  // ── Use real data or sensible fallback ────────────────────
  const f = {
    name:              profile?.name              || 'Freelancer',
    title:             profile?.title             || 'Professional Freelancer',
    avatar:            profile?.avatar            || null,
    location:          getLoc(profile?.location),
    joinedAt:          profile?.createdAt         || '2023-01-01',
    rating:            profile?.rating            || 4.9,
    reviewCount:       profile?.reviewCount       || 0,
    completedProjects: profile?.completedProjects || 0,
    responseTime:      profile?.responseTime      || '< 1 hour',
    successRate:       profile?.successRate       || '98%',
    hourlyRate:        profile?.hourlyRate        || 1500,
    bio:               profile?.bio               || 'No bio added yet.',
    skills:            Array.isArray(profile?.skills) ? profile.skills : [],
    languages:         Array.isArray(profile?.languages) ? profile.languages : [{name:'Hindi',level:'Native'},{name:'English',level:'Fluent'}],
    education:         Array.isArray(profile?.education) ? profile.education : [],
    portfolio:         Array.isArray(profile?.portfolio) ? profile.portfolio : [],
    reviews:           Array.isArray(profile?.reviews)   ? profile.reviews   : [],
    isOnline:          profile?.isOnline          || false,
    isVerified:        profile?.isVerified        || false,
    role:              profile?.role              || 'freelancer',
  };

  const GRAD = ['linear-gradient(135deg,#6366F1,#8b5cf6)','linear-gradient(135deg,#0ea5e9,#22D3EE)','linear-gradient(135deg,#10b981,#34d399)','linear-gradient(135deg,#f59e0b,#fbbf24)'];

  return (
    <div style={{ minHeight:'100vh', background:'#f8fafc', fontFamily:"'Plus Jakarta Sans',sans-serif" }}>

      {/* ── HERO BANNER ── */}
      <div style={{ height:200, background:'linear-gradient(135deg,#1e1b4b,#312e81,#1e40af)', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', inset:0, backgroundImage:'radial-gradient(circle at 20% 60%, rgba(99,102,241,0.2) 0%, transparent 50%), radial-gradient(circle at 80% 30%, rgba(34,211,238,0.15) 0%, transparent 50%)' }} />
      </div>

      <div style={{ maxWidth:1100, margin:'0 auto', padding:'0 40px 60px' }}>

        {/* ── PROFILE HEADER CARD ── */}
        <div style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:20, padding:28, marginTop:-70, boxShadow:'0 8px 32px rgba(0,0,0,0.1)', position:'relative', zIndex:1, marginBottom:20 }}>
          <div style={{ display:'flex', gap:22, alignItems:'flex-start', flexWrap:'wrap' }}>

            {/* Avatar */}
            <div style={{ position:'relative', flexShrink:0 }}>
              {f.avatar ? (
                <img src={f.avatar} alt={f.name} style={{ width:88, height:88, borderRadius:20, objectFit:'cover', border:'3px solid #fff', boxShadow:'0 4px 16px rgba(0,0,0,0.12)' }} />
              ) : (
                <div style={{ width:88, height:88, borderRadius:20, background:GRAD[0], display:'flex', alignItems:'center', justifyContent:'center', fontSize:34, fontWeight:900, color:'#fff', border:'3px solid #fff', boxShadow:'0 4px 16px rgba(99,102,241,0.3)' }}>
                  {f.name[0].toUpperCase()}
                </div>
              )}
              {f.isOnline && <div style={{ position:'absolute', bottom:4, right:4, width:14, height:14, borderRadius:'50%', background:'#22c55e', border:'2px solid #fff' }} />}
            </div>

            {/* Info */}
            <div style={{ flex:1, minWidth:200 }}>
              <div style={{ display:'flex', alignItems:'center', gap:10, flexWrap:'wrap', marginBottom:4 }}>
                <h1 style={{ fontSize:22, fontWeight:800, color:'#111827', fontFamily:'Syne, sans-serif', margin:0 }}>{f.name}</h1>
                {f.isVerified && (
                  <span style={{ display:'inline-flex', alignItems:'center', gap:4, fontSize:11, fontWeight:700, padding:'3px 10px', borderRadius:999, background:'#dbeafe', color:'#1d4ed8', border:'1px solid #bfdbfe' }}>
                    ✓ Verified
                  </span>
                )}
                <span style={{ fontSize:11, fontWeight:700, padding:'3px 10px', borderRadius:999, background:'#ede9fe', color:'#7c3aed', textTransform:'capitalize' }}>
                  {f.role}
                </span>
              </div>
              <p style={{ color:'#6b7280', fontSize:14, marginBottom:10 }}>{f.title}</p>
              <div style={{ display:'flex', gap:18, flexWrap:'wrap' }}>
                <span style={{ fontSize:12, color:'#6b7280', display:'flex', alignItems:'center', gap:4 }}>📍 {}</span>
                <span style={{ fontSize:12, color:'#6b7280', display:'flex', alignItems:'center', gap:4 }}>⚡ Responds {f.responseTime}</span>
                <span style={{ fontSize:12, color:'#6b7280', display:'flex', alignItems:'center', gap:4 }}>🗓 Joined {new Date(f.joinedAt).getFullYear()}</span>
                {f.isOnline
                  ? <span style={{ fontSize:12, color:'#16a34a', display:'flex', alignItems:'center', gap:4 }}><span style={{ width:6, height:6, borderRadius:'50%', background:'#22c55e', display:'inline-block' }} />Online now</span>
                  : <span style={{ fontSize:12, color:'#9ca3af' }}>Currently offline</span>
                }
              </div>
            </div>

            {/* Stats */}
            <div style={{ display:'flex', gap:20, flexShrink:0, flexWrap:'wrap', alignItems:'center' }}>
              {[
                { label:'Rating',   value:f.rating,            icon:'⭐', color:'#f59e0b' },
                { label:'Projects', value:f.completedProjects, icon:'✅', color:'#16a34a' },
                { label:'Success',  value:f.successRate,       icon:'🎯', color:'#0ea5e9' },
              ].map((s,i) => (
                <div key={i} style={{ textAlign:'center' }}>
                  <div style={{ fontSize:20, fontWeight:900, color:s.color, fontFamily:'Syne, sans-serif', display:'flex', alignItems:'center', gap:4 }}>
                    <span style={{ fontSize:16 }}>{s.icon}</span> {s.value}
                  </div>
                  <div style={{ fontSize:11, color:'#9ca3af', marginTop:2 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* CTA buttons */}
            <div style={{ display:'flex', gap:10, flexShrink:0, flexWrap:'wrap' }}>
              {isOwn ? (
                <Link to="/settings">
                  <button style={{ padding:'10px 20px', borderRadius:10, background:'#4f46e5', border:'none', color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>✏️ Edit Profile</button>
                </Link>
              ) : (
                <>
                  <button onClick={startChat} disabled={chatLoading} style={{ padding:'10px 20px', borderRadius:10, background:'#4f46e5', border:'none', color:'#fff', fontSize:13, fontWeight:700, cursor:chatLoading?'not-allowed':'pointer', fontFamily:'inherit', boxShadow:'0 4px 12px rgba(79,70,229,0.3)', opacity:chatLoading?0.7:1 }}>{chatLoading?'Opening...':'💬 Message'}</button>
                  <button onClick={()=>setHiringModal(true)} style={{ padding:'10px 20px', borderRadius:10, background:'#fff', border:'1px solid #e5e7eb', color:'#374151', fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>🤝 Hire Now</button>
                  <button onClick={()=>toast.success('Added to saved!')} style={{ padding:'10px 14px', borderRadius:10, background:'#fff', border:'1px solid #e5e7eb', color:'#374151', fontSize:13, cursor:'pointer', fontFamily:'inherit' }}>🔖</button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* ── RATE BANNER ── */}
        <div style={{ background:'linear-gradient(135deg,rgba(79,70,229,0.08),rgba(34,211,238,0.05))', border:'1px solid #c7d2fe', borderRadius:14, padding:'16px 24px', display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
          <span style={{ fontSize:14, color:'#4b5563', fontWeight:500 }}>Hourly Rate</span>
          <span style={{ fontSize:26, fontWeight:900, color:'#4f46e5', fontFamily:'Syne, sans-serif' }}>₹{f.hourlyRate.toLocaleString()} <span style={{ fontSize:14, color:'#9ca3af', fontWeight:400 }}>/ hr</span></span>
        </div>

        {/* ── TABS ── */}
        <div style={{ display:'flex', gap:0, marginBottom:24, borderBottom:'1px solid #e5e7eb' }}>
          {TABS.map(t => (
            <button key={t} onClick={()=>setTab(t)} style={{
              background:'none', border:'none', cursor:'pointer', fontFamily:'inherit',
              fontSize:14, fontWeight:600, padding:'12px 22px',
              color: tab===t ? '#4f46e5' : '#6b7280',
              borderBottom: tab===t ? '2px solid #4f46e5' : '2px solid transparent',
              textTransform:'capitalize', transition:'all 0.2s',
            }}>{t}</button>
          ))}
        </div>

        {/* ── TAB CONTENT ── */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 290px', gap:20 }}>
          <div>

            {/* OVERVIEW */}
            {tab === 'overview' && (
              <div style={{ display:'flex', flexDirection:'column', gap:18 }}>
                {/* About */}
                <div style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:16, padding:24, boxShadow:'0 2px 8px rgba(0,0,0,0.04)' }}>
                  <h3 style={{ fontSize:15, fontWeight:700, color:'#111827', marginBottom:12 }}>About</h3>
                  <p style={{ fontSize:14, color:'#374151', lineHeight:1.8 }}>{f.bio}</p>
                </div>
                {/* Skills */}
                {f.skills.length > 0 && (
                  <div style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:16, padding:24, boxShadow:'0 2px 8px rgba(0,0,0,0.04)' }}>
                    <h3 style={{ fontSize:15, fontWeight:700, color:'#111827', marginBottom:14 }}>Skills</h3>
                    <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                      {f.skills.map(s => (
                        <span key={s} style={{ fontSize:13, fontWeight:600, padding:'6px 14px', borderRadius:999, background:'#ede9fe', color:'#7c3aed', border:'1px solid #ddd6fe' }}>{s}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* PORTFOLIO */}
            {tab === 'portfolio' && (
              <div>
                {f.portfolio.length === 0 ? (
                  <div style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:16, padding:'48px 24px', textAlign:'center' }}>
                    <div style={{ fontSize:44, marginBottom:12 }}>🖼️</div>
                    <h3 style={{ color:'#374151', fontWeight:600, marginBottom:6 }}>No portfolio yet</h3>
                    {isOwn && <Link to="/settings"><button style={{ padding:'9px 20px', borderRadius:10, background:'#4f46e5', border:'none', color:'#fff', fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'inherit', marginTop:12 }}>Add Portfolio</button></Link>}
                  </div>
                ) : (
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:16 }}>
                    {f.portfolio.map((item,i)=>(
                      <div key={i} style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:16, overflow:'hidden', boxShadow:'0 2px 8px rgba(0,0,0,0.04)', transition:'all 0.25s' }}
                        onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-3px)';e.currentTarget.style.boxShadow='0 8px 24px rgba(79,70,229,0.12)';}}
                        onMouseLeave={e=>{e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.boxShadow='0 2px 8px rgba(0,0,0,0.04)';}}>
                        <div style={{ height:100, background:GRAD[i%4], display:'flex', alignItems:'center', justifyContent:'center', fontSize:32 }}>🖥️</div>
                        <div style={{ padding:16 }}>
                          <h4 style={{ fontSize:14, fontWeight:700, color:'#111827', marginBottom:4 }}>{item.title}</h4>
                          <p style={{ fontSize:12, color:'#6b7280', marginBottom:10 }}>{item.description}</p>
                          {Array.isArray(item.tags) && (
                            <div style={{ display:'flex', gap:5, flexWrap:'wrap' }}>
                              {item.tags.map(t=><span key={t} style={{ fontSize:11, fontWeight:600, padding:'2px 8px', borderRadius:999, background:'#ede9fe', color:'#7c3aed' }}>{t}</span>)}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* REVIEWS */}
            {tab === 'reviews' && (
              <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                {f.reviews.length === 0 ? (
                  <div style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:16, padding:'48px 24px', textAlign:'center' }}>
                    <div style={{ fontSize:44, marginBottom:12 }}>⭐</div>
                    <h3 style={{ color:'#374151', fontWeight:600 }}>No reviews yet</h3>
                    <p style={{ color:'#9ca3af', fontSize:13, marginTop:6 }}>Reviews appear after project completion</p>
                  </div>
                ) : f.reviews.map((r,i)=>(
                  <div key={i} style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:16, padding:22, boxShadow:'0 2px 8px rgba(0,0,0,0.04)' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:10 }}>
                      <div style={{ display:'flex', gap:10, alignItems:'center' }}>
                        <div style={{ width:36, height:36, borderRadius:'50%', background:GRAD[i%4], display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, fontWeight:700, color:'#fff' }}>{r.author?.[0]||'C'}</div>
                        <div>
                          <div style={{ fontSize:13, fontWeight:600, color:'#111827' }}>{r.author||'Client'}</div>
                          <div style={{ fontSize:11, color:'#9ca3af' }}>{r.date||'Recently'}</div>
                        </div>
                      </div>
                      <div style={{ color:'#f59e0b', fontSize:14 }}>{'★'.repeat(r.rating||5)}</div>
                    </div>
                    <p style={{ fontSize:14, color:'#374151', lineHeight:1.7 }}>{r.text||r.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SIDEBAR */}
          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
            {/* Education */}
            <div style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:16, padding:20, boxShadow:'0 2px 8px rgba(0,0,0,0.04)' }}>
              <h3 style={{ fontSize:14, fontWeight:700, color:'#111827', marginBottom:14 }}>Education</h3>
              {f.education.length === 0 ? (
                <p style={{ fontSize:13, color:'#9ca3af' }}>Not specified</p>
              ) : f.education.map((e,i)=>(
                <div key={i} style={{ display:'flex', gap:10, marginBottom:10 }}>
                  <div style={{ width:36, height:36, borderRadius:10, background:'#f1f5f9', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, flexShrink:0 }}>🎓</div>
                  <div>
                    <div style={{ fontSize:13, fontWeight:600, color:'#374151' }}>{e.degree}</div>
                    <div style={{ fontSize:12, color:'#9ca3af' }}>{e.institution} · {e.year}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Languages */}
            <div style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:16, padding:20, boxShadow:'0 2px 8px rgba(0,0,0,0.04)' }}>
              <h3 style={{ fontSize:14, fontWeight:700, color:'#111827', marginBottom:14 }}>Languages</h3>
              {f.languages.map((l,i)=>(
                <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
                  <span style={{ fontSize:13, color:'#374151' }}>🌐 {l.name}</span>
                  <span style={{ fontSize:11, fontWeight:700, padding:'2px 10px', borderRadius:999, background:'#dbeafe', color:'#1d4ed8' }}>{l.level}</span>
                </div>
              ))}
            </div>

            {/* Hire CTA */}
            {!isOwn && (
              <div style={{ background:'linear-gradient(135deg,#4f46e5,#7c3aed)', borderRadius:16, padding:22, textAlign:'center', boxShadow:'0 4px 16px rgba(79,70,229,0.3)' }}>
                <div style={{ fontSize:28, marginBottom:10 }}>🤝</div>
                <h4 style={{ color:'#fff', fontWeight:700, marginBottom:6, fontSize:14 }}>Ready to work together?</h4>
                <p style={{ color:'#c4b5fd', fontSize:12, marginBottom:16, lineHeight:1.6 }}>Send a message or post a job to invite this freelancer</p>
                <Link to={`/chat?userId=${id}`}>
                  <button style={{ width:'100%', padding:'11px', borderRadius:10, background:'rgba(255,255,255,0.18)', border:'1px solid rgba(255,255,255,0.3)', color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}
                    onMouseEnter={e=>e.target.style.background='rgba(255,255,255,0.28)'}
                    onMouseLeave={e=>e.target.style.background='rgba(255,255,255,0.18)'}>
                    💬 Send Message
                  </button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      
      {/* ══ HIRE NOW MODAL ══ */}
      {hiringModal && (
        <div style={{ position:'fixed', inset:0, zIndex:9999, background:'rgba(0,0,0,0.6)', backdropFilter:'blur(8px)', display:'flex', alignItems:'center', justifyContent:'center', padding:24 }} onClick={()=>setHiringModal(false)}>
          <div style={{ background:'#fff', borderRadius:24, padding:32, maxWidth:480, width:'100%', boxShadow:'0 24px 60px rgba(0,0,0,0.2)' }} onClick={e=>e.stopPropagation()}>
            {/* Modal header */}
            <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:20 }}>
              <div style={{ width:52, height:52, borderRadius:14, background:'linear-gradient(135deg,#6366F1,#22D3EE)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, fontWeight:900, color:'#fff' }}>
                {f.name[0].toUpperCase()}
              </div>
              <div>
                <h3 style={{ fontSize:18, fontWeight:800, color:'#111827', marginBottom:2 }}>Hire {f.name}</h3>
                <p style={{ fontSize:13, color:'#9ca3af' }}>{f.title}</p>
              </div>
              <button onClick={()=>setHiringModal(false)} style={{ marginLeft:'auto', background:'none', border:'none', cursor:'pointer', fontSize:22, color:'#9ca3af', lineHeight:1 }}>×</button>
            </div>

            {/* Rate info */}
            <div style={{ padding:'14px 18px', background:'#f5f3ff', borderRadius:12, marginBottom:20, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div>
                <div style={{ fontSize:12, color:'#7c3aed', fontWeight:600, marginBottom:2 }}>Hourly Rate</div>
                <div style={{ fontSize:22, fontWeight:900, color:'#4f46e5', fontFamily:'Syne,sans-serif' }}>₹{f.hourlyRate.toLocaleString()}/hr</div>
              </div>
              <div style={{ textAlign:'right' }}>
                <div style={{ fontSize:12, color:'#9ca3af', marginBottom:2 }}>Rating</div>
                <div style={{ fontSize:16, fontWeight:700, color:'#f59e0b' }}>⭐ {f.rating} ({f.reviewCount})</div>
              </div>
            </div>

            {/* Message */}
            <div style={{ marginBottom:20 }}>
              <label style={{ display:'block', fontSize:13, fontWeight:600, color:'#374151', marginBottom:8 }}>
                Introduce your project <span style={{ color:'#9ca3af', fontWeight:400 }}>(optional)</span>
              </label>
              <textarea
                value={hireMsg}
                onChange={e=>setHireMsg(e.target.value)}
                placeholder={`Hi ${f.name.split(' ')[0]}! I'd like to hire you for my project. Can we discuss the details?`}
                rows={4}
                style={{ width:'100%', padding:'12px 14px', background:'#f8fafc', border:'1px solid #e5e7eb', borderRadius:12, fontSize:14, fontFamily:'inherit', color:'#111827', outline:'none', resize:'none', lineHeight:1.7, boxSizing:'border-box', transition:'border-color 0.2s' }}
                onFocus={e=>e.target.style.borderColor='#6366F1'}
                onBlur={e=>e.target.style.borderColor='#e5e7eb'}
              />
            </div>

            {/* What happens next */}
            <div style={{ padding:'12px 14px', background:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:10, marginBottom:20 }}>
              <div style={{ fontSize:12, fontWeight:700, color:'#15803d', marginBottom:6 }}>✅ What happens next?</div>
              <div style={{ fontSize:12, color:'#16a34a', lineHeight:1.7 }}>Your message will be sent to {f.name.split(' ')[0]}. They typically respond within {f.responseTime}. You can negotiate scope and pricing in chat.</div>
            </div>

            {/* Buttons */}
            <div style={{ display:'flex', gap:12 }}>
              <button onClick={sendHireRequest} disabled={hiring} style={{ flex:1, padding:'13px', borderRadius:12, background:hiring?'rgba(79,70,229,0.5)':'linear-gradient(135deg,#4f46e5,#6366F1)', border:'none', color:'#fff', fontSize:14, fontWeight:700, cursor:hiring?'not-allowed':'pointer', fontFamily:'inherit', boxShadow:'0 4px 12px rgba(79,70,229,0.3)', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
                {hiring ? (
                  <><div style={{ width:16, height:16, border:'2px solid rgba(255,255,255,0.4)', borderTopColor:'#fff', borderRadius:'50%', animation:'spin 0.7s linear infinite' }} /> Sending...</>
                ) : '🤝 Send Hire Request'}
              </button>
              <button onClick={()=>setHiringModal(false)} style={{ padding:'13px 20px', borderRadius:12, background:'#f8fafc', border:'1px solid #e5e7eb', color:'#374151', fontSize:14, cursor:'pointer', fontFamily:'inherit' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

<style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        @keyframes spin{to{transform:rotate(360deg)}}
      `}</style>
    </div>
  );
};

export default FreelancerProfile;
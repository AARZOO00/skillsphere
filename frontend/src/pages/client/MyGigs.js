import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import api from '../../utils/api';

const STATUS_CONFIG = {
  open:      { label: 'Open',      bg: '#dcfce7', color: '#16a34a', dot: '#22c55e' },
  active:    { label: 'Active',    bg: '#dbeafe', color: '#1d4ed8', dot: '#3b82f6' },
  completed: { label: 'Completed', bg: '#f3e8ff', color: '#7c3aed', dot: '#a855f7' },
  closed:    { label: 'Closed',    bg: '#fee2e2', color: '#dc2626', dot: '#ef4444' },
  cancelled: { label: 'Cancelled', bg: '#f1f5f9', color: '#64748b', dot: '#94a3b8' },
};

const MyGigs = () => {
  const { user } = useSelector(s => s.auth || {});
  const [gigs,       setGigs]       = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [tab,        setTab]        = useState('all');
  const [activeGig,  setActiveGig]  = useState(null);
  const [bids,       setBids]       = useState([]);
  const [bidsLoading,setBidsLoading]= useState(false);
  const [search,     setSearch]     = useState('');

  useEffect(() => { fetchMyGigs(); }, []);

  const fetchMyGigs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/gigs/my-gigs');
      const d   = res.data;
      setGigs(Array.isArray(d) ? d : Array.isArray(d?.gigs) ? d.gigs : []);
    } catch { setGigs([]); toast.error('Could not load gigs'); }
    finally  { setLoading(false); }
  };

  const fetchBids = async (gigId) => {
    if (activeGig === gigId) { setActiveGig(null); setBids([]); return; }
    setActiveGig(gigId);
    setBidsLoading(true);
    try {
      const res = await api.get(`/gigs/${gigId}/bids`);
      const d   = res.data;
      setBids(Array.isArray(d) ? d : Array.isArray(d?.bids) ? d.bids : []);
    } catch { setBids([]); }
    finally  { setBidsLoading(false); }
  };

  const acceptBid = async (gigId, bidId) => {
    try {
      await api.patch(`/gigs/${gigId}/bids/${bidId}/accept`);
      toast.success('✅ Bid accepted! Freelancer notified.');
      fetchBids(gigId); fetchMyGigs();
    } catch { toast.error('Failed to accept bid'); }
  };

  const rejectBid = async (gigId, bidId) => {
    try {
      await api.patch(`/gigs/${gigId}/bids/${bidId}/reject`);
      toast.success('Bid rejected.');
      fetchBids(gigId);
    } catch { toast.error('Failed to reject bid'); }
  };

  const deleteGig = async (gigId) => {
    if (!window.confirm('Delete this gig?')) return;
    try {
      await api.delete(`/gigs/${gigId}`);
      toast.success('Gig deleted.');
      setGigs(g => g.filter(x => x._id !== gigId));
      if (activeGig === gigId) { setActiveGig(null); setBids([]); }
    } catch { toast.error('Failed to delete'); }
  };

  // Demo gigs for empty state
  const demoGigs = [
    { _id: 'g1', title: 'Build React E-commerce Dashboard', category: 'webdev', budget: 45000, budgetType: 'fixed', status: 'open', bidsCount: 8, deadline: new Date(Date.now()+7*86400000), skills: ['React.js','Node.js','MongoDB'], workType: 'remote', description: 'Need a full-stack developer to build a modern e-commerce dashboard with analytics.' },
    { _id: 'g2', title: 'Mobile App UI/UX Design', category: 'design', budget: 28000, budgetType: 'fixed', status: 'active', bidsCount: 14, deadline: new Date(Date.now()+14*86400000), skills: ['Figma','UI/UX'], workType: 'remote', description: 'Looking for a UI/UX designer to create wireframes and high-fidelity mockups.' },
    { _id: 'g3', title: 'Python Data Analysis Script', category: 'datascience', budget: 1500, budgetType: 'hourly', status: 'completed', bidsCount: 5, deadline: new Date(Date.now()-3*86400000), skills: ['Python','Pandas'], workType: 'remote', description: 'Data analysis and visualization using Python.' },
  ];

  const displayGigs = gigs.length > 0 ? gigs : demoGigs;

  const filtered = displayGigs.filter(g => {
    const matchTab = tab === 'all' || g.status === tab;
    const matchSearch = !search || g.title.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  const stats = {
    total:     displayGigs.length,
    active:    displayGigs.filter(g => g.status === 'open' || g.status === 'active').length,
    completed: displayGigs.filter(g => g.status === 'completed').length,
    totalBids: displayGigs.reduce((a, g) => a + (g.bidsCount || 0), 0),
  };

  const S = { // shorthand styles
    card: { background:'#fff', border:'1px solid #e5e7eb', borderRadius:16, boxShadow:'0 2px 8px rgba(0,0,0,0.05)' },
    cardHover: { transition:'all 0.25s' },
  };

  return (
    <div style={{ minHeight:'100vh', background:'#f8fafc', fontFamily:"'Plus Jakarta Sans', sans-serif" }}>

      {/* ── TOP BANNER ── */}
      <div style={{ background:'linear-gradient(135deg,#1e1b4b,#312e81,#1e40af)', padding:'36px 52px 80px', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', inset:0, backgroundImage:'radial-gradient(circle at 15% 50%, rgba(255,255,255,0.04) 1px, transparent 1px)', backgroundSize:'30px 30px', pointerEvents:'none' }} />
        <div style={{ position:'absolute', top:'-30%', right:'0', width:400, height:400, background:'radial-gradient(circle,rgba(99,102,241,0.2) 0%,transparent 65%)', pointerEvents:'none' }} />
        <div style={{ maxWidth:1200, margin:'0 auto', position:'relative', zIndex:1 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:16 }}>
            <div>
              <p style={{ color:'#a5b4fc', fontSize:13, marginBottom:8 }}>Client Dashboard</p>
              <h1 style={{ fontSize:30, fontWeight:900, color:'#fff', fontFamily:'Syne, sans-serif', marginBottom:6 }}>My Posted Jobs</h1>
              <p style={{ color:'#a5b4fc', fontSize:14 }}>Manage your job postings and review freelancer bids</p>
            </div>
            <Link to="/create-gig">
              <button style={{ padding:'12px 24px', borderRadius:12, background:'linear-gradient(135deg,#6366F1,#22D3EE)', border:'none', color:'#fff', fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:'inherit', boxShadow:'0 4px 14px rgba(99,102,241,0.4)', whiteSpace:'nowrap' }}>
                + Post New Job
              </button>
            </Link>
          </div>
        </div>
      </div>

      <div style={{ maxWidth:1200, margin:'-48px auto 0', padding:'0 52px 60px', position:'relative', zIndex:2 }}>

        {/* ── STAT CARDS ── */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:24 }}>
          {[
            { icon:'📌', label:'Total Gigs',   value:stats.total,     color:'#4f46e5', bg:'#ede9fe' },
            { icon:'🟢', label:'Active',        value:stats.active,    color:'#16a34a', bg:'#dcfce7' },
            { icon:'🤝', label:'Total Bids',    value:stats.totalBids, color:'#0ea5e9', bg:'#e0f2fe' },
            { icon:'✅', label:'Completed',     value:stats.completed, color:'#7c3aed', bg:'#f3e8ff' },
          ].map((s,i) => (
            <div key={i} style={{ ...S.card, padding:'20px 22px', position:'relative', overflow:'hidden', ...S.cardHover }}
              onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-3px)';e.currentTarget.style.boxShadow='0 8px 24px rgba(0,0,0,0.08)';}}
              onMouseLeave={e=>{e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.boxShadow='0 2px 8px rgba(0,0,0,0.05)';}}>
              <div style={{ position:'absolute', top:0, right:0, width:64, height:64, background:`${s.color}10`, borderRadius:'0 16px 0 64px' }} />
              <div style={{ width:40, height:40, borderRadius:10, background:s.bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, marginBottom:12 }}>{s.icon}</div>
              <div style={{ fontSize:26, fontWeight:900, color:s.color, fontFamily:'Syne, sans-serif', marginBottom:2 }}>{s.value}</div>
              <div style={{ fontSize:13, color:'#6b7280', fontWeight:500 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* ── FILTERS ROW ── */}
        <div style={{ ...S.card, padding:'16px 20px', marginBottom:20, display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
          {/* Tabs */}
          <div style={{ display:'flex', gap:4 }}>
            {[['all','All'],['open','Open'],['active','Active'],['completed','Completed'],['closed','Closed']].map(([val,label]) => (
              <button key={val} onClick={()=>setTab(val)} style={{
                padding:'8px 16px', borderRadius:10, fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'inherit', transition:'all 0.2s',
                background: tab===val ? '#4f46e5' : 'transparent',
                color: tab===val ? '#fff' : '#6b7280',
                border: `1px solid ${tab===val ? '#4f46e5' : '#e5e7eb'}`,
              }}>{label}</button>
            ))}
          </div>
          {/* Search */}
          <div style={{ display:'flex', alignItems:'center', gap:8, background:'#f8fafc', border:'1px solid #e5e7eb', borderRadius:10, padding:'9px 14px', minWidth:240 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2.5" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input type="text" placeholder="Search gigs..." value={search} onChange={e=>setSearch(e.target.value)} style={{ background:'transparent', border:'none', outline:'none', fontSize:13, color:'#374151', fontFamily:'inherit', width:'100%' }} />
          </div>
        </div>

        {/* ── MAIN LAYOUT ── */}
        <div style={{ display:'grid', gridTemplateColumns: activeGig ? '1fr 380px' : '1fr', gap:20 }}>

          {/* GIG LIST */}
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            {loading ? (
              [1,2,3].map(i=><div key={i} style={{ height:140, borderRadius:16, background:'#fff', border:'1px solid #e5e7eb', animation:'shimmer 1.5s ease-in-out infinite' }} />)
            ) : filtered.length === 0 ? (
              <div style={{ ...S.card, padding:'60px 24px', textAlign:'center' }}>
                <div style={{ fontSize:52, marginBottom:14 }}>📭</div>
                <h3 style={{ color:'#111827', fontWeight:700, marginBottom:8, fontSize:18 }}>No gigs found</h3>
                <p style={{ color:'#9ca3af', fontSize:14, marginBottom:20 }}>Post your first job to start receiving bids</p>
                <Link to="/create-gig">
                  <button style={{ padding:'11px 24px', borderRadius:12, background:'#4f46e5', border:'none', color:'#fff', fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>+ Post First Job</button>
                </Link>
              </div>
            ) : filtered.map(gig => {
              const sc   = STATUS_CONFIG[gig.status] || STATUS_CONFIG.open;
              const isSelected = activeGig === gig._id;
              return (
                <div key={gig._id} style={{
                  ...S.card,
                  padding:'22px 24px',
                  border:`1px solid ${isSelected ? '#6366F1' : '#e5e7eb'}`,
                  boxShadow: isSelected ? '0 0 0 3px rgba(99,102,241,0.1)' : '0 2px 8px rgba(0,0,0,0.05)',
                  transition:'all 0.25s',
                }}
                  onMouseEnter={e=>{if(!isSelected){e.currentTarget.style.boxShadow='0 8px 24px rgba(0,0,0,0.08)';e.currentTarget.style.transform='translateY(-2px)';}}}
                  onMouseLeave={e=>{if(!isSelected){e.currentTarget.style.boxShadow='0 2px 8px rgba(0,0,0,0.05)';e.currentTarget.style.transform='translateY(0)';}}}
                >
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:16 }}>
                    <div style={{ flex:1, minWidth:0 }}>
                      {/* Title + Status */}
                      <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8, flexWrap:'wrap' }}>
                        <h3 style={{ fontSize:16, fontWeight:700, color:'#111827', margin:0 }}>{gig.title}</h3>
                        <span style={{ fontSize:11, fontWeight:700, padding:'3px 10px', borderRadius:999, background:sc.bg, color:sc.color, display:'flex', alignItems:'center', gap:4, flexShrink:0 }}>
                          <span style={{ width:5, height:5, borderRadius:'50%', background:sc.dot, display:'inline-block' }} />
                          {sc.label}
                        </span>
                      </div>

                      {/* Description */}
                      <p style={{ fontSize:13, color:'#6b7280', lineHeight:1.6, marginBottom:12, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>
                        {gig.description}
                      </p>

                      {/* Meta row */}
                      <div style={{ display:'flex', gap:18, flexWrap:'wrap', marginBottom:12 }}>
                        <span style={{ fontSize:12, color:'#374151', display:'flex', alignItems:'center', gap:4 }}>
                          <span style={{ color:'#4f46e5' }}>💰</span>
                          <strong>₹{Number(gig.budget||0).toLocaleString()}</strong>
                          <span style={{ color:'#9ca3af' }}>/{gig.budgetType==='hourly'?'hr':'fixed'}</span>
                        </span>
                        <span style={{ fontSize:12, color:'#374151', display:'flex', alignItems:'center', gap:4 }}>
                          <span>📅</span>
                          {gig.deadline ? new Date(gig.deadline).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'}) : 'Flexible'}
                        </span>
                        <span style={{ fontSize:12, color:'#374151', display:'flex', alignItems:'center', gap:4 }}>
                          <span>🌐</span>
                          <span style={{ textTransform:'capitalize' }}>{gig.workType||'Remote'}</span>
                        </span>
                        <span style={{ fontSize:12, fontWeight:700, color: (gig.bidsCount||0)>0 ? '#0ea5e9' : '#9ca3af', display:'flex', alignItems:'center', gap:4 }}>
                          <span>🤝</span>
                          {gig.bidsCount||0} bid{(gig.bidsCount||0)!==1?'s':''}
                        </span>
                      </div>

                      {/* Skills */}
                      {gig.skills?.length>0 && (
                        <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                          {(Array.isArray(gig.skills)?gig.skills:[]).slice(0,4).map(s=>(
                            <span key={s} style={{ fontSize:11, fontWeight:600, padding:'3px 10px', borderRadius:999, background:'#ede9fe', color:'#7c3aed', border:'1px solid #ddd6fe' }}>{s}</span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div style={{ display:'flex', flexDirection:'column', gap:8, flexShrink:0 }}>
                      <button onClick={()=>fetchBids(gig._id)} style={{
                        padding:'9px 18px', borderRadius:10, fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'inherit', transition:'all 0.2s', whiteSpace:'nowrap',
                        background: isSelected ? '#4f46e5' : '#f5f3ff',
                        color: isSelected ? '#fff' : '#4f46e5',
                        border: `1px solid ${isSelected ? '#4f46e5' : '#ede9fe'}`,
                        boxShadow: isSelected ? '0 4px 12px rgba(79,70,229,0.3)' : 'none',
                      }}>
                        {isSelected ? '← Close Bids' : `View Bids (${gig.bidsCount||0})`}
                      </button>
                      <button onClick={()=>deleteGig(gig._id)} style={{ padding:'9px 18px', borderRadius:10, fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'inherit', background:'#fff', border:'1px solid #fecaca', color:'#dc2626', transition:'all 0.2s' }}
                        onMouseEnter={e=>{e.target.style.background='#fee2e2';}}
                        onMouseLeave={e=>{e.target.style.background='#fff';}}>
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* BIDS PANEL */}
          {activeGig && (
            <div style={{ ...S.card, padding:24, height:'fit-content', position:'sticky', top:80 }}>
              {/* Panel header */}
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:18, paddingBottom:14, borderBottom:'1px solid #f1f5f9' }}>
                <div>
                  <h3 style={{ fontSize:15, fontWeight:800, color:'#111827', marginBottom:2 }}>Bids Received</h3>
                  <p style={{ fontSize:12, color:'#9ca3af' }}>{bids.length} proposals</p>
                </div>
                <span style={{ fontSize:12, fontWeight:700, padding:'4px 12px', borderRadius:999, background:'#dbeafe', color:'#1d4ed8' }}>
                  {bids.length} total
                </span>
              </div>

              {bidsLoading ? (
                <div style={{ textAlign:'center', padding:'32px 0', color:'#9ca3af', fontSize:13 }}>Loading bids…</div>
              ) : bids.length === 0 ? (
                <div style={{ textAlign:'center', padding:'40px 16px' }}>
                  <div style={{ fontSize:40, marginBottom:10 }}>📭</div>
                  <p style={{ color:'#9ca3af', fontSize:13 }}>No bids yet. Freelancers will be notified.</p>
                </div>
              ) : (
                <div style={{ display:'flex', flexDirection:'column', gap:14, maxHeight:520, overflowY:'auto' }}>
                  {bids.map((bid,i)=>(
                    <div key={bid._id||i} style={{ background:'#f8fafc', border:'1px solid #e5e7eb', borderRadius:14, padding:16, transition:'all 0.2s' }}
                      onMouseEnter={e=>{e.currentTarget.style.borderColor='#c7d2fe';e.currentTarget.style.background='#fafbff';}}
                      onMouseLeave={e=>{e.currentTarget.style.borderColor='#e5e7eb';e.currentTarget.style.background='#f8fafc';}}>
                      {/* Bidder info */}
                      <div style={{ display:'flex', gap:10, marginBottom:10 }}>
                        <div style={{ width:38, height:38, borderRadius:'50%', background:'linear-gradient(135deg,#6366F1,#22D3EE)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, fontWeight:800, color:'#fff', flexShrink:0 }}>
                          {bid.freelancer?.name?.[0]?.toUpperCase()||'F'}
                        </div>
                        <div style={{ flex:1 }}>
                          <div style={{ fontSize:14, fontWeight:700, color:'#111827' }}>{bid.freelancer?.name||'Freelancer'}</div>
                          <div style={{ fontSize:11, color:'#9ca3af' }}>⭐ {bid.freelancer?.rating||4.8} · {bid.freelancer?.location||'India'}</div>
                        </div>
                        <div style={{ textAlign:'right' }}>
                          <div style={{ fontSize:16, fontWeight:800, color:'#4f46e5' }}>₹{Number(bid.amount||0).toLocaleString()}</div>
                          <div style={{ fontSize:11, color:'#9ca3af' }}>{bid.deliveryDays||7}d delivery</div>
                        </div>
                      </div>

                      {/* Proposal */}
                      {bid.proposal && (
                        <p style={{ fontSize:12, color:'#6b7280', lineHeight:1.6, marginBottom:12, display:'-webkit-box', WebkitLineClamp:3, WebkitBoxOrient:'vertical', overflow:'hidden' }}>
                          "{bid.proposal}"
                        </p>
                      )}

                      {/* Actions */}
                      {bid.status==='accepted' ? (
                        <div style={{ textAlign:'center', padding:'8px', background:'#dcfce7', borderRadius:8, fontSize:12, fontWeight:700, color:'#16a34a' }}>✅ Accepted</div>
                      ) : bid.status==='rejected' ? (
                        <div style={{ textAlign:'center', padding:'8px', background:'#fee2e2', borderRadius:8, fontSize:12, fontWeight:700, color:'#dc2626' }}>❌ Rejected</div>
                      ) : (
                        <div style={{ display:'flex', gap:8 }}>
                          <button onClick={()=>acceptBid(activeGig,bid._id)} style={{ flex:1, padding:'9px', borderRadius:10, background:'#4f46e5', border:'none', color:'#fff', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'inherit', transition:'all 0.2s' }}
                            onMouseEnter={e=>e.target.style.background='#4338ca'}
                            onMouseLeave={e=>e.target.style.background='#4f46e5'}>
                            ✓ Accept
                          </button>
                          <button onClick={()=>rejectBid(activeGig,bid._id)} style={{ flex:1, padding:'9px', borderRadius:10, background:'#fff', border:'1px solid #fecaca', color:'#dc2626', fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:'inherit', transition:'all 0.2s' }}
                            onMouseEnter={e=>{e.target.style.background='#fee2e2';}}
                            onMouseLeave={e=>{e.target.style.background='#fff';}}>
                            ✗ Decline
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        @keyframes shimmer { 0%,100%{opacity:1} 50%{opacity:0.5} }
      `}</style>
    </div>
  );
};

export default MyGigs;
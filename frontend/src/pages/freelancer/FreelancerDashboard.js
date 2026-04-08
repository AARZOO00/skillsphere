import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';
import api from '../../utils/api';

// ── Demo data ─────────────────────────────────────────────────
const EARNINGS_DATA = [
  { month:'Sep', earned:28000, projects:3 },
  { month:'Oct', earned:42000, projects:5 },
  { month:'Nov', earned:31000, projects:4 },
  { month:'Dec', earned:55000, projects:6 },
  { month:'Jan', earned:48000, projects:5 },
  { month:'Feb', earned:67000, projects:7 },
  { month:'Mar', earned:72000, projects:8 },
];

const SKILLS_DATA = [
  { name:'React.js',    value:35, color:'#6366F1' },
  { name:'Node.js',     value:25, color:'#22D3EE' },
  { name:'UI Design',   value:20, color:'#10b981' },
  { name:'MongoDB',     value:12, color:'#f59e0b' },
  { name:'Others',      value:8,  color:'#e5e7eb' },
];

const PROPOSALS_DATA = [
  { week:'W1', sent:4, accepted:2 },
  { week:'W2', sent:6, accepted:3 },
  { week:'W3', sent:3, accepted:1 },
  { week:'W4', sent:7, accepted:4 },
];

const CustomTooltip = ({ active, payload, label, prefix='₹' }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:10, padding:'10px 14px', boxShadow:'0 4px 16px rgba(0,0,0,0.1)' }}>
      <p style={{ fontSize:12, fontWeight:600, color:'#374151', marginBottom:4 }}>{label}</p>
      {payload.map((p,i) => (
        <p key={i} style={{ fontSize:13, fontWeight:700, color:p.color, margin:0 }}>{p.name}: {prefix}{typeof p.value==='number'&&prefix==='₹'?p.value.toLocaleString():p.value}</p>
      ))}
    </div>
  );
};

const FreelancerDashboard = () => {
  const { user } = useSelector(s => s.auth || {});
  const [stats,    setStats]    = useState(null);
  const [proposals,setProposals]= useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [sRes, pRes] = await Promise.allSettled([
          api.get('/users/dashboard-stats'),
          api.get('/gigs/my-bids'),
        ]);
        if (sRes.status==='fulfilled') setStats(sRes.value.data);
        if (pRes.status==='fulfilled') {
          const d = pRes.value.data;
          setProposals(Array.isArray(d)?d:Array.isArray(d?.bids)?d.bids:[]);
        }
      } catch { /* use demo */ }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const s = {
    totalEarned:       stats?.totalEarned       ?? 343000,
    thisMonth:         stats?.thisMonth         ?? 72000,
    activeProposals:   stats?.activeProposals   ?? 7,
    completedProjects: stats?.completedProjects ?? 43,
    avgRating:         stats?.avgRating         ?? 4.9,
    reviewCount:       stats?.reviewCount       ?? 61,
    successRate:       stats?.successRate       ?? '94%',
    profileViews:      stats?.profileViews      ?? 284,
  };

  const demoProposals = [
    { _id:'p1', gig:{title:'React Dashboard for Analytics Platform'}, amount:42000, status:'pending',  createdAt:new Date(Date.now()-86400000) },
    { _id:'p2', gig:{title:'Node.js REST API with JWT Auth'},          amount:35000, status:'accepted', createdAt:new Date(Date.now()-2*86400000) },
    { _id:'p3', gig:{title:'E-commerce Website Full Stack'},           amount:58000, status:'pending',  createdAt:new Date(Date.now()-3*86400000) },
    { _id:'p4', gig:{title:'Mobile App UI/UX in Figma'},               amount:28000, status:'rejected', createdAt:new Date(Date.now()-5*86400000) },
  ];
  const displayProposals = proposals.length>0 ? proposals.slice(0,4) : demoProposals;

  const STATUS = {
    pending:  { label:'Pending',  bg:'#fef3c7', color:'#d97706' },
    accepted: { label:'Accepted', bg:'#dcfce7', color:'#16a34a' },
    rejected: { label:'Rejected', bg:'#fee2e2', color:'#dc2626' },
    withdrawn:{ label:'Withdrawn',bg:'#f1f5f9', color:'#64748b' },
  };

  const card = { background:'#fff', border:'1px solid #e5e7eb', borderRadius:16, boxShadow:'0 2px 8px rgba(0,0,0,0.04)' };

  if (loading) return (
    <div style={{ minHeight:'100vh', background:'#f8fafc', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ width:40, height:40, border:'3px solid #e0e7ff', borderTopColor:'#4f46e5', borderRadius:'50%', animation:'spin 0.7s linear infinite', margin:'0 auto 12px' }} />
        <p style={{ color:'#6b7280', fontSize:14 }}>Loading dashboard…</p>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div style={{ minHeight:'100vh', background:'#f8fafc', fontFamily:"'Plus Jakarta Sans',sans-serif" }}>

      {/* ── HEADER ── */}
      <div style={{ background:'linear-gradient(135deg,#1e1b4b,#312e81,#1e40af)', padding:'32px 48px 80px', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', inset:0, backgroundImage:'radial-gradient(circle at 15% 50%, rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize:'30px 30px', pointerEvents:'none' }} />
        <div style={{ position:'absolute', top:'-30%', right:'0', width:400, height:400, background:'radial-gradient(circle,rgba(99,102,241,0.2) 0%,transparent 65%)', pointerEvents:'none' }} />
        <div style={{ maxWidth:1200, margin:'0 auto', position:'relative', zIndex:1 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:16 }}>
            <div>
              <p style={{ color:'#a5b4fc', fontSize:13, marginBottom:6 }}>
                {new Date().toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long'})}
              </p>
              <h1 style={{ fontSize:28, fontWeight:900, color:'#fff', fontFamily:'Syne, sans-serif', marginBottom:4 }}>
                Welcome back, {user?.name?.split(' ')[0]||'there'} 👋
              </h1>
              <p style={{ color:'#a5b4fc', fontSize:14 }}>Here's your freelance performance overview</p>
            </div>
            <div style={{ display:'flex', gap:10 }}>
              <Link to="/gigs"><button style={{ padding:'10px 22px', borderRadius:10, background:'linear-gradient(135deg,#6366F1,#22D3EE)', border:'none', color:'#fff', fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:'inherit', boxShadow:'0 4px 14px rgba(99,102,241,0.4)' }}>🔍 Browse Jobs</button></Link>
              <Link to={`/profile/${user?._id}`}><button style={{ padding:'10px 20px', borderRadius:10, background:'rgba(255,255,255,0.12)', border:'1px solid rgba(255,255,255,0.2)', color:'#fff', fontSize:14, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>👤 My Profile</button></Link>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth:1200, margin:'-48px auto 0', padding:'0 48px 60px', position:'relative', zIndex:2 }}>

        {/* ── STAT CARDS ── */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:22 }}>
          {[
            { icon:'💰', label:'Total Earned',   value:`₹${s.totalEarned.toLocaleString()}`, sub:`This month: ₹${s.thisMonth.toLocaleString()}`, color:'#4f46e5', bg:'#ede9fe', trend:15 },
            { icon:'📋', label:'Active Proposals',value:s.activeProposals, sub:'Awaiting response', color:'#0ea5e9', bg:'#e0f2fe', trend:8 },
            { icon:'✅', label:'Completed',       value:s.completedProjects, sub:'All time',          color:'#16a34a', bg:'#dcfce7', trend:5 },
            { icon:'⭐', label:'Avg. Rating',     value:s.avgRating, sub:`${s.reviewCount} reviews`,  color:'#f59e0b', bg:'#fef3c7', trend:0 },
          ].map((st,i)=>(
            <div key={i} style={{ ...card, padding:'20px 22px', position:'relative', overflow:'hidden', transition:'all 0.25s' }}
              onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-3px)';e.currentTarget.style.boxShadow='0 8px 24px rgba(0,0,0,0.08)';}}
              onMouseLeave={e=>{e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.boxShadow='0 2px 8px rgba(0,0,0,0.04)';}}>
              <div style={{ position:'absolute', top:0, right:0, width:60, height:60, background:`${st.color}10`, borderRadius:'0 16px 0 60px' }} />
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
                <div style={{ width:40, height:40, borderRadius:10, background:st.bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>{st.icon}</div>
                {st.trend!==0 && <span style={{ fontSize:11, fontWeight:700, padding:'3px 8px', borderRadius:999, background:st.trend>0?'#dcfce7':'#fee2e2', color:st.trend>0?'#16a34a':'#dc2626' }}>{st.trend>0?'↑':'↓'}{Math.abs(st.trend)}%</span>}
              </div>
              <div style={{ fontSize:24, fontWeight:900, color:st.color, fontFamily:'Syne, sans-serif', marginBottom:2 }}>{st.value}</div>
              <div style={{ fontSize:13, fontWeight:600, color:'#374151', marginBottom:2 }}>{st.label}</div>
              <div style={{ fontSize:11, color:'#9ca3af' }}>{st.sub}</div>
            </div>
          ))}
        </div>

        {/* ── CHARTS ROW 1 ── */}
        <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:18, marginBottom:18 }}>

          {/* Earnings Area Chart */}
          <div style={{ ...card, padding:'22px 24px' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
              <div>
                <h3 style={{ fontSize:15, fontWeight:800, color:'#111827', marginBottom:2 }}>Earnings Overview</h3>
                <p style={{ fontSize:12, color:'#9ca3af' }}>Last 7 months</p>
              </div>
              <div style={{ fontSize:22, fontWeight:900, color:'#4f46e5', fontFamily:'Syne, sans-serif' }}>₹{s.totalEarned.toLocaleString()}</div>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={EARNINGS_DATA} margin={{ top:5, right:10, left:0, bottom:0 }}>
                <defs>
                  <linearGradient id="earnGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#4f46e5" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize:11, fill:'#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize:11, fill:'#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={v=>`₹${(v/1000).toFixed(0)}K`} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="earned" name="Earned" stroke="#4f46e5" strokeWidth={2.5} fill="url(#earnGrad)" dot={{ fill:'#4f46e5', strokeWidth:0, r:3 }} activeDot={{ r:5 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Skills Pie Chart */}
          <div style={{ ...card, padding:'22px 24px' }}>
            <h3 style={{ fontSize:15, fontWeight:800, color:'#111827', marginBottom:2 }}>Jobs by Skill</h3>
            <p style={{ fontSize:12, color:'#9ca3af', marginBottom:16 }}>Project distribution</p>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={SKILLS_DATA} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                  {SKILLS_DATA.map((entry,i)=><Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip formatter={(v,n)=>[`${v}%`,n]} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ display:'flex', flexDirection:'column', gap:6, marginTop:4 }}>
              {SKILLS_DATA.map((s,i)=>(
                <div key={i} style={{ display:'flex', alignItems:'center', gap:7 }}>
                  <div style={{ width:10, height:10, borderRadius:2, background:s.color, flexShrink:0 }} />
                  <span style={{ fontSize:12, color:'#374151', flex:1 }}>{s.name}</span>
                  <span style={{ fontSize:12, fontWeight:700, color:'#374151' }}>{s.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── CHARTS ROW 2 ── */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:18, marginBottom:18 }}>

          {/* Proposals Bar Chart */}
          <div style={{ ...card, padding:'22px 24px' }}>
            <h3 style={{ fontSize:15, fontWeight:800, color:'#111827', marginBottom:2 }}>Proposal Activity</h3>
            <p style={{ fontSize:12, color:'#9ca3af', marginBottom:16 }}>Sent vs Accepted (this month)</p>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={PROPOSALS_DATA} barSize={16} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="week" tick={{ fontSize:11, fill:'#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize:11, fill:'#9ca3af' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip prefix="" />} />
                <Bar dataKey="sent"     name="Sent"     fill="#e0e7ff" radius={[4,4,0,0]} />
                <Bar dataKey="accepted" name="Accepted" fill="#4f46e5" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Performance metrics */}
          <div style={{ ...card, padding:'22px 24px' }}>
            <h3 style={{ fontSize:15, fontWeight:800, color:'#111827', marginBottom:16 }}>Performance Metrics</h3>
            {[
              { label:'Success Rate',      value:s.successRate, icon:'🎯', color:'#4f46e5', width:94 },
              { label:'On-time Delivery',  value:'97%',         icon:'⏰', color:'#10b981', width:97 },
              { label:'Client Retention',  value:'78%',         icon:'🤝', color:'#f59e0b', width:78 },
              { label:'Response Rate',     value:'100%',        icon:'💬', color:'#0ea5e9', width:100 },
            ].map((m,i)=>(
              <div key={i} style={{ marginBottom:14 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:5 }}>
                  <span style={{ fontSize:13, color:'#374151', display:'flex', alignItems:'center', gap:6 }}><span>{m.icon}</span>{m.label}</span>
                  <span style={{ fontSize:13, fontWeight:800, color:m.color }}>{m.value}</span>
                </div>
                <div style={{ height:6, background:'#f1f5f9', borderRadius:3, overflow:'hidden' }}>
                  <div style={{ height:'100%', width:`${m.width}%`, background:m.color, borderRadius:3, transition:'width 0.8s ease' }} />
                </div>
              </div>
            ))}

            <div style={{ marginTop:16, padding:14, background:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:10, display:'flex', gap:10, alignItems:'center' }}>
              <div style={{ fontSize:20 }}>🏆</div>
              <div>
                <div style={{ fontSize:13, fontWeight:700, color:'#15803d' }}>Top Rated Freelancer</div>
                <div style={{ fontSize:11, color:'#16a34a' }}>In top 5% of your category</div>
              </div>
            </div>
          </div>
        </div>

        {/* ── BOTTOM ROW ── */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 320px', gap:18 }}>

          {/* Recent Proposals */}
          <div style={{ ...card, padding:'22px 24px' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:18 }}>
              <h3 style={{ fontSize:15, fontWeight:800, color:'#111827' }}>Recent Proposals</h3>
              <Link to="/my-proposals" style={{ fontSize:13, color:'#4f46e5', fontWeight:600, textDecoration:'none' }}>View all →</Link>
            </div>
            {displayProposals.map((p,i)=>{
              const sc = STATUS[p.status] || STATUS.pending;
              return (
                <div key={p._id||i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'13px 0', borderBottom:'1px solid #f9fafb', gap:12 }}>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:14, fontWeight:600, color:'#111827', marginBottom:3, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{p.gig?.title||'Job Proposal'}</div>
                    <div style={{ fontSize:12, color:'#9ca3af' }}>{new Date(p.createdAt).toLocaleDateString('en-IN',{day:'numeric',month:'short'})}</div>
                  </div>
                  <div style={{ display:'flex', gap:10, alignItems:'center', flexShrink:0 }}>
                    <span style={{ fontSize:14, fontWeight:800, color:'#4f46e5', fontFamily:'Syne, sans-serif' }}>₹{Number(p.amount||0).toLocaleString()}</span>
                    <span style={{ fontSize:11, fontWeight:700, padding:'3px 10px', borderRadius:999, background:sc.bg, color:sc.color }}>{sc.label}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right sidebar */}
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>

            {/* Quick actions */}
            <div style={{ ...card, padding:'20px' }}>
              <h3 style={{ fontSize:14, fontWeight:800, color:'#111827', marginBottom:14 }}>Quick Actions</h3>
              {[
                { icon:'🔍', label:'Browse New Jobs',    to:'/gigs',          bg:'#ede9fe', color:'#4f46e5' },
                { icon:'👤', label:'Update Profile',     to:'/settings',       bg:'#e0f2fe', color:'#0ea5e9' },
                { icon:'📋', label:'My Proposals',       to:'/my-proposals',   bg:'#dcfce7', color:'#16a34a' },
                { icon:'💬', label:'Messages',           to:'/chat',           bg:'#fef3c7', color:'#d97706' },
              ].map(item=>(
                <Link key={item.to} to={item.to} style={{ textDecoration:'none' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 12px', borderRadius:10, marginBottom:6, transition:'all 0.2s', background:'transparent' }}
                    onMouseEnter={e=>e.currentTarget.style.background=item.bg}
                    onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                    <div style={{ width:32, height:32, borderRadius:8, background:item.bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:15, flexShrink:0 }}>{item.icon}</div>
                    <span style={{ fontSize:13, fontWeight:600, color:'#374151' }}>{item.label}</span>
                    <span style={{ marginLeft:'auto', color:'#9ca3af', fontSize:14 }}>→</span>
                  </div>
                </Link>
              ))}
            </div>

            {/* Profile strength */}
            <div style={{ ...card, padding:'20px' }}>
              <h3 style={{ fontSize:14, fontWeight:800, color:'#111827', marginBottom:8 }}>Profile Visibility</h3>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                <span style={{ fontSize:13, color:'#6b7280' }}>Completeness</span>
                <span style={{ fontSize:13, fontWeight:700, color:'#4f46e5' }}>75%</span>
              </div>
              <div style={{ height:8, background:'#f1f5f9', borderRadius:4, marginBottom:12 }}>
                <div style={{ height:'100%', width:'75%', background:'linear-gradient(90deg,#4f46e5,#22D3EE)', borderRadius:4 }} />
              </div>
              <p style={{ fontSize:12, color:'#9ca3af', marginBottom:10, lineHeight:1.6 }}>Complete your profile to get 3× more job invitations</p>
              <div style={{ display:'flex', gap:8, fontSize:12, color:'#9ca3af' }}>
                <span style={{ color:'#16a34a' }}>✓ Photo</span>
                <span style={{ color:'#16a34a' }}>✓ Bio</span>
                <span>○ Portfolio</span>
                <span>○ Skills</span>
              </div>
              <Link to="/settings">
                <button style={{ width:'100%', marginTop:12, padding:'9px', borderRadius:10, background:'#f5f3ff', border:'1px solid #ede9fe', color:'#4f46e5', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'inherit', transition:'all 0.2s' }}
                  onMouseEnter={e=>e.target.style.background='#ede9fe'}
                  onMouseLeave={e=>e.target.style.background='#f5f3ff'}>
                  Complete Profile
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        @keyframes spin{to{transform:rotate(360deg)}}
      `}</style>
    </div>
  );
};

export default FreelancerDashboard;
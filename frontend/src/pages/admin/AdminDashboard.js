import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const GROWTH_DATA = [
  { month:'Sep', users:120, gigs:45, revenue:280000 },
  { month:'Oct', users:180, gigs:62, revenue:420000 },
  { month:'Nov', users:145, gigs:55, revenue:360000 },
  { month:'Dec', users:220, gigs:78, revenue:580000 },
  { month:'Jan', users:195, gigs:70, revenue:490000 },
  { month:'Feb', users:260, gigs:94, revenue:720000 },
  { month:'Mar', users:310, gigs:115, revenue:850000 },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active||!payload?.length) return null;
  return (
    <div style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:10, padding:'10px 14px', boxShadow:'0 4px 16px rgba(0,0,0,0.1)', fontFamily:'Plus Jakarta Sans, sans-serif' }}>
      <p style={{ fontSize:12, fontWeight:600, color:'#374151', marginBottom:4 }}>{label}</p>
      {payload.map((p,i)=><p key={i} style={{ fontSize:13, fontWeight:700, color:p.color, margin:0 }}>{p.name}: {p.name==='Revenue'?`₹${Number(p.value).toLocaleString()}`:p.value}</p>)}
    </div>
  );
};

const AdminDashboard = () => {
  const { user }   = useSelector(s => s.auth || {});
  const navigate   = useNavigate();
  const [stats, setStats] = useState(null);
  const [recentUsers, setRecentUsers] = useState([]);
  const [pendingGigs, setPendingGigs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [sRes, uRes, gRes] = await Promise.allSettled([
          api.get('/admin/stats'),
          api.get('/admin/users?limit=5&sort=newest'),
          api.get('/admin/gigs?status=pending&limit=5'),
        ]);
        if (sRes.status==='fulfilled') setStats(sRes.value.data);
        if (uRes.status==='fulfilled') {
          const d = uRes.value.data;
          setRecentUsers(Array.isArray(d)?d:Array.isArray(d?.users)?d.users:[]);
        }
        if (gRes.status==='fulfilled') {
          const d = gRes.value.data;
          setPendingGigs(Array.isArray(d)?d:Array.isArray(d?.gigs)?d.gigs:[]);
        }
      } catch { /* use demo */ }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const s = {
    totalUsers:     stats?.totalUsers     ?? 1842,
    totalGigs:      stats?.totalGigs      ?? 634,
    totalRevenue:   stats?.totalRevenue   ?? 4280000,
    activeProjects: stats?.activeProjects ?? 127,
    pendingApproval:stats?.pendingApproval?? 18,
    disputes:       stats?.disputes       ?? 5,
    newUsersToday:  stats?.newUsersToday  ?? 23,
    platformFee:    stats?.platformFee    ?? 428000,
  };

  const demoUsers = [
    { _id:'u1', name:'Rahul Kumar',   email:'rahul@email.com', role:'freelancer', isVerified:true,  createdAt:new Date(Date.now()-86400000),    status:'active' },
    { _id:'u2', name:'Priya Sharma',  email:'priya@email.com', role:'client',     isVerified:true,  createdAt:new Date(Date.now()-2*86400000),  status:'active' },
    { _id:'u3', name:'Arjun Verma',   email:'arjun@email.com', role:'freelancer', isVerified:false, createdAt:new Date(Date.now()-3*86400000),  status:'active' },
    { _id:'u4', name:'Meera Singh',   email:'meera@email.com', role:'client',     isVerified:true,  createdAt:new Date(Date.now()-4*86400000),  status:'suspended' },
    { _id:'u5', name:'Vikram Nair',   email:'vikram@email.com',role:'freelancer', isVerified:false, createdAt:new Date(Date.now()-5*86400000),  status:'active' },
  ];

  const demoPendingGigs = [
    { _id:'g1', title:'React Dashboard App', client:{ name:'Tech Corp' }, budget:45000, createdAt:new Date(Date.now()-86400000) },
    { _id:'g2', title:'Python ML Pipeline',  client:{ name:'Data Inc' },  budget:62000, createdAt:new Date(Date.now()-2*86400000) },
    { _id:'g3', title:'Mobile App Design',   client:{ name:'StartupX' },  budget:28000, createdAt:new Date(Date.now()-3*86400000) },
  ];

  const displayUsers = recentUsers.length>0 ? recentUsers : demoUsers;
  const displayGigs  = pendingGigs.length>0  ? pendingGigs  : demoPendingGigs;

  const approveGig = async (id) => {
    try { await api.patch(`/admin/gigs/${id}/approve`); toast.success('Gig approved!'); setPendingGigs(p=>p.filter(g=>g._id!==id)); }
    catch { toast.error('Failed'); }
  };
  const rejectGig = async (id) => {
    try { await api.patch(`/admin/gigs/${id}/reject`); toast.success('Gig rejected.'); setPendingGigs(p=>p.filter(g=>g._id!==id)); }
    catch { toast.error('Failed'); }
  };

  const card = { background:'#fff', border:'1px solid #e5e7eb', borderRadius:16, boxShadow:'0 2px 8px rgba(0,0,0,0.04)' };

  return (
    <div style={{ minHeight:'100vh', background:'#f8fafc', fontFamily:"'Plus Jakarta Sans',sans-serif" }}>

      {/* ── HEADER ── */}
      <div style={{ background:'linear-gradient(135deg,#1e1b4b,#312e81,#1e40af)', padding:'32px 48px 80px', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', inset:0, backgroundImage:'radial-gradient(circle at 80% 30%, rgba(99,102,241,0.2) 0%, transparent 50%)', pointerEvents:'none' }} />
        <div style={{ maxWidth:1300, margin:'0 auto', position:'relative', zIndex:1 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:16 }}>
            <div>
              <p style={{ color:'#a5b4fc', fontSize:13, marginBottom:8 }}>Admin Panel</p>
              <h1 style={{ fontSize:28, fontWeight:900, color:'#fff', fontFamily:'Syne, sans-serif', marginBottom:4 }}>Platform Overview</h1>
              <p style={{ color:'#a5b4fc', fontSize:14 }}>Monitor, manage and grow SkillSphere</p>
            </div>
            <div style={{ display:'flex', gap:10 }}>
              <Link to="/admin/users"><button style={{ padding:'10px 20px', borderRadius:10, background:'rgba(255,255,255,0.12)', border:'1px solid rgba(255,255,255,0.2)', color:'#fff', fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>👥 Users</button></Link>
              <Link to="/admin/gigs"><button style={{ padding:'10px 20px', borderRadius:10, background:'rgba(255,255,255,0.12)', border:'1px solid rgba(255,255,255,0.2)', color:'#fff', fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>📌 Gigs</button></Link>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth:1300, margin:'-48px auto 0', padding:'0 48px 60px', position:'relative', zIndex:2 }}>

        {/* ── STAT CARDS ── */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:22 }}>
          {[
            { icon:'👥', label:'Total Users',      value:s.totalUsers.toLocaleString(),    sub:`+${s.newUsersToday} today`,   color:'#4f46e5', bg:'#ede9fe', trend:18 },
            { icon:'📌', label:'Total Gigs',       value:s.totalGigs.toLocaleString(),     sub:`${s.pendingApproval} pending`, color:'#0ea5e9', bg:'#e0f2fe', trend:12 },
            { icon:'💰', label:'Total Revenue',    value:`₹${(s.totalRevenue/100000).toFixed(1)}L`, sub:`Fee: ₹${(s.platformFee/1000).toFixed(0)}K`, color:'#16a34a', bg:'#dcfce7', trend:24 },
            { icon:'⚠️', label:'Open Disputes',   value:s.disputes,                       sub:'Needs attention',             color:'#dc2626', bg:'#fee2e2', trend:-2 },
          ].map((st,i)=>(
            <div key={i} style={{ ...card, padding:'20px 22px', position:'relative', overflow:'hidden', transition:'all 0.25s' }}
              onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-3px)';e.currentTarget.style.boxShadow='0 8px 24px rgba(0,0,0,0.08)';}}
              onMouseLeave={e=>{e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.boxShadow='0 2px 8px rgba(0,0,0,0.04)';}}>
              <div style={{ position:'absolute', top:0, right:0, width:60, height:60, background:`${st.color}10`, borderRadius:'0 16px 0 60px' }} />
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
                <div style={{ width:40, height:40, borderRadius:10, background:st.bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>{st.icon}</div>
                <span style={{ fontSize:11, fontWeight:700, padding:'3px 8px', borderRadius:999, background:st.trend>0?'#dcfce7':'#fee2e2', color:st.trend>0?'#16a34a':'#dc2626' }}>{st.trend>0?'↑':'↓'}{Math.abs(st.trend)}%</span>
              </div>
              <div style={{ fontSize:24, fontWeight:900, color:st.color, fontFamily:'Syne, sans-serif', marginBottom:2 }}>{st.value}</div>
              <div style={{ fontSize:13, fontWeight:600, color:'#374151', marginBottom:2 }}>{st.label}</div>
              <div style={{ fontSize:11, color:'#9ca3af' }}>{st.sub}</div>
            </div>
          ))}
        </div>

        {/* ── SECONDARY STATS ── */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:22 }}>
          {[
            { label:'Active Projects',    value:s.activeProjects, color:'#0ea5e9' },
            { label:'Pending Approvals',  value:s.pendingApproval,color:'#d97706' },
            { label:'Platform Fee (MTD)', value:`₹${(s.platformFee/1000).toFixed(0)}K`, color:'#16a34a' },
            { label:'New Users Today',    value:s.newUsersToday,   color:'#7c3aed' },
          ].map((m,i)=>(
            <div key={i} style={{ ...card, padding:'16px 20px', display:'flex', alignItems:'center', gap:14 }}>
              <div style={{ width:8, height:40, borderRadius:4, background:m.color, flexShrink:0 }} />
              <div>
                <div style={{ fontSize:20, fontWeight:900, color:m.color, fontFamily:'Syne, sans-serif' }}>{m.value}</div>
                <div style={{ fontSize:12, color:'#9ca3af', marginTop:2 }}>{m.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ── CHARTS ── */}
        <div style={{ display:'grid', gridTemplateColumns:'3fr 2fr', gap:18, marginBottom:18 }}>

          {/* Revenue Chart */}
          <div style={{ ...card, padding:'22px 24px' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
              <div>
                <h3 style={{ fontSize:15, fontWeight:800, color:'#111827', marginBottom:2 }}>Platform Growth</h3>
                <p style={{ fontSize:12, color:'#9ca3af' }}>Users, gigs & revenue over 7 months</p>
              </div>
              <div style={{ fontSize:18, fontWeight:900, color:'#16a34a', fontFamily:'Syne, sans-serif' }}>₹{(s.totalRevenue/100000).toFixed(1)}L</div>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={GROWTH_DATA}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#4f46e5" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="usrGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#22D3EE" stopOpacity={0.12}/>
                    <stop offset="95%" stopColor="#22D3EE" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize:11, fill:'#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize:11, fill:'#9ca3af' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="users"   name="Users"   stroke="#22D3EE" strokeWidth={2} fill="url(#usrGrad)" />
                <Area type="monotone" dataKey="gigs"    name="Gigs"    stroke="#4f46e5" strokeWidth={2} fill="url(#revGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Revenue Bar */}
          <div style={{ ...card, padding:'22px 24px' }}>
            <h3 style={{ fontSize:15, fontWeight:800, color:'#111827', marginBottom:2 }}>Monthly Revenue</h3>
            <p style={{ fontSize:12, color:'#9ca3af', marginBottom:16 }}>Last 7 months</p>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={GROWTH_DATA} barSize={18}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize:11, fill:'#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize:11, fill:'#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={v=>`₹${(v/1000).toFixed(0)}K`} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="revenue" name="Revenue" fill="#4f46e5" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ── TABLES ── */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:18 }}>

          {/* Recent Users */}
          <div style={{ ...card, overflow:'hidden' }}>
            <div style={{ padding:'18px 22px', borderBottom:'1px solid #f1f5f9', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <h3 style={{ fontSize:15, fontWeight:800, color:'#111827' }}>Recent Users</h3>
              <Link to="/admin/users" style={{ fontSize:13, color:'#4f46e5', fontWeight:600, textDecoration:'none' }}>View all →</Link>
            </div>
            <div style={{ padding:'0 22px' }}>
              {displayUsers.map((u,i)=>(
                <div key={u._id||i} style={{ display:'flex', alignItems:'center', gap:12, padding:'13px 0', borderBottom:'1px solid #f9fafb' }}>
                  <div style={{ width:36, height:36, borderRadius:'50%', background:`linear-gradient(135deg,${['#6366F1,#8b5cf6','#0ea5e9,#22D3EE','#10b981,#34d399','#f59e0b,#fbbf24','#ec4899,#f43f5e'][i%5]})`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:800, color:'#fff', flexShrink:0 }}>
                    {u.name?.[0]?.toUpperCase()||'U'}
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:13, fontWeight:600, color:'#111827', display:'flex', alignItems:'center', gap:6 }}>
                      {u.name}
                      {u.isVerified && <span style={{ fontSize:10, color:'#16a34a' }}>✓</span>}
                    </div>
                    <div style={{ fontSize:11, color:'#9ca3af', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{u.email}</div>
                  </div>
                  <div style={{ display:'flex', gap:6, flexShrink:0 }}>
                    <span style={{ fontSize:11, fontWeight:700, padding:'2px 8px', borderRadius:999, background:'#ede9fe', color:'#7c3aed', textTransform:'capitalize' }}>{u.role}</span>
                    <span style={{ fontSize:11, fontWeight:700, padding:'2px 8px', borderRadius:999, background:u.status==='suspended'?'#fee2e2':'#dcfce7', color:u.status==='suspended'?'#dc2626':'#16a34a' }}>
                      {u.status==='suspended'?'Suspended':'Active'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pending Gig Approvals */}
          <div style={{ ...card, overflow:'hidden' }}>
            <div style={{ padding:'18px 22px', borderBottom:'1px solid #f1f5f9', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <h3 style={{ fontSize:15, fontWeight:800, color:'#111827' }}>Pending Approvals</h3>
              <Link to="/admin/gigs" style={{ fontSize:13, color:'#4f46e5', fontWeight:600, textDecoration:'none' }}>View all →</Link>
            </div>
            {displayGigs.length === 0 ? (
              <div style={{ padding:'40px 22px', textAlign:'center', color:'#9ca3af', fontSize:13 }}>No pending approvals 🎉</div>
            ) : (
              <div style={{ padding:'0 22px' }}>
                {displayGigs.map((g,i)=>(
                  <div key={g._id||i} style={{ padding:'13px 0', borderBottom:'1px solid #f9fafb' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8 }}>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontSize:13, fontWeight:600, color:'#111827', marginBottom:2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{g.title}</div>
                        <div style={{ fontSize:11, color:'#9ca3af' }}>{g.client?.name} · ₹{Number(g.budget||0).toLocaleString()}</div>
                      </div>
                    </div>
                    <div style={{ display:'flex', gap:8 }}>
                      <button onClick={()=>approveGig(g._id)} style={{ padding:'6px 14px', borderRadius:8, background:'#dcfce7', border:'1px solid #bbf7d0', color:'#16a34a', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'inherit', transition:'all 0.2s' }}
                        onMouseEnter={e=>e.target.style.background='#bbf7d0'}
                        onMouseLeave={e=>e.target.style.background='#dcfce7'}>✓ Approve</button>
                      <button onClick={()=>rejectGig(g._id)} style={{ padding:'6px 14px', borderRadius:8, background:'#fee2e2', border:'1px solid #fecaca', color:'#dc2626', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'inherit', transition:'all 0.2s' }}
                        onMouseEnter={e=>e.target.style.background='#fecaca'}
                        onMouseLeave={e=>e.target.style.background='#fee2e2'}>✗ Reject</button>
                      <button onClick={()=>navigate(`/gigs/${g._id}`)} style={{ padding:'6px 14px', borderRadius:8, background:'#f8fafc', border:'1px solid #e5e7eb', color:'#374151', fontSize:12, fontWeight:500, cursor:'pointer', fontFamily:'inherit' }}>View</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
      `}</style>
    </div>
  );
};

export default AdminDashboard;
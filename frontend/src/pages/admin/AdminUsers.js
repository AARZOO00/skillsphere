import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const AdminUsers = () => {
  const [users,    setUsers]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page,     setPage]     = useState(1);
  const [total,    setTotal]    = useState(0);
  const [selected, setSelected] = useState(null);
  const PER_PAGE = 10;

  useEffect(() => { fetchUsers(); }, [search, roleFilter, statusFilter, page]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = { page, limit:PER_PAGE };
      if (search)       params.search = search;
      if (roleFilter !== 'all')   params.role   = roleFilter;
      if (statusFilter !== 'all') params.status = statusFilter;
      const res  = await api.get('/admin/users', { params });
      const d    = res.data;
      setUsers(Array.isArray(d)?d:Array.isArray(d?.users)?d.users:[]);
      setTotal(d?.total || d?.length || 0);
    } catch { setUsers([]); }
    finally { setLoading(false); }
  };

  const suspendUser = async (id) => {
    try {
      await api.patch(`/admin/users/${id}/suspend`);
      toast.success('User suspended.');
      setUsers(u => u.map(x => x._id===id ? {...x, status:'suspended'} : x));
      if (selected?._id===id) setSelected(p => ({...p, status:'suspended'}));
    } catch { toast.error('Failed'); }
  };

  const activateUser = async (id) => {
    try {
      await api.patch(`/admin/users/${id}/activate`);
      toast.success('User activated.');
      setUsers(u => u.map(x => x._id===id ? {...x, status:'active'} : x));
      if (selected?._id===id) setSelected(p => ({...p, status:'active'}));
    } catch { toast.error('Failed'); }
  };

  const verifyUser = async (id) => {
    try {
      await api.patch(`/admin/users/${id}/verify`);
      toast.success('User verified ✓');
      setUsers(u => u.map(x => x._id===id ? {...x, isVerified:true} : x));
      if (selected?._id===id) setSelected(p => ({...p, isVerified:true}));
    } catch { toast.error('Failed'); }
  };

  // Demo users
  const demoUsers = Array.from({length:10}, (_,i)=>({
    _id:`u${i}`, name:['Rahul Kumar','Priya Sharma','Arjun Nair','Meera Singh','Vikram Patel','Sneha Verma','Amit Shah','Nisha Gupta','Rohit Das','Kavya Rao'][i],
    email:[`rahul${i}@email.com`][0]||`user${i}@email.com`,
    role:['freelancer','client','freelancer','client','freelancer','client','freelancer','client','freelancer','admin'][i],
    isVerified:[true,true,false,true,false,true,true,false,true,true][i],
    status:['active','active','active','suspended','active','active','active','active','active','active'][i],
    createdAt:new Date(Date.now()-(i+1)*86400000*7),
    completedProjects:[12,0,8,0,23,0,5,0,31,0][i],
    totalEarned:[145000,0,98000,0,280000,0,62000,0,410000,0][i],
    totalSpent:[0,85000,0,120000,0,45000,0,200000,0,0][i],
  }));

  const displayUsers = users.length>0 ? users : demoUsers;
  const pages = Math.max(1, Math.ceil((total||displayUsers.length)/PER_PAGE));

  const ROLE_COLORS = { freelancer:{bg:'#ede9fe',color:'#7c3aed'}, client:{bg:'#dbeafe',color:'#1d4ed8'}, admin:{bg:'#fef3c7',color:'#d97706'} };

  const card = { background:'#fff', border:'1px solid #e5e7eb', borderRadius:16, boxShadow:'0 2px 8px rgba(0,0,0,0.04)' };

  return (
    <div style={{ minHeight:'100vh', background:'#f8fafc', fontFamily:"'Plus Jakarta Sans',sans-serif" }}>

      {/* HEADER */}
      <div style={{ background:'linear-gradient(135deg,#1e1b4b,#312e81,#1e40af)', padding:'32px 48px 72px', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', inset:0, backgroundImage:'radial-gradient(circle at 85% 50%, rgba(99,102,241,0.15) 0%, transparent 50%)', pointerEvents:'none' }} />
        <div style={{ maxWidth:1200, margin:'0 auto', position:'relative', zIndex:1 }}>
          <p style={{ color:'#a5b4fc', fontSize:13, marginBottom:8 }}>Admin Panel</p>
          <h1 style={{ fontSize:28, fontWeight:900, color:'#fff', fontFamily:'Syne, sans-serif', marginBottom:4 }}>User Management</h1>
          <p style={{ color:'#a5b4fc', fontSize:14 }}>Manage all users, verify profiles, and handle suspensions</p>
        </div>
      </div>

      <div style={{ maxWidth:1200, margin:'-40px auto 0', padding:'0 48px 60px', position:'relative', zIndex:2 }}>
        <div style={{ display:'grid', gridTemplateColumns: selected ? '1fr 340px' : '1fr', gap:20 }}>

          {/* MAIN TABLE */}
          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>

            {/* Filters */}
            <div style={{ ...card, padding:'16px 20px', display:'flex', gap:12, alignItems:'center', flexWrap:'wrap' }}>
              <div style={{ display:'flex', alignItems:'center', gap:8, background:'#f8fafc', border:'1px solid #e5e7eb', borderRadius:10, padding:'9px 13px', flex:1, minWidth:200 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2.5" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                <input type="text" placeholder="Search by name or email…" value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}} style={{ background:'transparent', border:'none', outline:'none', fontSize:13, color:'#374151', fontFamily:'inherit', width:'100%' }} />
              </div>
              <div style={{ display:'flex', gap:6 }}>
                {['all','freelancer','client','admin'].map(r=>(
                  <button key={r} onClick={()=>{setRoleFilter(r);setPage(1);}} style={{ padding:'8px 14px', borderRadius:9, fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:'inherit', transition:'all 0.2s', background:roleFilter===r?'#4f46e5':'transparent', color:roleFilter===r?'#fff':'#6b7280', border:`1px solid ${roleFilter===r?'#4f46e5':'#e5e7eb'}`, textTransform:'capitalize' }}>{r}</button>
                ))}
              </div>
              <div style={{ display:'flex', gap:6 }}>
                {['all','active','suspended'].map(s=>(
                  <button key={s} onClick={()=>{setStatusFilter(s);setPage(1);}} style={{ padding:'8px 14px', borderRadius:9, fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:'inherit', transition:'all 0.2s', background:statusFilter===s?'#374151':'transparent', color:statusFilter===s?'#fff':'#6b7280', border:`1px solid ${statusFilter===s?'#374151':'#e5e7eb'}`, textTransform:'capitalize' }}>{s}</button>
                ))}
              </div>
            </div>

            {/* Table */}
            <div style={{ ...card, overflow:'hidden' }}>
              {/* Head */}
              <div style={{ display:'grid', gridTemplateColumns:'2fr 1.5fr 1fr 1fr 1fr', gap:16, padding:'13px 20px', background:'#f8fafc', borderBottom:'1px solid #f1f5f9' }}>
                {['User','Email','Role','Status','Actions'].map(h=><span key={h} style={{ fontSize:11, fontWeight:700, color:'#9ca3af', textTransform:'uppercase', letterSpacing:0.5 }}>{h}</span>)}
              </div>

              {loading ? (
                <div style={{ padding:32 }}>
                  {[1,2,3,4,5].map(i=><div key={i} style={{ height:52, background:'#f8fafc', borderRadius:10, marginBottom:8, animation:'shimmer 1.5s ease-in-out infinite' }} />)}
                </div>
              ) : displayUsers.map((u,i)=>{
                const rc = ROLE_COLORS[u.role] || ROLE_COLORS.client;
                return (
                  <div key={u._id||i} onClick={()=>setSelected(selected?._id===u._id?null:u)}
                    style={{ display:'grid', gridTemplateColumns:'2fr 1.5fr 1fr 1fr 1fr', gap:16, padding:'14px 20px', borderBottom:'1px solid #f9fafb', alignItems:'center', cursor:'pointer', transition:'background 0.15s', background:selected?._id===u._id?'#f5f3ff':'transparent' }}
                    onMouseEnter={e=>{ if(selected?._id!==u._id) e.currentTarget.style.background='#fafafa'; }}
                    onMouseLeave={e=>{ if(selected?._id!==u._id) e.currentTarget.style.background='transparent'; }}>

                    {/* Name + avatar */}
                    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                      <div style={{ width:34, height:34, borderRadius:'50%', background:`linear-gradient(135deg,${['#6366F1,#8b5cf6','#0ea5e9,#22D3EE','#10b981,#34d399','#f59e0b,#fbbf24','#ec4899,#f43f5e'][i%5]})`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:800, color:'#fff', flexShrink:0 }}>
                        {u.name?.[0]?.toUpperCase()||'U'}
                      </div>
                      <div>
                        <div style={{ fontSize:13, fontWeight:600, color:'#111827', display:'flex', alignItems:'center', gap:5 }}>
                          {u.name}
                          {u.isVerified && <svg width="12" height="12" viewBox="0 0 12 12" fill="#16a34a"><path d="M6 0a6 6 0 1 0 0 12A6 6 0 0 0 6 0zm3 4.5L5.5 8 3 5.5l.7-.7 1.8 1.8L8.3 3.8 9 4.5z"/></svg>}
                        </div>
                        <div style={{ fontSize:11, color:'#9ca3af' }}>{new Date(u.createdAt).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}</div>
                      </div>
                    </div>

                    {/* Email */}
                    <span style={{ fontSize:12, color:'#6b7280', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{u.email}</span>

                    {/* Role */}
                    <span style={{ fontSize:11, fontWeight:700, padding:'3px 10px', borderRadius:999, background:rc.bg, color:rc.color, textTransform:'capitalize', display:'inline-block' }}>{u.role}</span>

                    {/* Status */}
                    <span style={{ fontSize:11, fontWeight:700, padding:'3px 10px', borderRadius:999, background:u.status==='suspended'?'#fee2e2':'#dcfce7', color:u.status==='suspended'?'#dc2626':'#16a34a', display:'inline-block' }}>
                      {u.status==='suspended'?'Suspended':'Active'}
                    </span>

                    {/* Actions */}
                    <div style={{ display:'flex', gap:6 }}>
                      {!u.isVerified && (
                        <button onClick={e=>{e.stopPropagation();verifyUser(u._id);}} style={{ padding:'5px 10px', borderRadius:7, background:'#dbeafe', border:'none', color:'#1d4ed8', fontSize:11, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>Verify</button>
                      )}
                      {u.status==='active'
                        ? <button onClick={e=>{e.stopPropagation();suspendUser(u._id);}} style={{ padding:'5px 10px', borderRadius:7, background:'#fee2e2', border:'none', color:'#dc2626', fontSize:11, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>Suspend</button>
                        : <button onClick={e=>{e.stopPropagation();activateUser(u._id);}} style={{ padding:'5px 10px', borderRadius:7, background:'#dcfce7', border:'none', color:'#16a34a', fontSize:11, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>Activate</button>
                      }
                    </div>
                  </div>
                );
              })}

              {/* Pagination */}
              <div style={{ padding:'14px 20px', display:'flex', justifyContent:'space-between', alignItems:'center', borderTop:'1px solid #f1f5f9' }}>
                <span style={{ fontSize:13, color:'#9ca3af' }}>Showing {displayUsers.length} users</span>
                <div style={{ display:'flex', gap:6 }}>
                  <button onClick={()=>setPage(p=>Math.max(p-1,1))} disabled={page===1} style={{ padding:'7px 14px', borderRadius:8, border:'1px solid #e5e7eb', background:page===1?'#f8fafc':'#fff', color:page===1?'#d1d5db':'#374151', fontSize:13, fontWeight:500, cursor:page===1?'not-allowed':'pointer', fontFamily:'inherit' }}>← Prev</button>
                  {Array.from({length:Math.min(pages,5)},(_,i)=>i+1).map(p=>(
                    <button key={p} onClick={()=>setPage(p)} style={{ width:34, height:34, borderRadius:8, border:`1px solid ${page===p?'#4f46e5':'#e5e7eb'}`, background:page===p?'#4f46e5':'#fff', color:page===p?'#fff':'#374151', fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>{p}</button>
                  ))}
                  <button onClick={()=>setPage(p=>Math.min(p+1,pages))} disabled={page===pages} style={{ padding:'7px 14px', borderRadius:8, border:'1px solid #e5e7eb', background:page===pages?'#f8fafc':'#fff', color:page===pages?'#d1d5db':'#374151', fontSize:13, fontWeight:500, cursor:page===pages?'not-allowed':'pointer', fontFamily:'inherit' }}>Next →</button>
                </div>
              </div>
            </div>
          </div>

          {/* USER DETAIL PANEL */}
          {selected && (
            <div style={{ ...card, padding:22, height:'fit-content', position:'sticky', top:80 }}>
              {/* Close */}
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:18 }}>
                <h3 style={{ fontSize:15, fontWeight:800, color:'#111827' }}>User Details</h3>
                <button onClick={()=>setSelected(null)} style={{ background:'none', border:'none', cursor:'pointer', fontSize:20, color:'#9ca3af', lineHeight:1 }}>×</button>
              </div>

              {/* Avatar + name */}
              <div style={{ textAlign:'center', marginBottom:18, padding:'18px', background:'#f8fafc', borderRadius:14 }}>
                <div style={{ width:60, height:60, borderRadius:16, background:'linear-gradient(135deg,#6366F1,#22D3EE)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, fontWeight:900, color:'#fff', margin:'0 auto 10px', boxShadow:'0 4px 12px rgba(99,102,241,0.3)' }}>
                  {selected.name?.[0]?.toUpperCase()||'U'}
                </div>
                <div style={{ fontSize:15, fontWeight:700, color:'#111827', marginBottom:2 }}>{selected.name}</div>
                <div style={{ fontSize:12, color:'#9ca3af', marginBottom:8 }}>{selected.email}</div>
                <div style={{ display:'flex', gap:6, justifyContent:'center' }}>
                  <span style={{ fontSize:11, fontWeight:700, padding:'3px 10px', borderRadius:999, background:(ROLE_COLORS[selected.role]||ROLE_COLORS.client).bg, color:(ROLE_COLORS[selected.role]||ROLE_COLORS.client).color, textTransform:'capitalize' }}>{selected.role}</span>
                  <span style={{ fontSize:11, fontWeight:700, padding:'3px 10px', borderRadius:999, background:selected.status==='suspended'?'#fee2e2':'#dcfce7', color:selected.status==='suspended'?'#dc2626':'#16a34a' }}>
                    {selected.status==='suspended'?'Suspended':'Active'}
                  </span>
                </div>
              </div>

              {/* Stats */}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:16 }}>
                {[
                  { label:'Joined',    value:new Date(selected.createdAt).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'}) },
                  { label:'Verified',  value:selected.isVerified?'Yes ✓':'No' },
                  ...(selected.role==='freelancer'?[
                    { label:'Projects', value:selected.completedProjects||0 },
                    { label:'Earned',   value:`₹${(selected.totalEarned||0).toLocaleString()}` },
                  ]:[
                    { label:'Spent',    value:`₹${(selected.totalSpent||0).toLocaleString()}` },
                    { label:'Gigs',     value:selected.totalGigs||0 },
                  ]),
                ].map((item,i)=>(
                  <div key={i} style={{ padding:'10px 12px', background:'#f8fafc', borderRadius:10 }}>
                    <div style={{ fontSize:11, color:'#9ca3af', marginBottom:2 }}>{item.label}</div>
                    <div style={{ fontSize:14, fontWeight:700, color:'#374151' }}>{item.value}</div>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {!selected.isVerified && (
                  <button onClick={()=>verifyUser(selected._id)} style={{ width:'100%', padding:'10px', borderRadius:10, background:'#dbeafe', border:'1px solid #bfdbfe', color:'#1d4ed8', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>
                    ✓ Verify Account
                  </button>
                )}
                {selected.status==='active'
                  ? <button onClick={()=>suspendUser(selected._id)} style={{ width:'100%', padding:'10px', borderRadius:10, background:'#fee2e2', border:'1px solid #fecaca', color:'#dc2626', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>🚫 Suspend Account</button>
                  : <button onClick={()=>activateUser(selected._id)} style={{ width:'100%', padding:'10px', borderRadius:10, background:'#dcfce7', border:'1px solid #bbf7d0', color:'#16a34a', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>✓ Activate Account</button>
                }
                <button onClick={()=>toast('Email sent to user',{icon:'📧'})} style={{ width:'100%', padding:'10px', borderRadius:10, background:'#f8fafc', border:'1px solid #e5e7eb', color:'#374151', fontSize:13, fontWeight:500, cursor:'pointer', fontFamily:'inherit' }}>
                  📧 Send Email
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        @keyframes shimmer{0%,100%{opacity:1}50%{opacity:0.5}}
        input::placeholder{color:#9ca3af}
      `}</style>
    </div>
  );
};

// needed for ROLE_COLORS in panel
const ROLE_COLORS = { freelancer:{bg:'#ede9fe',color:'#7c3aed'}, client:{bg:'#dbeafe',color:'#1d4ed8'}, admin:{bg:'#fef3c7',color:'#d97706'} };

export default AdminUsers;
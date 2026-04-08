import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const STATUS_CONFIG = {
  open:      { label:'Open',      bg:'#dcfce7', color:'#16a34a' },
  active:    { label:'Active',    bg:'#dbeafe', color:'#1d4ed8' },
  pending:   { label:'Pending',   bg:'#fef3c7', color:'#d97706' },
  completed: { label:'Completed', bg:'#f3e8ff', color:'#7c3aed' },
  closed:    { label:'Closed',    bg:'#f1f5f9', color:'#64748b' },
  rejected:  { label:'Rejected',  bg:'#fee2e2', color:'#dc2626' },
};

const CAT_LABELS = { webdev:'Web Dev', mobile:'Mobile', design:'Design', datascience:'Data Science', marketing:'Marketing', writing:'Writing', video:'Video', devops:'DevOps', consulting:'Consulting' };

const AdminGigs = () => {
  const [gigs,    setGigs]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selected, setSelected] = useState(null);
  const [page,    setPage]    = useState(1);

  useEffect(() => { fetchGigs(); }, [search, statusFilter, page]);

  const fetchGigs = async () => {
    setLoading(true);
    try {
      const params = { page, limit:10 };
      if (search)                     params.search = search;
      if (statusFilter !== 'all')     params.status = statusFilter;
      const res = await api.get('/admin/gigs', { params });
      const d   = res.data;
      setGigs(Array.isArray(d)?d:Array.isArray(d?.gigs)?d.gigs:[]);
    } catch { setGigs([]); }
    finally  { setLoading(false); }
  };

  const approveGig = async (id) => {
    try {
      await api.patch(`/admin/gigs/${id}/approve`);
      toast.success('✅ Gig approved!');
      setGigs(g => g.map(x => x._id===id ? {...x,status:'open'} : x));
      if (selected?._id===id) setSelected(p=>({...p,status:'open'}));
    } catch { toast.error('Failed'); }
  };

  const rejectGig = async (id, reason='') => {
    try {
      await api.patch(`/admin/gigs/${id}/reject`, { reason });
      toast.success('Gig rejected.');
      setGigs(g => g.map(x => x._id===id ? {...x,status:'rejected'} : x));
      if (selected?._id===id) setSelected(p=>({...p,status:'rejected'}));
    } catch { toast.error('Failed'); }
  };

  const deleteGig = async (id) => {
    if (!window.confirm('Delete this gig permanently?')) return;
    try {
      await api.delete(`/admin/gigs/${id}`);
      toast.success('Gig deleted.');
      setGigs(g => g.filter(x => x._id!==id));
      if (selected?._id===id) setSelected(null);
    } catch { toast.error('Failed'); }
  };

  // Demo gigs
  const demoGigs = Array.from({length:8},(_,i)=>({
    _id:`g${i}`,
    title:['React E-commerce Dashboard','Python ML Pipeline','Mobile App UI Design','Node.js REST API','WordPress Website','Flutter App','Data Analysis Script','DevOps CI/CD Setup'][i],
    category:['webdev','datascience','design','webdev','design','mobile','datascience','devops'][i],
    budget:[45000,62000,28000,38000,22000,55000,18000,42000][i],
    budgetType:'fixed',
    status:['pending','open','active','pending','completed','open','rejected','pending'][i],
    bidsCount:[0,8,14,3,0,6,0,2][i],
    workType:'remote',
    experienceLevel:['intermediate','expert','beginner','intermediate','beginner','expert','beginner','expert'][i],
    client:{ name:['Tech Corp','Data Inc','StartupX','FinTech Co','RetailBiz','HealthApp','EduPlatform','CloudSys'][i] },
    createdAt:new Date(Date.now()-(i+1)*86400000*3),
    skills:[['React.js','Node.js'],['Python','ML'],['Figma','UI'],['Node.js','Express'],['WordPress'],['Flutter','Firebase'],['Python','Pandas'],['Docker','AWS']][i],
    description:'Detailed project description goes here. Looking for experienced professionals to deliver quality work on time.',
  }));

  const displayGigs = gigs.length>0 ? gigs : demoGigs;

  const card = { background:'#fff', border:'1px solid #e5e7eb', borderRadius:16, boxShadow:'0 2px 8px rgba(0,0,0,0.04)' };

  return (
    <div style={{ minHeight:'100vh', background:'#f8fafc', fontFamily:"'Plus Jakarta Sans',sans-serif" }}>

      {/* HEADER */}
      <div style={{ background:'linear-gradient(135deg,#1e1b4b,#312e81,#1e40af)', padding:'32px 48px 72px', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', inset:0, backgroundImage:'radial-gradient(circle at 20% 60%, rgba(99,102,241,0.15) 0%, transparent 50%)', pointerEvents:'none' }} />
        <div style={{ maxWidth:1200, margin:'0 auto', position:'relative', zIndex:1 }}>
          <p style={{ color:'#a5b4fc', fontSize:13, marginBottom:8 }}>Admin Panel</p>
          <h1 style={{ fontSize:28, fontWeight:900, color:'#fff', fontFamily:'Syne, sans-serif', marginBottom:4 }}>Gig Management</h1>
          <p style={{ color:'#a5b4fc', fontSize:14 }}>Review, approve, reject and manage all job postings</p>
        </div>
      </div>

      <div style={{ maxWidth:1200, margin:'-40px auto 0', padding:'0 48px 60px', position:'relative', zIndex:2 }}>

        {/* Quick stats */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:14, marginBottom:20 }}>
          {[
            { label:'Total Gigs',    value:displayGigs.length,                           color:'#374151', bg:'#f1f5f9' },
            { label:'Pending',       value:displayGigs.filter(g=>g.status==='pending').length,  color:'#d97706', bg:'#fef3c7' },
            { label:'Active',        value:displayGigs.filter(g=>g.status==='open'||g.status==='active').length, color:'#16a34a', bg:'#dcfce7' },
            { label:'Completed',     value:displayGigs.filter(g=>g.status==='completed').length, color:'#7c3aed', bg:'#f3e8ff' },
            { label:'Rejected',      value:displayGigs.filter(g=>g.status==='rejected').length,  color:'#dc2626', bg:'#fee2e2' },
          ].map((s,i)=>(
            <div key={i} style={{ ...card, padding:'16px 18px', cursor:'pointer', transition:'all 0.2s' }} onClick={()=>setStatusFilter(s.label.toLowerCase()==='total gigs'?'all':s.label.toLowerCase())}
              onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-2px)';e.currentTarget.style.boxShadow='0 6px 20px rgba(0,0,0,0.08)';}}
              onMouseLeave={e=>{e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.boxShadow='0 2px 8px rgba(0,0,0,0.04)';}}>
              <div style={{ width:32, height:32, borderRadius:8, background:s.bg, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:10, fontSize:16 }}>
                {['📋','⏳','✅','🏆','❌'][i]}
              </div>
              <div style={{ fontSize:22, fontWeight:900, color:s.color, fontFamily:'Syne, sans-serif', marginBottom:2 }}>{s.value}</div>
              <div style={{ fontSize:12, color:'#9ca3af' }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{ display:'grid', gridTemplateColumns: selected ? '1fr 360px' : '1fr', gap:20 }}>

          {/* GIGS TABLE */}
          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>

            {/* Filters */}
            <div style={{ ...card, padding:'16px 20px', display:'flex', gap:10, alignItems:'center', flexWrap:'wrap' }}>
              <div style={{ display:'flex', alignItems:'center', gap:8, background:'#f8fafc', border:'1px solid #e5e7eb', borderRadius:10, padding:'9px 13px', flex:1, minWidth:200 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2.5" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                <input type="text" placeholder="Search gigs…" value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}} style={{ background:'transparent', border:'none', outline:'none', fontSize:13, color:'#374151', fontFamily:'inherit', width:'100%' }} />
              </div>
              <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                {['all','pending','open','active','completed','rejected'].map(s=>(
                  <button key={s} onClick={()=>{setStatusFilter(s);setPage(1);}} style={{ padding:'7px 13px', borderRadius:9, fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:'inherit', transition:'all 0.2s', background:statusFilter===s?'#4f46e5':'transparent', color:statusFilter===s?'#fff':'#6b7280', border:`1px solid ${statusFilter===s?'#4f46e5':'#e5e7eb'}`, textTransform:'capitalize' }}>{s}</button>
                ))}
              </div>
            </div>

            {/* Table */}
            <div style={{ ...card, overflow:'hidden' }}>
              <div style={{ display:'grid', gridTemplateColumns:'2.5fr 1fr 1fr 1fr 1.2fr', gap:14, padding:'13px 20px', background:'#f8fafc', borderBottom:'1px solid #f1f5f9' }}>
                {['Title','Category','Budget','Status','Actions'].map(h=><span key={h} style={{ fontSize:11, fontWeight:700, color:'#9ca3af', textTransform:'uppercase', letterSpacing:0.5 }}>{h}</span>)}
              </div>

              {loading ? (
                <div style={{ padding:24 }}>
                  {[1,2,3,4].map(i=><div key={i} style={{ height:56, background:'#f8fafc', borderRadius:10, marginBottom:8, animation:'shimmer 1.5s ease-in-out infinite' }} />)}
                </div>
              ) : displayGigs.map((gig,i)=>{
                const sc = STATUS_CONFIG[gig.status] || STATUS_CONFIG.open;
                const isSelected = selected?._id===gig._id;
                return (
                  <div key={gig._id||i} onClick={()=>setSelected(isSelected?null:gig)}
                    style={{ display:'grid', gridTemplateColumns:'2.5fr 1fr 1fr 1fr 1.2fr', gap:14, padding:'14px 20px', borderBottom:'1px solid #f9fafb', alignItems:'center', cursor:'pointer', transition:'background 0.15s', background:isSelected?'#f5f3ff':'transparent' }}
                    onMouseEnter={e=>{ if(!isSelected) e.currentTarget.style.background='#fafafa'; }}
                    onMouseLeave={e=>{ if(!isSelected) e.currentTarget.style.background='transparent'; }}>

                    <div>
                      <div style={{ fontSize:13, fontWeight:600, color:'#111827', marginBottom:2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{gig.title}</div>
                      <div style={{ fontSize:11, color:'#9ca3af' }}>{gig.client?.name} · {gig.bidsCount||0} bids</div>
                    </div>
                    <span style={{ fontSize:11, fontWeight:600, padding:'3px 9px', borderRadius:999, background:'#f1f5f9', color:'#374151', display:'inline-block' }}>
                      {CAT_LABELS[gig.category]||gig.category}
                    </span>
                    <span style={{ fontSize:13, fontWeight:700, color:'#4f46e5' }}>₹{Number(gig.budget||0).toLocaleString()}</span>
                    <span style={{ fontSize:11, fontWeight:700, padding:'3px 10px', borderRadius:999, background:sc.bg, color:sc.color, display:'inline-block' }}>{sc.label}</span>

                    <div style={{ display:'flex', gap:6 }} onClick={e=>e.stopPropagation()}>
                      {gig.status==='pending' && (
                        <>
                          <button onClick={()=>approveGig(gig._id)} style={{ padding:'5px 10px', borderRadius:7, background:'#dcfce7', border:'none', color:'#16a34a', fontSize:11, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>✓</button>
                          <button onClick={()=>rejectGig(gig._id)} style={{ padding:'5px 10px', borderRadius:7, background:'#fee2e2', border:'none', color:'#dc2626', fontSize:11, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>✗</button>
                        </>
                      )}
                      <button onClick={()=>deleteGig(gig._id)} style={{ padding:'5px 10px', borderRadius:7, background:'#f8fafc', border:'1px solid #e5e7eb', color:'#6b7280', fontSize:11, cursor:'pointer', fontFamily:'inherit' }}>🗑</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* GIG DETAIL PANEL */}
          {selected && (
            <div style={{ ...card, padding:22, height:'fit-content', position:'sticky', top:80 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
                <h3 style={{ fontSize:15, fontWeight:800, color:'#111827' }}>Gig Details</h3>
                <button onClick={()=>setSelected(null)} style={{ background:'none', border:'none', cursor:'pointer', fontSize:20, color:'#9ca3af' }}>×</button>
              </div>

              <div style={{ padding:16, background:'#f8fafc', borderRadius:12, marginBottom:16 }}>
                <h4 style={{ fontSize:14, fontWeight:700, color:'#111827', marginBottom:6 }}>{selected.title}</h4>
                <p style={{ fontSize:12, color:'#6b7280', lineHeight:1.6, marginBottom:10 }}>{selected.description}</p>
                <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                  {(Array.isArray(selected.skills)?selected.skills:[]).map(s=>(
                    <span key={s} style={{ fontSize:11, fontWeight:600, padding:'2px 8px', borderRadius:999, background:'#ede9fe', color:'#7c3aed' }}>{s}</span>
                  ))}
                </div>
              </div>

              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:16 }}>
                {[
                  { label:'Client',    value:selected.client?.name },
                  { label:'Budget',    value:`₹${Number(selected.budget||0).toLocaleString()}` },
                  { label:'Category',  value:CAT_LABELS[selected.category]||selected.category },
                  { label:'Work Type', value:selected.workType, capitalize:true },
                  { label:'Experience',value:selected.experienceLevel, capitalize:true },
                  { label:'Bids',      value:selected.bidsCount||0 },
                ].map((item,i)=>(
                  <div key={i} style={{ padding:'10px 12px', background:'#f8fafc', borderRadius:10 }}>
                    <div style={{ fontSize:11, color:'#9ca3af', marginBottom:2 }}>{item.label}</div>
                    <div style={{ fontSize:13, fontWeight:700, color:'#374151', textTransform:item.capitalize?'capitalize':'none' }}>{item.value}</div>
                  </div>
                ))}
              </div>

              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {selected.status==='pending' && (
                  <>
                    <button onClick={()=>approveGig(selected._id)} style={{ width:'100%', padding:'11px', borderRadius:10, background:'#dcfce7', border:'1px solid #bbf7d0', color:'#16a34a', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>✓ Approve Gig</button>
                    <button onClick={()=>rejectGig(selected._id)} style={{ width:'100%', padding:'11px', borderRadius:10, background:'#fee2e2', border:'1px solid #fecaca', color:'#dc2626', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>✗ Reject Gig</button>
                  </>
                )}
                <Link to={`/gigs/${selected._id}`} style={{ textDecoration:'none' }}>
                  <button style={{ width:'100%', padding:'11px', borderRadius:10, background:'#f5f3ff', border:'1px solid #ede9fe', color:'#4f46e5', fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>👁 View Public Page</button>
                </Link>
                <button onClick={()=>deleteGig(selected._id)} style={{ width:'100%', padding:'11px', borderRadius:10, background:'#f8fafc', border:'1px solid #e5e7eb', color:'#dc2626', fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>🗑 Delete Permanently</button>
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

export default AdminGigs;
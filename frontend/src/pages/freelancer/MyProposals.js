import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const STATUS = {
  pending:  { label:'Pending',  bg:'rgba(251,191,36,0.1)',  color:'#fbbf24', border:'rgba(251,191,36,0.25)', dot:'#fbbf24' },
  accepted: { label:'Accepted', bg:'rgba(34,197,94,0.1)',   color:'#4ade80', border:'rgba(34,197,94,0.25)',  dot:'#22c55e' },
  rejected: { label:'Rejected', bg:'rgba(239,68,68,0.1)',   color:'#f87171', border:'rgba(239,68,68,0.2)',   dot:'#ef4444' },
  withdrawn:{ label:'Withdrawn',bg:'rgba(255,255,255,0.05)',color:'#64748B', border:'rgba(255,255,255,0.1)', dot:'#64748B' },
};

const MyProposals = () => {
  const { user }  = useSelector(s => s.auth || {});
  const [bids,    setBids]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab,     setTab]     = useState('all');

  useEffect(() => {
    const fetchBids = async () => {
      setLoading(true);
      try {
        const res = await api.get('/gigs/my-bids');
        const d   = res.data;
        setBids(Array.isArray(d) ? d : Array.isArray(d?.bids) ? d.bids : []);
      } catch { setBids([]); }
      finally  { setLoading(false); }
    };
    fetchBids();
  }, []);

  const withdraw = async (id) => {
    if (!window.confirm('Withdraw this bid?')) return;
    try {
      await api.delete(`/bids/${id}`);
      toast.success('Bid withdrawn.');
      setBids(b => b.filter(x => x._id !== id));
    } catch { toast.error('Failed'); }
  };

  const demo = [
    { _id:'b1', gig:{ _id:'g1', title:'React E-commerce Dashboard', budget:52000 }, amount:45000, deliveryDays:14, proposal:'I have 5 years of React experience and have built 20+ e-commerce platforms.', status:'pending',  createdAt:new Date(Date.now()-864e5) },
    { _id:'b2', gig:{ _id:'g2', title:'Mobile App UI/UX Design'},     amount:28000, deliveryDays:10, proposal:'Design specialist with expertise in Figma and mobile UI patterns.', status:'accepted', createdAt:new Date(Date.now()-2*864e5) },
    { _id:'b3', gig:{ _id:'g3', title:'Python ML Data Pipeline'},      amount:35000, deliveryDays:21, proposal:'ML engineer with TensorFlow experience and production deployments.', status:'rejected', createdAt:new Date(Date.now()-5*864e5) },
    { _id:'b4', gig:{ _id:'g4', title:'Node.js REST API Development'}, amount:32000, deliveryDays:12, proposal:'Backend specialist, built 40+ production APIs with Node.js and Express.', status:'pending',  createdAt:new Date(Date.now()-7*864e5) },
  ];

  const display  = bids.length > 0 ? bids : demo;
  const filtered = tab === 'all' ? display : display.filter(b => b.status === tab);
  const stats    = {
    total:    display.length,
    pending:  display.filter(b => b.status==='pending').length,
    accepted: display.filter(b => b.status==='accepted').length,
    rejected: display.filter(b => b.status==='rejected').length,
  };

  return (
    <div style={{ minHeight:'100vh', background:'#04081A', fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
      {/* BG */}
      <div style={{ position:'fixed', inset:0, zIndex:0, pointerEvents:'none' }}>
        <div style={{ position:'absolute', top:'10%', right:'10%', width:400, height:400, background:'radial-gradient(circle,rgba(99,102,241,0.1) 0%,transparent 65%)' }} />
        <div style={{ position:'absolute', bottom:'15%', left:'5%', width:350, height:350, background:'radial-gradient(circle,rgba(34,211,238,0.07) 0%,transparent 65%)' }} />
      </div>

      {/* HEADER */}
      <div style={{ background:'linear-gradient(135deg,#1e1b4b,#312e81,#1e40af)', padding:'32px 52px 72px', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', inset:0, backgroundImage:'radial-gradient(circle at 80% 50%,rgba(99,102,241,0.15) 0%,transparent 50%)', pointerEvents:'none' }} />
        <div style={{ maxWidth:1000, margin:'0 auto', position:'relative', zIndex:1, display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:16 }}>
          <div>
            <p style={{ color:'#a5b4fc', fontSize:13, marginBottom:8 }}>Freelancer</p>
            <h1 style={{ fontSize:28, fontWeight:900, color:'#fff', fontFamily:'Syne,sans-serif', marginBottom:4 }}>My Proposals</h1>
            <p style={{ color:'#a5b4fc', fontSize:14 }}>Track and manage all your submitted bids</p>
          </div>
          <Link to="/gigs"><button style={{ padding:'11px 22px', borderRadius:12, background:'linear-gradient(135deg,#6366F1,#22D3EE)', border:'none', color:'#fff', fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:'inherit', boxShadow:'0 4px 14px rgba(99,102,241,0.4)' }}>🔍 Browse Jobs</button></Link>
        </div>
      </div>

      <div style={{ maxWidth:1000, margin:'-48px auto 0', padding:'0 52px 60px', position:'relative', zIndex:2 }}>

        {/* STATS */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:22 }}>
          {[
            { icon:'📋', label:'Total',    value:stats.total,    color:'#6366F1' },
            { icon:'⏳', label:'Pending',  value:stats.pending,  color:'#fbbf24' },
            { icon:'✅', label:'Accepted', value:stats.accepted, color:'#4ade80' },
            { icon:'❌', label:'Rejected', value:stats.rejected, color:'#f87171' },
          ].map((s,i)=>(
            <div key={i} style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:16, padding:'18px 20px', backdropFilter:'blur(20px)', transition:'all 0.25s', cursor:'default' }}
              onMouseEnter={e=>{ e.currentTarget.style.transform='translateY(-3px)'; e.currentTarget.style.borderColor=`${s.color}44`; }}
              onMouseLeave={e=>{ e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.borderColor='rgba(255,255,255,0.07)'; }}>
              <div style={{ fontSize:20, marginBottom:8 }}>{s.icon}</div>
              <div style={{ fontSize:26, fontWeight:900, color:s.color, fontFamily:'Syne,sans-serif', marginBottom:2 }}>{s.value}</div>
              <div style={{ fontSize:12, color:'#64748B' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* TABS */}
        <div style={{ display:'flex', gap:4, marginBottom:18, borderBottom:'1px solid rgba(255,255,255,0.07)' }}>
          {['all','pending','accepted','rejected'].map(t=>(
            <button key={t} onClick={()=>setTab(t)} style={{ background:'none', border:'none', cursor:'pointer', fontFamily:'inherit', fontSize:14, fontWeight:600, padding:'10px 20px', color:tab===t?'#818CF8':'#475569', borderBottom:tab===t?'2px solid #6366F1':'2px solid transparent', textTransform:'capitalize', transition:'all 0.2s' }}>{t}</button>
          ))}
        </div>

        {/* LIST */}
        {loading ? [1,2,3].map(i=><div key={i} style={{ height:120, borderRadius:18, background:'rgba(255,255,255,0.03)', marginBottom:14, animation:'shimmer 1.5s ease-in-out infinite' }} />) :
         filtered.length===0 ? (
          <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:20, padding:'60px 24px', textAlign:'center', backdropFilter:'blur(20px)' }}>
            <div style={{ fontSize:52, marginBottom:14 }}>📭</div>
            <h3 style={{ color:'#F1F5F9', fontWeight:700, marginBottom:8 }}>No proposals yet</h3>
            <p style={{ color:'#64748B', fontSize:14, marginBottom:20 }}>Browse open gigs and start bidding</p>
            <Link to="/gigs"><button style={{ padding:'10px 24px', borderRadius:12, background:'linear-gradient(135deg,#6366F1,#22D3EE)', border:'none', color:'#fff', fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>Browse Jobs</button></Link>
          </div>
         ) : filtered.map((bid,i)=>{
          const sc = STATUS[bid.status] || STATUS.pending;
          return (
            <div key={bid._id||i} style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:20, padding:22, backdropFilter:'blur(20px)', marginBottom:14, transition:'all 0.25s' }}
              onMouseEnter={e=>{ e.currentTarget.style.transform='translateY(-3px)'; e.currentTarget.style.borderColor='rgba(99,102,241,0.3)'; e.currentTarget.style.boxShadow='0 0 30px rgba(99,102,241,0.1)'; }}
              onMouseLeave={e=>{ e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.borderColor='rgba(255,255,255,0.07)'; e.currentTarget.style.boxShadow='none'; }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:16 }}>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8, flexWrap:'wrap' }}>
                    <Link to={`/gigs/${bid.gig?._id}`} style={{ fontSize:15, fontWeight:700, color:'#F1F5F9', textDecoration:'none' }}
                      onMouseEnter={e=>e.target.style.color='#a5b4fc'}
                      onMouseLeave={e=>e.target.style.color='#F1F5F9'}>
                      {bid.gig?.title||'Job Proposal'}
                    </Link>
                    <span style={{ display:'inline-flex', alignItems:'center', gap:5, fontSize:11, fontWeight:700, padding:'3px 10px', borderRadius:999, background:sc.bg, color:sc.color, border:`1px solid ${sc.border}`, flexShrink:0 }}>
                      <span style={{ width:5, height:5, borderRadius:'50%', background:sc.dot, display:'inline-block' }} />
                      {sc.label}
                    </span>
                  </div>
                  {bid.proposal && <p style={{ fontSize:13, color:'#64748B', lineHeight:1.65, marginBottom:10, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>"{bid.proposal}"</p>}
                  <div style={{ display:'flex', gap:18, flexWrap:'wrap' }}>
                    <span style={{ fontSize:12, color:'#94A3B8' }}>💰 <strong style={{ color:'#818CF8' }}>₹{Number(bid.amount||0).toLocaleString()}</strong></span>
                    <span style={{ fontSize:12, color:'#94A3B8' }}>⏱ {bid.deliveryDays||7}d delivery</span>
                    {bid.gig?.budget && <span style={{ fontSize:12, color:Number(bid.amount)<=Number(bid.gig.budget)?'#4ade80':'#f87171' }}>{Number(bid.amount)<=Number(bid.gig.budget)?'✓ In budget':'⚠ Over budget'}</span>}
                    <span style={{ fontSize:12, color:'#475569' }}>📅 {bid.createdAt ? new Date(bid.createdAt).toLocaleDateString('en-IN',{day:'numeric',month:'short'}) : 'Recent'}</span>
                  </div>
                </div>
                <div style={{ flexShrink:0, display:'flex', flexDirection:'column', gap:8 }}>
                  {bid.status==='accepted' && <Link to={`/chat?gigId=${bid.gig?._id}`}><button style={{ padding:'8px 16px', borderRadius:10, background:'linear-gradient(135deg,#6366F1,#22D3EE)', border:'none', color:'#fff', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>💬 Message</button></Link>}
                  {bid.status==='pending'  && <button onClick={()=>withdraw(bid._id)} style={{ padding:'8px 16px', borderRadius:10, background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)', color:'#f87171', fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>Withdraw</button>}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        @keyframes shimmer{0%,100%{opacity:0.6}50%{opacity:0.3}}
      `}</style>
    </div>
  );
};

export default MyProposals;
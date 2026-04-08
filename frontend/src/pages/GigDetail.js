import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api from '../utils/api';
import toast from 'react-hot-toast';

const getLoc = (l) => !l ? 'Remote' : typeof l === 'string' ? l : l.city || l.state || l.country || 'India';

const GigDetail = () => {
  const { id }       = useParams();
  const navigate     = useNavigate();
  const { user }     = useSelector(s => s.auth || {});

  const [gig,        setGig]        = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [bidForm,    setBidForm]    = useState({ amount:'', deliveryDays:'', proposal:'' });
  const [bidLoading, setBidLoading] = useState(false);
  const [myBid,      setMyBid]      = useState(null);
  const [showBidForm,setShowBidForm]= useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      // Not a valid MongoDB ObjectId — use demo data, don't call API
      const isValidId = /^[a-f\d]{24}$/i.test(id);
      if (!isValidId) { setLoading(false); return; }
      try {
        const res = await api.get('/gigs/' + id);
        setGig(res.data?.gig || res.data);
        if (user?.role === 'freelancer') {
          try {
            const bRes = await api.get('/gigs/' + id + '/my-bid');
            setMyBid(bRes.data?.bid || bRes.data);
          } catch { /* no bid yet */ }
        }
      } catch (err) {
        const status = err?.response?.status;
        toast.error(status === 404 ? 'Job not found or removed' : 'Failed to load job');
        navigate('/gigs');
      } finally { setLoading(false); }
    };
    load();
  }, [id]);

  const submitBid = async (e) => {
    e.preventDefault();
    if (!user) { navigate('/login'); return; }
    if (!bidForm.amount || !bidForm.deliveryDays || !bidForm.proposal.trim()) {
      toast.error('Fill all fields'); return;
    }
    setBidLoading(true);
    try {
      const res = await api.post(`/gigs/${id}/bids`, {
        amount: Number(bidForm.amount),
        deliveryDays: Number(bidForm.deliveryDays),
        proposal: bidForm.proposal,
      });
      setMyBid(res.data?.bid || res.data);
      setShowBidForm(false);
      toast.success('🎉 Bid submitted successfully!');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to submit bid');
    } finally { setBidLoading(false); }
  };

  const GRAD = ['#1A56DB,#1A56DB','#0ea5e9,#22D3EE','#10b981,#34d399','#f59e0b,#fbbf24'];

  // Demo gig if API fails
  const demo = {
    title:'Build React + Node.js E-Commerce Dashboard', category:'webdev',
    description:`We are looking for an experienced full-stack developer to build a comprehensive e-commerce dashboard with the following features:\n\n• Real-time sales analytics and charts\n• Inventory management system\n• Customer management portal\n• Stripe payment integration\n• Admin panel with role-based access\n• Mobile-responsive design\n\nThe project requires clean, maintainable code with proper documentation.`,
    requirements:'Must have 3+ years experience with React and Node.js. Knowledge of MongoDB and REST APIs is required. Previous e-commerce project experience preferred.',
    skills:['React.js','Node.js','MongoDB','Stripe','Redux','TailwindCSS'],
    budget:52000, budgetType:'fixed', workType:'remote',
    experienceLevel:'intermediate',
    deadline: new Date(Date.now()+14*864e5),
    allowBids:true, bidsCount:8,
    client:{ name:'TechCorp India', rating:4.9, reviewCount:23, location:'Bangalore', completedProjects:15, isVerified:true },
    milestones:[
      { title:'UI Design & Wireframes', amount:12000, deadline:new Date(Date.now()+4*864e5) },
      { title:'Backend API Development', amount:20000, deadline:new Date(Date.now()+9*864e5) },
      { title:'Integration & Testing',   amount:20000, deadline:new Date(Date.now()+14*864e5) },
    ],
    createdAt: new Date(Date.now()-2*864e5),
  };

  const g = gig || demo;

  const isOwn        = user?._id === g.client?._id;
  const isFreelancer = user?.role === 'freelancer';
  const canBid       = isFreelancer && g.allowBids && g.status !== 'closed' && !myBid && !isOwn;

  const inp = { width:'100%', padding:'11px 14px', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:10, color:'#F1F5F9', fontSize:14, fontFamily:'inherit', outline:'none', boxSizing:'border-box', transition:'border-color 0.2s' };
  const fi  = e => e.target.style.borderColor='rgba(26,86,219,0.55)';
  const bi  = e => e.target.style.borderColor='rgba(255,255,255,0.1)';

  if (loading) return (
    <div style={{ minHeight:'100vh', background:'#020918', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ width:40, height:40, border:'3px solid rgba(26,86,219,0.3)', borderTopColor:'#1A56DB', borderRadius:'50%', animation:'spin 0.7s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div style={{ minHeight:'100vh', background:'#020918', fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
      {/* BG */}
      <div style={{ position:'fixed', inset:0, zIndex:0, pointerEvents:'none' }}>
        <div style={{ position:'absolute', top:'5%', left:'10%', width:500, height:500, background:'radial-gradient(circle,rgba(26,86,219,0.12) 0%,transparent 65%)' }} />
        <div style={{ position:'absolute', bottom:'10%', right:'5%', width:400, height:400, background:'radial-gradient(circle,rgba(34,211,238,0.08) 0%,transparent 65%)' }} />
        <div style={{ position:'absolute', inset:0, backgroundImage:'linear-gradient(rgba(26,86,219,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(26,86,219,0.03) 1px,transparent 1px)', backgroundSize:'56px 56px' }} />
      </div>

      <div style={{ maxWidth:1100, margin:'0 auto', padding:'40px 40px 80px', position:'relative', zIndex:1 }}>
        {/* Breadcrumb */}
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:28, fontSize:13, color:'#64748B' }}>
          <Link to="/gigs" style={{ color:'#1A56DB', textDecoration:'none', fontWeight:500 }}>Browse Jobs</Link>
          <span>›</span>
          <span style={{ color:'#94A3B8' }}>{g.title?.slice(0,40)}...</span>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 320px', gap:24 }}>

          {/* ── LEFT ── */}
          <div style={{ display:'flex', flexDirection:'column', gap:20 }}>

            {/* Main card */}
            <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(26,86,219,0.2)', borderRadius:22, padding:28, backdropFilter:'blur(20px)', boxShadow:'0 0 40px rgba(26,86,219,0.08)' }}>
              {/* Header */}
              <div style={{ display:'flex', gap:14, alignItems:'flex-start', marginBottom:18 }}>
                <div style={{ width:52, height:52, borderRadius:14, background:`linear-gradient(135deg,${GRAD[0]})`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, fontWeight:900, color:'#fff', flexShrink:0, boxShadow:'0 0 20px rgba(26,86,219,0.4)' }}>
                  {g.client?.name?.[0]?.toUpperCase()||'C'}
                </div>
                <div style={{ flex:1 }}>
                  <h1 style={{ fontSize:22, fontWeight:800, color:'#F1F5F9', fontFamily:'Syne,sans-serif', lineHeight:1.3, marginBottom:8 }}>{g.title}</h1>
                  <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                    {[
                      { text:g.category?.toUpperCase(), bg:'rgba(26,86,219,0.15)', color:'#60A5FA' },
                      { text:(g.workType||'Remote').toUpperCase(), bg:'rgba(34,211,238,0.1)', color:'#22D3EE' },
                      { text:(g.experienceLevel||'Intermediate'), bg:'rgba(251,191,36,0.1)', color:'#fbbf24' },
                    ].map((b,i)=><span key={i} style={{ fontSize:11, fontWeight:700, padding:'3px 10px', borderRadius:999, background:b.bg, color:b.color, textTransform:'capitalize' }}>{b.text}</span>)}
                    {g.status && <span style={{ fontSize:11, fontWeight:700, padding:'3px 10px', borderRadius:999, background:g.status==='open'?'rgba(34,197,94,0.1)':'rgba(239,68,68,0.1)', color:g.status==='open'?'#4ade80':'#f87171' }}>{g.status}</span>}
                  </div>
                </div>
              </div>

              {/* Stats row */}
              <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:24, padding:'16px', background:'rgba(255,255,255,0.03)', borderRadius:14, border:'1px solid rgba(255,255,255,0.06)' }}>
                {[
                  { label:'Budget', value:`₹${Number(g.budget||0).toLocaleString()}${g.budgetType==='hourly'?'/hr':''}`, color:'#1A56DB' },
                  { label:'Deadline', value: g.deadline ? new Date(g.deadline).toLocaleDateString('en-IN',{day:'numeric',month:'short'}) : 'Flexible', color:'#22D3EE' },
                  { label:'Bids', value:`${g.bidsCount||0} proposals`, color:'#D4AF37' },
                  { label:'Posted', value: g.createdAt ? new Date(g.createdAt).toLocaleDateString('en-IN',{day:'numeric',month:'short'}) : 'Recent', color:'#fbbf24' },
                ].map((s,i)=>(
                  <div key={i} style={{ textAlign:'center' }}>
                    <div style={{ fontSize:16, fontWeight:800, color:s.color, fontFamily:'Syne,sans-serif', marginBottom:3 }}>{s.value}</div>
                    <div style={{ fontSize:11, color:'#64748B' }}>{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Description */}
              <h3 style={{ fontSize:15, fontWeight:700, color:'#F1F5F9', marginBottom:10 }}>About the Project</h3>
              <div style={{ fontSize:14, color:'#94A3B8', lineHeight:1.85, marginBottom:20, whiteSpace:'pre-line' }}>{g.description}</div>

              {/* Requirements */}
              {g.requirements && (
                <>
                  <h3 style={{ fontSize:15, fontWeight:700, color:'#F1F5F9', marginBottom:10 }}>Requirements</h3>
                  <div style={{ fontSize:14, color:'#94A3B8', lineHeight:1.8, marginBottom:20 }}>{g.requirements}</div>
                </>
              )}

              {/* Skills */}
              {g.skills?.length > 0 && (
                <>
                  <h3 style={{ fontSize:15, fontWeight:700, color:'#F1F5F9', marginBottom:12 }}>Skills Required</h3>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginBottom:20 }}>
                    {(Array.isArray(g.skills)?g.skills:[]).map(s=>(
                      <span key={s} style={{ fontSize:13, fontWeight:600, padding:'6px 14px', borderRadius:999, background:'rgba(26,86,219,0.12)', border:'1px solid rgba(26,86,219,0.3)', color:'#60A5FA' }}>{s}</span>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Milestones */}
            {g.milestones?.length > 0 && (
              <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:20, padding:24, backdropFilter:'blur(20px)' }}>
                <h3 style={{ fontSize:15, fontWeight:700, color:'#F1F5F9', marginBottom:18 }}>🏁 Project Milestones</h3>
                {g.milestones.map((m,i)=>(
                  <div key={i} style={{ display:'flex', gap:14, alignItems:'flex-start', marginBottom: i<g.milestones.length-1?16:0, paddingBottom: i<g.milestones.length-1?16:0, borderBottom: i<g.milestones.length-1?'1px solid rgba(255,255,255,0.06)':'none' }}>
                    <div style={{ width:32, height:32, borderRadius:'50%', background:'linear-gradient(135deg,#1A56DB,#22D3EE)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:800, color:'#fff', flexShrink:0, boxShadow:'0 0 12px rgba(26,86,219,0.4)' }}>{i+1}</div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:14, fontWeight:700, color:'#E2E8F0', marginBottom:4 }}>{m.title}</div>
                      {m.description && <div style={{ fontSize:13, color:'#64748B', marginBottom:6 }}>{m.description}</div>}
                      <div style={{ display:'flex', gap:14 }}>
                        {m.amount && <span style={{ fontSize:13, fontWeight:700, color:'#1A56DB' }}>₹{Number(m.amount).toLocaleString()}</span>}
                        {m.deadline && <span style={{ fontSize:12, color:'#64748B' }}>📅 {new Date(m.deadline).toLocaleDateString('en-IN',{day:'numeric',month:'short'})}</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Bid Form */}
            {canBid && (
              <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(26,86,219,0.25)', borderRadius:20, padding:24, backdropFilter:'blur(20px)' }}>
                <div style={{ height:2, background:'linear-gradient(90deg,transparent,#1A56DB,#22D3EE,transparent)', borderRadius:1, marginBottom:20, boxShadow:'0 0 8px rgba(26,86,219,0.5)' }} />
                <h3 style={{ fontSize:16, fontWeight:800, color:'#F1F5F9', marginBottom:4 }}>💼 Place Your Bid</h3>
                <p style={{ fontSize:13, color:'#64748B', marginBottom:20 }}>Submit a competitive proposal to win this project</p>

                {!showBidForm ? (
                  <button onClick={()=>setShowBidForm(true)} style={{ width:'100%', padding:13, borderRadius:12, background:'linear-gradient(135deg,#1A56DB,#22D3EE)', border:'none', color:'#fff', fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:'inherit', boxShadow:'0 0 20px rgba(26,86,219,0.35)', transition:'all 0.2s' }}
                    onMouseEnter={e=>e.target.style.boxShadow='0 0 32px rgba(26,86,219,0.6)'}
                    onMouseLeave={e=>e.target.style.boxShadow='0 0 20px rgba(26,86,219,0.35)'}>
                    Submit a Proposal →
                  </button>
                ) : (
                  <form onSubmit={submitBid} style={{ display:'flex', flexDirection:'column', gap:16 }}>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
                      <div>
                        <label style={{ display:'block', fontSize:13, fontWeight:600, color:'#94A3B8', marginBottom:6 }}>Your Bid (₹) *</label>
                        <div style={{ position:'relative' }}>
                          <span style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'#1A56DB', fontWeight:700 }}>₹</span>
                          <input type="number" style={{ ...inp, paddingLeft:28 }} placeholder="e.g. 45000" value={bidForm.amount} onChange={e=>setBidForm({...bidForm,amount:e.target.value})} onFocus={fi} onBlur={bi} required />
                        </div>
                      </div>
                      <div>
                        <label style={{ display:'block', fontSize:13, fontWeight:600, color:'#94A3B8', marginBottom:6 }}>Delivery (days) *</label>
                        <input type="number" style={inp} placeholder="e.g. 14" value={bidForm.deliveryDays} onChange={e=>setBidForm({...bidForm,deliveryDays:e.target.value})} onFocus={fi} onBlur={bi} required />
                      </div>
                    </div>
                    <div>
                      <label style={{ display:'block', fontSize:13, fontWeight:600, color:'#94A3B8', marginBottom:6 }}>Proposal Letter *</label>
                      <textarea style={{ ...inp, minHeight:120, resize:'vertical', lineHeight:1.7 }} placeholder="Explain why you're the best fit. Mention your relevant experience, approach, and what makes you stand out..." value={bidForm.proposal} onChange={e=>setBidForm({...bidForm,proposal:e.target.value})} onFocus={fi} onBlur={bi} required />
                    </div>
                    {bidForm.amount && (
                      <div style={{ padding:'12px 16px', background:'rgba(26,86,219,0.08)', border:'1px solid rgba(26,86,219,0.2)', borderRadius:10, display:'flex', justifyContent:'space-between' }}>
                        <span style={{ fontSize:13, color:'#64748B' }}>Client budget: <strong style={{ color:'#1A56DB' }}>₹{Number(g.budget||0).toLocaleString()}</strong></span>
                        <span style={{ fontSize:13, color: Number(bidForm.amount)<=Number(g.budget)?'#4ade80':'#f87171', fontWeight:600 }}>
                          {Number(bidForm.amount)<=Number(g.budget)?'✓ Within budget':'⚠ Over budget'}
                        </span>
                      </div>
                    )}
                    <div style={{ display:'flex', gap:10 }}>
                      <button type="submit" disabled={bidLoading} style={{ flex:1, padding:12, borderRadius:12, background:'linear-gradient(135deg,#1A56DB,#22D3EE)', border:'none', color:'#fff', fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:'inherit', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
                        {bidLoading ? <><div style={{ width:16, height:16, border:'2px solid rgba(255,255,255,0.4)', borderTopColor:'#fff', borderRadius:'50%', animation:'spin 0.7s linear infinite' }} />Submitting…</> : '🚀 Submit Bid'}
                      </button>
                      <button type="button" onClick={()=>setShowBidForm(false)} style={{ padding:'12px 20px', borderRadius:12, background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', color:'#94A3B8', fontSize:14, cursor:'pointer', fontFamily:'inherit' }}>Cancel</button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* Already bid */}
            {myBid && (
              <div style={{ background:'rgba(34,197,94,0.08)', border:'1px solid rgba(34,197,94,0.25)', borderRadius:16, padding:20 }}>
                <h3 style={{ fontSize:14, fontWeight:700, color:'#4ade80', marginBottom:8 }}>✅ You've already bid on this project</h3>
                <div style={{ display:'flex', gap:16 }}>
                  <span style={{ fontSize:13, color:'#64748B' }}>Your bid: <strong style={{ color:'#4ade80' }}>₹{Number(myBid.amount||0).toLocaleString()}</strong></span>
                  <span style={{ fontSize:13, color:'#64748B' }}>Delivery: <strong style={{ color:'#94A3B8' }}>{myBid.deliveryDays} days</strong></span>
                  <span style={{ fontSize:11, fontWeight:700, padding:'2px 10px', borderRadius:999, background:'rgba(251,191,36,0.1)', color:'#fbbf24', alignSelf:'center', textTransform:'capitalize' }}>{myBid.status}</span>
                </div>
              </div>
            )}

            {/* Login prompt */}
            {!user && (
              <div style={{ background:'rgba(26,86,219,0.08)', border:'1px solid rgba(26,86,219,0.25)', borderRadius:16, padding:20, textAlign:'center' }}>
                <p style={{ color:'#93C5FD', fontSize:14, marginBottom:14 }}>Sign in to place a bid on this project</p>
                <Link to="/login"><button style={{ padding:'10px 28px', borderRadius:12, background:'linear-gradient(135deg,#1A56DB,#22D3EE)', border:'none', color:'#fff', fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>Sign In to Bid</button></Link>
              </div>
            )}
          </div>

          {/* ── RIGHT SIDEBAR ── */}
          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>

            {/* Client card */}
            <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:20, padding:22, backdropFilter:'blur(20px)' }}>
              <h3 style={{ fontSize:14, fontWeight:700, color:'#F1F5F9', marginBottom:16 }}>About the Client</h3>
              <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:14 }}>
                <div style={{ width:44, height:44, borderRadius:12, background:`linear-gradient(135deg,${GRAD[0]})`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, fontWeight:800, color:'#fff', boxShadow:'0 0 14px rgba(26,86,219,0.4)' }}>
                  {g.client?.name?.[0]?.toUpperCase()||'C'}
                </div>
                <div>
                  <div style={{ fontSize:14, fontWeight:700, color:'#E2E8F0', display:'flex', alignItems:'center', gap:5 }}>
                    {g.client?.name||'Client'}
                    {g.client?.isVerified && <span style={{ fontSize:11, color:'#22D3EE' }}>✓</span>}
                  </div>
                  <div style={{ fontSize:12, color:'#64748B' }}>📍 {getLoc(g.client?.location)}</div>
                </div>
              </div>
              {[
                { label:'Rating',   value: g.client?.rating ? `⭐ ${g.client.rating}` : '—' },
                { label:'Reviews',  value: g.client?.reviewCount || 0 },
                { label:'Projects', value: g.client?.completedProjects || 0 },
              ].map((item,i)=>(
                <div key={i} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
                  <span style={{ fontSize:12, color:'#64748B' }}>{item.label}</span>
                  <span style={{ fontSize:13, fontWeight:600, color:'#E2E8F0' }}>{item.value}</span>
                </div>
              ))}
              {!isOwn && user && (
                <Link to={`/chat?userId=${g.client?._id}`} style={{ textDecoration:'none', display:'block', marginTop:14 }}>
                  <button style={{ width:'100%', padding:'10px', borderRadius:10, background:'rgba(26,86,219,0.12)', border:'1px solid rgba(26,86,219,0.3)', color:'#93C5FD', fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'inherit', transition:'all 0.2s' }}
                    onMouseEnter={e=>e.target.style.background='rgba(26,86,219,0.22)'}
                    onMouseLeave={e=>e.target.style.background='rgba(26,86,219,0.12)'}>
                    💬 Message Client
                  </button>
                </Link>
              )}
            </div>

            {/* Budget card */}
            <div style={{ background:'linear-gradient(135deg,rgba(26,86,219,0.15),rgba(34,211,238,0.08))', border:'1px solid rgba(26,86,219,0.3)', borderRadius:20, padding:22 }}>
              <div style={{ fontSize:12, color:'#64748B', marginBottom:6, fontWeight:600 }}>PROJECT BUDGET</div>
              <div style={{ fontSize:30, fontWeight:900, fontFamily:'Syne,sans-serif', background:'linear-gradient(135deg,#1A56DB,#22D3EE)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', marginBottom:4 }}>
                ₹{Number(g.budget||0).toLocaleString()}
              </div>
              <div style={{ fontSize:12, color:'#64748B' }}>{g.budgetType==='hourly'?'Per Hour':'Fixed Price'}</div>
              {g.deadline && (
                <div style={{ marginTop:14, padding:'10px 14px', background:'rgba(255,255,255,0.05)', borderRadius:10, display:'flex', justifyContent:'space-between' }}>
                  <span style={{ fontSize:12, color:'#64748B' }}>Deadline</span>
                  <span style={{ fontSize:13, fontWeight:600, color:'#E2E8F0' }}>{new Date(g.deadline).toLocaleDateString('en-IN',{day:'numeric',month:'long'})}</span>
                </div>
              )}
            </div>

            {/* Share */}
            <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:16, padding:18 }}>
              <div style={{ fontSize:13, fontWeight:600, color:'#94A3B8', marginBottom:12 }}>Share this job</div>
              <div style={{ display:'flex', gap:8 }}>
                {[['🔗','Copy Link'],['📧','Email']].map(([icon,label])=>(
                  <button key={label} onClick={()=>{ if(label==='Copy Link'){navigator.clipboard.writeText(window.location.href);toast.success('Link copied!');} else toast('Share via email coming soon',{icon:'📧'}); }} style={{ flex:1, padding:'8px', borderRadius:9, background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', color:'#64748B', fontSize:12, cursor:'pointer', fontFamily:'inherit', transition:'all 0.2s' }}
                    onMouseEnter={e=>{ e.target.style.background='rgba(26,86,219,0.1)'; e.target.style.color='#93C5FD'; }}
                    onMouseLeave={e=>{ e.target.style.background='rgba(255,255,255,0.04)'; e.target.style.color='#64748B'; }}>
                    {icon} {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Similar jobs */}
            <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:16, padding:18 }}>
              <div style={{ fontSize:13, fontWeight:700, color:'#F1F5F9', marginBottom:12 }}>Similar Jobs</div>
              <Link to="/gigs" style={{ textDecoration:'none', display:'flex', alignItems:'center', gap:8, padding:'8px 0', borderBottom:'1px solid rgba(255,255,255,0.05)', color:'#64748B', fontSize:12, transition:'color 0.2s' }}
                onMouseEnter={e=>e.currentTarget.style.color='#93C5FD'}
                onMouseLeave={e=>e.currentTarget.style.color='#64748B'}>
                🔍 Browse all {g.category||'Web Dev'} jobs →
              </Link>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        @keyframes spin{to{transform:rotate(360deg)}}
        textarea::placeholder,input::placeholder{color:#475569}
      `}</style>
    </div>
  );
};

export default GigDetail;
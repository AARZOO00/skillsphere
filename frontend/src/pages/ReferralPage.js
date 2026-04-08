import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import api from '../utils/api';

const ALL_BADGES = [
  { id:'first_referral',   name:'First Referral',    emoji:'🌟', desc:'Refer your first user',       credits:100  },
  { id:'super_referrer',   name:'Super Referrer',    emoji:'🚀', desc:'Refer 5 users',               credits:500  },
  { id:'referral_king',    name:'Referral King',     emoji:'👑', desc:'Refer 25 users',              credits:2500 },
  { id:'profile_complete', name:'Profile Star',      emoji:'⭐', desc:'100% profile complete',       credits:50   },
  { id:'first_bid',        name:'First Proposal',    emoji:'📋', desc:'Submit your first bid',       credits:25   },
  { id:'first_project',    name:'First Win',         emoji:'🏆', desc:'Complete first project',      credits:200  },
  { id:'ten_projects',     name:'Decade',            emoji:'💎', desc:'Complete 10 projects',        credits:500  },
  { id:'top_rated',        name:'Top Rated',         emoji:'🥇', desc:'Maintain 4.8+ rating',        credits:300  },
  { id:'early_adopter',    name:'Early Adopter',     emoji:'🛸', desc:'Join in first 1000 users',    credits:150  },
];

const ReferralPage = () => {
  const { user }    = useSelector(s => s.auth || {});
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [leaders, setLeaders] = useState([]);
  const [tab,     setTab]     = useState('overview');
  const [copying, setCopying] = useState(false);

  useEffect(() => {
    load();
    loadLeaders();
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get('/referral/my-code');
      setData(res.data);
    } catch { setData(null); }
    finally  { setLoading(false); }
  };

  const loadLeaders = async () => {
    try {
      const res = await api.get('/referral/leaderboard');
      setLeaders(res.data?.leaderboard || []);
    } catch {}
  };

  const copyLink = async () => {
    setCopying(true);
    try {
      await navigator.clipboard.writeText(data?.link || '');
      toast.success('✅ Referral link copied!');
    } catch { toast.error('Failed to copy'); }
    setTimeout(() => setCopying(false), 2000);
  };

  const shareWhatsApp = () => {
    const msg = encodeURIComponent(`Join SkillSphere — India's top freelance platform! Use my referral link and earn ₹50 welcome bonus: ${data?.link}`);
    window.open(`https://wa.me/?text=${msg}`, '_blank');
  };

  const shareTwitter = () => {
    const msg = encodeURIComponent(`Earn money freelancing on @SkillSphere! Use my referral: ${data?.link} 🚀`);
    window.open(`https://twitter.com/intent/tweet?text=${msg}`, '_blank');
  };

  const earnedBadgeIds = (data?.badges || []).map(b => b.id);

  if (loading) return (
    <div style={{ minHeight:'100vh', background:'#020918', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ width:36, height:36, border:'3px solid rgba(26,86,219,0.3)', borderTopColor:'#1A56DB', borderRadius:'50%', animation:'spin .7s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div style={{ minHeight:'100vh', background:'#020918', fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
      {/* BG */}
      <div style={{ position:'fixed', inset:0, pointerEvents:'none' }}>
        <div style={{ position:'absolute', top:'-10%', left:'-5%', width:'60%', height:'60%', background:'radial-gradient(circle,rgba(26,86,219,0.12) 0%,transparent 60%)', filter:'blur(80px)' }} />
        <div style={{ position:'absolute', bottom:'-10%', right:0, width:'50%', height:'50%', background:'radial-gradient(circle,rgba(34,211,238,0.08) 0%,transparent 60%)', filter:'blur(70px)' }} />
      </div>

      {/* HEADER */}
      <div style={{ background:'linear-gradient(135deg,#1e1b4b,#312e81,#1e40af)', padding:'36px 52px 80px', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', inset:0, backgroundImage:'radial-gradient(circle at 80% 50%,rgba(26,86,219,0.2) 0%,transparent 50%)', pointerEvents:'none' }} />
        <div style={{ maxWidth:1100, margin:'0 auto', position:'relative', zIndex:1 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:16 }}>
            <div>
              <p style={{ color:'#93C5FD', fontSize:13, marginBottom:8 }}>Rewards</p>
              <h1 style={{ fontSize:30, fontWeight:900, color:'#fff', fontFamily:'Syne,sans-serif', marginBottom:6 }}>Referral & Badges</h1>
              <p style={{ color:'#93C5FD', fontSize:14 }}>Earn credits by inviting friends. Unlock badges for milestones.</p>
            </div>
            {/* Credits wallet */}
            <div style={{ background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.15)', borderRadius:18, padding:'18px 24px', backdropFilter:'blur(20px)', textAlign:'center' }}>
              <div style={{ fontSize:11, color:'rgba(255,255,255,0.6)', letterSpacing:1, textTransform:'uppercase', marginBottom:4 }}>Your Credits</div>
              <div style={{ fontSize:36, fontWeight:900, color:'#fbbf24', fontFamily:'Syne,sans-serif' }}>
                {(data?.credits || 0).toLocaleString()}
              </div>
              <div style={{ fontSize:11, color:'rgba(255,255,255,0.4)', marginTop:3 }}>≈ ₹{Math.round((data?.credits||0)*0.5).toLocaleString()} value</div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth:1100, margin:'-48px auto 0', padding:'0 52px 80px', position:'relative', zIndex:2 }}>

        {/* STATS */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:24 }}>
          {[
            { icon:'👥', label:'Total Referrals',  value: data?.referrals?.length || 0,       color:'#1A56DB', bg:'#ede9fe' },
            { icon:'💰', label:'Credits Earned',    value: (data?.totalEarned||0).toLocaleString(), color:'#fbbf24', bg:'#fef3c7' },
            { icon:'🏅', label:'Badges Unlocked',   value: `${data?.badges?.length||0}/${ALL_BADGES.length}`, color:'#22D3EE', bg:'#e0f2fe' },
            { icon:'🔥', label:'Success Rate',      value: data?.referrals?.length > 0 ? `${Math.round((data.referrals.filter(r=>r.status==='rewarded').length/data.referrals.length)*100)}%` : '—', color:'#10b981', bg:'#dcfce7' },
          ].map((s,i) => (
            <div key={i} style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:18, padding:'20px', backdropFilter:'blur(20px)', transition:'all .25s' }}
              onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-4px)';e.currentTarget.style.borderColor=`${s.color}44`;}}
              onMouseLeave={e=>{e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.borderColor='rgba(255,255,255,0.08)';}}>
              <div style={{ width:38, height:38, borderRadius:10, background:s.bg+'22', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, marginBottom:12 }}>{s.icon}</div>
              <div style={{ fontSize:24, fontWeight:900, color:s.color, fontFamily:'Syne,sans-serif', marginBottom:3 }}>{s.value}</div>
              <div style={{ fontSize:12, color:'rgba(255,255,255,0.45)' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* REFERRAL CARD */}
        <div style={{ background:'linear-gradient(135deg,rgba(26,86,219,0.18),rgba(34,211,238,0.1))', border:'1px solid rgba(26,86,219,0.35)', borderRadius:22, padding:28, marginBottom:24, backdropFilter:'blur(20px)' }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:28, alignItems:'center' }}>
            <div>
              <h3 style={{ fontSize:20, fontWeight:800, color:'#F1F5F9', fontFamily:'Syne,sans-serif', marginBottom:8 }}>Share & Earn</h3>
              <p style={{ fontSize:14, color:'rgba(255,255,255,0.55)', lineHeight:1.7, marginBottom:20 }}>
                Earn <strong style={{ color:'#fbbf24' }}>₹100 credits</strong> for every friend who joins. They get <strong style={{ color:'#22D3EE' }}>₹25 welcome bonus</strong>. No limit!
              </p>
              {/* Code box */}
              <div style={{ background:'rgba(0,0,0,0.3)', border:'1px solid rgba(26,86,219,0.3)', borderRadius:14, padding:'14px 18px', display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
                <div>
                  <div style={{ fontSize:11, color:'rgba(255,255,255,0.4)', marginBottom:4, letterSpacing:1, textTransform:'uppercase' }}>Your Code</div>
                  <div style={{ fontSize:22, fontWeight:900, color:'#93C5FD', fontFamily:'monospace', letterSpacing:3 }}>{data?.code || '—'}</div>
                </div>
                <button onClick={copyLink} style={{ padding:'10px 20px', borderRadius:10, background:copying?'rgba(34,197,94,0.2)':'rgba(26,86,219,0.25)', border:`1px solid ${copying?'rgba(34,197,94,0.5)':'rgba(26,86,219,0.5)'}`, color:copying?'#4ade80':'#93C5FD', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'inherit', transition:'all .2s' }}>
                  {copying ? '✓ Copied!' : '📋 Copy Code'}
                </button>
              </div>
              {/* Share buttons */}
              <div style={{ display:'flex', gap:10 }}>
                <button onClick={copyLink} style={{ flex:1, padding:'11px', borderRadius:12, background:'linear-gradient(135deg,#1A56DB,#1E40AF)', border:'none', color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>
                  🔗 Copy Invite Link
                </button>
                <button onClick={shareWhatsApp} style={{ padding:'11px 16px', borderRadius:12, background:'rgba(37,211,102,0.15)', border:'1px solid rgba(37,211,102,0.4)', color:'#4ade80', fontSize:18, cursor:'pointer' }}>
                  <span style={{ fontSize:20 }}>📱</span>
                </button>
                <button onClick={shareTwitter} style={{ padding:'11px 16px', borderRadius:12, background:'rgba(29,155,240,0.15)', border:'1px solid rgba(29,155,240,0.4)', color:'#38bdf8', fontSize:18, cursor:'pointer' }}>
                  <span style={{ fontSize:20 }}>🐦</span>
                </button>
              </div>
            </div>

            {/* How it works */}
            <div>
              <h4 style={{ fontSize:14, fontWeight:700, color:'rgba(255,255,255,0.7)', marginBottom:16, letterSpacing:0.5 }}>HOW IT WORKS</h4>
              {[
                { step:'01', title:'Share your link',    desc:'Send your unique referral link to friends' },
                { step:'02', title:'They sign up',       desc:'Friend creates a SkillSphere account' },
                { step:'03', title:'Both earn credits',  desc:'You get ₹100, they get ₹25 welcome bonus' },
                { step:'04', title:'Unlock badges',      desc:'Hit milestones for special rewards' },
              ].map((s,i) => (
                <div key={i} style={{ display:'flex', gap:14, marginBottom:14 }}>
                  <div style={{ width:32, height:32, borderRadius:'50%', background:'rgba(26,86,219,0.2)', border:'1px solid rgba(26,86,219,0.4)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:800, color:'#60A5FA', flexShrink:0 }}>{s.step}</div>
                  <div>
                    <div style={{ fontSize:13, fontWeight:700, color:'#E2E8F0', marginBottom:2 }}>{s.title}</div>
                    <div style={{ fontSize:12, color:'rgba(255,255,255,0.4)' }}>{s.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* TABS */}
        <div style={{ display:'flex', gap:4, marginBottom:22, borderBottom:'1px solid rgba(255,255,255,0.08)' }}>
          {[['overview','🏅 Badges'],['history','👥 History'],['leaderboard','🏆 Leaderboard']].map(([id,label])=>(
            <button key={id} onClick={()=>setTab(id)} style={{ background:'none', border:'none', cursor:'pointer', fontFamily:'inherit', fontSize:14, fontWeight:600, padding:'10px 20px', color:tab===id?'#60A5FA':'#475569', borderBottom:tab===id?'2px solid #1A56DB':'2px solid transparent', transition:'all .2s' }}>{label}</button>
          ))}
        </div>

        {/* BADGES TAB */}
        {tab === 'overview' && (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14 }}>
            {ALL_BADGES.map(badge => {
              const earned = earnedBadgeIds.includes(badge.id);
              const earnedData = data?.badges?.find(b=>b.id===badge.id);
              return (
                <div key={badge.id} style={{ background: earned ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.02)', border:`1.5px solid ${earned?'rgba(251,191,36,0.4)':'rgba(255,255,255,0.07)'}`, borderRadius:18, padding:'20px', backdropFilter:'blur(20px)', transition:'all .25s', position:'relative', overflow:'hidden' }}
                  onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-3px)';}} onMouseLeave={e=>{e.currentTarget.style.transform='translateY(0)';}}>
                  {earned && <div style={{ position:'absolute', top:12, right:12, fontSize:10, fontWeight:800, padding:'3px 8px', borderRadius:999, background:'rgba(251,191,36,0.15)', color:'#fbbf24', border:'1px solid rgba(251,191,36,0.4)' }}>EARNED</div>}
                  {!earned && <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.35)', borderRadius:18, backdropFilter:'blur(2px)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <span style={{ fontSize:24, filter:'grayscale(1)', opacity:0.4 }}>🔒</span>
                  </div>}
                  <div style={{ fontSize:40, marginBottom:12, filter:earned?'none':'grayscale(0.8) opacity(0.4)' }}>{badge.emoji}</div>
                  <div style={{ fontSize:15, fontWeight:700, color: earned?'#F1F5F9':'rgba(255,255,255,0.35)', marginBottom:4 }}>{badge.name}</div>
                  <div style={{ fontSize:12, color:'rgba(255,255,255,0.35)', marginBottom:12, lineHeight:1.5 }}>{badge.desc}</div>
                  <div style={{ display:'flex', alignItems:'center', gap:5 }}>
                    <span style={{ fontSize:14 }}>🪙</span>
                    <span style={{ fontSize:13, fontWeight:700, color: earned?'#fbbf24':'rgba(255,255,255,0.25)' }}>+{badge.credits} credits</span>
                  </div>
                  {earned && earnedData?.awardedAt && (
                    <div style={{ fontSize:11, color:'rgba(255,255,255,0.3)', marginTop:6 }}>
                      Earned {new Date(earnedData.awardedAt).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* HISTORY TAB */}
        {tab === 'history' && (
          <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:18, overflow:'hidden', backdropFilter:'blur(20px)' }}>
            <div style={{ padding:'16px 22px', borderBottom:'1px solid rgba(255,255,255,0.07)', display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr', gap:12 }}>
              {['User','Date','Status','Credits'].map(h => (
                <span key={h} style={{ fontSize:11, fontWeight:700, color:'rgba(255,255,255,0.35)', textTransform:'uppercase', letterSpacing:0.5 }}>{h}</span>
              ))}
            </div>
            {!data?.referrals?.length ? (
              <div style={{ padding:'48px 22px', textAlign:'center', color:'rgba(255,255,255,0.3)', fontSize:14 }}>
                <div style={{ fontSize:40, marginBottom:12 }}>📭</div>
                <p>No referrals yet. Share your link to start earning!</p>
              </div>
            ) : data.referrals.map((r,i)=>(
              <div key={i} style={{ padding:'14px 22px', borderBottom:'1px solid rgba(255,255,255,0.05)', display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr', gap:12, alignItems:'center' }}>
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <div style={{ width:32, height:32, borderRadius:'50%', background:'linear-gradient(135deg,#1A56DB,#22D3EE)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:700, color:'#fff', flexShrink:0 }}>
                    {r.referred?.name?.[0]?.toUpperCase()||'?'}
                  </div>
                  <div>
                    <div style={{ fontSize:13, fontWeight:600, color:'#E2E8F0' }}>{r.referred?.name||'User'}</div>
                    <div style={{ fontSize:11, color:'rgba(255,255,255,0.35)' }}>{r.referred?.email}</div>
                  </div>
                </div>
                <span style={{ fontSize:12, color:'rgba(255,255,255,0.45)' }}>{r.createdAt?new Date(r.createdAt).toLocaleDateString('en-IN',{day:'numeric',month:'short'}):'-'}</span>
                <span style={{ fontSize:11, fontWeight:700, padding:'3px 10px', borderRadius:999, display:'inline-block', background:r.status==='rewarded'?'rgba(34,197,94,0.12)':'rgba(251,191,36,0.1)', color:r.status==='rewarded'?'#4ade80':'#fbbf24' }}>{r.status}</span>
                <span style={{ fontSize:13, fontWeight:700, color:'#fbbf24' }}>+{r.creditsAwarded||0}</span>
              </div>
            ))}
          </div>
        )}

        {/* LEADERBOARD TAB */}
        {tab === 'leaderboard' && (
          <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:18, overflow:'hidden', backdropFilter:'blur(20px)' }}>
            {leaders.length === 0 ? (
              <div style={{ padding:'48px 22px', textAlign:'center', color:'rgba(255,255,255,0.3)', fontSize:14 }}>
                <div style={{ fontSize:40, marginBottom:12 }}>🏆</div>
                <p>Leaderboard loading… Be the first to refer!</p>
              </div>
            ) : leaders.map((l,i)=>(
              <div key={i} style={{ padding:'16px 22px', borderBottom:'1px solid rgba(255,255,255,0.05)', display:'flex', alignItems:'center', gap:16 }}>
                <div style={{ width:36, fontSize:i<3?22:14, fontWeight:900, color:['#fbbf24','#94a3b8','#f59e0b'][i]||'rgba(255,255,255,0.3)', textAlign:'center', flexShrink:0 }}>
                  {i<3?['🥇','🥈','🥉'][i]:`#${i+1}`}
                </div>
                <div style={{ width:38, height:38, borderRadius:'50%', background:'linear-gradient(135deg,#1A56DB,#22D3EE)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:15, fontWeight:700, color:'#fff', flexShrink:0 }}>
                  {l.name?.[0]?.toUpperCase()||'?'}
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:14, fontWeight:700, color:'#E2E8F0' }}>{l.name}</div>
                  <div style={{ fontSize:12, color:'rgba(255,255,255,0.4)' }}>{l.count} referrals</div>
                </div>
                <div style={{ fontSize:16, fontWeight:800, color:'#fbbf24', fontFamily:'Syne,sans-serif' }}>🪙 {l.credits?.toLocaleString()}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        @keyframes spin{to{transform:rotate(360deg)}}
      `}</style>
    </div>
  );
};

export default ReferralPage;
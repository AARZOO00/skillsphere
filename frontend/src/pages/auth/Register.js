import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import api from '../../utils/api';

const ROLES = [
  { id:'client',     emoji:'💼', title:'Client',     sub:'I want to hire talent',     color:'#818CF8', glow:'rgba(129,140,248,0.25)', bg:'rgba(99,102,241,0.1)',  border:'rgba(99,102,241,0.35)' },
  { id:'freelancer', emoji:'🚀', title:'Freelancer',  sub:'I want to find work',       color:'#22D3EE', glow:'rgba(34,211,238,0.25)',  bg:'rgba(34,211,238,0.08)', border:'rgba(34,211,238,0.35)' },
];

const Register = () => {
  const navigate       = useNavigate();
  const { user }       = useSelector(s => s.auth || {});
  const canvasRef      = useRef(null);
  const [step,    setStep]    = useState(1);
  const [role,    setRole]    = useState('');
  const [form,    setForm]    = useState({ name:'', email:'', password:'', confirm:'' });
  const [showPw,  setShowPw]  = useState(false);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => { if (user) navigate('/dashboard'); }, [user]);
  useEffect(() => { setTimeout(() => setMounted(true), 100); }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    const particles = Array.from({length:50}, () => ({
      x:Math.random()*canvas.width, y:Math.random()*canvas.height,
      r:Math.random()*2+0.5, dx:(Math.random()-.5)*.5, dy:(Math.random()-.5)*.5,
    }));
    let raf;
    const draw = () => {
      ctx.clearRect(0,0,canvas.width,canvas.height);
      particles.forEach(p => {
        ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
        ctx.fillStyle='rgba(167,139,250,0.5)'; ctx.fill();
        p.x+=p.dx; p.y+=p.dy;
        if(p.x<0||p.x>canvas.width) p.dx*=-1;
        if(p.y<0||p.y>canvas.height) p.dy*=-1;
      });
      particles.forEach((a,i) => {
        particles.slice(i+1).forEach(b => {
          const d=Math.hypot(a.x-b.x,a.y-b.y);
          if(d<90){ctx.beginPath();ctx.strokeStyle=`rgba(167,139,250,${0.12*(1-d/90)})`;ctx.lineWidth=.5;ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();}
        });
      });
      raf=requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, []);

  const pwStrength = () => {
    let s=0, p=form.password;
    if(p.length>=8) s++; if(/[A-Z]/.test(p)) s++; if(/[0-9]/.test(p)) s++; if(/[^A-Za-z0-9]/.test(p)) s++;
    return s;
  };
  const str = pwStrength();
  const strColors=['','#ef4444','#f97316','#22D3EE','#22c55e'];
  const strLabels=['','Weak','Fair','Good','Strong'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if(!role)                      { toast.error('Select a role'); return; }
    if(!form.name.trim())          { toast.error('Name required'); return; }
    if(!form.email)                { toast.error('Email required'); return; }
    if(form.password.length<8)     { toast.error('Password min 8 chars'); return; }
    if(form.password!==form.confirm){ toast.error('Passwords do not match'); return; }
    setLoading(true);
    try {
      await api.post('/auth/register', { name:form.name.trim(), email:form.email, password:form.password, role });
      toast.success('🎉 Account created! Please verify your email.');
      navigate('/login');
    } catch(err) { toast.error(err?.response?.data?.message||'Registration failed'); }
    finally { setLoading(false); }
  };

  const F = { fontFamily:"'Plus Jakarta Sans',sans-serif" };
  const inp = (name) => ({
    width:'100%', padding:'14px 16px', background:'rgba(255,255,255,0.06)',
    border:`1.5px solid ${focused===name?'rgba(167,139,250,0.75)':'rgba(255,255,255,0.1)'}`,
    borderRadius:12, color:'#F1F5F9', fontSize:14, ...F, outline:'none',
    boxSizing:'border-box', transition:'all 0.3s',
    boxShadow: focused===name ? '0 0 20px rgba(167,139,250,0.12)' : 'none',
  });

  const INFO = [
    { icon:'🌍', text:'48,000+ verified professionals' },
    { icon:'⚡', text:'AI-powered job matching' },
    { icon:'🔒', text:'100% secure escrow payments' },
    { icon:'📊', text:'Real-time analytics dashboard' },
  ];

  return (
    <div style={{ minHeight:'100vh', display:'flex', fontFamily:"'Plus Jakarta Sans',sans-serif", background:'#04081A', overflow:'hidden' }}>

      {/* ── LEFT PANEL ── */}
      <div style={{ flex:'0 0 48%', position:'relative', overflow:'hidden', display:'flex', flexDirection:'column', justifyContent:'center', padding:'60px 52px' }}>
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(145deg,#0f0524,#1a0a38 50%,#0d1f4c)' }} />
        <canvas ref={canvasRef} style={{ position:'absolute', inset:0, width:'100%', height:'100%', opacity:.7 }} />
        <div style={{ position:'absolute', top:'-15%', left:'-5%', width:'70%', height:'70%', background:'radial-gradient(circle,rgba(124,58,237,.3) 0%,transparent 65%)', filter:'blur(70px)', animation:'blob1 9s ease-in-out infinite' }} />
        <div style={{ position:'absolute', bottom:'-10%', right:'0', width:'60%', height:'60%', background:'radial-gradient(circle,rgba(34,211,238,.18) 0%,transparent 65%)', filter:'blur(60px)', animation:'blob2 12s ease-in-out infinite' }} />
        <div style={{ position:'absolute', inset:0, backgroundImage:'linear-gradient(rgba(167,139,250,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(167,139,250,.04) 1px,transparent 1px)', backgroundSize:'48px 48px' }} />

        <div style={{ position:'relative', zIndex:2 }}>
          {/* Logo */}
          <div style={{ display:'flex', alignItems:'center', gap:11, marginBottom:52 }}>
            <div style={{ width:40, height:40, borderRadius:12, background:'linear-gradient(135deg,#7c3aed,#4f46e5)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, boxShadow:'0 6px 20px rgba(124,58,237,.5)' }}>⚡</div>
            <span style={{ fontSize:18, fontWeight:800, color:'#fff', fontFamily:'Syne,sans-serif' }}>SkillSphere</span>
          </div>

          <h1 style={{ fontSize:44, fontWeight:900, color:'#F1F5F9', fontFamily:'Syne,sans-serif', lineHeight:1.1, margin:'0 0 16px' }}>
            Start your{' '}
            <span style={{ background:'linear-gradient(135deg,#a78bfa,#22D3EE)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>journey</span>
            {' '}today
          </h1>
          <p style={{ fontSize:15, color:'rgba(255,255,255,.5)', lineHeight:1.8, margin:'0 0 44px', maxWidth:360 }}>
            Join thousands of clients and freelancers building the future of work together.
          </p>

          {/* Info list */}
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            {INFO.map((item,i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:14, animation:`fadeUp .5s ease both`, animationDelay:`${.3+i*.1}s` }}>
                <div style={{ width:36, height:36, borderRadius:10, background:'rgba(167,139,250,.1)', border:'1px solid rgba(167,139,250,.2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, flexShrink:0 }}>{item.icon}</div>
                <span style={{ fontSize:14, color:'rgba(255,255,255,.65)', fontWeight:500 }}>{item.text}</span>
              </div>
            ))}
          </div>

          {/* Trust badges */}
          <div style={{ display:'flex', gap:20, marginTop:40 }}>
            {[['🔐','SSL Secure'],['✅','Verified'],['🏆','Top Rated']].map(([icon,label]) => (
              <div key={label} style={{ display:'flex', alignItems:'center', gap:5 }}>
                <span style={{ fontSize:14 }}>{icon}</span>
                <span style={{ fontSize:11, color:'rgba(255,255,255,.35)', fontWeight:600 }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center', padding:'40px 52px', position:'relative' }}>
        <div style={{ position:'absolute', top:'20%', right:'-20%', width:'60%', height:'60%', background:'radial-gradient(circle,rgba(99,102,241,.05) 0%,transparent 65%)', pointerEvents:'none' }} />

        <div style={{ width:'100%', maxWidth:400, opacity:mounted?1:0, transform:mounted?'translateX(0)':'translateX(28px)', transition:'all .7s cubic-bezier(.16,1,.3,1)' }}>

          {/* Top nav */}
          <div style={{ display:'flex', justifyContent:'flex-end', marginBottom:36 }}>
            <span style={{ fontSize:13, color:'rgba(255,255,255,.4)' }}>
              Have an account?{' '}
              <Link to="/login" style={{ color:'#a78bfa', fontWeight:700, textDecoration:'none' }}>Sign in →</Link>
            </span>
          </div>

          {/* Step indicator */}
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:28 }}>
            {[1,2].map(s => (
              <React.Fragment key={s}>
                <div style={{ display:'flex', alignItems:'center', gap:7 }}>
                  <div style={{ width:28, height:28, borderRadius:'50%', background:step>=s?'linear-gradient(135deg,#7c3aed,#4f46e5)':'rgba(255,255,255,.06)', border:`1.5px solid ${step>=s?'transparent':'rgba(255,255,255,.12)'}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:700, color:step>=s?'#fff':'rgba(255,255,255,.3)', transition:'all .3s', boxShadow:step>=s?'0 4px 14px rgba(124,58,237,.4)':'none' }}>
                    {step>s ? '✓' : s}
                  </div>
                  <span style={{ fontSize:12, fontWeight:600, color:step>=s?'rgba(255,255,255,.7)':'rgba(255,255,255,.25)' }}>
                    {s===1?'Choose Role':'Account Info'}
                  </span>
                </div>
                {s<2 && <div style={{ flex:1, height:1.5, background:step>1?'linear-gradient(90deg,#7c3aed,#4f46e5)':'rgba(255,255,255,.08)', transition:'background .4s', maxWidth:50, borderRadius:1 }} />}
              </React.Fragment>
            ))}
          </div>

          {/* ── STEP 1 ── */}
          {step === 1 && (
            <div style={{ animation:'fadeUp .4s ease both' }}>
              <h2 style={{ fontSize:26, fontWeight:900, color:'#F1F5F9', fontFamily:'Syne,sans-serif', margin:'0 0 6px' }}>Create account</h2>
              <p style={{ fontSize:14, color:'rgba(255,255,255,.4)', margin:'0 0 28px' }}>First, tell us how you'll use SkillSphere</p>

              <div style={{ display:'flex', flexDirection:'column', gap:12, marginBottom:28 }}>
                {ROLES.map(r => {
                  const active = role===r.id;
                  return (
                    <div key={r.id} onClick={()=>setRole(r.id)} style={{ display:'flex', alignItems:'center', gap:16, padding:'18px 20px', borderRadius:16, cursor:'pointer', transition:'all .3s', background:active?r.bg:'rgba(255,255,255,.04)', border:`1.5px solid ${active?r.border:'rgba(255,255,255,.08)'}`, boxShadow:active?`0 0 30px ${r.glow}`:'none', transform:active?'scale(1.02)':'scale(1)' }}
                      onMouseEnter={e=>{ if(!active){ e.currentTarget.style.background='rgba(255,255,255,.07)'; e.currentTarget.style.transform='translateX(6px)'; } }}
                      onMouseLeave={e=>{ if(!active){ e.currentTarget.style.background='rgba(255,255,255,.04)'; e.currentTarget.style.transform='translateX(0)'; } }}>
                      <div style={{ width:50, height:50, borderRadius:15, background:active?`${r.bg.replace('.08','0.2').replace('.1','0.2')}`:'rgba(255,255,255,.06)', border:`1px solid ${active?r.border:'rgba(255,255,255,.1)'}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, flexShrink:0, transition:'all .3s' }}>
                        {r.emoji}
                      </div>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:15, fontWeight:700, color:active?r.color:'#F1F5F9', marginBottom:2, transition:'color .3s' }}>{r.title}</div>
                        <div style={{ fontSize:12, color:'rgba(255,255,255,.4)' }}>{r.sub}</div>
                      </div>
                      <div style={{ width:20, height:20, borderRadius:'50%', border:`2px solid ${active?r.color:'rgba(255,255,255,.2)'}`, background:active?r.color:'transparent', display:'flex', alignItems:'center', justifyContent:'center', transition:'all .3s', flexShrink:0 }}>
                        {active && <div style={{ width:7, height:7, borderRadius:'50%', background:'#fff' }} />}
                      </div>
                    </div>
                  );
                })}
              </div>

              <button onClick={()=>{ if(!role){ toast.error('Select a role'); return; } setStep(2); }} style={{ width:'100%', padding:'15px', borderRadius:14, background:'linear-gradient(135deg,#7c3aed,#4f46e5,#2563eb)', border:'none', color:'#fff', fontSize:15, fontWeight:800, cursor:'pointer', ...F, letterSpacing:1.5, textTransform:'uppercase', boxShadow:'0 8px 28px rgba(124,58,237,.45)', transition:'all .3s' }}
                onMouseEnter={e=>{ e.target.style.transform='translateY(-2px)'; e.target.style.boxShadow='0 14px 36px rgba(124,58,237,.65)'; }}
                onMouseLeave={e=>{ e.target.style.transform='translateY(0)'; e.target.style.boxShadow='0 8px 28px rgba(124,58,237,.45)'; }}>
                Continue →
              </button>
            </div>
          )}

          {/* ── STEP 2 ── */}
          {step === 2 && (
            <div style={{ animation:'fadeUp .4s ease both' }}>
              {/* Role badge */}
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:22 }}>
                <div>
                  <h2 style={{ fontSize:26, fontWeight:900, color:'#F1F5F9', fontFamily:'Syne,sans-serif', margin:'0 0 4px' }}>Account details</h2>
                  <p style={{ fontSize:14, color:'rgba(255,255,255,.4)', margin:0 }}>Set up your {role} profile</p>
                </div>
                <div onClick={()=>setStep(1)} style={{ display:'flex', alignItems:'center', gap:6, padding:'6px 12px', borderRadius:999, background:ROLES.find(r=>r.id===role)?.bg||'rgba(255,255,255,.06)', border:`1px solid ${ROLES.find(r=>r.id===role)?.border||'rgba(255,255,255,.1)'}`, cursor:'pointer', transition:'all .2s' }}>
                  <span style={{ fontSize:14 }}>{ROLES.find(r=>r.id===role)?.emoji}</span>
                  <span style={{ fontSize:12, fontWeight:700, color:ROLES.find(r=>r.id===role)?.color||'#fff', textTransform:'capitalize' }}>{role}</span>
                  <span style={{ fontSize:10, color:'rgba(255,255,255,.3)', marginLeft:2 }}>✎</span>
                </div>
              </div>

              <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:13 }}>
                <input type="text" placeholder="Full name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} onFocus={()=>setFocused('n')} onBlur={()=>setFocused('')} style={inp('n')} />
                <input type="email" placeholder="Email address" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} onFocus={()=>setFocused('em')} onBlur={()=>setFocused('')} style={inp('em')} />

                <div style={{ position:'relative' }}>
                  <input type={showPw?'text':'password'} placeholder="Password (min. 8 chars)" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} onFocus={()=>setFocused('pw')} onBlur={()=>setFocused('')} style={{ ...inp('pw'), paddingRight:46 }} />
                  <button type="button" onClick={()=>setShowPw(!showPw)} style={{ position:'absolute', right:13, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'rgba(255,255,255,.35)', fontSize:14, padding:4 }}>{showPw?'🙈':'👁️'}</button>
                </div>

                {/* Strength */}
                {form.password && (
                  <div style={{ marginTop:-6 }}>
                    <div style={{ display:'flex', gap:4, marginBottom:3 }}>
                      {[1,2,3,4].map(i=><div key={i} style={{ flex:1, height:3, borderRadius:2, transition:'background .3s', background: i<=str?strColors[str]:'rgba(255,255,255,.1)' }} />)}
                    </div>
                    <span style={{ fontSize:11, color:strColors[str], fontWeight:600 }}>{strLabels[str]}</span>
                  </div>
                )}

                <input type="password" placeholder="Confirm password" value={form.confirm} onChange={e=>setForm({...form,confirm:e.target.value})} onFocus={()=>setFocused('c')} onBlur={()=>setFocused('')} style={{ ...inp('c'), borderColor: form.confirm&&form.confirm!==form.password?'#ef4444': focused==='c'?'rgba(167,139,250,.75)':'rgba(255,255,255,.1)' }} />

                <button type="submit" disabled={loading} style={{ width:'100%', padding:'15px', borderRadius:14, background:loading?'rgba(124,58,237,.5)':'linear-gradient(135deg,#7c3aed,#4f46e5,#2563eb)', border:'none', color:'#fff', fontSize:15, fontWeight:800, cursor:loading?'not-allowed':'pointer', ...F, letterSpacing:1.5, textTransform:'uppercase', boxShadow:loading?'none':'0 8px 28px rgba(124,58,237,.45)', transition:'all .3s', display:'flex', alignItems:'center', justifyContent:'center', gap:10 }}
                  onMouseEnter={e=>{ if(!loading){ e.target.style.transform='translateY(-2px)'; e.target.style.boxShadow='0 14px 36px rgba(124,58,237,.65)'; } }}
                  onMouseLeave={e=>{ e.target.style.transform='translateY(0)'; e.target.style.boxShadow=loading?'none':'0 8px 28px rgba(124,58,237,.45)'; }}>
                  {loading?<><div style={{ width:17, height:17, border:'2px solid rgba(255,255,255,.3)', borderTopColor:'#fff', borderRadius:'50%', animation:'spin .7s linear infinite' }} />Creating…</>:'Create Account'}
                </button>

                <p style={{ textAlign:'center', fontSize:11, color:'rgba(255,255,255,.25)', margin:0, lineHeight:1.6 }}>
                  By creating an account you agree to our{' '}
                  <span style={{ color:'#a78bfa', cursor:'pointer' }}>Terms</span> &amp;{' '}
                  <span style={{ color:'#a78bfa', cursor:'pointer' }}>Privacy Policy</span>
                </p>
              </form>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
        @keyframes spin  { to{transform:rotate(360deg)} }
        @keyframes blob1 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(25px,-20px)} }
        @keyframes blob2 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(-20px,25px)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
        input::placeholder { color:rgba(255,255,255,.3); }
        *{ box-sizing:border-box; }
      `}</style>
    </div>
  );
};

export default Register;
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import api from '../../utils/api';

const AdminLogin = () => {
  const navigate  = useNavigate();
  const { user }  = useSelector(s => s.auth || {});
  const canvasRef = useRef(null);
  const [form,    setForm]    = useState({ email:'', password:'' });
  const [showPw,  setShowPw]  = useState(false);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState('');
  const [bootText,setBootText]= useState([]);
  const [booting, setBooting] = useState(true);
  const [scanY,   setScanY]   = useState(0);

  useEffect(() => { if(user?.role==='admin') navigate('/admin'); else if(user) navigate('/dashboard'); },[user]);

  // Boot sequence
  useEffect(() => {
    const lines = [
      '> Initializing SkillSphere Admin Portal v2.1.0...',
      '> Loading security modules... ████████████ 100%',
      '> Encrypted channel established... [AES-256]',
      '> Authentication server: ONLINE',
      '> Access level: ADMINISTRATOR',
      '> All systems operational. Awaiting credentials.',
    ];
    let i=0;
    const t = setInterval(()=>{
      if(i<lines.length){ setBootText(p=>[...p,lines[i]]); i++; }
      else { clearInterval(t); setTimeout(()=>setBooting(false),400); }
    },280);
    return ()=>clearInterval(t);
  },[]);

  // Scan line
  useEffect(()=>{
    let y=0,dir=1;
    const t=setInterval(()=>{ y+=dir*.6; if(y>100)dir=-1; if(y<0)dir=1; setScanY(y); },18);
    return ()=>clearInterval(t);
  },[]);

  // Matrix canvas
  useEffect(()=>{
    const canvas=canvasRef.current; if(!canvas) return;
    const ctx=canvas.getContext('2d');
    canvas.width=canvas.offsetWidth; canvas.height=canvas.offsetHeight;
    const cols=Math.floor(canvas.width/16);
    const drops=Array(cols).fill(1);
    const chars='01アイウエオカキクケコ';
    let raf;
    const draw=()=>{
      ctx.fillStyle='rgba(2,9,24,0.08)'; ctx.fillRect(0,0,canvas.width,canvas.height);
      ctx.font='12px monospace';
      drops.forEach((y,i)=>{
        const ch=chars[Math.floor(Math.random()*chars.length)];
        // Gold colored matrix
        ctx.fillStyle=`rgba(212,175,55,${Math.random()>.7?0.5:0.15})`;
        ctx.fillText(ch,i*16,y*16);
        if(y*16>canvas.height&&Math.random()>.975) drops[i]=0;
        drops[i]++;
      });
      raf=requestAnimationFrame(draw);
    };
    draw();
    return ()=>cancelAnimationFrame(raf);
  },[]);

  const handleSubmit = async(e)=>{
    e.preventDefault();
    if(!form.email||!form.password){toast.error('Enter credentials');return;}
    setLoading(true);
    try{
      const res=await api.post('/auth/login',form);
      const{token,user:u}=res.data;
      if(u.role!=='admin'){toast.error('⛔ Admin access denied');setLoading(false);return;}
      localStorage.setItem('token',token);
      try{localStorage.setItem('user',JSON.stringify(u));}catch{}
      window.dispatchEvent(new CustomEvent('authLogin',{detail:{token,user:u}}));
      toast.success('🔐 Admin access granted');
      navigate('/admin');
    }catch(err){toast.error(err?.response?.data?.message||'Authentication failed');}
    finally{setLoading(false);}
  };

  const inp=(name)=>({
    width:'100%', padding:'12px 16px 12px 44px',
    background: focused===name?'rgba(212,175,55,0.07)':'rgba(0,0,0,0.35)',
    border:`1px solid ${focused===name?'rgba(212,175,55,0.65)':'rgba(212,175,55,0.18)'}`,
    borderRadius:9, color:'#E2E8F0', fontSize:14,
    fontFamily:"'JetBrains Mono','Fira Code',monospace",
    outline:'none', boxSizing:'border-box', transition:'all .3s',
    boxShadow:focused===name?'0 0 20px rgba(212,175,55,0.08)':'none',
    letterSpacing:name==='pw'?2:0,
  });

  return (
    <div style={{ minHeight:'100vh', background:'#020918', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'JetBrains Mono','Fira Code',monospace", position:'relative', overflow:'hidden' }}>

      <canvas ref={canvasRef} style={{ position:'absolute', inset:0, width:'100%', height:'100%', opacity:.25 }} />

      {/* Grid */}
      <div style={{ position:'absolute', inset:0, backgroundImage:'linear-gradient(rgba(212,175,55,0.05) 1px,transparent 1px),linear-gradient(90deg,rgba(212,175,55,0.05) 1px,transparent 1px)', backgroundSize:'36px 36px' }} />

      {/* Blue corner glows */}
      <div style={{ position:'absolute', top:'-10%', left:'-5%', width:'50%', height:'50%', background:'radial-gradient(circle,rgba(26,86,219,0.15) 0%,transparent 60%)', filter:'blur(60px)' }} />
      <div style={{ position:'absolute', bottom:'-10%', right:'-5%', width:'50%', height:'50%', background:'radial-gradient(circle,rgba(26,86,219,0.12) 0%,transparent 60%)', filter:'blur(60px)' }} />

      {/* Scan line */}
      <div style={{ position:'fixed', left:0, right:0, height:1.5, background:'linear-gradient(90deg,transparent,rgba(212,175,55,0.7),rgba(96,165,250,0.5),transparent)', top:`${scanY}%`, pointerEvents:'none', zIndex:5, boxShadow:'0 0 10px rgba(212,175,55,0.4)' }} />

      {/* Corner brackets — Blue */}
      {[{top:16,left:16},{top:16,right:16},{bottom:16,left:16},{bottom:16,right:16}].map((s,i)=>(
        <div key={i} style={{ position:'fixed', width:32, height:32, ...s, zIndex:6 }}>
          <div style={{ position:'absolute', top:0, left:s.right!==undefined?'auto':0, right:s.right!==undefined?0:'auto', width:32, height:1.5, background:'rgba(96,165,250,0.55)' }} />
          <div style={{ position:'absolute', top:s.bottom!==undefined?'auto':0, bottom:s.bottom!==undefined?0:'auto', left:s.right!==undefined?'auto':0, right:s.right!==undefined?0:'auto', width:1.5, height:32, background:'rgba(96,165,250,0.55)' }} />
        </div>
      ))}

      {/* Top status bar */}
      <div style={{ position:'fixed', top:0, left:0, right:0, padding:'8px 24px', display:'flex', justifyContent:'space-between', alignItems:'center', background:'rgba(2,9,24,0.85)', borderBottom:'1px solid rgba(212,175,55,0.12)', backdropFilter:'blur(10px)', zIndex:10 }}>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <div style={{ width:6, height:6, borderRadius:'50%', background:'#D4AF37', boxShadow:'0 0 8px #D4AF37', animation:'blink 1.5s ease-in-out infinite' }} />
          <span style={{ fontSize:11, color:'rgba(212,175,55,0.7)', letterSpacing:2, textTransform:'uppercase' }}>SkillSphere Control Center</span>
        </div>
        <span style={{ fontSize:10, color:'rgba(212,175,55,0.3)', letterSpacing:1 }}>
          {new Date().toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit',second:'2-digit'})} IST
        </span>
      </div>

      {/* Boot screen */}
      {booting && (
        <div style={{ position:'fixed', inset:0, background:'#020918', zIndex:50, display:'flex', alignItems:'center', justifyContent:'center', padding:40 }}>
          <div style={{ maxWidth:560, width:'100%' }}>
            <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:24 }}>
              <div style={{ width:36, height:36, borderRadius:10, background:'linear-gradient(135deg,#1A56DB,#D4AF37)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:17 }}>⚡</div>
              <span style={{ fontSize:14, fontWeight:700, color:'rgba(212,175,55,0.8)', letterSpacing:2 }}>SKILLSPHERE ADMIN</span>
            </div>
            {bootText.map((line,i)=>(
              <div key={i} style={{ color:'rgba(212,175,55,0.75)', fontSize:12, lineHeight:2, display:'flex', gap:10 }}>
                <span style={{ color:'rgba(96,165,250,0.5)' }}>[{String(i+1).padStart(2,'0')}]</span>
                <span>{line}</span>
              </div>
            ))}
            {bootText.length<6&&<span style={{ color:'#D4AF37', animation:'blink .8s step-end infinite' }}>_</span>}
          </div>
        </div>
      )}

      {/* Main card */}
      {!booting && (
        <div style={{ position:'relative', zIndex:10, width:'100%', maxWidth:415, margin:'0 20px', marginTop:48, animation:'slideUp .6s cubic-bezier(.16,1,.3,1) both' }}>

          {/* Terminal title bar */}
          <div style={{ background:'rgba(2,9,24,0.95)', border:'1px solid rgba(212,175,55,0.2)', borderBottom:'none', borderRadius:'14px 14px 0 0', padding:'11px 18px', display:'flex', alignItems:'center', gap:8 }}>
            {['#ef4444','#f59e0b','#22c55e'].map((c,i)=><div key={i} style={{ width:11,height:11,borderRadius:'50%',background:c,opacity:.75 }} />)}
            <span style={{ marginLeft:8, fontSize:11, color:'rgba(212,175,55,0.5)', letterSpacing:2, textTransform:'uppercase' }}>admin.auth — bash</span>
          </div>

          {/* Card body */}
          <div style={{ background:'rgba(2,9,24,0.93)', border:'1px solid rgba(212,175,55,0.2)', borderTop:'none', borderRadius:'0 0 14px 14px', padding:'30px 30px 26px', backdropFilter:'blur(30px)', boxShadow:'0 0 80px rgba(212,175,55,0.06),0 40px 80px rgba(0,0,0,0.6)' }}>

            {/* Icon */}
            <div style={{ textAlign:'center', marginBottom:26 }}>
              <div style={{ display:'inline-flex', position:'relative', marginBottom:14 }}>
                <div style={{ width:60, height:60, borderRadius:16, background:'linear-gradient(135deg,rgba(26,86,219,0.15),rgba(212,175,55,0.15))', border:'1px solid rgba(212,175,55,0.3)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:26, boxShadow:'0 0 30px rgba(212,175,55,0.1)' }}>🛡️</div>
                {[{top:2,left:2},{top:2,right:2},{bottom:2,left:2},{bottom:2,right:2}].map((s,i)=>(
                  <div key={i} style={{ position:'absolute',width:5,height:5,borderRadius:'50%',background:'#D4AF37',boxShadow:'0 0 8px #D4AF37',...s }} />
                ))}
              </div>
              <div style={{ fontSize:16, fontWeight:700, color:'#D4AF37', letterSpacing:3, textTransform:'uppercase', marginBottom:3 }}>Admin Access</div>
              <div style={{ fontSize:10, color:'rgba(212,175,55,0.38)', letterSpacing:2 }}>SkillSphere Control Panel v2.1</div>
            </div>

            <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:14 }}>
              <div>
                <label style={{ display:'block', fontSize:9, fontWeight:700, color:'rgba(96,165,250,0.55)', marginBottom:7, letterSpacing:2, textTransform:'uppercase' }}>&gt; Admin Identifier</label>
                <div style={{ position:'relative' }}>
                  <div style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color:focused==='em'?'#D4AF37':'rgba(212,175,55,0.3)', transition:'color .3s' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                  </div>
                  <input type="email" placeholder="admin@skillsphere.com" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} onFocus={()=>setFocused('em')} onBlur={()=>setFocused('')} style={inp('em')} autoComplete="email" />
                </div>
              </div>

              <div>
                <label style={{ display:'block', fontSize:9, fontWeight:700, color:'rgba(96,165,250,0.55)', marginBottom:7, letterSpacing:2, textTransform:'uppercase' }}>&gt; Auth Token</label>
                <div style={{ position:'relative' }}>
                  <div style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color:focused==='pw'?'#D4AF37':'rgba(212,175,55,0.3)', transition:'color .3s' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  </div>
                  <input type={showPw?'text':'password'} placeholder="••••••••••••" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} onFocus={()=>setFocused('pw')} onBlur={()=>setFocused('')} style={{ ...inp('pw'), paddingRight:46 }} />
                  <button type="button" onClick={()=>setShowPw(!showPw)} style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'rgba(212,175,55,0.4)', fontSize:14, padding:4 }}>{showPw?'🙈':'👁️'}</button>
                </div>
              </div>

              {/* Warning */}
              <div style={{ padding:'9px 13px', background:'rgba(239,68,68,0.05)', border:'1px solid rgba(239,68,68,0.18)', borderRadius:8, display:'flex', gap:8 }}>
                <span style={{ fontSize:12, flexShrink:0 }}>⚠</span>
                <span style={{ fontSize:11, color:'rgba(239,68,68,0.6)', lineHeight:1.6, letterSpacing:.2 }}>All admin actions are logged and monitored.</span>
              </div>

              {/* Submit */}
              <button type="submit" disabled={loading} style={{ width:'100%', padding:'13px', borderRadius:9, background:loading?'rgba(212,175,55,0.07)':'linear-gradient(135deg,rgba(212,175,55,0.15),rgba(96,165,250,0.1))', border:`1.5px solid ${loading?'rgba(212,175,55,0.18)':'rgba(212,175,55,0.55)'}`, color:loading?'rgba(212,175,55,0.45)':'#D4AF37', fontSize:12, fontWeight:700, cursor:loading?'not-allowed':'pointer', fontFamily:'inherit', letterSpacing:2.5, textTransform:'uppercase', boxShadow:loading?'none':'0 0 20px rgba(212,175,55,0.08)', transition:'all .3s', display:'flex', alignItems:'center', justifyContent:'center', gap:10 }}
                onMouseEnter={e=>{ if(!loading){ e.target.style.background='rgba(212,175,55,0.18)'; e.target.style.boxShadow='0 0 32px rgba(212,175,55,0.18)'; } }}
                onMouseLeave={e=>{ if(!loading){ e.target.style.background='linear-gradient(135deg,rgba(212,175,55,0.15),rgba(96,165,250,0.1))'; e.target.style.boxShadow='0 0 20px rgba(212,175,55,0.08)'; } }}>
                {loading?<><div style={{ width:14,height:14,border:'1.5px solid rgba(212,175,55,0.3)',borderTopColor:'#D4AF37',borderRadius:'50%',animation:'spin .7s linear infinite' }} />Authenticating…</>:'🔐 Access Control Panel'}
              </button>
            </form>

            <div style={{ borderTop:'1px solid rgba(255,255,255,0.06)', marginTop:20, paddingTop:16, textAlign:'center' }}>
              <Link to="/login" style={{ fontSize:11, color:'rgba(212,175,55,0.3)', textDecoration:'none', letterSpacing:1, transition:'color .2s' }}
                onMouseEnter={e=>e.target.style.color='rgba(212,175,55,0.65)'}
                onMouseLeave={e=>e.target.style.color='rgba(212,175,55,0.3)'}>
                ← Back to user login
              </Link>
            </div>
          </div>

          {/* Footer badges */}
          <div style={{ display:'flex', justifyContent:'center', gap:20, marginTop:14 }}>
            {['🔒 Encrypted','🛡️ Protected','📊 Monitored'].map(b=>(
              <span key={b} style={{ fontSize:10, color:'rgba(212,175,55,0.28)', letterSpacing:1 }}>{b}</span>
            ))}
          </div>
        </div>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&display=swap');
        @keyframes blink   {0%,100%{opacity:1} 50%{opacity:0.2}}
        @keyframes spin    {to{transform:rotate(360deg)}}
        @keyframes slideUp {from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)}}
        input::placeholder{color:rgba(212,175,55,0.22);letter-spacing:0;}
        *{box-sizing:border-box;}
      `}</style>
    </div>
  );
};

export default AdminLogin;
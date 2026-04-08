import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../utils/api';
 
const BG = () => (
  <div style={{ position:'fixed', inset:0, zIndex:0, background:'linear-gradient(160deg,#0f0524,#0d1040 50%,#04081A)', overflow:'hidden' }}>
    {[...Array(50)].map((_,i)=><div key={i} style={{ position:'absolute', borderRadius:'50%', background:'#fff', width:i%7===0?3:1, height:i%7===0?3:1, top:`${Math.random()*100}%`, left:`${Math.random()*100}%`, opacity:Math.random()*0.5+0.1, animation:`tw ${2+Math.random()*3}s ease-in-out ${Math.random()*4}s infinite` }} />)}
    <div style={{ position:'absolute', top:'-10%', left:'20%', width:'60%', height:'60%', background:'radial-gradient(circle,rgba(124,58,237,0.2) 0%,transparent 60%)', filter:'blur(60px)' }} />
    <div style={{ position:'absolute', bottom:'-10%', right:'10%', width:'50%', height:'50%', background:'radial-gradient(circle,rgba(34,211,238,0.1) 0%,transparent 60%)', filter:'blur(50px)' }} />
    <div style={{ position:'absolute', inset:0, backgroundImage:'linear-gradient(rgba(99,102,241,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,0.03) 1px,transparent 1px)', backgroundSize:'44px 44px' }} />
  </div>
);
 
export const ForgotPassword = () => {
  const [email,   setEmail]   = useState('');
  const [sent,    setSent]    = useState(false);
  const [loading, setLoading] = useState(false);
 
  const handle = async (e) => {
    e.preventDefault();
    if (!email) { toast.error('Enter your email'); return; }
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
      toast.success('Reset link sent! Check your inbox.');
    } catch(err) { toast.error(err?.response?.data?.message || 'Failed to send reset email'); }
    finally { setLoading(false); }
  };
 
  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Plus Jakarta Sans',sans-serif", position:'relative' }}>
      <BG />
      <div style={{ position:'relative', zIndex:10, width:'100%', maxWidth:400, margin:'0 20px', animation:'slideUp .6s cubic-bezier(.16,1,.3,1) both' }}>
        <div style={{ background:'rgba(15,10,40,0.75)', border:'1px solid rgba(167,139,250,0.2)', borderRadius:24, padding:'40px 36px', backdropFilter:'blur(40px)', boxShadow:'0 40px 80px rgba(0,0,0,0.5),inset 0 1px 0 rgba(255,255,255,0.07)' }}>
 
          <Link to="/login" style={{ display:'inline-flex', alignItems:'center', gap:6, fontSize:13, color:'rgba(255,255,255,0.4)', textDecoration:'none', marginBottom:28, transition:'color .2s' }}
            onMouseEnter={e=>e.target.style.color='#a78bfa'} onMouseLeave={e=>e.target.style.color='rgba(255,255,255,0.4)'}>
            ← Back to login
          </Link>
 
          {sent ? (
            <div style={{ textAlign:'center' }}>
              <div style={{ fontSize:56, marginBottom:18 }}>📬</div>
              <h2 style={{ fontSize:22, fontWeight:800, color:'#F1F5F9', fontFamily:'Syne,sans-serif', marginBottom:10 }}>Check your inbox</h2>
              <p style={{ fontSize:14, color:'rgba(255,255,255,0.5)', lineHeight:1.7, marginBottom:24 }}>
                We sent a password reset link to<br /><strong style={{ color:'#a78bfa' }}>{email}</strong>
              </p>
              <p style={{ fontSize:12, color:'rgba(255,255,255,0.3)', lineHeight:1.6 }}>Didn't receive it? Check spam or{' '}
                <span onClick={()=>setSent(false)} style={{ color:'#a78bfa', cursor:'pointer', fontWeight:600 }}>try again</span>
              </p>
            </div>
          ) : (
            <>
              <div style={{ textAlign:'center', marginBottom:28 }}>
                <div style={{ width:60, height:60, borderRadius:18, background:'linear-gradient(135deg,#7c3aed,#4f46e5)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:26, margin:'0 auto 16px', boxShadow:'0 8px 24px rgba(124,58,237,.5)' }}>🔑</div>
                <h2 style={{ fontSize:22, fontWeight:800, color:'#F1F5F9', fontFamily:'Syne,sans-serif', margin:'0 0 8px' }}>Forgot password?</h2>
                <p style={{ fontSize:14, color:'rgba(255,255,255,0.45)', margin:0 }}>Enter your email and we'll send a reset link</p>
              </div>
              <form onSubmit={handle}>
                <input type="email" placeholder="your@email.com" value={email} onChange={e=>setEmail(e.target.value)}
                  style={{ width:'100%', padding:'14px 16px', background:'rgba(255,255,255,0.07)', border:'1.5px solid rgba(167,139,250,0.3)', borderRadius:12, color:'#F1F5F9', fontSize:14, fontFamily:'inherit', outline:'none', boxSizing:'border-box', marginBottom:16 }} />
                <button type="submit" disabled={loading} style={{ width:'100%', padding:'14px', borderRadius:12, background:'linear-gradient(135deg,#7c3aed,#4f46e5)', border:'none', color:'#fff', fontSize:14, fontWeight:800, cursor:loading?'not-allowed':'pointer', fontFamily:'inherit', letterSpacing:1.5, textTransform:'uppercase', boxShadow:'0 8px 24px rgba(124,58,237,0.4)', display:'flex', alignItems:'center', justifyContent:'center', gap:10 }}>
                  {loading?<><div style={{ width:16,height:16,border:'2px solid rgba(255,255,255,0.3)',borderTopColor:'#fff',borderRadius:'50%',animation:'spin .7s linear infinite' }} />Sending…</>:'Send Reset Link'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        @keyframes tw      { 0%,100%{opacity:.15} 50%{opacity:.8} }
        @keyframes slideUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin    { to{transform:rotate(360deg)} }
        input::placeholder { color:rgba(255,255,255,0.3); }
        *{box-sizing:border-box;}
      `}</style>
    </div>
  );
};

export default ForgotPassword;

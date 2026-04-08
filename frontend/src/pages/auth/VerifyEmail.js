export const VerifyEmail = () => {
  const navigate = require('react-router-dom').useNavigate();
  const [params] = require('react-router-dom').useSearchParams();
  const token    = params.get('token');
  const [status, setStatus] = useState('verifying'); // verifying | success | error
  const [msg,    setMsg]    = useState('');
 
  React.useEffect(() => {
    if (!token) { setStatus('error'); setMsg('Invalid verification link'); return; }
    api.get('/auth/verify-email?token=' + token)
      .then(() => { setStatus('success'); })
      .catch(err => { setStatus('error'); setMsg(err?.response?.data?.message || 'Verification failed or link expired'); });
  }, [token]);
 
  const icons = { verifying:'⏳', success:'🎉', error:'❌' };
  const titles = { verifying:'Verifying your email…', success:'Email Verified!', error:'Verification Failed' };
  const descs  = { verifying:'Please wait while we confirm your email address.', success:'Your account is now active. Welcome to SkillSphere!', error: msg };
 
  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Plus Jakarta Sans',sans-serif", position:'relative' }}>
      <BG />
      <div style={{ position:'relative', zIndex:10, width:'100%', maxWidth:400, margin:'0 20px', animation:'slideUp .6s cubic-bezier(.16,1,.3,1) both' }}>
        <div style={{ background:'rgba(15,10,40,0.75)', border:'1px solid rgba(167,139,250,0.2)', borderRadius:24, padding:'48px 36px', backdropFilter:'blur(40px)', boxShadow:'0 40px 80px rgba(0,0,0,0.5)', textAlign:'center' }}>
          <div style={{ fontSize:60, marginBottom:20 }}>{icons[status]}</div>
          <h2 style={{ fontSize:22, fontWeight:800, color:'#F1F5F9', fontFamily:'Syne,sans-serif', marginBottom:12 }}>{titles[status]}</h2>
          <p style={{ fontSize:14, color:'rgba(255,255,255,0.5)', lineHeight:1.7, marginBottom:28 }}>{descs[status]}</p>
          {status==='success' && (
            <button onClick={()=>navigate('/login')} style={{ padding:'12px 32px', borderRadius:12, background:'linear-gradient(135deg,#7c3aed,#4f46e5)', border:'none', color:'#fff', fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:'inherit', boxShadow:'0 8px 24px rgba(124,58,237,.4)' }}>
              Sign In Now →
            </button>
          )}
          {status==='error' && (
            <button onClick={()=>navigate('/register')} style={{ padding:'12px 32px', borderRadius:12, background:'rgba(167,139,250,0.1)', border:'1px solid rgba(167,139,250,0.3)', color:'#a78bfa', fontSize:14, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>
              Register Again
            </button>
          )}
        </div>
      </div>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        @keyframes tw      { 0%,100%{opacity:.15} 50%{opacity:.8} }
        @keyframes slideUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        *{box-sizing:border-box;}
      `}</style>
    </div>
  );
};
 
export default VerifyEmail;
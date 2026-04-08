export const ResetPassword = () => {
  const { token } = require('react-router-dom').useParams();
  const navigate  = require('react-router-dom').useNavigate();
  const [pw,      setPw]      = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPw,  setShowPw]  = useState(false);
  const [loading, setLoading] = useState(false);
  const [done,    setDone]    = useState(false);
 
  const handle = async (e) => {
    e.preventDefault();
    if (pw.length < 8)    { toast.error('Minimum 8 characters'); return; }
    if (pw !== confirm)   { toast.error('Passwords do not match'); return; }
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { token, password: pw });
      setDone(true);
      toast.success('Password reset! You can now sign in.');
      setTimeout(() => navigate('/login'), 2500);
    } catch(err) { toast.error(err?.response?.data?.message || 'Reset link may have expired'); }
    finally { setLoading(false); }
  };
 
  const str = (() => { let s=0; if(pw.length>=8)s++; if(/[A-Z]/.test(pw))s++; if(/[0-9]/.test(pw))s++; if(/[^A-Za-z0-9]/.test(pw))s++; return s; })();
  const strC=['','#ef4444','#f97316','#22D3EE','#22c55e'];
 
  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Plus Jakarta Sans',sans-serif", position:'relative' }}>
      <BG />
      <div style={{ position:'relative', zIndex:10, width:'100%', maxWidth:400, margin:'0 20px', animation:'slideUp .6s cubic-bezier(.16,1,.3,1) both' }}>
        <div style={{ background:'rgba(15,10,40,0.75)', border:'1px solid rgba(167,139,250,0.2)', borderRadius:24, padding:'40px 36px', backdropFilter:'blur(40px)', boxShadow:'0 40px 80px rgba(0,0,0,0.5),inset 0 1px 0 rgba(255,255,255,0.07)' }}>
          {done ? (
            <div style={{ textAlign:'center' }}>
              <div style={{ fontSize:56, marginBottom:16 }}>✅</div>
              <h2 style={{ fontSize:22, fontWeight:800, color:'#F1F5F9', fontFamily:'Syne,sans-serif', marginBottom:10 }}>Password reset!</h2>
              <p style={{ fontSize:14, color:'rgba(255,255,255,0.5)', marginBottom:0 }}>Redirecting you to login…</p>
            </div>
          ) : (
            <>
              <div style={{ textAlign:'center', marginBottom:28 }}>
                <div style={{ width:60, height:60, borderRadius:18, background:'linear-gradient(135deg,#7c3aed,#4f46e5)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:26, margin:'0 auto 16px', boxShadow:'0 8px 24px rgba(124,58,237,.5)' }}>🔒</div>
                <h2 style={{ fontSize:22, fontWeight:800, color:'#F1F5F9', fontFamily:'Syne,sans-serif', margin:'0 0 8px' }}>Set new password</h2>
                <p style={{ fontSize:14, color:'rgba(255,255,255,0.45)', margin:0 }}>Choose a strong password for your account</p>
              </div>
              <form onSubmit={handle} style={{ display:'flex', flexDirection:'column', gap:14 }}>
                <div style={{ position:'relative' }}>
                  <input type={showPw?'text':'password'} placeholder="New password" value={pw} onChange={e=>setPw(e.target.value)}
                    style={{ width:'100%', padding:'14px 46px 14px 16px', background:'rgba(255,255,255,0.07)', border:'1.5px solid rgba(167,139,250,0.3)', borderRadius:12, color:'#F1F5F9', fontSize:14, fontFamily:'inherit', outline:'none', boxSizing:'border-box' }} />
                  <button type="button" onClick={()=>setShowPw(!showPw)} style={{ position:'absolute', right:13, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'rgba(255,255,255,0.35)', fontSize:14 }}>{showPw?'🙈':'👁️'}</button>
                </div>
                {pw && <div><div style={{ display:'flex', gap:4, marginBottom:3 }}>{[1,2,3,4].map(i=><div key={i} style={{ flex:1, height:3, borderRadius:2, background:i<=str?strC[str]:'rgba(255,255,255,.1)', transition:'background .3s' }} />)}</div></div>}
                <input type="password" placeholder="Confirm password" value={confirm} onChange={e=>setConfirm(e.target.value)}
                  style={{ width:'100%', padding:'14px 16px', background:'rgba(255,255,255,0.07)', border:`1.5px solid ${confirm&&confirm!==pw?'#ef4444':'rgba(167,139,250,0.3)'}`, borderRadius:12, color:'#F1F5F9', fontSize:14, fontFamily:'inherit', outline:'none', boxSizing:'border-box' }} />
                <button type="submit" disabled={loading} style={{ width:'100%', padding:'14px', borderRadius:12, background:'linear-gradient(135deg,#7c3aed,#4f46e5)', border:'none', color:'#fff', fontSize:14, fontWeight:800, cursor:loading?'not-allowed':'pointer', fontFamily:'inherit', letterSpacing:1.5, textTransform:'uppercase', boxShadow:'0 8px 24px rgba(124,58,237,0.4)', display:'flex', alignItems:'center', justifyContent:'center', gap:10 }}>
                  {loading?<><div style={{ width:16,height:16,border:'2px solid rgba(255,255,255,0.3)',borderTopColor:'#fff',borderRadius:'50%',animation:'spin .7s linear infinite' }} />Resetting…</>:'Reset Password'}
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
export default ResetPassword;
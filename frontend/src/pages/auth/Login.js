import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import api from '../../utils/api';

// Fixed star positions — no Math.random() on render
const STARS = [
  [8,15,3],[22,72,1],[45,33,2],[67,88,1],[15,55,1],[85,20,2],[35,92,1],[72,45,3],
  [55,10,1],[90,68,2],[12,40,1],[48,75,2],[78,28,1],[30,85,3],[62,50,1],[5,95,1],
  [92,12,2],[38,60,1],[70,35,1],[25,80,2],[58,18,3],[82,90,1],[42,42,1],[18,65,2],
  [95,38,1],[50,5,2],[28,52,1],[75,78,3],[10,25,1],[65,95,2],[88,55,1],[33,15,2],
  [52,88,1],[20,30,3],[80,65,1],[40,48,1],[72,8,2],[15,70,1],[60,22,1],[45,60,2],
];

const FEATURES = [
  { icon:'⚡', title:'AI Job Matching',     desc:'Smart algorithm finds perfect opportunities for you' },
  { icon:'🔒', title:'Escrow Protection',   desc:'100% secure payments held until work is approved' },
  { icon:'💬', title:'Real-time Chat',       desc:'Instant messaging and video calls built-in' },
  { icon:'📊', title:'Analytics Dashboard', desc:'Track earnings, proposals and project progress' },
];

const Login = () => {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const { user }  = useSelector(s => s.auth || {});

  const [form,    setForm]    = useState({ email: '', password: '' });
  const [showPw,  setShowPw]  = useState(false);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => { if (user) navigate('/dashboard'); }, [user]);
  useEffect(() => { setTimeout(() => setMounted(true), 80); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) { toast.error('Fill in all fields'); return; }
    setLoading(true);
    try {
      const res = await api.post('/auth/login', form);
      const { token, user: u } = res.data;
      localStorage.setItem('token', token);
      try { localStorage.setItem('user', JSON.stringify(u)); } catch {}
      dispatch({ type: 'auth/setUser', payload: u });
      toast.success(`Welcome back, ${u.name?.split(' ')[0]}! ✨`);
      navigate(u.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Invalid email or password');
    } finally { setLoading(false); }
  };

  const handleGoogle = () => {
    window.location.href = `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/auth/google`;
  };

  const handleGitHub = () => {
    window.location.href = `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/auth/github`;
  };

  const inp = (name) => ({
    width: '100%', padding: '14px 16px',
    background: focused === name ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.06)',
    border: `1.5px solid ${focused === name ? 'rgba(167,139,250,0.75)' : 'rgba(255,255,255,0.1)'}`,
    borderRadius: 13, color: '#F1F5F9', fontSize: 14,
    fontFamily: "'Plus Jakarta Sans',sans-serif",
    outline: 'none', boxSizing: 'border-box', transition: 'all .3s',
    boxShadow: focused === name ? '0 0 22px rgba(167,139,250,0.15)' : 'none',
  });

  // Shared background for BOTH panels
  const panelBg = {
    background: 'linear-gradient(145deg,#0f0524 0%,#1a0a38 40%,#0d1f4c 100%)',
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', fontFamily: "'Plus Jakarta Sans',sans-serif", overflow: 'hidden', background: '#04081A' }}>

      {/* ══════════════════════════════════════
          LEFT PANEL
      ══════════════════════════════════════ */}
      <div className="login-left-panel" style={{ flex: '0 0 52%', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '60px 56px', ...panelBg }}>

        {/* Grid overlay */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(167,139,250,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(167,139,250,0.04) 1px,transparent 1px)', backgroundSize: '48px 48px' }} />

        {/* Blobs */}
        <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '60%', height: '60%', background: 'radial-gradient(circle,rgba(124,58,237,0.35) 0%,transparent 65%)', filter: 'blur(70px)', animation: 'blob1 8s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', bottom: '-10%', right: '-5%', width: '55%', height: '55%', background: 'radial-gradient(circle,rgba(34,211,238,0.22) 0%,transparent 65%)', filter: 'blur(65px)', animation: 'blob2 10s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', top: '40%', left: '30%', width: '40%', height: '40%', background: 'radial-gradient(circle,rgba(99,102,241,0.18) 0%,transparent 65%)', filter: 'blur(50px)', animation: 'blob3 12s ease-in-out infinite' }} />

        {/* Stars */}
        {STARS.map(([top, left, size], i) => (
          <div key={i} style={{ position: 'absolute', borderRadius: '50%', background: '#fff', width: size, height: size, top: `${top}%`, left: `${left}%`, opacity: size === 3 ? 0.7 : size === 2 ? 0.45 : 0.25, animation: `twinkle ${2 + (i % 3)}s ease-in-out infinite`, animationDelay: `${(i * 0.25) % 4}s` }} />
        ))}

        {/* Content */}
        <div style={{ position: 'relative', zIndex: 2 }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 52 }}>
            <div style={{ width: 44, height: 44, borderRadius: 13, background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, boxShadow: '0 8px 24px rgba(124,58,237,0.5)' }}>⚡</div>
            <span style={{ fontSize: 20, fontWeight: 800, color: '#fff', fontFamily: 'Syne,sans-serif', letterSpacing: '-0.5px' }}>SkillSphere</span>
          </div>

          {/* Hero */}
          <div style={{ marginBottom: 44 }}>
            <h1 style={{ fontSize: 48, fontWeight: 900, color: '#F1F5F9', fontFamily: 'Syne,sans-serif', lineHeight: 1.1, margin: '0 0 16px' }}>
              The Future of{' '}
              <span style={{ background: 'linear-gradient(135deg,#a78bfa,#22D3EE)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', display: 'block' }}>
                Freelancing
              </span>
            </h1>
            <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.5)', lineHeight: 1.8, margin: 0, maxWidth: 380 }}>
              Connect with 48,000+ verified professionals. AI-powered matching, secure payments, real-time collaboration.
            </p>
          </div>

          {/* Feature cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {FEATURES.map((f, i) => (
              <div key={i} style={{ padding: '16px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, backdropFilter: 'blur(10px)', transition: 'all .3s', animation: `fadeUp .5s ease both`, animationDelay: `${0.2 + i * 0.1}s` }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(167,139,250,0.08)'; e.currentTarget.style.borderColor = 'rgba(167,139,250,0.25)'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                <div style={{ fontSize: 22, marginBottom: 8 }}>{f.icon}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#E2E8F0', marginBottom: 4 }}>{f.title}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', lineHeight: 1.5 }}>{f.desc}</div>
              </div>
            ))}
          </div>

          {/* Social proof */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 28 }}>
            <div style={{ display: 'flex' }}>
              {['#6366F1', '#22D3EE', '#a78bfa', '#10b981', '#f59e0b'].map((c, i) => (
                <div key={i} style={{ width: 30, height: 30, borderRadius: '50%', background: `linear-gradient(135deg,${c},${c}99)`, border: '2px solid #0f0524', marginLeft: i > 0 ? -9 : 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: '#fff' }}>
                  {['R', 'P', 'A', 'M', 'V'][i]}
                </div>
              ))}
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#F1F5F9' }}>12,000+ projects completed</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>⭐ 4.9 average rating</div>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════
          RIGHT PANEL — same space bg as left
      ══════════════════════════════════════ */}
      <div className="login-right-panel" style={{ flex: 1, position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '60px 52px', ...panelBg }}>

        {/* Grid overlay */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(99,102,241,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,0.04) 1px,transparent 1px)', backgroundSize: '44px 44px' }} />

        {/* Blobs — mirrored */}
        <div style={{ position: 'absolute', top: '-15%', right: '-10%', width: '65%', height: '65%', background: 'radial-gradient(circle,rgba(124,58,237,0.28) 0%,transparent 60%)', filter: 'blur(70px)', animation: 'blob2 9s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', bottom: '-15%', left: '-5%', width: '55%', height: '55%', background: 'radial-gradient(circle,rgba(99,102,241,0.22) 0%,transparent 60%)', filter: 'blur(60px)', animation: 'blob3 11s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', top: '40%', right: '20%', width: '38%', height: '38%', background: 'radial-gradient(circle,rgba(34,211,238,0.1) 0%,transparent 65%)', filter: 'blur(40px)', animation: 'blob1 13s ease-in-out infinite' }} />

        {/* Stars on right too */}
        {STARS.slice(0, 25).map(([top, left, size], i) => (
          <div key={i} style={{ position: 'absolute', borderRadius: '50%', background: '#fff', width: size, height: size, top: `${(top + 15) % 100}%`, left: `${(left + 20) % 100}%`, opacity: size === 3 ? 0.6 : 0.2, animation: `twinkle ${3 + (i % 3)}s ease-in-out infinite`, animationDelay: `${(i * 0.4) % 5}s`, pointerEvents: 'none' }} />
        ))}

        {/* Vertical separator line */}
        <div style={{ position: 'absolute', top: '10%', left: 0, width: 1, height: '80%', background: 'linear-gradient(to bottom,transparent,rgba(167,139,250,0.25),transparent)' }} />

        {/* Form */}
        <div style={{ position: 'relative', zIndex: 2, width: '100%', maxWidth: 380, opacity: mounted ? 1 : 0, transform: mounted ? 'translateX(0)' : 'translateX(28px)', transition: 'all .7s cubic-bezier(.16,1,.3,1)' }}>

          {/* Top link */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 36 }}>
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>
              No account?{' '}
              <Link to="/register" style={{ color: '#a78bfa', fontWeight: 700, textDecoration: 'none' }}>Sign up free →</Link>
            </span>
          </div>

          {/* Heading */}
          <h2 style={{ fontSize: 30, fontWeight: 900, color: '#F1F5F9', fontFamily: 'Syne,sans-serif', margin: '0 0 6px' }}>Welcome back</h2>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', margin: '0 0 32px', lineHeight: 1.6 }}>Sign in to continue to your workspace</p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

            {/* Email */}
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: 15, top: '50%', transform: 'translateY(-50%)', color: focused === 'em' ? '#a78bfa' : 'rgba(255,255,255,0.3)', transition: 'color .3s' }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
              </div>
              <input type="email" placeholder="Email address" value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                onFocus={() => setFocused('em')} onBlur={() => setFocused('')}
                style={{ ...inp('em'), paddingLeft: 44 }} autoComplete="email" />
            </div>

            {/* Password */}
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: 15, top: '50%', transform: 'translateY(-50%)', color: focused === 'pw' ? '#a78bfa' : 'rgba(255,255,255,0.3)', transition: 'color .3s' }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              </div>
              <input type={showPw ? 'text' : 'password'} placeholder="Password" value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                onFocus={() => setFocused('pw')} onBlur={() => setFocused('')}
                style={{ ...inp('pw'), paddingLeft: 44, paddingRight: 46 }} autoComplete="current-password" />
              <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: 13, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.35)', fontSize: 15, padding: 4, lineHeight: 1 }}>
                {showPw ? '🙈' : '👁️'}
              </button>
            </div>

            {/* Forgot */}
            <div style={{ textAlign: 'right', marginTop: -6 }}>
              <Link to="/forgot-password" style={{ fontSize: 13, color: '#a78bfa', textDecoration: 'none', fontWeight: 500 }}>Forgot password?</Link>
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading} style={{ width: '100%', padding: '15px', borderRadius: 13, background: loading ? 'rgba(99,102,241,0.4)' : 'linear-gradient(135deg,#7c3aed 0%,#4f46e5 50%,#2563eb 100%)', border: 'none', color: '#fff', fontSize: 14, fontWeight: 800, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: "'Plus Jakarta Sans',sans-serif", letterSpacing: 1.5, textTransform: 'uppercase', boxShadow: loading ? 'none' : '0 8px 28px rgba(99,102,241,0.5)', transition: 'all .3s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}
              onMouseEnter={e => { if (!loading) { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 12px 36px rgba(99,102,241,0.7)'; } }}
              onMouseLeave={e => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = loading ? 'none' : '0 8px 28px rgba(99,102,241,0.5)'; }}>
              {loading ? <><div style={{ width: 17, height: 17, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin .7s linear infinite' }} /> Signing in…</> : 'Sign In'}
            </button>
          </form>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, margin: '22px 0' }}>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.1)' }} />
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', letterSpacing: 1 }}>OR</span>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.1)' }} />
          </div>

          {/* Social buttons */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {[
              { label: 'Google', color: '#4285F4', icon: <svg width="15" height="15" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>, action: handleGoogle },
              { label: 'GitHub', color: '#fff', icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0 0 22 12.017C22 6.484 17.522 2 12 2z"/></svg>, action: handleGitHub },
            ].map(s => (
              <button key={s.label} onClick={s.action} style={{ padding: '12px 16px', borderRadius: 12, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#E2E8F0', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: "'Plus Jakarta Sans',sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all .2s' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.borderColor = 'rgba(167,139,250,0.35)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                {s.icon} {s.label}
              </button>
            ))}
          </div>

          {/* Admin link */}
          <div style={{ textAlign: 'center', marginTop: 28 }}>
            <Link to="/admin-login" style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)', textDecoration: 'none', transition: 'color .2s' }}
              onMouseEnter={e => e.target.style.color = 'rgba(255,255,255,0.45)'}
              onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.2)'}>
              🔐 Admin access
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
        @keyframes blob1  { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(25px,-18px) scale(1.08)} }
        @keyframes blob2  { 0%,100%{transform:translate(0,0)} 50%{transform:translate(-18px,22px)} }
        @keyframes blob3  { 0%,100%{transform:translate(0,0)} 33%{transform:translate(15px,-10px)} 66%{transform:translate(-10px,15px)} }
        @keyframes twinkle{ 0%,100%{opacity:.1;transform:scale(1)} 50%{opacity:.9;transform:scale(1.5)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin   { to{transform:rotate(360deg)} }
        input::placeholder { color:rgba(255,255,255,0.3); }
        * { box-sizing:border-box; }
        @media (max-width: 768px) {
          .login-left-panel { display:none !important; }
          .login-right-panel { min-height:100vh; padding:40px 24px !important; }
        }
      `}</style>
    </div>
  );
};

export default Login;
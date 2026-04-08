import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import toast from 'react-hot-toast';

// ─────────────────────────────────────────────────────────────
// OAuthSuccess.js
// Fixes:
// 1. React StrictMode double-run guard (useRef flag)
// 2. Hard redirect via window.location.replace (bypasses Router issues)
// 3. Tries multiple dispatch action types for compatibility
// 4. Single toast via processed ref
// ─────────────────────────────────────────────────────────────

const OAuthSuccess = () => {
  const dispatch       = useDispatch();
  const [params]       = useSearchParams();
  const [status, setStatus] = useState('processing');
  const [msg,    setMsg]    = useState('');
  const processed      = useRef(false); // StrictMode double-run guard

  useEffect(() => {
    // Guard: only run once even in StrictMode
    if (processed.current) return;
    processed.current = true;

    const run = () => {
      try {
        const token   = params.get('token');
        const userStr = params.get('user');
        const error   = params.get('error');

        // ── Handle OAuth failure ───────────────────────────
        if (error) {
          const msgs = {
            github_failed: 'GitHub login failed. Please try again.',
            google_failed: 'Google login failed. Please try again.',
            server_error:  'Server error. Please try again.',
          };
          setStatus('error');
          setMsg(msgs[error] || 'Authentication failed.');
          setTimeout(() => { window.location.replace('/login'); }, 2500);
          return;
        }

        // ── Validate params ────────────────────────────────
        if (!token || !userStr) {
          setStatus('error');
          setMsg('Invalid response from server. Please try logging in again.');
          setTimeout(() => { window.location.replace('/login'); }, 2500);
          return;
        }

        // ── Parse user ─────────────────────────────────────
        let user;
        try {
          user = JSON.parse(decodeURIComponent(userStr));
        } catch {
          setStatus('error');
          setMsg('Could not read user data. Please try again.');
          setTimeout(() => { window.location.replace('/login'); }, 2500);
          return;
        }

        // ── Save token + user to localStorage ───────────────
        localStorage.setItem('token', token);
        // Also persist user so Redux can load it on page reload
        try { localStorage.setItem('user', JSON.stringify(user)); } catch {}

        // ── Update Redux store ─────────────────────────────
        // Try multiple action names to match any authSlice structure
        try {
          dispatch({ type: 'auth/setUser',       payload: user });
        } catch {}
        try {
          dispatch({ type: 'auth/loginSuccess',  payload: { user, token } });
        } catch {}
        try {
          dispatch({ type: 'auth/login',         payload: { user, token } });
        } catch {}
        // Also try setting credentials directly
        try {
          dispatch({ type: 'auth/setCredentials', payload: { user, token } });
        } catch {}

        // ── Show single success toast ──────────────────────
        const firstName = user?.name?.split(' ')?.[0] || 'there';
        toast.success(`Welcome, ${firstName}! 🎉`, { id: 'oauth-success', duration: 2000 });

        setStatus('success');

        // ── Hard redirect after short delay ────────────────
        // Use window.location.replace instead of React Router navigate
        // This forces a full page reload which re-initializes Redux from localStorage
        const dest = user?.role === 'admin' ? '/admin' : '/dashboard';
        setTimeout(() => {
          window.location.replace(dest);
        }, 1300);

      } catch (err) {
        console.error('OAuthSuccess error:', err);
        setStatus('error');
        setMsg('Something went wrong. Please try logging in again.');
        setTimeout(() => { window.location.replace('/login'); }, 2500);
      }
    };

    run();
  }, []); // Empty deps — runs once on mount

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(145deg,#0f0524,#1a0a38,#0d1f4c)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Plus Jakarta Sans',sans-serif", position: 'relative', overflow: 'hidden' }}>

      {/* BG blobs */}
      <div style={{ position: 'absolute', top: '-10%', left: '-5%', width: '60%', height: '60%', background: 'radial-gradient(circle,rgba(124,58,237,0.22) 0%,transparent 60%)', filter: 'blur(60px)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-10%', right: '-5%', width: '55%', height: '55%', background: 'radial-gradient(circle,rgba(34,211,238,0.12) 0%,transparent 60%)', filter: 'blur(60px)', pointerEvents: 'none' }} />

      {/* Card */}
      <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: '44px 40px', background: 'rgba(15,10,40,0.8)', border: '1px solid rgba(167,139,250,0.2)', borderRadius: 24, backdropFilter: 'blur(40px)', boxShadow: '0 40px 80px rgba(0,0,0,0.5)', maxWidth: 360, width: '90%', animation: 'slideUp .5s cubic-bezier(.16,1,.3,1) both' }}>

        {/* Processing state */}
        {status === 'processing' && (
          <>
            <div style={{ position: 'relative', width: 72, height: 72, margin: '0 auto 22px' }}>
              <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '3px solid rgba(99,102,241,0.15)' }} />
              <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '3px solid transparent', borderTopColor: '#6366F1', animation: 'spin .9s linear infinite' }} />
              <div style={{ position: 'absolute', inset: 7, borderRadius: '50%', border: '2px solid transparent', borderTopColor: '#22D3EE', animation: 'spin 1.3s linear infinite reverse' }} />
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>⚡</div>
            </div>
            <h2 style={{ fontSize: 19, fontWeight: 800, color: '#F1F5F9', fontFamily: 'Syne,sans-serif', margin: '0 0 8px' }}>Signing you in…</h2>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', margin: '0 0 20px' }}>Setting up your workspace</p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 6 }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: '#6366F1', animation: 'bounce .9s ease-in-out infinite', animationDelay: `${i * 0.18}s` }} />
              ))}
            </div>
          </>
        )}

        {/* Success state */}
        {status === 'success' && (
          <>
            <div style={{ width: 72, height: 72, margin: '0 auto 20px', borderRadius: '50%', background: 'rgba(34,197,94,0.12)', border: '2px solid rgba(34,197,94,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, animation: 'pop .35s cubic-bezier(.16,1,.3,1) both' }}>✅</div>
            <h2 style={{ fontSize: 19, fontWeight: 800, color: '#F1F5F9', fontFamily: 'Syne,sans-serif', margin: '0 0 8px' }}>Login successful!</h2>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', margin: 0 }}>Redirecting to your dashboard…</p>
            {/* Progress bar */}
            <div style={{ height: 3, background: 'rgba(255,255,255,0.08)', borderRadius: 2, marginTop: 22, overflow: 'hidden' }}>
              <div style={{ height: '100%', background: 'linear-gradient(90deg,#6366F1,#22D3EE)', borderRadius: 2, animation: 'progress 1.3s linear forwards' }} />
            </div>
          </>
        )}

        {/* Error state */}
        {status === 'error' && (
          <>
            <div style={{ width: 72, height: 72, margin: '0 auto 20px', borderRadius: '50%', background: 'rgba(239,68,68,0.1)', border: '2px solid rgba(239,68,68,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30 }}>❌</div>
            <h2 style={{ fontSize: 19, fontWeight: 800, color: '#F1F5F9', fontFamily: 'Syne,sans-serif', margin: '0 0 8px' }}>Login failed</h2>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', margin: '0 0 18px', lineHeight: 1.6 }}>{msg}</p>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', margin: 0 }}>Redirecting to login…</p>
          </>
        )}

        {/* Branding */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 26, paddingTop: 18, borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <div style={{ width: 24, height: 24, borderRadius: 7, background: 'linear-gradient(135deg,#6366F1,#4f46e5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>⚡</div>
          <span style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.35)', fontFamily: 'Syne,sans-serif' }}>SkillSphere</span>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        @keyframes spin     { to { transform:rotate(360deg) } }
        @keyframes slideUp  { from{opacity:0;transform:translateY(22px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pop      { from{opacity:0;transform:scale(.5)} to{opacity:1;transform:scale(1)} }
        @keyframes bounce   { 0%,100%{transform:translateY(0);opacity:.35} 50%{transform:translateY(-7px);opacity:1} }
        @keyframes progress { from{width:0%} to{width:100%} }
        * { box-sizing:border-box; }
      `}</style>
    </div>
  );
};

export default OAuthSuccess;
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { login } from '../../redux/slices/authSlice';
import toast from 'react-hot-toast';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '', twoFactorCode: '' });
  const [focusedField, setFocusedField] = useState(null);
  const [hoveredBtn, setHoveredBtn] = useState(null);
  const { loading, error, twoFactorRequired } = useSelector(s => s.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await dispatch(login(form));
    if (res.type.endsWith('fulfilled') && !res.payload.twoFactorRequired) {
      toast.success('Welcome back!');
      navigate('/dashboard');
    } else if (res.type.endsWith('rejected')) {
      toast.error(res.payload || 'Login failed');
    }
  };

  const inputStyle = (field) => ({
    width: '100%',
    padding: '12px 16px',
    background: focusedField === field ? 'rgba(124,58,237,0.08)' : 'rgba(255,255,255,0.04)',
    border: focusedField === field ? '1px solid rgba(167,139,250,0.6)' : '1px solid rgba(255,255,255,0.08)',
    borderRadius: '10px',
    color: '#f0f0ff',
    fontSize: '14px',
    fontFamily: 'inherit',
    outline: 'none',
    transition: 'all 0.2s ease',
    boxSizing: 'border-box',
    boxShadow: focusedField === field ? '0 0 0 3px rgba(124,58,237,0.15)' : 'none',
  });

  const btnPrimaryStyle = {
    width: '100%',
    padding: '13px',
    background: hoveredBtn === 'signin'
      ? 'linear-gradient(135deg, #6D28D9, #8B5CF6)'
      : 'linear-gradient(135deg, #7C3AED, #A78BFA)',
    border: 'none',
    borderRadius: '10px',
    color: '#fff',
    fontSize: '15px',
    fontWeight: '700',
    fontFamily: 'inherit',
    cursor: loading ? 'not-allowed' : 'pointer',
    transition: 'all 0.25s ease',
    transform: hoveredBtn === 'signin' ? 'translateY(-2px)' : 'translateY(0)',
    boxShadow: hoveredBtn === 'signin'
      ? '0 12px 32px rgba(124,58,237,0.5)'
      : '0 4px 16px rgba(124,58,237,0.3)',
    opacity: loading ? 0.7 : 1,
    marginBottom: '12px',
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      background: '#05050f',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background glows */}
      <div style={{
        position: 'absolute', top: '-20%', left: '50%',
        transform: 'translateX(-50%)', width: '800px', height: '600px',
        background: 'radial-gradient(ellipse, rgba(124,58,237,0.18) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '-10%', right: '-10%',
        width: '500px', height: '500px',
        background: 'radial-gradient(ellipse, rgba(167,139,250,0.08) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{ width: '100%', maxWidth: '420px', position: 'relative', zIndex: 1 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '52px', height: '52px', borderRadius: '14px',
            background: 'linear-gradient(135deg, #7C3AED, #A78BFA)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '24px', margin: '0 auto 14px',
            boxShadow: '0 8px 32px rgba(124,58,237,0.4)',
          }}>
            ⚡
          </div>
          <h1 style={{
            fontSize: '26px', fontWeight: '800',
            background: 'linear-gradient(135deg, #A78BFA, #C4B5FD, #7C3AED)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            backgroundClip: 'text', letterSpacing: '-0.5px', marginBottom: '6px',
          }}>
            SkillSphere
          </h1>
          <p style={{ color: '#6b6b8a', fontSize: '14px' }}>Sign in to your account</p>
        </div>

        {/* Card */}
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(167,139,250,0.15)',
          borderRadius: '20px',
          padding: '36px 32px',
          boxShadow: '0 24px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)',
        }}>

          {!twoFactorRequired ? (
            <div>
              {/* Badge */}
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                  background: 'rgba(124,58,237,0.12)',
                  border: '1px solid rgba(167,139,250,0.2)',
                  borderRadius: '99px', padding: '4px 12px',
                  fontSize: '11px', color: '#A78BFA', fontWeight: '600',
                }}>
                  🔒 Secure Login
                </span>
              </div>

              <form onSubmit={handleSubmit}>
                {/* Email */}
                <div style={{ marginBottom: '18px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#9090b0', marginBottom: '8px' }}>
                    Email address
                  </label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    style={inputStyle('email')}
                    required
                  />
                </div>

                {/* Password */}
                <div style={{ marginBottom: '18px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#9090b0', marginBottom: '8px' }}>
                    Password
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    style={inputStyle('password')}
                    required
                  />
                  <Link to="/forgot-password" style={{ display: 'block', textAlign: 'right', fontSize: '12px', color: '#A78BFA', textDecoration: 'none', marginTop: '6px' }}>
                    Forgot password?
                  </Link>
                </div>

                {/* Error */}
                {error && (
                  <div style={{
                    background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)',
                    borderRadius: '10px', padding: '10px 14px', color: '#f87171',
                    fontSize: '13px', marginBottom: '16px',
                  }}>
                    {error}
                  </div>
                )}

                {/* Sign In Button */}
                <button
                  type="submit"
                  disabled={loading}
                  style={btnPrimaryStyle}
                  onMouseEnter={() => setHoveredBtn('signin')}
                  onMouseLeave={() => setHoveredBtn(null)}
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </button>
              </form>

              {/* Divider */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '20px 0' }}>
                <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.07)' }} />
                <span style={{ color: '#50506a', fontSize: '12px', fontWeight: '500' }}>or continue with</span>
                <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.07)' }} />
              </div>

              {/* Google Button */}
              <a
                href="http://localhost:5000/api/auth/google"
                style={{
                  width: '100%',
                  padding: '12px',
                  background: hoveredBtn === 'google' ? 'rgba(167,139,250,0.12)' : 'rgba(255,255,255,0.04)',
                  border: hoveredBtn === 'google' ? '1px solid rgba(167,139,250,0.5)' : '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '10px',
                  color: hoveredBtn === 'google' ? '#C4B5FD' : '#a0a0c0',
                  fontSize: '14px', fontWeight: '600', fontFamily: 'inherit',
                  cursor: 'pointer', transition: 'all 0.25s ease',
                  transform: hoveredBtn === 'google' ? 'translateY(-2px)' : 'translateY(0)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  gap: '10px', textDecoration: 'none',
                  boxShadow: hoveredBtn === 'google' ? '0 8px 24px rgba(124,58,237,0.2)' : 'none',
                }}
                onMouseEnter={() => setHoveredBtn('google')}
                onMouseLeave={() => setHoveredBtn(null)}
              >
                <span style={{ fontSize: '16px' }}>G</span>
                Continue with Google
              </a>
            </div>
          ) : (
            /* 2FA View */
            <form onSubmit={handleSubmit}>
              <div style={{ textAlign: 'center', padding: '16px 0' }}>
                <div style={{ fontSize: '44px', marginBottom: '12px' }}>🔐</div>
                <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#e0e0f0', marginBottom: '6px' }}>
                  Two-Factor Authentication
                </h3>
                <p style={{ color: '#7070a0', fontSize: '13px', marginBottom: '20px' }}>
                  Enter the 6-digit code from your authenticator app
                </p>
              </div>
              <input
                type="text"
                placeholder="000000"
                value={form.twoFactorCode}
                onChange={e => setForm({ ...form, twoFactorCode: e.target.value })}
                maxLength={6}
                style={{
                  width: '100%', padding: '16px',
                  background: 'rgba(124,58,237,0.08)',
                  border: '1px solid rgba(167,139,250,0.4)',
                  borderRadius: '12px', color: '#f0f0ff',
                  fontSize: '28px', fontFamily: 'monospace',
                  textAlign: 'center', letterSpacing: '12px',
                  outline: 'none', boxSizing: 'border-box',
                  boxShadow: '0 0 0 3px rgba(124,58,237,0.1)',
                }}
              />
              <button
                type="submit"
                disabled={loading}
                style={{ ...btnPrimaryStyle, marginTop: '20px' }}
                onMouseEnter={() => setHoveredBtn('signin')}
                onMouseLeave={() => setHoveredBtn(null)}
              >
                {loading ? 'Verifying...' : 'Verify Code'}
              </button>
            </form>
          )}

          {/* Footer */}
          <p style={{ textAlign: 'center', marginTop: '24px', color: '#50506a', fontSize: '14px' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: '#A78BFA', textDecoration: 'none', fontWeight: '600' }}>
              Sign up free
            </Link>
          </p>
        </div>

        {/* Trust badge */}
        <p style={{ textAlign: 'center', marginTop: '20px', color: '#30304a', fontSize: '12px' }}>
          🔒 Secured with 256-bit SSL encryption
        </p>
      </div>
    </div>
  );
};

export default Login;
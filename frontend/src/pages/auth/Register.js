import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { register } from '../../redux/slices/authSlice';
import toast from 'react-hot-toast';

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'client' });
  const [showPass, setShowPass] = useState(false);
  const { loading, error } = useSelector(s => s.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await dispatch(register(form));
    if (res.type.endsWith('fulfilled')) {
      toast.success('Account created! Please verify your email.');
      navigate('/verify-email');
    } else if (res.type.endsWith('rejected')) {
      toast.error(res.payload || 'Registration failed');
    }
  };

  const passwordStrength = (p) => {
    if (!p) return { score: 0, label: '', color: '' };
    let score = 0;
    if (p.length >= 8) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    const map = [
      { label: 'Too short', color: '#EF4444' },
      { label: 'Weak', color: '#F97316' },
      { label: 'Fair', color: '#EAB308' },
      { label: 'Good', color: '#22D3EE' },
      { label: 'Strong', color: '#22C55E' },
    ];
    return { score, ...map[score] };
  };

  const strength = passwordStrength(form.password);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '32px 24px',
      background: '#0B0F1A',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', top: '-5%', left: '50%', transform: 'translateX(-50%)',
        width: 700, height: 350,
        background: 'radial-gradient(ellipse, rgba(99,102,241,0.1) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{ width: '100%', maxWidth: 440, position: 'relative', zIndex: 1 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <Link to="/" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 12,
              background: 'linear-gradient(135deg, #6366F1, #22D3EE)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
              boxShadow: '0 6px 18px rgba(99,102,241,0.4)',
            }}>⚡</div>
            <span style={{
              fontFamily: 'Syne, Plus Jakarta Sans, sans-serif', fontWeight: 800, fontSize: 20,
              background: 'linear-gradient(135deg, #818CF8, #22D3EE)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>SkillSphere</span>
          </Link>
          <h2 style={{ color: '#F1F5F9', fontWeight: 700, fontSize: 22, marginBottom: 4 }}>Create your account</h2>
          <p style={{ color: '#64748B', fontSize: 14 }}>Join thousands of freelancers and clients</p>
        </div>

        {/* Card */}
        <div style={{
          background: 'linear-gradient(145deg, #151e2e, #111827)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 20, padding: 32,
          boxShadow: '0 4px 40px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.05) inset',
        }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Role selector */}
            <div>
              <label className="form-label">I want to</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {[
                  { value: 'client', icon: '💼', title: 'Hire talent', sub: 'Post jobs & hire' },
                  { value: 'freelancer', icon: '🚀', title: 'Find work', sub: 'Offer your skills' },
                ].map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setForm({ ...form, role: opt.value })}
                    style={{
                      padding: '14px 12px',
                      background: form.role === opt.value
                        ? 'rgba(99,102,241,0.15)'
                        : 'rgba(255,255,255,0.03)',
                      border: `1.5px solid ${form.role === opt.value ? 'rgba(99,102,241,0.5)' : 'rgba(255,255,255,0.08)'}`,
                      borderRadius: 12, cursor: 'pointer',
                      transition: 'all 0.2s', textAlign: 'center',
                    }}
                  >
                    <div style={{ fontSize: 22, marginBottom: 4 }}>{opt.icon}</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: form.role === opt.value ? '#818CF8' : '#94A3B8' }}>{opt.title}</div>
                    <div style={{ fontSize: 11, color: '#475569', marginTop: 2 }}>{opt.sub}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="form-label">Full name</label>
              <input
                type="text"
                className="input-field"
                placeholder="John Doe"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className="form-label">Email address</label>
              <input
                type="email"
                className="input-field"
                placeholder="you@example.com"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPass ? 'text' : 'password'}
                  className="input-field"
                  placeholder="Min. 8 characters"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  required
                  style={{ paddingRight: 44 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  style={{
                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', color: '#475569', fontSize: 16,
                  }}
                >{showPass ? '🙈' : '👁️'}</button>
              </div>

              {/* Password strength bar */}
              {form.password.length > 0 && (
                <div style={{ marginTop: 8 }}>
                  <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                    {[1,2,3,4].map(i => (
                      <div key={i} style={{
                        flex: 1, height: 3, borderRadius: 2,
                        background: i <= strength.score ? strength.color : 'rgba(255,255,255,0.08)',
                        transition: 'background 0.3s',
                      }} />
                    ))}
                  </div>
                  <span style={{ fontSize: 11, color: strength.color }}>{strength.label}</span>
                </div>
              )}
            </div>

            {/* Error */}
            {error && (
              <div style={{
                background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)',
                borderRadius: 10, padding: '10px 14px', color: '#F87171', fontSize: 13,
              }}>
                ⚠️ {error}
              </div>
            )}

            {/* Google OAuth */}
            <a
              href="http://localhost:5000/api/auth/google"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                padding: '11px 16px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 12, color: '#E2E8F0',
                textDecoration: 'none', fontSize: 14, fontWeight: 600,
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Sign up with Google
            </a>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
              <span style={{ fontSize: 12, color: '#475569' }}>or</span>
              <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
            </div>

            <button type="submit" className="btn-primary" disabled={loading} style={{ padding: 13, fontSize: 15, borderRadius: 12 }}>
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
                  Creating account...
                </span>
              ) : 'Create Account →'}
            </button>

            <p style={{ fontSize: 12, color: '#475569', textAlign: 'center', lineHeight: 1.7 }}>
              By signing up, you agree to our{' '}
              <Link to="/terms" style={{ color: '#6366F1', textDecoration: 'none' }}>Terms of Service</Link>
              {' '}and{' '}
              <Link to="/privacy" style={{ color: '#6366F1', textDecoration: 'none' }}>Privacy Policy</Link>
            </p>
          </form>

          <p style={{ textAlign: 'center', marginTop: 20, color: '#475569', fontSize: 14 }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#818CF8', textDecoration: 'none', fontWeight: 600 }}>Sign in →</Link>
          </p>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default Register;
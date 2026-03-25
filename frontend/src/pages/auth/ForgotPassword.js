import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPassword } from '../../utils/api';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await forgotPassword(email);
      setSent(true);
    } catch { toast.error('Email not found'); } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        <div className="glass-card" style={{ padding: 32 }}>
          {!sent ? (
            <>
              <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 6 }}>Forgot Password?</h2>
              <p style={{ color: '#666', fontSize: 14, marginBottom: 20 }}>Enter your email to receive a reset link.</p>
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <input type="email" className="input-field" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
                <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', padding: 12 }}>{loading ? 'Sending...' : 'Send Reset Link'}</button>
              </form>
            </>
          ) : (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>📧</div>
              <h3 style={{ marginBottom: 8 }}>Check your inbox</h3>
              <p style={{ color: '#888', fontSize: 14 }}>Reset link sent to <strong style={{ color: '#e2e2f0' }}>{email}</strong></p>
            </div>
          )}
          <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: '#555' }}>
            <Link to="/login" style={{ color: '#00d4ff', textDecoration: 'none' }}>← Back to Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;

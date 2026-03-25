import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { resetPassword } from '../../utils/api';
import toast from 'react-hot-toast';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) { toast.error('Passwords do not match'); return; }
    if (password.length < 6) { toast.error('Minimum 6 characters'); return; }
    setLoading(true);
    try {
      await resetPassword(token, password);
      toast.success('Password reset! Please login.');
      navigate('/login');
    } catch { toast.error('Link expired or invalid'); } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div className="glass-card" style={{ padding: 32, maxWidth: 400, width: '100%' }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 20 }}>Set New Password</h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="form-group">
            <label className="form-label">New Password</label>
            <input type="password" className="input-field" placeholder="At least 6 characters" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <input type="password" className="input-field" placeholder="Repeat your password" value={confirm} onChange={e => setConfirm(e.target.value)} required />
          </div>
          <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', padding: 12 }}>{loading ? 'Resetting...' : 'Reset Password'}</button>
        </form>
        <p style={{ marginTop: 16, textAlign: 'center', fontSize: 13, color: '#555' }}><Link to="/login" style={{ color: '#00d4ff', textDecoration: 'none' }}>← Back to Login</Link></p>
      </div>
    </div>
  );
};

export default ResetPassword;

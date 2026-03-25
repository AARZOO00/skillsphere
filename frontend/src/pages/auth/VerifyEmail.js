import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { verifyEmailAPI } from '../../utils/api';

const VerifyEmail = () => {
  const { token } = useParams();
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    verifyEmailAPI(token).then(() => setStatus('success')).catch(() => setStatus('error'));
  }, [token]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div className="glass-card" style={{ padding: 48, maxWidth: 420, width: '100%', textAlign: 'center' }}>
        {status === 'loading' && (<><div className="spinner" style={{ margin: '0 auto 16px' }} /><p style={{ color: '#888' }}>Verifying your email...</p></>)}
        {status === 'success' && (
          <><div style={{ fontSize: 52, marginBottom: 16 }}>✅</div>
          <h2 style={{ marginBottom: 8 }}>Email Verified!</h2>
          <p style={{ color: '#888', marginBottom: 24 }}>Your account is now active and ready to use.</p>
          <Link to="/dashboard" className="btn-primary">Go to Dashboard</Link></>
        )}
        {status === 'error' && (
          <><div style={{ fontSize: 52, marginBottom: 16 }}>❌</div>
          <h2 style={{ marginBottom: 8 }}>Verification Failed</h2>
          <p style={{ color: '#888', marginBottom: 24 }}>This link may be expired or already used.</p>
          <Link to="/login" className="btn-outline">Back to Login</Link></>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;

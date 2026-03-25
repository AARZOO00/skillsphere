import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { changePassword, updateProfile, setup2FA, enable2FA, disable2FA } from '../utils/api';
import toast from 'react-hot-toast';

const Settings = () => {
  const { user } = useSelector(s => s.auth);
  const [tab, setTab] = useState('profile');
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [qrCode, setQrCode] = useState(null);
  const [tfaCode, setTfaCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirm) { toast.error('Passwords do not match'); return; }
    setLoading(true);
    try { await changePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword }); toast.success('Password changed!'); setPwForm({ currentPassword: '', newPassword: '', confirm: '' }); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed'); } finally { setLoading(false); }
  };

  const handleSetup2FA = async () => {
    try { const { data } = await setup2FA(); setQrCode(data.qrCode); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleEnable2FA = async () => {
    try { await enable2FA(tfaCode); toast.success('2FA enabled!'); setQrCode(null); setTfaCode(''); }
    catch (err) { toast.error(err.response?.data?.message || 'Invalid code'); }
  };

  const handleDisable2FA = async () => {
    if (!window.confirm('Disable 2FA?')) return;
    try { await disable2FA(); toast.success('2FA disabled'); }
    catch (err) { toast.error('Failed'); }
  };

  const tabs = ['profile', 'security', '2fa'];

  return (
    <div style={{ paddingTop: 80, minHeight: '100vh', maxWidth: 760, margin: '0 auto', padding: '80px 24px 48px' }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>Settings</h1>

      <div style={{ display: 'flex', gap: 4, marginBottom: 24, borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: 0 }}>
        {tabs.map(t => (
          <button key={t} onClick={() => setTab(t)}
            style={{ padding: '10px 20px', background: 'none', border: 'none', borderBottom: tab === t ? '2px solid #00d4ff' : '2px solid transparent', color: tab === t ? '#00d4ff' : '#888', cursor: 'pointer', fontSize: 14, fontWeight: tab === t ? 600 : 400, textTransform: 'capitalize', marginBottom: -1, fontFamily: 'inherit', transition: 'all 0.2s' }}>
            {t === '2fa' ? 'Two-Factor Auth' : t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {tab === 'profile' && (
        <div className="glass-card" style={{ padding: 28 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20 }}>Profile Information</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20, padding: 16, background: 'rgba(255,255,255,0.03)', borderRadius: 12 }}>
            <img src={user?.avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user?.name || 'U') + '&background=00d4ff&color=000&size=80'} alt="" style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover' }} />
            <div>
              <p style={{ fontWeight: 600, fontSize: 16 }}>{user?.name}</p>
              <p style={{ color: '#888', fontSize: 14 }}>{user?.email}</p>
              <span className={'badge badge-' + (user?.role === 'admin' ? 'red' : user?.role === 'freelancer' ? 'cyan' : 'purple')} style={{ marginTop: 6 }}>{user?.role}</span>
            </div>
          </div>
          <p style={{ color: '#666', fontSize: 13 }}>To update your profile information, go to <a href="/freelancers/me" style={{ color: '#00d4ff' }}>My Profile</a>.</p>
        </div>
      )}

      {tab === 'security' && (
        <div className="glass-card" style={{ padding: 28 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20 }}>Change Password</h3>
          <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="form-group">
              <label className="form-label">Current Password</label>
              <input type="password" className="input-field" value={pwForm.currentPassword} onChange={e => setPwForm({ ...pwForm, currentPassword: e.target.value })} required />
            </div>
            <div className="form-group">
              <label className="form-label">New Password</label>
              <input type="password" className="input-field" placeholder="At least 6 characters" value={pwForm.newPassword} onChange={e => setPwForm({ ...pwForm, newPassword: e.target.value })} required minLength={6} />
            </div>
            <div className="form-group">
              <label className="form-label">Confirm New Password</label>
              <input type="password" className="input-field" value={pwForm.confirm} onChange={e => setPwForm({ ...pwForm, confirm: e.target.value })} required />
            </div>
            <button type="submit" className="btn-primary" disabled={loading} style={{ width: 'fit-content', padding: '10px 24px' }}>{loading ? 'Changing...' : 'Change Password'}</button>
          </form>
        </div>
      )}

      {tab === '2fa' && (
        <div className="glass-card" style={{ padding: 28 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>Two-Factor Authentication</h3>
          <p style={{ color: '#888', fontSize: 14, marginBottom: 20 }}>Add an extra layer of security to your account.</p>
          {user?.twoFactorEnabled ? (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px', background: 'rgba(74,222,128,0.06)', border: '1px solid rgba(74,222,128,0.15)', borderRadius: 10, marginBottom: 16 }}>
                <span style={{ fontSize: 20 }}>🔒</span>
                <div>
                  <p style={{ fontWeight: 600, color: '#4ade80', fontSize: 14 }}>2FA is enabled</p>
                  <p style={{ color: '#666', fontSize: 12 }}>Your account is protected with two-factor authentication.</p>
                </div>
              </div>
              <button onClick={handleDisable2FA} className="btn-danger">Disable 2FA</button>
            </div>
          ) : !qrCode ? (
            <button onClick={handleSetup2FA} className="btn-primary" style={{ padding: '10px 24px' }}>Enable 2FA</button>
          ) : (
            <div>
              <p style={{ color: '#aaa', fontSize: 14, marginBottom: 16 }}>Scan this QR code with Google Authenticator or Authy:</p>
              <img src={qrCode} alt="2FA QR" style={{ width: 180, height: 180, borderRadius: 12, marginBottom: 20 }} />
              <div className="form-group" style={{ maxWidth: 260 }}>
                <label className="form-label">Enter the 6-digit code to confirm</label>
                <input className="input-field" placeholder="000000" value={tfaCode} onChange={e => setTfaCode(e.target.value)} maxLength={6} style={{ letterSpacing: 8, textAlign: 'center', fontSize: 20, fontFamily: 'monospace' }} />
              </div>
              <button onClick={handleEnable2FA} className="btn-primary" style={{ marginTop: 14, padding: '10px 24px' }}>Confirm & Enable</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Settings;

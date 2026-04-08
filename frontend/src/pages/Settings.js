import React, { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';

const TABS = [
  { id:'profile',   label:'Profile',          icon:'👤' },
  { id:'account',   label:'Account',          icon:'⚙️' },
  { id:'security',  label:'Security',         icon:'🔒' },
  { id:'2fa',       label:'Two-Factor Auth',  icon:'📱' },
  { id:'notif',     label:'Notifications',    icon:'🔔' },
  { id:'privacy',   label:'Privacy',          icon:'🛡️' },
];

const Settings = () => {
  const { user }   = useSelector(s => s.auth || {});
  const dispatch   = useDispatch();
  const fileRef    = useRef(null);

  const [tab,      setTab]      = useState('profile');
  const [saving,   setSaving]   = useState(false);
  const [pwShow,   setPwShow]   = useState({ cur:false, new:false, conf:false });

  // Profile form state
  const [profile, setProfile] = useState({
    name:         user?.name         || '',
    email:        user?.email        || '',
    title:        user?.title        || '',
    bio:          user?.bio          || '',
    location:     user?.location     || '',
    hourlyRate:   user?.hourlyRate   || '',
    responseTime: user?.responseTime || '< 1 hour',
    skills:       Array.isArray(user?.skills) ? user.skills.join(', ') : '',
    website:      user?.website      || '',
    linkedin:     user?.linkedin     || '',
    github:       user?.github       || '',
  });

  // Password form state
  const [passwords, setPasswords] = useState({ current:'', newPass:'', confirm:'' });

  // Notification preferences
  const [notifPrefs, setNotifPrefs] = useState({
    emailNewBid:      user?.notifPrefs?.emailNewBid      ?? true,
    emailMessages:    user?.notifPrefs?.emailMessages    ?? true,
    emailPayments:    user?.notifPrefs?.emailPayments    ?? true,
    emailNewsletter:  user?.notifPrefs?.emailNewsletter  ?? false,
    pushBid:          user?.notifPrefs?.pushBid          ?? true,
    pushMessages:     user?.notifPrefs?.pushMessages     ?? true,
    pushPayments:     user?.notifPrefs?.pushPayments     ?? true,
  });

  // 2FA state
  const [twoFAEnabled, setTwoFAEnabled] = useState(user?.twoFAEnabled || false);
  const [qrCode,       setQrCode]       = useState(null);
  const [twoFAToken,   setTwoFAToken]   = useState('');

  // ── Handlers ────────────────────────────────────────────────
  // Safe profile load on mount
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await api.get('/users/profile');
        const u = res.data?.user || res.data;
        if (u) {
          setProfile({
            name:         u.name         || user?.name  || '',
            email:        u.email        || user?.email || '',
            title:        u.title        || '',
            bio:          u.bio          || '',
            location:     typeof u.location === 'object' ? (u.location?.city || '') : (u.location || ''),
            hourlyRate:   u.hourlyRate   || '',
            responseTime: u.responseTime || '< 1 hour',
            skills:       Array.isArray(u.skills) ? u.skills.join(', ') : '',
            website:      u.website      || '',
            linkedin:     u.linkedin     || '',
            github:       u.github       || '',
          });
        }
      } catch { /* use defaults from auth state */ }
    };
    if (user) loadProfile();
  }, [user]);

  const saveProfile = async () => {
    setSaving(true);
    try {
      const skillsArr = profile.skills.split(',').map(s=>s.trim()).filter(Boolean);
      await api.put('/users/profile', { ...profile, skills: skillsArr });
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update profile');
    } finally { setSaving(false); }
  };

  const changePassword = async () => {
    if (!passwords.current) { toast.error('Enter current password'); return; }
    if (passwords.newPass.length < 6) { toast.error('New password must be at least 6 chars'); return; }
    if (passwords.newPass !== passwords.confirm) { toast.error('Passwords do not match'); return; }
    setSaving(true);
    try {
      await api.put('/auth/change-password', { currentPassword: passwords.current, newPassword: passwords.newPass });
      toast.success('Password changed successfully!');
      setPasswords({ current:'', newPass:'', confirm:'' });
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to change password');
    } finally { setSaving(false); }
  };

  const setup2FA = async () => {
    try {
      const res = await api.post('/auth/2fa/setup');
      setQrCode(res.data?.qrCode || res.data?.secret);
      toast('Scan the QR code with your authenticator app', { icon:'📱' });
    } catch { toast.error('Could not setup 2FA'); }
  };

  const verify2FA = async () => {
    if (!twoFAToken || twoFAToken.length !== 6) { toast.error('Enter 6-digit code'); return; }
    try {
      await api.post('/auth/2fa/verify', { token: twoFAToken });
      setTwoFAEnabled(true);
      setQrCode(null);
      toast.success('Two-factor authentication enabled!');
    } catch { toast.error('Invalid code. Try again.'); }
  };

  const saveNotifPrefs = async () => {
    setSaving(true);
    try {
      await api.put('/users/notification-preferences', notifPrefs);
      toast.success('Notification preferences saved!');
    } catch { toast.error('Failed to save preferences'); }
    finally { setSaving(false); }
  };

  const deleteAccount = () => {
    const confirmed = window.confirm('Are you absolutely sure? This cannot be undone.');
    if (!confirmed) return;
    toast('Account deletion requested. Our team will process it within 24 hours.', { icon:'⚠️', duration:5000 });
  };

  // ── Styles ───────────────────────────────────────────────────
  const card  = { background:'#fff', border:'1px solid #e5e7eb', borderRadius:16, padding:'24px', boxShadow:'0 2px 8px rgba(0,0,0,0.04)' };
  const label = { display:'block', fontSize:13, fontWeight:600, color:'#374151', marginBottom:6 };
  const input = { width:'100%', padding:'10px 14px', background:'#f8fafc', border:'1px solid #e5e7eb', borderRadius:10, color:'#111827', fontSize:14, fontFamily:'inherit', outline:'none', boxSizing:'border-box', transition:'border-color 0.2s' };
  const focusInput = (e) => e.target.style.borderColor='#4f46e5';
  const blurInput  = (e) => e.target.style.borderColor='#e5e7eb';

  const Toggle = ({ checked, onChange, label:lbl }) => (
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'14px 0', borderBottom:'1px solid #f9fafb' }}>
      <span style={{ fontSize:14, color:'#374151', fontWeight:500 }}>{lbl}</span>
      <div onClick={()=>onChange(!checked)} style={{ width:46, height:24, borderRadius:999, background:checked?'#4f46e5':'#e5e7eb', cursor:'pointer', position:'relative', transition:'background 0.3s' }}>
        <div style={{ position:'absolute', top:2, left:checked?24:2, width:20, height:20, borderRadius:'50%', background:'#fff', transition:'left 0.3s', boxShadow:'0 1px 4px rgba(0,0,0,0.15)' }} />
      </div>
    </div>
  );

  return (
    <div style={{ minHeight:'100vh', background:'#f8fafc', fontFamily:"'Plus Jakarta Sans',sans-serif" }}>

      {/* ── HEADER ── */}
      <div style={{ background:'linear-gradient(135deg,#1e1b4b,#312e81,#1e40af)', padding:'32px 52px 72px', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', inset:0, backgroundImage:'radial-gradient(circle at 80% 50%, rgba(99,102,241,0.15) 0%, transparent 50%)', pointerEvents:'none' }} />
        <div style={{ maxWidth:1100, margin:'0 auto', position:'relative', zIndex:1 }}>
          <p style={{ color:'#a5b4fc', fontSize:13, marginBottom:8 }}>Account</p>
          <h1 style={{ fontSize:28, fontWeight:900, color:'#fff', fontFamily:'Syne, sans-serif', marginBottom:4 }}>Settings</h1>
          <p style={{ color:'#a5b4fc', fontSize:14 }}>Manage your account, security, and preferences</p>
        </div>
      </div>

      <div style={{ maxWidth:1100, margin:'-40px auto 0', padding:'0 52px 60px', position:'relative', zIndex:2 }}>
        <div style={{ display:'grid', gridTemplateColumns:'220px 1fr', gap:20 }}>

          {/* ── SIDEBAR NAV ── */}
          <div style={{ height:'fit-content', position:'sticky', top:80 }}>
            {/* Profile summary */}
            <div style={{ ...card, padding:'20px', marginBottom:14, textAlign:'center' }}>
              <div style={{ width:60, height:60, borderRadius:16, background:'linear-gradient(135deg,#6366F1,#22D3EE)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, fontWeight:900, color:'#fff', margin:'0 auto 10px', boxShadow:'0 4px 14px rgba(99,102,241,0.3)' }}>
                {user?.name?.[0]?.toUpperCase()||'U'}
              </div>
              <div style={{ fontSize:14, fontWeight:700, color:'#111827', marginBottom:2 }}>{user?.name||'User'}</div>
              <div style={{ fontSize:12, color:'#9ca3af', marginBottom:8 }}>{user?.email}</div>
              <span style={{ fontSize:11, fontWeight:700, padding:'3px 10px', borderRadius:999, background:'#ede9fe', color:'#7c3aed', textTransform:'capitalize' }}>{user?.role}</span>
            </div>

            {/* Nav links */}
            <div style={{ ...card, padding:'8px' }}>
              {TABS.map(t => (
                <button key={t.id} onClick={()=>setTab(t.id)} style={{
                  width:'100%', display:'flex', alignItems:'center', gap:10,
                  padding:'11px 14px', borderRadius:10, border:'none', cursor:'pointer', fontFamily:'inherit',
                  background: tab===t.id ? '#f5f3ff' : 'transparent',
                  color:      tab===t.id ? '#4f46e5' : '#374151',
                  fontSize:13, fontWeight: tab===t.id ? 700 : 500,
                  transition:'all 0.15s', marginBottom:2, textAlign:'left',
                  borderLeft: tab===t.id ? '3px solid #4f46e5' : '3px solid transparent',
                }}>
                  <span style={{ fontSize:15 }}>{t.icon}</span>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* ── MAIN CONTENT ── */}
          <div style={{ display:'flex', flexDirection:'column', gap:20 }}>

            {/* ══ PROFILE TAB ══ */}
            {tab === 'profile' && (
              <>
                <div style={card}>
                  <h2 style={{ fontSize:16, fontWeight:800, color:'#111827', marginBottom:20 }}>Profile Information</h2>

                  {/* Avatar section */}
                  <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:24, padding:'18px', background:'#f8fafc', borderRadius:12, border:'1px solid #e5e7eb' }}>
                    <div style={{ width:64, height:64, borderRadius:16, background:'linear-gradient(135deg,#6366F1,#22D3EE)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:26, fontWeight:900, color:'#fff', boxShadow:'0 4px 14px rgba(99,102,241,0.3)', flexShrink:0 }}>
                      {user?.name?.[0]?.toUpperCase()||'U'}
                    </div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:15, fontWeight:700, color:'#111827', marginBottom:2 }}>{user?.name}</div>
                      <div style={{ fontSize:12, color:'#9ca3af', marginBottom:10 }}>JPG, PNG or GIF. Max size 5MB</div>
                      <div style={{ display:'flex', gap:8 }}>
                        <button onClick={()=>fileRef.current?.click()} style={{ padding:'7px 16px', borderRadius:9, background:'#4f46e5', border:'none', color:'#fff', fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>Upload Photo</button>
                        <button style={{ padding:'7px 16px', borderRadius:9, background:'#fff', border:'1px solid #e5e7eb', color:'#374151', fontSize:12, fontWeight:500, cursor:'pointer', fontFamily:'inherit' }}>Remove</button>
                      </div>
                      <input ref={fileRef} type="file" accept="image/*" style={{ display:'none' }} onChange={e=>{ if(e.target.files[0]) toast.success('Photo updated!'); }} />
                    </div>
                  </div>

                  {/* Form grid */}
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
                    <div>
                      <label style={label}>Full Name *</label>
                      <input style={input} value={profile.name} onChange={e=>setProfile({...profile,name:e.target.value})} onFocus={focusInput} onBlur={blurInput} placeholder="Your full name" />
                    </div>
                    <div>
                      <label style={label}>Email Address</label>
                      <input style={{ ...input, background:'#f1f5f9', color:'#9ca3af' }} value={profile.email} disabled placeholder="Email (change in Account tab)" />
                    </div>
                    <div style={{ gridColumn:'1/-1' }}>
                      <label style={label}>Professional Title</label>
                      <input style={input} value={profile.title} onChange={e=>setProfile({...profile,title:e.target.value})} onFocus={focusInput} onBlur={blurInput} placeholder="e.g. Full Stack Developer & UI Designer" />
                    </div>
                    <div style={{ gridColumn:'1/-1' }}>
                      <label style={label}>Bio</label>
                      <textarea style={{ ...input, minHeight:100, resize:'vertical', lineHeight:1.7 }} value={profile.bio} onChange={e=>setProfile({...profile,bio:e.target.value})} onFocus={focusInput} onBlur={blurInput} placeholder="Tell clients about your expertise, experience and what makes you unique..." />
                    </div>
                    <div>
                      <label style={label}>Location</label>
                      <input style={input} value={profile.location} onChange={e=>setProfile({...profile,location:e.target.value})} onFocus={focusInput} onBlur={blurInput} placeholder="e.g. Mumbai, India" />
                    </div>
                    {user?.role === 'freelancer' && (
                      <div>
                        <label style={label}>Hourly Rate (₹)</label>
                        <input type="number" style={input} value={profile.hourlyRate} onChange={e=>setProfile({...profile,hourlyRate:e.target.value})} onFocus={focusInput} onBlur={blurInput} placeholder="e.g. 1500" />
                      </div>
                    )}
                    {user?.role === 'freelancer' && (
                      <div style={{ gridColumn:'1/-1' }}>
                        <label style={label}>Skills <span style={{ color:'#9ca3af', fontWeight:400 }}>(comma separated)</span></label>
                        <input style={input} value={profile.skills} onChange={e=>setProfile({...profile,skills:e.target.value})} onFocus={focusInput} onBlur={blurInput} placeholder="React.js, Node.js, MongoDB, TypeScript..." />
                      </div>
                    )}
                  </div>
                </div>

                {/* Social links */}
                <div style={card}>
                  <h2 style={{ fontSize:15, fontWeight:700, color:'#111827', marginBottom:18 }}>Social & Portfolio Links</h2>
                  <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                    {[
                      { key:'website',  icon:'🌐', label:'Website / Portfolio', placeholder:'https://yourwebsite.com' },
                      { key:'linkedin', icon:'💼', label:'LinkedIn',            placeholder:'https://linkedin.com/in/yourprofile' },
                      { key:'github',   icon:'💻', label:'GitHub',              placeholder:'https://github.com/yourusername' },
                    ].map(({key,icon,label:lbl,placeholder}) => (
                      <div key={key}>
                        <label style={label}>{icon} {lbl}</label>
                        <input style={input} value={profile[key]} onChange={e=>setProfile({...profile,[key]:e.target.value})} onFocus={focusInput} onBlur={blurInput} placeholder={placeholder} />
                      </div>
                    ))}
                  </div>
                </div>

                <button onClick={saveProfile} disabled={saving} style={{ alignSelf:'flex-start', padding:'12px 32px', borderRadius:12, background:'#4f46e5', border:'none', color:'#fff', fontSize:14, fontWeight:700, cursor:saving?'not-allowed':'pointer', fontFamily:'inherit', boxShadow:'0 4px 12px rgba(79,70,229,0.3)', opacity:saving?0.7:1 }}>
                  {saving ? 'Saving…' : '💾 Save Changes'}
                </button>
              </>
            )}

            {/* ══ ACCOUNT TAB ══ */}
            {tab === 'account' && (
              <div style={card}>
                <h2 style={{ fontSize:16, fontWeight:800, color:'#111827', marginBottom:20 }}>Account Settings</h2>

                <div style={{ marginBottom:24 }}>
                  <label style={label}>Email Address</label>
                  <input style={{ ...input, background:'#f1f5f9', color:'#6b7280' }} value={user?.email||''} disabled />
                  <p style={{ fontSize:12, color:'#9ca3af', marginTop:5 }}>To change your email, contact support</p>
                </div>

                <div style={{ marginBottom:24 }}>
                  <label style={label}>Account Role</label>
                  <div style={{ padding:'11px 14px', background:'#f8fafc', border:'1px solid #e5e7eb', borderRadius:10, display:'flex', alignItems:'center', gap:8 }}>
                    <span style={{ fontSize:13, fontWeight:700, padding:'3px 10px', borderRadius:999, background:'#ede9fe', color:'#7c3aed', textTransform:'capitalize' }}>{user?.role}</span>
                    <span style={{ fontSize:13, color:'#9ca3af' }}>Role cannot be changed</span>
                  </div>
                </div>

                <div style={{ padding:20, background:'#fef2f2', border:'1px solid #fecaca', borderRadius:12 }}>
                  <h3 style={{ fontSize:14, fontWeight:700, color:'#991b1b', marginBottom:6 }}>⚠️ Danger Zone</h3>
                  <p style={{ fontSize:13, color:'#7f1d1d', marginBottom:14, lineHeight:1.6 }}>
                    Deleting your account is permanent and cannot be reversed. All your data, gigs, and history will be erased.
                  </p>
                  <button onClick={deleteAccount} style={{ padding:'9px 20px', borderRadius:10, background:'#dc2626', border:'none', color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>
                    Delete My Account
                  </button>
                </div>
              </div>
            )}

            {/* ══ SECURITY TAB ══ */}
            {tab === 'security' && (
              <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
                <div style={card}>
                  <h2 style={{ fontSize:16, fontWeight:800, color:'#111827', marginBottom:20 }}>Change Password</h2>
                  <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
                    {[
                      { key:'current', label:'Current Password',  placeholder:'Enter current password' },
                      { key:'newPass', label:'New Password',      placeholder:'Min. 8 characters' },
                      { key:'confirm', label:'Confirm Password',  placeholder:'Re-enter new password' },
                    ].map(({key,label:lbl,placeholder}) => (
                      <div key={key} style={{ position:'relative' }}>
                        <label style={label}>{lbl}</label>
                        <input
                          type={pwShow[key]?'text':'password'}
                          style={{ ...input, paddingRight:42 }}
                          value={passwords[key]}
                          onChange={e=>setPasswords({...passwords,[key]:e.target.value})}
                          onFocus={focusInput} onBlur={blurInput}
                          placeholder={placeholder}
                        />
                        <button type="button" onClick={()=>setPwShow({...pwShow,[key]:!pwShow[key]})} style={{ position:'absolute', right:12, top:36, background:'none', border:'none', cursor:'pointer', color:'#9ca3af', fontSize:15 }}>
                          {pwShow[key]?'🙈':'👁️'}
                        </button>
                      </div>
                    ))}

                    {/* Password strength */}
                    {passwords.newPass.length > 0 && (() => {
                      let s = 0;
                      if (passwords.newPass.length>=8) s++;
                      if (/[A-Z]/.test(passwords.newPass)) s++;
                      if (/[0-9]/.test(passwords.newPass)) s++;
                      if (/[^A-Za-z0-9]/.test(passwords.newPass)) s++;
                      const colors = ['#ef4444','#f97316','#eab308','#22D3EE','#22c55e'];
                      const labels = ['Too short','Weak','Fair','Good','Strong'];
                      return (
                        <div>
                          <div style={{ display:'flex', gap:4, marginBottom:4 }}>
                            {[1,2,3,4].map(i=><div key={i} style={{ flex:1, height:4, borderRadius:2, background:i<=s?colors[s]:'#e5e7eb', transition:'background 0.3s' }} />)}
                          </div>
                          <span style={{ fontSize:11, color:colors[s], fontWeight:600 }}>{labels[s]}</span>
                        </div>
                      );
                    })()}

                    <button onClick={changePassword} disabled={saving} style={{ alignSelf:'flex-start', padding:'11px 28px', borderRadius:12, background:'#4f46e5', border:'none', color:'#fff', fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:'inherit', boxShadow:'0 4px 12px rgba(79,70,229,0.3)' }}>
                      {saving?'Updating…':'🔑 Update Password'}
                    </button>
                  </div>
                </div>

                {/* Active sessions */}
                <div style={card}>
                  <h2 style={{ fontSize:15, fontWeight:700, color:'#111827', marginBottom:16 }}>Active Sessions</h2>
                  {[
                    { device:'Chrome on Windows', location:'Hyderabad, India', time:'Current session', current:true },
                    { device:'Mobile App (Android)', location:'Hyderabad, India', time:'2 hours ago', current:false },
                  ].map((session,i)=>(
                    <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'14px 0', borderBottom:'1px solid #f9fafb' }}>
                      <div style={{ display:'flex', gap:12, alignItems:'center' }}>
                        <div style={{ width:38, height:38, borderRadius:10, background:'#f1f5f9', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>
                          {session.device.includes('Mobile')?'📱':'💻'}
                        </div>
                        <div>
                          <div style={{ fontSize:13, fontWeight:600, color:'#374151' }}>{session.device}</div>
                          <div style={{ fontSize:12, color:'#9ca3af' }}>{session.location} · {session.time}</div>
                        </div>
                      </div>
                      {session.current
                        ? <span style={{ fontSize:11, fontWeight:700, padding:'3px 10px', borderRadius:999, background:'#dcfce7', color:'#16a34a' }}>Current</span>
                        : <button onClick={()=>toast.success('Session revoked')} style={{ fontSize:12, fontWeight:600, color:'#dc2626', background:'none', border:'none', cursor:'pointer', fontFamily:'inherit' }}>Revoke</button>
                      }
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ══ 2FA TAB ══ */}
            {tab === '2fa' && (
              <div style={card}>
                <h2 style={{ fontSize:16, fontWeight:800, color:'#111827', marginBottom:6 }}>Two-Factor Authentication</h2>
                <p style={{ fontSize:13, color:'#6b7280', marginBottom:24, lineHeight:1.6 }}>
                  Add an extra layer of security to your account. When enabled, you'll need to enter a 6-digit code from your authenticator app every time you sign in.
                </p>

                {twoFAEnabled ? (
                  <div style={{ padding:20, background:'#dcfce7', border:'1px solid #bbf7d0', borderRadius:12, display:'flex', gap:14, alignItems:'center', marginBottom:20 }}>
                    <div style={{ fontSize:28 }}>🛡️</div>
                    <div>
                      <div style={{ fontSize:14, fontWeight:700, color:'#15803d' }}>Two-factor authentication is enabled</div>
                      <div style={{ fontSize:12, color:'#16a34a', marginTop:2 }}>Your account is protected with an additional layer of security</div>
                    </div>
                  </div>
                ) : (
                  <div style={{ padding:20, background:'#fef3c7', border:'1px solid #fde68a', borderRadius:12, marginBottom:20 }}>
                    <div style={{ fontSize:14, fontWeight:700, color:'#92400e', marginBottom:4 }}>⚠️ 2FA is not enabled</div>
                    <div style={{ fontSize:13, color:'#78350f' }}>Your account is less secure without two-factor authentication</div>
                  </div>
                )}

                {!twoFAEnabled && !qrCode && (
                  <button onClick={setup2FA} style={{ padding:'12px 28px', borderRadius:12, background:'#4f46e5', border:'none', color:'#fff', fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:'inherit', boxShadow:'0 4px 12px rgba(79,70,229,0.3)' }}>
                    📱 Setup Two-Factor Auth
                  </button>
                )}

                {qrCode && (
                  <div style={{ marginTop:20 }}>
                    <h3 style={{ fontSize:14, fontWeight:700, color:'#111827', marginBottom:12 }}>Step 1: Scan QR Code</h3>
                    <div style={{ padding:20, background:'#f8fafc', border:'1px solid #e5e7eb', borderRadius:12, display:'inline-block', marginBottom:20 }}>
                      {/* QR code placeholder */}
                      <div style={{ width:160, height:160, background:'#111827', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize:12, textAlign:'center', padding:12 }}>
                        {qrCode.includes('data:') ? <img src={qrCode} alt="QR" style={{ width:'100%' }} /> : <span>QR Code: {qrCode}</span>}
                      </div>
                    </div>
                    <h3 style={{ fontSize:14, fontWeight:700, color:'#111827', marginBottom:10 }}>Step 2: Enter verification code</h3>
                    <div style={{ display:'flex', gap:10, alignItems:'center' }}>
                      <input
                        type="text"
                        maxLength={6}
                        value={twoFAToken}
                        onChange={e=>setTwoFAToken(e.target.value.replace(/\D/,''))}
                        placeholder="000000"
                        style={{ ...input, maxWidth:160, textAlign:'center', letterSpacing:8, fontSize:20, fontFamily:'monospace', padding:'12px' }}
                        onFocus={focusInput} onBlur={blurInput}
                      />
                      <button onClick={verify2FA} style={{ padding:'12px 24px', borderRadius:12, background:'#16a34a', border:'none', color:'#fff', fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>
                        Verify &amp; Enable
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ══ NOTIFICATIONS TAB ══ */}
            {tab === 'notif' && (
              <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
                {[
                  {
                    title:'📧 Email Notifications',
                    items: [
                      { key:'emailNewBid',     label:'New bid on my job posting' },
                      { key:'emailMessages',   label:'New direct messages' },
                      { key:'emailPayments',   label:'Payment confirmations' },
                      { key:'emailNewsletter', label:'Product updates & newsletter' },
                    ]
                  },
                  {
                    title:'🔔 Push Notifications',
                    items: [
                      { key:'pushBid',      label:'New bid received' },
                      { key:'pushMessages', label:'New messages' },
                      { key:'pushPayments', label:'Payment status updates' },
                    ]
                  }
                ].map(section=>(
                  <div key={section.title} style={card}>
                    <h2 style={{ fontSize:15, fontWeight:700, color:'#111827', marginBottom:16 }}>{section.title}</h2>
                    {section.items.map(item=>(
                      <Toggle key={item.key} checked={notifPrefs[item.key]} onChange={v=>setNotifPrefs({...notifPrefs,[item.key]:v})} label={item.label} />
                    ))}
                  </div>
                ))}
                <button onClick={saveNotifPrefs} disabled={saving} style={{ alignSelf:'flex-start', padding:'11px 28px', borderRadius:12, background:'#4f46e5', border:'none', color:'#fff', fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>
                  {saving?'Saving…':'💾 Save Preferences'}
                </button>
              </div>
            )}

            {/* ══ PRIVACY TAB ══ */}
            {tab === 'privacy' && (
              <div style={card}>
                <h2 style={{ fontSize:16, fontWeight:800, color:'#111827', marginBottom:6 }}>Privacy Settings</h2>
                <p style={{ fontSize:13, color:'#9ca3af', marginBottom:20 }}>Control what information is visible to others</p>
                {[
                  { label:'Show profile to public',         sub:'Anyone can view your profile',                      val:true },
                  { label:'Show email on profile',          sub:'Your email is visible to clients',                  val:false },
                  { label:'Show hourly rate publicly',      sub:'Rate is visible in search results',                 val:true },
                  { label:'Allow direct messages',          sub:'Anyone can send you a message',                     val:true },
                  { label:'Include in talent search',       sub:'Appear in Find Talent results',                     val:true },
                  { label:'Share analytics with clients',   sub:'Let clients see your project stats',                val:false },
                ].map((item,i)=>(
                  <Toggle key={i} checked={item.val} onChange={()=>toast('Privacy setting updated',{icon:'🛡️'})} label={<><div style={{ fontWeight:600 }}>{item.label}</div><div style={{ fontSize:12, color:'#9ca3af', marginTop:2 }}>{item.sub}</div></>} />
                ))}
                <div style={{ marginTop:20 }}>
                  <button style={{ padding:'10px 20px', borderRadius:10, background:'#f8fafc', border:'1px solid #e5e7eb', color:'#374151', fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}
                    onClick={()=>toast.success('Your data export is being prepared. You will receive an email shortly.')}>
                    📥 Download My Data
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        textarea::placeholder, input::placeholder { color: #9ca3af; }
      `}</style>
    </div>
  );
};

export default Settings;
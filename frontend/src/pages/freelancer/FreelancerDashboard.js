import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { getFreelancerAnalytics, updateAvailability, updateFreelancerProfile } from '../../utils/api';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, CartesianGrid } from 'recharts';
import toast from 'react-hot-toast';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const FreelancerDashboard = () => {
  const { user } = useSelector(state => state.auth);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [availStatus, setAvailStatus] = useState('available');
  const [editingProfile, setEditingProfile] = useState(false);
  const [skillInput, setSkillInput] = useState('');
  const [profile, setProfile] = useState({ title: '', bio: '', hourlyRate: '', skills: [] });

  useEffect(() => {
    getFreelancerAnalytics()
      .then(({ data }) => { setAnalytics(data.analytics); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleAvailability = async (status) => {
    try {
      await updateAvailability({ status });
      setAvailStatus(status);
      toast.success(`Status updated to ${status}`);
    } catch { toast.error('Failed to update'); }
  };

  const handleProfileSave = async () => {
    try {
      await updateFreelancerProfile(profile);
      toast.success('Profile updated!');
      setEditingProfile(false);
    } catch { toast.error('Failed to update'); }
  };

  const earningsData = analytics?.monthlyEarnings?.map(e => ({
    month: MONTHS[(e._id.month || 1) - 1],
    earnings: e.amount || 0
  })) || [];

  const proposalData = analytics?.proposalStats?.map(p => ({
    status: p._id,
    count: p.count
  })) || [];

  if (loading) return <div style={{ paddingTop: 100, textAlign: 'center' }}><div style={{ width: 32, height: 32, border: '3px solid rgba(0,212,255,0.2)', borderTopColor: '#00d4ff', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto' }} /><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style></div>;

  return (
    <div style={{ paddingTop: 80, minHeight: '100vh', maxWidth: 1200, margin: '0 auto', padding: '80px 24px 48px' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700 }}>Freelancer Analytics</h1>
        <p style={{ color: '#666', fontSize: 14, marginTop: 4 }}>Track your earnings, profile views, and proposal performance</p>
      </div>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px,1fr))', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Total Earned', value: `₹${(analytics?.totalEarnings || 0).toLocaleString()}`, icon: '💰', color: '#00d4ff' },
          { label: 'Projects Done', value: analytics?.completedProjects || 0, icon: '✅', color: '#4ade80' },
          { label: 'Reputation Score', value: `${analytics?.reputationScore || 0}/5 ⭐`, icon: '🏆', color: '#facc15' },
          { label: 'Profile Views', value: analytics?.profileViews || 0, icon: '👁️', color: '#a78bfa' },
        ].map(stat => (
          <div key={stat.label} className="glass-card" style={{ padding: 18 }}>
            <div style={{ fontSize: 22, marginBottom: 8 }}>{stat.icon}</div>
            <p style={{ fontSize: 22, fontWeight: 700, color: stat.color }}>{stat.value}</p>
            <p style={{ color: '#666', fontSize: 12, marginTop: 3 }}>{stat.label}</p>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        {/* Earnings Chart */}
        <div className="glass-card" style={{ padding: 22 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Monthly Earnings</h3>
          {earningsData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={earningsData}>
                <defs>
                  <linearGradient id="earningGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#00d4ff" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#444" tick={{ fill: '#666', fontSize: 11 }} />
                <YAxis stroke="#444" tick={{ fill: '#666', fontSize: 11 }} />
                <Tooltip contentStyle={{ background: '#0d0d1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#e2e2f0' }} formatter={(v) => [`₹${v.toLocaleString()}`, 'Earnings']} />
                <Area type="monotone" dataKey="earnings" stroke="#00d4ff" fill="url(#earningGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555', fontSize: 13 }}>No earnings data yet</div>
          )}
        </div>

        {/* Proposal Stats */}
        <div className="glass-card" style={{ padding: 22 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Proposal Stats</h3>
          {proposalData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={proposalData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="status" stroke="#444" tick={{ fill: '#666', fontSize: 11 }} />
                <YAxis stroke="#444" tick={{ fill: '#666', fontSize: 11 }} />
                <Tooltip contentStyle={{ background: '#0d0d1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#e2e2f0' }} />
                <Bar dataKey="count" fill="#7c3aed" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555', fontSize: 13 }}>No proposals yet</div>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Availability */}
        <div className="glass-card" style={{ padding: 22 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Availability Status</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { status: 'available', label: '🟢 Available for work', color: '#4ade80' },
              { status: 'busy', label: '🟡 Currently busy', color: '#facc15' },
              { status: 'unavailable', label: '🔴 Not available', color: '#f87171' }
            ].map(opt => (
              <button key={opt.status} onClick={() => handleAvailability(opt.status)}
                style={{ padding: '12px 16px', borderRadius: 10, border: availStatus === opt.status ? `2px solid ${opt.color}` : '1px solid rgba(255,255,255,0.06)', background: availStatus === opt.status ? `${opt.color}15` : 'transparent', color: availStatus === opt.status ? opt.color : '#888', cursor: 'pointer', fontSize: 14, fontWeight: 500, textAlign: 'left', transition: 'all 0.2s' }}>
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Quick Profile Edit */}
        <div className="glass-card" style={{ padding: 22 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: 15, fontWeight: 600 }}>Quick Profile Edit</h3>
            {!editingProfile && <button className="btn-outline" onClick={() => setEditingProfile(true)} style={{ fontSize: 12, padding: '5px 12px' }}>Edit</button>}
          </div>
          {editingProfile ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <input className="input-field" placeholder="Professional title" value={profile.title} onChange={e => setProfile({ ...profile, title: e.target.value })} style={{ fontSize: 13 }} />
              <input className="input-field" type="number" placeholder="Hourly rate (₹)" value={profile.hourlyRate} onChange={e => setProfile({ ...profile, hourlyRate: e.target.value })} style={{ fontSize: 13 }} />
              <textarea className="input-field" rows={3} placeholder="Bio" value={profile.bio} onChange={e => setProfile({ ...profile, bio: e.target.value })} style={{ fontSize: 13, resize: 'none' }} />
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn-primary" onClick={handleProfileSave} style={{ fontSize: 13 }}>Save</button>
                <button className="btn-outline" onClick={() => setEditingProfile(false)} style={{ fontSize: 13 }}>Cancel</button>
              </div>
            </div>
          ) : (
            <div style={{ color: '#666', fontSize: 14 }}>
              <p style={{ marginBottom: 6 }}>👤 <strong style={{ color: '#e2e2f0' }}>{user?.name}</strong></p>
              <p style={{ marginBottom: 6 }}>📍 {user?.location?.city || 'Location not set'}</p>
              <p>⭐ Reputation: {analytics?.reputationScore || 0}/5</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FreelancerDashboard;

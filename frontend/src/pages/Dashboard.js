import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api from '../utils/api';

// ── Reusable StatCard ─────────────────────────────────────────
const StatCard = ({ icon, label, value, sub, trend, color, bg }) => (
  <div style={{
    background: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: 16,
    padding: '22px 24px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    transition: 'all 0.25s',
    position: 'relative', overflow: 'hidden',
  }}
    onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
    onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)'; e.currentTarget.style.transform = 'translateY(0)'; }}
  >
    {/* Background accent */}
    <div style={{ position: 'absolute', top: 0, right: 0, width: 80, height: 80, background: `${color}10`, borderRadius: '0 16px 0 80px' }} />

    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
      <div style={{ width: 44, height: 44, borderRadius: 12, background: bg || `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
        {icon}
      </div>
      {trend !== undefined && (
        <span style={{
          fontSize: 12, fontWeight: 700, padding: '3px 9px', borderRadius: 999,
          background: trend > 0 ? '#dcfce7' : trend < 0 ? '#fee2e2' : '#f1f5f9',
          color: trend > 0 ? '#16a34a' : trend < 0 ? '#dc2626' : '#64748b',
        }}>
          {trend > 0 ? '↑' : trend < 0 ? '↓' : '—'} {Math.abs(trend)}%
        </span>
      )}
    </div>

    <div style={{ fontSize: 28, fontWeight: 800, color: color || '#111827', marginBottom: 4, fontFamily: 'Syne, Plus Jakarta Sans, sans-serif' }}>{value}</div>
    <div style={{ fontSize: 13, color: '#374151', fontWeight: 600, marginBottom: 2 }}>{label}</div>
    {sub && <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>{sub}</div>}
  </div>
);

// ── Activity Item ─────────────────────────────────────────────
const ActivityItem = ({ icon, title, desc, time, tag, tagColor }) => (
  <div style={{ display: 'flex', gap: 12, padding: '14px 0', borderBottom: '1px solid #f1f5f9', alignItems: 'flex-start' }}>
    <div style={{ width: 38, height: 38, borderRadius: 10, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, flexShrink: 0 }}>{icon}</div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>{title}</span>
        {tag && <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 999, background: tagColor || '#ede9fe', color: '#7c3aed' }}>{tag}</span>}
      </div>
      <div style={{ fontSize: 13, color: '#6b7280', marginTop: 2 }}>{desc}</div>
    </div>
    <span style={{ fontSize: 11, color: '#9ca3af', flexShrink: 0, marginTop: 2 }}>{time}</span>
  </div>
);

// ─────────────────────────────────────────────────────────────
// Main Dashboard
// ─────────────────────────────────────────────────────────────
const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useSelector(s => s.auth);
  const isFreelancer = user?.role === 'freelancer';
  const isAdmin      = user?.role === 'admin';

  const [stats,    setStats]    = useState(null);
  const [activity, setActivity] = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, actRes] = await Promise.allSettled([
          api.get('/users/dashboard-stats'),
          api.get('/notifications?limit=5'),
        ]);
        if (statsRes.status === 'fulfilled') setStats(statsRes.value.data);
        if (actRes.status === 'fulfilled') {
          const d = actRes.value.data;
          setActivity(Array.isArray(d?.notifications) ? d.notifications : Array.isArray(d) ? d : []);
        }
      } catch { /* use defaults */ }
      finally { setLoading(false); }
    };
    load();
  }, []);

  // ── Client stats ─────────────────────────────────────────────
  const clientStats = [
    { icon: '📌', label: 'Active Gigs',         value: stats?.activeGigs        ?? 4,  trend: 0,   color: '#4f46e5' },
    { icon: '📨', label: 'Proposals Received',  value: stats?.proposalsReceived ?? 32, trend: 22,  color: '#0ea5e9' },
    { icon: '💰', label: 'Total Spent',          value: `₹${(stats?.totalSpent ?? 85000).toLocaleString()}`, sub: `This month: ₹${(stats?.thisMonth ?? 12000).toLocaleString()}`, trend: -5, color: '#10b981' },
    { icon: '🤝', label: 'Hired Freelancers',    value: stats?.hiredFreelancers  ?? 9,  trend: 0,   color: '#f59e0b' },
  ];

  // ── Freelancer stats ──────────────────────────────────────────
  const freelancerStats = [
    { icon: '📋', label: 'Active Proposals',    value: stats?.activeProposals   ?? 7,  trend: 12,  color: '#4f46e5' },
    { icon: '✅', label: 'Projects Completed',  value: stats?.completedProjects ?? 23, trend: 8,   color: '#10b981' },
    { icon: '💰', label: 'Total Earned',         value: `₹${(stats?.totalEarned ?? 120000).toLocaleString()}`, sub: `This month: ₹${(stats?.thisMonth ?? 18000).toLocaleString()}`, trend: 15, color: '#0ea5e9' },
    { icon: '⭐', label: 'Avg. Rating',          value: stats?.avgRating         ?? '4.9', sub: `${stats?.reviewCount ?? 47} reviews`, color: '#f59e0b' },
  ];

  const statsToShow = isFreelancer ? freelancerStats : clientStats;

  // ── Demo activity ─────────────────────────────────────────────
  const demoActivity = [
    { icon: '📨', title: 'New proposal received', desc: 'Rahul Kumar applied for React project', time: '2m ago', tag: 'New', tagColor: '#dbeafe', tagText: '#1d4ed8' },
    { icon: '💬', title: 'New message', desc: 'Priya Sharma: "Can we schedule a call?"', time: '18m ago' },
    { icon: '✅', title: 'Project completed', desc: 'UI Design for HealthTrack — marked done', time: '2h ago', tag: 'Done', tagColor: '#dcfce7', tagText: '#16a34a' },
    { icon: '⭐', title: 'Review received', desc: '5-star review from Anil Verma', time: '5h ago', tag: '5★', tagColor: '#fef3c7', tagText: '#d97706' },
    { icon: '💰', title: 'Payment received', desc: '₹12,000 credited to your wallet', time: '1d ago', tag: 'Paid', tagColor: '#dcfce7', tagText: '#16a34a' },
  ];

  const activityList = activity.length > 0 ? activity : demoActivity;

  // ── Quick actions ─────────────────────────────────────────────
  const clientActions = [
    { icon: '➕', label: 'Post a Job', to: '/create-gig', color: '#4f46e5', bg: '#ede9fe' },
    { icon: '📌', label: 'My Gigs',    to: '/my-gigs',    color: '#0ea5e9', bg: '#e0f2fe' },
    { icon: '💳', label: 'Payments',   to: '/payments',   color: '#10b981', bg: '#dcfce7' },
    { icon: '⚙️', label: 'Settings',   to: '/settings',   color: '#f59e0b', bg: '#fef3c7' },
  ];
  const freelancerActions = [
    { icon: '🔍', label: 'Browse Jobs',  to: '/gigs',         color: '#4f46e5', bg: '#ede9fe' },
    { icon: '📋', label: 'My Proposals', to: '/my-proposals', color: '#0ea5e9', bg: '#e0f2fe' },
    { icon: '👤', label: 'My Profile',   to: `/profile/${user?._id}`, color: '#10b981', bg: '#dcfce7' },
    { icon: '⚙️', label: 'Settings',     to: '/settings',     color: '#f59e0b', bg: '#fef3c7' },
  ];
  const actions = isFreelancer ? freelancerActions : clientActions;

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 40, height: 40, border: '3px solid #e0e7ff', borderTopColor: '#4f46e5', borderRadius: '50%', animation: 'spin 0.7s linear infinite', margin: '0 auto 12px' }} />
        <p style={{ color: '#6b7280', fontSize: 14 }}>Loading dashboard…</p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

      {/* ── TOP HEADER BAR ── */}
      <div style={{
        background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #1e40af 100%)',
        padding: '32px 48px 80px',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 10% 50%, rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize: '30px 30px', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '-40%', right: '-5%', width: 400, height: 400, background: 'radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 65%)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 1200, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <p style={{ color: '#a5b4fc', fontSize: 13, marginBottom: 6, fontWeight: 500 }}>
                {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
              <h1 style={{ fontSize: 30, fontWeight: 900, color: '#fff', fontFamily: 'Syne, Plus Jakarta Sans, sans-serif', marginBottom: 6 }}>
                Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, {user?.name?.split(' ')[0] || 'there'} 👋
              </h1>
              <p style={{ color: '#a5b4fc', fontSize: 14 }}>
                {isFreelancer ? "Here's your work overview for today" : "Here's what's happening with your projects"}
              </p>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              {isFreelancer ? (
                <Link to="/gigs"><button style={{ padding: '10px 22px', borderRadius: 10, background: 'linear-gradient(135deg,#6366F1,#22D3EE)', border: 'none', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 14px rgba(99,102,241,0.4)' }}>🔍 Browse Jobs</button></Link>
              ) : (
                <Link to="/create-gig"><button style={{ padding: '10px 22px', borderRadius: 10, background: 'linear-gradient(135deg,#6366F1,#22D3EE)', border: 'none', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 14px rgba(99,102,241,0.4)' }}>+ Post a Job</button></Link>
              )}
              <Link to="/chat"><button style={{ padding: '10px 20px', borderRadius: 10, background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', backdropFilter: 'blur(10px)' }}>💬 Messages</button></Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── STATS CARDS (overlap the header) ── */}
      <div style={{ maxWidth: 1200, margin: '-40px auto 0', padding: '0 48px', position: 'relative', zIndex: 2 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 18 }}>
          {statsToShow.map((s, i) => <StatCard key={i} {...s} />)}
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div style={{ maxWidth: 1200, margin: '24px auto 60px', padding: '0 48px', display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20 }}>

        {/* LEFT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Quick Actions */}
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, padding: '22px 24px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: '#111827', marginBottom: 16 }}>Quick Actions</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
              {actions.map(item => (
                <Link key={item.to} to={item.to} style={{ textDecoration: 'none' }}>
                  <div style={{ padding: '18px 12px', textAlign: 'center', background: item.bg, borderRadius: 14, cursor: 'pointer', transition: 'all 0.2s', border: `1px solid ${item.color}20` }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = `0 8px 20px ${item.color}25`; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                  >
                    <div style={{ fontSize: 26, marginBottom: 8 }}>{item.icon}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: item.color }}>{item.label}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* My Posted Jobs / Active Bids */}
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, padding: '22px 24px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: '#111827' }}>
                {isFreelancer ? 'My Active Bids' : 'My Posted Jobs'}
              </h2>
              <Link to={isFreelancer ? '/my-proposals' : '/my-gigs'} style={{ fontSize: 13, color: '#4f46e5', fontWeight: 600, textDecoration: 'none' }}>View all →</Link>
            </div>

            {/* Demo table rows */}
            {[
              { title: 'React E-commerce Dashboard', budget: '₹45,000', bids: 8, status: 'Active', statusColor: '#16a34a', statusBg: '#dcfce7' },
              { title: 'Mobile App UI Design', budget: '₹28,000', bids: 14, status: 'Active', statusColor: '#16a34a', statusBg: '#dcfce7' },
              { title: 'Node.js REST API Development', budget: '₹35,000', bids: 5, status: 'Reviewing', statusColor: '#d97706', statusBg: '#fef3c7' },
            ].map((job, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid #f1f5f9', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#111827', marginBottom: 4 }}>{job.title}</div>
                  <div style={{ display: 'flex', gap: 14 }}>
                    <span style={{ fontSize: 12, color: '#6b7280' }}>💰 {job.budget}</span>
                    <span style={{ fontSize: 12, color: '#6b7280' }}>🤝 {job.bids} bids</span>
                  </div>
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 999, background: job.statusBg, color: job.statusColor, flexShrink: 0 }}>{job.status}</span>
              </div>
            ))}

            {/* Empty fallback */}
            <div style={{ marginTop: 12, textAlign: 'center', padding: '24px 0', display: 'none' }}>
              <p style={{ color: '#9ca3af', fontSize: 13 }}>No {isFreelancer ? 'bids' : 'jobs'} yet</p>
              <Link to={isFreelancer ? '/gigs' : '/create-gig'}>
                <button style={{ marginTop: 10, padding: '8px 20px', borderRadius: 10, background: '#4f46e5', border: 'none', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                  {isFreelancer ? 'Browse Jobs' : 'Post First Job'}
                </button>
              </Link>
            </div>
          </div>

          {/* Recent Activity */}
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, padding: '22px 24px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: '#111827', marginBottom: 4 }}>Recent Activity</h2>
            <p style={{ fontSize: 13, color: '#9ca3af', marginBottom: 16 }}>Your latest notifications and updates</p>
            {activityList.map((a, i) => (
              <ActivityItem key={a._id || i}
                icon={a.icon || { new_gig:'⚡', new_bid:'🤝', bid_accepted:'🎉', bid_rejected:'❌', message:'💬' }[a.type] || '🔔'}
                title={a.title}
                desc={a.message || a.desc}
                time={a.time || (a.createdAt ? new Date(a.createdAt).toLocaleDateString('en-IN',{day:'numeric',month:'short'}) : '')}
                tag={a.tag}
                tagColor={a.tagColor}
              />
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Profile card */}
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            {/* Banner */}
            <div style={{ height: 70, background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', position: 'relative' }}>
              <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.08) 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
            </div>
            <div style={{ padding: '0 20px 20px' }}>
              <div style={{ marginTop: -28, marginBottom: 12 }}>
                <div style={{ width: 56, height: 56, borderRadius: 14, background: 'linear-gradient(135deg,#6366F1,#22D3EE)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 900, color: '#fff', border: '3px solid #fff', boxShadow: '0 4px 12px rgba(99,102,241,0.3)' }}>
                  {user?.name?.[0]?.toUpperCase() || 'U'}
                </div>
              </div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>{user?.name || 'User'}</div>
              <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2, marginBottom: 10 }}>{user?.email}</div>
              <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 999, background: '#ede9fe', color: '#7c3aed', textTransform: 'capitalize' }}>{user?.role}</span>
            </div>
          </div>

          {/* Profile completion */}
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>Profile Strength</h3>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#4f46e5' }}>75%</span>
            </div>
            <div style={{ height: 8, background: '#f1f5f9', borderRadius: 4, marginBottom: 16, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: '75%', background: 'linear-gradient(90deg, #4f46e5, #22D3EE)', borderRadius: 4, transition: 'width 0.8s ease' }} />
            </div>
            {[
              { label: 'Add profile photo', done: true },
              { label: 'Complete bio', done: true },
              { label: 'Add portfolio', done: false },
              { label: 'Verify skills', done: false },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <div style={{ width: 20, height: 20, borderRadius: '50%', background: item.done ? '#4f46e5' : '#f1f5f9', border: item.done ? 'none' : '1.5px solid #d1d5db', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {item.done && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4l2.5 2.5L9 1" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                </div>
                <span style={{ fontSize: 13, color: item.done ? '#374151' : '#9ca3af', textDecoration: item.done ? 'line-through' : 'none' }}>{item.label}</span>
              </div>
            ))}
            <Link to="/settings">
              <button style={{ width: '100%', padding: '10px', borderRadius: 10, background: '#f5f3ff', border: '1px solid #ede9fe', color: '#4f46e5', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', marginTop: 6, transition: 'all 0.2s' }}
                onMouseEnter={e => { e.target.style.background = '#ede9fe'; }}
                onMouseLeave={e => { e.target.style.background = '#f5f3ff'; }}
              >Complete Profile</button>
            </Link>
          </div>

          {/* Upcoming deadlines */}
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 14 }}>Upcoming Deadlines</h3>
            {[
              { title: 'E-commerce Dashboard', date: 'Mar 28', daysLeft: 4, color: '#f59e0b', bg: '#fef3c7' },
              { title: 'Mobile App UI', date: 'Apr 2', daysLeft: 9, color: '#10b981', bg: '#dcfce7' },
              { title: 'API Integration', date: 'Apr 10', daysLeft: 17, color: '#4f46e5', bg: '#ede9fe' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 2 }}>{item.title}</div>
                  <div style={{ fontSize: 12, color: '#9ca3af' }}>Due {item.date}</div>
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 999, background: item.bg, color: item.color, flexShrink: 0 }}>
                  {item.daysLeft}d left
                </span>
              </div>
            ))}
          </div>

          {/* CTA Banner */}
          <div style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', borderRadius: 16, padding: '20px', textAlign: 'center', boxShadow: '0 4px 14px rgba(79,70,229,0.3)' }}>
            <div style={{ fontSize: 28, marginBottom: 10 }}>{isFreelancer ? '🚀' : '💡'}</div>
            <h4 style={{ color: '#fff', fontWeight: 700, marginBottom: 6, fontSize: 14 }}>
              {isFreelancer ? 'Boost your visibility' : 'Find top talent faster'}
            </h4>
            <p style={{ color: '#c7d2fe', fontSize: 12, marginBottom: 14, lineHeight: 1.6 }}>
              {isFreelancer ? 'Complete your profile to get 3x more job invitations' : 'Use AI matching to find the perfect freelancer'}
            </p>
            <Link to={isFreelancer ? '/settings' : '/freelancers'}>
              <button style={{ padding: '9px 20px', borderRadius: 10, background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', backdropFilter: 'blur(10px)', transition: 'all 0.2s' }}
                onMouseEnter={e => e.target.style.background = 'rgba(255,255,255,0.3)'}
                onMouseLeave={e => e.target.style.background = 'rgba(255,255,255,0.2)'}
              >{isFreelancer ? 'Update Profile' : 'Find Talent'}</button>
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default Dashboard;
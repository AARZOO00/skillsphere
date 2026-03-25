import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAdminAnalytics } from '../../utils/api';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const PIE_COLORS = ['#00d4ff','#7c3aed','#4ade80','#facc15','#f87171','#fb923c','#a78bfa','#34d399'];

const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminAnalytics().then(({ data }) => setAnalytics(data.analytics)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ paddingTop: 100, textAlign: 'center' }}><div style={{ width: 32, height: 32, border: '3px solid rgba(0,212,255,0.2)', borderTopColor: '#00d4ff', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto' }} /><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style></div>;

  const revenueData = analytics?.monthlyRevenue?.map(r => ({
    month: MONTHS[(r._id.month || 1) - 1],
    revenue: r.revenue || 0,
    transactions: r.count || 0
  })) || [];

  const pieData = analytics?.topCategories?.map(c => ({ name: c._id, value: c.count })) || [];

  return (
    <div style={{ paddingTop: 80, minHeight: '100vh', maxWidth: 1300, margin: '0 auto', padding: '80px 24px 48px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700 }}>Admin Dashboard</h1>
          <p style={{ color: '#666', fontSize: 14, marginTop: 4 }}>Platform overview and analytics</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Link to="/admin/users" className="btn-outline" style={{ textDecoration: 'none', fontSize: 13 }}>Manage Users</Link>
          <Link to="/admin/gigs" className="btn-outline" style={{ textDecoration: 'none', fontSize: 13 }}>Manage Jobs</Link>
        </div>
      </div>

      {/* Alert banners */}
      {analytics?.issues?.openDisputes > 0 && (
        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 12, padding: '14px 20px', marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: '#f87171' }}>⚠️ {analytics.issues.openDisputes} open dispute{analytics.issues.openDisputes > 1 ? 's' : ''} need attention</span>
          <button style={{ background: 'none', border: '1px solid #f87171', color: '#f87171', padding: '5px 14px', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}>Review</button>
        </div>
      )}
      {analytics?.issues?.flaggedReviews > 0 && (
        <div style={{ background: 'rgba(250,204,21,0.1)', border: '1px solid rgba(250,204,21,0.2)', borderRadius: 12, padding: '14px 20px', marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: '#facc15' }}>🚩 {analytics.issues.flaggedReviews} flagged review{analytics.issues.flaggedReviews > 1 ? 's' : ''} need review</span>
          <button style={{ background: 'none', border: '1px solid #facc15', color: '#facc15', padding: '5px 14px', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}>Review</button>
        </div>
      )}

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px,1fr))', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Total Users', value: analytics?.users?.total || 0, sub: `+${analytics?.users?.newThisMonth || 0} this month`, icon: '👥', color: '#00d4ff' },
          { label: 'Freelancers', value: analytics?.users?.freelancers || 0, sub: 'registered', icon: '🚀', color: '#a78bfa' },
          { label: 'Active Jobs', value: analytics?.gigs?.active || 0, sub: `${analytics?.gigs?.total || 0} total`, icon: '📋', color: '#4ade80' },
          { label: 'Success Rate', value: `${analytics?.gigs?.successRate || 0}%`, sub: `${analytics?.gigs?.completed || 0} completed`, icon: '✅', color: '#facc15' },
          { label: 'Platform Revenue', value: `₹${(analytics?.revenue?.total || 0).toLocaleString()}`, sub: `${analytics?.revenue?.transactions || 0} transactions`, icon: '💰', color: '#00d4ff' },
        ].map(stat => (
          <div key={stat.label} className="glass-card" style={{ padding: 18 }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>{stat.icon}</div>
            <p style={{ fontSize: 22, fontWeight: 700, color: stat.color }}>{stat.value}</p>
            <p style={{ color: '#888', fontSize: 12, marginTop: 2 }}>{stat.label}</p>
            <p style={{ color: '#555', fontSize: 11, marginTop: 2 }}>{stat.sub}</p>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, marginBottom: 20 }}>
        {/* Revenue Chart */}
        <div className="glass-card" style={{ padding: 22 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Monthly Revenue (Platform Fees)</h3>
          {revenueData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#00d4ff" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#444" tick={{ fill: '#666', fontSize: 11 }} />
                <YAxis stroke="#444" tick={{ fill: '#666', fontSize: 11 }} />
                <Tooltip contentStyle={{ background: '#0d0d1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} formatter={v => [`₹${v.toLocaleString()}`, 'Revenue']} />
                <Area type="monotone" dataKey="revenue" stroke="#00d4ff" fill="url(#revGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          ) : <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555' }}>No revenue data yet</div>}
        </div>

        {/* Category Breakdown */}
        <div className="glass-card" style={{ padding: 22 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Top Categories</h3>
          {pieData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" stroke="none">
                    {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#0d0d1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {pieData.slice(0, 5).map((d, i) => (
                  <div key={d.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: PIE_COLORS[i % PIE_COLORS.length] }} />
                      <span style={{ fontSize: 12, color: '#aaa' }}>{d.name}</span>
                    </div>
                    <span style={{ fontSize: 12, color: '#666' }}>{d.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : <div style={{ textAlign: 'center', color: '#555', fontSize: 13, paddingTop: 40 }}>No data yet</div>}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="glass-card" style={{ padding: 22 }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Admin Actions</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px,1fr))', gap: 12 }}>
          {[
            { icon: '👥', label: 'Manage Users', desc: 'Suspend, verify accounts', to: '/admin/users' },
            { icon: '📋', label: 'Approve Gigs', desc: 'Review pending jobs', to: '/admin/gigs' },
            { icon: '⚖️', label: 'Disputes', desc: `${analytics?.issues?.openDisputes || 0} open`, to: '/admin/users' },
            { icon: '🚩', label: 'Flagged Reviews', desc: `${analytics?.issues?.flaggedReviews || 0} to review`, to: '/admin/users' },
          ].map(action => (
            <Link key={action.label} to={action.to} style={{ textDecoration: 'none' }}>
              <div style={{ padding: 16, border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, cursor: 'pointer', transition: 'all 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(0,212,255,0.3)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'}>
                <div style={{ fontSize: 24, marginBottom: 8 }}>{action.icon}</div>
                <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>{action.label}</p>
                <p style={{ color: '#666', fontSize: 12 }}>{action.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

import React, { useEffect, useState } from 'react';
import { getAdminUsers, toggleSuspend, verifyFreelancer } from '../../utils/api';
import toast from 'react-hot-toast';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ role: '', search: '', page: 1 });

  useEffect(() => {
    setLoading(true);
    getAdminUsers(filters).then(({ data }) => { setUsers(data.users); setTotal(data.total); }).finally(() => setLoading(false));
  }, [filters]);

  const handleSuspend = async (userId, isSuspended) => {
    const reason = isSuspended ? '' : prompt('Reason for suspension:');
    if (!isSuspended && !reason) return;
    try {
      await toggleSuspend(userId, reason);
      setUsers(users.map(u => u._id === userId ? { ...u, isSuspended: !isSuspended } : u));
      toast.success(isSuspended ? 'User reactivated' : 'User suspended');
    } catch { toast.error('Failed'); }
  };

  const handleVerify = async (userId) => {
    try {
      await verifyFreelancer(userId, 'pro');
      toast.success('Freelancer verified ✅');
    } catch { toast.error('Failed to verify'); }
  };

  return (
    <div style={{ paddingTop: 80, minHeight: '100vh', maxWidth: 1200, margin: '0 auto', padding: '80px 24px 48px' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700 }}>User Management</h1>
        <p style={{ color: '#666', fontSize: 14, marginTop: 4 }}>{total} total users</p>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <input className="input-field" placeholder="Search by name or email..." value={filters.search} onChange={e => setFilters({ ...filters, search: e.target.value, page: 1 })} style={{ flex: 1, minWidth: 200 }} />
        <select className="input-field" value={filters.role} onChange={e => setFilters({ ...filters, role: e.target.value, page: 1 })} style={{ width: 160 }}>
          <option value="">All Roles</option>
          <option value="client">Clients</option>
          <option value="freelancer">Freelancers</option>
          <option value="admin">Admins</option>
        </select>
      </div>

      {/* Table */}
      <div className="glass-card" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              {['User', 'Role', 'Status', 'Joined', 'Actions'].map(h => (
                <th key={h} style={{ padding: '14px 16px', textAlign: 'left', color: '#666', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} style={{ padding: 40, textAlign: 'center', color: '#555' }}>Loading...</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={5} style={{ padding: 40, textAlign: 'center', color: '#555' }}>No users found</td></tr>
            ) : users.map(user => (
              <tr key={user._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <td style={{ padding: '14px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <img src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=00d4ff&color=000&size=32`} alt="" style={{ width: 36, height: 36, borderRadius: '50%' }} />
                    <div>
                      <p style={{ fontWeight: 600, fontSize: 14 }}>{user.name}</p>
                      <p style={{ color: '#666', fontSize: 12 }}>{user.email}</p>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '14px 16px' }}>
                  <span className={`badge ${user.role === 'admin' ? 'badge-red' : user.role === 'freelancer' ? 'badge-cyan' : 'badge-purple'}`}>{user.role}</span>
                </td>
                <td style={{ padding: '14px 16px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <span className={`badge ${user.isSuspended ? 'badge-red' : user.isEmailVerified ? 'badge-green' : 'badge-yellow'}`}>
                      {user.isSuspended ? 'Suspended' : user.isEmailVerified ? 'Verified' : 'Unverified'}
                    </span>
                  </div>
                </td>
                <td style={{ padding: '14px 16px', color: '#666', fontSize: 13 }}>{new Date(user.createdAt).toLocaleDateString()}</td>
                <td style={{ padding: '14px 16px' }}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={() => handleSuspend(user._id, user.isSuspended)}
                      style={{ background: user.isSuspended ? 'rgba(74,222,128,0.1)' : 'rgba(239,68,68,0.1)', border: user.isSuspended ? '1px solid rgba(74,222,128,0.2)' : '1px solid rgba(239,68,68,0.2)', color: user.isSuspended ? '#4ade80' : '#f87171', padding: '5px 10px', borderRadius: 6, cursor: 'pointer', fontSize: 12 }}>
                      {user.isSuspended ? 'Reactivate' : 'Suspend'}
                    </button>
                    {user.role === 'freelancer' && (
                      <button onClick={() => handleVerify(user._id)}
                        style={{ background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.2)', color: '#00d4ff', padding: '5px 10px', borderRadius: 6, cursor: 'pointer', fontSize: 12 }}>
                        Verify
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminUsers;

import React, { useEffect, useState } from 'react';
import { getGigs, approveGig } from '../../utils/api';
import toast from 'react-hot-toast';

const AdminGigs = () => {
  const [gigs, setGigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');

  useEffect(() => {
    setLoading(true);
    // Fetch all gigs including unapproved ones (admin bypass)
    getGigs({ limit: 50 }).then(({ data }) => {
      setGigs(data.gigs);
    }).finally(() => setLoading(false));
  }, []);

  const handleApprove = async (gigId, approved) => {
    const reason = !approved ? prompt('Reason for rejection:') : null;
    try {
      await approveGig(gigId, approved, reason);
      setGigs(gigs.map(g => g._id === gigId ? { ...g, isApproved: approved } : g));
      toast.success(approved ? 'Gig approved ✅' : 'Gig rejected');
    } catch { toast.error('Failed'); }
  };

  const filtered = filter === 'pending' ? gigs.filter(g => !g.isApproved) : filter === 'approved' ? gigs.filter(g => g.isApproved) : gigs;

  return (
    <div style={{ paddingTop: 80, minHeight: '100vh', maxWidth: 1100, margin: '0 auto', padding: '80px 24px 48px' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700 }}>Gig Management</h1>
        <p style={{ color: '#666', fontSize: 14, marginTop: 4 }}>{gigs.filter(g => !g.isApproved).length} pending approval</p>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {['all','pending','approved'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            style={{ padding: '6px 16px', borderRadius: 20, border: filter === f ? '2px solid #00d4ff' : '1px solid rgba(255,255,255,0.08)', background: filter === f ? 'rgba(0,212,255,0.1)' : 'transparent', color: filter === f ? '#00d4ff' : '#888', cursor: 'pointer', fontSize: 13, textTransform: 'capitalize' }}>
            {f} ({f === 'all' ? gigs.length : f === 'pending' ? gigs.filter(g => !g.isApproved).length : gigs.filter(g => g.isApproved).length})
          </button>
        ))}
      </div>

      {loading ? <div style={{ textAlign: 'center', padding: 40, color: '#666' }}>Loading...</div> :
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {filtered.map(gig => (
            <div key={gig._id} className="glass-card" style={{ padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                    <span className="badge badge-cyan">{gig.category}</span>
                    <span className={`badge ${gig.isApproved ? 'badge-green' : 'badge-yellow'}`}>{gig.isApproved ? 'Approved' : 'Pending'}</span>
                    <span className="badge badge-purple">{gig.status}</span>
                  </div>
                  <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>{gig.title}</h3>
                  <p style={{ fontSize: 13, color: '#888', lineHeight: 1.5, marginBottom: 8, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{gig.description}</p>
                  <div style={{ display: 'flex', gap: 16, color: '#666', fontSize: 12 }}>
                    <span>👤 {gig.client?.name}</span>
                    <span>💰 ₹{gig.budget?.min?.toLocaleString()} - ₹{gig.budget?.max?.toLocaleString()}</span>
                    <span>📅 {new Date(gig.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                {!gig.isApproved && (
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn-primary" onClick={() => handleApprove(gig._id, true)} style={{ fontSize: 13 }}>✓ Approve</button>
                    <button onClick={() => handleApprove(gig._id, false)} style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', padding: '8px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 13 }}>✗ Reject</button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      }
    </div>
  );
};

export default AdminGigs;

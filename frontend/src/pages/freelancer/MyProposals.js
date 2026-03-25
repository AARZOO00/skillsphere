import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import api from '../../utils/api';

const MyProposals = () => {
  const { user } = useSelector(s => s.auth);
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('all');
  const [bidModal, setBidModal] = useState(null);
  const [bidForm, setBidForm] = useState({ amount: '', deliveryDays: '', proposal: '' });
  const [bidLoading, setBidLoading] = useState(false);

  useEffect(() => {
    fetchProposals();
  }, []);

  const fetchProposals = async () => {
    try {
      const res = await api.get('/bids/my-bids');
      setProposals(res.data);
    } catch {
      toast.error('Failed to fetch proposals');
    } finally {
      setLoading(false);
    }
  };

  const submitBid = async (gigId) => {
    if (!bidForm.amount || !bidForm.deliveryDays || !bidForm.proposal.trim()) {
      toast.error('Please fill all fields'); return;
    }
    setBidLoading(true);
    try {
      await api.post(`/gigs/${gigId}/bids`, {
        amount: Number(bidForm.amount),
        deliveryDays: Number(bidForm.deliveryDays),
        proposal: bidForm.proposal,
      });
      toast.success('🎉 Bid submitted successfully!');
      setBidModal(null);
      setBidForm({ amount: '', deliveryDays: '', proposal: '' });
      fetchProposals();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to submit bid');
    } finally {
      setBidLoading(false);
    }
  };

  const withdrawBid = async (bidId) => {
    if (!window.confirm('Withdraw this bid?')) return;
    try {
      await api.delete(`/bids/${bidId}`);
      toast.success('Bid withdrawn.');
      setProposals(proposals.filter(p => p._id !== bidId));
    } catch {
      toast.error('Failed to withdraw bid');
    }
  };

  const card = {
    background: 'linear-gradient(145deg, #151e2e, #111827)',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: 18,
    boxShadow: '0 4px 24px rgba(0,0,0,0.35)',
  };

  const statusMap = {
    pending:  { label: '⏳ Pending',  bg: 'rgba(251,191,36,0.1)',  color: '#fbbf24', border: 'rgba(251,191,36,0.25)' },
    accepted: { label: '✅ Accepted', bg: 'rgba(34,197,94,0.1)',  color: '#4ade80', border: 'rgba(34,197,94,0.25)' },
    rejected: { label: '❌ Rejected', bg: 'rgba(239,68,68,0.1)',  color: '#f87171', border: 'rgba(239,68,68,0.2)' },
    withdrawn:{ label: '↩ Withdrawn', bg: 'rgba(255,255,255,0.05)', color: '#64748B', border: 'rgba(255,255,255,0.1)' },
  };

  const filtered = tab === 'all' ? proposals : proposals.filter(p => p.status === tab);
  const stats = {
    total: proposals.length,
    pending: proposals.filter(p => p.status === 'pending').length,
    accepted: proposals.filter(p => p.status === 'accepted').length,
    rejected: proposals.filter(p => p.status === 'rejected').length,
  };

  const inputStyle = {
    width: '100%', padding: '11px 14px', boxSizing: 'border-box',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 10, color: '#F1F5F9',
    fontSize: 14, fontFamily: 'Plus Jakarta Sans, sans-serif',
    outline: 'none',
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0B0F1A', padding: '32px 40px', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: '#F1F5F9', fontFamily: 'Syne, Plus Jakarta Sans, sans-serif', marginBottom: 4 }}>My Proposals</h1>
            <p style={{ color: '#64748B', fontSize: 14 }}>Track bids you've placed on projects</p>
          </div>
          <Link to="/gigs">
            <button style={{
              padding: '11px 22px', borderRadius: 12, cursor: 'pointer',
              fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 14, fontWeight: 700,
              background: 'linear-gradient(135deg, #6366F1, #22D3EE)',
              border: 'none', color: '#fff', boxShadow: '0 4px 16px rgba(99,102,241,0.35)',
            }}>🔍 Browse More Jobs</button>
          </Link>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
          {[
            { icon: '📋', label: 'Total Bids', value: stats.total, color: '#818CF8' },
            { icon: '⏳', label: 'Pending', value: stats.pending, color: '#fbbf24' },
            { icon: '✅', label: 'Accepted', value: stats.accepted, color: '#4ade80' },
            { icon: '❌', label: 'Rejected', value: stats.rejected, color: '#f87171' },
          ].map((s, i) => (
            <div key={i} style={{ ...card, padding: '18px 20px' }}>
              <div style={{ fontSize: 20, marginBottom: 8 }}>{s.icon}</div>
              <div style={{ fontSize: 26, fontWeight: 800, color: s.color, fontFamily: 'Syne, Plus Jakarta Sans, sans-serif' }}>{s.value}</div>
              <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 20, borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          {['all', 'pending', 'accepted', 'rejected'].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontFamily: 'Plus Jakarta Sans, sans-serif',
              fontSize: 14, fontWeight: 600,
              color: tab === t ? '#818CF8' : '#475569',
              padding: '10px 18px',
              borderBottom: tab === t ? '2px solid #6366F1' : '2px solid transparent',
              textTransform: 'capitalize', transition: 'all 0.2s',
            }}>{t}</button>
          ))}
        </div>

        {/* Proposal list */}
        {loading ? (
          [1,2,3].map(i => <div key={i} style={{ ...card, height: 120, marginBottom: 14, opacity: 0.5, animation: 'pulse 1.5s ease-in-out infinite' }} />)
        ) : filtered.length === 0 ? (
          <div style={{ ...card, padding: 48, textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 14 }}>📭</div>
            <h3 style={{ color: '#F1F5F9', fontWeight: 700, marginBottom: 6 }}>No proposals yet</h3>
            <p style={{ color: '#64748B', fontSize: 14, marginBottom: 20 }}>Browse open gigs and place your first bid</p>
            <Link to="/gigs">
              <button style={{ padding: '11px 22px', borderRadius: 12, cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 14, fontWeight: 700, background: 'linear-gradient(135deg, #6366F1, #22D3EE)', border: 'none', color: '#fff' }}>
                Browse Jobs
              </button>
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {filtered.map((bid, i) => {
              const sc = statusMap[bid.status] || statusMap.pending;
              return (
                <div key={bid._id || i} style={{ ...card, padding: 22, transition: 'all 0.25s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(99,102,241,0.3)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, flexWrap: 'wrap' }}>
                        <Link to={`/gigs/${bid.gig?._id}`} style={{ fontSize: 15, fontWeight: 700, color: '#F1F5F9', textDecoration: 'none' }}>
                          {bid.gig?.title || 'Project Title'}
                        </Link>
                        <span style={{ background: sc.bg, color: sc.color, border: `1px solid ${sc.border}`, fontSize: 11, fontWeight: 700, padding: '2px 10px', borderRadius: 999 }}>
                          {sc.label}
                        </span>
                      </div>
                      <p style={{ fontSize: 13, color: '#64748B', lineHeight: 1.6, marginBottom: 10, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {bid.proposal || 'No proposal text'}
                      </p>
                      <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 12, color: '#64748B' }}>
                          💰 Your bid: <strong style={{ color: '#818CF8' }}>₹{Number(bid.amount || 0).toLocaleString()}</strong>
                        </span>
                        <span style={{ fontSize: 12, color: '#64748B' }}>
                          ⏱ Delivery: <strong style={{ color: '#94A3B8' }}>{bid.deliveryDays || 7} days</strong>
                        </span>
                        <span style={{ fontSize: 12, color: '#64748B' }}>
                          📅 Submitted: {bid.createdAt ? new Date(bid.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'N/A'}
                        </span>
                      </div>
                    </div>
                    <div style={{ marginLeft: 16, flexShrink: 0 }}>
                      {bid.status === 'pending' && (
                        <button
                          onClick={() => withdrawBid(bid._id)}
                          style={{
                            padding: '7px 14px', borderRadius: 9, cursor: 'pointer',
                            fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 12, fontWeight: 600,
                            background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171',
                          }}
                        >Withdraw</button>
                      )}
                      {bid.status === 'accepted' && (
                        <Link to={`/chat?gigId=${bid.gig?._id}`}>
                          <button style={{
                            padding: '7px 14px', borderRadius: 9, cursor: 'pointer',
                            fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 12, fontWeight: 600,
                            background: 'linear-gradient(135deg, #6366F1, #22D3EE)', border: 'none', color: '#fff',
                          }}>💬 Message Client</button>
                        </Link>
                      )}
                    </div>
                  </div>

                  {/* Gig budget vs bid comparison */}
                  {bid.gig?.budget && (
                    <div style={{ marginTop: 10, padding: '10px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: 10, display: 'flex', gap: 20 }}>
                      <span style={{ fontSize: 12, color: '#64748B' }}>Client budget: <strong style={{ color: '#94A3B8' }}>₹{Number(bid.gig.budget).toLocaleString()}</strong></span>
                      <span style={{ fontSize: 12, color: '#64748B' }}>Your bid: <strong style={{ color: Number(bid.amount) <= Number(bid.gig.budget) ? '#4ade80' : '#f87171' }}>₹{Number(bid.amount || 0).toLocaleString()}</strong></span>
                      <span style={{ fontSize: 12, color: Number(bid.amount) <= Number(bid.gig.budget) ? '#4ade80' : '#f87171' }}>
                        {Number(bid.amount) <= Number(bid.gig.budget) ? '✓ Within budget' : '⚠ Over budget'}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Bid Modal */}
      {bidModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 999,
          background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
        }} onClick={() => setBidModal(null)}>
          <div style={{
            ...card, padding: 32, maxWidth: 480, width: '100%',
            border: '1px solid rgba(99,102,241,0.3)',
          }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: '#F1F5F9', marginBottom: 6, fontFamily: 'Syne, Plus Jakarta Sans, sans-serif' }}>Place Your Bid</h3>
            <p style={{ color: '#64748B', fontSize: 13, marginBottom: 24 }}>Submit a competitive proposal to win this project</p>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#94A3B8', marginBottom: 6 }}>Your Bid Amount (₹) *</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#6366F1', fontWeight: 700 }}>₹</span>
                <input type="number" style={{ ...inputStyle, paddingLeft: 30 }} placeholder="25000" value={bidForm.amount} onChange={e => setBidForm(f => ({ ...f, amount: e.target.value }))} />
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#94A3B8', marginBottom: 6 }}>Delivery Time (days) *</label>
              <input type="number" style={inputStyle} placeholder="7" value={bidForm.deliveryDays} onChange={e => setBidForm(f => ({ ...f, deliveryDays: e.target.value }))} />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#94A3B8', marginBottom: 6 }}>Proposal *</label>
              <textarea
                style={{ ...inputStyle, minHeight: 120, resize: 'vertical', lineHeight: 1.7 }}
                placeholder="Explain why you're the best fit for this project. Mention your relevant experience, approach, and what makes you stand out..."
                value={bidForm.proposal}
                onChange={e => setBidForm(f => ({ ...f, proposal: e.target.value }))}
              />
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => submitBid(bidModal)}
                disabled={bidLoading}
                style={{
                  flex: 1, padding: '12px', borderRadius: 12, cursor: 'pointer',
                  fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 14, fontWeight: 700,
                  background: 'linear-gradient(135deg, #6366F1, #22D3EE)',
                  border: 'none', color: '#fff',
                }}
              >{bidLoading ? 'Submitting...' : '🚀 Submit Bid'}</button>
              <button
                onClick={() => setBidModal(null)}
                style={{
                  padding: '12px 20px', borderRadius: 12, cursor: 'pointer',
                  fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 14, fontWeight: 600,
                  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#94A3B8',
                }}
              >Cancel</button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }`}</style>
    </div>
  );
};

export default MyProposals;
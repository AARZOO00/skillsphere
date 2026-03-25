import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchGigById } from '../redux/slices/gigSlice';
import { submitProposal, matchFreelancers } from '../utils/api';
import toast from 'react-hot-toast';

const GigDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentGig: gig, loading } = useSelector(state => state.gigs);
  const { user } = useSelector(state => state.auth);
  const [showProposalForm, setShowProposalForm] = useState(false);
  const [aiMatches, setAiMatches] = useState([]);
  const [proposal, setProposal] = useState({ coverLetter: '', bidAmount: '', estimatedDays: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    dispatch(fetchGig(id));
  }, [id]);

  useEffect(() => {
    if (gig && user?.role === 'client' && gig.client?._id === user._id) {
      matchFreelancers(id).then(({ data }) => setAiMatches(data.matches)).catch(() => {});
    }
  }, [gig]);

  const handleProposalSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await submitProposal(id, proposal);
      toast.success('Proposal submitted successfully!');
      setShowProposalForm(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit proposal');
    } finally { setSubmitting(false); }
  };

  if (loading || !gig) return (
    <div style={{ paddingTop: 80, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <div style={{ width: 40, height: 40, border: '3px solid rgba(0,212,255,0.2)', borderTopColor: '#00d4ff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    </div>
  );

  return (
    <div style={{ paddingTop: 80, minHeight: '100vh', maxWidth: 1100, margin: '0 auto', padding: '80px 24px 48px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24 }}>
        {/* Main Content */}
        <div>
          {/* Header */}
          <div className="glass-card" style={{ padding: 28, marginBottom: 20 }}>
            <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
              <span className="badge badge-cyan">{gig.category}</span>
              <span className={`badge ${gig.status === 'open' ? 'badge-green' : 'badge-yellow'}`}>{gig.status}</span>
              <span className="badge badge-purple">{gig.experienceLevel}</span>
            </div>
            <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 14, lineHeight: 1.3 }}>{gig.title}</h1>
            
            <div style={{ display: 'flex', gap: 20, color: '#888', fontSize: 13, flexWrap: 'wrap' }}>
              <span>📅 Posted {new Date(gig.createdAt).toLocaleDateString()}</span>
              <span>👁️ {gig.views} views</span>
              <span>📝 {gig.proposalCount} proposals</span>
              {gig.location?.city && <span>📍 {gig.location.city}</span>}
            </div>
          </div>

          {/* Description */}
          <div className="glass-card" style={{ padding: 28, marginBottom: 20 }}>
            <h2 style={{ fontSize: 17, fontWeight: 600, marginBottom: 14 }}>Job Description</h2>
            <p style={{ color: '#bbb', lineHeight: 1.8, fontSize: 14 }}>{gig.description}</p>
          </div>

          {/* Skills */}
          {gig.skills?.length > 0 && (
            <div className="glass-card" style={{ padding: 28, marginBottom: 20 }}>
              <h2 style={{ fontSize: 17, fontWeight: 600, marginBottom: 14 }}>Required Skills</h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {gig.skills.map(skill => (
                  <span key={skill} style={{ background: 'rgba(0,212,255,0.08)', color: '#00d4ff', border: '1px solid rgba(0,212,255,0.2)', borderRadius: 8, padding: '6px 14px', fontSize: 13 }}>{skill}</span>
                ))}
              </div>
            </div>
          )}

          {/* Milestones */}
          {gig.milestones?.length > 0 && (
            <div className="glass-card" style={{ padding: 28, marginBottom: 20 }}>
              <h2 style={{ fontSize: 17, fontWeight: 600, marginBottom: 14 }}>Milestones</h2>
              {gig.milestones.map((m, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: i < gig.milestones.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: 14 }}>{m.title}</p>
                    <p style={{ color: '#888', fontSize: 12, marginTop: 2 }}>{m.description}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ color: '#00d4ff', fontWeight: 700 }}>₹{m.amount?.toLocaleString()}</p>
                    {m.dueDate && <p style={{ color: '#666', fontSize: 11 }}>{new Date(m.dueDate).toLocaleDateString()}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* AI Matched Freelancers (for client) */}
          {user?.role === 'client' && gig.client?._id === user._id && aiMatches.length > 0 && (
            <div className="glass-card" style={{ padding: 28 }}>
              <h2 style={{ fontSize: 17, fontWeight: 600, marginBottom: 4 }}>🤖 AI-Matched Freelancers</h2>
              <p style={{ color: '#666', fontSize: 13, marginBottom: 16 }}>Top matches based on skills, rating & location</p>
              {aiMatches.slice(0, 5).map(({ freelancer, score, skillMatch, matchedSkills }) => (
                <div key={freelancer._id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <img src={freelancer.user?.avatar || `https://ui-avatars.com/api/?name=${freelancer.user?.name}&background=00d4ff&color=000`} alt="" style={{ width: 44, height: 44, borderRadius: '50%' }} />
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 600, fontSize: 14 }}>{freelancer.user?.name}</p>
                    <p style={{ color: '#666', fontSize: 12 }}>{freelancer.title}</p>
                    <div style={{ display: 'flex', gap: 6, marginTop: 4, flexWrap: 'wrap' }}>
                      {matchedSkills?.slice(0, 3).map(s => <span key={s} style={{ background: 'rgba(0,212,255,0.08)', color: '#00d4ff', borderRadius: 4, padding: '2px 8px', fontSize: 11 }}>{s}</span>)}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.2)', borderRadius: 8, padding: '4px 10px', color: '#00d4ff', fontWeight: 700, fontSize: 14 }}>{score}%</div>
                    <p style={{ color: '#555', fontSize: 11, marginTop: 2 }}>match</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Proposal Form */}
          {showProposalForm && user?.role === 'freelancer' && (
            <div className="glass-card" style={{ padding: 28, marginTop: 20 }}>
              <h2 style={{ fontSize: 17, fontWeight: 600, marginBottom: 16 }}>Submit Proposal</h2>
              <form onSubmit={handleProposalSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 12, color: '#888', marginBottom: 5, display: 'block' }}>Bid Amount (₹) *</label>
                    <input className="input-field" type="number" placeholder="e.g. 25000" value={proposal.bidAmount} onChange={e => setProposal({ ...proposal, bidAmount: e.target.value })} required />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, color: '#888', marginBottom: 5, display: 'block' }}>Estimated Days *</label>
                    <input className="input-field" type="number" placeholder="e.g. 14" value={proposal.estimatedDays} onChange={e => setProposal({ ...proposal, estimatedDays: e.target.value })} required />
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: 12, color: '#888', marginBottom: 5, display: 'block' }}>Cover Letter *</label>
                  <textarea className="input-field" rows={5} placeholder="Describe your approach, relevant experience, and why you're the best fit..." value={proposal.coverLetter} onChange={e => setProposal({ ...proposal, coverLetter: e.target.value })} required style={{ resize: 'vertical' }} />
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button type="submit" className="btn-primary" disabled={submitting}>{submitting ? 'Submitting...' : 'Submit Proposal'}</button>
                  <button type="button" className="btn-outline" onClick={() => setShowProposalForm(false)}>Cancel</button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div>
          {/* Budget Card */}
          <div className="glass-card" style={{ padding: 24, marginBottom: 16 }}>
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <p style={{ color: '#888', fontSize: 13, marginBottom: 4 }}>Budget Range</p>
              <p style={{ fontSize: 28, fontWeight: 700, color: '#00d4ff' }}>₹{gig.budget?.min?.toLocaleString()} - ₹{gig.budget?.max?.toLocaleString()}</p>
              <span className="badge badge-purple" style={{ marginTop: 6 }}>{gig.budget?.type}</span>
            </div>
            
            {user?.role === 'freelancer' && gig.status === 'open' && (
              <button className="btn-primary" style={{ width: '100%' }} onClick={() => setShowProposalForm(true)}>
                Apply Now →
              </button>
            )}
            {!user && (
              <button className="btn-primary" style={{ width: '100%' }} onClick={() => navigate('/login')}>
                Login to Apply
              </button>
            )}
          </div>

          {/* Client Card */}
          <div className="glass-card" style={{ padding: 24 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 14, color: '#888' }}>ABOUT THE CLIENT</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <img src={gig.client?.avatar || `https://ui-avatars.com/api/?name=${gig.client?.name}&background=00d4ff&color=000`} alt="" style={{ width: 44, height: 44, borderRadius: '50%' }} />
              <div>
                <p style={{ fontWeight: 600, fontSize: 14 }}>{gig.client?.name}</p>
                <p style={{ color: '#666', fontSize: 12 }}>{gig.client?.location?.city}</p>
              </div>
            </div>
            <p style={{ color: '#666', fontSize: 12 }}>Member since {new Date(gig.client?.createdAt).toLocaleDateString('en', { month: 'short', year: 'numeric' })}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GigDetail;

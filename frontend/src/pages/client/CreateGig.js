import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import api from '../../utils/api';

const CATEGORIES = [
  { value: 'webdev', label: 'Web Development', icon: '💻' },
  { value: 'mobile', label: 'Mobile App', icon: '📱' },
  { value: 'design', label: 'UI/UX Design', icon: '🎨' },
  { value: 'datascience', label: 'Data Science', icon: '📊' },
  { value: 'marketing', label: 'Digital Marketing', icon: '📣' },
  { value: 'writing', label: 'Content Writing', icon: '✍️' },
  { value: 'video', label: 'Video Editing', icon: '🎬' },
  { value: 'devops', label: 'DevOps / Cloud', icon: '⚙️' },
];

const SKILLS_LIST = [
  'React.js', 'Node.js', 'MongoDB', 'TypeScript', 'Python', 'Django',
  'Vue.js', 'Angular', 'AWS', 'Docker', 'Figma', 'Flutter',
  'GraphQL', 'Firebase', 'PostgreSQL', 'Redis', 'Next.js', 'TailwindCSS',
];

const STEPS = ['Basic Info', 'Requirements', 'Budget & Timeline', 'Review & Post'];

const CreateGig = () => {
  const navigate = useNavigate();
  const { user } = useSelector(s => s.auth);
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [skillInput, setSkillInput] = useState('');

  const [form, setForm] = useState({
    title: '',
    category: '',
    description: '',
    requirements: '',
    skills: [],
    budget: '',
    budgetType: 'fixed',
    deadline: '',
    experienceLevel: 'intermediate',
    workType: 'remote',
    allowBids: true,
    bidDeadline: '',
    attachments: [],
    visibility: 'public',
  });

  const update = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const addSkill = (skill) => {
    if (!form.skills.includes(skill) && form.skills.length < 10) {
      update('skills', [...form.skills, skill]);
    }
    setSkillInput('');
  };

  const removeSkill = (skill) => update('skills', form.skills.filter(s => s !== skill));

  const filteredSkills = SKILLS_LIST.filter(
    s => s.toLowerCase().includes(skillInput.toLowerCase()) && !form.skills.includes(s)
  );

  const validateStep = () => {
    if (step === 0) {
      if (!form.title.trim()) { toast.error('Please enter a title'); return false; }
      if (!form.category) { toast.error('Please select a category'); return false; }
      if (!form.description.trim() || form.description.length < 50) {
        toast.error('Description must be at least 50 characters'); return false;
      }
    }
    if (step === 1) {
      if (form.skills.length === 0) { toast.error('Add at least one skill'); return false; }
    }
    if (step === 2) {
      if (!form.budget || isNaN(form.budget)) { toast.error('Enter a valid budget'); return false; }
      if (!form.deadline) { toast.error('Please set a deadline'); return false; }
    }
    return true;
  };

  const nextStep = () => { if (validateStep()) setStep(s => Math.min(s + 1, 3)); };
  const prevStep = () => setStep(s => Math.max(s - 1, 0));

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await api.post('/gigs', {
        ...form,
        budget: Number(form.budget),
        postedBy: user._id,
      });
      toast.success('🎉 Gig posted successfully! Freelancers will be notified.');
      navigate('/my-gigs');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to post gig');
    } finally {
      setLoading(false);
    }
  };

  // ─── Styles ───────────────────────────────────────────────────────────────
  const card = {
    background: 'linear-gradient(145deg, #151e2e, #111827)',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: 20,
    boxShadow: '0 4px 30px rgba(0,0,0,0.4)',
  };

  const inputStyle = {
    width: '100%', padding: '12px 16px', boxSizing: 'border-box',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 12, color: '#F1F5F9',
    fontSize: 14, fontFamily: 'Plus Jakarta Sans, sans-serif',
    outline: 'none', transition: 'border-color 0.2s, box-shadow 0.2s',
  };

  const labelStyle = {
    display: 'block', fontSize: 13, fontWeight: 600,
    color: '#94A3B8', marginBottom: 8, letterSpacing: 0.2,
  };

  const sectionTitle = {
    fontSize: 15, fontWeight: 700, color: '#F1F5F9', marginBottom: 18,
    paddingBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.06)',
    display: 'flex', alignItems: 'center', gap: 8,
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0B0F1A', padding: '32px 24px', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
      <div style={{ maxWidth: 820, margin: '0 auto' }}>

        {/* ── Header ── */}
        <div style={{ marginBottom: 32 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 12,
            background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)',
            borderRadius: 999, padding: '4px 14px', fontSize: 12, fontWeight: 600, color: '#818CF8',
          }}>📌 Post a New Gig</div>
          <h1 style={{
            fontSize: 28, fontWeight: 800, fontFamily: 'Syne, Plus Jakarta Sans, sans-serif',
            background: 'linear-gradient(135deg, #F1F5F9, #94A3B8)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            marginBottom: 6,
          }}>Create a Job Posting</h1>
          <p style={{ color: '#64748B', fontSize: 14 }}>Fill in the details below. Freelancers will receive instant notifications.</p>
        </div>

        {/* ── Stepper ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 32 }}>
          {STEPS.map((s, i) => (
            <React.Fragment key={i}>
              <div
                onClick={() => i < step && setStep(i)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  cursor: i < step ? 'pointer' : 'default',
                }}
              >
                <div style={{
                  width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 13, fontWeight: 700,
                  background: i < step
                    ? 'linear-gradient(135deg, #6366F1, #22D3EE)'
                    : i === step
                      ? 'rgba(99,102,241,0.2)'
                      : 'rgba(255,255,255,0.05)',
                  border: i === step ? '2px solid #6366F1' : i < step ? 'none' : '1px solid rgba(255,255,255,0.1)',
                  color: i <= step ? '#fff' : '#475569',
                  boxShadow: i === step ? '0 0 16px rgba(99,102,241,0.4)' : 'none',
                  transition: 'all 0.3s',
                }}>
                  {i < step ? '✓' : i + 1}
                </div>
                <span style={{
                  fontSize: 13, fontWeight: 600,
                  color: i === step ? '#818CF8' : i < step ? '#4ade80' : '#475569',
                  whiteSpace: 'nowrap',
                }}>{s}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div style={{
                  flex: 1, height: 2, margin: '0 10px',
                  background: i < step
                    ? 'linear-gradient(90deg, #6366F1, #22D3EE)'
                    : 'rgba(255,255,255,0.07)',
                  transition: 'background 0.4s',
                }} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* ── STEP 0: Basic Info ── */}
        {step === 0 && (
          <div style={{ ...card, padding: 32 }}>
            <div style={sectionTitle}>✏️ Basic Information</div>

            <div style={{ marginBottom: 22 }}>
              <label style={labelStyle}>Gig Title *</label>
              <input
                style={inputStyle}
                placeholder="e.g. Build a full-stack e-commerce app with React and Node.js"
                value={form.title}
                onChange={e => update('title', e.target.value)}
                maxLength={120}
                onFocus={e => { e.target.style.borderColor = '#6366F1'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.15)'; }}
                onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none'; }}
              />
              <div style={{ fontSize: 11, color: '#475569', marginTop: 4, textAlign: 'right' }}>
                {form.title.length}/120
              </div>
            </div>

            <div style={{ marginBottom: 22 }}>
              <label style={labelStyle}>Category *</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => update('category', cat.value)}
                    style={{
                      padding: '12px 8px', borderRadius: 12, cursor: 'pointer',
                      fontFamily: 'Plus Jakarta Sans, sans-serif',
                      background: form.category === cat.value ? 'rgba(99,102,241,0.18)' : 'rgba(255,255,255,0.03)',
                      border: `1.5px solid ${form.category === cat.value ? 'rgba(99,102,241,0.5)' : 'rgba(255,255,255,0.08)'}`,
                      transition: 'all 0.2s', textAlign: 'center',
                    }}
                  >
                    <div style={{ fontSize: 20, marginBottom: 4 }}>{cat.icon}</div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: form.category === cat.value ? '#818CF8' : '#64748B' }}>{cat.label}</div>
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 22 }}>
              <label style={labelStyle}>Description * <span style={{ color: '#475569', fontWeight: 400 }}>(min. 50 chars)</span></label>
              <textarea
                style={{ ...inputStyle, minHeight: 140, resize: 'vertical', lineHeight: 1.7 }}
                placeholder="Describe the project in detail — what needs to be built, key features, tech stack preferences, and expected deliverables..."
                value={form.description}
                onChange={e => update('description', e.target.value)}
                onFocus={e => { e.target.style.borderColor = '#6366F1'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.15)'; }}
                onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none'; }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                <span style={{ fontSize: 11, color: form.description.length >= 50 ? '#4ade80' : '#F59E0B' }}>
                  {form.description.length >= 50 ? '✓ Good length' : `${50 - form.description.length} more chars needed`}
                </span>
                <span style={{ fontSize: 11, color: '#475569' }}>{form.description.length} chars</span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label style={labelStyle}>Work Type</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {[['remote', '🌍 Remote'], ['onsite', '🏢 On-site'], ['hybrid', '🔀 Hybrid']].map(([val, label]) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => update('workType', val)}
                      style={{
                        flex: 1, padding: '9px 4px', borderRadius: 10, cursor: 'pointer',
                        fontFamily: 'Plus Jakarta Sans, sans-serif',
                        fontSize: 12, fontWeight: 600,
                        background: form.workType === val ? 'rgba(34,211,238,0.12)' : 'rgba(255,255,255,0.03)',
                        border: `1px solid ${form.workType === val ? 'rgba(34,211,238,0.35)' : 'rgba(255,255,255,0.08)'}`,
                        color: form.workType === val ? '#22D3EE' : '#64748B',
                        transition: 'all 0.2s',
                      }}
                    >{label}</button>
                  ))}
                </div>
              </div>
              <div>
                <label style={labelStyle}>Visibility</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {[['public', '🌐 Public'], ['private', '🔒 Private']].map(([val, label]) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => update('visibility', val)}
                      style={{
                        flex: 1, padding: '9px 4px', borderRadius: 10, cursor: 'pointer',
                        fontFamily: 'Plus Jakarta Sans, sans-serif',
                        fontSize: 12, fontWeight: 600,
                        background: form.visibility === val ? 'rgba(99,102,241,0.12)' : 'rgba(255,255,255,0.03)',
                        border: `1px solid ${form.visibility === val ? 'rgba(99,102,241,0.35)' : 'rgba(255,255,255,0.08)'}`,
                        color: form.visibility === val ? '#818CF8' : '#64748B',
                        transition: 'all 0.2s',
                      }}
                    >{label}</button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 1: Requirements ── */}
        {step === 1 && (
          <div style={{ ...card, padding: 32 }}>
            <div style={sectionTitle}>📋 Project Requirements</div>

            <div style={{ marginBottom: 22 }}>
              <label style={labelStyle}>Detailed Requirements</label>
              <textarea
                style={{ ...inputStyle, minHeight: 130, resize: 'vertical', lineHeight: 1.7 }}
                placeholder="List specific requirements:&#10;• Responsive design for mobile and desktop&#10;• User authentication with JWT&#10;• REST API integration&#10;• Payment gateway..."
                value={form.requirements}
                onChange={e => update('requirements', e.target.value)}
                onFocus={e => { e.target.style.borderColor = '#6366F1'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.15)'; }}
                onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none'; }}
              />
            </div>

            <div style={{ marginBottom: 22 }}>
              <label style={labelStyle}>Required Skills * <span style={{ color: '#475569', fontWeight: 400 }}>(max 10)</span></label>

              {/* Selected skills */}
              {form.skills.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
                  {form.skills.map(skill => (
                    <span key={skill} style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                      background: 'rgba(99,102,241,0.15)',
                      border: '1px solid rgba(99,102,241,0.35)',
                      color: '#818CF8', fontSize: 13, fontWeight: 600,
                      padding: '5px 12px', borderRadius: 999,
                    }}>
                      {skill}
                      <button
                        onClick={() => removeSkill(skill)}
                        style={{ background: 'none', border: 'none', color: '#6366F1', cursor: 'pointer', fontSize: 14, padding: 0, lineHeight: 1 }}
                      >×</button>
                    </span>
                  ))}
                </div>
              )}

              {/* Skill input */}
              <div style={{ position: 'relative' }}>
                <input
                  style={inputStyle}
                  placeholder="Type to search skills and press Enter..."
                  value={skillInput}
                  onChange={e => setSkillInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && skillInput.trim()) {
                      e.preventDefault();
                      addSkill(skillInput.trim());
                    }
                  }}
                  onFocus={e => { e.target.style.borderColor = '#6366F1'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.15)'; }}
                  onBlur={e => { setTimeout(() => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none'; }, 200); }}
                />
                {skillInput && filteredSkills.length > 0 && (
                  <div style={{
                    position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50,
                    background: '#1a2540',
                    border: '1px solid rgba(99,102,241,0.3)',
                    borderRadius: 12, marginTop: 4,
                    boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                    maxHeight: 200, overflowY: 'auto',
                  }}>
                    {filteredSkills.slice(0, 6).map(skill => (
                      <div
                        key={skill}
                        onMouseDown={() => addSkill(skill)}
                        style={{
                          padding: '10px 16px', cursor: 'pointer',
                          fontSize: 14, color: '#94A3B8',
                          transition: 'background 0.15s',
                          borderBottom: '1px solid rgba(255,255,255,0.05)',
                        }}
                        onMouseEnter={e => { e.target.style.background = 'rgba(99,102,241,0.12)'; e.target.style.color = '#818CF8'; }}
                        onMouseLeave={e => { e.target.style.background = 'transparent'; e.target.style.color = '#94A3B8'; }}
                      >+ {skill}</div>
                    ))}
                  </div>
                )}
              </div>

              {/* Quick add popular skills */}
              <div style={{ marginTop: 12 }}>
                <div style={{ fontSize: 12, color: '#475569', marginBottom: 8 }}>Quick add:</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {SKILLS_LIST.filter(s => !form.skills.includes(s)).slice(0, 8).map(skill => (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => addSkill(skill)}
                      style={{
                        padding: '5px 12px', borderRadius: 999, cursor: 'pointer',
                        fontFamily: 'Plus Jakarta Sans, sans-serif',
                        fontSize: 12, fontWeight: 500,
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: '#64748B', transition: 'all 0.15s',
                      }}
                      onMouseEnter={e => { e.target.style.background = 'rgba(99,102,241,0.1)'; e.target.style.color = '#818CF8'; e.target.style.borderColor = 'rgba(99,102,241,0.3)'; }}
                      onMouseLeave={e => { e.target.style.background = 'rgba(255,255,255,0.04)'; e.target.style.color = '#64748B'; e.target.style.borderColor = 'rgba(255,255,255,0.1)'; }}
                    >+ {skill}</button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label style={labelStyle}>Experience Level Required</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                {[
                  { value: 'beginner', icon: '🌱', label: 'Beginner', sub: '0–1 years' },
                  { value: 'intermediate', icon: '⚡', label: 'Intermediate', sub: '2–4 years' },
                  { value: 'expert', icon: '🏆', label: 'Expert', sub: '5+ years' },
                ].map(lvl => (
                  <button
                    key={lvl.value}
                    type="button"
                    onClick={() => update('experienceLevel', lvl.value)}
                    style={{
                      padding: '16px 12px', borderRadius: 12, cursor: 'pointer',
                      fontFamily: 'Plus Jakarta Sans, sans-serif', textAlign: 'center',
                      background: form.experienceLevel === lvl.value ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.03)',
                      border: `1.5px solid ${form.experienceLevel === lvl.value ? 'rgba(99,102,241,0.5)' : 'rgba(255,255,255,0.08)'}`,
                      transition: 'all 0.2s',
                    }}
                  >
                    <div style={{ fontSize: 22, marginBottom: 4 }}>{lvl.icon}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: form.experienceLevel === lvl.value ? '#818CF8' : '#94A3B8', marginBottom: 2 }}>{lvl.label}</div>
                    <div style={{ fontSize: 11, color: '#475569' }}>{lvl.sub}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 2: Budget & Timeline ── */}
        {step === 2 && (
          <div style={{ ...card, padding: 32 }}>
            <div style={sectionTitle}>💰 Budget & Timeline</div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 22 }}>
              <div>
                <label style={labelStyle}>Budget Type</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {[['fixed', '💎 Fixed Price'], ['hourly', '⏱ Hourly Rate']].map(([val, label]) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => update('budgetType', val)}
                      style={{
                        flex: 1, padding: '11px 8px', borderRadius: 12, cursor: 'pointer',
                        fontFamily: 'Plus Jakarta Sans, sans-serif',
                        fontSize: 13, fontWeight: 600,
                        background: form.budgetType === val ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.03)',
                        border: `1.5px solid ${form.budgetType === val ? 'rgba(99,102,241,0.5)' : 'rgba(255,255,255,0.08)'}`,
                        color: form.budgetType === val ? '#818CF8' : '#64748B',
                        transition: 'all 0.2s',
                      }}
                    >{label}</button>
                  ))}
                </div>
              </div>
              <div>
                <label style={labelStyle}>
                  {form.budgetType === 'fixed' ? 'Budget (₹) *' : 'Hourly Rate (₹/hr) *'}
                </label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#6366F1', fontWeight: 700, fontSize: 15 }}>₹</span>
                  <input
                    type="number"
                    style={{ ...inputStyle, paddingLeft: 30 }}
                    placeholder={form.budgetType === 'fixed' ? '50000' : '1500'}
                    value={form.budget}
                    onChange={e => update('budget', e.target.value)}
                    min="0"
                    onFocus={e => { e.target.style.borderColor = '#6366F1'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.15)'; }}
                    onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 22 }}>
              <div>
                <label style={labelStyle}>Project Deadline *</label>
                <input
                  type="date"
                  style={{ ...inputStyle, colorScheme: 'dark' }}
                  value={form.deadline}
                  onChange={e => update('deadline', e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  onFocus={e => { e.target.style.borderColor = '#6366F1'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.15)'; }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none'; }}
                />
              </div>
              <div>
                <label style={labelStyle}>Bid Submission Deadline</label>
                <input
                  type="date"
                  style={{ ...inputStyle, colorScheme: 'dark' }}
                  value={form.bidDeadline}
                  onChange={e => update('bidDeadline', e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  onFocus={e => { e.target.style.borderColor = '#6366F1'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.15)'; }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none'; }}
                />
              </div>
            </div>

            {/* Allow Bids toggle */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: 20, background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14,
              marginBottom: 16,
            }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#E2E8F0', marginBottom: 3 }}>Allow Freelancers to Bid</div>
                <div style={{ fontSize: 12, color: '#64748B' }}>Freelancers can place competitive bids on this gig</div>
              </div>
              <div
                onClick={() => update('allowBids', !form.allowBids)}
                style={{
                  width: 52, height: 28, borderRadius: 999, cursor: 'pointer',
                  background: form.allowBids ? 'linear-gradient(135deg, #6366F1, #22D3EE)' : 'rgba(255,255,255,0.1)',
                  position: 'relative', transition: 'background 0.3s',
                  boxShadow: form.allowBids ? '0 0 12px rgba(99,102,241,0.4)' : 'none',
                }}
              >
                <div style={{
                  position: 'absolute', top: 3, left: form.allowBids ? 27 : 3,
                  width: 22, height: 22, borderRadius: '50%', background: '#fff',
                  transition: 'left 0.3s', boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                }} />
              </div>
            </div>

            {/* Budget estimate info */}
            {form.budget && (
              <div style={{
                padding: 18,
                background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(34,211,238,0.05))',
                border: '1px solid rgba(99,102,241,0.2)', borderRadius: 14,
              }}>
                <div style={{ fontSize: 12, color: '#64748B', marginBottom: 8 }}>💡 Budget Overview</div>
                <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ fontSize: 22, fontWeight: 800, background: 'linear-gradient(135deg, #6366F1, #22D3EE)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontFamily: 'Syne, Plus Jakarta Sans, sans-serif' }}>
                      ₹{Number(form.budget).toLocaleString()}
                    </div>
                    <div style={{ fontSize: 11, color: '#64748B' }}>{form.budgetType === 'fixed' ? 'Total Budget' : 'Per Hour'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: '#4ade80', fontFamily: 'Syne, Plus Jakarta Sans, sans-serif' }}>
                      ₹{Math.round(Number(form.budget) * 0.9).toLocaleString()}
                    </div>
                    <div style={{ fontSize: 11, color: '#64748B' }}>You receive (after 10% fee)</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── STEP 3: Review ── */}
        {step === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Review card */}
            <div style={{ ...card, padding: 28 }}>
              <div style={sectionTitle}>👁 Review Your Posting</div>

              <div style={{
                background: 'rgba(255,255,255,0.03)', borderRadius: 14,
                padding: 20, marginBottom: 20,
                border: '1px solid rgba(255,255,255,0.07)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                  <div>
                    <h3 style={{ fontSize: 18, fontWeight: 800, color: '#F1F5F9', marginBottom: 6, fontFamily: 'Syne, Plus Jakarta Sans, sans-serif' }}>
                      {form.title || 'Untitled Gig'}
                    </h3>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <span style={{ background: 'rgba(99,102,241,0.12)', color: '#818CF8', border: '1px solid rgba(99,102,241,0.25)', fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 999 }}>
                        {CATEGORIES.find(c => c.value === form.category)?.label || 'No category'}
                      </span>
                      <span style={{ background: 'rgba(34,211,238,0.1)', color: '#22D3EE', border: '1px solid rgba(34,211,238,0.2)', fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 999 }}>
                        {form.workType}
                      </span>
                      <span style={{ background: 'rgba(251,191,36,0.1)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.2)', fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 999 }}>
                        {form.experienceLevel}
                      </span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 22, fontWeight: 800, background: 'linear-gradient(135deg, #6366F1, #22D3EE)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontFamily: 'Syne, Plus Jakarta Sans, sans-serif' }}>
                      ₹{Number(form.budget || 0).toLocaleString()}
                    </div>
                    <div style={{ fontSize: 11, color: '#64748B' }}>{form.budgetType}</div>
                  </div>
                </div>

                <p style={{ fontSize: 13, color: '#94A3B8', lineHeight: 1.7, marginBottom: 14 }}>{form.description}</p>

                {form.skills.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {form.skills.map(skill => (
                      <span key={skill} style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)', color: '#818CF8', fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 999 }}>{skill}</span>
                    ))}
                  </div>
                )}
              </div>

              {/* Checklist */}
              <div style={{ fontSize: 13, fontWeight: 600, color: '#64748B', marginBottom: 12 }}>Posting Checklist</div>
              {[
                { label: 'Title added', done: !!form.title },
                { label: 'Category selected', done: !!form.category },
                { label: 'Description (50+ chars)', done: form.description.length >= 50 },
                { label: 'Skills added', done: form.skills.length > 0 },
                { label: 'Budget set', done: !!form.budget },
                { label: 'Deadline set', done: !!form.deadline },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <div style={{
                    width: 20, height: 20, borderRadius: '50%',
                    background: item.done ? 'linear-gradient(135deg, #6366F1, #22D3EE)' : 'rgba(255,255,255,0.07)',
                    border: item.done ? 'none' : '1px solid rgba(255,255,255,0.15)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, color: '#fff', flexShrink: 0,
                  }}>{item.done ? '✓' : ''}</div>
                  <span style={{ fontSize: 13, color: item.done ? '#94A3B8' : '#64748B', textDecoration: item.done ? 'none' : 'none' }}>{item.label}</span>
                  {!item.done && <span style={{ fontSize: 11, color: '#F59E0B' }}>⚠ Incomplete</span>}
                </div>
              ))}
            </div>

            {/* Notification info */}
            <div style={{
              padding: 20,
              background: 'linear-gradient(135deg, rgba(34,211,238,0.08), rgba(99,102,241,0.06))',
              border: '1px solid rgba(34,211,238,0.2)', borderRadius: 16,
              display: 'flex', gap: 14, alignItems: 'flex-start',
            }}>
              <div style={{ fontSize: 28, flexShrink: 0 }}>🔔</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#F1F5F9', marginBottom: 4 }}>Notifications will be sent automatically</div>
                <div style={{ fontSize: 13, color: '#64748B', lineHeight: 1.7 }}>
                  All freelancers matching your skill requirements will receive an instant in-app notification and email alert about this new gig.
                  {form.allowBids && ' Bidding will be open until your specified bid deadline.'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Navigation Buttons ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 24 }}>
          <button
            onClick={prevStep}
            disabled={step === 0}
            style={{
              padding: '12px 24px', borderRadius: 12, cursor: step === 0 ? 'not-allowed' : 'pointer',
              fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 14, fontWeight: 600,
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
              color: step === 0 ? '#2d3748' : '#94A3B8', transition: 'all 0.2s',
            }}
          >← Previous</button>

          <div style={{ display: 'flex', gap: 6 }}>
            {STEPS.map((_, i) => (
              <div key={i} style={{
                width: i === step ? 24 : 8, height: 8, borderRadius: 999,
                background: i === step ? 'linear-gradient(90deg, #6366F1, #22D3EE)' : i < step ? '#4ade80' : 'rgba(255,255,255,0.1)',
                transition: 'all 0.3s',
              }} />
            ))}
          </div>

          {step < 3 ? (
            <button
              onClick={nextStep}
              style={{
                padding: '12px 28px', borderRadius: 12, cursor: 'pointer',
                fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 14, fontWeight: 700,
                background: 'linear-gradient(135deg, #6366F1, #22D3EE)',
                border: 'none', color: '#fff',
                boxShadow: '0 4px 16px rgba(99,102,241,0.4)', transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 8px 24px rgba(99,102,241,0.5)'; }}
              onMouseLeave={e => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = '0 4px 16px rgba(99,102,241,0.4)'; }}
            >Continue →</button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{
                padding: '12px 28px', borderRadius: 12, cursor: loading ? 'not-allowed' : 'pointer',
                fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 14, fontWeight: 700,
                background: loading ? 'rgba(99,102,241,0.4)' : 'linear-gradient(135deg, #6366F1, #22D3EE)',
                border: 'none', color: '#fff',
                boxShadow: '0 4px 16px rgba(99,102,241,0.4)', transition: 'all 0.2s',
                display: 'flex', alignItems: 'center', gap: 8,
              }}
            >
              {loading ? (
                <>
                  <span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
                  Posting...
                </>
              ) : '🚀 Post Gig & Notify Freelancers'}
            </button>
          )}
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default CreateGig;
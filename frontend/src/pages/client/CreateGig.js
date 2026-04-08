import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const STEPS = [
  { id: 1, label: 'Basic Info',       icon: '📋', desc: 'Title, category & description' },
  { id: 2, label: 'Requirements',     icon: '🎯', desc: 'Skills, milestones & timeline' },
  { id: 3, label: 'Budget & Review',  icon: '💰', desc: 'Pricing and final review' },
];

const CATEGORIES = [
  { value:'webdev',     label:'Web Development',    icon:'💻' },
  { value:'mobile',     label:'Mobile App',          icon:'📱' },
  { value:'design',     label:'UI/UX Design',        icon:'🎨' },
  { value:'datascience',label:'Data Science',        icon:'📊' },
  { value:'marketing',  label:'Digital Marketing',   icon:'📣' },
  { value:'writing',    label:'Content Writing',     icon:'✍️' },
  { value:'video',      label:'Video Editing',       icon:'🎬' },
  { value:'devops',     label:'DevOps / Cloud',      icon:'⚙️' },
  { value:'consulting', label:'Consulting',          icon:'💡' },
];

const SKILLS_POOL = [
  'React.js','Node.js','MongoDB','TypeScript','Python','Django',
  'Vue.js','Angular','AWS','Docker','Figma','Flutter',
  'GraphQL','Firebase','PostgreSQL','Redis','Next.js','TailwindCSS',
  'Swift','Kotlin','PHP','Laravel','WordPress','Shopify',
];

const CreateGig = () => {
  const navigate       = useNavigate();
  const { user }       = useSelector(s => s.auth || {});
  const [step,  setStep]  = useState(1);
  const [saving,setSaving]= useState(false);
  const [skillInput, setSkillInput] = useState('');
  const [showSkillDrop, setShowSkillDrop] = useState(false);

  const [form, setForm] = useState({
    // Step 1
    title:        '',
    category:     '',
    description:  '',
    workType:     'remote',
    visibility:   'public',
    // Step 2
    skills:       [],
    requirements: '',
    experienceLevel: 'intermediate',
    deadline:     '',
    milestones:   [{ title:'', description:'', amount:'', deadline:'' }],
    allowBids:    true,
    bidDeadline:  '',
    // Step 3
    budget:       '',
    budgetType:   'fixed',
    attachments:  [],
  });

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  // Skills helpers
  const addSkill = (s) => {
    if (!form.skills.includes(s) && form.skills.length < 12) {
      set('skills', [...form.skills, s]);
    }
    setSkillInput(''); setShowSkillDrop(false);
  };
  const removeSkill = (s) => set('skills', form.skills.filter(x => x !== s));
  const filteredSkills = SKILLS_POOL.filter(s => s.toLowerCase().includes(skillInput.toLowerCase()) && !form.skills.includes(s));

  // Milestone helpers
  const addMilestone = () => {
    if (form.milestones.length >= 5) { toast.error('Max 5 milestones'); return; }
    set('milestones', [...form.milestones, { title:'', description:'', amount:'', deadline:'' }]);
  };
  const updateMilestone = (i, key, val) => {
    const updated = form.milestones.map((m, idx) => idx === i ? { ...m, [key]: val } : m);
    set('milestones', updated);
  };
  const removeMilestone = (i) => {
    if (form.milestones.length === 1) return;
    set('milestones', form.milestones.filter((_,idx) => idx !== i));
  };

  // Validation
  const validate = () => {
    if (step === 1) {
      if (!form.title.trim())    { toast.error('Add a title'); return false; }
      if (!form.category)        { toast.error('Select a category'); return false; }
      if (form.description.length < 40) { toast.error('Description needs at least 40 characters'); return false; }
    }
    if (step === 2) {
      if (form.skills.length === 0) { toast.error('Add at least one skill'); return false; }
      if (!form.deadline)           { toast.error('Set a project deadline'); return false; }
    }
    if (step === 3) {
      if (!form.budget || isNaN(form.budget)) { toast.error('Enter a valid budget'); return false; }
    }
    return true;
  };

  const next = () => { if (validate()) setStep(s => Math.min(s + 1, 3)); };
  const prev = () => setStep(s => Math.max(s - 1, 1));

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = {
        ...form,
        budget: Number(form.budget),
        milestones: form.milestones.filter(m => m.title.trim()),
      };
      await api.post('/gigs', payload);
      toast.success('🎉 Job posted! Freelancers have been notified.');
      navigate('/my-gigs');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to post job');
    } finally {
      setSaving(false);
    }
  };

  // ── Styles ──────────────────────────────────────────────────
  const card   = { background:'#fff', border:'1px solid #e5e7eb', borderRadius:16, padding:24, boxShadow:'0 2px 8px rgba(0,0,0,0.04)' };
  const label  = { display:'block', fontSize:13, fontWeight:600, color:'#374151', marginBottom:6 };
  const input  = { width:'100%', padding:'10px 14px', background:'#f8fafc', border:'1px solid #e5e7eb', borderRadius:10, color:'#111827', fontSize:14, fontFamily:'inherit', outline:'none', boxSizing:'border-box', transition:'border-color 0.2s' };
  const fi = e => e.target.style.borderColor='#4f46e5';
  const bi = e => e.target.style.borderColor='#e5e7eb';

  const totalMilestoneAmt = form.milestones.reduce((a,m) => a + (Number(m.amount)||0), 0);

  return (
    <div style={{ minHeight:'100vh', background:'#f8fafc', fontFamily:"'Plus Jakarta Sans',sans-serif" }}>

      {/* ── HEADER ── */}
      <div style={{ background:'linear-gradient(135deg,#1e1b4b,#312e81,#1e40af)', padding:'32px 52px 72px', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', inset:0, backgroundImage:'radial-gradient(circle at 80% 50%, rgba(99,102,241,0.15) 0%, transparent 50%)', pointerEvents:'none' }} />
        <div style={{ maxWidth:860, margin:'0 auto', position:'relative', zIndex:1 }}>
          <p style={{ color:'#a5b4fc', fontSize:13, marginBottom:8 }}>Client · Post a Job</p>
          <h1 style={{ fontSize:28, fontWeight:900, color:'#fff', fontFamily:'Syne, sans-serif', marginBottom:4 }}>Create Job Posting</h1>
          <p style={{ color:'#a5b4fc', fontSize:14 }}>Fill in the details below. Verified freelancers will be notified instantly.</p>
        </div>
      </div>

      <div style={{ maxWidth:860, margin:'-48px auto 0', padding:'0 24px 60px', position:'relative', zIndex:2 }}>

        {/* ── STEPPER ── */}
        <div style={{ ...card, padding:'20px 28px', marginBottom:20, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          {STEPS.map((s, i) => (
            <React.Fragment key={s.id}>
              <div style={{ display:'flex', alignItems:'center', gap:12, cursor: s.id < step ? 'pointer' : 'default' }} onClick={() => s.id < step && setStep(s.id)}>
                <div style={{
                  width:42, height:42, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize: s.id < step ? 18 : 15, fontWeight:700, flexShrink:0,
                  background: s.id < step ? '#dcfce7' : s.id === step ? 'linear-gradient(135deg,#4f46e5,#6366F1)' : '#f1f5f9',
                  color:      s.id < step ? '#16a34a' : s.id === step ? '#fff' : '#9ca3af',
                  boxShadow:  s.id === step ? '0 4px 14px rgba(79,70,229,0.35)' : 'none',
                  border:     s.id === step ? '3px solid #e0e7ff' : '3px solid transparent',
                  transition:'all 0.3s',
                }}>
                  {s.id < step ? '✓' : s.icon}
                </div>
                <div>
                  <div style={{ fontSize:13, fontWeight:700, color: s.id === step ? '#4f46e5' : s.id < step ? '#16a34a' : '#9ca3af' }}>{s.label}</div>
                  <div style={{ fontSize:11, color:'#9ca3af' }}>{s.desc}</div>
                </div>
              </div>
              {i < STEPS.length - 1 && (
                <div style={{ flex:1, height:2, margin:'0 16px', background: step > s.id ? '#4f46e5' : '#e5e7eb', borderRadius:1, transition:'background 0.4s' }} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* ══ STEP 1: Basic Info ══ */}
        {step === 1 && (
          <div style={{ display:'flex', flexDirection:'column', gap:18 }}>
            <div style={card}>
              <h2 style={{ fontSize:16, fontWeight:800, color:'#111827', marginBottom:20 }}>📋 Basic Information</h2>

              <div style={{ marginBottom:18 }}>
                <label style={label}>Job Title *</label>
                <input style={input} value={form.title} onChange={e=>set('title',e.target.value)} onFocus={fi} onBlur={bi} placeholder="e.g. Build a full-stack e-commerce app with React and Node.js" maxLength={120} />
                <div style={{ textAlign:'right', fontSize:11, color:'#9ca3af', marginTop:4 }}>{form.title.length}/120</div>
              </div>

              <div style={{ marginBottom:18 }}>
                <label style={label}>Category *</label>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10 }}>
                  {CATEGORIES.map(cat => (
                    <button key={cat.value} type="button" onClick={()=>set('category',cat.value)} style={{
                      padding:'12px 10px', borderRadius:12, cursor:'pointer', fontFamily:'inherit', textAlign:'center', transition:'all 0.2s',
                      background: form.category===cat.value ? '#f5f3ff' : '#f8fafc',
                      border:     `1.5px solid ${form.category===cat.value ? '#4f46e5' : '#e5e7eb'}`,
                      boxShadow:  form.category===cat.value ? '0 0 0 3px rgba(79,70,229,0.12)' : 'none',
                    }}>
                      <div style={{ fontSize:20, marginBottom:4 }}>{cat.icon}</div>
                      <div style={{ fontSize:12, fontWeight:600, color: form.category===cat.value ? '#4f46e5' : '#6b7280' }}>{cat.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom:18 }}>
                <label style={label}>Description * <span style={{ color:'#9ca3af', fontWeight:400 }}>(min. 40 chars)</span></label>
                <textarea style={{ ...input, minHeight:120, resize:'vertical', lineHeight:1.7 }} value={form.description} onChange={e=>set('description',e.target.value)} onFocus={fi} onBlur={bi} placeholder="Describe the project in detail — what needs to be built, key features, tech stack preferences, expected deliverables..." />
                <div style={{ display:'flex', justifyContent:'space-between', marginTop:4 }}>
                  <span style={{ fontSize:11, color: form.description.length>=40 ? '#16a34a':'#f59e0b', fontWeight:500 }}>{form.description.length>=40 ? '✓ Good length' : `${40-form.description.length} more chars needed`}</span>
                  <span style={{ fontSize:11, color:'#9ca3af' }}>{form.description.length} chars</span>
                </div>
              </div>

              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
                <div>
                  <label style={label}>Work Type</label>
                  <div style={{ display:'flex', gap:8 }}>
                    {[['remote','🌍 Remote'],['onsite','🏢 On-site'],['hybrid','🔀 Hybrid']].map(([v,l])=>(
                      <button key={v} type="button" onClick={()=>set('workType',v)} style={{ flex:1, padding:'9px 4px', borderRadius:10, cursor:'pointer', fontFamily:'inherit', fontSize:12, fontWeight:600, transition:'all 0.2s', background:form.workType===v?'#ede9fe':'#f8fafc', border:`1px solid ${form.workType===v?'#4f46e5':'#e5e7eb'}`, color:form.workType===v?'#4f46e5':'#6b7280' }}>{l}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label style={label}>Visibility</label>
                  <div style={{ display:'flex', gap:8 }}>
                    {[['public','🌐 Public'],['private','🔒 Private']].map(([v,l])=>(
                      <button key={v} type="button" onClick={()=>set('visibility',v)} style={{ flex:1, padding:'9px 4px', borderRadius:10, cursor:'pointer', fontFamily:'inherit', fontSize:12, fontWeight:600, transition:'all 0.2s', background:form.visibility===v?'#ede9fe':'#f8fafc', border:`1px solid ${form.visibility===v?'#4f46e5':'#e5e7eb'}`, color:form.visibility===v?'#4f46e5':'#6b7280' }}>{l}</button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══ STEP 2: Requirements ══ */}
        {step === 2 && (
          <div style={{ display:'flex', flexDirection:'column', gap:18 }}>

            {/* Skills */}
            <div style={card}>
              <h2 style={{ fontSize:16, fontWeight:800, color:'#111827', marginBottom:18 }}>🎯 Skills & Requirements</h2>

              <div style={{ marginBottom:20 }}>
                <label style={label}>Required Skills * <span style={{ color:'#9ca3af', fontWeight:400 }}>(max 12)</span></label>
                {form.skills.length > 0 && (
                  <div style={{ display:'flex', flexWrap:'wrap', gap:7, marginBottom:10 }}>
                    {form.skills.map(s=>(
                      <span key={s} style={{ display:'inline-flex', alignItems:'center', gap:5, fontSize:13, fontWeight:600, padding:'5px 12px', borderRadius:999, background:'#ede9fe', color:'#7c3aed', border:'1px solid #ddd6fe' }}>
                        {s}
                        <button onClick={()=>removeSkill(s)} style={{ background:'none', border:'none', cursor:'pointer', color:'#a78bfa', fontSize:15, lineHeight:1, padding:0 }}>×</button>
                      </span>
                    ))}
                  </div>
                )}
                <div style={{ position:'relative' }}>
                  <input style={input} placeholder="Search and add skills…" value={skillInput}
                    onChange={e=>{ setSkillInput(e.target.value); setShowSkillDrop(true); }}
                    onFocus={()=>setShowSkillDrop(true)}
                    onBlur={()=>setTimeout(()=>setShowSkillDrop(false),200)}
                    onKeyDown={e=>{ if(e.key==='Enter'&&skillInput.trim()){ e.preventDefault(); addSkill(skillInput.trim()); } }}
                  />
                  {showSkillDrop && skillInput && filteredSkills.length > 0 && (
                    <div style={{ position:'absolute', top:'100%', left:0, right:0, zIndex:50, background:'#fff', border:'1px solid #e5e7eb', borderRadius:12, boxShadow:'0 8px 24px rgba(0,0,0,0.1)', maxHeight:180, overflowY:'auto', marginTop:4 }}>
                      {filteredSkills.slice(0,6).map(s=>(
                        <div key={s} onMouseDown={()=>addSkill(s)} style={{ padding:'10px 16px', fontSize:14, color:'#374151', cursor:'pointer', transition:'background 0.15s', borderBottom:'1px solid #f9fafb' }}
                          onMouseEnter={e=>e.target.style.background='#f5f3ff'}
                          onMouseLeave={e=>e.target.style.background='transparent'}>
                          + {s}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div style={{ marginTop:10, display:'flex', flexWrap:'wrap', gap:6 }}>
                  {SKILLS_POOL.filter(s=>!form.skills.includes(s)).slice(0,8).map(s=>(
                    <button key={s} onClick={()=>addSkill(s)} style={{ padding:'5px 12px', borderRadius:999, fontSize:12, fontWeight:500, cursor:'pointer', fontFamily:'inherit', background:'#f8fafc', border:'1px solid #e5e7eb', color:'#6b7280', transition:'all 0.15s' }}
                      onMouseEnter={e=>{ e.target.style.background='#f5f3ff'; e.target.style.color='#7c3aed'; e.target.style.borderColor='#ddd6fe'; }}
                      onMouseLeave={e=>{ e.target.style.background='#f8fafc'; e.target.style.color='#6b7280'; e.target.style.borderColor='#e5e7eb'; }}>
                      + {s}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom:18 }}>
                <label style={label}>Detailed Requirements</label>
                <textarea style={{ ...input, minHeight:100, resize:'vertical', lineHeight:1.7 }} value={form.requirements} onChange={e=>set('requirements',e.target.value)} onFocus={fi} onBlur={bi} placeholder="List specific requirements:&#10;• Responsive design for mobile and desktop&#10;• User authentication with JWT&#10;• Payment gateway integration" />
              </div>

              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
                <div>
                  <label style={label}>Experience Level</label>
                  <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                    {[['beginner','🌱 Beginner','0–1 years'],['intermediate','⚡ Intermediate','2–4 years'],['expert','🏆 Expert','5+ years']].map(([v,l,sub])=>(
                      <div key={v} onClick={()=>set('experienceLevel',v)} style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 14px', borderRadius:10, cursor:'pointer', transition:'all 0.2s', background:form.experienceLevel===v?'#f5f3ff':'#f8fafc', border:`1.5px solid ${form.experienceLevel===v?'#4f46e5':'#e5e7eb'}` }}>
                        <div style={{ width:16, height:16, borderRadius:'50%', flexShrink:0, background:form.experienceLevel===v?'#4f46e5':'transparent', border:form.experienceLevel===v?'none':'2px solid #d1d5db', display:'flex', alignItems:'center', justifyContent:'center' }}>
                          {form.experienceLevel===v && <div style={{ width:5, height:5, borderRadius:'50%', background:'#fff' }} />}
                        </div>
                        <div>
                          <div style={{ fontSize:13, fontWeight:600, color:form.experienceLevel===v?'#4f46e5':'#374151' }}>{l}</div>
                          <div style={{ fontSize:11, color:'#9ca3af' }}>{sub}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <div style={{ marginBottom:16 }}>
                    <label style={label}>Project Deadline *</label>
                    <input type="date" style={{ ...input, colorScheme:'light' }} value={form.deadline} onChange={e=>set('deadline',e.target.value)} onFocus={fi} onBlur={bi} min={new Date().toISOString().split('T')[0]} />
                  </div>
                  <div>
                    <label style={label}>Bid Submission Deadline</label>
                    <input type="date" style={{ ...input, colorScheme:'light' }} value={form.bidDeadline} onChange={e=>set('bidDeadline',e.target.value)} onFocus={fi} onBlur={bi} min={new Date().toISOString().split('T')[0]} />
                  </div>
                  <div style={{ marginTop:14 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 14px', background:'#f8fafc', borderRadius:10, border:'1px solid #e5e7eb', cursor:'pointer' }} onClick={()=>set('allowBids',!form.allowBids)}>
                      <span style={{ fontSize:13, fontWeight:600, color:'#374151' }}>Allow freelancer bids</span>
                      <div style={{ width:44, height:22, borderRadius:999, background:form.allowBids?'#4f46e5':'#e5e7eb', position:'relative', transition:'background 0.3s' }}>
                        <div style={{ position:'absolute', top:2, left:form.allowBids?23:2, width:18, height:18, borderRadius:'50%', background:'#fff', transition:'left 0.3s', boxShadow:'0 1px 4px rgba(0,0,0,0.2)' }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Milestones */}
            <div style={card}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
                <div>
                  <h2 style={{ fontSize:16, fontWeight:800, color:'#111827', marginBottom:2 }}>🏁 Project Milestones</h2>
                  <p style={{ fontSize:12, color:'#9ca3af' }}>Break project into smaller deliverables (optional, max 5)</p>
                </div>
                <button onClick={addMilestone} style={{ padding:'8px 16px', borderRadius:10, background:'#f5f3ff', border:'1px solid #ede9fe', color:'#4f46e5', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>+ Add</button>
              </div>

              {form.milestones.map((m,i)=>(
                <div key={i} style={{ background:'#f8fafc', border:'1px solid #e5e7eb', borderRadius:14, padding:18, marginBottom:12, position:'relative' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>
                    <div style={{ width:24, height:24, borderRadius:'50%', background:'#4f46e5', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:800, flexShrink:0 }}>{i+1}</div>
                    <span style={{ fontSize:14, fontWeight:700, color:'#374151' }}>Milestone {i+1}</span>
                    {form.milestones.length > 1 && (
                      <button onClick={()=>removeMilestone(i)} style={{ marginLeft:'auto', background:'none', border:'none', cursor:'pointer', color:'#ef4444', fontSize:18, lineHeight:1 }}>×</button>
                    )}
                  </div>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                    <div style={{ gridColumn:'1/-1' }}>
                      <label style={{ ...label, fontSize:12 }}>Milestone Title</label>
                      <input style={{ ...input, fontSize:13 }} value={m.title} onChange={e=>updateMilestone(i,'title',e.target.value)} onFocus={fi} onBlur={bi} placeholder="e.g. UI Design Mockups" />
                    </div>
                    <div>
                      <label style={{ ...label, fontSize:12 }}>Amount (₹)</label>
                      <input type="number" style={{ ...input, fontSize:13 }} value={m.amount} onChange={e=>updateMilestone(i,'amount',e.target.value)} onFocus={fi} onBlur={bi} placeholder="0" />
                    </div>
                    <div>
                      <label style={{ ...label, fontSize:12 }}>Due Date</label>
                      <input type="date" style={{ ...input, fontSize:13, colorScheme:'light' }} value={m.deadline} onChange={e=>updateMilestone(i,'deadline',e.target.value)} onFocus={fi} onBlur={bi} />
                    </div>
                    <div style={{ gridColumn:'1/-1' }}>
                      <label style={{ ...label, fontSize:12 }}>Description</label>
                      <input style={{ ...input, fontSize:13 }} value={m.description} onChange={e=>updateMilestone(i,'description',e.target.value)} onFocus={fi} onBlur={bi} placeholder="What will be delivered in this milestone?" />
                    </div>
                  </div>
                </div>
              ))}

              {totalMilestoneAmt > 0 && (
                <div style={{ padding:'12px 16px', background:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:10, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <span style={{ fontSize:13, color:'#15803d' }}>Total milestone amount:</span>
                  <span style={{ fontSize:16, fontWeight:800, color:'#15803d' }}>₹{totalMilestoneAmt.toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ══ STEP 3: Budget & Review ══ */}
        {step === 3 && (
          <div style={{ display:'flex', flexDirection:'column', gap:18 }}>
            <div style={card}>
              <h2 style={{ fontSize:16, fontWeight:800, color:'#111827', marginBottom:20 }}>💰 Budget</h2>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:20 }}>
                <div>
                  <label style={label}>Budget Type</label>
                  <div style={{ display:'flex', gap:8 }}>
                    {[['fixed','💎 Fixed Price'],['hourly','⏱ Hourly Rate']].map(([v,l])=>(
                      <button key={v} type="button" onClick={()=>set('budgetType',v)} style={{ flex:1, padding:'11px 8px', borderRadius:12, cursor:'pointer', fontFamily:'inherit', fontSize:13, fontWeight:600, transition:'all 0.2s', background:form.budgetType===v?'#f5f3ff':'#f8fafc', border:`1.5px solid ${form.budgetType===v?'#4f46e5':'#e5e7eb'}`, color:form.budgetType===v?'#4f46e5':'#6b7280' }}>{l}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label style={label}>{form.budgetType==='fixed'?'Total Budget (₹) *':'Hourly Rate (₹/hr) *'}</label>
                  <div style={{ position:'relative' }}>
                    <span style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'#4f46e5', fontWeight:700, fontSize:16 }}>₹</span>
                    <input type="number" style={{ ...input, paddingLeft:28 }} value={form.budget} onChange={e=>set('budget',e.target.value)} onFocus={fi} onBlur={bi} placeholder={form.budgetType==='fixed'?'50000':'1500'} min={0} />
                  </div>
                </div>
              </div>

              {form.budget > 0 && (
                <div style={{ padding:18, background:'linear-gradient(135deg,rgba(79,70,229,0.06),rgba(34,211,238,0.04))', border:'1px solid #c7d2fe', borderRadius:12, display:'flex', gap:24, flexWrap:'wrap' }}>
                  <div>
                    <div style={{ fontSize:11, color:'#6b7280', marginBottom:2 }}>You post</div>
                    <div style={{ fontSize:22, fontWeight:900, color:'#4f46e5', fontFamily:'Syne, sans-serif' }}>₹{Number(form.budget).toLocaleString()}</div>
                  </div>
                  <div style={{ width:1, background:'#e5e7eb' }} />
                  <div>
                    <div style={{ fontSize:11, color:'#6b7280', marginBottom:2 }}>Platform fee (10%)</div>
                    <div style={{ fontSize:22, fontWeight:900, color:'#dc2626', fontFamily:'Syne, sans-serif' }}>₹{Math.round(Number(form.budget)*0.10).toLocaleString()}</div>
                  </div>
                  <div style={{ width:1, background:'#e5e7eb' }} />
                  <div>
                    <div style={{ fontSize:11, color:'#6b7280', marginBottom:2 }}>Freelancer receives</div>
                    <div style={{ fontSize:22, fontWeight:900, color:'#16a34a', fontFamily:'Syne, sans-serif' }}>₹{Math.round(Number(form.budget)*0.90).toLocaleString()}</div>
                  </div>
                </div>
              )}
            </div>

            {/* Review summary */}
            <div style={card}>
              <h2 style={{ fontSize:16, fontWeight:800, color:'#111827', marginBottom:16 }}>👁 Review Your Posting</h2>
              <div style={{ background:'#f8fafc', border:'1px solid #e5e7eb', borderRadius:14, padding:20, marginBottom:16 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12, flexWrap:'wrap', gap:10 }}>
                  <h3 style={{ fontSize:17, fontWeight:800, color:'#111827', fontFamily:'Syne, sans-serif' }}>{form.title||'Untitled Job'}</h3>
                  <span style={{ fontSize:20, fontWeight:900, color:'#4f46e5', fontFamily:'Syne, sans-serif' }}>{form.budget?`₹${Number(form.budget).toLocaleString()}`:'-'}</span>
                </div>
                <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:12 }}>
                  {form.category && <span style={{ fontSize:12, fontWeight:600, padding:'3px 10px', borderRadius:999, background:'#dbeafe', color:'#1d4ed8' }}>{CATEGORIES.find(c=>c.value===form.category)?.label}</span>}
                  {form.workType && <span style={{ fontSize:12, fontWeight:600, padding:'3px 10px', borderRadius:999, background:'#f0fdf4', color:'#15803d', textTransform:'capitalize' }}>{form.workType}</span>}
                  {form.experienceLevel && <span style={{ fontSize:12, fontWeight:600, padding:'3px 10px', borderRadius:999, background:'#fef3c7', color:'#92400e', textTransform:'capitalize' }}>{form.experienceLevel}</span>}
                </div>
                <p style={{ fontSize:13, color:'#6b7280', lineHeight:1.7, marginBottom:12 }}>{form.description||'No description added.'}</p>
                {form.skills.length>0 && <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>{form.skills.map(s=><span key={s} style={{ fontSize:11, fontWeight:600, padding:'3px 10px', borderRadius:999, background:'#ede9fe', color:'#7c3aed', border:'1px solid #ddd6fe' }}>{s}</span>)}</div>}
              </div>

              {/* Checklist */}
              <h3 style={{ fontSize:13, fontWeight:700, color:'#374151', marginBottom:10 }}>Checklist</h3>
              {[
                { label:'Title added',         done:!!form.title },
                { label:'Category selected',   done:!!form.category },
                { label:'Description (40+ chars)', done:form.description.length>=40 },
                { label:'Skills added',        done:form.skills.length>0 },
                { label:'Budget set',          done:!!form.budget },
                { label:'Deadline set',        done:!!form.deadline },
              ].map((item,i)=>(
                <div key={i} style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
                  <div style={{ width:20, height:20, borderRadius:'50%', background:item.done?'#4f46e5':'#f1f5f9', border:item.done?'none':'1.5px solid #d1d5db', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    {item.done && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4l2.5 2.5L9 1" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/></svg>}
                  </div>
                  <span style={{ fontSize:13, color:item.done?'#374151':'#9ca3af' }}>{item.label}</span>
                  {!item.done && <span style={{ fontSize:11, color:'#f59e0b', marginLeft:'auto' }}>⚠ Required</span>}
                </div>
              ))}

              {/* Notify info */}
              <div style={{ marginTop:16, padding:16, background:'#ede9fe', border:'1px solid #ddd6fe', borderRadius:12, display:'flex', gap:12, alignItems:'flex-start' }}>
                <div style={{ fontSize:22 }}>🔔</div>
                <div>
                  <div style={{ fontSize:13, fontWeight:700, color:'#4f46e5', marginBottom:3 }}>Instant notifications will be sent</div>
                  <div style={{ fontSize:12, color:'#6b7280', lineHeight:1.6 }}>All freelancers matching your skill requirements will receive an in-app notification and email about this job.{form.allowBids&&' Bidding will be open until your bid deadline.'}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── NAV BUTTONS ── */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:20 }}>
          <button onClick={prev} disabled={step===1} style={{ padding:'12px 26px', borderRadius:12, background:'#fff', border:'1px solid #e5e7eb', color:step===1?'#d1d5db':'#374151', fontSize:14, fontWeight:600, cursor:step===1?'not-allowed':'pointer', fontFamily:'inherit', transition:'all 0.2s' }}>
            ← Previous
          </button>

          {/* Step dots */}
          <div style={{ display:'flex', gap:8, alignItems:'center' }}>
            {STEPS.map(s=>(
              <div key={s.id} style={{ width:step===s.id?28:8, height:8, borderRadius:999, background:step===s.id?'#4f46e5':step>s.id?'#22c55e':'#e5e7eb', transition:'all 0.3s' }} />
            ))}
          </div>

          {step < 3 ? (
            <button onClick={next} style={{ padding:'12px 28px', borderRadius:12, background:'linear-gradient(135deg,#4f46e5,#6366F1)', border:'none', color:'#fff', fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:'inherit', boxShadow:'0 4px 14px rgba(79,70,229,0.35)', transition:'all 0.2s' }}
              onMouseEnter={e=>{ e.target.style.transform='translateY(-1px)'; e.target.style.boxShadow='0 6px 20px rgba(79,70,229,0.5)'; }}
              onMouseLeave={e=>{ e.target.style.transform='translateY(0)'; e.target.style.boxShadow='0 4px 14px rgba(79,70,229,0.35)'; }}>
              Continue →
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={saving} style={{ padding:'12px 28px', borderRadius:12, background:saving?'rgba(79,70,229,0.5)':'linear-gradient(135deg,#4f46e5,#22D3EE)', border:'none', color:'#fff', fontSize:14, fontWeight:700, cursor:saving?'not-allowed':'pointer', fontFamily:'inherit', boxShadow:'0 4px 14px rgba(79,70,229,0.35)', display:'flex', alignItems:'center', gap:8 }}>
              {saving ? (
                <><div style={{ width:16, height:16, border:'2px solid rgba(255,255,255,0.4)', borderTopColor:'#fff', borderRadius:'50%', animation:'spin 0.7s linear infinite' }} /> Posting…</>
              ) : '🚀 Post Job & Notify Freelancers'}
            </button>
          )}
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        @keyframes spin{to{transform:rotate(360deg)}}
        input[type=date]::-webkit-calendar-picker-indicator{cursor:pointer;opacity:0.6}
        textarea::placeholder,input::placeholder{color:#9ca3af}
      `}</style>
    </div>
  );
};

export default CreateGig;
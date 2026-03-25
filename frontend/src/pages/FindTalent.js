import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';

// ── This page is ONLY for listing freelancers (Find Talent)
// ── It is completely different from GigMarketplace (Browse Jobs)

const SKILLS = ['All', 'React.js', 'Node.js', 'Python', 'UI/UX Design', 'Flutter', 'MongoDB', 'AWS', 'Figma', 'TypeScript', 'DevOps'];

const FindTalent = () => {
  const [freelancers, setFreelancers] = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [search,      setSearch]      = useState('');
  const [activeSkill, setActiveSkill] = useState('All');
  const [sort,        setSort]        = useState('rating');

  useEffect(() => {
    const fetchFreelancers = async () => {
      setLoading(true);
      try {
        const params = { sort };
        if (search) params.search = search;
        if (activeSkill !== 'All') params.skill = activeSkill;
        const res  = await api.get('/users/freelancers', { params });
        const d    = res.data;
        setFreelancers(Array.isArray(d) ? d : Array.isArray(d?.freelancers) ? d.freelancers : []);
      } catch {
        setFreelancers([]);
      } finally {
        setLoading(false);
      }
    };
    fetchFreelancers();
  }, [search, activeSkill, sort]);

  // Dummy data for demo if API returns empty
  const demoFreelancers = [
    { _id: '1', name: 'Rahul Sharma', title: 'Full Stack Developer', rating: 4.9, completedProjects: 67, hourlyRate: 1800, location: 'Bangalore', skills: ['React.js', 'Node.js', 'MongoDB'], isAvailable: true },
    { _id: '2', name: 'Priya Verma', title: 'UI/UX Designer', rating: 4.8, completedProjects: 43, hourlyRate: 1500, location: 'Mumbai', skills: ['Figma', 'UI/UX Design', 'Webflow'], isAvailable: true },
    { _id: '3', name: 'Arjun Nair', title: 'Python & ML Engineer', rating: 4.7, completedProjects: 38, hourlyRate: 2000, location: 'Hyderabad', skills: ['Python', 'TensorFlow', 'AWS'], isAvailable: false },
    { _id: '4', name: 'Sneha Patel', title: 'Mobile App Developer', rating: 4.9, completedProjects: 52, hourlyRate: 1600, location: 'Pune', skills: ['Flutter', 'React Native', 'Firebase'], isAvailable: true },
    { _id: '5', name: 'Vikram Singh', title: 'DevOps Engineer', rating: 4.6, completedProjects: 29, hourlyRate: 2200, location: 'Delhi', skills: ['Docker', 'AWS', 'DevOps'], isAvailable: true },
    { _id: '6', name: 'Meera Krishnan', title: 'Frontend Developer', rating: 4.8, completedProjects: 41, hourlyRate: 1400, location: 'Chennai', skills: ['React.js', 'TypeScript', 'Tailwind'], isAvailable: false },
  ];

  const displayList = freelancers.length > 0 ? freelancers : demoFreelancers;

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

      {/* ── TOP HERO BANNER ── */}
      <div style={{
        background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #1e40af 100%)',
        padding: '52px 60px 40px',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* BG pattern */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.04) 1px, transparent 1px), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.04) 1px, transparent 1px)', backgroundSize: '40px 40px', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 1200, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 24 }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 999, padding: '5px 14px', marginBottom: 16 }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#34d399', boxShadow: '0 0 6px #34d399' }} />
                <span style={{ fontSize: 12, fontWeight: 700, color: '#a5b4fc' }}>Find Talent</span>
              </div>
              <h1 style={{ fontSize: 38, fontWeight: 900, color: '#fff', marginBottom: 10, fontFamily: 'Syne, Plus Jakarta Sans, sans-serif', lineHeight: 1.2 }}>
                Hire Top Freelancers<br />
                <span style={{ color: '#67e8f9' }}>For Your Projects</span>
              </h1>
              <p style={{ color: '#a5b4fc', fontSize: 15, maxWidth: 440, lineHeight: 1.7 }}>
                Browse {displayList.length}+ verified professionals. Filter by skill, rating, and availability.
              </p>
            </div>

            {/* Search bar */}
            <div style={{ display: 'flex', gap: 10, flex: 1, maxWidth: 420 }}>
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 12, padding: '0 16px', gap: 10, backdropFilter: 'blur(12px)' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a5b4fc" strokeWidth="2.5" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                <input type="text" placeholder="Search by name or skill..." value={search} onChange={e => setSearch(e.target.value)} style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: '#fff', fontSize: 14, fontFamily: 'inherit', padding: '14px 0' }} />
              </div>
              <button style={{ padding: '0 24px', borderRadius: 12, background: 'linear-gradient(135deg,#6366F1,#22D3EE)', border: 'none', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 14px rgba(99,102,241,0.4)', whiteSpace: 'nowrap' }}>
                Search
              </button>
            </div>
          </div>

          {/* Stats row */}
          <div style={{ display: 'flex', gap: 32, marginTop: 28, flexWrap: 'wrap' }}>
            {[['12K+', 'Registered Freelancers'], ['98%', 'Client Satisfaction'], ['₹500', 'Avg. Hourly Rate'], ['50+', 'Skill Categories']].map(([v, l]) => (
              <div key={l}>
                <div style={{ fontSize: 20, fontWeight: 900, color: '#fff', fontFamily: 'Syne, sans-serif' }}>{v}</div>
                <div style={{ fontSize: 12, color: '#a5b4fc', marginTop: 2 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div style={{ maxWidth: 1260, margin: '0 auto', padding: '32px 24px' }}>

        {/* Skill filter pills + Sort */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {SKILLS.map(s => (
              <button key={s} onClick={() => setActiveSkill(s)} style={{
                padding: '7px 16px', borderRadius: 999, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                fontFamily: 'inherit', transition: 'all 0.2s',
                background: activeSkill === s ? '#4f46e5' : '#fff',
                color: activeSkill === s ? '#fff' : '#374151',
                border: `1px solid ${activeSkill === s ? '#4f46e5' : '#e5e7eb'}`,
                boxShadow: activeSkill === s ? '0 4px 12px rgba(79,70,229,0.3)' : '0 1px 3px rgba(0,0,0,0.06)',
              }}>{s}</button>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 13, color: '#6b7280' }}>Sort by:</span>
            <select value={sort} onChange={e => setSort(e.target.value)} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: '7px 12px', fontSize: 13, color: '#374151', fontFamily: 'inherit', outline: 'none', cursor: 'pointer', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
              <option value="rating">Top Rated</option>
              <option value="projects">Most Projects</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Results count */}
        <div style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 15, color: '#111827', fontWeight: 700 }}>{displayList.length} freelancers</span>
          <span style={{ fontSize: 14, color: '#9ca3af' }}>
            {activeSkill !== 'All' ? `skilled in ${activeSkill}` : 'available for hire'}
          </span>
        </div>

        {/* Freelancer grid */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
            {[1,2,3,4,5,6].map(i => (
              <div key={i} style={{ height: 260, borderRadius: 16, background: '#f1f5f9', animation: 'shimmer 1.5s ease-in-out infinite' }} />
            ))}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
            {displayList.map((f, i) => (
              <Link key={f._id || i} to={`/freelancers/${f._id}`} style={{ textDecoration: 'none' }}>
                <div style={{
                  background: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: 16, padding: 24,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  transition: 'all 0.25s ease',
                  cursor: 'pointer', position: 'relative',
                }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(79,70,229,0.12)'; e.currentTarget.style.borderColor = '#c7d2fe'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)'; e.currentTarget.style.borderColor = '#e5e7eb'; }}
                >
                  {/* Available badge */}
                  <div style={{ position: 'absolute', top: 16, right: 16 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 999, background: f.isAvailable !== false ? '#dcfce7' : '#f3f4f6', color: f.isAvailable !== false ? '#16a34a' : '#9ca3af', border: `1px solid ${f.isAvailable !== false ? '#bbf7d0' : '#e5e7eb'}` }}>
                      {f.isAvailable !== false ? '● Available' : '○ Busy'}
                    </span>
                  </div>

                  {/* Avatar + name */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
                    <div style={{ width: 52, height: 52, borderRadius: 14, background: `linear-gradient(135deg, ${['#6366F1,#8b5cf6','#0ea5e9,#22D3EE','#10b981,#34d399','#f59e0b,#fbbf24'][i % 4]})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 900, color: '#fff', flexShrink: 0, boxShadow: '0 4px 12px rgba(0,0,0,0.12)' }}>
                      {f.name?.[0]?.toUpperCase() || 'F'}
                    </div>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 2 }}>{f.name || 'Freelancer'}</div>
                      <div style={{ fontSize: 13, color: '#6b7280' }}>{f.title || 'Freelancer'}</div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div style={{ display: 'flex', gap: 16, marginBottom: 14 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span style={{ color: '#f59e0b', fontSize: 13 }}>★</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>{f.rating || 4.8}</span>
                    </div>
                    <div style={{ fontSize: 13, color: '#6b7280' }}>
                      <span style={{ fontWeight: 600, color: '#374151' }}>{f.completedProjects || 0}</span> projects
                    </div>
                    <div style={{ fontSize: 13, color: '#6b7280' }}>📍 {f.location || 'Remote'}</div>
                  </div>

                  {/* Skills */}
                  {Array.isArray(f.skills) && f.skills.length > 0 && (
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
                      {f.skills.slice(0, 3).map(s => (
                        <span key={s} style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 999, background: '#ede9fe', color: '#7c3aed', border: '1px solid #ddd6fe' }}>{s}</span>
                      ))}
                    </div>
                  )}

                  {/* Footer */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 14, borderTop: '1px solid #f1f5f9' }}>
                    <div>
                      <span style={{ fontSize: 18, fontWeight: 800, color: '#4f46e5' }}>₹{(f.hourlyRate || 1000).toLocaleString()}</span>
                      <span style={{ fontSize: 12, color: '#9ca3af', marginLeft: 3 }}>/hr</span>
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#4f46e5' }}>View Profile →</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        @keyframes shimmer { 0%,100%{opacity:1} 50%{opacity:0.5} }
        input::placeholder { color: rgba(255,255,255,0.5); }
      `}</style>
    </div>
  );
};

export default FindTalent;
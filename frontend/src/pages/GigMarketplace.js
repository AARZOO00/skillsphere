import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { fetchGigs } from '../redux/slices/gigSlice';
import { getTrendingSkills } from '../utils/api';

const CATEGORIES = [
  { id: '', label: 'All Categories', icon: '🌐' },
  { id: 'Web Development', label: 'Web Dev', icon: '💻' },
  { id: 'Mobile Apps', label: 'Mobile', icon: '📱' },
  { id: 'Design', label: 'Design', icon: '🎨' },
  { id: 'Data Science', label: 'Data Science', icon: '📊' },
  { id: 'Marketing', label: 'Marketing', icon: '📢' },
  { id: 'Content Writing', label: 'Writing', icon: '✍️' },
  { id: 'Video Editing', label: 'Video', icon: '🎬' },
  { id: 'Consulting', label: 'Consulting', icon: '💼' },
  { id: 'DevOps', label: 'DevOps', icon: '⚙️' },
];

const STATS = [
  { icon: '👥', value: '48K+', label: 'Active Freelancers', color: '#3b82f6' },
  { icon: '✅', value: '12K+', label: 'Projects Completed', color: '#10b981' },
  { icon: '⭐', value: '98%', label: 'Satisfaction Rate', color: '#f59e0b' },
  { icon: '🌍', value: '50+', label: 'Cities Covered', color: '#8b5cf6' },
];

const GigCard = ({ gig }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <Link to={`/gigs/${gig._id}`} style={{ textDecoration: 'none' }}>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          background: hovered
            ? 'linear-gradient(135deg, #1e2a4a, #162040)'
            : 'linear-gradient(135deg, #0f1729, #111827)',
          border: hovered ? '1px solid rgba(59,130,246,0.5)' : '1px solid rgba(255,255,255,0.06)',
          borderRadius: '16px',
          padding: '22px',
          transition: 'all 0.3s ease',
          cursor: 'pointer',
          transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
          boxShadow: hovered ? '0 16px 48px rgba(59,130,246,0.15)' : '0 4px 16px rgba(0,0,0,0.3)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
          <span style={{
            background: 'rgba(59,130,246,0.15)',
            color: '#60a5fa',
            border: '1px solid rgba(59,130,246,0.25)',
            borderRadius: '99px',
            padding: '3px 10px',
            fontSize: '11px',
            fontWeight: '600',
          }}>
            {gig.category}
          </span>
          <span style={{ color: '#6b7280', fontSize: '12px' }}>{gig.proposalCount || gig.bidsCount || 0} bids</span>
        </div>

        <h3 style={{
          fontSize: '15px',
          fontWeight: '700',
          color: '#f1f5f9',
          marginBottom: '8px',
          lineHeight: 1.4,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}>
          {gig.title}
        </h3>

        <p style={{
          fontSize: '13px',
          color: '#94a3b8',
          marginBottom: '14px',
          lineHeight: 1.6,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}>
          {gig.description}
        </p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '14px' }}>
          {gig.skills?.slice(0, 3).map(s => (
            <span key={s} style={{
              background: 'rgba(245,158,11,0.1)',
              color: '#fbbf24',
              border: '1px solid rgba(245,158,11,0.2)',
              borderRadius: '6px',
              padding: '2px 8px',
              fontSize: '11px',
              fontWeight: '500',
            }}>
              {s}
            </span>
          ))}
          {gig.skills?.length > 3 && (
            <span style={{ color: '#6b7280', fontSize: '11px', padding: '2px 4px' }}>+{gig.skills.length - 3}</span>
          )}
        </div>

        <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)', marginBottom: '12px' }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ color: '#f59e0b', fontWeight: '800', fontSize: '18px' }}>
              ₹{gig.budget?.min?.toLocaleString()}
            </span>
            <span style={{ color: '#6b7280', fontSize: '12px' }}> – ₹{gig.budget?.max?.toLocaleString()}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <img
              src={gig.client?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(gig.client?.name || 'U')}&background=1d4ed8&color=fff&size=32`}
              alt=""
              style={{ width: '22px', height: '22px', borderRadius: '50%' }}
            />
            <span style={{ color: '#94a3b8', fontSize: '12px' }}>{gig.client?.name?.split(' ')[0]}</span>
          </div>
        </div>

        {gig.location?.city && (
          <div style={{ marginTop: '8px', color: '#6b7280', fontSize: '11px' }}>
            📍 {gig.location.city}
          </div>
        )}
      </div>
    </Link>
  );
};

const SkeletonCard = () => (
  <div style={{
    background: '#0f1729',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '16px',
    padding: '22px',
    height: '240px',
  }}>
    {[70, 100, 60, 40].map((w, i) => (
      <div key={i} style={{
        height: i === 1 ? 14 : 10,
        background: 'rgba(255,255,255,0.06)',
        borderRadius: '6px',
        marginBottom: '14px',
        width: `${w}%`,
        animation: 'shimmer 1.5s ease infinite',
      }} />
    ))}
    <style>{`@keyframes shimmer{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
  </div>
);

const GigMarketplace = () => {
  const dispatch = useDispatch();
  const { gigs, loading, total, pages } = useSelector(s => s.gigs);
  const { user } = useSelector(s => s.auth);
  const navigate = useNavigate();
  const [filters, setFilters] = useState({ category: '', search: '', minBudget: '', maxBudget: '', experience: '', page: 1 });
  const [trending, setTrending] = useState([]);
  const [searchInput, setSearchInput] = useState('');

  useEffect(() => {
    dispatch(fetchGigs(filters));
  }, [filters]);

  useEffect(() => {
    getTrendingSkills().then(({ data }) => setTrending(data.trendingSkills || [])).catch(() => {});
  }, []);

  const handleSearch = () => setFilters(f => ({ ...f, search: searchInput, page: 1 }));

  return (
    <div style={{ paddingTop: '64px', minHeight: '100vh', background: '#060d1f', color: '#f1f5f9' }}>

      {/* ===== HERO ===== */}
      <div style={{
        position: 'relative',
        padding: '80px 24px 60px',
        textAlign: 'center',
        background: 'linear-gradient(180deg, #0a1628 0%, #060d1f 100%)',
        overflow: 'hidden',
      }}>
        {/* Glow effects */}
        <div style={{
          position: 'absolute', top: '-30%', left: '50%',
          transform: 'translateX(-50%)',
          width: '900px', height: '700px',
          background: 'radial-gradient(ellipse, rgba(29,78,216,0.2) 0%, transparent 65%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', top: '20%', left: '10%',
          width: '300px', height: '300px',
          background: 'radial-gradient(ellipse, rgba(245,158,11,0.06) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div style={{ maxWidth: '780px', margin: '0 auto', position: 'relative' }}>
          {/* Badge */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(29,78,216,0.15)',
            border: '1px solid rgba(59,130,246,0.3)',
            borderRadius: '99px',
            padding: '6px 18px',
            fontSize: '13px',
            color: '#93c5fd',
            fontWeight: '600',
            marginBottom: '28px',
          }}>
            ⚡ AI-Powered Hyperlocal Matching
          </div>

          {/* Heading */}
          <h1 style={{
            fontSize: '56px',
            fontWeight: '900',
            lineHeight: 1.1,
            marginBottom: '20px',
            fontFamily: 'Space Grotesk, sans-serif',
            letterSpacing: '-2px',
          }}>
            <span style={{ color: '#f1f5f9' }}>Find the Perfect</span>
            <br />
            <span style={{
              background: 'linear-gradient(135deg, #3b82f6, #60a5fa, #93c5fd)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              filter: 'drop-shadow(0 0 30px rgba(59,130,246,0.4))',
            }}>
              Freelancer Near You
            </span>
          </h1>

          <p style={{ color: '#94a3b8', fontSize: '18px', marginBottom: '36px', lineHeight: 1.6 }}>
            Connect with verified professionals. AI matches you with the best talent based on skills, rating & location.
          </p>

          {/* Search */}
          <div style={{ display: 'flex', gap: '10px', maxWidth: '580px', margin: '0 auto 24px' }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#6b7280', fontSize: '16px' }}>🔍</span>
              <input
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                placeholder="Search skills, jobs, or keywords..."
                style={{
                  width: '100%',
                  padding: '14px 16px 14px 46px',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: '12px',
                  color: '#f1f5f9',
                  fontSize: '15px',
                  fontFamily: 'inherit',
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'all 0.2s',
                }}
                onFocus={e => { e.target.style.border = '1px solid rgba(59,130,246,0.6)'; e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.15)'; }}
                onBlur={e => { e.target.style.border = '1px solid rgba(255,255,255,0.12)'; e.target.style.boxShadow = 'none'; }}
              />
            </div>
            <button
              onClick={handleSearch}
              style={{
                padding: '0 28px',
                background: 'linear-gradient(135deg, #1d4ed8, #3b82f6)',
                border: 'none',
                borderRadius: '12px',
                color: '#fff',
                fontSize: '15px',
                fontWeight: '700',
                cursor: 'pointer',
                fontFamily: 'inherit',
                whiteSpace: 'nowrap',
                boxShadow: '0 4px 20px rgba(29,78,216,0.4)',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 8px 28px rgba(29,78,216,0.5)'; }}
              onMouseLeave={e => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = '0 4px 20px rgba(29,78,216,0.4)'; }}
            >
              Search
            </button>
          </div>

          {/* Trending */}
          {trending.length > 0 && (
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center' }}>
              <span style={{ color: '#6b7280', fontSize: '13px' }}>🔥 Trending:</span>
              {trending.slice(0, 6).map(s => (
                <button
                  key={s._id}
                  onClick={() => { setSearchInput(s._id); setFilters(f => ({ ...f, search: s._id, page: 1 })); }}
                  style={{
                    background: 'rgba(245,158,11,0.08)',
                    border: '1px solid rgba(245,158,11,0.2)',
                    borderRadius: '99px',
                    padding: '4px 14px',
                    fontSize: '12px',
                    color: '#fbbf24',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => { e.target.style.background = 'rgba(245,158,11,0.15)'; }}
                  onMouseLeave={e => { e.target.style.background = 'rgba(245,158,11,0.08)'; }}
                >
                  {s._id}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ===== STATS ===== */}
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 24px 48px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
          {STATS.map(stat => (
            <div key={stat.label} style={{
              background: 'linear-gradient(135deg, #0f1729, #111827)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '16px',
              padding: '24px',
              textAlign: 'center',
              transition: 'all 0.3s',
            }}
              onMouseEnter={e => { e.currentTarget.style.border = `1px solid ${stat.color}44`; e.currentTarget.style.transform = 'translateY(-3px)'; }}
              onMouseLeave={e => { e.currentTarget.style.border = '1px solid rgba(255,255,255,0.07)'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              <div style={{ fontSize: '28px', marginBottom: '8px' }}>{stat.icon}</div>
              <div style={{ fontSize: '28px', fontWeight: '900', color: stat.color, letterSpacing: '-1px', fontFamily: 'Space Grotesk, sans-serif' }}>
                {stat.value}
              </div>
              <div style={{ color: '#94a3b8', fontSize: '13px', marginTop: '4px' }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ===== CATEGORY TABS ===== */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)', background: '#080f1e', overflowX: 'auto' }}>
        <div style={{ display: 'flex', padding: '0 32px', gap: '2px', minWidth: 'max-content' }}>
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setFilters(f => ({ ...f, category: cat.id, page: 1 }))}
              style={{
                padding: '14px 18px',
                background: 'none',
                border: 'none',
                borderBottom: filters.category === cat.id ? '2px solid #3b82f6' : '2px solid transparent',
                color: filters.category === cat.id ? '#60a5fa' : '#94a3b8',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: filters.category === cat.id ? '700' : '400',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                whiteSpace: 'nowrap',
                fontFamily: 'inherit',
                transition: 'all 0.2s',
                marginBottom: '-1px',
              }}
              onMouseEnter={e => { if (filters.category !== cat.id) e.currentTarget.style.color = '#e2e8f0'; }}
              onMouseLeave={e => { if (filters.category !== cat.id) e.currentTarget.style.color = '#94a3b8'; }}
            >
              <span>{cat.icon}</span> {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* ===== MAIN CONTENT ===== */}
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '28px 24px 60px', display: 'flex', gap: '24px' }}>

        {/* FILTERS SIDEBAR */}
        <div style={{ width: '220px', flexShrink: 0 }}>
          <div style={{ position: 'sticky', top: '80px' }}>
            <div style={{
              background: 'linear-gradient(135deg, #0f1729, #111827)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '16px',
              padding: '20px',
            }}>
              <h3 style={{
                fontSize: '11px',
                fontWeight: '700',
                color: '#3b82f6',
                textTransform: 'uppercase',
                letterSpacing: '1.5px',
                marginBottom: '18px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}>
                ● FILTERS
              </h3>

              {/* Budget */}
              <div style={{ marginBottom: '22px' }}>
                <p style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '600', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                  BUDGET RANGE (₹)
                </p>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    className="input-field"
                    placeholder="Min"
                    type="number"
                    value={filters.minBudget}
                    onChange={e => setFilters(f => ({ ...f, minBudget: e.target.value, page: 1 }))}
                    style={{ fontSize: '13px', padding: '8px 10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                  />
                  <input
                    className="input-field"
                    placeholder="Max"
                    type="number"
                    value={filters.maxBudget}
                    onChange={e => setFilters(f => ({ ...f, maxBudget: e.target.value, page: 1 }))}
                    style={{ fontSize: '13px', padding: '8px 10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                  />
                </div>
              </div>

              {/* Experience */}
              <div style={{ marginBottom: '22px' }}>
                <p style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '600', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                  EXPERIENCE LEVEL
                </p>
                {[{ id: '', label: 'Any Level' }, { id: 'beginner', label: 'Beginner' }, { id: 'intermediate', label: 'Intermediate' }, { id: 'expert', label: 'Expert' }].map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => setFilters(f => ({ ...f, experience: opt.id, page: 1 }))}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      width: '100%',
                      textAlign: 'left',
                      padding: '8px 10px',
                      background: filters.experience === opt.id ? 'rgba(59,130,246,0.12)' : 'transparent',
                      color: filters.experience === opt.id ? '#60a5fa' : '#94a3b8',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '13px',
                      marginBottom: '2px',
                      fontFamily: 'inherit',
                      transition: 'all 0.15s',
                    }}
                  >
                    <div style={{
                      width: '14px', height: '14px', borderRadius: '50%',
                      border: `2px solid ${filters.experience === opt.id ? '#3b82f6' : '#374151'}`,
                      background: filters.experience === opt.id ? '#3b82f6' : 'transparent',
                      flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {filters.experience === opt.id && <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#fff' }} />}
                    </div>
                    {opt.label}
                  </button>
                ))}
              </div>

              {/* Work Type */}
              <div style={{ marginBottom: '22px' }}>
                <p style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '600', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                  WORK TYPE
                </p>
                {[{ id: '', label: '🌐 All' }, { id: 'remote', label: '🟢 Remote' }, { id: 'onsite', label: '🏢 On-site' }, { id: 'hybrid', label: '🔀 Hybrid' }].map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => setFilters(f => ({ ...f, locationType: opt.id, page: 1 }))}
                    style={{
                      display: 'block',
                      width: '100%',
                      textAlign: 'left',
                      padding: '8px 10px',
                      background: filters.locationType === opt.id ? 'rgba(59,130,246,0.12)' : 'transparent',
                      color: filters.locationType === opt.id ? '#60a5fa' : '#94a3b8',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '13px',
                      marginBottom: '2px',
                      fontFamily: 'inherit',
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              {/* Clear Filters */}
              {(filters.search || filters.minBudget || filters.maxBudget || filters.experience) && (
                <button
                  onClick={() => { setFilters({ category: '', search: '', minBudget: '', maxBudget: '', experience: '', page: 1 }); setSearchInput(''); }}
                  style={{
                    width: '100%',
                    padding: '10px',
                    background: 'linear-gradient(135deg, #1d4ed8, #3b82f6)',
                    border: 'none',
                    borderRadius: '10px',
                    color: '#fff',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontFamily: 'inherit',
                    fontWeight: '600',
                    marginTop: '8px',
                  }}
                >
                  + Clear Filters
                </button>
              )}
            </div>

            {user?.role === 'client' && (
              <Link to="/create-gig" style={{
                display: 'flex',
                justifyContent: 'center',
                marginTop: '12px',
                padding: '11px',
                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                border: 'none',
                borderRadius: '12px',
                color: '#000',
                fontWeight: '700',
                fontSize: '14px',
                textDecoration: 'none',
                boxShadow: '0 4px 16px rgba(245,158,11,0.3)',
                transition: 'all 0.2s',
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(245,158,11,0.4)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(245,158,11,0.3)'; }}
              >
                + Post a Job
              </Link>
            )}
          </div>
        </div>

        {/* GIGS GRID */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <p style={{ color: '#94a3b8', fontSize: '14px' }}>
              <span style={{ color: '#3b82f6', fontWeight: '700' }}>{total}</span> jobs found
              {filters.search && <span> for "<span style={{ color: '#f1f5f9' }}>{filters.search}</span>"</span>}
            </p>
            <select style={{
              background: '#0f1729',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              color: '#94a3b8',
              padding: '8px 12px',
              fontSize: '13px',
              fontFamily: 'inherit',
              outline: 'none',
              cursor: 'pointer',
            }}>
              <option>Best Match</option>
              <option>Newest First</option>
              <option>Budget: High to Low</option>
              <option>Budget: Low to High</option>
            </select>
          </div>

          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px,1fr))', gap: '16px' }}>
              {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : gigs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 0' }}>
              <div style={{ fontSize: '64px', marginBottom: '16px' }}>🔍</div>
              <h3 style={{ fontSize: '20px', marginBottom: '8px', color: '#e2e8f0' }}>No jobs found</h3>
              <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '24px' }}>
                Try different keywords or clear the filters
              </p>
              <button
                onClick={() => { setFilters({ category: '', search: '', minBudget: '', maxBudget: '', experience: '', page: 1 }); setSearchInput(''); }}
                style={{
                  padding: '10px 24px',
                  background: 'linear-gradient(135deg, #1d4ed8, #3b82f6)',
                  border: 'none',
                  borderRadius: '10px',
                  color: '#fff',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontFamily: 'inherit',
                  fontSize: '14px',
                }}
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px,1fr))', gap: '16px' }}>
              {gigs.map(gig => <GigCard key={gig._id} gig={gig} />)}
            </div>
          )}

          {/* Pagination */}
          {pages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginTop: '36px' }}>
              <button
                onClick={() => setFilters(f => ({ ...f, page: Math.max(1, f.page - 1) }))}
                disabled={filters.page === 1}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: '1px solid rgba(255,255,255,0.1)',
                  background: 'transparent',
                  color: filters.page === 1 ? '#374151' : '#94a3b8',
                  cursor: filters.page === 1 ? 'not-allowed' : 'pointer',
                  fontFamily: 'inherit',
                  fontSize: '13px',
                }}
              >
                ← Prev
              </button>
              {[...Array(Math.min(pages, 5))].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setFilters(f => ({ ...f, page: i + 1 }))}
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    border: filters.page === i + 1 ? '2px solid #3b82f6' : '1px solid rgba(255,255,255,0.1)',
                    background: filters.page === i + 1 ? 'rgba(59,130,246,0.15)' : 'transparent',
                    color: filters.page === i + 1 ? '#60a5fa' : '#94a3b8',
                    cursor: 'pointer',
                    fontWeight: filters.page === i + 1 ? '700' : '400',
                    fontFamily: 'inherit',
                    fontSize: '13px',
                  }}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setFilters(f => ({ ...f, page: Math.min(pages, f.page + 1) }))}
                disabled={filters.page === pages}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: '1px solid rgba(255,255,255,0.1)',
                  background: 'transparent',
                  color: filters.page === pages ? '#374151' : '#94a3b8',
                  cursor: filters.page === pages ? 'not-allowed' : 'pointer',
                  fontFamily: 'inherit',
                  fontSize: '13px',
                }}
              >
                Next →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GigMarketplace;
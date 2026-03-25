import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';

const FreelancerProfile = () => {
  const { id } = useParams();
  const { user: currentUser } = useSelector(s => s.auth);
  const [activeTab, setActiveTab] = useState('overview');

  // Placeholder — replace with actual API call
  const freelancer = {
    name: 'Rahul Kumar',
    title: 'Full Stack Developer & UI Designer',
    avatar: null,
    location: 'Bangalore, India',
    joinedAt: '2023-01-15',
    rating: 4.9,
    reviewCount: 47,
    completedProjects: 63,
    responseTime: '< 1 hour',
    successRate: '98%',
    hourlyRate: 1500,
    bio: `Passionate full-stack developer with 5+ years of experience building scalable web and mobile applications. I specialize in React, Node.js, and cloud architecture. I believe in clean code, thoughtful UI, and shipping products that users love.`,
    skills: ['React.js', 'Node.js', 'TypeScript', 'MongoDB', 'AWS', 'Figma', 'GraphQL', 'Docker'],
    languages: [{ name: 'Hindi', level: 'Native' }, { name: 'English', level: 'Fluent' }],
    education: [{ degree: 'B.Tech CSE', institution: 'IIT Delhi', year: '2019' }],
    portfolio: [
      { title: 'E-commerce Platform', desc: 'React + Node.js SaaS for 10K+ users', tags: ['React', 'Node.js', 'MongoDB'], color: '#6366F1' },
      { title: 'HealthTrack App', desc: 'React Native health tracking with AI insights', tags: ['React Native', 'AI', 'Firebase'], color: '#22D3EE' },
      { title: 'Dashboard Analytics', desc: 'Real-time data visualization dashboard', tags: ['D3.js', 'WebSockets', 'PostgreSQL'], color: '#8B5CF6' },
    ],
    reviews: [
      { author: 'Anil Verma', rating: 5, text: 'Exceptional work. Delivered ahead of schedule and the quality exceeded my expectations.', date: '2 weeks ago' },
      { author: 'Priya Sharma', rating: 5, text: 'Rahul is a brilliant developer. Very responsive and professional throughout the project.', date: '1 month ago' },
    ],
  };

  const isOwner = currentUser?._id === id;

  const tabs = ['overview', 'portfolio', 'reviews'];

  return (
    <div style={{ minHeight: '100vh', background: '#0B0F1A' }}>

      {/* HERO BANNER */}
      <div style={{
        height: 180,
        background: 'linear-gradient(135deg, rgba(99,102,241,0.25), rgba(34,211,238,0.12), rgba(11,15,26,0))',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        position: 'relative',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'radial-gradient(circle at 30% 50%, rgba(99,102,241,0.15) 0%, transparent 60%), radial-gradient(circle at 70% 50%, rgba(34,211,238,0.1) 0%, transparent 60%)',
        }} />
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 40px 60px' }}>

        {/* Profile header */}
        <div style={{
          background: 'linear-gradient(145deg, #151e2e, #111827)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 20, padding: 28, marginTop: -60,
          boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
          marginBottom: 24,
          position: 'relative', zIndex: 1,
        }}>
          <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', flexWrap: 'wrap' }}>

            {/* Avatar */}
            <div style={{ position: 'relative' }}>
              <div style={{
                width: 90, height: 90, borderRadius: 22,
                background: 'linear-gradient(135deg, #6366F1, #22D3EE)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 36, fontWeight: 800, color: '#fff',
                boxShadow: '0 8px 24px rgba(99,102,241,0.45)',
                border: '3px solid rgba(255,255,255,0.1)',
              }}>
                {freelancer.avatar ? <img src={freelancer.avatar} alt="" style={{ width: '100%', height: '100%', borderRadius: 20 }} /> : freelancer.name[0]}
              </div>
              <div style={{
                position: 'absolute', bottom: -3, right: -3,
                width: 20, height: 20, borderRadius: '50%',
                background: '#22C55E', border: '2px solid #111827',
              }} />
            </div>

            {/* Info */}
            <div style={{ flex: 1, minWidth: 240 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 4 }}>
                <h1 style={{ fontSize: 22, fontWeight: 800, color: '#F1F5F9', fontFamily: 'Syne, Plus Jakarta Sans, sans-serif' }}>
                  {freelancer.name}
                </h1>
                <span style={{
                  background: 'rgba(34,211,238,0.1)', color: '#22D3EE',
                  border: '1px solid rgba(34,211,238,0.25)',
                  fontSize: 11, fontWeight: 700, padding: '2px 10px', borderRadius: 999,
                }}>✓ Verified</span>
              </div>
              <p style={{ color: '#94A3B8', fontSize: 14, marginBottom: 10 }}>{freelancer.title}</p>
              <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 12, color: '#64748B' }}>📍 {freelancer.location}</span>
                <span style={{ fontSize: 12, color: '#64748B' }}>⚡ Responds {freelancer.responseTime}</span>
                <span style={{ fontSize: 12, color: '#64748B' }}>🗓 Joined {new Date(freelancer.joinedAt).getFullYear()}</span>
              </div>
            </div>

            {/* Stats row */}
            <div style={{ display: 'flex', gap: 20, flexShrink: 0, flexWrap: 'wrap' }}>
              {[
                { label: 'Rating', value: freelancer.rating, icon: '⭐', color: '#fbbf24' },
                { label: 'Projects', value: freelancer.completedProjects, icon: '✅', color: '#4ade80' },
                { label: 'Success', value: freelancer.successRate, icon: '🎯', color: '#22D3EE' },
              ].map((s, i) => (
                <div key={i} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: s.color, fontFamily: 'Syne, Plus Jakarta Sans, sans-serif' }}>
                    {s.icon} {s.value}
                  </div>
                  <div style={{ fontSize: 11, color: '#475569', marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
              {isOwner ? (
                <Link to="/settings"><button className="btn-primary" style={{ fontSize: 13 }}>✏️ Edit Profile</button></Link>
              ) : (
                <>
                  <Link to={`/chat?userId=${id}`}>
                    <button className="btn-primary" style={{ fontSize: 13 }}>💬 Message</button>
                  </Link>
                  <button className="btn-ghost" style={{ fontSize: 13 }}>🔖 Save</button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Rate banner */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(34,211,238,0.08))',
          border: '1px solid rgba(99,102,241,0.25)',
          borderRadius: 14, padding: '14px 22px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginBottom: 24,
        }}>
          <span style={{ fontSize: 14, color: '#94A3B8' }}>Hourly Rate</span>
          <span style={{
            fontSize: 26, fontWeight: 800, fontFamily: 'Syne, Plus Jakarta Sans, sans-serif',
            background: 'linear-gradient(135deg, #6366F1, #22D3EE)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>₹{freelancer.hourlyRate.toLocaleString()} / hr</span>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 24, borderBottom: '1px solid rgba(255,255,255,0.07)', paddingBottom: 0 }}>
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontFamily: 'Plus Jakarta Sans, sans-serif',
                fontSize: 14, fontWeight: 600,
                color: activeTab === tab ? '#818CF8' : '#475569',
                padding: '10px 20px', borderRadius: '8px 8px 0 0',
                borderBottom: activeTab === tab ? '2px solid #6366F1' : '2px solid transparent',
                textTransform: 'capitalize', transition: 'all 0.2s',
              }}
            >{tab}</button>
          ))}
        </div>

        {/* Tab content */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 24 }}>
          <div>
            {activeTab === 'overview' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {/* Bio */}
                <div style={{
                  background: 'linear-gradient(145deg, #151e2e, #111827)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: 18, padding: 24,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                }}>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: '#F1F5F9', marginBottom: 12 }}>About</h3>
                  <p style={{ fontSize: 14, color: '#94A3B8', lineHeight: 1.8 }}>{freelancer.bio}</p>
                </div>

                {/* Skills */}
                <div style={{
                  background: 'linear-gradient(145deg, #151e2e, #111827)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: 18, padding: 24,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                }}>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: '#F1F5F9', marginBottom: 14 }}>Skills</h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {freelancer.skills.map(skill => (
                      <span key={skill} style={{
                        background: 'rgba(99,102,241,0.12)',
                        border: '1px solid rgba(99,102,241,0.3)',
                        color: '#818CF8', fontSize: 13, fontWeight: 600,
                        padding: '6px 14px', borderRadius: 999,
                      }}>{skill}</span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'portfolio' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
                {freelancer.portfolio.map((item, i) => (
                  <div key={i} style={{
                    background: 'linear-gradient(145deg, #151e2e, #111827)',
                    border: '1px solid rgba(255,255,255,0.07)',
                    borderRadius: 18, overflow: 'hidden',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                    transition: 'all 0.25s',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = 'rgba(99,102,241,0.35)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; }}
                  >
                    <div style={{ height: 100, background: `linear-gradient(135deg, ${item.color}33, ${item.color}11)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36 }}>🖥️</div>
                    <div style={{ padding: 18 }}>
                      <h4 style={{ fontSize: 14, fontWeight: 700, color: '#F1F5F9', marginBottom: 6 }}>{item.title}</h4>
                      <p style={{ fontSize: 12, color: '#64748B', marginBottom: 12 }}>{item.desc}</p>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {item.tags.map(tag => (
                          <span key={tag} style={{
                            background: `${item.color}18`, color: item.color,
                            border: `1px solid ${item.color}30`,
                            fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 999,
                          }}>{tag}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {freelancer.reviews.map((review, i) => (
                  <div key={i} style={{
                    background: 'linear-gradient(145deg, #151e2e, #111827)',
                    border: '1px solid rgba(255,255,255,0.07)',
                    borderRadius: 18, padding: 22,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                        <div style={{
                          width: 36, height: 36, borderRadius: '50%',
                          background: 'linear-gradient(135deg, #6366F1, #22D3EE)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 14, fontWeight: 700, color: '#fff',
                        }}>{review.author[0]}</div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: '#E2E8F0' }}>{review.author}</div>
                          <div style={{ fontSize: 11, color: '#475569' }}>{review.date}</div>
                        </div>
                      </div>
                      <div style={{ color: '#fbbf24', fontSize: 14 }}>{'★'.repeat(review.rating)}</div>
                    </div>
                    <p style={{ fontSize: 14, color: '#94A3B8', lineHeight: 1.7 }}>{review.text}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Education */}
            <div style={{
              background: 'linear-gradient(145deg, #151e2e, #111827)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 18, padding: 22,
              boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
            }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: '#F1F5F9', marginBottom: 14 }}>Education</h3>
              {freelancer.education.map((edu, i) => (
                <div key={i} style={{ display: 'flex', gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(99,102,241,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>🎓</div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#E2E8F0' }}>{edu.degree}</div>
                    <div style={{ fontSize: 12, color: '#64748B' }}>{edu.institution} · {edu.year}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Languages */}
            <div style={{
              background: 'linear-gradient(145deg, #151e2e, #111827)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 18, padding: 22,
              boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
            }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: '#F1F5F9', marginBottom: 14 }}>Languages</h3>
              {freelancer.languages.map((lang, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontSize: 13, color: '#94A3B8' }}>🌐 {lang.name}</span>
                  <span style={{
                    fontSize: 11, fontWeight: 600, padding: '2px 10px', borderRadius: 999,
                    background: 'rgba(34,211,238,0.1)', color: '#22D3EE',
                    border: '1px solid rgba(34,211,238,0.2)',
                  }}>{lang.level}</span>
                </div>
              ))}
            </div>

            {/* CTA */}
            {!isOwner && (
              <div style={{
                background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(34,211,238,0.1))',
                border: '1px solid rgba(99,102,241,0.3)',
                borderRadius: 18, padding: 22, textAlign: 'center',
              }}>
                <div style={{ fontSize: 28, marginBottom: 10 }}>🤝</div>
                <h4 style={{ color: '#F1F5F9', fontWeight: 700, marginBottom: 6, fontSize: 14 }}>Ready to hire?</h4>
                <p style={{ color: '#64748B', fontSize: 12, marginBottom: 16 }}>Send a proposal or message directly</p>
                <Link to={`/chat?userId=${id}`}>
                  <button className="btn-primary" style={{ width: '100%', fontSize: 13 }}>Hire Now</button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FreelancerProfile;
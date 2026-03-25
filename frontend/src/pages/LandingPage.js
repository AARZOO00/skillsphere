import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  const [hoveredFeature, setHoveredFeature] = useState(null);
  const [hoveredTestimonial, setHoveredTestimonial] = useState(null);

  const features = [
    { icon: '🤖', title: 'AI-Powered Matching', desc: 'Our smart algorithm finds the best freelancer for your project based on skills, location, and ratings in seconds.', color: '#6366f1' },
    { icon: '✅', title: 'Verified Professionals', desc: 'Every freelancer is verified with ID proof, portfolio review, and skill assessment before joining the platform.', color: '#10b981' },
    { icon: '⚡', title: 'Fast Hiring', desc: 'Post a job and receive proposals within minutes. Start your project the same day with our streamlined workflow.', color: '#f59e0b' },
    { icon: '🔒', title: 'Secure Payments', desc: 'Your money stays in escrow until you approve the work. 100% safe transactions with instant payout to freelancers.', color: '#3b82f6' },
    { icon: '📍', title: 'Hyperlocal Focus', desc: 'Find talented professionals in your own city. Meet in person, collaborate locally, and build lasting partnerships.', color: '#ec4899' },
    { icon: '📊', title: 'Real-Time Analytics', desc: 'Track project progress, milestones, freelancer performance, and spending — all from one powerful dashboard.', color: '#8b5cf6' },
  ];

  const stats = [
    { value: '48K+', label: 'Active Freelancers', icon: '👥', color: '#6366f1' },
    { value: '12K+', label: 'Projects Completed', icon: '✅', color: '#10b981' },
    { value: '98%', label: 'Satisfaction Rate', icon: '⭐', color: '#f59e0b' },
    { value: '50+', label: 'Cities Covered', icon: '🌍', color: '#3b82f6' },
  ];

  const testimonials = [
    { name: 'Rahul Sharma', role: 'Startup Founder, Delhi', avatar: 'RS', text: 'SkillSphere helped me find an amazing React developer in my city within 2 hours. The AI matching is incredibly accurate!', rating: 5, color: '#6366f1' },
    { name: 'Priya Mehta', role: 'Marketing Manager, Mumbai', avatar: 'PM', text: 'I have tried Fiverr and Upwork, but SkillSphere is different. The local focus means better communication and faster delivery.', rating: 5, color: '#10b981' },
    { name: 'Arjun Patel', role: 'Freelance Designer, Bengaluru', avatar: 'AP', text: 'As a freelancer, I get 3x more quality clients through SkillSphere. The escrow payment system gives me full confidence.', rating: 5, color: '#f59e0b' },
  ];

  return (
    <div style={{ background: '#04050f', color: '#f1f5f9', fontFamily: 'Inter, sans-serif', overflowX: 'hidden' }}>

      {/* ===== NAVBAR ===== */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
        background: 'rgba(4,5,15,0.9)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: '0 48px', height: '64px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>⚡</div>
          <span style={{ fontWeight: '800', fontSize: '20px', background: 'linear-gradient(135deg, #a5b4fc, #818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>SkillSphere</span>
        </div>
        <div style={{ display: 'flex', gap: '32px' }}>
          {['Features', 'How It Works', 'Pricing', 'About'].map(item => (
            <a key={item} href="#" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '14px', fontWeight: '500', transition: 'color 0.2s' }}
              onMouseEnter={e => e.target.style.color = '#f1f5f9'}
              onMouseLeave={e => e.target.style.color = '#94a3b8'}>
              {item}
            </a>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <Link to="/login" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '14px', fontWeight: '500', padding: '8px 16px' }}>Login</Link>
          <Link to="/register" style={{
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            color: '#fff', textDecoration: 'none', fontSize: '14px', fontWeight: '700',
            padding: '9px 22px', borderRadius: '8px',
            boxShadow: '0 4px 16px rgba(99,102,241,0.4)',
          }}>Get Started Free</Link>
        </div>
      </nav>

      {/* ===== HERO ===== */}
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '120px 48px 80px', position: 'relative', overflow: 'hidden',
        background: 'linear-gradient(180deg, #0a0520 0%, #04050f 100%)',
      }}>
        {/* Glow blobs */}
        <div style={{ position: 'absolute', top: '-10%', left: '-5%', width: '700px', height: '700px', background: 'radial-gradient(ellipse, rgba(99,102,241,0.15) 0%, transparent 65%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '20%', right: '-5%', width: '500px', height: '500px', background: 'radial-gradient(ellipse, rgba(139,92,246,0.1) 0%, transparent 65%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '0%', left: '30%', width: '600px', height: '400px', background: 'radial-gradient(ellipse, rgba(59,130,246,0.08) 0%, transparent 65%)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: '1200px', width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '64px', alignItems: 'center' }}>
          {/* Left — Text */}
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: '99px', padding: '6px 16px', fontSize: '13px', color: '#a5b4fc', fontWeight: '600', marginBottom: '28px' }}>
              ⚡ AI-Powered Hyperlocal Platform
            </div>

            <h1 style={{ fontSize: '58px', fontWeight: '900', lineHeight: 1.05, marginBottom: '20px', letterSpacing: '-2px' }}>
              Find the Perfect
              <br />
              <span style={{ background: 'linear-gradient(135deg, #6366f1, #a78bfa, #38bdf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                Freelancer
              </span>
              <br />
              for Your Business
            </h1>

            <p style={{ fontSize: '18px', color: '#94a3b8', lineHeight: 1.7, marginBottom: '36px', maxWidth: '480px' }}>
              Connect with verified local professionals. Our AI matches you with the best talent in your city based on skills, ratings, and availability.
            </p>

            <div style={{ display: 'flex', gap: '14px', marginBottom: '48px', flexWrap: 'wrap' }}>
              <Link to="/register" style={{
                padding: '14px 32px',
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                color: '#fff', textDecoration: 'none', fontWeight: '700',
                borderRadius: '12px', fontSize: '16px',
                boxShadow: '0 8px 32px rgba(99,102,241,0.4)',
                transition: 'all 0.2s',
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(99,102,241,0.5)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(99,102,241,0.4)'; }}>
                🚀 Get Started Free
              </Link>
              <Link to="/gigs" style={{
                padding: '14px 32px',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.12)',
                color: '#e2e8f0', textDecoration: 'none', fontWeight: '600',
                borderRadius: '12px', fontSize: '16px',
                transition: 'all 0.2s',
              }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}>
                Browse Jobs →
              </Link>
            </div>

            {/* Trust badges */}
            <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
              {['✅ No Credit Card', '🔒 Secure Escrow', '⚡ AI Matching'].map(badge => (
                <span key={badge} style={{ color: '#64748b', fontSize: '13px', fontWeight: '500' }}>{badge}</span>
              ))}
            </div>
          </div>

          {/* Right — Laptop Mockup */}
          <div style={{ position: 'relative' }}>
            {/* Glow behind laptop */}
            <div style={{ position: 'absolute', inset: '-20%', background: 'radial-gradient(ellipse, rgba(99,102,241,0.2) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />

            {/* Laptop frame */}
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{
                background: 'linear-gradient(180deg, #1e2030, #141520)',
                borderRadius: '16px 16px 4px 4px',
                padding: '16px 16px 8px',
                boxShadow: '0 40px 80px rgba(0,0,0,0.6), 0 0 0 2px rgba(255,255,255,0.08)',
              }}>
                {/* Screen */}
                <div style={{ background: '#0d0f1a', borderRadius: '8px', overflow: 'hidden', aspectRatio: '16/10' }}>
                  {/* Browser bar */}
                  <div style={{ background: '#161824', padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '6px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    {['#ef4444','#f59e0b','#22c55e'].map((c, i) => <div key={i} style={{ width: '8px', height: '8px', borderRadius: '50%', background: c }} />)}
                    <div style={{ flex: 1, background: 'rgba(255,255,255,0.05)', borderRadius: '4px', height: '16px', marginLeft: '8px', display: 'flex', alignItems: 'center', paddingLeft: '8px' }}>
                      <span style={{ fontSize: '9px', color: '#4b5563' }}>skillsphere.com/dashboard</span>
                    </div>
                  </div>
                  {/* Dashboard UI preview */}
                  <div style={{ padding: '12px', background: '#080d1a' }}>
                    {/* Navbar */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                        <div style={{ width: '16px', height: '16px', borderRadius: '4px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }} />
                        <span style={{ fontSize: '10px', fontWeight: '700', color: '#a5b4fc' }}>SkillSphere</span>
                      </div>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        {['Dashboard', 'Jobs', 'Chat'].map(t => <span key={t} style={{ fontSize: '8px', color: '#4b5563' }}>{t}</span>)}
                      </div>
                    </div>
                    {/* Stats row */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '6px', marginBottom: '10px' }}>
                      {[{ label: 'Active Jobs', val: '24', c: '#6366f1' }, { label: 'Proposals', val: '156', c: '#10b981' }, { label: 'Hired', val: '18', c: '#f59e0b' }, { label: 'Revenue', val: '₹2.4L', c: '#3b82f6' }].map(s => (
                        <div key={s.label} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '6px', padding: '8px', border: `1px solid ${s.c}22` }}>
                          <div style={{ fontSize: '11px', fontWeight: '700', color: s.c }}>{s.val}</div>
                          <div style={{ fontSize: '7px', color: '#4b5563', marginTop: '2px' }}>{s.label}</div>
                        </div>
                      ))}
                    </div>
                    {/* Job cards */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                      {[
                        { title: 'React Developer', budget: '₹45,000', tag: 'Web Dev', match: '95%' },
                        { title: 'UI/UX Designer', budget: '₹28,000', tag: 'Design', match: '88%' },
                        { title: 'Node.js Backend', budget: '₹38,000', tag: 'Backend', match: '92%' },
                        { title: 'Data Scientist', budget: '₹65,000', tag: 'AI/ML', match: '79%' },
                      ].map((job, i) => (
                        <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '6px', padding: '8px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <span style={{ fontSize: '8px', background: 'rgba(99,102,241,0.2)', color: '#a5b4fc', borderRadius: '3px', padding: '1px 5px' }}>{job.tag}</span>
                            <span style={{ fontSize: '8px', color: '#10b981', fontWeight: '700' }}>{job.match}</span>
                          </div>
                          <div style={{ fontSize: '9px', fontWeight: '600', color: '#e2e8f0', marginBottom: '3px' }}>{job.title}</div>
                          <div style={{ fontSize: '8px', color: '#f59e0b', fontWeight: '700' }}>{job.budget}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              {/* Laptop base */}
              <div style={{ background: 'linear-gradient(180deg, #1a1c2e, #111320)', height: '12px', borderRadius: '0 0 4px 4px', margin: '0 8px' }} />
              <div style={{ background: 'linear-gradient(180deg, #141620, #0f1020)', height: '8px', borderRadius: '0 0 8px 8px', margin: '0 -12px' }} />
            </div>

            {/* Floating mobile mockup */}
            <div style={{
              position: 'absolute', bottom: '-20px', right: '-30px', zIndex: 2,
              background: 'linear-gradient(180deg, #1e2030, #141520)',
              borderRadius: '20px', padding: '8px',
              boxShadow: '0 20px 60px rgba(0,0,0,0.6), 0 0 0 2px rgba(255,255,255,0.08)',
              width: '100px',
            }}>
              <div style={{ background: '#0d0f1a', borderRadius: '14px', overflow: 'hidden' }}>
                <div style={{ height: '4px', background: '#161824', display: 'flex', justifyContent: 'center', alignItems: 'center', paddingTop: '4px' }}>
                  <div style={{ width: '20px', height: '2px', background: '#2d3142', borderRadius: '99px' }} />
                </div>
                <div style={{ padding: '8px 6px' }}>
                  <div style={{ fontSize: '7px', fontWeight: '700', color: '#a5b4fc', marginBottom: '6px' }}>SkillSphere</div>
                  {[{ t: 'React Dev', b: '₹45K', c: '#6366f1' }, { t: 'UI Designer', b: '₹28K', c: '#10b981' }].map((j, i) => (
                    <div key={i} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '4px', padding: '5px', marginBottom: '4px', border: `1px solid ${j.c}33` }}>
                      <div style={{ fontSize: '7px', color: '#e2e8f0', fontWeight: '600' }}>{j.t}</div>
                      <div style={{ fontSize: '7px', color: '#f59e0b' }}>{j.b}</div>
                    </div>
                  ))}
                  <div style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', borderRadius: '4px', padding: '4px', textAlign: 'center' }}>
                    <span style={{ fontSize: '7px', color: '#fff', fontWeight: '700' }}>Apply Now</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating stats badge */}
            <div style={{
              position: 'absolute', top: '-16px', left: '-20px', zIndex: 2,
              background: 'rgba(16,185,129,0.12)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(16,185,129,0.3)',
              borderRadius: '12px', padding: '10px 14px',
            }}>
              <div style={{ fontSize: '18px', fontWeight: '900', color: '#10b981' }}>98%</div>
              <div style={{ fontSize: '10px', color: '#6ee7b7' }}>Satisfaction</div>
            </div>

            {/* Floating match badge */}
            <div style={{
              position: 'absolute', top: '40%', right: '-24px', zIndex: 2,
              background: 'rgba(99,102,241,0.15)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(99,102,241,0.3)',
              borderRadius: '12px', padding: '10px 14px',
            }}>
              <div style={{ fontSize: '18px', fontWeight: '900', color: '#a5b4fc' }}>AI ✨</div>
              <div style={{ fontSize: '10px', color: '#c4b5fd' }}>Smart Match</div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== BEFORE VS AFTER ===== */}
      <div style={{ padding: '80px 48px', background: '#06080f', position: 'relative' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <h2 style={{ fontSize: '40px', fontWeight: '800', letterSpacing: '-1px', marginBottom: '12px' }}>
              Old Way vs <span style={{ background: 'linear-gradient(135deg, #6366f1, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>SkillSphere Way</span>
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '16px' }}>See how we transformed the hiring experience</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '24px', alignItems: 'center' }}>
            {/* BEFORE */}
            <div style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '20px', padding: '32px', position: 'relative' }}>
              <div style={{ display: 'inline-block', background: '#ef4444', color: '#fff', borderRadius: '8px', padding: '4px 14px', fontSize: '12px', fontWeight: '700', marginBottom: '20px', letterSpacing: '1px' }}>BEFORE</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {['❌  Days of manual searching', '❌  Unverified freelancers', '❌  No quality guarantee', '❌  Unsafe payment methods', '❌  Global, not local focus', '❌  No AI assistance'].map(item => (
                  <div key={item} style={{ color: '#fca5a5', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>{item}</div>
                ))}
              </div>
            </div>

            {/* Arrow */}
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', boxShadow: '0 8px 32px rgba(99,102,241,0.4)', margin: '0 auto' }}>→</div>
            </div>

            {/* AFTER */}
            <div style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.25)', borderRadius: '20px', padding: '32px', position: 'relative' }}>
              <div style={{ display: 'inline-block', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', borderRadius: '8px', padding: '4px 14px', fontSize: '12px', fontWeight: '700', marginBottom: '20px', letterSpacing: '1px' }}>WITH SKILLSPHERE</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {['✅  Find talent in minutes with AI', '✅  All freelancers verified & rated', '✅  Quality work guaranteed', '✅  Secure escrow payments', '✅  Hyperlocal — your own city', '✅  Smart AI-powered matching'].map(item => (
                  <div key={item} style={{ color: '#a5b4fc', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>{item}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== STATS ===== */}
      <div style={{ padding: '80px 48px', background: 'linear-gradient(135deg, #0a0520, #04050f)' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '24px' }}>
            {stats.map(s => (
              <div key={s.label} style={{
                background: 'rgba(255,255,255,0.03)',
                backdropFilter: 'blur(20px)',
                border: `1px solid ${s.color}22`,
                borderRadius: '20px', padding: '32px 24px', textAlign: 'center',
                transition: 'all 0.3s',
              }}
                onMouseEnter={e => { e.currentTarget.style.border = `1px solid ${s.color}55`; e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = `0 16px 48px ${s.color}15`; }}
                onMouseLeave={e => { e.currentTarget.style.border = `1px solid ${s.color}22`; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>{s.icon}</div>
                <div style={{ fontSize: '36px', fontWeight: '900', color: s.color, letterSpacing: '-1px', marginBottom: '4px' }}>{s.value}</div>
                <div style={{ color: '#94a3b8', fontSize: '14px' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ===== FEATURES ===== */}
      <div style={{ padding: '80px 48px', background: '#04050f' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <h2 style={{ fontSize: '40px', fontWeight: '800', letterSpacing: '-1px', marginBottom: '12px' }}>
              Everything You Need to <span style={{ background: 'linear-gradient(135deg, #6366f1, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Hire Smarter</span>
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '16px' }}>Powerful features built for modern businesses and freelancers</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '20px' }}>
            {features.map((f, i) => (
              <div key={f.title}
                onMouseEnter={() => setHoveredFeature(i)}
                onMouseLeave={() => setHoveredFeature(null)}
                style={{
                  background: hoveredFeature === i ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.02)',
                  backdropFilter: 'blur(20px)',
                  border: hoveredFeature === i ? `1px solid ${f.color}44` : '1px solid rgba(255,255,255,0.07)',
                  borderRadius: '20px', padding: '28px',
                  transition: 'all 0.3s',
                  transform: hoveredFeature === i ? 'translateY(-4px)' : 'translateY(0)',
                  boxShadow: hoveredFeature === i ? `0 16px 48px ${f.color}12` : 'none',
                }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: `${f.color}20`, border: `1px solid ${f.color}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', marginBottom: '16px' }}>{f.icon}</div>
                <h3 style={{ fontSize: '17px', fontWeight: '700', marginBottom: '10px', color: '#f1f5f9' }}>{f.title}</h3>
                <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: 1.7 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ===== TESTIMONIALS ===== */}
      <div style={{ padding: '80px 48px', background: 'linear-gradient(135deg, #06080f, #0a0520)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <h2 style={{ fontSize: '40px', fontWeight: '800', letterSpacing: '-1px', marginBottom: '12px' }}>
              Loved by <span style={{ background: 'linear-gradient(135deg, #6366f1, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Thousands</span>
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '16px' }}>Real stories from real clients and freelancers</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '20px' }}>
            {testimonials.map((t, i) => (
              <div key={t.name}
                onMouseEnter={() => setHoveredTestimonial(i)}
                onMouseLeave={() => setHoveredTestimonial(null)}
                style={{
                  background: hoveredTestimonial === i ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.02)',
                  backdropFilter: 'blur(20px)',
                  border: hoveredTestimonial === i ? `1px solid ${t.color}44` : '1px solid rgba(255,255,255,0.07)',
                  borderRadius: '20px', padding: '28px',
                  transition: 'all 0.3s',
                  transform: hoveredTestimonial === i ? 'translateY(-4px)' : 'translateY(0)',
                }}>
                <div style={{ color: '#f59e0b', fontSize: '18px', marginBottom: '16px' }}>{'★'.repeat(t.rating)}</div>
                <p style={{ color: '#cbd5e1', fontSize: '15px', lineHeight: 1.7, marginBottom: '20px', fontStyle: 'italic' }}>"{t.text}"</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: `linear-gradient(135deg, ${t.color}, ${t.color}88)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '700', color: '#fff' }}>{t.avatar}</div>
                  <div>
                    <div style={{ fontWeight: '700', fontSize: '14px', color: '#f1f5f9' }}>{t.name}</div>
                    <div style={{ color: '#64748b', fontSize: '12px' }}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ===== FINAL CTA ===== */}
      <div style={{ padding: '100px 48px', background: '#04050f', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '800px', height: '500px', background: 'radial-gradient(ellipse, rgba(99,102,241,0.2) 0%, transparent 65%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '600px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '48px', fontWeight: '900', letterSpacing: '-2px', marginBottom: '16px', lineHeight: 1.1 }}>
            Ready to Hire
            <br />
            <span style={{ background: 'linear-gradient(135deg, #6366f1, #a78bfa, #38bdf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Smarter?</span>
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '18px', marginBottom: '40px', lineHeight: 1.6 }}>
            Join 48,000+ businesses and freelancers. Start your journey today — completely free.
          </p>
          <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" style={{
              padding: '16px 40px', fontSize: '17px', fontWeight: '800',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #a78bfa)',
              color: '#fff', textDecoration: 'none', borderRadius: '14px',
              boxShadow: '0 8px 40px rgba(99,102,241,0.5), 0 0 80px rgba(99,102,241,0.2)',
              transition: 'all 0.3s',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px) scale(1.02)'; e.currentTarget.style.boxShadow = '0 16px 60px rgba(99,102,241,0.6), 0 0 100px rgba(99,102,241,0.3)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0) scale(1)'; e.currentTarget.style.boxShadow = '0 8px 40px rgba(99,102,241,0.5), 0 0 80px rgba(99,102,241,0.2)'; }}>
              🚀 Start for Free Today
            </Link>
            <Link to="/gigs" style={{
              padding: '16px 40px', fontSize: '17px', fontWeight: '700',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.15)',
              color: '#e2e8f0', textDecoration: 'none', borderRadius: '14px',
              transition: 'all 0.2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}>
              Browse Jobs
            </Link>
          </div>
          <p style={{ color: '#374151', fontSize: '13px', marginTop: '20px' }}>No credit card required • Free forever plan available</p>
        </div>
      </div>

      {/* ===== FOOTER ===== */}
      <footer style={{ background: '#02030a', borderTop: '1px solid rgba(255,255,255,0.05)', padding: '32px 48px', textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1100px', margin: '0 auto', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '7px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>⚡</div>
            <span style={{ fontWeight: '700', fontSize: '16px', color: '#a5b4fc' }}>SkillSphere</span>
          </div>
          <p style={{ color: '#374151', fontSize: '13px' }}>© 2025 SkillSphere. Built with ❤️ for India's freelance economy.</p>
          <div style={{ display: 'flex', gap: '20px' }}>
            {['Privacy', 'Terms', 'Contact'].map(item => (
              <a key={item} href="#" style={{ color: '#374151', fontSize: '13px', textDecoration: 'none' }}>{item}</a>
            ))}
          </div>
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;
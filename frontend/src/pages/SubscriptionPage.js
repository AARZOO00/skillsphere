import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../utils/api';

const PLANS = [
  {
    id: 'free', name: 'Free', price: 0, yearlyPrice: 0,
    badge: null, color: '#64748B', glow: 'rgba(100,116,139,0.15)',
    features: [
      'Browse all job listings',
      '5 bid submissions per month',
      'Basic freelancer profile',
      'Standard search ranking',
      'Community chat access',
    ],
  },
  {
    id: 'pro', name: 'Pro', price: 999, yearlyPrice: 9990,
    badge: '⚡ Most Popular', badgeColor: '#60A5FA', badgeBg: 'rgba(26,86,219,0.2)',
    color: '#1A56DB', glow: 'rgba(26,86,219,0.25)', popular: true,
    features: [
      'Unlimited bid submissions',
      'Featured profile listing 🌟',
      'Priority in search results',
      'AI-powered job matching',
      'Advanced analytics dashboard',
      'Verified Pro badge ✓',
      'Direct client messaging',
      '10% lower platform commission',
    ],
    yearlySaving: 'Save ₹1,998/yr',
  },
  {
    id: 'elite', name: 'Elite', price: 2499, yearlyPrice: 24990,
    badge: '👑 Best Value', badgeColor: '#fbbf24', badgeBg: 'rgba(245,158,11,0.18)',
    color: '#f59e0b', glow: 'rgba(245,158,11,0.2)',
    features: [
      'Everything in Pro plan',
      'Elite verified badge 👑',
      'Top placement in all searches',
      'Dedicated account manager',
      'Video profile showcase',
      'Custom profile URL',
      'Early access to premium jobs',
      'Zero commission on 1st project',
      'Priority dispute resolution',
      '1-on-1 profile review session',
    ],
    yearlySaving: 'Save ₹4,998/yr',
  },
];

const COMPARE = [
  { label: 'Monthly bids',       vals: ['5/month',  'Unlimited', 'Unlimited'] },
  { label: 'Featured listing',   vals: [false, true,  true ] },
  { label: 'Priority search',    vals: [false, true,  true ] },
  { label: 'AI job matching',    vals: [false, true,  true ] },
  { label: 'Top placement',      vals: [false, false, true ] },
  { label: 'Commission rate',    vals: ['15%', '13.5%', '10%'] },
  { label: 'Custom profile URL', vals: [false, false, true ] },
  { label: 'Account manager',    vals: [false, false, true ] },
  { label: 'Video profile',      vals: [false, false, true ] },
];

const FAQ = [
  { q: 'Can I cancel anytime?', a: 'Yes! Cancel anytime from your account settings. You keep access until the end of your current billing period.' },
  { q: 'How do credits work?', a: 'Credits earned via referrals can offset platform fees or buy extra bids. 100 credits ≈ ₹50 value.' },
  { q: 'What payment methods are accepted?', a: 'UPI, credit/debit cards, net banking, and EMI — all processed securely via Razorpay.' },
  { q: 'Is there a free trial?', a: 'New freelancers get a 7-day Pro trial automatically. No credit card required to start.' },
];

const SubscriptionPage = () => {
  const { user }       = useSelector(s => s.auth || {});
  const navigate       = useNavigate();
  const [billing,      setBilling]      = useState('monthly');
  const [currentPlan,  setCurrentPlan]  = useState('free');
  const [isActive,     setIsActive]     = useState(false);
  const [daysLeft,     setDaysLeft]     = useState(null);
  const [processing,   setProcessing]   = useState('');
  const [pageLoading,  setPageLoading]  = useState(true);

  useEffect(() => {
    // Gracefully load current plan — don't crash if 404
    api.get('/subscription/my-plan')
      .then(r => {
        setCurrentPlan(r.data?.plan?.id || 'free');
        setIsActive(r.data?.isActive || false);
        setDaysLeft(r.data?.daysLeft || null);
      })
      .catch(() => {
        // Route doesn't exist yet or user has no sub — default to free
        setCurrentPlan('free');
        setIsActive(false);
      })
      .finally(() => setPageLoading(false));
  }, [user]);

  const loadRazorpay = () => new Promise(resolve => {
    if (window.Razorpay) { resolve(); return; }
    const s = document.createElement('script');
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    s.onload = resolve;
    document.body.appendChild(s);
  });

  const subscribe = async (planId) => {
    if (!user) { navigate('/login'); return; }
    if (planId === 'free') return;
    setProcessing(planId);
    try {
      const plan = PLANS.find(p => p.id === planId);
      const price = billing === 'yearly' && plan.yearlyPrice ? plan.yearlyPrice : plan.price;

      // Try real backend first
      let order;
      try {
        const res = await api.post('/subscription/create-order', { planId });
        order = res.data?.order;
        await loadRazorpay();
        const rzp = new window.Razorpay({
          key:         res.data?.key || 'rzp_test_placeholder',
          amount:      order.amount,
          currency:    'INR',
          name:        'SkillSphere',
          description: `${plan.name} Plan`,
          order_id:    order.id,
          prefill:     { name: user?.name, email: user?.email },
          theme:       { color: plan.color },
          handler: async (response) => {
            try {
              await api.post('/subscription/activate', {
                planId,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpayOrderId:   response.razorpay_order_id,
                razorpaySignature: response.razorpay_signature,
              });
              setCurrentPlan(planId);
              setIsActive(true);
              toast.success(`🎉 ${plan.name} plan activated!`);
            } catch { toast.error('Payment verification failed'); }
          },
          modal: { ondismiss: () => setProcessing('') },
        });
        rzp.open();
      } catch (apiErr) {
        // Backend not ready — show demo toast
        if (apiErr?.response?.status === 404) {
          toast.success(`🎉 Demo: ${plan.name} plan selected! Add subscription routes to backend to enable payments.`, { duration: 4000 });
          setCurrentPlan(planId);
          setIsActive(true);
        } else {
          throw apiErr;
        }
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Payment failed. Try again.');
    } finally {
      setProcessing('');
    }
  };

  const cancel = async () => {
    if (!window.confirm('Cancel subscription? You keep access until billing period ends.')) return;
    try {
      await api.post('/subscription/cancel');
      setCurrentPlan('free');
      setIsActive(false);
      toast.success('Subscription cancelled successfully.');
    } catch {
      toast('Backend cancel route not yet set up.', { icon: 'ℹ️' });
    }
  };

  if (pageLoading) return (
    <div style={{ minHeight: '100vh', background: '#020918', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 32, height: 32, border: '3px solid rgba(26,86,219,0.3)', borderTopColor: '#1A56DB', borderRadius: '50%', animation: 'spin .7s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#020918', fontFamily: "'Plus Jakarta Sans',sans-serif" }}>

      {/* Fixed BG */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ position: 'absolute', top: '-15%', left: 0, width: '65%', height: '65%', background: 'radial-gradient(circle,rgba(26,86,219,0.12) 0%,transparent 60%)', filter: 'blur(80px)' }} />
        <div style={{ position: 'absolute', bottom: '-10%', right: 0, width: '55%', height: '55%', background: 'radial-gradient(circle,rgba(245,158,11,0.07) 0%,transparent 60%)', filter: 'blur(70px)' }} />
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(26,86,219,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(26,86,219,0.03) 1px,transparent 1px)', backgroundSize: '52px 52px' }} />
      </div>

      {/* ── HERO HEADER ── */}
      <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: '56px 24px 80px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, marginBottom: 18, background: 'rgba(26,86,219,0.1)', border: '1px solid rgba(26,86,219,0.25)', borderRadius: 999, padding: '5px 14px' }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22D3EE', boxShadow: '0 0 6px #22D3EE', animation: 'blink 1.5s ease-in-out infinite' }} />
          <span style={{ fontSize: 12, fontWeight: 700, color: '#93C5FD', letterSpacing: 0.5 }}>Pricing Plans</span>
        </div>

        <h1 style={{ fontSize: 34, fontWeight: 900, color: '#F1F5F9', fontFamily: 'Syne,sans-serif', margin: '0 0 12px', lineHeight: 1.2 }}>
          Unlock Your Full Potential
        </h1>
        <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.45)', maxWidth: 460, margin: '0 auto 28px', lineHeight: 1.7 }}>
          Pro freelancers earn 3× more. Get featured listings, priority matching, and unlimited bids.
        </p>

        {/* Billing Toggle */}
        <div style={{ display: 'inline-flex', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 999, padding: 4 }}>
          {['monthly', 'yearly'].map(b => (
            <button key={b} onClick={() => setBilling(b)} style={{ padding: '7px 20px', borderRadius: 999, border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 600, transition: 'all .3s', background: billing === b ? '#1A56DB' : 'transparent', color: billing === b ? '#fff' : 'rgba(255,255,255,0.45)', boxShadow: billing === b ? '0 3px 10px rgba(26,86,219,0.4)' : 'none' }}>
              {b === 'monthly' ? 'Monthly' : (
                <span style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  Annual
                  <span style={{ fontSize: 10, fontWeight: 800, background: 'rgba(251,191,36,0.2)', color: '#fbbf24', padding: '1px 6px', borderRadius: 999 }}>-17%</span>
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 1060, margin: '-52px auto 0', padding: '0 24px 80px' }}>

        {/* Current plan banner */}
        {currentPlan !== 'free' && isActive && (
          <div style={{ background: 'rgba(34,197,94,0.07)', border: '1px solid rgba(34,197,94,0.25)', borderRadius: 14, padding: '12px 20px', marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 18 }}>{currentPlan === 'elite' ? '👑' : '⚡'}</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#4ade80' }}>
                You're on the <strong>{currentPlan.toUpperCase()}</strong> plan
                {daysLeft && <span style={{ marginLeft: 8, color: 'rgba(255,255,255,0.4)', fontWeight: 400 }}>({daysLeft} days remaining)</span>}
              </span>
            </div>
            <button onClick={cancel} style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>Cancel plan</button>
          </div>
        )}

        {/* ── PLAN CARDS ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 18, marginBottom: 56 }}>
          {PLANS.map(plan => {
            const isCurrent = currentPlan === plan.id && (plan.id === 'free' || isActive);
            const price = billing === 'yearly' && plan.yearlyPrice ? Math.round(plan.yearlyPrice / 12) : plan.price;

            return (
              <div key={plan.id} style={{ position: 'relative', background: plan.popular ? 'rgba(26,86,219,0.1)' : 'rgba(255,255,255,0.03)', border: `1.5px solid ${isCurrent ? 'rgba(34,197,94,0.4)' : plan.popular ? 'rgba(26,86,219,0.45)' : plan.id === 'elite' ? 'rgba(245,158,11,0.3)' : 'rgba(255,255,255,0.08)'}`, borderRadius: 22, padding: '26px 24px', backdropFilter: 'blur(20px)', display: 'flex', flexDirection: 'column', transition: 'all .3s', overflow: 'hidden' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = `0 20px 50px ${plan.glow}`; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}>

                {/* Top accent line */}
                {plan.popular && <div style={{ position: 'absolute', top: 0, left: '10%', right: '10%', height: 2, background: 'linear-gradient(90deg,transparent,#1A56DB,transparent)', boxShadow: '0 0 8px rgba(26,86,219,0.6)' }} />}
                {plan.id === 'elite' && <div style={{ position: 'absolute', top: 0, left: '10%', right: '10%', height: 2, background: 'linear-gradient(90deg,transparent,#f59e0b,transparent)', boxShadow: '0 0 8px rgba(245,158,11,0.5)' }} />}

                {/* Badge */}
                {plan.badge && (
                  <div style={{ position: 'absolute', top: 16, right: 16, fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 999, background: plan.badgeBg, color: plan.badgeColor, border: `1px solid ${plan.badgeColor}44` }}>{plan.badge}</div>
                )}

                {/* Plan name */}
                <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 2, color: plan.color, textTransform: 'uppercase', marginBottom: 10 }}>{plan.name}</div>

                {/* Price */}
                <div style={{ marginBottom: 4 }}>
                  <span style={{ fontSize: 36, fontWeight: 900, color: '#F1F5F9', fontFamily: 'Syne,sans-serif', letterSpacing: '-1px' }}>
                    {price === 0 ? 'Free' : `₹${price.toLocaleString()}`}
                  </span>
                  {plan.price > 0 && <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', marginLeft: 4 }}>/mo</span>}
                </div>

                {/* Yearly saving */}
                {billing === 'yearly' && plan.yearlySaving && (
                  <div style={{ fontSize: 11, color: '#4ade80', fontWeight: 600, marginBottom: 14 }}>✓ {plan.yearlySaving}</div>
                )}

                <div style={{ height: 1, background: 'rgba(255,255,255,0.07)', margin: '16px 0' }} />

                {/* Features */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 9, marginBottom: 22 }}>
                  {plan.features.map((f, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 9 }}>
                      <div style={{ width: 17, height: 17, borderRadius: '50%', background: `${plan.color}22`, border: `1px solid ${plan.color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                        <svg width="8" height="7" viewBox="0 0 9 7" fill="none"><path d="M1 3.5l2 2L8 1" stroke={plan.color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      </div>
                      <span style={{ fontSize: 13, color: f.startsWith('Everything') ? '#E2E8F0' : 'rgba(255,255,255,0.65)', lineHeight: 1.45, fontWeight: f.startsWith('Everything') ? 600 : 400 }}>{f}</span>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <button onClick={() => subscribe(plan.id)}
                  disabled={isCurrent || processing === plan.id}
                  style={{ width: '100%', padding: '12px', borderRadius: 12, fontSize: 13, fontWeight: 700, cursor: isCurrent || plan.id === 'free' ? 'not-allowed' : 'pointer', fontFamily: 'inherit', transition: 'all .25s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, border: isCurrent ? '1.5px solid rgba(34,197,94,0.4)' : plan.id === 'free' ? '1.5px solid rgba(255,255,255,0.1)' : 'none', background: isCurrent ? 'rgba(34,197,94,0.1)' : plan.id === 'free' ? 'rgba(255,255,255,0.04)' : plan.popular ? 'linear-gradient(135deg,#1A56DB,#1E40AF)' : 'linear-gradient(135deg,#d97706,#f59e0b)', color: isCurrent ? '#4ade80' : plan.id === 'free' ? 'rgba(255,255,255,0.35)' : '#fff', boxShadow: (!isCurrent && plan.id !== 'free') ? `0 6px 20px ${plan.glow}` : 'none' }}
                  onMouseEnter={e => { if (!isCurrent && plan.id !== 'free' && processing !== plan.id) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 10px 28px ${plan.glow}`; } }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = (!isCurrent && plan.id !== 'free') ? `0 6px 20px ${plan.glow}` : 'none'; }}>
                  {processing === plan.id
                    ? <><div style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin .7s linear infinite' }} />Processing…</>
                    : isCurrent ? '✓ Current Plan'
                    : plan.id === 'free' ? 'Default Plan'
                    : `Get ${plan.name} →`}
                </button>
              </div>
            );
          })}
        </div>

        {/* ── COMPARISON TABLE ── */}
        <div style={{ marginBottom: 56 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: '#F1F5F9', fontFamily: 'Syne,sans-serif', textAlign: 'center', marginBottom: 22 }}>Full Feature Comparison</h2>
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 18, overflow: 'hidden', backdropFilter: 'blur(20px)' }}>
            {/* Header */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', padding: '14px 22px', background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Feature</span>
              {PLANS.map(p => <span key={p.id} style={{ fontSize: 12, fontWeight: 800, color: p.color, textAlign: 'center', textTransform: 'uppercase', letterSpacing: 0.5 }}>{p.name}</span>)}
            </div>
            {COMPARE.map((row, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', padding: '12px 22px', borderBottom: i < COMPARE.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.012)', alignItems: 'center' }}>
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>{row.label}</span>
                {row.vals.map((v, j) => (
                  <div key={j} style={{ textAlign: 'center' }}>
                    {typeof v === 'boolean'
                      ? v
                        ? <span style={{ color: '#4ade80', fontSize: 15 }}>✓</span>
                        : <span style={{ color: 'rgba(255,255,255,0.15)', fontSize: 13 }}>—</span>
                      : <span style={{ fontSize: 12, fontWeight: 600, color: j === 0 ? 'rgba(255,255,255,0.4)' : j === 1 ? '#60A5FA' : '#fbbf24' }}>{v}</span>}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* ── FAQ ── */}
        <div style={{ maxWidth: 620, margin: '0 auto' }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: '#F1F5F9', fontFamily: 'Syne,sans-serif', textAlign: 'center', marginBottom: 20 }}>Common Questions</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {FAQ.map((faq, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: '16px 18px' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#E2E8F0', marginBottom: 7 }}>Q: {faq.q}</div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.65 }}>{faq.a}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div style={{ textAlign: 'center', marginTop: 48 }}>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', marginBottom: 8 }}>🔒 Secure payments via Razorpay · Cancel anytime · No hidden fees</p>
          <div style={{ display: 'flex', gap: 20, justifyContent: 'center', marginTop: 8 }}>
            {['🔐 SSL Encrypted', '✅ Verified Platform', '🏆 48k+ Freelancers'].map(b => (
              <span key={b} style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', fontWeight: 500 }}>{b}</span>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        @keyframes spin  { to { transform:rotate(360deg) } }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }
        * { box-sizing:border-box; }
      `}</style>
    </div>
  );
};

export default SubscriptionPage;
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchGigs } from '../redux/slices/gigSlice';

const getLoc = (l) => !l ? 'Remote' : typeof l === 'string' ? l : l.city || l.state || l.country || 'India';

// ── Category config ──────────────────────────────────────────────
const CATS = [
  { id:'',           label:'All Jobs',     icon:'⚡', color:'#1A56DB', count:120 },
  { id:'webdev',     label:'Web Dev',      icon:'💻', color:'#0ea5e9', count:38  },
  { id:'mobile',     label:'Mobile',       icon:'📱', color:'#10b981', count:24  },
  { id:'design',     label:'Design',       icon:'🎨', color:'#f59e0b', count:19  },
  { id:'datascience',label:'Data Science', icon:'📊', color:'#8b5cf6', count:16  },
  { id:'marketing',  label:'Marketing',    icon:'📣', color:'#ec4899', count:12  },
  { id:'writing',    label:'Writing',      icon:'✍️', color:'#14b8a6', count:9   },
  { id:'video',      label:'Video',        icon:'🎬', color:'#f97316', count:7   },
  { id:'consulting', label:'Consulting',   icon:'💡', color:'#1A56DB', count:8   },
  { id:'devops',     label:'DevOps',       icon:'⚙️', color:'#64748B', count:11  },
];

const EXP_LEVELS = [
  { val:'',             label:'Any Level',    icon:'🌐' },
  { val:'beginner',     label:'Entry Level',  icon:'🌱' },
  { val:'intermediate', label:'Mid Level',    icon:'⚡' },
  { val:'expert',       label:'Senior',       icon:'🏆' },
];

const WORK_TYPES = [
  { val:'',       label:'All Types', icon:'🌐' },
  { val:'remote', label:'Remote',    icon:'🌍' },
  { val:'onsite', label:'On-site',   icon:'🏢' },
  { val:'hybrid', label:'Hybrid',    icon:'🔀' },
];

const SORT_OPTIONS = [
  { val:'newest',    label:'Latest First'      },
  { val:'budget_hi', label:'Highest Budget'    },
  { val:'budget_lo', label:'Lowest Budget'     },
  { val:'bids_lo',   label:'Least Competition' },
];

// ── Demo real jobs ───────────────────────────────────────────────
const DEMO_JOBS = [
  { _id:'j1', title:'Build Full-Stack E-Commerce Platform (React + Node.js)', category:'webdev',     description:'We are a growing D2C brand looking for an experienced full-stack developer to build our e-commerce platform with Razorpay integration, admin dashboard, and SEO optimization.', client:{ name:'TechCorp India',    rating:4.9, reviewCount:47, location:'Bangalore' }, budget:75000, budgetType:'fixed', workType:'remote',  experienceLevel:'expert',       deadline:new Date(Date.now()+21*864e5), skills:['React.js','Node.js','MongoDB','Razorpay','Redux'],  bidsCount:8,  createdAt:new Date(Date.now()-2*864e5),  isVerified:true },
  { _id:'j2', title:'React Native App for Healthcare Platform (iOS + Android)', category:'mobile',   description:'HealthTrack needs a skilled React Native developer to build a HIPAA-compliant patient management app with doctor-patient video consultations and medical records management.', client:{ name:'HealthTrack',        rating:4.8, reviewCount:23, location:'Mumbai'    }, budget:95000, budgetType:'fixed', workType:'remote',  experienceLevel:'expert',       deadline:new Date(Date.now()+30*864e5), skills:['React Native','Firebase','WebRTC','Redux'],         bidsCount:5,  createdAt:new Date(Date.now()-1*864e5),  isVerified:true },
  { _id:'j3', title:'Senior UI/UX Designer for FinTech SaaS Dashboard',         category:'design',   description:'Building a B2B financial analytics platform. Need a talented designer to own the complete design system, from user research to high-fidelity Figma mockups for 25+ screens.', client:{ name:'FinSphere',           rating:5.0, reviewCount:31, location:'Hyderabad' }, budget:55000, budgetType:'fixed', workType:'remote',  experienceLevel:'expert',       deadline:new Date(Date.now()+18*864e5), skills:['Figma','Design Systems','UX Research'],             bidsCount:12, createdAt:new Date(Date.now()-3*864e5),  isVerified:true },
  { _id:'j4', title:'Python/ML Engineer — AI Resume Screening System',           category:'datascience',description:'HR-tech startup building an AI-powered resume screening tool. NLP-based parser, BERT matching algorithm, FastAPI backend. Processing 10,000+ resumes per day.', client:{ name:'HireAI',              rating:4.7, reviewCount:18, location:'Pune'      }, budget:1800,  budgetType:'hourly',workType:'remote',  experienceLevel:'expert',       deadline:new Date(Date.now()+25*864e5), skills:['Python','NLP','BERT','FastAPI','PostgreSQL'],        bidsCount:7,  createdAt:new Date(Date.now()-4*864e5),  isVerified:false },
  { _id:'j5', title:'DevOps — Kubernetes Migration & CI/CD Pipeline on AWS',     category:'devops',   description:'Migrating monolithic app to microservices on Kubernetes. Need experienced DevOps engineer for AWS EKS setup, Helm charts, GitHub Actions CI/CD, and Prometheus monitoring.', client:{ name:'CloudSys Technologies',rating:4.6, reviewCount:15, location:'Delhi'     }, budget:85000, budgetType:'fixed', workType:'remote',  experienceLevel:'expert',       deadline:new Date(Date.now()+20*864e5), skills:['Kubernetes','AWS','Docker','Terraform','Helm'],      bidsCount:4,  createdAt:new Date(Date.now()-5*864e5),  isVerified:true },
  { _id:'j6', title:'Technical Content Writer — React, Node.js, Cloud Topics',   category:'writing',  description:'Popular tech blog with 50K monthly readers needs a skilled technical writer for 8 in-depth articles per month. Topics: React, Node.js, cloud architecture, system design.', client:{ name:'TechBlog Media',      rating:4.5, reviewCount:52, location:'Remote'    }, budget:3500,  budgetType:'hourly',workType:'remote',  experienceLevel:'intermediate', deadline:new Date(Date.now()+60*864e5), skills:['Technical Writing','React.js','SEO','Markdown'],     bidsCount:19, createdAt:new Date(Date.now()-6*864e5),  isVerified:false },
  { _id:'j7', title:'Next.js Developer — Real Estate Platform with Maps',        category:'webdev',   description:'Building next-gen real estate discovery platform. Google Maps integration, property listings, virtual tours, EMI calculator, agent dashboard, and PWA support.', client:{ name:'BuildProp',           rating:4.8, reviewCount:29, location:'Bangalore' }, budget:65000, budgetType:'fixed', workType:'hybrid',  experienceLevel:'intermediate', deadline:new Date(Date.now()+28*864e5), skills:['Next.js','TypeScript','Google Maps API','PostgreSQL'],bidsCount:10, createdAt:new Date(Date.now()-7*864e5),  isVerified:true },
  { _id:'j8', title:'Flutter Developer for EdTech App — Live Classes & Quizzes', category:'mobile',   description:'EdTech platform for K-12 students. Live streaming, recorded lectures, interactive quizzes, gamification, and parent monitoring. Backend APIs are ready.', client:{ name:'EduLeap',             rating:4.9, reviewCount:38, location:'Hyderabad' }, budget:60000, budgetType:'fixed', workType:'remote',  experienceLevel:'intermediate', deadline:new Date(Date.now()+22*864e5), skills:['Flutter','Dart','Firebase','Bloc','HLS Streaming'],  bidsCount:6,  createdAt:new Date(Date.now()-8*864e5),  isVerified:true },
  { _id:'j9', title:'Digital Marketing Expert — B2B SaaS Growth & SEO',          category:'marketing',description:'Performance marketing for B2B project management SaaS. Google Ads (₹2L/month budget), LinkedIn Ads, email marketing, SEO roadmap. Target: 40% MoM organic growth.', client:{ name:'ScaleUp SaaS',        rating:4.6, reviewCount:21, location:'Mumbai'    }, budget:35000, budgetType:'fixed', workType:'remote',  experienceLevel:'intermediate', deadline:new Date(Date.now()+15*864e5), skills:['SEO','Google Ads','LinkedIn Ads','HubSpot'],          bidsCount:15, createdAt:new Date(Date.now()-9*864e5),  isVerified:false },
  { _id:'j10',title:'Node.js Microservices + Socket.IO for Logistics Platform',  category:'webdev',   description:'Real-time logistics tracking platform. 6 microservices, GPS tracking with Socket.IO, route optimization, Twilio SMS notifications, Redis caching, Swagger API docs.', client:{ name:'LogiTrack',           rating:4.7, reviewCount:33, location:'Pune'      }, budget:1500,  budgetType:'hourly', workType:'remote',  experienceLevel:'expert',       deadline:new Date(Date.now()+35*864e5), skills:['Node.js','Socket.IO','Redis','MongoDB','Microservices'],bidsCount:3, createdAt:new Date(Date.now()-1*864e5),  isVerified:true },
  { _id:'j11',title:'Graphic Designer — Brand Identity for Organic Food Startup', category:'design',  description:'New organic food brand launching in India. Complete brand identity: logo, color palette, brand guidelines, packaging design for 3 product lines, social media templates.', client:{ name:'GreenLeaf Organics',  rating:4.4, reviewCount:12, location:'Chennai'   }, budget:32000, budgetType:'fixed', workType:'remote',  experienceLevel:'intermediate', deadline:new Date(Date.now()+12*864e5), skills:['Illustrator','Photoshop','Brand Identity','Packaging'],bidsCount:22, createdAt:new Date(Date.now()-3*864e5),  isVerified:false },
  { _id:'j12',title:'WordPress + WooCommerce for Fashion E-Commerce Store',       category:'webdev',   description:'Fashion D2C brand launching online store. Custom Elementor theme, WooCommerce with 500+ products, Razorpay, Instagram integration, loyalty points, speed optimization.', client:{ name:'StyleHive',           rating:4.5, reviewCount:19, location:'Mumbai'    }, budget:28000, budgetType:'fixed', workType:'onsite',  experienceLevel:'intermediate', deadline:new Date(Date.now()+14*864e5), skills:['WordPress','WooCommerce','Elementor','PHP'],         bidsCount:11, createdAt:new Date(Date.now()-2*864e5),  isVerified:true },
];

export default function GigMarketplace() {
  const dispatch = useDispatch();
  const { gigs = [], loading } = useSelector(s => s.gig || {});

  const [search,     setSearch]     = useState('');
  const [cat,        setCat]        = useState('');
  const [experience, setExperience] = useState('');
  const [workType,   setWorkType]   = useState('');
  const [minBudget,  setMinBudget]  = useState('');
  const [maxBudget,  setMaxBudget]  = useState('');
  const [sortBy,     setSortBy]     = useState('newest');
  const [mouse,      setMouse]      = useState({ x:-9999, y:-9999 });
  const [searchFocus,setSearchFocus]= useState(false);

  useEffect(() => {
    dispatch(fetchGigs({ search, category:cat, experience, workType, minBudget, maxBudget }));
  }, [search, cat, experience, workType, minBudget, maxBudget]);

  useEffect(() => {
    const h = e => setMouse({ x:e.clientX, y:e.clientY });
    window.addEventListener('mousemove', h);
    return () => window.removeEventListener('mousemove', h);
  }, []);

  const reset = () => { setSearch(''); setCat(''); setExperience(''); setWorkType(''); setMinBudget(''); setMaxBudget(''); };

  const raw    = gigs.length > 0 ? gigs : DEMO_JOBS;
  const active = raw.filter(g => {
    if (cat        && g.category !== cat)       return false;
    if (experience && g.experienceLevel !== experience) return false;
    if (workType   && g.workType !== workType)  return false;
    if (minBudget  && Number(g.budget) < Number(minBudget)) return false;
    if (maxBudget  && Number(g.budget) > Number(maxBudget)) return false;
    if (search) {
      const q = search.toLowerCase();
      return g.title.toLowerCase().includes(q) || g.description?.toLowerCase().includes(q) || g.skills?.some(s=>s.toLowerCase().includes(q));
    }
    return true;
  });

  const sorted = [...active].sort((a,b) => {
    if (sortBy==='budget_hi') return (b.budget||0)-(a.budget||0);
    if (sortBy==='budget_lo') return (a.budget||0)-(b.budget||0);
    if (sortBy==='bids_lo')   return (a.bidsCount||0)-(b.bidsCount||0);
    return new Date(b.createdAt)-new Date(a.createdAt);
  });

  const activeFilters = [cat,experience,workType,minBudget,maxBudget,search].filter(Boolean).length;
  const catConfig = (id) => CATS.find(c=>c.id===id) || CATS[0];
  const GRAD = ['#1A56DB,#8b5cf6','#0ea5e9,#22D3EE','#10b981,#34d399','#f59e0b,#fbbf24','#ec4899,#f43f5e'];

  const daysLeft = (d) => {
    if (!d) return null;
    const diff = Math.ceil((new Date(d)-Date.now())/864e5);
    if (diff < 0) return null;
    if (diff === 0) return 'Ends today';
    if (diff <= 3) return `${diff}d left ⚠`;
    return `${diff}d left`;
  };

  return (
    <div style={{ minHeight:'100vh', background:'#020918', fontFamily:"'Plus Jakarta Sans',sans-serif", position:'relative', overflow:'hidden' }}>

      {/* ── Animated BG ── */}
      <div style={{ position:'fixed', inset:0, zIndex:0, pointerEvents:'none' }}>
        <div style={{ position:'absolute', top:'-20%', left:'-10%', width:'70%', height:'70%', background:'radial-gradient(circle,rgba(26,86,219,0.22) 0%,transparent 60%)', filter:'blur(80px)', animation:'bgBlob1 9s ease-in-out infinite' }} />
        <div style={{ position:'absolute', bottom:'-20%', right:'-10%', width:'65%', height:'65%', background:'radial-gradient(circle,rgba(212,175,55,0.15) 0%,transparent 60%)', filter:'blur(75px)', animation:'bgBlob2 11s ease-in-out infinite' }} />
        <div style={{ position:'absolute', top:'40%', left:'30%', width:'45%', height:'45%', background:'radial-gradient(circle,rgba(30,64,175,0.12) 0%,transparent 65%)', filter:'blur(60px)', animation:'bgBlob3 13s ease-in-out infinite' }} />
        <div style={{ position:'absolute', inset:0, backgroundImage:'linear-gradient(rgba(26,86,219,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(26,86,219,0.04) 1px,transparent 1px)', backgroundSize:'52px 52px' }} />
      </div>

      {/* ── Fixed animated background ── */}
      <div style={{ position:'fixed', inset:0, zIndex:0, pointerEvents:'none' }}>
        <div style={{ position:'absolute', top:'0%',  left:'5%',  width:700, height:700, background:'radial-gradient(circle,rgba(26,86,219,0.12) 0%,transparent 60%)' }} />
        <div style={{ position:'absolute', top:'30%', right:'0%', width:500, height:500, background:'radial-gradient(circle,rgba(34,211,238,0.08) 0%,transparent 60%)' }} />
        <div style={{ position:'absolute', bottom:'0',left:'30%', width:500, height:500, background:'radial-gradient(circle,rgba(96,165,250,0.08) 0%,transparent 60%)' }} />
        <div style={{ position:'absolute', inset:0, backgroundImage:'linear-gradient(rgba(26,86,219,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(26,86,219,0.03) 1px,transparent 1px)', backgroundSize:'60px 60px' }} />
        <div style={{ position:'fixed', width:360, height:360, borderRadius:'50%', background:'radial-gradient(circle,rgba(34,211,238,0.05) 0%,transparent 68%)', pointerEvents:'none', transform:'translate(-50%,-50%)', left:mouse.x, top:mouse.y, transition:'left 0.15s,top 0.15s' }} />
      </div>

      <div style={{ position:'relative', zIndex:1 }}>

        {/* ══════════════════════════════════════════════════
            SECTION 1 — HERO
        ══════════════════════════════════════════════════ */}
        <section style={{ padding:'72px 52px 52px', textAlign:'center' }}>
          {/* Live badge */}
          <div style={{ display:'inline-flex', alignItems:'center', gap:8, marginBottom:22, background:'rgba(26,86,219,0.1)', border:'1px solid rgba(26,86,219,0.3)', borderRadius:999, padding:'6px 16px' }}>
            <div style={{ width:7, height:7, borderRadius:'50%', background:'#22D3EE', boxShadow:'0 0 8px #22D3EE', animation:'blink 1.5s ease-in-out infinite' }} />
            <span style={{ fontSize:12, fontWeight:700, color:'#93C5FD', letterSpacing:0.5 }}>⚡ {DEMO_JOBS.length}+ Active Jobs — Updated Live</span>
          </div>

          <h1 style={{ margin:'0 0 16px', fontFamily:'Syne,sans-serif', lineHeight:1.1 }}>
            <span style={{ display:'block', fontSize:58, fontWeight:900, color:'#F1F5F9' }}>Find Your Next</span>
            <span style={{ display:'block', fontSize:58, fontWeight:900, background:'linear-gradient(135deg,#1A56DB 0%,#D4AF37 50%,#22D3EE 100%)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
              Dream Project
            </span>
          </h1>
          <p style={{ color:'#64748B', fontSize:16, maxWidth:480, margin:'0 auto 40px', lineHeight:1.8 }}>
            Browse {sorted.length} real job openings from verified companies. Apply in minutes.
          </p>

          {/* Hero search bar */}
          <div style={{ maxWidth:700, margin:'0 auto', display:'flex', background:searchFocus?'rgba(255,255,255,0.06)':'rgba(255,255,255,0.04)', border:`1px solid ${searchFocus?'rgba(26,86,219,0.6)':'rgba(26,86,219,0.3)'}`, borderRadius:18, overflow:'hidden', boxShadow:searchFocus?'0 0 50px rgba(26,86,219,0.25)':'0 0 30px rgba(26,86,219,0.12)', backdropFilter:'blur(20px)', transition:'all 0.3s' }}>
            <div style={{ display:'flex', alignItems:'center', flex:1, padding:'0 20px', gap:12 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={searchFocus?'#60A5FA':'#1A56DB'} strokeWidth="2.5" strokeLinecap="round" style={{ flexShrink:0 }}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              <input type="text" placeholder="Search by skill, title, or company..." value={search}
                onChange={e=>setSearch(e.target.value)}
                onFocus={()=>setSearchFocus(true)}
                onBlur={()=>setSearchFocus(false)}
                style={{ flex:1, background:'transparent', border:'none', outline:'none', color:'#F1F5F9', fontSize:15, fontFamily:'inherit', padding:'18px 0' }} />
              {search && <button onClick={()=>setSearch('')} style={{ background:'none', border:'none', cursor:'pointer', color:'#64748B', fontSize:18, lineHeight:1, padding:4 }}>×</button>}
            </div>
            <button style={{ margin:7, padding:'0 32px', background:'linear-gradient(135deg,#1A56DB,#22D3EE)', border:'none', borderRadius:12, color:'#fff', fontSize:15, fontWeight:700, cursor:'pointer', fontFamily:'inherit', boxShadow:'0 0 20px rgba(26,86,219,0.4)', transition:'all 0.2s', whiteSpace:'nowrap' }}
              onMouseEnter={e=>e.target.style.boxShadow='0 0 32px rgba(26,86,219,0.7)'}
              onMouseLeave={e=>e.target.style.boxShadow='0 0 20px rgba(26,86,219,0.4)'}>
              Search
            </button>
          </div>

          {/* Quick skill tags */}
          <div style={{ display:'flex', justifyContent:'center', gap:8, flexWrap:'wrap', marginTop:14 }}>
            <span style={{ fontSize:12, color:'#475569', alignSelf:'center' }}>Trending:</span>
            {['React.js','Flutter','Python','Figma','Node.js','AWS'].map(t=>(
              <button key={t} onClick={()=>setSearch(t)} style={{ fontSize:12, color:'#1A56DB', cursor:'pointer', padding:'4px 12px', borderRadius:999, border:'1px solid rgba(26,86,219,0.25)', background:'rgba(26,86,219,0.08)', fontFamily:'inherit', fontWeight:500, transition:'all 0.2s' }}
                onMouseEnter={e=>{ e.target.style.background='rgba(26,86,219,0.2)'; e.target.style.color='#93C5FD'; }}
                onMouseLeave={e=>{ e.target.style.background='rgba(26,86,219,0.08)'; e.target.style.color='#1A56DB'; }}>
                {t}
              </button>
            ))}
          </div>
        </section>

        {/* ══════════════════════════════════════════════════
            SECTION 2 — STATS BAR
        ══════════════════════════════════════════════════ */}
        <section style={{ padding:'0 52px 44px' }}>
          <div style={{ maxWidth:900, margin:'0 auto', display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14 }}>
            {[
              { icon:'💼', val:'48K+', label:'Active Freelancers',  color:'#1A56DB' },
              { icon:'📌', val:`${DEMO_JOBS.length}+`, label:'Open Jobs Today', color:'#22D3EE' },
              { icon:'⭐', val:'98%',  label:'Satisfaction Rate',   color:'#D4AF37' },
              { icon:'🏆', val:'₹2Cr+',label:'Paid to Freelancers', color:'#fbbf24' },
            ].map((s,i)=>(
              <div key={i} style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:18, padding:'20px 16px', textAlign:'center', backdropFilter:'blur(20px)', transition:'all 0.3s', position:'relative', overflow:'hidden' }}
                onMouseEnter={e=>{ e.currentTarget.style.transform='translateY(-5px)'; e.currentTarget.style.borderColor=`${s.color}44`; e.currentTarget.style.boxShadow=`0 12px 40px ${s.color}22`; }}
                onMouseLeave={e=>{ e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.borderColor='rgba(255,255,255,0.07)'; e.currentTarget.style.boxShadow='none'; }}>
                <div style={{ position:'absolute', top:0, left:'20%', right:'20%', height:1, background:`linear-gradient(90deg,transparent,${s.color}66,transparent)` }} />
                <div style={{ fontSize:24, marginBottom:8 }}>{s.icon}</div>
                <div style={{ fontSize:26, fontWeight:900, color:s.color, fontFamily:'Syne,sans-serif', marginBottom:3 }}>{s.val}</div>
                <div style={{ fontSize:11, color:'#475569', fontWeight:500, letterSpacing:0.3 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ══════════════════════════════════════════════════
            SECTION 3 — CATEGORY PILLS
        ══════════════════════════════════════════════════ */}
        <section style={{ padding:'0 52px 32px' }}>
          <div style={{ display:'flex', gap:8, flexWrap:'wrap', alignItems:'center' }}>
            <span style={{ fontSize:12, color:'#475569', fontWeight:600, marginRight:4, letterSpacing:0.5 }}>BROWSE BY:</span>
            {CATS.map(c=>{
              const isActive = cat===c.id;
              return (
                <button key={c.id} onClick={()=>setCat(c.id)} style={{
                  display:'flex', alignItems:'center', gap:6, padding:'8px 16px', borderRadius:999,
                  cursor:'pointer', fontFamily:'inherit', fontSize:13, fontWeight:600, transition:'all 0.25s',
                  background: isActive ? `${c.color}22` : 'rgba(255,255,255,0.03)',
                  border:     `1px solid ${isActive ? c.color+'66' : 'rgba(255,255,255,0.08)'}`,
                  color:      isActive ? c.color : '#64748B',
                  boxShadow:  isActive ? `0 0 16px ${c.color}33` : 'none',
                }}
                  onMouseEnter={e=>{ if(!isActive){ e.currentTarget.style.background=`${c.color}12`; e.currentTarget.style.borderColor=`${c.color}44`; e.currentTarget.style.color=c.color; } }}
                  onMouseLeave={e=>{ if(!isActive){ e.currentTarget.style.background='rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor='rgba(255,255,255,0.08)'; e.currentTarget.style.color='#64748B'; } }}>
                  <span style={{ fontSize:14 }}>{c.icon}</span>
                  {c.label}
                  {isActive && <span style={{ fontSize:10, background:`${c.color}33`, color:c.color, padding:'1px 7px', borderRadius:999 }}>{sorted.length}</span>}
                </button>
              );
            })}
          </div>
        </section>

        {/* ══════════════════════════════════════════════════
            SECTION 4 — MAIN LAYOUT (Filters + Jobs)
        ══════════════════════════════════════════════════ */}
        <section style={{ padding:'0 52px 90px', display:'grid', gridTemplateColumns:'258px 1fr', gap:24 }}>

          {/* ── FILTER SIDEBAR ── */}
          <div style={{ height:'fit-content', position:'sticky', top:80, display:'flex', flexDirection:'column', gap:14 }}>

            {/* Filter header */}
            <div style={{ background:'rgba(255,255,255,0.025)', border:'1px solid rgba(26,86,219,0.22)', borderRadius:20, overflow:'hidden', backdropFilter:'blur(20px)' }}>
              <div style={{ height:2, background:'linear-gradient(90deg,#1A56DB,#22D3EE)', boxShadow:'0 0 8px rgba(26,86,219,0.6)' }} />
              <div style={{ padding:20 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:7 }}>
                    <div style={{ width:6, height:6, borderRadius:'50%', background:'#1A56DB', boxShadow:'0 0 6px #1A56DB' }} />
                    <span style={{ fontSize:12, fontWeight:800, letterSpacing:1.5, textTransform:'uppercase', color:'#1A56DB' }}>Filters</span>
                  </div>
                  {activeFilters > 0 && (
                    <button onClick={reset} style={{ fontSize:11, color:'#f87171', fontWeight:700, background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.2)', borderRadius:999, padding:'3px 10px', cursor:'pointer', fontFamily:'inherit' }}>
                      Clear ({activeFilters})
                    </button>
                  )}
                </div>

                {/* Budget Range */}
                <div style={{ marginBottom:20 }}>
                  <div style={{ fontSize:11, fontWeight:700, color:'#64748B', marginBottom:10, textTransform:'uppercase', letterSpacing:0.5, display:'flex', alignItems:'center', gap:5 }}>
                    <span>💰</span> Budget Range (₹)
                  </div>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                    {[['minBudget',minBudget,setMinBudget,'Min'],['maxBudget',maxBudget,setMaxBudget,'Max']].map(([k,val,setter,ph])=>(
                      <input key={k} type="number" placeholder={ph} value={val} onChange={e=>setter(e.target.value)}
                        style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:10, padding:'9px 12px', color:'#F1F5F9', fontSize:13, fontFamily:'inherit', outline:'none', width:'100%', boxSizing:'border-box', transition:'border-color 0.2s' }}
                        onFocus={e=>e.target.style.borderColor='rgba(26,86,219,0.55)'}
                        onBlur={e=>e.target.style.borderColor='rgba(255,255,255,0.1)'} />
                    ))}
                  </div>
                </div>

                {/* Experience Level */}
                <div style={{ marginBottom:20 }}>
                  <div style={{ fontSize:11, fontWeight:700, color:'#64748B', marginBottom:10, textTransform:'uppercase', letterSpacing:0.5, display:'flex', alignItems:'center', gap:5 }}>
                    <span>🎯</span> Experience Level
                  </div>
                  {EXP_LEVELS.map(e=>{
                    const active = experience===e.val;
                    return (
                      <div key={e.val} onClick={()=>setExperience(e.val)} style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 12px', borderRadius:10, cursor:'pointer', marginBottom:4, background:active?'rgba(26,86,219,0.14)':'transparent', border:`1px solid ${active?'rgba(26,86,219,0.35)':'transparent'}`, transition:'all 0.2s' }}
                        onMouseEnter={x=>{ if(!active) x.currentTarget.style.background='rgba(255,255,255,0.04)'; }}
                        onMouseLeave={x=>{ if(!active) x.currentTarget.style.background='transparent'; }}>
                        <div style={{ width:16, height:16, borderRadius:'50%', flexShrink:0, background:active?'linear-gradient(135deg,#1A56DB,#22D3EE)':'transparent', border:active?'none':'1.5px solid rgba(255,255,255,0.2)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:active?'0 0 8px rgba(26,86,219,0.5)':'none' }}>
                          {active && <div style={{ width:5, height:5, borderRadius:'50%', background:'#fff' }} />}
                        </div>
                        <span style={{ fontSize:13, color:active?'#93C5FD':'#64748B' }}>{e.icon} {e.label}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Work Type */}
                <div style={{ marginBottom:20 }}>
                  <div style={{ fontSize:11, fontWeight:700, color:'#64748B', marginBottom:10, textTransform:'uppercase', letterSpacing:0.5, display:'flex', alignItems:'center', gap:5 }}>
                    <span>🏢</span> Work Type
                  </div>
                  {WORK_TYPES.map(w=>{
                    const active = workType===w.val;
                    return (
                      <div key={w.val} onClick={()=>setWorkType(w.val)} style={{ display:'flex', alignItems:'center', gap:8, padding:'9px 12px', borderRadius:10, cursor:'pointer', marginBottom:4, background:active?'rgba(34,211,238,0.09)':'transparent', border:`1px solid ${active?'rgba(34,211,238,0.3)':'transparent'}`, transition:'all 0.2s', color:active?'#22D3EE':'#64748B', fontSize:13 }}
                        onMouseEnter={x=>{ if(!active) x.currentTarget.style.background='rgba(255,255,255,0.04)'; }}
                        onMouseLeave={x=>{ if(!active) x.currentTarget.style.background='transparent'; }}>
                        {w.icon} {w.label}
                      </div>
                    );
                  })}
                </div>

                <button onClick={reset} style={{ width:'100%', padding:'11px', borderRadius:12, background:'linear-gradient(135deg,#1A56DB,#22D3EE)', border:'none', color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'inherit', boxShadow:'0 0 20px rgba(26,86,219,0.3)', transition:'all 0.2s' }}
                  onMouseEnter={e=>e.target.style.boxShadow='0 0 32px rgba(26,86,219,0.6)'}
                  onMouseLeave={e=>e.target.style.boxShadow='0 0 20px rgba(26,86,219,0.3)'}>
                  ✦ Reset All Filters
                </button>
              </div>
            </div>

            {/* Post a job CTA */}
            <div style={{ background:'linear-gradient(135deg,rgba(26,86,219,0.18),rgba(34,211,238,0.1))', border:'1px solid rgba(26,86,219,0.3)', borderRadius:18, padding:20, textAlign:'center' }}>
              <div style={{ fontSize:28, marginBottom:8 }}>💼</div>
              <h4 style={{ color:'#F1F5F9', fontWeight:700, fontSize:14, marginBottom:6 }}>Post a Job</h4>
              <p style={{ color:'#64748B', fontSize:12, marginBottom:14, lineHeight:1.6 }}>Reach 48K+ verified freelancers instantly</p>
              <Link to="/create-gig" style={{ textDecoration:'none' }}>
                <button style={{ width:'100%', padding:'10px', borderRadius:10, background:'rgba(26,86,219,0.15)', border:'1px solid rgba(26,86,219,0.35)', color:'#93C5FD', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'inherit', transition:'all 0.2s' }}
                  onMouseEnter={e=>e.target.style.background='rgba(26,86,219,0.25)'}
                  onMouseLeave={e=>e.target.style.background='rgba(26,86,219,0.15)'}>
                  Post Now →
                </button>
              </Link>
            </div>
          </div>

          {/* ── JOB RESULTS ── */}
          <div>

            {/* Results header */}
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20, flexWrap:'wrap', gap:12 }}>
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                <span style={{ fontSize:22, fontWeight:900, color:'#1A56DB', fontFamily:'Syne,sans-serif' }}>{sorted.length}</span>
                <span style={{ fontSize:15, color:'#64748B' }}>
                  {search ? `results for "${search}"` : cat ? `${catConfig(cat).label} jobs` : 'jobs found'}
                </span>
                {activeFilters>0 && <span style={{ fontSize:12, fontWeight:700, padding:'3px 10px', borderRadius:999, background:'rgba(26,86,219,0.12)', color:'#60A5FA', border:'1px solid rgba(26,86,219,0.25)' }}>{activeFilters} filter{activeFilters>1?'s':''} active</span>}
              </div>
              <select value={sortBy} onChange={e=>setSortBy(e.target.value)} style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(26,86,219,0.22)', borderRadius:10, padding:'8px 14px', color:'#94A3B8', fontSize:13, fontFamily:'inherit', outline:'none', cursor:'pointer', backdropFilter:'blur(10px)' }}>
                {SORT_OPTIONS.map(o=><option key={o.val} value={o.val} style={{ background:'#0d1224' }}>{o.label}</option>)}
              </select>
            </div>

            {/* Loading */}
            {loading && (
              <div style={{ display:'grid', gridTemplateColumns:'1fr', gap:14 }}>
                {[1,2,3,4].map(i=><div key={i} style={{ height:160, borderRadius:20, background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.05)', animation:'shimmer 1.5s ease-in-out infinite' }} />)}
              </div>
            )}

            {/* Empty */}
            {!loading && sorted.length===0 && (
              <div style={{ textAlign:'center', padding:'80px 24px', background:'rgba(255,255,255,0.02)', border:'1px solid rgba(26,86,219,0.15)', borderRadius:24, backdropFilter:'blur(20px)' }}>
                <div style={{ fontSize:64, marginBottom:16 }}>🔍</div>
                <h3 style={{ color:'#F1F5F9', fontWeight:700, fontSize:20, marginBottom:8 }}>No jobs found</h3>
                <p style={{ color:'#475569', fontSize:14, marginBottom:24 }}>Try different keywords or remove some filters</p>
                <button onClick={reset} style={{ padding:'10px 28px', borderRadius:12, background:'rgba(26,86,219,0.14)', border:'1px solid rgba(26,86,219,0.38)', color:'#93C5FD', fontSize:14, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>Clear All Filters</button>
              </div>
            )}

            {/* Job Cards — Sequential full-width list */}
            {!loading && sorted.length > 0 && (
              <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                {sorted.map((gig, i) => {
                  const cc    = catConfig(gig.category);
                  const dl    = daysLeft(gig.deadline);
                  const isNew = gig.createdAt && (Date.now()-new Date(gig.createdAt))<2*864e5;
                  return (
                    <Link key={gig._id||i} to={gig._id && gig._id.length === 24 ? `/gigs/${gig._id}` : '/gigs'} style={{ textDecoration:'none' }}>
                      <div style={{
                        background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)',
                        borderRadius:20, padding:'22px 24px', backdropFilter:'blur(20px)',
                        transition:'all 0.3s ease', cursor:'pointer', position:'relative', overflow:'hidden',
                      }}
                        onMouseEnter={e=>{ e.currentTarget.style.transform='translateY(-3px)'; e.currentTarget.style.borderColor=`${cc.color}44`; e.currentTarget.style.boxShadow=`0 12px 40px ${cc.color}18`; e.currentTarget.style.background='rgba(255,255,255,0.04)'; }}
                        onMouseLeave={e=>{ e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.borderColor='rgba(255,255,255,0.07)'; e.currentTarget.style.boxShadow='none'; e.currentTarget.style.background='rgba(255,255,255,0.03)'; }}>

                        {/* Top accent line */}
                        <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:`linear-gradient(90deg,${cc.color},${cc.color}00)`, opacity:0.5 }} />

                        {/* Layout: left info + right budget */}
                        <div style={{ display:'flex', gap:18, alignItems:'flex-start' }}>

                          {/* Category icon */}
                          <div style={{ width:46, height:46, borderRadius:14, background:`${cc.color}18`, border:`1px solid ${cc.color}33`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0 }}>
                            {cc.icon}
                          </div>

                          {/* Main content */}
                          <div style={{ flex:1, minWidth:0 }}>
                            {/* Title row */}
                            <div style={{ display:'flex', alignItems:'flex-start', gap:10, marginBottom:8, flexWrap:'wrap' }}>
                              <h3 style={{ fontSize:16, fontWeight:700, color:'#F1F5F9', lineHeight:1.35, margin:0, flex:1, minWidth:200 }}>{gig.title}</h3>
                              <div style={{ display:'flex', gap:6, flexShrink:0, flexWrap:'wrap' }}>
                                {isNew && <span style={{ fontSize:10, fontWeight:800, padding:'3px 8px', borderRadius:999, background:'rgba(34,211,238,0.15)', color:'#22D3EE', border:'1px solid rgba(34,211,238,0.3)', letterSpacing:0.5 }}>NEW</span>}
                                <span style={{ fontSize:11, fontWeight:600, padding:'3px 10px', borderRadius:999, background:`${cc.color}18`, color:cc.color, border:`1px solid ${cc.color}33` }}>{cc.label}</span>
                                <span style={{ fontSize:11, fontWeight:600, padding:'3px 10px', borderRadius:999, background:gig.workType==='remote'?'rgba(34,211,238,0.1)':'rgba(255,255,255,0.06)', color:gig.workType==='remote'?'#22D3EE':'#94A3B8', border:`1px solid ${gig.workType==='remote'?'rgba(34,211,238,0.25)':'rgba(255,255,255,0.1)'}`, textTransform:'capitalize' }}>{gig.workType||'Remote'}</span>
                              </div>
                            </div>

                            {/* Description preview */}
                            <p style={{ fontSize:13, color:'#64748B', lineHeight:1.65, marginBottom:12, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>
                              {gig.description}
                            </p>

                            {/* Skills */}
                            {gig.skills?.length > 0 && (
                              <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:14 }}>
                                {(Array.isArray(gig.skills)?gig.skills:[]).slice(0,5).map(s=>(
                                  <span key={s} style={{ fontSize:11, fontWeight:600, padding:'3px 10px', borderRadius:999, background:'rgba(26,86,219,0.1)', border:'1px solid rgba(26,86,219,0.22)', color:'#60A5FA' }}>{s}</span>
                                ))}
                                {gig.skills.length>5 && <span style={{ fontSize:11, color:'#475569', padding:'3px 0' }}>+{gig.skills.length-5} more</span>}
                              </div>
                            )}

                            {/* Footer meta */}
                            <div style={{ display:'flex', gap:18, flexWrap:'wrap', alignItems:'center', paddingTop:12, borderTop:'1px solid rgba(255,255,255,0.06)' }}>
                              {/* Client */}
                              <div style={{ display:'flex', alignItems:'center', gap:7 }}>
                                <div style={{ width:22, height:22, borderRadius:'50%', background:`linear-gradient(135deg,${GRAD[i%5]})`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:800, color:'#fff' }}>
                                  {gig.client?.name?.[0]?.toUpperCase()||'C'}
                                </div>
                                <span style={{ fontSize:12, color:'#94A3B8', fontWeight:500 }}>
                                  {gig.client?.name||'Client'}
                                  {gig.client?.isVerified && <span style={{ color:'#22D3EE', marginLeft:3 }}>✓</span>}
                                </span>
                              </div>
                              <span style={{ fontSize:12, color:'#64748B' }}>⭐ {gig.client?.rating||4.8} ({gig.client?.reviewCount||0})</span>
                              <span style={{ fontSize:12, color:'#64748B' }}>📍 {getLoc(gig.client?.location)}</span>
                              <span style={{ fontSize:12, color:gig.bidsCount>=10?'#f87171':gig.bidsCount>=5?'#fbbf24':'#4ade80' }}>🤝 {gig.bidsCount||0} proposals</span>
                              {gig.experienceLevel && <span style={{ fontSize:12, color:'#64748B', textTransform:'capitalize' }}>🎯 {gig.experienceLevel}</span>}
                              {gig.createdAt && <span style={{ fontSize:11, color:'#475569' }}>Posted {Math.ceil((Date.now()-new Date(gig.createdAt))/864e5)}d ago</span>}
                            </div>
                          </div>

                          {/* Right: Budget + deadline + CTA */}
                          <div style={{ flexShrink:0, textAlign:'right', minWidth:130 }}>
                            <div style={{ fontSize:22, fontWeight:900, fontFamily:'Syne,sans-serif', background:`linear-gradient(135deg,${cc.color},${cc.color}cc)`, WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', marginBottom:2 }}>
                              ₹{Number(gig.budget||0).toLocaleString()}
                            </div>
                            <div style={{ fontSize:11, color:'#475569', marginBottom:10 }}>{gig.budgetType==='hourly'?'per hour':'fixed price'}</div>
                            {dl && <div style={{ fontSize:11, fontWeight:700, color:dl.includes('⚠')?'#f87171':'#64748B', marginBottom:12 }}>{dl}</div>}
                            <div style={{ padding:'8px 16px', background:`${cc.color}15`, border:`1px solid ${cc.color}33`, borderRadius:10, color:cc.color, fontSize:12, fontWeight:700, cursor:'pointer', transition:'all 0.2s', display:'inline-block' }}>
                              Apply Now →
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}

            {/* Load more */}
            {!loading && sorted.length > 0 && (
              <div style={{ textAlign:'center', marginTop:28 }}>
                <button style={{ padding:'12px 36px', borderRadius:14, background:'rgba(255,255,255,0.04)', border:'1px solid rgba(26,86,219,0.25)', color:'#60A5FA', fontSize:14, fontWeight:600, cursor:'pointer', fontFamily:'inherit', transition:'all 0.2s' }}
                  onMouseEnter={e=>{ e.target.style.background='rgba(26,86,219,0.1)'; e.target.style.borderColor='rgba(26,86,219,0.45)'; }}
                  onMouseLeave={e=>{ e.target.style.background='rgba(255,255,255,0.04)'; e.target.style.borderColor='rgba(26,86,219,0.25)'; }}
                  onClick={()=>{}}>
                  Load More Jobs ↓
                </button>
              </div>
            )}
          </div>
        </section>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0.4}}
        @keyframes shimmer{0%,100%{opacity:0.6}50%{opacity:0.2}}
        input::placeholder{color:#475569}
        ::-webkit-scrollbar{width:6px}
        ::-webkit-scrollbar-track{background:#04081A}
        ::-webkit-scrollbar-thumb{background:rgba(26,86,219,0.3);border-radius:3px}
        select option{background:#0d1224;color:#F1F5F9}
      `}</style>
    </div>
  );
}
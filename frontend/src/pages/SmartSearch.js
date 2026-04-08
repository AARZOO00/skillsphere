import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';

const getLoc = (l) => !l?'Remote':typeof l==='string'?l:l.city||l.state||'India';

const debounce = (fn, ms) => {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
};

const SmartSearch = () => {
  const [urlParams, setUrlParams] = useSearchParams();
  const navigate    = useNavigate();
  const inputRef    = useRef(null);
  const dropRef     = useRef(null);

  const [query,       setQuery]       = useState(urlParams.get('q') || '');
  const [type,        setType]        = useState(urlParams.get('type') || 'all');
  const [suggestions, setSuggestions] = useState([]);
  const [showDrop,    setShowDrop]    = useState(false);
  const [results,     setResults]     = useState({ gigs:[], freelancers:[], gigTotal:0, freelancerTotal:0 });
  const [trending,    setTrending]    = useState({ trending:[], popular:[], categories:[] });
  const [relatedSkills,setRelatedSkills]= useState([]);
  const [activeSkills,setActiveSkills]= useState([]);
  const [loading,     setLoading]     = useState(false);
  const [acLoading,   setAcLoading]   = useState(false);
  const [sort,        setSort]        = useState('relevance');
  const [filters,     setFilters]     = useState({ category:'', experience:'', workType:'', minBudget:'', maxBudget:'' });
  const [page,        setPage]        = useState(1);
  const [searched,    setSearched]    = useState(false);

  useEffect(() => { loadTrending(); }, []);

  useEffect(() => {
    const q = urlParams.get('q');
    if (q) { setQuery(q); doSearch(q, filters, sort, 1); }
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const h = (e) => { if (dropRef.current && !dropRef.current.contains(e.target)) setShowDrop(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const loadTrending = async () => {
    try {
      const res = await api.get('/search/trending');
      setTrending(res.data);
    } catch {}
  };

  const loadSuggestions = useCallback(debounce(async (q) => {
    if (!q || q.length < 2) { setSuggestions([]); return; }
    setAcLoading(true);
    try {
      const res = await api.get('/search/autocomplete', { params: { q, limit:8 } });
      setSuggestions(res.data?.suggestions || []);
    } catch {}
    finally { setAcLoading(false); }
  }, 250), []);

  const loadRelatedSkills = async (skills) => {
    if (!skills.length) { setRelatedSkills([]); return; }
    try {
      const res = await api.get('/search/skill-suggestions', { params: { skills: skills.join(',') } });
      setRelatedSkills(res.data?.related?.map(r=>r.skill) || []);
    } catch {}
  };

  const doSearch = async (q, f = filters, s = sort, p = 1) => {
    if (!q.trim() && !activeSkills.length && !f.category) return;
    setLoading(true); setSearched(true);
    const searchQ = [q, ...activeSkills].filter(Boolean).join(' ');
    try {
      const res = await api.get('/search', {
        params: { q: searchQ, type, sort: s, page: p, limit: 20, ...f },
      });
      setResults(res.data);
      setPage(p);
      setUrlParams({ q, type, sort: s });
    } catch { setResults({ gigs:[], freelancers:[], gigTotal:0, freelancerTotal:0 }); }
    finally { setLoading(false); }
  };

  const handleInput = (e) => {
    setQuery(e.target.value);
    loadSuggestions(e.target.value);
    setShowDrop(true);
  };

  const handleSuggestion = (s) => {
    setQuery(s.text);
    setShowDrop(false);
    doSearch(s.text, filters, sort, 1);
  };

  const addSkillChip = (skill) => {
    if (!activeSkills.includes(skill)) {
      const next = [...activeSkills, skill];
      setActiveSkills(next);
      loadRelatedSkills(next);
      doSearch(query, filters, sort, 1);
    }
  };

  const removeSkillChip = (skill) => {
    const next = activeSkills.filter(s => s !== skill);
    setActiveSkills(next);
    loadRelatedSkills(next);
    doSearch(query, filters, sort, 1);
  };

  const applyFilter = (key, val) => {
    const f = { ...filters, [key]: val };
    setFilters(f);
    doSearch(query, f, sort, 1);
  };

  const clearAll = () => {
    setQuery(''); setActiveSkills([]); setFilters({ category:'', experience:'', workType:'', minBudget:'', maxBudget:'' });
    setResults({ gigs:[], freelancers:[], gigTotal:0, freelancerTotal:0 }); setSearched(false);
    setUrlParams({});
  };

  const totalResults = (results.gigTotal || 0) + (results.freelancerTotal || 0);
  const hasResults   = results.gigs?.length > 0 || results.freelancers?.length > 0;

  const GRAD = ['#1A56DB,#1A56DB','#0ea5e9,#22D3EE','#10b981,#34d399','#f59e0b,#fbbf24','#ec4899,#f43f5e'];

  return (
    <div style={{ minHeight:'100vh', background:'#020918', fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
      {/* BG */}
      <div style={{ position:'fixed', inset:0, pointerEvents:'none' }}>
        <div style={{ position:'absolute', top:'-15%', left:0, width:'70%', height:'70%', background:'radial-gradient(circle,rgba(26,86,219,0.1) 0%,transparent 60%)', filter:'blur(80px)' }} />
        <div style={{ position:'absolute', bottom:0, right:0, width:'55%', height:'55%', background:'radial-gradient(circle,rgba(34,211,238,0.07) 0%,transparent 60%)', filter:'blur(70px)' }} />
        <div style={{ position:'absolute', inset:0, backgroundImage:'linear-gradient(rgba(26,86,219,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(26,86,219,0.03) 1px,transparent 1px)', backgroundSize:'52px 52px' }} />
      </div>

      {/* ── SEARCH HERO ── */}
      <div style={{ padding:'64px 52px 48px', textAlign:'center', position:'relative', zIndex:1 }}>
        {!searched && (
          <>
            <div style={{ display:'inline-flex', alignItems:'center', gap:7, marginBottom:20, background:'rgba(26,86,219,0.1)', border:'1px solid rgba(26,86,219,0.25)', borderRadius:999, padding:'6px 16px' }}>
              <div style={{ width:6,height:6,borderRadius:'50%',background:'#22D3EE',boxShadow:'0 0 8px #22D3EE',animation:'blink 1.5s ease-in-out infinite' }} />
              <span style={{ fontSize:12,fontWeight:700,color:'#93C5FD',letterSpacing:0.5 }}>Smart Search — AI-powered</span>
            </div>
            <h1 style={{ fontSize:52, fontWeight:900, color:'#F1F5F9', fontFamily:'Syne,sans-serif', margin:'0 0 14px', lineHeight:1.1 }}>
              Find exactly what<br/>
              <span style={{ background:'linear-gradient(135deg,#1A56DB,#D4AF37,#22D3EE)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>you're looking for</span>
            </h1>
            <p style={{ fontSize:16, color:'rgba(255,255,255,0.4)', maxWidth:440, margin:'0 auto 36px', lineHeight:1.8 }}>
              Search jobs and freelancers with autocomplete, skill filtering, and AI relevance ranking.
            </p>
          </>
        )}

        {/* ── MAIN SEARCH BAR ── */}
        <div ref={dropRef} style={{ maxWidth:700, margin:'0 auto', position:'relative' }}>
          <div style={{ display:'flex', background:'rgba(255,255,255,0.06)', border:'1.5px solid rgba(26,86,219,0.4)', borderRadius:18, overflow:'visible', boxShadow:'0 0 40px rgba(26,86,219,0.15)', backdropFilter:'blur(20px)', transition:'all .3s' }}>
            {/* Type toggle */}
            <div style={{ display:'flex', gap:2, padding:'6px', flexShrink:0 }}>
              {[['all','All'],['gigs','Jobs'],['freelancers','People']].map(([id,label])=>(
                <button key={id} onClick={()=>{setType(id);if(searched)doSearch(query,filters,sort,1);}} style={{ padding:'8px 14px', borderRadius:11, border:'none', cursor:'pointer', fontFamily:'inherit', fontSize:12, fontWeight:700, transition:'all .2s', background:type===id?'rgba(26,86,219,0.3)':'transparent', color:type===id?'#93C5FD':'rgba(255,255,255,0.4)' }}>{label}</button>
              ))}
            </div>
            {/* Separator */}
            <div style={{ width:1, background:'rgba(255,255,255,0.1)', margin:'10px 0' }} />
            {/* Input */}
            <div style={{ flex:1, display:'flex', alignItems:'center', padding:'0 16px', gap:10 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(26,86,219,0.8)" strokeWidth="2.5" strokeLinecap="round" style={{ flexShrink:0 }}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              <input ref={inputRef} type="text" placeholder="Search jobs, skills, or freelancers..." value={query}
                onChange={handleInput}
                onFocus={()=>{ if(query.length>=2||!searched) setShowDrop(true); }}
                onKeyDown={e=>{ if(e.key==='Enter'){setShowDrop(false);doSearch(query,filters,sort,1);} if(e.key==='Escape') setShowDrop(false); }}
                style={{ flex:1, background:'transparent', border:'none', outline:'none', color:'#F1F5F9', fontSize:15, fontFamily:'inherit', padding:'16px 0' }} />
              {query && <button onClick={()=>{setQuery('');setSuggestions([]);}} style={{ background:'none',border:'none',cursor:'pointer',color:'rgba(255,255,255,0.3)',fontSize:18,padding:4 }}>×</button>}
              {acLoading && <div style={{ width:14,height:14,border:'2px solid rgba(26,86,219,0.3)',borderTopColor:'#1A56DB',borderRadius:'50%',animation:'spin .6s linear infinite',flexShrink:0 }} />}
            </div>
            <button onClick={()=>{setShowDrop(false);doSearch(query,filters,sort,1);}} style={{ margin:7, padding:'0 28px', background:'linear-gradient(135deg,#1A56DB,#1E40AF)', border:'none', borderRadius:12, color:'#fff', fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:'inherit', boxShadow:'0 4px 14px rgba(26,86,219,0.4)', whiteSpace:'nowrap', transition:'all .2s' }}
              onMouseEnter={e=>e.target.style.boxShadow='0 6px 24px rgba(26,86,219,0.65)'}
              onMouseLeave={e=>e.target.style.boxShadow='0 4px 14px rgba(26,86,219,0.4)'}>
              Search
            </button>
          </div>

          {/* ── AUTOCOMPLETE DROPDOWN ── */}
          {showDrop && (
            <div style={{ position:'absolute', top:'calc(100% + 8px)', left:0, right:0, background:'rgba(12,15,30,0.97)', border:'1px solid rgba(26,86,219,0.25)', borderRadius:16, boxShadow:'0 20px 60px rgba(0,0,0,0.6)', backdropFilter:'blur(40px)', zIndex:999, overflow:'hidden', animation:'dropIn .2s ease both' }}>
              {/* Popular searches (shown when empty) */}
              {!query && (
                <div style={{ padding:'16px 20px' }}>
                  <div style={{ fontSize:11, fontWeight:700, color:'rgba(255,255,255,0.35)', letterSpacing:1, textTransform:'uppercase', marginBottom:12 }}>🔥 Popular Searches</div>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                    {trending.popular?.map((p,i)=>(
                      <button key={i} onClick={()=>handleSuggestion({ text:p.text })} style={{ display:'flex', alignItems:'center', gap:6, padding:'7px 14px', borderRadius:999, background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', color:'rgba(255,255,255,0.7)', fontSize:13, cursor:'pointer', fontFamily:'inherit', transition:'all .15s' }}
                        onMouseEnter={e=>{e.currentTarget.style.background='rgba(26,86,219,0.15)';e.currentTarget.style.borderColor='rgba(26,86,219,0.4)';}}
                        onMouseLeave={e=>{e.currentTarget.style.background='rgba(255,255,255,0.05)';e.currentTarget.style.borderColor='rgba(255,255,255,0.1)';}}>
                        <span style={{ fontSize:14 }}>{p.icon}</span>{p.text}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Autocomplete suggestions */}
              {query && suggestions.length > 0 && (
                <div>
                  {suggestions.map((s,i)=>(
                    <div key={i} onClick={()=>handleSuggestion(s)} style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 20px', cursor:'pointer', transition:'background .15s', borderBottom:'1px solid rgba(255,255,255,0.04)' }}
                      onMouseEnter={e=>e.currentTarget.style.background='rgba(26,86,219,0.1)'}
                      onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                      <div style={{ width:32, height:32, borderRadius:9, background:'rgba(255,255,255,0.06)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:15, flexShrink:0 }}>{s.icon}</div>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:14, color:'#E2E8F0', fontWeight:500 }}>{s.text}</div>
                        {s.subtext && <div style={{ fontSize:12, color:'rgba(255,255,255,0.4)' }}>{s.subtext}</div>}
                      </div>
                      <span style={{ fontSize:11, color:'rgba(255,255,255,0.25)', textTransform:'capitalize' }}>{s.type}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Trending skills */}
              {trending.trending?.length > 0 && (
                <div style={{ padding:'14px 20px', borderTop:'1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ fontSize:11, fontWeight:700, color:'rgba(255,255,255,0.35)', letterSpacing:1, textTransform:'uppercase', marginBottom:10 }}>📈 Trending Skills</div>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:7 }}>
                    {trending.trending?.slice(0,8).map((t,i)=>(
                      <button key={i} onClick={()=>addSkillChip(t.skill)} style={{ padding:'5px 12px', borderRadius:999, background:'rgba(26,86,219,0.1)', border:'1px solid rgba(26,86,219,0.22)', color:'#60A5FA', fontSize:12, cursor:'pointer', fontFamily:'inherit', transition:'all .15s' }}
                        onMouseEnter={e=>{e.currentTarget.style.background='rgba(26,86,219,0.2)';}}
                        onMouseLeave={e=>{e.currentTarget.style.background='rgba(26,86,219,0.1)';}}>
                        {t.skill} <span style={{ opacity:0.5, fontSize:10 }}>{t.count}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── SKILL CHIPS ── */}
        {activeSkills.length > 0 && (
          <div style={{ display:'flex', flexWrap:'wrap', gap:8, justifyContent:'center', marginTop:14, maxWidth:700, margin:'14px auto 0' }}>
            {activeSkills.map(skill => (
              <span key={skill} style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'5px 14px', borderRadius:999, background:'rgba(26,86,219,0.18)', border:'1px solid rgba(26,86,219,0.45)', color:'#93C5FD', fontSize:13, fontWeight:600 }}>
                🔧 {skill}
                <button onClick={()=>removeSkillChip(skill)} style={{ background:'none', border:'none', cursor:'pointer', color:'#60A5FA', fontSize:15, lineHeight:1, padding:0 }}>×</button>
              </span>
            ))}
            <button onClick={clearAll} style={{ padding:'5px 14px', borderRadius:999, background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.25)', color:'#f87171', fontSize:12, cursor:'pointer', fontFamily:'inherit' }}>Clear all</button>
          </div>
        )}

        {/* Related skill suggestions */}
        {relatedSkills.length > 0 && (
          <div style={{ display:'flex', flexWrap:'wrap', gap:7, justifyContent:'center', marginTop:10 }}>
            <span style={{ fontSize:12, color:'rgba(255,255,255,0.3)', alignSelf:'center' }}>Add:</span>
            {relatedSkills.map(skill => (
              <button key={skill} onClick={()=>addSkillChip(skill)} style={{ padding:'4px 12px', borderRadius:999, background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.1)', color:'rgba(255,255,255,0.55)', fontSize:12, cursor:'pointer', fontFamily:'inherit', transition:'all .15s' }}
                onMouseEnter={e=>{e.currentTarget.style.background='rgba(26,86,219,0.12)';e.currentTarget.style.color='#93C5FD';}}
                onMouseLeave={e=>{e.currentTarget.style.background='rgba(255,255,255,0.04)';e.currentTarget.style.color='rgba(255,255,255,0.55)';}}>
                + {skill}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── TRENDING (pre-search) ── */}
      {!searched && (
        <div style={{ maxWidth:1000, margin:'0 auto', padding:'0 52px 80px', position:'relative', zIndex:1 }}>
          <h3 style={{ fontSize:16, fontWeight:700, color:'rgba(255,255,255,0.7)', marginBottom:16 }}>Browse by Category</h3>
          <div style={{ display:'flex', flexWrap:'wrap', gap:12 }}>
            {trending.categories?.map((cat,i)=>(
              <button key={cat.id} onClick={()=>{applyFilter('category',cat.id);setSearched(true);}} style={{ display:'flex', alignItems:'center', gap:10, padding:'12px 20px', borderRadius:14, background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', color:'#E2E8F0', fontSize:14, fontWeight:600, cursor:'pointer', fontFamily:'inherit', transition:'all .25s' }}
                onMouseEnter={e=>{e.currentTarget.style.background=`${GRAD[i%5].split(',')[0].replace('linear-gradient(135deg,','').replace('#','')}22`;e.currentTarget.style.transform='translateY(-3px)';}}
                onMouseLeave={e=>{e.currentTarget.style.background='rgba(255,255,255,0.04)';e.currentTarget.style.transform='translateY(0)';}}>
                {cat.label}
                <span style={{ fontSize:12, color:'rgba(255,255,255,0.4)', fontWeight:400 }}>{cat.count} jobs</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── RESULTS ── */}
      {searched && (
        <div style={{ maxWidth:1100, margin:'0 auto', padding:'0 52px 80px', position:'relative', zIndex:1 }}>

          {/* Results header + sort */}
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
            <div>
              {loading
                ? <span style={{ color:'rgba(255,255,255,0.4)', fontSize:14 }}>Searching…</span>
                : <span style={{ fontSize:15, color:'rgba(255,255,255,0.6)' }}>
                    <strong style={{ color:'#1A56DB', fontSize:22, fontFamily:'Syne,sans-serif' }}>{totalResults}</strong>
                    {' '}results{query && <> for "<em style={{ color:'#93C5FD' }}>{query}</em>"</>}
                  </span>
              }
            </div>
            <div style={{ display:'flex', gap:8, alignItems:'center' }}>
              <span style={{ fontSize:12, color:'rgba(255,255,255,0.3)' }}>Sort:</span>
              <select value={sort} onChange={e=>{setSort(e.target.value);doSearch(query,filters,e.target.value,1);}} style={{ background:'rgba(255,255,255,0.06)', border:'1px solid rgba(26,86,219,0.25)', borderRadius:10, padding:'8px 14px', color:'#94A3B8', fontSize:13, fontFamily:'inherit', outline:'none', cursor:'pointer' }}>
                {[['relevance','Best Match'],['newest','Newest'],['budget_hi','Highest Budget'],['budget_lo','Lowest Budget'],['bids_lo','Least Competition']].map(([v,l])=>(
                  <option key={v} value={v} style={{ background:'#0d1224' }}>{l}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Loading skeleton */}
          {loading && (
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              {[1,2,3].map(i=><div key={i} style={{ height:140, borderRadius:18, background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.05)', animation:'shimmer 1.5s ease-in-out infinite' }} />)}
            </div>
          )}

          {/* Empty */}
          {!loading && !hasResults && (
            <div style={{ textAlign:'center', padding:'70px 24px', background:'rgba(255,255,255,0.02)', border:'1px solid rgba(26,86,219,0.12)', borderRadius:22 }}>
              <div style={{ fontSize:56, marginBottom:16 }}>🔍</div>
              <h3 style={{ fontSize:20, fontWeight:700, color:'#F1F5F9', marginBottom:8 }}>No results found</h3>
              <p style={{ color:'rgba(255,255,255,0.4)', fontSize:14, marginBottom:20 }}>Try different keywords or remove filters</p>
              <button onClick={clearAll} style={{ padding:'10px 24px', borderRadius:12, background:'rgba(26,86,219,0.14)', border:'1px solid rgba(26,86,219,0.35)', color:'#93C5FD', fontSize:14, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>Clear Search</button>
            </div>
          )}

          {/* GIGS */}
          {!loading && results.gigs?.length > 0 && (
            <div style={{ marginBottom:32 }}>
              {(type==='all') && <h3 style={{ fontSize:15, fontWeight:700, color:'rgba(255,255,255,0.6)', marginBottom:14, display:'flex', alignItems:'center', gap:8 }}>💼 Jobs <span style={{ fontSize:12, color:'rgba(255,255,255,0.3)' }}>{results.gigTotal} found</span></h3>}
              <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                {results.gigs.map((gig,i)=>(
                  <Link key={gig._id||i} to={`/gigs/${gig._id}`} style={{ textDecoration:'none' }}>
                    <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:18, padding:'20px 22px', backdropFilter:'blur(20px)', transition:'all .25s', display:'flex', gap:16, alignItems:'flex-start' }}
                      onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-2px)';e.currentTarget.style.borderColor='rgba(26,86,219,0.3)';e.currentTarget.style.boxShadow='0 10px 30px rgba(26,86,219,0.12)';}}
                      onMouseLeave={e=>{e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.borderColor='rgba(255,255,255,0.07)';e.currentTarget.style.boxShadow='none';}}>
                      <div style={{ width:44, height:44, borderRadius:13, background:'rgba(26,86,219,0.15)', border:'1px solid rgba(26,86,219,0.25)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0 }}>💼</div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <h3 style={{ fontSize:16, fontWeight:700, color:'#F1F5F9', marginBottom:6, lineHeight:1.35 }}>{gig.title}</h3>
                        <p style={{ fontSize:13, color:'rgba(255,255,255,0.45)', marginBottom:10, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden', lineHeight:1.6 }}>{gig.description}</p>
                        <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                          {(gig.skills||[]).slice(0,5).map(s=><span key={s} style={{ fontSize:11, fontWeight:600, padding:'3px 9px', borderRadius:999, background:'rgba(26,86,219,0.12)', border:'1px solid rgba(26,86,219,0.25)', color:'#60A5FA' }}>{s}</span>)}
                        </div>
                      </div>
                      <div style={{ textAlign:'right', flexShrink:0 }}>
                        <div style={{ fontSize:20, fontWeight:900, color:'#1A56DB', fontFamily:'Syne,sans-serif', marginBottom:4 }}>₹{Number(gig.budget||0).toLocaleString()}</div>
                        <div style={{ fontSize:11, color:'rgba(255,255,255,0.35)', marginBottom:8 }}>{gig.budgetType==='hourly'?'/hr':'fixed'}</div>
                        <div style={{ padding:'7px 16px', background:'rgba(26,86,219,0.15)', border:'1px solid rgba(26,86,219,0.35)', borderRadius:9, color:'#93C5FD', fontSize:12, fontWeight:700 }}>Apply →</div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* FREELANCERS */}
          {!loading && results.freelancers?.length > 0 && (
            <div>
              {(type==='all') && <h3 style={{ fontSize:15, fontWeight:700, color:'rgba(255,255,255,0.6)', marginBottom:14, display:'flex', alignItems:'center', gap:8 }}>👥 Freelancers <span style={{ fontSize:12, color:'rgba(255,255,255,0.3)' }}>{results.freelancerTotal} found</span></h3>}
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14 }}>
                {results.freelancers.map((fl,i)=>(
                  <Link key={fl._id||i} to={`/profile/${fl._id}`} style={{ textDecoration:'none' }}>
                    <div style={{ background:'rgba(255,255,255,0.03)', border:`1px solid ${fl.isFeatured?'rgba(251,191,36,0.3)':'rgba(255,255,255,0.07)'}`, borderRadius:18, padding:20, backdropFilter:'blur(20px)', transition:'all .25s', position:'relative', overflow:'hidden' }}
                      onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-4px)';e.currentTarget.style.boxShadow='0 12px 36px rgba(26,86,219,0.12)';}}
                      onMouseLeave={e=>{e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.boxShadow='none';}}>
                      {fl.isFeatured && <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:'linear-gradient(90deg,transparent,#fbbf24,transparent)' }} />}
                      <div style={{ display:'flex', gap:12, marginBottom:12, alignItems:'center' }}>
                        <div style={{ width:46, height:46, borderRadius:'50%', background:`linear-gradient(135deg,${GRAD[i%5]})`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, fontWeight:700, color:'#fff', flexShrink:0, position:'relative' }}>
                          {fl.name?.[0]?.toUpperCase()}
                          {fl.isOnline && <div style={{ position:'absolute', bottom:1, right:1, width:10, height:10, borderRadius:'50%', background:'#22c55e', border:'2px solid #04081A' }} />}
                        </div>
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ fontSize:14, fontWeight:700, color:'#F1F5F9', display:'flex', alignItems:'center', gap:5 }}>
                            {fl.name}
                            {fl.isPro && <span style={{ fontSize:9, fontWeight:800, padding:'1px 6px', borderRadius:999, background:'rgba(26,86,219,0.2)', color:'#60A5FA' }}>PRO</span>}
                          </div>
                          <div style={{ fontSize:12, color:'rgba(255,255,255,0.4)' }}>{fl.title||'Freelancer'}</div>
                        </div>
                      </div>
                      <div style={{ display:'flex', gap:12, marginBottom:12, fontSize:12 }}>
                        <span style={{ color:'#fbbf24' }}>⭐ {fl.rating||4.8}</span>
                        <span style={{ color:'rgba(255,255,255,0.4)' }}>✅ {fl.completedProjects||0} projects</span>
                      </div>
                      <div style={{ display:'flex', flexWrap:'wrap', gap:5, marginBottom:12 }}>
                        {(fl.skills||[]).slice(0,3).map(s=><span key={s} style={{ fontSize:10, fontWeight:600, padding:'2px 8px', borderRadius:999, background:'rgba(26,86,219,0.1)', border:'1px solid rgba(26,86,219,0.2)', color:'#60A5FA' }}>{s}</span>)}
                      </div>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                        <span style={{ fontSize:16, fontWeight:800, color:'#1A56DB', fontFamily:'Syne,sans-serif' }}>₹{(fl.hourlyRate||1500).toLocaleString()}<span style={{ fontSize:11, fontWeight:400, color:'rgba(255,255,255,0.3)' }}>/hr</span></span>
                        <span style={{ fontSize:11, color:'rgba(255,255,255,0.3)' }}>📍 {getLoc(fl.location)}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        @keyframes blink   { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes spin    { to{transform:rotate(360deg)} }
        @keyframes shimmer { 0%,100%{opacity:0.6} 50%{opacity:0.3} }
        @keyframes dropIn  { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
        input::placeholder { color:rgba(255,255,255,0.3); }
        select option { background:#0d1224; }
        * { box-sizing:border-box; }
      `}</style>
    </div>
  );
};

export default SmartSearch;
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import api from '../utils/api';

const TXN_STATUS = {
  completed: { label:'Completed', bg:'#dcfce7', color:'#16a34a', icon:'✅' },
  pending:   { label:'Pending',   bg:'#fef3c7', color:'#d97706', icon:'⏳' },
  failed:    { label:'Failed',    bg:'#fee2e2', color:'#dc2626', icon:'❌' },
  refunded:  { label:'Refunded',  bg:'#f3e8ff', color:'#7c3aed', icon:'↩' },
};

const PaymentPage = () => {
  const { user } = useSelector(s => s.auth || {});

  const [stats,   setStats]   = useState(null);
  const [txns,    setTxns]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab,     setTab]     = useState('all');
  const [page,    setPage]    = useState(1);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [statsRes, txnsRes] = await Promise.allSettled([
          api.get('/payments/stats'),
          api.get('/payments/transactions'),
        ]);
        if (statsRes.status === 'fulfilled') setStats(statsRes.value.data);
        if (txnsRes.status === 'fulfilled') {
          const d = txnsRes.value.data;
          setTxns(Array.isArray(d) ? d : Array.isArray(d?.transactions) ? d.transactions : []);
        }
      } catch { /* use demo data */ }
      finally { setLoading(false); }
    };
    load();
  }, []);

  // Demo transactions
  const demoTxns = [
    { _id:'t1', type:'payment', title:'React Dashboard Project', counterparty:'Rahul Kumar', amount:45000, status:'completed', date:new Date(Date.now()-2*86400000), method:'Escrow', ref:'SKL-2024-001' },
    { _id:'t2', type:'payment', title:'UI Design — HealthTrack', counterparty:'Priya Sharma', amount:28000, status:'pending', date:new Date(Date.now()-5*86400000), method:'Escrow', ref:'SKL-2024-002' },
    { _id:'t3', type:'withdrawal', title:'Withdrawal to Bank', counterparty:'HDFC Bank ****4521', amount:35000, status:'completed', date:new Date(Date.now()-8*86400000), method:'Bank Transfer', ref:'SKL-2024-003' },
    { _id:'t4', type:'payment', title:'Node.js API Integration', counterparty:'Arjun Verma', amount:18000, status:'completed', date:new Date(Date.now()-12*86400000), method:'Escrow', ref:'SKL-2024-004' },
    { _id:'t5', type:'refund', title:'Refund — Cancelled Project', counterparty:'System', amount:12000, status:'refunded', date:new Date(Date.now()-18*86400000), method:'Wallet', ref:'SKL-2024-005' },
    { _id:'t6', type:'payment', title:'Python Data Analysis', counterparty:'Meera Krishnan', amount:22000, status:'failed', date:new Date(Date.now()-22*86400000), method:'Escrow', ref:'SKL-2024-006' },
  ];

  const displayTxns = txns.length > 0 ? txns : demoTxns;
  const demoStats = {
    escrow:  stats?.escrow       ?? 28000,
    released:stats?.released     ?? 85000,
    pending: stats?.pending      ?? 18000,
    total:   stats?.totalTransactions ?? displayTxns.length,
  };

  const filtered = tab === 'all' ? displayTxns : displayTxns.filter(t => t.status === tab);

  const formatDate = (d) => new Date(d).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'});
  const formatAmt  = (a) => `₹${Number(a||0).toLocaleString()}`;

  return (
    <div style={{ minHeight:'100vh', background:'#f8fafc', fontFamily:"'Plus Jakarta Sans', sans-serif" }}>

      {/* ── HEADER ── */}
      <div style={{ background:'linear-gradient(135deg,#1e1b4b,#312e81,#1e40af)', padding:'36px 52px 80px', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', inset:0, backgroundImage:'radial-gradient(circle at 85% 50%, rgba(255,255,255,0.04) 1px, transparent 1px)', backgroundSize:'30px 30px', pointerEvents:'none' }} />
        <div style={{ maxWidth:1100, margin:'0 auto', position:'relative', zIndex:1 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:16 }}>
            <div>
              <p style={{ color:'#a5b4fc', fontSize:13, marginBottom:8 }}>Finance</p>
              <h1 style={{ fontSize:30, fontWeight:900, color:'#fff', fontFamily:'Syne, sans-serif', marginBottom:6 }}>Payments & Escrow</h1>
              <p style={{ color:'#a5b4fc', fontSize:14 }}>Manage your transactions and escrow payments securely</p>
            </div>
            <button style={{ padding:'12px 24px', borderRadius:12, background:'rgba(255,255,255,0.12)', border:'1px solid rgba(255,255,255,0.2)', color:'#fff', fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:'inherit', backdropFilter:'blur(10px)' }}
              onClick={()=>toast.success('Withdrawal request submitted!')}>
              💳 Withdraw Funds
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth:1100, margin:'-48px auto 0', padding:'0 52px 60px', position:'relative', zIndex:2 }}>

        {/* ── STAT CARDS ── */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:24 }}>
          {[
            { icon:'🔒', label:'In Escrow',    value:formatAmt(demoStats.escrow),   sub:'Held securely',        color:'#0ea5e9', bg:'#e0f2fe' },
            { icon:'✅', label:'Released',      value:formatAmt(demoStats.released), sub:'Total paid out',        color:'#16a34a', bg:'#dcfce7' },
            { icon:'⏳', label:'Pending',       value:formatAmt(demoStats.pending),  sub:'Awaiting release',      color:'#d97706', bg:'#fef3c7' },
            { icon:'📊', label:'Transactions',  value:demoStats.total,              sub:'All time',              color:'#7c3aed', bg:'#f3e8ff' },
          ].map((s,i)=>(
            <div key={i} style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:16, padding:'22px 20px', boxShadow:'0 2px 8px rgba(0,0,0,0.05)', position:'relative', overflow:'hidden', transition:'all 0.25s' }}
              onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-3px)';e.currentTarget.style.boxShadow='0 8px 24px rgba(0,0,0,0.08)';}}
              onMouseLeave={e=>{e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.boxShadow='0 2px 8px rgba(0,0,0,0.05)';}}>
              <div style={{ position:'absolute', top:0, right:0, width:60, height:60, background:`${s.color}10`, borderRadius:'0 16px 0 60px' }} />
              <div style={{ width:40, height:40, borderRadius:10, background:s.bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, marginBottom:12 }}>{s.icon}</div>
              <div style={{ fontSize:24, fontWeight:900, color:s.color, fontFamily:'Syne, sans-serif', marginBottom:2 }}>{s.value}</div>
              <div style={{ fontSize:13, fontWeight:600, color:'#374151', marginBottom:2 }}>{s.label}</div>
              <div style={{ fontSize:11, color:'#9ca3af' }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* ── MAIN CONTENT ── */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 300px', gap:20 }}>

          {/* TRANSACTIONS */}
          <div style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:16, boxShadow:'0 2px 8px rgba(0,0,0,0.05)', overflow:'hidden' }}>
            {/* Table header */}
            <div style={{ padding:'20px 24px', borderBottom:'1px solid #f1f5f9', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:12 }}>
              <h2 style={{ fontSize:16, fontWeight:800, color:'#111827' }}>Transaction History</h2>
              {/* Filter tabs */}
              <div style={{ display:'flex', gap:4 }}>
                {[['all','All'],['completed','Completed'],['pending','Pending'],['failed','Failed']].map(([val,label])=>(
                  <button key={val} onClick={()=>setTab(val)} style={{
                    padding:'6px 14px', borderRadius:8, fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:'inherit', transition:'all 0.2s',
                    background: tab===val ? '#4f46e5' : 'transparent',
                    color: tab===val ? '#fff' : '#6b7280',
                    border: `1px solid ${tab===val ? '#4f46e5' : '#e5e7eb'}`,
                  }}>{label}</button>
                ))}
              </div>
            </div>

            {/* Table */}
            {loading ? (
              <div style={{ padding:32 }}>
                {[1,2,3].map(i=><div key={i} style={{ height:60, background:'#f8fafc', borderRadius:10, marginBottom:10, animation:'shimmer 1.5s ease-in-out infinite' }} />)}
              </div>
            ) : filtered.length === 0 ? (
              <div style={{ padding:'60px 24px', textAlign:'center' }}>
                <div style={{ fontSize:52, marginBottom:14 }}>💳</div>
                <h3 style={{ fontSize:17, fontWeight:700, color:'#374151', marginBottom:8 }}>No transactions yet</h3>
                <p style={{ color:'#9ca3af', fontSize:13 }}>Payments will appear here once a project starts</p>
              </div>
            ) : (
              <div>
                {/* Table head */}
                <div style={{ display:'grid', gridTemplateColumns:'2fr 1.2fr 1fr 1fr', gap:16, padding:'12px 24px', background:'#f8fafc', borderBottom:'1px solid #f1f5f9' }}>
                  {['Transaction','Amount','Status','Date'].map(h=>(
                    <span key={h} style={{ fontSize:11, fontWeight:700, color:'#9ca3af', textTransform:'uppercase', letterSpacing:0.5 }}>{h}</span>
                  ))}
                </div>
                {filtered.map((txn,i)=>{
                  const sc = TXN_STATUS[txn.status] || TXN_STATUS.pending;
                  return (
                    <div key={txn._id||i} style={{ display:'grid', gridTemplateColumns:'2fr 1.2fr 1fr 1fr', gap:16, padding:'16px 24px', borderBottom:'1px solid #f9fafb', alignItems:'center', transition:'background 0.15s' }}
                      onMouseEnter={e=>e.currentTarget.style.background='#fafbff'}
                      onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                      {/* Title */}
                      <div>
                        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                          <div style={{ width:36, height:36, borderRadius:10, background: txn.type==='withdrawal'?'#fef3c7':txn.type==='refund'?'#f3e8ff':'#e0f2fe', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, flexShrink:0 }}>
                            {txn.type==='withdrawal'?'🏦':txn.type==='refund'?'↩':'💰'}
                          </div>
                          <div>
                            <div style={{ fontSize:14, fontWeight:600, color:'#111827', marginBottom:1 }}>{txn.title}</div>
                            <div style={{ fontSize:11, color:'#9ca3af' }}>{txn.ref} · {txn.counterparty}</div>
                          </div>
                        </div>
                      </div>
                      {/* Amount */}
                      <div style={{ fontSize:15, fontWeight:800, color: txn.type==='withdrawal'?'#dc2626':txn.type==='refund'?'#7c3aed':'#16a34a', fontFamily:'Syne, sans-serif' }}>
                        {txn.type==='withdrawal'?'-':'+'}{formatAmt(txn.amount)}
                      </div>
                      {/* Status */}
                      <div>
                        <span style={{ fontSize:11, fontWeight:700, padding:'4px 10px', borderRadius:999, background:sc.bg, color:sc.color, display:'inline-flex', alignItems:'center', gap:4 }}>
                          {sc.icon} {sc.label}
                        </span>
                      </div>
                      {/* Date */}
                      <div style={{ fontSize:12, color:'#9ca3af' }}>{formatDate(txn.date||txn.createdAt)}</div>
                    </div>
                  );
                })}

                {/* Pagination */}
                <div style={{ padding:'16px 24px', display:'flex', justifyContent:'space-between', alignItems:'center', borderTop:'1px solid #f1f5f9' }}>
                  <span style={{ fontSize:13, color:'#9ca3af' }}>Showing {filtered.length} of {displayTxns.length} transactions</span>
                  <div style={{ display:'flex', gap:6 }}>
                    {[1,2,3].map(p=>(
                      <button key={p} onClick={()=>setPage(p)} style={{ width:32, height:32, borderRadius:8, border:`1px solid ${page===p?'#4f46e5':'#e5e7eb'}`, background:page===p?'#4f46e5':'#fff', color:page===p?'#fff':'#374151', fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>{p}</button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT SIDEBAR */}
          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>

            {/* Wallet card */}
            <div style={{ background:'linear-gradient(135deg,#4f46e5,#7c3aed)', borderRadius:16, padding:24, boxShadow:'0 8px 24px rgba(79,70,229,0.3)', position:'relative', overflow:'hidden' }}>
              <div style={{ position:'absolute', top:'-20%', right:'-10%', width:120, height:120, background:'rgba(255,255,255,0.08)', borderRadius:'50%' }} />
              <div style={{ position:'absolute', bottom:'-30%', left:'-10%', width:140, height:140, background:'rgba(255,255,255,0.05)', borderRadius:'50%' }} />
              <p style={{ color:'rgba(255,255,255,0.7)', fontSize:12, fontWeight:600, marginBottom:8, position:'relative', zIndex:1 }}>AVAILABLE BALANCE</p>
              <div style={{ fontSize:32, fontWeight:900, color:'#fff', fontFamily:'Syne, sans-serif', marginBottom:20, position:'relative', zIndex:1 }}>
                {formatAmt((demoStats.released || 85000) - (demoStats.pending || 18000))}
              </div>
              <button style={{ width:'100%', padding:'11px', borderRadius:10, background:'rgba(255,255,255,0.15)', border:'1px solid rgba(255,255,255,0.3)', color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'inherit', backdropFilter:'blur(10px)', position:'relative', zIndex:1, transition:'all 0.2s' }}
                onMouseEnter={e=>e.target.style.background='rgba(255,255,255,0.25)'}
                onMouseLeave={e=>e.target.style.background='rgba(255,255,255,0.15)'}
                onClick={()=>toast.success('Withdrawal request submitted!')}>
                💳 Withdraw to Bank
              </button>
            </div>

            {/* Payment methods */}
            <div style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:16, padding:20, boxShadow:'0 2px 8px rgba(0,0,0,0.05)' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
                <h3 style={{ fontSize:14, fontWeight:700, color:'#111827' }}>Payment Methods</h3>
                <button style={{ fontSize:12, fontWeight:600, color:'#4f46e5', background:'none', border:'none', cursor:'pointer', fontFamily:'inherit' }}>+ Add</button>
              </div>
              {[
                { icon:'🏦', name:'HDFC Bank', detail:'****4521', primary:true },
                { icon:'💳', name:'UPI',       detail:'user@upi', primary:false },
              ].map((m,i)=>(
                <div key={i} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 12px', borderRadius:10, background:m.primary?'#f5f3ff':'transparent', border:`1px solid ${m.primary?'#ede9fe':'transparent'}`, marginBottom:8 }}>
                  <div style={{ width:36, height:36, borderRadius:9, background:'#f1f5f9', display:'flex', alignItems:'center', justifyContent:'center', fontSize:17, flexShrink:0 }}>{m.icon}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:13, fontWeight:600, color:'#374151' }}>{m.name}</div>
                    <div style={{ fontSize:11, color:'#9ca3af' }}>{m.detail}</div>
                  </div>
                  {m.primary && <span style={{ fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:999, background:'#ede9fe', color:'#7c3aed' }}>Primary</span>}
                </div>
              ))}
            </div>

            {/* Escrow info */}
            <div style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:16, padding:20, boxShadow:'0 2px 8px rgba(0,0,0,0.05)' }}>
              <h3 style={{ fontSize:14, fontWeight:700, color:'#111827', marginBottom:14 }}>🔒 Escrow Protection</h3>
              {[
                'Payments held securely until work is approved',
                'Full refund if project is not delivered',
                'Dispute resolution within 48 hours',
                '256-bit SSL encryption',
              ].map((item,i)=>(
                <div key={i} style={{ display:'flex', gap:8, marginBottom:10, alignItems:'flex-start' }}>
                  <div style={{ width:18, height:18, borderRadius:'50%', background:'#dcfce7', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, marginTop:1 }}>
                    <svg width="9" height="7" viewBox="0 0 9 7" fill="none"><path d="M1 3.5l2 2L8 1" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </div>
                  <span style={{ fontSize:12, color:'#374151', lineHeight:1.5 }}>{item}</span>
                </div>
              ))}
            </div>

            {/* Quick links */}
            <div style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:16, padding:20, boxShadow:'0 2px 8px rgba(0,0,0,0.05)' }}>
              <h3 style={{ fontSize:14, fontWeight:700, color:'#111827', marginBottom:14 }}>Quick Actions</h3>
              {[
                { icon:'📄', label:'Download Statement', action:()=>toast.success('Statement downloaded!') },
                { icon:'📧', label:'Email Invoice',      action:()=>toast.success('Invoice sent to your email!') },
                { icon:'🆘', label:'Raise Dispute',      action:()=>toast('Dispute team will contact you',{icon:'⚠️'}) },
              ].map((item,i)=>(
                <button key={i} onClick={item.action} style={{ width:'100%', display:'flex', alignItems:'center', gap:10, padding:'10px 12px', borderRadius:10, background:'transparent', border:'none', cursor:'pointer', fontFamily:'inherit', marginBottom:6, transition:'all 0.15s', textAlign:'left' }}
                  onMouseEnter={e=>e.currentTarget.style.background='#f8fafc'}
                  onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                  <span style={{ fontSize:16 }}>{item.icon}</span>
                  <span style={{ fontSize:13, fontWeight:500, color:'#374151' }}>{item.label}</span>
                  <span style={{ marginLeft:'auto', color:'#9ca3af', fontSize:14 }}>→</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        @keyframes shimmer { 0%,100%{opacity:1} 50%{opacity:0.5} }
      `}</style>
    </div>
  );
};

export default PaymentPage;
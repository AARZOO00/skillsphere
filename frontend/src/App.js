import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Toaster } from 'react-hot-toast';

import Navbar from './components/layout/Navbar';

// Auth
import Login          from './pages/auth/Login';
import Register       from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword  from './pages/auth/ResetPassword';
import VerifyEmail    from './pages/auth/VerifyEmail';
import OAuthSuccess   from './pages/auth/OAuthSuccess';
import AdminLogin     from './pages/auth/Adminlogin';

// Main pages
import GigMarketplace   from './pages/GigMarketplace';
import GigDetail        from './pages/GigDetail';
import FindTalent       from './pages/FindTalent';
import FreelancerProfile from './pages/FreelancerProfile';
import Dashboard        from './pages/Dashboard';
import ChatPage         from './pages/ChatPage';
import PaymentPage      from './pages/PaymentPage';
import Settings         from './pages/Settings';

// Client
import CreateGig from './pages/client/CreateGig';
import MyGigs    from './pages/client/MyGigs';

// Freelancer
import MyProposals         from './pages/freelancer/MyProposals';
import FreelancerDashboard from './pages/freelancer/FreelancerDashboard';

// Admin
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers     from './pages/admin/AdminUsers';
import AdminGigs      from './pages/admin/AdminGigs';

// Feature pages
import VideoCall       from './pages/VideoCall';
import ReferralPage    from './pages/ReferralPage';
import SubscriptionPage from './pages/SubscriptionPage';
import SmartSearch     from './pages/SmartSearch';

// ── Protected Route ───────────────────────────────────────────
const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useSelector(s => s.auth || {});

  if (loading) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#020918' }}>
      <div style={{ position:'relative', width:48, height:48 }}>
        <div style={{ position:'absolute', inset:0, borderRadius:'50%', border:'3px solid rgba(26,86,219,0.2)' }} />
        <div style={{ position:'absolute', inset:0, borderRadius:'50%', border:'3px solid transparent', borderTopColor:'#1A56DB', animation:'spin .8s linear infinite' }} />
        <div style={{ position:'absolute', inset:7, borderRadius:'50%', border:'2px solid transparent', borderTopColor:'#D4AF37', animation:'spin 1.2s linear infinite reverse' }} />
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return children;
};

// ── WithNav wrapper ───────────────────────────────────────────
const WithNav = ({ children }) => (
  <>
    <Navbar />
    {children}
  </>
);

// ── Main App ──────────────────────────────────────────────────
const App = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    // Instantly restore from localStorage
    try {
      const saved = localStorage.getItem('user');
      if (saved) {
        const u = JSON.parse(saved);
        if (u?._id) dispatch({ type:'auth/setUser', payload:u });
      }
    } catch {}

    // Then fetch fresh from backend
    import('./utils/api').then(({ default: api }) => {
      api.get('/auth/me')
        .then(res => {
          const u = res.data?.user || res.data;
          if (u?._id) {
            dispatch({ type:'auth/setUser', payload:u });
            try { localStorage.setItem('user', JSON.stringify(u)); } catch {}
          }
        })
        .catch(() => {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          dispatch({ type:'auth/logout' });
        });
    }).catch(() => {});
  }, []);

  return (
    <Router>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#0d1f3c',
            color: '#f1f5f9',
            border: '1px solid rgba(212,175,55,0.25)',
            borderRadius: '12px',
            fontSize: '14px',
            fontFamily: "'Plus Jakarta Sans',sans-serif",
          },
          success: { iconTheme: { primary:'#D4AF37', secondary:'#020918' } },
          error:   { iconTheme: { primary:'#f87171', secondary:'#020918' } },
        }}
      />

      <Routes>
        {/* ── Public ── */}
        <Route path="/"              element={<WithNav><GigMarketplace /></WithNav>} />
        <Route path="/gigs"          element={<WithNav><GigMarketplace /></WithNav>} />
        <Route path="/gigs/:id"      element={<WithNav><GigDetail /></WithNav>} />
        <Route path="/freelancers"   element={<WithNav><FindTalent /></WithNav>} />
        <Route path="/profile/:id"   element={<WithNav><FreelancerProfile /></WithNav>} />
        <Route path="/search"        element={<WithNav><SmartSearch /></WithNav>} />

        {/* ── Auth ── */}
        <Route path="/login"         element={<Login />} />
        <Route path="/register"      element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/verify-email"  element={<VerifyEmail />} />
        <Route path="/oauth-success" element={<OAuthSuccess />} />
        <Route path="/admin-login"   element={<AdminLogin />} />

        {/* ── Protected ── */}
        <Route path="/dashboard"     element={<ProtectedRoute><WithNav><Dashboard /></WithNav></ProtectedRoute>} />
        <Route path="/chat"          element={<ProtectedRoute><WithNav><ChatPage /></WithNav></ProtectedRoute>} />
        <Route path="/payments"      element={<ProtectedRoute><WithNav><PaymentPage /></WithNav></ProtectedRoute>} />
        <Route path="/settings"      element={<ProtectedRoute><WithNav><Settings /></WithNav></ProtectedRoute>} />
        <Route path="/subscription"  element={<ProtectedRoute><WithNav><SubscriptionPage /></WithNav></ProtectedRoute>} />
        <Route path="/referral"      element={<ProtectedRoute><WithNav><ReferralPage /></WithNav></ProtectedRoute>} />

        {/* ── Client ── */}
        <Route path="/create-gig"    element={<ProtectedRoute roles={['client']}><WithNav><CreateGig /></WithNav></ProtectedRoute>} />
        <Route path="/my-gigs"       element={<ProtectedRoute roles={['client']}><WithNav><MyGigs /></WithNav></ProtectedRoute>} />

        {/* ── Freelancer ── */}
        <Route path="/my-proposals"          element={<ProtectedRoute roles={['freelancer']}><WithNav><MyProposals /></WithNav></ProtectedRoute>} />
        <Route path="/freelancer-dashboard"  element={<ProtectedRoute roles={['freelancer']}><WithNav><FreelancerDashboard /></WithNav></ProtectedRoute>} />

        {/* ── Admin ── */}
        <Route path="/admin"         element={<ProtectedRoute roles={['admin']}><WithNav><AdminDashboard /></WithNav></ProtectedRoute>} />
        <Route path="/admin/users"   element={<ProtectedRoute roles={['admin']}><WithNav><AdminUsers /></WithNav></ProtectedRoute>} />
        <Route path="/admin/gigs"    element={<ProtectedRoute roles={['admin']}><WithNav><AdminGigs /></WithNav></ProtectedRoute>} />

        {/* ── Video Call ── */}
        <Route path="/video-call/:roomId" element={<ProtectedRoute><VideoCall /></ProtectedRoute>} />

        {/* ── 404 ── */}
        <Route path="*" element={
          <div style={{ minHeight:'100vh', background:'#020918', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
            <div style={{ fontSize:72, fontWeight:900, background:'linear-gradient(135deg,#1A56DB,#D4AF37)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', fontFamily:"'Syne',sans-serif" }}>404</div>
            <p style={{ fontSize:18, color:'rgba(255,255,255,0.45)', marginBottom:28 }}>Page not found</p>
            <a href="/" style={{ padding:'11px 28px', borderRadius:12, background:'linear-gradient(135deg,#1A56DB,#1E40AF)', color:'#fff', textDecoration:'none', fontWeight:700, fontSize:14, boxShadow:'0 6px 20px rgba(26,86,219,0.4)' }}>Go Home</a>
          </div>
        } />
      </Routes>
    </Router>
  );
};

export default App;
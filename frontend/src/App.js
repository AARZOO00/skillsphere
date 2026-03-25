import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Toaster } from 'react-hot-toast';

// ── Layout ────────────────────────────────────────────────────
import Navbar from './components/layout/Navbar';

// ── Auth Pages ────────────────────────────────────────────────
import Login          from './pages/auth/Login';
import Register       from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword  from './pages/auth/ResetPassword';
import VerifyEmail    from './pages/auth/VerifyEmail';
import OAuthSuccess   from './pages/auth/OAuthSuccess';

// ── Main Pages ────────────────────────────────────────────────
import Dashboard        from './pages/Dashboard';
import GigMarketplace   from './pages/GigMarketplace';
import GigDetail        from './pages/GigDetail';
import FreelancerProfile from './pages/FreelancerProfile';
import ChatPage         from './pages/ChatPage';
import PaymentPage      from './pages/PaymentPage';
import Settings         from './pages/Settings';

// ── Client Pages ──────────────────────────────────────────────
import CreateGig from './pages/client/CreateGig';
import MyGigs    from './pages/client/MyGigs';

// ── Freelancer Pages ──────────────────────────────────────────
import MyProposals        from './pages/freelancer/MyProposals';
import FreelancerDashboard from './pages/freelancer/FreelancerDashboard';

// ── Admin Pages ───────────────────────────────────────────────
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers     from './pages/admin/AdminUsers';
import AdminGigs      from './pages/admin/AdminGigs';

// ── Find Talent page (freelancer listing) ─────────────────────
import FindTalent from './pages/FindTalent';

// ─────────────────────────────────────────────────────────────
// Protected Route wrapper
// ─────────────────────────────────────────────────────────────
const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useSelector(s => s.auth);

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0B0F1A' }}>
      <div style={{ width: 40, height: 40, border: '3px solid rgba(99,102,241,0.3)', borderTopColor: '#6366F1', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return children;
};

// ─────────────────────────────────────────────────────────────
// Pages that show Navbar
// ─────────────────────────────────────────────────────────────
const NAVBAR_ROUTES = [
  '/dashboard', '/gigs', '/freelancers', '/chat',
  '/settings', '/profile', '/create-gig', '/my-gigs',
  '/my-proposals', '/payments', '/admin',
];

const Layout = ({ children }) => {
  const loc = window.location.pathname;
  const showNav = NAVBAR_ROUTES.some(r => loc.startsWith(r)) || loc === '/';
  return (
    <>
      {showNav && <Navbar />}
      {children}
    </>
  );
};

// ─────────────────────────────────────────────────────────────
// App
// ─────────────────────────────────────────────────────────────
const App = () => {
  return (
    <Router>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1e293b',
            color: '#f1f5f9',
            border: '1px solid rgba(99,102,241,0.3)',
            borderRadius: '12px',
            fontSize: '14px',
          },
          success: { iconTheme: { primary: '#22D3EE', secondary: '#0B0F1A' } },
          error:   { iconTheme: { primary: '#f87171', secondary: '#0B0F1A' } },
        }}
      />

      <Routes>
        {/* ── Public routes ── */}
        <Route path="/"               element={<><Navbar /><GigMarketplace /></>} />
        <Route path="/gigs"           element={<><Navbar /><GigMarketplace /></>} />
        <Route path="/gigs/:id"       element={<><Navbar /><GigDetail /></>} />
        <Route path="/freelancers"    element={<><Navbar /><FindTalent /></>} />
        <Route path="/freelancers/:id" element={<><Navbar /><FreelancerProfile /></>} />
        <Route path="/profile/:id"    element={<><Navbar /><FreelancerProfile /></>} />

        {/* ── Auth routes (no navbar) ── */}
        <Route path="/login"           element={<Login />} />
        <Route path="/register"        element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/verify-email"    element={<VerifyEmail />} />
        <Route path="/oauth-success"   element={<OAuthSuccess />} />

        {/* ── Protected: any logged-in user ── */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <><Navbar /><Dashboard /></>
          </ProtectedRoute>
        } />
        <Route path="/chat" element={
          <ProtectedRoute>
            <><Navbar /><ChatPage /></>
          </ProtectedRoute>
        } />
        <Route path="/settings" element={
          <ProtectedRoute>
            <><Navbar /><Settings /></>
          </ProtectedRoute>
        } />
        <Route path="/payments" element={
          <ProtectedRoute>
            <><Navbar /><PaymentPage /></>
          </ProtectedRoute>
        } />

        {/* ── Protected: client only ── */}
        <Route path="/create-gig" element={
          <ProtectedRoute roles={['client', 'admin']}>
            <><Navbar /><CreateGig /></>
          </ProtectedRoute>
        } />
        <Route path="/my-gigs" element={
          <ProtectedRoute roles={['client', 'admin']}>
            <><Navbar /><MyGigs /></>
          </ProtectedRoute>
        } />

        {/* ── Protected: freelancer only ── */}
        <Route path="/my-proposals" element={
          <ProtectedRoute roles={['freelancer']}>
            <><Navbar /><MyProposals /></>
          </ProtectedRoute>
        } />
        <Route path="/freelancer-dashboard" element={
          <ProtectedRoute roles={['freelancer']}>
            <><Navbar /><FreelancerDashboard /></>
          </ProtectedRoute>
        } />

        {/* ── Protected: admin only ── */}
        <Route path="/admin" element={
          <ProtectedRoute roles={['admin']}>
            <><Navbar /><AdminDashboard /></>
          </ProtectedRoute>
        } />
        <Route path="/admin/users" element={
          <ProtectedRoute roles={['admin']}>
            <><Navbar /><AdminUsers /></>
          </ProtectedRoute>
        } />
        <Route path="/admin/gigs" element={
          <ProtectedRoute roles={['admin']}>
            <><Navbar /><AdminGigs /></>
          </ProtectedRoute>
        } />

        {/* ── 404 fallback ── */}
        <Route path="*" element={
          <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#0B0F1A', color: '#f1f5f9', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            <div style={{ fontSize: 80, marginBottom: 16 }}>🚀</div>
            <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 8 }}>404 — Page Not Found</h1>
            <p style={{ color: '#64748B', marginBottom: 28 }}>This page doesn't exist yet.</p>
            <a href="/" style={{ padding: '11px 28px', background: 'linear-gradient(135deg,#6366F1,#22D3EE)', color: '#fff', borderRadius: 12, textDecoration: 'none', fontWeight: 700 }}>Go Home</a>
          </div>
        } />
      </Routes>
    </Router>
  );
};

export default App;
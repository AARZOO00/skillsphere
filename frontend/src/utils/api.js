import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  withCredentials: true
});

API.interceptors.request.use(cfg => {
  const token = localStorage.getItem('token');
  if (token) cfg.headers.Authorization = 'Bearer ' + token;
  return cfg;
});

API.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// AUTH
export const registerUser   = d => API.post('/auth/register', d);
export const loginUser      = d => API.post('/auth/login', d);
export const verifyEmailAPI = t => API.get('/auth/verify-email/' + t);
export const forgotPassword = e => API.post('/auth/forgot-password', { email: e });
export const resetPassword  = (t, p) => API.put('/auth/reset-password/' + t, { password: p });
export const getMe          = () => API.get('/auth/me');
export const setup2FA       = () => API.post('/auth/setup-2fa');
export const enable2FA      = c => API.post('/auth/enable-2fa', { code: c });
export const disable2FA     = () => API.post('/auth/disable-2fa');

// USERS
export const getProfile              = id => API.get('/users/' + id + '/profile');
export const updateProfile           = d => API.put('/users/profile', d);
export const updateFreelancerProfile = d => API.put('/users/freelancer-profile', d);
export const addPortfolioItem        = d => API.post('/users/portfolio', d);
export const addExperience           = d => API.post('/users/experience', d);
export const updateAvailability      = d => API.put('/users/availability', d);
export const uploadResume            = d => API.post('/users/resume', d);
export const getFreelancerAnalytics  = () => API.get('/users/analytics/freelancer');
export const searchFreelancers       = p => API.get('/users/search/freelancers', { params: p });
export const changePassword          = d => API.put('/users/change-password', d);

// GIGS
export const createGig    = d => API.post('/gigs', d);
export const getGigs      = p => API.get('/gigs', { params: p });
export const getGig       = id => API.get('/gigs/' + id);
export const updateGig    = (id, d) => API.put('/gigs/' + id, d);
export const deleteGig    = id => API.delete('/gigs/' + id);
export const getMyGigs    = () => API.get('/gigs/my-gigs');
export const updateProgress = (id, d) => API.put('/gigs/' + id + '/progress', d);
export const getCategories  = () => API.get('/gigs/categories');

// PROPOSALS
export const submitProposal      = (gigId, d) => API.post('/proposals/gig/' + gigId, d);
export const getProposals        = gigId => API.get('/proposals/gig/' + gigId);
export const getMyProposals      = () => API.get('/proposals/my-proposals');
export const updateProposalStatus = (id, status) => API.put('/proposals/' + id + '/status', { status });
export const negotiateProposal   = (id, d) => API.post('/proposals/' + id + '/negotiate', d);
export const withdrawProposal    = id => API.put('/proposals/' + id + '/withdraw');

// CHAT
export const getOrCreateConversation = d => API.post('/chat/conversation', d);
export const getConversations        = () => API.get('/chat/conversations');
export const getMessages             = (id, p) => API.get('/chat/messages/' + id, { params: { page: p } });
export const sendMessage             = d => API.post('/chat/messages', d);
export const deleteMessage           = id => API.delete('/chat/messages/' + id);

// PAYMENTS
export const createOrder    = d => API.post('/payments/create-order', d);
export const verifyPayment  = d => API.post('/payments/verify', d);
export const releasePayment = id => API.put('/payments/release/' + id);
export const getPayments    = () => API.get('/payments');
export const requestRefund  = (id, reason) => API.post('/payments/refund/' + id, { reason });

// REVIEWS
export const createReview     = d => API.post('/reviews', d);
export const getUserReviews   = id => API.get('/reviews/user/' + id);
export const respondToReview  = (id, content) => API.put('/reviews/' + id + '/respond', { content });
export const flagReview       = (id, reason) => API.put('/reviews/' + id + '/flag', { reason });

// NOTIFICATIONS
export const getNotifications = () => API.get('/notifications');
export const markAllRead      = () => API.put('/notifications/read-all');
export const markOneRead      = id => API.put('/notifications/' + id + '/read');
export const deleteNotif      = id => API.delete('/notifications/' + id);

// DISPUTES
export const createDispute    = d => API.post('/disputes', d);
export const getMyDisputes    = () => API.get('/disputes/my-disputes');
export const getDispute       = id => API.get('/disputes/' + id);

// AI
export const matchFreelancers = gigId => API.get('/ai/match/' + gigId);
export const recommendGigs    = () => API.get('/ai/recommend');
export const getTrendingSkills = () => API.get('/ai/trending-skills');

// ADMIN
export const getAdminAnalytics   = () => API.get('/admin/analytics');
export const getAdminUsers       = p => API.get('/admin/users', { params: p });
export const toggleSuspend       = (id, reason) => API.put('/admin/users/' + id + '/suspend', { reason });
export const verifyFreelancer    = (uid, badge) => API.put('/admin/users/' + uid + '/verify', { badge });
export const getPendingGigs      = () => API.get('/admin/gigs/pending');
export const approveGig          = (id, approved, reason) => API.put('/admin/gigs/' + id + '/approve', { approved, reason });
export const getAdminDisputes    = () => API.get('/admin/disputes');
export const resolveDispute      = (id, d) => API.put('/admin/disputes/' + id + '/resolve', d);
export const getFlaggedReviews   = () => API.get('/admin/reviews/flagged');
export const deleteReview        = id => API.delete('/admin/reviews/' + id);

export default API;

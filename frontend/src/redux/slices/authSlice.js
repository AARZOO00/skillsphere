// src/redux/slices/authSlice.js
// Complete auth slice — handles JWT login, OAuth (GitHub/Google), logout

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

// ── Load initial user from localStorage on app start ─────────
const loadUser = () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return null;

    // Check token expiry
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (payload.exp * 1000 < Date.now()) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return null;
    }

    // 1. Try full user from localStorage (set by OAuthSuccess or login)
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const u = JSON.parse(savedUser);
      // Validate it has required fields
      if (u?._id && u?.role) return u;
    }

    // 2. Fallback: basic user from JWT payload
    return {
      _id:   payload.id   || payload._id || payload.sub,
      email: payload.email,
      role:  payload.role  || 'freelancer',
      name:  payload.name  || payload.email?.split('@')[0] || 'User',
    };
  } catch { return null; }
};

// ── Async: fetch current user profile ────────────────────────
export const fetchCurrentUser = createAsyncThunk(
  'auth/fetchCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get('/auth/me');
      return res.data?.user || res.data;
    } catch (err) {
      localStorage.removeItem('token');
      return rejectWithValue(err?.response?.data?.message || 'Session expired');
    }
  }
);

// ── Async: email/password login ───────────────────────────────
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      const { token, user } = res.data;
      localStorage.setItem('token', token);
      return { user, token };
    } catch (err) {
      return rejectWithValue(err?.response?.data?.message || 'Login failed');
    }
  }
);

// ── Async: register ───────────────────────────────────────────
export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (formData, { rejectWithValue }) => {
    try {
      const res = await api.post('/auth/register', formData);
      return res.data;
    } catch (err) {
      return rejectWithValue(err?.response?.data?.message || 'Registration failed');
    }
  }
);

// ── Slice ─────────────────────────────────────────────────────
const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user:    loadUser(),
    token:   localStorage.getItem('token') || null,
    loading: false,
    error:   null,
  },
  reducers: {
    // ── Used by: Login.js, AdminLogin.js (direct dispatch)
    setUser: (state, action) => {
      state.user    = action.payload;
      state.loading = false;
      state.error   = null;
      // Persist to localStorage
      try { if (action.payload) localStorage.setItem('user', JSON.stringify(action.payload)); }
      catch {}
    },
    // ── Used by: OAuthSuccess.js (loginSuccess alias)
    loginSuccess: (state, action) => {
      state.user    = action.payload?.user || action.payload;
      state.token   = action.payload?.token || state.token;
      state.loading = false;
      state.error   = null;
    },
    // ── setCredentials alias
    setCredentials: (state, action) => {
      state.user    = action.payload?.user || action.payload;
      state.token   = action.payload?.token || state.token;
      state.loading = false;
    },
    // ── Logout
    logout: (state) => {
      state.user    = null;
      state.token   = null;
      state.loading = false;
      state.error   = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
    // ── Clear errors
    clearError: (state) => { state.error = null; },
    // ── Update user profile fields
    updateUser: (state, action) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
  },
  extraReducers: (builder) => {
    // fetchCurrentUser
    builder
      .addCase(fetchCurrentUser.pending, (state) => { state.loading = true; })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.user    = action.payload;
        state.loading = false;
        state.error   = null;
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.user    = null;
        state.token   = null;
        state.loading = false;
        state.error   = action.payload;
      });

    // loginUser
    builder
      .addCase(loginUser.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.user    = action.payload.user;
        state.token   = action.payload.token;
        state.loading = false;
        state.error   = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error   = action.payload;
      });

    // registerUser
    builder
      .addCase(registerUser.pending,   (state) => { state.loading = true; })
      .addCase(registerUser.fulfilled, (state) => { state.loading = false; })
      .addCase(registerUser.rejected,  (state, action) => {
        state.loading = false;
        state.error   = action.payload;
      });
  },
});

export const {
  setUser,
  loginSuccess,
  setCredentials,
  logout,
  clearError,
  updateUser,
} = authSlice.actions;

// Selectors
export const selectUser     = (state) => state.auth?.user;
export const selectToken    = (state) => state.auth?.token;
export const selectIsAuth   = (state) => !!state.auth?.user;
export const selectAuthLoad = (state) => state.auth?.loading;
export const selectAuthErr  = (state) => state.auth?.error;
export const selectIsAdmin  = (state) => state.auth?.user?.role === 'admin';

export default authSlice.reducer;
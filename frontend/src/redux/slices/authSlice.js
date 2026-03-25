import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { loginUser, registerUser, getMe } from '../../utils/api';

export const login = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const { data } = await loginUser(credentials);
    if (data.token) localStorage.setItem('ss_token', data.token);
    return data;
  } catch (err) { return rejectWithValue(err.response?.data?.message || 'Login failed'); }
});

export const register = createAsyncThunk('auth/register', async (userData, { rejectWithValue }) => {
  try {
    const { data } = await registerUser(userData);
    if (data.token) localStorage.setItem('ss_token', data.token);
    return data;
  } catch (err) { return rejectWithValue(err.response?.data?.message || 'Registration failed'); }
});

export const fetchMe = createAsyncThunk('auth/fetchMe', async (_, { rejectWithValue }) => {
  try { const { data } = await getMe(); return data; }
  catch (err) { return rejectWithValue(err.response?.data?.message); }
});

const authSlice = createSlice({
  name: 'auth',
  initialState: { user: null, token: localStorage.getItem('ss_token'), loading: false, error: null, twoFactorRequired: false },
  reducers: {
    logout: (state) => { state.user = null; state.token = null; state.twoFactorRequired = false; localStorage.removeItem('ss_token'); },
    clearError: (state) => { state.error = null; },
    updateUser: (state, { payload }) => { state.user = { ...state.user, ...payload }; }
  },
  extraReducers: b => {
    b.addCase(login.pending, s => { s.loading = true; s.error = null; })
     .addCase(login.fulfilled, (s, { payload }) => {
       s.loading = false;
       if (payload.twoFactorRequired) s.twoFactorRequired = true;
       else { s.user = payload.user; s.token = payload.token; }
     })
     .addCase(login.rejected, (s, { payload }) => { s.loading = false; s.error = payload; })
     .addCase(register.pending, s => { s.loading = true; s.error = null; })
     .addCase(register.fulfilled, (s, { payload }) => { s.loading = false; s.user = payload.user; s.token = payload.token; })
     .addCase(register.rejected, (s, { payload }) => { s.loading = false; s.error = payload; })
     .addCase(fetchMe.fulfilled, (s, { payload }) => { s.user = payload.user; });
  }
});

export const { logout, clearError, updateUser } = authSlice.actions;
export default authSlice.reducer;

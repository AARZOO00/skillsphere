import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

// ─────────────────────────────────────────────────────────────
// Helper — always return a safe array from any API shape:
//   { gigs: [...] }  OR  [...]  OR  anything else → []
// ─────────────────────────────────────────────────────────────
const safeArray = (data) => {
  if (Array.isArray(data))       return data;
  if (Array.isArray(data?.gigs)) return data.gigs;
  if (Array.isArray(data?.data)) return data.data;
  return [];
};

// ─────────────────────────────────────────────────────────────
// Thunks
// ─────────────────────────────────────────────────────────────

export const fetchGigs = createAsyncThunk(
  'gig/fetchGigs',
  async (params = {}, { rejectWithValue }) => {
    try {
      const res = await api.get('/gigs', { params });
      return safeArray(res.data);
    } catch (err) {
      return rejectWithValue(err?.response?.data?.message || 'Failed to fetch gigs');
    }
  }
);

export const fetchMyGigs = createAsyncThunk(
  'gig/fetchMyGigs',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get('/gigs/my-gigs');
      return safeArray(res.data);
    } catch (err) {
      return rejectWithValue(err?.response?.data?.message || 'Failed to fetch your gigs');
    }
  }
);

export const fetchGigById = createAsyncThunk(
  'gig/fetchGigById',
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.get(`/gigs/${id}`);
      return res.data?.gig || res.data || null;
    } catch (err) {
      return rejectWithValue(err?.response?.data?.message || 'Gig not found');
    }
  }
);

export const createGig = createAsyncThunk(
  'gig/createGig',
  async (gigData, { rejectWithValue }) => {
    try {
      const res = await api.post('/gigs', gigData);
      return res.data?.gig || res.data;
    } catch (err) {
      return rejectWithValue(err?.response?.data?.message || 'Failed to create gig');
    }
  }
);

export const updateGig = createAsyncThunk(
  'gig/updateGig',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await api.put(`/gigs/${id}`, data);
      return res.data?.gig || res.data;
    } catch (err) {
      return rejectWithValue(err?.response?.data?.message || 'Failed to update gig');
    }
  }
);

export const deleteGig = createAsyncThunk(
  'gig/deleteGig',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/gigs/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(err?.response?.data?.message || 'Failed to delete gig');
    }
  }
);

export const placeBid = createAsyncThunk(
  'gig/placeBid',
  async ({ gigId, bidData }, { rejectWithValue }) => {
    try {
      const res = await api.post(`/gigs/${gigId}/bids`, bidData);
      return res.data?.bid || res.data;
    } catch (err) {
      return rejectWithValue(err?.response?.data?.message || 'Failed to place bid');
    }
  }
);

export const fetchGigBids = createAsyncThunk(
  'gig/fetchGigBids',
  async (gigId, { rejectWithValue }) => {
    try {
      const res = await api.get(`/gigs/${gigId}/bids`);
      return { gigId, bids: safeArray(res.data) };
    } catch (err) {
      return rejectWithValue(err?.response?.data?.message || 'Failed to fetch bids');
    }
  }
);

export const acceptBid = createAsyncThunk(
  'gig/acceptBid',
  async ({ gigId, bidId }, { rejectWithValue }) => {
    try {
      const res = await api.patch(`/gigs/${gigId}/bids/${bidId}/accept`);
      return { gigId, bidId, data: res.data };
    } catch (err) {
      return rejectWithValue(err?.response?.data?.message || 'Failed to accept bid');
    }
  }
);

export const rejectBid = createAsyncThunk(
  'gig/rejectBid',
  async ({ gigId, bidId }, { rejectWithValue }) => {
    try {
      const res = await api.patch(`/gigs/${gigId}/bids/${bidId}/reject`);
      return { gigId, bidId, data: res.data };
    } catch (err) {
      return rejectWithValue(err?.response?.data?.message || 'Failed to reject bid');
    }
  }
);

export const fetchMyBids = createAsyncThunk(
  'gig/fetchMyBids',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get('/gigs/my-bids');
      return safeArray(res.data);
    } catch (err) {
      return rejectWithValue(err?.response?.data?.message || 'Failed to fetch bids');
    }
  }
);

// ─────────────────────────────────────────────────────────────
// Slice
// ─────────────────────────────────────────────────────────────
const gigSlice = createSlice({
  name: 'gig',
  initialState: {
    // Always arrays — never undefined/null
    gigs:    [],
    myGigs:  [],
    myBids:  [],
    gigBids: {},        // { [gigId]: [...bids] }
    currentGig: null,

    loading:        false,
    myGigsLoading:  false,
    bidsLoading:    false,
    myBidsLoading:  false,
    createLoading:  false,

    error:   null,
    success: false,

    filters: {
      search: '', category: '',
      minBudget: '', maxBudget: '',
      experience: '', workType: '',
    },
    pagination: { page: 1, pages: 1, total: 0 },
  },

  reducers: {
    clearError:   state => { state.error = null; },
    clearSuccess: state => { state.success = false; },
    setFilters:   (state, { payload }) => { state.filters = { ...state.filters, ...payload }; },
    resetFilters: state => {
      state.filters = { search: '', category: '', minBudget: '', maxBudget: '', experience: '', workType: '' };
    },
    // Safe setter — forces arrays even if someone sets wrong data
    setGigs: (state, { payload }) => { state.gigs = Array.isArray(payload) ? payload : []; },
  },

  extraReducers: builder => {
    // ── fetchGigs ──────────────────────────────────────────────
    builder
      .addCase(fetchGigs.pending,   state => { state.loading = true; state.error = null; })
      .addCase(fetchGigs.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.gigs    = Array.isArray(payload) ? payload : [];
      })
      .addCase(fetchGigs.rejected,  (state, { payload }) => {
        state.loading = false;
        state.error   = payload;
        state.gigs    = []; // Always reset to array on error
      });

    // ── fetchMyGigs ────────────────────────────────────────────
    builder
      .addCase(fetchMyGigs.pending,   state => { state.myGigsLoading = true; })
      .addCase(fetchMyGigs.fulfilled, (state, { payload }) => {
        state.myGigsLoading = false;
        state.myGigs        = Array.isArray(payload) ? payload : [];
      })
      .addCase(fetchMyGigs.rejected,  (state, { payload }) => {
        state.myGigsLoading = false;
        state.error         = payload;
        state.myGigs        = [];
      });

    // ── fetchGigById ───────────────────────────────────────────
    builder
      .addCase(fetchGigById.pending,   state => { state.loading = true; })
      .addCase(fetchGigById.fulfilled, (state, { payload }) => {
        state.loading    = false;
        state.currentGig = payload;
      })
      .addCase(fetchGigById.rejected,  (state, { payload }) => {
        state.loading    = false;
        state.error      = payload;
        state.currentGig = null;
      });

    // ── createGig ──────────────────────────────────────────────
    builder
      .addCase(createGig.pending,   state => { state.createLoading = true; state.error = null; })
      .addCase(createGig.fulfilled, (state, { payload }) => {
        state.createLoading = false;
        state.success       = true;
        if (payload) state.myGigs = [payload, ...state.myGigs];
      })
      .addCase(createGig.rejected,  (state, { payload }) => {
        state.createLoading = false;
        state.error         = payload;
      });

    // ── updateGig ──────────────────────────────────────────────
    builder
      .addCase(updateGig.fulfilled, (state, { payload }) => {
        if (!payload?._id) return;
        state.myGigs = state.myGigs.map(g => g._id === payload._id ? payload : g);
        state.gigs   = state.gigs.map(g => g._id === payload._id ? payload : g);
        state.success = true;
      });

    // ── deleteGig ──────────────────────────────────────────────
    builder
      .addCase(deleteGig.fulfilled, (state, { payload: id }) => {
        state.myGigs = state.myGigs.filter(g => g._id !== id);
        state.gigs   = state.gigs.filter(g => g._id !== id);
      });

    // ── fetchGigBids ───────────────────────────────────────────
    builder
      .addCase(fetchGigBids.pending,   state => { state.bidsLoading = true; })
      .addCase(fetchGigBids.fulfilled, (state, { payload }) => {
        state.bidsLoading          = false;
        state.gigBids[payload.gigId] = Array.isArray(payload.bids) ? payload.bids : [];
      })
      .addCase(fetchGigBids.rejected,  state => { state.bidsLoading = false; });

    // ── placeBid ───────────────────────────────────────────────
    builder
      .addCase(placeBid.fulfilled, (state, { payload }) => {
        state.success = true;
        if (payload?.gig) {
          const existing = state.gigBids[payload.gig] || [];
          state.gigBids[payload.gig] = [payload, ...existing];
        }
      });

    // ── acceptBid / rejectBid ──────────────────────────────────
    builder
      .addCase(acceptBid.fulfilled, (state, { payload }) => {
        const bids = state.gigBids[payload.gigId];
        if (Array.isArray(bids)) {
          state.gigBids[payload.gigId] = bids.map(b =>
            b._id === payload.bidId ? { ...b, status: 'accepted' } : { ...b, status: b.status === 'pending' ? 'rejected' : b.status }
          );
        }
      })
      .addCase(rejectBid.fulfilled, (state, { payload }) => {
        const bids = state.gigBids[payload.gigId];
        if (Array.isArray(bids)) {
          state.gigBids[payload.gigId] = bids.map(b =>
            b._id === payload.bidId ? { ...b, status: 'rejected' } : b
          );
        }
      });

    // ── fetchMyBids ────────────────────────────────────────────
    builder
      .addCase(fetchMyBids.pending,   state => { state.myBidsLoading = true; })
      .addCase(fetchMyBids.fulfilled, (state, { payload }) => {
        state.myBidsLoading = false;
        state.myBids        = Array.isArray(payload) ? payload : [];
      })
      .addCase(fetchMyBids.rejected,  state => {
        state.myBidsLoading = false;
        state.myBids        = [];
      });
  },
});

export const { clearError, clearSuccess, setFilters, resetFilters, setGigs } = gigSlice.actions;
export default gigSlice.reducer;
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Async thunks
export const fetchVitals = createAsyncThunk(
  'vitals/fetchVitals',
  async (patientId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/vitals/${patientId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const saveVitals = createAsyncThunk(
  'vitals/saveVitals',
  async (vitalsData, { rejectWithValue }) => {
    try {
      const response = await api.post('/vitals', vitalsData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateVitals = createAsyncThunk(
  'vitals/updateVitals',
  async ({ id, vitalsData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/vitals/${id}`, vitalsData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const vitalsSlice = createSlice({
  name: 'vitals',
  initialState: {
    vitals: [],
    currentVitals: null,
    loading: false,
    error: null,
    success: false,
  },
  reducers: {
    setCurrentVitals: (state, action) => {
      state.currentVitals = action.payload;
    },
    clearVitals: (state) => {
      state.currentVitals = null;
      state.error = null;
      state.success = false;
    },
    resetVitalsState: (state) => {
      state.vitals = [];
      state.currentVitals = null;
      state.loading = false;
      state.error = null;
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Vitals
      .addCase(fetchVitals.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVitals.fulfilled, (state, action) => {
        state.loading = false;
        state.vitals = action.payload;
      })
      .addCase(fetchVitals.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Save Vitals
      .addCase(saveVitals.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(saveVitals.fulfilled, (state, action) => {
        state.loading = false;
        state.vitals.push(action.payload);
        state.currentVitals = action.payload;
        state.success = true;
      })
      .addCase(saveVitals.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      
      // Update Vitals
      .addCase(updateVitals.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateVitals.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.vitals.findIndex(vital => vital.id === action.payload.id);
        if (index !== -1) {
          state.vitals[index] = action.payload;
        }
        state.currentVitals = action.payload;
        state.success = true;
      })
      .addCase(updateVitals.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      });
  },
});

export const { setCurrentVitals, clearVitals, resetVitalsState } = vitalsSlice.actions;

export default vitalsSlice.reducer;
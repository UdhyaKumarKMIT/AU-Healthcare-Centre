import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const fetchLabTechStats = createAsyncThunk(
  'labTech/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');

      const response = await fetch(`${API_URL}/labtech/stats`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to fetch statistics');

      const data = await response.json();
      return data.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchPendingTests = createAsyncThunk(
  'labTech/fetchPendingTests',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');

      const response = await fetch(
        `${API_URL}/labtech/tests?status=pending`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) throw new Error('Failed to fetch pending tests');

      const data = await response.json();
      return data.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchLabTests = createAsyncThunk(
  'labTech/fetchLabTests',
  async (query = '', { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');

      const response = await fetch(
        `${API_URL}/labtech/tests${query}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) throw new Error('Failed to fetch lab tests');

      const data = await response.json();
      return data.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchTestById = createAsyncThunk(
  'labTech/fetchTestById',
  async (testId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');

      const response = await fetch(
        `${API_URL}/labtech/tests/${testId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) throw new Error('Failed to fetch test');

      const data = await response.json();
      return data.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const submitTestResults = createAsyncThunk(
  'labTech/submitTestResults',
  async ({ testId, results }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');

      const response = await fetch(
        `${API_URL}/labtech/tests/${testId}/results`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(results)
        }
      );

      if (!response.ok) throw new Error('Failed to submit results');

      const data = await response.json();
      return data.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const initialState = {
  stats: {},
  labTests: [],
  pendingTests: [],
  currentTest: null,
  loading: false,
  testsLoading: false,
  error: null,
  successMessage: null
};

const labTechSlice = createSlice({
  name: 'labTech',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccessMessage: (state) => {
      state.successMessage = null;
    },
    setCurrentTest: (state, action) => {
      state.currentTest = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLabTechStats.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchLabTechStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
      })
      .addCase(fetchLabTechStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchPendingTests.fulfilled, (state, action) => {
        state.pendingTests = action.payload;
      })
      .addCase(fetchLabTests.pending, (state) => {
        state.testsLoading = true;
      })
      .addCase(fetchLabTests.fulfilled, (state, action) => {
        state.testsLoading = false;
        state.labTests = action.payload;
      })
      .addCase(fetchLabTests.rejected, (state, action) => {
        state.testsLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchTestById.fulfilled, (state, action) => {
        state.currentTest = action.payload;
      })
      .addCase(submitTestResults.fulfilled, (state, action) => {
        state.successMessage = 'Test results submitted successfully';
        state.currentTest = action.payload;
      });
  }
});

export const {
  clearError,
  clearSuccessMessage,
  setCurrentTest
} = labTechSlice.actions;

export default labTechSlice.reducer;

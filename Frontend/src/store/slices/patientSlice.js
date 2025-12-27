// src/store/slices/patientSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Define initial state separately
const initialState = {
  // Patient's own data
  patientInfo: null,
  visitHistory: [],
  
  // Admin dashboard data
  recentPatients: [],
  patientStats: {
    total: 0,
    newPatients: 0,
    returningPatients: 0,
    male: 0,
    female: 0,
    other: 0,
    ageGroups: {
      '0-18': 0,
      '19-30': 0,
      '31-45': 0,
      '46-60': 0,
      '61+': 0
    },
    monthlyGrowth: 0,
    avgVisits: 0
  },
  
  // Loading states
  loading: false,
  recentLoading: false,
  statsLoading: false,
  error: null,
  success: false,
};

// Existing thunks
export const fetchPatientHistory = createAsyncThunk(
  'patient/fetchPatientHistory',
  async (patientId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/patients/${patientId}/history`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createAppointment = createAsyncThunk(
  'patient/createAppointment',
  async (appointmentData, { rejectWithValue }) => {
    try {
      const response = await api.post('/appointments', appointmentData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// NEW: Fetch recent patients for admin dashboard
export const fetchRecentPatients = createAsyncThunk(
  'patient/fetchRecentPatients',
  async (limit = 10, { rejectWithValue }) => {
    try {
      // For development - return mock data if needed
      const mockPatients = [
        {
          id: 1,
          patientId: 'PAT001',
          name: 'John Doe',
          age: 32,
          gender: 'Male',
          phone: '9876543210',
          email: 'john@example.com',
          lastVisit: '2024-01-15',
          isNew: false
        },
        {
          id: 2,
          patientId: 'PAT002',
          name: 'Jane Smith',
          age: 28,
          gender: 'Female',
          phone: '9876543211',
          email: 'jane@example.com',
          lastVisit: '2024-01-14',
          isNew: true
        },
        {
          id: 3,
          patientId: 'PAT003',
          name: 'Robert Johnson',
          age: 45,
          gender: 'Male',
          phone: '9876543212',
          email: 'robert@example.com',
          lastVisit: '2024-01-13',
          isNew: false
        },
        {
          id: 4,
          patientId: 'PAT004',
          name: 'Sarah Williams',
          age: 35,
          gender: 'Female',
          phone: '9876543213',
          email: 'sarah@example.com',
          lastVisit: '2024-01-12',
          isNew: true
        },
        {
          id: 5,
          patientId: 'PAT005',
          name: 'Michael Brown',
          age: 29,
          gender: 'Male',
          phone: '9876543214',
          email: 'michael@example.com',
          lastVisit: '2024-01-11',
          isNew: false
        },
      ];
      return mockPatients.slice(0, limit);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// NEW: Fetch patient statistics for admin dashboard
export const fetchPatientStats = createAsyncThunk(
  'patient/fetchPatientStats',
  async (_, { rejectWithValue }) => {
    try {
      // For development - return mock stats
      return {
        total: 150,
        newPatients: 25,
        returningPatients: 125,
        male: 85,
        female: 60,
        other: 5,
        ageGroups: {
          '0-18': 20,
          '19-30': 45,
          '31-45': 50,
          '46-60': 25,
          '61+': 10
        },
        monthlyGrowth: 12,
        avgVisits: 3.2
      };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const patientSlice = createSlice({
  name: 'patient',
  initialState,
  reducers: {
    clearPatientState: (state) => {
      state.patientInfo = null;
      state.visitHistory = [];
      state.recentPatients = [];
      state.patientStats = initialState.patientStats; // Fixed: Use initialState from above
      state.loading = false;
      state.error = null;
      state.success = false;
    },
    updatePatientInfo: (state, action) => {
      state.patientInfo = { ...state.patientInfo, ...action.payload };
    },
    resetLoadingStates: (state) => {
      state.loading = false;
      state.recentLoading = false;
      state.statsLoading = false;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Patient History (for patient dashboard)
      .addCase(fetchPatientHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPatientHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.patientInfo = action.payload.patientInfo;
        state.visitHistory = action.payload.visits || [];
      })
      .addCase(fetchPatientHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create Appointment
      .addCase(createAppointment.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createAppointment.fulfilled, (state, action) => {
        state.loading = false;
        state.visitHistory.push(action.payload);
        state.success = true;
      })
      .addCase(createAppointment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      
      // Fetch Recent Patients (for admin dashboard)
      .addCase(fetchRecentPatients.pending, (state) => {
        state.recentLoading = true;
        state.error = null;
      })
      .addCase(fetchRecentPatients.fulfilled, (state, action) => {
        state.recentLoading = false;
        state.recentPatients = action.payload;
      })
      .addCase(fetchRecentPatients.rejected, (state, action) => {
        state.recentLoading = false;
        state.error = action.payload;
      })
      
      // Fetch Patient Stats (for admin dashboard)
      .addCase(fetchPatientStats.pending, (state) => {
        state.statsLoading = true;
        state.error = null;
      })
      .addCase(fetchPatientStats.fulfilled, (state, action) => {
        state.statsLoading = false;
        state.patientStats = action.payload;
      })
      .addCase(fetchPatientStats.rejected, (state, action) => {
        state.statsLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearPatientState, updatePatientInfo, resetLoadingStates } = patientSlice.actions;
export default patientSlice.reducer;
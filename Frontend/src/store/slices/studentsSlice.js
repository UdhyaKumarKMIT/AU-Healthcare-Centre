// src/store/slices/studentsSlice.js - COMPLETE WITH ALL HISTORY ACTIONS

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Fetch student profile
export const fetchStudentProfile = createAsyncThunk(
  'students/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      console.log('🔍 Fetching student profile...');
      
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/students/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (!data.success) {
        console.log('❌ Profile error:', data);
        throw new Error(data.message || 'Failed to fetch profile');
      }

      console.log('✅ Profile loaded:', data.data.name);
      return data.data;
    } catch (error) {
      console.error('💥 Fetch profile error:', error);
      return rejectWithValue(error.message);
    }
  }
);

// Fetch student's visit history
export const fetchStudentVisits = createAsyncThunk(
  'students/fetchVisits',
  async (_, { rejectWithValue }) => {
    try {
      console.log('🔍 Fetching visits...');
      
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/students/visits`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch visits');
      }

      console.log('✅ Visits loaded:', data.data.length);
      return data.data;
    } catch (error) {
      console.error('💥 Fetch visits error:', error);
      return rejectWithValue(error.message);
    }
  }
);

// Fetch student's prescriptions
export const fetchStudentPrescriptions = createAsyncThunk(
  'students/fetchPrescriptions',
  async (_, { rejectWithValue }) => {
    try {
      console.log('🔍 Fetching prescriptions...');
      
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/students/prescriptions`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch prescriptions');
      }

      console.log('✅ Prescriptions loaded:', data.data.length);
      return data.data;
    } catch (error) {
      console.error('💥 Fetch prescriptions error:', error);
      return rejectWithValue(error.message);
    }
  }
);

// Fetch student's lab tests
export const fetchStudentLabTests = createAsyncThunk(
  'students/fetchLabTests',
  async (_, { rejectWithValue }) => {
    try {
      console.log('🔍 Fetching lab tests...');
      
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/students/lab-tests`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch lab tests');
      }

      console.log('✅ Lab tests loaded:', data.data.length);
      return data.data;
    } catch (error) {
      console.error('💥 Fetch lab tests error:', error);
      return rejectWithValue(error.message);
    }
  }
);

// Fetch student's vitals
export const fetchStudentVitals = createAsyncThunk(
  'students/fetchVitals',
  async (_, { rejectWithValue }) => {
    try {
      console.log('🔍 Fetching vitals...');
      
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/students/vitals`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch vitals');
      }

      console.log('✅ Vitals loaded:', data.data.length);
      return data.data;
    } catch (error) {
      console.error('💥 Fetch vitals error:', error);
      return rejectWithValue(error.message);
    }
  }
);

// Fetch student's medical history/conditions
export const fetchMedicalHistory = createAsyncThunk(
  'students/fetchMedicalHistory',
  async (_, { rejectWithValue }) => {
    try {
      console.log('🔍 Fetching medical history...');
      
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/students/medical-history`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch medical history');
      }

      console.log('✅ Medical history loaded:', data.data.length);
      return data.data;
    } catch (error) {
      console.error('💥 Fetch medical history error:', error);
      return rejectWithValue(error.message);
    }
  }
);

// Fetch available doctors
export const fetchAvailableDoctors = createAsyncThunk(
  'students/fetchAvailableDoctors',
  async ({ date, specialization } = {}, { rejectWithValue }) => {
    try {
      console.log('🔍 Fetching available doctors...');
      
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (date) params.append('date', date);
      if (specialization) params.append('specialization', specialization);
      
      const response = await fetch(
        `${API_URL}/students/doctors/available?${params.toString()}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch doctors');
      }

      console.log('✅ Doctors loaded:', data.data.length, 'available');
      return data.data;
    } catch (error) {
      console.error('💥 Fetch doctors error:', error);
      return rejectWithValue(error.message);
    }
  }
);

// Update student profile
export const updateStudentProfile = createAsyncThunk(
  'students/updateProfile',
  async (profileData, { rejectWithValue }) => {
    try {
      console.log('🔄 Updating profile...');
      
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/students/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(profileData)
      });

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to update profile');
      }

      console.log('✅ Profile updated');
      return profileData;
    } catch (error) {
      console.error('💥 Update profile error:', error);
      return rejectWithValue(error.message);
    }
  }
);

const studentsSlice = createSlice({
  name: 'students',
  initialState: {
    profile: null,
    visits: [],
    prescriptions: [],
    labTests: [],
    vitals: [],
    medicalHistory: [],
    availableDoctors: [],
    loading: false,
    error: null
  },
  reducers: {
    clearStudentData: (state) => {
      state.profile = null;
      state.visits = [];
      state.prescriptions = [];
      state.labTests = [];
      state.vitals = [];
      state.medicalHistory = [];
      state.availableDoctors = [];
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Profile
      .addCase(fetchStudentProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStudentProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
        state.error = null;
      })
      .addCase(fetchStudentProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        console.log('❌ Redux: Profile load failed');
      })

      // Fetch Visits
      .addCase(fetchStudentVisits.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchStudentVisits.fulfilled, (state, action) => {
        state.loading = false;
        state.visits = action.payload;
      })
      .addCase(fetchStudentVisits.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Prescriptions
      .addCase(fetchStudentPrescriptions.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchStudentPrescriptions.fulfilled, (state, action) => {
        state.loading = false;
        state.prescriptions = action.payload;
      })
      .addCase(fetchStudentPrescriptions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Lab Tests
      .addCase(fetchStudentLabTests.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchStudentLabTests.fulfilled, (state, action) => {
        state.loading = false;
        state.labTests = action.payload;
      })
      .addCase(fetchStudentLabTests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Vitals
      .addCase(fetchStudentVitals.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchStudentVitals.fulfilled, (state, action) => {
        state.loading = false;
        state.vitals = action.payload;
      })
      .addCase(fetchStudentVitals.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Medical History
      .addCase(fetchMedicalHistory.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMedicalHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.medicalHistory = action.payload;
      })
      .addCase(fetchMedicalHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Available Doctors
      .addCase(fetchAvailableDoctors.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAvailableDoctors.fulfilled, (state, action) => {
        state.loading = false;
        state.availableDoctors = action.payload;
        console.log('✅ Doctors loaded:', action.payload.length, 'available');
      })
      .addCase(fetchAvailableDoctors.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update Profile
      .addCase(updateStudentProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateStudentProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = { ...state.profile, ...action.payload };
      })
      .addCase(updateStudentProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearStudentData } = studentsSlice.actions;
export default studentsSlice.reducer;
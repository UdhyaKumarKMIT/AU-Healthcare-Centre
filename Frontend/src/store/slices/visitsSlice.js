// src/store/slices/visitsSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const fetchVisits = createAsyncThunk(
  'visits/fetchVisits',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_URL}/receptionist/visits`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to fetch visits');

      const data = await response.json();
      console.log('📋 Raw visits from API:', data.data);
      
      // Transform backend response
      return data.data.map(visit => ({
        id: visit.visit_id,
        patientId: visit.patient_id,
        patientName: visit.patient_name || 'Unknown Patient',
        doctorId: visit.doctor_id,
        doctorName: visit.doctor_name || 'Unknown Doctor',
        visitType: visit.visit_type || 'OPD',
        reason: visit.reason || 'No reason provided',
        status: visit.status || 'SCHEDULED',
        token: visit.token || `T-${Math.floor(Math.random() * 1000)}`,
        visitDate: visit.visit_date || new Date().toISOString()
      }));
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createVisit = createAsyncThunk(
  'visits/createVisit',
  async (visitData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('mitHealthUser') || '{}');
      
      const payload = {
        patient_id: visitData.patientId,
        doctor_id: visitData.doctorId,
        receptionist_id: user.receptionist_id || null, // Use receptionist_id, not user.id
        visit_type: visitData.visitType.toUpperCase(),
        reason: visitData.reason
      };
      
      console.log('🚀 Creating visit with payload:', payload);
      
      const response = await fetch(`${API_URL}/receptionist/visit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      console.log('📡 Visit response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Visit error:', errorData);
        throw new Error(errorData.message || 'Failed to create visit');
      }

      const data = await response.json();
      console.log('✅ Visit created:', data);
      
      // If vitals provided, save them
      if (visitData.vitals) {
        console.log('💉 Saving vitals...');
        await saveVitals(data.visit_id, visitData.vitals, token);
      }
      
      // Return transformed visit data
      return {
        id: data.visit_id,
        patientId: visitData.patientId,
        patientName: visitData.patientName,
        doctorId: visitData.doctorId,
        doctorName: visitData.doctorName,
        visitType: visitData.visitType,
        reason: visitData.reason,
        status: 'SCHEDULED',
        token: data.token || 'N/A',
        visitDate: new Date().toISOString()
      };
    } catch (error) {
      console.error('💥 Create visit error:', error);
      return rejectWithValue(error.message);
    }
  }
);

// Helper function to save vitals
const saveVitals = async (visitId, vitalsData, token) => {
  try {
    const response = await fetch(`${API_URL}/receptionist/vitals`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        visit_id: visitId,
        temperature: vitalsData.temperature || null,
        bp_systolic: vitalsData.bpSystolic || null,
        bp_diastolic: vitalsData.bpDiastolic || null,
        heart_rate: vitalsData.heartRate || null
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Vitals error:', errorData);
      throw new Error('Failed to save vitals');
    }

    return await response.json();
  } catch (error) {
    console.error('Error saving vitals:', error);
    // Don't throw - vitals are optional
    return null;
  }
};

const initialState = {
  visits: [],
  loading: false,
  error: null,
  createSuccess: false,
  nextToken: 4,
};

const visitsSlice = createSlice({
  name: 'visits',
  initialState,
  reducers: {
    updateVisitStatus: (state, action) => {
      const { visitId, status } = action.payload;
      const visit = state.visits.find(v => v.id === visitId);
      if (visit) {
        visit.status = status;
      }
    },
    clearCreateSuccess: (state) => {
      state.createSuccess = false;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Visits
      .addCase(fetchVisits.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVisits.fulfilled, (state, action) => {
        state.loading = false;
        state.visits = action.payload;
      })
      .addCase(fetchVisits.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create Visit
      .addCase(createVisit.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.createSuccess = false;
      })
      .addCase(createVisit.fulfilled, (state, action) => {
        state.loading = false;
        state.visits.push(action.payload);
        state.nextToken += 1;
        state.createSuccess = true;
      })
      .addCase(createVisit.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.createSuccess = false;
      });
  },
});

export const { updateVisitStatus, clearCreateSuccess } = visitsSlice.actions;
export default visitsSlice.reducer;
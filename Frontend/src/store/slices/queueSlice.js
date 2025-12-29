// src/store/slices/queueSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { updateVisitStatus } from './doctorsSlice';

const API_BASE = 'http://localhost:5000';

// Fetch patient queue for a specific doctor
export const fetchPatientQueue = createAsyncThunk(
  'queue/fetchPatientQueue',
  async (doctorId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      
      console.log('🔍 Fetching patient queue for doctor:', doctorId);
      
      const response = await fetch(`${API_BASE}/api/doctor/queue/${doctorId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('📡 Queue response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Queue error response:', errorText);
        throw new Error(`Failed to fetch queue: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Queue data received:', data);
      
      // Transform the data to match your frontend format
      return data.data.map(visit => ({
        visitId: visit.visit_id,
        token: visit.token_number,
        patientName: visit.patient_name,
        visitType: visit.visit_type,
        status: visit.status,
        patientId: visit.patient_id,
        age: visit.age || 'N/A',
        gender: visit.gender || 'N/A',
        bloodGroup: visit.blood_group || 'N/A',
        reason: visit.reason || visit.chief_complaint || 'Not specified'
      }));
    } catch (error) {
      console.error('💥 Fetch queue error:', error);
      return rejectWithValue(error.message);
    }
  }
);

// Fetch patient history
export const fetchPatientHistory = createAsyncThunk(
  'queue/fetchPatientHistory',
  async (patientId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      
      console.log('🔍 Fetching history for patient:', patientId);
      
      const response = await fetch(`${API_BASE}/api/doctor/patient/${patientId}/history`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('📡 History response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ History error response:', errorText);
        throw new Error(`Failed to fetch history: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Patient history received:', result);
      
      return {
        patientId,
        data: result.data
      };
    } catch (error) {
      console.error('💥 Fetch history error:', error);
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  patients: [],
  loading: false,
  error: null,
  selectedPatient: null,
  lastFetched: null,
  patientHistory: null,
  historyLoading: false,
  historyError: null,
};

const queueSlice = createSlice({
  name: 'queue',
  initialState,
  reducers: {
    setSelectedPatient: (state, action) => {
      state.selectedPatient = action.payload;
      console.log('📌 Selected patient:', action.payload?.patientName);
    },
    updatePatientStatus: (state, action) => {
      const { visitId, status } = action.payload;
      const patient = state.patients.find(p => p.visitId === visitId);
      if (patient) {
        const oldStatus = patient.status;
        patient.status = status;
        console.log(`✅ Queue reducer: Updated patient ${visitId} from ${oldStatus} to ${status}`);
      } else {
        console.warn(`⚠️ Queue reducer: Patient ${visitId} not found`);
      }
    },
    clearQueue: (state) => {
      state.patients = [];
      state.selectedPatient = null;
      state.lastFetched = null;
      console.log('🧹 Queue cleared');
    },
    clearPatientHistory: (state) => {
      state.patientHistory = null;
      state.historyError = null;
      console.log('🧹 Patient history cleared');
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch patient queue
      .addCase(fetchPatientQueue.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPatientQueue.fulfilled, (state, action) => {
        state.loading = false;
        state.patients = action.payload;
        state.lastFetched = new Date().toISOString();
        console.log('✅ Queue loaded with', action.payload.length, 'patients');
        console.log('📋 Patients:', action.payload.map(p => ({ 
          id: p.visitId, 
          name: p.patientName, 
          status: p.status 
        })));
      })
      .addCase(fetchPatientQueue.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        console.error('❌ Failed to load queue:', action.payload);
      })
      
      // Fetch patient history
      .addCase(fetchPatientHistory.pending, (state) => {
        state.historyLoading = true;
        state.historyError = null;
        console.log('⏳ Loading patient history...');
      })
      .addCase(fetchPatientHistory.fulfilled, (state, action) => {
        state.historyLoading = false;
        state.patientHistory = action.payload.data;
        console.log('✅ Patient history loaded successfully');
      })
      .addCase(fetchPatientHistory.rejected, (state, action) => {
        state.historyLoading = false;
        state.historyError = action.payload;
        console.error('❌ Failed to load patient history:', action.payload);
      })
      
      // Listen to updateVisitStatus from doctorsSlice
      .addCase(updateVisitStatus.pending, (state, action) => {
        console.log('⏳ Visit status update pending...', action.meta.arg);
      })
      .addCase(updateVisitStatus.fulfilled, (state, action) => {
        const { visitId, status } = action.payload;
        const patient = state.patients.find(p => p.visitId === visitId);
        
        if (patient) {
          const oldStatus = patient.status;
          patient.status = status;
          console.log(`✅ Queue extraReducer: Updated patient ${visitId} from ${oldStatus} to ${status}`);
          
          // Update selected patient if it's the same one
          if (state.selectedPatient?.visitId === visitId) {
            state.selectedPatient.status = status;
            console.log('✅ Also updated selected patient status');
          }
        } else {
          console.warn(`⚠️ Patient with visitId ${visitId} not found in queue`);
          console.log('Current patients:', state.patients.map(p => p.visitId));
        }
      })
      .addCase(updateVisitStatus.rejected, (state, action) => {
        console.error('❌ Visit status update failed:', action.payload);
      });
  },
});

export const { 
  setSelectedPatient, 
  updatePatientStatus, 
  clearQueue,
  clearPatientHistory 
} = queueSlice.actions;

export default queueSlice.reducer;
// src/store/slices/patientsSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const fetchPatients = createAsyncThunk(
  'patients/fetchPatients',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_URL}/receptionist/patients`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to fetch patients');

      const data = await response.json();
      
      // Transform backend response to match component expectations
      return data.data.map(patient => ({
        id: patient.patient_id,
        rollNo: patient.roll_no,
        name: patient.name,
        email: patient.email,
        dob: patient.dob,
        gender: patient.gender,
        bloodGroup: patient.blood_group,
        phone: patient.phone,
        emergencyContact: patient.emergency_contact,
        registeredAt: patient.created_at
      }));
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const registerPatient = createAsyncThunk(
  'patients/registerPatient',
  async (patientData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      
      // Use provided email or generate default password
      const payload = {
        email: patientData.email, // Use email from form
        password: `Patient@${patientData.rollNo}`, // Default password pattern
        roll_no: patientData.rollNo,
        name: patientData.name,
        dob: patientData.dob,
        gender: patientData.gender.toUpperCase(), // MALE, FEMALE, OTHER
        blood_group: patientData.bloodGroup,
        phone: patientData.phone,
        emergency_contact: patientData.emergencyContact
      };
      
      console.log('🚀 Registering patient with payload:', payload);
      
      const response = await fetch(`${API_URL}/receptionist/register/patient`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      console.log('📡 Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Error response:', errorData);
        throw new Error(errorData.message || 'Failed to register patient');
      }

      const data = await response.json();
      console.log('✅ Success response:', data);
      
      // Return transformed patient data
      return {
        id: data.patient_id,
        rollNo: patientData.rollNo,
        name: patientData.name,
        email: patientData.email,
        dob: patientData.dob,
        gender: patientData.gender,
        bloodGroup: patientData.bloodGroup,
        phone: patientData.phone,
        emergencyContact: patientData.emergencyContact,
        registeredAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('💥 Registration error:', error);
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  patients: [],
  loading: false,
  error: null,
  registerSuccess: false,
};

const patientsSlice = createSlice({
  name: 'patients',
  initialState,
  reducers: {
    addPatient: (state, action) => {
      state.patients.push({
        ...action.payload,
        id: `pat-${Date.now()}`,
        registeredAt: new Date().toISOString().split('T')[0],
      });
    },
    updatePatient: (state, action) => {
      const { id, updates } = action.payload;
      const index = state.patients.findIndex(patient => patient.id === id);
      if (index !== -1) {
        state.patients[index] = { ...state.patients[index], ...updates };
      }
    },
    clearRegisterSuccess: (state) => {
      state.registerSuccess = false;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Patients
      .addCase(fetchPatients.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPatients.fulfilled, (state, action) => {
        state.loading = false;
        state.patients = action.payload;
      })
      .addCase(fetchPatients.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Register Patient
      .addCase(registerPatient.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.registerSuccess = false;
      })
      .addCase(registerPatient.fulfilled, (state, action) => {
        state.loading = false;
        state.patients.push(action.payload);
        state.registerSuccess = true;
      })
      .addCase(registerPatient.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.registerSuccess = false;
      });
  },
});

export const { addPatient, updatePatient, clearRegisterSuccess } = patientsSlice.actions;
export default patientsSlice.reducer;
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const API_BASE = 'http://localhost:5000';

export const fetchDoctors = createAsyncThunk(
  'doctors/fetchDoctors',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      
      console.log('🔍 Fetching doctors...');
      
      const response = await fetch(`${API_BASE}/api/receptionist/doctors`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('📡 Doctors response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Doctors error response:', errorText);
        throw new Error(`Failed to fetch doctors: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Doctors data:', data);
      
      return data.data.map(doc => ({
        id: doc.doctor_id,
        name: doc.name,
        specialization: doc.specialization || 'General',
        status: doc.availability_status || 'AVAILABLE'
      }));
    } catch (error) {
      console.error('💥 Fetch doctors error:', error);
      return rejectWithValue(error.message);
    }
  }
);

export const updateDoctorAvailability = createAsyncThunk(
  'doctors/updateDoctorAvailability',
  async ({ doctorId, status }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      
      console.log('🔄 Updating doctor availability:', { doctorId, status });
      
      const response = await fetch(`${API_BASE}/api/receptionist/doctor/${doctorId}/availability`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          availability_status: status
        })
      });

      console.log('📡 Update status response:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Update error:', errorText);
        throw new Error('Failed to update doctor availability');
      }

      const data = await response.json();
      console.log('✅ Update success:', data);
      
      return { doctorId, status };
    } catch (error) {
      console.error('💥 Update doctor error:', error);
      return rejectWithValue(error.message);
    }
  }
);

export const updateVisitStatus = createAsyncThunk(
  'doctors/updateVisitStatus',
  async ({ visitId, status }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      
      console.log('🔄 Updating visit status:', { visitId, status });
      
      const response = await fetch(`${API_BASE}/api/doctor/visit/${visitId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });

      console.log('📡 Visit status response:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Visit status error:', errorText);
        throw new Error('Failed to update visit status');
      }

      const data = await response.json();
      console.log('✅ Visit status updated:', data);
      
      return { visitId, status };
    } catch (error) {
      console.error('💥 Update visit status error:', error);
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  doctors: [],
  loading: false,
  error: null,
  updateLoading: false,
};

const doctorsSlice = createSlice({
  name: 'doctors',
  initialState,
  reducers: {
    updateDoctorStatus: (state, action) => {
      const { doctorId, status } = action.payload;
      const doctor = state.doctors.find(doc => doc.id === doctorId);
      if (doctor) {
        doctor.status = status;
      }
    },
    addDoctor: (state, action) => {
      state.doctors.push(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDoctors.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDoctors.fulfilled, (state, action) => {
        state.loading = false;
        state.doctors = action.payload;
      })
      .addCase(fetchDoctors.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateDoctorAvailability.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateDoctorAvailability.fulfilled, (state, action) => {
        state.loading = false;
        const { doctorId, status } = action.payload;
        const doctor = state.doctors.find(doc => doc.id === doctorId);
        if (doctor) {
          doctor.status = status;
        }
      })
      .addCase(updateDoctorAvailability.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateVisitStatus.pending, (state) => {
        state.updateLoading = true;
        state.error = null;
      })
      .addCase(updateVisitStatus.fulfilled, (state, action) => {
        state.updateLoading = false;
        console.log('✅ Redux: Visit status updated successfully');
      })
      .addCase(updateVisitStatus.rejected, (state, action) => {
        state.updateLoading = false;
        state.error = action.payload;
      });
  },
});

export const { updateDoctorStatus, addDoctor } = doctorsSlice.actions;
export default doctorsSlice.reducer;
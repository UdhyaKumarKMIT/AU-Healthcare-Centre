// ============================================================================
// receptionistSlice.js - WITH TOAST NOTIFICATIONS & recorded_by_code
// ============================================================================
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { toast } from 'react-toastify';

const API_BASE_URL = 'http://localhost:5000/api';

const getStaffCode = () => {
  const staffCode = localStorage.getItem('staff_code');
  if (staffCode) return staffCode;
  
  const userStr = localStorage.getItem('user');
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      return user.staff_code || user.staffCode || null;
    } catch (e) {
      console.error('Error parsing user data:', e);
      return null;
    }
  }
  
  return null;
};

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return { 
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

// ============================================================================
// ASYNC THUNKS - PATIENTS
// ============================================================================

export const registerPatient = createAsyncThunk(
  'receptionist/registerPatient',
  async (patientData, { rejectWithValue }) => {
    try {
      const staffCode = patientData.staffCode || getStaffCode();
      
      if (!staffCode) {
        toast.error('Staff code not found. Please login again.');
        return rejectWithValue('Staff code not found');
      }
      
      const payload = {
        username: patientData.email,
        password: patientData.rollNo || patientData.employeeId || 'default123',
        name: patientData.name,
        dob: patientData.dob,
        gender: patientData.gender.toUpperCase(),
        phone: patientData.phone,
        patient_type: patientData.patientType || 'STUDENT',
        allergic_to: patientData.allergicTo || null,
        department: patientData.department,
        year: patientData.year,
        employeeId: patientData.employeeId,
        designation: patientData.designation,
        familyMembers: patientData.familyMembers || [],
        created_by_code: staffCode
      };

      const response = await axios.post(
        `${API_BASE_URL}/receptionist/register/patient`,
        payload,
        { headers: getAuthHeaders() }
      );
      
      toast.success('Patient registered successfully!');
      return response.data;
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to register patient';
      toast.error(errorMsg);
      return rejectWithValue(errorMsg);
    }
  }
);

export const fetchPatients = createAsyncThunk(
  'receptionist/fetchPatients',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/receptionist/patients`, {
        headers: getAuthHeaders()
      });
      return response.data.data;
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to fetch patients';
      toast.error(errorMsg);
      return rejectWithValue(errorMsg);
    }
  }
);

// ============================================================================
// ASYNC THUNKS - DOCTORS
// ============================================================================

export const fetchDoctors = createAsyncThunk(
  'receptionist/fetchDoctors',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/receptionist/doctors`, {
        headers: getAuthHeaders()
      });
      return response.data.data;
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to fetch doctors';
      toast.error(errorMsg);
      return rejectWithValue(errorMsg);
    }
  }
);

export const fetchAvailableDoctors = createAsyncThunk(
  'receptionist/fetchAvailableDoctors',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/receptionist/doctors/available`, {
        headers: getAuthHeaders()
      });
      return response.data.data;
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to fetch available doctors';
      toast.error(errorMsg);
      return rejectWithValue(errorMsg);
    }
  }
);

export const updateDoctorAvailability = createAsyncThunk(
  'receptionist/updateDoctorAvailability',
  async ({ doctorId, status }, { rejectWithValue }) => {
    try {
      const staffCode = visitData.staffCode || getStaffCode();
      
      await axios.patch(
        `${API_BASE_URL}/receptionist/doctor/${doctorId}/availability`,
        { 
          availability_status: status,
          updated_by_code: staffCode
        },
        { headers: getAuthHeaders() }
      );
      
      toast.success('Doctor availability updated successfully!');
      return { doctorId, status };
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to update doctor availability';
      toast.error(errorMsg);
      return rejectWithValue(errorMsg);
    }
  }
);

// ============================================================================
// ASYNC THUNKS - VISITS
// ============================================================================

export const fetchVisits = createAsyncThunk(
  'receptionist/fetchVisits',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/receptionist/visits`, {
        headers: getAuthHeaders()
      });
      return response.data.data;
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to fetch visits';
      toast.error(errorMsg);
      return rejectWithValue(errorMsg);
    }
  }
);

export const createVisit = createAsyncThunk(
  'receptionist/createVisit',
  async (visitData, { rejectWithValue }) => {
    try {
      const staffCode = visitData.staffCode || getStaffCode();
      
      if (!staffCode) {
        toast.error('Staff code not found. Please login again.');
        return rejectWithValue('Staff code not found');
      }
      
      console.log('Creating visit with data:', visitData);
      
      // Create visit
      const visitPayload = {
        patient_id: visitData.patientId,
        doctor_id: visitData.doctorId,
        reason: visitData.reason,
        visit_type: visitData.visitType,
        created_by_code: staffCode
      };

      console.log('Visit payload:', visitPayload);

      const visitResponse = await axios.post(
        `${API_BASE_URL}/receptionist/visit`,
        visitPayload,
        { headers: getAuthHeaders() }
      );

      console.log('Visit response:', visitResponse.data);
      const visitId = visitResponse.data.visit_id;

      // Add vitals if provided
      if (visitData.vitals) {
        const vitalsPayload = {
          visit_id: visitId,
          temperature: visitData.vitals.temperature,
          bp_systolic: visitData.vitals.bpSystolic,
          bp_diastolic: visitData.vitals.bpDiastolic,
          heart_rate: visitData.vitals.heartRate,
          cbg: visitData.vitals.cbg || null,
          spo2: visitData.vitals.spo2 || null,
          recorded_by_code: staffCode
        };

        console.log('Vitals payload:', vitalsPayload);

        await axios.post(
          `${API_BASE_URL}/receptionist/vitals`,
          vitalsPayload,
          { headers: getAuthHeaders() }
        );
      }

      toast.success('Visit created successfully!');
      return visitResponse.data;
    } catch (error) {
      console.error('Create visit error:', error);
      const errorMsg = error.response?.data?.message || 'Failed to create visit';
      toast.error(errorMsg);
      return rejectWithValue(errorMsg);
    }
  }
);

export const startVisit = createAsyncThunk(
  'receptionist/startVisit',
  async (visitId, { rejectWithValue }) => {
    try {
      const staffCode = visitData.staffCode || getStaffCode();
      
      await axios.patch(
        `${API_BASE_URL}/receptionist/visit/${visitId}/start`,
        { updated_by_code: staffCode },
        { headers: getAuthHeaders() }
      );
      
      toast.success('Visit started successfully!');
      return { visitId, status: 'ONGOING' };
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to start visit';
      toast.error(errorMsg);
      return rejectWithValue(errorMsg);
    }
  }
);

export const cancelVisit = createAsyncThunk(
  'receptionist/cancelVisit',
  async (visitId, { rejectWithValue }) => {
    try {
      const staffCode = visitData.staffCode || getStaffCode();
      
      await axios.patch(
        `${API_BASE_URL}/receptionist/visit/${visitId}/cancel`,
        { cancelled_by_code: staffCode },
        { headers: getAuthHeaders() }
      );
      
      toast.success('Visit cancelled successfully!');
      return { visitId, status: 'CANCELLED' };
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to cancel visit';
      toast.error(errorMsg);
      return rejectWithValue(errorMsg);
    }
  }
);

export const assignDoctor = createAsyncThunk(
  'receptionist/assignDoctor',
  async ({ visitId, doctorId }, { rejectWithValue }) => {
    try {
      const staffCode = visitData.staffCode || getStaffCode();
      
      await axios.patch(
        `${API_BASE_URL}/receptionist/visit/${visitId}/assign-doctor`,
        { 
          doctor_id: doctorId,
          assigned_by_code: staffCode
        },
        { headers: getAuthHeaders() }
      );
      
      toast.success('Doctor assigned successfully!');
      return { visitId, doctorId };
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to assign doctor';
      toast.error(errorMsg);
      return rejectWithValue(errorMsg);
    }
  }
);

// ============================================================================
// INITIAL STATE
// ============================================================================

const initialState = {
  patients: [],
  patientsLoading: false,
  patientsError: null,
  registerSuccess: false,
  
  doctors: [],
  availableDoctors: [],
  doctorsLoading: false,
  doctorsError: null,
  updateDoctorSuccess: false,
  
  visits: [],
  visitsLoading: false,
  visitsError: null,
  createVisitSuccess: false,
  
  globalLoading: false,
  globalError: null,
};

// ============================================================================
// SLICE
// ============================================================================

const receptionistSlice = createSlice({
  name: 'receptionist',
  initialState,
  reducers: {
    clearRegisterSuccess: (state) => {
      state.registerSuccess = false;
      state.patientsError = null;
    },
    clearCreateVisitSuccess: (state) => {
      state.createVisitSuccess = false;
      state.visitsError = null;
    },
    clearUpdateDoctorSuccess: (state) => {
      state.updateDoctorSuccess = false;
      state.doctorsError = null;
    },
    clearPatientsError: (state) => {
      state.patientsError = null;
    },
    clearDoctorsError: (state) => {
      state.doctorsError = null;
    },
    clearVisitsError: (state) => {
      state.visitsError = null;
    },
    clearGlobalError: (state) => {
      state.globalError = null;
    },
    resetReceptionistState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      // PATIENTS
      .addCase(fetchPatients.pending, (state) => {
        state.patientsLoading = true;
        state.patientsError = null;
      })
      .addCase(fetchPatients.fulfilled, (state, action) => {
        state.patientsLoading = false;
        state.patients = action.payload.map(p => ({
          id: p.patient_id,
          patient_id: p.patient_id,
          name: p.name,
          dob: p.dob,
          gender: p.gender,
          phone: p.phone,
          patientType: p.patient_type,
          allergicTo: p.allergic_to,
          createdAt: p.created_at,
          rollNo: p.roll_no || 'N/A',
          student_id: p.student_id || p.roll_no
        }));
      })
      .addCase(fetchPatients.rejected, (state, action) => {
        state.patientsLoading = false;
        state.patientsError = action.payload;
      })
      
      .addCase(registerPatient.pending, (state) => {
        state.patientsLoading = true;
        state.patientsError = null;
        state.registerSuccess = false;
      })
      .addCase(registerPatient.fulfilled, (state) => {
        state.patientsLoading = false;
        state.registerSuccess = true;
      })
      .addCase(registerPatient.rejected, (state, action) => {
        state.patientsLoading = false;
        state.patientsError = action.payload;
        state.registerSuccess = false;
      })
      
      // DOCTORS
      .addCase(fetchDoctors.pending, (state) => {
        state.doctorsLoading = true;
        state.doctorsError = null;
      })
      .addCase(fetchDoctors.fulfilled, (state, action) => {
        state.doctorsLoading = false;
        state.doctors = action.payload.map(d => ({
          id: d.doctor_id,
          name: d.name,
          specialization: d.specialization,
          phone: d.phone,
          status: d.availability_status || 'UNAVAILABLE'
        }));
      })
      .addCase(fetchDoctors.rejected, (state, action) => {
        state.doctorsLoading = false;
        state.doctorsError = action.payload;
      })
      
      .addCase(fetchAvailableDoctors.pending, (state) => {
        state.doctorsLoading = true;
      })
      .addCase(fetchAvailableDoctors.fulfilled, (state, action) => {
        state.doctorsLoading = false;
        state.availableDoctors = action.payload.map(d => ({
          id: d.doctor_id,
          name: d.name,
          specialization: d.specialization,
          phone: d.phone,
          status: d.availability_status
        }));
      })
      .addCase(fetchAvailableDoctors.rejected, (state, action) => {
        state.doctorsLoading = false;
        state.doctorsError = action.payload;
      })
      
      .addCase(updateDoctorAvailability.pending, (state) => {
        state.doctorsLoading = true;
        state.doctorsError = null;
        state.updateDoctorSuccess = false;
      })
      .addCase(updateDoctorAvailability.fulfilled, (state, action) => {
        state.doctorsLoading = false;
        state.updateDoctorSuccess = true;
        const doctor = state.doctors.find(d => d.id === action.payload.doctorId);
        if (doctor) {
          doctor.status = action.payload.status;
        }
      })
      .addCase(updateDoctorAvailability.rejected, (state, action) => {
        state.doctorsLoading = false;
        state.doctorsError = action.payload;
        state.updateDoctorSuccess = false;
      })
      
      // VISITS
      .addCase(fetchVisits.pending, (state) => {
        state.visitsLoading = true;
        state.visitsError = null;
      })
      .addCase(fetchVisits.fulfilled, (state, action) => {
        state.visitsLoading = false;
        state.visits = action.payload.map(v => ({
          id: v.visit_id,
          patientId: v.patient_id,
          doctorId: v.doctor_id,
          patientName: v.patient_name,
          doctorName: v.doctor_name,
          visitDate: v.visit_date,
          reason: v.reason,
          status: v.status,
          visitType: v.visit_type || 'OPD',
          token: v.token
        }));
      })
      .addCase(fetchVisits.rejected, (state, action) => {
        state.visitsLoading = false;
        state.visitsError = action.payload;
      })
      
      .addCase(createVisit.pending, (state) => {
        state.visitsLoading = true;
        state.visitsError = null;
        state.createVisitSuccess = false;
      })
      .addCase(createVisit.fulfilled, (state) => {
        state.visitsLoading = false;
        state.createVisitSuccess = true;
      })
      .addCase(createVisit.rejected, (state, action) => {
        state.visitsLoading = false;
        state.visitsError = action.payload;
        state.createVisitSuccess = false;
      })
      
      .addCase(startVisit.fulfilled, (state, action) => {
        const visit = state.visits.find(v => v.id === action.payload.visitId);
        if (visit) {
          visit.status = action.payload.status;
        }
      })
      
      .addCase(cancelVisit.fulfilled, (state, action) => {
        const visit = state.visits.find(v => v.id === action.payload.visitId);
        if (visit) {
          visit.status = action.payload.status;
        }
      })
      
      .addCase(assignDoctor.fulfilled, (state, action) => {
        const visit = state.visits.find(v => v.id === action.payload.visitId);
        if (visit) {
          visit.doctorId = action.payload.doctorId;
        }
      });
  }
});

// ============================================================================
// EXPORTS
// ============================================================================

export const {
  clearRegisterSuccess,
  clearCreateVisitSuccess,
  clearUpdateDoctorSuccess,
  clearPatientsError,
  clearDoctorsError,
  clearVisitsError,
  clearGlobalError,
  resetReceptionistState,
} = receptionistSlice.actions;

export default receptionistSlice.reducer;

// Selectors
export const selectPatients = (state) => state.receptionist.patients;
export const selectPatientsLoading = (state) => state.receptionist.patientsLoading;
export const selectPatientsError = (state) => state.receptionist.patientsError;
export const selectRegisterSuccess = (state) => state.receptionist.registerSuccess;

export const selectDoctors = (state) => state.receptionist.doctors;
export const selectAvailableDoctors = (state) => state.receptionist.availableDoctors;
export const selectDoctorsLoading = (state) => state.receptionist.doctorsLoading;
export const selectDoctorsError = (state) => state.receptionist.doctorsError;
export const selectUpdateDoctorSuccess = (state) => state.receptionist.updateDoctorSuccess;

export const selectVisits = (state) => state.receptionist.visits;
export const selectVisitsLoading = (state) => state.receptionist.visitsLoading;
export const selectVisitsError = (state) => state.receptionist.visitsError;
export const selectCreateVisitSuccess = (state) => state.receptionist.createVisitSuccess;

export const selectGlobalLoading = (state) => state.receptionist.globalLoading;
export const selectGlobalError = (state) => state.receptionist.globalError;
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Async thunks
export const fetchPrescriptionHistory = createAsyncThunk(
  'prescription/fetchPrescriptionHistory',
  async (patientId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/prescriptions/history/${patientId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const setCurrentPrescription = createAsyncThunk(
  'prescription/setCurrentPrescription',
  async (prescriptionId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/prescriptions/${prescriptionId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updatePrescriptionStatus = createAsyncThunk(
  'prescription/updatePrescriptionStatus',
  async ({ prescriptionId, status }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/prescriptions/${prescriptionId}/status`, { status });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateMedicine = createAsyncThunk(
  'prescription/updateMedicine',
  async ({ prescriptionId, medicineId, medicineData }, { rejectWithValue }) => {
    try {
      const response = await api.put(
        `/prescriptions/${prescriptionId}/medicines/${medicineId}`,
        medicineData
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const removeMedicine = createAsyncThunk(
  'prescription/removeMedicine',
  async ({ prescriptionId, medicineId }, { rejectWithValue }) => {
    try {
      const response = await api.delete(
        `/prescriptions/${prescriptionId}/medicines/${medicineId}`
      );
      return { prescriptionId, medicineId, ...response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const filterMedicineSuggestions = createAsyncThunk(
  'prescription/filterMedicineSuggestions',
  async (searchTerm, { rejectWithValue }) => {
    try {
      const response = await api.get(`/medicines/suggestions?search=${searchTerm}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const addMedicineToPrescription = createAsyncThunk(
  'prescription/addMedicineToPrescription',
  async ({ prescriptionId, medicineData }, { rejectWithValue }) => {
    try {
      const response = await api.post(
        `/prescriptions/${prescriptionId}/medicines`,
        medicineData
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const savePrescription = createAsyncThunk(
  'prescription/savePrescription',
  async (prescriptionData, { rejectWithValue }) => {
    try {
      const response = await api.post('/prescriptions', prescriptionData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const submitPrescription = createAsyncThunk(
  'prescription/submitPrescription',
  async ({ prescriptionId, prescriptionData }, { rejectWithValue }) => {
    try {
      const response = await api.post(
        `/prescriptions/${prescriptionId}/submit`,
        prescriptionData
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const prescriptionSlice = createSlice({
  name: 'prescription',
  initialState: {
    prescriptions: [],
    currentPrescription: null,
    medicineSuggestions: [],
    loading: false,
    error: null,
    success: false,
    medicineLoading: false,
    saving: false,
    submitting: false,
  },
  reducers: {
    clearCurrentPrescription: (state) => {
      state.currentPrescription = null;
    },
    clearMedicineSuggestions: (state) => {
      state.medicineSuggestions = [];
    },
    resetPrescriptionState: (state) => {
      state.prescriptions = [];
      state.currentPrescription = null;
      state.medicineSuggestions = [];
      state.loading = false;
      state.error = null;
      state.success = false;
      state.medicineLoading = false;
      state.saving = false;
      state.submitting = false;
    },
    resetSuccessState: (state) => {
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Prescription History
      .addCase(fetchPrescriptionHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPrescriptionHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.prescriptions = action.payload;
      })
      .addCase(fetchPrescriptionHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Set Current Prescription
      .addCase(setCurrentPrescription.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(setCurrentPrescription.fulfilled, (state, action) => {
        state.loading = false;
        state.currentPrescription = action.payload;
      })
      .addCase(setCurrentPrescription.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update Prescription Status
      .addCase(updatePrescriptionStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updatePrescriptionStatus.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.prescriptions.findIndex(
          prescription => prescription.id === action.payload.id
        );
        if (index !== -1) {
          state.prescriptions[index] = action.payload;
        }
        if (state.currentPrescription?.id === action.payload.id) {
          state.currentPrescription = action.payload;
        }
        state.success = true;
      })
      .addCase(updatePrescriptionStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      
      // Save Prescription
      .addCase(savePrescription.pending, (state) => {
        state.saving = true;
        state.error = null;
        state.success = false;
      })
      .addCase(savePrescription.fulfilled, (state, action) => {
        state.saving = false;
        state.prescriptions.push(action.payload);
        state.currentPrescription = action.payload;
        state.success = true;
      })
      .addCase(savePrescription.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload;
        state.success = false;
      })
      
      // Submit Prescription
      .addCase(submitPrescription.pending, (state) => {
        state.submitting = true;
        state.error = null;
        state.success = false;
      })
      .addCase(submitPrescription.fulfilled, (state, action) => {
        state.submitting = false;
        const index = state.prescriptions.findIndex(
          prescription => prescription.id === action.payload.id
        );
        if (index !== -1) {
          state.prescriptions[index] = action.payload;
        }
        if (state.currentPrescription?.id === action.payload.id) {
          state.currentPrescription = action.payload;
        }
        state.success = true;
      })
      .addCase(submitPrescription.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload;
        state.success = false;
      })
      
      // Update Medicine
      .addCase(updateMedicine.pending, (state) => {
        state.medicineLoading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateMedicine.fulfilled, (state, action) => {
        state.medicineLoading = false;
        if (state.currentPrescription) {
          const index = state.currentPrescription.medicines.findIndex(
            medicine => medicine.id === action.payload.id
          );
          if (index !== -1) {
            state.currentPrescription.medicines[index] = action.payload;
          }
        }
        state.success = true;
      })
      .addCase(updateMedicine.rejected, (state, action) => {
        state.medicineLoading = false;
        state.error = action.payload;
        state.success = false;
      })
      
      // Remove Medicine
      .addCase(removeMedicine.pending, (state) => {
        state.medicineLoading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(removeMedicine.fulfilled, (state, action) => {
        state.medicineLoading = false;
        if (state.currentPrescription && 
            state.currentPrescription.id === action.payload.prescriptionId) {
          state.currentPrescription.medicines = state.currentPrescription.medicines.filter(
            medicine => medicine.id !== action.payload.medicineId
          );
        }
        state.success = true;
      })
      .addCase(removeMedicine.rejected, (state, action) => {
        state.medicineLoading = false;
        state.error = action.payload;
        state.success = false;
      })
      
      // Filter Medicine Suggestions
      .addCase(filterMedicineSuggestions.pending, (state) => {
        state.medicineLoading = true;
        state.error = null;
      })
      .addCase(filterMedicineSuggestions.fulfilled, (state, action) => {
        state.medicineLoading = false;
        state.medicineSuggestions = action.payload;
      })
      .addCase(filterMedicineSuggestions.rejected, (state, action) => {
        state.medicineLoading = false;
        state.error = action.payload;
      })
      
      // Add Medicine to Prescription
      .addCase(addMedicineToPrescription.pending, (state) => {
        state.medicineLoading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(addMedicineToPrescription.fulfilled, (state, action) => {
        state.medicineLoading = false;
        if (state.currentPrescription) {
          state.currentPrescription.medicines.push(action.payload);
        }
        state.success = true;
      })
      .addCase(addMedicineToPrescription.rejected, (state, action) => {
        state.medicineLoading = false;
        state.error = action.payload;
        state.success = false;
      });
  },
});

export const {
  clearCurrentPrescription,
  clearMedicineSuggestions,
  resetPrescriptionState,
  resetSuccessState,
} = prescriptionSlice.actions;

export default prescriptionSlice.reducer;
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  pharmacy: {
    status: 'completed',
    currentStep: 'dispensed',
    estimatedTime: '15 minutes',
    pharmacist: 'Dr. Sarah Johnson',
    notes: 'Medicines dispensed successfully'
  },
  nurse: {
    status: 'pending',
    currentStep: 'awaiting',
    estimatedTime: '30 minutes',
    nurseName: 'Nurse Emily Davis',
    notes: 'Awaiting administration'
  },
  injection: {
    required: true,
    status: 'pending',
    type: 'Dexamethasone 4mg IM',
    administeredBy: null,
    administeredAt: null
  }
};

const treatmentStatusSlice = createSlice({
  name: 'treatmentStatus',
  initialState,
  reducers: {
    updatePharmacyStatus: (state, action) => {
      state.pharmacy = { ...state.pharmacy, ...action.payload };
    },
    updateNurseStatus: (state, action) => {
      state.nurse = { ...state.nurse, ...action.payload };
    },
    updateInjectionStatus: (state, action) => {
      state.injection = { ...state.injection, ...action.payload };
    },
    administerInjection: (state) => {
      state.injection.status = 'administered';
      state.injection.administeredBy = state.nurse.nurseName;
      state.injection.administeredAt = new Date().toISOString();
    },
    completeTreatment: (state) => {
      state.nurse.status = 'completed';
      state.nurse.currentStep = 'administered';
      state.nurse.notes = 'Treatment completed successfully';
    }
  }
});

export const { 
  updatePharmacyStatus, 
  updateNurseStatus, 
  updateInjectionStatus,
  administerInjection,
  completeTreatment 
} = treatmentStatusSlice.actions;
export default treatmentStatusSlice.reducer;
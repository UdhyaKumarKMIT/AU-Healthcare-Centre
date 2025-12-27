// src/store/slices/diagnosisSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  diagnoses: {
    'visit-001': {
      diagnosisName: 'Upper Respiratory Tract Infection',
      diagnosisNotes: 'Patient presented with fever and dry cough. Symptoms for 3 days.',
      doctorId: 'doc-001',
      createdAt: new Date().toISOString(),
    },
    'visit-003': {
      diagnosisName: 'Acute Chest Pain - Investigation',
      diagnosisNotes: 'Requires ECG and chest X-ray for further evaluation.',
      doctorId: 'doc-001',
      createdAt: new Date().toISOString(),
    }
  },
};

const diagnosisSlice = createSlice({
  name: 'diagnosis',
  initialState,
  reducers: {
    saveDiagnosis: (state, action) => {
      const { visitId, diagnosis } = action.payload;
      state.diagnoses[visitId] = {
        ...diagnosis,
        createdAt: new Date().toISOString(),
      };
    },
    updateDiagnosis: (state, action) => {
      const { visitId, updates } = action.payload;
      if (state.diagnoses[visitId]) {
        state.diagnoses[visitId] = {
          ...state.diagnoses[visitId],
          ...updates,
          updatedAt: new Date().toISOString(),
        };
      }
    },
  },
});

export const { saveDiagnosis, updateDiagnosis } = diagnosisSlice.actions;
export default diagnosisSlice.reducer;
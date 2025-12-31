// src/store/slices/diagnosisSlice.js
import { createSlice } from '@reduxjs/toolkit';

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
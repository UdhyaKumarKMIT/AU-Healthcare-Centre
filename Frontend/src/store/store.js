// src/store/store.js
import { configureStore } from '@reduxjs/toolkit';
import queueReducer from './slices/queueSlice';
import diagnosisReducer from './slices/diagnosisSlice';
import prescriptionReducer from './slices/prescriptionSlice';
import doctorsReducer from './slices/doctorsSlice';
import patientsReducer from './slices/patientsSlice';
import visitsReducer from './slices/visitsSlice';
import vitalsReducer from './slices/vitalsSlice';
import adminReducer from './slices/adminSlice';
import studentsReducer from './slices/studentsSlice';
import labtechReducer from './slices/labTechSlice';
export const store = configureStore({
  reducer: {
    queue: queueReducer,
    diagnosis: diagnosisReducer,
    prescription: prescriptionReducer,
    doctors: doctorsReducer,
    patients: patientsReducer,
    visits: visitsReducer,
    vitals: vitalsReducer,
    admin: adminReducer,
    students: studentsReducer,
    labTech: labtechReducer
  },
});
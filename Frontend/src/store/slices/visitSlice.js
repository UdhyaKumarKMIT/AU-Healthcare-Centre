import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const fetchVisitDetails = createAsyncThunk(
  'visit/fetchVisitDetails',
  async (visitId) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      consultation: {
        doctorName: 'Dr. John Smith',
        specialization: 'Cardiologist',
        consultationTime: new Date().toISOString(),
        diagnosis: 'Upper Respiratory Tract Infection with mild fever',
        notes: 'Patient presented with dry cough and temperature of 100.2°F. Recommended rest and proper hydration.',
        recommendations: [
          'Complete the prescribed antibiotic course',
          'Maintain adequate hydration',
          'Follow up if symptoms worsen',
          'Get adequate rest'
        ]
      },
      prescription: {
        id: 'PRES202401201',
        status: 'issued',
        injectionRequired: true,
        medicines: [
          {
            name: 'Azithromycin',
            type: 'Antibiotic',
            dosage: '500mg',
            frequency: 'Once daily',
            timing: 'After food',
            duration: '5 days'
          },
          {
            name: 'Paracetamol',
            type: 'Analgesic',
            dosage: '500mg',
            frequency: 'Every 6 hours',
            timing: 'As needed for fever',
            duration: '3 days'
          }
        ],
        instructions: 'Complete the full course of antibiotics. Paracetamol to be taken only if fever exceeds 100°F.',
        prescribedBy: 'Dr. John Smith',
        date: new Date().toISOString()
      },
      treatment: {
        pharmacyStatus: 'completed',
        nurseStatus: 'pending',
        pharmacist: 'Dr. Sarah Johnson',
        nurseName: 'Nurse Emily Davis',
        pharmacyTimestamps: {
          started: new Date(Date.now() - 3600000).toISOString(),
          completed: new Date().toISOString()
        },
        injectionRequired: true,
        injectionDetails: 'Dexamethasone 4mg IM single dose'
      },
      referral: {
        specialistName: 'Dr. Michael Brown',
        specialization: 'Pulmonology',
        reason: 'Persistent cough requiring specialized evaluation',
        notes: 'Patient may require chest X-ray and pulmonary function tests for comprehensive evaluation.',
        urgency: 'medium',
        recommendedTimeline: '2 weeks',
        requiredTests: ['Chest X-ray', 'Complete Blood Count', 'Sputum Culture'],
        referralDate: new Date().toISOString()
      }
    };
  }
);

const initialState = {
  visitDetails: null,
  isLoading: false,
  error: null
};

const visitSlice = createSlice({
  name: 'visit',
  initialState,
  reducers: {
    updateConsultation: (state, action) => {
      if (state.visitDetails) {
        state.visitDetails.consultation = { 
          ...state.visitDetails.consultation, 
          ...action.payload 
        };
      }
    },
    updatePrescription: (state, action) => {
      if (state.visitDetails) {
        state.visitDetails.prescription = { 
          ...state.visitDetails.prescription, 
          ...action.payload 
        };
      }
    },
    updateTreatmentStatus: (state, action) => {
      if (state.visitDetails) {
        state.visitDetails.treatment = { 
          ...state.visitDetails.treatment, 
          ...action.payload 
        };
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchVisitDetails.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchVisitDetails.fulfilled, (state, action) => {
        state.isLoading = false;
        state.visitDetails = action.payload;
      })
      .addCase(fetchVisitDetails.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      });
  }
});

export const { updateConsultation, updatePrescription, updateTreatmentStatus } = visitSlice.actions;
export default visitSlice.reducer;
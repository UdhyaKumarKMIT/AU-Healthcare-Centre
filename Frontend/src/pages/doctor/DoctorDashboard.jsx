// src/pages/doctor/DoctorDashboard.jsx - Redux-Connected Version

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useAuth } from '../../contexts/AuthContext';
import { fetchPatientQueue } from '../../store/slices/queueSlice';
import { updateVisitStatus } from '../../store/slices/doctorsSlice';
import PatientQueue from '../../components/doctor/PatientQueue';
import DiagnosisSummary from '../../components/doctor/DiagnosisSummary';
import MedicineRow from '../../components/doctor/MedicineRow';
import Header from '../../components/Header/Header';
import styles from './DoctorDashboard.module.css';

const API_BASE = 'http://localhost:5000';

const DoctorDashboard = () => {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const token = localStorage.getItem('token');
  const doctorId = user?.user_id || user?.doctor_id;

  // 🔥 USE REDUX STATE INSTEAD OF LOCAL STATE
  const { patients, loading, error, lastFetched } = useSelector(state => state.queue);
  const { updateLoading } = useSelector(state => state.doctors || {});
  
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [diagnosis, setDiagnosis] = useState(null);
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [medicines, setMedicines] = useState([{
    name: '', type: '', whenToTake: 'After Food',
    timing: { morning: false, afternoon: false, night: false }, duration: 1
  }]);
  const [medicineSearchResults, setMedicineSearchResults] = useState([]);
  const [activeMedicineIndex, setActiveMedicineIndex] = useState(null);

  // 🔥 LOAD PATIENTS FROM REDUX ON MOUNT
  useEffect(() => {
    if (doctorId) {
      console.log('📡 Loading queue for doctor:', doctorId);
      dispatch(fetchPatientQueue(doctorId));
      
      // Optional: Auto-refresh every 30 seconds
      const interval = setInterval(() => {
        dispatch(fetchPatientQueue(doctorId));
      }, 30000);
      
      return () => clearInterval(interval);
    } else {
      console.error('No doctor_id found. Please login again.');
    }
  }, [dispatch, doctorId]);

  // 🔥 SYNC SELECTED PATIENT WITH REDUX STATE
  useEffect(() => {
    if (selectedPatient) {
      const updatedPatient = patients.find(p => p.visitId === selectedPatient.visitId);
      if (updatedPatient && updatedPatient.status !== selectedPatient.status) {
        console.log('🔄 Syncing selected patient with updated status:', updatedPatient.status);
        setSelectedPatient(updatedPatient);
      }
    }
  }, [patients, selectedPatient]);

  const handleStatusUpdate = async (visitId, newStatus) => {
    try {
      await dispatch(updateVisitStatus({ visitId, status: newStatus })).unwrap();
      console.log(`✅ Status updated to ${newStatus}`);
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('Failed to update visit status');
    }
  };

  const handlePatientSelect = async (patient) => {
    console.log('👤 Patient selected:', patient.patientName, 'Status:', patient.status);
    setSelectedPatient(patient);
    
    // Auto-update status to IN_PROGRESS if SCHEDULED
    if (patient.status === 'SCHEDULED') {
      await handleStatusUpdate(patient.visitId, 'IN_PROGRESS');
    }
  };

  const saveDiagnosis = async (diagnosisData) => {
    try {
      const response = await fetch(`${API_BASE}/api/doctor/diagnosis`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`, 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({
          visit_id: selectedPatient.visitId,
          doctor_id: doctorId,
          diagnosis_code: diagnosisData.diagnosis_code || null,
          diagnosis_name: diagnosisData.diagnosis_name,
          diagnosis_notes: diagnosisData.diagnosis_notes || null
        })
      });
      
      if (!response.ok) throw new Error('Failed to save diagnosis');
      
      const result = await response.json();
      console.log('✅ Diagnosis saved:', result);
      
      setDiagnosis({
        diagnosisName: diagnosisData.diagnosis_name,
        diagnosisNotes: diagnosisData.diagnosis_notes,
        diagnosisCode: diagnosisData.diagnosis_code,
        createdAt: new Date().toISOString()
      });
      
      // Update status to DIAGNOSED
      await handleStatusUpdate(selectedPatient.visitId, 'DIAGNOSED');
      
      alert('Diagnosis saved successfully!');
    } catch (error) {
      console.error('Error saving diagnosis:', error);
      alert('Failed to save diagnosis: ' + error.message);
    }
  };

  const savePrescription = async () => {
    try {
      const hasEmptyMedicine = medicines.some(m => !m.name || !m.duration);
      const hasNoTiming = medicines.some(m => !m.timing.morning && !m.timing.afternoon && !m.timing.night);
      
      if (hasEmptyMedicine || hasNoTiming) {
        alert('Please fill all medicine fields and select at least one timing');
        return;
      }

      const transformed = medicines.map(m => ({
        name: m.name,
        type: m.type || null,
        days: Number(m.duration),
        food: m.whenToTake === 'Before Food' ? 'BEFORE' : 
              m.whenToTake === 'With Food' ? 'WITH' : 'AFTER',
        morning: m.timing.morning,
        afternoon: m.timing.afternoon,
        night: m.timing.night
      }));

      const prescriptionResponse = await fetch(`${API_BASE}/api/doctor/prescription`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`, 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({
          visit_id: selectedPatient.visitId,
          doctor_id: doctorId,
          medicines: transformed
        })
      });

      if (!prescriptionResponse.ok) throw new Error('Failed to save prescription');

      const result = await prescriptionResponse.json();
      console.log('✅ Prescription saved:', result);

      // Update status to COMPLETED
      await handleStatusUpdate(selectedPatient.visitId, 'COMPLETED');

      alert('Visit completed successfully!');
      
      // Reset state
      setShowPrescriptionModal(false);
      setSelectedPatient(null);
      setDiagnosis(null);
      setMedicines([{
        name: '', type: '', whenToTake: 'After Food',
        timing: { morning: false, afternoon: false, night: false }, duration: 1
      }]);
      
      // Reload queue
      dispatch(fetchPatientQueue(doctorId));
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to save prescription: ' + error.message);
    }
  };

  const handleMedicineSearch = (query) => {
    if (!query || query.length < 2) {
      setMedicineSearchResults([]);
      return;
    }

    const mockMedicines = [
      { id: 1, name: 'Paracetamol 500mg', type: 'Tablet' },
      { id: 2, name: 'Ibuprofen 400mg', type: 'Tablet' },
      { id: 3, name: 'Amoxicillin 500mg', type: 'Capsule' },
      { id: 4, name: 'Cetirizine 10mg', type: 'Tablet' },
      { id: 5, name: 'Azithromycin 500mg', type: 'Tablet' },
      { id: 6, name: 'Paracetamol 650mg', type: 'Tablet' },
      { id: 7, name: 'Pantoprazole 40mg', type: 'Tablet' },
      { id: 8, name: 'Omeprazole 20mg', type: 'Capsule' },
    ];

    const filtered = mockMedicines.filter(m =>
      m.name.toLowerCase().includes(query.toLowerCase())
    );
    setMedicineSearchResults(filtered);
  };

  const handleSelectMedicine = (index, medicine) => {
    const newMeds = [...medicines];
    newMeds[index] = { ...newMeds[index], name: medicine.name, type: medicine.type };
    setMedicines(newMeds);
    setMedicineSearchResults([]);
  };

  const waitingCount = patients.filter(p => p.status === 'SCHEDULED').length;
  const inProgressCount = patients.filter(p => p.status === 'IN_PROGRESS').length;

  if (loading && patients.length === 0) {
    return (
      <div className={styles.dashboard}>
        <Header />
        <main className={styles.mainContent}>
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <p>Loading patient queue...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.dashboard}>
        <Header />
        <main className={styles.mainContent}>
          <div style={{ textAlign: 'center', padding: '50px', color: 'red' }}>
            <p>Error loading patients: {error}</p>
            <button onClick={() => dispatch(fetchPatientQueue(doctorId))}>
              Retry
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className={styles.dashboard}>
      <Header />
      
      <main className={styles.mainContent}>
        <div className={styles.container}>
          <div className={styles.header}>
            <div className={styles.doctorInfo}>
              <h1 className={styles.doctorName}>Dr. {user.name || user.email}</h1>
              <p className={styles.specialization}>Doctor Dashboard</p>
              {lastFetched && (
                <p style={{ fontSize: '12px', color: '#64748b' }}>
                  Last updated: {new Date(lastFetched).toLocaleTimeString()}
                </p>
              )}
            </div>
            <div className={styles.stats}>
              <div className={styles.statItem}>
                <strong>{patients.length}</strong> Total Visits
              </div>
              <div className={styles.statItem}>
                <strong>{waitingCount}</strong> Waiting
              </div>
              <div className={styles.statItem}>
                <strong>{inProgressCount}</strong> In Progress
              </div>
            </div>
          </div>

          {updateLoading && (
            <div style={{
              position: 'fixed',
              bottom: '20px',
              right: '20px',
              background: '#3b82f6',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              zIndex: 1000
            }}>
              Updating visit status...
            </div>
          )}

          <div className={styles.content}>
            <div className={styles.queueSection}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Patient Queue</h2>
                <span className={styles.queueCount}>{patients.length} patients</span>
              </div>
              <PatientQueue
                patients={patients}
                loading={loading}
                onPatientSelect={handlePatientSelect}
                onPatientClick={(id) => {
                  const patient = patients.find(p => p.visitId === id);
                  if (patient) handlePatientSelect(patient);
                }}
                selectedPatient={selectedPatient}
                onStatusUpdate={handleStatusUpdate}
              />
            </div>

            <div className={styles.diagnosisSection}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Diagnosis & Treatment</h2>
              </div>

              {selectedPatient && !diagnosis && (
                <div style={{ padding: '24px', borderBottom: '1px solid #e2e8f0' }}>
                  <div style={{ 
                    background: '#f0f9ff', 
                    padding: '12px', 
                    borderRadius: '8px', 
                    marginBottom: '16px',
                    border: '1px solid #bae6fd'
                  }}>
                    <p style={{ fontSize: '14px', color: '#0c4a6e', margin: 0 }}>
                      <strong>Patient:</strong> {selectedPatient.patientName} | 
                      <strong> Status:</strong> <span style={{ 
                        background: '#3b82f6', 
                        color: 'white', 
                        padding: '2px 8px', 
                        borderRadius: '4px',
                        fontSize: '12px',
                        marginLeft: '4px'
                      }}>{selectedPatient.status}</span>
                    </p>
                  </div>
                  
                  <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#1a237e', marginBottom: '16px' }}>
                    Add Diagnosis
                  </h3>
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '6px' }}>
                      Diagnosis Name *
                    </label>
                    <input
                      id="diagnosis_name"
                      type="text"
                      placeholder="e.g., Common Cold, Fever"
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '2px solid #e2e8f0',
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                    />
                  </div>
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '6px' }}>
                      Diagnosis Code
                    </label>
                    <input
                      id="diagnosis_code"
                      type="text"
                      placeholder="e.g., J00, R50.9"
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '2px solid #e2e8f0',
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                    />
                  </div>
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '6px' }}>
                      Diagnosis Notes
                    </label>
                    <textarea
                      id="diagnosis_notes"
                      placeholder="Additional notes..."
                      rows="4"
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '2px solid #e2e8f0',
                        borderRadius: '6px',
                        fontSize: '14px',
                        resize: 'vertical',
                        fontFamily: 'inherit'
                      }}
                    />
                  </div>
                  <button
                    onClick={() => {
                      const diagnosisData = {
                        diagnosis_name: document.getElementById('diagnosis_name').value,
                        diagnosis_code: document.getElementById('diagnosis_code').value,
                        diagnosis_notes: document.getElementById('diagnosis_notes').value
                      };
                      if (diagnosisData.diagnosis_name) {
                        saveDiagnosis(diagnosisData);
                      } else {
                        alert('Please enter diagnosis name');
                      }
                    }}
                    disabled={updateLoading}
                    style={{
                      padding: '12px 24px',
                      background: updateLoading ? '#cbd5e1' : 'linear-gradient(135deg, #1a237e 0%, #3949ab 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: 600,
                      cursor: updateLoading ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {updateLoading ? 'Saving...' : 'Save Diagnosis'}
                  </button>
                </div>
              )}

              <DiagnosisSummary
                patient={selectedPatient}
                diagnosis={diagnosis}
                onProceedToPrescription={() => setShowPrescriptionModal(true)}
              />
            </div>
          </div>
        </div>
      </main>

      {showPrescriptionModal && (
        <div style={{ 
          position: 'fixed', 
          inset: 0, 
          background: 'rgba(0,0,0,0.5)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{ 
            background: 'white', 
            padding: '32px', 
            borderRadius: '12px', 
            width: '90%', 
            maxWidth: '1200px',
            maxHeight: '90vh', 
            overflow: 'auto' 
          }}>
            <h2 style={{ marginBottom: '24px', color: '#1a237e' }}>
              Create Prescription for {selectedPatient.patientName}
            </h2>
            
            {medicines.map((med, i) => (
              <MedicineRow
                key={i}
                index={i + 1}
                medicine={med}
                suggestions={activeMedicineIndex === i ? medicineSearchResults : []}
                showSuggestions={activeMedicineIndex === i}
                onChange={(updates) => {
                  const newMeds = [...medicines];
                  newMeds[i] = { ...newMeds[i], ...updates };
                  setMedicines(newMeds);
                }}
                onSearch={handleMedicineSearch}
                onSelectMedicine={(medicine) => handleSelectMedicine(i, medicine)}
                onRemove={() => {
                  if (medicines.length > 1) {
                    setMedicines(medicines.filter((_, idx) => idx !== i));
                  } else {
                    alert('At least one medicine is required');
                  }
                }}
                onFocus={() => setActiveMedicineIndex(i)}
                onBlur={() => setTimeout(() => setActiveMedicineIndex(null), 200)}
              />
            ))}
            
            <button 
              onClick={() => setMedicines([...medicines, {
                name: '', type: '', whenToTake: 'After Food',
                timing: { morning: false, afternoon: false, night: false }, duration: 1
              }])}
              style={{
                width: '100%',
                padding: '12px',
                background: '#f8fafc',
                border: '2px dashed #cbd5e1',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                marginBottom: '16px',
                color: '#1a237e'
              }}
            >
              + Add Medicine
            </button>
            
            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button 
                onClick={savePrescription}
                disabled={updateLoading}
                style={{
                  flex: 1,
                  padding: '14px',
                  background: updateLoading ? '#cbd5e1' : 'linear-gradient(135deg, #1a237e 0%, #3949ab 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: 600,
                  cursor: updateLoading ? 'not-allowed' : 'pointer'
                }}
              >
                {updateLoading ? 'Saving...' : 'Save Prescription & Complete Visit'}
              </button>
              <button 
                onClick={() => setShowPrescriptionModal(false)}
                style={{
                  flex: 1,
                  padding: '14px',
                  background: '#f1f5f9',
                  color: '#64748b',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorDashboard;
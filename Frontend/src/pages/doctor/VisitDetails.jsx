// src/pages/doctor/VisitDetails.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useAuth } from '../../contexts/AuthContext';
import { updateVisitStatus } from '../../store/slices/doctorsSlice';
import Header from '../../components/Header/Header';
import { saveDiagnosis } from '../../store/slices/diagnosisSlice';
import styles from './VisitDetails.module.css';

const VisitDetails = () => {
  const { visitId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useAuth();
  
  const queueState = useSelector((state) => state.queue || {});
  const diagnosisState = useSelector((state) => state.diagnosis || {});
  const { updateLoading } = useSelector(state => state.doctors || {});
  
  const { patients = [] } = queueState;
  const { diagnoses = {} } = diagnosisState;
  
  const [diagnosisForm, setDiagnosisForm] = useState({
    diagnosisName: '',
    diagnosisNotes: '',
  });
  const [isSaving, setIsSaving] = useState(false);

  const patient = patients.find(p => p.visitId === visitId);
  const existingDiagnosis = diagnoses[visitId];

useEffect(() => {
  if (!patient) {
    navigate('/doctor/dashboard');
    return;
  }

  // Update status to IN_PROGRESS when visit details page loads
  if (patient.status === 'SCHEDULED') {
    handleStatusUpdate('IN_PROGRESS'); // Changed from 'ONGOING'
  }

  if (existingDiagnosis) {
    setDiagnosisForm({
      diagnosisName: existingDiagnosis.diagnosisName,
      diagnosisNotes: existingDiagnosis.diagnosisNotes,
    });
  }
}, [visitId, patient?.status, existingDiagnosis]);

  const handleStatusUpdate = async (newStatus) => {
    try {
      await dispatch(updateVisitStatus({ visitId, status: newStatus })).unwrap();
      console.log(`✅ Visit status updated to ${newStatus}`);
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setDiagnosisForm(prev => ({
      ...prev,
      [name]: value,
    }));
  };

const handleSaveDiagnosis = async () => {
  if (!diagnosisForm.diagnosisName.trim()) {
    alert('Please enter a diagnosis name');
    return;
  }

  setIsSaving(true);
  
  try {
    // 1. Save diagnosis first
    await dispatch(saveDiagnosis({
      visitId,
      diagnosis: {
        ...diagnosisForm,
        doctorId: user.user_id,
      },
    })).unwrap();

    console.log('✅ Diagnosis saved, now updating status...');

    // 2. Then update status to DIAGNOSED
    await dispatch(updateVisitStatus({ visitId, status: 'DIAGNOSED' })).unwrap();
    
    console.log('✅ Status updated to DIAGNOSED');
    
    setIsSaving(false);
    alert('Diagnosis saved successfully!');
  } catch (error) {
    console.error('❌ Error in handleSaveDiagnosis:', error);
    setIsSaving(false);
    alert(`Failed to save diagnosis: ${error.message || 'Unknown error'}`);
  }
};

  const handleProceedToPrescription = () => {
    if (!existingDiagnosis && !diagnosisForm.diagnosisName.trim()) {
      alert('Please save diagnosis first');
      return;
    }
    
    if (!existingDiagnosis) {
      handleSaveDiagnosis();
    }
    
    navigate(`/doctor/prescription/${visitId}`);
  };

  if (!patient) {
    return null;
  }

  return (
    <div className={styles.dashboard}>
      <Header />
      
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
      
      <main className={styles.mainContent}>
        <header className={styles.header}>
          <button className={styles.backBtn} onClick={() => navigate('/doctor/dashboard')}>
            ← Back to Dashboard
          </button>
          <h1 className={styles.title}>Visit Details</h1>
          <div className={styles.visitInfo}>
            <span className={styles.visitId}>Visit ID: {visitId}</span>
            <span className={styles.token}>Token: {patient.token}</span>
          </div>
        </header>

        <div className={styles.content}>
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Patient Information</h2>
            <div className={styles.patientGrid}>
              <div className={styles.infoItem}>
                <label className={styles.infoLabel}>Full Name</label>
                <div className={styles.infoValue}>{patient.patientName}</div>
              </div>
              <div className={styles.infoItem}>
                <label className={styles.infoLabel}>Age</label>
                <div className={styles.infoValue}>{patient.age} years</div>
              </div>
              <div className={styles.infoItem}>
                <label className={styles.infoLabel}>Gender</label>
                <div className={styles.infoValue}>{patient.gender}</div>
              </div>
              <div className={styles.infoItem}>
                <label className={styles.infoLabel}>Blood Group</label>
                <div className={styles.infoValue}>{patient.bloodGroup}</div>
              </div>
              <div className={styles.infoItem}>
                <label className={styles.infoLabel}>Visit Type</label>
                <div className={styles.infoValue}>{patient.visitType}</div>
              </div>
              <div className={styles.infoItem}>
                <label className={styles.infoLabel}>Status</label>
                <div className={styles.statusBadge}>
                  {patient.status}
                </div>
              </div>
            </div>
          </div>

          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Diagnosis</h2>
            
            <div className={styles.formGroup}>
              <label htmlFor="diagnosisName" className={styles.formLabel}>
                Diagnosis Name *
              </label>
              <input
                type="text"
                id="diagnosisName"
                name="diagnosisName"
                value={diagnosisForm.diagnosisName}
                onChange={handleInputChange}
                className={styles.formInput}
                placeholder="e.g., Upper Respiratory Tract Infection"
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="diagnosisNotes" className={styles.formLabel}>
                Diagnosis Notes
              </label>
              <textarea
                id="diagnosisNotes"
                name="diagnosisNotes"
                value={diagnosisForm.diagnosisNotes}
                onChange={handleInputChange}
                className={styles.formTextarea}
                placeholder="Enter detailed diagnosis notes, observations, and recommendations..."
                rows={6}
              />
            </div>

            <div className={styles.formActions}>
              <button
                className={styles.saveBtn}
                onClick={handleSaveDiagnosis}
                disabled={isSaving || updateLoading}
              >
                {isSaving ? 'Saving...' : 'Save Diagnosis'}
              </button>
              
              {existingDiagnosis && (
                <div className={styles.savedInfo}>
                  <span className={styles.savedText}>
                    Diagnosis saved on {new Date(existingDiagnosis.createdAt).toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className={styles.actionCard}>
            <div className={styles.actionContent}>
              <h3 className={styles.actionTitle}>Ready for Prescription?</h3>
              <p className={styles.actionText}>
                Once diagnosis is saved, you can proceed to prescribe medication.
              </p>
              
              <button
                className={styles.prescriptionBtn}
                onClick={handleProceedToPrescription}
                disabled={!diagnosisForm.diagnosisName.trim() && !existingDiagnosis}
              >
                Open Prescription Form
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default VisitDetails;
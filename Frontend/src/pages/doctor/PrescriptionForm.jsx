// src/pages/doctor/PrescriptionForm.jsx - Updated
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useAuth } from '../../contexts/AuthContext';
import { updateVisitStatus } from '../../store/slices/doctorsSlice';
import { toast } from 'react-toastify';
import Header from '../../components/Header/Header';
import {
  savePrescription,
  submitPrescription,
  addMedicineToPrescription,
  removeMedicine,
  updateMedicine,
  filterMedicineSuggestions,
} from '../../store/slices/prescriptionSlice';
import MedicineRow from '../../components/doctor/MedicineRow';
import styles from './PrescriptionForm.module.css';

const PrescriptionForm = () => {
  const { visitId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useAuth();
  
  const queueState = useSelector((state) => state.queue || {});
  const diagnosisState = useSelector((state) => state.diagnosis || {});
  const prescriptionState = useSelector((state) => state.prescription || {});
  const { updateLoading } = useSelector(state => state.doctors || {});
  
  const { patients = [] } = queueState;
  const { diagnoses = {} } = diagnosisState;
  const { prescriptions = {}, medicineSuggestions = [], saving, submitting } = prescriptionState;
  
  const [formData, setFormData] = useState({
    totalDays: 7,
    injectionRequired: 'no',
    injectionName: '',
    notes: '',
  });
  
  const [medicines, setMedicines] = useState([]);
  const [nextMedicineId, setNextMedicineId] = useState(1);
  const [showSuggestions, setShowSuggestions] = useState({});

  const patient = patients.find(p => p.visitId === visitId) || 
                 patients.find(p => p.id === visitId) ||
                 patients.find(p => p.visit_id === visitId);
  
  const diagnosis = diagnoses[visitId] || 
                   Object.values(diagnoses).find(d => d.visitId === visitId);
  
  const existingPrescription = prescriptions[visitId] || 
                              Object.values(prescriptions).find(p => p.visitId === visitId);

  useEffect(() => {
    if (!patient || !diagnosis) {
      console.log('Missing data:', { patient, diagnosis, patients, diagnoses });
      navigate('/doctor/dashboard');
      return;
    }

    if (existingPrescription) {
      setFormData({
        totalDays: existingPrescription.totalDays || 7,
        injectionRequired: existingPrescription.injectionRequired ? 'yes' : 'no',
        injectionName: existingPrescription.injectionName || '',
        notes: existingPrescription.notes || '',
      });
      setMedicines(existingPrescription.medicines || []);
    } else {
      addNewMedicine();
    }
  }, [visitId, patient, diagnosis, existingPrescription, navigate]);

  const handleStatusUpdate = async (newStatus) => {
    try {
      await dispatch(updateVisitStatus({ visitId, status: newStatus })).unwrap();
      console.log(`✅ Visit status updated to ${newStatus}`);
    } catch (error) {
      console.error('Failed to update status:', error);
      toast.error('Failed to update visit status');
    }
  };

  const addNewMedicine = () => {
    const newMedicine = {
      id: `med-new-${nextMedicineId}`,
      name: '',
      type: '',
      whenToTake: 'After Food',
      timing: { morning: true, afternoon: false, night: true },
      duration: 7,
    };
    setMedicines([...medicines, newMedicine]);
    setNextMedicineId(nextMedicineId + 1);
  };

  const handleMedicineChange = (id, updates) => {
    setMedicines(prev =>
      prev.map(med => (med.id === id ? { ...med, ...updates } : med))
    );
    
    if (existingPrescription && existingPrescription.id && !id.startsWith('med-new-')) {
      dispatch(updateMedicine({ 
        prescriptionId: existingPrescription.id, 
        medicineId: id, 
        medicineData: updates 
      }));
    }
  };

  const handleRemoveMedicine = (id) => {
    setMedicines(prev => prev.filter(med => med.id !== id));
    
    if (existingPrescription && existingPrescription.id && !id.startsWith('med-new-')) {
      dispatch(removeMedicine({ 
        prescriptionId: existingPrescription.id, 
        medicineId: id 
      }));
    }
  };

  const handleSearchMedicine = (id, query) => {
    if (query && query.trim().length > 1) {
      dispatch(filterMedicineSuggestions(query));
      setShowSuggestions(prev => ({ ...prev, [id]: true }));
    } else {
      setShowSuggestions(prev => ({ ...prev, [id]: false }));
    }
  };

  const handleSelectMedicine = (id, medicine) => {
    handleMedicineChange(id, {
      name: medicine.name,
      type: medicine.type,
    });
    setShowSuggestions(prev => ({ ...prev, [id]: false }));
  };

  const handleSavePrescription = async () => {
    if (!validatePrescription()) return;

    const prescriptionData = {
      ...formData,
      visitId,
      patientId: patient?.patientId || patient?.id,
      patientName: patient?.patientName || patient?.name,
      medicines,
      doctorId: user?.user_id,
      doctorName: user?.name,
      injectionRequired: formData.injectionRequired === 'yes',
      status: 'draft',
    };

    try {
      await dispatch(savePrescription(prescriptionData)).unwrap();
      
      // Update status to PRESCRIBED after saving prescription
      await handleStatusUpdate('PRESCRIBED');
      
      toast.success('Prescription saved successfully!');
    } catch (error) {
      toast.error(`Failed to save prescription: ${error.message}`);
    }
  };

  const handleSubmitPrescription = async () => {
    if (!validatePrescription()) return;

    if (!existingPrescription) {
      await handleSavePrescription();
      return;
    }

    const prescriptionData = {
      ...formData,
      visitId,
      patientId: patient?.patientId || patient?.id,
      patientName: patient?.patientName || patient?.name,
      medicines,
      doctorId: user?.user_id,
      doctorName: user?.name,
      injectionRequired: formData.injectionRequired === 'yes',
      status: 'submitted',
    };

    try {
      await dispatch(submitPrescription({ 
        prescriptionId: existingPrescription?.id, 
        prescriptionData 
      })).unwrap();
      
      // Update status to PHARMACY when submitted to pharmacy
      await handleStatusUpdate('PHARMACY');
      
      toast.success('Prescription submitted to pharmacy!');
      navigate('/doctor/dashboard');
    } catch (error) {
      toast.error(`Failed to submit prescription: ${error.message}`);
    }
  };

  const validatePrescription = () => {
    if (medicines.length === 0) {
      toast.error('Please add at least one medicine');
      return false;
    }

    for (const med of medicines) {
      if (!med.name.trim() || !med.type) {
        alert('Please complete all medicine details');
        return false;
      }
      if (med.duration <= 0) {
        alert('Duration must be greater than 0');
        return false;
      }
    }

    if (formData.injectionRequired === 'yes' && !formData.injectionName.trim()) {
      alert('Please enter injection name');
      return false;
    }

    if (formData.totalDays <= 0) {
      alert('Total days must be greater than 0');
      return false;
    }

    return true;
  };

  if (!patient || !diagnosis) {
    return (
      <div className={styles.dashboard}>
        <Header />
        <main className={styles.mainContent}>
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <p>Loading patient information...</p>
            <button onClick={() => navigate('/doctor/dashboard')}>
              Back to Dashboard
            </button>
          </div>
        </main>
      </div>
    );
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
          <button className={styles.backBtn} onClick={() => navigate(-1)}>
            ← Back
          </button>
          <div className={styles.headerInfo}>
            <h1 className={styles.title}>Prescription</h1>
            <div className={styles.patientInfo}>
              <span className={styles.patientName}>
                {patient.patientName || patient.name}
              </span>
              <span className={styles.diagnosis}>
                {diagnosis.diagnosisName || diagnosis.name || 'Diagnosis not specified'}
              </span>
            </div>
          </div>
        </header>

        <div className={styles.content}>
          <div className={styles.section}>
            <label className={styles.sectionLabel}>Total Days of Treatment</label>
            <div className={styles.totalDaysInput}>
              <input
                type="number"
                min="1"
                max="365"
                value={formData.totalDays}
                onChange={(e) => setFormData({ ...formData, totalDays: parseInt(e.target.value) || 1 })}
                className={styles.daysInput}
                disabled={saving || submitting}
              />
              <span className={styles.daysLabel}>days</span>
            </div>
          </div>

          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Medicines</h2>
              <button 
                className={styles.addBtn} 
                onClick={addNewMedicine}
                disabled={saving || submitting}
              >
                + Add Medicine
              </button>
            </div>

            {medicines.length === 0 ? (
              <div className={styles.emptyState}>
                <p>No medicines added yet. Click "Add Medicine" to start.</p>
              </div>
            ) : (
              medicines.map((medicine, index) => (
                <MedicineRow
                  key={medicine.id || index}
                  index={index + 1}
                  medicine={medicine}
                  suggestions={medicineSuggestions || []}
                  showSuggestions={showSuggestions[medicine.id]}
                  onChange={(updates) => handleMedicineChange(medicine.id, updates)}
                  onSearch={(query) => handleSearchMedicine(medicine.id, query)}
                  onSelectMedicine={(selected) => handleSelectMedicine(medicine.id, selected)}
                  onRemove={() => handleRemoveMedicine(medicine.id)}
                  onFocus={() => setShowSuggestions(prev => ({ ...prev, [medicine.id]: true }))}
                  onBlur={() => setTimeout(() => setShowSuggestions(prev => ({ ...prev, [medicine.id]: false })), 200)}
                  disabled={saving || submitting}
                />
              ))
            )}
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Injection</h2>
            <div className={styles.injectionSection}>
              <div className={styles.radioGroup}>
                <label className={styles.radioLabel}>
                  <input
                    type="radio"
                    name="injectionRequired"
                    value="yes"
                    checked={formData.injectionRequired === 'yes'}
                    onChange={(e) => setFormData({ ...formData, injectionRequired: e.target.value })}
                    disabled={saving || submitting}
                  />
                  <span>Yes</span>
                </label>
                <label className={styles.radioLabel}>
                  <input
                    type="radio"
                    name="injectionRequired"
                    value="no"
                    checked={formData.injectionRequired === 'no'}
                    onChange={(e) => setFormData({ ...formData, injectionRequired: e.target.value })}
                    disabled={saving || submitting}
                  />
                  <span>No</span>
                </label>
              </div>

              {formData.injectionRequired === 'yes' && (
                <div className={styles.injectionInput}>
                  <label className={styles.inputLabel}>Injection Medicine Name</label>
                  <input
                    type="text"
                    value={formData.injectionName}
                    onChange={(e) => setFormData({ ...formData, injectionName: e.target.value })}
                    className={styles.textInput}
                    placeholder="Enter injection medicine name"
                    disabled={saving || submitting}
                  />
                </div>
              )}
            </div>
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Additional Notes</h2>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className={styles.notesTextarea}
              placeholder="Enter any additional instructions, precautions, or tips for the patient..."
              rows={4}
              disabled={saving || submitting}
            />
          </div>

          <div className={styles.actionButtons}>
            <button
              className={styles.saveBtn}
              onClick={handleSavePrescription}
              disabled={saving || submitting || updateLoading}
            >
              {saving ? 'Saving...' : 'Save Prescription'}
            </button>
            <button
              className={styles.submitBtn}
              onClick={handleSubmitPrescription}
              disabled={saving || submitting || updateLoading}
            >
              {submitting ? 'Submitting...' : 'Submit to Pharmacy'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PrescriptionForm;
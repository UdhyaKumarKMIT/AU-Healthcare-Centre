import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUser, 
  faUserMd, 
  faCalendarPlus, 
  faThermometerHalf, 
  faHeartbeat, 
  faTint,
  faAsterisk 
} from '@fortawesome/free-solid-svg-icons';
import { createVisit, clearCreateSuccess } from '../../store/slices/visitsSlice';
import styles from './CreateVisitForm.module.css';

const CreateVisitForm = ({ patients = [], availableDoctors = [] }) => {
  const dispatch = useDispatch();
  const { loading, error, createSuccess } = useSelector(state => state.visits);
  
  const [formData, setFormData] = useState({
    patientId: '',
    doctorId: '',
    visitType: 'OPD',
    reason: '',
    temperature: '',
    bpSystolic: '',
    bpDiastolic: '',
    heartRate: '',
  });
  
  const [errors, setErrors] = useState({});
  
  // Patient search states
  const [patientSearchQuery, setPatientSearchQuery] = useState('');
  const [showPatientDropdown, setShowPatientDropdown] = useState(false);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  useEffect(() => {
    if (createSuccess) {
      alert('Visit created successfully! Patient added to doctor queue.');
      setFormData({
        patientId: '',
        doctorId: '',
        visitType: 'OPD',
        reason: '',
        temperature: '',
        bpSystolic: '',
        bpDiastolic: '',
        heartRate: '',
      });
      setPatientSearchQuery('');
      setSelectedPatient(null);
      setShowPatientDropdown(false);
      dispatch(clearCreateSuccess());
    }
  }, [createSuccess, dispatch]);

  useEffect(() => {
    if (error) {
      alert('Error: ' + error);
    }
  }, [error]);

  // Filter patients based on search query
  useEffect(() => {
    // Don't show dropdown if patient is already selected
    if (selectedPatient) {
      setShowPatientDropdown(false);
      return;
    }

    if (patientSearchQuery.trim() === '') {
      setFilteredPatients([]);
      setShowPatientDropdown(false);
      setHighlightedIndex(-1);
      return;
    }

    const query = patientSearchQuery.toLowerCase();
    const filtered = patients.filter(patient => 
      patient.name.toLowerCase().includes(query) || 
      patient.rollNo.toLowerCase().includes(query)
    );
    
    setFilteredPatients(filtered);
    setShowPatientDropdown(true);
    setHighlightedIndex(-1);
  }, [patientSearchQuery, patients, selectedPatient]);

  const handlePatientSelect = (patient) => {
    setSelectedPatient(patient);
    setFormData(prev => ({
      ...prev,
      patientId: patient.id,
    }));
    setPatientSearchQuery(`${patient.name} (Roll: ${patient.rollNo})`);
    setShowPatientDropdown(false);
    
    if (errors.patientId) {
      setErrors(prev => ({
        ...prev,
        patientId: '',
      }));
    }
  };

  const handlePatientSearchChange = (e) => {
    const value = e.target.value;
    setPatientSearchQuery(value);
    
    // Clear selected patient if user is typing
    if (selectedPatient) {
      setSelectedPatient(null);
      setFormData(prev => ({
        ...prev,
        patientId: '',
      }));
    }
  };

  const handlePatientKeyDown = (e) => {
    if (!showPatientDropdown || filteredPatients.length === 0) return;

    const maxIndex = Math.min(filteredPatients.length - 1, 9); // Limit to 10 items

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < maxIndex ? prev + 1 : prev
        );
        break;
      
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev > 0 ? prev - 1 : 0
        );
        break;
      
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex <= maxIndex) {
          handlePatientSelect(filteredPatients[highlightedIndex]);
        }
        break;
      
      case 'Escape':
        e.preventDefault();
        setShowPatientDropdown(false);
        setHighlightedIndex(-1);
        break;
      
      default:
        break;
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.patientId) newErrors.patientId = 'Select a patient';
    if (!formData.doctorId) newErrors.doctorId = 'Select a doctor';
    if (!formData.reason.trim()) newErrors.reason = 'Reason is required';
    
    if (formData.temperature && (formData.temperature < 90 || formData.temperature > 110)) {
      newErrors.temperature = 'Temperature must be between 90°F and 110°F';
    }
    
    if (formData.bpSystolic && (formData.bpSystolic < 70 || formData.bpSystolic > 200)) {
      newErrors.bpSystolic = 'Systolic BP must be between 70-200 mmHg';
    }
    
    if (formData.bpDiastolic && (formData.bpDiastolic < 40 || formData.bpDiastolic > 130)) {
      newErrors.bpDiastolic = 'Diastolic BP must be between 40-130 mmHg';
    }
    
    if (formData.heartRate && (formData.heartRate < 40 || formData.heartRate > 200)) {
      newErrors.heartRate = 'Heart rate must be between 40-200 bpm';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    const patient = patients.find(p => p.id === formData.patientId);
    const doctor = availableDoctors.find(d => d.id === formData.doctorId);
    
    if (!patient || !doctor) {
      alert('Invalid patient or doctor selection');
      return;
    }
    
    const visitData = {
      patientId: formData.patientId,
      patientName: patient.name,
      doctorId: formData.doctorId,
      doctorName: doctor.name,
      visitType: formData.visitType,
      reason: formData.reason,
    };
    
    if (formData.temperature || formData.bpSystolic || formData.bpDiastolic || formData.heartRate) {
      visitData.vitals = {
        temperature: formData.temperature ? parseFloat(formData.temperature) : null,
        bpSystolic: formData.bpSystolic ? parseInt(formData.bpSystolic) : null,
        bpDiastolic: formData.bpDiastolic ? parseInt(formData.bpDiastolic) : null,
        heartRate: formData.heartRate ? parseInt(formData.heartRate) : null,
      };
    }
    
    dispatch(createVisit(visitData));
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Create New Visit</h2>
      
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Visit Details</h3>
          
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label className={styles.label}>
                <FontAwesomeIcon icon={faUser} /> Select Patient 
              </label>
              <div className={styles.searchContainer}>
                <input
                  type="text"
                  name="patientSearch"
                  value={patientSearchQuery}
                  onChange={handlePatientSearchChange}
                  onKeyDown={handlePatientKeyDown}
                  onFocus={() => patientSearchQuery && setShowPatientDropdown(true)}
                  className={`${styles.input} ${errors.patientId ? styles.error : ''}`}
                  placeholder="Search by name or roll number"
                  disabled={loading}
                  autoComplete="off"
                />
                {showPatientDropdown && filteredPatients.length > 0 && (
                  <div className={styles.dropdown}>
                    {filteredPatients.slice(0, 10).map((patient, index) => (
                      <div
                        key={patient.id}
                        className={`${styles.dropdownItem} ${index === highlightedIndex ? styles.highlighted : ''}`}
                        onClick={() => handlePatientSelect(patient)}
                        onMouseEnter={() => setHighlightedIndex(index)}
                      >
                        <div className={styles.patientInfo}>
                          <span className={styles.patientName}>{patient.name}</span>
                          <span className={styles.patientRoll}>Roll: {patient.rollNo}</span>
                        </div>
                      </div>
                    ))}
                    {filteredPatients.length > 10 && (
                      <div className={styles.dropdownInfo}>
                        Showing 10 of {filteredPatients.length} results. Refine your search.
                      </div>
                    )}
                  </div>
                )}
                {showPatientDropdown && filteredPatients.length === 0 && patientSearchQuery && (
                  <div className={styles.dropdown}>
                    <div className={styles.dropdownEmpty}>
                      No patients found matching "{patientSearchQuery}"
                    </div>
                  </div>
                )}
              </div>
              {errors.patientId && <span className={styles.errorText}>{errors.patientId}</span>}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                <FontAwesomeIcon icon={faUserMd} /> Select Doctor 
              </label>
              <select
                name="doctorId"
                value={formData.doctorId}
                onChange={handleChange}
                className={`${styles.select} ${errors.doctorId ? styles.error : ''}`}
                disabled={loading}
              >
                <option value="">Select a doctor</option>
                {availableDoctors.map(doctor => (
                  <option key={doctor.id} value={doctor.id}>
                    {doctor.name} ({doctor.specialization})
                  </option>
                ))}
              </select>
              {errors.doctorId && <span className={styles.errorText}>{errors.doctorId}</span>}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                <FontAwesomeIcon icon={faCalendarPlus} /> Visit Type
              </label>
              <select
                name="visitType"
                value={formData.visitType}
                onChange={handleChange}
                className={styles.select}
                disabled={loading}
              >
                <option value="OPD">OPD</option>
                <option value="Emergency">Emergency</option>
                <option value="Follow-up">Follow-up</option>
                <option value="Checkup">Routine Checkup</option>
              </select>
            </div>

            <div className={styles.formGroup} style={{ gridColumn: 'span 2' }}>
              <label className={styles.label}>
                Reason for Visit 
              </label>
              <textarea
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                className={`${styles.textarea} ${errors.reason ? styles.error : ''}`}
                placeholder="Describe the reason for visit..."
                rows={3}
                disabled={loading}
              />
              {errors.reason && <span className={styles.errorText}>{errors.reason}</span>}
            </div>
          </div>
        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Vitals (Optional)</h3>
          
          <div className={styles.vitalsGrid}>
            <div className={styles.formGroup}>
              <label className={styles.label}>
                <FontAwesomeIcon icon={faThermometerHalf} /> Temperature (°F)
              </label>
              <div className={styles.inputWithUnit}>
                <input
                  type="number"
                  name="temperature"
                  value={formData.temperature}
                  onChange={handleChange}
                  className={`${styles.input} ${errors.temperature ? styles.error : ''}`}
                  placeholder="98.6"
                  min="90"
                  max="110"
                  step="0.1"
                  disabled={loading}
                />
                <span className={styles.unit}>°F</span>
              </div>
              {errors.temperature && <span className={styles.errorText}>{errors.temperature}</span>}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                <FontAwesomeIcon icon={faTint} /> BP Systolic (mmHg)
              </label>
              <div className={styles.inputWithUnit}>
                <input
                  type="number"
                  name="bpSystolic"
                  value={formData.bpSystolic}
                  onChange={handleChange}
                  className={`${styles.input} ${errors.bpSystolic ? styles.error : ''}`}
                  placeholder="120"
                  min="70"
                  max="200"
                  disabled={loading}
                />
                <span className={styles.unit}>mmHg</span>
              </div>
              {errors.bpSystolic && <span className={styles.errorText}>{errors.bpSystolic}</span>}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                <FontAwesomeIcon icon={faTint} /> BP Diastolic (mmHg)
              </label>
              <div className={styles.inputWithUnit}>
                <input
                  type="number"
                  name="bpDiastolic"
                  value={formData.bpDiastolic}
                  onChange={handleChange}
                  className={`${styles.input} ${errors.bpDiastolic ? styles.error : ''}`}
                  placeholder="80"
                  min="40"
                  max="130"
                  disabled={loading}
                />
                <span className={styles.unit}>mmHg</span>
              </div>
              {errors.bpDiastolic && <span className={styles.errorText}>{errors.bpDiastolic}</span>}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                <FontAwesomeIcon icon={faHeartbeat} /> Heart Rate (bpm)
              </label>
              <div className={styles.inputWithUnit}>
                <input
                  type="number"
                  name="heartRate"
                  value={formData.heartRate}
                  onChange={handleChange}
                  className={`${styles.input} ${errors.heartRate ? styles.error : ''}`}
                  placeholder="72"
                  min="40"
                  max="200"
                  disabled={loading}
                />
                <span className={styles.unit}>bpm</span>
              </div>
              {errors.heartRate && <span className={styles.errorText}>{errors.heartRate}</span>}
            </div>
          </div>
        </div>

        <div className={styles.submitSection}>
          <button
            type="submit"
            className={styles.createButton}
            disabled={loading}
          >
            {loading ? 'Creating Visit...' : 'Create Visit'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateVisitForm;
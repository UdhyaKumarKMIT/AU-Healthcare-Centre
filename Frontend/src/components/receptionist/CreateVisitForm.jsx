import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUser, faUserMd, faCalendarPlus, faThermometerHalf, 
  faHeartbeat, faTint, faLungs, faTint as faGlucose, faSearch
} from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../contexts/AuthContext';
import { 
  createVisit, 
  clearCreateVisitSuccess,
  fetchVisits,
  selectVisitsLoading,
  selectVisitsError,
  selectCreateVisitSuccess
} from '../../store/slices/receptionistSlice';
import styles from './CreateVisitForm.module.css';

const CreateVisitForm = ({ patients = [], availableDoctors = [] }) => {
  const dispatch = useDispatch();
  const { user } = useAuth();
  
  const loading = useSelector(selectVisitsLoading);
  const error = useSelector(selectVisitsError);
  const createSuccess = useSelector(selectCreateVisitSuccess);
  
  console.log('CreateVisitForm - patients:', patients);
  console.log('CreateVisitForm - availableDoctors:', availableDoctors);
  console.log('CreateVisitForm - user:', user);
  
  const [formData, setFormData] = useState({
    patientId: '',
    doctorId: '',
    visitType: 'OPD',
    reason: '',
    temperature: '',
    bpSystolic: '',
    bpDiastolic: '',
    heartRate: '',
    cbg: '',
    spo2: '',
    staffCode: ''  // ADDED
  });
  
  const [errors, setErrors] = useState({});
  const [patientSearchQuery, setPatientSearchQuery] = useState('');
  const [showPatientDropdown, setShowPatientDropdown] = useState(false);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);

  // Filter patients based on search query
  useEffect(() => {
    if (patientSearchQuery.trim()) {
      const filtered = patients.filter(patient => {
        const name = patient.name?.toLowerCase() || '';
        const phone = patient.phone || '';
        const studentId = patient.student_id?.toLowerCase() || patient.rollNo?.toLowerCase() || '';
        const query = patientSearchQuery.toLowerCase();
        
        return name.includes(query) || phone.includes(query) || studentId.includes(query);
      });
      setFilteredPatients(filtered);
      console.log('Filtered patients:', filtered);
    } else {
      setFilteredPatients(patients);
    }
  }, [patientSearchQuery, patients]);

  // Handle success
  useEffect(() => {
    if (createSuccess) {
      // Refresh visits list
      dispatch(fetchVisits());
      
      // Reset form
      setFormData({
        patientId: '',
        doctorId: '',
        visitType: 'OPD',
        reason: '',
        temperature: '',
        bpSystolic: '',
        bpDiastolic: '',
        heartRate: '',
        cbg: '',
        spo2: ''
      });
      setSelectedPatient(null);
      setPatientSearchQuery('');
      setErrors({});
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        dispatch(clearCreateVisitSuccess());
      }, 3000);
    }
  }, [createSuccess, dispatch]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handlePatientSearch = (e) => {
    setPatientSearchQuery(e.target.value);
    setShowPatientDropdown(true);
  };

  const handlePatientSelect = (patient) => {
    console.log('Patient selected:', patient);
    setSelectedPatient(patient);
    setFormData(prev => ({
      ...prev,
      patientId: patient.patient_id || patient.id
    }));
    setPatientSearchQuery(patient.name);
    setShowPatientDropdown(false);
    
    // Clear patient error
    if (errors.patientId) {
      setErrors(prev => ({
        ...prev,
        patientId: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.patientId) newErrors.patientId = 'Select a patient';
    if (!formData.doctorId) newErrors.doctorId = 'Select a doctor';
    if (!formData.reason.trim()) newErrors.reason = 'Reason is required';
    if (!formData.staffCode.trim()) newErrors.staffCode = 'Staff code is required';
    
    // Temperature validation
    if (!formData.temperature) {
      newErrors.temperature = 'Temperature is required';
    } else if (formData.temperature < 90 || formData.temperature > 110) {
      newErrors.temperature = 'Temperature must be between 90°F and 110°F';
    }

    // Blood Pressure validation
    if (!formData.bpSystolic) newErrors.bpSystolic = 'Systolic BP is required';
    if (!formData.bpDiastolic) newErrors.bpDiastolic = 'Diastolic BP is required';
    
    if (formData.bpSystolic && (formData.bpSystolic < 70 || formData.bpSystolic > 200)) {
      newErrors.bpSystolic = 'Systolic BP must be between 70-200 mmHg';
    }
    
    if (formData.bpDiastolic && (formData.bpDiastolic < 40 || formData.bpDiastolic > 130)) {
      newErrors.bpDiastolic = 'Diastolic BP must be between 40-130 mmHg';
    }
    
    // Heart Rate validation
    if (!formData.heartRate) {
      newErrors.heartRate = 'Heart rate is required';
    } else if (formData.heartRate < 40 || formData.heartRate > 200) {
      newErrors.heartRate = 'Heart rate must be between 40-200 bpm';
    }
    
    // Optional: CBG validation
    if (formData.cbg && (formData.cbg < 40 || formData.cbg > 600)) {
      newErrors.cbg = 'CBG must be between 40-600 mg/dL';
    }
    
    // Optional: SpO2 validation
    if (formData.spo2 && (formData.spo2 < 70 || formData.spo2 > 100)) {
      newErrors.spo2 = 'SpO2 must be between 70-100%';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    console.log('Form submitted!');
    console.log('Form data:', formData);
    console.log('Errors:', errors);
    
    if (!validateForm()) {
      console.log('Validation failed:', errors);
      return;
    }
    
    const visitData = {
      patientId: formData.patientId,
      doctorId: formData.doctorId,
      visitType: formData.visitType,
      reason: formData.reason,
      staffCode: formData.staffCode,  // ADDED
      vitals: {
        temperature: parseFloat(formData.temperature),
        bpSystolic: parseInt(formData.bpSystolic),
        bpDiastolic: parseInt(formData.bpDiastolic),
        heartRate: parseInt(formData.heartRate),
        cbg: formData.cbg ? parseFloat(formData.cbg) : null,
        spo2: formData.spo2 ? parseFloat(formData.spo2) : null,
      }
    };
    
    console.log('Dispatching createVisit with:', visitData);
    dispatch(createVisit(visitData));
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Create New Visit</h2>
      
      {createSuccess && (
        <div className={styles.successMessage}>
          Visit created successfully!
        </div>
      )}
      
      {error && (
        <div className={styles.errorMessage}>
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className={styles.form}>
        {/* Visit Details Section */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Visit Details</h3>
          
          <div className={styles.formGrid}>
            {/* Patient Search */}
            <div className={styles.formGroup}>
              <label className={styles.label}>
                <FontAwesomeIcon icon={faUser} /> Search Patient
              </label>
              <div className={styles.searchContainer}>
                <div className={styles.searchInputWrapper}>
                  <FontAwesomeIcon icon={faSearch} className={styles.searchIcon} />
                  <input
                    type="text"
                    value={patientSearchQuery}
                    onChange={handlePatientSearch}
                    onFocus={() => setShowPatientDropdown(true)}
                    className={`${styles.searchInput} ${errors.patientId ? styles.error : ''}`}
                    placeholder="Search by name, phone, or student ID..."
                    disabled={loading}
                  />
                </div>
                
                {showPatientDropdown && filteredPatients.length > 0 && (
                  <div className={styles.patientDropdown}>
                    {filteredPatients.slice(0, 10).map(patient => (
                      <div
                        key={patient.patient_id || patient.id}
                        className={styles.patientOption}
                        onClick={() => handlePatientSelect(patient)}
                      >
                        <div className={styles.patientName}>{patient.name}</div>
                        <div className={styles.patientMeta}>
                          {patient.phone} • {patient.student_id || patient.rollNo || 'N/A'}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {selectedPatient && (
                  <div className={styles.selectedPatient}>
                    <strong>Selected:</strong> {selectedPatient.name} ({selectedPatient.phone})
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
                <option value="OPD">OPD (Out-Patient Department)</option>
                <option value="IPD">IPD (In-Patient Department)</option>
                <option value="EMERGENCY">Emergency</option>
              </select>
            </div>

            <div className={styles.formGroup} style={{ gridColumn: 'span 2' }}>
              <label className={styles.label}>Reason for Visit</label>
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

        {/* Vitals Section */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Vital Signs</h3>
          
          <div className={styles.vitalsGrid}>
            {/* Temperature */}
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

            {/* BP Systolic */}
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

            {/* BP Diastolic */}
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

            {/* Heart Rate */}
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

            {/* CBG (Optional) */}
            <div className={styles.formGroup}>
              <label className={styles.label}>
                <FontAwesomeIcon icon={faGlucose} /> CBG (mg/dL) <span style={{fontSize: '12px', color: '#64748b'}}>Optional</span>
              </label>
              <div className={styles.inputWithUnit}>
                <input
                  type="number"
                  name="cbg"
                  value={formData.cbg}
                  onChange={handleChange}
                  className={`${styles.input} ${errors.cbg ? styles.error : ''}`}
                  placeholder="100"
                  min="40"
                  max="600"
                  step="0.1"
                  disabled={loading}
                />
                <span className={styles.unit}>mg/dL</span>
              </div>
              {errors.cbg && <span className={styles.errorText}>{errors.cbg}</span>}
            </div>

            {/* SpO2 (Optional) */}
            <div className={styles.formGroup}>
              <label className={styles.label}>
                <FontAwesomeIcon icon={faLungs} /> SpO2 (%) <span style={{fontSize: '12px', color: '#64748b'}}>Optional</span>
              </label>
              <div className={styles.inputWithUnit}>
                <input
                  type="number"
                  name="spo2"
                  value={formData.spo2}
                  onChange={handleChange}
                  className={`${styles.input} ${errors.spo2 ? styles.error : ''}`}
                  placeholder="98"
                  min="70"
                  max="100"
                  step="0.1"
                  disabled={loading}
                />
                <span className={styles.unit}>%</span>
              </div>
              {errors.spo2 && <span className={styles.errorText}>{errors.spo2}</span>}
            </div>
          </div>
        </div>

        {/* Staff Code Authentication */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Authentication</h3>
          
          <div className={styles.formGroup}>
            <label className={styles.label}>
              Your Staff Code
            </label>
            <input
              type="text"
              name="staffCode"
              value={formData.staffCode}
              onChange={handleChange}
              className={`${styles.input} ${errors.staffCode ? styles.error : ''}`}
              placeholder="Enter your staff code (e.g., R001)"
              disabled={loading}
              autoComplete="off"
            />
            {errors.staffCode && <span className={styles.errorText}>{errors.staffCode}</span>}
            <p className={styles.helpText}>
              Enter your unique staff code to authenticate this action
            </p>
          </div>
        </div>

        {/* Submit Button */}
        <div className={styles.submitSection}>
          <button 
            type="submit" 
            className={styles.submitButton}
            disabled={loading}
            onClick={(e) => {
              console.log('Submit button clicked');
            }}
          >
            {loading ? 'Creating Visit...' : 'Create Visit'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateVisitForm;
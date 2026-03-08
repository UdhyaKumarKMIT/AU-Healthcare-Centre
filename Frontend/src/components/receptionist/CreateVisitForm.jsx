import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUser, faUserMd, faCalendarPlus, faThermometerHalf,
  faHeartbeat, faTint, faLungs, faTint as faGlucose, faSearch,
  faCheck, faExclamationCircle, faLock
} from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import { verifySecretCode } from '../../store/slices/nurseSlice';
import { createVisit, searchPatients, selectSearchResults, selectSearchLoading } from '../../store/slices/receptionistSlice';
const CreateVisitForm = ({ availableDoctors = [] }) => {
  const dispatch = useDispatch();
  const searchResults = useSelector(selectSearchResults);
  const searchLoading = useSelector(selectSearchLoading);

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
    secretCode: ''
  });

  const [errors, setErrors] = useState({});
  const [patientSearchQuery, setPatientSearchQuery] = useState('');
  const [showPatientDropdown, setShowPatientDropdown] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [searchTimeout, setSearchTimeout] = useState(null);

  // Secret code verification states
  const [isCodeValid, setIsCodeValid] = useState(null);
  const [isValidating, setIsValidating] = useState(false);

  // Handle patient search with debouncing
  const handlePatientSearch = (e) => {
    const query = e.target.value;
    setPatientSearchQuery(query);
    setShowPatientDropdown(true);

    // Clear previous timeout
    if (searchTimeout) clearTimeout(searchTimeout);

    // Debounce API call - only search if query has at least 2 characters
    if (query.trim().length >= 2) {
      const timeout = setTimeout(() => {
        dispatch(searchPatients(query));
      }, 300);
      setSearchTimeout(timeout);
    }
  };

  // Secret code verification effect - SAME AS NURSE DASHBOARD
  useEffect(() => {
    if (formData.secretCode.length >= 4) {
      setIsValidating(true);
      const timer = setTimeout(async () => {
        const result = await dispatch(verifySecretCode(formData.secretCode));
        if (result.payload === true) {
          setIsCodeValid(true);
          toast.success('✓ Valid staff code', { autoClose: 2000 });
        } else {
          setIsCodeValid(false);
          toast.error('✗ Invalid staff code', { autoClose: 2000 });
        }
        setIsValidating(false);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setIsCodeValid(null);
    }
  }, [formData.secretCode, dispatch]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handlePatientSelect = (patient) => {
    setSelectedPatient(patient);
    setFormData(prev => ({
      ...prev,
      patientId: patient.patient_id || patient.id
    }));
    setPatientSearchQuery(patient.name);
    setShowPatientDropdown(false);

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

    // Secret code validation
    if (!formData.secretCode.trim()) {
      newErrors.secretCode = 'Staff code is required';
    } else if (isCodeValid !== true) {
      newErrors.secretCode = 'Please enter a valid staff code';
    }

    // Temperature validation
    if (!formData.temperature) {
      newErrors.temperature = 'Temperature is required';
    } else if (formData.temperature < 90 || formData.temperature > 110) {
      newErrors.temperature = 'Temperature must be between 90°F and 110°F';
    }

    // Blood Pressure validation (optional, but validate range if provided)
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

    // CBG validation (optional, but validate range if provided)
    if (formData.cbg && (formData.cbg < 40 || formData.cbg > 600)) {
      newErrors.cbg = 'CBG must be between 40-600 mg/dL';
    }

    if (!formData.spo2) {
      newErrors.spo2 = 'SpO2 is required';
    } else if (formData.spo2 < 70 || formData.spo2 > 100) {
      newErrors.spo2 = 'SpO2 must be between 70-100%';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      toast.error('Please fix all validation errors')
      return
    }

    const visitData = {
      patientId: formData.patientId,
      doctorId: formData.doctorId,
      visitType: formData.visitType,
      reason: formData.reason,
      staffCode: formData.secretCode,
      vitals: {
        temperature: parseFloat(formData.temperature),
        bpSystolic: formData.bpSystolic ? parseInt(formData.bpSystolic) : null,
        bpDiastolic: formData.bpDiastolic ? parseInt(formData.bpDiastolic) : null,
        heartRate: parseInt(formData.heartRate),
        cbg: formData.cbg ? parseFloat(formData.cbg) : null,
        spo2: parseFloat(formData.spo2)
      }
    }


    const result = await dispatch(createVisit(visitData))

    if (result.meta.requestStatus === 'fulfilled') {
      toast.success('Visit created successfully')

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
        spo2: '',
        secretCode: ''
      })

      setSelectedPatient(null)
      setPatientSearchQuery('')
      setErrors({})
      setIsCodeValid(null)
    } else {

      toast.error(result.payload || 'Failed to create visit')
    }
  }


  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Create New Visit</h2>

      <div style={styles.form}>
        {/* Visit Details Section */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Visit Details</h3>

          <div style={styles.formGrid}>
            {/* Patient Search */}
            <div style={styles.formGroup}>
              <label style={styles.label}>
                <FontAwesomeIcon icon={faUser} /> Search Patient
              </label>
              <div style={styles.searchContainer}>
                <div style={styles.searchInputWrapper}>
                  <FontAwesomeIcon icon={faSearch} style={styles.searchIcon} />
                  <input
                    type="text"
                    value={patientSearchQuery}
                    onChange={handlePatientSearch}
                    onFocus={() => setShowPatientDropdown(true)}
                    style={{ ...styles.input, paddingLeft: '40px', ...(errors.patientId && styles.errorInput) }}
                    placeholder="Search by name, phone, or student ID..."
                  />
                </div>

                {showPatientDropdown && (searchResults.length > 0 || searchLoading) && (
                  <div style={styles.patientDropdown}>
                    {searchLoading ? (
                      <div style={{ padding: '16px', textAlign: 'center', color: '#64748b' }}>
                        Searching patients...
                      </div>
                    ) : searchResults.length > 0 ? (
                      searchResults.map(patient => (
                        <div
                          key={patient.patient_id || patient.id}
                          style={styles.patientOption}
                          onClick={() => handlePatientSelect(patient)}
                        >
                          <div style={styles.patientName}>{patient.name}</div>
                          <div style={styles.patientMeta}>
                            {patient.phone} • {patient.reg_number || 'N/A'}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div style={{ padding: '16px', textAlign: 'center', color: '#64748b' }}>
                        No patients found. Try searching by name or phone.
                      </div>
                    )}
                  </div>
                )}

                {selectedPatient && (
                  <div style={styles.selectedPatientDetails}>
                    <div style={styles.selectedPatientHeader}>
                      <strong>✓ Selected Patient</strong>
                    </div>
                    <div style={styles.patientDetailsGrid}>
                      <div style={styles.detailRow}>
                        <span style={styles.detailLabel}>Name:</span>
                        <span style={styles.detailValue}>{selectedPatient.name}</span>
                      </div>
                      <div style={styles.detailRow}>
                        <span style={styles.detailLabel}>Phone:</span>
                        <span style={styles.detailValue}>{selectedPatient.phone || 'N/A'}</span>
                      </div>
                      <div style={styles.detailRow}>
                        <span style={styles.detailLabel}>Reg. Number:</span>
                        <span style={styles.detailValue}>{selectedPatient.reg_number || 'N/A'}</span>
                      </div>
                      <div style={styles.detailRow}>
                        <span style={styles.detailLabel}>Gender:</span>
                        <span style={styles.detailValue}>{selectedPatient.gender || 'N/A'}</span>
                      </div>
                      <div style={styles.detailRow}>
                        <span style={styles.detailLabel}>DOB:</span>
                        <span style={styles.detailValue}>{selectedPatient.dob || 'N/A'}</span>
                      </div>
                      <div style={styles.detailRow}>
                        <span style={styles.detailLabel}>Email:</span>
                        <span style={styles.detailValue}>{selectedPatient.email || 'N/A'}</span>
                      </div>
                      <div style={styles.detailRow}>
                        <span style={styles.detailLabel}>Blood Group:</span>
                        <span style={styles.detailValue}>{selectedPatient.bloodGroup || 'N/A'}</span>
                      </div>
                      <div style={styles.detailRow}>
                        <span style={styles.detailLabel}>Type:</span>
                        <span style={styles.detailValue}>{selectedPatient.patientType || 'N/A'}</span>
                      </div>
                      {selectedPatient.patientType === 'STUDENT' && (
                        <>
                          <div style={styles.detailRow}>
                            <span style={styles.detailLabel}>Department:</span>
                            <span style={styles.detailValue}>{selectedPatient.department || 'N/A'}</span>
                          </div>
                          <div style={styles.detailRow}>
                            <span style={styles.detailLabel}>Year:</span>
                            <span style={styles.detailValue}>{selectedPatient.year || 'N/A'}</span>
                          </div>
                        </>
                      )}
                      {selectedPatient.patientType !== 'STUDENT' && (
                        <>
                          <div style={styles.detailRow}>
                            <span style={styles.detailLabel}>Employee ID:</span>
                            <span style={styles.detailValue}>{selectedPatient.employeeId || 'N/A'}</span>
                          </div>
                          <div style={styles.detailRow}>
                            <span style={styles.detailLabel}>Designation:</span>
                            <span style={styles.detailValue}>{selectedPatient.designation || 'N/A'}</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
              {errors.patientId && <span style={styles.errorText}>{errors.patientId}</span>}
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>
                <FontAwesomeIcon icon={faUserMd} /> Select Doctor
              </label>
              <select
                name="doctorId"
                value={formData.doctorId}
                onChange={handleChange}
                style={{ ...styles.select, ...(errors.doctorId && styles.errorInput) }}
              >
                <option value="">Select a doctor</option>
                {availableDoctors.map(doctor => (
                  <option key={doctor.id} value={doctor.id}>
                    {doctor.name} ({doctor.specialization})
                  </option>
                ))}
              </select>
              {errors.doctorId && <span style={styles.errorText}>{errors.doctorId}</span>}
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>
                <FontAwesomeIcon icon={faCalendarPlus} /> Visit Type
              </label>
              <select
                name="visitType"
                value={formData.visitType}
                onChange={handleChange}
                style={styles.select}
              >
                <option value="OPD">OPD (Out-Patient Department)</option>
                <option value="IPD">IPD (In-Patient Department)</option>
                <option value="EMERGENCY">Emergency</option>
              </select>
            </div>

            <div style={{ ...styles.formGroup, gridColumn: 'span 2' }}>
              <label style={styles.label}>Reason for Visit</label>
              <textarea
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                style={{ ...styles.textarea, ...(errors.reason && styles.errorInput) }}
                placeholder="Describe the reason for visit..."
                rows={3}
              />
              {errors.reason && <span style={styles.errorText}>{errors.reason}</span>}
            </div>
          </div>
        </div>

        {/* Vitals Section */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Vital Signs</h3>

          <div style={styles.vitalsGrid}>
            <div style={styles.formGroup}>
              <label style={styles.label}>
                <FontAwesomeIcon icon={faThermometerHalf} /> Temperature (°F)
              </label>
              <div style={styles.inputWithUnit}>
                <input
                  type="number"
                  name="temperature"
                  value={formData.temperature}
                  onChange={handleChange}
                  style={{ ...styles.input, ...(errors.temperature && styles.errorInput) }}
                  placeholder="98.6"
                  min="90"
                  max="110"
                  step="0.1"
                />
                <span style={styles.unit}>°F</span>
              </div>
              {errors.temperature && <span style={styles.errorText}>{errors.temperature}</span>}
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>
                <FontAwesomeIcon icon={faHeartbeat} /> Heart Rate (bpm)
              </label>
              <div style={styles.inputWithUnit}>
                <input
                  type="number"
                  name="heartRate"
                  value={formData.heartRate}
                  onChange={handleChange}
                  style={{ ...styles.input, ...(errors.heartRate && styles.errorInput) }}
                  placeholder="72"
                  min="40"
                  max="200"
                />
                <span style={styles.unit}>bpm</span>
              </div>
              {errors.heartRate && <span style={styles.errorText}>{errors.heartRate}</span>}
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>
                <FontAwesomeIcon icon={faTint} /> BP Systolic (mmHg) <span style={{ fontSize: '12px', color: '#64748b' }}>Optional</span>
              </label>
              <div style={styles.inputWithUnit}>
                <input
                  type="number"
                  name="bpSystolic"
                  value={formData.bpSystolic}
                  onChange={handleChange}
                  style={{ ...styles.input, ...(errors.bpSystolic && styles.errorInput) }}
                  placeholder="120"
                  min="70"
                  max="200"
                />
                <span style={styles.unit}>mmHg</span>
              </div>
              {errors.bpSystolic && <span style={styles.errorText}>{errors.bpSystolic}</span>}
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>
                <FontAwesomeIcon icon={faTint} /> BP Diastolic (mmHg) <span style={{ fontSize: '12px', color: '#64748b' }}>Optional</span>
              </label>
              <div style={styles.inputWithUnit}>
                <input
                  type="number"
                  name="bpDiastolic"
                  value={formData.bpDiastolic}
                  onChange={handleChange}
                  style={{ ...styles.input, ...(errors.bpDiastolic && styles.errorInput) }}
                  placeholder="80"
                  min="40"
                  max="130"
                />
                <span style={styles.unit}>mmHg</span>
              </div>
              {errors.bpDiastolic && <span style={styles.errorText}>{errors.bpDiastolic}</span>}
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>
                <FontAwesomeIcon icon={faLungs} /> SpO2 (%)
              </label>
              <div style={styles.inputWithUnit}>
                <input
                  type="number"
                  name="spo2"
                  value={formData.spo2}
                  onChange={handleChange}
                  style={{ ...styles.input, ...(errors.spo2 && styles.errorInput) }}
                  placeholder="98"
                  min="70"
                  max="100"
                  step="0.1"
                />
                <span style={styles.unit}>%</span>
              </div>
              {errors.spo2 && <span style={styles.errorText}>{errors.spo2}</span>}
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>
                <FontAwesomeIcon icon={faGlucose} /> CBG (mg/dL) <span style={{ fontSize: '12px', color: '#64748b' }}>Optional</span>
              </label>
              <div style={styles.inputWithUnit}>
                <input
                  type="number"
                  name="cbg"
                  value={formData.cbg}
                  onChange={handleChange}
                  style={{ ...styles.input, ...(errors.cbg && styles.errorInput) }}
                  placeholder="100"
                  min="40"
                  max="600"
                  step="0.1"
                />
                <span style={styles.unit}>mg/dL</span>
              </div>
              {errors.cbg && <span style={styles.errorText}>{errors.cbg}</span>}
            </div>
          </div>
        </div>

        {/* Secret Code Authentication */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>
            <FontAwesomeIcon icon={faLock} /> Authentication
          </h3>

          <div style={styles.formGroup}>
            <label style={styles.label}>Your Secret Code</label>
            <div style={styles.codeInputWrapper}>
              <input
                type="password"
                name="secretCode"
                value={formData.secretCode}
                onChange={handleChange}
                style={{
                  ...styles.input,
                  ...(isCodeValid === true && styles.inputValid),
                  ...(isCodeValid === false && styles.inputInvalid),
                  ...(errors.secretCode && styles.errorInput)
                }}
                placeholder="Enter your secret code"
                autoComplete="off"
              />
              {isValidating && (
                <div style={styles.validatingSpinner}>
                  <div style={styles.smallSpinner}></div>
                </div>
              )}
              {isCodeValid === true && (
                <FontAwesomeIcon icon={faCheck} style={styles.validIcon} />
              )}
              {isCodeValid === false && (
                <FontAwesomeIcon icon={faExclamationCircle} style={styles.invalidIcon} />
              )}
            </div>
            {errors.secretCode && <span style={styles.errorText}>{errors.secretCode}</span>}
            <p style={styles.helpText}>
              Enter your unique secret code to authenticate this action
            </p>
          </div>
        </div>

        {/* Submit Button */}
        <div style={styles.submitSection}>
          <button
            type="button"
            onClick={handleSubmit}
            style={{
              ...styles.submitButton,
              ...(isCodeValid !== true && styles.submitButtonDisabled)
            }}
            disabled={isCodeValid !== true}
          >
            Create Visit
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: '24px',
    background: 'white',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    maxWidth: '1200px',
    margin: '0 auto'
  },
  title: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#1a237e',
    margin: '0 0 24px 0'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px'
  },
  section: {
    background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
    borderRadius: '12px',
    padding: '24px',
    border: '1px solid #e2e8f0'
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#1e293b',
    margin: '0 0 20px 0',
    paddingBottom: '12px',
    borderBottom: '2px solid #cbd5e1',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '20px'
  },
  vitalsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '20px'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  label: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#334155',
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  },
  input: {
    padding: '12px 16px',
    border: '2px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '15px',
    transition: 'all 0.2s ease',
    fontFamily: 'inherit',
    background: 'white',
    color: '#1e293b',
    width: '100%'
  },
  select: {
    padding: '12px 16px',
    border: '2px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '15px',
    transition: 'all 0.2s ease',
    fontFamily: 'inherit',
    background: 'white',
    color: '#1e293b',
    cursor: 'pointer',
    width: '100%'
  },
  textarea: {
    padding: '12px 16px',
    border: '2px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '15px',
    transition: 'all 0.2s ease',
    fontFamily: 'inherit',
    background: 'white',
    color: '#1e293b',
    resize: 'vertical',
    minHeight: '80px',
    width: '100%'
  },
  inputWithUnit: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center'
  },
  unit: {
    position: 'absolute',
    right: '12px',
    color: '#64748b',
    fontSize: '14px',
    fontWeight: '500',
    pointerEvents: 'none'
  },
  searchContainer: {
    position: 'relative',
    width: '100%'
  },
  searchInputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center'
  },
  searchIcon: {
    position: 'absolute',
    left: '12px',
    color: '#64748b',
    pointerEvents: 'none',
    zIndex: 1
  },
  patientDropdown: {
    position: 'absolute',
    top: 'calc(100% + 4px)',
    left: 0,
    right: 0,
    background: 'white',
    border: '2px solid #e2e8f0',
    borderRadius: '8px',
    maxHeight: '300px',
    overflowY: 'auto',
    zIndex: 1000,
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
  },
  patientOption: {
    padding: '12px 16px',
    cursor: 'pointer',
    transition: 'background-color 0.15s',
    borderBottom: '1px solid #f1f5f9'
  },
  patientName: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: '4px'
  },
  patientMeta: {
    fontSize: '13px',
    color: '#64748b'
  },
  selectedPatient: {
    marginTop: '8px',
    padding: '8px 12px',
    background: '#e0f2fe',
    border: '1px solid #0ea5e9',
    borderRadius: '6px',
    fontSize: '14px',
    color: '#0284c7',
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  },
  selectedPatientDetails: {
    marginTop: '12px',
    padding: '12px',
    background: '#f0f4f8',
    border: '2px solid #22c55e',
    borderRadius: '8px',
    maxHeight: '400px',
    overflowY: 'auto'
  },
  selectedPatientHeader: {
    fontSize: '14px',
    fontWeight: '700',
    color: '#15803d',
    marginBottom: '10px',
    paddingBottom: '8px',
    borderBottom: '2px solid #22c55e'
  },
  patientDetailsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '10px'
  },
  detailRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  detailLabel: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#0f766e',
    textTransform: 'uppercase'
  },
  detailValue: {
    fontSize: '14px',
    color: '#1e293b',
    fontWeight: '500'
  },
  codeInputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center'
  },
  validatingSpinner: {
    position: 'absolute',
    right: '12px',
    display: 'flex',
    alignItems: 'center'
  },
  smallSpinner: {
    width: '16px',
    height: '16px',
    border: '2px solid #e2e8f0',
    borderTopColor: '#3949ab',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite'
  },
  validIcon: {
    position: 'absolute',
    right: '12px',
    color: '#10b981',
    fontSize: '18px'
  },
  invalidIcon: {
    position: 'absolute',
    right: '12px',
    color: '#ef4444',
    fontSize: '18px'
  },
  inputValid: {
    borderColor: '#10b981',
    background: '#f0fdf4'
  },
  inputInvalid: {
    borderColor: '#ef4444',
    background: '#fef2f2'
  },
  errorInput: {
    borderColor: '#f56565',
    background: '#fff5f5'
  },
  errorText: {
    fontSize: '13px',
    color: '#f56565',
    fontWeight: '500',
    marginTop: '-4px',
    display: 'flex',
    alignItems: 'center',
    gap: '4px'
  },
  helpText: {
    fontSize: '12px',
    color: '#64748b',
    marginTop: '4px',
    fontStyle: 'italic',
    lineHeight: '1.4'
  },
  submitSection: {
    display: 'flex',
    justifyContent: 'flex-end',
    paddingTop: '16px',
    borderTop: '2px solid #e2e8f0',
    marginTop: '8px'
  },
  submitButton: {
    background: 'linear-gradient(135deg, #1a237e 0%, #3949ab 100%)',
    color: 'white',
    border: 'none',
    padding: '16px 40px',
    borderRadius: '10px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s',
    minWidth: '180px',
    boxShadow: '0 4px 12px rgba(26, 35, 126, 0.2)'
  },
  submitButtonDisabled: {
    background: 'linear-gradient(135deg, #cbd5e1 0%, #94a3b8 100%)',
    cursor: 'not-allowed',
    transform: 'none',
    boxShadow: 'none',
    opacity: 0.7
  }
};

// Add keyframes for spinner animation
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;
document.head.appendChild(styleSheet);

export default CreateVisitForm;
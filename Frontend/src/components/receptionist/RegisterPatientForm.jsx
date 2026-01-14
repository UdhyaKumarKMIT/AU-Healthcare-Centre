import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUser, faIdCard, faCalendar, faVenusMars, 
  faPhone, faEnvelope, faUserTie, faUsers,
  faCheck, faExclamationCircle, faLock
} from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import { verifySecretCode } from '../../store/slices/nurseSlice';
import { registerPatient } from '../../store/slices/receptionistSlice';
const initialFormState = {
  name: '',
  email: '',
  rollNo: '',
  dob: '',
  gender: '',
  phone: '',
  patientType: 'STUDENT',
  allergicTo: '',
  department: '',
  year: '',
  employeeId: '',
  designation: '',
  secretCode: '',
  familyMembers: []
}

const RegisterPatientForm = () => {
  const dispatch = useDispatch();
  
  const [formData, setFormData] = useState(initialFormState);

  
  const [errors, setErrors] = useState({});
  const [showFamilySection, setShowFamilySection] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Secret code verification states
  const [isCodeValid, setIsCodeValid] = useState(null);
  const [isValidating, setIsValidating] = useState(false);

  // Show family section for permanent staff
  useEffect(() => {
    setShowFamilySection(formData.patientType === 'PERMANENT_STAFF');
  }, [formData.patientType]);

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
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const addFamilyMember = () => {
    setFormData(prev => ({
      ...prev,
      familyMembers: [...prev.familyMembers, { name: '', relation: '', dob: '', phone: '' }]
    }));
  };

  const removeFamilyMember = (index) => {
    setFormData(prev => ({
      ...prev,
      familyMembers: prev.familyMembers.filter((_, i) => i !== index)
    }));
  };

  const updateFamilyMember = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      familyMembers: prev.familyMembers.map((member, i) => 
        i === index ? { ...member, [field]: value } : member
      )
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Basic validations
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.dob) newErrors.dob = 'Date of birth is required';
    if (!formData.gender) newErrors.gender = 'Gender is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    
    // Secret code validation
    if (!formData.secretCode.trim()) {
      newErrors.secretCode = 'Staff code is required';
    } else if (isCodeValid !== true) {
      newErrors.secretCode = 'Please enter a valid staff code';
    }
    
    // Type-specific validations
    if (formData.patientType === 'STUDENT') {
      if (!formData.rollNo.trim()) newErrors.rollNo = 'Roll number is required';
      if (!formData.department.trim()) newErrors.department = 'Department is required';
      if (!formData.year) newErrors.year = 'Year is required';
    } else {
      if (!formData.employeeId.trim()) newErrors.employeeId = 'Employee ID is required';
      if (!formData.designation.trim()) newErrors.designation = 'Designation is required';
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = 'Enter a valid email address';
    }
    
    // Phone validation
    const phoneRegex = /^\d{10}$/;
    if (formData.phone && !phoneRegex.test(formData.phone)) {
      newErrors.phone = 'Enter a valid 10-digit phone number';
    }
    // DOB must be in the past
if (formData.dob) {
  const dobDate = new Date(formData.dob)
  const today = new Date()

  if (dobDate >= today) {
    newErrors.dob = 'Date of birth must be in the past'
  } else {
    var age = today.getFullYear() - dobDate.getFullYear()
    const m = today.getMonth() - dobDate.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < dobDate.getDate())) {
      age--
    }

    if (age > 120) newErrors.dob = 'Invalid age'
  }
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

  setLoading(true)

  const payload = {
    email: formData.email,
    rollNo: formData.rollNo,
    employeeId: formData.employeeId,
    name: formData.name,
    dob: formData.dob,
    gender: formData.gender,
    phone: formData.phone,
    patientType: formData.patientType,
    allergicTo: formData.allergicTo,
    department: formData.department,
    year: formData.year,
    designation: formData.designation,
    familyMembers: formData.familyMembers,
    staffCode: formData.secretCode
  }

  const result = await dispatch(registerPatient(payload))

  setLoading(false)

  if (result.meta.requestStatus === 'fulfilled') {
  toast.success('Patient registered successfully')

  setFormData(initialFormState)
  setErrors({})
  setIsCodeValid(null)
  setShowFamilySection(false)
}
 else {
    toast.error(result.payload || 'Failed to register patient')
  }
}


  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>
          <FontAwesomeIcon icon={faUser} /> Register New Patient
        </h2>
      </div>
      
      <div style={styles.form}>
        {/* Patient Type Selection */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Patient Type</h3>
          <div style={styles.formGroup}>
            <select
              name="patientType"
              value={formData.patientType}
              onChange={handleChange}
              style={styles.select}
              disabled={loading}
            >
              <option value="STUDENT">Student</option>
              <option value="TEMP_STAFF">Temporary Staff</option>
              <option value="PERMANENT_STAFF">Permanent Staff</option>
            </select>
          </div>
        </div>

        {/* Basic Information */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Basic Information</h3>
          <div style={styles.formGrid}>
            <div style={styles.formGroup}>
              <label style={styles.label}>
                <FontAwesomeIcon icon={faUser} /> Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                style={{...styles.input, ...(errors.name && styles.errorInput)}}
                placeholder="Enter full name"
                disabled={loading}
              />
              {errors.name && <span style={styles.errorText}>{errors.name}</span>}
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>
                <FontAwesomeIcon icon={faEnvelope} /> Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                style={{...styles.input, ...(errors.email && styles.errorInput)}}
                placeholder="email@annauniv.edu"
                disabled={loading}
              />
              {errors.email && <span style={styles.errorText}>{errors.email}</span>}
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>
                <FontAwesomeIcon icon={faCalendar} /> Date of Birth
              </label>
              <input
                type="date"
                name="dob"
                value={formData.dob}
                onChange={handleChange}
                style={{...styles.input, ...(errors.dob && styles.errorInput)}}
                disabled={loading}
              />
              {errors.dob && <span style={styles.errorText}>{errors.dob}</span>}
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>
                <FontAwesomeIcon icon={faVenusMars} /> Gender
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                style={{...styles.select, ...(errors.gender && styles.errorInput)}}
                disabled={loading}
              >
                <option value="">Select Gender</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
              {errors.gender && <span style={styles.errorText}>{errors.gender}</span>}
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>
                <FontAwesomeIcon icon={faPhone} /> Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                style={{...styles.input, ...(errors.phone && styles.errorInput)}}
                placeholder="9876543210"
                disabled={loading}
              />
              {errors.phone && <span style={styles.errorText}>{errors.phone}</span>}
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Allergies (Optional)</label>
              <input
                type="text"
                name="allergicTo"
                value={formData.allergicTo}
                onChange={handleChange}
                style={styles.input}
                placeholder="List any known allergies"
                disabled={loading}
              />
            </div>
          </div>
        </div>

        {/* Student-Specific Fields */}
        {formData.patientType === 'STUDENT' && (
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Student Details</h3>
            <div style={styles.formGrid}>
              <div style={styles.formGroup}>
                <label style={styles.label}>
                  <FontAwesomeIcon icon={faIdCard} /> Roll Number
                </label>
                <input
                  type="text"
                  name="rollNo"
                  value={formData.rollNo}
                  onChange={handleChange}
                  style={{...styles.input, ...(errors.rollNo && styles.errorInput)}}
                  placeholder="2024503011"
                  disabled={loading}
                />
                {errors.rollNo && <span style={styles.errorText}>{errors.rollNo}</span>}
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Department</label>
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  style={{...styles.input, ...(errors.department && styles.errorInput)}}
                  placeholder="e.g., Computer Science"
                  disabled={loading}
                />
                {errors.department && <span style={styles.errorText}>{errors.department}</span>}
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Year</label>
                <select
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  style={{...styles.select, ...(errors.year && styles.errorInput)}}
                  disabled={loading}
                >
                  <option value="">Select Year</option>
                  <option value="1">First Year</option>
                  <option value="2">Second Year</option>
                  <option value="3">Third Year</option>
                  <option value="4">Fourth Year</option>
                </select>
                {errors.year && <span style={styles.errorText}>{errors.year}</span>}
              </div>
            </div>
          </div>
        )}

        {/* Staff-Specific Fields */}
        {(formData.patientType === 'TEMP_STAFF' || formData.patientType === 'PERMANENT_STAFF') && (
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Staff Details</h3>
            <div style={styles.formGrid}>
              <div style={styles.formGroup}>
                <label style={styles.label}>
                  <FontAwesomeIcon icon={faIdCard} /> Employee ID
                </label>
                <input
                  type="text"
                  name="employeeId"
                  value={formData.employeeId}
                  onChange={handleChange}
                  style={{...styles.input, ...(errors.employeeId && styles.errorInput)}}
                  placeholder="EMP001"
                  disabled={loading}
                />
                {errors.employeeId && <span style={styles.errorText}>{errors.employeeId}</span>}
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>
                  <FontAwesomeIcon icon={faUserTie} /> Designation
                </label>
                <input
                  type="text"
                  name="designation"
                  value={formData.designation}
                  onChange={handleChange}
                  style={{...styles.input, ...(errors.designation && styles.errorInput)}}
                  placeholder="e.g., Assistant Professor"
                  disabled={loading}
                />
                {errors.designation && <span style={styles.errorText}>{errors.designation}</span>}
              </div>
            </div>
          </div>
        )}

        {/* Family Details for Permanent Staff */}
        {showFamilySection && (
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <h3 style={styles.sectionTitle}>
                <FontAwesomeIcon icon={faUsers} /> Family Members (Optional)
              </h3>
              <button
                type="button"
                onClick={addFamilyMember}
                style={styles.addButton}
                disabled={loading}
              >
                + Add Family Member
              </button>
            </div>

            {formData.familyMembers.map((member, index) => (
              <div key={index} style={styles.familyMemberCard}>
                <div style={styles.familyMemberHeader}>
                  <h4>Family Member {index + 1}</h4>
                  <button
                    type="button"
                    onClick={() => removeFamilyMember(index)}
                    style={styles.removeButton}
                    disabled={loading}
                  >
                    Remove
                  </button>
                </div>

                <div style={styles.formGrid}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Name</label>
                    <input
                      type="text"
                      value={member.name}
                      onChange={(e) => updateFamilyMember(index, 'name', e.target.value)}
                      style={styles.input}
                      placeholder="Family member name"
                      disabled={loading}
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Relation</label>
                    <select
                      value={member.relation}
                      onChange={(e) => updateFamilyMember(index, 'relation', e.target.value)}
                      style={styles.select}
                      disabled={loading}
                    >
                      <option value="">Select Relation</option>
                      <option value="SPOUSE">Spouse</option>
                      <option value="CHILD">Child</option>
                      <option value="PARENT">Parent</option>
                      <option value="SIBLING">Sibling</option>
                    </select>
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Date of Birth</label>
                    <input
                      type="date"
                      value={member.dob}
                      onChange={(e) => updateFamilyMember(index, 'dob', e.target.value)}
                      style={styles.input}
                      disabled={loading}
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Phone (Optional)</label>
                    <input
                      type="tel"
                      value={member.phone}
                      onChange={(e) => updateFamilyMember(index, 'phone', e.target.value)}
                      style={styles.input}
                      placeholder="9876543210"
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

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
                disabled={loading}
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
              Enter your unique secret code to authenticate this registration
            </p>
          </div>
        </div>

        <button 
          type="button"
          onClick={handleSubmit}
          style={{
            ...styles.submitButton,
            ...(loading || isCodeValid !== true ? styles.submitButtonDisabled : {})
          }}
          disabled={loading || isCodeValid !== true}
        >
          {loading ? 'Registering...' : '+ Register Patient'}
        </button>
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
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
    paddingBottom: '16px',
    borderBottom: '2px solid #e2e8f0'
  },
  title: {
    fontSize: '22px',
    fontWeight: '700',
    color: '#1a237e',
    margin: '0',
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
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
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px'
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
  familyMemberCard: {
    background: 'white',
    border: '2px solid #e2e8f0',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '16px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
  },
  familyMemberHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
    paddingBottom: '12px',
    borderBottom: '2px solid #f1f5f9'
  },
  addButton: {
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s'
  },
  removeButton: {
    background: 'transparent',
    color: '#ef4444',
    border: '2px solid #ef4444',
    padding: '6px 14px',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s'
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
    alignSelf: 'flex-start',
    boxShadow: '0 4px 12px rgba(26, 35, 126, 0.2)',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
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

export default RegisterPatientForm;
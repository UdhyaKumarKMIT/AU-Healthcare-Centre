import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUser, faIdCard, faCalendar, faVenusMars,
  faPhone, faEnvelope, faUserTie, faUsers,
  faCheck, faExclamationCircle
} from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';
import { verifySecretCode } from '../../store/slices/nurseSlice';
import {
  registerPatient,
  clearRegisterSuccess,
  fetchPatients,
  selectPatientsLoading,
  selectPatientsError,
  selectRegisterSuccess
} from '../../store/slices/receptionistSlice';
import styles from './RegisterPatientForm.module.css';

const RegisterPatientForm = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useAuth();

  const loading = useSelector(selectPatientsLoading);
  const error = useSelector(selectPatientsError);
  const registerSuccess = useSelector(selectRegisterSuccess);

  const [formData, setFormData] = useState({
    // Basic Info
    name: '',
    email: '',
    rollNo: '',
    dob: '',
    gender: '',
    phone: '',
    patientType: 'STUDENT',
    allergicTo: '',
    bloodGroup: '',
    // Student-specific
    department: '',
    year: '',

    // Staff-specific
    employeeId: '',
    designation: '',
    staffCode: '',

    // Family Details (for Permanent Staff)
    familyMembers: []
  });

  const [errors, setErrors] = useState({});
  const [showFamilySection, setShowFamilySection] = useState(false);
  const [isCodeValid, setIsCodeValid] = useState(null);
  const [isValidating, setIsValidating] = useState(false);

  useEffect(() => {
    if (registerSuccess) {
      // Refresh patients list
      dispatch(fetchPatients());

      // Reset form
      resetForm();

      // Clear success flag
      setTimeout(() => {
        dispatch(clearRegisterSuccess());
      }, 3000);
    }
  }, [registerSuccess, dispatch]);

  useEffect(() => {
    setShowFamilySection(formData.patientType === 'PERMANENT_STAFF');
  }, [formData.patientType]);

  useEffect(() => {
    if (formData.staffCode && formData.staffCode.length >= 4) {
      setIsValidating(true);
      const timer = setTimeout(async () => {
        const result = await dispatch(verifySecretCode(formData.staffCode));
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
  }, [formData.staffCode, dispatch]);

  const resetForm = () => {
    setFormData({
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
      familyMembers: []
    });
    setErrors({});
  };

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

    if (!formData.staffCode.trim()) {
      newErrors.staffCode = 'Staff code is required';
    } else if (isCodeValid !== true) {
      newErrors.staffCode = 'Please enter a valid staff code';
    }


    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Fix validation errors');
      return;
    }

    const payload = {
      ...formData,
      rollNo: formData.patientType === 'STUDENT' ? formData.rollNo : formData.employeeId,
      staffCode: formData.staffCode
    };

    dispatch(registerPatient(payload));
  };

  return (
    <div className={styles.container}>
      {/* <div className={styles.header}>
        <h2 className={styles.title}>Register New Patient</h2>
      </div> */}

      <form onSubmit={handleSubmit} className={styles.form}>
        {/* Patient Type Selection */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Patient Type</h3>
          <div className={styles.formGroup}>
            <select
              name="patientType"
              value={formData.patientType}
              onChange={handleChange}
              className={styles.select}
              disabled={loading}
            >
              <option value="STUDENT">Student</option>
              <option value="TEMP_STAFF">Temporary Staff</option>
              <option value="PERMANENT_STAFF">Permanent Staff</option>
            </select>
          </div>
        </div>

        {/* Basic Information */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Basic Information</h3>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label className={styles.label}>
                <FontAwesomeIcon icon={faUser} /> Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`${styles.input} ${errors.name ? styles.error : ''}`}
                placeholder="Enter full name"
                disabled={loading}
              />
              {errors.name && <span className={styles.errorText}>{errors.name}</span>}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                <FontAwesomeIcon icon={faEnvelope} /> Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`${styles.input} ${errors.email ? styles.error : ''}`}
                placeholder="email@annauniv.edu"
                disabled={loading}
              />
              {errors.email && <span className={styles.errorText}>{errors.email}</span>}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                <FontAwesomeIcon icon={faCalendar} /> Date of Birth
              </label>
              <input
                type="date"
                name="dob"
                value={formData.dob}
                onChange={handleChange}
                className={`${styles.input} ${errors.dob ? styles.error : ''}`}
                disabled={loading}
              />
              {errors.dob && <span className={styles.errorText}>{errors.dob}</span>}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                <FontAwesomeIcon icon={faVenusMars} /> Gender
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className={`${styles.select} ${errors.gender ? styles.error : ''}`}
                disabled={loading}
              >
                <option value="">Select Gender</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
              {errors.gender && <span className={styles.errorText}>{errors.gender}</span>}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                <FontAwesomeIcon icon={faPhone} /> Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={`${styles.input} ${errors.phone ? styles.error : ''}`}
                placeholder="9876543210"
                disabled={loading}
              />
              {errors.phone && <span className={styles.errorText}>{errors.phone}</span>}
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Blood Group</label>
              <select
                name="bloodGroup"
                value={formData.bloodGroup}
                onChange={handleChange}
                className={styles.select}
                disabled={loading}
              >
                <option value="">Select Blood Group</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Allergies (Optional)</label>
              <input
                type="text"
                name="allergicTo"
                value={formData.allergicTo}
                onChange={handleChange}
                className={styles.input}
                placeholder="List any known allergies"
                disabled={loading}
              />
            </div>
          </div>
        </div>

        {/* Student-Specific Fields */}
        {formData.patientType === 'STUDENT' && (
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Student Details</h3>
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  <FontAwesomeIcon icon={faIdCard} /> Roll Number
                </label>
                <input
                  type="text"
                  name="rollNo"
                  value={formData.rollNo}
                  onChange={handleChange}
                  className={`${styles.input} ${errors.rollNo ? styles.error : ''}`}
                  placeholder="2024503011"
                  disabled={loading}
                />
                {errors.rollNo && <span className={styles.errorText}>{errors.rollNo}</span>}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Department</label>
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className={`${styles.input} ${errors.department ? styles.error : ''}`}
                  placeholder="e.g., Computer Science"
                  disabled={loading}
                />
                {errors.department && <span className={styles.errorText}>{errors.department}</span>
                }                                                                                                                </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Year</label>
                <select
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  className={`${styles.select} ${errors.year ? styles.error : ''}`}
                  disabled={loading}
                >
                  <option value="">Select Year</option>
                  <option value="1">First Year</option>
                  <option value="2">Second Year</option>
                  <option value="3">Third Year</option>
                  <option value="4">Fourth Year</option>
                </select>
                {errors.year && <span className={styles.errorText}>{errors.year}</span>}
              </div>
            </div>
          </div>
        )}

        {/* Staff-Specific Fields */}
        {(formData.patientType === 'TEMP_STAFF' || formData.patientType === 'PERMANENT_STAFF') && (
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Staff Details</h3>
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  <FontAwesomeIcon icon={faIdCard} /> Employee ID
                </label>
                <input
                  type="text"
                  name="employeeId"
                  value={formData.employeeId}
                  onChange={handleChange}
                  className={`${styles.input} ${errors.employeeId ? styles.error : ''}`}
                  placeholder="EMP001"
                  disabled={loading}
                />
                {errors.employeeId && <span className={styles.errorText}>{errors.employeeId}</span>
                }                                                                                                                </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  <FontAwesomeIcon icon={faUserTie} /> Designation
                </label>
                <input
                  type="text"
                  name="designation"
                  value={formData.designation}
                  onChange={handleChange}
                  className={`${styles.input} ${errors.designation ? styles.error : ''}`}
                  placeholder="e.g., Assistant Professor"
                  disabled={loading}
                />
                {errors.designation && <span className={styles.errorText}>{errors.designation}</span>}                                                                                                              </div>
            </div>
          </div>
        )}

        {/* Family Details for Permanent Staff */}
        {showFamilySection && (
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h3 className={styles.sectionTitle}>
                <FontAwesomeIcon icon={faUsers} /> Family Members (Optional)
              </h3>
              <button
                type="button"
                onClick={addFamilyMember}
                className={styles.addButton}
                disabled={loading}
              >
                + Add Family Member
              </button>
            </div>

            {formData.familyMembers.map((member, index) => (
              <div key={index} className={styles.familyMemberCard}>
                <div className={styles.familyMemberHeader}>
                  <h4>Family Member {index + 1}</h4>
                  <button
                    type="button"
                    onClick={() => removeFamilyMember(index)}
                    className={styles.removeButton}
                    disabled={loading}
                  >
                    Remove
                  </button>
                </div>

                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Name</label>
                    <input
                      type="text"
                      value={member.name}
                      onChange={(e) => updateFamilyMember(index, 'name', e.target.value)}
                      className={styles.input}
                      placeholder="Family member name"
                      disabled={loading}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>Relation</label>
                    <select
                      value={member.relation}
                      onChange={(e) => updateFamilyMember(index, 'relation', e.target.value)}
                      className={styles.select}
                      disabled={loading}
                    >
                      <option value="">Select Relation</option>
                      <option value="SPOUSE">Spouse</option>
                      <option value="CHILD">Child</option>
                      <option value="PARENT">Parent</option>
                      <option value="SIBLING">Sibling</option>
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>Date of Birth</label>
                    <input
                      type="date"
                      value={member.dob}
                      onChange={(e) => updateFamilyMember(index, 'dob', e.target.value)}
                      className={styles.input}
                      disabled={loading}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>Phone (Optional)</label>
                    <input
                      type="tel"
                      value={member.phone}
                      onChange={(e) => updateFamilyMember(index, 'phone', e.target.value)}
                      className={styles.input}
                      placeholder="9876543210"
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Authentication</h3>

          <div className={styles.codeInputWrapper}>
            <input
              type="password"
              name="staffCode"
              placeholder="Enter staff code"
              value={formData.staffCode}
              onChange={handleChange}
              className={`${styles.input}
                ${isCodeValid === true ? styles.inputValid : ''}
                ${isCodeValid === false ? styles.inputInvalid : ''}
                ${errors.staffCode ? styles.error : ''}`}
              disabled={loading}
            />

            {isValidating && <div className={styles.smallSpinner}></div>}
            {isCodeValid === true && (
              <FontAwesomeIcon icon={faCheck} className={styles.validIcon} />
            )}
            {isCodeValid === false && (
              <FontAwesomeIcon icon={faExclamationCircle} className={styles.invalidIcon} />
            )}
          </div>
          {errors.staffCode && <span className={styles.errorText}>{errors.staffCode}</span>}
        </div>


        <button
          type="submit"
          className={styles.submitButton}
          disabled={loading || isCodeValid !== true}
        >
          {loading ? 'Registering...' : '+ Register Patient'}
        </button>
      </form>
    </div>
  );
};

export default RegisterPatientForm;

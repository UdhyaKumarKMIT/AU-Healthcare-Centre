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
import styles from './RegisterPatientForm.module.css';

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
};

const RegisterPatientForm = () => {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});
  const [showFamilySection, setShowFamilySection] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isCodeValid, setIsCodeValid] = useState(null);
  const [isValidating, setIsValidating] = useState(false);

  useEffect(() => {
    setShowFamilySection(formData.patientType === 'PERMANENT_STAFF');
  }, [formData.patientType]);

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
      familyMembers: prev.familyMembers.map((m, i) =>
        i === index ? { ...m, [field]: value } : m
      )
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.dob) newErrors.dob = 'Date of birth is required';
    if (!formData.gender) newErrors.gender = 'Gender is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';

    if (!formData.secretCode.trim()) {
      newErrors.secretCode = 'Staff code is required';
    } else if (isCodeValid !== true) {
      newErrors.secretCode = 'Please enter a valid staff code';
    }

    if (formData.patientType === 'STUDENT') {
      if (!formData.rollNo.trim()) newErrors.rollNo = 'Roll number is required';
      if (!formData.department.trim()) newErrors.department = 'Department is required';
      if (!formData.year) newErrors.year = 'Year is required';
    } else {
      if (!formData.employeeId.trim()) newErrors.employeeId = 'Employee ID is required';
      if (!formData.designation.trim()) newErrors.designation = 'Designation is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return toast.error('Fix validation errors');

    setLoading(true);

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
    };

    const result = await dispatch(registerPatient(payload));
    setLoading(false);

    if (result.meta.requestStatus === 'fulfilled') {
      toast.success('Patient registered successfully');
      setFormData(initialFormState);
      setErrors({});
      setIsCodeValid(null);
      setShowFamilySection(false);
    } else {
      toast.error(result.payload || 'Failed to register patient');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>
          <FontAwesomeIcon icon={faUser} /> Register New Patient
        </h2>
      </div>

      <div className={styles.form}>

        {/* Basic Information */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Basic Information</h3>

          <div className={styles.formGrid}>
            <input
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleChange}
              className={`${styles.input} ${errors.name ? styles.errorInput : ''}`}
            />

            <input
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className={`${styles.input} ${errors.email ? styles.errorInput : ''}`}
            />

            <input
              type="date"
              name="dob"
              value={formData.dob}
              onChange={handleChange}
              className={`${styles.input} ${errors.dob ? styles.errorInput : ''}`}
            />

            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className={`${styles.select} ${errors.gender ? styles.errorInput : ''}`}
            >
              <option value="">Gender</option>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
        </div>

        {/* Secret Code */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Authentication</h3>

          <div className={styles.codeInputWrapper}>
            <input
              type="password"
              name="secretCode"
              placeholder="Enter staff code"
              value={formData.secretCode}
              onChange={handleChange}
              className={`${styles.input}
                ${isCodeValid === true ? styles.inputValid : ''}
                ${isCodeValid === false ? styles.inputInvalid : ''}
                ${errors.secretCode ? styles.errorInput : ''}`}
            />

            {isValidating && <div className={styles.smallSpinner}></div>}
            {isCodeValid === true && <FontAwesomeIcon icon={faCheck} className={styles.validIcon} />}
            {isCodeValid === false && <FontAwesomeIcon icon={faExclamationCircle} className={styles.invalidIcon} />}
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading || isCodeValid !== true}
          className={`${styles.submitButton} ${
            loading || isCodeValid !== true ? styles.submitButtonDisabled : ''
          }`}
        >
          {loading ? 'Registering...' : '+ Register Patient'}
        </button>

      </div>
    </div>
  );
};

export default RegisterPatientForm;

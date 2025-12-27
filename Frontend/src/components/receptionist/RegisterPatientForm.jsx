import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUser, 
  faIdCard, 
  faCalendar, 
  faVenusMars, 
  faTint, 
  faPhone, 
  faPhoneSquare 
} from '@fortawesome/free-solid-svg-icons';
import { registerPatient, clearRegisterSuccess } from '../../store/slices/patientsSlice';
import styles from './RegisterPatientForm.module.css';

const RegisterPatientForm = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error, registerSuccess } = useSelector(state => state.patients);
  
  const [formData, setFormData] = useState({
    name: '',
    rollNo: '',
    dob: '',
    gender: '',
    bloodGroup: '',
    phone: '',
    emergencyContact: '',
  });
  
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (registerSuccess) {
      alert('Patient registered successfully!');
      setFormData({
        name: '',
        rollNo: '',
        dob: '',
        gender: '',
        bloodGroup: '',
        phone: '',
        emergencyContact: '',
      });
      dispatch(clearRegisterSuccess());
    }
  }, [registerSuccess, dispatch]);

  useEffect(() => {
    if (error) {
      alert('Error: ' + error);
    }
  }, [error]);

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
    
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.rollNo.trim()) newErrors.rollNo = 'Roll number is required';
    if (!formData.dob) newErrors.dob = 'Date of birth is required';
    if (!formData.gender) newErrors.gender = 'Gender is required';
    if (!formData.bloodGroup) newErrors.bloodGroup = 'Blood group is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.emergencyContact.trim()) newErrors.emergencyContact = 'Emergency contact is required';
    
    const phoneRegex = /^\d{10}$/;
    if (formData.phone && !phoneRegex.test(formData.phone)) {
      newErrors.phone = 'Enter a valid 10-digit phone number';
    }
    
    if (formData.emergencyContact && !phoneRegex.test(formData.emergencyContact)) {
      newErrors.emergencyContact = 'Enter a valid 10-digit number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    dispatch(registerPatient(formData));
  };

  const handleNavigateToRegisterPage = () => {
    navigate('/reception/register-patient');
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Register New Patient</h2>
        <button 
          className={styles.fullFormButton}
          onClick={handleNavigateToRegisterPage}
        >
          Open Full Form →
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className={styles.form}>
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
              placeholder="Enter patient's full name"
              disabled={loading}
            />
            {errors.name && <span className={styles.errorText}>{errors.name}</span>}
          </div>

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
              placeholder="AU12345"
              disabled={loading}
            />
            {errors.rollNo && <span className={styles.errorText}>{errors.rollNo}</span>}
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
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
            {errors.gender && <span className={styles.errorText}>{errors.gender}</span>}
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>
              <FontAwesomeIcon icon={faTint} /> Blood Group
            </label>
            <select
              name="bloodGroup"
              value={formData.bloodGroup}
              onChange={handleChange}
              className={`${styles.select} ${errors.bloodGroup ? styles.error : ''}`}
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
            {errors.bloodGroup && <span className={styles.errorText}>{errors.bloodGroup}</span>}
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
            <label className={styles.label}>
              <FontAwesomeIcon icon={faPhoneSquare} /> Emergency Contact
            </label>
            <input
              type="tel"
              name="emergencyContact"
              value={formData.emergencyContact}
              onChange={handleChange}
              className={`${styles.input} ${errors.emergencyContact ? styles.error : ''}`}
              placeholder="9876543211"
              disabled={loading}
            />
            {errors.emergencyContact && <span className={styles.errorText}>{errors.emergencyContact}</span>}
          </div>
        </div>

        <button
          type="submit"
          className={styles.submitButton}
          disabled={loading}
        >
          {loading ? 'Registering...' : '+ Register Patient'}
        </button>
      </form>
    </div>
  );
};

export default RegisterPatientForm;
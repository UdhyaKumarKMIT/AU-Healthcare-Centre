// src/pages/admin/DoctorManagement.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDoctors, createDoctor } from '../../store/slices/adminSlice';
import styles from './DoctorManagement.module.css';

const DoctorManagement = () => {
  const dispatch = useDispatch();
  const { doctors, doctorsLoading, error } = useSelector((state) => state.admin);
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [newDoctor, setNewDoctor] = useState({
    name: '',
    specialization: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  useEffect(() => {
    console.log('👨‍⚕️ Fetching doctors...');
    dispatch(fetchDoctors());
  }, [dispatch]);

  useEffect(() => {
    console.log('👨‍⚕️ Doctors from Redux:', doctors);
  }, [doctors]);

  const getStatusBadge = (status) => {
    return status === 'active' 
      ? <span className={styles.statusActive}>Active</span>
      : <span className={styles.statusInactive}>Inactive</span>;
  };

  const getAvailabilityBadge = (availability) => {
    return availability === 'AVAILABLE'
      ? <span className={styles.available}>Available</span>
      : <span className={styles.unavailable}>Unavailable</span>;
  };

  const validateForm = () => {
    if (!newDoctor.name.trim()) {
      setFormError('Name is required');
      return false;
    }

    if (!newDoctor.specialization.trim()) {
      setFormError('Specialization is required');
      return false;
    }

    if (!newDoctor.phone.trim()) {
      setFormError('Phone number is required');
      return false;
    }

    // Basic phone validation (10 digits)
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(newDoctor.phone.replace(/\D/g, ''))) {
      setFormError('Phone number must be 10 digits');
      return false;
    }

    if (!newDoctor.email.trim()) {
      setFormError('Email is required');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newDoctor.email)) {
      setFormError('Invalid email format');
      return false;
    }

    if (!newDoctor.password) {
      setFormError('Password is required');
      return false;
    }

    if (newDoctor.password.length < 6) {
      setFormError('Password must be at least 6 characters');
      return false;
    }

    if (newDoctor.password !== newDoctor.confirmPassword) {
      setFormError('Passwords do not match');
      return false;
    }

    return true;
  };

  const handleAddDoctor = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!validateForm()) {
      return;
    }

    try {
      setFormLoading(true);
      
      const doctorData = {
        name: newDoctor.name.trim(),
        email: newDoctor.email.trim().toLowerCase(),
        password: newDoctor.password,
        phone: newDoctor.phone.trim(),
        specialization: newDoctor.specialization.trim()
      };

      console.log('📤 Creating doctor:', doctorData);
      
      await dispatch(createDoctor(doctorData)).unwrap();
      
      console.log('✅ Doctor created successfully');
      
      // Reset form and close modal
      setNewDoctor({ 
        name: '', 
        specialization: '',
        phone: '', 
        email: '', 
        password: '', 
        confirmPassword: '' 
      });
      setShowAddForm(false);
      
      // Refresh the doctors list
      await dispatch(fetchDoctors());
      
      alert('Doctor created successfully!');
    } catch (error) {
      console.error('❌ Error creating doctor:', error);
      setFormError(error || 'Failed to create doctor');
    } finally {
      setFormLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowAddForm(false);
    setFormError('');
    setNewDoctor({ 
      name: '', 
      specialization: '',
      phone: '', 
      email: '', 
      password: '', 
      confirmPassword: '' 
    });
  };

  if (doctorsLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Loading doctors...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.errorContainer}>
          <p>Error loading doctors: {error}</p>
          <button onClick={() => dispatch(fetchDoctors())}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Doctor Management</h1>
          <p className={styles.subtitle}>Manage doctors and their availability</p>
        </div>
        <button 
          className={styles.addButton}
          onClick={() => setShowAddForm(true)}
        >
          + Add New Doctor
        </button>
      </div>

      {/* Add Doctor Form (Modal) */}
      {showAddForm && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3>Add New Doctor</h3>
              <button 
                className={styles.closeButton}
                onClick={handleCloseModal}
                type="button"
              >
                ✕
              </button>
            </div>
            
            {formError && (
              <div className={styles.errorAlert}>
                {formError}
              </div>
            )}

            <form onSubmit={handleAddDoctor} className={styles.form}>
              <div className={styles.formGroup}>
                <label>Full Name *</label>
                <input
                  type="text"
                  value={newDoctor.name}
                  onChange={(e) => setNewDoctor({...newDoctor, name: e.target.value})}
                  placeholder="Dr. John Smith"
                  required
                  disabled={formLoading}
                />
              </div>
              
              <div className={styles.formGroup}>
                <label>Specialization *</label>
                <input
                  type="text"
                  value={newDoctor.specialization}
                  onChange={(e) => setNewDoctor({...newDoctor, specialization: e.target.value})}
                  placeholder="Cardiology"
                  required
                  disabled={formLoading}
                />
              </div>
              
              <div className={styles.formGroup}>
                <label>Phone Number *</label>
                <input
                  type="tel"
                  value={newDoctor.phone}
                  onChange={(e) => setNewDoctor({...newDoctor, phone: e.target.value})}
                  placeholder="9876543210"
                  required
                  disabled={formLoading}
                />
              </div>
              
              <div className={styles.formGroup}>
                <label>Email Address *</label>
                <input
                  type="email"
                  value={newDoctor.email}
                  onChange={(e) => setNewDoctor({...newDoctor, email: e.target.value})}
                  placeholder="doctor@hospital.com"
                  required
                  disabled={formLoading}
                />
              </div>
              
              <div className={styles.formGroup}>
                <label>Password *</label>
                <input
                  type="password"
                  value={newDoctor.password}
                  onChange={(e) => setNewDoctor({...newDoctor, password: e.target.value})}
                  placeholder="Minimum 6 characters"
                  required
                  minLength={6}
                  disabled={formLoading}
                />
              </div>
              
              <div className={styles.formGroup}>
                <label>Confirm Password *</label>
                <input
                  type="password"
                  value={newDoctor.confirmPassword}
                  onChange={(e) => setNewDoctor({...newDoctor, confirmPassword: e.target.value})}
                  placeholder="Re-enter password"
                  required
                  disabled={formLoading}
                />
              </div>

              <div className={styles.formActions}>
                <button 
                  type="button" 
                  onClick={handleCloseModal}
                  disabled={formLoading}
                  className={styles.cancelButton}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className={styles.submitButton}
                  disabled={formLoading}
                >
                  {formLoading ? 'Creating...' : 'Add Doctor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Doctors Table */}
      <div className={styles.tableContainer}>
        {doctors.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No doctors found</p>
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Doctor Name</th>
                <th>Specialization</th>
                <th>Contact</th>
                <th>Status</th>
                <th>Availability</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {doctors.map((doctor) => (
                <tr key={doctor.id}>
                  <td>
                    <div className={styles.doctorCell}>
                      <div className={styles.doctorAvatar}>
                        {doctor.name.charAt(0)}
                      </div>
                      <div>
                        <strong>{doctor.name}</strong>
                        <div className={styles.doctorEmail}>{doctor.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>{doctor.specialization}</td>
                  <td>{doctor.phone}</td>
                  <td>{getStatusBadge(doctor.status)}</td>
                  <td>{getAvailabilityBadge(doctor.availability)}</td>
                  <td>
                    <div className={styles.actions}>
                      <button className={styles.editButton}>
                        Edit
                      </button>
                      <button className={styles.disableButton}>
                        {doctor.status === 'active' ? 'Disable' : 'Enable'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default DoctorManagement;
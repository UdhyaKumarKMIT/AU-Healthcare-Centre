// src/pages/admin/DoctorManagement.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDoctors } from '../../store/slices/adminSlice';
import styles from './DoctorManagement.module.css';

const DoctorManagement = () => {
  const dispatch = useDispatch();
  const { doctors, doctorsLoading, error } = useSelector((state) => state.admin);
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [newDoctor, setNewDoctor] = useState({
    name: '',
    specialization: '',
    phone: '',
    email: '',
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

  const handleAddDoctor = (e) => {
    e.preventDefault();
    // TODO: Implement create doctor via admin API
    alert('Create doctor functionality - to be implemented');
    setShowAddForm(false);
    setNewDoctor({ name: '', specialization: '', phone: '', email: '' });
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
                onClick={() => setShowAddForm(false)}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleAddDoctor} className={styles.form}>
              <div className={styles.formGroup}>
                <label>Full Name *</label>
                <input
                  type="text"
                  value={newDoctor.name}
                  onChange={(e) => setNewDoctor({...newDoctor, name: e.target.value})}
                  placeholder="Dr. John Smith"
                  required
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
                />
              </div>
              <div className={styles.formActions}>
                <button type="button" onClick={() => setShowAddForm(false)}>
                  Cancel
                </button>
                <button type="submit" className={styles.submitButton}>
                  Add Doctor
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
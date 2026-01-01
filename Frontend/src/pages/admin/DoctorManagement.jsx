// src/pages/admin/DoctorManagement.jsx
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDoctors } from '../../store/slices/adminSlice';
import styles from './DoctorManagement.module.css';
import { useNavigate } from 'react-router-dom';

const DoctorManagement = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate(); // ✅ INSIDE component

  const { doctors, doctorsLoading, error } = useSelector(
    (state) => state.admin
  );

  useEffect(() => {
    dispatch(fetchDoctors());
  }, [dispatch]);

  const getStatusBadge = (status) =>
    status === 'active'
      ? <span className={styles.statusActive}>Active</span>
      : <span className={styles.statusInactive}>Inactive</span>;

  const getAvailabilityBadge = (availability) =>
    availability === 'AVAILABLE'
      ? <span className={styles.available}>Available</span>
      : <span className={styles.unavailable}>Unavailable</span>;

  if (doctorsLoading) {
    return (
      <div className={styles.container}>
        <p>Loading doctors...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <p>Error: {error}</p>
        <button onClick={() => dispatch(fetchDoctors())}>Retry</button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Doctor Management</h1>
          <p className={styles.subtitle}>
            Manage doctors and their availability
          </p>
        </div>

        <button
          className={styles.addButton}
          onClick={() => navigate('/admin/users/add?role=DOCTOR')}
        >
          + Add Doctor
        </button>
      </div>

      <div className={styles.tableContainer}>
        {doctors.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No doctors found</p>
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Specialization</th>
                <th>Phone</th>
                <th>Status</th>
                <th>Availability</th>
              </tr>
            </thead>
            <tbody>
              {doctors.map((doctor) => (
                <tr key={doctor.doctor_id}>
                  <td>{doctor.name}</td>
                  <td>{doctor.specialization}</td>
                  <td>{doctor.phone}</td>
                  <td>{getStatusBadge(doctor.status)}</td>
                  <td>{getAvailabilityBadge(doctor.availability_status)}</td>
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

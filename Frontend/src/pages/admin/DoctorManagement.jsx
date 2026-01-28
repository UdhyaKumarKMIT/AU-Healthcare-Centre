// src/pages/admin/DoctorManagement.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faPlus, faUserMd } from '@fortawesome/free-solid-svg-icons';
import { fetchDoctors } from '../../store/slices/adminSlice';
import ReceptionistStats from '../../components/Admin/ReceptionistStats';
import ReceptionistTable from '../../components/Admin/ReceptionistTable';
import styles from './ReceptionistManagement.module.css';

const DoctorManagement = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { doctors, doctorsLoading, error } = useSelector((state) => state.admin);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    dispatch(fetchDoctors());
  }, [dispatch]);

  const doctorStats = {
    total: doctors.length,
    active: doctors.filter(d => d.status === 'active').length,
    inactive: doctors.filter(d => d.status === 'inactive').length,
    onDuty: doctors.filter(d => d.availability === 'AVAILABLE').length,
    avgPatientsPerDay: 0, // Could calculate from visits data if available
    efficiency: 97
  };

  const filteredDoctors = doctors.filter(doctor =>
    doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doctor.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doctor.specialization.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Transform doctors data to match receptionist table format
  const transformedDoctors = filteredDoctors.map(doctor => ({
    id: doctor.doctor_id,
    name: doctor.name,
    email: doctor.email,
    employeeId: `DR-${doctor.doctor_id.substring(0, 6)}`,
    shift: doctor.specialization,
    patientsToday: 0, // Could be populated from visits data
    status: doctor.status,
    phone: doctor.phone,
    availability: doctor.availability,
    avatar: doctor.name.charAt(0).toUpperCase()
  }));

  if (doctorsLoading) {
    return (
      <div className={styles.receptionistManagement}>
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Loading doctors...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.receptionistManagement}>
        <p>Error: {error}</p>
        <button onClick={() => dispatch(fetchDoctors())}>Retry</button>
      </div>
    );
  }

  return (
    <div className={styles.receptionistManagement}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}><FontAwesomeIcon icon={faUserMd} /> Doctor Management</h1>
          <p className={styles.subtitle}>
            Manage doctors and their availability
          </p>
        </div>

        <button
          className={styles.addButton}
          onClick={() => navigate('/admin/users/add?role=DOCTOR')}
        >
          <FontAwesomeIcon icon={faPlus} /> Add Doctor
        </button>
      </div>

      <section className={styles.statsSection}>
        <ReceptionistStats 
          stats={doctorStats}
          title="Doctor Statistics"
          labels={{
            onDuty: 'Available',
            avgPatientsPerDay: 'Avg Patients/Day'
          }}
        />
      </section>

      <section className={styles.filtersSection}>
        <div className={styles.searchBox}>
          <input
            className={styles.searchInput}
            placeholder="Search doctors by name, email, or specialization..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <span className={styles.searchIcon}>
            <FontAwesomeIcon icon={faSearch} />
          </span>
        </div>
      </section>

      <section className={styles.tableSection}>
        {transformedDoctors.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No doctors found matching your search.</p>
          </div>
        ) : (
          <ReceptionistTable
            receptionists={transformedDoctors}
            onView={(id) => navigate(`/admin/doctors/${id}`)}
            onEdit={(id) => navigate(`/admin/doctors/${id}/edit`)}
            roleLabel="Doctor"
            columnHeaders={{
              employeeId: 'Doctor ID',
              shift: 'Specialization',
              patientsToday: 'Patients Today'
            }}
            showAvailability={true}
          />
        )}
      </section>
    </div>
  );
};

export default DoctorManagement;
// src/pages/admin/NursesManagement.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faPlus, faUserNurse } from '@fortawesome/free-solid-svg-icons';
import { fetchNurses } from '../../store/slices/adminSlice';
import ReceptionistStats from '../../components/Admin/ReceptionistStats';
import ReceptionistTable from '../../components/Admin/ReceptionistTable';
import styles from './ReceptionistManagement.module.css';

const NursesManagement = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { nurses, nursesLoading, error } = useSelector((state) => state.admin);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    dispatch(fetchNurses());
  }, [dispatch]);

  const nurseStats = {
    total: nurses.length,
    active: nurses.filter(n => n.status === 'active').length,
    inactive: nurses.filter(n => n.status === 'inactive').length,
    onDuty: nurses.filter(n => n.tasksToday > 0).length,
    avgPatientsPerDay: nurses.length
      ? Math.round(
          nurses.reduce((s, n) => s + (n.tasksToday || 0), 0) / nurses.length
        )
      : 0,
    efficiency: 95
  };

  const filteredNurses = nurses.filter(nurse =>
    nurse.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    nurse.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    nurse.register_number.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Transform nurses data to match receptionist table format
  const transformedNurses = filteredNurses.map(nurse => ({
    id: nurse.nurse_id,
    name: nurse.name,
    email: nurse.email,
    employeeId: nurse.register_number,
    shift: nurse.qualification,
    patientsToday: nurse.tasksToday || 0,
    status: nurse.status,
    phone: nurse.phone,
    avatar: nurse.name.charAt(0).toUpperCase()
  }));

  if (nursesLoading) {
    return (
      <div className={styles.receptionistManagement}>
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Loading nurses...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.receptionistManagement}>
        <p>Error: {error}</p>
        <button onClick={() => dispatch(fetchNurses())}>Retry</button>
      </div>
    );
  }

  return (
    <div className={styles.receptionistManagement}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}><FontAwesomeIcon icon={faUserNurse} /> Nurses Management</h1>
          <p className={styles.subtitle}>
            Manage nursing staff and their assignments
          </p>
        </div>

        <button
          className={styles.addButton}
          onClick={() => navigate('/admin/users/add?role=NURSE')}
        >
          <FontAwesomeIcon icon={faPlus} /> Add Nurse
        </button>
      </div>

      <section className={styles.statsSection}>
        <ReceptionistStats 
          stats={nurseStats}
          title="Nurse Statistics"
          labels={{
            onDuty: 'On Duty',
            avgPatientsPerDay: 'Avg Tasks/Day'
          }}
        />
      </section>

      <section className={styles.filtersSection}>
        <div className={styles.searchBox}>
          <input
            className={styles.searchInput}
            placeholder="Search nurses by name, email, or registration number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <span className={styles.searchIcon}>
            <FontAwesomeIcon icon={faSearch} />
          </span>
        </div>
      </section>

      <section className={styles.tableSection}>
        {transformedNurses.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No nurses found matching your search.</p>
          </div>
        ) : (
          <ReceptionistTable
            receptionists={transformedNurses}
            onView={(id) => navigate(`/admin/nurses/${id}`)}
            onEdit={(id) => navigate(`/admin/nurses/${id}/edit`)}
            roleLabel="Nurse"
            columnHeaders={{
              employeeId: 'Registration No.',
              shift: 'Qualification',
              patientsToday: 'Tasks Today'
            }}
          />
        )}
      </section>
    </div>
  );
};

export default NursesManagement;
// src/pages/admin/PharmacistsManagement.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faPlus } from '@fortawesome/free-solid-svg-icons';
import { fetchPharmacists } from '../../store/slices/adminSlice';
import ReceptionistStats from '../../components/Admin/ReceptionistStats';
import ReceptionistTable from '../../components/Admin/ReceptionistTable';
import styles from './ReceptionistManagement.module.css';

const PharmacistsManagement = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { pharmacists, pharmacistsLoading, error } = useSelector((state) => state.admin);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    dispatch(fetchPharmacists());
  }, [dispatch]);

  const pharmacistStats = {
    total: pharmacists.length,
    active: pharmacists.filter(p => p.status === 'active').length,
    inactive: pharmacists.filter(p => p.status === 'inactive').length,
    onDuty: pharmacists.filter(p => p.transactionsToday > 0).length,
    avgPatientsPerDay: pharmacists.length
      ? Math.round(
          pharmacists.reduce((s, p) => s + (p.transactionsToday || 0), 0) / 
          pharmacists.length
        )
      : 0,
    efficiency: 93
  };

  const filteredPharmacists = pharmacists.filter(pharmacist =>
    pharmacist.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pharmacist.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Transform pharmacists data to match receptionist table format
  const transformedPharmacists = filteredPharmacists.map(pharmacist => ({
    id: pharmacist.pharmacist_id,
    name: pharmacist.name,
    email: pharmacist.email,
    employeeId: `PH-${pharmacist.pharmacist_id.toString().substring(0, 6)}`,
    shift: pharmacist.phone || 'N/A',
    patientsToday: pharmacist.transactionsToday || 0,
    status: pharmacist.status,
    phone: pharmacist.phone,
    avatar: pharmacist.name.charAt(0).toUpperCase()
  }));

  if (pharmacistsLoading) {
    return (
      <div className={styles.receptionistManagement}>
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Loading pharmacists...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.receptionistManagement}>
        <p>Error: {error}</p>
        <button onClick={() => dispatch(fetchPharmacists())}>Retry</button>
      </div>
    );
  }

  return (
    <div className={styles.receptionistManagement}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>💊 Pharmacists Management</h1>
          <p className={styles.subtitle}>
            Manage pharmacy staff and medicine dispensing
          </p>
        </div>

        <button
          className={styles.addButton}
          onClick={() => navigate('/admin/users/add?role=PHARMACIST')}
        >
          <FontAwesomeIcon icon={faPlus} /> Add Pharmacist
        </button>
      </div>

      <section className={styles.statsSection}>
        <ReceptionistStats 
          stats={pharmacistStats}
          title="Pharmacist Statistics"
          labels={{
            onDuty: 'Active Today',
            avgPatientsPerDay: 'Avg Transactions/Day'
          }}
        />
      </section>

      <section className={styles.filtersSection}>
        <div className={styles.searchBox}>
          <input
            className={styles.searchInput}
            placeholder="Search pharmacists by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <span className={styles.searchIcon}>
            <FontAwesomeIcon icon={faSearch} />
          </span>
        </div>
      </section>

      <section className={styles.tableSection}>
        {transformedPharmacists.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No pharmacists found matching your search.</p>
          </div>
        ) : (
          <ReceptionistTable
            receptionists={transformedPharmacists}
            onView={(id) => navigate(`/admin/pharmacists/${id}`)}
            onEdit={(id) => navigate(`/admin/pharmacists/${id}/edit`)}
            columnHeaders={{
              employeeId: 'Employee ID',
              shift: 'Phone',
              patientsToday: 'Transactions Today'
            }}
          />
        )}
      </section>
    </div>
  );
};

export default PharmacistsManagement;
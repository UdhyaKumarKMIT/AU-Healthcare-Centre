import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faPlus } from '@fortawesome/free-solid-svg-icons';
import { fetchReceptionists } from '../../store/slices/adminSlice';
import ReceptionistStats from '../../components/Admin/ReceptionistStats';
import ReceptionistTable from '../../components/Admin/ReceptionistTable';
import styles from './ReceptionistManagement.module.css';

const ReceptionistManagement = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { receptionists, receptionistsLoading, error } = useSelector(
    (state) => state.admin
  );

  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    dispatch(fetchReceptionists());
  }, [dispatch]);

  const receptionistStats = {
    total: receptionists.length,
    active: receptionists.filter(r => r.status === 'active').length,
    inactive: receptionists.filter(r => r.status === 'inactive').length,
    onDuty: receptionists.filter(r => r.status === 'onduty').length,
    avgPatientsPerDay: receptionists.length
      ? Math.round(
          receptionists.reduce((s, r) => s + (r.patientsToday || 0), 0) /
            receptionists.length
        )
      : 0,
    efficiency: 92
  };

  const filteredReceptionists = receptionists.filter(r =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (receptionistsLoading) {
    return (
      <div className={styles.receptionistManagement}>
        <p>Loading receptionists...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.receptionistManagement}>
        <p>Error: {error}</p>
        <button onClick={() => dispatch(fetchReceptionists())}>Retry</button>
      </div>
    );
  }

  return (
    <div className={styles.receptionistManagement}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Receptionist Management</h1>
          <p className={styles.subtitle}>
            Manage receptionist accounts and activity
          </p>
        </div>

        <button
          className={styles.addButton}
          onClick={() => navigate('/admin/users/add?role=RECEPTIONIST')}
        >
          <FontAwesomeIcon icon={faPlus} /> Add Receptionist
        </button>
      </div>

      <section className={styles.statsSection}>
        <ReceptionistStats stats={receptionistStats} />
      </section>

      <section className={styles.filtersSection}>
        <div className={styles.searchBox}>
          <input
            className={styles.searchInput}
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <span className={styles.searchIcon}>
            <FontAwesomeIcon icon={faSearch} />
          </span>
        </div>
      </section>

      <section className={styles.tableSection}>
        {filteredReceptionists.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No receptionists found</p>
          </div>
        ) : (
          <ReceptionistTable
            receptionists={filteredReceptionists}
            onView={(id) => navigate(`/admin/receptionists/${id}`)}
            onEdit={(id) => navigate(`/admin/receptionists/${id}/edit`)}
          />
        )}
      </section>
    </div>
  );
};

export default ReceptionistManagement;

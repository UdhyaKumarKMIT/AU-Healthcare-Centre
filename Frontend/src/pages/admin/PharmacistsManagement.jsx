// src/pages/admin/PharmacistsManagement.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchPharmacists } from '../../store/slices/adminSlice';
import styles from './StaffManagement.module.css';

const PharmacistsManagement = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { pharmacists, pharmacistsLoading, error } = useSelector(
    (state) => state.admin
  );
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    dispatch(fetchPharmacists());
  }, [dispatch]);

  const filteredPharmacists = pharmacists.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={styles.staffManagement}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>💊 Pharmacists Management</h1>
          <p className={styles.subtitle}>
            Manage pharmacy staff and medicine dispensing
          </p>
        </div>
        <button
          className={styles.addButton}
          onClick={() => navigate('/admin/users/add?role=pharmacist')}
        >
          + Add Pharmacist
        </button>
      </div>

      {error && <div className={styles.errorAlert}>✗ {error}</div>}

      <div className={styles.searchBox}>
        <input
          className={styles.searchInput}
          placeholder="Search pharmacists..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <span className={styles.searchIcon}>🔍</span>
      </div>

      {pharmacistsLoading ? (
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Loading pharmacists...</p>
        </div>
      ) : (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Transactions</th>
                <th>Status</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {filteredPharmacists.map(p => (
                <tr key={p.pharmacist_id}>
                  <td>{p.name}</td>
                  <td>{p.email}</td>
                  <td>{p.phone}</td>
                  <td>{p.transactionsToday || 0}</td>
                  <td>{p.status}</td>
                  <td>
                    {p.joinedDate
                      ? new Date(p.joinedDate).toLocaleDateString()
                      : 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PharmacistsManagement;

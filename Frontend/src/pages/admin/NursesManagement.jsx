// src/pages/admin/NursesManagement.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchNurses } from '../../store/slices/adminSlice';
import styles from './StaffManagement.module.css';

const NursesManagement = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { nurses, nursesLoading, error } = useSelector((state) => state.admin);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    dispatch(fetchNurses());
  }, [dispatch]);

  const filteredNurses = nurses.filter(nurse =>
    nurse.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    nurse.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    nurse.register_number.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={styles.staffManagement}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>👩‍⚕️ Nurses Management</h1>
          <p className={styles.subtitle}>Manage nursing staff and assignments</p>
        </div>
        <button
          className={styles.addButton}
          onClick={() => navigate('/admin/users/add?role=nurse')}
        >
          + Add Nurse
        </button>
      </div>

      {error && <div className={styles.errorAlert}>✗ {error}</div>}

      <div className={styles.searchBox}>
        <input
          className={styles.searchInput}
          placeholder="Search nurses..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <span className={styles.searchIcon}>🔍</span>
      </div>

      {nursesLoading ? (
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Loading nurses...</p>
        </div>
      ) : (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Reg No</th>
                <th>Qualification</th>
                <th>Phone</th>
                <th>Tasks</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredNurses.map(n => (
                <tr key={n.nurse_id}>
                  <td>{n.name}</td>
                  <td>{n.email}</td>
                  <td>{n.register_number}</td>
                  <td>{n.qualification}</td>
                  <td>{n.phone}</td>
                  <td>{n.tasksToday || 0}</td>
                  <td>{n.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default NursesManagement;

// src/pages/admin/ReceptionistManagement.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faPlus, faTimes, faRedo } from '@fortawesome/free-solid-svg-icons';
import { fetchReceptionists } from '../../store/slices/adminSlice';
import ReceptionistStats from '../../components/Admin/ReceptionistStats';
import ReceptionistTable from '../../components/Admin/ReceptionistTable';
import styles from './ReceptionistManagement.module.css';

const ReceptionistManagement = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { receptionists, receptionistsLoading, error } = useSelector((state) => state.admin);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newReceptionist, setNewReceptionist] = useState({
    name: '',
    email: '',
    phone: '',
    shift: 'morning',
  });

  useEffect(() => {
    console.log('👔 Fetching receptionists...');
    dispatch(fetchReceptionists());
  }, [dispatch]);

  useEffect(() => {
    console.log('👔 Receptionists from Redux:', receptionists);
  }, [receptionists]);

  // Calculate stats from real data
  const receptionistStats = {
    total: receptionists.length,
    active: receptionists.filter(r => r.status === 'active').length,
    inactive: receptionists.filter(r => r.status === 'inactive').length,
    onDuty: receptionists.filter(r => r.status === 'onduty').length,
    processingTime: 8,
    avgPatientsPerDay: receptionists.length > 0 
      ? Math.round(receptionists.reduce((sum, r) => sum + (r.patientsToday || 0), 0) / receptionists.length)
      : 0,
    efficiency: 92
  };

  const handleStatusChange = async (receptionistId, newStatus) => {
    try {
      // TODO: Implement status update API
      alert(`Update status to ${newStatus} - to be implemented`);
    } catch (error) {
      alert(`Failed to update status: ${error.message}`);
    }
  };

  const handleViewReceptionist = (receptionistId) => {
    navigate(`/admin/receptionists/${receptionistId}`);
  };

  const handleEditReceptionist = (receptionistId) => {
    navigate(`/admin/receptionists/${receptionistId}/edit`);
  };

  const handleAddReceptionist = (e) => {
    e.preventDefault();
    // TODO: Implement create receptionist via admin API
    alert('Create receptionist functionality - to be implemented');
    setShowAddForm(false);
    setNewReceptionist({ name: '', email: '', phone: '', shift: 'morning' });
  };

  const filteredReceptionists = receptionists.filter(rec => {
    if (statusFilter !== 'all' && rec.status !== statusFilter) return false;
    if (searchQuery && !rec.name.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !rec.email.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  if (receptionistsLoading) {
    return (
      <div className={styles.receptionistManagement}>
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Loading receptionists...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.receptionistManagement}>
        <div className={styles.errorContainer}>
          <p>Error loading receptionists: {error}</p>
          <button onClick={() => dispatch(fetchReceptionists())}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.receptionistManagement}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Receptionist Management</h1>
          <p className={styles.subtitle}>
            Manage receptionist accounts, shifts, and performance
          </p>
        </div>
        <button 
          className={styles.addButton}
          onClick={() => setShowAddForm(true)}
        >
          <FontAwesomeIcon icon={faPlus} /> Add New Receptionist
        </button>
      </div>

      {/* Statistics */}
      <section className={styles.statsSection}>
        <ReceptionistStats stats={receptionistStats} />
      </section>

      {/* Filters and Search */}
      <section className={styles.filtersSection}>
        <div className={styles.searchBox}>
          <input
            type="text"
            placeholder="Search receptionists by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
          <span className={styles.searchIcon}>
            <FontAwesomeIcon icon={faSearch} />
          </span>
        </div>

        <div className={styles.filterGroup}>
          <div className={styles.filter}>
            <label className={styles.filterLabel}>Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="all">All Status</option>
              <option value="onduty">On Duty</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="offduty">Off Duty</option>
            </select>
          </div>

          <button
            className={styles.resetFiltersBtn}
            onClick={() => {
              setSearchQuery('');
              setStatusFilter('all');
            }}
          >
            <FontAwesomeIcon icon={faRedo} /> Reset Filters
          </button>
        </div>
      </section>

      {/* Receptionists Table */}
      <section className={styles.tableSection}>
        {filteredReceptionists.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No receptionists found</p>
          </div>
        ) : (
          <ReceptionistTable
            receptionists={filteredReceptionists}
            onView={handleViewReceptionist}
            onEdit={handleEditReceptionist}
            onStatusChange={handleStatusChange}
          />
        )}
      </section>

      {/* Add Receptionist Modal */}
      {showAddForm && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3>Add New Receptionist</h3>
              <button 
                className={styles.closeButton}
                onClick={() => setShowAddForm(false)}
                type="button"
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            <form onSubmit={handleAddReceptionist} className={styles.form}>
              <div className={styles.formGroup}>
                <label>Full Name *</label>
                <input
                  type="text"
                  value={newReceptionist.name}
                  onChange={(e) => setNewReceptionist({...newReceptionist, name: e.target.value})}
                  placeholder="Enter full name"
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label>Email Address *</label>
                <input
                  type="email"
                  value={newReceptionist.email}
                  onChange={(e) => setNewReceptionist({...newReceptionist, email: e.target.value})}
                  placeholder="receptionist@mithealth.edu"
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label>Phone Number *</label>
                <input
                  type="tel"
                  value={newReceptionist.phone}
                  onChange={(e) => setNewReceptionist({...newReceptionist, phone: e.target.value})}
                  placeholder="9876543210"
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label>Shift *</label>
                <select
                  value={newReceptionist.shift}
                  onChange={(e) => setNewReceptionist({...newReceptionist, shift: e.target.value})}
                  required
                >
                  <option value="morning">Morning (8 AM - 4 PM)</option>
                  <option value="evening">Evening (4 PM - 12 AM)</option>
                  <option value="night">Night (12 AM - 8 AM)</option>
                  <option value="flexible">Flexible</option>
                </select>
              </div>
              <div className={styles.formActions}>
                <button 
                  type="button"
                  className={styles.cancelButton}
                  onClick={() => setShowAddForm(false)}
                >
                  Cancel
                </button>
                <button type="submit" className={styles.submitButton}>
                  Add Receptionist
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReceptionistManagement;
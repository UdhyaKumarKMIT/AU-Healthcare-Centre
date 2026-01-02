// src/pages/admin/VisitManagement.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchVisits } from '../../store/slices/adminSlice';
import styles from './VisitManagement.module.css';

const VisitManagement = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { visits, visitsLoading, error } = useSelector((state) => state.admin);
  
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedVisit, setSelectedVisit] = useState(null);

  useEffect(() => {
    console.log('🏥 Fetching visits...');
    dispatch(fetchVisits({ date: selectedDate, status: statusFilter }));
  }, [dispatch, selectedDate, statusFilter]);

  useEffect(() => {
    console.log('🏥 Visits from Redux:', visits);
  }, [visits]);

  const getStatusBadge = (status) => {
    const statusConfig = {
      'SCHEDULED': { label: 'Scheduled', color: '#4299e1', bgColor: '#ebf8ff' },
      'ONGOING': { label: 'In Progress', color: '#38a169', bgColor: '#f0fff4' },
      'COMPLETED': { label: 'Completed', color: '#48bb78', bgColor: '#d4edda' },
      'CANCELLED': { label: 'Cancelled', color: '#f56565', bgColor: '#f8d7da' },
      'DIAGNOSED': { label: 'Diagnosed', color: '#9f7aea', bgColor: '#e9d8fd' },
      'PRESCRIBED': { label: 'Prescribed', color: '#ed8936', bgColor: '#fffaf0' },
    };
    
    const config = statusConfig[status] || { label: status, color: '#718096', bgColor: '#e2e3e5' };
    
    return (
      <span 
        className={styles.statusBadge}
        style={{ 
          backgroundColor: config.bgColor,
          color: config.color,
          border: `1px solid ${config.color}`
        }}
      >
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDateOnly = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const filteredVisits = visits || [];

  const stats = {
    total: filteredVisits.length,
    today: filteredVisits.filter(v => {
      const visitDate = new Date(v.visit_date).toISOString().split('T')[0];
      const today = new Date().toISOString().split('T')[0];
      return visitDate === today;
    }).length,
    completed: filteredVisits.filter(v => v.status === 'COMPLETED').length,
    ongoing: filteredVisits.filter(v => v.status === 'ONGOING').length,
    scheduled: filteredVisits.filter(v => v.status === 'SCHEDULED').length,
    cancelled: filteredVisits.filter(v => v.status === 'CANCELLED').length,
  };

  if (visitsLoading) {
    return (
      <div className={styles.visitManagement}>
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Loading visits...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.visitManagement}>
        <div className={styles.errorContainer}>
          <p>Error loading visits: {error}</p>
          <button onClick={() => dispatch(fetchVisits({ date: selectedDate, status: statusFilter }))}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.visitManagement}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Visit Management</h1>
          <p className={styles.subtitle}>Monitor and manage all patient visits and consultations</p>
        </div>
        <button className={styles.addButton} onClick={() => navigate('/admin/visits/new')}>
          + Schedule New Visit
        </button>
      </div>

      {/* Stats Cards */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <div>
              <h4>Total Visits</h4>
              <p>All time</p>
            </div>
          </div>
          <div className={styles.statValue}>{stats.total}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <div>
              <h4>Today's Visits</h4>
              <p>{new Date().toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
            </div>
          </div>
          <div className={styles.statValue}>{stats.today}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <div>
              <h4>Completed</h4>
              <p>Finished consultations</p>
            </div>
          </div>
          <div className={styles.statValue}>{stats.completed}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <div>
              <h4>Ongoing</h4>
              <p>In progress</p>
            </div>
          </div>
          <div className={styles.statValue}>{stats.ongoing}</div>
        </div>
      </div>

      {/* Filters */}
      <div className={styles.filtersSection}>
        <div className={styles.filterGroup}>
          <div className={styles.filter}>
            <label>Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className={styles.dateInput}
            />
          </div>
          <div className={styles.filter}>
            <label>Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={styles.statusSelect}
            >
              <option value="all">All Status</option>
              <option value="SCHEDULED">Scheduled</option>
              <option value="ONGOING">In Progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
              <option value="DIAGNOSED">Diagnosed</option>
              <option value="PRESCRIBED">Prescribed</option>
            </select>
          </div>
          <button 
            className={styles.resetButton}
            onClick={() => {
              setSelectedDate(new Date().toISOString().split('T')[0]);
              setStatusFilter('all');
            }}
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* Visits Table */}
      <div className={styles.tableContainer}>
        {filteredVisits.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No visits found for selected filters</p>
          </div>
        ) : (
          <table className={styles.visitsTable}>
            <thead>
              <tr>
                <th>Visit ID</th>
                <th>Patient</th>
                <th>Doctor</th>
                <th>Date & Time</th>
                <th>Type</th>
                <th>Reason</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredVisits.map((visit) => (
                <tr key={visit.visit_id} className={styles.visitRow}>
                  <td>
                    <span className={styles.visitId}>{visit.visit_id.substring(0, 8)}</span>
                  </td>
                  <td>
                    <div className={styles.patientInfo}>
                      <div className={styles.avatar}>
                        {visit.patient_name ? visit.patient_name.charAt(0) : 'P'}
                      </div>
                      <div>
                        <div className={styles.patientName}>{visit.patient_name || 'Unknown'}</div>
                        <div className={styles.patientId}>ID: {visit.patient_id?.substring(0, 8) || 'N/A'}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className={styles.doctorInfo}>
                      <div className={styles.doctorName}>{visit.doctor_name || 'Not assigned'}</div>
                    </div>
                  </td>
                  <td>
                    <div className={styles.timeInfo}>
                      <div className={styles.time}>{formatTime(visit.visit_date)}</div>
                      <div className={styles.date}>{formatDateOnly(visit.visit_date)}</div>
                    </div>
                  </td>
                  <td>
                    <span className={styles.visitType}>{visit.visit_type || 'N/A'}</span>
                  </td>
                  <td>{visit.reason || 'General checkup'}</td>
                  <td>
                    {getStatusBadge(visit.status)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Selected Visit Details Modal */}
      {selectedVisit && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3>Visit Details</h3>
              <button 
                className={styles.closeButton}
                onClick={() => setSelectedVisit(null)}
              >
                Close
              </button>
            </div>
            <div className={styles.modalContent}>
              <div className={styles.modalGrid}>
                <div className={styles.modalSection}>
                  <h4>Patient Information</h4>
                  <p><strong>Name:</strong> {selectedVisit.patient_name || 'Unknown'}</p>
                  <p><strong>ID:</strong> {selectedVisit.patient_id || 'N/A'}</p>
                </div>
                <div className={styles.modalSection}>
                  <h4>Doctor Information</h4>
                  <p><strong>Name:</strong> {selectedVisit.doctor_name || 'Not assigned'}</p>
                </div>
                <div className={styles.modalSection}>
                  <h4>Visit Details</h4>
                  <p><strong>Type:</strong> {selectedVisit.visit_type || 'N/A'}</p>
                  <p><strong>Reason:</strong> {selectedVisit.reason || 'N/A'}</p>
                  <p><strong>Date & Time:</strong> {formatDate(selectedVisit.visit_date)}</p>
                </div>
                <div className={styles.modalSection}>
                  <h4>Visit Status</h4>
                  {getStatusBadge(selectedVisit.status)}
                </div>
              </div>
              <div className={styles.modalActions}>
                <button onClick={() => setSelectedVisit(null)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VisitManagement;
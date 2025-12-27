// src/pages/admin/VisitManagement.jsx
import React, { useState } from 'react';
import ScheduleNewVisit from '../../components/Admin/ScheduleNewVisit'; // Import the component
import styles from './VisitManagement.module.css';

const VisitManagement = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedVisit, setSelectedVisit] = useState(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false); // State for schedule modal

  // Mock data for visits
  const [visits, setVisits] = useState([
    {
      id: 'VISIT202401201',
      patientName: 'Robert Wilson',
      patientId: 'AU2023001',
      doctorName: 'Dr. John Smith',
      purpose: 'General Checkup',
      status: 'completed',
      time: '10:30 AM',
      date: '2024-01-20',
      duration: '30 min',
      vitals: { bp: '120/80', temp: '98.6°F', pulse: '72' },
      payment: { amount: 500, status: 'paid' }
    },
    {
      id: 'VISIT202401202',
      patientName: 'Emma Johnson',
      patientId: 'AU2023002',
      doctorName: 'Dr. Sarah Miller',
      purpose: 'Follow-up',
      status: 'in-progress',
      time: '11:15 AM',
      date: '2024-01-20',
      duration: '45 min',
      vitals: { bp: '118/78', temp: '98.4°F', pulse: '68' },
      payment: { amount: 300, status: 'pending' }
    },
    {
      id: 'VISIT202401203',
      patientName: 'Michael Brown',
      patientId: 'AU2023003',
      doctorName: 'Dr. Alex Chen',
      purpose: 'Emergency',
      status: 'waiting',
      time: '02:00 PM',
      date: '2024-01-20',
      duration: '60 min',
      vitals: { bp: '130/85', temp: '99.2°F', pulse: '85' },
      payment: { amount: 1000, status: 'paid' }
    },
    {
      id: 'VISIT202401204',
      patientName: 'Sarah Davis',
      patientId: 'AU2023004',
      doctorName: 'Dr. John Smith',
      purpose: 'Consultation',
      status: 'scheduled',
      time: '03:30 PM',
      date: '2024-01-20',
      duration: '30 min',
      vitals: null,
      payment: { amount: 400, status: 'unpaid' }
    },
    {
      id: 'VISIT202401205',
      patientName: 'James Wilson',
      patientId: 'AU2023005',
      doctorName: 'Dr. Sarah Miller',
      purpose: 'Prescription Refill',
      status: 'cancelled',
      time: '09:00 AM',
      date: '2024-01-20',
      duration: '15 min',
      vitals: null,
      payment: { amount: 200, status: 'refunded' }
    },
    {
      id: 'VISIT202401191',
      patientName: 'Lisa Taylor',
      patientId: 'AU2023006',
      doctorName: 'Dr. Alex Chen',
      purpose: 'Vaccination',
      status: 'completed',
      time: '10:00 AM',
      date: '2024-01-19',
      duration: '20 min',
      vitals: { bp: '122/79', temp: '98.6°F', pulse: '70' },
      payment: { amount: 800, status: 'paid' }
    },
  ]);

  const getStatusBadge = (status) => {
    const statusConfig = {
      'scheduled': { label: 'Scheduled', color: '#4299e1', bgColor: '#ebf8ff' },
      'waiting': { label: 'Waiting', color: '#ed8936', bgColor: '#fffaf0' },
      'in-progress': { label: 'In Progress', color: '#38a169', bgColor: '#f0fff4' },
      'completed': { label: 'Completed', color: '#48bb78', bgColor: '#d4edda' },
      'cancelled': { label: 'Cancelled', color: '#f56565', bgColor: '#f8d7da' },
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

 

  const handleNewVisitSuccess = (newVisit) => {
    // Format the new visit to match existing structure
    const formattedVisit = {
      ...newVisit,
      id: `VISIT${Date.now().toString().slice(-6)}`,
      patientName: newVisit.patientName || 'New Patient',
      doctorName: newVisit.doctorName || 'New Doctor',
      time: newVisit.scheduledTime,
      date: newVisit.scheduledDate,
      duration: `${newVisit.duration} min`,
      vitals: null,
      payment: { amount: Math.floor(Math.random() * 1000) + 200, status: 'unpaid' }
    };
    
    setVisits(prevVisits => [formattedVisit, ...prevVisits]);
    setShowScheduleModal(false);
  };

  const filteredVisits = visits.filter(visit => {
    if (statusFilter !== 'all' && visit.status !== statusFilter) return false;
    if (selectedDate && visit.date !== selectedDate) return false;
    return true;
  });

  const stats = {
    total: visits.length,
    today: visits.filter(v => v.date === new Date().toISOString().split('T')[0]).length,
    completed: visits.filter(v => v.status === 'completed').length,
    inProgress: visits.filter(v => v.status === 'in-progress').length,
    waiting: visits.filter(v => v.status === 'waiting').length,
    scheduled: visits.filter(v => v.status === 'scheduled').length,
    cancelled: visits.filter(v => v.status === 'cancelled').length,
  };

  return (
    <div className={styles.visitManagement}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Visit Management</h1>
          <p className={styles.subtitle}>Monitor and manage all patient visits and consultations</p>
        </div>
        <button 
          className={styles.addButton} 
          onClick={() => setShowScheduleModal(true)} // Updated click handler
        >
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
              <h4>In Progress</h4>
              <p>Ongoing consultations</p>
            </div>
          </div>
          <div className={styles.statValue}>{stats.inProgress}</div>
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
              <option value="scheduled">Scheduled</option>
              <option value="waiting">Waiting</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div className={styles.filter}>
            <label>Doctor</label>
            <select className={styles.doctorSelect}>
              <option value="all">All Doctors</option>
              <option value="doc-001">Dr. John Smith</option>
              <option value="doc-002">Dr. Sarah Miller</option>
              <option value="doc-003">Dr. Alex Chen</option>
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
        <table className={styles.visitsTable}>
          <thead>
            <tr>
              <th>Visit ID</th>
              <th>Patient</th>
              <th>Doctor</th>
              <th>Time</th>
              <th>Purpose</th>
              <th>Vitals</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredVisits.map((visit) => (
              <tr key={visit.id} className={styles.visitRow}>
                <td>
                  <span className={styles.visitId}>{visit.id}</span>
                </td>
                <td>
                  <div className={styles.patientInfo}>
                    <div className={styles.avatar}>
                      {visit.patientName.charAt(0)}
                    </div>
                    <div>
                      <div className={styles.patientName}>{visit.patientName}</div>
                      <div className={styles.patientId}>ID: {visit.patientId}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <div className={styles.doctorInfo}>
                    <div className={styles.doctorName}>{visit.doctorName}</div>
                    <div className={styles.specialization}>General Medicine</div>
                  </div>
                </td>
                <td>
                  <div className={styles.timeInfo}>
                    <div className={styles.time}>{visit.time}</div>
                    <div className={styles.date}>{visit.date}</div>
                  </div>
                </td>
                <td>{visit.purpose}</td>
                <td>
                  {visit.vitals ? (
                    <div className={styles.vitalsInfo}>
                      <span>BP: {visit.vitals.bp}</span>
                      <span>Temp: {visit.vitals.temp}</span>
                      <span>Pulse: {visit.vitals.pulse}</span>
                    </div>
                  ) : (
                    <span className={styles.noVitals}>Not taken</span>
                  )}
                </td>
                <td>
                  {getStatusBadge(visit.status)}
                </td>
            
                <td>
                  <div className={styles.actionButtons}>
                    <button
                      className={styles.viewButton}
                      onClick={() => setSelectedVisit(visit)}
                      title="View Details"
                    >
                      
                    </button>
                    <button
                      className={styles.editButton}
                      onClick={() => alert(`Edit visit ${visit.id}`)}
                      title="Edit Visit"
                    >
                      
                    </button>
                    <button
                      className={styles.prescriptionButton}
                      onClick={() => alert(`View prescription for ${visit.id}`)}
                      title="Prescription"
                    >
                      
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Schedule New Visit Modal */}
      {showScheduleModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.scheduleModalWrapper}>
            <ScheduleNewVisit
              onClose={() => setShowScheduleModal(false)}
              onSuccess={handleNewVisitSuccess}
            />
          </div>
        </div>
      )}

      {/* Selected Visit Details Modal */}
      {selectedVisit && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3>Visit Details - {selectedVisit.id}</h3>
              <button 
                className={styles.closeButton}
                onClick={() => setSelectedVisit(null)}
              >
                
              </button>
            </div>
            <div className={styles.modalContent}>
              <div className={styles.modalGrid}>
                <div className={styles.modalSection}>
                  <h4>Patient Information</h4>
                  <p><strong>Name:</strong> {selectedVisit.patientName}</p>
                  <p><strong>ID:</strong> {selectedVisit.patientId}</p>
                </div>
                <div className={styles.modalSection}>
                  <h4>Doctor Information</h4>
                  <p><strong>Name:</strong> {selectedVisit.doctorName}</p>
                  <p><strong>Specialization:</strong> General Medicine</p>
                </div>
                <div className={styles.modalSection}>
                  <h4>Visit Details</h4>
                  <p><strong>Purpose:</strong> {selectedVisit.purpose}</p>
                  <p><strong>Date & Time:</strong> {selectedVisit.date} at {selectedVisit.time}</p>
                  <p><strong>Duration:</strong> {selectedVisit.duration}</p>
                </div>
                <div className={styles.modalSection}>
                  <h4>Vitals</h4>
                  {selectedVisit.vitals ? (
                    <>
                      <p><strong>Blood Pressure:</strong> {selectedVisit.vitals.bp}</p>
                      <p><strong>Temperature:</strong> {selectedVisit.vitals.temp}</p>
                      <p><strong>Pulse:</strong> {selectedVisit.vitals.pulse}</p>
                    </>
                  ) : (
                    <p>No vitals recorded</p>
                  )}
                </div>
                
                <div className={styles.modalSection}>
                  <h4>Visit Status</h4>
                  {getStatusBadge(selectedVisit.status)}
                </div>
              </div>
              <div className={styles.modalActions}>
                <button onClick={() => setSelectedVisit(null)}>Close</button>
                <button className={styles.primaryButton}>Print Report</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VisitManagement;
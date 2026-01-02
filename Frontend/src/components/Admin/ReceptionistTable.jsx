// src/components/Admin/ReceptionistTable.jsx
import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import styles from './ReceptionistTable.module.css';

const ReceptionistTable = ({ receptionists = [], onView, onEdit, onStatusChange }) => {
  const [selectedReceptionists, setSelectedReceptionists] = useState([]);

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { label: 'Active', color: '#28a745', bgColor: '#d4edda' },
      inactive: { label: 'Inactive', color: '#6c757d', bgColor: '#e2e3e5' },
      onduty: { label: 'On Duty', color: '#17a2b8', bgColor: '#d1ecf1' },
      offduty: { label: 'Off Duty', color: '#ffc107', bgColor: '#fff3cd' },
    };
    
    const config = statusConfig[status] || { label: status, color: '#6c757d', bgColor: '#e2e3e5' };
    
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

  const getShiftBadge = (shift) => {
    const shiftConfig = {
      morning: { label: 'Morning', color: '#fd7e14', bgColor: '#ffe5d0' },
      evening: { label: 'Evening', color: '#6f42c1', bgColor: '#e9d8fd' },
      night: { label: 'Night', color: '#20c997', bgColor: '#d1f2eb' },
      flexible: { label: 'Flexible', color: '#17a2b8', bgColor: '#d1ecf1' },
    };
    
    const config = shiftConfig[shift] || { label: shift, color: '#6c757d', bgColor: '#e2e3e5' };
    
    return (
      <span 
        className={styles.shiftBadge}
        style={{ 
          backgroundColor: config.bgColor,
          color: config.color,
        }}
      >
        {config.label}
      </span>
    );
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedReceptionists(receptionists.map(rec => rec.id));
    } else {
      setSelectedReceptionists([]);
    }
  };

  const handleSelectReceptionist = (receptionistId) => {
    setSelectedReceptionists(prev => 
      prev.includes(receptionistId) 
        ? prev.filter(id => id !== receptionistId)
        : [...prev, receptionistId]
    );
  };

  return (
    <div className={styles.tableContainer}>
      {selectedReceptionists.length > 0 && (
        <div className={styles.bulkActions}>
          <span>{selectedReceptionists.length} receptionist(s) selected</span>
          <div className={styles.bulkButtons}>
            <button onClick={() => setSelectedReceptionists([])}>Clear Selection</button>
          </div>
        </div>
      )}

      <table className={styles.receptionistTable}>
        <thead>
          <tr>
            <th style={{ width: '40px' }}>
              <input 
                type="checkbox" 
                onChange={handleSelectAll}
                checked={selectedReceptionists.length === receptionists.length && receptionists.length > 0}
              />
            </th>
            <th>Receptionist</th>
            <th>Employee ID</th>
            <th>Shift</th>
            <th>Status</th>
            <th>Patients Today</th>
            <th>Phone</th>
          </tr>
        </thead>
        <tbody>
          {receptionists.map((receptionist) => (
            <tr key={receptionist.id} className={styles.receptionistRow}>
              <td>
                <input 
                  type="checkbox" 
                  checked={selectedReceptionists.includes(receptionist.id)}
                  onChange={() => handleSelectReceptionist(receptionist.id)}
                />
              </td>
              <td>
                <div className={styles.receptionistInfo}>
                  <div className={styles.avatar}>
                    {receptionist.avatar || receptionist.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className={styles.receptionistName}>{receptionist.name}</div>
                    <div className={styles.receptionistEmail}>{receptionist.email}</div>
                  </div>
                </div>
              </td>
              <td>
                <span className={styles.employeeId}>EMP{receptionist.employeeId}</span>
              </td>
              <td>
                {getShiftBadge(receptionist.shift)}
              </td>
              <td>
                {getStatusBadge(receptionist.status)}
              </td>
              <td>
                <div className={styles.patientCount}>
                  <span className={styles.count}>{receptionist.patientsToday || 0}</span>
                  <div className={styles.progressBar}>
                    <div 
                      className={styles.progressFill}
                      style={{ width: `${Math.min((receptionist.patientsToday || 0) * 5, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </td>
              <td>{receptionist.phone}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ReceptionistTable;
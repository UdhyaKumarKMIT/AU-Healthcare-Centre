// src/components/Admin/ReceptionistTable.jsx
import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import styles from './ReceptionistTable.module.css';

const ReceptionistTable = ({ receptionists = [], onView, onEdit, onStatusChange, hideShift = false, roleLabel = 'Receptionist' }) => {
  const [selectedReceptionists, setSelectedReceptionists] = useState([]);

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { label: 'Active', color: '#28a745', bgColor: '#d4edda' },
      inactive: { label: 'Inactive', color: '#6c757d', bgColor: '#e2e3e5' },
      ACTIVE: { label: 'Active', color: '#28a745', bgColor: '#d4edda' },
      INACTIVE: { label: 'Inactive', color: '#6c757d', bgColor: '#e2e3e5' },
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
    
    const config = shiftConfig[shift] || { label: shift || 'Flexible', color: '#17a2b8', bgColor: '#d1ecf1' };
    
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
      setSelectedReceptionists(receptionists.map(rec => rec.id || rec.staff_id));
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

  if (receptionists.length === 0) {
    return (
      <div className={styles.emptyTable}>
        <p>No {roleLabel.toLowerCase()}s to display</p>
      </div>
    );
  }

  return (
    <div className={styles.tableContainer}>
      {selectedReceptionists.length > 0 && (
        <div className={styles.bulkActions}>
          <span>{selectedReceptionists.length} {roleLabel.toLowerCase()}(s) selected</span>
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
            <th>{roleLabel}</th>
            <th>Employee Code</th>
            {!hideShift && <th>Shift</th>}
            <th>Status</th>
            <th>Patients Today</th>
            <th>Phone</th>
          </tr>
        </thead>
        <tbody>
          {receptionists.map((receptionist) => {
            const receptionistId = receptionist.id || receptionist.staff_id;
            const employeeCode = receptionist.employeeId || receptionist.code;
            
            return (
              <tr key={receptionistId} className={styles.receptionistRow}>
                <td>
                  <input 
                    type="checkbox" 
                    checked={selectedReceptionists.includes(receptionistId)}
                    onChange={() => handleSelectReceptionist(receptionistId)}
                  />
                </td>
                <td>
                  <div className={styles.receptionistInfo}>
                    <div className={styles.avatar}>
                      {receptionist.avatar || receptionist.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className={styles.receptionistName}>{receptionist.name}</div>
                      <div className={styles.receptionistEmail}>
                        {receptionist.email || receptionist.username || 'N/A'}
                      </div>
                    </div>
                  </div>
                </td>
                <td>
                  <span className={styles.employeeId}>{employeeCode || 'N/A'}</span>
                </td>
                {!hideShift && (
                  <td>
                    {getShiftBadge(receptionist.shift)}
                  </td>
                )}
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
                <td>{receptionist.phone || 'N/A'}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default ReceptionistTable;
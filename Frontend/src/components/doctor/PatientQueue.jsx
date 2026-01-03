import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faSpinner, faClockRotateLeft } from '@fortawesome/free-solid-svg-icons';
import styles from './PatientQueue.module.css';

const PatientQueue = ({ 
  patients, 
  loading, 
  onPatientSelect, 
  onPatientClick, 
  selectedPatient,
  onStatusUpdate,
  onViewHistory 
}) => {
  const getStatusBadge = (status) => {
    const statusMap = {
      'SCHEDULED': { label: 'Waiting', className: styles.statusWaiting },
      'ONGOING': { label: 'In Progress', className: styles.statusConsultation },
      'COMPLETED': { label: 'Completed', className: styles.statusCompleted },
      'CANCELLED': { label: 'Cancelled', className: styles.statusCancelled },
      'DIAGNOSED': { label: 'Diagnosed', className: styles.statusDiagnosed },
      'PRESCRIBED': { label: 'Prescribed', className: styles.statusPrescribed },
    };
    
    const statusInfo = statusMap[status] || { label: status, className: styles.statusDefault };
    
    return (
      <span className={`${styles.statusBadge} ${statusInfo.className}`}>
        {statusInfo.label}
      </span>
    );
  };

  const handleRowClick = async (patient) => {
    onPatientSelect(patient);
    
    if (patient.status === 'SCHEDULED' && onStatusUpdate) {
      try {
        await onStatusUpdate(patient.visitId, 'ONGOING');
      } catch (error) {
        console.error('Failed to update status:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <FontAwesomeIcon icon={faSpinner} spin className={styles.spinner} />
        <p>Loading patients...</p>
      </div>
    );
  }

  if (patients.length === 0) {
    return (
      <div className={styles.emptyState}>
        <p className={styles.emptyText}>No patients in queue</p>
      </div>
    );
  }

  return (
    <div className={styles.queueContainer}>
      <table className={styles.queueTable}>
        <thead>
          <tr>
            <th>Token</th>
            <th>Patient Name</th>
            <th>Visit Type</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {patients.map((patient) => (
            <tr
              key={patient.visitId}
              className={`${styles.patientRow} ${
                selectedPatient?.visitId === patient.visitId ? styles.selectedRow : ''
              }`}
              onClick={() => handleRowClick(patient)}
            >
              <td className={styles.tokenCell}>
                <span className={styles.tokenBadge}>{patient.token || '#'}</span>
              </td>
              <td>
                <div className={styles.patientInfo}>
                  <strong className={styles.patientName}>{patient.patientName}</strong>
                  {patient.reason && patient.reason !== 'Not specified' && (
                    <span className={styles.patientReason}>{patient.reason}</span>
                  )}
                </div>
              </td>
              <td>
                <span className={`${styles.visitType} ${
                  patient.visitType === 'Emergency' ? styles.emergency : ''
                }`}>
                  {patient.visitType}
                </span>
              </td>
              <td>{getStatusBadge(patient.status)}</td>
              <td>
                <div className={styles.actionButtons}>
                  <button
                    className={styles.viewBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      onPatientClick(patient.visitId);
                    }}
                    title="View Current Visit"
                  >
                    <FontAwesomeIcon icon={faEye} /> View
                  </button>
                  <button
                    className={styles.historyBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewHistory(patient.patientId);
                    }}
                    title="View Patient History"
                  >
                    <FontAwesomeIcon icon={faClockRotateLeft} /> History
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PatientQueue;
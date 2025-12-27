import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faSpinner } from '@fortawesome/free-solid-svg-icons';
import styles from './PatientQueue.module.css';

const PatientQueue = ({ 
  patients, 
  loading, 
  onPatientSelect, 
  onPatientClick, 
  selectedPatient,
  onStatusUpdate 
}) => {
  const getStatusBadge = (status) => {
    const statusMap = {
      'SCHEDULED': { label: 'Waiting', className: styles.statusWaiting },
      'IN_PROGRESS': { label: 'In Consultation', className: styles.statusConsultation },
      'COMPLETED': { label: 'Completed', className: styles.statusCompleted },
      'CANCELLED': { label: 'Cancelled', className: styles.statusCancelled },
      'NO_SHOW': { label: 'No Show', className: styles.statusNoShow },
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
        await onStatusUpdate(patient.visitId, 'IN_PROGRESS');
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
            <th>Action</th>
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
                  <span className={styles.patientReason}>{patient.reason}</span>
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
                <button
                  className={styles.viewBtn}
                  onClick={(e) => {
                    e.stopPropagation();
                    onPatientClick(patient.visitId);
                  }}
                >
                  <FontAwesomeIcon icon={faEye} /> View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PatientQueue;
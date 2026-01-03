// src/components/Admin/PatientTable.jsx
import React from 'react';
import styles from './PatientTable.module.css';

const PatientTable = ({ patients = [], onView, onEdit }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (patients.length === 0) {
    return (
      <div className={styles.emptyTable}>
        <p>No patients to display</p>
      </div>
    );
  }

  return (
    <div className={styles.tableContainer}>
      <table className={styles.patientTable}>
        <thead>
          <tr>
            <th>Patient ID</th>
            <th>Name</th>
            <th>Age</th>
            <th>Gender</th>
            <th>Phone</th>
            <th>Last Visit</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {patients.map((patient) => (
            <tr key={patient.id} className={styles.patientRow}>
              <td>
                <span className={styles.patientId}>{patient.patientId}</span>
              </td>
              <td>
                <div className={styles.patientInfo}>
                  <div className={styles.avatar}>
                    {patient.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className={styles.patientName}>{patient.name}</div>
                    <div className={styles.patientEmail}>{patient.email}</div>
                  </div>
                </div>
              </td>
              <td>{patient.age}</td>
              <td>
                <span className={styles.genderBadge}>
                  {patient.gender}
                </span>
              </td>
              <td>{patient.phone}</td>
              <td>
                {patient.lastVisit ? formatDate(patient.lastVisit) : 'Never'}
              </td>
              <td>
                <span className={`${styles.statusBadge} ${patient.isNew ? styles.new : styles.returning}`}>
                  {patient.isNew ? 'New' : 'Returning'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PatientTable;
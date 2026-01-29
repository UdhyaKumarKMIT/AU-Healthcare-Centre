// src/components/Admin/PatientTable.jsx
import React from 'react';
import styles from './PatientTable.module.css';

const PatientTable = ({ patients = [], onView, onEdit }) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const calculateAge = (dob) => {
    if (!dob) return 'N/A';
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const getPatientTypeBadge = (patientType) => {
    const typeConfig = {
      STUDENT: { label: 'Student', color: '#4299e1', bgColor: '#bee3f8' },
      TEMP_STAFF: { label: 'Temp Staff', color: '#ed8936', bgColor: '#feebc8' },
      PERMANENT_STAFF: { label: 'Permanent Staff', color: '#48bb78', bgColor: '#c6f6d5' },
    };
    
    const config = typeConfig[patientType] || { label: patientType, color: '#6c757d', bgColor: '#e2e3e5' };
    
    return (
      <span 
        className={styles.typeBadge}
        style={{ 
          backgroundColor: config.bgColor,
          color: config.color,
          border: `1px solid ${config.color}`,
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '12px',
          fontWeight: '500'
        }}
      >
        {config.label}
      </span>
    );
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
            <th>Patient Type</th>
            <th>Registered Date</th>
          </tr>
        </thead>
        <tbody>
          {patients.map((patient) => (
            <tr key={patient.patient_id} className={styles.patientRow}>
              <td>
                <span className={styles.patientId}>
                  {patient.patient_id?.substring(0, 8) || 'N/A'}
                </span>
              </td>
              <td>
                <div className={styles.patientInfo}>
                  <div className={styles.avatar}>
                    {patient.name?.charAt(0).toUpperCase() || '?'}
                  </div>
                  <div>
                    <div className={styles.patientName}>{patient.name || 'Unknown'}</div>
                    {patient.allergic_to && (
                      <div className={styles.patientAllergy}>
                        ⚠️ Allergic to: {patient.allergic_to}
                      </div>
                    )}
                  </div>
                </div>
              </td>
              <td>{calculateAge(patient.dob)}</td>
              <td>
                <span className={styles.genderBadge}>
                  {patient.gender || 'N/A'}
                </span>
              </td>
              <td>{patient.phone || 'N/A'}</td>
              <td>
                {getPatientTypeBadge(patient.patient_type)}
              </td>
              <td>
                {formatDate(patient.created_at)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PatientTable;
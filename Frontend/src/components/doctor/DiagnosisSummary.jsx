import React from 'react';
import styles from './DiagnosisSummary.module.css';

const DiagnosisSummary = ({ patient, diagnosis, onProceedToPrescription }) => {
  if (!patient) {
    return (
      <div className={styles.emptyState}>
        <h3 className={styles.emptyTitle}>No Patient Selected</h3>
        <p className={styles.emptyText}>
          Select a patient from the queue to view diagnosis details
        </p>
      </div>
    );
  }

  return (
    <div className={styles.summaryContainer}>
      {/* Patient Information */}
      <div className={styles.patientSection}>
        <h3 className={styles.sectionTitle}>Patient Information</h3>
        <div className={styles.patientDetails}>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Name:</span>
            <span className={styles.detailValue}>{patient.patientName}</span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Age:</span>
            <span className={styles.detailValue}>{patient.age} years</span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Gender:</span>
            <span className={styles.detailValue}>{patient.gender}</span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Blood Group:</span>
            <span className={styles.detailValue}>{patient.bloodGroup}</span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Visit Type:</span>
            <span className={styles.detailValue}>{patient.visitType}</span>
          </div>
        </div>
      </div>

      {/* Diagnosis Information */}
      <div className={styles.diagnosisSection}>
        <h3 className={styles.sectionTitle}>Diagnosis</h3>
        
        {diagnosis ? (
          <div className={styles.diagnosisDetails}>
            <div className={styles.diagnosisField}>
              <label className={styles.fieldLabel}>Diagnosis Name</label>
              <div className={styles.fieldValue}>{diagnosis.diagnosisName}</div>
            </div>
            <div className={styles.diagnosisField}>
              <label className={styles.fieldLabel}>Diagnosis Notes</label>
              <div className={styles.fieldValue}>{diagnosis.diagnosisNotes}</div>
            </div>
            <div className={styles.diagnosisMeta}>
              <span className={styles.metaItem}>
                Diagnosed on: {new Date(diagnosis.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        ) : (
          <div className={styles.noDiagnosis}>
            <p className={styles.noDiagnosisText}>
              No diagnosis recorded yet. Click "View" to examine patient and add diagnosis.
            </p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className={styles.actionSection}>
        <button
          className={styles.prescriptionBtn}
          onClick={onProceedToPrescription}
          disabled={!diagnosis}
        >
          Proceed to Prescription
        </button>
        <p className={styles.actionHint}>
          {!diagnosis ? 'Complete diagnosis first' : 'Ready to prescribe medication'}
        </p>
      </div>
    </div>
  );
};

export default DiagnosisSummary;
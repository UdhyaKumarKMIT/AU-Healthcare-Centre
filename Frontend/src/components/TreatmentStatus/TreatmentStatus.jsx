import React from 'react';
import styles from './TreatmentStatus.module.css';

const TreatmentStatus = ({ treatment }) => {
  const getStatusInfo = (status) => {
    switch(status?.toLowerCase()) {
      case 'pending':
        return { color: '#f39c12', icon: '⏳', label: 'Pending' };
      case 'in_progress':
        return { color: '#3498db', icon: '⚙️', label: 'In Progress' };
      case 'completed':
        return { color: '#27ae60', icon: '✓', label: 'Completed' };
      default:
        return { color: '#95a5a6', icon: '⋯', label: 'Not Started' };
    }
  };

  const pharmacyStatus = getStatusInfo(treatment?.pharmacyStatus);
  const nurseStatus = getStatusInfo(treatment?.nurseStatus);

  return (
    <div className={styles.card}>
      <h3 className={styles.cardTitle}>Pharmacy & Nurse Status</h3>
      
      <div className={styles.statusGrid}>
        {/* Pharmacy Status */}
        <div className={styles.statusCard}>
          <div className={styles.statusHeader}>
            <div className={styles.statusIcon} style={{ backgroundColor: pharmacyStatus.color }}>
              {pharmacyStatus.icon}
            </div>
            <h4 className={styles.statusTitle}>Pharmacy</h4>
          </div>
          <div className={styles.statusBody}>
            <div className={styles.statusBadge} style={{ backgroundColor: pharmacyStatus.color }}>
              {pharmacyStatus.label}
            </div>
            {treatment?.pharmacyTimestamps && (
              <div className={styles.timestamps}>
                {treatment.pharmacyTimestamps.started && (
                  <div className={styles.timestamp}>
                    <span className={styles.timestampLabel}>Started:</span>
                    <span className={styles.timestampValue}>
                      {new Date(treatment.pharmacyTimestamps.started).toLocaleTimeString()}
                    </span>
                  </div>
                )}
                {treatment.pharmacyTimestamps.completed && (
                  <div className={styles.timestamp}>
                    <span className={styles.timestampLabel}>Completed:</span>
                    <span className={styles.timestampValue}>
                      {new Date(treatment.pharmacyTimestamps.completed).toLocaleTimeString()}
                    </span>
                  </div>
                )}
              </div>
            )}
            {treatment?.pharmacist && (
              <div className={styles.staffInfo}>
                <span className={styles.staffLabel}>Pharmacist:</span>
                <span className={styles.staffName}>{treatment.pharmacist}</span>
              </div>
            )}
          </div>
        </div>

        {/* Nurse Status */}
        <div className={styles.statusCard}>
          <div className={styles.statusHeader}>
            <div className={styles.statusIcon} style={{ backgroundColor: nurseStatus.color }}>
              {nurseStatus.icon}
            </div>
            <h4 className={styles.statusTitle}>Nurse</h4>
          </div>
          <div className={styles.statusBody}>
            <div className={styles.statusBadge} style={{ backgroundColor: nurseStatus.color }}>
              {nurseStatus.label}
            </div>
            {treatment?.nurseTimestamps && (
              <div className={styles.timestamps}>
                {treatment.nurseTimestamps.started && (
                  <div className={styles.timestamp}>
                    <span className={styles.timestampLabel}>Started:</span>
                    <span className={styles.timestampValue}>
                      {new Date(treatment.nurseTimestamps.started).toLocaleTimeString()}
                    </span>
                  </div>
                )}
                {treatment.nurseTimestamps.completed && (
                  <div className={styles.timestamp}>
                    <span className={styles.timestampLabel}>Completed:</span>
                    <span className={styles.timestampValue}>
                      {new Date(treatment.nurseTimestamps.completed).toLocaleTimeString()}
                    </span>
                  </div>
                )}
              </div>
            )}
            {treatment?.nurseName && (
              <div className={styles.staffInfo}>
                <span className={styles.staffLabel}>Nurse:</span>
                <span className={styles.staffName}>{treatment.nurseName}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Injection/IV Section */}
      {treatment?.injectionRequired && (
        <div className={styles.injectionSection}>
          <div className={styles.injectionIcon}>💉</div>
          <div className={styles.injectionInfo}>
            <h5 className={styles.injectionTitle}>Injection/IV Required</h5>
            {treatment.injectionDetails && (
              <p className={styles.injectionDetails}>{treatment.injectionDetails}</p>
            )}
            {treatment.injectionAdministered && (
              <div className={styles.administeredBadge}>
                <span className={styles.administeredIcon}>✓</span>
                <span className={styles.administeredText}>Administered</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TreatmentStatus;
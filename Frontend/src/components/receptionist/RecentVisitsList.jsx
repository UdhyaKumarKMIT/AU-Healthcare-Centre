import React from 'react';
import styles from './RecentVisitsList.module.css';

const RecentVisitsList = ({ visits = [] }) => {
  const getStatusBadge = (status) => {
    const statusConfig = {
      SCHEDULED: { className: styles.statusScheduled, label: 'Scheduled' },
      ONGOING: { className: styles.statusOngoing, label: 'Ongoing' },
      DIAGNOSED: { className: styles.statusDiagnosed, label: 'Diagnosed' },
      PRESCRIBED: { className: styles.statusPrescribed, label: 'Prescribed' },
      NURSING: { className: styles.statusNursing, label: 'Nursing' },
      PHARMACY: { className: styles.statusPharmacy, label: 'Pharmacy' },
      COMPLETED: { className: styles.statusCompleted, label: 'Completed' },
      CANCELLED: { className: styles.statusCancelled, label: 'Cancelled' }
    };

    const config = statusConfig[status] || { className: styles.statusDefault, label: status };
    return <span className={config.className}>{config.label}</span>;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (visits.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>Recent Visits</h2>
          <p className={styles.subtitle}>No visits yet</p>
        </div>
        <div className={styles.emptyState}>
          <p className={styles.emptyText}>No recent visits to display</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Recent Visits</h2>
        <p className={styles.subtitle}>Monitor visit flow</p>
      </div>
      
      <div className={styles.visitsList}>
        {visits.map((visit) => (
          <div key={visit.id} className={styles.visitItem}>
            <div className={styles.visitHeader}>
              <div className={styles.tokenBadge}>Token #{visit.token}</div>
              <div className={styles.visitTime}>{formatDate(visit.visitDate)}</div>
            </div>
            
            <div className={styles.visitDetails}>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Patient:</span>
                <span className={styles.detailValue}>{visit.patientName}</span>
              </div>
              
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Doctor:</span>
                <span className={styles.detailValue}>{visit.doctorName}</span>
              </div>
              
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Type:</span>
                <span className={styles.detailValue}>{visit.visitType}</span>
              </div>
            </div>
            
            <div className={styles.visitFooter}>
              <div className={styles.reason}>
                <strong>Reason:</strong> {visit.reason}
              </div>
              <div className={styles.status}>
                {getStatusBadge(visit.status)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentVisitsList;
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTimes, faHeartbeat, faPills, faFileAlt 
} from '@fortawesome/free-solid-svg-icons';
import styles from './NurseDashboard.module.css';

const CompletedTaskDetailsModal = ({ completedTaskDetails, onClose }) => {
  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalLarge} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>{completedTaskDetails.task_type} - Completed</h2>
          <button className={styles.closeButton} onClick={onClose}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
        
        <div className={styles.modalBody}>
          {/* Patient Information */}
          <div className={styles.infoSection}>
            <h4>Patient Information</h4>
            <div className={styles.infoGrid}>
              <div><strong>Name:</strong> {completedTaskDetails.patient?.name}</div>
              <div><strong>Phone:</strong> {completedTaskDetails.patient?.phone}</div>
              {completedTaskDetails.completed_at && (
                <div>
                  <strong>Completed At:</strong>{' '}
                  {new Date(completedTaskDetails.completed_at).toLocaleString()}
                </div>
              )}
            </div>
          </div>

          {/* Medications Used */}
          {completedTaskDetails.medications_used && 
           completedTaskDetails.medications_used.length > 0 && (
            <div className={styles.infoSection}>
              <h4>
                <FontAwesomeIcon icon={faPills} /> Medications Used
              </h4>
              {completedTaskDetails.medications_used.map((med, idx) => (
                <div key={idx} className={styles.medicationCard}>
                  <div><strong>{med.medicine_name}</strong></div>
                  <div>Quantity: {med.quantity}</div>
                  {med.batch_no && <div>Batch: {med.batch_no}</div>}
                </div>
              ))}
            </div>
          )}

          {/* ECG Report */}
          {completedTaskDetails.ecg_report && (
            <div className={styles.infoSection}>
              <h4>
                <FontAwesomeIcon icon={faHeartbeat} /> ECG Report
              </h4>
              <div className={styles.ecgReportView}>
                <div className={styles.reportRow}>
                  <span>
                    <strong>Heart Rate:</strong> {completedTaskDetails.ecg_report.heart_rate} bpm
                  </span>
                  <span>
                    <strong>Rhythm:</strong>{' '}
                    {completedTaskDetails.ecg_report.rhythm?.replace(/_/g, ' ')}
                  </span>
                </div>
                <div className={styles.reportRow}>
                  <span>
                    <strong>PR Interval:</strong> {completedTaskDetails.ecg_report.pr_interval} ms
                  </span>
                  <span>
                    <strong>QRS Duration:</strong> {completedTaskDetails.ecg_report.qrs_duration} ms
                  </span>
                  <span>
                    <strong>QT Interval:</strong> {completedTaskDetails.ecg_report.qt_interval} ms
                  </span>
                </div>
                <div className={styles.reportRow}>
                  <span>
                    <strong>Axis:</strong>{' '}
                    {completedTaskDetails.ecg_report.axis?.replace(/_/g, ' ')}
                  </span>
                </div>
                {completedTaskDetails.ecg_report.findings && (
                  <div className={styles.reportSection}>
                    <strong>Findings:</strong>
                    <p>{completedTaskDetails.ecg_report.findings}</p>
                  </div>
                )}
                {completedTaskDetails.ecg_report.interpretation && (
                  <div className={styles.reportSection}>
                    <strong>Interpretation:</strong>
                    <p>{completedTaskDetails.ecg_report.interpretation}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Observation */}
          {completedTaskDetails.observation && (
            <div className={styles.infoSection}>
              <h4>
                <FontAwesomeIcon icon={faFileAlt} /> Observation
              </h4>
              <p className={styles.observationText}>
                {completedTaskDetails.observation}
              </p>
            </div>
          )}

          {/* Remarks */}
          {completedTaskDetails.remarks && (
            <div className={styles.infoSection}>
              <h4>Remarks</h4>
              <p className={styles.remarksText}>{completedTaskDetails.remarks}</p>
            </div>
          )}

          {/* Completed By */}
          {completedTaskDetails.completed_by && (
            <div className={styles.infoSection}>
              <div className={styles.completedBy}>
                <strong>Completed by:</strong> {completedTaskDetails.completed_by}
              </div>
            </div>
          )}
        </div>
        
        <div className={styles.modalFooter}>
          <button className={styles.closeButtonSecondary} onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default CompletedTaskDetailsModal;
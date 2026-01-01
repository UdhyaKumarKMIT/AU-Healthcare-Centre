import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSystemLogs } from '../../store/slices/adminSlice';
import styles from './StaffManagement.module.css';

const LogsManagement = () => {
  const dispatch = useDispatch();
  const { systemLogs, logsLoading, error } = useSelector(
    (state) => state.admin
  );

  useEffect(() => {
    dispatch(fetchSystemLogs({}));
  }, [dispatch]);

  return (
    <div className={styles.staffManagement}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>📋 System Logs & Audit</h1>
          <p className={styles.subtitle}>
            Unified audit trail for pharmacy and nurse transactions
          </p>
        </div>
      </div>

      {error && <div className={styles.errorAlert}>✗ {error}</div>}

      {logsLoading ? (
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Loading logs…</p>
        </div>
      ) : (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Type</th>
                <th>Actor</th>
                <th>Patient</th>
                <th>Doctor</th>
                <th>Visit ID</th>
                <th>Description</th>
              </tr>
            </thead>

            <tbody>
              {systemLogs.map((log) => (
                <tr key={`${log.transaction_type}-${log.log_id}`}>
                  <td>{new Date(log.timestamp).toLocaleString()}</td>

                  <td>
                    <span className={styles.actionBadge}>
                      {log.transaction_type}
                    </span>
                  </td>

                  <td>
                    {log.transaction_type === 'PHARMACY'
                      ? log.pharmacist_name
                      : log.nurse_name}
                  </td>

                  <td>{log.patient_name}</td>
                  <td>{log.doctor_name}</td>
                  <td>
                    <code className={styles.logId}>{log.visit_id}</code>
                  </td>

                  <td className={styles.description}>
                    {log.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {systemLogs.length === 0 && (
            <div className={styles.emptyState}>
              <p>No logs found.</p>
            </div>
          )}
        </div>
      )}

      <div className={styles.note}>
        <p>
          <strong>Note:</strong> Actor, Patient, and Doctor are resolved
          names for audit clarity.
        </p>
      </div>
    </div>
  );
};

export default LogsManagement;

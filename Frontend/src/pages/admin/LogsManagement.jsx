// src/pages/admin/LogsManagement.jsx
import React from 'react';
import styles from './PlaceholderModule.module.css';

const LogsManagement = () => {
  return (
    <div className={styles.placeholderContainer}>
      <div className={styles.placeholderContent}>
        <h1> System Logs & Audit</h1>
        <p>View system activity logs and audit trails</p>
        <div className={styles.comingSoon}>
          <span className={styles.comingSoonBadge}>Coming Soon</span>
          <p>This module is currently under development.</p>
        </div>
      </div>
    </div>
  );
};

export default LogsManagement;
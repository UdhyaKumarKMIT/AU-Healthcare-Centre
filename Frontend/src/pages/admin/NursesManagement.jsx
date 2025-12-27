// src/pages/admin/NursesManagement.jsx
import React from 'react';
import styles from './PlaceholderModule.module.css';

const NursesManagement = () => {
  return (
    <div className={styles.placeholderContainer}>
      <div className={styles.placeholderContent}>
        <h1> Nurses Management</h1>
        <p>Manage nursing staff, shifts, and assignments</p>
        <div className={styles.comingSoon}>
          <span className={styles.comingSoonBadge}>Coming Soon</span>
          <p>This module is currently under development.</p>
        </div>
      </div>
    </div>
  );
};

export default NursesManagement;
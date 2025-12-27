// src/pages/admin/PharmacistsManagement.jsx
import React from 'react';
import styles from './PlaceholderModule.module.css';

const PharmacistsManagement = () => {
  return (
    <div className={styles.placeholderContainer}>
      <div className={styles.placeholderContent}>
        <h1>Pharmacists Management</h1>
        <p>Manage pharmacy staff and medicine dispensing</p>
        <div className={styles.comingSoon}>
          <span className={styles.comingSoonBadge}>Coming Soon</span>
          <p>This module is currently under development.</p>
        </div>
      </div>
    </div>
  );
};

export default PharmacistsManagement;
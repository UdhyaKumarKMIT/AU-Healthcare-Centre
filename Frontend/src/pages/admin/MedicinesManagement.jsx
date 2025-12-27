// src/pages/admin/MedicinesManagement.jsx - UPDATED
import React from 'react';
import styles from './PlaceholderModule.module.css';

const MedicinesManagement = () => {
  return (
    <div className={styles.placeholderContainer}>
      <div className={styles.placeholderContent}>
        <h1>🏥 Medicines Management</h1>
        <p>Manage medicine inventory, stock, and prescriptions</p>
        <div className={styles.comingSoon}>
          <span className={styles.comingSoonBadge}>Coming Soon</span>
          <p>This module is currently under development.</p>
        </div>
      </div>
    </div>
  );
};

export default MedicinesManagement;
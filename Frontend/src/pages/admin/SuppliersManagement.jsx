// src/pages/admin/SuppliersManagement.jsx
import React from 'react';
import styles from './PlaceholderModule.module.css';

const SuppliersManagement = () => {
  return (
    <div className={styles.placeholderContainer}>
      <div className={styles.placeholderContent}>
        <h1> Suppliers Management</h1>
        <p>Manage medicine suppliers and inventory orders</p>
        <div className={styles.comingSoon}>
          <span className={styles.comingSoonBadge}>Coming Soon</span>
          <p>This module is currently under development.</p>
        </div>
      </div>
    </div>
  );
};

export default SuppliersManagement;
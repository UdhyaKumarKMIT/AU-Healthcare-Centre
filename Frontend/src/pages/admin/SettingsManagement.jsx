// src/pages/admin/SettingsManagement.jsx
import React from 'react';
import styles from './PlaceholderModule.module.css';

const SettingsManagement = () => {
  return (
    <div className={styles.placeholderContainer}>
      <div className={styles.placeholderContent}>
        <h1>⚙️ System Settings</h1>
        <p>Configure system preferences and settings</p>
        <div className={styles.comingSoon}>
          <span className={styles.comingSoonBadge}>Coming Soon</span>
          <p>This module is currently under development.</p>
        </div>
      </div>
    </div>
  );
};

export default SettingsManagement;
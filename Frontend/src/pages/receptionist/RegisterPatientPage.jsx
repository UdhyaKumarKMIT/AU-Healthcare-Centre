// src/pages/receptionist/RegisterPatientPage.jsx
import React from 'react';
import Header from '../../components/Header/Header';
import styles from './RegisterPatientPage.module.css';

const RegisterPatientPage = () => {
  return (
    <div className={styles.dashboard}>
      <Header />
      
      <main className={styles.mainContent}>
        <div className={styles.container}>
          <div className={styles.pageHeader}>
            <button className={styles.backButton} onClick={() => window.history.back()}>
              ← Back to Dashboard
            </button>
            <h1 className={styles.pageTitle}>Register New Patient</h1>
            <p className={styles.pageSubtitle}>
              Complete patient registration form
            </p>
          </div>
          
          <div className={styles.content}>
            {/* You can move the full registration form here */}
            <div className={styles.formContainer}>
              <p>Full registration form will be implemented here</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default RegisterPatientPage;
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header/Header';
import styles from './SelectRole.module.css';

const roles = [
  { label: 'Doctor', path: '/login/doctor', icon: '🩺' },
  { label: 'Pharmacist', path: '/login/pharmacist', icon: '💊' },
  { label: 'Nurse', path: '/login/nurse', icon: '👩‍⚕️' },
  { label: 'Receptionist', path: '/login/receptionist', icon: '🗂️' },
  { label: 'Patient', path: '/login/patient', icon: '🧑‍🦽' },
];

const SelectRole = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.dashboard}>
      <Header />

      <main className={styles.mainContent}>
        <section
          className={styles.container}
          aria-labelledby="role-selection-title"
        >
          {/* Page Header */}
          <header className={styles.headerSection}>
            <h1 id="role-selection-title" className={styles.title}>
              Login System
            </h1>
            <p className={styles.subtitle}>
              Select your designated role to proceed to secure login
            </p>
          </header>

          {/* Role Navigation */}
          <nav
            className={styles.roleGrid}
            aria-label="User role selection"
          >
            {roles.map((role) => (
              <button
                key={role.label}
                type="button"
                className={styles.roleCard}
                onClick={() => navigate(role.path)}
                aria-label={`Proceed to ${role.label} login`}
              >
                <span
                  className={styles.roleIcon}
                  aria-hidden="true"
                >
                  {role.icon}
                </span>
                <span className={styles.roleLabel}>
                  {role.label}
                </span>
              </button>
            ))}
          </nav>

          {/* Footer Note */}
          <footer className={styles.footerNote}>
            <p>
              This system is restricted to authorized users of
              the Anna University Health Centre.
            </p>
          </footer>
        </section>
      </main>
    </div>
  );
};

export default SelectRole;

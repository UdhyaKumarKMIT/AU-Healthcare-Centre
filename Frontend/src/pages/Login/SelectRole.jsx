import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header/Header';
import styles from './SelectRole.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUserMd, 
  faPills, 
  faUserNurse, 
  faClipboard, 
  faUser,
  faUserTie,
  faVial
} from '@fortawesome/free-solid-svg-icons';

const roles = [
  { label: 'Admin', path: '/login/admin', icon: faUserTie },
  { label: 'Doctor', path: '/login/doctor', icon: faUserMd },
  { label: 'Pharmacist', path: '/login/pharmacist', icon: faPills },
  { label: 'Nurse', path: '/login/nurse', icon: faUserNurse },
  { label: 'Receptionist', path: '/login/receptionist', icon: faClipboard },
  { label: 'Patient', path: '/login/patient', icon: faUser },
  { label: 'Lab Technician', path: '/login/labtech', icon: faVial }
];

const SelectRole = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.dashboard}>
      <Header />
      
      <main className={styles.mainContent}>
        <div className={styles.loginCard}>
          <header className={styles.loginHeader}>
            <h1 className={styles.logo}>MIT Health Centre</h1>
            <h2 className={styles.title}>Login System</h2>
            <p className={styles.subtitle}>Select your role to continue</p>
          </header>

          <div className={styles.roleList}>
            {roles.map((role) => (
              <button
                key={role.label}
                type="button"
                className={styles.roleButton}
                onClick={() => navigate(role.path)}
              >
                <FontAwesomeIcon icon={role.icon} className={styles.roleIcon} />
                <span className={styles.roleLabel}>{role.label}</span>
              </button>
            ))}
          </div>

          <footer className={styles.footer}>
            <p>Anna University • HealthCare Portal</p>
            <p className={styles.footerNote}>
              Unauthorized access is prohibited
            </p>
          </footer>
        </div>
      </main>
    </div>
  );
};

export default SelectRole;
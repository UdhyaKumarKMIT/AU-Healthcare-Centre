// src/components/Header/Header.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import styles from './Header.module.css';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleNavigation = (path) => {
    if (!user) {
      // If not logged in, stay on login page
      return;
    }

    switch (path) {
      case 'home':
        switch (user.role) {
          case 'doctor':
            navigate('/doctor/dashboard');
            break;
          case 'receptionist':
            navigate('/reception/dashboard');
            break;
          case 'administrator':
            navigate('/admin/dashboard');
            break;
          case 'patient':
            navigate('/patient/dashboard');
            break;
          default:
            navigate('/');
        }
        break;
      case 'doctors':
        // You can implement a doctors directory page
        alert('Doctors directory coming soon!');
        break;
      case 'clinic':
        // You can implement clinic visit page
        alert('Clinic visit page coming soon!');
        break;
      case 'services':
        // You can implement patient services page
        alert('Patient services page coming soon!');
        break;
      default:
        break;
    }
  };

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        {/* Left Section - Logo & Title */}
        <div className={styles.leftSection}>
          <div className={styles.logo}>
            <div className={styles.logoIcon}>
            </div>
            <div className={styles.logoText}>
              <h1 className={styles.title}>MIT Health Centre</h1>
              <p className={styles.subtitle}>Anna University, Chennai</p>
            </div>
          </div>
        </div>

        {/* Center Section - Navigation Links */}

        {/* Right Section - User Info & Logout */}
        <div className={styles.rightSection}>
          {user ? (
            <>
              <div className={styles.userInfo}>
                <div className={styles.userRole}>
                  {user.role === 'doctor' ? 'Doctor' : 
                   user.role === 'receptionist' ? 'Receptionist' : 
                   user.role === 'administrator' ? 'Administrator' : 
                   user.role === 'patient' ? 'Patient' : 'User'}
                </div>
                <div className={styles.userName}>{user.name}</div>
              </div>
              <button className={styles.logoutButton} onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <div className={styles.userInfo}>
              <div className={styles.userRole}>Welcome</div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
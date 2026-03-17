// src/components/Header/Header.jsx
import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import styles from './Header.module.css';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const token = localStorage.getItem('token');
  const isAuthenticated = !!user && !!token;

  const normalizedRole = String(user?.role || '').toLowerCase();
  const displayRoleLabel = (() => {
    switch (normalizedRole) {
      case 'doctor':
        return 'Doctor';
      case 'nurse_receptionist':
      case 'receptionist':
        return 'Nurse/Receptionist';
      case 'admin':
      case 'administrator':
        return 'Administrator';
      case 'pharmacist':
        return 'Pharmacist';
      case 'lab_technician':
        return 'Lab Technician';
      case 'clerical_assistant':
        return 'Clerical Assistant';
      case 'patient':
        return 'Patient';
      default:
        return normalizedRole ? normalizedRole.replace(/_/g, ' ') : 'User';
    }
  })();

  const displayName = user?.name || user?.username || user?.fullName || '';
  const displayEmail = user?.email || '';
  const shouldShowName = Boolean(displayName);

  useEffect(() => {
    // If token is missing, ensure we don't show auth UI and force login flow.
    if (!token) {
      if (user) logout();

      const onLoginFlow = location.pathname === '/' || location.pathname === '/login' || location.pathname.startsWith('/login/');
      if (!onLoginFlow) {
        navigate('/login', { replace: true });
      }
    }
    // Intentionally depends on location changes so URL updates re-check auth.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const handleNavigation = (path) => {
    if (!user) {
      // If not logged in, stay on login page
      return;
    }

    switch (path) {
      case 'home':
        switch (user.role) {
          case 'DOCTOR':
          case 'doctor':
            navigate('/doctor/dashboard');
            break;
          case 'NURSE_RECEPTIONIST':
          case 'nurse_receptionist':
            navigate('/reception/dashboard');
            break;
          case 'ADMIN':
          case 'administrator':
            navigate('/admin/dashboard');
            break;
          case 'PATIENT':
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
              <img
                className={styles.logoImage}
                src="/healthcenter.jpg"
                alt="MIT Health Centre"
              />
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
          {isAuthenticated ? (
            <>
              <div className={styles.userInfo}>
                <div className={styles.userRole}>
                  {displayRoleLabel}
                </div>
                {shouldShowName ? (
                  <div className={styles.userName}>{displayName}</div>
                ) : (
                  <div className={styles.userEmail}>{displayEmail}</div>
                )}
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
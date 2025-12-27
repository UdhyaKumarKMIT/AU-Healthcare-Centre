import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import styles from './TopHeader.module.css';
import logo from '../../../assets/anna_univ_logo.png'; // Add your logo image

const TopHeader = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleNavigation = (path) => {
    if (!user) return;

    switch (path) {
      case 'home':
        // Navigate to role-specific dashboard
        switch (user.role) {
          case 'doctor': navigate('/doctor/dashboard'); break;
          case 'receptionist': navigate('/reception/dashboard'); break;
          case 'administrator': navigate('/admin/dashboard'); break;
          case 'patient': navigate('/patient/dashboard'); break;
          default: navigate('/');
        }
        break;
      case 'doctors':
        if (user.role === 'administrator') {
          navigate('/admin/doctors');
        } else if (user.role === 'doctor') {
          navigate('/doctor/dashboard');
        } else {
          navigate('/login'); // Or show appropriate message
        }
        break;
      case 'clinic':
        if (user.role === 'doctor') {
          navigate('/doctor/dashboard');
        } else if (user.role === 'patient') {
          navigate('/patient/dashboard');
        } else {
          // Show message or navigate to appropriate page
          alert('Clinic visit features are available for doctors and patients only.');
        }
        break;
      case 'services':
        if (user.role === 'patient') {
          navigate('/patient/services');
        } else if (user.role === 'administrator') {
          navigate('/admin/dashboard');
        } else {
          alert('Patient services are available for patients only.');
        }
        break;
      case 'medicines':
        if (user.role === 'administrator') {
          navigate('/admin/medicines');
        } else if (user.role === 'pharmacist') {
          // If you have pharmacist role
          navigate('/pharmacist/dashboard');
        } else {
          alert('Medicine management is available for administrators only.');
        }
        break;
      default:
        break;
    }
  };

  const getRoleName = (role) => {
    switch (role) {
      case 'doctor': return 'Doctor';
      case 'receptionist': return 'Receptionist';
      case 'administrator': return 'Administrator';
      case 'patient': return 'Patient';
      default: return 'User';
    }
  };

  return (
    <header className={styles.topHeader}>
      <div className={styles.container}>
        {/* Left Section - Logo & Title */}
        <div className={styles.leftSection}>
          <div className={styles.logo}>
            <div className={styles.logoContainer}>
              <img 
                src={logo} 
                alt="Anna University Logo" 
                className={styles.logoImage}
              />
            </div>
            <div className={styles.logoText}>
              <h1 className={styles.title}>MIT Health Centre</h1>
              <p className={styles.subtitle}>Anna University, Chennai</p>
              <p className={styles.motto}>Progress Through Knowledge</p>
            </div>
          </div>
        </div>

        {/* Center Section - Navigation Links */}
        <nav className={styles.centerSection}>
          <button 
            className={styles.navLink}
            onClick={() => handleNavigation('home')}
          >
            Home
          </button>
          <button 
            className={styles.navLink}
            onClick={() => handleNavigation('doctors')}
          >
            Doctors
          </button>
          <button 
            className={styles.navLink}
            onClick={() => handleNavigation('clinic')}
          >
            Clinic Visit
          </button>
          <button 
            className={styles.navLink}
            onClick={() => handleNavigation('services')}
          >
            Patient Services
          </button>
          {(user?.role === 'administrator' || user?.role === 'pharmacist') && (
            <button 
              className={styles.navLink}
              onClick={() => handleNavigation('medicines')}
            >
              Medicines
            </button>
          )}
        </nav>

        {/* Right Section - User Info & Logout */}
        <div className={styles.rightSection}>
          {user ? (
            <>
              <div className={styles.userInfo}>
                <div className={styles.userRole}>
                  {getRoleName(user.role)}
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

export default TopHeader;
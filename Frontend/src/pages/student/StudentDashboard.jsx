// src/pages/student/StudentDashboard.jsx - MOBILE-FIRST RESPONSIVE DESIGN

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useAuth } from '../../contexts/AuthContext';
import { 
  fetchStudentProfile,
  fetchStudentVisits,
  fetchStudentPrescriptions,
  fetchStudentLabTests,
  fetchStudentVitals,
  fetchMedicalHistory
} from '../../store/slices/studentsSlice';
import Header from '../../components/Header/Header';
import StudentProfile from '../../components/student/StudentProfile';
import DoctorSchedule from '../../components/student/doctorSchedule';
import MedicalHistory from '../../components/student/MedicalHistory';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCalendarAlt, 
  faUser, 
  faHistory,
  faSpinner,
  faTint,
  faVenusMars,
  faIdCard
} from '@fortawesome/free-solid-svg-icons';
import styles from './StudentDashboard.module.css';

const StudentDashboard = () => {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('schedule');

  // Redux state
  const { profile, loading, error } = useSelector(state => state.students);

  useEffect(() => {
    dispatch(fetchStudentProfile());
  }, [dispatch]);

  const handleRefreshProfile = () => {
    dispatch(fetchStudentProfile());
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    
    // Fetch data when switching to history tab
    if (tab === 'history') {
      dispatch(fetchStudentVisits());
      dispatch(fetchStudentPrescriptions());
      dispatch(fetchStudentLabTests());
      dispatch(fetchStudentVitals());
      dispatch(fetchMedicalHistory());
    }
  };

  if (loading && !profile) {
    return (
      <div className={styles.dashboard}>
        <Header />
        <main className={styles.mainContent}>
          <div className={styles.loadingContainer}>
            <FontAwesomeIcon icon={faSpinner} spin size="3x" />
            <p>Loading student portal...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className={styles.dashboard}>
        <Header />
        <main className={styles.mainContent}>
          <div className={styles.container}>
            <div className={styles.errorContainer}>
              <p className={styles.errorText}>Error loading profile: {error}</p>
              <button onClick={handleRefreshProfile} className={styles.retryButton}>
                Retry
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className={styles.dashboard}>
      <Header />
      
      <main className={styles.mainContent}>
        <div className={styles.container}>
          {/* Mobile-Optimized Profile Card */}
          <div className={styles.profileCard}>
            <div className={styles.profileHeader}>
              <div className={styles.avatarSection}>
                <div className={styles.avatar}>
                  <FontAwesomeIcon icon={faUser} />
                </div>
                <div className={styles.profileInfo}>
                  <h1 className={styles.studentName}>
                    {profile?.name || user?.name || 'Student'}
                  </h1>
                  <p className={styles.rollNumber}>
                    <FontAwesomeIcon icon={faIdCard} className={styles.smallIcon} />
                    {profile?.roll_no || 'N/A'}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Quick Stats Row */}
            <div className={styles.quickStats}>
              <div className={styles.statCard}>
                <div className={styles.statIcon}>
                  <FontAwesomeIcon icon={faTint} />
                </div>
                <div className={styles.statContent}>
                  <span className={styles.statLabel}>Blood Group</span>
                  <span className={styles.statValue}>{profile?.blood_group || 'N/A'}</span>
                </div>
              </div>
              
              <div className={styles.statCard}>
                <div className={styles.statIcon}>
                  <FontAwesomeIcon icon={faVenusMars} />
                </div>
                <div className={styles.statContent}>
                  <span className={styles.statLabel}>Gender</span>
                  <span className={styles.statValue}>{profile?.gender || 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Tab Navigation - Mobile Friendly */}
          <div className={styles.tabNavigation}>
            <button
              className={`${styles.tabButton} ${activeTab === 'schedule' ? styles.activeTab : ''}`}
              onClick={() => handleTabChange('schedule')}
            >
              <FontAwesomeIcon icon={faCalendarAlt} className={styles.tabIcon} />
              <span className={styles.tabLabel}>Schedule</span>
            </button>
            
            <button
              className={`${styles.tabButton} ${activeTab === 'profile' ? styles.activeTab : ''}`}
              onClick={() => handleTabChange('profile')}
            >
              <FontAwesomeIcon icon={faUser} className={styles.tabIcon} />
              <span className={styles.tabLabel}>Profile</span>
            </button>
            
            <button
              className={`${styles.tabButton} ${activeTab === 'history' ? styles.activeTab : ''}`}
              onClick={() => handleTabChange('history')}
            >
              <FontAwesomeIcon icon={faHistory} className={styles.tabIcon} />
              <span className={styles.tabLabel}>History</span>
            </button>
          </div>

          {/* Tab Content */}
          <div className={styles.tabContent}>
            {activeTab === 'schedule' && <DoctorSchedule />}
            
            {activeTab === 'profile' && (
              <StudentProfile 
                profileData={profile} 
                loading={loading}
                onRefresh={handleRefreshProfile}
              />
            )}
            
            {activeTab === 'history' && <MedicalHistory />}
          </div>
        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;
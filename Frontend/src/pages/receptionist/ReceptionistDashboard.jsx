import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faChevronDown, 
  faChevronUp, 
  faExchangeAlt
} from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../contexts/AuthContext';
import Header from '../../components/Header/Header';
import DashboardStats from '../../components/receptionist/DashboardStats';
import DoctorAvailabilityTable from '../../components/receptionist/DoctorAvailabilityTable';
import RegisterPatientForm from '../../components/receptionist/RegisterPatientForm';
import CreateVisitForm from '../../components/receptionist/CreateVisitForm';
import RecentVisitsList from '../../components/receptionist/RecentVisitsList';
import { 
  fetchDoctors, 
  fetchPatients, 
  fetchVisits,
  selectDoctors,
  selectPatients,
  selectVisits
} from '../../store/slices/receptionistSlice';
import styles from './ReceptionistDashboard.module.css';

const ReceptionistDashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  
  const doctors = useSelector(selectDoctors);
  const patients = useSelector(selectPatients);
  const visits = useSelector(selectVisits);

  const [showDoctorAvailability, setShowDoctorAvailability] = useState(false);
  const [showRegisterPatient, setShowRegisterPatient] = useState(false);

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [authLoading, isAuthenticated, navigate]);

  useEffect(() => {
    if (user && isAuthenticated) {
      dispatch(fetchDoctors());
      dispatch(fetchPatients());
      dispatch(fetchVisits());
    }
  }, [dispatch, user, isAuthenticated]);

  const totalPatients = patients?.length || 0;
  const availableDoctors = doctors?.filter(doc => doc.status === 'AVAILABLE').length || 0;
  const todayVisits = visits?.filter(visit => {
    try {
      const visitDate = new Date(visit.visitDate).toDateString();
      const today = new Date().toDateString();
      return visitDate === today;
    } catch {
      return false;
    }
  }).length || 0;

  const handleRoleSwap = () => {
    // Navigate to nurse dashboard
    navigate('/nurse');
  };

  if (authLoading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to login via useEffect
  }

  return (
    <div className={styles.dashboard}>
      <Header />
      
      {/* Role Swap Bar */}
      <div className={styles.roleSwapBar}>
        <div className={styles.roleSwapContainer}>
          <span className={styles.roleSwapText}>Switch Role:</span>
          <button 
            className={styles.roleSwapButton}
            onClick={handleRoleSwap}
            title="Switch to Nurse Dashboard"
          >
            <FontAwesomeIcon icon={faExchangeAlt} />
            <span>Nurse Dashboard</span>
          </button>
        </div>
      </div>
      
      <main className={styles.mainContent}>
        <div className={styles.container}>
          <div className={styles.pageHeader}>
            <div>
              <h1 className={styles.pageTitle}>Receptionist Dashboard</h1>
              <p className={styles.pageSubtitle}>
                Manage patients, doctors, and visits efficiently
              </p>
            </div>
          </div>

          <section className={styles.statsSection}>
            <DashboardStats 
              totalPatients={totalPatients}
              availableDoctors={availableDoctors}
              todayVisits={todayVisits}
            />
          </section>

          <div className={styles.gridLayout}>
            <section className={`${styles.section} ${styles.createVisit}`}>
              <CreateVisitForm 
                patients={patients || []}
                availableDoctors={doctors?.filter(doc => doc.status === 'AVAILABLE') || []}
              />
            </section>

            <section className={`${styles.section} ${styles.recentVisits}`}>
              <RecentVisitsList visits={visits?.slice(0, 5) || []} />
            </section>

            <div className={`${styles.collapsibleSection} ${styles.registerPatientSection}`}>
              <button 
                className={styles.collapsibleHeader}
                onClick={() => setShowRegisterPatient(!showRegisterPatient)}
                type="button"
              >
                <div className={styles.collapsibleTitle}>
                  <h3>Register New Patient</h3>
                  <span className={styles.subtitle}>Add new patient to the system</span>
                </div>
                <FontAwesomeIcon 
                  icon={showRegisterPatient ? faChevronUp : faChevronDown} 
                  className={styles.chevronIcon}
                />
              </button>
              
              {showRegisterPatient && (
                <div className={styles.collapsibleContent}>
                  <RegisterPatientForm />
                </div>
              )}
            </div>

            <div className={`${styles.collapsibleSection} ${styles.doctorAvailabilitySection}`}>
              <button 
                className={styles.collapsibleHeader}
                onClick={() => setShowDoctorAvailability(!showDoctorAvailability)}
                type="button"
              >
                <div className={styles.collapsibleTitle}>
                  <h3>Update Doctor Availability</h3>
                  <span className={styles.subtitle}>Manage doctor status and availability</span>
                </div>
                <FontAwesomeIcon 
                  icon={showDoctorAvailability ? faChevronUp : faChevronDown} 
                  className={styles.chevronIcon}
                />
              </button>
              
              {showDoctorAvailability && (
                <div className={styles.collapsibleContent}>
                  <DoctorAvailabilityTable doctors={doctors || []} />
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ReceptionistDashboard;
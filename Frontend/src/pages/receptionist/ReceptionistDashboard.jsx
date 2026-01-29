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
  selectVisits,
  selectVisitsLoading
} from '../../store/slices/receptionistSlice';
import styles from './ReceptionistDashboard.module.css';

const ReceptionistDashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, loading: authLoading, isAuthenticated } = useAuth();

  const doctors = useSelector(selectDoctors);
  const patients = useSelector(selectPatients);
  const visits = useSelector(selectVisits);
  const visitsLoading = useSelector(selectVisitsLoading);

  const [showRegisterPatient, setShowRegisterPatient] = useState(true);
  const [showDoctorAvailability, setShowDoctorAvailability] = useState(true);

  useEffect(() => {
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
  const todayVisits = visits?.filter(v => {
    try {
      return new Date(v.visitDate).toDateString() === new Date().toDateString();
    } catch {
      return false;
    }
  }).length || 0;

  const handleRoleSwap = () => {
    navigate('/nurse');
  };

  const handleRefreshVisits = ({ from, to } = {}) => {
    dispatch(fetchVisits({ from, to }));
  };

  if (authLoading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className={styles.dashboard}>
      <Header />

      <div className={styles.roleSwapBar}>
        <div className={styles.roleSwapContainer}>
          <span className={styles.roleSwapText}>Switch Role:</span>
          <button
            className={styles.roleSwapButton}
            onClick={handleRoleSwap}
          >
            <FontAwesomeIcon icon={faExchangeAlt} />
            <span>Nurse Dashboard</span>
          </button>
        </div>
      </div>

      <main className={styles.mainContent}>
        <div className={styles.container}>
          <div className={styles.pageHeader}>
            <h1 className={styles.pageTitle}>Receptionist Dashboard</h1>
            <p className={styles.pageSubtitle}>
              Manage patients, doctors, and visits efficiently
            </p>
          </div>

          <section className={styles.statsSection}>
            <DashboardStats
              totalPatients={totalPatients}
              availableDoctors={availableDoctors}
              todayVisits={todayVisits}
            />
          </section>

          <div className={styles.gridLayout}>

            {/* ✅ TOP LEFT — Register Patient (COLLAPSIBLE) */}
            <div className={`${styles.collapsibleSection} ${styles.registerPatientSection}`}>
              <button
                className={styles.collapsibleHeader}
                onClick={() => setShowRegisterPatient(v => !v)}
                type="button"
              >
                <div className={styles.collapsibleTitle}>
                  <h3>Register Patient</h3>
                  <span className={styles.subtitle}>Add a new patient</span>
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

            {/* ✅ TOP RIGHT — Doctor Availability (COLLAPSIBLE) */}
            <div className={`${styles.collapsibleSection} ${styles.doctorAvailabilitySection}`}>
              <button
                className={styles.collapsibleHeader}
                onClick={() => setShowDoctorAvailability(v => !v)}
                type="button"
              >
                <div className={styles.collapsibleTitle}>
                  <h3>Doctor Availability</h3>
                  <span className={styles.subtitle}>View available doctors</span>
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

            {/* ✅ BOTTOM LEFT — Create Visit (SECTION) */}
            <section className={`${styles.section} ${styles.createVisit}`}>
              <CreateVisitForm
                patients={patients || []}
                availableDoctors={doctors?.filter(d => d.status === 'AVAILABLE') || []}
              />
            </section>

            {/* ✅ BOTTOM RIGHT — Recent Visits (SECTION) */}
            <section className={`${styles.section} ${styles.recentVisits}`}>
              <RecentVisitsList
                visits={visits || []}
                onRefresh={handleRefreshVisits}
                isLoading={visitsLoading}
              />
            </section>

          </div>
        </div>
      </main>
    </div>
  );
};

export default ReceptionistDashboard;

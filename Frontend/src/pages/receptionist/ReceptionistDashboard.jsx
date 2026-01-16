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

  const [showCreateVisit, setShowCreateVisit] = useState(true);
  const [showRecentVisits, setShowRecentVisits] = useState(true);

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

            {/* ✅ TOP LEFT — Register Patient */}
            <section className={`${styles.section} ${styles.registerPatientSection}`}>
              <RegisterPatientForm />
            </section>

            {/* ✅ TOP RIGHT — Doctor Availability */}
            <section className={`${styles.section} ${styles.doctorAvailabilitySection}`}>
              <DoctorAvailabilityTable doctors={doctors || []} />
            </section>

            {/* 🔽 BOTTOM LEFT — Create Visit (COLLAPSIBLE) */}
            <div className={`${styles.collapsibleSection} ${styles.createVisit}`}>
              <button
                className={styles.collapsibleHeader}
                onClick={() => setShowCreateVisit(v => !v)}
                type="button"
              >
                <div className={styles.collapsibleTitle}>
                  <h3>Create Visit</h3>
                  <span className={styles.subtitle}>Schedule a patient visit</span>
                </div>
                <FontAwesomeIcon
                  icon={showCreateVisit ? faChevronUp : faChevronDown}
                  className={styles.chevronIcon}
                />
              </button>

              {showCreateVisit && (
                <div className={styles.collapsibleContent}>
                  <CreateVisitForm
                    patients={patients || []}
                    availableDoctors={doctors?.filter(d => d.status === 'AVAILABLE') || []}
                  />
                </div>
              )}
            </div>

            {/* 🔽 BOTTOM RIGHT — Recent Visits (COLLAPSIBLE) */}
            <div className={`${styles.collapsibleSection} ${styles.recentVisits}`}>
              <button
                className={styles.collapsibleHeader}
                onClick={() => setShowRecentVisits(v => !v)}
                type="button"
              >
                <div className={styles.collapsibleTitle}>
                  <h3>Recent Visits</h3>
                  <span className={styles.subtitle}>Latest visit activity</span>
                </div>
                <FontAwesomeIcon
                  icon={showRecentVisits ? faChevronUp : faChevronDown}
                  className={styles.chevronIcon}
                />
              </button>

              {showRecentVisits && (
                <div className={styles.collapsibleContent}>
                  <RecentVisitsList
                    visits={visits || []}
                    onRefresh={handleRefreshVisits}
                    isLoading={visitsLoading}
                  />
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

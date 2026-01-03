import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import Header from '../../components/Header/Header';
import DashboardStats from '../../components/receptionist/DashboardStats';
import DoctorAvailabilityTable from '../../components/receptionist/DoctorAvailabilityTable';
import RegisterPatientForm from '../../components/receptionist/RegisterPatientForm';
import CreateVisitForm from '../../components/receptionist/CreateVisitForm';
import RecentVisitsList from '../../components/receptionist/RecentVisitsList';
import { fetchDoctors } from '../../store/slices/doctorsSlice';
import { fetchPatients } from '../../store/slices/patientsSlice';
import { fetchVisits } from '../../store/slices/visitsSlice';
import styles from './ReceptionistDashboard.module.css';

const ReceptionistDashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { doctors = [] } = useSelector((state) => state.doctors || {});
  const { patients = [] } = useSelector((state) => state.patients || {});
  const { visits = [] } = useSelector((state) => state.visits || {});

  const [showDoctorAvailability, setShowDoctorAvailability] = useState(false);
  const [showRegisterPatient, setShowRegisterPatient] = useState(false);

  useEffect(() => {
    dispatch(fetchDoctors());
    dispatch(fetchPatients());
    dispatch(fetchVisits());
  }, [dispatch]);

  const totalPatients = patients.length;
  const availableDoctors = doctors.filter(doc => doc.status === 'AVAILABLE').length;
  const todayVisits = visits.filter(visit => {
    const visitDate = new Date(visit.visitDate).toDateString();
    const today = new Date().toDateString();
    return visitDate === today;
  }).length;

  const handleToggleRegisterPatient = () => {
    console.log('Toggle Register Patient:', !showRegisterPatient);
    setShowRegisterPatient(!showRegisterPatient);
  };

  const handleToggleDoctorAvailability = () => {
    console.log('Toggle Doctor Availability:', !showDoctorAvailability);
    setShowDoctorAvailability(!showDoctorAvailability);
  };

  return (
    <div className={styles.dashboard}>
      <Header />
      
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
            <section className={`${styles.section} ${styles.createVisit}`}>
              <CreateVisitForm 
                patients={patients}
                availableDoctors={doctors.filter(doc => doc.status === 'AVAILABLE')}
              />
            </section>

            <section className={`${styles.section} ${styles.recentVisits}`}>
              <RecentVisitsList visits={visits.slice(0, 5)} />
            </section>

            <div className={`${styles.collapsibleSection} ${styles.registerPatientSection}`}>
              <button 
                className={styles.collapsibleHeader}
                onClick={handleToggleRegisterPatient}
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
                onClick={handleToggleDoctorAvailability}
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
                  <DoctorAvailabilityTable doctors={doctors} />
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
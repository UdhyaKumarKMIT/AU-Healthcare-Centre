// src/components/PatientDashboard/PatientDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useDispatch, useSelector } from 'react-redux';
import Header from '../Header/Header';
import AppointmentForm from './AppointmentForm';
import styles from './PatientDashboard.module.css';
import { fetchPatientHistory, createAppointment } from '../../store/slices/patientSlice';

const PatientDashboard = () => {
  const { user, logout } = useAuth();
  const dispatch = useDispatch();
  
  // Redux state for patient data
  const patientState = useSelector((state) => state.patient || {});
  const { patientInfo, visitHistory = [], loading, error } = patientState;
  
  const [showAppointmentForm, setShowAppointmentForm] = useState(false);
  const [patientStatus, setPatientStatus] = useState('new');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (user?.user_id) {
      // Fetch patient history if they have visited before
      dispatch(fetchPatientHistory(user.user_id));
    }
  }, [user, dispatch]);

  useEffect(() => {
    // Determine if patient is new or returning
    if (visitHistory && visitHistory.length > 0) {
      setPatientStatus('returning');
    } else {
      setPatientStatus('new');
    }
  }, [visitHistory]);

  const handleBookAppointment = () => {
    setShowAppointmentForm(true);
  };

  const handleSubmitAppointment = async (appointmentData) => {
    try {
      await dispatch(createAppointment({
        ...appointmentData,
        patientId: user?.user_id,
        patientName: user?.name || appointmentData.patientName
      })).unwrap();
      
      alert('Appointment booked successfully!');
      setShowAppointmentForm(false);
      // Refresh patient history
      dispatch(fetchPatientHistory(user.user_id));
    } catch (error) {
      alert(`Failed to book appointment: ${error.message}`);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getPatientStatusBadge = () => {
    switch(patientStatus) {
      case 'new':
        return { text: 'New Patient', color: '#28a745', bgColor: '#d4edda' };
      case 'returning':
        return { text: 'Returning Patient', color: '#007bff', bgColor: '#d1ecf1' };
      default:
        return { text: 'Patient', color: '#6c757d', bgColor: '#f8f9fa' };
    }
  };

  const statusBadge = getPatientStatusBadge();

  if (showAppointmentForm) {
    return (
      <div className={styles.dashboard}>
        <Header />
        <AppointmentForm
          patientStatus={patientStatus}
          patientInfo={patientInfo}
          onSubmit={handleSubmitAppointment}
          onCancel={() => setShowAppointmentForm(false)}
          loading={loading}
        />
      </div>
    );
  }

  return (
    <div className={styles.dashboard}>
      <Header />
      
      <main className={styles.mainContent}>
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <h1 className={styles.title}>Patient Dashboard</h1>
            <div className={styles.patientStatus} style={{ 
              backgroundColor: statusBadge.bgColor,
              color: statusBadge.color
            }}>
              {statusBadge.text}
            </div>
          </div>
          
          <div className={styles.userInfo}>
            <div className={styles.userDetails}>
              <span className={styles.userName}>Welcome, {user?.name || 'Patient'}</span>
              <span className={styles.userId}>ID: {user?.user_id?.slice(0, 8)}</span>
            </div>
            <button onClick={logout} className={styles.logoutBtn}>
              Logout
            </button>
          </div>
        </header>

        {/* Quick Stats */}
        <div className={styles.quickStats}>
          <div className={styles.statCard}>
            <div className={styles.statValue}>{visitHistory.length}</div>
            <div className={styles.statLabel}>Total Visits</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statValue}>
              {visitHistory.filter(v => v.status === 'upcoming').length}
            </div>
            <div className={styles.statLabel}>Upcoming</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statValue}>
              {visitHistory.filter(v => v.status === 'completed').length}
            </div>
            <div className={styles.statLabel}>Completed</div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className={styles.tabNavigation}>
          <button 
            className={`${styles.tabBtn} ${activeTab === 'overview' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button 
            className={`${styles.tabBtn} ${activeTab === 'appointments' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('appointments')}
          >
            Appointments
          </button>
          <button 
            className={`${styles.tabBtn} ${activeTab === 'history' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('history')}
          >
            Medical History
          </button>
        </div>

        {/* Main Content Area */}
        <div className={styles.content}>
          {activeTab === 'overview' && (
            <>
              <div className={styles.section}>
                <h2 className={styles.sectionTitle}>Quick Actions</h2>
                <div className={styles.actions}>
                  <button 
                    className={styles.actionBtn}
                    onClick={handleBookAppointment}
                  >
                    Book Appointment
                  </button>
                  <button className={styles.actionBtn}>View Prescriptions</button>
                  <button className={styles.actionBtn}>Medical Reports</button>
                  <button className={styles.actionBtn}>Update Profile</button>
                </div>
              </div>

              <div className={styles.section}>
                <h2 className={styles.sectionTitle}>Recent Activity</h2>
                {visitHistory.length > 0 ? (
                  <div className={styles.activityList}>
                    {visitHistory.slice(0, 3).map((visit, index) => (
                      <div key={index} className={styles.activityItem}>
                        <div className={styles.activityDate}>
                          {formatDate(visit.date)}
                        </div>
                        <div className={styles.activityDetails}>
                          <span className={styles.activityType}>
                            {visit.type || 'General Consultation'}
                          </span>
                          <span className={styles.activityDoctor}>
                            Dr. {visit.doctorName}
                          </span>
                        </div>
                        <div className={`${styles.activityStatus} ${styles[visit.status]}`}>
                          {visit.status}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className={styles.emptyState}>
                    <p>No recent activity found</p>
                    <button 
                      className={styles.ctaBtn}
                      onClick={handleBookAppointment}
                    >
                      Book Your First Appointment
                    </button>
                  </div>
                )}
              </div>
            </>
          )}

          {activeTab === 'appointments' && (
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Your Appointments</h2>
                <button 
                  className={styles.addBtn}
                  onClick={handleBookAppointment}
                >
                  + New Appointment
                </button>
              </div>
              
              {visitHistory.length > 0 ? (
                <div className={styles.appointmentsList}>
                  {visitHistory.map((appointment, index) => (
                    <div key={index} className={styles.appointmentCard}>
                      <div className={styles.appointmentHeader}>
                        <h3 className={styles.appointmentTitle}>
                          {appointment.type || 'Consultation'}
                        </h3>
                        <span className={`${styles.statusBadge} ${styles[appointment.status]}`}>
                          {appointment.status}
                        </span>
                      </div>
                      
                      <div className={styles.appointmentDetails}>
                        <div className={styles.detailRow}>
                          <span className={styles.detailLabel}>Date:</span>
                          <span className={styles.detailValue}>{formatDate(appointment.date)}</span>
                        </div>
                        <div className={styles.detailRow}>
                          <span className={styles.detailLabel}>Time:</span>
                          <span className={styles.detailValue}>{appointment.time}</span>
                        </div>
                        <div className={styles.detailRow}>
                          <span className={styles.detailLabel}>Doctor:</span>
                          <span className={styles.detailValue}>Dr. {appointment.doctorName}</span>
                        </div>
                        <div className={styles.detailRow}>
                          <span className={styles.detailLabel}>Purpose:</span>
                          <span className={styles.detailValue}>{appointment.reason}</span>
                        </div>
                      </div>
                      
                      {appointment.status === 'upcoming' && (
                        <div className={styles.appointmentActions}>
                          <button className={styles.actionBtnSm}>Reschedule</button>
                          <button className={styles.actionBtnSm}>Cancel</button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className={styles.emptyState}>
                  <div className={styles.emptyIcon}>📅</div>
                  <h3>No Appointments Yet</h3>
                  <p>Schedule your first appointment to get started with our healthcare services</p>
                  <button 
                    className={styles.ctaBtn}
                    onClick={handleBookAppointment}
                  >
                    Book Appointment
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'history' && (
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Medical History</h2>
              {visitHistory.length > 0 ? (
                <div className={styles.medicalHistory}>
                  {visitHistory.filter(v => v.status === 'completed').map((visit, index) => (
                    <div key={index} className={styles.historyCard}>
                      <div className={styles.historyHeader}>
                        <h3>{formatDate(visit.date)}</h3>
                        <span className={styles.visitType}>{visit.type}</span>
                      </div>
                      
                      <div className={styles.historyContent}>
                        <div className={styles.diagnosisSection}>
                          <h4>Diagnosis</h4>
                          <p>{visit.diagnosis || 'No diagnosis recorded'}</p>
                        </div>
                        
                        <div className={styles.vitalsSection}>
                          <h4>Vitals</h4>
                          {visit.vitals ? (
                            <div className={styles.vitalsGrid}>
                              <div className={styles.vitalItem}>
                                <span>BP:</span>
                                <strong>{visit.vitals.bloodPressure || '--/--'}</strong>
                              </div>
                              <div className={styles.vitalItem}>
                                <span>Temp:</span>
                                <strong>{visit.vitals.temperature || '--'}°C</strong>
                              </div>
                              <div className={styles.vitalItem}>
                                <span>Pulse:</span>
                                <strong>{visit.vitals.pulse || '--'} bpm</strong>
                              </div>
                              <div className={styles.vitalItem}>
                                <span>Weight:</span>
                                <strong>{visit.vitals.weight || '--'} kg</strong>
                              </div>
                            </div>
                          ) : (
                            <p>No vitals recorded</p>
                          )}
                        </div>
                        
                        <div className={styles.prescriptionSection}>
                          <h4>Prescriptions</h4>
                          {visit.prescriptions && visit.prescriptions.length > 0 ? (
                            <ul>
                              {visit.prescriptions.map((med, medIndex) => (
                                <li key={medIndex}>{med.name} - {med.dosage}</li>
                              ))}
                            </ul>
                          ) : (
                            <p>No prescriptions</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={styles.emptyState}>
                  <div className={styles.emptyIcon}>🏥</div>
                  <h3>No Medical History</h3>
                  <p>Your medical records will appear here after your first visit</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default PatientDashboard;
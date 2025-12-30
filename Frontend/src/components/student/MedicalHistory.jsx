// src/components/student/MedicalHistory.jsx - NO EMOJIS, FONTAWESOME ONLY

import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSpinner,
  faFileMedical,
  faPrescription,
  faFlask,
  faHeartbeat,
  faCalendarAlt,
  faUserMd,
  faClipboardList,
  faThermometerHalf,
  faTint,
  faStethoscope
} from '@fortawesome/free-solid-svg-icons';
import styles from './MedicalHistory.module.css';

const MedicalHistory = () => {
  const { 
    visits, 
    prescriptions, 
    labTests, 
    vitals,
    medicalHistory,
    loading 
  } = useSelector(state => state.students);

  const [activeSection, setActiveSection] = useState('visits');

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <FontAwesomeIcon icon={faSpinner} spin size="3x" />
        <p>Loading medical records...</p>
      </div>
    );
  }

  return (
    <div className={styles.historyContainer}>
      {/* Section Navigation */}
      <div className={styles.sectionNav}>
        <button
          className={`${styles.sectionButton} ${activeSection === 'visits' ? styles.active : ''}`}
          onClick={() => setActiveSection('visits')}
        >
          <FontAwesomeIcon icon={faFileMedical} />
          <span>Visits ({visits?.length || 0})</span>
        </button>
        <button
          className={`${styles.sectionButton} ${activeSection === 'prescriptions' ? styles.active : ''}`}
          onClick={() => setActiveSection('prescriptions')}
        >
          <FontAwesomeIcon icon={faPrescription} />
          <span>Prescriptions ({prescriptions?.length || 0})</span>
        </button>
        <button
          className={`${styles.sectionButton} ${activeSection === 'labs' ? styles.active : ''}`}
          onClick={() => setActiveSection('labs')}
        >
          <FontAwesomeIcon icon={faFlask} />
          <span>Lab Tests ({labTests?.length || 0})</span>
        </button>
        <button
          className={`${styles.sectionButton} ${activeSection === 'vitals' ? styles.active : ''}`}
          onClick={() => setActiveSection('vitals')}
        >
          <FontAwesomeIcon icon={faHeartbeat} />
          <span>Vitals ({vitals?.length || 0})</span>
        </button>
        <button
          className={`${styles.sectionButton} ${activeSection === 'conditions' ? styles.active : ''}`}
          onClick={() => setActiveSection('conditions')}
        >
          <FontAwesomeIcon icon={faClipboardList} />
          <span>Conditions ({medicalHistory?.length || 0})</span>
        </button>
      </div>

      {/* Visits Section */}
      {activeSection === 'visits' && (
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <FontAwesomeIcon icon={faFileMedical} /> Visit History
          </h2>
          
          {!visits || visits.length === 0 ? (
            <div className={styles.emptyState}>
              <p>No visit records found</p>
            </div>
          ) : (
            <div className={styles.cardGrid}>
              {visits.map(visit => (
                <div key={visit.visit_id} className={styles.card}>
                  <div className={styles.cardHeader}>
                    <div>
                      <span className={styles.cardDate}>
                        <FontAwesomeIcon icon={faCalendarAlt} />
                        {formatDate(visit.visit_date)}
                      </span>
                    </div>
                    <span className={`${styles.statusBadge} ${styles[visit.status?.toLowerCase()]}`}>
                      {visit.status}
                    </span>
                  </div>
                  
                  <div className={styles.cardBody}>
                    <div className={styles.infoRow}>
                      <FontAwesomeIcon icon={faUserMd} className={styles.icon} />
                      <div>
                        <p className={styles.label}>Doctor</p>
                        <p className={styles.value}>Dr. {visit.doctor_name || 'N/A'}</p>
                        {visit.specialization && (
                          <p className={styles.subtext}>{visit.specialization}</p>
                        )}
                      </div>
                    </div>

                    <div className={styles.infoRow}>
                      <p className={styles.label}>Visit Type:</p>
                      <p className={styles.value}>{visit.visit_type || 'General'}</p>
                    </div>

                    <div className={styles.infoRow}>
                      <p className={styles.label}>Reason:</p>
                      <p className={styles.value}>{visit.reason || 'N/A'}</p>
                    </div>

                    {visit.diagnosis_name && (
                      <div className={styles.diagnosisBox}>
                        <p className={styles.diagnosisLabel}>Diagnosis</p>
                        <p className={styles.diagnosisValue}>{visit.diagnosis_name}</p>
                        {visit.diagnosis_notes && (
                          <p className={styles.diagnosisNotes}>{visit.diagnosis_notes}</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Prescriptions Section */}
      {activeSection === 'prescriptions' && (
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <FontAwesomeIcon icon={faPrescription} /> Prescriptions
          </h2>
          
          {!prescriptions || prescriptions.length === 0 ? (
            <div className={styles.emptyState}>
              <p>No prescription records found</p>
            </div>
          ) : (
            <div className={styles.cardGrid}>
              {prescriptions.map(prescription => (
                <div key={prescription.prescription_id || prescription.item_id} className={styles.card}>
                  <div className={styles.cardHeader}>
                    <span className={styles.cardDate}>
                      <FontAwesomeIcon icon={faCalendarAlt} />
                      {formatDate(prescription.created_at)}
                    </span>
                    <span className={`${styles.statusBadge} ${styles[prescription.prescription_status?.toLowerCase()]}`}>
                      {prescription.prescription_status}
                    </span>
                  </div>
                  
                  <div className={styles.cardBody}>
                    <div className={styles.infoRow}>
                      <FontAwesomeIcon icon={faUserMd} className={styles.icon} />
                      <div>
                        <p className={styles.label}>Prescribed by</p>
                        <p className={styles.value}>Dr. {prescription.doctor_name}</p>
                        <p className={styles.subtext}>{prescription.specialization}</p>
                      </div>
                    </div>

                    {prescription.med_name && (
                      <div className={styles.medicationBox}>
                        <p className={styles.medName}>{prescription.med_name}</p>
                        <p className={styles.medType}>{prescription.med_type}</p>
                        
                        <div className={styles.dosageGrid}>
                          <div className={styles.dosageItem}>
                            <span className={styles.dosageLabel}>Morning</span>
                            <span className={styles.dosageValue}>{prescription.morning || '-'}</span>
                          </div>
                          <div className={styles.dosageItem}>
                            <span className={styles.dosageLabel}>Afternoon</span>
                            <span className={styles.dosageValue}>{prescription.afternoon || '-'}</span>
                          </div>
                          <div className={styles.dosageItem}>
                            <span className={styles.dosageLabel}>Night</span>
                            <span className={styles.dosageValue}>{prescription.night || '-'}</span>
                          </div>
                        </div>

                        <div className={styles.prescriptionMeta}>
                          <span>Duration: {prescription.total_days} days</span>
                          <span>Take {prescription.food}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Lab Tests Section */}
      {activeSection === 'labs' && (
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <FontAwesomeIcon icon={faFlask} /> Lab Test Results
          </h2>
          
          {!labTests || labTests.length === 0 ? (
            <div className={styles.emptyState}>
              <p>No lab test records found</p>
            </div>
          ) : (
            <div className={styles.cardGrid}>
              {labTests.map(test => (
                <div key={test.lab_test_id} className={styles.card}>
                  <div className={styles.cardHeader}>
                    <span className={styles.cardDate}>
                      <FontAwesomeIcon icon={faCalendarAlt} />
                      {formatDate(test.ordered_date)}
                    </span>
                  </div>
                  
                  <div className={styles.cardBody}>
                    <h3 className={styles.testName}>{test.test_name}</h3>
                    
                    <div className={styles.resultBox}>
                      <div className={styles.resultRow}>
                        <span className={styles.resultLabel}>Result:</span>
                        <span className={styles.resultValue}>{test.result || 'Pending'}</span>
                      </div>
                      {test.normal_range && (
                        <div className={styles.resultRow}>
                          <span className={styles.resultLabel}>Normal Range:</span>
                          <span className={styles.normalRange}>{test.normal_range}</span>
                        </div>
                      )}
                    </div>

                    {test.doctor_name && (
                      <div className={styles.infoRow}>
                        <FontAwesomeIcon icon={faUserMd} className={styles.icon} />
                        <span>Ordered by Dr. {test.doctor_name}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Vitals Section */}
      {activeSection === 'vitals' && (
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <FontAwesomeIcon icon={faHeartbeat} /> Vital Signs History
          </h2>
          
          {!vitals || vitals.length === 0 ? (
            <div className={styles.emptyState}>
              <p>No vital signs records found</p>
            </div>
          ) : (
            <div className={styles.cardGrid}>
              {vitals.map(vital => (
                <div key={vital.vitals_id} className={styles.card}>
                  <div className={styles.cardHeader}>
                    <span className={styles.cardDate}>
                      <FontAwesomeIcon icon={faCalendarAlt} />
                      {formatDate(vital.visit_date)}
                    </span>
                  </div>
                  
                  <div className={styles.cardBody}>
                    <div className={styles.vitalsGrid}>
                      <div className={styles.vitalItem}>
                        <FontAwesomeIcon icon={faThermometerHalf} className={styles.vitalIcon} />
                        <div>
                          <p className={styles.vitalLabel}>Temperature</p>
                          <p className={styles.vitalValue}>{vital.temperature}°F</p>
                        </div>
                      </div>

                      <div className={styles.vitalItem}>
                        <FontAwesomeIcon icon={faHeartbeat} className={styles.vitalIcon} />
                        <div>
                          <p className={styles.vitalLabel}>Heart Rate</p>
                          <p className={styles.vitalValue}>{vital.heart_rate} bpm</p>
                        </div>
                      </div>

                      <div className={styles.vitalItem}>
                        <FontAwesomeIcon icon={faStethoscope} className={styles.vitalIcon} />
                        <div>
                          <p className={styles.vitalLabel}>Blood Pressure</p>
                          <p className={styles.vitalValue}>
                            {vital.bp_systolic}/{vital.bp_diastolic} mmHg
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Medical Conditions Section */}
      {activeSection === 'conditions' && (
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <FontAwesomeIcon icon={faClipboardList} /> Medical Conditions
          </h2>
          
          {!medicalHistory || medicalHistory.length === 0 ? (
            <div className={styles.emptyState}>
              <p>No medical conditions recorded</p>
            </div>
          ) : (
            <div className={styles.cardGrid}>
              {medicalHistory.map(condition => (
                <div key={condition.history_id} className={styles.card}>
                  <div className={styles.cardHeader}>
                    <h3 className={styles.conditionName}>{condition.condition_name}</h3>
                    <span className={`${styles.statusBadge} ${styles[condition.status?.toLowerCase()]}`}>
                      {condition.status}
                    </span>
                  </div>
                  
                  <div className={styles.cardBody}>
                    <div className={styles.infoRow}>
                      <p className={styles.label}>Since:</p>
                      <p className={styles.value}>{formatDate(condition.since_date)}</p>
                    </div>

                    {condition.notes && (
                      <div className={styles.notesBox}>
                        <p className={styles.notesLabel}>Notes:</p>
                        <p className={styles.notesText}>{condition.notes}</p>
                      </div>
                    )}

                    <p className={styles.recordedDate}>
                      Recorded on {formatDate(condition.created_at)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MedicalHistory;
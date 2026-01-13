// src/components/doctor/PatientHistoryModal.jsx

import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faSpinner } from '@fortawesome/free-solid-svg-icons';
import styles from './PatientHistoryModal.module.css';

const PatientHistoryModal = ({ history, loading, error, onClose }) => {
  if (loading) {
    return (
      <div className={styles.modalOverlay} onClick={onClose}>
        <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
          <div className={styles.loadingContainer}>
            <FontAwesomeIcon icon={faSpinner} spin className={styles.spinner} />
            <p>Loading patient history...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.modalOverlay} onClick={onClose}>
        <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
          <div className={styles.errorContainer}>
            <p className={styles.errorText}>Error loading history: {error}</p>
            <button onClick={onClose} className={styles.closeBtn}>Close</button>
          </div>
        </div>
      </div>
    );
  }

  if (!history) return null;

  const { patient, medicalHistory, pastVisits, prescriptions, labTests, vitalsHistory } = history;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div>
            <h2 className={styles.modalTitle}>Patient Medical History</h2>
            <p className={styles.patientName}>{patient.name}</p>
          </div>
          <button onClick={onClose} className={styles.closeButton}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        <div className={styles.modalBody}>
          {/* LEFT COLUMN */}
          <div>
            {/* Patient Basic Info */}
            <section className={styles.section}>
              <h3 className={styles.sectionTitle}>Patient Information</h3>
              <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                  <span className={styles.label}>Date of Birth:</span>
                  <span className={styles.value}>
                    {patient.dob ? new Date(patient.dob).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.label}>Gender:</span>
                  <span className={styles.value}>{patient.gender || 'N/A'}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.label}>Patient Type:</span>
                  <span className={styles.value}>{patient.patient_type?.replace('_', ' ') || 'N/A'}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.label}>Phone:</span>
                  <span className={styles.value}>{patient.phone || 'N/A'}</span>
                </div>
                {patient.allergies && (
                  <div className={styles.infoItem} style={{ gridColumn: '1 / -1' }}>
                    <span className={styles.label}>⚠️ Allergies:</span>
                    <span className={styles.value} style={{ color: '#ef4444', fontWeight: 600 }}>
                      {patient.allergies}
                    </span>
                  </div>
                )}
              </div>
            </section>

            {/* Medical History */}
            {medicalHistory && medicalHistory.length > 0 && (
              <section className={styles.section} style={{ marginTop: '24px' }}>
                <h3 className={styles.sectionTitle}>Medical Conditions</h3>
                <div className={styles.historyList}>
                  {medicalHistory.map((condition) => (
                    <div key={condition.history_id} className={styles.historyItem}>
                      <div className={styles.conditionHeader}>
                        <strong>{condition.condition_name}</strong>
                        <span className={`${styles.badge} ${styles[condition.status?.toLowerCase()]}`}>
                          {condition.status}
                        </span>
                      </div>
                      {condition.since_date && (
                        <p className={styles.historyDetail}>
                          Since: {new Date(condition.since_date).toLocaleDateString()}
                        </p>
                      )}
                      {condition.notes && (
                        <p className={styles.historyNotes}>{condition.notes}</p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Vitals History */}
            {vitalsHistory && vitalsHistory.length > 0 && (
              <section className={styles.section} style={{ marginTop: '24px' }}>
                <h3 className={styles.sectionTitle}>Vitals History</h3>
                <div className={styles.vitalsList}>
                  {vitalsHistory.map((vital) => (
                    <div key={vital.vitals_id} className={styles.vitalItem}>
                      <strong>{new Date(vital.visit_date).toLocaleDateString()}</strong>
                      <div className={styles.vitalDetails}>
                        {vital.temperature && <span>Temp: {vital.temperature}°F</span>}
                        {vital.bp_systolic && vital.bp_diastolic && (
                          <span>BP: {vital.bp_systolic}/{vital.bp_diastolic}</span>
                        )}
                        {vital.heart_rate && <span>HR: {vital.heart_rate} bpm</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* RIGHT COLUMN */}
          <div>
            {/* Past Visits */}
            {pastVisits && pastVisits.length > 0 && (
              <section className={styles.section}>
                <h3 className={styles.sectionTitle}>Past Visits</h3>
                <div className={styles.visitsList}>
                  {pastVisits.map((visit) => (
                    <div key={visit.visit_id} className={styles.visitItem}>
                      <div className={styles.visitHeader}>
                        <div>
                          <strong>{new Date(visit.visit_date).toLocaleDateString()}</strong>
                          <span className={styles.visitType}> - {visit.visit_type || 'General'}</span>
                        </div>
                        <span className={styles.badge}>{visit.status}</span>
                      </div>
                      {visit.doctor_name && (
                        <p className={styles.visitDetail}>
                          Doctor: {visit.doctor_name}
                          {visit.specialization && ` (${visit.specialization})`}
                        </p>
                      )}
                      {visit.reason && (
                        <p className={styles.visitDetail}>Reason: {visit.reason}</p>
                      )}
                      
                      {/* Display all diagnoses for this visit */}
                      {visit.diagnoses && visit.diagnoses.length > 0 && (
                        <div className={styles.diagnosisBox}>
                          <strong>Diagnosis:</strong>
                          {visit.diagnoses.map((diag, idx) => (
                            <div key={idx} style={{ marginTop: idx > 0 ? '8px' : '4px' }}>
                              <div>{diag.diagnosis_name}</div>
                              {diag.remarks && (
                                <p className={styles.diagnosisNotes}>{diag.remarks}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {/* Display prescriptions for this visit */}
                      {visit.prescriptions && visit.prescriptions.length > 0 && (
                        <div className={styles.prescriptionBox} style={{ marginTop: '12px' }}>
                          <strong>Prescribed Medicines:</strong>
                          {visit.prescriptions.map((prescription, pIdx) => (
                            <div key={pIdx} style={{ marginTop: '8px' }}>
                              {prescription.medicines && prescription.medicines.length > 0 && (
                                <div className={styles.medicinesList}>
                                  {prescription.medicines.map((med, mIdx) => (
                                    <div key={mIdx} className={styles.medicineItem} style={{ 
                                      padding: '6px 8px', 
                                      background: '#f8fafc', 
                                      borderRadius: '4px',
                                      marginTop: mIdx > 0 ? '4px' : 0 
                                    }}>
                                      <div>
                                        <strong>{med.medicine_name}</strong>
                                        {med.medicine_type && <span className={styles.medType}> ({med.medicine_type})</span>}
                                      </div>
                                      <div className={styles.medDetails} style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                                        <span>Duration: {med.duration_days} days</span>
                                        <span> | Dosage: {med.dosage_per_day} per day</span>
                                        {med.quantity && <span> | Qty: {med.quantity}</span>}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Separate Prescriptions Section - if needed for standalone prescriptions */}
            {prescriptions && prescriptions.length > 0 && (
              <section className={styles.section} style={{ marginTop: '24px' }}>
                <h3 className={styles.sectionTitle}>All Prescriptions</h3>
                <div className={styles.prescriptionsList}>
                  {prescriptions.map((prescription, idx) => (
                    <div key={idx} className={styles.prescriptionItem}>
                      <div className={styles.prescriptionHeader}>
                        <div>
                          <strong>{new Date(prescription.created_at).toLocaleDateString()}</strong>
                        </div>
                      </div>
                      <div className={styles.medicinesList}>
                        {prescription.medicines && prescription.medicines.map((med, medIdx) => (
                          <div key={medIdx} className={styles.medicineItem}>
                            <strong>{med.medicine_name}</strong>
                            {med.medicine_type && <span className={styles.medType}> ({med.medicine_type})</span>}
                            <div className={styles.medDetails}>
                              <span>Duration: {med.duration_days} days</span>
                              <span> | Dosage: {med.dosage_per_day} per day</span>
                              {med.quantity && <span> | Qty: {med.quantity}</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Lab Tests */}
            {labTests && labTests.length > 0 && (
              <section className={styles.section} style={{ marginTop: '24px' }}>
                <h3 className={styles.sectionTitle}>Lab Tests</h3>
                <div className={styles.labTestsList}>
                  {labTests.map((test) => (
                    <div key={test.lab_test_id} className={styles.labTestItem}>
                      <strong>{test.test_name}</strong>
                      <p className={styles.testDetail}>
                        Ordered: {new Date(test.ordered_date).toLocaleDateString()}
                      </p>
                      {test.result && (
                        <p className={styles.testResult}>
                          Result: {test.result}
                          {test.normal_range && ` (Normal: ${test.normal_range})`}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>

        <div className={styles.modalFooter}>
          <button onClick={onClose} className={styles.closeBtn}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default PatientHistoryModal;
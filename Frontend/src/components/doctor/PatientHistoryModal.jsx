// src/components/doctor/PatientHistoryModal.jsx

import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faSpinner, faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import styles from './PatientHistoryModal.module.css';

const PatientHistoryModal = ({ history, loading, error, onClose }) => {
  const [expandedVisitId, setExpandedVisitId] = useState(null);

  const toggleVisit = (visitId) => {
    setExpandedVisitId(expandedVisitId === visitId ? null : visitId);
  };
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
                  {pastVisits.map((visit) => {
                    const isExpanded = expandedVisitId === visit.visit_id;
                    const diagnosisCount = visit.diagnoses?.length || 0;
                    const prescriptionCount = visit.prescriptions?.length || 0;
                    
                    return (
                      <div 
                        key={visit.visit_id} 
                        className={styles.visitItem}
                        style={{ 
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          border: isExpanded ? '2px solid #3b82f6' : '1px solid #e2e8f0'
                        }}
                      >
                        {/* High-level summary - always visible */}
                        <div onClick={() => toggleVisit(visit.visit_id)}>
                          <div className={styles.visitHeader}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                              <div>
                                <strong>{new Date(visit.visit_date).toLocaleDateString()}</strong>
                                <span className={styles.visitType}> - {visit.visit_type || 'General'}</span>
                              </div>
                              <div style={{ display: 'flex', gap: '8px', fontSize: '12px' }}>
                                {diagnosisCount > 0 && (
                                  <span style={{ 
                                    background: '#dbeafe', 
                                    color: '#1e40af', 
                                    padding: '2px 8px', 
                                    borderRadius: '12px',
                                    fontWeight: 600
                                  }}>
                                    {diagnosisCount} Diagnosis
                                  </span>
                                )}
                                {prescriptionCount > 0 && (
                                  <span style={{ 
                                    background: '#dcfce7', 
                                    color: '#166534', 
                                    padding: '2px 8px', 
                                    borderRadius: '12px',
                                    fontWeight: 600
                                  }}>
                                    {prescriptionCount} Prescription{prescriptionCount > 1 ? 's' : ''}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <span className={styles.badge}>{visit.status}</span>
                              <FontAwesomeIcon 
                                icon={isExpanded ? faChevronUp : faChevronDown} 
                                style={{ color: '#64748b', fontSize: '14px' }}
                              />
                            </div>
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
                        </div>

                        {/* Detailed information - shown when expanded */}
                        {isExpanded && (
                          <div style={{ 
                            marginTop: '16px', 
                            paddingTop: '16px', 
                            borderTop: '1px solid #e2e8f0',
                            animation: 'slideDown 0.3s ease'
                          }}>
                            {/* Diagnoses Details */}
                            {visit.diagnoses && visit.diagnoses.length > 0 && (
                              <div className={styles.diagnosisBox}>
                                <strong style={{ color: '#1a237e', fontSize: '14px' }}>
                                  📋 Diagnoses ({visit.diagnoses.length})
                                </strong>
                                {visit.diagnoses.map((diag, idx) => (
                                  <div 
                                    key={idx} 
                                    style={{ 
                                      marginTop: '12px',
                                      padding: '12px',
                                      background: '#f8fafc',
                                      borderRadius: '6px',
                                      borderLeft: '3px solid #3b82f6'
                                    }}
                                  >
                                    <div style={{ fontWeight: 600, color: '#1e293b' }}>
                                      {diag.diagnosis_name}
                                    </div>
                                    {diag.complaints && (
                                      <p className={styles.diagnosisNotes} style={{ 
                                        marginTop: '8px',
                                        padding: '8px',
                                        background: 'white',
                                        borderRadius: '4px',
                                        fontSize: '13px',
                                        color: '#475569'
                                      }}>
                                        <strong>Patient Complaints:</strong> {diag.complaints}
                                      </p>
                                    )}
                                    {diag.remarks && (
                                      <p className={styles.diagnosisNotes} style={{ 
                                        marginTop: '8px',
                                        padding: '8px',
                                        background: 'white',
                                        borderRadius: '4px',
                                        fontSize: '13px',
                                        color: '#475569',
                                        fontStyle: 'italic'
                                      }}>
                                        <strong>Doctor's Remarks:</strong> {diag.remarks}
                                      </p>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                            
                            {/* Prescriptions Details */}
                            {visit.prescriptions && visit.prescriptions.length > 0 && (
                              <div className={styles.prescriptionBox} style={{ marginTop: '16px' }}>
                                <strong style={{ color: '#1a237e', fontSize: '14px' }}>
                                  💊 Prescribed Medicines
                                </strong>
                                {visit.prescriptions.map((prescription, pIdx) => (
                                  <div key={pIdx} style={{ marginTop: '12px' }}>
                                    {prescription.medicines && prescription.medicines.length > 0 && (
                                      <div className={styles.medicinesList}>
                                        {prescription.medicines.map((med, mIdx) => (
                                          <div 
                                            key={mIdx} 
                                            style={{ 
                                              padding: '12px', 
                                              background: '#f1f5f9', 
                                              borderRadius: '6px',
                                              marginTop: mIdx > 0 ? '8px' : 0,
                                              borderLeft: '3px solid #10b981'
                                            }}
                                          >
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                              <div style={{ flex: 1 }}>
                                                <strong style={{ color: '#1e293b', fontSize: '14px' }}>
                                                  {med.medicine_name}
                                                </strong>
                                                {med.medicine_type && (
                                                  <span className={styles.medType} style={{ 
                                                    marginLeft: '8px',
                                                    background: '#dbeafe',
                                                    color: '#1e40af',
                                                    padding: '2px 6px',
                                                    borderRadius: '4px',
                                                    fontSize: '11px',
                                                    fontWeight: 600
                                                  }}>
                                                    {med.medicine_type}
                                                  </span>
                                                )}
                                              </div>
                                              <div style={{ 
                                                background: '#dcfce7', 
                                                color: '#166534',
                                                padding: '4px 8px',
                                                borderRadius: '4px',
                                                fontSize: '11px',
                                                fontWeight: 600
                                              }}>
                                                {med.duration_days} days
                                              </div>
                                            </div>
                                            <div className={styles.medDetails} style={{ 
                                              fontSize: '12px', 
                                              color: '#64748b', 
                                              marginTop: '8px',
                                              display: 'flex',
                                              gap: '12px',
                                              flexWrap: 'wrap'
                                            }}>
                                              <span style={{ 
                                                background: 'white',
                                                padding: '4px 8px',
                                                borderRadius: '4px',
                                                fontWeight: 500
                                              }}>
                                                📊 Dosage: {med.dosage_per_day} per day
                                              </span>
                                              {med.quantity && (
                                                <span style={{ 
                                                  background: 'white',
                                                  padding: '4px 8px',
                                                  borderRadius: '4px',
                                                  fontWeight: 500
                                                }}>
                                                  📦 Qty: {med.quantity}
                                                </span>
                                              )}
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
                        )}
                      </div>
                    );
                  })}
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
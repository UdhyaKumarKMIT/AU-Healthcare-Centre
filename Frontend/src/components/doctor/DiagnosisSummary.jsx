import React, { useState } from 'react';
import styles from './DiagnosisSummary.module.css';

const DiagnosisSummary = ({ patient, diagnoses = [], onProceedToPrescription }) => {
  const [selectedDiagnosis, setSelectedDiagnosis] = useState(null);

  if (!patient) {
    return (
      <div className={styles.emptyState}>
        <h3 className={styles.emptyTitle}>No Patient Selected</h3>
        <p className={styles.emptyText}>
          Select a patient from the queue to view diagnosis details
        </p>
      </div>
    );
  }

  return (
    <>
      <div className={styles.summaryContainer}>
        {/* Diagnosis Information */}
        <div className={styles.diagnosisSection}>
          <h3 className={styles.sectionTitle}>
            {diagnoses.length > 0 ? `Diagnoses (${diagnoses.length})` : 'Diagnosis'}
          </h3>
          
          {diagnoses.length > 0 ? (
            <div className={styles.diagnosisDetails}>
              {diagnoses.map((diagnosis, index) => (
                <div 
                  key={diagnosis.id} 
                  className={styles.diagnosisCard} 
                  onClick={() => diagnosis.diagnosis_notes && setSelectedDiagnosis(diagnosis)}
                  style={{
                    background: '#f8fafc',
                    padding: '16px',
                    borderRadius: '8px',
                    marginBottom: '12px',
                    border: '1px solid #e2e8f0',
                    cursor: diagnosis.diagnosis_notes ? 'pointer' : 'default',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (diagnosis.diagnosis_notes) {
                      e.currentTarget.style.borderColor = '#3b82f6';
                      e.currentTarget.style.background = '#eff6ff';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#e2e8f0';
                    e.currentTarget.style.background = '#f8fafc';
                  }}
                >
                  <div className={styles.diagnosisField}>
                    <div className={styles.fieldValue} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div>
                        <strong>#{index + 1}:</strong> {diagnosis.diagnosis_name}
                        {diagnosis.diagnosis_code && (
                          <span style={{ marginLeft: '8px', color: '#64748b', fontSize: '13px' }}>
                            (Code: {diagnosis.diagnosis_code})
                          </span>
                        )}
                      </div>
                      {diagnosis.diagnosis_notes && (
                        <span style={{ 
                          fontSize: '12px', 
                          color: '#3b82f6',
                          fontWeight: 500,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          <svg width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                            <path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533L8.93 6.588zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/>
                          </svg>
                          Click for notes
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              <div className={styles.diagnosisMeta}>
                <span className={styles.metaItem}>
                  Total {diagnoses.length} diagnosis(es) recorded
                </span>
              </div>
            </div>
          ) : (
            <div className={styles.noDiagnosis}>
              <p className={styles.noDiagnosisText}>
                No diagnosis recorded yet. Click "View" to examine patient and add diagnosis.
              </p>
            </div>
          )}
        </div>

      {/* Action Buttons */}
      <div className={styles.actionSection}>
        <button
          className={styles.prescriptionBtn}
          onClick={onProceedToPrescription}
          disabled={diagnoses.length === 0}
        >
          Proceed to Prescription
        </button>
        <p className={styles.actionHint}>
          {diagnoses.length === 0 ? 'Complete diagnosis first' : 'Ready to prescribe medication'}
        </p>
      </div>
    </div>

    {/* Diagnosis Notes Modal */}
    {selectedDiagnosis && (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}
        onClick={() => setSelectedDiagnosis(null)}
      >
        <div
          style={{
            background: 'white',
            borderRadius: '12px',
            padding: '24px',
            maxWidth: '600px',
            width: '100%',
            maxHeight: '80vh',
            overflow: 'auto',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '20px' }}>
            <div>
              <h3 style={{ fontSize: '20px', fontWeight: 600, color: '#1a237e', marginBottom: '8px' }}>
                {selectedDiagnosis.diagnosis_name}
              </h3>
              {selectedDiagnosis.diagnosis_code && (
                <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>
                  Code: {selectedDiagnosis.diagnosis_code}
                </p>
              )}
            </div>
            <button
              onClick={() => setSelectedDiagnosis(null)}
              style={{
                background: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                padding: '8px 16px',
                fontSize: '14px',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.background = '#dc2626'}
              onMouseLeave={(e) => e.target.style.background = '#ef4444'}
            >
              Close
            </button>
          </div>

          <div style={{
            background: '#f8fafc',
            padding: '16px',
            borderRadius: '8px',
            border: '1px solid #e2e8f0'
          }}>
            <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#475569', marginBottom: '12px' }}>
              Clinical Notes
            </h4>
            <p style={{
              fontSize: '14px',
              lineHeight: '1.6',
              color: '#1e293b',
              margin: 0,
              whiteSpace: 'pre-wrap'
            }}>
              {selectedDiagnosis.diagnosis_notes || 'No notes available'}
            </p>
          </div>

          {selectedDiagnosis.createdAt && (
            <p style={{
              fontSize: '12px',
              color: '#94a3b8',
              marginTop: '16px',
              marginBottom: 0,
              textAlign: 'right'
            }}>
              Recorded on: {new Date(selectedDiagnosis.createdAt).toLocaleString()}
            </p>
          )}
        </div>
      </div>
    )}
  </>
  );
};

export default DiagnosisSummary;
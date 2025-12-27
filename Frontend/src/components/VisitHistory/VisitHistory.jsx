import React, { useState } from 'react';
import styles from './VisitHistory.module.css';

const VisitHistory = ({ patientId }) => {
  const [expandedVisits, setExpandedVisits] = useState([]);
  const [loading, setLoading] = useState(false);

  // Mock data - in real app, this would come from API
  const visitHistory = [
    {
      id: 'V2024011501',
      date: '2024-01-15',
      doctor: 'Dr. John Smith',
      specialization: 'Cardiologist',
      diagnosis: 'Upper Respiratory Infection',
      status: 'completed',
      prescription: [
        { name: 'Azithromycin', dosage: '500mg', frequency: 'Once daily', duration: '5 days' },
        { name: 'Paracetamol', dosage: '500mg', frequency: 'As needed', duration: '3 days' }
      ],
      notes: 'Patient presented with fever and dry cough. Rest advised.',
      injectionRequired: false
    },
    {
      id: 'V2023121001',
      date: '2023-12-10',
      doctor: 'Dr. Sarah Johnson',
      specialization: 'General Physician',
      diagnosis: 'Seasonal Allergy',
      status: 'completed',
      prescription: [
        { name: 'Cetirizine', dosage: '10mg', frequency: 'Once daily', duration: '7 days' }
      ],
      notes: 'Allergic rhinitis symptoms. Avoid pollen exposure.',
      injectionRequired: false
    },
    {
      id: 'V2023110501',
      date: '2023-11-05',
      doctor: 'Dr. Michael Brown',
      specialization: 'Dermatologist',
      diagnosis: 'Contact Dermatitis',
      status: 'completed',
      prescription: [
        { name: 'Hydrocortisone Cream', dosage: '1%', frequency: 'Twice daily', duration: '10 days' }
      ],
      notes: 'Skin irritation due to allergic reaction. Avoid suspected allergens.',
      injectionRequired: false
    }
  ];

  const toggleVisitExpansion = (visitId) => {
    setExpandedVisits(prev => 
      prev.includes(visitId) 
        ? prev.filter(id => id !== visitId)
        : [...prev, visitId]
    );
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'completed':
        return { text: 'Completed', className: styles.completed };
      case 'in_progress':
        return { text: 'In Progress', className: styles.inProgress };
      case 'cancelled':
        return { text: 'Cancelled', className: styles.cancelled };
      default:
        return { text: 'Unknown', className: styles.default };
    }
  };

  if (loading) {
    return (
      <div className={styles.card}>
        <h3 className={styles.cardTitle}>Visit History</h3>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Loading visit history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h3 className={styles.cardTitle}>Visit History</h3>
        <span className={styles.visitCount}>{visitHistory.length} visits</span>
      </div>

      <div className={styles.historyTable}>
        {visitHistory.length === 0 ? (
          <div className={styles.noVisits}>
            <div className={styles.noVisitsIcon}>📋</div>
            <p className={styles.noVisitsText}>No visit history available</p>
          </div>
        ) : (
          visitHistory.map((visit) => {
            const statusBadge = getStatusBadge(visit.status);
            const isExpanded = expandedVisits.includes(visit.id);
            
            return (
              <div key={visit.id} className={styles.visitItem}>
                <div 
                  className={styles.visitHeader}
                  onClick={() => toggleVisitExpansion(visit.id)}
                >
                  <div className={styles.visitInfo}>
                    <div className={styles.visitIdDate}>
                      <span className={styles.visitId}>#{visit.id}</span>
                      <span className={styles.visitDate}>
                        {new Date(visit.date).toLocaleDateString('en-US', {
                          weekday: 'short',
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                    <div className={styles.doctorInfo}>
                      <span className={styles.doctorName}>{visit.doctor}</span>
                      <span className={styles.specialization}>{visit.specialization}</span>
                    </div>
                    <div className={styles.diagnosis}>
                      {visit.diagnosis}
                    </div>
                  </div>
                  <div className={styles.visitActions}>
                    <span className={`${styles.statusBadge} ${statusBadge.className}`}>
                      {statusBadge.text}
                    </span>
                    <span className={`${styles.expandIcon} ${isExpanded ? styles.expanded : ''}`}>
                      ▼
                    </span>
                  </div>
                </div>

                {isExpanded && (
                  <div className={styles.expandedDetails}>
                    {/* Prescription Details */}
                    {visit.prescription && visit.prescription.length > 0 && (
                      <div className={styles.detailSection}>
                        <h5 className={styles.detailTitle}>Prescription</h5>
                        <div className={styles.prescriptionList}>
                          {visit.prescription.map((med, index) => (
                            <div key={index} className={styles.medicineItem}>
                              <div className={styles.medicineHeader}>
                                <span className={styles.medicineName}>{med.name}</span>
                                <span className={styles.medicineDosage}>{med.dosage}</span>
                              </div>
                              <div className={styles.medicineDetails}>
                                <span className={styles.detailItem}>
                                  <span className={styles.detailLabel}>Frequency:</span>
                                  <span className={styles.detailValue}>{med.frequency}</span>
                                </span>
                                <span className={styles.detailItem}>
                                  <span className={styles.detailLabel}>Duration:</span>
                                  <span className={styles.detailValue}>{med.duration}</span>
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                        {visit.injectionRequired && (
                          <div className={styles.injectionNote}>
                            <span className={styles.injectionIcon}>💉</span>
                            <span className={styles.injectionText}>Injection/IV required</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Consultation Notes */}
                    {visit.notes && (
                      <div className={styles.detailSection}>
                        <h5 className={styles.detailTitle}>Consultation Notes</h5>
                        <div className={styles.notesContent}>
                          {visit.notes}
                        </div>
                      </div>
                    )}

                    {/* Additional Actions */}
                    <div className={styles.detailActions}>
                      <button className={styles.downloadBtn}>
                        Download Summary
                      </button>
                      <button className={styles.repeatBtn}>
                        Repeat Prescription
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default VisitHistory;
import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './SpecialistReferral.module.css';

const SpecialistReferral = ({ referral }) => {
  const navigate = useNavigate();

  if (!referral) {
    return null;
  }

  const handleBookAppointment = () => {
    navigate('/patient/specialist-appointment', { 
      state: { referral }
    });
  };

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h3 className={styles.cardTitle}>Specialist Consultation</h3>
        <span className={styles.referralBadge}>Referred</span>
      </div>

      <div className={styles.referralContent}>
        <div className={styles.referralHeader}>
          <div className={styles.doctorInfo}>
            <div className={styles.doctorAvatar}>
              <span className={styles.doctorInitial}>
                {referral.specialistName?.charAt(0) || 'S'}
              </span>
            </div>
            <div className={styles.doctorDetails}>
              <h4 className={styles.specialistName}>{referral.specialistName}</h4>
              <p className={styles.specialization}>{referral.specialization}</p>
            </div>
          </div>
          <div className={styles.referralDate}>
            <span className={styles.dateLabel}>Referred on:</span>
            <span className={styles.dateValue}>
              {new Date(referral.referralDate).toLocaleDateString()}
            </span>
          </div>
        </div>

        <div className={styles.referralDetails}>
          <div className={styles.detailSection}>
            <h5 className={styles.sectionTitle}>Reason for Referral</h5>
            <p className={styles.reasonText}>{referral.reason}</p>
          </div>

          {referral.notes && (
            <div className={styles.detailSection}>
              <h5 className={styles.sectionTitle}>Referral Notes</h5>
              <div className={styles.notesText}>{referral.notes}</div>
            </div>
          )}

          {referral.urgency && (
            <div className={styles.urgencySection}>
              <div className={styles.urgencyIcon}>⚠️</div>
              <div className={styles.urgencyInfo}>
                <span className={styles.urgencyLabel}>Urgency Level:</span>
                <span className={`${styles.urgencyLevel} ${styles[referral.urgency]}`}>
                  {referral.urgency}
                </span>
              </div>
            </div>
          )}

          {referral.requiredTests && (
            <div className={styles.testsSection}>
              <h5 className={styles.sectionTitle}>Required Tests Before Appointment</h5>
              <div className={styles.testsList}>
                {referral.requiredTests.map((test, index) => (
                  <div key={index} className={styles.testItem}>
                    <span className={styles.testBullet}>•</span>
                    <span className={styles.testName}>{test}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className={styles.actionSection}>
          <button 
            className={styles.bookButton}
            onClick={handleBookAppointment}
          >
            Book Specialist Appointment
          </button>
          <p className={styles.actionNote}>
            Appointment required within {referral.recommendedTimeline || '2 weeks'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default SpecialistReferral;
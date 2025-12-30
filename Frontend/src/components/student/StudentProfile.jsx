// src/components/student/StudentProfile.jsx - UPDATED DESIGN

import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSpinner, 
  faUser, 
  faEnvelope, 
  faPhone, 
  faVenusMars, 
  faTint, 
  faCalendar, 
  faIdCard,
  faExclamationTriangle,
  faRulerVertical,
  faWeight,
  faAllergies
} from '@fortawesome/free-solid-svg-icons';
import styles from './StudentProfile.module.css';

const StudentProfile = ({ profileData, loading, onRefresh }) => {
  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <FontAwesomeIcon icon={faSpinner} spin className={styles.spinner} />
        <p>Loading profile...</p>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className={styles.emptyState}>
        <p>No profile data available</p>
        <button onClick={onRefresh} className={styles.refreshButton}>
          Refresh
        </button>
      </div>
    );
  }

  const calculateAge = (dob) => {
    if (!dob) return 'N/A';
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <div className={styles.profileContainer}>
      {/* Profile Header */}
      <div className={styles.profileHeader}>
        <div className={styles.avatarSection}>
          <div className={styles.avatar}>
            <FontAwesomeIcon icon={faUser} className={styles.avatarIcon} />
          </div>
          <div className={styles.headerInfo}>
            <h2 className={styles.name}>{profileData.name || 'Student Name'}</h2>
            <p className={styles.email}>
              <FontAwesomeIcon icon={faEnvelope} /> {profileData.email || 'N/A'}
            </p>
          </div>
        </div>
      </div>

      <div className={styles.profileBody}>
        {/* Personal Information Section */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>
            <FontAwesomeIcon icon={faUser} /> Personal Information
          </h3>
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <div className={styles.infoLabel}>
                <FontAwesomeIcon icon={faIdCard} className={styles.infoIcon} />
                Roll Number
              </div>
              <div className={styles.infoValue}>{profileData.roll_no || 'N/A'}</div>
            </div>

            <div className={styles.infoItem}>
              <div className={styles.infoLabel}>
                <FontAwesomeIcon icon={faCalendar} className={styles.infoIcon} />
                Date of Birth
              </div>
              <div className={styles.infoValue}>
                {profileData.dob ? new Date(profileData.dob).toLocaleDateString() : 'N/A'}
              </div>
            </div>

            <div className={styles.infoItem}>
              <div className={styles.infoLabel}>
                <FontAwesomeIcon icon={faUser} className={styles.infoIcon} />
                Age
              </div>
              <div className={styles.infoValue}>{calculateAge(profileData.dob)} years</div>
            </div>

            <div className={styles.infoItem}>
              <div className={styles.infoLabel}>
                <FontAwesomeIcon icon={faVenusMars} className={styles.infoIcon} />
                Gender
              </div>
              <div className={styles.infoValue}>{profileData.gender || 'N/A'}</div>
            </div>

            <div className={styles.infoItem}>
              <div className={styles.infoLabel}>
                <FontAwesomeIcon icon={faTint} className={styles.infoIcon} />
                Blood Group
              </div>
              <div className={styles.infoValue}>
                <span className={styles.bloodBadge}>{profileData.blood_group || 'N/A'}</span>
              </div>
            </div>

            <div className={styles.infoItem}>
              <div className={styles.infoLabel}>
                <FontAwesomeIcon icon={faPhone} className={styles.infoIcon} />
                Phone
              </div>
              <div className={styles.infoValue}>{profileData.phone || 'N/A'}</div>
            </div>
          </div>
        </div>

        {/* Emergency Contact Section */}
        {profileData.emergency_contact && (
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>
              <FontAwesomeIcon icon={faExclamationTriangle} /> Emergency Contact
            </h3>
            <div className={styles.emergencyCard}>
              <FontAwesomeIcon icon={faPhone} className={styles.emergencyIcon} />
              <div>
                <p className={styles.emergencyLabel}>Emergency Contact Number</p>
                <p className={styles.emergencyValue}>{profileData.emergency_contact}</p>
              </div>
            </div>
          </div>
        )}

        {/* Health Information Section */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>
            <FontAwesomeIcon icon={faRulerVertical} /> Health Information
          </h3>
          <div className={styles.healthCard}>
            <div className={styles.healthItem}>
              <FontAwesomeIcon icon={faRulerVertical} className={styles.healthIcon} />
              <div className={styles.healthContent}>
                <span className={styles.healthLabel}>Height</span>
                <span className={styles.healthValue}>{profileData.height || 'Not recorded'}</span>
              </div>
            </div>
            <div className={styles.healthItem}>
              <FontAwesomeIcon icon={faWeight} className={styles.healthIcon} />
              <div className={styles.healthContent}>
                <span className={styles.healthLabel}>Weight</span>
                <span className={styles.healthValue}>{profileData.weight || 'Not recorded'}</span>
              </div>
            </div>
            <div className={styles.healthItem}>
              <FontAwesomeIcon icon={faAllergies} className={styles.healthIcon} />
              <div className={styles.healthContent}>
                <span className={styles.healthLabel}>Allergies</span>
                <span className={styles.healthValue}>{profileData.allergies || 'None recorded'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Section */}
        <div className={styles.actionSection}>
          <button onClick={onRefresh} className={styles.refreshButton}>
            Refresh Profile
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;
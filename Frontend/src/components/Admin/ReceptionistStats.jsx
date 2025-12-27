// src/components/Admin/ReceptionistStats.jsx
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUsers, 
  faUserCheck, 
  faUserClock, 
  faClock, 
  faChartLine, 
  faTachometerAlt 
} from '@fortawesome/free-solid-svg-icons';
import styles from './ReceptionistStats.module.css';

const ReceptionistStats = ({ stats = {} }) => {
  const {
    total = 0,
    active = 0,
    inactive = 0,
    onDuty = 0,
    processingTime = 0,
    avgPatientsPerDay = 0,
    efficiency = 0
  } = stats;

  const statsCards = [
    {
      title: 'Total Receptionists',
      value: total,
      color: '#20c997',
      icon: faUsers,
      description: 'Registered receptionists',
    },
    {
      title: 'Active Now',
      value: active,
      color: '#48bb78',
      icon: faUserCheck,
      description: 'Currently logged in',
    },
    {
      title: 'On Duty',
      value: onDuty,
      color: '#4299e1',
      icon: faUserClock,
      description: 'Currently on shift',
    },
    {
      title: 'Avg. Processing Time',
      value: `${processingTime} min`,
      color: '#9f7aea',
      icon: faClock,
      description: 'Per patient registration',
    },
    {
      title: 'Avg. Patients/Day',
      value: avgPatientsPerDay,
      color: '#ed8936',
      icon: faChartLine,
      description: 'Per receptionist',
    },
    {
      title: 'Efficiency',
      value: `${efficiency}%`,
      color: '#38b2ac',
      icon: faTachometerAlt,
      description: 'Overall performance',
    },
  ];

  return (
    <div className={styles.statsContainer}>
      <h3 className={styles.sectionTitle}>Receptionist Statistics</h3>
      
      <div className={styles.statsGrid}>
        {statsCards.map((stat, index) => (
          <div key={index} className={styles.statCard}>
            <div className={styles.statHeader}>
              <div 
                className={styles.statIcon}
                style={{ backgroundColor: `${stat.color}20`, color: stat.color }}
              >
                <FontAwesomeIcon icon={stat.icon} />
              </div>
              <div>
                <h4 className={styles.statTitle}>{stat.title}</h4>
                <p className={styles.statDescription}>{stat.description}</p>
              </div>
            </div>
            <div className={styles.statValue}>{stat.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReceptionistStats;
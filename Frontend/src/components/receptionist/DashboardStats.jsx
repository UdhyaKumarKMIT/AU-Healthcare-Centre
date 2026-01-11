import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsers, faUserMd, faClipboardList } from '@fortawesome/free-solid-svg-icons';
import styles from './DashboardStats.module.css';

const DashboardStats = ({ totalPatients, availableDoctors, todayVisits }) => {
  const stats = [
    {
      title: 'Total Patients',
      value: totalPatients,
      icon: faUsers,
      color: '#4299e1',
      bgColor: '#ebf8ff',
    },
    {
      title: 'Available Doctors',
      value: availableDoctors,
      icon: faUserMd,
      color: '#48bb78',
      bgColor: '#f0fff4',
    },
    {
      title: 'Total Visits (Today)',
      value: todayVisits,
      icon: faClipboardList,
      color: '#ed8936',
      bgColor: '#fffaf0',
    },
  ];

  return (
    <div className={styles.statsGrid}>
      {stats.map((stat, index) => (
        <div key={index} className={styles.statCard}>
          <div 
            className={styles.statIcon}
            style={{ backgroundColor: stat.bgColor, color: stat.color }}
          >
            <FontAwesomeIcon icon={stat.icon} className={styles.icon} />
          </div>
          <div className={styles.statContent}>
            <h3 className={styles.statValue}>{stat.value}</h3>
            <p className={styles.statTitle}>{stat.title}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DashboardStats;
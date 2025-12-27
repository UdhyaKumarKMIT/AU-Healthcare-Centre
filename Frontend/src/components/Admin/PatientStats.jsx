// src/components/Admin/PatientStats.jsx
import React from 'react';
import styles from './PatientStats.module.css';

const PatientStats = ({ stats = {} }) => {
  const {
    total = 0,
    newPatients = 0,
    returningPatients = 0,
    male = 0,
    female = 0,
    other = 0,
    ageGroups = {},
    monthlyGrowth = 0,
    avgVisits = 0
  } = stats;

  const statsCards = [
    {
      title: 'Total Patients',
      value: total,
      color: '#4299e1',
      description: 'Registered in system',
    },
    {
      title: 'New Patients',
      value: newPatients,
      color: '#48bb78',
      description: 'Registered this month',
    },
    {
      title: 'Returning Patients',
      value: returningPatients,
      color: '#ed8936',
      description: 'Visited more than once',
    },
    {
      title: 'Gender Ratio',
      value: `${Math.round((male / total) * 100) || 0}% Male`,
      color: '#9f7aea',
      description: `${female} Female, ${other} Other`,
    },
    {
      title: 'Avg. Visits',
      value: avgVisits.toFixed(1),
      color: '#f56565',
      description: 'Per patient',
    },
    {
      title: 'Monthly Growth',
      value: `${monthlyGrowth > 0 ? '+' : ''}${monthlyGrowth}%`,
      color: '#38b2ac',
      description: 'Patient growth rate',
    },
  ];

  return (
    <div className={styles.statsContainer}>
      <div className={styles.statsGrid}>
        {statsCards.map((stat, index) => (
          <div key={index} className={styles.statCard}>
            <div className={styles.statHeader}>
              <div 
                className={styles.statIcon}
                style={{ backgroundColor: stat.color }}
              >
                {stat.icon}
              </div>
              <div>
                <h3 className={styles.statTitle}>{stat.title}</h3>
                <p className={styles.statDescription}>{stat.description}</p>
              </div>
            </div>
            <div className={styles.statValue}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Age Distribution Chart */}
      <div className={styles.ageDistribution}>
        <h4>Age Distribution</h4>
        <div className={styles.ageBars}>
          {Object.entries(ageGroups || {}).map(([ageGroup, count]) => (
            <div key={ageGroup} className={styles.ageBar}>
              <div className={styles.ageLabel}>{ageGroup}</div>
              <div className={styles.barContainer}>
                <div 
                  className={styles.barFill}
                  style={{
                    width: `${(count / total) * 100}%`,
                    backgroundColor: '#4299e1'
                  }}
                >
                  <span className={styles.barCount}>{count}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PatientStats;
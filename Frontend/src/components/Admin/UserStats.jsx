// src/components/Admin/UserStats.jsx
import React from 'react';
import styles from './UserStats.module.css';

const UserStats = ({ stats = {} }) => {
  const { 
    active = 0, 
    inactive = 0, 
    pending = 0, 
    suspended = 0,
    byRole = {}
  } = stats;

  const total = active + inactive + pending + suspended;

  const statCards = [
    {
      title: 'Total Users',
      value: total,
      icon: '👥',
      color: '#4299e1',
      description: 'All registered users',
    },
    {
      title: 'Active Users',
      value: active,
      icon: '✅',
      color: '#48bb78',
      description: 'Currently active',
    },
    {
      title: 'Inactive Users',
      value: inactive,
      icon: '⏸️',
      color: '#ed8936',
      description: 'Not logged in recently',
    },
    {
      title: 'Pending',
      value: pending,
      icon: '⏳',
      color: '#9f7aea',
      description: 'Awaiting approval',
    },
    {
      title: 'Suspended',
      value: suspended,
      icon: '🚫',
      color: '#f56565',
      description: 'Temporarily blocked',
    },
  ];

  return (
    <div className={styles.statsContainer}>
      <h3 className={styles.sectionTitle}>User Statistics</h3>
      
      <div className={styles.statsGrid}>
        {statCards.map((stat, index) => (
          <div key={index} className={styles.statCard}>
            <div className={styles.statHeader}>
              <div 
                className={styles.statIcon}
                style={{ backgroundColor: stat.color }}
              >
                {stat.icon}
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

      {/* Role Distribution */}
      {Object.keys(byRole).length > 0 && (
        <div className={styles.roleDistribution}>
          <h4>Users by Role</h4>
          <div className={styles.roleList}>
            {Object.entries(byRole).map(([role, count]) => (
              <div key={role} className={styles.roleItem}>
                <span className={styles.roleName}>{role}</span>
                <div className={styles.roleBar}>
                  <div 
                    className={styles.roleBarFill}
                    style={{ width: `${(count / total) * 100}%` }}
                  />
                </div>
                <span className={styles.roleCount}>{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserStats;
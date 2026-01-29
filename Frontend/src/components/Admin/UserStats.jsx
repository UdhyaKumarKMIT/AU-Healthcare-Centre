// src/components/Admin/UserStats.jsx
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsers, faCheckCircle, faPauseCircle } from '@fortawesome/free-solid-svg-icons';
import styles from './UserStats.module.css';

const UserStats = ({ stats = {} }) => {
  const { 
    active = 0, 
    inactive = 0,
    byRole = {}
  } = stats;

  const total = active + inactive;

  const statCards = [
    {
      title: 'Total Users',
      value: total,
      icon: faUsers,
      color: '#4299e1',
      description: 'All registered users',
    },
    {
      title: 'Active Users',
      value: active,
      icon: faCheckCircle,
      color: '#48bb78',
      description: 'Currently active',
    },
    {
      title: 'Inactive Users',
      value: inactive,
      icon: faPauseCircle,
      color: '#ed8936',
      description: 'Currently inactive',
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

      {/* Role Distribution */}
      {Object.keys(byRole).length > 0 && (
        <div className={styles.roleDistribution}>
          <h4>Users by Role</h4>
          <div className={styles.roleList}>
            {Object.entries(byRole).map(([role, count]) => (
              <div key={role} className={styles.roleItem}>
                <span className={styles.roleName}>
                  {role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </span>
                <div className={styles.roleBar}>
                  <div 
                    className={styles.roleBarFill}
                    style={{ width: `${total > 0 ? (count / total) * 100 : 0}%` }}
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
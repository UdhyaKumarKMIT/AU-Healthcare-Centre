// src/components/Admin/DashboardCard.jsx
import React from 'react';
import styles from './DashboardCard.module.css';

const DashboardCard = ({ title, value, icon, color, change, trend }) => {
  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div 
          className={styles.iconWrapper}
          style={{ backgroundColor: `${color}15`, color }}
        >
          <span className={styles.icon}>{icon}</span>
        </div>
        <div className={styles.changeIndicator}>
          <span className={`${styles.change} ${trend === 'up' ? styles.up : styles.down}`}>
            {trend === 'up' ? '↗' : '↘'} {change}
          </span>
        </div>
      </div>
      
      <div className={styles.cardContent}>
        <h3 className={styles.value}>{value.toLocaleString()}</h3>
        <p className={styles.title}>{title}</p>
      </div>
      
      <div className={styles.cardFooter}>
        <div className={styles.progressBar}>
          <div 
            className={styles.progressFill}
            style={{ 
              width: trend === 'up' ? '75%' : '30%',
              backgroundColor: color 
            }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default DashboardCard;
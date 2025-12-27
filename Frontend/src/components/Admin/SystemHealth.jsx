// src/components/Admin/SystemHealth.jsx
import React from 'react';
import styles from './SystemHealth.module.css';

const SystemHealth = () => {
  const systemMetrics = [
    { label: 'Server Uptime', value: '99.9%', status: 'healthy' },
    { label: 'Database Health', value: 'Optimal', status: 'healthy' },
    { label: 'API Response', value: '125ms', status: 'healthy' },
    { label: 'Active Users', value: '42', status: 'normal' },
    { label: 'Storage Usage', value: '78%', status: 'warning' },
    { label: 'Backup Status', value: 'Last 24h', status: 'healthy' },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy': return '#059669';
      case 'warning': return '#d97706';
      case 'critical': return '#dc2626';
      default: return '#4299e1';
    }
  };

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>System Health</h3>
      
      <div className={styles.metricsGrid}>
        {systemMetrics.map((metric, index) => (
          <div key={index} className={styles.metricItem}>
            <div className={styles.metricLabel}>{metric.label}</div>
            <div className={styles.metricValue}>{metric.value}</div>
            <div 
              className={styles.statusIndicator}
              style={{ backgroundColor: getStatusColor(metric.status) }}
            ></div>
          </div>
        ))}
      </div>
      
      <div className={styles.healthStatus}>
        <div className={styles.statusHeader}>
          <span className={styles.statusLabel}>Overall Status:</span>
          <span className={styles.statusValue}>Healthy</span>
        </div>
        <div className={styles.statusBar}>
          <div 
            className={styles.statusFill}
            style={{ width: '92%', backgroundColor: '#059669' }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default SystemHealth;
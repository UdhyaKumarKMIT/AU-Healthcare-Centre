// src/components/Admin/Sidebar.jsx
import React from 'react';
import styles from './Sidebar.module.css';

const Sidebar = ({ activeModule, onModuleClick }) => {
  const modules = [
    { id: 'dashboard', name: 'Dashboard' },
    { id: 'doctors', name: 'Doctors'},
    { id: 'nurses', name: 'Nurses'},
    { id: 'pharmacists', name: 'Pharmacists' },
    { id: 'medicines', name: 'Medicines' },
    { id: 'suppliers', name: 'Suppliers' },
    { id: 'visits', name: 'Visits'},
    { id: 'logs', name: 'Logs / Audit' },
    { id: 'settings', name: 'Settings' },
  ];

  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarHeader}>
        <h3>MIT Health Centre</h3>
        <p>Admin Panel</p>
      </div>
      
      <nav className={styles.nav}>
        <ul className={styles.navList}>
          {modules.map(module => (
            <li key={module.id}>
              <button
                className={`${styles.navItem} ${activeModule === module.id ? styles.active : ''}`}
                onClick={() => onModuleClick(module.id)}
              >
                <span className={styles.navIcon}>{module.icon}</span>
                <span className={styles.navText}>{module.name}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className={styles.systemStatus}>
        <div className={styles.statusIndicator}></div>
        <span>System Active</span>
      </div>
    </aside>
  );
};

export default Sidebar;
// src/components/Admin/AdminSidebar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faChartLine, 
  faUserMd, 
  faUserNurse, 
  faUserTie, 
  faPrescriptionBottle, 
  faPills, 
  faTruck, 
  faHospital, 
  faClipboardList, 
  faCog 
} from '@fortawesome/free-solid-svg-icons';
import styles from './AdminSidebar.module.css';

const AdminSidebar = () => {
  const menuItems = [
    { id: 'dashboard', name: 'Dashboard', path: '/admin/dashboard', icon: faChartLine },
    { id: 'doctors', name: 'Doctors', path: '/admin/doctors', icon: faUserMd },
    { id: 'nurses', name: 'Nurses', path: '/admin/nurses', icon: faUserNurse },
    { id: 'receptionists', name: 'Receptionists', path: '/admin/receptionists', icon: faUserTie },
    { id: 'pharmacists', name: 'Pharmacists', path: '/admin/pharmacists', icon: faPrescriptionBottle },
    { id: 'medicines', name: 'Medicines', path: '/admin/medicines', icon: faPills },
    { id: 'suppliers', name: 'Suppliers', path: '/admin/suppliers', icon: faTruck },
    { id: 'visits', name: 'Visits', path: '/admin/visits', icon: faHospital },
    { id: 'logs', name: 'Logs / Audit', path: '/admin/logs', icon: faClipboardList },
    { id: 'settings', name: 'Settings', path: '/admin/settings', icon: faCog },
  ];

  return (
    <aside className={styles.sidebar}>
      
      <nav className={styles.nav}>
        <ul className={styles.navList}>
          {menuItems.map((item) => (
            <li key={item.id}>
              <NavLink
                to={item.path}
                className={({ isActive }) => 
                  `${styles.navLink} ${isActive ? styles.active : ''}`
                }
              >
                <span className={styles.navIcon}>
                  <FontAwesomeIcon icon={item.icon} />
                </span>
                <span className={styles.navText}>{item.name}</span>
              </NavLink>
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

export default AdminSidebar;
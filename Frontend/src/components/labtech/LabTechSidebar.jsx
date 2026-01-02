import React from 'react';
import { NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTachometerAlt,
  faMicroscope,
  faClipboardList
} from '@fortawesome/free-solid-svg-icons';
import styles from './LabTechSidebar.module.css';

const LabTechSidebar = () => {
  const menuItems = [
    {
      title: 'Dashboard',
      icon: faTachometerAlt,
      path: '/labtech/dashboard'
    },
    {
      title: 'Lab Tests',
      icon: faMicroscope,
      path: '/labtech/tests'
    },
    {
      title: 'Test Reports',
      icon: faClipboardList,
      path: '/labtech/reports'
    }
  ];

  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarHeader}>
        <h2>Lab Technician</h2>
      </div>

      <nav className={styles.sidebarNav}>
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `${styles.navItem} ${isActive ? styles.active : ''}`
            }
          >
            <FontAwesomeIcon icon={item.icon} />
            <span>{item.title}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default LabTechSidebar;

// src/components/Admin/AdminLayout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import Header from '../Header/Header';
import styles from './AdminLayout.module.css';

const AdminLayout = () => {
  return (
    <div className={styles.adminLayout}>
      <Header 
        title="MIT Health Centre"
        subtitle="Administrator"
        showLogout={true}
      />
      
      <div className={styles.layoutContainer}>
        <AdminSidebar />
        
        <main className={styles.mainContent}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
// src/pages/admin/AdminDashboard.jsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchAdminStats, fetchPatientOverview } from '../../store/slices/adminSlice';
import AdminSidebar from '../../components/Admin/AdminSidebar';
import Header from '../../components/Header/Header';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsers, faUserMd, faCalendarCheck, faClock, faUserTie, faPills } from '@fortawesome/free-solid-svg-icons';
import styles from './AdminDashboard.module.css';

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { stats: adminStats, patientOverview, loading: adminLoading, error } = useSelector((state) => state.admin || {});
  
  const [activeModule, setActiveModule] = useState('dashboard');
  const [selectedTimeRange, setSelectedTimeRange] = useState('today');

  useEffect(() => {
    if (activeModule === 'dashboard') {
      dispatch(fetchAdminStats());
      dispatch(fetchPatientOverview());
    }
  }, [dispatch, activeModule]);

  const visitStats = {
    todayVisits: adminStats?.todayVisits || 0,
    pendingAppointments: adminStats?.pendingAppointments || 0,
    todayRevenue: adminStats?.todayRevenue || 0,
  };

  const totalStaff = (
    (adminStats?.totalDoctors || 0) +
    (adminStats?.totalNurses || 0) +
    (adminStats?.totalPharmacists || 0) +
    (adminStats?.totalReceptionists || 0) +
    (adminStats?.totalAdministrators || 0)
  );

  const dashboardCards = [
    {
      title: 'Total Patients',
      value: adminStats?.totalPatients || 0,
      route: '/admin/patients',
      icon: faUsers,
      color: '#3b82f6'
    },
    {
      title: 'Active Doctors',
      value: adminStats?.totalDoctors || 0,
      route: '/admin/doctors',
      icon: faUserMd,
      color: '#10b981'
    },
    {
      title: 'Today\'s Visits',
      value: visitStats.todayVisits,
      route: '/admin/visits',
      icon: faCalendarCheck,
      color: '#8b5cf6'
    },
    {
      title: 'Pending Appointments',
      value: visitStats.pendingAppointments,
      route: '/admin/visits',
      icon: faClock,
      color: '#f59e0b'
    },
    {
      title: 'Total Staff',
      value: totalStaff,
      route: '/admin/users',
      icon: faUserTie,
      color: '#06b6d4'
    },
    {
      title: 'Medicine Stock',
      value: adminStats?.medicineStock || 0,
      route: '/admin/medicines',
      icon: faPills,
      color: '#ec4899',
      unit: '%'
    }
  ];

  const handleCardClick = (route) => {
    // Check if route is implemented
    const implementedRoutes = ['/admin/dashboard'];
    
    if (implementedRoutes.includes(route)) {
      navigate(route);
    } else {
      alert('This feature is not available yet. Coming soon!');
    }
  };

  const handleTimeRangeChange = (range) => {
    setSelectedTimeRange(range);
  };

  const isLoading = adminLoading;

  const renderMainContent = () => {
    if (activeModule !== 'dashboard') {
      return <div className={styles.modulePlaceholder}>Module content for {activeModule} will appear here</div>;
    }

    if (isLoading) {
      return (
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Loading dashboard...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className={styles.errorContainer}>
          <p>Error loading dashboard: {error}</p>
          <button onClick={() => {
            dispatch(fetchAdminStats());
            dispatch(fetchPatientOverview());
          }}>
            Retry
          </button>
        </div>
      );
    }

    return (
      <>
        {/* Dashboard Header */}
        <div className={styles.dashboardHeader}>
          <div className={styles.headerLeft}>
            <h1>Admin Dashboard</h1>
            <p>Welcome to MIT Health Centre Administration Panel</p>
          </div>
          <div className={styles.headerRight}>
            <div className={styles.timeRangeSelector}>
              <button 
                className={`${styles.timeRangeBtn} ${selectedTimeRange === 'today' ? styles.active : ''}`}
                onClick={() => handleTimeRangeChange('today')}
              >
                Today
              </button>
              <button 
                className={`${styles.timeRangeBtn} ${selectedTimeRange === 'week' ? styles.active : ''}`}
                onClick={() => handleTimeRangeChange('week')}
              >
                This Week
              </button>
              <button 
                className={`${styles.timeRangeBtn} ${selectedTimeRange === 'month' ? styles.active : ''}`}
                onClick={() => handleTimeRangeChange('month')}
              >
                This Month
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards Grid */}
        <div className={styles.statsGrid}>
          {dashboardCards.map((card, index) => (
            <div 
              key={index}
              className={styles.dashboardCard}
              onClick={() => handleCardClick(card.route)}
            >
              <div className={styles.cardIcon} style={{ backgroundColor: `${card.color}20`, color: card.color }}>
                <FontAwesomeIcon icon={card.icon} />
              </div>
              <div className={styles.cardContent}>
                <h3 className={styles.cardTitle}>{card.title}</h3>
                <div className={styles.cardValue}>
                  {card.value}{card.unit || ''}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts and Additional Stats */}
        <div className={styles.chartsContainer}>
          <div className={styles.chartSection}>
            <div className={styles.sectionHeader}>
              <h3>Monthly Overview</h3>
              <span 
                className={styles.viewAll}
                onClick={() => alert('Detailed analytics not available yet. Coming soon!')}
              >
                View Details →
              </span>
            </div>
            <div className={styles.chartPlaceholder}>
              <div className={styles.chartStats}>
                <div className={styles.chartStatItem}>
                  <span className={styles.statLabel}>Total Visits</span>
                  <span className={styles.statValue}>
                    {patientOverview?.visitTrends?.reduce((sum, t) => sum + t.visits, 0) || 0}
                  </span>
                </div>
                <div className={styles.chartStatItem}>
                  <span className={styles.statLabel}>New Patients</span>
                  <span className={styles.statValue}>{adminStats?.newPatientsToday || 0}</span>
                </div>
              </div>
              <div className={styles.chartVisual}>
                {(() => {
                  // Always show last 6 months
                  const months = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                  const visitData = patientOverview?.visitTrends || [];
                  
                  // Create data for last 6 months, use real data if available, otherwise 0
                  const chartData = months.map(month => {
                    const trend = visitData.find(t => t.month === month);
                    return {
                      month: month,
                      visits: trend ? trend.visits : 0
                    };
                  });
                  
                  // Find max visits for scaling
                  const maxVisits = Math.max(...chartData.map(d => d.visits));
                  const scaleMax = maxVisits > 0 ? maxVisits : 100;
                  
                  return chartData.map((data, idx) => {
                    // Calculate height as percentage of max
                    const heightPercent = data.visits > 0 
                      ? (data.visits / scaleMax) * 100 
                      : 0;
                    
                    return (
                      <div key={idx} className={styles.chartBarContainer}>
                        <span className={styles.chartLabel}>{data.month}</span>
                        <div 
                          className={styles.chartBar} 
                          style={{ height: `${heightPercent}%` }}
                          title={`${data.month}: ${data.visits} visits`}
                        />
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          </div>

          <div className={styles.chartSection}>
            <div className={styles.sectionHeader}>
              <h3>Staff Distribution</h3>
            </div>
            <div className={styles.staffDistribution}>
              {adminStats?.totalDoctors > 0 && (
                <div className={styles.staffItem}>
                  <div className={styles.staffInfo}>
                    <span className={styles.staffRole}>Doctors</span>
                    <span className={styles.staffCount}>{adminStats.totalDoctors}</span>
                  </div>
                  <div className={styles.staffBar} style={{ 
                    backgroundColor: '#48bb78', 
                    width: `${(adminStats.totalDoctors / totalStaff) * 100}%` 
                  }}></div>
                </div>
              )}
              {adminStats?.totalNurses > 0 && (
                <div className={styles.staffItem}>
                  <div className={styles.staffInfo}>
                    <span className={styles.staffRole}>Nurses</span>
                    <span className={styles.staffCount}>{adminStats.totalNurses}</span>
                  </div>
                  <div className={styles.staffBar} style={{ 
                    backgroundColor: '#4299e1', 
                    width: `${(adminStats.totalNurses / totalStaff) * 100}%` 
                  }}></div>
                </div>
              )}
              {adminStats?.totalPharmacists > 0 && (
                <div className={styles.staffItem}>
                  <div className={styles.staffInfo}>
                    <span className={styles.staffRole}>Pharmacists</span>
                    <span className={styles.staffCount}>{adminStats.totalPharmacists}</span>
                  </div>
                  <div className={styles.staffBar} style={{ 
                    backgroundColor: '#9f7aea', 
                    width: `${(adminStats.totalPharmacists / totalStaff) * 100}%` 
                  }}></div>
                </div>
              )}
              {adminStats?.totalReceptionists > 0 && (
                <div className={styles.staffItem}>
                  <div className={styles.staffInfo}>
                    <span className={styles.staffRole}>Receptionists</span>
                    <span className={styles.staffCount}>{adminStats.totalReceptionists}</span>
                  </div>
                  <div className={styles.staffBar} style={{ 
                    backgroundColor: '#ed8936', 
                    width: `${(adminStats.totalReceptionists / totalStaff) * 100}%` 
                  }}></div>
                </div>
              )}
              {adminStats?.totalAdministrators > 0 && (
                <div className={styles.staffItem}>
                  <div className={styles.staffInfo}>
                    <span className={styles.staffRole}>Administrators</span>
                    <span className={styles.staffCount}>{adminStats.totalAdministrators}</span>
                  </div>
                  <div className={styles.staffBar} style={{ 
                    backgroundColor: '#f56565', 
                    width: `${(adminStats.totalAdministrators / totalStaff) * 100}%` 
                  }}></div>
                </div>
              )}
              {totalStaff === 0 && (
                <div className={styles.noData}>No staff data available</div>
              )}
            </div>
          </div>
        </div>
      </>
    );
  };

  return (
    <div className={styles.adminDashboard}>
      <Header 
        title="MIT Health Centre"
        subtitle="Admin Dashboard"
        showLogout={true}
        userRole="Administrator"
      />

      <div className={styles.mainContainer}>
        <AdminSidebar />

        <main className={styles.mainContent}>
          {renderMainContent()}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
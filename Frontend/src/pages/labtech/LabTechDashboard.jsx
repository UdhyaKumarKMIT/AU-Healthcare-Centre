// src/pages/labtech/LabTechDashboard.jsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faFlask, 
  faMicroscope, 
  faVial, 
  faClock,
  faCheckCircle,
  faHourglassHalf 
} from '@fortawesome/free-solid-svg-icons';
import { fetchLabTechStats, fetchPendingTests } from '../../store/slices/labTechSlice';
import LabTechSidebar from '../../components/LabTech/LabTechSidebar';
import Header from '../../components/Header/Header';
import styles from './LabTechDashboard.module.css';
import statStyles from '../../components/Admin/ReceptionistStats.module.css';

const LabTechDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { 
    stats, 
    pendingTests, 
    loading, 
    error 
  } = useSelector((state) => state.labTech || {});
  
  const [selectedTimeRange, setSelectedTimeRange] = useState('today');

  useEffect(() => {
    dispatch(fetchLabTechStats());
    dispatch(fetchPendingTests());
  }, [dispatch]);

  const dashboardCards = [
    {
      title: 'Pending Tests',
      value: stats?.pendingTests || 0,
      icon: faHourglassHalf,
      color: '#ed8936',
      route: '/labtech/tests?status=pending'
    },
    {
      title: 'Completed Today',
      value: stats?.completedToday || 0,
      icon: faCheckCircle,
      color: '#38a169',
      route: '/labtech/tests?status=completed'
    },
    {
      title: 'In Progress',
      value: stats?.inProgress || 0,
      icon: faFlask,
      color: '#3182ce',
      route: '/labtech/tests?status=in-progress'
    },
    {
      title: 'Total Tests',
      value: stats?.totalTests || 0,
      icon: faMicroscope,
      color: '#805ad5',
      route: '/labtech/tests'
    },
    {
      title: 'Urgent Tests',
      value: stats?.urgentTests || 0,
      icon: faClock,
      color: '#e53e3e',
      route: '/labtech/tests?priority=urgent'
    },
    {
      title: 'Samples Collected',
      value: stats?.samplesCollected || 0,
      icon: faVial,
      color: '#38b2ac',
      route: '/labtech/samples'
    }
  ];

  const handleTimeRangeChange = (range) => {
    setSelectedTimeRange(range);
    // Fetch data based on time range
    dispatch(fetchLabTechStats({ timeRange: range }));
  };

  if (loading) {
    return (
      <div className={styles.labTechDashboard}>
        <Header 
          title="MIT Health Centre"
          subtitle="Lab Technician Dashboard"
          showLogout={true}
          userRole="Lab Technician"
        />
        <div className={styles.mainContainer}>
          <LabTechSidebar />
          <main className={styles.mainContent}>
            <div className={styles.loadingContainer}>
              <div className={styles.spinner}></div>
              <p>Loading dashboard...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.labTechDashboard}>
        <Header 
          title="MIT Health Centre"
          subtitle="Lab Technician Dashboard"
          showLogout={true}
          userRole="Lab Technician"
        />
        <div className={styles.mainContainer}>
          <LabTechSidebar />
          <main className={styles.mainContent}>
            <div className={styles.errorContainer}>
              <p>Error loading dashboard: {error}</p>
              <button onClick={() => {
                dispatch(fetchLabTechStats());
                dispatch(fetchPendingTests());
              }}>
                Retry
              </button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.labTechDashboard}>
      <Header 
        title="MIT Health Centre"
        subtitle="Lab Technician Dashboard"
        showLogout={true}
        userRole="Lab Technician"
      />

      <div className={styles.mainContainer}>
        <LabTechSidebar />

        <main className={styles.mainContent}>
          {/* Dashboard Header */}
          <div className={styles.dashboardHeader}>
            <div className={styles.headerLeft}>
              <h1>Lab Technician Dashboard</h1>
              <p>Welcome to the Laboratory Management System</p>
            </div>
          </div>

          {/* Stats Cards Grid */}
          <div className={statStyles.statsContainer}>
            <h3 className={statStyles.sectionTitle}>Laboratory Overview</h3>

            <div className={statStyles.statsGrid}>
              {dashboardCards.map((card, index) => (
                <div 
                  key={index} 
                  className={statStyles.statCard}
                  onClick={() => navigate(card.route)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className={statStyles.statHeader}>
                    <div 
                      className={statStyles.statIcon}
                      style={{ color: card.color }}
                    >
                      <FontAwesomeIcon icon={card.icon} />
                    </div>
                    <h4 className={statStyles.statTitle}>{card.title}</h4>
                  </div>
                  <div 
                    className={statStyles.statValue}
                    style={{ color: card.color }}
                  >
                    {card.value}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pending Tests Section */}
          <div className={styles.pendingTestsSection}>
            <div className={styles.sectionHeader}>
              <h3>Pending Lab Tests</h3>
              <span 
                className={styles.viewAll}
                onClick={() => navigate('/labtech/tests?status=pending')}
              >
                View All →
              </span>
            </div>
            
            <div className={styles.testsList}>
              {pendingTests && pendingTests.length > 0 ? (
                pendingTests.slice(0, 5).map((test, index) => (
                  <div key={index} className={styles.testCard}>
                    <div className={styles.testInfo}>
                      <div className={styles.testHeader}>
                        <h4>{test.testName}</h4>
                        {test.priority === 'urgent' && (
                          <span className={styles.urgentBadge}>URGENT</span>
                        )}
                      </div>
                      <p className={styles.patientName}>Patient: {test.patientName}</p>
                      <p className={styles.orderedDate}>
                        Ordered: {new Date(test.orderedDate).toLocaleString()}
                      </p>
                    </div>
                    <button 
                      className={styles.processBtn}
                      onClick={() => navigate(`/labtech/tests/${test.testId}`)}
                    >
                      Process Test
                    </button>
                  </div>
                ))
              ) : (
                <div className={styles.emptyState}>
                  <FontAwesomeIcon icon={faCheckCircle} size="3x" color="#38a169" />
                  <p>No pending tests at the moment</p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className={styles.quickStatsSection}>
            <div className={styles.quickStatCard}>
              <h4>Average Turnaround Time</h4>
              <p className={styles.quickStatValue}>
                {stats?.avgTurnaroundTime || '2.5'} hrs
              </p>
            </div>
            <div className={styles.quickStatCard}>
              <h4>Tests This Month</h4>
              <p className={styles.quickStatValue}>
                {stats?.testsThisMonth || 0}
              </p>
            </div>
            <div className={styles.quickStatCard}>
              <h4>Completion Rate</h4>
              <p className={styles.quickStatValue}>
                {stats?.completionRate || 95}%
              </p>
            </div>
          </div>

          {/* Recent Activity */}
          <div className={styles.activitySection}>
            <div className={styles.sectionHeader}>
              <h3>Recent Activity</h3>
            </div>
            <div className={styles.activityList}>
              {stats?.recentActivity && stats.recentActivity.length > 0 ? (
                stats.recentActivity.map((activity, index) => (
                  <div key={index} className={styles.activityItem}>
                    <div className={styles.activityIcon}>
                      <FontAwesomeIcon 
                        icon={
                          activity.type === 'completed' ? faCheckCircle :
                          activity.type === 'started' ? faFlask : faClock
                        }
                        color={
                          activity.type === 'completed' ? '#38a169' :
                          activity.type === 'started' ? '#3182ce' : '#ed8936'
                        }
                      />
                    </div>
                    <div className={styles.activityContent}>
                      <p className={styles.activityText}>{activity.description}</p>
                      <p className={styles.activityTime}>
                        {new Date(activity.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className={styles.noActivity}>No recent activity</p>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default LabTechDashboard;
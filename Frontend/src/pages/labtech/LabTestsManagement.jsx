// src/pages/labtech/LabTestsManagement.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faMicroscope } from '@fortawesome/free-solid-svg-icons';
import { fetchLabTests } from '../../store/slices/labTechSlice';
import LabTechSidebar from '../../components/labtech/LabTechSidebar';
import Header from '../../components/Header/Header';

import styles from './LabTechDashboard.module.css';
import tableStyles from '../../components/Admin/ReceptionistTable.module.css';
import adminStyles from '../admin/ReceptionistManagement.module.css';

const LabTestsManagement = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { labTests, testsLoading, error } = useSelector((state) => state.labTech);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  useEffect(() => {
    const query = `?status=${statusFilter}&priority=${priorityFilter}`;
dispatch(fetchLabTests(query));
  }, [dispatch, statusFilter, priorityFilter]);

  const filteredTests = labTests?.filter(test => {
    const matchesSearch = 
      test.testName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      test.patientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      test.testId?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || test.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || test.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  }) || [];

  const testStats = {
    total: labTests?.length || 0,
    pending: labTests?.filter(t => t.status === 'pending').length || 0,
    inProgress: labTests?.filter(t => t.status === 'in-progress').length || 0,
    completed: labTests?.filter(t => t.status === 'completed').length || 0,
    urgent: labTests?.filter(t => t.priority === 'urgent').length || 0
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return '#ed8936';
      case 'in-progress': return '#3182ce';
      case 'completed': return '#38a169';
      default: return '#718096';
    }
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'urgent': return '#e53e3e';
      case 'high': return '#ed8936';
      case 'normal': return '#3182ce';
      default: return '#718096';
    }
  };

  if (testsLoading) {
    return (
      <div className={styles.labTechDashboard}>
        <Header title="MIT Health Centre" subtitle="Lab Tests" showLogout userRole="Lab Technician" />
        <div className={styles.mainContainer}>
          <LabTechSidebar />
          <main className={styles.mainContent}>
            <p>Loading lab tests…</p>
          </main>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.labTechDashboard}>
        <Header title="MIT Health Centre" subtitle="Lab Tests" showLogout userRole="Lab Technician" />
        <div className={styles.mainContainer}>
          <LabTechSidebar />
          <main className={styles.mainContent}>
            <p>Error: {error}</p>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.labTechDashboard}>
      <Header
        title="MIT Health Centre"
        subtitle="Lab Tests Management"
        showLogout
        userRole="Lab Technician"
      />

      <div className={styles.mainContainer}>
        <LabTechSidebar />

        <main className={styles.mainContent}>
          {/* Page Header */}
          <div className={styles.dashboardHeader}>
              <div className={styles.headerLeft}>
                  <h1>Lab Technician Dashboard</h1>
                  <p>Welcome to the Laboratory Management System</p>
                </div>
            </div>

          {/* Filters */}
          <div className={adminStyles.filtersSection}>
            <div className={adminStyles.searchBox}>
              <input
                className={adminStyles.searchInput}
                placeholder="Search by test / patient / ID"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <span className={adminStyles.searchIcon}>
                <FontAwesomeIcon icon={faSearch} />
              </span>
            </div>

            <div className={adminStyles.filterGroup}>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className={adminStyles.filterSelect}
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
              </select>

              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className={adminStyles.filterSelect}
              >
                <option value="all">All Priority</option>
                <option value="urgent">Urgent</option>
                <option value="normal">Normal</option>
              </select>
            </div>
          </div>

                {/* Tests Table */}
      <section className={styles.tableSection}>
        <div className={tableStyles.tableContainer}>
          <table className={tableStyles.receptionistTable}>
            <thead>
              <tr>
                <th>Test ID</th>
                <th>Test Name</th>
                <th>Patient</th>
                <th>Ordered Date</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTests.map((test) => (
                <tr key={test.testId} className={tableStyles.receptionistRow}>
                  <td>
                    <code style={{
                      fontFamily: 'monospace',
                      fontSize: '12px',
                      background: '#f7fafc',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      color: '#4a5568'
                    }}>
                      {test.testId?.substring(0, 8)}
                    </code>
                  </td>
                  <td>
                    <div className={tableStyles.receptionistInfo}>
                      <div className={tableStyles.avatar} style={{
                        background: getStatusColor(test.status)
                      }}>
                        <FontAwesomeIcon icon={faMicroscope} />
                      </div>
                      <div>
                        <div className={tableStyles.receptionistName}>
                          {test.testName}
                        </div>
                        <div className={tableStyles.receptionistEmail}>
                          {test.testType && `Type: ${test.testType} • `}Visit ID: {test.visitId?.substring(0, 8)}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>{test.patientName}</td>
                  <td>
                    {test.orderedDate 
                      ? new Date(test.orderedDate).toLocaleDateString()
                      : 'N/A'}
                  </td>
                  <td>
                    <span className={tableStyles.shiftBadge} style={{
                      background: getPriorityColor(test.priority) + '20',
                      color: getPriorityColor(test.priority),
                      textTransform: 'uppercase',
                      fontWeight: '600'
                    }}>
                      {test.priority}
                    </span>
                  </td>
                  <td>
                    <span className={tableStyles.statusBadge} style={{
                      backgroundColor: getStatusColor(test.status) + '20',
                      color: getStatusColor(test.status)
                    }}>
                      {test.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button 
                        onClick={() => navigate(`/labtech/tests/${test.testId}`)}
                        style={{
                          padding: '6px 12px',
                          background: '#e6f2ff',
                          color: '#1a365d',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '13px',
                          fontWeight: '500'
                        }}
                      >
                        View
                      </button>
                      {test.status !== 'completed' && (
                        <button 
                          onClick={() => navigate(`/labtech/tests/${test.testId}`)}
                          style={{
                            padding: '6px 12px',
                            background: '#f0e6ff',
                            color: '#5a2d82',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '13px',
                            fontWeight: '500'
                          }}
                        >
                          Process
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredTests.length === 0 && (
            <div className={tableStyles.emptyTable}>
              <p>No lab tests found matching your criteria.</p>
            </div>
          )}
        </div>
      </section>
        </main>
      </div>
    </div>
  );
};

export default LabTestsManagement;

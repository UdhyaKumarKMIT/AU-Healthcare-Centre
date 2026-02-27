// src/pages/admin/LogsManagement.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faSync, faExclamationTriangle, faClipboardList, faLightbulb } from '@fortawesome/free-solid-svg-icons';
import { fetchSystemLogs, clearError } from '../../store/slices/adminSlice';
import styles from './ReceptionistManagement.module.css';
import tableStyles from '../../components/Admin/ReceptionistTable.module.css';

const LogsManagement = () => {
  const dispatch = useDispatch();
  const { systemLogs, logsLoading, error } = useSelector((state) => state.admin);

  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [retryCount, setRetryCount] = useState(0);

  const normalizeDateForQuery = (date) => {
    if (!date) return date;
    // Date-only format will be expanded by backend to full day
    return date;
  };

  useEffect(() => {
    // Only fetch on mount, not on filter changes
    const params = {};
    if (startDate) params.startDate = normalizeDateForQuery(startDate);
    if (endDate) params.endDate = normalizeDateForQuery(endDate);
    if (actionFilter !== 'all') params.action = actionFilter;

    dispatch(fetchSystemLogs(params));
  }, []); // Empty dependency array - only runs once on mount

  // Manual refresh function
  const handleRefresh = () => {
    dispatch(clearError());
    const params = {};
    if (startDate) params.startDate = normalizeDateForQuery(startDate);
    if (endDate) params.endDate = normalizeDateForQuery(endDate);
    if (actionFilter !== 'all') params.action = actionFilter;

    setRetryCount(prev => prev + 1);
    dispatch(fetchSystemLogs(params));
  };

  // Apply filters without auto-fetching
  const handleApplyFilters = () => {
    dispatch(clearError());
    const params = {};
    if (startDate) params.startDate = normalizeDateForQuery(startDate);
    if (endDate) params.endDate = normalizeDateForQuery(endDate);
    if (actionFilter !== 'all') params.action = actionFilter;

    dispatch(fetchSystemLogs(params));
  };

  const filteredLogs = (systemLogs || []).filter(log => {
    if (!searchQuery) return true;
    const searchLower = searchQuery.toLowerCase();
    return (
      log.description?.toLowerCase().includes(searchLower) ||
      log.user_name?.toLowerCase().includes(searchLower) ||
      log.action?.toLowerCase().includes(searchLower)
    );
  });

  const logStats = {
    total: (systemLogs || []).length,
    today: (systemLogs || []).filter(log => {
      const logDate = new Date(log.timestamp);
      const today = new Date();
      return logDate.toDateString() === today.toDateString();
    }).length,
    uniqueUsers: new Set((systemLogs || []).map(log => log.user_id)).size
  };

  if (logsLoading) {
    return (
      <div className={styles.receptionistManagement}>
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Loading logs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.receptionistManagement}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}><FontAwesomeIcon icon={faClipboardList} /> System Logs & Audit</h1>
            <p className={styles.subtitle}>View system activity logs and audit trails</p>
          </div>
        </div>

        <div style={{
          background: '#fff3cd',
          border: '2px solid #ffc107',
          borderRadius: '12px',
          padding: '32px',
          marginTop: '24px',
          textAlign: 'center'
        }}>
          <FontAwesomeIcon
            icon={faExclamationTriangle}
            style={{ fontSize: '48px', color: '#ff9800', marginBottom: '16px' }}
          />
          <h2 style={{ color: '#856404', marginBottom: '12px' }}>
            Unable to Load System Logs
          </h2>
          <p style={{ color: '#856404', marginBottom: '8px', fontSize: '16px' }}>
            <strong>Error:</strong> {error}
          </p>
          <p style={{ color: '#856404', marginBottom: '24px', fontSize: '14px' }}>
            The server is experiencing issues (HTTP 500 error). This typically means:
          </p>
          <ul style={{
            textAlign: 'left',
            maxWidth: '600px',
            margin: '0 auto 24px',
            color: '#856404',
            fontSize: '14px'
          }}>
            <li>The logs endpoint on the backend may not be implemented yet</li>
            <li>There might be a database connection issue</li>
            <li>The backend service might be down or restarting</li>
            <li>Required database tables might not exist</li>
          </ul>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button
              className={styles.addButton}
              onClick={handleRefresh}
              style={{ minWidth: '140px' }}
            >
              <FontAwesomeIcon icon={faSync} /> Try Again
            </button>
            <button
              onClick={() => dispatch(clearError())}
              style={{
                padding: '12px 24px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                background: 'white',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              Dismiss
            </button>
          </div>

          {retryCount > 0 && (
            <p style={{
              marginTop: '16px',
              fontSize: '12px',
              color: '#6c757d'
            }}>
              Retry attempts: {retryCount}
            </p>
          )}
        </div>

        <div style={{
          marginTop: '24px',
          padding: '16px',
          background: '#e7f3ff',
          border: '1px solid #2196f3',
          borderRadius: '8px',
          borderLeft: '4px solid #2196f3'
        }}>
          <p style={{ margin: 0, fontSize: '14px', color: '#1565c0' }}>
            <strong><FontAwesomeIcon icon={faLightbulb} /> Note:</strong> If you're a developer, check the backend logs for the
            <code style={{
              background: '#fff',
              padding: '2px 6px',
              borderRadius: '4px',
              margin: '0 4px'
            }}>
              /api/admin/logs
            </code>
            endpoint. You may need to implement or fix this route.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.receptionistManagement}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>📋 System Logs & Audit</h1>
          <p className={styles.subtitle}>
            View system activity logs and audit trails
          </p>
        </div>

        <button
          className={styles.addButton}
          onClick={handleRefresh}
          disabled={logsLoading}
        >
          <FontAwesomeIcon icon={faSync} spin={logsLoading} /> Refresh
        </button>
      </div>

      {/* Log Stats */}
      <section className={styles.statsSection}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px',
          marginBottom: '24px'
        }}>
          <div style={{
            background: 'white',
            padding: '20px',
            borderRadius: '12px',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.06)',
            border: '1px solid #e2e8f0'
          }}>
            <h3 style={{ fontSize: '14px', color: '#718096', margin: '0 0 12px 0' }}>
              Total Logs
            </h3>
            <p style={{ fontSize: '32px', fontWeight: '700', color: '#1a365d', margin: 0 }}>
              {logStats.total}
            </p>
          </div>

          <div style={{
            background: 'white',
            padding: '20px',
            borderRadius: '12px',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.06)',
            border: '1px solid #e2e8f0'
          }}>
            <h3 style={{ fontSize: '14px', color: '#718096', margin: '0 0 12px 0' }}>
              Today's Activities
            </h3>
            <p style={{ fontSize: '32px', fontWeight: '700', color: '#38a169', margin: 0 }}>
              {logStats.today}
            </p>
          </div>

          <div style={{
            background: 'white',
            padding: '20px',
            borderRadius: '12px',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.06)',
            border: '1px solid #e2e8f0'
          }}>
            <h3 style={{ fontSize: '14px', color: '#718096', margin: '0 0 12px 0' }}>
              Unique Users
            </h3>
            <p style={{ fontSize: '32px', fontWeight: '700', color: '#805ad5', margin: 0 }}>
              {logStats.uniqueUsers}
            </p>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className={styles.filtersSection}>
        <div className={styles.searchBox}>
          <input
            className={styles.searchInput}
            placeholder="Search by patient, doctor, or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <span className={styles.searchIcon}>
            <FontAwesomeIcon icon={faSearch} />
          </span>
        </div>

        <div className={styles.filterGroup}>
          <div className={styles.filter}>
            <label className={styles.filterLabel}>Action Type</label>
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="all">All Actions</option>
              <option value="VISIT_CREATED">Visit Created</option>
              <option value="USER_LOGIN">User Login</option>
              <option value="USER_LOGOUT">User Logout</option>
              <option value="PRESCRIPTION_ISSUED">Prescription Issued</option>
            </select>
          </div>

          <div className={styles.filter}>
            <label className={styles.filterLabel}>Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className={styles.filterSelect}
            />
          </div>

          <div className={styles.filter}>
            <label className={styles.filterLabel}>End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className={styles.filterSelect}
            />
          </div>

          <button
            className={styles.addButton}
            onClick={handleApplyFilters}
            style={{ alignSelf: 'flex-end' }}
          >
            Apply Filters
          </button>

          <button
            className={styles.resetFiltersBtn}
            onClick={() => {
              setSearchQuery('');
              setActionFilter('all');
              setStartDate('');
              setEndDate('');
            }}
          >
            Reset Filters
          </button>
        </div>
      </section>

      {/* Logs Table */}
      <section className={styles.tableSection}>
        <div className={tableStyles.tableContainer}>
          <table className={tableStyles.receptionistTable}>
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Action</th>
                <th>User</th>
                <th>Description</th>
                <th>Log ID</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log) => (
                <tr key={log.log_id} className={tableStyles.receptionistRow}>
                  <td>
                    <div style={{ fontSize: '14px', color: '#4a5568' }}>
                      {new Date(log.timestamp).toLocaleString()}
                    </div>
                  </td>
                  <td>
                    <span className={tableStyles.shiftBadge} style={{
                      background: '#fff3e0',
                      color: '#e65100'
                    }}>
                      {log.action}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontSize: '14px', fontWeight: '500' }}>
                      {log.user_name || 'System'}
                    </div>
                  </td>
                  <td>
                    <div style={{
                      fontSize: '14px',
                      color: '#4a5568',
                      maxWidth: '400px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {log.description}
                    </div>
                  </td>
                  <td>
                    <code style={{
                      fontFamily: 'monospace',
                      fontSize: '12px',
                      background: '#f7fafc',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      color: '#4a5568'
                    }}>
                      {log.log_id.substring(0, 8)}...
                    </code>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredLogs.length === 0 && (
            <div className={tableStyles.emptyTable}>
              <p>No logs found for the selected criteria.</p>
            </div>
          )}
        </div>
      </section>

      {/* Note */}
      <div style={{
        marginTop: '24px',
        padding: '16px',
        background: '#e7f3ff',
        border: '1px solid #2196f3',
        borderRadius: '8px',
        borderLeft: '4px solid #2196f3'
      }}>
        <p style={{ margin: 0, fontSize: '14px', color: '#1565c0' }}>
          <strong>ℹ️ Info:</strong> System logs track all major activities including user logins,
          visit creation, prescription issuance, and administrative actions for audit purposes.
        </p>
      </div>
    </div>
  );
};

export default LogsManagement;
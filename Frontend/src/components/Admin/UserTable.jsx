// src/components/Admin/UserTable.jsx
import React, { useState } from 'react';
import styles from './UserTable.module.css';

const UserTable = ({ users = [], onView, onEdit, onStatusChange }) => {
  const [selectedUsers, setSelectedUsers] = useState([]);

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { label: 'Active', color: '#28a745', bgColor: '#d4edda' },
      inactive: { label: 'Inactive', color: '#6c757d', bgColor: '#e2e3e5' },
      pending: { label: 'Pending', color: '#ffc107', bgColor: '#fff3cd' },
      suspended: { label: 'Suspended', color: '#dc3545', bgColor: '#f8d7da' },
    };
    
    const config = statusConfig[status] || { label: status, color: '#6c757d', bgColor: '#e2e3e5' };
    
    return (
      <span 
        className={styles.statusBadge}
        style={{ 
          backgroundColor: config.bgColor,
          color: config.color,
          border: `1px solid ${config.color}`
        }}
      >
        {config.label}
      </span>
    );
  };

  const getRoleBadge = (role) => {
    const roleConfig = {
      admin: { color: '#6f42c1', bgColor: '#e9d8fd' },
      doctor: { color: '#28a745', bgColor: '#d4edda' },
      nurse: { color: '#17a2b8', bgColor: '#d1ecf1' },
      pharmacist: { color: '#fd7e14', bgColor: '#ffe5d0' },
      receptionist: { color: '#20c997', bgColor: '#d1f2eb' },
      patient: { color: '#6c757d', bgColor: '#e2e3e5' },
    };
    
    const config = roleConfig[role] || { color: '#6c757d', bgColor: '#e2e3e5' };
    
    return (
      <span 
        className={styles.roleBadge}
        style={{ 
          backgroundColor: config.bgColor,
          color: config.color,
        }}
      >
        {role}
      </span>
    );
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedUsers(users.map(user => user.id));
    } else {
      setSelectedUsers([]);
    }
  };

  const handleSelectUser = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleBulkStatusChange = (newStatus) => {
    if (selectedUsers.length === 0) {
      alert('Please select users first');
      return;
    }
    
    if (window.confirm(`Change status of ${selectedUsers.length} user(s) to ${newStatus}?`)) {
      selectedUsers.forEach(userId => {
        onStatusChange(userId, newStatus, 'Bulk update');
      });
      setSelectedUsers([]);
    }
  };

  return (
    <div className={styles.tableContainer}>
      {selectedUsers.length > 0 && (
        <div className={styles.bulkActions}>
          <span>{selectedUsers.length} user(s) selected</span>
          <div className={styles.bulkButtons}>
            <button onClick={() => handleBulkStatusChange('active')}>Activate</button>
            <button onClick={() => handleBulkStatusChange('inactive')}>Deactivate</button>
            <button onClick={() => handleBulkStatusChange('suspended')}>Suspend</button>
            <button onClick={() => setSelectedUsers([])}>Clear</button>
          </div>
        </div>
      )}

      <table className={styles.userTable}>
        <thead>
          <tr>
            <th style={{ width: '40px' }}>
              <input 
                type="checkbox" 
                onChange={handleSelectAll}
                checked={selectedUsers.length === users.length && users.length > 0}
              />
            </th>
            <th>User</th>
            <th>Role</th>
            <th>Status</th>
            <th>Last Login</th>
            <th>Registered</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className={styles.userRow}>
              <td>
                <input 
                  type="checkbox" 
                  checked={selectedUsers.includes(user.id)}
                  onChange={() => handleSelectUser(user.id)}
                />
              </td>
              <td>
                <div className={styles.userInfo}>
                  <div className={styles.avatar}>
                    {user.avatar || user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className={styles.userName}>{user.name}</div>
                    <div className={styles.userEmail}>{user.email}</div>
                    <div className={styles.userId}>ID: {user.userId}</div>
                  </div>
                </div>
              </td>
              <td>
                {getRoleBadge(user.role)}
                {user.department && (
                  <div className={styles.department}>{user.department}</div>
                )}
              </td>
              <td>
                {getStatusBadge(user.status)}
              </td>
              <td>{formatDate(user.lastLogin)}</td>
              <td>{formatDate(user.registeredDate)}</td>
              <td>
                <div className={styles.actionButtons}>
                  <button
                    className={styles.viewBtn}
                    onClick={() => onView(user.id)}
                    title="View User"
                  >
                    👁️
                  </button>
                  <button
                    className={styles.editBtn}
                    onClick={() => onEdit(user.id)}
                    title="Edit User"
                  >
                    ✏️
                  </button>
                  <select
                    className={styles.statusSelect}
                    value={user.status}
                    onChange={(e) => onStatusChange(user.id, e.target.value)}
                    title="Change Status"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="pending">Pending</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserTable;
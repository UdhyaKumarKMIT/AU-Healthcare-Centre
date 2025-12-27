// src/pages/admin/UserManagement.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  fetchUsers, 
  createUser,
  updateUserStatus, 
  deleteUser,
  clearError,
  clearSuccessMessage 
} from '../../store/slices/adminSlice';
import UserTable from '../../components/Admin/UserTable';
import UserStats from '../../components/Admin/UserStats';
import styles from './UserManagement.module.css';

const UserManagement = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Get data from Redux - USE REAL DATA
  const { users, userStats, usersLoading, error, successMessage } = useSelector(
    (state) => state.admin
  );
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'DOCTOR'
  });

  // Fetch users on mount
  useEffect(() => {
    console.log('👥 Fetching users...');
    dispatch(fetchUsers());
  }, [dispatch]);

  // Fetch filtered users when filters change
  useEffect(() => {
    const params = {};
    if (roleFilter !== 'all') params.role = roleFilter;
    if (statusFilter !== 'all') params.status = statusFilter;
    if (searchQuery) params.search = searchQuery;
    
    console.log('🔍 Fetching users with filters:', params);
    dispatch(fetchUsers(params));
  }, [dispatch, statusFilter, roleFilter, searchQuery]);

  // Log users for debugging
  useEffect(() => {
    console.log('👥 Users from Redux:', users);
    console.log('📊 User Stats:', userStats);
  }, [users, userStats]);

  // Clear messages after 3 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        dispatch(clearSuccessMessage());
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, dispatch]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        dispatch(clearError());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    console.log('➕ Creating user:', newUser);
    
    const result = await dispatch(createUser(newUser));
    
    if (!result.error) {
      setShowCreateModal(false);
      setNewUser({ name: '', email: '', password: '', role: 'DOCTOR' });
      // Refresh the user list
      dispatch(fetchUsers({ role: roleFilter, status: statusFilter, search: searchQuery }));
    }
  };

  const handleStatusChange = async (userId, newStatus, reason = '') => {
    if (window.confirm(`Change user status to ${newStatus}?`)) {
      console.log('🔄 Updating user status:', userId, newStatus);
      await dispatch(updateUserStatus({ userId, status: newStatus, reason }));
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      console.log('🗑️ Deleting user:', userId);
      await dispatch(deleteUser(userId));
    }
  };

  const handleViewUser = (userId) => {
    navigate(`/admin/users/${userId}`);
  };

  const handleEditUser = (userId) => {
    navigate(`/admin/users/${userId}/edit`);
  };

  return (
    <div className={styles.userManagement}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>User Management</h1>
          <p className={styles.subtitle}>
            Manage user accounts, permissions, and access controls
          </p>
        </div>
        <button 
          className={styles.addUserBtn} 
          onClick={() => setShowCreateModal(true)}
        >
          + Add New User
        </button>
      </div>

      {/* Success/Error Messages */}
      {successMessage && (
        <div className={styles.successAlert}>
          ✓ {successMessage}
        </div>
      )}
      {error && (
        <div className={styles.errorAlert}>
          ✗ {error}
        </div>
      )}

      {/* User Statistics - REAL DATA */}
      <section className={styles.statsSection}>
        <UserStats stats={userStats} />
      </section>

      {/* Filters and Search */}
      <section className={styles.filtersSection}>
        <div className={styles.searchBox}>
          <input
            type="text"
            placeholder="Search users by name, email, or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
          <span className={styles.searchIcon}>🔍</span>
        </div>

        <div className={styles.filterControls}>
          <div className={styles.filter}>
            <label className={styles.filterLabel}>Role</label>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="all">All Roles</option>
              <option value="ADMIN">Admin</option>
              <option value="DOCTOR">Doctor</option>
              <option value="NURSE">Nurse</option>
              <option value="RECEPTIONIST">Receptionist</option>
              <option value="PHARMACIST">Pharmacist</option>
            </select>
          </div>

          <div className={styles.filter}>
            <label className={styles.filterLabel}>Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="pending">Pending</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>

          <button
            className={styles.resetFiltersBtn}
            onClick={() => {
              setSearchQuery('');
              setStatusFilter('all');
              setRoleFilter('all');
            }}
          >
            Reset Filters
          </button>
        </div>
      </section>

      {/* Users Table - REAL DATA */}
      <section className={styles.usersSection}>
        {usersLoading ? (
          <div className={styles.loadingContainer}>
            <div className={styles.spinner}></div>
            <p>Loading users...</p>
          </div>
        ) : (
          <>
            <UserTable
              users={users}
              onView={handleViewUser}
              onEdit={handleEditUser}
              onStatusChange={handleStatusChange}
              onDelete={handleDeleteUser}
            />
            
            {users.length === 0 && (
              <div className={styles.emptyState}>
                <p>No users found matching your criteria.</p>
                <button onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('all');
                  setRoleFilter('all');
                }}>
                  Clear Filters
                </button>
              </div>
            )}
          </>
        )}
      </section>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3>Create New User</h3>
              <button 
                onClick={() => setShowCreateModal(false)}
                className={styles.closeButton}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleCreateUser}>
              <div className={styles.formGroup}>
                <label>Name *</label>
                <input
                  type="text"
                  value={newUser.name}
                  onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                  required
                  placeholder="Full Name"
                />
              </div>
              <div className={styles.formGroup}>
                <label>Email *</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  required
                  placeholder="email@example.com"
                />
              </div>
              <div className={styles.formGroup}>
                <label>Password *</label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                  required
                  minLength="6"
                  placeholder="Minimum 6 characters"
                />
              </div>
              <div className={styles.formGroup}>
                <label>Role *</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                >
                  <option value="DOCTOR">Doctor</option>
                  <option value="NURSE">Nurse</option>
                  <option value="RECEPTIONIST">Receptionist</option>
                  <option value="PHARMACIST">Pharmacist</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
              <div className={styles.modalActions}>
                <button 
                  type="button" 
                  onClick={() => setShowCreateModal(false)}
                  className={styles.cancelButton}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={usersLoading}
                  className={styles.submitButton}
                >
                  {usersLoading ? 'Creating...' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
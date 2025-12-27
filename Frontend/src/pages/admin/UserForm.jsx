// src/pages/admin/UserForm.jsx
import React, { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styles from './UserManagement.module.css';

/**
 * Minimal add/edit user form.
 * NOTE: Backend API for users is not present in this repository.
 * This form is implemented to fix broken navigation (redirect-to-login via wildcard)
 * and to provide a working UI flow without weakening auth/guards.
 */
const UserForm = ({ mode = 'add' }) => {
  const navigate = useNavigate();
  const { userId } = useParams();

  const isEdit = useMemo(() => mode === 'edit', [mode]);

  const [form, setForm] = useState({
    name: '',
    email: '',
    role: 'administrator',
    status: 'active',
  });

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = (e) => {
    e.preventDefault();

    // Since the backend in this repo has no /users endpoints, we keep this as a safe UX action.
    // You can wire this to a real API later without changing routing.
    if (isEdit) {
      alert(`User ${userId} updated (demo UI).`);
    } else {
      alert('New user created (demo UI).');
    }

    navigate('/admin/users');
  };

  return (
    <div className={styles.userManagement}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>{isEdit ? 'Edit User' : 'Add New User'}</h1>
          <p className={styles.subtitle}>
            {isEdit ? `Update user details for ID: ${userId}` : 'Create a new user account'}
          </p>
        </div>
        <button className={styles.addButton} onClick={() => navigate('/admin/users')}>
          Back to Users
        </button>
      </div>

      <div className={styles.content}>
        <form onSubmit={onSubmit} style={{ maxWidth: 640 }}>
          <div style={{ display: 'grid', gap: 12 }}>
            <label style={{ display: 'grid', gap: 6 }}>
              <span>Name</span>
              <input
                name="name"
                value={form.name}
                onChange={onChange}
                required
                placeholder="Full name"
                style={{ padding: 10, borderRadius: 10, border: '1px solid #e2e8f0' }}
              />
            </label>

            <label style={{ display: 'grid', gap: 6 }}>
              <span>Email</span>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={onChange}
                required
                placeholder="email@domain.com"
                style={{ padding: 10, borderRadius: 10, border: '1px solid #e2e8f0' }}
              />
            </label>

            <label style={{ display: 'grid', gap: 6 }}>
              <span>Role</span>
              <select
                name="role"
                value={form.role}
                onChange={onChange}
                style={{ padding: 10, borderRadius: 10, border: '1px solid #e2e8f0' }}
              >
                <option value="administrator">Administrator</option>
                <option value="doctor">Doctor</option>
                <option value="receptionist">Receptionist</option>
                <option value="nurse">Nurse</option>
                <option value="pharmacist">Pharmacist</option>
                <option value="patient">Patient</option>
              </select>
            </label>

            <label style={{ display: 'grid', gap: 6 }}>
              <span>Status</span>
              <select
                name="status"
                value={form.status}
                onChange={onChange}
                style={{ padding: 10, borderRadius: 10, border: '1px solid #e2e8f0' }}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </label>

            <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
              <button type="submit" className={styles.addButton}>
                {isEdit ? 'Save Changes' : 'Create User'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/admin/users')}
                style={{ padding: '10px 16px', borderRadius: 10, border: '1px solid #e2e8f0' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserForm;

import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import styles from './ReceptionistManagement.module.css';
import { createUser } from '../../store/slices/adminSlice';

const UserForm = ({ mode = 'add' }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { userId } = useParams();
  const [searchParams] = useSearchParams();
  const presetRole = searchParams.get('role')?.toLowerCase();

  const isEdit = useMemo(() => mode === 'edit', [mode]);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: '',
    username: '',
    password: '',
    role: 'doctor',
    phone: '',
    specialization: '',
    qualification: '',
    register_number: ''
  });

  useEffect(() => {
    if (presetRole) {
      setForm(f => ({ ...f, role: presetRole.toLowerCase() }));
    }
  }, [presetRole]);

  const onChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const onSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const roleMap = {
  doctor: 'DOCTOR',
  nurse: 'NURSE_RECEPTIONIST',
  pharmacist: 'PHARMACIST'
};

const payload = {
  name: form.name,
  username: form.username.trim(),
  password: form.password,
  phone: form.phone || '',
  role: roleMap[form.role],
  ...(form.role === 'doctor' && { specialization: form.specialization }),
  ...(form.role === 'nurse' && {
    qualification: form.qualification,
    register_number: form.register_number
  })
};

await dispatch(createUser(payload)).unwrap();
      navigate(-1);
    } catch (err) {
      setError(typeof err === 'string' ? err : 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.receptionistManagement}>
      <div className={styles.header}>
        <h1 className={styles.title}>
          {isEdit ? 'Edit User' : `Add ${form.role.toUpperCase()}`}
        </h1>
        <button
          type="button"
          className={styles.addButton}
          onClick={() => navigate(-1)}
        >
          Back
        </button>
      </div>

      {error && (
        <div className={styles.errorAlert}>
          {error}
        </div>
      )}

      <form className={styles.form} onSubmit={onSubmit}>
        <div className={styles.formGroup}>
          <label>Name *</label>
          <input name="name" required onChange={onChange} />
        </div>

        <div className={styles.formGroup}>
          <label>Email *</label>
          <input name="username" required onChange={onChange} />
        </div>

        <div className={styles.formGroup}>
          <label>Password *</label>
          <input
            name="password"
            type="password"
            required
            minLength={6}
            onChange={onChange}
          />
        </div>

        {form.role === 'doctor' && (
          <>
            <div className={styles.formGroup}>
              <label>Specialization *</label>
              <input name="specialization" required onChange={onChange} />
            </div>
            <div className={styles.formGroup}>
              <label>Phone *</label>
              <input name="phone" required onChange={onChange} />
            </div>
          </>
        )}

        {form.role === 'nurse' && (
          <>
            <div className={styles.formGroup}>
              <label>Qualification *</label>
              <input name="qualification" required onChange={onChange} />
            </div>
            <div className={styles.formGroup}>
              <label>Register Number *</label>
              <input name="register_number" required onChange={onChange} />
            </div>
            <div className={styles.formGroup}>
              <label>Phone</label>
              <input name="phone" onChange={onChange} />
            </div>
          </>
        )}

        {form.role === 'pharmacist' && (
          <div className={styles.formGroup}>
            <label>Phone</label>
            <input name="phone" onChange={onChange} />
          </div>
        )}

        <div className={styles.formActions}>
          <button
            type="submit"
            className={styles.submitButton}
            disabled={loading}
          >
            {loading ? 'Creating…' : 'Create'}
          </button>
          <button
            type="button"
            className={styles.cancelButton}
            onClick={() => navigate(-1)}
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserForm;

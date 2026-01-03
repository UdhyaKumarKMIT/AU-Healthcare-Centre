// src/pages/admin/ScheduleVisit.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './VisitManagement.module.css';

/**
 * Minimal "Schedule New Visit" page.
 * Fixes broken navigation by providing a real route target.
 * Backend visit scheduling endpoints are not present in this repository,
 * so this remains a safe UI flow (no auth bypass, no token hardcoding).
 */
const ScheduleVisit = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    patientId: '',
    patientName: '',
    doctorName: '',
    purpose: '',
    date: new Date().toISOString().split('T')[0],
    time: '10:00',
    duration: '30',
  });

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = (e) => {
    e.preventDefault();
    alert('Visit scheduled (demo UI).');
    navigate('/admin/visits');
  };

  return (
    <div className={styles.visitManagement}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Schedule New Visit</h1>
          <p className={styles.subtitle}>Create a new visit appointment</p>
        </div>
        <button className={styles.addButton} onClick={() => navigate('/admin/visits')}>
          Back to Visits
        </button>
      </div>

      <div className={styles.content}>
        <form onSubmit={onSubmit} style={{ maxWidth: 720 }}>
          <div style={{ display: 'grid', gap: 12 }}>
            <label style={{ display: 'grid', gap: 6 }}>
              <span>Patient ID</span>
              <input
                name="patientId"
                value={form.patientId}
                onChange={onChange}
                placeholder="AU2023001"
                style={{ padding: 10, borderRadius: 10, border: '1px solid #e2e8f0' }}
              />
            </label>

            <label style={{ display: 'grid', gap: 6 }}>
              <span>Patient Name</span>
              <input
                name="patientName"
                value={form.patientName}
                onChange={onChange}
                required
                placeholder="Patient name"
                style={{ padding: 10, borderRadius: 10, border: '1px solid #e2e8f0' }}
              />
            </label>

            <label style={{ display: 'grid', gap: 6 }}>
              <span>Doctor Name</span>
              <input
                name="doctorName"
                value={form.doctorName}
                onChange={onChange}
                required
                placeholder="Dr. John Smith"
                style={{ padding: 10, borderRadius: 10, border: '1px solid #e2e8f0' }}
              />
            </label>

            <label style={{ display: 'grid', gap: 6 }}>
              <span>Purpose</span>
              <input
                name="purpose"
                value={form.purpose}
                onChange={onChange}
                required
                placeholder="General Checkup"
                style={{ padding: 10, borderRadius: 10, border: '1px solid #e2e8f0' }}
              />
            </label>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <label style={{ display: 'grid', gap: 6 }}>
                <span>Date</span>
                <input
                  type="date"
                  name="date"
                  value={form.date}
                  onChange={onChange}
                  required
                  style={{ padding: 10, borderRadius: 10, border: '1px solid #e2e8f0' }}
                />
              </label>

              <label style={{ display: 'grid', gap: 6 }}>
                <span>Time</span>
                <input
                  type="time"
                  name="time"
                  value={form.time}
                  onChange={onChange}
                  required
                  style={{ padding: 10, borderRadius: 10, border: '1px solid #e2e8f0' }}
                />
              </label>
            </div>

            <label style={{ display: 'grid', gap: 6 }}>
              <span>Duration (minutes)</span>
              <select
                name="duration"
                value={form.duration}
                onChange={onChange}
                style={{ padding: 10, borderRadius: 10, border: '1px solid #e2e8f0' }}
              >
                <option value="15">15</option>
                <option value="30">30</option>
                <option value="45">45</option>
                <option value="60">60</option>
              </select>
            </label>

            <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
              <button type="submit" className={styles.addButton}>
                Schedule Visit
              </button>
              <button
                type="button"
                onClick={() => navigate('/admin/visits')}
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

export default ScheduleVisit;

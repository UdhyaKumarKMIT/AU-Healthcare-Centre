// src/pages/admin/SettingsManagement.jsx
import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faTimes } from '@fortawesome/free-solid-svg-icons';
import styles from './ReceptionistManagement.module.css';

const SettingsManagement = () => {
  const [settings, setSettings] = useState({
    hospitalName: 'MIT Health Center',
    hospitalEmail: 'health@mit.edu',
    hospitalPhone: '+91-1234567890',
    address: 'MIT Campus, Chennai',
    workingHours: '8:00 AM - 8:00 PM',
    emergencyContact: '+91-9876543210',
    emailNotifications: true,
    smsNotifications: false,
    appointmentReminders: true,
    maxVisitsPerDay: 50,
    sessionTimeout: 30,
    backupFrequency: 'daily'
  });

  const [activeTab, setActiveTab] = useState('general');

  const handleSave = () => {
    alert('Settings saved successfully!');
  };

  const handleChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className={styles.receptionistManagement}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>⚙️ System Settings</h1>
          <p className={styles.subtitle}>
            Configure system preferences and settings
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.06)',
        border: '1px solid #e2e8f0',
        marginBottom: '24px',
        overflow: 'hidden'
      }}>
        <div style={{
          display: 'flex',
          borderBottom: '2px solid #e2e8f0'
        }}>
          {['general', 'notifications', 'security', 'backup'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                flex: 1,
                padding: '16px 24px',
                background: activeTab === tab ? '#1a365d' : 'transparent',
                color: activeTab === tab ? 'white' : '#4a5568',
                border: 'none',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                textTransform: 'capitalize',
                transition: 'all 0.2s'
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div style={{ padding: '32px' }}>
          {activeTab === 'general' && (
            <div>
              <h2 style={{ 
                fontSize: '20px', 
                fontWeight: '600', 
                color: '#1a365d', 
                marginBottom: '24px' 
              }}>
                General Settings
              </h2>
              
              <div className={styles.formGroup}>
                <label style={{ 
                  fontSize: '14px', 
                  fontWeight: '500', 
                  color: '#4a5568',
                  marginBottom: '8px',
                  display: 'block'
                }}>
                  Hospital Name
                </label>
                <input
                  type="text"
                  value={settings.hospitalName}
                  onChange={(e) => handleChange('hospitalName', e.target.value)}
                  className={styles.searchInput}
                  style={{ marginBottom: '20px' }}
                />
              </div>

              <div className={styles.formGroup}>
                <label style={{ 
                  fontSize: '14px', 
                  fontWeight: '500', 
                  color: '#4a5568',
                  marginBottom: '8px',
                  display: 'block'
                }}>
                  Hospital Email
                </label>
                <input
                  type="email"
                  value={settings.hospitalEmail}
                  onChange={(e) => handleChange('hospitalEmail', e.target.value)}
                  className={styles.searchInput}
                  style={{ marginBottom: '20px' }}
                />
              </div>

              <div className={styles.formGroup}>
                <label style={{ 
                  fontSize: '14px', 
                  fontWeight: '500', 
                  color: '#4a5568',
                  marginBottom: '8px',
                  display: 'block'
                }}>
                  Hospital Phone
                </label>
                <input
                  type="tel"
                  value={settings.hospitalPhone}
                  onChange={(e) => handleChange('hospitalPhone', e.target.value)}
                  className={styles.searchInput}
                  style={{ marginBottom: '20px' }}
                />
              </div>

              <div className={styles.formGroup}>
                <label style={{ 
                  fontSize: '14px', 
                  fontWeight: '500', 
                  color: '#4a5568',
                  marginBottom: '8px',
                  display: 'block'
                }}>
                  Address
                </label>
                <textarea
                  value={settings.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  className={styles.searchInput}
                  rows="3"
                  style={{ marginBottom: '20px', resize: 'vertical', minHeight: '80px' }}
                />
              </div>

              <div className={styles.formGroup}>
                <label style={{ 
                  fontSize: '14px', 
                  fontWeight: '500', 
                  color: '#4a5568',
                  marginBottom: '8px',
                  display: 'block'
                }}>
                  Working Hours
                </label>
                <input
                  type="text"
                  value={settings.workingHours}
                  onChange={(e) => handleChange('workingHours', e.target.value)}
                  className={styles.searchInput}
                  style={{ marginBottom: '20px' }}
                />
              </div>

              <div className={styles.formGroup}>
                <label style={{ 
                  fontSize: '14px', 
                  fontWeight: '500', 
                  color: '#4a5568',
                  marginBottom: '8px',
                  display: 'block'
                }}>
                  Emergency Contact
                </label>
                <input
                  type="tel"
                  value={settings.emergencyContact}
                  onChange={(e) => handleChange('emergencyContact', e.target.value)}
                  className={styles.searchInput}
                  style={{ marginBottom: '20px' }}
                />
              </div>

              <div className={styles.formGroup}>
                <label style={{ 
                  fontSize: '14px', 
                  fontWeight: '500', 
                  color: '#4a5568',
                  marginBottom: '8px',
                  display: 'block'
                }}>
                  Max Visits Per Day
                </label>
                <input
                  type="number"
                  value={settings.maxVisitsPerDay}
                  onChange={(e) => handleChange('maxVisitsPerDay', e.target.value)}
                  className={styles.searchInput}
                />
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div>
              <h2 style={{ 
                fontSize: '20px', 
                fontWeight: '600', 
                color: '#1a365d', 
                marginBottom: '24px' 
              }}>
                Notification Settings
              </h2>
              
              {[
                { key: 'emailNotifications', label: 'Email Notifications', desc: 'Send email notifications for appointments and updates' },
                { key: 'smsNotifications', label: 'SMS Notifications', desc: 'Send SMS notifications for urgent updates' },
                { key: 'appointmentReminders', label: 'Appointment Reminders', desc: 'Automatically send appointment reminders to patients' }
              ].map((item) => (
                <div key={item.key} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '20px 0',
                  borderBottom: '1px solid #e2e8f0'
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '14px', fontWeight: '500', color: '#1a365d', marginBottom: '4px' }}>
                      {item.label}
                    </div>
                    <div style={{ fontSize: '13px', color: '#718096' }}>
                      {item.desc}
                    </div>
                  </div>
                  <label style={{
                    position: 'relative',
                    display: 'inline-block',
                    width: '48px',
                    height: '24px'
                  }}>
                    <input
                      type="checkbox"
                      checked={settings[item.key]}
                      onChange={(e) => handleChange(item.key, e.target.checked)}
                      style={{ opacity: 0, width: 0, height: 0 }}
                    />
                    <span style={{
                      position: 'absolute',
                      cursor: 'pointer',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundColor: settings[item.key] ? '#1a365d' : '#cbd5e0',
                      transition: '0.3s',
                      borderRadius: '24px'
                    }}>
                      <span style={{
                        position: 'absolute',
                        content: '',
                        height: '18px',
                        width: '18px',
                        left: settings[item.key] ? '27px' : '3px',
                        bottom: '3px',
                        backgroundColor: 'white',
                        transition: '0.3s',
                        borderRadius: '50%'
                      }} />
                    </span>
                  </label>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'security' && (
            <div>
              <h2 style={{ 
                fontSize: '20px', 
                fontWeight: '600', 
                color: '#1a365d', 
                marginBottom: '24px' 
              }}>
                Security Settings
              </h2>
              
              <div className={styles.formGroup}>
                <label style={{ 
                  fontSize: '14px', 
                  fontWeight: '500', 
                  color: '#4a5568',
                  marginBottom: '8px',
                  display: 'block'
                }}>
                  Session Timeout (minutes)
                </label>
                <input
                  type="number"
                  value={settings.sessionTimeout}
                  onChange={(e) => handleChange('sessionTimeout', e.target.value)}
                  className={styles.searchInput}
                  style={{ marginBottom: '8px' }}
                />
                <p style={{ fontSize: '13px', color: '#718096', margin: '0 0 24px 0' }}>
                  Users will be automatically logged out after this period of inactivity
                </p>
              </div>

              <div style={{
                background: '#e6f2ff',
                border: '1px solid #1a365d',
                borderRadius: '8px',
                padding: '20px',
                marginBottom: '24px'
              }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1a365d', margin: '0 0 12px 0' }}>
                  Password Requirements
                </h3>
                <ul style={{ margin: 0, paddingLeft: '20px', color: '#4a5568' }}>
                  <li style={{ marginBottom: '8px' }}>Minimum 6 characters</li>
                  <li style={{ marginBottom: '8px' }}>Must contain letters and numbers</li>
                  <li>Password expires every 90 days</li>
                </ul>
              </div>

              <div style={{
                background: '#fff5f5',
                border: '1px solid #e53e3e',
                borderRadius: '8px',
                padding: '20px'
              }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#c53030', margin: '0 0 16px 0' }}>
                  Danger Zone
                </h3>
                <button style={{
                  width: '100%',
                  padding: '12px 24px',
                  background: '#e53e3e',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  marginBottom: '12px'
                }}>
                  Reset All User Passwords
                </button>
                <button style={{
                  width: '100%',
                  padding: '12px 24px',
                  background: '#e53e3e',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}>
                  Clear All Sessions
                </button>
              </div>
            </div>
          )}

          {activeTab === 'backup' && (
            <div>
              <h2 style={{ 
                fontSize: '20px', 
                fontWeight: '600', 
                color: '#1a365d', 
                marginBottom: '24px' 
              }}>
                Backup Settings
              </h2>
              
              <div className={styles.formGroup}>
                <label style={{ 
                  fontSize: '14px', 
                  fontWeight: '500', 
                  color: '#4a5568',
                  marginBottom: '8px',
                  display: 'block'
                }}>
                  Backup Frequency
                </label>
                <select
                  value={settings.backupFrequency}
                  onChange={(e) => handleChange('backupFrequency', e.target.value)}
                  className={styles.filterSelect}
                  style={{ marginBottom: '24px', width: '100%' }}
                >
                  <option value="hourly">Hourly</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>

              <div style={{
                background: '#f7fafc',
                borderRadius: '8px',
                padding: '20px',
                marginBottom: '24px'
              }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1a365d', margin: '0 0 12px 0' }}>
                  Last Backup
                </h3>
                <p style={{ fontSize: '14px', color: '#4a5568', margin: '8px 0' }}>
                  December 31, 2025 - 8:00 AM
                </p>
                <p style={{ fontSize: '14px', color: '#38a169', margin: '8px 0', fontWeight: '500' }}>
                  ✓ Backup completed successfully
                </p>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button style={{
                  flex: 1,
                  padding: '12px 24px',
                  background: 'linear-gradient(135deg, #1a365d 0%, #2d3748 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}>
                  Backup Now
                </button>
                <button style={{
                  flex: 1,
                  padding: '12px 24px',
                  background: '#e2e8f0',
                  color: '#4a5568',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}>
                  View Backup History
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer Actions */}
      <div style={{
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '12px',
        padding: '24px 0'
      }}>
        <button
          onClick={() => window.history.back()}
          style={{
            padding: '12px 24px',
            background: '#e2e8f0',
            color: '#4a5568',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '500',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <FontAwesomeIcon icon={faTimes} /> Cancel
        </button>
        <button
          onClick={handleSave}
          className={styles.addButton}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <FontAwesomeIcon icon={faSave} /> Save Settings
        </button>
      </div>
    </div>
  );
};

export default SettingsManagement;
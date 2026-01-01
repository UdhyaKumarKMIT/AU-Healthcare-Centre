// src/pages/admin/SettingsManagement.jsx
import React, { useState } from 'react';
import styles from './SettingsManagement.module.css';

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
    <div className={styles.settingsContainer}>
      <div className={styles.header}>
        <h1 className={styles.title}>⚙️ System Settings</h1>
        <p className={styles.subtitle}>
          Configure system preferences and settings
        </p>
      </div>

      <div className={styles.tabsContainer}>
        <button
          className={`${styles.tab} ${activeTab === 'general' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('general')}
        >
          General
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'notifications' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('notifications')}
        >
          Notifications
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'security' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('security')}
        >
          Security
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'backup' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('backup')}
        >
          Backup
        </button>
      </div>

      <div className={styles.settingsContent}>
        {activeTab === 'general' && (
          <div className={styles.settingsSection}>
            <h2>General Settings</h2>
            
            <div className={styles.formGroup}>
              <label>Hospital Name</label>
              <input
                type="text"
                value={settings.hospitalName}
                onChange={(e) => handleChange('hospitalName', e.target.value)}
                className={styles.input}
              />
            </div>

            <div className={styles.formGroup}>
              <label>Hospital Email</label>
              <input
                type="email"
                value={settings.hospitalEmail}
                onChange={(e) => handleChange('hospitalEmail', e.target.value)}
                className={styles.input}
              />
            </div>

            <div className={styles.formGroup}>
              <label>Hospital Phone</label>
              <input
                type="tel"
                value={settings.hospitalPhone}
                onChange={(e) => handleChange('hospitalPhone', e.target.value)}
                className={styles.input}
              />
            </div>

            <div className={styles.formGroup}>
              <label>Address</label>
              <textarea
                value={settings.address}
                onChange={(e) => handleChange('address', e.target.value)}
                className={styles.textarea}
                rows="3"
              />
            </div>

            <div className={styles.formGroup}>
              <label>Working Hours</label>
              <input
                type="text"
                value={settings.workingHours}
                onChange={(e) => handleChange('workingHours', e.target.value)}
                className={styles.input}
              />
            </div>

            <div className={styles.formGroup}>
              <label>Emergency Contact</label>
              <input
                type="tel"
                value={settings.emergencyContact}
                onChange={(e) => handleChange('emergencyContact', e.target.value)}
                className={styles.input}
              />
            </div>

            <div className={styles.formGroup}>
              <label>Max Visits Per Day</label>
              <input
                type="number"
                value={settings.maxVisitsPerDay}
                onChange={(e) => handleChange('maxVisitsPerDay', e.target.value)}
                className={styles.input}
              />
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className={styles.settingsSection}>
            <h2>Notification Settings</h2>
            
            <div className={styles.switchGroup}>
              <div className={styles.switchLabel}>
                <span>Email Notifications</span>
                <p className={styles.switchDescription}>
                  Send email notifications for appointments and updates
                </p>
              </div>
              <label className={styles.switch}>
                <input
                  type="checkbox"
                  checked={settings.emailNotifications}
                  onChange={(e) => handleChange('emailNotifications', e.target.checked)}
                />
                <span className={styles.slider}></span>
              </label>
            </div>

            <div className={styles.switchGroup}>
              <div className={styles.switchLabel}>
                <span>SMS Notifications</span>
                <p className={styles.switchDescription}>
                  Send SMS notifications for urgent updates
                </p>
              </div>
              <label className={styles.switch}>
                <input
                  type="checkbox"
                  checked={settings.smsNotifications}
                  onChange={(e) => handleChange('smsNotifications', e.target.checked)}
                />
                <span className={styles.slider}></span>
              </label>
            </div>

            <div className={styles.switchGroup}>
              <div className={styles.switchLabel}>
                <span>Appointment Reminders</span>
                <p className={styles.switchDescription}>
                  Automatically send appointment reminders to patients
                </p>
              </div>
              <label className={styles.switch}>
                <input
                  type="checkbox"
                  checked={settings.appointmentReminders}
                  onChange={(e) => handleChange('appointmentReminders', e.target.checked)}
                />
                <span className={styles.slider}></span>
              </label>
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className={styles.settingsSection}>
            <h2>Security Settings</h2>
            
            <div className={styles.formGroup}>
              <label>Session Timeout (minutes)</label>
              <input
                type="number"
                value={settings.sessionTimeout}
                onChange={(e) => handleChange('sessionTimeout', e.target.value)}
                className={styles.input}
              />
              <p className={styles.hint}>
                Users will be automatically logged out after this period of inactivity
              </p>
            </div>

            <div className={styles.infoBox}>
              <h3>Password Requirements</h3>
              <ul>
                <li>Minimum 6 characters</li>
                <li>Must contain letters and numbers</li>
                <li>Password expires every 90 days</li>
              </ul>
            </div>

            <div className={styles.dangerZone}>
              <h3>Danger Zone</h3>
              <button className={styles.dangerButton}>
                Reset All User Passwords
              </button>
              <button className={styles.dangerButton}>
                Clear All Sessions
              </button>
            </div>
          </div>
        )}

        {activeTab === 'backup' && (
          <div className={styles.settingsSection}>
            <h2>Backup Settings</h2>
            
            <div className={styles.formGroup}>
              <label>Backup Frequency</label>
              <select
                value={settings.backupFrequency}
                onChange={(e) => handleChange('backupFrequency', e.target.value)}
                className={styles.select}
              >
                <option value="hourly">Hourly</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>

            <div className={styles.backupInfo}>
              <h3>Last Backup</h3>
              <p>December 31, 2025 - 8:00 AM</p>
              <p className={styles.success}>✓ Backup completed successfully</p>
            </div>

            <div className={styles.actionButtons}>
              <button className={styles.primaryButton}>
                Backup Now
              </button>
              <button className={styles.secondaryButton}>
                View Backup History
              </button>
            </div>
          </div>
        )}
      </div>

      <div className={styles.footer}>
        <button className={styles.saveButton} onClick={handleSave}>
          Save Settings
        </button>
        <button className={styles.cancelButton}>
          Cancel
        </button>
      </div>
    </div>
  );
};

export default SettingsManagement;
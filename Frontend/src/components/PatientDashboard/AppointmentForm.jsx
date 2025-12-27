// src/components/PatientDashboard/AppointmentForm.jsx
import React, { useState } from 'react';
import styles from './PatientDashboard.module.css';

const AppointmentForm = ({ patientStatus, patientInfo, onSubmit, onCancel, loading }) => {
  const [formData, setFormData] = useState({
    patientName: patientInfo?.name || '',
    age: patientInfo?.age || '',
    gender: patientInfo?.gender || '',
    phone: patientInfo?.phone || '',
    appointmentType: 'general',
    reason: '',
    preferredDate: '',
    preferredTime: '',
    
    // Vitals (for new patients or updated vitals)
    bloodPressure: patientInfo?.vitals?.bloodPressure || '',
    temperature: patientInfo?.vitals?.temperature || '',
    pulse: patientInfo?.vitals?.pulse || '',
    weight: patientInfo?.vitals?.weight || '',
    height: patientInfo?.vitals?.height || '',
    symptoms: '',
  });

  const appointmentTypes = [
    { value: 'general', label: 'General Consultation' },
    { value: 'followup', label: 'Follow-up Visit' },
    { value: 'emergency', label: 'Emergency' },
    { value: 'routine', label: 'Routine Checkup' },
    { value: 'specialist', label: 'Specialist Consultation' },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.appointmentType || !formData.reason || !formData.preferredDate) {
      alert('Please fill in all required fields');
      return;
    }

    if (patientStatus === 'new' && (!formData.patientName || !formData.age || !formData.gender)) {
      alert('Please provide your basic information');
      return;
    }

    onSubmit(formData);
  };

  const isNewPatient = patientStatus === 'new';

  return (
    <main className={styles.mainContent}>
      <header className={styles.header}>
        <button className={styles.backBtn} onClick={onCancel}>
          ← Back to Dashboard
        </button>
        <div className={styles.headerInfo}>
          <h1 className={styles.title}>Book Appointment</h1>
          <div className={styles.patientType}>
            {isNewPatient ? 'New Patient Registration' : 'Returning Patient Appointment'}
          </div>
        </div>
      </header>

      <form className={styles.appointmentForm} onSubmit={handleSubmit}>
        {/* Patient Information Section */}
        <div className={styles.formSection}>
          <h2 className={styles.formSectionTitle}>
            {isNewPatient ? 'Patient Information' : 'Update Your Information'}
          </h2>
          
          {isNewPatient && (
            <p className={styles.formNote}>
              As a new patient, please provide your basic information
            </p>
          )}

          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                Full Name {isNewPatient && <span className={styles.required}>*</span>}
              </label>
              <input
                type="text"
                name="patientName"
                value={formData.patientName}
                onChange={handleChange}
                className={styles.formInput}
                placeholder="Enter your full name"
                required={isNewPatient}
                readOnly={!isNewPatient}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                Age {isNewPatient && <span className={styles.required}>*</span>}
              </label>
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleChange}
                className={styles.formInput}
                placeholder="Enter your age"
                required={isNewPatient}
                readOnly={!isNewPatient}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                Gender {isNewPatient && <span className={styles.required}>*</span>}
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className={styles.formSelect}
                required={isNewPatient}
                disabled={!isNewPatient}
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={styles.formInput}
                placeholder="Enter phone number"
              />
            </div>
          </div>
        </div>

        {/* Vitals Section */}
        <div className={styles.formSection}>
          <h2 className={styles.formSectionTitle}>Current Vitals</h2>
          <p className={styles.formNote}>
            Please provide your current vitals (optional but recommended)
          </p>

          <div className={styles.vitalsGrid}>
            <div className={styles.vitalInput}>
              <label className={styles.formLabel}>Blood Pressure</label>
              <input
                type="text"
                name="bloodPressure"
                value={formData.bloodPressure}
                onChange={handleChange}
                className={styles.formInput}
                placeholder="e.g., 120/80"
              />
            </div>

            <div className={styles.vitalInput}>
              <label className={styles.formLabel}>Temperature (°C)</label>
              <input
                type="number"
                step="0.1"
                name="temperature"
                value={formData.temperature}
                onChange={handleChange}
                className={styles.formInput}
                placeholder="e.g., 36.6"
              />
            </div>

            <div className={styles.vitalInput}>
              <label className={styles.formLabel}>Pulse Rate (bpm)</label>
              <input
                type="number"
                name="pulse"
                value={formData.pulse}
                onChange={handleChange}
                className={styles.formInput}
                placeholder="e.g., 72"
              />
            </div>

            <div className={styles.vitalInput}>
              <label className={styles.formLabel}>Weight (kg)</label>
              <input
                type="number"
                step="0.1"
                name="weight"
                value={formData.weight}
                onChange={handleChange}
                className={styles.formInput}
                placeholder="e.g., 65"
              />
            </div>

            <div className={styles.vitalInput}>
              <label className={styles.formLabel}>Height (cm)</label>
              <input
                type="number"
                name="height"
                value={formData.height}
                onChange={handleChange}
                className={styles.formInput}
                placeholder="e.g., 170"
              />
            </div>
          </div>
        </div>

        {/* Appointment Details Section */}
        <div className={styles.formSection}>
          <h2 className={styles.formSectionTitle}>Appointment Details</h2>

          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                Appointment Type <span className={styles.required}>*</span>
              </label>
              <select
                name="appointmentType"
                value={formData.appointmentType}
                onChange={handleChange}
                className={styles.formSelect}
                required
              >
                {appointmentTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                Preferred Date <span className={styles.required}>*</span>
              </label>
              <input
                type="date"
                name="preferredDate"
                value={formData.preferredDate}
                onChange={handleChange}
                className={styles.formInput}
                required
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                Preferred Time <span className={styles.required}>*</span>
              </label>
              <select
                name="preferredTime"
                value={formData.preferredTime}
                onChange={handleChange}
                className={styles.formSelect}
                required
              >
                <option value="">Select Time</option>
                <option value="09:00">09:00 AM</option>
                <option value="10:00">10:00 AM</option>
                <option value="11:00">11:00 AM</option>
                <option value="12:00">12:00 PM</option>
                <option value="14:00">02:00 PM</option>
                <option value="15:00">03:00 PM</option>
                <option value="16:00">04:00 PM</option>
                <option value="17:00">05:00 PM</option>
              </select>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              Reason for Visit <span className={styles.required}>*</span>
            </label>
            <textarea
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              className={styles.formTextarea}
              placeholder="Please describe the reason for your visit..."
              rows={4}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Symptoms (Optional)</label>
            <textarea
              name="symptoms"
              value={formData.symptoms}
              onChange={handleChange}
              className={styles.formTextarea}
              placeholder="List any symptoms you're experiencing..."
              rows={3}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.checkboxLabel}>
              <input type="checkbox" required />
              <span>I confirm that the information provided is accurate</span>
            </label>
          </div>
        </div>

        {/* Form Actions */}
        <div className={styles.formActions}>
          <button
            type="button"
            className={styles.cancelBtn}
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className={styles.submitBtn}
            disabled={loading}
          >
            {loading ? 'Booking...' : 'Book Appointment'}
          </button>
        </div>
      </form>
    </main>
  );
};

export default AppointmentForm;
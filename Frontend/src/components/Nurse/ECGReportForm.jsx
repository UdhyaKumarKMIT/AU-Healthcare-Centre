import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeartbeat } from '@fortawesome/free-solid-svg-icons';
import styles from './NurseDashboard.module.css';

const ECGReportForm = ({ ecgReport, onChange }) => {
  const handleChange = (field, value) => {
    onChange({ ...ecgReport, [field]: value });
  };

  return (
    <div className={styles.infoSection}>
      <h4>
        <FontAwesomeIcon icon={faHeartbeat} /> ECG Report
      </h4>
      <div className={styles.ecgForm}>
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label>Heart Rate (bpm)</label>
            <input
              type="number"
              value={ecgReport.heartRate}
              onChange={(e) => handleChange('heartRate', e.target.value)}
              className={styles.input}
              placeholder="72"
            />
          </div>
          <div className={styles.formGroup}>
            <label>Rhythm</label>
            <select
              value={ecgReport.rhythm}
              onChange={(e) => handleChange('rhythm', e.target.value)}
              className={styles.select}
            >
              <option value="NORMAL_SINUS_RHYTHM">Normal Sinus Rhythm</option>
              <option value="SINUS_TACHYCARDIA">Sinus Tachycardia</option>
              <option value="SINUS_BRADYCARDIA">Sinus Bradycardia</option>
              <option value="ATRIAL_FIBRILLATION">Atrial Fibrillation</option>
              <option value="VENTRICULAR_TACHYCARDIA">Ventricular Tachycardia</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
        </div>
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label>PR Interval (ms)</label>
            <input
              type="number"
              value={ecgReport.prInterval}
              onChange={(e) => handleChange('prInterval', e.target.value)}
              className={styles.input}
              placeholder="120-200"
            />
          </div>
          <div className={styles.formGroup}>
            <label>QRS Duration (ms)</label>
            <input
              type="number"
              value={ecgReport.qrsDuration}
              onChange={(e) => handleChange('qrsDuration', e.target.value)}
              className={styles.input}
              placeholder="80-120"
            />
          </div>
          <div className={styles.formGroup}>
            <label>QT Interval (ms)</label>
            <input
              type="number"
              value={ecgReport.qtInterval}
              onChange={(e) => handleChange('qtInterval', e.target.value)}
              className={styles.input}
              placeholder="350-450"
            />
          </div>
        </div>
        <div className={styles.formGroup}>
          <label>Axis</label>
          <select
            value={ecgReport.axis}
            onChange={(e) => handleChange('axis', e.target.value)}
            className={styles.select}
          >
            <option value="NORMAL">Normal Axis</option>
            <option value="LEFT_AXIS_DEVIATION">Left Axis Deviation</option>
            <option value="RIGHT_AXIS_DEVIATION">Right Axis Deviation</option>
            <option value="EXTREME_RIGHT_AXIS">Extreme Right Axis</option>
          </select>
        </div>
        <div className={styles.formGroup}>
          <label>Findings</label>
          <textarea
            value={ecgReport.findings}
            onChange={(e) => handleChange('findings', e.target.value)}
            className={styles.textarea}
            rows={3}
            placeholder="Describe ECG findings..."
          />
        </div>
        <div className={styles.formGroup}>
          <label>Interpretation</label>
          <textarea
            value={ecgReport.interpretation}
            onChange={(e) => handleChange('interpretation', e.target.value)}
            className={styles.textarea}
            rows={2}
            placeholder="Clinical interpretation..."
          />
        </div>
      </div>
    </div>
  );
};

export default ECGReportForm;
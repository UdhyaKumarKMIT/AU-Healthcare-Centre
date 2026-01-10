import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faFileAlt } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import ECGReportForm from './ECGReportForm';
import StockSelection from './StockSelection';
import SecretCodeInput from './SecretCodeInput';
import {
  completeTask,
  selectIsTaskDetailsLoading,
  selectIsCompletingTask
} from '../../store/slices/nurseSlice';
import styles from './NurseDashboard.module.css';

const TaskDetailsModal = ({
  taskDetails,
  availableStock,
  activeTask,
  onClose,
  onComplete
}) => {
  const dispatch = useDispatch();
  const isTaskDetailsLoading = useSelector(selectIsTaskDetailsLoading);
  const isCompletingTask = useSelector(selectIsCompletingTask);

  const [selectedMedications, setSelectedMedications] = useState([]);
  const [observation, setObservation] = useState('');
  const [remarks, setRemarks] = useState('');
  const [secretCode, setSecretCode] = useState('');
  const [isCodeValid, setIsCodeValid] = useState(null);
  const [ecgReport, setEcgReport] = useState({
    heartRate: '',
    rhythm: 'NORMAL_SINUS_RHYTHM',
    prInterval: '',
    qrsDuration: '',
    qtInterval: '',
    axis: 'NORMAL',
    findings: '',
    interpretation: ''
  });

  const isECGTask = taskDetails?.task_type?.toLowerCase().includes('ecg');

  const toggleMedicationSelection = (med, quantity) => {
    setSelectedMedications(prev => {
      const exists = prev.find(
        m => m.medicine_id === med.medicine_id && m.batch_no === med.batch_no
      );
      if (exists) {
        return prev.filter(
          m => !(m.medicine_id === med.medicine_id && m.batch_no === med.batch_no)
        );
      } else {
        return [...prev, {
          medicine_id: med.medicine_id,
          batch_no: med.batch_no,
          quantity: quantity || 1,
          medicine_name: med.medicine_name
        }];
      }
    });
  };

  const updateMedicationQuantity = (medicine_id, batch_no, quantity) => {
    setSelectedMedications(prev =>
      prev.map(m =>
        (m.medicine_id === medicine_id && m.batch_no === batch_no)
          ? { ...m, quantity: parseInt(quantity) || 1 }
          : m
      )
    );
  };

  const handleCompleteTask = async () => {
    if (!secretCode) {
      toast.error('Please enter your secret code');
      return;
    }
    if (isCodeValid !== true) {
      toast.error('Please enter a valid staff code');
      return;
    }
    if (!observation.trim()) {
      toast.error('Please add observation notes');
      return;
    }

    if (selectedMedications.length === 0 && !isECGTask) {
      if (!confirm('No medications selected. Continue without stock reduction?')) {
        return;
      }
    }

    const payload = {
      observation,
      remarks: remarks.trim() || null,
      medications_used: selectedMedications,
      secret_code: secretCode
    };

    if (isECGTask) {
      payload.ecg_report = {
        heart_rate: ecgReport.heartRate,
        rhythm: ecgReport.rhythm,
        pr_interval: ecgReport.prInterval,
        qrs_duration: ecgReport.qrsDuration,
        qt_interval: ecgReport.qtInterval,
        axis: ecgReport.axis,
        findings: ecgReport.findings,
        interpretation: ecgReport.interpretation
      };
    }

    const result = await dispatch(completeTask({
      taskId: activeTask.task_id,
      payload
    }));

    if (result.type === 'nurse/completeTask/fulfilled') {
      toast.success(
        `✓ Task completed! ${result.payload.medications_reduced || 0} medication(s) reduced from stock`
      );
      onComplete();
    } else {
      toast.error(result.payload || 'Failed to complete task');
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalLarge} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>{taskDetails.task_type}</h2>
          <button className={styles.closeButton} onClick={onClose}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
        
        <div className={styles.modalBody}>
          {isTaskDetailsLoading ? (
            <div className={styles.loading}>
              <div className={styles.spinner}></div>
              <p>Loading task details...</p>
            </div>
          ) : (
            <>
              {/* Patient Information */}
              <div className={styles.infoSection}>
                <h4>Patient Information</h4>
                <div className={styles.infoGrid}>
                  <div><strong>Name:</strong> {taskDetails.patient.name}</div>
                  <div><strong>Phone:</strong> {taskDetails.patient.phone}</div>
                  {taskDetails.patient.allergies && (
                    <div className={styles.allergyWarning}>
                      <strong>⚠️ Allergies:</strong> {taskDetails.patient.allergies}
                    </div>
                  )}
                </div>
              </div>

              {/* Prescribed Medications */}
              {taskDetails.medications && taskDetails.medications.length > 0 && (
                <div className={styles.infoSection}>
                  <h4>Prescribed Medications</h4>
                  {taskDetails.medications.map((med, idx) => (
                    <div key={idx} className={styles.medicationCard}>
                      <div><strong>{med.medicine_name || 'Medication'}</strong></div>
                      {med.dosage && <div>Dosage: {med.dosage}</div>}
                      {med.route && <div>Route: {med.route}</div>}
                      {med.remarks && <div>Note: {med.remarks}</div>}
                    </div>
                  ))}
                </div>
              )}

              {/* ECG Report Form */}
              {isECGTask && (
                <ECGReportForm ecgReport={ecgReport} onChange={setEcgReport} />
              )}

              {/* Stock Selection */}
              {!isECGTask && (
                <StockSelection
                  availableStock={availableStock}
                  selectedMedications={selectedMedications}
                  onToggleSelection={toggleMedicationSelection}
                  onUpdateQuantity={updateMedicationQuantity}
                />
              )}

              {/* Observation Notes */}
              <div className={styles.infoSection}>
                <h4>
                  <FontAwesomeIcon icon={faFileAlt} /> Observation / Notes
                </h4>
                <textarea
                  value={observation}
                  onChange={(e) => setObservation(e.target.value)}
                  className={styles.textarea}
                  placeholder="Enter your observation notes..."
                  rows={4}
                />
              </div>

              {/* Remarks */}
              <div className={styles.infoSection}>
                <h4>Remarks (Optional)</h4>
                <textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className={styles.textarea}
                  placeholder="Any additional remarks or follow-up notes..."
                  rows={2}
                />
              </div>

              {/* Secret Code */}
              <SecretCodeInput
                value={secretCode}
                onChange={setSecretCode}
                onValidationChange={setIsCodeValid}
              />
            </>
          )}
        </div>
        
        <div className={styles.modalFooter}>
          <button
            className={styles.cancelButton}
            onClick={onClose}
            disabled={isCompletingTask}
          >
            Cancel
          </button>
          <button
            className={styles.completeButton}
            onClick={handleCompleteTask}
            disabled={isCompletingTask || isTaskDetailsLoading || isCodeValid !== true}
          >
            {isCompletingTask ? 'Completing...' : 'Complete Task'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailsModal;
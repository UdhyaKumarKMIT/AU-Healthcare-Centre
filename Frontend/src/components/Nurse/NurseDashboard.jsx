import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSync, faTasks, faBoxes,
  faExchangeAlt, faCheckCircle, faClock,
  faHeartbeat, faFileAlt, faPills, faTimes,
  faCheck, faExclamationCircle
} from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../contexts/AuthContext';
import Header from '../../components/Header/Header';
import {
  fetchNurseTasks,
  fetchCompletedNurseTasks,
  fetchCompletedNurseTasksToday,
  fetchTaskDetails,
  fetchCompletedTaskDetails,
  completeTask,
  fetchAvailableStock,
  verifySecretCode,
  clearCurrentTask,
  clearCompletedTaskDetails,
  selectPendingTasks,
  selectCompletedTasks,
  selectCompletedTasksToday,
  selectCurrentTask,
  selectCompletedTaskDetails,
  selectStock,
  selectIsTasksLoading,
  selectIsTaskDetailsLoading,
  selectIsCompletingTask
} from '../../store/slices/nurseSlice';
import styles from './NurseDashboard.module.css';

function NurseDashboard() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, loading: authLoading, isAuthenticated } = useAuth();

  const pendingTasks = useSelector(selectPendingTasks);
  const completedTasks = useSelector(selectCompletedTasks);
  const completedTasksToday = useSelector(selectCompletedTasksToday);
  const taskDetails = useSelector(selectCurrentTask);
  const completedTaskDetails = useSelector(selectCompletedTaskDetails);
  const isTasksLoading = useSelector(selectIsTasksLoading);
  const isTaskDetailsLoading = useSelector(selectIsTaskDetailsLoading);
  const isCompletingTask = useSelector(selectIsCompletingTask);

  const [showModal, setShowModal] = useState(false);
  const [showCompletedDetailsModal, setShowCompletedDetailsModal] = useState(false);
  const [activeTask, setActiveTask] = useState(null);
  const [activeView, setActiveView] = useState("tasks");
  const [stockType, setStockType] = useState('NURSE');

  const availableStock = useSelector(selectStock(stockType));
  const [selectedMedications, setSelectedMedications] = useState([]);
  const [observation, setObservation] = useState('');
  const [remarks, setRemarks] = useState('');
  const [secretCode, setSecretCode] = useState('');

  const [isCodeValid, setIsCodeValid] = useState(null);
  const [isValidating, setIsValidating] = useState(false);

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

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [authLoading, isAuthenticated, navigate]);

  useEffect(() => {
    if (user && isAuthenticated) {
      dispatch(fetchNurseTasks());
      dispatch(fetchCompletedNurseTasks());
      dispatch(fetchCompletedNurseTasksToday());
      const interval = setInterval(() => {
        dispatch(fetchNurseTasks());
        dispatch(fetchCompletedNurseTasksToday());
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [user, isAuthenticated, dispatch]);

  useEffect(() => {
    if (secretCode.length >= 4) {
      setIsValidating(true);
      const timer = setTimeout(async () => {
        const result = await dispatch(verifySecretCode(secretCode));
        if (result.payload === true) {
          setIsCodeValid(true);
          toast.success('✓ Valid staff code', { autoClose: 2000 });
        } else {
          setIsCodeValid(false);
          toast.error('✗ Invalid staff code', { autoClose: 2000 });
        }
        setIsValidating(false);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setIsCodeValid(null);
    }
  }, [secretCode, dispatch]);

  const handleRefreshTasks = () => {
    dispatch(fetchNurseTasks());
    toast.info('Refreshing tasks...');
  };

  const loadTaskDetails = async (task) => {
    setActiveTask(task);
    setShowModal(true);
    setObservation('');
    setRemarks('');
    setSelectedMedications([]);
    setSecretCode('');
    setIsCodeValid(null);

    setEcgReport({
      heartRate: '',
      rhythm: 'NORMAL_SINUS_RHYTHM',
      prInterval: '',
      qrsDuration: '',
      qtInterval: '',
      axis: 'NORMAL',
      findings: '',
      interpretation: ''
    });

    const result = await dispatch(fetchTaskDetails(task.task_id));

    if (result.payload) {
      const isDressing = result.payload.task_type?.toLowerCase().includes('dressing');
      const stockTypeToLoad = isDressing ? 'DRESSING' : 'NURSE';
      setStockType(stockTypeToLoad);
      dispatch(fetchAvailableStock(stockTypeToLoad));
    }
  };

  const loadCompletedTaskDetails = async (task) => {
    setActiveTask(task);
    const result = await dispatch(fetchCompletedTaskDetails(task.task_id));
    if (result.type.includes('fulfilled')) {
      setShowCompletedDetailsModal(true);
    } else {
      toast.error('Failed to load task details');
    }
  };

  const handleStockTypeChange = (type) => {
    setStockType(type);
    dispatch(fetchAvailableStock(type));
  };

  const toggleMedicationSelection = (med, quantity) => {
    setSelectedMedications(prev => {
      const exists = prev.find(m => m.medicine_id === med.medicine_id && m.batch_no === med.batch_no);
      if (exists) {
        return prev.filter(m => !(m.medicine_id === med.medicine_id && m.batch_no === med.batch_no));
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

    const isECG = taskDetails?.task_type?.toLowerCase().includes('ecg');

    if (selectedMedications.length === 0 && !isECG) {
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

    if (isECG) {
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
      toast.success(`✓ Task completed! ${result.payload.medications_reduced || 0} medication(s) reduced from stock`);
      setShowModal(false);
      setActiveTask(null);
      setSecretCode('');
      dispatch(clearCurrentTask());
      dispatch(fetchNurseTasks());
      // Keep completed list + stat cards in sync immediately
      dispatch(fetchCompletedNurseTasks());
      dispatch(fetchCompletedNurseTasksToday());
    } else {
      toast.error(result.payload || 'Failed to complete task');
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setActiveTask(null);
    dispatch(clearCurrentTask());
  };

  const handleCloseCompletedModal = () => {
    setShowCompletedDetailsModal(false);
    setActiveTask(null);
    dispatch(clearCompletedTaskDetails());
  };

  const handleRoleSwap = () => {
    navigate('/reception');
  };

  if (authLoading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) return null;

  const isECGTask = taskDetails?.task_type?.toLowerCase().includes('ecg');

  return (
    <div className={styles.dashboard}>
      <Header />

      <div className={styles.roleSwapBar}>
        <div className={styles.roleSwapContainer}>
          <span className={styles.roleSwapText}>Switch Role:</span>
          <button className={styles.roleSwapButton} onClick={handleRoleSwap} title="Switch to Receptionist">
            <FontAwesomeIcon icon={faExchangeAlt} />
            <span>Receptionist Dashboard</span>
          </button>
        </div>
      </div>

      <div className={styles.container}>
        <div className={styles.pageHeader}>
          <div>
            <h1 className={styles.pageTitle}>Nurse Dashboard</h1>
            <p className={styles.pageSubtitle}>Welcome back, {user.name}</p>
          </div>

          <div className={styles.statsCards}>
            <div className={styles.statCard}>
              <div className={styles.statIcon} style={{ background: '#fee2e2', color: '#dc2626' }}>
                <FontAwesomeIcon icon={faClock} />
              </div>
              <div>
                <div className={styles.statValue}>{pendingTasks.length}</div>
                <div className={styles.statLabel}>Pending Tasks</div>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon} style={{ background: '#d1fae5', color: '#059669' }}>
                <FontAwesomeIcon icon={faCheckCircle} />
              </div>
              <div>
                <div className={styles.statValue}>{completedTasksToday.length}</div>
                <div className={styles.statLabel}>Completed Today</div>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.actionGrid}>
          <button className={`${styles.actionCard} ${activeView === 'tasks' ? styles.active : ''}`} onClick={() => setActiveView('tasks')}>
            <FontAwesomeIcon icon={faTasks} />
            <span>My Tasks</span>
          </button>
          <button className={`${styles.actionCard} ${activeView === 'stock' ? styles.active : ''}`} onClick={() => {
            setActiveView('stock');
            setStockType('NURSE');
            dispatch(fetchAvailableStock('NURSE'));
          }}>
            <FontAwesomeIcon icon={faBoxes} />
            <span>View Stock</span>
          </button>
        </div>

        {activeView === 'tasks' && (
          <div className={styles.tasksGrid}>
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h3>Pending Tasks ({pendingTasks.length})</h3>
                <button onClick={handleRefreshTasks} disabled={isTasksLoading} className={styles.refreshButton}>
                  <FontAwesomeIcon icon={faSync} spin={isTasksLoading} />
                  Refresh
                </button>
              </div>
              {pendingTasks.length === 0 ? (
                <div className={styles.emptyState}>
                  <p>No pending tasks</p>
                  <span>You're all caught up!</span>
                </div>
              ) : (
                <div className={styles.tasksList}>
                  {pendingTasks.map((task) => (
                    <div key={task.task_id} className={styles.taskCard}>
                      <div className={styles.taskHeader}>
                        <div className={styles.taskType}>{task.task_type}</div>
                        <div className={styles.taskStatus}>Pending</div>
                      </div>
                      <div className={styles.taskBody}>
                        {task.patient_name && <div className={styles.taskDetail}><strong>Patient:</strong> {task.patient_name}</div>}
                        {task.reason && <div className={styles.taskDetail}><strong>Reason:</strong> {task.reason}</div>}
                        {task.doctor_name && <div className={styles.taskDetail}><strong>Doctor:</strong> Dr. {task.doctor_name}</div>}
                      </div>
                      <button className={styles.viewButton} onClick={() => loadTaskDetails(task)}>View Details & Complete</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h3>Completed Tasks ({completedTasks.length})</h3>
              </div>
              {completedTasks.length === 0 ? (
                <div className={styles.emptyState}><p>No completed tasks yet</p></div>
              ) : (
                <div className={styles.tasksList}>
                  {completedTasks.map((task) => (
                    <div key={task.task_id} className={styles.taskCardCompleted}>
                      <div className={styles.taskHeader}>
                        <div className={styles.taskType}>{task.task_type}</div>
                        <div className={styles.taskStatusCompleted}>✓ Completed</div>
                      </div>
                      <div className={styles.taskBody}>
                        {task.patient_name && <div className={styles.taskDetail}><strong>Patient:</strong> {task.patient_name}</div>}
                        {task.completed_at && <div className={styles.taskDetail}><strong>Completed:</strong> {new Date(task.completed_at).toLocaleString()}</div>}
                      </div>
                      <button className={styles.viewDetailsButton} onClick={() => loadCompletedTaskDetails(task)}>View Details</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeView === 'stock' && (
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h3>Available Stock</h3>
              <div className={styles.stockFilters}>
                <button onClick={() => handleStockTypeChange('NURSE')} className={styles.filterBtn} style={stockType === 'NURSE' ? { background: '#e2e8f0', color: '#1a237e' } : {}}>Nurse Stock</button>
                <button onClick={() => handleStockTypeChange('DRESSING')} className={styles.filterBtn} style={stockType === 'DRESSING' ? { background: '#e2e8f0', color: '#1a237e' } : {}}>Dressing Stock</button>
              </div>
            </div>
            {availableStock.length === 0 ? (
              <div className={styles.emptyState}><p>No stock available</p></div>
            ) : (
              <div className={styles.stockTable}>
                <table>
                  <thead>
                    <tr>
                      <th>Medicine Name</th>
                      <th>Type</th>
                      <th>Batch No</th>
                      <th>Expiry</th>
                      <th>Quantity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {availableStock.map((stock) => (
                      <tr key={stock.sub_stock_id}>
                        <td>{stock.medicine_name}</td>
                        <td>{stock.medicine_type}</td>
                        <td>{stock.batch_no}</td>
                        <td>{new Date(stock.expiry).toLocaleDateString()}</td>
                        <td><span className={styles.quantityBadge}>{stock.quantity}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {showModal && activeTask && taskDetails && (
        <div className={styles.modalOverlay} onClick={handleCloseModal}>
          <div className={styles.modalLarge} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>{taskDetails.task_type}</h2>
              <button className={styles.closeButton} onClick={handleCloseModal}><FontAwesomeIcon icon={faTimes} /></button>
            </div>
            <div className={styles.modalBody}>
              {isTaskDetailsLoading ? (
                <div className={styles.loading}>
                  <div className={styles.spinner}></div>
                  <p>Loading task details...</p>
                </div>
              ) : (
                <>
                  <div className={styles.infoSection}>
                    <h4>Patient Information</h4>
                    <div className={styles.infoGrid}>
                      <div><strong>Name:</strong> {taskDetails.patient.name}</div>
                      <div><strong>Phone:</strong> {taskDetails.patient.phone}</div>
                      {taskDetails.patient.allergies && (
                        <div className={styles.allergyWarning}><strong>⚠️ Allergies:</strong> {taskDetails.patient.allergies}</div>
                      )}
                    </div>
                  </div>

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

                  {isECGTask && (
                    <div className={styles.infoSection}>
                      <h4><FontAwesomeIcon icon={faHeartbeat} /> ECG Report</h4>
                      <div className={styles.ecgForm}>
                        <div className={styles.formRow}>
                          <div className={styles.formGroup}>
                            <label>Heart Rate (bpm)</label>
                            <input type="number" value={ecgReport.heartRate} onChange={(e) => setEcgReport({ ...ecgReport, heartRate: e.target.value })} className={styles.input} placeholder="72" />
                          </div>
                          <div className={styles.formGroup}>
                            <label>Rhythm</label>
                            <select value={ecgReport.rhythm} onChange={(e) => setEcgReport({ ...ecgReport, rhythm: e.target.value })} className={styles.select}>
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
                            <input type="number" value={ecgReport.prInterval} onChange={(e) => setEcgReport({ ...ecgReport, prInterval: e.target.value })} className={styles.input} placeholder="120-200" />
                          </div>
                          <div className={styles.formGroup}>
                            <label>QRS Duration (ms)</label>
                            <input type="number" value={ecgReport.qrsDuration} onChange={(e) => setEcgReport({ ...ecgReport, qrsDuration: e.target.value })} className={styles.input} placeholder="80-120" />
                          </div>
                          <div className={styles.formGroup}>
                            <label>QT Interval (ms)</label>
                            <input type="number" value={ecgReport.qtInterval} onChange={(e) => setEcgReport({ ...ecgReport, qtInterval: e.target.value })} className={styles.input} placeholder="350-450" />
                          </div>
                        </div>
                        <div className={styles.formGroup}>
                          <label>Axis</label>
                          <select value={ecgReport.axis} onChange={(e) => setEcgReport({ ...ecgReport, axis: e.target.value })} className={styles.select}>
                            <option value="NORMAL">Normal Axis</option>
                            <option value="LEFT_AXIS_DEVIATION">Left Axis Deviation</option>
                            <option value="RIGHT_AXIS_DEVIATION">Right Axis Deviation</option>
                            <option value="EXTREME_RIGHT_AXIS">Extreme Right Axis</option>
                          </select>
                        </div>
                        <div className={styles.formGroup}>
                          <label>Findings</label>
                          <textarea value={ecgReport.findings} onChange={(e) => setEcgReport({ ...ecgReport, findings: e.target.value })} className={styles.textarea} rows={3} placeholder="Describe ECG findings..." />
                        </div>
                        <div className={styles.formGroup}>
                          <label>Interpretation</label>
                          <textarea value={ecgReport.interpretation} onChange={(e) => setEcgReport({ ...ecgReport, interpretation: e.target.value })} className={styles.textarea} rows={2} placeholder="Clinical interpretation..." />
                        </div>
                      </div>
                    </div>
                  )}

                  {!isECGTask && (
                    <div className={styles.infoSection}>
                      <h4><FontAwesomeIcon icon={faPills} /> Select Stock Used</h4>
                      {availableStock.length === 0 ? (
                        <p className={styles.noStock}>No stock available</p>
                      ) : (
                        <div className={styles.stockSelection}>
                          {availableStock.map((stock) => {
                            const isSelected = selectedMedications.some(m => m.medicine_id === stock.medicine_id && m.batch_no === stock.batch_no);
                            const selectedMed = selectedMedications.find(m => m.medicine_id === stock.medicine_id && m.batch_no === stock.batch_no);
                            return (
                              <div key={stock.sub_stock_id} className={styles.stockItem}>
                                <label className={styles.stockLabel}>
                                  <input type="checkbox" checked={isSelected} onChange={() => toggleMedicationSelection(stock, 1)} />
                                  <div className={styles.stockInfo}>
                                    <strong>{stock.medicine_name}</strong>
                                    <span className={styles.stockMeta}>Batch: {stock.batch_no} | Available: {stock.quantity}</span>
                                  </div>
                                </label>
                                {isSelected && (
                                  <input type="number" min="1" max={stock.quantity} value={selectedMed?.quantity || 1} onChange={(e) => updateMedicationQuantity(stock.medicine_id, stock.batch_no, e.target.value)} className={styles.quantityInput} />
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  <div className={styles.infoSection}>
                    <h4><FontAwesomeIcon icon={faFileAlt} /> Observation / Notes</h4>
                    <textarea value={observation} onChange={(e) => setObservation(e.target.value)} className={styles.textarea} placeholder="Enter your observation notes..." rows={4} />
                  </div>

                  <div className={styles.infoSection}>
                    <h4>Remarks (Optional)</h4>
                    <textarea value={remarks} onChange={(e) => setRemarks(e.target.value)} className={styles.textarea} placeholder="Any additional remarks or follow-up notes..." rows={2} />
                  </div>

                  <div className={styles.infoSection}>
                    <h4>Secret Code</h4>
                    <div className={styles.codeInputWrapper}>
                      <input type="password" value={secretCode} onChange={(e) => setSecretCode(e.target.value)} className={`${styles.input} ${isCodeValid === true ? styles.inputValid : isCodeValid === false ? styles.inputInvalid : ''}`} placeholder="Enter your secret code to confirm" />
                      {isValidating && <div className={styles.validatingSpinner}><div className={styles.smallSpinner}></div></div>}
                      {isCodeValid === true && <FontAwesomeIcon icon={faCheck} className={styles.validIcon} />}
                      {isCodeValid === false && <FontAwesomeIcon icon={faExclamationCircle} className={styles.invalidIcon} />}
                    </div>
                  </div>
                </>
              )}
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.cancelButton} onClick={handleCloseModal} disabled={isCompletingTask}>Cancel</button>
              <button className={styles.completeButton} onClick={handleCompleteTask} disabled={isCompletingTask || isTaskDetailsLoading || isCodeValid !== true}>
                {isCompletingTask ? 'Completing...' : 'Complete Task'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showCompletedDetailsModal && activeTask && completedTaskDetails && (
        <div className={styles.modalOverlay} onClick={handleCloseCompletedModal}>
          <div className={styles.modalLarge} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>{completedTaskDetails.task_type} - Completed</h2>
              <button className={styles.closeButton} onClick={handleCloseCompletedModal}><FontAwesomeIcon icon={faTimes} /></button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.infoSection}>
                <h4>Patient Information</h4>
                <div className={styles.infoGrid}>
                  <div><strong>Name:</strong> {completedTaskDetails.patient?.name}</div>
                  <div><strong>Phone:</strong> {completedTaskDetails.patient?.phone}</div>
                  {completedTaskDetails.completed_at && <div><strong>Completed At:</strong> {new Date(completedTaskDetails.completed_at).toLocaleString()}</div>}
                </div>
              </div>
              {completedTaskDetails.medications_used && completedTaskDetails.medications_used.length > 0 && (
                <div className={styles.infoSection}>
                  <h4><FontAwesomeIcon icon={faPills} /> Medications Used</h4>
                  {completedTaskDetails.medications_used.map((med, idx) => (
                    <div key={idx} className={styles.medicationCard}>
                      <div><strong>{med.medicine_name}</strong></div>
                      <div>Quantity: {med.quantity}</div>
                      {med.batch_no && <div>Batch: {med.batch_no}</div>}
                    </div>
                  ))}
                </div>
              )}
              {completedTaskDetails.ecg_report && (
                <div className={styles.infoSection}>
                  <h4><FontAwesomeIcon icon={faHeartbeat} /> ECG Report</h4>
                  <div className={styles.ecgReportView}>
                    <div className={styles.reportRow}>
                      <span><strong>Heart Rate:</strong> {completedTaskDetails.ecg_report.heart_rate} bpm</span>
                      <span><strong>Rhythm:</strong> {completedTaskDetails.ecg_report.rhythm?.replace(/_/g, ' ')}</span>
                    </div>
                    <div className={styles.reportRow}>
                      <span><strong>PR Interval:</strong> {completedTaskDetails.ecg_report.pr_interval} ms</span>
                      <span><strong>QRS Duration:</strong> {completedTaskDetails.ecg_report.qrs_duration} ms</span>
                      <span><strong>QT Interval:</strong> {completedTaskDetails.ecg_report.qt_interval} ms</span>
                    </div>
                    <div className={styles.reportRow}>
                      <span><strong>Axis:</strong> {completedTaskDetails.ecg_report.axis?.replace(/_/g, ' ')}</span>
                    </div>
                    {completedTaskDetails.ecg_report.findings && (
                      <div className={styles.reportSection}>
                        <strong>Findings:</strong>
                        <p>{completedTaskDetails.ecg_report.findings}</p>
                      </div>
                    )}
                    {completedTaskDetails.ecg_report.interpretation && (
                      <div className={styles.reportSection}>
                        <strong>Interpretation:</strong>
                        <p>{completedTaskDetails.ecg_report.interpretation}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
              {completedTaskDetails.observation && (
                <div className={styles.infoSection}>
                  <h4><FontAwesomeIcon icon={faFileAlt} /> Observation</h4>
                  <p className={styles.observationText}>{completedTaskDetails.observation}</p>
                </div>
              )}
              {completedTaskDetails.remarks && (
                <div className={styles.infoSection}>
                  <h4>Remarks</h4>
                  <p className={styles.remarksText}>{completedTaskDetails.remarks}</p>
                </div>
              )}
              {completedTaskDetails.completed_by && (
                <div className={styles.infoSection}>
                  <div className={styles.completedBy}>
                    <strong>Completed by:</strong> {completedTaskDetails.completed_by}
                  </div>
                </div>
              )}
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.closeButtonSecondary} onClick={handleCloseCompletedModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default NurseDashboard;
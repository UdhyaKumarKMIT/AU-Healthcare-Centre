import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSync } from '@fortawesome/free-solid-svg-icons';
import styles from './NurseDashboard.module.css';

const TasksView = ({
  pendingTasks,
  completedTasks,
  isTasksLoading,
  isCompletedLoading,
  onRefresh,
  onRefreshCompleted,
  onViewTaskDetails,
  onViewCompletedDetails
}) => {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const normalizeDateTimeLocal = (value, bound) => {
    if (!value) return value;

    // If a user typed/pasted date-only, convert to datetime-local range.
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return bound === 'end' ? `${value}T23:59` : `${value}T00:00`;
    }

    // If the user picked a date but left time at midnight, treat end as end-of-day.
    if (bound === 'end' && /^\d{4}-\d{2}-\d{2}T00:00$/.test(value)) {
      return value.replace('T00:00', 'T23:59');
    }

    return value;
  };

  return (
    <div className={styles.tasksGrid}>
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h3>Pending Tasks ({pendingTasks.length})</h3>
          <button
            onClick={onRefresh}
            disabled={isTasksLoading}
            className={styles.refreshButton}
          >
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
                  {task.patient_name && (
                    <div className={styles.taskDetail}>
                      <strong>Patient:</strong> {task.patient_name}
                    </div>
                  )}
                  {task.reason && (
                    <div className={styles.taskDetail}>
                      <strong>Reason:</strong> {task.reason}
                    </div>
                  )}
                  {task.doctor_name && (
                    <div className={styles.taskDetail}>
                      <strong>Doctor:</strong> Dr. {task.doctor_name}
                    </div>
                  )}
                </div>
                <button
                  className={styles.viewButton}
                  onClick={() => onViewTaskDetails(task)}
                >
                  View Details & Complete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h3>Completed Tasks ({completedTasks.length})</h3>

          <div className={styles.filterControls}>
            <input
              type="date"
              value={from}
              onChange={e => setFrom(e.target.value)}
              className={styles.filterInput}
              placeholder="From Date"
            />

            <input
              type="date"
              value={to}
              onChange={e => setTo(e.target.value)}
              className={styles.filterInput}
              placeholder="To Date"
            />

            <button
              onClick={() => onRefreshCompleted?.({
                from: normalizeDateTimeLocal(from, 'start'),
                to: normalizeDateTimeLocal(to, 'end')
              })}
              disabled={isCompletedLoading}
              className={styles.refreshButton}
              title="Refresh completed tasks"
            >
              <FontAwesomeIcon icon={faSync} spin={isCompletedLoading} />
            </button>
          </div>
        </div>
        {completedTasks.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No completed tasks yet</p>
          </div>
        ) : (
          <div className={styles.tasksList}>
            {completedTasks.map((task) => (
              <div key={task.task_id} className={styles.taskCardCompleted}>
                <div className={styles.taskHeader}>
                  <div className={styles.taskType}>{task.task_type}</div>
                  <div className={styles.taskStatusCompleted}>✓ Completed</div>
                </div>
                <div className={styles.taskBody}>
                  {task.patient_name && (
                    <div className={styles.taskDetail}>
                      <strong>Patient:</strong> {task.patient_name}
                    </div>
                  )}
                  {task.completed_at && (
                    <div className={styles.taskDetail}>
                      <strong>Completed:</strong> {new Date(task.completed_at).toLocaleString()}
                    </div>
                  )}
                </div>
                <button
                  className={styles.viewDetailsButton}
                  onClick={() => onViewCompletedDetails(task)}
                >
                  View Details
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TasksView;
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSync, faTasks, faBoxes, 
  faExchangeAlt, faCheckCircle, faClock
} from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../contexts/AuthContext';
import Header from '../../components/Header/Header';
import TasksView from '../../components/nurse/TasksView';
import StockView from '../../components/nurse/StockView';
import TaskDetailsModal from '../../components/nurse/TaskDetailsModal';
import CompletedTaskDetailsModal from '../../components/nurse/CompletedTaskDetailsModal';
import {
  fetchNurseTasks,
  fetchTaskDetails,
  fetchCompletedTaskDetails,
  fetchAvailableStock,
  clearCurrentTask,
  clearCompletedTaskDetails,
  selectPendingTasks,
  selectCompletedTasks,
  selectCurrentTask,
  selectCompletedTaskDetails,
  selectStock,
  selectIsTasksLoading
} from '../../store/slices/nurseSlice';
import styles from '../../components/nurse/NurseDashboard.module.css';

function NurseDashboard() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  
  const pendingTasks = useSelector(selectPendingTasks);
  const completedTasks = useSelector(selectCompletedTasks);
  const taskDetails = useSelector(selectCurrentTask);
  const completedTaskDetails = useSelector(selectCompletedTaskDetails);
  const isTasksLoading = useSelector(selectIsTasksLoading);
  
  const [showModal, setShowModal] = useState(false);
  const [showCompletedDetailsModal, setShowCompletedDetailsModal] = useState(false);
  const [activeTask, setActiveTask] = useState(null);
  const [activeView, setActiveView] = useState("tasks");
  const [stockType, setStockType] = useState('NURSE');
  
  const availableStock = useSelector(selectStock(stockType));

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [authLoading, isAuthenticated, navigate]);

  useEffect(() => {
    if (user && isAuthenticated) {
      dispatch(fetchNurseTasks());
      const interval = setInterval(() => {
        dispatch(fetchNurseTasks());
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [user, isAuthenticated, dispatch]);

  const handleRefreshTasks = () => {
    dispatch(fetchNurseTasks());
    toast.info('Refreshing tasks...');
  };

  const loadTaskDetails = async (task) => {
    setActiveTask(task);
    setShowModal(true);
    
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

  const handleTaskComplete = () => {
    setShowModal(false);
    setActiveTask(null);
    dispatch(clearCurrentTask());
    dispatch(fetchNurseTasks());
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
                <div className={styles.statValue}>{completedTasks.length}</div>
                <div className={styles.statLabel}>Completed Today</div>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.viewToggle}>
          <button 
            className={`${styles.actionCard} ${activeView === 'tasks' ? styles.active : ''}`} 
            onClick={() => setActiveView('tasks')}
          >
            <FontAwesomeIcon icon={faTasks} className={styles.toggleIcon} />
            <span> My Tasks</span>
          </button>
          <button 
            className={`${styles.actionCard} ${activeView === 'stock' ? styles.active : ''}`} 
            onClick={() => {
              setActiveView('stock');
              setStockType('NURSE');
              dispatch(fetchAvailableStock('NURSE'));
            }}
          >
            <FontAwesomeIcon icon={faBoxes} />
            <span> View Stock</span>
          </button>
        </div>

        {activeView === 'tasks' && (
          <TasksView
            pendingTasks={pendingTasks}
            completedTasks={completedTasks}
            isTasksLoading={isTasksLoading}
            onRefresh={handleRefreshTasks}
            onViewTaskDetails={loadTaskDetails}
            onViewCompletedDetails={loadCompletedTaskDetails}
          />
        )}

        {activeView === 'stock' && (
          <StockView
            availableStock={availableStock}
            stockType={stockType}
            onStockTypeChange={handleStockTypeChange}
          />
        )}
      </div>

      {showModal && activeTask && taskDetails && (
        <TaskDetailsModal
          taskDetails={taskDetails}
          availableStock={availableStock}
          activeTask={activeTask}
          onClose={handleCloseModal}
          onComplete={handleTaskComplete}
        />
      )}

      {showCompletedDetailsModal && activeTask && completedTaskDetails && (
        <CompletedTaskDetailsModal
          completedTaskDetails={completedTaskDetails}
          onClose={handleCloseCompletedModal}
        />
      )}
    </div>
  );
}

export default NurseDashboard;
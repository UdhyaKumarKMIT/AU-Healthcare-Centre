import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSync } from '@fortawesome/free-solid-svg-icons';

function NurseDashboard() {
  const { user } = useAuth();
  
  const [showModal, setShowModal] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [details, setDetails] = useState([]);
  const [activeTask, setActiveTask] = useState(null);
  const [activeView, setActiveView] = useState("tasks");
  const [isRefreshing, setIsRefreshing] = useState(false);

  if (!user) {
    return <div>Loading user data...</div>;
  }

  if (!user.nurse_id) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <p style={{ color: 'red' }}>Error: No nurse profile found for this user</p>
        <p style={{ color: '#64748b', marginTop: '8px' }}>
          Please contact your administrator to set up your nurse profile.
        </p>
      </div>
    );
  }

  const nurse = {
    nurse_id: user.nurse_id,
    name: user.name || user.email,
    user_id: user.user_id,
    email: user.email
  };

  // ================= FETCH TASKS =================
  const fetchTasks = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch(`http://localhost:5000/api/nurse/${nurse.nurse_id}/tasks`);
      
      if (res.ok) {
        const data = await res.json();
        setTasks(Array.isArray(data) ? data : []);
      } else {
        console.error('Failed to fetch tasks');
        setTasks([]);
      }
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setTasks([]);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTasks();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchTasks, 30000);
    return () => clearInterval(interval);
  }, [nurse.nurse_id]);

  // ================= LOAD DETAILS =================
  const loadDetails = async (task) => {
    setActiveTask(task);
    setDetails([]);
    setShowModal(true);

    try {
      const res = await fetch(`http://localhost:5000/api/nurse/task/${task.task_id}/details`);
      
      if (res.ok) {
        const data = await res.json();
        setDetails(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Error loading task details:', err);
      setDetails([]);
    }
  };

  // ================= MARK COMPLETED =================
  const markTaskCompleted = async (task_id) => {
    try {
      const res = await fetch(`http://localhost:5000/api/nurse/task/${task_id}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nurse_id: nurse.nurse_id,
          observation: "Task completed",
        }),
      });
      
      if (res.ok) {
        setShowModal(false);
        setActiveTask(null);
        fetchTasks();
      } else {
        alert('Failed to mark task as completed');
      }
    } catch (err) {
      console.error('Error marking task complete:', err);
      alert('Error marking task as completed');
    }
  };

  const pendingTasks = tasks.filter((t) => t.status === "PENDING");
  const completedTasks = tasks.filter((t) => t.status === "COMPLETED");

  return (
    <div>
      {/* NAVBAR */}
      <div style={styles.navbar}>
        <h3>MIT Healthcare</h3>
        <span>Nurse Dashboard</span>
      </div>

      <div style={styles.page}>
        <h2>Welcome back, {nurse.name}</h2>
        <p style={styles.subText}>All systems operational today</p>

        {/* ACTION BUTTONS */}
        <div style={styles.actionGrid}>
          <button
            style={styles.actionCard}
            onClick={() => setActiveView("tasks")}
          >
            Assigned Tasks
          </button>
          <button
            style={styles.actionCard}
            onClick={() => setActiveView("profile")}
          >
            My Profile
          </button>
        </div>

        {/* TASKS */}
        {activeView === "tasks" && (
          <div style={styles.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3>Pending Tasks ({pendingTasks.length})</h3>
              <button 
                onClick={fetchTasks}
                disabled={isRefreshing}
                style={{
                  padding: '8px 16px',
                  background: isRefreshing ? '#94a3b8' : '#2563eb',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: isRefreshing ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'background 0.2s'
                }}
              >
                <FontAwesomeIcon 
                  icon={faSync} 
                  spin={isRefreshing}
                  style={{ fontSize: '14px' }}
                />
                Refresh
              </button>
            </div>

            {pendingTasks.length === 0 ? (
              <div style={{ 
                padding: '40px 20px', 
                textAlign: 'center', 
                color: '#64748b',
                background: '#f8fafc',
                borderRadius: '8px'
              }}>
                <p style={{ fontSize: '16px', marginBottom: '8px' }}>No pending tasks assigned to you</p>
                <p style={{ fontSize: '14px' }}>You're all caught up! </p>
              </div>
            ) : (
              pendingTasks.map((task) => (
                <div key={task.task_id} style={styles.taskBox}>
                  <div>
                    <div style={styles.taskTitle}>{task.task_type}</div>
                    <div style={styles.taskReason}>
                      {task.patient_name && <span>Patient: {task.patient_name} • </span>}
                      {task.reason || 'No additional details'}
                    </div>
                    {task.doctor_name && (
                      <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                        Prescribed by: Dr. {task.doctor_name}
                      </div>
                    )}
                  </div>

                  <button
                    style={styles.viewBtn}
                    onClick={() => loadDetails(task)}
                  >
                    View Details
                  </button>
                </div>
              ))
            )}

            <h3 style={{ marginTop: 30, marginBottom: 16 }}>Completed Tasks ({completedTasks.length})</h3>

            {completedTasks.length === 0 ? (
              <div style={{ 
                padding: '20px', 
                textAlign: 'center', 
                color: '#64748b',
                background: '#f8fafc',
                borderRadius: '8px'
              }}>
                No completed tasks yet
              </div>
            ) : (
              completedTasks.map((task) => (
                <div key={task.task_id} style={styles.completedBox}>
                  <div>
                    <div style={{ fontWeight: 600 }}>{task.task_type}</div>
                    {task.patient_name && (
                      <div style={{ fontSize: '14px', color: '#065f46', marginTop: '4px' }}>
                        Patient: {task.patient_name}
                      </div>
                    )}
                  </div>
                  <div style={{ fontSize: '12px', color: '#065f46' }}>
                    ✓ Completed
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* PROFILE */}
        {activeView === "profile" && (
          <div style={styles.card}>
            <h3 style={{ marginBottom: '20px' }}>My Profile</h3>
            <div style={styles.profileRow}>
              <span style={styles.profileLabel}>Name:</span>
              <span style={styles.profileValue}>{nurse.name}</span>
            </div>
            <div style={styles.profileRow}>
              <span style={styles.profileLabel}>Nurse ID:</span>
              <span style={styles.profileValue}>{nurse.nurse_id}</span>
            </div>
            <div style={styles.profileRow}>
              <span style={styles.profileLabel}>Email:</span>
              <span style={styles.profileValue}>{nurse.email}</span>
            </div>

            <button
              style={styles.logoutBtn}
              onClick={() => {
                localStorage.clear();
                window.location.href = "/";
              }}
            >
              Logout
            </button>
          </div>
        )}
      </div>

      {/* MODAL */}
      {showModal && activeTask && (
        <div style={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div style={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginBottom: '8px' }}>{activeTask.task_type}</h3>
            {activeTask.patient_name && (
              <p style={styles.modalSub}>
                <strong>Patient:</strong> {activeTask.patient_name}
              </p>
            )}
            {activeTask.reason && (
              <p style={styles.modalSub}>{activeTask.reason}</p>
            )}

            <h4 style={{ marginTop: '20px', marginBottom: '12px' }}>Medication Instructions</h4>

            {details.length === 0 ? (
              <p style={styles.emptyText}>Loading medication details...</p>
            ) : (
              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px' }}>
                {details.map((d, i) => (
                  <div key={i} style={{ 
                    padding: '12px',
                    background: 'white',
                    borderRadius: '6px',
                    marginBottom: i < details.length - 1 ? '8px' : '0',
                    border: '1px solid #e2e8f0'
                  }}>
                    <div style={{ fontWeight: 600, marginBottom: '4px' }}>
                      {d.medicine_name || 'Unknown medicine'}
                    </div>
                    <div style={{ fontSize: '14px', color: '#475569' }}>
                      <strong>Route:</strong> {d.route || 'Not specified'}
                    </div>
                    {d.dosage && (
                      <div style={{ fontSize: '14px', color: '#475569' }}>
                        <strong>Dosage:</strong> {d.dosage}
                      </div>
                    )}
                    {d.remarks && (
                      <div style={{ fontSize: '14px', color: '#475569', marginTop: '4px' }}>
                        <strong>Note:</strong> {d.remarks}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div style={styles.modalActions}>
              <button
                style={styles.markBtn}
                onClick={() => {
                  if (confirm('Are you sure you want to mark this task as completed?')) {
                    markTaskCompleted(activeTask.task_id);
                  }
                }}
              >
                ✓ Mark Completed
              </button>
              <button
                style={styles.closeBtn}
                onClick={() => setShowModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ================= STYLES ================= */

const styles = {
  navbar: {
    background: "#1e40af",
    color: "#fff",
    padding: "16px 30px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  },
  page: {
    padding: 32,
    background: "#f8fafc",
    minHeight: "100vh"
  },
  subText: { 
    color: "#64748b",
    fontSize: '14px',
    marginTop: '4px'
  },

  actionGrid: { 
    display: "flex", 
    gap: 20, 
    marginTop: 24 
  },
  actionCard: {
    flex: 1,
    padding: 22,
    borderRadius: 14,
    background: "#2563eb",
    color: "#fff",
    fontSize: 18,
    fontWeight: 600,
    border: "none",
    cursor: "pointer",
    transition: 'background 0.2s'
  },

  card: {
    background: "#fff",
    padding: 26,
    borderRadius: 16,
    marginTop: 28,
    boxShadow: "0 12px 28px rgba(0,0,0,0.06)"
  },

  taskBox: {
    background: "#eef2ff",
    borderLeft: "6px solid #2563eb",
    padding: 16,
    borderRadius: 10,
    marginBottom: 14,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    transition: 'transform 0.2s, box-shadow 0.2s'
  },

  taskTitle: { 
    fontSize: 16, 
    fontWeight: 600,
    color: '#1e293b',
    marginBottom: '4px'
  },
  taskReason: { 
    fontSize: 14, 
    color: "#475569" 
  },

  viewBtn: {
    background: "#2563eb",
    color: "#fff",
    border: "none",
    padding: "10px 20px",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: 600,
    transition: 'background 0.2s'
  },

  completedBox: {
    background: "#dcfce7",
    padding: 14,
    borderRadius: 10,
    marginBottom: 10,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    border: '1px solid #bbf7d0'
  },

  profileRow: {
    display: 'flex',
    padding: '12px 0',
    borderBottom: '1px solid #e2e8f0'
  },
  profileLabel: {
    fontWeight: 600,
    color: '#475569',
    minWidth: '120px'
  },
  profileValue: {
    color: '#1e293b'
  },

  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000
  },

  modalCard: {
    background: "#fff",
    padding: 30,
    borderRadius: 16,
    width: 560,
    maxHeight: '80vh',
    overflowY: 'auto',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
  },

  modalSub: { 
    color: "#64748b", 
    marginBottom: 8,
    fontSize: '14px'
  },

  modalActions: { 
    display: "flex", 
    gap: 12, 
    marginTop: 24 
  },

  markBtn: {
    flex: 1,
    background: "#16a34a",
    color: "#fff",
    padding: "12px 20px",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: 600,
    fontSize: '15px',
    transition: 'background 0.2s'
  },

  closeBtn: {
    flex: 1,
    background: "#64748b",
    color: "#fff",
    padding: "12px 20px",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: 600,
    fontSize: '15px',
    transition: 'background 0.2s'
  },

  logoutBtn: {
    marginTop: 24,
    background: "#ef4444",
    color: "#fff",
    padding: "12px 24px",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: 600,
    transition: 'background 0.2s'
  },

  emptyText: { 
    color: "#64748b",
    textAlign: 'center',
    padding: '20px'
  }
};

export default NurseDashboard;
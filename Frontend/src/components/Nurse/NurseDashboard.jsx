import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";

function NurseDashboard() {
  const { user } = useAuth();   // ✅ source of truth
  const nurse = user;

  const [showModal, setShowModal] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [details, setDetails] = useState([]);
  const [activeTask, setActiveTask] = useState(null);
  const [activeView, setActiveView] = useState("tasks");

  // ⛔ Stop rendering until nurse is available
  if (!nurse) {
    return <div>Loading nurse dashboard...</div>;
  }

  // ================= FETCH TASKS =================
  const fetchTasks = async () => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/nurse/${nurse.nurse_id}/tasks`
      );
      const data = await res.json();
      setTasks(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [nurse.nurse_id]);

  // ================= LOAD DETAILS =================
  const loadDetails = async (task) => {
    setActiveTask(task);
    setDetails([]);
    setShowModal(true);

    try {
      const res = await fetch(
        `http://localhost:5000/api/nurse/task/${task.task_id}/details`
      );
      const data = await res.json();
      setDetails(Array.isArray(data) ? data : []);
    } catch {
      setDetails([]);
    }
  };

  // ================= MARK COMPLETED =================
  const markTaskCompleted = async (task_id) => {
    await fetch(
      `http://localhost:5000/api/nurse/task/${task_id}/complete`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nurse_id: nurse.nurse_id,
          observation: "Task completed",
        }),
      }
    );

    setShowModal(false);
    setActiveTask(null);
    fetchTasks();
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
            <h3>Pending Tasks</h3>

            {pendingTasks.map((task) => (
              <div key={task.task_id} style={styles.taskBox}>
                <div>
                  <div style={styles.taskTitle}>{task.task_type}</div>
                  <div style={styles.taskReason}>{task.reason}</div>
                </div>

                <button
                  style={styles.viewBtn}
                  onClick={() => loadDetails(task)}
                >
                  View Details
                </button>
              </div>
            ))}

            <h3 style={{ marginTop: 30 }}>Completed Tasks</h3>

            {completedTasks.map((task) => (
              <div key={task.task_id} style={styles.completedBox}>
                {task.task_type}
              </div>
            ))}
          </div>
        )}

        {/* PROFILE */}
        {activeView === "profile" && (
          <div style={styles.card}>
            <p><b>Name:</b> {nurse.name}</p>
            <p><b>Nurse ID:</b> {nurse.nurse_id}</p>

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
        <div style={styles.modalOverlay}>
          <div style={styles.modalCard}>
            <h3>{activeTask.task_type}</h3>
            <p style={styles.modalSub}>{activeTask.reason}</p>

            <h4>Instructions</h4>

            {details.length === 0 ? (
              <p style={styles.emptyText}>No medication instructions</p>
            ) : (
              <ul>
                {details.map((d, i) => (
                  <li key={i}>
                    <b>{d.medicine_name}</b> — {d.dosage} via {d.route}
                  </li>
                ))}
              </ul>
            )}

            <div style={styles.modalActions}>
              <button
                style={styles.markBtn}
                onClick={() => markTaskCompleted(activeTask.task_id)}
              >
                Mark Completed
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
  subText: { color: "#64748b" },

  actionGrid: { display: "flex", gap: 20, marginTop: 20 },
  actionCard: {
    flex: 1,
    padding: 22,
    borderRadius: 14,
    background: "#2563eb",
    color: "#fff",
    fontSize: 18,
    border: "none",
    cursor: "pointer"
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
    alignItems: "center"
  },

  taskTitle: { fontSize: 16, fontWeight: 600 },
  taskReason: { fontSize: 14, color: "#475569" },

  viewBtn: {
    background: "#2563eb",
    color: "#fff",
    border: "none",
    padding: "8px 16px",
    borderRadius: 8,
    cursor: "pointer"
  },

  completedBox: {
    background: "#dcfce7",
    padding: 14,
    borderRadius: 10,
    marginBottom: 10
  },

  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.4)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  },

  modalCard: {
    background: "#fff",
    padding: 30,
    borderRadius: 16,
    width: 520
  },

  modalSub: { color: "#64748b", marginBottom: 16 },
  modalSection: { marginBottom: 16 },

  modalActions: { display: "flex", gap: 12, marginTop: 24 },

  markBtn: {
    background: "#16a34a",
    color: "#fff",
    padding: "10px 18px",
    border: "none",
    borderRadius: 8,
    cursor: "pointer"
  },

  closeBtn: {
    background: "#ef4444",
    color: "#fff",
    padding: "10px 18px",
    border: "none",
    borderRadius: 8,
    cursor: "pointer"
  },

  logoutBtn: {
    marginTop: 20,
    background: "#ef4444",
    color: "#fff",
    padding: "10px 16px",
    border: "none",
    borderRadius: 8,
    cursor: "pointer" 
  },

  emptyText: { color: "#64748b" }
};

export default NurseDashboard;

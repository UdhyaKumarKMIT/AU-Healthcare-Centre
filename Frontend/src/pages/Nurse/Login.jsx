import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

function Login() {
  const { login } = useAuth(); // ✅ USE AUTH CONTEXT
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("http://localhost:5000/api/nurse/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Login failed");
        return;
      }

      // ✅ CRITICAL FIX
      login(data.user, data.token);

      navigate("/nurse/dashboard");
    } catch {
      setError("Server not reachable");
    }
  };

  return (
    <div style={styles.page}>
      <form onSubmit={handleSubmit} style={styles.card}>
        <h2 style={styles.title}>Nurse Login</h2>

        {error && <p style={styles.error}>{error}</p>}

        <input
          type="email"
          placeholder="Email"
          style={styles.input}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          style={styles.input}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit" style={styles.button}>
          Login
        </button>
      </form>
    </div>
  );
}

const styles = {
  page: {
    width: "100vw",
    height: "100vh",
    background: "linear-gradient(135deg, #e3f2fd, #bbdefb)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  },
  card: {
    backgroundColor: "#fff",
    padding: 40,
    width: 350,
    borderRadius: 10,
    boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
    display: "flex",
    flexDirection: "column"
  },
  title: {
    textAlign: "center",
    color: "#1e88e5",
    marginBottom: 25
  },
  input: {
    padding: 12,
    marginBottom: 15,
    borderRadius: 5,
    border: "1px solid #ccc",
    fontSize: 14
  },
  button: {
    padding: 12,
    backgroundColor: "#1e88e5",
    color: "#fff",
    border: "none",
    borderRadius: 5,
    fontSize: 16,
    cursor: "pointer"
  },
  error: {
    color: "red",
    textAlign: "center",
    marginBottom: 10
  }
};

export default Login;

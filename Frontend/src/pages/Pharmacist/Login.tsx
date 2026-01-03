import { useState } from "react";
import api from "../../api/axios";
import pharmacyImg from "../../assets/pharmacy1.svg";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async () => {
  setLoading(true);
  try {
    const res = await api.post("/pharmacy/login", { email, password });
    const { token } = res.data;
    console.log("ok");

    localStorage.setItem("token", token);

    navigate("/pharmacist/dashboard"); // ✅ SPA navigation
  } catch (error: any) {
    alert(
      error.response?.status === 401
        ? "Invalid credentials"
        : "Something went wrong"
    );
    setLoading(false);
  }
};

  return (
    <div style={{
      display: "flex",
      minHeight: "100vh",
      backgroundColor: "#f8fafc", // 🔵 blue-gray background
      fontFamily: "system-ui, -apple-system, sans-serif",
      overflow: "hidden"
    }}>

      {/* LEFT – LOGIN */}
      <div style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem"
      }}>
        <div style={{ width: "100%", maxWidth: "420px" }}>

          <div style={{
            backgroundColor: "white",
            borderRadius: "16px",
            padding: "2.5rem",
            boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
            border: "1px solid #e5e7eb"
          }}>

            <h2 style={{
              textAlign: "center",
              fontSize: "26px",
              fontWeight: 700,
              marginBottom: "1.5rem",
              color: "#1e3a8a" // 🔵 dark blue
            }}>
              Sign in to your account
            </h2>

            {/* EMAIL */}
            <label style={{ fontSize: 14, fontWeight: 500, color: "black", display: "block", marginBottom: "5px"}}>Email</label>
            <input
              type="email"
              placeholder="pharmacist@mit.edu"
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={inputStyle}
            />

            {/* PASSWORD */}
            <label style={{ fontSize: 14, fontWeight: 500, marginTop: "1rem", display: "block", marginBottom: "5px", color: "black"}}>
              Password
            </label>
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                style={{ ...inputStyle, paddingRight: "44px" }}
              />
              <button
                onClick={() => setShowPassword(!showPassword)}
                style={eyeButton}
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>

            {/* LOGIN BUTTON */}
            <button
              onClick={handleLogin}
              disabled={loading}
              style={{
                marginTop: "1.8rem",
                width: "100%",
                padding: "14px",
                backgroundColor: loading ? "#93c5fd" : "#2563eb", // 🔵 blue
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontWeight: 600,
                cursor: loading ? "not-allowed" : "pointer",
                transition: "all 0.2s"
              }}
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>

          </div>
        </div>
      </div>

      {/* RIGHT – BRAND */}
      <div style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #2563eb, #1e40af)", // 🔵 blue gradient
        padding: "3rem",
        color: "white"
      }}>
        <img src={pharmacyImg} alt="Pharmacy" style={{ width: 200, marginBottom: "2rem" }} />
        <h2 style={{ fontSize: "36px", fontWeight: "bold" }}>
          Anna University
        </h2>
        <h2>
          Pharmacy Management
        </h2><br />
        <p style={{ maxWidth: 420, opacity: 0.9, textAlign: "center" }}>
          Secure, reliable and modern pharmacy operations for healthcare professionals.
        </p>
      </div>
    </div>
  );
};

/* 🔵 Shared Styles */
const inputStyle = {
  width: "100%",
  padding: "20px 12px 10px", // ⬅ extra top padding for label
  borderRadius: "8px",
  border: "1px solid #000000",
  outline: "none",
  fontSize: "14px",
  transition: "0.2s",
  color: "black",
  background: "white",
  boxSizing: "border-box"
} as React.CSSProperties;


const eyeButton = {
  position: "absolute",
  right: "12px",
  top: "50%",
  transform: "translateY(-50%)",
  border: "none",
  background: "none",
  cursor: "pointer"
} as React.CSSProperties;

export default Login;

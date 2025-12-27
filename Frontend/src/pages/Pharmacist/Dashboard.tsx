import { useEffect, useState } from "react";
import { Activity, PillBottle, FileScan, ShieldX, FileCheck } from "lucide-react";
import api from "../../api/axios";
import { useNavigate } from "react-router-dom";
import axios from "axios";

/* ---------- Helpers ---------- */
function toTitleCase(str: string) {
  if (!str) return "";
  return str.replace(/\w\S*/g, (txt) =>
    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
}


/* ---------- Component ---------- */
const Dashboard = () => {
  const navigate = useNavigate();

  const [message, setMessage] = useState(""); 
  const [userName, setUserName] = useState("");
  const [profileOpen, setProfileOpen] = useState(false); 
  const [loading, setLoading] = useState(true);


  const token = localStorage.getItem("token");
  let pharmacistId: number | null = null;

  /* ---------- AUTH + INITIAL LOAD ---------- */
  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchProfile = async () => {
    try {
      const res = await api.get("/pharmacy/pharmacistDetails");
      setUserName(res.data.name); 
      setMessage("The system is operational!");
    } catch (err) {
      console.error(err);
      alert("Failed to fetch profile. Please login again.");
      window.location.href = "/pharmacist/login";
    } finally {
      setLoading(false);
    }
  };

  fetchProfile();
  
  }, [navigate, token]); 

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login/pharmacist";
  };

  

  /* ---------- UI ---------- */
  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
      {/* HEADER */}
      <header
        style={{
          background: "linear-gradient(90deg, #1e40af, #1e3a8a)",
          color: "white",
        }}
      >
        <div style={{ maxWidth: 1400, margin: "auto", padding: "1rem" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
              <Activity />
              <div>
                <h2 style={{ margin: 0 }}>MIT Pharmacy</h2>
                <small>Pharmacist Dashboard</small>
              </div>
            </div>

            <div style={{ position: "relative" }}>
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  background: "#2f8ffdff",
                  border: "none",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                {userName ? userName.charAt(0).toUpperCase() : "?"}
              </button>

              {profileOpen && (
                <div
                  style={{
                    position: "absolute",
                    right: 0,
                    top: 50,
                    background: "white",
                    color: "#000000",
                    borderRadius: 10,
                    width: 180,
                    boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
                  }}
                >
                  <button style={dropdownItemStyle} onClick={() => navigate("/pharmacist/profile", { state: { pharmacist_id: pharmacistId } })}>👤 View Profile</button>
                  <button
                    style={{ ...dropdownItemStyle, color: "#dc2626" }}
                    onClick={handleLogout}
                  >
                    🚪 Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main
        style={{
          maxWidth: 1400,
          margin: "auto",
          padding: "2rem",
          color: "black",
        }}
      >
        <h1 style={{ fontSize: "2.3rem", fontWeight: 700 }}>
          Welcome back, {toTitleCase(userName)} 👋
        </h1>
        <p><b>{message}</b></p>
 
        <div style={{display: "flex", justifyContent: "center", alignItems: "center", flexWrap: "wrap", gap: "2rem", marginTop:"1rem"}}>
      
        <div style={sectionCardStyle} className="card">
          <div style={sectionHeaderStyle}>
            <FileScan size={22} /> Pending Prescriptions </div>
            <button style={loadButtonStyle} onClick={() => window.open("pendingPrescription","_blank")} > View </button>
        </div>
        
         <div style={sectionCardStyle} className="card">
          <div style={sectionHeaderStyle}>
            <PillBottle size={22} /> Medicine Stock </div>
            <button style={loadButtonStyle} onClick={() => window.open("medicineStock","_blank")} > View </button>
        </div>

        </div>

        <div style={{display: "flex", justifyContent: "center", alignItems: "center", flexWrap: "wrap", gap: "2rem", marginTop:"2rem"}}>
 
        <div style={sectionCardStyle} className="card">
          <div style={sectionHeaderStyle}>
            <ShieldX size={22} /> Expired Medicine </div>
            <button style={loadButtonStyle} onClick={() => window.open("expiredStock","_blank")} > View </button>
        </div>
        
        <div style={sectionCardStyle} className="card">
          <div style={sectionHeaderStyle}>
            <FileCheck size={22} /> Past Prescriptions</div>
            <button style={loadButtonStyle} onClick={() => window.open("/pharmacist/pastPrescription", "_blank")} > View </button>
        </div> 

        </div>
      </main>
    </div>
  );
};

/* ---------- STYLES ---------- */
const dropdownItemStyle: React.CSSProperties = {
  width: "100%",
  padding: "0.75rem 1rem",
  border: "none",
  background: "#f0f4ff",
  color: "#1e3a8a",
  textAlign: "left",
  cursor: "pointer",
  fontSize: "0.95rem",
  fontWeight: 600,
};

const sectionCardStyle: React.CSSProperties = {
  background: "#ffffff",
  borderRadius: "10px",
  padding: "1.5rem",
  margin: "0.75rem",
  border: "1px solid #cbd5e1",
  boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
  display: "inline-block",
  width: "calc(25% - 1.5rem)",
  verticalAlign: "top",
  transition: "transform 0.2s ease, box-shadow 0.2s ease",
};

const sectionHeaderStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
  fontSize: "1.3rem",
  fontWeight: 700,
  color: "#1e40af",
  marginBottom: "1rem",
};

const loadButtonStyle: React.CSSProperties = {
  padding: "0.75rem 1.25rem",
  background: "#1e40af",
  color: "white",
  borderRadius: "6px",
  border: "none",
  cursor: "pointer",
  fontWeight: 600,
  fontSize: "0.95rem",
  transition: "background 0.3s ease",
}; 


export default Dashboard;

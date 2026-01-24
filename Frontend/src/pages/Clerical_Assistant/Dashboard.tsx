import AULogo from "../../assets/AULogo.jpg";
import { ShieldX, LucideLogOut, LucideHome, ChartNoAxesColumn } from "lucide-react";
import { useNavigate, Outlet, useLocation } from "react-router-dom"; 

/* ---------- Component ---------- */
const Dashboard = () => {
  const navigate = useNavigate(); 

  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const activeNavButtonStyle = (path: string): React.CSSProperties => ({
    ...navButtonStyle,
    background: isActive(path) ? "#00408e" : "#2563eb",
  });

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  /* ---------- UI ---------- */
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f8fafc" }}>
      {/* SIDEBAR */}
      <aside
      style={{
        width: "250px",
        background: "#1e40af",
        color: "white",
        padding: "1rem",
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
        position: "fixed",       // 👈 keeps sidebar static
        top: 0,
        left: 0,
        bottom: 0,
        height: "100vh",         // full height
      }}
    >

        <div style={{ 
            display: "flex", 
            flexDirection: "column", 
            alignItems: "center", 
            marginBottom: "2rem" 
          }}>
            {/* Logo inside circle */}
            <div 
              style={{ 
                width: "80px", 
                height: "80px", 
                borderRadius: "50%", 
                overflow: "hidden", 
                background: "white",   // optional background
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center", 
                marginBottom: "0.75rem" 
              }}
            >
              <img 
                src={AULogo}   // if placed in public folder
                alt="Anna University Logo" 
                style={{ width: "90%", height: "90%", objectFit: "cover" }} 
              />
            </div>

            {/* Text below logo */}
            <h2 style={{ margin: 0, fontSize: "1.2rem", color: "white" }}>Anna University</h2>
            <h3 style={{ margin: 0, fontSize: "1rem", color: "#e0e7ff", fontWeight: 400 }}>
              Clerical System
            </h3>
          </div>
        
        <button style={activeNavButtonStyle("/clerical_assistant/dashboard")} onClick={() => navigate("/clerical_assistant/dashboard")}>
          <LucideHome size={20} /> Dashboard
        </button>
        <button style={activeNavButtonStyle("/clerical_assistant/stockAnalytics")} onClick={() => navigate("/clerical_assistant/stockAnalytics")}>
          <ChartNoAxesColumn size={20} /> Stock Analytics
        </button> 
        <button style={activeNavButtonStyle("/clerical_assistant/expiryMedicine")} onClick={() => navigate("/clerical_assistant/expiryMedicine")}>
          <ShieldX size={20} /> Expired Medicine
        </button>   
        
        {/* Logout Section */}
        <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          
          <button 
            style={{ ...navButtonStyle, background: "#162645" }} 
            onClick={handleLogout}
          >
            <LucideLogOut /> Logout
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main
      style={{
        flex: 1,
        padding: "2rem",
        marginLeft: "250px",     // 👈 offset for sidebar width
        overflowY: "auto",       // 👈 makes right side scrollable
        height: "100vh",         // ensures scroll works
      }}
    >
        <Outlet />
      </main>
    </div>
  );
};

/* ---------- STYLES ---------- */
const navButtonStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "0.75rem",
  fontWeight: "bold",
  padding: "0.75rem 1rem",
  background: "#2563eb",
  border: "none",
  borderRadius: "6px",
  color: "white",
  cursor: "pointer",  
  textAlign: "left",
};

export default Dashboard;
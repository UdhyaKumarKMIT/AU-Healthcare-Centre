import AULogo from "../../assets/AULogo.jpg";
import { ChartNoAxesColumn, FileScan, ShieldX, FileCheck, LucideLogOut, CircleUser, LucideHome, PillBottleIcon } from "lucide-react";
import { useNavigate, Outlet, useLocation} from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext"; 
 

/* ---------- Component ---------- */
const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth(); 
  const location = useLocation();

  const pharmacistId = user?.pharmacist_id;  
  const isActive = (path: string) => {
  if (path === "/pharmacist/pendingPrescription") {
    return (
      location.pathname === "/pharmacist/pendingPrescription" ||
      location.pathname === "/pharmacist/prescriptionsDetails"
    );
  }

  return location.pathname === path;
};


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
              Pharmacy System
            </h3>
          </div>
        
        <button
          style={activeNavButtonStyle("/pharmacist/dashboard")}
          onClick={() => navigate("/pharmacist/dashboard")}
        >
          <LucideHome size={20} /> Dashboard
        </button>

        <button
          style={activeNavButtonStyle("/pharmacist/pendingPrescription")}
          onClick={() => navigate("/pharmacist/pendingPrescription")}
        >
          <FileScan size={20} /> Pending Prescriptions
        </button>

        <button
          style={activeNavButtonStyle("/pharmacist/medicineStock")}
          onClick={() => navigate("/pharmacist/medicineStock")}
        >
          <ChartNoAxesColumn size={20} /> Stock Analysis
        </button>

        <button
          style={activeNavButtonStyle("/pharmacist/issuedMedicines")}
          onClick={() => navigate("/pharmacist/issuedMedicines")}
        >
          <PillBottleIcon size={20} /> Issued Medicines
        </button>

        <button
          style={activeNavButtonStyle("/pharmacist/expiredStock")}
          onClick={() => navigate("/pharmacist/expiredStock")}
        >
          <ShieldX size={20} /> Expired Medicine
        </button>

        <button
          style={activeNavButtonStyle("/pharmacist/pastPrescription")}
          onClick={() => navigate("/pharmacist/pastPrescription")}
        >
          <FileCheck size={20} /> Past Prescriptions
        </button>
              
        
        {/* Profile + Logout Section */}
        <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <button
            style={{
              ...navButtonStyle,
              background: isActive("/pharmacist/profile") ? "#1e3a8a" : "#3b82f6",
            }}
            onClick={() =>
              navigate("/pharmacist/profile", { state: { pharmacist_id: pharmacistId } })
            }
          >
            <CircleUser /> View Profile
          </button>

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
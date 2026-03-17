import { ChartNoAxesColumn, FileScan, ShieldX, FileCheck, LucideHome, PillBottleIcon } from "lucide-react";
import { useNavigate, Outlet, useLocation } from "react-router-dom";
import Header from "../../components/Header/Header";
import layoutStyles from "../shared/RoleSidebarLayout.module.css";


/* ---------- Component ---------- */
const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isActive = (path: string) => {
    if (path === "/pharmacist/pendingPrescription") {
      return (
        location.pathname === "/pharmacist/pendingPrescription" ||
        location.pathname === "/pharmacist/prescriptionsDetails"
      );
    }

    return location.pathname === path;
  };

  /* ---------- UI ---------- */
  return (
    <div className={layoutStyles.page}>
      <Header />

      <div className={layoutStyles.layout}>
        {/* SIDEBAR */}
        <aside className={layoutStyles.sidebar}>
          <nav className={layoutStyles.nav}>
            <button
              className={`${layoutStyles.navButton} ${isActive("/pharmacist/dashboard") ? layoutStyles.navButtonActive : ""}`}
              onClick={() => navigate("/pharmacist/dashboard")}
              type="button"
            >
              <LucideHome size={20} /> Dashboard
            </button>

            <button
              className={`${layoutStyles.navButton} ${isActive("/pharmacist/pendingPrescription") ? layoutStyles.navButtonActive : ""}`}
              onClick={() => navigate("/pharmacist/pendingPrescription")}
              type="button"
            >
              <FileScan size={20} /> Pending Prescriptions
            </button>

            <button
              className={`${layoutStyles.navButton} ${isActive("/pharmacist/medicineStock") ? layoutStyles.navButtonActive : ""}`}
              onClick={() => navigate("/pharmacist/medicineStock")}
              type="button"
            >
              <ChartNoAxesColumn size={20} /> Stock Analysis
            </button>

            <button
              className={`${layoutStyles.navButton} ${isActive("/pharmacist/issuedMedicines") ? layoutStyles.navButtonActive : ""}`}
              onClick={() => navigate("/pharmacist/issuedMedicines")}
              type="button"
            >
              <PillBottleIcon size={20} /> Issued Medicines
            </button>

            <button
              className={`${layoutStyles.navButton} ${isActive("/pharmacist/expiredStock") ? layoutStyles.navButtonActive : ""}`}
              onClick={() => navigate("/pharmacist/expiredStock")}
              type="button"
            >
              <ShieldX size={20} /> Expired Medicine
            </button>

            <button
              className={`${layoutStyles.navButton} ${isActive("/pharmacist/pastPrescription") ? layoutStyles.navButtonActive : ""}`}
              onClick={() => navigate("/pharmacist/pastPrescription")}
              type="button"
            >
              <FileCheck size={20} /> Past Prescriptions
            </button>
          </nav>
        </aside>

        {/* MAIN CONTENT */}
        <main className={layoutStyles.main}>
          <div className={layoutStyles.mainInner}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
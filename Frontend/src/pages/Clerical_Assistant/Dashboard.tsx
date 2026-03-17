import { ShieldX, LucideHome, ChartNoAxesColumn } from "lucide-react";
import { useNavigate, Outlet, useLocation } from "react-router-dom";
import Header from "../../components/Header/Header";
import layoutStyles from "../shared/RoleSidebarLayout.module.css";

/* ---------- Component ---------- */
const Dashboard = () => {
  const navigate = useNavigate();

  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  /* ---------- UI ---------- */
  return (
    <div className={layoutStyles.page}>
      <Header />

      <div className={layoutStyles.layout}>
        {/* SIDEBAR */}
        <aside className={layoutStyles.sidebar}>
          <nav className={layoutStyles.nav}>
            <button
              className={`${layoutStyles.navButton} ${isActive("/clerical_assistant/dashboard") ? layoutStyles.navButtonActive : ""}`}
              onClick={() => navigate("/clerical_assistant/dashboard")}
              type="button"
            >
              <LucideHome size={20} /> Dashboard
            </button>

            <button
              className={`${layoutStyles.navButton} ${isActive("/clerical_assistant/stockAnalytics") ? layoutStyles.navButtonActive : ""}`}
              onClick={() => navigate("/clerical_assistant/stockAnalytics")}
              type="button"
            >
              <ChartNoAxesColumn size={20} /> Stock Analytics
            </button>

            <button
              className={`${layoutStyles.navButton} ${isActive("/clerical_assistant/expiryMedicine") ? layoutStyles.navButtonActive : ""}`}
              onClick={() => navigate("/clerical_assistant/expiryMedicine")}
              type="button"
            >
              <ShieldX size={20} /> Expired Medicine
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
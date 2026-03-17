import React from "react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../api/axios";
import { toast } from "react-toastify";
import { ChartNoAxesColumn, ShieldX, TriangleAlert, PackageX } from "lucide-react";
import pageStyles from "../shared/RolePage.module.css";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";

interface Medicine {
  medicine_id: string;
  medicine_name: string;
  total_stock: number;
}

interface StockItem {
  name: string;
  stock: number;
}

/* ---------- Helpers ---------- */
function toTitleCase(str: string) {
  if (!str) return "";
  return str.replace(/\w\S*/g, (txt) =>
    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
}

/* ---------- No of Data Per Page ---------- */
const ITEMS_PER_PAGE = 5;

/* ---------- Component ---------- */
const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const userName = user?.name || "";

  const [dashboardCounts, setDashboardCounts] = useState({
    expired_stock_count: 0,
    out_of_stock_count: 0,
    low_stock_count: 0,
  });


  const [message, setMessage] = useState("");
  const [page, setPage] = useState(0);
  const [stockData, setStockData] = useState<StockItem[]>([]);

  // Slice data for current page
  const startIndex = page * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentData = stockData.slice(startIndex, endIndex);

  const totalPages = Math.ceil(stockData.length / ITEMS_PER_PAGE);

  useEffect(() => {
    if (!user) {
      navigate("/login/clerical");
      return;
    }

    setMessage("All Clerical services are active.");

    const fetchDashboardCounts = async () => {
      try {
        const res = await api.get("/clerical_assistant/getDashboardCounts");
        setDashboardCounts(res.data);
      } catch (error) {
        console.error("Failed to fetch dashboard counts:", error);
        toast.error("Failed to load clerical dashboard counts");
      }
    };

    fetchDashboardCounts();
  }, [navigate, user]);

  useEffect(() => {
    const fetchStockData = async () => {
      try {
        const res = await api.get("/clerical_assistant/dashboardMedicineCount");
        const medicinesObj = res.data.medicines as Record<string, Medicine>;

        // Map backend response to chart format
        const formattedStockData = Object.values(medicinesObj).map(med => ({
          name: med.medicine_name,
          stock: Number(med.total_stock)
        }));

        setStockData(formattedStockData);
        setPage(0)
      } catch (err) {
        console.error("Failed to fetch stock data", err);
        toast.error("Failed to load stock analysis");
      }
    };

    fetchStockData();
  }, []);


  return (
    <div>
      <div className={pageStyles.pageHeader}>
        <div>
          <h1 className={pageStyles.title}>Clerical Dashboard</h1>
          <p className={pageStyles.subtitle}>Welcome back, {toTitleCase(userName)}. {message}</p>
        </div>
      </div>

      <div className={pageStyles.statsGrid} style={{ gridTemplateColumns: 'repeat(3, minmax(180px, 1fr))' }}>
        <div className={pageStyles.statCard}>
          <div className={pageStyles.statIcon} style={{ background: '#fee2e2', color: '#dc2626' }}>
            <PackageX size={20} />
          </div>
          <div>
            <p className={pageStyles.statValue}>{dashboardCounts.out_of_stock_count}</p>
            <div className={pageStyles.statLabel}>Out of Stock</div>
          </div>
        </div>

        <div className={pageStyles.statCard}>
          <div className={pageStyles.statIcon} style={{ background: '#ffedd5', color: '#c2410c' }}>
            <TriangleAlert size={20} />
          </div>
          <div>
            <p className={pageStyles.statValue}>{dashboardCounts.low_stock_count}</p>
            <div className={pageStyles.statLabel}>Low Stock (≤ 30 units)</div>
          </div>
        </div>

        <div className={pageStyles.statCard}>
          <div className={pageStyles.statIcon} style={{ background: '#ede9fe', color: '#6d28d9' }}>
            <ShieldX size={20} />
          </div>
          <div>
            <p className={pageStyles.statValue}>{dashboardCounts.expired_stock_count}</p>
            <div className={pageStyles.statLabel}>Expired Batches</div>
          </div>
        </div>
      </div>

      <div style={{ height: 24 }} />

      <section className={pageStyles.card}>
        <div className={pageStyles.cardHeader}>
          <h2 className={pageStyles.cardHeaderTitle}>
            <ChartNoAxesColumn size={20} /> Medicine Stock Analysis
          </h2>
        </div>
        <div className={pageStyles.cardBody}>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart
              data={currentData}
              layout="vertical"
              margin={{ top: 10, right: 20, left: 110, bottom: 10 }}
              barSize={26}
            >
              <YAxis
                dataKey="name"
                type="category"
                width={110}
                tick={{ fontSize: 13, fill: "#334155" }}
              />
              <XAxis type="number" />
              <Tooltip />
              <Bar dataKey="stock" fill="#1a237e" />
            </BarChart>
          </ResponsiveContainer>

          <div className={pageStyles.pagination}>
            <button
              className={pageStyles.button}
              disabled={page === 0}
              onClick={() => setPage((p) => p - 1)}
              type="button"
            >
              Previous
            </button>

            {Array.from({ length: totalPages }).map((_, i) => (
              <span
                key={i}
                className={`${pageStyles.pageDot} ${i === page ? pageStyles.pageDotActive : ''}`}
                onClick={() => setPage(i)}
              >
                ●
              </span>
            ))}

            <button
              className={pageStyles.button}
              disabled={page === totalPages - 1 || totalPages === 0}
              onClick={() => setPage((p) => p + 1)}
              type="button"
            >
              Next
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};


export default Home;
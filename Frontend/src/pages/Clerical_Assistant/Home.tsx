import React from "react"; 
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../api/axios";

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
 

/* ---------- Styles ---------- */ 

const statsValueStyle: React.CSSProperties = {
  fontSize: "2rem",
  fontWeight: 700,
  color: "#1e40af",
  marginTop: "0.5rem",
};

/* ---------- Component ---------- */
const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();  
  const userName = user?.name || "";

  const [dashboardCounts, setDashboardCounts] = useState({
    dressing_substock_count: 0,
    labtech_substock_count: 0,
    nurse_substock_count: 0,
    pharmacy_substock_count: 0,
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
    navigate("/login/pharmacist");
    return;
  }

  setMessage("All Clerical services are active.");

  const fetchDashboardCounts = async () => {
    try {
      const res = await api.get("/clerical_assistant/getDashboardCounts");  
      setDashboardCounts(res.data);
    } catch (error) {
      console.error("Failed to fetch dashboard counts:", error);
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
      }
    };

    fetchStockData();
  }, []);


  return (
    <div style={{ padding: "1rem" }}>
      <h1 style={{ fontSize: "2rem", fontWeight: 700 }}>
        Welcome back, {toTitleCase(userName)} 👋
      </h1>
      <p>
        <b>{message}</b>
      </p>
      <br />
      <br />

      
      
      {/* --- Substock Requests Full Width --- */}
  <h2
  style={{
    fontSize: "2rem",
    fontWeight: 700,
    textAlign: "center",
    background: "linear-gradient(90deg, #1e40af, #3b82f6)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    marginBottom: "1.5rem",
    letterSpacing: "1px",
  }}
  >
  Main Medicine Stock Status
  </h2>
<div style={{
  display: "flex",
  gap: "1.5rem",
  flexWrap: "wrap",
  justifyContent: "space-between",
  marginBottom: "2rem"
}}>
  <div style={{ ...statsCardStyle, flex: 1, background: "#f0faff" }}>
    <h3 style={{ marginBottom: "0.8rem", color: "#1c43b9" }}>Out of Stock</h3>
    <p style={{ ...statsValueStyle, color: "#055b86" }}>{dashboardCounts.out_of_stock_count}</p>
  </div>

  <div style={{ ...statsCardStyle, flex: 1, background: "#f0faff"}}>
    <h3 style={{ marginBottom: "0.8rem", color: "#1c43b9" }}>Low Stock (Less than 30 units)</h3>
    <p style={{ ...statsValueStyle, color: "#055b86" }}>{dashboardCounts.low_stock_count}</p>
  </div>

  <div style={{ ...statsCardStyle, flex: 1, background: "#f0faff" }}>
    <h3 style={{ marginBottom: "0.8rem", color: "#1c43b9" }}>Expired</h3>
    <p style={{ ...statsValueStyle, color: "#055b86" }}>{dashboardCounts.expired_stock_count}</p>
  </div>
</div>

  {/* <h2
  style={{
    fontSize: "2rem",
    fontWeight: 700,
    textAlign: "center",
    background: "linear-gradient(90deg, #1e40af, #3b82f6)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    marginBottom: "1.5rem",
    letterSpacing: "1px",
  }}
  >
  Request from Substock(s)
  </h2>

<div style={{ 
  display: "grid", 
  gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", 
  gap: "1.5rem", 
  marginBottom: "2rem" 
}}>
  {[
    { label: "Pharmacy", value: dashboardCounts.pharmacy_substock_count, color: "#0033a0", icon: "💊" },
    { label: "Labtech", value: dashboardCounts.labtech_substock_count, color: "#0033a0", icon: "🧪" },
    { label: "Nurse", value: dashboardCounts.nurse_substock_count, color: "#0033a0", icon: "🩺" },
    { label: "Dressing", value: dashboardCounts.dressing_substock_count, color: "#0033a0", icon: "🩹" },
  ].map((substock) => (
    <div key={substock.label} style={{
      borderRadius: "12px",
      padding: "1.2rem",
      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
      transition: "transform 0.2s ease",
    }}>
      <h3 style={{ marginBottom: "0.8rem", color: substock.color }}>
        {substock.icon} {substock.label}
      </h3>
      <p style={{ fontSize: "2rem", fontWeight: "600", color: substock.color }}>
        {substock.value}
      </p>
    </div>
  ))}
</div> 
*/}

      <br />

      <h2
        style={{
          fontSize: "2rem",
          fontWeight: 700,
          textAlign: "center",
          background: "linear-gradient(90deg, #1e40af, #3b82f6)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          marginBottom: "1.5rem",
          letterSpacing: "1px",
        }}
      >
        Medicine Stock Analysis
      </h2>
 
      {/* STOCK ANALYSIS CHARTS */}
            <div style={{ textAlign: "center" }}>
      
              {/* Bar Chart */}
              <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={currentData}
                layout="vertical"
                margin={{ top: 20, right: 30, left: 100, bottom: 20 }}
                barSize={27}
              >
                <YAxis
                  dataKey="name"
                  type="category"
                  width={100}
                  tick={{ fontSize: 16, fill: "#333" }}
                />
                <XAxis type="number" />
                <Tooltip />
                <Bar dataKey="stock" fill="#1e40af" />
              </BarChart>
            </ResponsiveContainer>
      
            {/* Pagination Controls */}
            <div style={{ marginTop: "1rem", display: "flex", justifyContent: "center", gap: "0.5rem" }}>
              {/* Previous Button */}
              <button
              disabled={page === 0} // disable when on the first page
              onClick={() => setPage((p) => p - 1)} // go back one page
              style={{
                  padding: "0.6rem 1.2rem",
                  cursor: page === 0 ? "not-allowed" : "pointer",
                  borderRadius: "8px",
                  border: "none",
                  fontWeight: 600,
                  background: page === 0
                  ? "#cbd5e1" // gray when disabled
                  : "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                  color: "white",
                  boxShadow: page === 0 ? "none" : "0 4px 10px rgba(37,99,235,0.3)",
                  transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                  if (page !== 0) {
                  e.currentTarget.style.transform = "scale(1.05)";
                  }
              }}
              onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
              }}
              >
              ← Previous
              </button>
      
              {/* Page indicators */}
              {Array.from({ length: totalPages }).map((_, i) => (
              <span
                  key={i}
                  onClick={() => setPage(i)}
                  style={{
                  cursor: "pointer",
                  fontSize: "1.5rem",
                  color: i === page ? "#1e40af" : "#94a3b8",
                  }}
              >
                  o
              </span>
              ))}
      
              {/* Next Button */}
              <button
              disabled={page === totalPages - 1} // disable when on the last page
              onClick={() => setPage((p) => p + 1)} // go forward one page
              style={{
                  padding: "0.6rem 1.2rem",
                  cursor: page === totalPages - 1 ? "not-allowed" : "pointer",
                  borderRadius: "8px",
                  border: "none",
                  fontWeight: 600,
                  background: page === totalPages - 1
                  ? "#cbd5e1"
                  : "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                  color: "white",
                  boxShadow: page === totalPages - 1 ? "none" : "0 4px 10px rgba(37,99,235,0.3)",
                  transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                  if (page !== totalPages - 1) {
                  e.currentTarget.style.transform = "scale(1.05)";
                  }
              }}
              onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
              }}
              >
              Next →
              </button>
            </div>
          </div>
    </div>
  );
};

const statsCardStyle: React.CSSProperties = {
  padding: "1rem 1.5rem",
  borderRadius: "12px",
  boxShadow: "0 6px 15px rgba(0,0,0,0.08)",
  transition: "transform 0.2s ease, box-shadow 0.2s ease",
  cursor: "pointer",
};
 

export default Home;
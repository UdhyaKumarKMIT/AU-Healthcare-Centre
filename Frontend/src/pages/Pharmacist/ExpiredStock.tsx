import { useState, useEffect } from "react";
import { Activity, ShieldX, Pill } from "lucide-react";
import api from "../../api/axios";

/* ---------- Component ---------- */
const ExpiredStockPage = () => {
  const [expiredMedicines, setExpiredMedicines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExpiredMedicine = async () => {
      try {
        const response = await api.get("/pharmacy/expiryMedicine");
        setExpiredMedicines(response.data.items || []);
      } catch (err) {
        console.error("Failed to fetch expired medicine:", err);
        alert("Failed to fetch expired medicine.");
      } finally {
        setLoading(false);
      }
    };

    fetchExpiredMedicine();
  }, []);

  const handleClear = async (batchId: string) => {
    if (!window.confirm("Are you sure you want to clear this batch?")) return;

    try {
      const response = await api.delete(
        `/pharmacy/clearMedicineBatch/${batchId}`
      );
      if (response.status === 200) {
        const response = await api.get("/pharmacy/expiryMedicine");
        setExpiredMedicines(response.data.items || []);
        alert("Stock cleared successfully!");
      }
    } catch (err) {
      console.error("Failed to clear stock:", err);
      alert("Failed to clear stock.");
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
      {/* HEADER */}
      <div
        style={{
          background: "linear-gradient(90deg, #1e40af, #1e3a8a)",
          color: "white",
        }}
      >
        <div style={{ maxWidth: 1400, margin: "auto", padding: "1rem" }}>
          <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
            <Activity />
            <div>
              <h2 style={{ margin: 0 }}>MIT Pharmacy</h2>
              <small>Expired Stock</small>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN */}
      <main
        style={{
          maxWidth: 1200,
          margin: "auto",
          padding: "2rem",
          color: "black",
        }}
      >
        <div style={sectionCardStyle}>
          {/* SECTION HEADER */}
          <div style={sectionHeaderStyle}>
            <ShieldX size={22} />
            Expired Medicine Stock
          </div>

          {/* CONTENT */}
          {loading ? (
            <p>Loading expired medicines...</p>
          ) : expiredMedicines.length === 0 ? (
            <p>No expired medicines found 🎉</p>
          ) : (
            expiredMedicines.map((med, idx) => (
  <article key={idx} style={prescriptionRowStyle}>
    <div style={{ display: "flex", gap: "1.5rem" }}>
      <div style={iconBoxStyle}>
        <Pill size={20} />
      </div>

      <div style={{ flex: 1 }}>
        <p>
          <strong>Medicine:</strong> {med.medicine_name}
        </p>
        <p>
          <strong>Batch ID:</strong> {med.batch_id}
        </p>
        <p>
          <strong>Expiry Date:</strong>{" "}
          {new Date(med.expiry_date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </p>
        <p>
          <strong>In Stock:</strong> {med.in_stock} units
        </p>

        {/* CLEAR BUTTON AT BOTTOM */}
        <div style={{ display: "flex", justifyContent: "flex-start", marginTop: "1rem" }}>
          <button
            onClick={() => handleClear(med.batch_id)}
            style={clearButtonStyle}
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  </article>
))

          )}
        </div>
      </main>
    </div>
  );
};

/* ---------- STYLES ---------- */

const sectionCardStyle: React.CSSProperties = {
  background: "#ffffff",
  borderRadius: "10px",
  padding: "2rem",
  border: "1px solid #cbd5e1",
  boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
};

const sectionHeaderStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
  fontSize: "1.5rem",
  fontWeight: 700,
  color: "#1e40af",
  marginBottom: "1.5rem",
};

const prescriptionRowStyle: React.CSSProperties = {
  background: "#f9fafb",
  border: "1px solid #e5e7eb",
  borderRadius: "8px",
  padding: "1.25rem",
  marginBottom: "1rem",
  display: "flex",
  alignItems: "center",
};

const iconBoxStyle: React.CSSProperties = {
  width: 42,
  height: 42,
  borderRadius: "50%",
  background: "#fee2e2",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#dc2626",
};

const clearButtonStyle: React.CSSProperties = {
  background: "#dc2626",
  color: "white",
  border: "none",
  padding: "0.5rem 1rem",
  borderRadius: "6px",
  fontWeight: 700,
  cursor: "pointer",
  height: "fit-content",
};

export default ExpiredStockPage;

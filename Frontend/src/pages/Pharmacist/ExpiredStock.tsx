import { useState, useEffect } from "react";
import { ShieldX, Pill } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { useAuth } from "../../contexts/AuthContext";
import CustomModal from "./CustomModal";

/* ---------- Component ---------- */
const ExpiredStockPage = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalConfirmCallback, setModalConfirmCallback] = useState<(() => void) | null>(null);

  const { user } = useAuth();
  const navigate = useNavigate();

  const [expiredMedicines, setExpiredMedicines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!user) {
      navigate("/login/pharmacist");
      return;
    }

    const fetchExpiredMedicine = async () => {
      try {
        const response = await api.get("/pharmacy/expiryMedicine");
        setExpiredMedicines(response.data.items || []);
      } catch (err) {
        console.error("Failed to fetch expired medicine:", err);
        setModalMessage("Failed to fetch expired medicine.");
        setModalOpen(true);
      } finally {
        setLoading(false);
      }
    };

    fetchExpiredMedicine();
  }, [navigate, user]);

  const handleClear = (batchId: string) => {
    setModalMessage("Are you sure you want to clear this batch?");
    setModalConfirmCallback(() => () => {
      clearBatchConfirmed(batchId);
    });
    setModalOpen(true);
  };

  const filteredMedicines = expiredMedicines.filter((med) =>
    med.medicine_name
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const clearBatchConfirmed = async (batchId: string) => {
    try {
      const secretCode = window.prompt("Enter pharmacist secret code to clear this batch:");
      if (!secretCode) {
        setModalMessage("Secret code is required to clear stock.");
        setModalOpen(true);
        return;
      }

      const response = await api.delete(
        `/pharmacy/clearMedicineBatch/${batchId}`,
        {
          params: { secret_code: secretCode }
        }
      );
      if (response.status === 200) {
        const response = await api.get("/pharmacy/expiryMedicine");
        setExpiredMedicines(response.data.items || []);
        setModalMessage("Stock cleared successfully!");
        setModalOpen(true);
      }
    } catch (err) {
      console.error("Failed to clear stock:", err);
      setModalMessage("Failed to clear stock.");
      setModalOpen(true);
    }
  };

  return (
    <>
      <CustomModal
        isOpen={modalOpen}
        title="Alert"
        message={modalMessage}
        confirmText="OK"
        onConfirm={modalConfirmCallback ?? undefined}
        onClose={() => {
          setModalConfirmCallback(null);
          setModalOpen(false);
        }}
      />
      <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
        {/* HEADER */}
        <div
          style={{
            background: "linear-gradient(90deg, #1e40af, #1e3a8a)",
            color: "white",
          }}
        >
        </div>

        {/* MAIN */}
        <main
          style={{
            maxWidth: 1200,
            margin: "auto",
            padding: "1rem",
            color: "black",
          }}
        >
          <div style={sectionCardStyle}>
            {/* SECTION HEADER */}
            <div style={sectionHeaderStyle}>
              <ShieldX size={22} />
              Expired Medicine Stock
            </div>

            {/* SEARCH BAR */}
            <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.5rem" }}>
              <input
                type="text"
                placeholder="Search medicine name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  flex: 1,
                  padding: "0.5rem 0.75rem",
                  borderRadius: "6px",
                  border: "1px solid #cbd5e1",
                  fontSize: "0.95rem"
                }}
              />
              <button
                onClick={() => setSearchTerm("")}
                style={{
                  background: "#1e40af",
                  color: "white",
                  border: "none",
                  padding: "0.5rem 1rem",
                  borderRadius: "6px",
                  fontWeight: 600,
                  cursor: "pointer"
                }}
              >
                Clear
              </button>
            </div>

            {/* CONTENT */}
            {loading ? (
              <p>Loading expired medicines...</p>
            ) : filteredMedicines.length === 0 ? (
              <p>No expired medicines found</p>
            ) : (
              filteredMedicines.map((med, idx) => (
                <article key={idx} style={prescriptionRowStyle}>
                  <div style={{ display: "flex", gap: "1.5rem", fontFamily: "verdana" }}>
                    <div style={iconBoxStyle}>
                      <Pill size={20} />
                    </div>

                    <div style={{ flex: 1 }}>
                      <p style={{ paddingBottom: "2px" }}>
                        <strong>Medicine:</strong> {med.medicine_name}
                      </p>
                      <p style={{ paddingBottom: "2px" }}>
                        <strong>Batch ID:</strong> {med.batch_id}
                      </p>
                      <p style={{ paddingBottom: "2px" }}>
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
    </>
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

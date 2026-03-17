import { useState, useEffect } from "react";
import { ShieldX, Pill } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { useAuth } from "../../contexts/AuthContext";
import CustomModal from "./CustomModal";
import { toast } from "react-toastify";
import pageStyles from "../shared/RolePage.module.css";

/* ---------- Component ---------- */
const ExpiredStockPage = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalConfirmCallback, setModalConfirmCallback] = useState<(() => void) | null>(null);

  const [secretCode, setSecretCode] = useState("");

  const { user } = useAuth();
  const navigate = useNavigate();

  const [expiredMedicines, setExpiredMedicines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!user) {
      navigate("/login");
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
        toast.error("Failed to fetch expired medicine");
      } finally {
        setLoading(false);
      }
    };

    fetchExpiredMedicine();
  }, [navigate, user]);

  const handleClear = (batchId: string) => {
    if (!secretCode.trim()) {
      setModalMessage("Enter a secret code to clear stock.");
      setModalConfirmCallback(null);
      setModalOpen(true);
      toast.info("Secret code required to clear stock");
      return;
    }

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
      const normalizedSecretCode = secretCode.trim();
      if (!normalizedSecretCode) {
        setModalMessage("Secret code is required to clear stock.");
        setModalOpen(true);
        return;
      }

      const response = await api.delete(
        `/pharmacy/clearMedicineBatch/${batchId}`,
        {
          params: { secret_code: normalizedSecretCode }
        }
      );
      if (response.status === 200) {
        const response = await api.get("/pharmacy/expiryMedicine");
        setExpiredMedicines(response.data.items || []);
        setModalMessage("Stock cleared successfully!");
        setModalOpen(true);
        toast.success("Stock cleared successfully");
      }
    } catch (err) {
      console.error("Failed to clear stock:", err);
      setModalMessage("Failed to clear stock.");
      setModalOpen(true);
      toast.error("Failed to clear stock");
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
      <section className={pageStyles.card}>
        <div className={pageStyles.cardHeader}>
          <h2 className={pageStyles.cardHeaderTitle}>
            <ShieldX size={20} /> Expired Medicine Stock
          </h2>
        </div>

        <div className={pageStyles.cardBody}>
          <div className={pageStyles.toolbar}>
            <div className={pageStyles.controls}>
              <input
                type="text"
                placeholder="Search medicine name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={pageStyles.input}
              />

              <input
                type="password"
                placeholder="Enter secret code"
                value={secretCode}
                onChange={(e) => setSecretCode(e.target.value)}
                className={pageStyles.input}
                autoComplete="off"
              />
            </div>

            <button
              onClick={() => setSearchTerm("")}
              className={`${pageStyles.button} ${pageStyles.buttonPrimary}`}
              type="button"
            >
              Clear
            </button>
          </div>

          <div style={{ height: 16 }} />

          {loading ? (
            <p className={pageStyles.muted}>Loading expired medicines...</p>
          ) : filteredMedicines.length === 0 ? (
            <p className={pageStyles.muted}>No expired medicines found</p>
          ) : (
            filteredMedicines.map((med, idx) => (
              <article key={idx} style={prescriptionRowStyle}>
                <div style={{ display: "flex", gap: "1.25rem", fontFamily: "verdana" }}>
                  <div style={iconBoxStyle}>
                    <Pill size={20} />
                  </div>

                  <div style={{ flex: 1 }}>
                    <p style={{ paddingBottom: 2 }}>
                      <strong>Medicine:</strong> {med.medicine_name}
                    </p>
                    <p style={{ paddingBottom: 2 }}>
                      <strong>Batch ID:</strong> {med.batch_id}
                    </p>
                    <p style={{ paddingBottom: 2 }}>
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

                    <div style={{ display: "flex", justifyContent: "flex-start", marginTop: "1rem" }}>
                      <button
                        onClick={() => handleClear(med.batch_id)}
                        className={`${pageStyles.button} ${pageStyles.buttonDanger}`}
                        type="button"
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
      </section>
    </>
  );
};

/* ---------- STYLES ---------- */

const prescriptionRowStyle: React.CSSProperties = {
  background: "#ffffff",
  border: "1px solid #e2e8f0",
  borderRadius: "12px",
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

export default ExpiredStockPage;

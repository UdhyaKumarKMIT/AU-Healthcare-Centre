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

  const { user } = useAuth();
  const navigate = useNavigate();

  const [expiredMedicines, setExpiredMedicines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    const fetchExpiredMedicine = async () => {
      try {
        const response = await api.get("/clerical_assistant/expiryMedicine");
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
    setModalMessage("Are you sure you want to clear this batch?");
    setModalConfirmCallback(() => () => {
      clearBatchConfirmed(batchId);
    });
    setModalOpen(true);
  };

  const clearBatchConfirmed = async (batchId: string) => {

    try {
      const response = await api.delete(
        `/clerical_assistant/clearMedicineBatch/${batchId}`,
      );
      if (response.status === 200) {
        const response = await api.get("/clerical_assistant/expiryMedicine");
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
          {loading ? (
            <p className={pageStyles.muted}>Loading expired medicines...</p>
          ) : expiredMedicines.length === 0 ? (
            <p className={pageStyles.muted}>No expired medicines found.</p>
          ) : (
            expiredMedicines.map((med, idx) => (
              <article key={idx} style={prescriptionRowStyle}>
                <div style={{ display: "flex", gap: "1.25rem" }}>
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

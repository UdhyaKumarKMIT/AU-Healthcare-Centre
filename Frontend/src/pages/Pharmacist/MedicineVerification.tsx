import { useState, useEffect } from "react";
import { Pill, PillBottleIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { useAuth } from "../../contexts/AuthContext";
import CustomModal from "./CustomModal";
import { toast } from "react-toastify";
import pageStyles from "../shared/RolePage.module.css";

interface Batch {
  batch_no: string;
  quantity: number;
  expiry: string;
}

interface PendingMedicine {
  medicine_id: string;
  medicine_name: string;
  batches: Batch[];
}

/* ---------- Component ---------- */
const MedicineVerification = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalConfirmCallback, setModalConfirmCallback] = useState<(() => void) | null>(null);

  const [secretCode, setSecretCode] = useState("");

  const { user } = useAuth();
  const navigate = useNavigate();

  const [verifiedMedicines, setverifiedMedicines] = useState<PendingMedicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");


  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    const fetchverifiedMedicine = async () => {
      try {
        const response = await api.get("/pharmacy/getVerificationStock");
        setverifiedMedicines(response.data.pendingStocks || []);
      } catch (err) {
        console.error("Failed to fetch medicine:", err);
        setModalMessage("Failed to fetch medicine.");
        setModalOpen(true);
        toast.error("Failed to fetch medicines for verification");
      } finally {
        setLoading(false);
      }
    };

    fetchverifiedMedicine();
  }, [navigate, user]);

  const handleVerify = (batchNo: string) => {
    if (!secretCode.trim()) {
      setModalMessage("Enter a secret code to verify stock.");
      setModalConfirmCallback(null);
      setModalOpen(true);
      toast.info("Secret code required to verify stock");
      return;
    }

    setModalMessage("Are you sure you want to verify this batch?");
    setModalConfirmCallback(() => () => {
      verifyBatchConfirmed(batchNo);
    });
    setModalOpen(true);
  };

  const filteredMedicines = verifiedMedicines.filter(med =>
    med.medicine_name.toLowerCase().includes(search.toLowerCase())
  );


  const verifyBatchConfirmed = async (batchNo: string) => {
    try {
      const normalizedSecretCode = secretCode.trim();
      if (!normalizedSecretCode) {
        setModalMessage("Secret code is required to verify stock.");
        setModalOpen(true);
        return;
      }

      await api.post("/pharmacy/verifyStock", {
        batch_no: batchNo,
        secret_code: normalizedSecretCode,
      });

      const res = await api.get("/pharmacy/getVerificationStock");
      setverifiedMedicines(res.data.pendingStocks || []);

      setModalMessage("Stock verified successfully!");
      setModalOpen(true);
      toast.success("Stock verified successfully");
    } catch (err) {
      console.error("Verification failed:", err);
      setModalMessage("Failed to verify stock.");
      setModalOpen(true);
      toast.error("Failed to verify stock");
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
            <PillBottleIcon size={20} /> Issued Medicine Stock
          </h2>
        </div>

        <div className={pageStyles.cardBody}>
          <div className={pageStyles.toolbar}>
            <div className={pageStyles.controls}>
              <input
                type="text"
                placeholder="Search by medicine name"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
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
              onClick={() => setSearch("")}
              className={`${pageStyles.button} ${pageStyles.buttonPrimary}`}
              type="button"
            >
              Clear
            </button>
          </div>

          <div style={{ height: 16 }} />

          {loading ? (
            <p className={pageStyles.muted}>Loading medicines for verification...</p>
          ) : filteredMedicines.length === 0 ? (
            <p className={pageStyles.muted}>No medicines found for verification</p>
          ) : (
            filteredMedicines.map((med) =>
              med.batches.map((batch) => (
                <article key={batch.batch_no} style={prescriptionRowStyle}>
                  <div style={{ display: "flex", gap: "1.25rem", fontFamily: "verdana" }}>
                    <div style={iconBoxStyle}>
                      <Pill size={20} />
                    </div>

                    <div style={{ flex: 1 }}>
                      <p style={{ paddingBottom: 2 }}>
                        <strong>Medicine:</strong> {med.medicine_name}
                      </p>
                      <p style={{ paddingBottom: 2 }}>
                        <strong>Batch ID:</strong> {batch.batch_no}
                      </p>
                      <p style={{ paddingBottom: 2 }}>
                        <strong>Expiry Date:</strong>{" "}
                        {new Date(batch.expiry).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                      <p>
                        <strong>In Stock:</strong> {batch.quantity} units
                      </p>

                      <div style={{ display: "flex", justifyContent: "flex-start", marginTop: "1rem" }}>
                        <button
                          onClick={() => handleVerify(batch.batch_no)}
                          className={`${pageStyles.button} ${pageStyles.buttonDanger}`}
                          type="button"
                        >
                          Verified
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              ))
            )
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

export default MedicineVerification;

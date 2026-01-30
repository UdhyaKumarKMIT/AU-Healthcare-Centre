import { useState, useEffect } from "react";
import { Pill, PillBottleIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { useAuth } from "../../contexts/AuthContext";
import CustomModal from "./CustomModal";

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

  const { user } = useAuth();
  const navigate = useNavigate();
  
  const pharmacistId = user?.pharmacist_id;

  const [verifiedMedicines, setverifiedMedicines] = useState<PendingMedicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");


  useEffect(() => {
    if (!pharmacistId) {
      navigate("/login/pharmacist");
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
      } finally {
        setLoading(false);
      }
    };

    fetchverifiedMedicine();
  }, [pharmacistId, navigate]);

  const handleVerify = (batchNo: string) => {
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
    await api.post("/pharmacy/verifyStock", {
      batch_no: batchNo
    });

    const res = await api.get("/pharmacy/getVerificationStock");
    setverifiedMedicines(res.data.pendingStocks || []);

    setModalMessage("Stock verified successfully!");
    setModalOpen(true);
  } catch (err) {
    console.error("Verification failed:", err);
    setModalMessage("Failed to verify stock.");
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
            <PillBottleIcon size={22} />
            Issued Medicine Stock
          </div>

          {/* SEARCH BAR */}
<div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem" }}>
  <input
    type="text"
    placeholder="Search by medicine name"
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    style={{
      flex: 1,
      padding: "0.6rem 1rem",
      borderRadius: "8px",
      border: "1px solid #cbd5e1",
      fontSize: "1rem",
    }}
  />

  <button
    onClick={() => setSearch("")}
    style={{
      padding: "0.6rem 1.2rem",
      borderRadius: "8px",
      border: "none",
      background: "#1e40af",
      color: "white",
      fontWeight: 700,
      cursor: "pointer",
    }}
  >
    Clear
  </button>
</div>


          {/* CONTENT */}
          {loading ? (
            <p>Loading medicines for verification...</p>
          ) : filteredMedicines.length === 0 ? (
            <p>No medicines found for verification</p>
          ) : (
            filteredMedicines.map((med, idx) => (
                med.batches.map((batch, bIdx) => (
  <article key={batch.batch_no} style={prescriptionRowStyle}>
    <div style={{ display: "flex", gap: "1.5rem", fontFamily: "verdana"}}>
      <div style={iconBoxStyle}>
        <Pill size={20} />
      </div>

      <div style={{ flex: 1 }}>
        <p style={{paddingBottom: "2px"}}>
          <strong>Medicine:</strong> {med.medicine_name}
        </p>
        <p style={{paddingBottom: "2px"}}>
          <strong>Batch ID:</strong> {batch.batch_no}
        </p>
        <p style={{paddingBottom: "2px"}}>
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

        {/* CLEAR BUTTON AT BOTTOM */}
        <div style={{ display: "flex", justifyContent: "flex-start", marginTop: "1rem" }}>
          <button
            onClick={() => handleVerify(batch.batch_no)}
            style={clearButtonStyle}
          >
            Verified
          </button>
        </div>
      </div>
    </div>
  </article>
)))
            )
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

export default MedicineVerification;

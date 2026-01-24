import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import api from "../../api/axios"; 
import CustomModal from "./CustomModal";

const AddMedicineStockPage = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalConfirmCallback, setModalConfirmCallback] = useState<(() => void) | null>(null);
  const [navigateOnClose, setNavigateOnClose] = useState(false);

  const { name } = useParams();
  const navigate = useNavigate();

  const [batchId, setBatchId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [expiryDate, setExpiryDate] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); 

    try {
      const response = await api.post("/clerical_assistant/medicine/addStock", {
        medicine_name: name,
        batch_id: batchId,
        in_stock: quantity,
        expiry_date: expiryDate,
      });

      if (response.status === 201) {
        setModalMessage("Stock added successfully!");
        setModalConfirmCallback(null);  
        setModalOpen(true);
        setNavigateOnClose(true); 
      } else {
        setModalMessage(`Unexpected response: ${response.status}`);
        setModalOpen(true);
        setNavigateOnClose(false); 
      }
    } catch (err) {
      console.error("Failed to add stock:", err);
      setModalMessage("Failed to add stock. Please try again.");
      setModalOpen(true);
      setNavigateOnClose(false); 
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
        setModalOpen(false);
        if (navigateOnClose) {
          navigate(-1);
          setNavigateOnClose(false);
        }
      }}
    />

    <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
      {/* HEADER */}
      <header
        style={{
          background: "linear-gradient(90deg, #1e40af, #1e3a8a)",
          color: "white",
        }}
      >   
      </header>

      {/* MAIN */}
      <main
        style={{
          maxWidth: 1200,
          margin: "auto",
          padding: "1rem",
          color: "black",
        }}
      >
        <div style={cardStyle}>
          {/* TITLE + BACK */}
          <div style={cardHeaderStyle}>
            <h3 style={{ margin: 0, color: "#1e40af" }}>
              Add Medicine Stock
            </h3>

            <button
              type="button"
              onClick={() => navigate(-1)}
              aria-label="Go back"
              style={backButtonStyle}
            >
              <ArrowLeft size={16} /> Back
            </button>
          </div>

          <form
            onSubmit={handleSubmit}
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          >
            {/* Medicine Name */}
            <div>
              <label htmlFor="medicineName" style={labelStyle}>
                Medicine Name
              </label>
              <input
                id="medicineName"
                type="text"
                value={name}
                readOnly
                style={{...inputStyle, fontWeight: "bold"}}
              />
            </div>

            {/* Batch ID */}
            <div>
              <label htmlFor="batchId" style={labelStyle}>
                Batch No
              </label>
              <input
                id="batchId"
                type="text"
                value={batchId}
                onChange={(e) => setBatchId(e.target.value)}
                required
                style={inputStyle}
              />
            </div>

            {/* Quantity */}
            <div>
              <label htmlFor="quantity" style={labelStyle}>
                Quantity Added
              </label>
              <input
                id="quantity"
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
                style={inputStyle}
              />
            </div>

            {/* Expiry Date */}
            <div>
              <label htmlFor="expiryDate" style={labelStyle}>
                Expiry Date
              </label>
              <input
                id="expiryDate"
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                required
                min={new Date(new Date().setMonth(new Date().getMonth() + 1))
                  .toISOString()
                  .split("T")[0]} // sets min date to 1 month from today
                style={{ ...inputStyle, color: "white", backgroundColor: "#0962bcff" }}
              />
            </div>

            <button type="submit" style={primaryButtonStyle}>
              Add Stock
            </button>
          </form>
        </div>
      </main>
    </div>
    </>
  );
};

/* ---------- STYLES ---------- */

const cardStyle: React.CSSProperties = {
  background: "#ffffff",
  borderRadius: "10px",
  padding: "2rem",
  border: "1px solid #cbd5e1",
  boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
};

const cardHeaderStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "1.5rem",
  fontSize: "1.2rem"
};

const labelStyle: React.CSSProperties = {
  display: "block",
  marginBottom: "0.25rem",
  fontWeight: 700,
  color: "#1e40af",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  display: "block",
  padding: "0.6rem 0rem 0.6rem 0rem",
  borderRadius: "6px",
  border: "1px solid #cbd5e1",
  background: "white",
  color: "black",
};

const primaryButtonStyle: React.CSSProperties = {
  marginTop: "1rem",
  width: "100%",
  padding: "0.75rem 1rem",
  borderRadius: "8px",
  border: "none",
  background: "#1e40af",
  color: "white",
  fontWeight: 700,
  cursor: "pointer",
};

const backButtonStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "0.25rem",
  background: "#dbeafe",
  color: "#1e40af",
  border: "1px solid #93c5fd",
  padding: "0.4rem 0.75rem",
  borderRadius: "6px",
  cursor: "pointer",
  fontWeight: 600,
};

export default AddMedicineStockPage;

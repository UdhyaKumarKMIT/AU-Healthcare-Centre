import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import api from "../../api/axios";
import CustomModal from "./CustomModal";
import { toast } from "react-toastify";
import pageStyles from "../shared/RolePage.module.css";

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
        toast.success("Stock added successfully");
      } else {
        setModalMessage(`Unexpected response: ${response.status}`);
        setModalOpen(true);
        setNavigateOnClose(false);
        toast.error(`Unexpected response: ${response.status}`);
      }
    } catch (err) {
      console.error("Failed to add stock:", err);
      setModalMessage("Failed to add stock. Please try again.");
      setModalOpen(true);
      setNavigateOnClose(false);
      toast.error("Failed to add stock");
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

      <section className={pageStyles.card}>
        <div className={pageStyles.cardHeader}>
          <h3 className={pageStyles.cardHeaderTitle}>Add Medicine Stock</h3>
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label="Go back"
            className={pageStyles.button}
          >
            <ArrowLeft size={16} /> Back
          </button>
        </div>

        <div className={pageStyles.cardBody}>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <label htmlFor="medicineName" style={{ display: "block", marginBottom: 6, fontWeight: 700 }}>
                Medicine Name
              </label>
              <input
                id="medicineName"
                type="text"
                value={name}
                readOnly
                className={pageStyles.input}
                style={{ width: "100%", fontWeight: 700 }}
              />
            </div>

            <div>
              <label htmlFor="batchId" style={{ display: "block", marginBottom: 6, fontWeight: 700 }}>
                Batch No
              </label>
              <input
                id="batchId"
                type="text"
                value={batchId}
                onChange={(e) => setBatchId(e.target.value)}
                required
                className={pageStyles.input}
                style={{ width: "100%" }}
              />
            </div>

            <div>
              <label htmlFor="quantity" style={{ display: "block", marginBottom: 6, fontWeight: 700 }}>
                Quantity Added
              </label>
              <input
                id="quantity"
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
                className={pageStyles.input}
                style={{ width: "100%" }}
              />
            </div>

            <div>
              <label htmlFor="expiryDate" style={{ display: "block", marginBottom: 6, fontWeight: 700 }}>
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
                  .split("T")[0]}
                className={pageStyles.input}
                style={{ width: "100%" }}
              />
            </div>

            <button type="submit" className={`${pageStyles.button} ${pageStyles.buttonPrimary}`}>
              Add Stock
            </button>
          </form>
        </div>
      </section>
    </>
  );
};

export default AddMedicineStockPage;

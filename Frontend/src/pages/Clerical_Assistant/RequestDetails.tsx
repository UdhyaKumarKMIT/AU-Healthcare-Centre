import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PillBottle, CheckLine } from "lucide-react";
import api from "../../api/axios";
import CustomModal from "./CustomModal";
import { toast } from "react-toastify";
import pageStyles from "../shared/RolePage.module.css";

/* ---------- TYPES ---------- */
interface Batch {
  batch_id: string;
  expiry_date: string;
  in_stock: number;
}

interface RequestDetailsResponse {
  batches: Batch[];
}

/* ---------- COMPONENT ---------- */
const normalizeSubstock = (name: string) =>
  name.toLowerCase().replace(/\s+/g, "_").trim();


const RequestDetails = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalConfirmCallback, setModalConfirmCallback] = useState<(() => void) | null>(null);
  const [navigateOnClose, setNavigateOnClose] = useState(false);

  const navigate = useNavigate();

  const SUBSTOCK_MAP: Record<string, number> = {
    dressing_substock: 1,
    labtech_substock: 2,
    nurse_substock: 3,
    pharmacy_substock: 4,
  };

  const medicineId = sessionStorage.getItem("medicineId");
  const medicineName = sessionStorage.getItem("medicineName");
  const [activeStock, setActiveStock] = useState([]);
  const [selectedStock, setSelectedStock] = useState<string>("");

  const [data, setData] = useState<RequestDetailsResponse | null>(null);


  // visible batches for current stock
  const [visibleBatches, setVisibleBatches] = useState<Batch[]>([]);

  const [allocation, setAllocation] = useState<
    Record<string, Record<string, number>>
  >({}); // allocation[stock][batch_id] = qty

  /* ---------- NAVIGATION CHECK ---------- */
  useEffect(() => {
    if (!medicineId || !medicineName) {
      setModalMessage("Invalid medicine selection");
      setModalConfirmCallback(null);
      setModalOpen(true);
      setNavigateOnClose(true);
      toast.error("Invalid medicine selection");
    }

    setActiveStock(JSON.parse(
      sessionStorage.getItem("activeStock") || "[]"
    ))


  }, [medicineId, medicineName, navigate]);

  useEffect(() => {
    if (activeStock.length > 0) {
      setSelectedStock((prev) => prev || activeStock[0]);
    }
  }, [activeStock]);

  /* ---------- FETCH DETAILS ---------- */
  useEffect(() => {
    if (!medicineId) return;

    const fetchDetails = async () => {
      try {
        const res = await api.get("/clerical_assistant/requestDetails", {
          params: { id: medicineId },
        });
        setData(res.data);
        // Initially show only first batch
        if (res.data.batches.length > 0) {
          setVisibleBatches([res.data.batches[0]]);
        }
      } catch {
        setModalMessage("Could not load medicine details");
        setModalConfirmCallback(null);
        setModalOpen(true);
        toast.error("Could not load medicine details");
      }
    };

    fetchDetails();
  }, [medicineId]);

  /* ---------- ALLOCATION HANDLER ---------- */
  const handleAllocateChange = (
    batch_id: string,
    value: number,
    visibleIndex: number
  ) => {
    if (!data) return;

    const batch = visibleBatches[visibleIndex];
    const qty = Math.min(value, batch.in_stock);

    setAllocation((prev) => {
      const updatedStockAlloc = {
        ...(prev[selectedStock] || {}),
        [batch_id]: qty,
      };

      // ❌ Remove allocations of batches AFTER this one
      visibleBatches.slice(visibleIndex + 1).forEach((b) => {
        delete updatedStockAlloc[b.batch_id];
      });

      return {
        ...prev,
        [selectedStock]: updatedStockAlloc,
      };
    });

    // ✅ FIFO visibility logic
    if (qty === batch.in_stock) {
      const allBatches = data.batches;
      const globalIndex = allBatches.findIndex(
        (b) => b.batch_id === batch_id
      );

      if (globalIndex !== -1 && globalIndex + 1 < allBatches.length) {
        setVisibleBatches((prev) => {
          // prevent duplicate push
          if (prev.some((b) => b.batch_id === allBatches[globalIndex + 1].batch_id)) {
            return prev;
          }
          return [...prev, allBatches[globalIndex + 1]];
        });
      }
    } else {
      // ❌ If batch is NOT fully allocated, remove all next batches
      setVisibleBatches((prev) => prev.slice(0, visibleIndex + 1));
    }
  };


  const handleIssueStock = async () => {
    if (!data) return;

    console.log(allocation)
    const batchesPayload: { batch_id: string; quantity: number; substockCode: number }[] = [];
    Object.entries(allocation).forEach(([substockName, batches]) => {
      const normalized = normalizeSubstock(substockName);
      const substockCode = SUBSTOCK_MAP[normalized as keyof typeof SUBSTOCK_MAP];
      if (!substockCode) return;

      Object.entries(batches).forEach(([batch_id, quantity]) => {
        if (quantity > 0) {
          batchesPayload.push({ batch_id, quantity, substockCode });
        }
      });
    });

    console.log(batchesPayload)

    try {
      await api.post("/clerical_assistant/issue", {
        medicine_id: medicineId,
        batches: batchesPayload,
      });

      setModalMessage("Stock issued successfully!");
      setModalConfirmCallback(null);
      setModalOpen(true);
      setNavigateOnClose(true);
      toast.success("Stock issued successfully");

    } catch {
      setModalMessage("Failed to issue stock");
      setModalOpen(true);
      toast.error("Failed to issue stock");
    }
  };

  const toTitleCase = (str: string) =>
    str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());

  /* ---------- RENDER ---------- */
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
          <h2 className={pageStyles.cardHeaderTitle}>
            <PillBottle size={20} /> {toTitleCase(medicineName || "Unknown")}
          </h2>
        </div>

        <div className={pageStyles.cardBody}>
          <div className={pageStyles.controls} style={{ marginBottom: "1rem" }}>
            {activeStock.map((stock) => (
              <button
                key={stock}
                type="button"
                onClick={() => {
                  setSelectedStock(stock);
                  if (data?.batches.length) setVisibleBatches([data.batches[0]]);
                }}
                className={`${pageStyles.button} ${stock === selectedStock ? pageStyles.buttonPrimary : ""}`}
              >
                {stock}
              </button>
            ))}
          </div>

          {activeStock.length === 0 || !visibleBatches.length ? (
            <div
              style={{
                padding: "1rem",
                textAlign: "center",
                fontWeight: 600,
                background: "#f8fafc",
                borderRadius: 10,
                border: "1px solid #e2e8f0",
              }}
            >
              {activeStock.length === 0 ? "No pending requests" : "No medicine batches available to issue"}
            </div>
          ) : (
            visibleBatches.map((batch, index) => {
              const allocatedQty = allocation[selectedStock]?.[batch.batch_id] || 0;
              const isEditable =
                index === 0 ||
                (allocation[selectedStock]?.[visibleBatches[index - 1].batch_id] || 0) ===
                visibleBatches[index - 1].in_stock;

              return (
                <div key={batch.batch_id} style={medicineCardStyle}>
                  <div style={{ fontSize: "1.05rem", marginBottom: "0.5rem" }}>
                    <b>Issuing stock to:</b>{" "}
                    <span style={{ fontWeight: 600 }}>{toTitleCase(selectedStock)}</span>
                  </div>

                  <div style={medicineHeaderStyle}>Batch {batch.batch_id}</div>
                  <div style={medicineGridStyle}>
                    <div style={rowStyle}>Expiry: {new Date(batch.expiry_date).toLocaleDateString()}</div>
                    <div style={rowStyle}>Available: {batch.in_stock}</div>
                    <div style={rowStyle}>
                      <label style={{ fontWeight: 700 }}>Allocate</label>
                      <input
                        type="number"
                        min={0}
                        max={batch.in_stock}
                        value={allocatedQty}
                        disabled={!isEditable}
                        onChange={(e) => handleAllocateChange(batch.batch_id, Number(e.target.value), index)}
                        className={pageStyles.input}
                        style={{ width: 140 }}
                      />
                    </div>
                  </div>
                </div>
              );
            })
          )}

          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "1.5rem", gap: "1rem" }}>
            <button onClick={() => navigate(-1)} className={pageStyles.button} type="button">
              ← Back
            </button>

            <button
              onClick={handleIssueStock}
              disabled={activeStock.length === 0}
              className={`${pageStyles.button} ${pageStyles.buttonPrimary}`}
              type="button"
              style={{ opacity: activeStock.length === 0 ? 0.5 : 1, cursor: activeStock.length === 0 ? "not-allowed" : "pointer" }}
            >
              <CheckLine size={16} /> Issue Stock
            </button>
          </div>
        </div>
      </section>
    </>
  );
};


/* ---------- STYLES ---------- */
const medicineCardStyle: React.CSSProperties = {
  background: "#ffffff",
  border: "1px solid #e2e8f0",
  borderRadius: "12px",
  padding: "1.25rem",
  marginBottom: "1rem",
};

const medicineHeaderStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  fontWeight: 700,
  marginBottom: "0.75rem",
  color: "#1a237e",
};

const medicineGridStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "0.4rem",
  padding: "0.5rem",
};

const rowStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "0.4rem",
};

export default RequestDetails;

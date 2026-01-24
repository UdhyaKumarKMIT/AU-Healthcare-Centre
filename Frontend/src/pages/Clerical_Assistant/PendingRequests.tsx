import { useEffect, useState } from "react";
import {
  FileScan,
  ClipboardClock  
} from "lucide-react";
import api from "../../api/axios";
import { useNavigate } from "react-router-dom"; 
import CustomModal from "./CustomModal";

/* ---------- Types ---------- */
interface Request {
  medicine_id: number;
  medicine_name: string;
  dressing_substock: number;
  labtech_substock: number;
  nurse_substock: number;
  pharmacy_substock: number;
}

/* ---------- Helpers ---------- */
const toTitleCase = (str: string) =>
  str.replace(/\w\S*/g, (txt) =>
    txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase()
  );

const getActiveSubstocks = (req: Request): string[] => {
  const stocks: string[] = [];

  if (req.dressing_substock) stocks.push("Dressing Substock");
  if (req.labtech_substock) stocks.push("Labtech Substock");
  if (req.nurse_substock) stocks.push("Nurse Substock");
  if (req.pharmacy_substock) stocks.push("Pharmacy Substock");

  return stocks;
};
/* ---------- Component ---------- */
const PendingRequests = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalConfirmCallback, setModalConfirmCallback] = useState<(() => void) | null>(null);

  const navigate = useNavigate(); 

  const [prescriptions, setPrescriptions] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);

  /* FILTER STATE (NEW) */
  const [filterType, setFilterType] = useState<"all" | "stock">(
    "all"
  );
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => { 

    const fetchPrescriptions = async () => {
      try {
        const res = await api.get("/clerical_assistant/requests");
        setPrescriptions(res.data || []);
      } catch (err) {
        console.error("Failed to fetch prescriptions:", err);
        setModalMessage("Could not load prescriptions.");
        setModalOpen(true);
      } finally {
        setLoading(false);
      }
    };

    fetchPrescriptions();
  }, [navigate]);

  /* FILTER LOGIC (NEW) */
  const filteredPrescriptions = prescriptions.filter((req) => {
  if (filterType === "all") return true;

  const term = searchTerm.toLowerCase().trim();
  if (!term) return true;

  const activeStocks = getActiveSubstocks(req)
      .map((s) => s.toLowerCase());

    // match if any active substock includes the search term
    return activeStocks.some((stock) => stock.includes(term));
  });


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
          {/* SECTION HEADER + FILTER */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "1rem",
              marginBottom: "1.5rem",
            }}
          >
            <div style={sectionHeaderStyle}>
              <ClipboardClock size={22} aria-hidden="true" />
              Pending Requests
            </div>

            {/* FILTER CONTROLS */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <select
                value={filterType}
                onChange={(e) =>
                  setFilterType(e.target.value as "all" | "stock")
                }
                aria-label="Filter prescriptions"
                style={{
                  padding: "0.45rem",
                  borderRadius: "6px",
                  border: "1px solid #cbd5e1",
                  background: "white",
                  color: "black",
                  fontWeight: "bold"
                }}
              >
                <option value="all">All</option> 
                <option value="stock">Stock</option> 
              </select>

              {filterType !== "all" && (
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={`Search by ${filterType}`}
                  aria-label={`Search by ${filterType}`}
                  style={{
                    padding: "0.45rem 0.6rem",
                    borderRadius: "6px",
                    border: "1px solid #cbd5e1",
                    minWidth: 180,
                    background: "white",
                    color: "black",
                    fontWeight: "bold"
                  }}
                />
              )}
            </div>
          </div>

          {loading ? (
            <p>Loading requests...</p>
          ) : filteredPrescriptions.length === 0 ? (
            <p>No pending requests found.</p>
          ) : (
            filteredPrescriptions.map((req, index) => {
  const activeStocks = getActiveSubstocks(req); 
  
  return (
    <article
      key={index}
      style={{ ...prescriptionRowStyle, cursor: "pointer" }}
      onClick={() => {
        sessionStorage.setItem("medicineId", String(req.medicine_id));
        sessionStorage.setItem("medicineName", String(req.medicine_name));
        sessionStorage.setItem("activeStocks", JSON.stringify(activeStocks));
        sessionStorage.setItem("requestType", "Pending");
        navigate("/clerical_assistant/issueStock");
      }}
    >
      <div style={{ display: "flex", gap: "1.5rem" }}>
        <div style={iconBoxStyle}>
          <FileScan size={20} aria-hidden="true" />
        </div>

        <div style={{ flex: 1 }}>
          {/* Medicine Name */}
          <p style={{ fontSize: "1.1rem", fontWeight: 700 }}>
            {toTitleCase(req.medicine_name)}
          </p>

          {/* Active Substocks */}
          <div style={{ marginTop: "0.5rem", display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            {activeStocks.map((stock) => (
              <span
                key={stock}
                style={{
                  background: "#e0f2fe",
                  color: "#053047",
                  padding: "0.25rem 0.6rem",
                  borderRadius: "999px",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                }}
              >
                {stock}
              </span>
            ))}
          </div>
        </div>
      </div>
    </article>
  );
})

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
};

const prescriptionRowStyle: React.CSSProperties = {
  background: "#f9fafb",
  border: "1px solid #e5e7eb",
  borderRadius: "8px",
  padding: "1.25rem",
  marginBottom: "1rem",
  cursor: "pointer",
};

const iconBoxStyle: React.CSSProperties = {
  width: 42,
  height: 42,
  borderRadius: "50%",
  background: "#e0e7ff",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#1e40af",
};
 

export default PendingRequests;

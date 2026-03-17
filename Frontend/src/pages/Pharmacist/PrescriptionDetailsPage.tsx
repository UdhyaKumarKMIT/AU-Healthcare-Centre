import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  PillBottle,
  PersonStanding,
  CalendarDays,
  Stethoscope,
  CheckLine,
  Layers,
  DotIcon,
} from "lucide-react";
import api from "../../api/axios";
import { useAuth } from "../../contexts/AuthContext";
import CustomModal from "./CustomModal";
import { toast } from "react-toastify";
import pageStyles from "../shared/RolePage.module.css";

/* ---------- TYPES ---------- */

interface PrescriptionItem {
  medicine_name: string;
  medicine_type: string;
  total_days: number;
  dosage_per_day: number;
  timing_flags: [number, number, number]; // [morning, afternoon, night]
  food_timing: 'BEFORE' | 'AFTER' | 'WITH' | 'EMPTY_STOMACH' | null;
}


interface AllocatedBatch {
  batch_id: string;
  used: number;
}

/* ---------- COMPONENT ---------- */

const PrescriptionDetailsPage = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalConfirmCallback, setModalConfirmCallback] = useState<(() => void) | null>(null);
  const [navigateOnClose, setNavigateOnClose] = useState(false);

  const [secretCode, setSecretCode] = useState("");

  const id = sessionStorage.getItem("prescriptionId");
  const navigate = useNavigate();
  const { user } = useAuth();

  const [patientName, setPatientName] = useState("");
  const [doctorName, setDoctorName] = useState("");
  const [items, setItems] = useState<PrescriptionItem[]>([]);
  const [issuedDays, setIssuedDays] = useState<number>(1);
  const [durationDays, setDurationDays] = useState<number>(0);

  const [showPreview, setShowPreview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 🔹 Quantities & allocated batches keyed by medicine name 
  const [allocatedBatches, setAllocatedBatches] = useState<
    Record<string, AllocatedBatch[]>
  >({});

  /* ---------- FETCH DETAILS ---------- */

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    const fetchDetails = async () => {
      try {
        const res = await api.get("/pharmacy/prescriptionDetails", {
          params: { id },
        });

        setPatientName(res.data.patient_name || "");
        setDoctorName(res.data.doctor_name || "");
        setItems(res.data.items || []);

        if (res.data.items?.length) {
          setDurationDays(res.data.items[0].total_days);
        }
      } catch {
        setModalMessage("Could not load prescription details.");
        setModalOpen(true);
        toast.error("Could not load prescription details");
      }
    };

    fetchDetails();
  }, [id, navigate, user]);

  useEffect(() => {
    setAllocatedBatches({});
  }, [issuedDays])

  /* ---------- GET BATCHES ---------- */

  const handleGetBatches = async (item: PrescriptionItem) => {
    const qty = (item.dosage_per_day || 0) * (issuedDays || 0);

    if (!qty || qty <= 0) {
      setModalMessage("Enter the quantity");
      setModalOpen(true);
      return;
    }

    if (!issuedDays) {
      setModalMessage("Enter issued days first");
      setModalOpen(true);
      return;
    }

    try {
      const res = await api.get("/pharmacy/getBatches", {
        params: {
          medicine_name: item.medicine_name,
          total_days: issuedDays,
          quantity: qty,
        },
      });

      setAllocatedBatches((prev) => ({
        ...prev,
        [item.medicine_name]: res.data.batches,
      }));
    } catch (err: any) {
      setModalMessage(err?.response?.data?.message || "Unable to fetch batches");
      setModalOpen(true);
      toast.error(err?.response?.data?.message || "Unable to fetch batches");
    }
  };

  /* ---------- COMPLETE ISSUE ---------- */

  const handleComplete = () => {
    if (!id || !issuedDays) {
      setModalMessage("Please fill all required fields.");
      setModalOpen(true);
      return;
    }

    for (const med of items) {
      if (!allocatedBatches[med.medicine_name]?.length) {
        setModalMessage("All batch allocations must be completed.");
        setModalOpen(true);
        return;
      }
    }

    // ✅ Instead of API call, open preview
    setShowPreview(true);
  };

  const handleFinalSubmit = async () => {
    try {
      setIsSubmitting(true);

      const normalizedSecretCode = secretCode.trim();
      if (!normalizedSecretCode) {
        setModalMessage("Secret code is required to issue medicine.");
        setModalOpen(true);
        toast.info("Secret code required to issue medicine");
        return;
      }

      await api.post("/pharmacy/issue", {
        secret_code: normalizedSecretCode,
        prescription_id: id,
        issued_days: Number(issuedDays),
        batches: items.flatMap((med) =>
          allocatedBatches[med.medicine_name].map((b) => ({
            batch_id: b.batch_id,
            quantity: b.used,
          }))
        ),
      });

      setModalMessage("Prescription sent successfully to patient");
      setModalOpen(true);
      setNavigateOnClose(true);
      toast.success("Prescription issued successfully");

    } catch (err) {
      console.error(err);
      setModalMessage("Could not complete prescription issue.");
      setModalOpen(true);
      toast.error("Could not complete prescription issue");
    } finally {
      setIsSubmitting(false);
    }
  };


  /* ---------- HELPERS ---------- */

  function toTitleCase(str: string) {
    return str.replace(/_/g, " ").replace(/\w\S*/g, (txt) =>
      txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    );
  }

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
            navigate("/pharmacist/pendingPrescription", { replace: true });
            setNavigateOnClose(false);
          }
        }}
      />


      {showPreview ? (
        /* ================= PREVIEW ================= */
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "2rem",
          }}
        >
          <div style={enhancedPrescriptionCard}>
            {/* SECRET CODE */}
            <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", marginBottom: "1rem", flexWrap: "wrap" }}>
              <label style={{ fontWeight: 700 }}>Secret Code:</label>
              <input
                type="password"
                placeholder="Enter secret code"
                value={secretCode}
                onChange={(e) => setSecretCode(e.target.value)}
                className={pageStyles.input}
                autoComplete="off"
              />
            </div>

            {/* HEADER */}
            <div style={prescriptionHeader}>
              <h1 style={{ margin: 0 }}>Anna University Health Center</h1>
            </div>

            {/* META */}
            <div style={prescriptionMeta}>
              <div><strong>Patient:</strong> {toTitleCase(patientName)}</div>
              <div><strong>Date:</strong> {new Date().toLocaleDateString()}</div>
              <div><strong>Doctor:</strong>   {toTitleCase(doctorName)}</div>
              <div><strong>Issued Days:</strong> {issuedDays}</div>
            </div>

            <hr />

            {/* MEDICINES */}
            {items.map((item) => (
              <div key={item.medicine_name} style={medicineCardStyle}>
                <div style={{ ...medicineHeaderStyle, fontFamily: "verdana" }}>
                  <PillBottle />
                  <strong>{toTitleCase(item.medicine_name)}</strong>
                  <span>({toTitleCase(item.medicine_type)})</span>
                </div>

                <div style={medicineGridStyle}>
                  {/* --- Dosage & Quantity --- */}
                  <div style={{ ...rowStyle, fontFamily: "verdana" }}>
                    <span style={labelStyle}>Dosage/day:</span>
                    <span>{item.dosage_per_day}</span>
                    <span style={labelStyle}>Quantity:</span>
                    <span>{item.dosage_per_day * issuedDays}</span>
                  </div>

                  {/* --- Food Timing --- */}
                  {item.food_timing && (
                    <div style={{ marginTop: 6, fontFamily: "verdana" }}>
                      <strong>Food Instruction:</strong> {toTitleCase(item.food_timing)}
                    </div>
                  )}

                  {/* --- Timing Checkboxes --- */}
                  <div style={{ marginTop: 6, display: "flex", gap: 12, fontFamily: "verdana" }}>
                    <label>
                      <input type="checkbox" checked={item.timing_flags[0] === 1} readOnly />&ensp;
                      Morning
                    </label>
                    <label>
                      <input type="checkbox" checked={item.timing_flags[1] === 1} readOnly />&ensp;
                      Afternoon
                    </label>
                    <label>
                      <input type="checkbox" checked={item.timing_flags[2] === 1} readOnly />&ensp;
                      Night
                    </label>
                  </div>
                </div>
              </div>

            ))}



            <hr />

            {/* BATCHES */}
            <h4 style={{ ...sectionTitle, fontFamily: "verdana", fontSize: "0.95rem" }}>Dispensed Batches</h4>
            {items.map((item) => (
              <p key={item.medicine_name}>
                <strong><span style={{ fontFamily: "verdana", fontSize: "0.86rem" }}>{toTitleCase(item.medicine_name)}:</span></strong>{" "}
                {allocatedBatches[item.medicine_name].map((b) => (
                  <span key={b.batch_id} style={{ fontFamily: "verdana", fontSize: "0.9rem" }}>
                    {b.batch_id} ({b.used} units){" "}
                  </span>
                ))}
              </p>
            ))}

            {/* ACTIONS */}
            <div style={previewActions}>
              <button
                className={pageStyles.button}
                onClick={() => setShowPreview(false)}
                type="button"
              >
                Back to Edit
              </button>

              <button
                className={`${pageStyles.button} ${pageStyles.buttonPrimary}`}
                onClick={handleFinalSubmit}
                disabled={isSubmitting}
                type="button"
              >
                {isSubmitting ? "Completing..." : "Confirm & Issue"}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <section className={pageStyles.card}>
          <div className={pageStyles.cardHeader}>
            <h2 className={pageStyles.cardHeaderTitle}>
              <PillBottle size={20} /> Medicine Issue
            </h2>
          </div>

          <div className={pageStyles.cardBody}>
            <div style={patientBarStyle}>
              <PersonStanding size={20} color="#1a237e" />
              <span style={{ color: "#1a237e", fontWeight: 700 }}>Patient:</span>
              <span style={{ fontWeight: 700 }}>{toTitleCase(patientName)}</span>
            </div>

            <div style={patientBarStyle}>
              <Stethoscope size={20} color="#1a237e" />
              <span style={{ color: "#1a237e", fontWeight: 700 }}>Doctor:</span>
              <span style={{ fontWeight: 700 }}>{toTitleCase(doctorName)}</span>
            </div>

            <div style={{ marginTop: 16 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <CalendarDays size={18} color="#1a237e" />
                <strong style={{ color: "#1a237e" }}>
                  Prescribed Duration Days: <span style={{ color: "#0f172a" }}>{durationDays}</span>
                </strong>
              </label>
            </div>

            <div style={{ marginTop: 16 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <CalendarDays size={18} color="#1a237e" />
                <strong style={{ color: "#1a237e" }}>Issued Days</strong>
                <input
                  type="number"
                  min={1}
                  max={durationDays}
                  value={issuedDays}
                  onChange={(e) => {
                    const value = e.target.valueAsNumber;
                    setIssuedDays(Number.isNaN(value) ? 0 : value);
                  }}
                  onBlur={() => {
                    setIssuedDays((prev) => Math.min(Math.max(prev, 1), durationDays));
                  }}
                  className={pageStyles.input}
                  style={{ width: 120 }}
                />
              </label>
            </div>

            <div style={{ height: 16 }} />

            {items.map((item) => (
              <div key={item.medicine_name} style={medicineCardStyle}>
                <div style={medicineHeaderStyle}>
                  <PillBottle />
                  <strong>{toTitleCase(item.medicine_name)}</strong>
                  <span>({toTitleCase(item.medicine_type)})</span>
                </div>

                <div style={medicineGridStyle}>
                  <div style={rowStyle}>
                    <span style={labelStyle}>Dosage per day:</span>
                    <span>{item.dosage_per_day} days</span>
                  </div>

                  {item.food_timing && (
                    <div style={{ marginTop: 6 }}>
                      <strong>Food Instruction:</strong> {toTitleCase(item.food_timing)}
                    </div>
                  )}

                  <div style={{ marginTop: 10, display: "flex", gap: 12, flexWrap: "wrap" }}>
                    <label>
                      <input type="checkbox" checked={item.timing_flags[0] === 1} readOnly />&ensp;Morning
                    </label>
                    <label>
                      <input type="checkbox" checked={item.timing_flags[1] === 1} readOnly />&ensp;Afternoon
                    </label>
                    <label>
                      <input type="checkbox" checked={item.timing_flags[2] === 1} readOnly />&ensp;Night
                    </label>
                  </div>

                  <div style={{ marginTop: 6 }}>
                    <Layers size={18} color="#1a237e" />{" "}
                    <strong style={{ color: "#1a237e" }}>Quantity</strong>

                    <input
                      type="number"
                      value={(item.dosage_per_day || 0) * (issuedDays || 0)}
                      readOnly
                      className={pageStyles.input}
                      style={{ width: 140, backgroundColor: "#f8fafc", cursor: "not-allowed" }}
                    />

                    <div style={{ height: 8 }} />

                    <button
                      onClick={() => handleGetBatches(item)}
                      className={pageStyles.button}
                      type="button"
                    >
                      Get Batches
                    </button>
                  </div>

                  {allocatedBatches[item.medicine_name]?.length > 0 && (
                    <div style={{ marginTop: 10 }}>
                      <strong>Allocated Batches:</strong>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        {allocatedBatches[item.medicine_name].map((b) => (
                          <span key={b.batch_id} style={batchBadge}>
                            {b.batch_id} - Quantity: {b.used}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}

            <div style={buttonRowStyle}>
              <button onClick={() => navigate(-1)} className={pageStyles.button} type="button">
                Back
              </button>
              <button
                onClick={handleComplete}
                className={`${pageStyles.button} ${pageStyles.buttonPrimary}`}
                type="button"
              >
                <CheckLine size={16} /> Complete
              </button>
            </div>
          </div>
        </section>
      )}
    </>
  );
};

/* ---------- STYLES ---------- */
const patientBarStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  paddingBottom: "1rem",
  marginBottom: "1.5rem",
  borderBottom: "2px dashed #e2e8f0",
  fontSize: "1.1rem",
};

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
  fontSize: "1.2rem",
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

const labelStyle: React.CSSProperties = {
  fontWeight: "bold",
  minWidth: "80px",
  fontSize: "1rem"
};

const inputStyle: React.CSSProperties = {
  marginLeft: 8,
  padding: "0.5rem",
  borderRadius: "6px",
  border: "1px solid #cbd5e1",
  width: 100,
  background: "white",
  color: "black",
};

const buttonRowStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  marginTop: "1.5rem",
};

const secondaryButtonStyle: React.CSSProperties = {
  background: "#dbeafe",
  color: "#1e40af",
  padding: "0.75rem 1.5rem",
  borderRadius: "8px",
  border: "1px solid #93c5fd",
  fontWeight: 700,
  cursor: "pointer",
};

const successButtonStyle: React.CSSProperties = {
  background: "#16a34a",
  color: "white",
  padding: "0.75rem 1.5rem",
  borderRadius: "8px",
  border: "none",
  fontWeight: 700,
  cursor: "pointer",
};

const batchBadge: React.CSSProperties = {
  background: "#e0e7ff",
  padding: "5px 10px",
  marginTop: "10px",
  borderRadius: 20,
  fontSize: 15,
};

const simplePrescriptionTable: React.CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
  marginBottom: 10,
};

(simplePrescriptionTable as any).th = {
  textAlign: "left",
  borderBottom: "1px solid #000",
  paddingBottom: 4,
};

(simplePrescriptionTable as any).td = {
  padding: "2px 0",
};

const previewActions: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  marginTop: 20,
};

const enhancedPrescriptionCard: React.CSSProperties = {
  background: "#ffffff",
  width: "100%",
  maxWidth: 700,
  padding: "2rem 2.5rem",
  borderRadius: 10,
  boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
  fontFamily: "Times New Roman, serif",
  color: "#111827",
};

const prescriptionHeader: React.CSSProperties = {
  textAlign: "center",
  fontFamily: "sans-serif",
  borderBottom: "2px solid #1e3a8a",
  paddingBottom: "0.75rem",
  marginBottom: "1rem",

  color: "#1e3a8a",
};

const prescriptionMeta: React.CSSProperties = {
  display: "grid",
  fontFamily: "sans-serif",
  gridTemplateColumns: "1fr 1fr",
  gap: "0.75rem",
  fontSize: 17,
  marginBottom: "1rem",
};

const sectionTitle: React.CSSProperties = {
  marginBottom: 8,
  fontFamily: "sans-serif",
  marginTop: 10,
  color: "#1e40af",
};

const medicinePreviewItem: React.CSSProperties = {
  marginBottom: 10,
  marginTop: 10,
  fontFamily: "sans-serif",
};

const medicineNameRow: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  fontFamily: "sans-serif",
  gap: 3,
  fontSize: 16,
  paddingBottom: "2px"
};

const medicineDetails: React.CSSProperties = {
  paddingLeft: 22,
  fontSize: 15,
  display: "flex",
  fontFamily: "sans-serif",
  gap: 20,
  marginTop: 2,
};

export default PrescriptionDetailsPage;
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  PillBottle,
  PersonStanding,
  CalendarDays,
  Stethoscope,
  CheckLine,
  Layers,
} from "lucide-react";
import api from "../../api/axios";
import { useAuth } from "../../contexts/AuthContext";

/* ---------- TYPES ---------- */

interface PrescriptionItem {
  medicine_name: string;
  medicine_type: string;
  total_days: number;
  food: string;
  timing: {
    morning: number;
    afternoon: number;
    night: number;
  };
}

interface AllocatedBatch {
  batch_id: string;
  used: number;
}

/* ---------- COMPONENT ---------- */

const PrescriptionDetailsPage = () => {
  const id = sessionStorage.getItem("prescriptionId");
  const navigate = useNavigate();
  const { user } = useAuth();

  const pharmacistId = user?.pharmacist_id;

  const [patientName, setPatientName] = useState("");
  const [doctorName, setDoctorName] = useState("");
  const [items, setItems] = useState<PrescriptionItem[]>([]);
  const [issuedDays, setIssuedDays] = useState<number | "">("");
  const [durationDays, setDurationDays] = useState<number>(0);

  // 🔹 Quantities & allocated batches keyed by medicine name
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [allocatedBatches, setAllocatedBatches] = useState<
    Record<string, AllocatedBatch[]>
  >({});

  /* ---------- FETCH DETAILS ---------- */

  useEffect(() => {
    if (!pharmacistId) {
      navigate("/login/pharmacist");
      return;
    }

    const fetchDetails = async () => {
      try {
        const res = await api.get("/pharmacy/prescriptionDetails", {
          params: { id, pharmacist_id: pharmacistId },
        });

        setPatientName(res.data.patient_name || "");
        setDoctorName(res.data.doctor_name || "");
        setItems(res.data.items || []);

        if (res.data.items?.length) {
          setDurationDays(res.data.items[0].total_days);
        }
      } catch {
        alert("Could not load prescription details.");
      }
    };

    fetchDetails();
  }, [id, pharmacistId, navigate]);

  /* ---------- GET BATCHES ---------- */

  const handleGetBatches = async (item: PrescriptionItem) => {
    const qty = quantities[item.medicine_name];

    if (!qty || qty <= 0) {
      alert("Enter the quantity");
      return;
    }

    if (!issuedDays) {
      alert("Enter issued days first");
      return;
    }

    try {
      const res = await api.get("/pharmacy/getBatches", {
        params: {
          pharmacist_id: pharmacistId,
          medicine_name: item.medicine_name,
          total_days: durationDays,
          quantity: qty,
        },
      });

      setAllocatedBatches((prev) => ({
        ...prev,
        [item.medicine_name]: res.data.batches,
      }));
    } catch (err: any) {
      alert(err?.response?.data?.message || "Unable to fetch batches");
    }
  };

  /* ---------- COMPLETE ISSUE ---------- */

  const handleComplete = async () => {
    if (!id || !issuedDays || !pharmacistId) {
      alert("Please fill all required fields.");
      return;
    }

    alert("Medicine issuing in process...");

    for (const med of items) {
      if (
        !allocatedBatches[med.medicine_name]?.length ||
        !(quantities[med.medicine_name] > 0)
      ) {
        alert("All batch allocations and quantities must be valid.");
        return;
      }
    }

    try {
      await api.post("/pharmacy/issue", {
        pharmacist_id: pharmacistId,
        prescription_id: id,
        issued_days: Number(issuedDays),
        batches: items.flatMap((med) =>
          allocatedBatches[med.medicine_name].map((b) => ({
            batch_id: b.batch_id,
            quantity: b.used,
          }))
        ),
      });

      alert("Prescription issued successfully!");
      navigate("/pharmacist/pendingPrescription", { replace: true });
    } catch (err) {
      console.error(err);
      alert("Could not complete prescription issue.");
    }
  };

  /* ---------- HELPERS ---------- */

  function toTitleCase(str: string) {
    return str.replace(/\w\S*/g, (txt) =>
      txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    );
  }

  /* ---------- JSX ---------- */

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
      {/* HEADER */}
      <header
        style={{
          background: "linear-gradient(90deg, #1e40af, #1e3a8a)",
          color: "white",
        }}
      >
        <div style={{ maxWidth: 1400, margin: "auto", padding: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <Activity />
            <div>
              <h2 style={{ margin: 0 }}>MIT Pharmacy</h2>
              <small>Prescription Details & Issue</small>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main
        style={{ maxWidth: 900, margin: "auto", padding: "2rem", color: "black" }}
      >
        <div style={sectionCardStyle}>
          <div style={patientBarStyle}>
            <PersonStanding size={20} color="#0039caff" />
            <span style={{ color: "#0039caff", fontWeight: 700 }}>
              Patient:
            </span>
            <span style={{ fontWeight: 700 }}>
              {toTitleCase(patientName)}
            </span>
          </div>

          <div style={patientBarStyle}>
            <Stethoscope size={20} color="#0039caff" />
            <span style={{ color: "#0039caff", fontWeight: 700 }}>
              Doctor:
            </span>
            <span style={{ fontWeight: 700 }}>
              {toTitleCase(doctorName)}
            </span>
          </div>

          <div style={{ marginTop: 16 }}>
            <CalendarDays size={18} color="#0039caff" />{" "}
            <strong style={{ color: "#0039caff" }}>
              Duration Days: {durationDays}
            </strong>
          </div>

          <div style={{ marginTop: 16 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <CalendarDays size={18} color="#0039caff" />
              <strong style={{ color: "#0039caff" }}>Issued Days</strong>
              <input
                type="number"
                min={1}
                max={durationDays}
                value={issuedDays}
                onChange={(e) => setIssuedDays(Number(e.target.value))}
                style={inputStyle}
              />
            </label>
          </div>

          <br />

          {items.map((item) => (
            <div key={item.medicine_name} style={medicineCardStyle}>
              <div style={medicineHeaderStyle}>
                <PillBottle />
                <strong>{toTitleCase(item.medicine_name)}</strong>
                <span>({toTitleCase(item.medicine_type)})</span>
              </div>

              <div style={medicineGridStyle}> 

                <div style={rowStyle}>
                  <span style={labelStyle}>Food Instruction:</span>
                  <span>{toTitleCase(item.food)} food</span>
                </div>

                <div style={rowStyle}>
                  <span style={labelStyle}>Timing:</span>
                  <div style={timingStyle}>
                    <label style={timingLabelStyle}>
                      <span style={item.timing.morning === 1 ? tickStyle : emptyStyle}>
                        {item.timing.morning === 1 ? "✓" : "–"}
                      </span>
                      Morning
                    </label>

                    <label style={timingLabelStyle}>
                      <span style={item.timing.afternoon === 1 ? tickStyle : emptyStyle}>
                        {item.timing.afternoon === 1 ? "✓" : "–"}
                      </span>
                      Afternoon
                    </label>

                    <label style={timingLabelStyle}>
                      <span style={item.timing.night === 1 ? tickStyle : emptyStyle}>
                        {item.timing.night === 1 ? "✓" : "–"}
                      </span>
                      Night
                    </label>
                  </div>
                </div>

                <div style={{ marginTop: 6 }}>
                  <Layers size={18} color="#0039caff" />{" "}
                  <strong style={{ color: "#0039caff" }}>Quantity</strong>
                  <input
                    type="number"
                    min={1}
                    value={quantities[item.medicine_name] || ""}
                    onChange={(e) => {
                      setQuantities((p) => ({
                        ...p,
                        [item.medicine_name]: Number(e.target.value),
                      }))
                      setAllocatedBatches((prev) => ({
      ...prev,
      [item.medicine_name]: [],
    }));
                    }
                      
                    }
                    style={inputStyle}
                  />
                  <br />
                  <button
                    onClick={() => handleGetBatches(item)}
                    style={{
                      ...secondaryButtonStyle,
                      padding: "4px 10px",
                      fontSize: 12,
                      height: 28,
                      marginTop: 6,
                    }}
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
            <button onClick={() => navigate(-1)} style={secondaryButtonStyle}>
              Back
            </button>
            <button onClick={handleComplete} style={successButtonStyle}>
              <CheckLine size={16} /> Complete
            </button>
          </div>
        </div>
      </main>
    </div>
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

const patientBarStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  paddingBottom: "1rem",
  marginBottom: "1.5rem",
  borderBottom: "2px dashed #cbd5e1",
  fontSize: "1.1rem",
};

const medicineCardStyle: React.CSSProperties = {
  background: "#f9fafb",
  border: "1px solid #e5e7eb",
  borderRadius: "8px",
  padding: "1.25rem",
  marginBottom: "1rem",
};

const medicineHeaderStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  fontWeight: 700,
  marginBottom: "0.75rem",
  color: "#1e40af",
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
  fontWeight: 600,
  minWidth: "80px",
};

const timingStyle: React.CSSProperties = {
  display: "flex",
  gap: "1rem",
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

const timingLabelStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "0.4rem",
};

const tickStyle: React.CSSProperties = {
  color: "#0070dfff",
  fontWeight: "bold",
  fontSize: "1rem",
};

const emptyStyle: React.CSSProperties = {
  color: "#ccc",
};

const selectStyle: React.CSSProperties = {
  ...inputStyle,
  cursor: "pointer",
  width: "50%",
};

const batchBadge: React.CSSProperties = {
  background: "#e8f0ff",
  padding: "5px 10px",
  marginTop: "10px",
  borderRadius: 20,
  fontSize: 15,
};

export default PrescriptionDetailsPage;
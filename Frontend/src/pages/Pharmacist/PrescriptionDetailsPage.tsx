import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  PillBottle,
  PersonStanding,
  Package,
  CalendarDays,
  Stethoscope,
  CheckLine,
  Layers,
} from "lucide-react";
import api from "../../api/axios";

interface PrescriptionItem {
  medicine_name: string;
  medicine_type: string;
  duration_days: number;
  food: string;
  timing: {
    morning: number;
    afternoon: number;
    night: number;
  };
}

interface BatchItem {
  medicine_name: string;
  batch_id: string;
}

const PrescriptionDetailsPage = () => {
  const id = sessionStorage.getItem("prescriptionId");
  const navigate = useNavigate();

  const [patientName, setPatientName] = useState(""); 
  const [doctorName, setDoctorName] = useState(""); 
  const [items, setItems] = useState<PrescriptionItem[]>([]);
  const [issuedDays, setIssuedDays] = useState(""); 

  // Batches and quantities keyed by medicine name
  const [batchIds, setBatchIds] = useState<Record<string, string>>({});  
  const [quantities, setQuantities] = useState<Record<string, number>>({});  
  const [groupedBatches, setGroupedBatches] = useState<Record<string, string[]>>({});

  useEffect(() => {
    const fetchDetails = async () => {
      try {  
        const res = await api.get("/pharmacy/prescriptionDetails", { params: { id } });
        setPatientName(res.data.patient_name || ""); 
        setDoctorName(res.data.doctor_name || ""); 
        setItems(res.data.items || []);

        const grouped: Record<string, string[]> = {};
        res.data.batchIds.forEach((item: BatchItem) => {
          if (!grouped[item.medicine_name]) grouped[item.medicine_name] = [];
          grouped[item.medicine_name].push(item.batch_id);
        });
        setGroupedBatches(grouped);

      } catch {
        alert("Could not load prescription details.");
      }
    };
    fetchDetails();
  }, [id]);

  const handleComplete = async () => {
    if (!id || !issuedDays) {
      alert("Please fill all required fields.");
      return;
    }

    // Show “in process” notification
    alert("Medicine issuing in process...");

    // Check all batch IDs and quantities
    for (const med of items) { 
      if (!batchIds[med.medicine_name] || !(quantities[med.medicine_name] > 0)) {
        alert("All batch IDs and quantities must be valid.");
        return;
      }
    }

    try {
      await api.post("/pharmacy/issue", {
        prescription_id: id,
        issued_days: Number(issuedDays),
        batches: items.map((med) => ({
          batch_id: batchIds[med.medicine_name],
          quantity: quantities[med.medicine_name],
        })),
      });

      alert("Prescription issued successfully!");
      navigate("/pharmacist/pendingPrescription", { replace: true });
    } catch (err) {
      console.error(err);
      alert("Could not complete prescription issue.");
    }
  };

  function toTitleCase(str: string) {
    return str.replace(/\w\S*/g, (txt) =>
      txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
      {/* HEADER */}
      <header style={{ background: "linear-gradient(90deg, #1e40af, #1e3a8a)", color: "white" }}>
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
      <main style={{ maxWidth: 900, margin: "auto", padding: "2rem", color: "black" }}>
        <div style={sectionCardStyle}>
          {/* Patient Info */}
          <div style={patientBarStyle}>
            <PersonStanding size={20} color="#0039caff" />
            <span style={{ color: "#0039caff", fontWeight: 700 }}>Patient:</span>
            <span style={{ fontWeight: 700 }}>{toTitleCase(patientName)}</span>
          </div>
          <div style={patientBarStyle}>
            <Stethoscope size={20} color="#0039caff" />
            <span style={{ color: "#0039caff", fontWeight: 700 }}>Doctor:</span>
            <span style={{ fontWeight: 700 }}>{toTitleCase(doctorName)}</span>
          </div>

          {/* Issued Days */}
          <div style={{ marginTop: 16 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <CalendarDays size={18} color="#0039caff" />
              <span style={{ color: "#0039caff", fontWeight: 700 }}>Issued Days</span>
              <input
                type="number"
                min={1}
                value={issuedDays}
                onChange={(e) => setIssuedDays(e.target.value)}
                required
                style={inputStyle}
              />
            </label>
          </div>
          <br />

          {/* Prescription Items */}
          {items.map((item) => (
            <div key={item.medicine_name} style={medicineCardStyle}>
              <div style={medicineHeaderStyle}>
                <PillBottle />
                <strong>{toTitleCase(item.medicine_name)}</strong>
              </div>

              <div style={medicineGridStyle}>
                <div style={rowStyle}>
                  <span style={labelStyle}>Type:</span>
                  <span>{toTitleCase(item.medicine_type)}</span>
                </div>

                <div style={rowStyle}>
                  <span style={labelStyle}>Duration:</span>
                  <span>{item.duration_days} days</span>
                </div>

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

                {/* Batch Dropdown */}
                <div style={{ marginTop: 8 }}>
                  <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Package size={18} color="#0039caff" />
                    <span style={{ color: "#0039caff", fontWeight: 700 }}>
                      {item.medicine_name} - Batch ID
                    </span>

                    <select
                      value={batchIds[item.medicine_name] || ""}
                      onChange={(e) =>
                        setBatchIds((prev) => ({
                          ...prev,
                          [item.medicine_name]: e.target.value,
                        }))
                      }
                      required
                      style={selectStyle}
                    >
                      <option value="" disabled>
                        Select Batch
                      </option>
                      {groupedBatches[item.medicine_name]?.map((batchId) => (
                        <option key={batchId} value={batchId}>
                          {batchId}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                {/* Quantity */}
                <div style={{ marginTop: 4 }}>
                  <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Layers size={18} color="#0039caff" />
                    <span style={{ color: "#0039caff", fontWeight: 700 }}>Quantity</span>
                    <input
                      type="number"
                      min={1}
                      value={quantities[item.medicine_name] || ""}
                      onChange={(e) =>
                        setQuantities((prev) => ({
                          ...prev,
                          [item.medicine_name]: Number(e.target.value),
                        }))
                      }
                      required
                      style={inputStyle}
                    />
                  </label>
                </div>
              </div>
            </div>
          ))}

          {/* Buttons */}
          <div style={buttonRowStyle}>
            <button type="button" style={secondaryButtonStyle} onClick={() => navigate(-1)}>
              Back
            </button>
            <button type="button" style={successButtonStyle} onClick={handleComplete}>
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
  width: "50%"
};

export default PrescriptionDetailsPage;

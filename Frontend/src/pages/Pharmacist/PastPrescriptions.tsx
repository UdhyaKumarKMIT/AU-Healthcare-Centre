import { useEffect, useState } from "react";
import {
  FileText,
  Activity,
  CircleUser,
  FileCheck,
  Pill,
} from "lucide-react";
import api from "../../api/axios";

/* ---------- Types ---------- */
interface PastPrescription {
  prescription_id: number;
  patient_name: string;
  doctor_name: string;
  name: string; // pharmacist
  issued_at: string;
  specialization: string;
}

interface PrescriptionItem {
  medicine_name: string; 
  medicine_type: string;
  duration_days: number; 
  food: string,
  morning: number,
  afternoon: number,
  night: number,
  issued_days: number;
}

/* ---------- Helpers ---------- */
const toTitleCase = (str: string) =>
  str.replace(/\w\S*/g, (txt) => txt[0].toUpperCase() + txt.substring(1).toLowerCase());

const formatDateTime = (date: string) =>
  new Date(date).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

/* ---------- Component ---------- */
const PastPrescriptions = () => {
  const [prescriptions, setPrescriptions] = useState<PastPrescription[]>([]);
  const [selected, setSelected] = useState<{ items?: PrescriptionItem[] } | null>(null);
  const [loading, setLoading] = useState(true);

  const [patientName, setPatientName] = useState("")
  const [doctorName, setDoctorName] = useState("")
  const [pharmacistName, setPharmacistName] = useState("")

  /* FILTER STATE (SAME AS PENDING) */
  const [filterType, setFilterType] = useState<"all" | "patient" | "doctor" | "pharmacist" | "specialization">("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchPast = async () => {
      try {
        const res = await api.get("/pharmacy/transactions");
        setPrescriptions(res.data || []);
      } catch {
        alert("Could not load past prescriptions.");
      } finally {
        setLoading(false);
      }
    };
    fetchPast();
  }, []);

  /* FILTER LOGIC (SAME AS PENDING) */
  const filteredPrescriptions = prescriptions.filter((p) => {
    const term = searchTerm.toLowerCase();

    if (filterType === "patient") {
      return p.patient_name.toLowerCase().includes(term);
    }

    if (filterType === "doctor") {
      return p.doctor_name.toLowerCase().includes(term);
    }

    if (filterType === "specialization") {
      return p.specialization.toLowerCase().includes(term);
    }

    if (filterType === "pharmacist") {
      return p.name.toLowerCase().includes(term);
    }

    return true;
  });

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
      {/* HEADER */}
      <div
        style={{
          background: "linear-gradient(90deg, #1e40af, #1e3a8a)",
          color: "white",
        }}
      >
        <div style={{ maxWidth: 1400, margin: "auto", padding: "1rem" }}>
          <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
            <Activity />
            <div>
              <h2 style={{ margin: 0 }}>MIT Pharmacy</h2>
              <small>Past Prescriptions</small>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN */}
      <main
        style={{
          maxWidth: 1200,
          margin: "auto",
          padding: "2rem",
          color: "black",
        }}
      >
        <div style={sectionCardStyle}>
          {/* SECTION HEADER + FILTER */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "1rem",
              marginBottom: "1.5rem",
            }}
          >
            <div style={sectionHeaderStyle}>
              <FileCheck size={22} />
              Past Prescriptions
            </div>

            {/* FILTER CONTROLS */}
            {!selected && (
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <select
                  value={filterType}
                  onChange={(e) =>
                    setFilterType(e.target.value as "all" | "patient" | "doctor")
                  }
                  style={filterSelectStyle}
                >
                  <option value="all">All</option>
                  <option value="patient">Patient</option>
                  <option value="doctor">Doctor</option>
                  <option value="pharmacist">Pharmacist</option>
                  <option value="specialization">Specialization</option>
                </select>

                {filterType !== "all" && (
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder={`Search by ${filterType}`}
                    style={filterInputStyle}
                  />
                )}
              </div>
            )}
          </div>

          {/* CONTENT */}
          {loading ? (
            <p>Loading past prescriptions...</p>
          ) : !selected ? (
            filteredPrescriptions.length === 0 ? (
              <p>No matching prescriptions found.</p>
            ) : (
              filteredPrescriptions.map((p) => (
                <article
                  key={p.prescription_id}
                  style={prescriptionRowStyle}
                  role="button"
                  tabIndex={0}
                  onClick={async () => {
                    const res = await api.get(
                      `/pharmacy/transactionDetails/${p.prescription_id}`
                    );
                    setPatientName(p.patient_name);
                    setPharmacistName(p.name);
                    setDoctorName(p.doctor_name);
                    setSelected(res.data);
                  }}
                >
                  <div style={{ display: "flex", gap: "1.5rem" }}>
                    <div style={iconBoxStyle}>
                      <CircleUser size={20} />
                    </div>

                    <div style={{ flex: 1 }}>
                      <p>
                        <strong>Patient:</strong>{" "}
                        {toTitleCase(p.patient_name)}
                      </p>
                      <p>
                        <strong>Doctor:</strong>{" "}
                        {toTitleCase(p.doctor_name)}
                      </p>
                      <p>
                        <strong>Specialization:</strong>{" "}
                        {toTitleCase(p.specialization)}
                      </p>
                      <p>
                        <strong>Pharmacist:</strong>{" "}
                        {toTitleCase(p.name)}
                      </p>
                      <p>
                        <strong>Issued At:</strong> {formatDateTime(p.issued_at)}
                      </p>
                    </div>
                  </div>
                </article>
              ))
            )
          ) : (
            <>
            <p><strong>Patient: </strong>{patientName}</p>
            <p><strong>Doctor: </strong>{doctorName}</p>
            <p><strong>Pharmacist: </strong>{pharmacistName}</p><br />
              {selected.items?.map((item, idx) => (
                <div key={idx} style={detailCardStyle}>
                  <p>
                    <Pill size={18} /> <strong>Medicine:</strong>{" "}
                    {toTitleCase(item.medicine_name)} - {toTitleCase(item.medicine_type)}
                  </p> 
                  <p><strong>Prescribed Duration:</strong> {item.duration_days} days</p> 
                  <p><strong>Dispensed Duration:</strong> {item.issued_days} days</p>
                  <p><strong>Food Instruction: </strong> {toTitleCase(item.food)} food </p><br />
                  <div style={timingStyle}>
                    <label style={timingLabelStyle}>
                      <span style={item.morning === 1 ? tickStyle : emptyStyle}>
                        {item.morning === 1 ? "✓" : "–"}
                      </span>
                      Morning
                    </label>

                    <label style={timingLabelStyle}>
                      <span style={item.afternoon === 1 ? tickStyle : emptyStyle}>
                        {item.afternoon === 1 ? "✓" : "–"}
                      </span>
                      Afternoon
                    </label>

                    <label style={timingLabelStyle}>
                      <span style={item.night === 1 ? tickStyle : emptyStyle}>
                        {item.night === 1 ? "✓" : "–"}
                      </span>
                      Night
                    </label>
                  </div>
                </div>
              ))}

              <button onClick={() => setSelected(null)} style={backButtonStyle}>
                ← Back to list
              </button>
            </>
          )}
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

const detailCardStyle: React.CSSProperties = {
  background: "#f9fafb",
  border: "1px solid #e5e7eb",
  borderRadius: "8px",
  padding: "1rem",
  marginBottom: "0.75rem",
};

const backButtonStyle: React.CSSProperties = {
  marginTop: "1rem",
  background: "#1e40af",
  color: "white",
  border: "none",
  padding: "0.5rem 1rem",
  borderRadius: "6px",
  cursor: "pointer",
  fontWeight: 600,
};

const filterSelectStyle: React.CSSProperties = {
  padding: "0.45rem",
  borderRadius: "6px",
  border: "1px solid #cbd5e1",
  background: "white",
  color: "black",
  fontWeight: "bold",
};

const filterInputStyle: React.CSSProperties = {
  padding: "0.45rem 0.6rem",
  borderRadius: "6px",
  border: "1px solid #cbd5e1",
  minWidth: 180,
  background: "white",
  color: "black",
  fontWeight: "bold",
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
  color: "#000000",
  fontWeight: "800"
};

const timingStyle: React.CSSProperties = {
  display: "flex",
  gap: "1rem",
};

export default PastPrescriptions;

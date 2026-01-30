import { useEffect, useState } from "react";
import { 
  CircleUser,
  FileCheck,
  Pill,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { useAuth } from "../../contexts/AuthContext";
import CustomModal from "./CustomModal";

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
  total_days: number;  
  issued_days: number;
  dosage_per_day: number;
  timing_flags: [number, number, number]; // [morning, afternoon, night]
  food_timing: 'BEFORE' | 'AFTER' | 'WITH' | 'EMPTY_STOMACH' | null;
}

/* ---------- Helpers ---------- */
const toTitleCase = (str: string) =>
  str.replace(/\w\S*/g, (txt) => txt[0].toUpperCase() + txt.substring(1).toLowerCase());

const formatDateTime = (date?: string | null) => {
  if (!date) return "—"; // or some placeholder
  const d = new Date(date);
  return isNaN(d.getTime()) ? "Invalid Date" : d.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

/* ---------- Component ---------- */
const PastPrescriptions = () => {
  
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalConfirmCallback, setModalConfirmCallback] = useState<(() => void) | null>(null);

  const navigate = useNavigate();
  const { user } = useAuth();

  const pharmacistId = user?.pharmacist_id;

  const [prescriptions, setPrescriptions] = useState<PastPrescription[]>([]);
  const [selected, setSelected] = useState<{ items?: PrescriptionItem[] } | null>(null);
  const [loading, setLoading] = useState(true);

  const [patientName, setPatientName] = useState("")
  const [doctorName, setDoctorName] = useState("")
  const [pharmacistName, setPharmacistName] = useState("")
  const [specialization, setSpecialization] = useState("")
  const [filterDate, setFilterDate] = useState("");

  /* FILTER STATE (SAME AS PENDING) */
  const [filterType, setFilterType] = useState<"all" | "patient" | "doctor" | "pharmacist" | "specialization">("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!pharmacistId) {
      navigate("/login/pharmacist");
      return;
    }

    const fetchPast = async () => {
      try {
        const res = await api.get("/pharmacy/transactions", {
          params: { pharmacist_id: pharmacistId }
        });
        setPrescriptions(res.data || []);
      } catch {
        setModalMessage("Could not load past prescriptions.");
        setModalOpen(true);
      } finally {
        setLoading(false);
      }
    };
    fetchPast();
  }, [pharmacistId, navigate]);

  /* FILTER LOGIC (SAME AS PENDING) */
const filteredPrescriptions = prescriptions.filter((p) => {
  const term = searchTerm.toLowerCase();

  const matchesText =
    filterType === "all"
      ? (
          p.patient_name.toLowerCase().includes(term) ||
          p.doctor_name.toLowerCase().includes(term) ||
          p.name.toLowerCase().includes(term) ||
          p.specialization.toLowerCase().includes(term)
        )
      : filterType === "patient"
      ? p.patient_name.toLowerCase().includes(term)
      : filterType === "doctor"
      ? p.doctor_name.toLowerCase().includes(term)
      : filterType === "pharmacist"
      ? p.name.toLowerCase().includes(term)
      : filterType === "specialization"
      ? p.specialization.toLowerCase().includes(term)
      : true;

  let matchesDate = true;

  if (filterDate) {
  const issued = new Date(p.issued_at);

  const localDate =
    issued.getFullYear() +
    "-" +
    String(issued.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(issued.getDate()).padStart(2, "0");

  matchesDate = localDate === filterDate;
}


  return matchesText && matchesDate;
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
  <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
    <select
      value={filterType}
      onChange={(e) =>
        setFilterType(
          e.target.value as
            | "all"
            | "patient"
            | "doctor"
            | "pharmacist"
            | "specialization"
        )
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

    {/* DATE FILTER */}
    <input
      type="date"
      value={filterDate}
      onChange={(e) => setFilterDate(e.target.value)}
      style={filterInputStyle}
    />

    {/* CLEAR */}
    {(searchTerm || filterDate || filterType !== "all") && (
      <button
        onClick={() => {
          setSearchTerm("");
          setFilterDate("");
          setFilterType("all");
        }}
        style={clearFilterButtonStyle}
      >
        Clear
      </button>
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
                      `/pharmacy/transactionDetails/${p.prescription_id}`,
                      {
                        params: { pharmacist_id: pharmacistId }
                      }
                    );
                    setPatientName(p.patient_name);
                    setPharmacistName(p.name);
                    setDoctorName(p.doctor_name);
                    setSpecialization(p.specialization);
                    setSelected(res.data);
                  }}
                >
                  <div style={{ display: "flex", gap: "1.5rem" }}>
                    <div style={iconBoxStyle}>
                      <CircleUser size={20} />
                    </div>

                    <div style={{ flex: 1, fontFamily: "verdana"}}>
                      <p style={{paddingBottom: "2px"}}>
                        <strong>Patient:</strong>{" "}
                        {toTitleCase(p.patient_name)}
                      </p>
                      <p style={{paddingBottom: "2px"}}>
                        <strong>Doctor:</strong>{" "}
                        Dr. {toTitleCase(p.doctor_name)}
                      </p>
                      <p style={{paddingBottom: "2px"}}>
                        <strong>Specialization:</strong>{" "}
                        {toTitleCase(p.specialization)}
                      </p>
                      <p style={{paddingBottom: "2px"}}>
                        <strong>Pharmacist:</strong>{" "}
                        {toTitleCase(p.name)}
                      </p>
                      <p style={{paddingBottom: "2px"}}>
                        <strong>Issued At:</strong> {formatDateTime(p.issued_at)}
                      </p>  
                    </div>
                  </div>
                </article>
              ))
            )
          ) : (
            <div style={{fontFamily: "verdana"}}>
            <p style={{paddingBottom: "2px"}}><strong>Patient: </strong>{toTitleCase(patientName)}</p>
            <p style={{paddingBottom: "2px"}}><strong>Doctor: </strong>{toTitleCase(doctorName)}</p>
            <p style={{paddingBottom: "2px"}}><strong>Specialization: </strong>{toTitleCase(specialization)}</p>
            <p style={{paddingBottom: "2px"}}><strong>Pharmacist: </strong>{toTitleCase(pharmacistName)}</p><br />
              {selected.items?.map((item, idx) => (
  <div key={idx} style={detailCardStyle}>
    <p style={{paddingBottom: "2px"}}>
      <Pill size={18} /> <strong>Medicine:</strong>{" "}
      {toTitleCase(item.medicine_name)} - {toTitleCase(item.medicine_type)}
    </p> <br />
    <p style={{paddingBottom: "2px"}}><strong>Prescribed Duration:</strong> {item.total_days} days</p> 
    <p style={{paddingBottom: "2px"}}><strong>Dispensed Duration:</strong> {item.issued_days} days</p>
    <p style={{paddingBottom: "2px"}}><strong>Dosage per day:</strong> {item.dosage_per_day}</p>

    {/* --- Food Timing --- */}
    {item.food_timing && (
      <p style={{paddingBottom: "2px"}}><strong>Food Instruction:</strong> {toTitleCase(item.food_timing.replace("_", " "))}</p>
    )}<br />

    {/* --- Timing Checkboxes --- */}
    <div style={{ display: "flex", gap: "12px", marginTop: 4 }}>
      <label>
        <input type="checkbox" checked={item.timing_flags?.[0] === 1} readOnly /> Morning
      </label>
      <label>
        <input type="checkbox" checked={item.timing_flags?.[1] === 1} readOnly /> Afternoon
      </label>
      <label>
        <input type="checkbox" checked={item.timing_flags?.[2] === 1} readOnly /> Night
      </label>
    </div>
  </div>
))}


              <button onClick={() => setSelected(null)} style={backButtonStyle}>
                ← Back to list
              </button>
            </div>
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

const clearFilterButtonStyle: React.CSSProperties = {
  padding: "0.4rem", 
  background: "white",
  color: "#b80a0a",
  borderRadius: "5px",
  fontWeight: "500",
  border: "1px solid #dc2626",
}; 

export default PastPrescriptions;

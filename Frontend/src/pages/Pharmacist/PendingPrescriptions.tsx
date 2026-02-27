import { useEffect, useState } from "react";
import {
  FileScan,
  Stethoscope,
  CircleUser,
  PersonStanding,
  GraduationCap,
} from "lucide-react";
import api from "../../api/axios";
import { replace, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import CustomModal from "./CustomModal";

/* ---------- Types ---------- */
interface Prescription {
  prescription_id: string;
  patient_name: string;
  doctor_name: string;
  doctor_specialization: string;
  created_at: Date;
}

/* ---------- Helpers ---------- */
const toTitleCase = (str: string) =>
  str.replace(/\w\S*/g, (txt) =>
    txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase()
  );

/* ---------- Component ---------- */
const PendingPrescriptions = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalConfirmCallback, setModalConfirmCallback] = useState<(() => void) | null>(null);

  const navigate = useNavigate();
  const { user } = useAuth();

  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);

  /* FILTER STATE (NEW) */
  const [filterType, setFilterType] = useState<"all" | "patient" | "doctor" | "specialization">(
    "all"
  );
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!user) {
      navigate("/login/pharmacist");
      return;
    }

    const fetchPrescriptions = async () => {
      try {
        const res = await api.get("/pharmacy/prescriptions");
        console.log(res.data)
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
  }, [navigate, user]);

  /* FILTER LOGIC (NEW) */
  const filteredPrescriptions = prescriptions.filter((p) => {
    const term = searchTerm.toLowerCase();

    if (filterType === "patient") {
      return p.patient_name.toLowerCase().includes(term);
    }

    if (filterType === "doctor") {
      return p.doctor_name.toLowerCase().includes(term);
    }

    if (filterType === "specialization") {
      return p.doctor_specialization.toLowerCase().includes(term);
    }

    return true;
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
                <FileScan size={22} aria-hidden="true" />
                Pending Prescriptions
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
                    setFilterType(e.target.value as "all" | "patient" | "doctor" | "specialization")
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
                  <option value="patient">Patient</option>
                  <option value="doctor">Doctor</option>
                  <option value="specialization">Specialization</option>
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
              <p>Loading prescriptions...</p>
            ) : filteredPrescriptions.length === 0 ? (
              <p>No pending prescriptions found.</p>
            ) : (
              filteredPrescriptions.map((p) => (
                <article
                  key={p.prescription_id}
                  style={prescriptionRowStyle}
                  role="button"
                  tabIndex={0}
                  aria-label={`Open prescription for ${p.patient_name}`}
                  onClick={() => {
                    sessionStorage.setItem(
                      "prescriptionId",
                      p.prescription_id ? p.prescription_id.toString() : ""
                    );
                    navigate("/pharmacist/prescriptionsDetails");
                  }}
                >
                  <div style={{ display: "flex", gap: "1.5rem" }}>
                    <div style={iconBoxStyle}>
                      <CircleUser size={20} aria-hidden="true" />
                    </div>

                    <div style={{ flex: 1, fontFamily: "verdana" }}>
                      <p style={{ display: "flex", alignItems: "center", gap: 6, paddingBottom: "2px" }}>
                        <PersonStanding size={18} aria-hidden="true" />
                        <strong>Patient:</strong>{" "}
                        {toTitleCase(p.patient_name)}
                      </p>

                      <p style={{ display: "flex", alignItems: "center", gap: 6, paddingBottom: "2px" }}>
                        <Stethoscope size={18} aria-hidden="true" />
                        <strong>Doctor:</strong>{" "}
                        {toTitleCase(p.doctor_name)}
                      </p>

                      <p style={{ display: "flex", alignItems: "center", gap: 6, paddingBottom: "2px" }}>
                        <GraduationCap size={18} aria-hidden="true" />
                        <strong>Specialization:</strong>{" "}
                        {toTitleCase(p.doctor_specialization)}
                      </p>

                      <p style={{ paddingBottom: "2px" }}>
                        <strong>Issued Time:</strong>{" "}
                        {new Date(p.created_at).toLocaleString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                          hour12: true,
                        })}
                      </p>
                    </div>

                  </div>
                </article>
              ))
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

export default PendingPrescriptions;

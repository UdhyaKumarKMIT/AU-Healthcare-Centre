import { useEffect, useState } from "react";
import {
  FileScan,
  Activity,
  Stethoscope,
  CircleUser,
  PersonStanding,
  GraduationCap,
} from "lucide-react";
import api from "../../api/axios";
import { replace, useNavigate } from "react-router-dom";

/* ---------- Types ---------- */
interface Prescription {
  prescription_id: string;
  patient_name: string;
  doctor_name: string;
  doctor_specialization: string;
  status: string;
  created_at: Date;
}

/* ---------- Helpers ---------- */
const toTitleCase = (str: string) =>
  str.replace(/\w\S*/g, (txt) =>
    txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase()
  );

/* ---------- Component ---------- */
const PendingPrescriptions = () => {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);

  /* FILTER STATE (NEW) */
  const [filterType, setFilterType] = useState<"all" | "patient" | "doctor" | "specialization">(
    "all"
  );
  const [searchTerm, setSearchTerm] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const fetchPrescriptions = async () => {
      try {
        const res = await api.get("/pharmacy/prescriptions");
        setPrescriptions(res.data || []);
      } catch (err) {
        console.error("Failed to fetch prescriptions:", err);
        alert("Could not load prescriptions.");
      } finally {
        setLoading(false);
      }
    };

    fetchPrescriptions();
  }, []);

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
            <Activity aria-hidden="true" />
            <div>
              <h2 style={{ margin: 0 }}>MIT Pharmacy</h2>
              <small>Pending Prescriptions</small>
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
            <p>No matching prescriptions found.</p>
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

                  <div style={{ flex: 1 }}>
                    <p style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <PersonStanding size={18} aria-hidden="true" />
                      <strong>Patient:</strong>{" "}
                      {toTitleCase(p.patient_name)}
                    </p>

                    <p style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <Stethoscope size={18} aria-hidden="true" />
                      <strong>Doctor:</strong>{" "}
                      {toTitleCase(p.doctor_name)}
                    </p>

                    <p style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <GraduationCap size={18} aria-hidden="true" />
                      <strong>Specialization:</strong>{" "}
                      {toTitleCase(p.doctor_specialization)}
                    </p>

                    <p>
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

                  <div style={statusBadgeStyle}>
                    {toTitleCase(p.status)}
                  </div>
                </div>
              </article>
            ))
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

const statusBadgeStyle: React.CSSProperties = {
  background: "#dbeafe",
  color: "#1e40af",
  padding: "0.4rem 0.9rem",
  borderRadius: "999px",
  fontWeight: 700,
  fontSize: "0.9rem",
  height: "fit-content",
};

export default PendingPrescriptions;

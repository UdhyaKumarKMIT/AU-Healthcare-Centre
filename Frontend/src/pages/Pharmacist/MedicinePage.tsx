import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { ChartColumnIncreasing } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import CustomModal from "./CustomModal";

/* ---------- Component ---------- */
const MedicinePage = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalConfirmCallback, setModalConfirmCallback] = useState<(() => void) | null>(null);

  const { user } = useAuth();
  const navigate = useNavigate();

  const [medicine, setMedicine] = useState<any[]>([]);
  const [filterType, setFilterType] = useState<"all" | "name">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [quickFilter, setQuickFilter] = useState<
    "none" | "out" | "exp3" | "exp1" | "withStock"
  >("none");

  useEffect(() => {
    if (!user) {
      navigate("/login/pharmacist");
      return;
    }

    const loadMedicineDetails = async () => {
      try {
        const res = await api.get("/pharmacy/medicine");
        console.log(res.data.medicines)
        setMedicine(res.data.medicines);
      } catch (err) {
        setModalMessage("Failed to load medicine details");
        setModalOpen(true);
        console.error(err);
      }
    };
    loadMedicineDetails();
  }, [navigate, user]);

  const getRemainingTime = (expiryDate: string) => {
    const now = new Date();
    const expiry = new Date(expiryDate);

    now.setHours(0, 0, 0, 0);
    expiry.setHours(0, 0, 0, 0);

    if (expiry <= now) {
      return { expired: true, years: 0, months: 0, days: 0 };
    }

    let years = expiry.getFullYear() - now.getFullYear();
    let months = expiry.getMonth() - now.getMonth();
    let days = expiry.getDate() - now.getDate();

    if (days < 0) {
      months--;
      const prevMonth = new Date(expiry.getFullYear(), expiry.getMonth(), 0);
      days += prevMonth.getDate();
    }

    if (months < 0) {
      years--;
      months += 12;
    }

    return { expired: false, years, months, days };
  };

  const toTitleCase = (str: string) =>
    str.replace(/\w\S*/g, (txt) =>
      txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase()
    );


  const isExpiringWithin = (date: string, months: number) => {
    const now = new Date();
    const limit = new Date();
    limit.setMonth(limit.getMonth() + months);
    const expiry = new Date(date);
    return expiry >= now && expiry <= limit;
  };

  const filteredMedicine = medicine.filter((med: any) => {
    let passesQuickFilter = true;
    let passesSearchFilter = true;

    if (quickFilter === "withStock") {
      passesQuickFilter = med.batches.some((b: any) => b.in_stock > 0);
    }

    if (quickFilter === "out") {
      passesQuickFilter =
        med.batches.length === 0 ||
        med.batches.every((b: any) => b.in_stock === 0);
    }

    if (quickFilter === "exp3") {
      passesQuickFilter = med.batches.some((b: any) =>
        isExpiringWithin(b.expiry_date, 3)
      );
    }

    if (quickFilter === "exp1") {
      passesQuickFilter = med.batches.some((b: any) =>
        isExpiringWithin(b.expiry_date, 1)
      );
    }

    if (filterType === "name" && searchTerm.trim() !== "") {
      passesSearchFilter = med.medicine_name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    }

    return passesQuickFilter && passesSearchFilter;
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
        <header
          style={{
            background: "linear-gradient(90deg, #1e40af, #1e3a8a)",
            color: "white",
          }}
        >
        </header>
        {/* MAIN */}
        <main
          style={{
            maxWidth: 1200,
            margin: "auto",
            padding: "1rem",
            color: "black",
          }}
        >
          <div style={pageCardStyle}>
            {/* TITLE */}
            <h2 style={{ color: "#1e40af", margin: 0 }}>
              <ChartColumnIncreasing /> Stock Analytics
            </h2><br />

            {/* FILTER BAR */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.6rem",
                flexWrap: "wrap",
                marginBottom: "1.5rem",
                padding: "0.75rem",
                borderRadius: "8px"
              }}
            >
              {/* SEARCH BAR */}
              <input
                type="text"
                placeholder="Search medicine name"
                value={searchTerm}
                onChange={(e) => {
                  setFilterType("name");
                  setSearchTerm(e.target.value);
                }}
                style={searchBarStyle}
              />

              {/* QUICK FILTERS */}
              <button
                onClick={() => setQuickFilter("withStock")}
                style={quickFilterButton(quickFilter === "withStock")}
              >
                With Stock
              </button>

              <button
                onClick={() => setQuickFilter("out")}
                style={quickFilterButton(quickFilter === "out")}
              >
                Out of Stock
              </button>

              <button
                onClick={() => setQuickFilter("exp3")}
                style={quickFilterButton(quickFilter === "exp3")}
              >
                Expiring in 3 months
              </button>

              <button
                onClick={() => setQuickFilter("exp1")}
                style={quickFilterButton(quickFilter === "exp1")}
              >
                Expiring in 1 month
              </button>

              <button
                onClick={() => {
                  setQuickFilter("none");
                  setSearchTerm("");
                  setFilterType("all");
                }}
                style={clearFilterButtonStyle}
              >
                Clear
              </button>

            </div>


            {/* LIST */}
            {Object.keys(filteredMedicine).length === 0 ? (
              <p>No medicines found.</p>
            ) : (
              filteredMedicine.map((med: any) => (
                <div key={med.medicine_id} style={medicineCardStyle}>
                  <div style={medicineHeaderStyle}>
                    <h3 style={{ margin: 0 }}>
                      {toTitleCase(med.medicine_name)}{" "}
                      <span style={{ color: "#555", fontWeight: 500 }}>
                        ({toTitleCase(med.type)})
                      </span>
                    </h3>

                  </div>

                  {med.batches.length === 0 ? (
                    <p style={{ fontFamily: "verdana" }}>Out of stock</p>
                  ) : (
                    med.batches.map((batch: any) => {
                      const remaining = getRemainingTime(batch.expiry_date);

                      return (
                        <div key={batch.batch_id} style={{ ...batchCardStyle, fontFamily: "verdana" }}>
                          <div style={{ paddingBottom: "2px" }}><strong>Batch ID:</strong> {batch.batch_id}</div>
                          <div style={{ paddingBottom: "2px" }}><strong>In Stock:</strong> {batch.in_stock} units</div>
                          <div style={{ paddingBottom: "2px" }}>
                            <strong>Expiry:</strong>{" "}
                            {new Date(batch.expiry_date).toLocaleDateString()}
                          </div>
                          <div>
                            <strong>Expiring in: </strong>{" "}
                            {remaining.expired ? (
                              <span style={{ color: "#dc2626" }}>Already Expired</span>
                            ) : (
                              <b><span style={{ color: "#2563eb" }}>
                                {remaining.years > 0 &&
                                  `${remaining.years} year(s) `}
                                {remaining.months > 0 &&
                                  `${remaining.months} month(s) `}
                                {remaining.days} day(s)
                              </span></b>
                            )}
                          </div>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "flex-start",
                              marginTop: "0.6rem",
                            }}
                          >
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )
              )
            )}
          </div>
        </main>
      </div>
    </>
  );
};

/* ---------- STYLES ---------- */

const pageCardStyle: React.CSSProperties = {
  background: "#ffffff",
  borderRadius: "12px",
  padding: "2rem",
  border: "1px solid #cbd5e1",
  boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
};

const medicineCardStyle: React.CSSProperties = {
  background: "#f3f8ff",
  borderRadius: "10px",
  padding: "1.25rem",
  marginBottom: "1.5rem",
  border: "1px solid #2563eb",
};

const medicineHeaderStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "0.75rem",
};

const batchCardStyle: React.CSSProperties = {
  background: "#ffffff",
  borderRadius: "8px",
  padding: "0.75rem",
  border: "1px solid #2563eb",
  marginBottom: "0.5rem",
};

const quickFilterButton = (active: boolean): React.CSSProperties => ({
  padding: "0.4rem",
  background: active ? "#2563eb" : "white",
  color: active ? "white" : "black",
  borderRadius: "5px",
  fontWeight: "500",
  border: "1px solid #2563eb",
});

const clearFilterButtonStyle: React.CSSProperties = {
  padding: "0.4rem",
  background: "white",
  color: "#b80a0a",
  borderRadius: "5px",
  fontWeight: "500",
  border: "1px solid #dc2626",
};

const searchBarStyle: React.CSSProperties = {
  padding: "0.45rem 0.6rem",
  borderRadius: "6px",
  border: "1px solid #2563eb",
  fontWeight: 600,
  width: "320px",
  background: "white",
};

export default MedicinePage;

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { ChartColumnIncreasing } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import CustomModal from "./CustomModal";
import { toast } from "react-toastify";
import pageStyles from "../shared/RolePage.module.css";

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
      navigate("/login");
      return;
    }

    const loadMedicineDetails = async () => {
      try {
        const res = await api.get("/pharmacy/medicine");
        setMedicine(res.data.medicines);
      } catch (err) {
        setModalMessage("Failed to load medicine details");
        setModalOpen(true);
        toast.error("Failed to load medicine details");
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

      <section className={pageStyles.card}>
        <div className={pageStyles.cardHeader}>
          <h2 className={pageStyles.cardHeaderTitle}>
            <ChartColumnIncreasing size={20} /> Stock Analytics
          </h2>
        </div>

        <div className={pageStyles.cardBody}>
          <div className={pageStyles.toolbar}>
            <div className={pageStyles.controls}>
              <input
                type="text"
                placeholder="Search medicine name"
                value={searchTerm}
                onChange={(e) => {
                  setFilterType("name");
                  setSearchTerm(e.target.value);
                }}
                className={pageStyles.input}
              />

              <button
                onClick={() => setQuickFilter("withStock")}
                className={`${pageStyles.button} ${quickFilter === "withStock" ? pageStyles.buttonPrimary : ""}`}
                type="button"
              >
                With Stock
              </button>

              <button
                onClick={() => setQuickFilter("out")}
                className={`${pageStyles.button} ${quickFilter === "out" ? pageStyles.buttonPrimary : ""}`}
                type="button"
              >
                Out of Stock
              </button>

              <button
                onClick={() => setQuickFilter("exp3")}
                className={`${pageStyles.button} ${quickFilter === "exp3" ? pageStyles.buttonPrimary : ""}`}
                type="button"
              >
                Expiring in 3 months
              </button>

              <button
                onClick={() => setQuickFilter("exp1")}
                className={`${pageStyles.button} ${quickFilter === "exp1" ? pageStyles.buttonPrimary : ""}`}
                type="button"
              >
                Expiring in 1 month
              </button>
            </div>

            <button
              onClick={() => {
                setQuickFilter("none");
                setSearchTerm("");
                setFilterType("all");
              }}
              className={`${pageStyles.button} ${pageStyles.buttonDanger}`}
              type="button"
            >
              Clear
            </button>
          </div>

          <div style={{ height: 16 }} />

          {Object.keys(filteredMedicine).length === 0 ? (
            <p className={pageStyles.muted}>No medicines found.</p>
          ) : (
            filteredMedicine.map((med: any) => (
              <section key={med.medicine_id} className={pageStyles.card} style={{ marginBottom: 16 }}>
                <div className={pageStyles.cardHeader}>
                  <h3 className={pageStyles.cardHeaderTitle}>
                    {toTitleCase(med.medicine_name)}{" "}
                    <span style={{ color: "#64748b", fontWeight: 600 }}>
                      ({toTitleCase(med.type)})
                    </span>
                  </h3>
                </div>

                <div className={pageStyles.cardBody}>
                  {med.batches.length === 0 ? (
                    <p className={pageStyles.muted}>Out of stock</p>
                  ) : (
                    med.batches.map((batch: any) => {
                      const remaining = getRemainingTime(batch.expiry_date);
                      return (
                        <div
                          key={batch.batch_id}
                          style={{
                            border: "1px solid #e2e8f0",
                            borderRadius: 12,
                            padding: 12,
                            marginBottom: 10,
                            background: "#ffffff",
                          }}
                        >
                          <div style={{ paddingBottom: 2 }}>
                            <strong>Batch ID:</strong> {batch.batch_id}
                          </div>
                          <div style={{ paddingBottom: 2 }}>
                            <strong>In Stock:</strong> {batch.in_stock} units
                          </div>
                          <div style={{ paddingBottom: 2 }}>
                            <strong>Expiry:</strong>{" "}
                            {new Date(batch.expiry_date).toLocaleDateString()}
                          </div>
                          <div>
                            <strong>Expiring in:</strong>{" "}
                            {remaining.expired ? (
                              <span style={{ color: "#dc2626", fontWeight: 700 }}>Already Expired</span>
                            ) : (
                              <span style={{ color: "#1a237e", fontWeight: 700 }}>
                                {remaining.years > 0 && `${remaining.years} year(s) `}
                                {remaining.months > 0 && `${remaining.months} month(s) `}
                                {remaining.days} day(s)
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </section>
            ))
          )}
        </div>
      </section>
    </>
  );
};
export default MedicinePage;

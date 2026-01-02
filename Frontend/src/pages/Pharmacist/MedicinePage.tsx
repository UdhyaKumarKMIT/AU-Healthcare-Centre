import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { Plus, Activity, PillBottle, Trash2 } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

/* ---------- Component ---------- */
const MedicinePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const pharmacistId = user?.pharmacist_id;

  const [medicine, setMedicine] = useState<any>({});
  const [filterType, setFilterType] = useState<"all" | "name">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [quickFilter, setQuickFilter] = useState<
    "none" | "out" | "exp3" | "exp1"
  >("none");

  const [showAddMedicine, setShowAddMedicine] = useState(false);

const [newMed, setNewMed] = useState({
  name: "",
  type: "",
  batch_id: "",
  expiry_date: "",
  in_stock: "",
});

  useEffect(() => {
    if (!pharmacistId) {
      navigate("/login/pharmacist");
      return;
    }

    const loadMedicineDetails = async () => {
      try {
        const res = await api.get("/pharmacy/medicine", {
          params: { pharmacist_id: pharmacistId }
        });
        setMedicine(res.data.medicines);
      } catch (err) {
        alert("Failed to load medicine details");
        console.error(err);
      }
    };
    loadMedicineDetails();
  }, [pharmacistId, navigate]);

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

  const handleAddMedicine = async () => {
  try {
    await api.post("/pharmacy/addMedicine", {
      pharmacist_id: pharmacistId,
      ...newMed,
      in_stock: Number(newMed.in_stock),
    });

    alert("Medicine added successfully");

    setShowAddMedicine(false);
    setNewMed({
      name: "",
      type: "",
      batch_id: "",
      expiry_date: "",
      in_stock: "",
    });

    // reload medicines
    const res = await api.get("/pharmacy/medicine", {
      params: { pharmacist_id: pharmacistId }
    });
    setMedicine(res.data.medicines);

  } catch (err) {
    console.error(err);
    alert("Failed to add medicine");
  }
};

const handleDeleteBatch = async (batchId: string) => {
  const confirmDelete = window.confirm(
    `Are you sure you want to delete batch ${batchId}?`
  );

  if (!confirmDelete) return;

  try {
    // Call backend API to delete batch
    await api.delete(`/pharmacy/medicine/deleteStock/${batchId}`, {
      params: { pharmacist_id: pharmacistId }
    });

    alert("Medicine Batch deleted successfully");

    // Reload medicine list after deletion
    const res = await api.get("/pharmacy/medicine", {
      params: { pharmacist_id: pharmacistId }
    });
    setMedicine(res.data.medicines);

  } catch (err) {
    console.error("Failed to delete batch:", err);
    alert("Failed to delete batch. Please try again.");
  }
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

  const filteredMedicine = Object.fromEntries(
    Object.entries(medicine).filter(([name, details]: [string, any]) => {
      let passesQuickFilter = true;
      let passesSearchFilter = true;

      if (quickFilter === "out") {
        passesQuickFilter =
          details.batches.length === 0 ||
          details.batches.every((b: any) => b.in_stock === 0);
      }

      if (quickFilter === "exp3") {
        passesQuickFilter = details.batches.some((b: any) =>
          isExpiringWithin(b.expiry_date, 3)
        );
      }

      if (quickFilter === "exp1") {
        passesQuickFilter = details.batches.some((b: any) =>
          isExpiringWithin(b.expiry_date, 1)
        );
      }

      if (filterType === "name" && searchTerm.trim() !== "") {
        passesSearchFilter = name
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
      }

      return passesQuickFilter && passesSearchFilter;
    })
  );

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
              <small>Medicine Inventory</small>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main
        style={{
          maxWidth: 1000,
          margin: "auto",
          padding: "2rem",
          color: "black",
        }}
      >
        <div style={pageCardStyle}>
          {/* TITLE */}
          <h2 style={{ color: "#1e40af", margin: 0 }}>
            <PillBottle /> Medicine Stock Details
          </h2>

           {/* ADD NEW MEDICINE BUTTON */}
          <div style={{ marginTop: "0.75rem", marginBottom: "1rem" }}>
            <button
              onClick={() => setShowAddMedicine(!showAddMedicine)}
              style={addNewMedicineButtonStyle}
            >
              <Plus size={16} /> Add New Medicine
            </button>
          </div>

          {/* ADD MEDICINE INLINE FORM */}
          {/* ADD MEDICINE INLINE FORM */}
{showAddMedicine && (
  <div style={inlineFormStyle}>
    {/* Medicine Name */}
    <div>
      <label htmlFor="newMedName" style={labelStyle}>
        <b>Medicine Name</b>
      </label>
      <input
        id="newMedName"
        placeholder="Enter medicine name"
        value={newMed.name}
        onChange={(e) => setNewMed({ ...newMed, name: e.target.value })}
        style={filterInputStyle}
        required
      />
    </div>

    {/* Medicine Type */}
    <div>
  <label htmlFor="newMedType" style={labelStyle}>
    <b>Medicine Type</b>
  </label>
  <select
    id="newMedType"
    value={newMed.type}
    onChange={(e) => setNewMed({ ...newMed, type: e.target.value })}
    style={selectInputStyle}
    required
  >
    <option value="" disabled>
      Select medicine type
    </option>
    <option value="capsule">Capsule</option>
    <option value="syrup">Syrup</option>
    <option value="tablet">Tablet</option>
    <option value="injection">Injection</option>
    <option value="ointment">Ointment</option>
    <option value="drops">Drops</option>
  </select>
</div>
    {/* Batch ID */}
    <div>
      <label htmlFor="newBatchId" style={labelStyle}>
        <b>Batch ID</b>
      </label>
      <input
        id="newBatchId"
        placeholder="Enter unique batch ID"
        value={newMed.batch_id}
        onChange={(e) => setNewMed({ ...newMed, batch_id: e.target.value })}
        style={filterInputStyle}
        required
      />
    </div>

    {/* Expiry Date */}
    <div>
      <label htmlFor="newExpiryDate" style={labelStyle}>
        <b>Expiry Date</b>
      </label>
      <input
        id="newExpiryDate"
        type="date"
        value={newMed.expiry_date}
        onChange={(e) => setNewMed({ ...newMed, expiry_date: e.target.value })}
        style={filterInputStyle}
        required
        min={new Date(new Date().setMonth(new Date().getMonth() + 1))
          .toISOString()
          .split("T")[0]} // sets min date 1 month ahead
      />
    </div>

    {/* Quantity / In Stock */}
    <div>
      <label htmlFor="newInStock" style={labelStyle}>
        <b>Quantity in Stock</b>
      </label>
      <input
        id="newInStock"
        type="number"
        placeholder="Enter quantity"
        min={1}
        value={newMed.in_stock}
        onChange={(e) => setNewMed({ ...newMed, in_stock: e.target.value })}
        style={filterInputStyle}
        required
      />
    </div>

    {/* Save / Cancel */}
    <div style={{ display: "flex", gap: "0.5rem" }}>
      <button onClick={handleAddMedicine} style={addButtonStyle}>
        Save
      </button>
      <button
        onClick={() => setShowAddMedicine(false)}
        style={clearFilterButtonStyle}
      >
        Cancel
      </button>
    </div>
  </div>
)}



          {/* QUICK FILTERS */}
          <div
            style={{
              display: "flex",
              gap: "0.5rem",
              flexWrap: "wrap",
              marginBottom: "1rem",
            }}
          >
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
              Expiring in 3 Months
            </button>

            <button
              onClick={() => setQuickFilter("exp1")}
              style={quickFilterButton(quickFilter === "exp1")}
            >
              Expiring in 1 Month
            </button>

            {quickFilter !== "none" && (
              <button
                onClick={() => setQuickFilter("none")}
                style={clearFilterButtonStyle}
              >
                Clear
              </button>
            )}
          </div>

          {/* SEARCH */}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-start",
              gap: "0.5rem",
              marginBottom: "1.5rem",
              flexWrap: "wrap",
            }}
          >
            <select
              value={filterType}
              onChange={(e) =>
                setFilterType(e.target.value as "all" | "name")
              }
              style={filterSelectStyle}
            >
              <option value="all">All</option>
              <option value="name">Medicine Name</option>
            </select>

            {filterType === "name" && (
              <input
                type="text"
                placeholder="Search by medicine name"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={filterInputStyle}
              />
            )}
          </div>

          {/* LIST */}
          {Object.keys(filteredMedicine).length === 0 ? (
            <p>No medicines found.</p>
          ) : (
            Object.entries(filteredMedicine).map(
              ([name, details]: [string, any]) => (
                <div key={name} style={medicineCardStyle}>
                  <div style={medicineHeaderStyle}>
                    <h3 style={{ margin: 0 }}>
                      {toTitleCase(name)}{" "}
                      <span style={{ color: "#555", fontWeight: 500 }}>
                        ({toTitleCase(details.type)})
                      </span>
                    </h3>

                    <button
                      onClick={() => navigate(`/pharmacist/addMedicineStock/${name}`)}
                      style={addButtonStyle}
                    >
                      <Plus size={16} /> Add Stock
                    </button>
                  </div>

                  {details.batches.length === 0 ? (
                    <p>Out of stock</p>
                  ) : (
                    details.batches.map((batch: any) => {
                      const remaining = getRemainingTime(batch.expiry_date);

                      return (
                        <div key={batch.batch_id} style={batchCardStyle}>
                          <div><strong>Batch ID:</strong> {batch.batch_id}</div>
                          <div><strong>In Stock:</strong> {batch.in_stock} units</div>
                          <div>
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
                  <button
                    onClick={() => handleDeleteBatch(batch.batch_id)}
                    style={deleteButtonStyle}
                  >
                    <Trash2 size={12} /> Delete
                  </button>
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
  );
};

/* ---------- STYLES ---------- */

const pageCardStyle: React.CSSProperties = {
  background: "#ffffff",
  borderRadius: "12px",
  padding: "2rem",
  border: "1px solid #2563eb",
};

const addNewMedicineButtonStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "0.4rem",
  background: "#ffffff",
  color: "black",
  border: "1px solid #2563eb",
  borderRadius: "6px",
  padding: "0.45rem 0.85rem",
  cursor: "pointer",
  fontWeight: 600,
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

const addButtonStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "0.3rem",
  background: "#2563eb",
  color: "white",
  border: "none",
  borderRadius: "6px",
  padding: "0.4rem 0.75rem",
  cursor: "pointer",
  fontWeight: 600,
};

const filterSelectStyle: React.CSSProperties = {
  padding: "0.4rem",
  borderRadius: "6px",
  border: "1px solid #2563eb",
  background: "white",
  color: "black",
  fontWeight: "bold"
};

const filterInputStyle: React.CSSProperties = {
  padding: "0.4rem",
  borderRadius: "6px",
  border: "1px solid #2563eb",
  background: "white",
  color: "black",
  fontWeight: "bold"
};

const selectInputStyle: React.CSSProperties = {
  padding: "0.4rem",
  borderRadius: "6px",
  border: "1px solid #2563eb",
  background: "white",
  color: "#302f39ff",
  fontWeight: "bold"
};

const quickFilterButton = (active: boolean): React.CSSProperties => ({
  padding: "0.4rem",
  background: active ? "#2563eb" : "white",
  color: active ? "white" : "black",
  border: "1px solid #2563eb",
});

const clearFilterButtonStyle: React.CSSProperties = {
  padding: "0.4rem",
  background: "white",
  color: "#dc2626",
  border: "1px solid #dc2626",
};

const inlineFormStyle = {
  border: "1px solid #2563eb",
  padding: "1rem",
  borderRadius: "8px",
  marginBottom: "1.5rem",
  display: "grid",
  gap: "0.5rem",
};

const deleteButtonStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "0.25rem",
  background: "#dc2626",      // red for delete
  color: "white",
  border: "none",
  borderRadius: "6px",
  padding: "0.35rem 0.6rem",
  cursor: "pointer",
  fontWeight: 600,
};

const labelStyle: React.CSSProperties = {
  display: "block",
  marginBottom: "0.25rem",
  fontWeight: 450,
  color: "#1e40af", // deep blue for visibility
  fontSize: "0.9rem",
};

export default MedicinePage;

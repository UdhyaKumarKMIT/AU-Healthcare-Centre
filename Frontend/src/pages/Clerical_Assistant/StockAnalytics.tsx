import { useState, useEffect } from "react";
import api from "../../api/axios";
import { ChartColumnIncreasing, Plus, Trash2, Upload } from "lucide-react";
import { useNavigate } from "react-router-dom";
import CustomModal from "./CustomModal";
import pageStyles from "../shared/RolePage.module.css";
import { toast } from "react-toastify";
import * as XLSX from "xlsx";

const stockLabels = [
  { key: "mainStock", label: "Main Stock" },
  { key: "pharmacy", label: "Pharmacy Substock" },
  { key: "labtech", label: "Labtech Substock" },
  { key: "nurse", label: "Nurse Substock" },
  { key: "dressing", label: "Dressing Substock" },
];

const StockAnalytics = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalConfirmCallback, setModalConfirmCallback] = useState<(() => void) | null>(null);
  const [navigateOnClose, setNavigateOnClose] = useState(false);

  const [selectedFilter, setSelectedFilter] = useState<string>("mainStock");
  const [stockData, setStockData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [showAddMedicine, setShowAddMedicine] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [bulkFile, setBulkFile] = useState<File | null>(null);
  const [bulkUploading, setBulkUploading] = useState(false);

  const [newMed, setNewMed] = useState({
    name: "",
    type: "",
    batch_id: "",
    expiry_date: "",
    in_stock: "",
  });

  const navigate = useNavigate();

  // Subfilters
  const [searchTerm, setSearchTerm] = useState<string>(
    sessionStorage.getItem("stock_searchTerm") || ""
  );

  const [expiryFilter, setExpiryFilter] = useState<"all" | "1m" | "3m">(
    (sessionStorage.getItem("stock_expiryFilter") as "all" | "1m" | "3m") || "all"
  );

  const [stockStatusFilter, setStockStatusFilter] = useState<"all" | "in" | "out">(
    (sessionStorage.getItem("stock_stockStatusFilter") as "all" | "in" | "out") || "all"
  );

  const [lowStockFilter, setLowStockFilter] = useState<"all" | "low">(
    (sessionStorage.getItem("stock_lowStockFilter") as "all" | "low") || "all"
  );

  const handleClearStockFilters = () => {
    setSearchTerm("");
    setExpiryFilter("all");
    setStockStatusFilter("all");
    setLowStockFilter("all");

    sessionStorage.removeItem("stock_searchTerm");
    sessionStorage.removeItem("stock_expiryFilter");
    sessionStorage.removeItem("stock_stockStatusFilter");
    sessionStorage.removeItem("stock_lowStockFilter");
  };

  // Fetch stock data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await api.get("/clerical_assistant/getAnalytics");
        const dataForFilter = res.data[selectedFilter] || [];
        // sanitize data
        const sanitizedData = dataForFilter.map((med: any) => ({
          ...med,
          total_quantity: Number(med.total_quantity) || 0,
          batches: med.batches ?? [],
        }));
        setStockData(sanitizedData);
      } catch (err) {
        console.error(err);
        setStockData([]);
      }
      setLoading(false);
    };
    fetchData();
  }, [selectedFilter]);

  // Load filter from sessionStorage
  useEffect(() => {
    const filterLabel = sessionStorage.getItem("currentFilter");
    if (!filterLabel) return setSelectedFilter("mainStock");
    const filterKey = stockLabels.find((s) => s.label === filterLabel)?.key;
    setSelectedFilter(filterKey || "mainStock");
  }, []);

  // Filtered stock for display
  const filteredStock = stockData.filter((med) => {
    const matchesName = med.name.toLowerCase().includes(searchTerm.toLowerCase());
    const inStock = med.total_quantity > 0;

    // Stock status filter
    if (stockStatusFilter === "in" && !inStock) return false;
    if (stockStatusFilter === "out" && inStock) return false;

    if (lowStockFilter === "low" && !(med.total_quantity > 0 && med.total_quantity <= 30)) return false;

    // Expiry filter
    let batches = med.batches;
    if (expiryFilter !== "all") {
      const limit = new Date();
      limit.setMonth(limit.getMonth() + (expiryFilter === "1m" ? 1 : 3));
      const today = new Date();
      batches = batches.filter(
        (b: any) =>
          b?.expiry_date &&
          new Date(b.expiry_date) >= today &&
          new Date(b.expiry_date) <= limit
      );
    }

    // Hide if no batches after expiry filter
    if (batches.length === 0) return false;

    return matchesName;
  });

  // Add new medicine
  const handleAddMedicine = async () => {
    try {
      await api.post("/clerical_assistant/addMedicine", {
        ...newMed,
        in_stock: Number(newMed.in_stock),
      });
      setModalMessage("Medicine added successfully");
      setModalOpen(true);
      setNavigateOnClose(true);

      toast.success("Medicine added successfully");

    } catch (err) {
      setModalMessage("Unable to add medicine. The medicine or Batch ID may already exist.");
      setModalOpen(true);
      toast.error("Unable to add medicine");
    }
  };

  const handleBulkUpload = async () => {
    if (!bulkFile) {
      setModalMessage("Please select an Excel file first.");
      setModalOpen(true);
      toast.error("No file selected");
      return;
    }

    const form = new FormData();
    form.append("file", bulkFile);

    setBulkUploading(true);
    try {
      const res = await api.post("/clerical_assistant/addMedicineBulk", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const inserted = res.data?.data?.inserted ?? 0;
      const failed = res.data?.data?.failed ?? 0;
      const errors = res.data?.data?.errors ?? [];

      toast.success(`Upload complete: inserted ${inserted}, failed ${failed}`);

      if (failed > 0 && errors.length) {
        const top = errors.slice(0, 8).map((e: any) => `Row ${e.row}: ${e.message}`).join("\n");
        setModalMessage(
          `Some rows failed to import.\n\n${top}${errors.length > 8 ? "\n..." : ""}`
        );
        setModalOpen(true);
      } else {
        setModalMessage(`Upload complete: inserted ${inserted}.`);
        setModalOpen(true);
      }

      setBulkFile(null);
      setShowBulkUpload(false);
      setNavigateOnClose(true);
    } catch (err: any) {
      const message = err?.response?.data?.message || "Bulk upload failed";
      setModalMessage(message);
      setModalOpen(true);
      toast.error(message);
    } finally {
      setBulkUploading(false);
    }
  };

  const handleDownloadBulkTemplate = () => {
    try {
      const data = [
        ["name", "type", "batch_id", "expiry_date", "in_stock"],
        ["Paracetamol 500mg", "tablet", "PCT-003", "2027-12-31", 100],
        ["Cough Syrup", "syrup", "CS-001", "2027-06-30", 50],
      ];

      const ws = XLSX.utils.aoa_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Medicines");

      const file = XLSX.write(wb, { bookType: "xlsx", type: "array" });
      const blob = new Blob([file], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "medicine_bulk_template.xlsx";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      toast.error("Unable to download template");
    }
  };

  const handleDeleteBatch = (batchId: string) => {
    setModalMessage("Are you sure you want to clear this batch?");
    setModalConfirmCallback(() => () => {
      clearBatchConfirmed(batchId);
    });
    setModalOpen(true);
  };

  // Delete batch
  const clearBatchConfirmed = async (batchId: string) => {

    try {
      await api.delete(`/clerical_assistant/medicine/deleteStock/${batchId}`);
      setModalMessage("Medicine Batch deleted successfully");
      setModalOpen(true);

      const res = await api.get("/clerical_assistant/getAnalytics");
      const dataForFilter = res.data[selectedFilter] || [];
      setStockData(
        dataForFilter.map((med: any) => ({
          ...med,
          total_quantity: Number(med.total_quantity) || 0,
          batches: med.batches ?? [],
        }))
      );
    } catch (err) {
      console.error("Failed to delete batch:", err);
      setModalMessage("Failed to delete batch. Please try again.");
      setModalOpen(true);
    }
  };

  return (
    <>
      <CustomModal
        isOpen={modalOpen}
        title="Alert"
        message={modalMessage}
        confirmText="OK"
        onConfirm={modalConfirmCallback ?? undefined}
        onClose={() => {
          {
            setModalConfirmCallback(null);
            setModalOpen(false);
            if (navigateOnClose) {
              location.reload();
              setNavigateOnClose(false);
            }
          }
        }}
      />

      <div>
        <section className={pageStyles.card}>
          <div className={pageStyles.cardHeader}>
            <h2 className={pageStyles.cardHeaderTitle}>
              <ChartColumnIncreasing size={20} /> Stock Analytics
            </h2>

            <div className={pageStyles.controls}>
              <button
                onClick={() => setShowAddMedicine(true)}
                className={`${pageStyles.button} ${pageStyles.buttonPrimary}`}
                type="button"
              >
                <Plus size={16} /> Add New Medicine
              </button>

              <button
                onClick={() => {
                  setShowBulkUpload((s) => !s);
                  setShowAddMedicine(false);
                }}
                className={pageStyles.button}
                type="button"
              >
                <Upload size={16} /> Upload Excel
              </button>
            </div>
          </div>

          <div className={pageStyles.cardBody}>

            {showBulkUpload && (
              <section className={pageStyles.card} style={{ marginBottom: 16 }}>
                <div className={pageStyles.cardHeader}>
                  <h3 className={pageStyles.cardHeaderTitle}>Bulk Upload Medicines</h3>
                </div>
                <div className={pageStyles.cardBody}>
                  <p className={pageStyles.muted} style={{ marginTop: 0 }}>
                    Upload an Excel file with columns: <b>name</b>, <b>type</b>, <b>batch_id</b>, <b>expiry_date</b>, <b>in_stock</b>.
                    Types supported: tablet, syrup, ointment, injection, drops, external.
                  </p>

                  <div className={pageStyles.controls}>
                    <input
                      type="file"
                      accept=".xlsx,.xls"
                      onChange={(e) => setBulkFile(e.target.files?.[0] ?? null)}
                      className={pageStyles.input}
                    />

                    <button
                      onClick={handleDownloadBulkTemplate}
                      className={pageStyles.button}
                      type="button"
                      disabled={bulkUploading}
                    >
                      Download Template
                    </button>

                    <button
                      onClick={handleBulkUpload}
                      className={`${pageStyles.button} ${pageStyles.buttonPrimary}`}
                      type="button"
                      disabled={bulkUploading}
                    >
                      {bulkUploading ? "Uploading..." : "Upload"}
                    </button>

                    <button
                      onClick={() => {
                        setShowBulkUpload(false);
                        setBulkFile(null);
                      }}
                      className={`${pageStyles.button} ${pageStyles.buttonDanger}`}
                      type="button"
                      disabled={bulkUploading}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </section>
            )}

            {showAddMedicine && (
              <div style={inlineFormStyle}>
                <div>
                  <label htmlFor="newMedName" style={labelStyle}><b>Medicine Name</b></label>
                  <input
                    id="newMedName"
                    placeholder="Enter medicine name"
                    value={newMed.name}
                    onChange={(e) => setNewMed({ ...newMed, name: e.target.value })}
                    style={filterInputStyle}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="newMedType" style={labelStyle}><b>Medicine Type</b></label>
                  <select
                    id="newMedType"
                    value={newMed.type}
                    onChange={(e) => setNewMed({ ...newMed, type: e.target.value })}
                    style={selectInputStyle}
                    required
                  >
                    <option value="" disabled>Select medicine type</option>
                    <option value="syrup">Syrup</option>
                    <option value="tablet">Tablet</option>
                    <option value="injection">Injection</option>
                    <option value="ointment">Ointment</option>
                    <option value="drops">Drops</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="newBatchId" style={labelStyle}><b>Batch No</b></label>
                  <input
                    id="newBatchId"
                    placeholder="Enter unique batch No"
                    value={newMed.batch_id}
                    onChange={(e) => setNewMed({ ...newMed, batch_id: e.target.value })}
                    style={filterInputStyle}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="newExpiryDate" style={labelStyle}><b>Expiry Date</b></label>
                  <input
                    id="newExpiryDate"
                    type="date"
                    value={newMed.expiry_date}
                    onChange={(e) => setNewMed({ ...newMed, expiry_date: e.target.value })}
                    style={filterInputStyle}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="newInStock" style={labelStyle}><b>Quantity in Stock</b></label>
                  <input
                    id="newInStock"
                    type="number"
                    min={1}
                    value={newMed.in_stock}
                    onChange={(e) => setNewMed({ ...newMed, in_stock: e.target.value })}
                    style={filterInputStyle}
                    required
                  />
                </div>

                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button onClick={handleAddMedicine} style={addButtonStyle}>Save</button>
                  <button onClick={() => setShowAddMedicine(false)} style={clearFilterButtonStyle}>Cancel</button>
                </div>
              </div>
            )}

            {/* FILTER BUTTONS */}
            <div style={filterContainerStyle}>
              {stockLabels.map((label) => (
                <button
                  key={label.key}
                  onClick={() => { sessionStorage.setItem("currentFilter", label.label); setSelectedFilter(label.key); }}
                  style={{
                    ...filterButtonStyle,
                    ...(selectedFilter === label.key ? filterActiveStyle : {}),
                  }}
                  type="button"
                >
                  {label.label}
                </button>
              ))}
            </div>

            {/* SUBFILTERS */}
            <div style={subFilterContainerStyle}>
              <input
                type="text"
                placeholder="Search by medicine name"
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); sessionStorage.setItem("stock_searchTerm", e.target.value); }}
                className={pageStyles.input}
              />

              <select
                value={stockStatusFilter}
                onChange={(e) => { setStockStatusFilter(e.target.value as "all" | "in" | "out"); sessionStorage.setItem("stock_stockStatusFilter", e.target.value); }}
                className={pageStyles.select}
              >
                <option value="all">All Stock</option>
                <option value="in">In Stock</option>
                <option value="out">Out of Stock</option>
              </select>

              <select
                value={expiryFilter}
                onChange={(e) => { setExpiryFilter(e.target.value as "all" | "1m" | "3m"); sessionStorage.setItem("stock_expiryFilter", e.target.value); }}
                className={pageStyles.select}
              >
                <option value="all">All Expiry</option>
                <option value="1m">Expiring in 1 Month</option>
                <option value="3m">Expiring in 3 Months</option>
              </select>

              {/* Low Stock Filter */}
              <select
                value={lowStockFilter}
                onChange={(e) => { setLowStockFilter(e.target.value as "all" | "low"); sessionStorage.setItem("stock_lowStockFilter", e.target.value); }}
                className={pageStyles.select}
              >
                <option value="all">All Stock Levels</option>
                <option value="low">Low Stock ≤ 30</option>
              </select>
              <button
                onClick={handleClearStockFilters}
                className={`${pageStyles.button} ${pageStyles.buttonDanger}`}
                type="button"
              >
                Clear Filters
              </button>
            </div>

            {/* STOCK LIST */}
            {loading ? (
              <p className={pageStyles.muted}>Loading...</p>
            ) : filteredStock.length === 0 ? (
              <p className={pageStyles.muted}>No medicine available</p>
            ) : (
              filteredStock.map((med) => {
                let batches = med.batches;
                const today = new Date();

                if (expiryFilter !== "all") {
                  const limit = new Date();
                  limit.setMonth(limit.getMonth() + (expiryFilter === "1m" ? 1 : 3));
                  batches = batches.filter((b: any) => b?.expiry_date && new Date(b.expiry_date) >= today && new Date(b.expiry_date) <= limit);
                }

                const showOutOfStock = med.total_quantity === 0 || batches.length === 0;

                return (
                  <div key={med.medicine_id} style={medicineCardStyle}>
                    <div style={medicineHeaderStyle}>
                      <h3>{med.name} <span style={{ color: "#555" }}>({med.total_quantity} units)</span></h3>
                      <button
                        onClick={() => {
                          sessionStorage.setItem("medicineId", String(med.medicine_id));
                          sessionStorage.setItem("medicineName", String(med.name));

                          if (selectedFilter === "mainStock") {
                            navigate(`/clerical_assistant/addMedicineStock/${med.name}`);
                          } else {
                            const selectedLabel = stockLabels.find(s => s.key === selectedFilter)?.label;
                            if (selectedLabel) {
                              sessionStorage.setItem("activeStock", JSON.stringify([selectedLabel]));
                            }
                            navigate("/clerical_assistant/issueStock");
                          }
                        }}
                        style={addStockButtonStyle}
                        type="button"
                      >
                        <Plus size={14} /> Add Stock
                      </button>
                    </div>

                    {showOutOfStock ? (
                      <div style={{ marginTop: "0.75rem", padding: "0.75rem", borderRadius: "6px", background: "#b7cff0", color: "#000", fontWeight: 600, textAlign: "center" }}>
                        Out of Stock
                      </div>
                    ) : (
                      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "0.5rem" }}>
                        <thead>
                          <tr>
                            <th style={nestedThStyle}>Batch ID</th>
                            <th style={nestedThStyle}>Quantity</th>
                            <th style={nestedThStyle}>Expiry</th>
                            <th style={nestedThStyle}>Time to Expiry</th>
                            {selectedFilter === "mainStock" && <th style={nestedThStyle}>Action</th>}
                          </tr>
                        </thead>
                        <tbody>
                          {batches.map((batch: any) => {
                            const expiry = new Date(batch.expiry_date);
                            const today = new Date();
                            today.setHours(0, 0, 0, 0);
                            expiry.setHours(0, 0, 0, 0);

                            let years = expiry.getFullYear() - today.getFullYear();
                            let months = expiry.getMonth() - today.getMonth();
                            let days = expiry.getDate() - today.getDate();

                            if (days < 0) { months--; days += new Date(expiry.getFullYear(), expiry.getMonth(), 0).getDate(); }
                            if (months < 0) { years--; months += 12; }

                            const isExpired = expiry <= today;

                            return (
                              <tr key={batch.batch_id}>
                                <td style={nestedTdStyle}>{batch.batch_id}</td>
                                <td style={nestedTdStyle}>{batch.quantity}</td>
                                <td style={{ ...nestedTdStyle, color: isExpired ? "#dc2626" : "#1a237e" }}>{expiry.toLocaleDateString()} {isExpired ? "(Expired)" : ""}</td>
                                <td style={{ ...nestedTdStyle, color: isExpired ? "#dc2626" : "#1a237e", fontWeight: 600 }}>
                                  {isExpired ? "Expired" : `${years > 0 ? years + "y " : ""}${months > 0 ? months + "m " : ""}${days}d`}
                                </td>
                                {selectedFilter === "mainStock" && (
                                  <td style={{ ...nestedTdStyle, textAlign: "center" }}>
                                    <button onClick={() => handleDeleteBatch(batch.batch_id)} style={deleteButtonStyle} type="button"><Trash2 size={12} /> Delete</button>
                                  </td>
                                )}
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </section>
      </div>
    </>
  );
};

/* ---------- Styles ---------- */
const filterContainerStyle: React.CSSProperties = {
  display: "flex",
  gap: "0.75rem",
  marginBottom: "1rem",
  flexWrap: "wrap",
};

const filterButtonStyle: React.CSSProperties = {
  padding: "0.45rem 0.85rem",
  borderRadius: "6px",
  border: "1px solid #e2e8f0",
  background: "white",
  color: "black",
  cursor: "pointer",
  fontWeight: 600,
};

const filterActiveStyle: React.CSSProperties = {
  border: "2px solid #1a237e",
  background: "#1a237e",
  color: "white",
};

const subFilterContainerStyle: React.CSSProperties = {
  display: "flex",
  gap: "0.5rem",
  marginBottom: "1rem",
  flexWrap: "wrap",
};

const medicineCardStyle: React.CSSProperties = {
  background: "#ffffff",
  borderRadius: "10px",
  padding: "1rem",
  marginBottom: "1.25rem",
  border: "1px solid #e2e8f0",
  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
};

const medicineHeaderStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "0.5rem",
};

const nestedThStyle: React.CSSProperties = {
  border: "1px solid #e2e8f0",
  padding: "0.35rem 0.5rem",
  background: "#f1f5f9",
  fontWeight: 600,
  textAlign: "left",
  fontSize: "0.95rem",
};

const nestedTdStyle: React.CSSProperties = {
  border: "1px solid #e2e8f0",
  padding: "0.35rem 0.5rem",
  fontSize: "0.95rem",
  fontWeight: 500,
};

const addStockButtonStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "0.35rem",
  background: "#1a237e",
  color: "white",
  border: "none",
  borderRadius: "6px",
  padding: "0.4rem 0.75rem",
  cursor: "pointer",
  fontWeight: 600,
};

const labelStyle: React.CSSProperties = {
  display: "block",
  marginBottom: "0.25rem",
  fontWeight: 450,
  color: "#1a237e",
  fontSize: "0.9rem",
};

const clearFilterButtonStyle: React.CSSProperties = {
  padding: "0.4rem",
  background: "white",
  color: "#dc2626",
  border: "1px solid #dc2626",
};

const inlineFormStyle = {
  border: "1px solid #e2e8f0",
  padding: "1rem",
  borderRadius: "8px",
  marginBottom: "1.5rem",
  display: "grid",
  gap: "0.5rem",
};

const selectInputStyle: React.CSSProperties = {
  padding: "0.4rem",
  borderRadius: "6px",
  border: "1px solid #e2e8f0",
  background: "white",
  color: "#302f39ff",
  fontWeight: "bold"
};

const addNewMedicineButtonStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "0.4rem",
  background: "#ffffff",
  color: "black",
  border: "1px solid #e2e8f0",
  borderRadius: "6px",
  padding: "0.45rem 0.85rem",
  cursor: "pointer",
  fontWeight: 600,
};

const filterInputStyle: React.CSSProperties = {
  padding: "0.35rem 0.5rem",
  borderRadius: "6px",
  border: "1px solid #e2e8f0",
  fontWeight: 500,
  flex: 1,
};

const addButtonStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "0.3rem",
  background: "#1a237e",
  color: "white",
  border: "none",
  borderRadius: "6px",
  padding: "0.4rem 0.75rem",
  cursor: "pointer",
  fontWeight: 600,
};

const deleteButtonStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "0.25rem",
  background: "#dc2626",      // red for delete
  color: "white",
  border: "none",
  borderRadius: "3px",
  padding: "0.3rem 0.5rem",
  cursor: "pointer",
  fontSize: "0.8rem",
  fontWeight: 600,
};

export default StockAnalytics;

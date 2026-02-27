import {
  getMedicineDetailsService,
  addMedicineBatchService,
  getExpiredMedicineBatchesService,
  clearMedicineBatchService,
  fetchBatchesService
} from "../../services/pharmacist/inventory.service.js";

export const getMedicineDetails = async (req, res) => {
  try {
    const medicines = await getMedicineDetailsService();
    res.status(200).json({ medicines });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Unable to fetch medicine batches" });
  }
};

export const addMedicineBatch = async (req, res) => {
  try {
    const result = await addMedicineBatchService(req.body);
    res.status(201).json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

export const getExpiredMedicineBatches = async (req, res) => {
  try {
    const items = await getExpiredMedicineBatchesService();
    res.status(200).json({ items });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Unable to fetch expired medicine batches" });
  }
};

export const clearMedicineBatch = async (req, res) => {
  try {
    const { batch_id } = req.params;
    const { secret_code } = req.query;
    if (!secret_code) return res.status(400).json({ message: "secret_code is required" });

    const result = await clearMedicineBatchService(batch_id, secret_code);
    res.status(200).json(result);
  } catch (err) {
    console.error(err);
    if (String(err.message).toLowerCase().includes("invalid secret code")) {
      return res.status(401).json({ message: "Invalid secret code" });
    }
    res.status(500).json({ message: err.message || "Unable to clear medicine batch" });
  }
};

export const getBatches = async (req, res) => {
  const { medicine_name, quantity } = req.query;

  if (!medicine_name || !quantity) {
    return res.status(400).json({ message: "Missing parameters" });
  }

  try {
    const batches = await fetchBatchesService(medicine_name, quantity);
    res.status(200).json({ batches });
  } catch (err) {
    if (err.message === "Medicine not found") {
      return res.status(404).json({ message: err.message });
    }
    if (err.message === "Insufficient stock to fulfill required quantity") {
      return res.status(400).json({ message: err.message });
    }
    console.error("Batch fetch error:", err);
    res.status(500).json({ message: "Failed to fetch batches" });
  }
};
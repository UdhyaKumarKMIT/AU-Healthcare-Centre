import pool from "../../config/db.js"
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
  const connection = await pool.getConnection();
  try {
    const { batch_id } = req.params;
    const { pharmacist_id } = req.query;
    if (!pharmacist_id) return res.status(400).json({ message: "pharmacist_id is required" });

    const result = await clearMedicineBatchService(batch_id, pharmacist_id, connection);
    res.status(200).json(result);
  } catch (err) {
    await connection.rollback();
    console.error(err);
    res.status(500).json({ message: err.message || "Unable to clear medicine batch" });
  } finally {
    connection.release();
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
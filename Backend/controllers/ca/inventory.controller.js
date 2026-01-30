
/*export {
  addMedicineBatch,
  deleteMedicineBatch,
  clearMedicineBatch,
  addMedicine,
  getExpiredMedicineBatches,
  getOutOfStock,
  getBatches
} from "../../services/ca/inventory.raw.service";*/

import * as InventoryService from "../../services/ca/inventory.service.js";

export const addMedicineBatch = async (req, res) => {
  try {
    const result = await InventoryService.addMedicineBatch(req.body);
    res.status(201).json({ success: true, data: result });
  } catch (err) {
    console.error("Add medicine batch error:", err.message);
    res.status(400).json({ success: false, message: err.message });
  }
};

export const deleteMedicineBatch = async (req, res) => {
  const { batch_id } = req.params;

  if (!batch_id) {
    return res.status(400).json({ success: false, message: "Batch ID is required" });
  }

  try {
    const result = await InventoryService.deleteMedicineBatch(batch_id);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    console.error("Delete medicine batch error:", err.message);
    res.status(400).json({ success: false, message: err.message });
  }
};

export const clearMedicineBatch = async (req, res) => {
  const { batch_id } = req.params;

  if (!batch_id) {
    return res.status(400).json({ success: false, message: "Batch ID is required" });
  }

  try {
    const result = await InventoryService.clearMedicineBatch(batch_id);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    console.error("Clear medicine batch error:", err.message);
    res.status(400).json({ success: false, message: err.message });
  }
};

export const addMedicine = async (req, res) => {
  try {
    const result = await InventoryService.addMedicine(req.body);
    res.status(201).json({ success: true, data: result });
  } catch (err) {
    console.error("Add medicine error:", err.message);
    res.status(400).json({ success: false, message: err.message });
  }
};

export const getExpiredMedicineBatches = async (req, res) => {
  try {
    const items = await InventoryService.getExpiredMedicineBatches();
    res.status(200).json({ success: true, items });
  } catch (err) {
    console.error("Get expired medicine batches error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getOutOfStock = async (req, res) => {
  try {
    const medicines = await InventoryService.getOutOfStock();
    res.status(200).json({ success: true, medicines });
  } catch (err) {
    console.error("Get out-of-stock medicines error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getBatches = async (req, res) => {
  try {
    const { medicine_name, total_days, quantity } = req.query;

    const batches = await InventoryService.getBatches({
      medicine_name,
      total_days,
      quantity
    });

    res.status(200).json({ success: true, batches });
  } catch (err) {
    console.error("Get batches error:", err.message);
    res.status(400).json({ success: false, message: err.message });
  }
};
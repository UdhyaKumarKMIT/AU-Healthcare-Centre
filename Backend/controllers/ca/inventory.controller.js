
/*export {
  addMedicineBatch,
  deleteMedicineBatch,
  clearMedicineBatch,
  addMedicine,
  getExpiredMedicineBatches,
  getOutOfStock,
  getBatches
} from "../../services/ca/inventory.raw.service";*/

import * as XLSX from "xlsx";
import * as InventoryService from "../../services/ca/inventory.service.js";

const normalizeKey = (key) =>
  String(key || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "");

const normalizeRow = (row) => {
  const out = {};
  for (const [k, v] of Object.entries(row || {})) {
    out[normalizeKey(k)] = v;
  }

  return {
    name: out.name ?? out.medicine_name ?? out.medicine,
    type: out.type ?? out.medicine_type,
    batch_id: out.batch_id ?? out.batch_no ?? out.batch,
    expiry_date: out.expiry_date ?? out.expiry,
    in_stock: out.in_stock ?? out.quantity ?? out.stock,
  };
};

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

export const bulkAddMedicinesFromExcel = async (req, res) => {
  try {
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ success: false, message: "Excel file is required" });
    }

    const workbook = XLSX.read(req.file.buffer, {
      type: "buffer",
      cellDates: true,
    });

    const sheetName = workbook.SheetNames?.[0];
    if (!sheetName) {
      return res.status(400).json({ success: false, message: "Excel file has no sheets" });
    }

    const sheet = workbook.Sheets[sheetName];
    const rawRows = XLSX.utils.sheet_to_json(sheet, { defval: "" });
    if (!rawRows.length) {
      return res.status(400).json({ success: false, message: "Excel file is empty" });
    }

    const rows = rawRows.map(normalizeRow);
    const result = await InventoryService.bulkAddMedicines(rows);

    res.status(201).json({ success: true, data: result });
  } catch (err) {
    console.error("Bulk add medicines error:", err.message);
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
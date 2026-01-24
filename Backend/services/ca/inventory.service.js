// services/ca/inventory.service.js
import pool from "../../config/db.js";
import { randomUUID } from "crypto";

export const addMedicineBatch = async (batchData) => {
  const { batch_id, medicine_name, expiry_date, in_stock } = batchData;

  const [result] = await pool.query(
    `
    INSERT INTO medicine_main_stock (
        main_stock_id,
        batch_no,
        medicine_id,
        expiry,
        quantity,
        mfd
    )
    SELECT
        UUID(),
        ?,
        m.medicine_id,
        ?,
        ?,
        NOW()
    FROM medicine m
    WHERE m.name = ?;
    `,
    [batch_id, expiry_date, in_stock, medicine_name]
  );

  if (result.affectedRows === 0) {
    throw new Error("Medicine not found");
  }

  return { message: "Medicine batch added successfully" };
}; 

export const deleteMedicineBatch = async (batch_id) => {
  if (!batch_id) {
    throw new Error("Invalid or missing batch ID");
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // 1️⃣ Log the batch before deleting
    const [insertResult] = await connection.query(
      `
      INSERT INTO main_medicine_log (
        medicine_id,
        batch_no, 
        main_stock_id,
        expiry,
        quantity
      )
      SELECT
        medicine_id,
        batch_no,
        main_stock_id,
        expiry,
        quantity
      FROM medicine_main_stock
      WHERE batch_no = ?;
      `,
      [batch_id]
    );

    if (insertResult.affectedRows === 0) {
      await connection.rollback();
      throw new Error("Batch not found");
    }

    // 2️⃣ Delete from main stock
    await connection.query(
      `
      DELETE FROM medicine_main_stock
      WHERE batch_no = ?;
      `,
      [batch_id]
    );

    await connection.commit();

    return { message: "Medicine batch deleted and logged successfully" };
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
};

export const clearMedicineBatch = async (batch_id) => {
  if (!batch_id) {
    throw new Error("Invalid or missing batch ID");
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // 1️⃣ Log the batch before clearing
    const [insertResult] = await connection.query(
      `
      INSERT INTO main_medicine_log (
        batch_no,
        medicine_id,
        main_stock_id,
        expiry,
        quantity
      )
      SELECT
        batch_no,
        medicine_id,
        main_stock_id,
        expiry,
        quantity
      FROM medicine_main_stock
      WHERE batch_no = ?;
      `,
      [batch_id]
    );

    if (insertResult.affectedRows === 0) {
      await connection.rollback();
      throw new Error("Batch not found");
    }

    // 2️⃣ Delete the batch from main stock
    await connection.query(
      `
      DELETE FROM medicine_main_stock
      WHERE batch_no = ?;
      `,
      [batch_id]
    );

    await connection.commit();

    return { message: "Medicine batch cleared and logged successfully" };
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
};

export const addMedicine = async (medicineData) => {
  const { name, type, batch_id, expiry_date, in_stock } = medicineData;

  if (!name || !type || !batch_id || !expiry_date || in_stock == null) {
    throw new Error("Missing required fields");
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const medicine_id = randomUUID();

    // 1️⃣ Insert new medicine
    const [medicineResult] = await connection.query(
      `INSERT INTO medicine (medicine_id, name, type)
       VALUES (?, ?, ?)`,
      [medicine_id, name, type]
    );

    if (medicineResult.affectedRows !== 1) {
      throw new Error("Medicine already exist!");
    }

    // 2️⃣ Insert first batch
    await connection.query(
      `INSERT INTO medicine_main_stock
       (main_stock_id, batch_no, medicine_id, expiry, quantity, status, mfd)
       VALUES (UUID(), ?, ?, ?, ?, 'ACTIVE', NOW())`,
      [batch_id, medicine_id, expiry_date, in_stock]
    );

    await connection.commit();

    return {
      message: "Medicine and stock added successfully",
      medicine_id
    };
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
};

export const getExpiredMedicineBatches = async () => {
  const [rows] = await pool.query(
    `
    SELECT
      mb.batch_no AS batch_id,
      m.name AS medicine_name,
      DATE(mb.expiry) AS expiry_date,
      mb.quantity AS in_stock
    FROM medicine_main_stock mb
    INNER JOIN medicine m
      ON mb.medicine_id = m.medicine_id
    WHERE mb.status = 'EXPIRED'
    ORDER BY mb.expiry ASC;
    `
  );

  // Map DB rows to consistent API format
  return rows.map(row => ({
    batch_id: row.batch_id,
    medicine_name: row.medicine_name,
    expiry_date: row.expiry_date,
    in_stock: row.in_stock
  }));
};

export const getOutOfStock = async () => {
  const [rows] = await pool.query(`
    SELECT
      m.medicine_id,
      m.name AS medicine_name,
      m.type AS type
    FROM medicine m
    WHERE NOT EXISTS (
      SELECT 1
      FROM medicine_main_stock ms
      WHERE ms.medicine_id = m.medicine_id
        AND ms.status = 'ACTIVE'
        AND (ms.expiry IS NULL OR ms.expiry > NOW())
    )
    ORDER BY m.name;
  `);

  return rows;
};

export const getBatches = async ({ medicine_name, total_days, quantity }) => {
  if (!medicine_name || !total_days || quantity == null) {
    throw new Error("Missing parameters");
  }

  const conn = await pool.getConnection();

  try {
    // 1️⃣ Get medicine_id
    const [medicineRows] = await conn.query(
      `SELECT medicine_id FROM medicine WHERE name = ?`,
      [medicine_name]
    );

    if (medicineRows.length === 0) {
      throw new Error("Medicine not found");
    }

    const medicine_id = medicineRows[0].medicine_id;

    // 2️⃣ Fetch batches sorted by expiry: near, mid, long
    const fetchBatchQuery = (minMonths = 0, maxMonths = null) => {
      let condition = `expiry > DATE_ADD(CURDATE(), INTERVAL ${minMonths} MONTH)`;
      if (maxMonths !== null) {
        condition += ` AND expiry <= DATE_ADD(CURDATE(), INTERVAL ${maxMonths} MONTH)`;
      }
      return conn.query(
        `
        SELECT batch_no AS batch_id, quantity AS in_stock, expiry AS expiry_date
        FROM pharmacy_stock
        WHERE medicine_id = ?
          AND quantity > 0
          AND status = 'ACTIVE'
          ${minMonths > 0 || maxMonths !== null ? `AND ${condition}` : ""}
        ORDER BY expiry ASC
        `,
        [medicine_id]
      );
    };

    const [[nearExpiry], [midExpiry], [longExpiry]] = await Promise.all([
      fetchBatchQuery(0, 1),
      fetchBatchQuery(1, 3),
      fetchBatchQuery(3, null)
    ]);

    const batches = [...nearExpiry, ...midExpiry, ...longExpiry];

    // 3️⃣ Allocate requested quantity across batches
    let remainingQty = Number(quantity);
    const selectedBatches = [];

    for (const batch of batches) {
      if (remainingQty <= 0) break;

      const usedQty = Math.min(batch.in_stock, remainingQty);
      selectedBatches.push({
        batch_id: batch.batch_id,
        available: batch.in_stock,
        used: usedQty,
        expiry_date: batch.expiry_date
      });

      remainingQty -= usedQty;
    }

    if (remainingQty > 0) {
      throw new Error("Insufficient stock to fulfill required quantity");
    }

    return selectedBatches;
  } finally {
    conn.release();
  }
};
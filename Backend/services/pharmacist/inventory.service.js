import sequelize from "../../config/sequelize.js";
import { QueryTypes } from "sequelize";

/* ============================
   Fetch all medicine batches
============================ */
export const getMedicineDetailsService = async () => {
  const rows = await sequelize.query(
    `
    SELECT 
      m.medicine_id,
      m.name AS medicine_name,
      m.type AS medicine_type,
      mb.batch_no AS batch_id,
      mb.expiry AS expiry_date,
      mb.quantity AS in_stock
    FROM medicine m
    LEFT JOIN pharmacy_stock mb
      ON m.medicine_id = mb.medicine_id
      AND mb.status = 'ACTIVE'
      AND (mb.expiry IS NULL OR mb.expiry > NOW())
    ORDER BY m.name, mb.expiry;
    `,
    { type: QueryTypes.SELECT }
  );

  const medicines = {};

  rows.forEach(row => {
    if (!medicines[row.medicine_id]) {
      medicines[row.medicine_id] = {
        medicine_id: row.medicine_id,
        medicine_name: row.medicine_name,
        type: row.medicine_type,
        total_stock: 0,
        batches: []
      };
    }

    if (row.batch_id) {
      medicines[row.medicine_id].batches.push({
        batch_id: row.batch_id,
        expiry_date: row.expiry_date,
        in_stock: row.in_stock
      });

      medicines[row.medicine_id].total_stock += Number(row.in_stock) || 0;
    }
  });

  return Object.values(medicines);
};

/* ============================
   Add new medicine batch
============================ */
export const addMedicineBatchService = async (body) => {
  const { pharmacist_id, batch_id, medicine_name, expiry_date, in_stock } = body;

  const [result] = await sequelize.query(
    `
    INSERT INTO pharmacy_stock (
      batch_no,
      medicine_id,
      expiry,
      quantity,
      pharmacist_id
    )
    SELECT ?, m.medicine_id, ?, ?, ?
    FROM medicine m
    WHERE m.name = ?;
    `,
    {
      replacements: [
        batch_id,
        expiry_date,
        in_stock,
        pharmacist_id,
        medicine_name
      ]
    }
  );

  if (result.affectedRows === 0) {
    throw new Error("Medicine not found");
  }

  return { message: "Medicine batch added successfully" };
};

/* ============================
   Expired medicine batches
============================ */
export const getExpiredMedicineBatchesService = async () => {
  const rows = await sequelize.query(
    `
    SELECT
      mb.batch_no AS batch_id,
      m.name AS medicine_name,
      DATE(mb.expiry) AS expiry_date,
      mb.quantity AS in_stock
    FROM pharmacy_stock mb
    INNER JOIN medicine m ON mb.medicine_id = m.medicine_id
    WHERE mb.status = 'EXPIRED'
    ORDER BY mb.expiry ASC;
    `,
    { type: QueryTypes.SELECT }
  );

  return rows.map(row => ({
    batch_id: row.batch_id,
    medicine_name: row.medicine_name,
    expiry_date: row.expiry_date,
    in_stock: row.in_stock
  }));
};

/* ============================
   Clear expired batch
============================ */
export const clearMedicineBatchService = async (
  batch_id,
  secret_code
) => {
  const transaction = await sequelize.transaction();

  try {
    const staffRows = await sequelize.query(
      `
      SELECT code
      FROM staff_details
      WHERE code = ?
        AND role IN ('PHARMACIST', 'NURSE_RECEPTIONIST')
        AND status = 'ACTIVE'
      `,
      {
        replacements: [secret_code],
        type: QueryTypes.SELECT,
        transaction
      }
    );

    if (staffRows.length === 0) {
      throw new Error("Invalid secret code");
    }

    const cleared_by_code = staffRows[0].code;

    const [insertResult] = await sequelize.query(
      `
      INSERT INTO pharmacy_expired_medicine_log (
        batch_no,
        medicine_id,
        sub_stock_id,
        expiry,
        quantity,
        cleared_by_code
      )
      SELECT
        batch_no,
        medicine_id,
        sub_stock_id,
        expiry,
        quantity,
        ?
      FROM pharmacy_stock
      WHERE batch_no = ?;
      `,
      {
        replacements: [cleared_by_code, batch_id],
        transaction
      }
    );

    if (insertResult.affectedRows === 0) {
      throw new Error("Batch not found");
    }

    await sequelize.query(
      `DELETE FROM pharmacy_stock WHERE batch_no = ?`,
      {
        replacements: [batch_id],
        transaction
      }
    );

    await transaction.commit();
    return { message: "Medicine batch cleared and logged successfully" };
  } catch (err) {
    await transaction.rollback();
    throw err;
  }
};

/* ============================
   Fetch batches for dispensing
============================ */
export const fetchBatchesService = async (medicine_name, quantity) => {
  const transaction = await sequelize.transaction();

  try {
    // 🔹 Get medicine_id
    const medicineRows = await sequelize.query(
      `SELECT medicine_id FROM medicine WHERE name = ?`,
      {
        replacements: [medicine_name],
        type: QueryTypes.SELECT,
        transaction
      }
    );

    if (medicineRows.length === 0) {
      throw new Error("Medicine not found");
    }

    const medicine_id = medicineRows[0].medicine_id;

    // 🔹 Near expiry (≤ 1 month)
    const nearExpiry = await sequelize.query(
      `
      SELECT batch_no AS batch_id,
             quantity AS in_stock,
             expiry AS expiry_date
      FROM pharmacy_stock
      WHERE medicine_id = ?
        AND quantity > 0
        AND status = 'ACTIVE'
        AND expiry <= DATE_ADD(CURDATE(), INTERVAL 1 MONTH)
      ORDER BY expiry ASC
      `,
      {
        replacements: [medicine_id],
        type: QueryTypes.SELECT,
        transaction
      }
    );

    // 🔹 Mid expiry (1–3 months)
    const midExpiry = await sequelize.query(
      `
      SELECT batch_no AS batch_id,
             quantity AS in_stock,
             expiry AS expiry_date
      FROM pharmacy_stock
      WHERE medicine_id = ?
        AND quantity > 0
        AND status = 'ACTIVE'
        AND expiry > DATE_ADD(CURDATE(), INTERVAL 1 MONTH)
        AND expiry < DATE_ADD(CURDATE(), INTERVAL 3 MONTH)
      ORDER BY expiry ASC
      `,
      {
        replacements: [medicine_id],
        type: QueryTypes.SELECT,
        transaction
      }
    );

    // 🔹 Long expiry (≥ 3 months)
    const longExpiry = await sequelize.query(
      `
      SELECT batch_no AS batch_id,
             quantity AS in_stock,
             expiry AS expiry_date
      FROM pharmacy_stock
      WHERE medicine_id = ?
        AND quantity > 0
        AND status = 'ACTIVE'
        AND expiry >= DATE_ADD(CURDATE(), INTERVAL 3 MONTH)
      ORDER BY expiry ASC
      `,
      {
        replacements: [medicine_id],
        type: QueryTypes.SELECT,
        transaction
      }
    );

    // Combine batches
    const batches = [...nearExpiry, ...midExpiry, ...longExpiry];

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

    await transaction.commit();
    return selectedBatches;

  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

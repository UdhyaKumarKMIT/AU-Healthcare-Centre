// services/ca/inventory.service.js
import sequelize from "../../config/sequelize.js";
import { QueryTypes } from "sequelize";
import { randomUUID } from "crypto";

/* ============================
   Add medicine batch
============================ */
export const addMedicineBatch = async (batchData) => {
  const { batch_id, medicine_name, expiry_date, in_stock } = batchData;

  const [result] = await sequelize.query(
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
    {
      replacements: [batch_id, expiry_date, in_stock, medicine_name]
    }
  );

  if (result.affectedRows === 0) {
    throw new Error("Medicine not found");
  }

  return { message: "Medicine batch added successfully" };
};

/* ============================
   Delete medicine batch
============================ */
export const deleteMedicineBatch = async (batch_id) => {
  if (!batch_id) throw new Error("Invalid or missing batch ID");

  return await sequelize.transaction(async (transaction) => {
    const [insertResult] = await sequelize.query(
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
      {
        replacements: [batch_id],
        transaction
      }
    );

    if (insertResult.affectedRows === 0) {
      throw new Error("Batch not found");
    }

    await sequelize.query(
      `
      DELETE FROM medicine_main_stock
      WHERE batch_no = ?;
      `,
      {
        replacements: [batch_id],
        transaction
      }
    );

    return { message: "Medicine batch deleted and logged successfully" };
  });
};

/* ============================
   Clear medicine batch
============================ */
export const clearMedicineBatch = async (batch_id) => {
  if (!batch_id) throw new Error("Invalid or missing batch ID");

  return await sequelize.transaction(async (transaction) => {
    const [insertResult] = await sequelize.query(
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
      {
        replacements: [batch_id],
        transaction
      }
    );

    if (insertResult.affectedRows === 0) {
      throw new Error("Batch not found");
    }

    await sequelize.query(
      `
      DELETE FROM medicine_main_stock
      WHERE batch_no = ?;
      `,
      {
        replacements: [batch_id],
        transaction
      }
    );

    return { message: "Medicine batch cleared and logged successfully" };
  });
};

/* ============================
   Add medicine + first batch
============================ */
export const addMedicine = async (medicineData) => {
  const { name, type, batch_id, expiry_date, in_stock } = medicineData;

  if (!name || !type || !batch_id || !expiry_date || in_stock == null) {
    throw new Error("Missing required fields");
  }

  return await sequelize.transaction(async (transaction) => {
    const medicine_id = randomUUID(); 
    // Insert new medicine with custom error handling
    try {
      await sequelize.query(
        `INSERT INTO medicine (medicine_id, name, type) VALUES (?, ?, ?);`,
        {
          replacements: [medicine_id, name, type],
          transaction
        }
      );
    } catch (err) {
      // If database throws a duplicate key error
      if (err.original && (err.original.code === "ER_DUP_ENTRY" || err.original.errno === 1062)) {
        throw new Error("Medicine already exist!");
      }
      throw err; // re-throw any other errors
    }

    await sequelize.query(
      `
      INSERT INTO medicine_main_stock
      (main_stock_id, batch_no, medicine_id, expiry, quantity, status, mfd)
      VALUES (UUID(), ?, ?, ?, ?, 'ACTIVE', NOW());
      `,
      {
        replacements: [batch_id, medicine_id, expiry_date, in_stock],
        transaction
      }
    );

    return {
      message: "Medicine and stock added successfully",
      medicine_id
    };
  });
};

/* ============================
   Expired medicine batches
============================ */
export const getExpiredMedicineBatches = async () => {
  const rows = await sequelize.query(
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
   Get batches (allocation logic)
============================ */
export const getBatches = async ({ medicine_name, total_days, quantity }) => {
  if (!medicine_name || !total_days || quantity == null) {
    throw new Error("Missing parameters");
  }

  return await sequelize.transaction(async (transaction) => {
    const medicineRows = await sequelize.query(
      `SELECT medicine_id FROM medicine WHERE name = ?`,
      {
        replacements: [medicine_name],
        type: QueryTypes.SELECT,
        transaction
      }
    );

    if (!medicineRows.length) {
      throw new Error("Medicine not found");
    }

    const medicine_id = medicineRows[0].medicine_id;

    const fetchBatchQuery = async (minMonths = 0, maxMonths = null) => {
      let condition = `expiry > DATE_ADD(CURDATE(), INTERVAL ${minMonths} MONTH)`;
      if (maxMonths !== null) {
        condition += ` AND expiry <= DATE_ADD(CURDATE(), INTERVAL ${maxMonths} MONTH)`;
      }

      return await sequelize.query(
        `
        SELECT
          batch_no AS batch_id,
          quantity AS in_stock,
          expiry AS expiry_date
        FROM pharmacy_stock
        WHERE medicine_id = ?
          AND quantity > 0
          AND status = 'ACTIVE'
          ${minMonths > 0 || maxMonths !== null ? `AND ${condition}` : ""}
        ORDER BY expiry ASC;
        `,
        {
          replacements: [medicine_id],
          type: QueryTypes.SELECT,
          transaction
        }
      );
    };

    const [nearExpiry, midExpiry, longExpiry] = await Promise.all([
      fetchBatchQuery(0, 1),
      fetchBatchQuery(1, 3),
      fetchBatchQuery(3, null)
    ]);

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

    return selectedBatches;
  });
};

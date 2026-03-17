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
    WHERE LOWER(m.name) = LOWER(?);
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

  const normalizedName = String(name ?? "").trim();
  const normalizedType = normalizeMedicineType(type);
  const normalizedBatchId = String(batch_id ?? "").trim();
  const normalizedExpiry = normalizeDateOnly(expiry_date);
  const normalizedQty = Number(in_stock);

  if (
    !normalizedName ||
    !normalizedType ||
    !normalizedBatchId ||
    !normalizedExpiry ||
    !Number.isFinite(normalizedQty) ||
    !Number.isInteger(normalizedQty) ||
    normalizedQty <= 0
  ) {
    throw new Error("Missing required fields");
  }

  return await sequelize.transaction(async (transaction) => {
    let existing = await findExistingMedicineByName(normalizedName, transaction);
    let medicine_id = existing?.medicine_id || randomUUID();

    // If medicine already exists (case-insensitive), do NOT create a new record.
    if (!existing) {
      try {
        await sequelize.query(
          `INSERT INTO medicine (medicine_id, name, type) VALUES (?, ?, ?);`,
          {
            replacements: [medicine_id, normalizedName, normalizedType],
            transaction
          }
        );
      } catch (err) {
        // If DB enforces uniqueness on name (possibly case-insensitive), reuse existing.
        if (err?.original && (err.original.code === "ER_DUP_ENTRY" || err.original.errno === 1062)) {
          existing = await findExistingMedicineByName(normalizedName, transaction);
          if (existing?.medicine_id) {
            medicine_id = existing.medicine_id;
          } else {
            throw err;
          }
        } else {
          throw err;
        }
      }
    }

    await upsertMainStockBatch(
      {
        batch_id: normalizedBatchId,
        medicine_id,
        expiry_date: normalizedExpiry,
        quantity: normalizedQty,
      },
      transaction
    );

    return {
      message: existing ? "Medicine stock updated successfully" : "Medicine and stock added successfully",
      medicine_id,
      created_new_medicine: !existing,
    };
  });
};

const MEDICINE_TYPE_MAP = {
  tablet: "TABLET",
  syrup: "SYRUP",
  ointment: "OINTMENT",
  injection: "INJECTION",
  drops: "DROPS",
  external: "EXTERNAL",
};

const normalizeMedicineType = (type) => {
  if (!type) return null;
  const t = String(type).trim();
  if (!t) return null;

  const normalized = t.toLowerCase();
  if (MEDICINE_TYPE_MAP[normalized]) return MEDICINE_TYPE_MAP[normalized];

  const upper = t.toUpperCase();
  if (Object.values(MEDICINE_TYPE_MAP).includes(upper)) return upper;

  return null;
};

const normalizeDateOnly = (value) => {
  if (!value) return null;
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return null;
    return value.toISOString().slice(0, 10);
  }

  const str = String(value).trim();
  if (!str) return null;

  // Accept YYYY-MM-DD directly
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;

  const d = new Date(str);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 10);
};

const findExistingMedicineByName = async (name, transaction) => {
  const rows = await sequelize.query(
    `SELECT medicine_id, name, type FROM medicine WHERE LOWER(name) = LOWER(?) LIMIT 1;`,
    {
      replacements: [name],
      type: QueryTypes.SELECT,
      transaction
    }
  );

  return rows?.[0] || null;
};

const upsertMainStockBatch = async ({ batch_id, medicine_id, expiry_date, quantity }, transaction) => {
  const existingRows = await sequelize.query(
    `SELECT medicine_id FROM medicine_main_stock WHERE batch_no = ? LIMIT 1;`,
    {
      replacements: [batch_id],
      type: QueryTypes.SELECT,
      transaction
    }
  );

  const existing = existingRows?.[0] || null;

  if (existing) {
    if (String(existing.medicine_id) !== String(medicine_id)) {
      throw new Error("Batch ID already exists for a different medicine");
    }

    await sequelize.query(
      `UPDATE medicine_main_stock SET expiry = ?, quantity = quantity + ? WHERE batch_no = ?;`,
      {
        replacements: [expiry_date, quantity, batch_id],
        transaction
      }
    );

    return { action: "updated" };
  }

  await sequelize.query(
    `
    INSERT INTO medicine_main_stock
    (main_stock_id, batch_no, medicine_id, expiry, quantity, mfd)
    VALUES (UUID(), ?, ?, ?, ?, NOW());
    `,
    {
      replacements: [batch_id, medicine_id, expiry_date, quantity],
      transaction
    }
  );

  return { action: "inserted" };
};

/* ============================
   Bulk add medicines (Excel upload)
   - Inserts into `medicine` + first batch into `medicine_main_stock`
   - Continues on row-level errors and reports failures
============================ */
export const bulkAddMedicines = async (rows) => {
  if (!Array.isArray(rows) || rows.length === 0) {
    throw new Error("No rows provided");
  }

  return await sequelize.transaction(async (transaction) => {
    const results = {
      inserted: 0,
      failed: 0,
      errors: []
    };

    for (let idx = 0; idx < rows.length; idx++) {
      const row = rows[idx] || {};
      const rowNumber = idx + 2; // assumes header row in Excel

      const name = String(row.name ?? "").trim();
      const type = normalizeMedicineType(row.type);
      const batch_id = String(row.batch_id ?? "").trim();
      const expiry_date = normalizeDateOnly(row.expiry_date);
      const in_stock = Number(row.in_stock);

      if (
        !name ||
        !type ||
        !batch_id ||
        !expiry_date ||
        !Number.isFinite(in_stock) ||
        !Number.isInteger(in_stock) ||
        in_stock <= 0
      ) {
        results.failed++;
        results.errors.push({
          row: rowNumber,
          message: "Missing/invalid fields. Required: name, type, batch_id, expiry_date, in_stock"
        });
        continue;
      }

      let createdNewMedicine = false;
      let medicine_id = null;

      try {
        let existingMedicine = await findExistingMedicineByName(name, transaction);
        medicine_id = existingMedicine?.medicine_id || randomUUID();

        if (!existingMedicine) {
          try {
            await sequelize.query(
              `INSERT INTO medicine (medicine_id, name, type) VALUES (?, ?, ?);`,
              {
                replacements: [medicine_id, name, type],
                transaction
              }
            );
            createdNewMedicine = true;
          } catch (err) {
            if (err?.original && (err.original.code === "ER_DUP_ENTRY" || err.original.errno === 1062)) {
              existingMedicine = await findExistingMedicineByName(name, transaction);
              if (existingMedicine?.medicine_id) {
                medicine_id = existingMedicine.medicine_id;
              } else {
                throw err;
              }
            } else {
              throw err;
            }
          }
        }

        await upsertMainStockBatch(
          {
            batch_id,
            medicine_id,
            expiry_date,
            quantity: in_stock,
          },
          transaction
        );

        results.inserted++;
      } catch (err) {
        // If stock failed after creating a new medicine in this row, remove the orphan.
        if (createdNewMedicine && medicine_id) {
          try {
            await sequelize.query(`DELETE FROM medicine WHERE medicine_id = ?;`, {
              replacements: [medicine_id],
              transaction
            });
          } catch {
            // ignore cleanup failures
          }
        }

        results.failed++;
        const msg = err?.message || "Failed to insert/update stock";
        results.errors.push({ row: rowNumber, message: msg });
      }
    }

    return results;
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
    WHERE mb.expiry IS NOT NULL AND mb.expiry < NOW()
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
   Get out of stock medicines
============================ */
export const getOutOfStock = async () => {
  const rows = await sequelize.query(
    `
    SELECT
      m.medicine_id,
      m.name AS medicine_name,
      m.type,
      COALESCE(SUM(ms.quantity), 0) AS total_stock
    FROM medicine m
    LEFT JOIN medicine_main_stock ms
      ON m.medicine_id = ms.medicine_id
      AND (ms.expiry IS NULL OR ms.expiry > NOW())
    GROUP BY m.medicine_id, m.name, m.type
    HAVING total_stock = 0
    ORDER BY m.name ASC;
    `,
    { type: QueryTypes.SELECT }
  );

  return rows.map(row => ({
    medicine_id: row.medicine_id,
    medicine_name: row.medicine_name,
    type: row.type,
    total_stock: 0
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
          AND (expiry IS NULL OR expiry > NOW())
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

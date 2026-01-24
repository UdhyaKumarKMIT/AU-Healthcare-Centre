import pool from "../../config/db.js";

const SUBSTOCK_TABLE_MAP = {
  1: "dressing_stock",
  2: "labtech_stock",
  3: "nurse_stock",
  4: "pharmacy_stock",
};

const TABLE_ATTRIBUTE = {
  1: "dressing_substock",
  2: "labtech_substock",
  3: "nurse_substock",
  4: "pharmacy_substock",
};

export const issueMedicineService = async (medicine_id, batches) => {
  if (!medicine_id || !Array.isArray(batches) || batches.length === 0) {
    throw new Error("Missing required fields");
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    for (const batch of batches) {
      const { batch_id, quantity, substockCode } = batch;

      const substockTable = SUBSTOCK_TABLE_MAP[substockCode];
      const tableAttribute = TABLE_ATTRIBUTE[substockCode];

      if (!substockTable) {
        throw new Error(`Invalid substock code: ${substockCode}`);
      }

      // 1️⃣ Check & lock main stock
      const [mainRows] = await conn.query(
        `
        SELECT quantity, expiry
        FROM medicine_main_stock 
        WHERE medicine_id = ? AND batch_no = ?
        FOR UPDATE
        `,
        [medicine_id, batch_id]
      );

      if (!mainRows.length) {
        throw new Error(`Batch ${batch_id} not found in main stock`);
      }

      const mainStockQty = mainRows[0].quantity;
      const stockExpiry = mainRows[0].expiry;

      if (mainStockQty < quantity) {
        throw new Error(
          `Insufficient stock for batch ${batch_id}. Available: ${mainStockQty}`
        );
      }

      // 2️⃣ Upsert into substock
      const [subRows] = await conn.query(
        `
        SELECT quantity 
        FROM ${substockTable}
        WHERE medicine_id = ? AND batch_no = ?
        FOR UPDATE
        `,
        [medicine_id, batch_id]
      );

      if (subRows.length === 0) {
        // INSERT
        await conn.query(
          `
          INSERT INTO ${substockTable}
          (medicine_id, batch_no, quantity, expiry, sub_stock_id)
          VALUES (?, ?, ?, ?, UUID())
          `,
          [medicine_id, batch_id, quantity, stockExpiry]
        );
      } else {
        // UPDATE
        await conn.query(
          `
          UPDATE ${substockTable}
          SET quantity = quantity + ?
          WHERE medicine_id = ? AND batch_no = ?
          `,
          [quantity, medicine_id, batch_id]
        );
      }

      // 3️⃣ Decrease from main stock
      await conn.query(
        `
        UPDATE medicine_main_stock
        SET quantity = quantity - ?
        WHERE medicine_id = ? AND batch_no = ?
        `,
        [quantity, medicine_id, batch_id]
      );

      // 4️⃣ Delete main stock row if zero
      if (mainStockQty === quantity) {
        await conn.query(
          `
          DELETE FROM medicine_main_stock
          WHERE medicine_id = ? AND batch_no = ?
          `,
          [medicine_id, batch_id]
        );
      }

      // 5️⃣ Update stock_request to mark substock as issued
      await conn.query(
        `
        UPDATE stock_request
        SET ${tableAttribute} = 0
        WHERE medicine_id = ?
        `,
        [medicine_id]
      );
    }

    await conn.commit();
    return true; // success
  } catch (err) {
    await conn.rollback();
    console.error("Issue medicine service error:", err.message);
    throw err;
  } finally {
    conn.release();
  }
};

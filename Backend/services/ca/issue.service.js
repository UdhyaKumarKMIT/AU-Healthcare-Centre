import sequelize from "../../config/sequelize.js";
import { QueryTypes } from "sequelize";

const SUBSTOCK_TABLE_MAP = {
  1: "dressing_stock",
  2: "labtech_stock",
  3: "nurse_stock",
  4: "pharmacy_stock",
};

export const issueMedicineService = async (medicine_id, batches) => {
  if (!medicine_id || !Array.isArray(batches) || batches.length === 0) {
    throw new Error("Missing required fields");
  }

  return await sequelize.transaction(async (transaction) => {
    for (const batch of batches) {
      const { batch_id, quantity, substockCode } = batch;

      const substockTable = SUBSTOCK_TABLE_MAP[substockCode];

      if (!substockTable) {
        throw new Error(`Invalid substock code: ${substockCode}`);
      }

      /* ============================
         1️⃣ Check & lock main stock
      ============================ */
      const mainRows = await sequelize.query(
        `
        SELECT quantity, expiry
        FROM medicine_main_stock
        WHERE medicine_id = ? AND batch_no = ?
        FOR UPDATE
        `,
        {
          replacements: [medicine_id, batch_id],
          type: QueryTypes.SELECT,
          transaction
        }
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

      /* ============================
         2️⃣ Upsert into substock
      ============================ */
      const subRows = await sequelize.query(
        `
        SELECT quantity
        FROM ${substockTable}
        WHERE medicine_id = ? AND batch_no = ?
        FOR UPDATE
        `,
        {
          replacements: [medicine_id, batch_id],
          type: QueryTypes.SELECT,
          transaction
        }
      );

      if (subRows.length === 0) {
        // INSERT
        await sequelize.query(
          `
          INSERT INTO ${substockTable}
          (medicine_id, batch_no, quantity, expiry, sub_stock_id, verification)
          VALUES (?, ?, ?, ?, UUID(), 'waiting')
          `,
          {
            replacements: [medicine_id, batch_id, quantity, stockExpiry],
            transaction
          }
        );
      } else {
        // UPDATE
        await sequelize.query(
          `
          UPDATE ${substockTable}
          SET quantity = quantity + ?, verification = 'waiting'
          WHERE medicine_id = ? AND batch_no = ?
          `,
          {
            replacements: [quantity, medicine_id, batch_id],
            transaction
          }
        );
      }

      /* ============================
         3️⃣ Decrease main stock
      ============================ */
      await sequelize.query(
        `
        UPDATE medicine_main_stock
        SET quantity = quantity - ?
        WHERE medicine_id = ? AND batch_no = ?
        `,
        {
          replacements: [quantity, medicine_id, batch_id],
          transaction
        }
      );

      /* ============================
         4️⃣ Delete if zero
      ============================ */
      if (mainStockQty === quantity) {
        await sequelize.query(
          `
          DELETE FROM medicine_main_stock
          WHERE medicine_id = ? AND batch_no = ?
          `,
          {
            replacements: [medicine_id, batch_id],
            transaction
          }
        );
      }
    }

    return true; // success
  });
};

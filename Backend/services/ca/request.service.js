import sequelize from "../../config/sequelize.js";
import { QueryTypes } from "sequelize";

export const getRequestDetailsService = async (medicine_id) => {
  if (!medicine_id) throw new Error("medicine_id is required");

  try {
    const rows = await sequelize.query(
      `
      SELECT
        batch_no AS batch_id,
        quantity AS in_stock,
        expiry   AS expiry_date
      FROM medicine_main_stock
      WHERE medicine_id = ?
        AND quantity > 0
        AND status = 'ACTIVE'
      ORDER BY expiry ASC
      `,
      {
        replacements: [medicine_id],
        type: QueryTypes.SELECT
      }
    );

    return rows.map(batch => ({
      batch_id: batch.batch_id,
      in_stock: Number(batch.in_stock),
      expiry_date: batch.expiry_date
    }));
  } catch (err) {
    console.error("getRequestDetailsService error:", err);
    throw err;
  }
};

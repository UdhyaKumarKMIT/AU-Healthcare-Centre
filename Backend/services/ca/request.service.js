import pool from "../../config/db.js";

export const getRequestsService = async () => {
  try {
    const [rows] = await pool.query(`
      SELECT DISTINCT
          m.name AS medicine_name,
          m.medicine_id,
          IF(sr.dressing_substock = 1, 1, 0)  AS dressing_substock, 
          IF(sr.labtech_substock  = 1, 1, 0)  AS labtech_substock, 
          IF(sr.nurse_substock    = 1, 1, 0)  AS nurse_substock, 
          IF(sr.pharmacy_substock = 1, 1, 0)  AS pharmacy_substock 
      FROM stock_request sr
      JOIN medicine m
        ON m.medicine_id = sr.medicine_id
      WHERE
          sr.dressing_substock = 1
          OR sr.labtech_substock  = 1
          OR sr.nurse_substock    = 1
          OR sr.pharmacy_substock = 1;
    `);

    return rows; // array of pending requests
  } catch (err) {
    console.error("getRequestsService error:", err);
    throw err; // controller handles response
  }
};

export const getRequestDetailsService = async (medicine_id) => {
  if (!medicine_id) throw new Error("medicine_id is required");

  try {
    const [rows] = await pool.query(
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
      [medicine_id]
    );

    // Convert quantity to number
    return rows.map((batch) => ({
      batch_id: batch.batch_id,
      in_stock: Number(batch.in_stock),
      expiry_date: batch.expiry_date,
    }));
  } catch (err) {
    console.error("getRequestDetailsService error:", err);
    throw err; // controller handles HTTP response
  }
};
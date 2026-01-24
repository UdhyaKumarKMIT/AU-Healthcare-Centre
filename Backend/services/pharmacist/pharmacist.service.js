import pool from "../../config/db.js";

export const getPharmacistDetailsService = async (pharmacist_id) => {
  const [rows] = await pool.query(
    `SELECT staff_id as pharmacist_id, name, email, phone, code
     FROM staff_details
     WHERE staff_id = ? AND role = 'PHARMACIST'`,
    [pharmacist_id]
  );
  return rows[0] || null;
};

export const updatePharmacistDetailsService = async (pharmacist_id, fields) => {
  const setFields = [];
  const values = [];
  
  if (fields.name) { setFields.push("name = ?"); values.push(fields.name); }
  if (fields.email) { setFields.push("email = ?"); values.push(fields.email); }
  if (fields.phone) { setFields.push("phone = ?"); values.push(fields.phone); }

  values.push(pharmacist_id);

  const query = `UPDATE pharmacist SET ${setFields.join(", ")} WHERE pharmacist_id = ?`;
  const [result] = await pool.query(query, values);

  return result.affectedRows;
};

export const fetchDashboardCountsService = async () => {
  const [[prescriptionCount]] = await pool.query(`
    SELECT COUNT(*) AS total_prescriptions
    FROM prescription pp
    WHERE EXISTS (
        SELECT 1
        FROM prescription_items pi
        WHERE pi.prescription_id = pp.prescription_id
          AND pi.is_external = 0
          AND pp.status = 'ACTIVE'
    );
  `);

  const [[todayIssuedCount]] = await pool.query(`
    SELECT COUNT(*) AS today_issued
    FROM prescription_transaction
    WHERE DATE(issued_at) = CURDATE()
  `);

  const [[expiredStockCount]] = await pool.query(`
    SELECT COUNT(*) AS expired_stock
    FROM pharmacy_stock
    WHERE status = 'EXPIRED'
  `);

  return {
    total_prescriptions: prescriptionCount.total_prescriptions,
    today_issued_transactions: todayIssuedCount.today_issued,
    expired_stock_count: expiredStockCount.expired_stock
  };
};
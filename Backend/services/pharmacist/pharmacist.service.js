import sequelize from "../../config/sequelize.js";
import { QueryTypes } from "sequelize";

/* ============================
   Get pharmacist details
============================ */
export const getPharmacistDetailsService = async (pharmacist_id) => {
  const rows = await sequelize.query(
    `
    SELECT
      staff_id AS pharmacist_id,
      name,
      email,
      phone,
      code
    FROM staff_details
    WHERE staff_id = ?
      AND role = 'PHARMACIST'
    `,
    {
      replacements: [pharmacist_id],
      type: QueryTypes.SELECT
    }
  );

  return rows[0] || null;
};

/* ============================
   Update pharmacist details
============================ */
export const updatePharmacistDetailsService = async (
  pharmacist_id,
  fields
) => {
  const setFields = [];
  const values = [];

  if (fields.name) {
    setFields.push("name = ?");
    values.push(fields.name);
  }

  if (fields.email) {
    setFields.push("email = ?");
    values.push(fields.email);
  }

  if (fields.phone) {
    setFields.push("phone = ?");
    values.push(fields.phone);
  }

  values.push(pharmacist_id);

  const query = `
    UPDATE pharmacist
    SET ${setFields.join(", ")}
    WHERE pharmacist_id = ?
  `;

  const [result] = await sequelize.query(query, {
    replacements: values
  });

  return result.affectedRows;
};

/* ============================
   Fetch dashboard counts
============================ */
export const fetchDashboardCountsService = async () => {
  const prescriptionCount = await sequelize.query(
    `
    SELECT COUNT(*) AS total_prescriptions
    FROM prescription pp
    WHERE EXISTS (
      SELECT 1
      FROM prescription_items pi
      WHERE pi.prescription_id = pp.prescription_id
        AND pi.is_external = 0
        AND pp.status = 'ACTIVE'
    );
    `,
    { type: QueryTypes.SELECT }
  );

  const todayIssuedCount = await sequelize.query(
    `
    SELECT COUNT(*) AS today_issued
    FROM prescription_transaction
    WHERE DATE(issued_at) = CURDATE()
    `,
    { type: QueryTypes.SELECT }
  );

  const expiredStockCount = await sequelize.query(
    `
    SELECT COUNT(*) AS expired_stock
    FROM pharmacy_stock
    WHERE status = 'EXPIRED'
    `,
    { type: QueryTypes.SELECT }
  );

  const medicineIssuedCount = await sequelize.query(
    `
    SELECT COUNT(*) AS medicine_issued_count
    FROM pharmacy_stock
    WHERE verification = 'waiting'
    `,
    { type: QueryTypes.SELECT }
  );

  return {
    total_prescriptions: prescriptionCount[0].total_prescriptions,
    today_issued_transactions: todayIssuedCount[0].today_issued,
    expired_stock_count: expiredStockCount[0].expired_stock,
    medicine_issued_count: medicineIssuedCount[0].medicine_issued_count
  };
};


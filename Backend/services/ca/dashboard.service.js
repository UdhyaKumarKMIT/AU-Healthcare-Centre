import sequelize from "../../config/sequelize.js";
import { QueryTypes } from "sequelize";

/* ============================
   Dashboard counts
============================ */
export const getDashboardCounts = async () => {
  try { 
    // Expired stock (medicines with expiry date in past)
    const expiredStockRows = await sequelize.query(
      `
      SELECT COUNT(*) AS expired_stock_count
      FROM medicine_main_stock
      WHERE expiry IS NOT NULL AND expiry < NOW();
      `,
      { type: QueryTypes.SELECT }
    );

    // Out-of-stock
    const outOfStockRows = await sequelize.query(
      `
      SELECT COUNT(*) AS out_of_stock_count
      FROM medicine m
      WHERE NOT EXISTS (
        SELECT 1
        FROM medicine_main_stock ms
        WHERE ms.medicine_id = m.medicine_id
          AND (ms.expiry IS NULL OR ms.expiry > NOW())
      );
      `,
      { type: QueryTypes.SELECT }
    );

    // Low stock (<= 30 units)
    const lowStockRows = await sequelize.query(
      `
      SELECT COUNT(*) AS low_stock_count
      FROM medicine m
      JOIN (
        SELECT medicine_id, SUM(quantity) AS total_quantity
        FROM medicine_main_stock
        WHERE (expiry IS NULL OR expiry > NOW())
        GROUP BY medicine_id
      ) ms_total
        ON m.medicine_id = ms_total.medicine_id
      WHERE ms_total.total_quantity <= 30;
      `,
      { type: QueryTypes.SELECT }
    );

    return {
      expired_stock_count: Number(expiredStockRows[0].expired_stock_count),
      out_of_stock_count: Number(outOfStockRows[0].out_of_stock_count),
      low_stock_count: Number(lowStockRows[0].low_stock_count)
    };
  } catch (err) {
    console.error("Dashboard counts service error:", err);
    throw err;
  }
};

/* ============================
   Medicine total stock
============================ */
export const getMedicineTotalStock = async () => {
  try {
    const rows = await sequelize.query(
      `
      SELECT
        m.medicine_id,
        m.name AS medicine_name,
        COALESCE(SUM(ms.quantity), 0) AS total_stock
      FROM medicine m
      LEFT JOIN medicine_main_stock ms
        ON ms.medicine_id = m.medicine_id
        AND (ms.expiry IS NULL OR ms.expiry > NOW())
      GROUP BY
        m.medicine_id,
        m.name,
        m.type
      ORDER BY m.name;
      `,
      { type: QueryTypes.SELECT }
    );

    return rows.map(med => ({
      medicine_id: med.medicine_id,
      medicine_name: med.medicine_name,
      total_stock: Number(med.total_stock)
    }));
  } catch (err) {
    console.error("Medicine total stock service error:", err);
    throw err;
  }
};

/* ============================
   All stock details
============================ */
export const getAllStockDetails = async () => {
  try {
    // Helper to fetch substock
    const fetchSubstock = async (substockType) => {
      const query = `
        SELECT 
          m.medicine_id,
          m.name,
          COALESCE(SUM(ms.quantity), 0) AS total_quantity,
          COALESCE(
            JSON_ARRAYAGG(
              JSON_OBJECT(
                'batch_id', ms.batch_no,
                'quantity', ms.quantity,
                'expiry_date', ms.expiry
              )
            ),
            JSON_ARRAY()
          ) AS batches
        FROM medicine m
        LEFT JOIN ${substockType} ms 
          ON m.medicine_id = ms.medicine_id
          AND ms.batch_no IS NOT NULL
          AND (ms.expiry IS NULL OR ms.expiry > NOW())
        GROUP BY m.medicine_id, m.name
        ORDER BY m.name;
      `;

      return await sequelize.query(query, {
        type: QueryTypes.SELECT
      });
    };

    const pharmacy = await fetchSubstock("pharmacy_stock");
    const labtech = await fetchSubstock("labtech_stock");
    const nurse = await fetchSubstock("nurse_stock");
    const dressing = await fetchSubstock("dressing_stock");
    const mainStock = await fetchSubstock("medicine_main_stock");

    return { pharmacy, labtech, nurse, dressing, mainStock };
  } catch (err) {
    console.error("getAllStockDetails service error:", err);
    throw err;
  }
};

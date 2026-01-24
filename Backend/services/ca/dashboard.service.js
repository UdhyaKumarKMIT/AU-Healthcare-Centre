import pool from "../../config/db.js";

export const getDashboardCounts = async () => {
  try {
    // 1️⃣ Substock counts
    const [[substockCounts]] = await pool.query(`
      SELECT
        COALESCE(SUM(mms.dressing_substock), 0) AS dressing_substock_count,
        COALESCE(SUM(mms.labtech_substock), 0) AS labtech_substock_count,
        COALESCE(SUM(mms.nurse_substock), 0) AS nurse_substock_count,
        COALESCE(SUM(mms.pharmacy_substock), 0) AS pharmacy_substock_count
      FROM medicine m
      LEFT JOIN stock_request mms
        ON m.medicine_id = mms.medicine_id;
    `);

    // 2️⃣ Expired stock
    const [[expiredStockCount]] = await pool.query(`
      SELECT COUNT(*) AS expired_stock_count
      FROM medicine_main_stock
      WHERE status = 'EXPIRED';
    `);

    // 3️⃣ Out-of-stock
    const [[outofStockCount]] = await pool.query(`
      SELECT COUNT(*) AS out_of_stock_count
      FROM medicine m
      WHERE NOT EXISTS (
        SELECT 1
        FROM medicine_main_stock ms
        WHERE ms.medicine_id = m.medicine_id
          AND ms.status = 'ACTIVE'
      );
    `);

    // 4️⃣ Low stock (<=30 units)
    const [[lowStockCount]] = await pool.query(`
      SELECT COUNT(*) AS low_stock_count
      FROM medicine m
      JOIN (
          SELECT medicine_id, SUM(quantity) AS total_quantity
          FROM medicine_main_stock
          WHERE status = 'ACTIVE'
          GROUP BY medicine_id
      ) ms_total ON m.medicine_id = ms_total.medicine_id
      WHERE ms_total.total_quantity <= 30;
    `);

    // Convert all values to numbers to avoid string issues
    return {
      dressing_substock_count: Number(substockCounts.dressing_substock_count),
      labtech_substock_count: Number(substockCounts.labtech_substock_count),
      nurse_substock_count: Number(substockCounts.nurse_substock_count),
      pharmacy_substock_count: Number(substockCounts.pharmacy_substock_count),
      expired_stock_count: Number(expiredStockCount.expired_stock_count),
      out_of_stock_count: Number(outofStockCount.out_of_stock_count),
      low_stock_count: Number(lowStockCount.low_stock_count),
    };
  } catch (err) {
    console.error("Dashboard counts service error:", err);
    throw err; // Let controller handle response
  }
}; 

export const getMedicineTotalStock = async () => {
  try {
    const [rows] = await pool.query(`
      SELECT
        m.medicine_id,
        m.name AS medicine_name,
        COALESCE(SUM(ms.quantity), 0) AS total_stock
      FROM medicine m
      LEFT JOIN medicine_main_stock ms
        ON ms.medicine_id = m.medicine_id
        AND ms.status = 'ACTIVE'
        AND (ms.expiry IS NULL OR ms.expiry > NOW())
      GROUP BY
        m.medicine_id,
        m.name,
        m.type
      ORDER BY m.name;
    `);

    // Convert total_stock to Number
    return rows.map((med) => ({
      medicine_id: med.medicine_id,
      medicine_name: med.medicine_name,
      total_stock: Number(med.total_stock),
    }));
  } catch (err) {
    console.error("Medicine total stock service error:", err);
    throw err; // Let controller handle HTTP response
  }
};

export const getAllStockDetails = async () => {
  try {
    // Helper function to query a substock table
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
          AND ms.status = 'active'
          AND ms.batch_no IS NOT NULL
        GROUP BY m.medicine_id, m.name
        ORDER BY m.name;
      `;
      const [rows] = await pool.query(query);
      return rows;
    };

    const pharmacy = await fetchSubstock("pharmacy_stock");
    const labtech = await fetchSubstock("labtech_stock");
    const nurse = await fetchSubstock("nurse_stock");
    const dressing = await fetchSubstock("dressing_stock");
    const mainStock = await fetchSubstock("medicine_main_stock");

    return { pharmacy, labtech, nurse, dressing, mainStock };
  } catch (err) {
    console.error("getAllStockDetails service error:", err);
    throw err; // Controller handles the response
  }
};
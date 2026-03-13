import sequelize from "../../config/sequelize.js";
import { QueryTypes } from "sequelize";
import { v4 as uuidv4 } from "uuid";

export const insertMedicines = async (medicines) => {

  const transaction = await sequelize.transaction();

  try {

    /* ---------- Step 1: Create Map of Unique Medicines ---------- */

    const medicineMap = new Map();

    medicines.forEach((med) => {
      if (!medicineMap.has(med.name)) {
        medicineMap.set(med.name, med.type);
      }
    });

    const names = [...medicineMap.keys()];

    /* ---------- Step 2: Get Existing Medicines ---------- */

    const existing = await sequelize.query(
      `SELECT medicine_id, name FROM medicine WHERE name IN (:names)`,
      {
        replacements: { names },
        type: QueryTypes.SELECT,
        transaction
      }
    );

    const existingMap = {};

    existing.forEach((row) => {
      existingMap[row.name] = row.medicine_id;
    });

    /* ---------- Step 3: Prepare New Medicines ---------- */

    const newMedicines = [];

    for (const [name, type] of medicineMap.entries()) {

      if (!existingMap[name]) {

        const id = uuidv4();

        newMedicines.push({
          medicine_id: id,
          name,
          type
        });

        existingMap[name] = id;
      }
    }

    /* ---------- Step 4: Bulk Insert New Medicines ---------- */

    if (newMedicines.length) {

      const values = newMedicines
        .map(() => "(?, ?, ?)")
        .join(",");

      const replacements = [];

      newMedicines.forEach((med) => {
        replacements.push(med.medicine_id, med.name, med.type);
      });

      await sequelize.query(
        `INSERT INTO medicine (medicine_id, name, type)
        VALUES ${values}`,
        {
          replacements,
          transaction
        }
      );
    }

    /* ---------- Step 5: Prepare Stock Insert ---------- */

    const today = new Date();

    const stockValues = medicines.map((med) => {

      const expiryDate = new Date(med.expiry);

      const status = expiryDate < today ? "expired" : "active";

      return [
        uuidv4(),
        existingMap[med.name],
        med.batch_no,
        today,
        med.expiry,
        med.quantity,
        status
      ];
    });

    /* ---------- Step 6: Bulk Insert Stock ---------- */

    const placeholders = stockValues
      .map(() => "(?,?,?,?,?,?,?)")
      .join(",");

    const replacements = [];

    stockValues.forEach((row) => {
      replacements.push(...row);
    });

    await sequelize.query(
      `INSERT INTO medicine_main_stock
       (main_stock_id, medicine_id, batch_no, issued_at, expiry, quantity, status)
       VALUES ${placeholders}`,
      {
        replacements,
        transaction
      }
    );

    /* ---------- Commit Transaction ---------- */

    await transaction.commit();

  } catch (error) {

    await transaction.rollback();
    throw error;

  }
};
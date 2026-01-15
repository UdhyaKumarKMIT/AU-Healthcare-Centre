// Backend/db/seed.js
import {
  sequelize,
  Medicine,
  MedicineMainStock,
  PharmacyStock,
  NurseTaskMaster,
} from '../models/sequelize/index.js';

async function seed() {
  console.log('Starting seed...');

  try {
    await sequelize.authenticate();
    console.log('DB connection OK');

    // ---- 1) Seed Medicine ----
    const medicineData = [
      { name: 'Paracetamol 500mg', type: 'TABLET' },
      { name: 'Ibuprofen 400mg', type: 'TABLET' },
      { name: 'Cough Syrup', type: 'SYRUP' },
      { name: 'Skin Ointment', type: 'OINTMENT' },
      { name: 'Vitamin D Drops', type: 'DROPS' },
      { name: 'Insulin Injection', type: 'INJECTION' },
    ];

    const medicineByName = {};

    for (const med of medicineData) {
      const [instance] = await Medicine.findOrCreate({
        where: { name: med.name },
        defaults: med,
      });
      medicineByName[med.name] = instance;
    }

    console.log('Medicine seeded');

    // ---- 2) Seed Medicine Main Stock ----
    const mainStockData = [
      {
        medicineName: 'Paracetamol 500mg',
        batch_no: 'PCT-001',
        mfd: new Date('2025-01-01'),
        expiry: new Date('2027-01-01'),
        quantity: 1000,
      },
      {
        medicineName: 'Paracetamol 500mg',
        batch_no: 'PCT-002',
        mfd: new Date('2025-06-01'),
        expiry: new Date('2027-06-01'),
        quantity: 500,
      },
      {
        medicineName: 'Ibuprofen 400mg',
        batch_no: 'IBU-001',
        mfd: new Date('2025-02-01'),
        expiry: new Date('2027-02-01'),
        quantity: 800,
      },
      {
        medicineName: 'Cough Syrup',
        batch_no: 'COU-001',
        mfd: new Date('2025-03-01'),
        expiry: new Date('2026-03-01'),
        quantity: 300,
      },
      {
        medicineName: 'Skin Ointment',
        batch_no: 'OINT-001',
        mfd: new Date('2025-01-15'),
        expiry: new Date('2027-01-15'),
        quantity: 200,
      },
      {
        medicineName: 'Vitamin D Drops',
        batch_no: 'VITD-001',
        mfd: new Date('2025-04-01'),
        expiry: new Date('2027-04-01'),
        quantity: 150,
      },
      {
        medicineName: 'Insulin Injection',
        batch_no: 'INS-001',
        mfd: new Date('2025-05-01'),
        expiry: new Date('2026-05-01'),
        quantity: 400,
      },
    ];

    for (const stock of mainStockData) {
      const medicine = medicineByName[stock.medicineName];
      if (!medicine) {
        console.warn(`Skipping main stock; medicine not found: ${stock.medicineName}`);
        continue;
      }

      await MedicineMainStock.findOrCreate({
        where: {
          medicine_id: medicine.medicine_id,
          batch_no: stock.batch_no,
        },
        defaults: {
          medicine_id: medicine.medicine_id,
          batch_no: stock.batch_no,
          mfd: stock.mfd,
          expiry: stock.expiry,
          quantity: stock.quantity,
        },
      });
    }

    console.log('Medicine main stock seeded');

    // ---- 3) Seed Pharmacy Stock ----
    const pharmacyStockData = [
      {
        medicineName: 'Paracetamol 500mg',
        batch_no: 'PCT-001',
        expiry: new Date('2027-01-01'),
        quantity: 300,
      },
      {
        medicineName: 'Ibuprofen 400mg',
        batch_no: 'IBU-001',
        expiry: new Date('2027-02-01'),
        quantity: 200,
      },
      {
        medicineName: 'Cough Syrup',
        batch_no: 'COU-001',
        expiry: new Date('2026-03-01'),
        quantity: 120,
      },
      {
        medicineName: 'Skin Ointment',
        batch_no: 'OINT-001',
        expiry: new Date('2027-01-15'),
        quantity: 80,
      },
      {
        medicineName: 'Vitamin D Drops',
        batch_no: 'VITD-001',
        expiry: new Date('2027-04-01'),
        quantity: 60,
      },
      {
        medicineName: 'Insulin Injection',
        batch_no: 'INS-001',
        expiry: new Date('2026-05-01'),
        quantity: 150,
      },
    ];

    for (const stock of pharmacyStockData) {
      const medicine = medicineByName[stock.medicineName];
      if (!medicine) {
        console.warn(`Skipping pharmacy stock; medicine not found: ${stock.medicineName}`);
        continue;
      }

      await PharmacyStock.findOrCreate({
        where: {
          medicine_id: medicine.medicine_id,
          batch_no: stock.batch_no,
        },
        defaults: {
          medicine_id: medicine.medicine_id,
          batch_no: stock.batch_no,
          expiry: stock.expiry,
          quantity: stock.quantity,
        },
      });
    }

    console.log('Pharmacy stock seeded');

    // ---- 4) Seed Nurse Task Master ----
    const nurseTasks = [
      'Administer Medication',
      'Monitor Vital Signs',
      'Change Dressing',
      'Blood Sample Collection',
      'IV Line Management',
      'Patient Education',
    ];

    for (const taskName of nurseTasks) {
      await NurseTaskMaster.findOrCreate({
        where: { task_name: taskName },
        defaults: { task_name: taskName },
      });
    }

    console.log('Nurse task master seeded');

    console.log('Seeding completed successfully');
  } catch (err) {
    console.error('Error during seeding:', err);
  } finally {
    await sequelize.close();
    console.log('DB connection closed');
  }
}

seed();
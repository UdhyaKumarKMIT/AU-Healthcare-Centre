// Backend/routes/doctor.route.js - WITH PATIENT HISTORY & MEDICINE ROUTES

import express from 'express';
import authenticate from '../middlewares/auth.middleware.js';
import authorize from '../middlewares/role.middleware.js';
import * as c from '../controllers/doctor.controller.js';
import db from '../config/db.js';
import ROLES from '../constants/roles.js';

const router = express.Router();

// ==================== TODAY'S VISITS ROUTES ====================

// GET today's visits count for a doctor
router.get('/visits/today', authenticate, async (req, res) => {
  try {
    const { doctor_id, date } = req.query;
    
    if (!doctor_id || !date) {
      return res.status(400).json({
        success: false,
        message: 'doctor_id and date parameters are required'
      });
    }

    console.log(`📅 Fetching visits for doctor ${doctor_id} on ${date}`);

    // First, let's see all visits for this doctor to debug
    const [allVisits] = await db.execute(`
      SELECT visit_id, patient_id, doctor_id, status, DATE(visit_date) as visit_date_only, visit_date
      FROM visit
      WHERE doctor_id = ?
      ORDER BY visit_date DESC
      LIMIT 10
    `, [doctor_id]);
    
    console.log(`📋 All recent visits for doctor ${doctor_id}:`, allVisits);

    const [visits] = await db.execute(`
      SELECT COUNT(*) as count
      FROM visit
      WHERE doctor_id = ?
      AND DATE(visit_date) = ?
    `, [doctor_id, date]);

    const count = visits[0]?.count || 0;
    console.log(`✅ Found ${count} visits for ${date}`);

    res.json({
      success: true,
      count: count,
      date: date,
      doctor_id: doctor_id
    });

  } catch (error) {
    console.error('❌ Error fetching today\'s visits:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch today\'s visits count',
      error: error.message
    });
  }
});

// ==================== NURSE ROUTES ====================

// GET nurses - Get all available nurses
router.get('/nurses', authenticate, async (req, res) => {
  try {
    const [nurses] = await db.execute(`
      SELECT 
        n.nurse_id,
        n.name,
        n.register_number,
        n.qualification,
        n.phone,
        u.email
      FROM nurse n
      JOIN users u ON n.user_id = u.user_id
      WHERE u.role = 'NURSE'
      ORDER BY n.name ASC
    `);
    
    console.log(`✅ Found ${nurses.length} nurses`);
    
    res.json({
      success: true,
      nurses: nurses,
      count: nurses.length
    });
    
  } catch (error) {
    console.error('❌ Error fetching nurses:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch nurses',
      error: error.message
    });
  }
});

// GET single nurse details
router.get('/nurses/:nurseId', authenticate, async (req, res) => {
  try {
    const { nurseId } = req.params;
    
    const [nurses] = await db.execute(`
      SELECT 
        n.nurse_id,
        n.name,
        n.register_number,
        n.qualification,
        n.phone,
        n.created_at,
        u.email
      FROM nurse n
      JOIN users u ON n.user_id = u.user_id
      WHERE n.nurse_id = ? AND u.role = 'NURSE'
    `, [nurseId]);
    
    if (nurses.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Nurse not found'
      });
    }
    
    res.json({
      success: true,
      nurse: nurses[0]
    });
    
  } catch (error) {
    console.error('❌ Error fetching nurse:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch nurse',
      error: error.message
    });
  }
});

// ==================== MEDICINE ROUTES ====================

// GET medicines - Search medicines
router.get('/medicines', authenticate, async (req, res) => {
  try {
    const { search } = req.query;
    
    let query = 'SELECT medicine_id, name, type, created_at FROM medicine';
    let params = [];
    
    // If search query provided, filter by name
    if (search && search.trim().length > 0) {
      query += ' WHERE name LIKE ? ORDER BY name ASC LIMIT 20';
      params.push(`%${search.trim()}%`);
    } else {
      // Return all medicines if no search (or limit to recent ones)
      query += ' ORDER BY name ASC LIMIT 50';
    }
    
    const [medicines] = await db.execute(query, params);
    
    // Transform to match frontend format
    const formattedMedicines = medicines.map(med => ({
      id: med.medicine_id,
      name: med.name,
      type: med.type
    }));
    
    console.log(`✅ Found ${formattedMedicines.length} medicines`);
    
    res.json({
      success: true,
      data: formattedMedicines
    });
    
  } catch (error) {
    console.error('❌ Error fetching medicines:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch medicines',
      error: error.message
    });
  }
});

// GET single medicine details
router.get('/medicines/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    
    const [medicines] = await db.execute(
      'SELECT medicine_id, name, type, created_at FROM medicine WHERE medicine_id = ?',
      [id]
    );
    
    if (medicines.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Medicine not found'
      });
    }
    
    const medicine = medicines[0];
    
    res.json({
      success: true,
      data: {
        id: medicine.medicine_id,
        name: medicine.name,
        type: medicine.type,
        createdAt: medicine.created_at
      }
    });
    
  } catch (error) {
    console.error('❌ Error fetching medicine:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch medicine',
      error: error.message
    });
  }
});

// POST new medicine (optional, for admin)
router.post('/medicines', authenticate, async (req, res) => {
  try {
    const { name, type } = req.body;
    
    if (!name || !type) {
      return res.status(400).json({
        success: false,
        message: 'Medicine name and type are required'
      });
    }
    
    const [result] = await db.execute(
      'INSERT INTO medicine (name, type) VALUES (?, ?)',
      [name, type]
    );
    
    console.log('✅ Medicine added:', name);
    
    res.status(201).json({
      success: true,
      message: 'Medicine added successfully',
      data: {
        id: result.insertId,
        name,
        type
      }
    });
    
  } catch (error) {
    console.error('❌ Error adding medicine:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add medicine',
      error: error.message
    });
  }
});

// ==================== QUEUE & PATIENT ROUTES ====================

// Get doctor's patient queue for today
router.get('/queue/:doctorId', authenticate, async (req, res) => {
  const { doctorId } = req.params;
  
  console.log('🔍 Fetching queue for doctor:', doctorId);
  
  try {
    const [visits] = await db.execute(`
      SELECT 
        v.visit_id,
        v.visit_type,
        v.status,
        v.reason,
        v.visit_date,
        p.patient_id,
        p.name as patient_name,
        p.dob,
        p.gender,
        p.blood_group,
        p.phone
      FROM visit v
      JOIN patient_profile p ON v.patient_id = p.patient_id
      WHERE v.doctor_id = ?
        AND v.status IN ('SCHEDULED', 'ONGOING', 'DIAGNOSED', 'PRESCRIBED')
      ORDER BY v.visit_date ASC
    `, [doctorId]);
    
    console.log('✅ Found', visits.length, 'visits for doctor');
    
    res.json({
      success: true,
      data: visits,
      count: visits.length
    });
  } catch (error) {
    console.error('❌ Error fetching queue:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch patient queue',
      error: error.message
    });
  }
});

// Get patient history
router.get('/patient/:patientId/history', authenticate, async (req, res) => {
  const { patientId } = req.params;
  
  console.log('🔍 Fetching history for patient:', patientId);
  
  try {
    // Get patient basic info
    const [patientInfo] = await db.execute(`
      SELECT 
        patient_id,
        name,
        dob,
        gender,
        blood_group,
        phone,
        emergency_contact,
        roll_no
      FROM patient_profile
      WHERE patient_id = ?
    `, [patientId]);

    if (patientInfo.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    // Get medical history
    const [medicalHistory] = await db.execute(`
      SELECT 
        history_id,
        condition_name,
        since_date,
        status,
        notes,
        created_at
      FROM medical_history
      WHERE patient_id = ?
      ORDER BY created_at DESC
    `, [patientId]);

    // Get past visits with diagnoses
    const [pastVisits] = await db.execute(`
      SELECT 
        v.visit_id,
        v.visit_date,
        v.visit_type,
        v.reason,
        v.status,
        d.name as doctor_name,
        d.specialization,
        diag.diagnosis_name,
        diag.diagnosis_notes,
        diag.diagnosis_code
      FROM visit v
      LEFT JOIN doctor d ON v.doctor_id = d.doctor_id
      LEFT JOIN diagnosis diag ON v.visit_id = diag.visit_id
      WHERE v.patient_id = ?
        AND v.status IN ('COMPLETED', 'DIAGNOSED', 'PRESCRIBED')
      ORDER BY v.visit_date DESC
      LIMIT 10
    `, [patientId]);

    // Get prescriptions from past visits
    const [prescriptions] = await db.execute(`
      SELECT 
        p.prescription_id,
        p.created_at,
        p.status as prescription_status,
        v.visit_date,
        d.name as doctor_name,
        pi.medicine_id,
        pi.duration_days,
        pi.food,
        pi.morning,
        pi.afternoon,
        pi.night
      FROM prescription p
      JOIN visit v ON p.visit_id = v.visit_id
      JOIN doctor d ON p.doctor_id = d.doctor_id
      LEFT JOIN prescription_items pi ON p.prescription_id = pi.prescription_id
      WHERE v.patient_id = ?
      ORDER BY p.created_at DESC
      LIMIT 20
    `, [patientId]);

    // Get lab tests
    const [labTests] = await db.execute(`
      SELECT 
        lt.lab_test_id,
        lt.test_name,
        lt.ordered_date,
        lt.result,
        lt.normal_range,
        v.visit_date
      FROM lab_tests lt
      JOIN visit v ON lt.visit_id = v.visit_id
      WHERE v.patient_id = ?
      ORDER BY lt.ordered_date DESC
      LIMIT 10
    `, [patientId]);

    // Get vitals history
    const [vitalsHistory] = await db.execute(`
      SELECT 
        vit.vitals_id,
        vit.temperature,
        vit.bp_systolic,
        vit.bp_diastolic,
        vit.heart_rate,
        v.visit_date
      FROM vitals vit
      JOIN visit v ON vit.visit_id = v.visit_id
      WHERE v.patient_id = ?
      ORDER BY v.visit_date DESC
      LIMIT 10
    `, [patientId]);

    console.log('✅ Patient history fetched successfully');
    
    res.json({
      success: true,
      data: {
        patient: patientInfo[0],
        medicalHistory: medicalHistory,
        pastVisits: pastVisits,
        prescriptions: prescriptions,
        labTests: labTests,
        vitalsHistory: vitalsHistory
      }
    });
  } catch (error) {
    console.error('❌ Error fetching patient history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch patient history',
      error: error.message
    });
  }
});

// Update visit status
router.patch('/visit/:visitId/status', authenticate, async (req, res) => {
  const { visitId } = req.params;
  const { status } = req.body;
  
  console.log('🔄 Backend: Updating visit status:', { visitId, status });
  
  // Validate status against actual ENUM values from your database
  const validStatuses = ['SCHEDULED', 'ONGOING', 'COMPLETED', 'CANCELLED', 'DIAGNOSED', 'PRESCRIBED', 'NURSING', 'PHARMACY'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
    });
  }
  
  try {
    const [result] = await db.execute(
      'UPDATE visit SET status = ? WHERE visit_id = ?',
      [status, visitId]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        success: false,
        message: 'Visit not found' 
      });
    }
    
    console.log('✅ Backend: Visit status updated successfully');
    
    res.json({ 
      success: true,
      visitId, 
      status, 
      message: 'Status updated successfully' 
    });
  } catch (error) {
    console.error('❌ Backend error updating visit status:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to update status',
      error: error.message 
    });
  }
});

// ==================== NURSE TASK CREATION ====================

// Helper function to generate UUID
const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// Helper function to check if medicine type requires nursing
const requiresNursing = (type) => {
  return type === 'Injection' || type === 'DRIP';
};

// POST create prescription with automatic nurse task assignment
router.post('/prescription-with-tasks', authenticate, authorize(ROLES.DOCTOR), async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const { visit_id, doctor_id, medicines } = req.body;
    
    console.log('📝 Creating prescription with', medicines.length, 'medicines');
    console.log('📝 Request body:', JSON.stringify(req.body, null, 2));
    
    // Validate required fields
    if (!visit_id || !doctor_id || !medicines || medicines.length === 0) {
      throw new Error('Missing required fields: visit_id, doctor_id, or medicines');
    }
    
    // Create prescription
    const prescriptionId = generateUUID();
    console.log('📝 Generated prescription ID:', prescriptionId);
    
    await connection.execute(
      'INSERT INTO prescription (prescription_id, visit_id, doctor_id, status) VALUES (?, ?, ?, ?)',
      [prescriptionId, visit_id, doctor_id, 'PENDING']
    );
    
    console.log('✅ Prescription created:', prescriptionId);
    
    // Track nurse tasks to create
    const nurseTasks = new Map(); // nurse_id -> { medicines: [], visit_id, doctor_id }
    
    // Process each medicine
    for (const med of medicines) {
      const { medicine_id, duration_days } = med;
      
      // Get medicine type from database
      const [medicineData] = await connection.execute(
        'SELECT type FROM medicine WHERE medicine_id = ?',
        [medicine_id]
      );
      
      if (medicineData.length === 0) {
        throw new Error(`Medicine not found: ${medicine_id}`);
      }
      
      const medicineType = medicineData[0].type;
      const needsNursing = requiresNursing(medicineType);
      
      console.log(`💊 Medicine ${medicine_id} (${medicineType}): ${needsNursing ? 'Needs nursing' : 'Regular prescription'}`);
      
      if (needsNursing) {
        // This is an injectable medicine - create nurse task
        const { nurse_id, route, infusion_duration } = med;
        
        if (!nurse_id || !route) {
          throw new Error(`Nurse assignment and route required for injectable medicine: ${medicine_id}`);
        }
        
        // Validate that the nurse exists
        const [nurseCheck] = await connection.execute(
          'SELECT nurse_id FROM nurse WHERE nurse_id = ?',
          [nurse_id]
        );
        
        if (nurseCheck.length === 0) {
          throw new Error(`Invalid nurse_id: ${nurse_id}. Nurse does not exist.`);
        }
        
        // Group by nurse_id for efficiency
        if (!nurseTasks.has(nurse_id)) {
          nurseTasks.set(nurse_id, {
            medicines: [],
            visit_id,
            doctor_id
          });
        }
        
        nurseTasks.get(nurse_id).medicines.push({
          medicine_id,
          route,
          dosage: infusion_duration ? `${infusion_duration} minutes` : null,
          remarks: medicineType === 'DRIP' ? `Infusion duration: ${infusion_duration} mins` : null,
          duration_days
        });
        
      } else {
        // Regular medicine - add to prescription items
        const { food, morning, afternoon, night } = med;
        
        const itemId = generateUUID();
        await connection.execute(
          `INSERT INTO prescription_items 
           (item_id, prescription_id, medicine_id, total_days, food, morning, afternoon, night) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [itemId, prescriptionId, medicine_id, duration_days, food || 'AFTER', 
           morning || false, afternoon || false, night || false]
        );
        
        console.log(`✅ Added regular medicine to prescription: ${medicine_id}`);
      }
    }
    
    // Create nurse tasks
    let tasksCreated = 0;
    for (const [nurse_id, taskData] of nurseTasks.entries()) {
      const taskId = generateUUID();
      const taskType = taskData.medicines.length > 1 
        ? `MULTIPLE_INJECTIONS (${taskData.medicines.length})` 
        : 'INJECTION_ADMINISTRATION';
      
      // Create nurse task
      await connection.execute(
        'INSERT INTO nurse_task (task_id, visit_id, doctor_id, nurse_id, task_type, status) VALUES (?, ?, ?, ?, ?, ?)',
        [taskId, taskData.visit_id, taskData.doctor_id, nurse_id, taskType, 'PENDING']
      );
      
      console.log(`✅ Created nurse task ${taskId} for nurse ${nurse_id}`);
      
      // Add task details for each medicine
      for (const med of taskData.medicines) {
        const detailId = generateUUID();
        await connection.execute(
          'INSERT INTO nurse_task_details (detail_id, task_id, medicine_id, dosage, route, remarks) VALUES (?, ?, ?, ?, ?, ?)',
          [detailId, taskId, med.medicine_id, med.dosage, med.route, med.remarks]
        );
        
        console.log(`✅ Added medicine ${med.medicine_id} to nurse task details`);
      }
      
      tasksCreated++;
    }
    
    await connection.commit();
    
    console.log(`🎉 Prescription saved successfully with ${tasksCreated} nurse tasks`);
    
    res.status(201).json({
      success: true,
      message: 'Prescription and nurse tasks created successfully',
      data: {
        prescription_id: prescriptionId,
        nurse_tasks_created: tasksCreated,
        total_medicines: medicines.length
      }
    });
    
  } catch (error) {
    await connection.rollback();
    console.error('❌ Error creating prescription with nurse tasks:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create prescription',
      error: error.message
    });
  } finally {
    connection.release();
  }
});

// ==================== EXISTING CONTROLLER ROUTES ====================

router.post(
  '/diagnosis',
  authenticate,
  authorize(ROLES.DOCTOR),
  c.addDiagnosis
);

router.post(
  '/prescription',
  authenticate,
  authorize(ROLES.DOCTOR),
  c.addPrescription
);

router.patch(
  '/visit/:visit_id/status',
  authenticate,
  authorize(ROLES.DOCTOR),
  c.updateVisitStatus
);

router.patch(
  '/visit/:visit_id/complete',
  authenticate,
  authorize(ROLES.DOCTOR),
  c.completeVisit
);

export default router;
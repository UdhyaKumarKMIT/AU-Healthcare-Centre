// Backend/routes/doctor.route.js - WITH PATIENT HISTORY ROUTE

import express from 'express';
import authenticate from '../middlewares/auth.middleware.js';
import authorize from '../middlewares/role.middleware.js';
import * as c from '../controllers/doctor.controller.js';
import db from '../config/db.js';
import ROLES from '../constants/roles.js';

const router = express.Router();

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

// Existing controller routes
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
// Backend/routes/students.route.js - FIXED ALL userId REFERENCES

import express from 'express';
import authenticate from '../middlewares/auth.middleware.js';
import authorize from '../middlewares/role.middleware.js';
import db from '../config/db.js';
import ROLES from '../constants/roles.js';

const router = express.Router();

// Get student profile
router.get('/profile', authenticate, authorize(ROLES.PATIENT), async (req, res) => {
  try {
    const userId = req.user.userId; // ✅ Consistent with JWT
    
    console.log('🔍 Fetching profile for user:', userId);
    
    const [profile] = await db.execute(`
      SELECT 
        pp.patient_id,
        pp.roll_no,
        pp.name,
        pp.dob,
        pp.gender,
        pp.blood_group,
        pp.phone,
        pp.emergency_contact,
        u.email
      FROM patient_profile pp
      JOIN users u ON pp.user_id = u.user_id
      WHERE pp.user_id = ?
    `, [userId]);
    
    if (profile.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }
    
    console.log('✅ Profile found:', profile[0].name);
    
    res.json({
      success: true,
      data: profile[0]
    });
  } catch (error) {
    console.error('❌ Error fetching profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile',
      error: error.message
    });
  }
});

// Update student profile
router.put('/profile', authenticate, authorize(ROLES.PATIENT), async (req, res) => {
  try {
    const userId = req.user.userId; // ✅ Fixed
    const { phone, emergency_contact } = req.body;
    
    console.log('🔄 Updating profile for user:', userId);
    
    // Get patient_id first
    const [patient] = await db.execute(
      'SELECT patient_id FROM patient_profile WHERE user_id = ?',
      [userId]
    );
    
    if (patient.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Patient profile not found'
      });
    }
    
    const patientId = patient[0].patient_id;
    
    // Update profile
    await db.execute(`
      UPDATE patient_profile 
      SET phone = ?, emergency_contact = ?
      WHERE patient_id = ?
    `, [phone, emergency_contact, patientId]);
    
    console.log('✅ Profile updated successfully');
    
    res.json({
      success: true,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error('❌ Error updating profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message
    });
  }
});

// Get student's medical history
router.get('/medical-history', authenticate, authorize(ROLES.PATIENT), async (req, res) => {
  try {
    const userId = req.user.userId; // ✅ Fixed
    
    console.log('🔍 Fetching medical history for user:', userId);
    
    // Get patient_id
    const [patient] = await db.execute(
      'SELECT patient_id FROM patient_profile WHERE user_id = ?',
      [userId]
    );
    
    if (patient.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }
    
    const patientId = patient[0].patient_id;
    
    const [history] = await db.execute(`
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
    
    console.log('✅ Found', history.length, 'medical history records');
    
    res.json({
      success: true,
      data: history
    });
  } catch (error) {
    console.error('❌ Error fetching medical history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch medical history',
      error: error.message
    });
  }
});

// Get student's visit history
router.get('/visits', authenticate, authorize(ROLES.PATIENT), async (req, res) => {
  try {
    const userId = req.user.userId; // ✅ Fixed
    
    console.log('🔍 Fetching visits for user:', userId);
    
    // Get patient_id
    const [patient] = await db.execute(
      'SELECT patient_id FROM patient_profile WHERE user_id = ?',
      [userId]
    );
    
    if (patient.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }
    
    const patientId = patient[0].patient_id;
    
    const [visits] = await db.execute(`
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
      ORDER BY v.visit_date DESC
      LIMIT 20
    `, [patientId]);
    
    console.log('✅ Found', visits.length, 'visits');
    
    res.json({
      success: true,
      data: visits
    });
  } catch (error) {
    console.error('❌ Error fetching visits:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch visits',
      error: error.message
    });
  }
});

// Get student's prescriptions
router.get('/prescriptions', authenticate, authorize(ROLES.PATIENT), async (req, res) => {
  try {
    const userId = req.user.userId; // ✅ Fixed
    
    console.log('🔍 Fetching prescriptions for user:', userId);
    
    // Get patient_id
    const [patient] = await db.execute(
      'SELECT patient_id FROM patient_profile WHERE user_id = ?',
      [userId]
    );
    
    if (patient.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }
    
    const patientId = patient[0].patient_id;
    
    const [prescriptions] = await db.execute(`
      SELECT 
        p.prescription_id,
        p.created_at,
        p.status as prescription_status,
        v.visit_date,
        d.name as doctor_name,
        d.specialization,
        pi.item_id,
        pi.med_name,
        pi.med_type,
        pi.total_days,
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
    
    console.log('✅ Found', prescriptions.length, 'prescription items');
    
    res.json({
      success: true,
      data: prescriptions
    });
  } catch (error) {
    console.error('❌ Error fetching prescriptions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch prescriptions',
      error: error.message
    });
  }
});

// Get student's lab tests
router.get('/lab-tests', authenticate, authorize(ROLES.PATIENT), async (req, res) => {
  try {
    const userId = req.user.userId; // ✅ Fixed
    
    console.log('🔍 Fetching lab tests for user:', userId);
    
    // Get patient_id
    const [patient] = await db.execute(
      'SELECT patient_id FROM patient_profile WHERE user_id = ?',
      [userId]
    );
    
    if (patient.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }
    
    const patientId = patient[0].patient_id;
    
    const [labTests] = await db.execute(`
      SELECT 
        lt.lab_test_id,
        lt.test_name,
        lt.ordered_date,
        lt.result,
        lt.normal_range,
        v.visit_date,
        d.name as doctor_name
      FROM lab_tests lt
      JOIN visit v ON lt.visit_id = v.visit_id
      LEFT JOIN doctor d ON v.doctor_id = d.doctor_id
      WHERE v.patient_id = ?
      ORDER BY lt.ordered_date DESC
      LIMIT 20
    `, [patientId]);
    
    console.log('✅ Found', labTests.length, 'lab tests');
    
    res.json({
      success: true,
      data: labTests
    });
  } catch (error) {
    console.error('❌ Error fetching lab tests:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch lab tests',
      error: error.message
    });
  }
});

// Get available doctors schedule (for booking)
router.get('/doctors/available', authenticate, authorize(ROLES.PATIENT), async (req, res) => {
  try {
    const { date, specialization } = req.query;
    
    console.log('🔍 Fetching available doctors');
    
    let query = `
      SELECT 
        doctor_id,
        name,
        specialization,
        phone,
        availability_status
      FROM doctor
      WHERE availability_status = 'AVAILABLE'
    `;
    
    const params = [];
    
    if (specialization) {
      query += ' AND specialization = ?';
      params.push(specialization);
    }
    
    query += ' ORDER BY name ASC';
    
    const [doctors] = await db.execute(query, params);
    
    console.log('✅ Found', doctors.length, 'available doctors');
    
    res.json({
      success: true,
      data: doctors
    });
  } catch (error) {
    console.error('❌ Error fetching doctors:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch doctors',
      error: error.message
    });
  }
});

// Get student's vitals history
router.get('/vitals', authenticate, authorize(ROLES.PATIENT), async (req, res) => {
  try {
    const userId = req.user.userId; // ✅ Fixed
    
    console.log('🔍 Fetching vitals for user:', userId);
    
    // Get patient_id
    const [patient] = await db.execute(
      'SELECT patient_id FROM patient_profile WHERE user_id = ?',
      [userId]
    );
    
    if (patient.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }
    
    const patientId = patient[0].patient_id;
    
    const [vitals] = await db.execute(`
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
      LIMIT 20
    `, [patientId]);
    
    console.log('✅ Found', vitals.length, 'vitals records');
    
    res.json({
      success: true,
      data: vitals
    });
  } catch (error) {
    console.error('❌ Error fetching vitals:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch vitals',
      error: error.message
    });
  }
});

export default router;
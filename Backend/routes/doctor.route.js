// Backend/routes/doctor.route.js - CORRECTED WITH ACTUAL COLUMNS

import express from 'express';
import authenticate from '../middlewares/auth.middleware.js';
import authorize from '../middlewares/role.middleware.js';
import * as c from '../controllers/doctor.controller.js';
import db from '../config/db.js';
import ROLES from '../constants/roles.js';

const router = express.Router();

// Get doctor's patient queue for today
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
        AND v.status IN ('SCHEDULED', 'IN_PROGRESS', 'DIAGNOSED', 'PRESCRIBED')
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

// Update visit status
router.patch('/visit/:visitId/status', authenticate, async (req, res) => {
  const { visitId } = req.params;
  const { status } = req.body;
  
  console.log('🔄 Backend: Updating visit status:', { visitId, status });
  
  // Validate status against actual ENUM values from your database
  const validStatuses = ['SCHEDULED', 'IN_PROGRESS', 'DIAGNOSED', 'PRESCRIBED', 'PHARMACY', 'COMPLETED', 'CANCELLED'];
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
// Backend/routes/doctor.route.js - Clean controller-based routing

import express from 'express';
import authenticate from '../middlewares/auth.middleware.js';
import authorize from '../middlewares/role.middleware.js';
import * as doctorController from '../controllers/doctor.controller.js';
import ROLES from '../constants/roles.js';

const router = express.Router();

// ==================== PATIENT QUEUE ====================
router.get('/queue/:doctorId', authenticate, authorize(ROLES.DOCTOR), doctorController.getDoctorQueue);
router.get('/visits', authenticate, authorize(ROLES.DOCTOR), doctorController.getDoctorVisits);
router.get('/visits/today', authenticate, authorize(ROLES.DOCTOR), doctorController.getTodayVisitsCount);

// ==================== PATIENT HISTORY ====================
router.get('/patient/:patient_id/history', authenticate, authorize(ROLES.DOCTOR), doctorController.getPatientHistory);

// ==================== MEDICINES ====================
router.get('/medicines', authenticate, authorize(ROLES.DOCTOR), doctorController.searchMedicines);

// ==================== NURSES ====================
router.get('/nurses', authenticate, authorize(ROLES.DOCTOR), doctorController.getAvailableNurses);

// ==================== NURSE TASKS ====================
router.get('/nurse-task-types', authenticate, authorize(ROLES.DOCTOR), doctorController.getNurseTaskTypes);
router.post('/nurse-task', authenticate, authorize(ROLES.DOCTOR), doctorController.createNurseTask);

// ==================== DIAGNOSIS ====================
router.get('/visit/:visit_id/diagnoses', authenticate, authorize(ROLES.DOCTOR), doctorController.getVisitDiagnoses);
router.post('/diagnosis', authenticate, authorize(ROLES.DOCTOR), doctorController.addDiagnosis);
router.post('/diagnoses', authenticate, authorize(ROLES.DOCTOR), doctorController.addMultipleDiagnoses);

// ==================== PRESCRIPTION ====================
router.post('/prescription', authenticate, authorize(ROLES.DOCTOR), doctorController.createPrescription);
router.post('/prescription-with-tasks', authenticate, authorize(ROLES.DOCTOR), doctorController.createPrescriptionWithTasks);

// ==================== VISIT STATUS ====================
router.patch('/visit/:visit_id/status', authenticate, authorize(ROLES.DOCTOR), doctorController.updateVisitStatus);
router.patch('/visit/:visit_id/complete', authenticate, authorize(ROLES.DOCTOR), doctorController.markVisitAsCompleted);

export default router;

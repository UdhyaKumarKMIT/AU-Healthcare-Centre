import express from 'express';
import {
  nurseLogin,
  getNurseByUserId,
  getNurseTasks,
  getTaskDetails,
  completeTask
} from '../controllers/nurse.controller.js';

const router = express.Router();

// ❌ DO NOT ADD /login HERE
// Nurse uses /api/auth/login like all roles
router.post('/login', nurseLogin);   // ✅ THIS WAS MISSING / WRONG
router.get('/user/:user_id', getNurseByUserId);
router.get('/:nurse_id/tasks', getNurseTasks);
router.get('/task/:task_id/details', getTaskDetails);
router.post('/task/:task_id/complete', completeTask);

export default router;

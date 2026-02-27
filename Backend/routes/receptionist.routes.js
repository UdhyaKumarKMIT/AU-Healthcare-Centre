import express from 'express'
import authenticate from '../middlewares/auth.middleware.js'
import authorize from '../middlewares/role.middleware.js'
import * as receptionistController from '../controllers/receptionist.controller.js'
import ROLES from '../constants/roles.js'

const router = express.Router()

router.post(
  '/register/patient',
  authenticate,
  authorize(ROLES.NURSE_RECEPTIONIST, ROLES.ADMIN),
  receptionistController.registerPatient
)

router.post(
  '/visit',
  authenticate,
  authorize(ROLES.NURSE_RECEPTIONIST),
  receptionistController.createVisit
)

router.post(
  '/vitals',
  authenticate,
  authorize(ROLES.NURSE_RECEPTIONIST),
  receptionistController.addVitals
)

router.patch(
  '/visit/:visit_id/assign-doctor',
  authenticate,
  authorize(ROLES.NURSE_RECEPTIONIST),
  receptionistController.assignDoctor
)

router.get(
  '/patients',
  authenticate,
  authorize(ROLES.NURSE_RECEPTIONIST),
  receptionistController.getPatients
)

router.get(
  '/patients/search',
  authenticate,
  authorize(ROLES.NURSE_RECEPTIONIST),
  receptionistController.searchPatients
)

router.get(
  '/doctors',
  authenticate,
  authorize(ROLES.NURSE_RECEPTIONIST),
  receptionistController.getDoctors
)

router.get(
  '/visits',
  authenticate,
  authorize(ROLES.NURSE_RECEPTIONIST),
  receptionistController.getVisits
)

router.patch(
  '/visit/:visit_id/start',
  authenticate,
  authorize(ROLES.NURSE_RECEPTIONIST),
  receptionistController.startVisit
)

router.patch(
  '/visit/:visit_id/cancel',
  authenticate,
  authorize(ROLES.NURSE_RECEPTIONIST),
  receptionistController.cancelVisit
)

/* ⭐ NEW availability endpoint */
router.patch(
  '/doctor/:doctor_id/availability',
  authenticate,
  authorize(ROLES.NURSE_RECEPTIONIST),
  receptionistController.updateDoctorAvailability
)
router.get(
  '/doctors/available',
  authenticate,
  authorize(ROLES.NURSE_RECEPTIONIST),
  receptionistController.getAvailableDoctors
)

export default router

// src/routes/pharmacist.routes.js
import express from "express";
import authenticate from "../middlewares/auth.middleware.js";
import authorize from "../middlewares/role.middleware.js";
import ROLES from "../constants/roles.js";

import * as pharmacistController from "../controllers/pharmacist/pharmacist.controller.js";
import * as inventoryController from "../controllers/pharmacist/inventory.controller.js";
import * as prescriptionController from "../controllers/pharmacist/prescription.controller.js";
import * as transactionController from "../controllers/pharmacist/transaction.controller.js";

const router = express.Router();

/**
 * @swagger
 * /api/pharmacist/pharmacistDetails:
 *   get:
 *     summary: Get current pharmacist details
 *     tags: [Pharmacist]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Pharmacist details retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Pharmacist not found
 */
router.get(
  "/pharmacistDetails",
  authenticate,
  authorize(ROLES.PHARMACIST),
  pharmacistController.getPharmacistDetails
);

/**
 * @swagger
 * /api/pharmacist/updatePharmacistDetails:
 *   patch:
 *     summary: Update current pharmacist profile
 *     tags: [Pharmacist]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
router.patch(
  "/updatePharmacistDetails",
  authenticate,
  authorize(ROLES.PHARMACIST),
  pharmacistController.updatePharmacistDetails
);

/* ===================== PRESCRIPTIONS ===================== */

/**
 * @swagger
 * /api/pharmacy/prescriptions:
 *   get:
 *     summary: Get all pharmacy prescriptions
 *     tags: [Pharmacy]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of prescriptions
 *       401:
 *         description: Unauthorized
 */
router.get(
  "/prescriptions",
  authenticate,
  authorize(ROLES.PHARMACIST),
  prescriptionController.getAllPrescriptions
);

/**
 * @swagger
 * /api/pharmacy/prescriptionDetails:
 *   get:
 *     summary: Get prescription medicine details by ID
 *     tags: [Pharmacy]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Prescription item details
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Prescription not found
 */
router.get(
  "/prescriptionDetails",
  authenticate,
  authorize(ROLES.PHARMACIST),
  prescriptionController.getPrescriptionDetails
);

/**
 * @swagger
 * /api/pharmacy/issue:
 *   post:
 *     summary: Issue medicine for a prescription
 *     tags: [Pharmacy]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - pharmacy_prescription_id
 *               - issued_days
 *             properties:
 *               pharmacy_prescription_id:
 *                 type: integer
 *               issued_days:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Medicine issued successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Issue failed
 */
router.post(
  "/issue",
  authenticate,
  authorize(ROLES.PHARMACIST),
  prescriptionController.issueMedicine
);

/* ===================== TRANSACTIONS ===================== */

/**
 * @swagger
 * /api/pharmacy/transactions:
 *   get:
 *     summary: Get all pharmacy transactions
 *     tags: [Pharmacy]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of transactions
 *       401:
 *         description: Unauthorized
 */
router.get(
  "/transactions",
  authenticate,
  authorize(ROLES.PHARMACIST),
  transactionController.getTransactions
);

/**
 * @swagger
 * /api/pharmacy/transactionDetails/{id}:
 *   get:
 *     summary: Get pharmacy transaction details by transaction ID
 *     tags: [Pharmacy]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Transaction details retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Transaction not found
 */
router.get(
  "/transactionDetails/:id",
  authenticate,
  authorize(ROLES.PHARMACIST),
  transactionController.getTransactionDetails
);

/* ===================== INVENTORY ===================== */

/**
 * @swagger
 * /api/pharmacy/expiryMedicine:
 *   get:
 *     summary: Get expired medicine batches
 *     tags: [Pharmacy]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Expired medicine batches retrieved
 *       401:
 *         description: Unauthorized
 */
router.get(
  "/expiryMedicine",
  authenticate,
  authorize(ROLES.PHARMACIST),
  inventoryController.getExpiredMedicineBatches
);

/**
 * @swagger
 * /api/pharmacy/medicine:
 *   get:
 *     summary: Get all medicines
 *     tags: [Pharmacy]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of medicines
 *       401:
 *         description: Unauthorized
 */
router.get(
  "/medicine",
  authenticate,
  authorize(ROLES.PHARMACIST),
  inventoryController.getMedicineDetails
);
 

/**
 * @swagger
 * /api/pharmacy/clearMedicineBatch/{batch_id}:
 *   delete:
 *     summary: Clear a medicine batch
 *     tags: [Pharmacy]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: batch_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Batch cleared successfully
 *       404:
 *         description: Batch not found
 *       500:
 *         description: Failed to clear
 */
router.delete(
  "/clearMedicineBatch/:batch_id",
  authenticate,
  authorize(ROLES.PHARMACIST),
  inventoryController.clearMedicineBatch
);
 
/**
 * @swagger
 * /api/pharmacy/getBatches:
 *   get:
 *     summary: Get batches for a medicine
 *     tags: [Pharmacy]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: medicine_name
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: total_days
 *         required: true
 *         schema:
 *           type: number
 *       - in: query
 *         name: quantity
 *         required: true
 *         schema:
 *           type: number
 *     responses:
 *       200:
 *         description: Batch details retrieved
 *       400:
 *         description: Missing parameters
 *       404:
 *         description: Medicine not found
 */
router.get(
  "/getBatches",
  authenticate,
  authorize(ROLES.PHARMACIST),
  inventoryController.getBatches
);

/**
 * @swagger
 * /api/pharmacy/getDashboardCounts:
 *   get:
 *     summary: Get dashboard counts
 *     tags: [Pharmacy]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard counts retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get(
  "/getDashboardCounts",
  authenticate,
  authorize(ROLES.PHARMACIST),
  pharmacistController.getDashboardCounts
);

/**
 * @swagger
 * /api/pharmacy/getPendingStock:
 *   get:
 *     summary: Get pending pharmacy stock verifications
 *     tags: [Pharmacy]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Pending pharmacy stocks retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get(
  "/getVerificationStock",
  authenticate,
  authorize(ROLES.PHARMACIST),
  transactionController.getVerificationStock
);

/**
 * @swagger
 * /api/pharmacy/verifyStock:
 *   post:
 *     summary: Verify pharmacy stock by batch number
 *     tags: [Pharmacy]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               batch_no:
 *                 type: string
 *                 example: "BATCH12345"
 *     responses:
 *       200:
 *         description: Stock verification updated successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post(
  "/verifyStock",
  authenticate,
  authorize(ROLES.PHARMACIST),
  transactionController.verifyPharmacyStock
);

export default router;

import express from "express";
import auth from "../middlewares/auth.js";
import * as pharmacistController from "../controllers/pharmacistController.js";

const router = express.Router();

/**
 * @swagger
 * /api/pharmacist/register:
 *   post:
 *     summary: Register a new pharmacist
 *     tags: [Pharmacist]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_id:
 *                 type: integer
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: Registered successfully
 *       400:
 *         description: Missing fields
 *       409:
 *         description: Email already exists
 */
router.post("/register", pharmacistController.register);

/**
 * @swagger
 * /api/pharmacist/login:
 *   post:
 *     summary: Login pharmacist
 *     tags: [Pharmacist]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login success
 *       400:
 *         description: Missing fields
 *       401:
 *         description: Invalid credentials
 */
router.post("/login", pharmacistController.login);

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
 *         description: Pharmacist details
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Pharmacist not found
 */
router.get("/pharmacistDetails", auth, pharmacistController.getPharmacistDetails);

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
router.patch("/updatePharmacistDetails", auth, pharmacistController.updatePharmacistDetails);

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
  auth,
  pharmacistController.getAllPrescriptions
);

/**
 * @swagger
 * /api/pharmacy/prescriptions/{id}:
 *   get:
 *     summary: Get prescription medicine details
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
 *         description: Prescription item details
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Prescription not found
 */
router.get(
  "/prescriptionDetails",
  auth,
  pharmacistController.getPrescriptionDetails
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
  auth,
  pharmacistController.issueMedicine
);

/**
 * @swagger
 * /api/pharmacy/transactions/{id}:
 *   get:
 *     summary: Get pharmacy transaction details
 *     tags: [Pharmacy]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Pharmacy transaction ID
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
  auth,
  pharmacistController.getTransactionDetails
);

router.get(
  "/transactions",
  auth,
  pharmacistController.getTransactions
);

router.get(
  "/expiryMedicine",
  auth,
  pharmacistController.getExpiredMedicineBatches
);

router.get(
  "/medicine",
  auth,
  pharmacistController.getMedicineDetails
);

router.post(
  "/medicine/addStock",
  auth,
  pharmacistController.addMedicineBatch
);

router.delete(
  "/medicine/deleteStock/:batch_id",
  auth,
  pharmacistController.deleteMedicineBatch
)

router.delete(
  "/clearMedicineBatch/:batch_id",
  auth,
  pharmacistController.clearMedicineBatch
);

router.post(
  "/addMedicine",
  auth,
  pharmacistController.addMedicine
);
 
router.get(
  "/getBatches",
  auth,
  pharmacistController.getBatches
);

export default router;
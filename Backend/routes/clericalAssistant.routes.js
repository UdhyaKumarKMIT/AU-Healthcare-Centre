// src/routes/clericalAssistant.routes.js
import express from "express";
import multer from "multer";
import authenticate from "../middlewares/auth.middleware.js";
import authorize from "../middlewares/role.middleware.js";
import ROLES from "../constants/roles.js";

// ✅ Separate controllers (NO logic change, only separation) 
import * as RequestController from "../controllers/ca/request.controller.js";
import * as IssueController from "../controllers/ca/issue.controller.js";
import * as InventoryController from "../controllers/ca/inventory.controller.js";
import * as DashboardController from "../controllers/ca/dashboard.controller.js";

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

/* ===================== REQUESTS ===================== */

/**
 * @swagger
 * /api/clerical_assistant/requestDetails:
 *   get:
 *     summary: Get request details by medicine ID
 *     tags: [Clerical Assistant]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Request details fetched }
 *       404: { description: Not found }
 */
router.get(
  "/requestDetails",
  authenticate,
  authorize(ROLES.CLERICAL_ASSISTANT),
  RequestController.getRequestDetails
);

/* ===================== ISSUE ===================== */
/**
 * @swagger
 * /api/clerical_assistant/issue:
 *   post:
 *     summary: Issue medicine stock
 *     tags: [Clerical Assistant]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               medicine_id: { type: string }
 *               batches:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     batch_id: { type: string }
 *                     quantity: { type: number }
 *                     substockCode: { type: number }
 *     responses:
 *       200: { description: Stock issued successfully }
 *       500: { description: Issue failed }
 */
router.post(
  "/issue",
  authenticate,
  authorize(ROLES.CLERICAL_ASSISTANT),
  IssueController.issueMedicine
);

/* ===================== INVENTORY ===================== */
/**
 * @swagger
 * /api/clerical_assistant/expiryMedicine:
 *   get:
 *     summary: Get expired medicine batches
 *     tags: [Clerical Assistant]
 *     security:
 *       - bearerAuth: []
 */
router.get(
  "/expiryMedicine",
  authenticate,
  authorize(ROLES.CLERICAL_ASSISTANT),
  InventoryController.getExpiredMedicineBatches
);

/**
 * @swagger
 * /api/clerical_assistant/outofstockmedicine:
 *   get:
 *     summary: Get out of stock medicines
 *     tags: [Clerical Assistant]
 *     security:
 *       - bearerAuth: []
 */
router.get(
  "/outofstockmedicine",
  authenticate,
  authorize(ROLES.CLERICAL_ASSISTANT),
  InventoryController.getOutOfStock
);

/**
 * @swagger
 * /api/clerical_assistant/medicine/addStock:
 *   post:
 *     summary: Add medicine batch
 *     tags: [Clerical Assistant]
 *     security:
 *       - bearerAuth: []
 */
router.post(
  "/medicine/addStock",
  authenticate,
  authorize(ROLES.CLERICAL_ASSISTANT),
  InventoryController.addMedicineBatch
);

/**
 * @swagger
 * /api/clerical_assistant/medicine/deleteStock/{batch_id}:
 *   delete:
 *     summary: Delete medicine batch
 *     tags: [Clerical Assistant]
 *     security:
 *       - bearerAuth: []
 */
router.delete(
  "/medicine/deleteStock/:batch_id",
  authenticate,
  authorize(ROLES.CLERICAL_ASSISTANT),
  InventoryController.deleteMedicineBatch
);

/**
 * @swagger
 * /api/clerical_assistant/clearMedicineBatch/{batch_id}:
 *   delete:
 *     summary: Clear medicine batch stock
 *     tags: [Clerical Assistant]
 *     security:
 *       - bearerAuth: []
 */
router.delete(
  "/clearMedicineBatch/:batch_id",
  authenticate,
  authorize(ROLES.CLERICAL_ASSISTANT),
  InventoryController.clearMedicineBatch
);

/**
 * @swagger
 * /api/clerical_assistant/addMedicine:
 *   post:
 *     summary: Add new medicine
 *     tags: [Clerical Assistant]
 *     security:
 *       - bearerAuth: []
 */
router.post(
  "/addMedicine",
  authenticate,
  authorize(ROLES.CLERICAL_ASSISTANT),
  InventoryController.addMedicine
);

/**
 * @swagger
 * /api/clerical_assistant/addMedicineBulk:
 *   post:
 *     summary: Bulk add medicines (Excel upload)
 *     tags: [Clerical Assistant]
 *     security:
 *       - bearerAuth: []
 */
router.post(
  "/addMedicineBulk",
  authenticate,
  authorize(ROLES.CLERICAL_ASSISTANT),
  upload.single("file"),
  InventoryController.bulkAddMedicinesFromExcel
);

/**
 * @swagger
 * /api/clerical_assistant/getBatches:
 *   get:
 *     summary: Get all batches
 *     tags: [Clerical Assistant]
 *     security:
 *       - bearerAuth: []
 */
router.get(
  "/getBatches",
  authenticate,
  authorize(ROLES.CLERICAL_ASSISTANT),
  InventoryController.getBatches
);

/* ===================== DASHBOARD ===================== */
/**
 * @swagger
 * /api/clerical_assistant/getDashboardCounts:
 *   get:
 *     summary: Get dashboard counts
 *     tags: [Clerical Assistant]
 *     security:
 *       - bearerAuth: []
 */
router.get(
  "/getDashboardCounts",
  authenticate,
  authorize(ROLES.CLERICAL_ASSISTANT),
  DashboardController.getDashboardCounts
);

/**
 * @swagger
 * /api/clerical_assistant/getAnalytics:
 *   get:
 *     summary: Get stock analytics
 *     tags: [Clerical Assistant]
 *     security:
 *       - bearerAuth: []
 */
router.get(
  "/getAnalytics",
  authenticate,
  authorize(ROLES.CLERICAL_ASSISTANT),
  DashboardController.getAllStockDetails
);

/**
 * @swagger
 * /api/clerical_assistant/dashboardMedicineCount:
 *   get:
 *     summary: Get total medicine stock count
 *     tags: [Clerical Assistant]
 *     security:
 *       - bearerAuth: []
 */
router.get(
  "/dashboardMedicineCount",
  authenticate,
  authorize(ROLES.CLERICAL_ASSISTANT),
  DashboardController.getMedicineTotalStock
);

export default router;

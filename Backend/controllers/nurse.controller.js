import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import pool from "../config/db.js";

export const nurseLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const [rows] = await pool.query(
      `
      SELECT
        n.nurse_id,
        n.name,
        u.user_id,
        u.password
      FROM nurse n
      JOIN users u ON n.user_id = u.user_id
      WHERE u.email = ?
      `,
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const nurse = rows[0];
    const isMatch = await bcrypt.compare(password, nurse.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // ✅ CREATE TOKEN
    const token = jwt.sign(
      { user_id: nurse.user_id, role: "NURSE" },
      "SECRET_KEY",
      { expiresIn: "1d" }
    );

    res.json({
      token,
      user: {
        nurse_id: nurse.nurse_id,
        user_id: nurse.user_id,
        name: nurse.name,
        role: "NURSE"
      }
    });
  } catch (err) {
    console.error("Nurse login error:", err);
    res.status(500).json({ message: "Login failed" });
  }
};


  /**
   * ======================
   * GET NURSE PROFILE BY USER ID
   * GET /api/nurse/user/:user_id
   * ======================
   */
  export const getNurseByUserId = async (req, res) => {
    const { user_id } = req.params;

    const [rows] = await pool.query(
      `SELECT * FROM nurse WHERE user_id = ?`,
      [user_id]
    );

    res.json(rows[0]);
  };

  /**
   * ======================
   * GET NURSE TASKS
   * GET /api/nurse/:nurse_id/tasks
   * ======================
   */
  export const getNurseTasks = async (req, res) => {
    const { nurse_id } = req.params;

    const [rows] = await pool.query(
      `
      SELECT 
        nt.task_id,
        nt.task_type,
        nt.status,
        v.visit_date,
        v.reason,
        v.doctor_id,
        v.patient_id
      FROM nurse_task nt
      JOIN visit v ON nt.visit_id = v.visit_id
      WHERE nt.nurse_id = ?
      ORDER BY nt.created_at DESC
      `,
      [nurse_id]
    );

    res.json(rows);
  };

  /**
   * ======================
   * GET TASK DETAILS
   * GET /api/nurse/task/:task_id/details
   * ======================
   */
  export const getTaskDetails = async (req, res) => {
    const { task_id } = req.params;

    const [rows] = await pool.query(
      `
      SELECT 
        m.name AS medicine_name,
        ntd.dosage,
        ntd.route,
        ntd.remarks
      FROM nurse_task_details ntd
      LEFT JOIN medicine m ON ntd.medicine_id = m.medicine_id
      WHERE ntd.task_id = ?
      `,
      [task_id]
    );

    res.json(rows);
  };

  /**
   * ======================
   * COMPLETE TASK
   * POST /api/nurse/task/:task_id/complete
   * ======================
   */
  export const completeTask = async (req, res) => {
    const { task_id } = req.params;
    const { nurse_id, observation } = req.body;

    await pool.query(
      `
      INSERT INTO nurse_transaction
      (nurse_txn_id, task_id, nurse_id, status, observation)
      VALUES (UUID(), ?, ?, 'COMPLETED', ?)
      `,
      [task_id, nurse_id, observation || null]
    );

    await pool.query(
      `
      UPDATE nurse_task
      SET status = 'COMPLETED'
      WHERE task_id = ?
      `,
      [task_id]
    );

    res.json({ message: 'Task completed' });
  };

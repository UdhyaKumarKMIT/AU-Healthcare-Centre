// src/services/labtech.service.js
import pool from '../config/db.js';
import ApiError from '../utils/ApiError.js';

export const getLabTechStats = async (timeRange = 'today') => {
  try {
    let dateFilter = 'CURDATE()';
    
    switch(timeRange) {
      case 'week':
        dateFilter = 'DATE_SUB(CURDATE(), INTERVAL 7 DAY)';
        break;
      case 'month':
        dateFilter = 'DATE_SUB(CURDATE(), INTERVAL 30 DAY)';
        break;
      default:
        dateFilter = 'CURDATE()';
    }
    
    // Get total tests
    const [totalTests] = await pool.execute(`
      SELECT COUNT(*) as total
      FROM lab_tests
      WHERE ordered_date >= ${dateFilter}
    `);
    
    // Get pending tests (tests without results)
    const [pendingTests] = await pool.execute(`
      SELECT COUNT(*) as count
      FROM lab_tests
      WHERE result IS NULL OR result = ''
    `);
    
    // Get completed tests (tests with results)
    const [completedTests] = await pool.execute(`
      SELECT COUNT(*) as count
      FROM lab_tests
      WHERE result IS NOT NULL AND result != ''
    `);
    
    // Get completed today
    const [completedToday] = await pool.execute(`
      SELECT COUNT(*) as count
      FROM lab_tests
      WHERE result IS NOT NULL 
      AND result != ''
      AND DATE(ordered_date) = CURDATE()
    `);
    
    // Get tests this month
    const [testsMonth] = await pool.execute(`
      SELECT COUNT(*) as count
      FROM lab_tests
      WHERE MONTH(ordered_date) = MONTH(CURDATE())
      AND YEAR(ordered_date) = YEAR(CURDATE())
    `);
    
    // Calculate completion rate
    const total = totalTests[0].total || 0;
    const completed = completedTests[0].count || 0;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    // Get recent activity (last 10 tests with results)
    const [recentActivity] = await pool.execute(`
      SELECT 
        lt.lab_test_id,
        lt.test_name,
        lt.ordered_date,
        lt.result,
        p.name as patient_name
      FROM lab_tests lt
      LEFT JOIN visit v ON lt.visit_id = v.visit_id
      LEFT JOIN patient_profile p ON v.patient_id = p.patient_id
      WHERE lt.result IS NOT NULL AND lt.result != ''
      ORDER BY lt.ordered_date DESC
      LIMIT 10
    `);
    
    // Format recent activity
    const formattedActivity = recentActivity.map(activity => ({
      type: 'completed',
      description: `Completed ${activity.test_name} for ${activity.patient_name || 'Unknown Patient'}`,
      timestamp: activity.ordered_date
    }));
    
    return {
      totalTests: total,
      pendingTests: pendingTests[0].count || 0,
      inProgress: 0,
      completedToday: completedToday[0].count || 0,
      urgentTests: 0,
      samplesCollected: total,
      avgTurnaroundTime: '2.5',
      testsThisMonth: testsMonth[0].count || 0,
      completionRate,
      recentActivity: formattedActivity
    };
    
  } catch (error) {
    console.error('Error fetching lab tech stats:', error);
    throw new ApiError(500, 'Failed to fetch lab tech statistics: ' + error.message);
  }
};

export const getAllLabTests = async ({ status, priority, search }) => {
  try {
    let query = `
      SELECT 
        lt.lab_test_id as testId,
        lt.visit_id as visitId,
        lt.test_name as testName,
        lt.ordered_date as orderedDate,
        lt.result,
        lt.normal_range as normalRange,
        p.name as patientName,
        p.roll_no as patientRollNo,
        p.dob,
        p.gender,
        p.phone as patientPhone,
        d.name as doctorName,
        CASE 
          WHEN lt.result IS NULL OR lt.result = '' THEN 'pending'
          ELSE 'completed'
        END as status,
        'normal' as priority
      FROM lab_tests lt
      LEFT JOIN visit v ON lt.visit_id = v.visit_id
      LEFT JOIN patient_profile p ON v.patient_id = p.patient_id
      LEFT JOIN doctor d ON v.doctor_id = d.doctor_id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (status && status !== 'all') {
      if (status === 'pending') {
        query += ` AND (lt.result IS NULL OR lt.result = '')`;
      } else if (status === 'completed') {
        query += ` AND lt.result IS NOT NULL AND lt.result != ''`;
      }
    }
    
    if (search) {
      query += ` AND (
        lt.test_name LIKE ? OR 
        p.name LIKE ? OR 
        p.roll_no LIKE ? OR 
        lt.lab_test_id LIKE ?
      )`;
      const searchParam = `%${search}%`;
      params.push(searchParam, searchParam, searchParam, searchParam);
    }
    
    query += ` ORDER BY lt.ordered_date DESC`;
    
    const [tests] = await pool.execute(query, params);
    return tests;
    
  } catch (error) {
    console.error('Error fetching lab tests:', error);
    throw new ApiError(500, 'Failed to fetch lab tests: ' + error.message);
  }
};

export const getLabTestById = async (testId) => {
  try {
    const [tests] = await pool.execute(`
      SELECT 
        lt.lab_test_id as testId,
        lt.visit_id as visitId,
        lt.test_name as testName,
        lt.ordered_date as orderedDate,
        lt.result,
        lt.normal_range as normalRange,
        p.patient_id as patientId,
        p.name as patientName,
        p.roll_no as patientRollNo,
        p.dob,
        p.gender,
        p.blood_group as bloodGroup,
        p.phone as patientPhone,
        p.emergency_contact as emergencyContact,
        d.doctor_id as doctorId,
        d.name as doctorName,
        d.specialization,
        v.visit_date as visitDate,
        v.reason as visitReason,
        CASE 
          WHEN lt.result IS NULL OR lt.result = '' THEN 'pending'
          ELSE 'completed'
        END as status
      FROM lab_tests lt
      LEFT JOIN visit v ON lt.visit_id = v.visit_id
      LEFT JOIN patient_profile p ON v.patient_id = p.patient_id
      LEFT JOIN doctor d ON v.doctor_id = d.doctor_id
      WHERE lt.lab_test_id = ?
    `, [testId]);
    
    if (tests.length === 0) {
      throw new ApiError(404, 'Lab test not found');
    }
    
    return tests[0];
    
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    console.error('Error fetching lab test:', error);
    throw new ApiError(500, 'Failed to fetch lab test: ' + error.message);
  }
};

export const submitTestResults = async (testId, { result, normal_range }) => {
  try {
    const [existing] = await pool.execute(
      `SELECT lab_test_id FROM lab_tests WHERE lab_test_id = ?`,
      [testId]
    );
    
    if (existing.length === 0) {
      throw new ApiError(404, 'Lab test not found');
    }
    
    await pool.execute(`
      UPDATE lab_tests 
      SET 
        result = ?,
        normal_range = ?
      WHERE lab_test_id = ?
    `, [result, normal_range || null, testId]);
    
    return await getLabTestById(testId);
    
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    console.error('Error submitting test results:', error);
    throw new ApiError(500, 'Failed to submit test results: ' + error.message);
  }
};

export const getAllLabTechnicians = async () => {
  try {
    const [technicians] = await pool.execute(`
      SELECT 
        lt.lab_technician_id as technicianId,
        lt.user_id as userId,
        lt.name,
        lt.phone,
        lt.specialization,
        lt.status,
        lt.created_at as createdAt,
        u.email
      FROM lab_technician lt
      LEFT JOIN users u ON lt.user_id = u.user_id
      ORDER BY lt.name ASC
    `);
    
    return technicians;
    
  } catch (error) {
    console.error('Error fetching lab technicians:', error);
    throw new ApiError(500, 'Failed to fetch lab technicians: ' + error.message);
  }
};
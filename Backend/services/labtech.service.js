// src/services/labtech.service.js
import {
  LabTask,
  LabTest,
  Visit,
  Patient,
  Doctor,
  User,
  sequelize
} from '../models/sequelize/index.js';
import { Op } from 'sequelize';
import ApiError from '../utils/ApiError.js';

export const getLabTechStats = async (timeRange = 'today') => {
  try {
    let dateFilter = new Date();
    dateFilter.setHours(0, 0, 0, 0);
    
    switch(timeRange) {
      case 'week':
        dateFilter.setDate(dateFilter.getDate() - 7);
        break;
      case 'month':
        dateFilter.setDate(dateFilter.getDate() - 30);
        break;
      default:
        // today - already set to start of day
    }
    
    // Get total tests
    const totalTests = await LabTask.count({
      where: {
        assigned_at: {
          [Op.gte]: dateFilter
        }
      }
    });
    
    // Get pending tests
    const pendingTests = await LabTask.count({
      where: {
        status: 'PENDING'
      }
    });
    
    // Get completed tests
    const completedTests = await LabTask.count({
      where: {
        status: 'COMPLETED'
      }
    });
    
    // Get completed today
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    
    const completedToday = await LabTask.count({
      where: {
        status: 'COMPLETED',
        completed_at: {
          [Op.gte]: todayStart
        }
      }
    });
    
    // Get tests this month
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);
    
    const testsMonth = await LabTask.count({
      where: {
        assigned_at: {
          [Op.gte]: monthStart
        }
      }
    });
    
    // Calculate completion rate
    const completionRate = totalTests > 0 ? Math.round((completedTests / totalTests) * 100) : 0;
    
    // Get recent activity (last 10 completed tests)
    const recentActivity = await LabTask.findAll({
      where: {
        status: 'COMPLETED'
      },
      include: [
        {
          model: LabTest,
          attributes: ['test_name', 'test_type']
        },
        {
          model: Visit,
          attributes: ['visit_id'],
          include: [{
            model: Patient,
            attributes: ['name']
          }]
        }
      ],
      order: [['completed_at', 'DESC']],
      limit: 10
    });
    
    // Format recent activity
    const formattedActivity = recentActivity.map(activity => ({
      type: 'completed',
      description: `Completed ${activity.LabTest?.test_name || 'Unknown Test'} (${activity.LabTest?.test_type || 'N/A'}) for ${activity.Visit?.Patient?.name || 'Unknown Patient'}`,
      timestamp: activity.completed_at || activity.assigned_at
    }));
    
    return {
      totalTests,
      pendingTests,
      inProgress: 0,
      completedToday,
      urgentTests: 0,
      samplesCollected: totalTests,
      avgTurnaroundTime: '2.5',
      testsThisMonth: testsMonth,
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
    const whereClause = {};
    
    if (status && status !== 'all') {
      whereClause.status = status.toUpperCase();
    }
    
    if (priority && priority !== 'all') {
      whereClause.priority = priority.toLowerCase();
    }
    
    const includeClause = [
      {
        model: LabTest,
        attributes: ['test_name', 'test_type'],
        where: search ? {
          test_name: {
            [Op.like]: `%${search}%`
          }
        } : undefined
      },
      {
        model: Visit,
        attributes: ['visit_date', 'reason'],
        include: [{
          model: Patient,
          attributes: ['name', 'reg_number', 'dob', 'gender', 'phone'],
          where: search ? {
            [Op.or]: [
              { name: { [Op.like]: `%${search}%` } },
              { reg_number: { [Op.like]: `%${search}%` } }
            ]
          } : undefined,
          required: false
        }],
        required: false
      },
      {
        model: Doctor,
        as: 'assignedByDoctor',
        attributes: ['name', 'specialization'],
        where: search ? {
          name: {
            [Op.like]: `%${search}%`
          }
        } : undefined,
        required: false
      }
    ];
    
    const tests = await LabTask.findAll({
      where: whereClause,
      include: includeClause,
      order: [['assigned_at', 'DESC']]
    });
    
    // Transform results to match frontend expectations
    const formattedTests = tests.map(test => ({
      testId: test.id,
      visitId: test.visit_id,
      testName: test.LabTest?.test_name,
      testType: test.LabTest?.test_type,
      orderedDate: test.assigned_at,
      completedDate: test.completed_at,
      result: test.result,
      normalRange: test.normal_range,
      instructions: test.instructions,
      status: test.status,
      priority: test.priority,
      patientName: test.Visit?.Patient?.name,
      patientRollNo: test.Visit?.Patient?.reg_number,
      dob: test.Visit?.Patient?.dob,
      gender: test.Visit?.Patient?.gender,
      patientPhone: test.Visit?.Patient?.phone,
      doctorName: test.assignedByDoctor?.name,
      doctorSpecialization: test.assignedByDoctor?.specialization
    }));
    
    return formattedTests;
    
  } catch (error) {
    console.error('Error fetching lab tests:', error);
    throw new ApiError(500, 'Failed to fetch lab tests: ' + error.message);
  }
};

export const getLabTestById = async (testId) => {
  try {
    const test = await LabTask.findByPk(testId, {
      include: [
        {
          model: LabTest,
          attributes: ['lab_test_id', 'test_name', 'test_type']
        },
        {
          model: Visit,
          attributes: ['visit_date', 'reason'],
          include: [{
            model: Patient,
            attributes: ['patient_id', 'name', 'reg_number', 'dob', 'gender', 'blood_group', 'phone', 'email']
          }]
        },
        {
          model: Doctor,
          as: 'assignedByDoctor',
          attributes: ['doctor_id', 'name', 'specialization']
        },
        {
          model: User,
          as: 'completedBy',
          attributes: ['username'],
          required: false
        }
      ]
    });
    
    if (!test) {
      throw new ApiError(404, 'Lab test not found');
    }
    
    // Transform to match frontend expectations
    return {
      testId: test.id,
      visitId: test.visit_id,
      labTestId: test.LabTest?.lab_test_id,
      testName: test.LabTest?.test_name,
      testType: test.LabTest?.test_type,
      orderedDate: test.assigned_at,
      completedDate: test.completed_at,
      result: test.result,
      normalRange: test.normal_range,
      instructions: test.instructions,
      status: test.status,
      priority: test.priority,
      patientId: test.Visit?.Patient?.patient_id,
      patientName: test.Visit?.Patient?.name,
      patientRollNo: test.Visit?.Patient?.reg_number,
      dob: test.Visit?.Patient?.dob,
      gender: test.Visit?.Patient?.gender,
      bloodGroup: test.Visit?.Patient?.blood_group,
      patientPhone: test.Visit?.Patient?.phone,
      patientEmail: test.Visit?.Patient?.email,
      doctorId: test.assignedByDoctor?.doctor_id,
      doctorName: test.assignedByDoctor?.name,
      specialization: test.assignedByDoctor?.specialization,
      visitDate: test.Visit?.visit_date,
      visitReason: test.Visit?.reason,
      completedByName: test.completedBy?.username
    };
    
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    console.error('Error fetching lab test:', error);
    throw new ApiError(500, 'Failed to fetch lab test: ' + error.message);
  }
};

export const submitTestResults = async (testId, { result, normal_range }, userId) => {
  try {
    const labTask = await LabTask.findByPk(testId);
    
    if (!labTask) {
      throw new ApiError(404, 'Lab test task not found');
    }
    
    await labTask.update({
      result,
      normal_range: normal_range || null,
      status: 'COMPLETED',
      completed_at: new Date(),
      completed_by_user_id: userId
    });
    
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
    const technicians = await User.findAll({
      where: {
        role: 'LAB_TECHNICIAN'
      },
      attributes: ['user_id', 'username', 'email', 'role', 'created_at'],
      order: [['username', 'ASC']]
    });
    
    // Transform to match frontend expectations
    const formattedTechnicians = technicians.map(tech => ({
      technicianId: tech.user_id,
      userId: tech.user_id,
      name: tech.username,
      email: tech.email,
      role: tech.role,
      createdAt: tech.created_at
    }));
    
    return formattedTechnicians;
    
  } catch (error) {
    console.error('Error fetching lab technicians:', error);
    throw new ApiError(500, 'Failed to fetch lab technicians: ' + error.message);
  }
};
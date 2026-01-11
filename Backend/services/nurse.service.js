import { 
  NurseTask, 
  NurseTransaction, 
  NurseStock,
  DressingStock,
  Visit, 
  Patient, 
  Doctor,
  NurseTaskMaster,
  StaffDetails,
  SystemAuditLog,
  sequelize 
} from '../models/sequelize/index.js';
import { Op } from 'sequelize';
import ApiError from '../utils/ApiError.js';

// Get all tasks for a nurse (by staff code or staff_id)
export const getNurseTasks = async (staff_code) => {
  const tasks = await NurseTask.findAll({
    include: [
      {
        model: Visit,
        include: [
          {
            model: Patient,
            attributes: ['patient_id', 'name', 'phone', 'patient_type', 'allergic_to']
          },
          {
            model: Doctor,
            attributes: ['doctor_id', 'name', 'specialization']
          }
        ]
      },
      {
        model: NurseTaskMaster,
        attributes: ['task_name']
      }
    ],
    order: [['assigned_at', 'DESC']]
  });

  return tasks.map(task => ({
    task_id: task.task_id,
    task_type: task.NurseTaskMaster?.task_name || 'General Task',
    task_type_id: task.task_type_id,
    status: task.status,
    instructions: task.instructions,
    assigned_at: task.assigned_at,
    completed_at: task.completed_at,
    visit_id: task.visit_id,
    visit_date: task.Visit?.visit_date,
    reason: task.Visit?.reason,
    patient_id: task.Visit?.Patient?.patient_id,
    patient_name: task.Visit?.Patient?.name,
    patient_allergies: task.Visit?.Patient?.allergic_to,
    doctor_id: task.Visit?.Doctor?.doctor_id,
    doctor_name: task.Visit?.Doctor?.name
  }));
};

// Get task details with medication info
export const getTaskDetails = async (task_id) => {
  const task = await NurseTask.findByPk(task_id, {
    include: [
      {
        model: Visit,
        include: [
          {
            model: Patient,
            attributes: ['patient_id', 'name', 'phone', 'allergic_to']
          },
          {
            model: Doctor,
            attributes: ['doctor_id', 'name', 'specialization']
          }
        ]
      },
      {
        model: NurseTaskMaster,
        attributes: ['task_name']
      }
    ]
  });

  if (!task) {
    throw new ApiError(404, 'Task not found');
  }

  // Parse instructions (assumed to be JSON with medication details)
  let medicationDetails = [];
  try {
    if (task.instructions) {
      const parsed = JSON.parse(task.instructions);
      if (Array.isArray(parsed)) {
        medicationDetails = parsed;
      } else if (parsed.medications) {
        medicationDetails = parsed.medications;
      }
    }
  } catch (e) {
    // Instructions is plain text
    medicationDetails = [{ remarks: task.instructions }];
  }

  return {
    task_id: task.task_id,
    task_type: task.NurseTaskMaster?.task_name,
    status: task.status,
    instructions: task.instructions,
    assigned_at: task.assigned_at,
    visit: {
      visit_id: task.Visit?.visit_id,
      visit_date: task.Visit?.visit_date,
      reason: task.Visit?.reason
    },
    patient: {
      patient_id: task.Visit?.Patient?.patient_id,
      name: task.Visit?.Patient?.name,
      phone: task.Visit?.Patient?.phone,
      allergies: task.Visit?.Patient?.allergic_to
    },
    doctor: {
      doctor_id: task.Visit?.Doctor?.doctor_id,
      name: task.Visit?.Doctor?.name,
      specialization: task.Visit?.Doctor?.specialization
    },
    medications: medicationDetails
  };
};

// Get completed task details
export const getCompletedTaskDetails = async (task_id) => {
  console.log('🔍 [GET COMPLETED DETAILS] Fetching for task_id:', task_id);
  
  try {
    const task = await NurseTask.findByPk(task_id, {
      include: [
        {
          model: Visit,
          include: [
            {
              model: Patient,
              attributes: ['patient_id', 'name', 'phone', 'allergic_to']
            }
          ]
        },
        {
          model: NurseTaskMaster,
          attributes: ['task_name']
        },
        {
          model: NurseTransaction,
          required: false
        }
      ]
    });

    if (!task) {
      console.log('❌ [GET COMPLETED DETAILS] Task not found');
      throw new ApiError(404, 'Task not found');
    }

    console.log('✅ [GET COMPLETED DETAILS] Task found:', {
      task_id: task.task_id,
      status: task.status,
      has_transactions: !!task.NurseTransactions,
      transactions_count: task.NurseTransactions?.length
    });

    // Get the most recent transaction
    const transaction = task.NurseTransactions?.[0] || null;
    
    console.log('🔍 [GET COMPLETED DETAILS] Transaction:', transaction ? 'FOUND' : 'NOT FOUND');

    // Get staff details separately if we have a performed_by_code
    let completedByName = 'Unknown';
    if (transaction?.performed_by_code) {
      try {
        const staff = await StaffDetails.findOne({
          where: { code: transaction.performed_by_code },
          attributes: ['name']
        });
        completedByName = staff?.name || transaction.performed_by_code;
      } catch (e) {
        console.error('❌ [GET COMPLETED DETAILS] Error fetching staff:', e);
        completedByName = transaction.performed_by_code;
      }
    }

    // Parse JSON fields safely
    let medicationsUsed = [];
    let ecgReportData = null;
    
    if (transaction) {
      try {
        if (transaction.medications_used) {
          medicationsUsed = typeof transaction.medications_used === 'string' 
            ? JSON.parse(transaction.medications_used) 
            : transaction.medications_used;
        }
      } catch (e) {
        console.error('❌ [GET COMPLETED DETAILS] Error parsing medications_used:', e);
      }
      
      try {
        if (transaction.ecg_report) {
          ecgReportData = typeof transaction.ecg_report === 'string'
            ? JSON.parse(transaction.ecg_report)
            : transaction.ecg_report;
        }
      } catch (e) {
        console.error('❌ [GET COMPLETED DETAILS] Error parsing ecg_report:', e);
      }
    }

    const result = {
      task_id: task.task_id,
      task_type: task.NurseTaskMaster?.task_name,
      status: task.status,
      completed_at: task.completed_at,
      patient: {
        patient_id: task.Visit?.Patient?.patient_id,
        name: task.Visit?.Patient?.name,
        phone: task.Visit?.Patient?.phone,
        allergies: task.Visit?.Patient?.allergic_to
      },
      observation: transaction?.remarks || null,
      remarks: transaction?.additional_remarks || null,
      medications_used: medicationsUsed,
      ecg_report: ecgReportData,
      completed_by: completedByName
    };

    console.log('✅ [GET COMPLETED DETAILS] Returning result:', {
      has_observation: !!result.observation,
      has_medications: result.medications_used?.length > 0,
      has_ecg_report: !!result.ecg_report,
      completed_by: result.completed_by
    });

    return result;
  } catch (error) {
    console.error('❌ [GET COMPLETED DETAILS] Error:', error);
    throw error;
  }
};

// Complete task with stock reduction
export const completeTask = async ({
  task_id,
  staff_code,
  observation,
  medications_used,
  remarks,
  ecg_report
}) => {
  return await sequelize.transaction(async (t) => {

    let StockModel = null

    // Verify staff member exists
    const staff = await StaffDetails.findOne({
      where: { code: staff_code, role: 'NURSE_RECEPTIONIST', status: 'ACTIVE' },
      transaction: t
    });

    if (!staff) {
      throw new ApiError(404, 'Staff member not found');
    }

    // Get task
    const task = await NurseTask.findByPk(task_id, {
    include: [{ model: NurseTaskMaster }, { model: Visit }],
    transaction: t
    });


    if (!task) {
      throw new ApiError(404, 'Task not found');
    }

    if (task.status === 'COMPLETED') {
      throw new ApiError(400, 'Task already completed');
    }

    // Determine stock type based on task type
    const taskName = task.NurseTaskMaster.task_name.toUpperCase()
    const isECG = taskName.includes('ECG')
    const isDressing = taskName.includes('DRESSING') || taskName.includes('WOUND')

    if (isECG && medications_used?.length)
      throw new ApiError(400,'ECG task cannot use medicines')

    if (!isECG && ecg_report)
      throw new ApiError(400,'ECG report allowed only for ECG task')

    if (isECG) StockModel = null
    else StockModel = isDressing ? DressingStock : NurseStock


    // Reduce stock for each medication used
    if (!isECG && medications_used?.length && medications_used && Array.isArray(medications_used) && medications_used.length > 0) {
      for (const med of medications_used) {
        const { medicine_id, batch_no, quantity } = med;

        if (!medicine_id || !batch_no || !quantity) {
          throw new ApiError(400, 'Invalid medication data');
        }

        // Find stock entry
      const stock = await StockModel.findOne({
        where: { medicine_id, batch_no },
        transaction: t,
        lock: t.LOCK.UPDATE
      })

      if (!stock) throw new ApiError(404,'Stock not found for selected item')
      if (stock.quantity < quantity) throw new ApiError(400,'Insufficient stock for selected item')

      await stock.update({ quantity: stock.quantity - quantity }, { transaction: t })



        // Delete if stock is 0
        if (stock.quantity === quantity) {
          await stock.destroy({ transaction: t });
        }
      }
    }

    // Create transaction record
    await NurseTransaction.create({
      task_id,
      performed_by_code: staff_code,
      performed_at: new Date(),
      remarks: observation || 'Task completed',
      additional_remarks: remarks,
      medications_used: isECG ? null : (medications_used?.length ? JSON.stringify(medications_used) : null),
      ecg_report: isECG ? (ecg_report ? JSON.stringify(ecg_report) : null) : null,
      status: 'COMPLETED'
    }, { transaction: t });

    // Update task status
    await task.update({ 
        status: 'COMPLETED',
        completed_at: new Date()
    }, { transaction: t });


    // Log in system audit
    await SystemAuditLog.create({
      actor_code: staff_code,
      actor_role: 'NURSE_RECEPTIONIST',
      action: 'COMPLETE_TASK',
      entity_type: 'NURSE_TASK',
      entity_id: task_id,
      new_value: { medications_used, observation, ecg_report },
      remarks: `Task completed: ${task.NurseTaskMaster?.task_name}`
    }, { transaction: t });

    return {
      message: 'Task completed successfully',
      task_id,
      medications_reduced: medications_used?.length || 0
    };
  });
};

// Get available stock for nurse/dressing
export const getAvailableStock = async (stock_type = 'NURSE') => {
  const StockModel = stock_type === 'DRESSING' ? DressingStock : NurseStock;

  const stock = await StockModel.findAll({ where:{ quantity:{[Op.gt]:0}}, order:[['expiry','ASC']] })


  return stock.map(s => ({
    sub_stock_id: s.sub_stock_id,
    medicine_id: s.medicine_id,
    medicine_name: s.Medicine?.name,
    medicine_type: s.Medicine?.type,
    batch_no: s.batch_no,
    expiry: s.expiry,
    quantity: s.quantity
  }));
};

// Verify staff code - WITH DEBUGGING
export const verifyStaffCode = async (secret_code) => {
  console.log('🔍 [VERIFY CODE] Received secret_code:', secret_code);
  console.log('🔍 [VERIFY CODE] Type:', typeof secret_code);
  console.log('🔍 [VERIFY CODE] Is undefined?', secret_code === undefined);
  console.log('🔍 [VERIFY CODE] Is null?', secret_code === null);
  console.log('🔍 [VERIFY CODE] Is empty string?', secret_code === '');
  
  if (!secret_code) {
    console.log('❌ [VERIFY CODE] Secret code is falsy, returning false');
    return false;
  }

  try {
    const staff = await StaffDetails.findOne({
      where: { 
        code: secret_code,
        role: 'NURSE_RECEPTIONIST',
        status: 'ACTIVE'
      }
    });

    console.log('🔍 [VERIFY CODE] Database query result:', staff ? 'FOUND' : 'NOT FOUND');
    
    if (staff) {
      console.log('✅ [VERIFY CODE] Valid staff found:', {
        name: staff.name,
        code: staff.code,
        role: staff.role
      });
    } else {
      console.log('❌ [VERIFY CODE] No matching staff in database');
      console.log('🔍 [VERIFY CODE] Query was: code =', secret_code, ', role = NURSE_RECEPTIONIST, status = ACTIVE');
    }

    return !!staff;
  } catch (error) {
    console.error('❌ [VERIFY CODE] Database error:', error);
    return false;
  }
};
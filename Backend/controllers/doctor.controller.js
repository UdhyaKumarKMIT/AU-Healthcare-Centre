import * as doctorService from '../services/doctor.service.js';

/**
 * Retrieves the active visit queue for a specific doctor
 * Returns patients currently assigned to the doctor with status CHECKED_IN or IN_CONSULTATION
 */
export const getDoctorQueue = async (req, res, next) => {
  try {
    const { doctorId } = req.params;

    if (!doctorId) {
      return res.status(400).json({
        success: false,
        message: 'doctorId parameter is required'
      });
    }

    const visits = await doctorService.getActiveDoctorVisits(doctorId);

    res.json({
      success: true,
      count: visits.length,
      data: visits
    });
  } catch (e) {
    console.error('❌ Error fetching doctor queue:', e);
    next(e);
  }
};

export const getDoctorVisits = async (req, res, next) => {
  try {
    const doctor_id = req.query.doctor_id;

    if (!doctor_id) {
      return res.status(400).json({
        success: false,
        message: 'doctor_id query parameter is required'
      });
    }

    const visits = await doctorService.getActiveDoctorVisits(doctor_id);

    res.json({
      success: true,
      data: visits
    });
  } catch (e) {
    console.error('❌ Error:', e);
    next(e);
  }
};

/**
 * Retrieves complete medical history for a patient
 * Includes past visits, diagnoses, prescriptions, and vitals
 */
export const getPatientHistory = async (req, res, next) => {
  try {
    const { patient_id } = req.params;

    if (!patient_id) {
      return res.status(400).json({
        success: false,
        message: 'patient_id parameter is required'
      });
    }

    const history = await doctorService.getPatientHistory(patient_id);

    res.json({
      success: true,
      data: history
    });
  } catch (e) {
    console.error('❌ Error fetching patient history:', e);
    next(e);
  }
};

export const searchMedicines = async (req, res, next) => {
  try {
    const { search } = req.query;

    const medicines = await doctorService.searchMedicines(search);

    res.json({
      success: true,
      data: medicines
    });
  } catch (e) {
    console.error('❌ Error searching medicines:', e);
    next(e);
  }
};

export const getAvailableNurses = async (req, res, next) => {
  try {
    const nurses = await doctorService.getAvailableNurses();

    res.json({
      success: true,
      nurses: nurses,
      count: nurses.length
    });
  } catch (e) {
    console.error('❌ Error fetching nurses:', e);
    next(e);
  }
};

/**
 * Creates prescription with nurse tasks for injectable medicines (injections/drips)
 * This handles both regular medicines and injectable medicines that require nurse administration
 * - Regular medicines → prescription items only
 * - External medicines → prescription items with "Others" medicine reference
 * - Injectable medicines → prescription items + nurse task assignments
 */
export const createPrescriptionWithTasks = async (req, res, next) => {
  try {
    const { visit_id, doctor_id, medicines } = req.body;

    if (!visit_id || !doctor_id) {
      return res.status(400).json({
        success: false,
        message: 'visit_id and doctor_id are required'
      });
    }

    if (!medicines || !Array.isArray(medicines) || medicines.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No medicines provided'
      });
    }

    const result = await doctorService.createPrescriptionWithTasks({
      visit_id,
      doctor_id,
      medicines
    });

    res.status(201).json({
      success: true,
      message: 'Prescription and nurse tasks created successfully',
      data: result
    });

  } catch (err) {
    console.error('❌ Error creating prescription with tasks:', err);
    next(err);
  }
};

/**
 * Adds a single diagnosis to a visit
 * Requires visit_id, doctor_id, diagnosis_name, and optionally complaints/remarks
 */
export const addDiagnosis = async (req, res, next) => {
  try {
    const { visit_id, doctor_id, diagnosis_name } = req.body;

    if (!visit_id || !doctor_id || !diagnosis_name) {
      return res.status(400).json({
        success: false,
        message: 'visit_id, doctor_id, and diagnosis_name are required'
      });
    }

    await doctorService.addDiagnosis(req.body);
    res.status(201).json({
      success: true,
      message: 'Diagnosis added successfully'
    });
  } catch (e) {
    console.error('❌ Error adding diagnosis:', e);
    next(e);
  }
};

/**
 * Adds multiple diagnoses to a visit in a single transaction
 * More efficient than calling addDiagnosis multiple times
 */
export const addMultipleDiagnoses = async (req, res, next) => {
  try {
    const { visit_id, doctor_id, diagnoses } = req.body;

    if (!visit_id || !doctor_id || !diagnoses) {
      return res.status(400).json({
        success: false,
        message: 'visit_id, doctor_id, and diagnoses are required'
      });
    }

    if (!Array.isArray(diagnoses) || diagnoses.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'diagnoses must be a non-empty array'
      });
    }

    const result = await doctorService.addMultipleDiagnoses({
      visit_id,
      doctor_id,
      diagnoses
    });

    res.status(201).json({
      success: true,
      message: `${result.count} diagnosis(es) added successfully`,
      data: result
    });
  } catch (e) {
    console.error('❌ Error adding multiple diagnoses:', e);
    next(e);
  }
};

export const getVisitDiagnoses = async (req, res, next) => {
  try {
    const { visit_id } = req.params;

    const diagnoses = await doctorService.getVisitDiagnoses(visit_id);

    res.json({
      success: true,
      count: diagnoses.length,
      diagnoses
    });
  } catch (e) {
    console.error('❌ Error fetching visit diagnoses:', e);
    next(e);
  }
};

/**
 * Creates a basic prescription without nurse tasks (for tablets, syrups, ointments, drops)
 * For injections/drips that require nurse tasks, use createPrescriptionWithTasks instead
 */
export const createPrescription = async (req, res, next) => {
  try {
    const { visit_id, doctor_id, medicines } = req.body;

    if (!visit_id || !doctor_id) {
      return res.status(400).json({
        success: false,
        message: 'visit_id and doctor_id are required'
      });
    }

    if (!medicines || !Array.isArray(medicines) || medicines.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No medicines provided'
      });
    }

    const result = await doctorService.createPrescription({
      visit_id,
      doctor_id,
      meds: medicines
    });

    res.status(201).json({
      success: true,
      message: 'Prescription created successfully',
      data: {
        prescription_id: result.prescription_id
      }
    });

  } catch (err) {
    console.error('❌ Error creating prescription:', err);
    next(err);
  }
};

/**
 * Updates the status of a visit
 * Valid statuses: CHECKED_IN, IN_CONSULTATION, COMPLETED, CANCELLED
 * Used for workflow management (e.g., starting consultation, cancelling visit)
 */
export const updateVisitStatus = async (req, res, next) => {
  try {
    const { visit_id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required in request body'
      });
    }

    const result = await doctorService.updateVisitStatus({
      visit_id,
      newStatus: status
    });

    res.json({
      success: true,
      message: `Visit status updated to ${status}`,
      data: result
    });
  } catch (e) {
    console.error('❌ Error updating visit status:', e);

    if (e.message.includes('Invalid status')) {
      return res.status(400).json({
        success: false,
        message: e.message
      });
    }

    if (e.message === 'Visit not found') {
      return res.status(404).json({
        success: false,
        message: 'Visit not found'
      });
    }

    next(e);
  }
};

/**
 * Marks a visit as completed and optionally logs referral remarks
 * This updates the visit status to COMPLETED and creates an audit log entry
 */
export const markVisitAsCompleted = async (req, res, next) => {
  try {
    const { visit_id } = req.params;
    const { remarks } = req.body;

    if (!visit_id) {
      return res.status(400).json({
        success: false,
        message: 'visit_id parameter is required'
      });
    }

    await doctorService.updateVisitStatus({
      visit_id,
      newStatus: 'COMPLETED'
    });

    // Log referral or completion remarks if provided
    if (remarks) {
      const { SystemAuditLog } = await import('../models/sequelize/index.js');
      const { randomUUID } = await import('crypto');

      await SystemAuditLog.create({
        log_id: randomUUID(),
        actor_user_id: req.user?.user_id || null,
        actor_role: req.user?.role || 'DOCTOR',
        action: 'COMPLETE_VISIT',
        entity_type: 'VISIT',
        entity_id: visit_id,
        remarks: remarks,
        ip_address: req.ip,
        user_agent: req.headers['user-agent'],
        created_at: new Date()
      });
    }

    res.json({
      success: true,
      message: remarks ? 'Visit completed with referral remarks' : 'Visit marked as completed'
    });
  } catch (e) {
    console.error('❌ Error marking visit as completed:', e);
    next(e);
  }
};

export const getTodayVisitsCount = async (req, res, next) => {
  try {
    const { doctor_id, date } = req.query;

    if (!doctor_id || !date) {
      return res.status(400).json({
        success: false,
        message: 'doctor_id and date parameters are required'
      });
    }

    const Visit = (await import('../models/sequelize/index.js')).Visit;
    const { Op } = await import('sequelize');
    const { isDateOnlyLikeString, parseLocalDateOnly } = await import('../utils/dateRange.js');

    const base = isDateOnlyLikeString(date) ? parseLocalDateOnly(date) : new Date(date);
    const startOfDay = new Date(base);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(base);
    endOfDay.setHours(23, 59, 59, 999);

    const count = await Visit.count({
      where: {
        doctor_id,
        visit_date: {
          [Op.between]: [startOfDay, endOfDay]
        }
      }
    });

    res.json({
      success: true,
      count: count,
      date: date,
      doctor_id: doctor_id
    });

  } catch (error) {
    console.error('❌ Error fetching today\'s visits:', error);
    next(error);
  }
};

export const getNurseTaskTypes = async (req, res, next) => {
  try {
    const taskTypes = await doctorService.getNurseTaskTypes();

    res.json({
      success: true,
      data: taskTypes
    });
  } catch (error) {
    console.error('Error fetching nurse task types:', error);
    next(error);
  }
};

export const createNurseTask = async (req, res, next) => {
  try {
    const { visit_id, doctor_id, task_type_id, instructions } = req.body;

    if (!visit_id || !doctor_id || !task_type_id) {
      return res.status(400).json({
        success: false,
        message: 'visit_id, doctor_id, and task_type_id are required'
      });
    }

    const task = await doctorService.createNurseTask(visit_id, doctor_id, task_type_id, instructions);

    res.json({
      success: true,
      data: task,
      message: 'Nurse task created successfully'
    });
  } catch (error) {
    console.error('Error creating nurse task:', error);
    next(error);
  }
};

export const getLabTests = async (req, res, next) => {
  try {
    const labTests = await doctorService.getLabTests();

    res.json({
      success: true,
      data: labTests
    });
  } catch (error) {
    console.error('Error fetching lab tests:', error);
    next(error);
  }
};

export const createLabTask = async (req, res, next) => {
  try {
    const { visit_id, doctor_id, lab_test_id, instructions } = req.body;

    if (!visit_id || !doctor_id || !lab_test_id) {
      return res.status(400).json({
        success: false,
        message: 'visit_id, doctor_id, and lab_test_id are required'
      });
    }

    const labTask = await doctorService.createLabTask(visit_id, doctor_id, lab_test_id, instructions);

    res.json({
      success: true,
      data: labTask,
      message: 'Lab test assigned successfully'
    });
  } catch (error) {
    console.error('Error creating lab task:', error);
    next(error);
  }
};

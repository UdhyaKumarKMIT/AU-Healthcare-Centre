import { 
  Visit, 
  Patient, 
  Doctor, 
  Diagnosis, 
  Prescription, 
  PrescriptionItem, 
  Medicine,
  Vitals,
  NurseTask,
  NurseTaskMaster,
  StaffDetails,
  User,
  SystemAuditLog,
  sequelize 
} from '../models/sequelize/index.js';
import { Op } from 'sequelize';
import ApiError from '../utils/ApiError.js';

// ============================================================================
// VISIT STATUS MANAGEMENT
// ============================================================================
export const updateVisitStatus = async ({ visit_id, newStatus }) => {
  const validStatuses = [
    'SCHEDULED',
    'ONGOING',
    'DIAGNOSED',
    'PRESCRIBED',
    'NURSING',
    'PHARMACY',
    'COMPLETED',
    'CANCELLED'
  ];

  if (!validStatuses.includes(newStatus)) {
    throw new ApiError(400, `Invalid status. Must be one of: ${validStatuses.join(', ')}`);
  }

  const visit = await Visit.findByPk(visit_id);
  if (!visit) {
    throw new ApiError(404, 'Visit not found');
  }

  await visit.update({ status: newStatus });

  return { success: true, visit_id, newStatus };
};

// ============================================================================
// DIAGNOSIS
// ============================================================================
export const addDiagnosis = async ({
  visit_id,
  doctor_id,
  diagnosis_code,
  diagnosis_name,
  diagnosis_notes,
}) => {
  // Validate visit exists
  const visit = await Visit.findByPk(visit_id);
  if (!visit) {
    throw new ApiError(404, 'Visit not found');
  }

  // Validate doctor exists
  const doctor = await Doctor.findByPk(doctor_id);
  if (!doctor) {
    throw new ApiError(404, 'Doctor not found');
  }

  const diagnosis = await Diagnosis.create({
    visit_id,
    doctor_id,
    complaints: diagnosis_notes, // Map to complaints field
    diagnosis_name,
    remarks: diagnosis_code ? `Code: ${diagnosis_code}` : null,
    created_at: new Date()
  });

  // Log in system audit
  await SystemAuditLog.create({
    actor_user_id: doctor.user_id,
    actor_role: 'DOCTOR',
    action: 'ADD_DIAGNOSIS',
    entity_type: 'DIAGNOSIS',
    entity_id: diagnosis.diagnosis_id,
    new_value: { diagnosis_name, diagnosis_code, diagnosis_notes },
    remarks: `Diagnosis added for visit ${visit_id}`
  });

  return diagnosis;
};

// ============================================================================
// ADD MULTIPLE DIAGNOSES (Batch)
// ============================================================================
export const addMultipleDiagnoses = async ({ visit_id, doctor_id, diagnoses }) => {
  return await sequelize.transaction(async (t) => {
    // Validate visit exists
    const visit = await Visit.findByPk(visit_id, { transaction: t });
    if (!visit) {
      throw new ApiError(404, 'Visit not found');
    }

    // Validate doctor exists
    const doctor = await Doctor.findByPk(doctor_id, { transaction: t });
    if (!doctor) {
      throw new ApiError(404, 'Doctor not found');
    }

    if (!Array.isArray(diagnoses) || diagnoses.length === 0) {
      throw new ApiError(400, 'Diagnoses array is required and must not be empty');
    }

    console.log(`🏥 Adding ${diagnoses.length} diagnoses for visit ${visit_id}`);

    const createdDiagnoses = [];

    for (const diag of diagnoses) {
      const { diagnosis_name, diagnosis_code, diagnosis_notes } = diag;

      if (!diagnosis_name) {
        throw new ApiError(400, 'Diagnosis name is required for each diagnosis');
      }

      const diagnosis = await Diagnosis.create({
        visit_id,
        doctor_id,
        complaints: diagnosis_notes || null,
        diagnosis_name,
        remarks: diagnosis_code ? `Code: ${diagnosis_code}` : null,
        created_at: new Date()
      }, { transaction: t });
      createdDiagnoses.push(diagnosis);
    }

    // Log in system audit
    await SystemAuditLog.create({
      actor_user_id: doctor.user_id,
      actor_role: 'DOCTOR',
      action: 'ADD_MULTIPLE_DIAGNOSES',
      entity_type: 'DIAGNOSIS',
      entity_id: createdDiagnoses[0].diagnosis_id,
      new_value: { count: diagnoses.length, diagnoses },
      remarks: `${diagnoses.length} diagnoses added for visit ${visit_id}`
    }, { transaction: t });

    console.log(`✅ Successfully created ${createdDiagnoses.length} diagnoses`);

    return {
      count: createdDiagnoses.length,
      diagnoses: createdDiagnoses
    };
  });
};

// ============================================================================
// GET DIAGNOSES FOR A VISIT
// ============================================================================
export const getVisitDiagnoses = async (visit_id) => {
  const diagnoses = await Diagnosis.findAll({
    where: { visit_id },
    attributes: ['diagnosis_id', 'diagnosis_name', 'complaints', 'remarks', 'created_at'],
    order: [['created_at', 'ASC']]
  });

  return diagnoses.map(d => ({
    id: d.diagnosis_id,
    diagnosis_name: d.diagnosis_name,
    diagnosis_code: d.remarks?.replace('Code: ', '') || null,
    diagnosis_notes: d.complaints,
    createdAt: d.created_at
  }));
};

// ============================================================================
// PRESCRIPTION
// ============================================================================
export const createPrescription = async ({ visit_id, doctor_id, meds }) => {
  return await sequelize.transaction(async (t) => {
    // Validate visit
    const visit = await Visit.findByPk(visit_id, { transaction: t });
    if (!visit) {
      throw new ApiError(404, 'Visit not found');
    }

    // Validate doctor
    const doctor = await Doctor.findByPk(doctor_id, { transaction: t });
    if (!doctor) {
      throw new ApiError(404, 'Doctor not found');
    }

    console.log('💊 Creating prescription with', meds.length, 'medicines');

    // Create prescription
    const prescription = await Prescription.create({
      visit_id,
      doctor_id,
      created_at: new Date(),
      updated_at: new Date()
    }, { transaction: t });

    // Create prescription items
    for (const med of meds) {
      // Validate medicine exists
      const medicine = await Medicine.findByPk(med.medicine_id, { transaction: t });
      if (!medicine) {
        throw new ApiError(404, `Medicine not found: ${med.medicine_id}`);
      }

      await PrescriptionItem.create({
        prescription_id: prescription.prescription_id,
        medicine_id: med.medicine_id,
        dosage_per_day: (med.morning ? 1 : 0) + (med.afternoon ? 1 : 0) + (med.night ? 1 : 0),
        duration_days: med.duration_days,
        quantity: med.duration_days * ((med.morning ? 1 : 0) + (med.afternoon ? 1 : 0) + (med.night ? 1 : 0)),
        is_external: false,
        external_notes: med.food ? `Take ${med.food} food` : null
      }, { transaction: t });
    }

    // Log in system audit
    await SystemAuditLog.create({
      actor_user_id: doctor.user_id,
      actor_role: 'DOCTOR',
      action: 'CREATE_PRESCRIPTION',
      entity_type: 'PRESCRIPTION',
      entity_id: prescription.prescription_id,
      new_value: { medicines_count: meds.length },
      remarks: `Prescription created for visit ${visit_id}`
    }, { transaction: t });

    console.log('✅ Prescription created:', prescription.prescription_id);

    return { prescription_id: prescription.prescription_id };
  });
};

// ============================================================================
// PRESCRIPTION WITH NURSE TASKS (for injections/drips)
// ============================================================================
export const createPrescriptionWithTasks = async ({ visit_id, doctor_id, medicines }) => {
  return await sequelize.transaction(async (t) => {
    const visit = await Visit.findByPk(visit_id, { transaction: t });
    if (!visit) {
      throw new ApiError(404, 'Visit not found');
    }

    const doctor = await Doctor.findByPk(doctor_id, { transaction: t });
    if (!doctor) {
      throw new ApiError(404, 'Doctor not found');
    }

    let nurseTasksCreated = 0;
    let prescriptionId = null;

    // Separate regular medicines and injectable medicines based on nurse_id presence
    const regularMeds = [];
    const injectableMeds = [];

    for (const med of medicines) {
      // Check if nurse_id is present - that indicates it needs nurse administration
      if (med.nurse_id && med.route) {
        injectableMeds.push(med);
      } else {
        regularMeds.push(med);
      }
    }

    console.log(`\ud83d\udc8a Processing ${regularMeds.length} regular meds, ${injectableMeds.length} injectable meds`);

    // Create regular prescription if there are non-injectable medicines
    if (regularMeds.length > 0) {
      const prescription = await Prescription.create({
        visit_id,
        doctor_id,
        created_at: new Date(),
        updated_at: new Date()
      }, { transaction: t });

      prescriptionId = prescription.prescription_id;

      for (const med of regularMeds) {
        const medicine = await Medicine.findByPk(med.medicine_id, { transaction: t });
        if (!medicine) {
          throw new ApiError(404, `Medicine not found: ${med.medicine_id}`);
        }

        const dosagePerDay = (med.morning ? 1 : 0) + (med.afternoon ? 1 : 0) + (med.night ? 1 : 0);
        await PrescriptionItem.create({
          prescription_id: prescription.prescription_id,
          medicine_id: med.medicine_id,
          dosage_per_day: dosagePerDay,
          duration_days: med.duration_days,
          quantity: med.duration_days * dosagePerDay,
          is_external: false,
          external_notes: med.food ? `Take ${med.food} food` : null
        }, { transaction: t });
      }
    }

    // Create nurse tasks for injectable medicines
    if (injectableMeds.length > 0) {
      // Get or create nurse task type
      const [taskType] = await NurseTaskMaster.findOrCreate({
        where: { task_name: 'Injectable Administration' },
        defaults: { task_name: 'Injectable Administration' },
        transaction: t
      });

      for (const med of injectableMeds) {
        const medicine = await Medicine.findByPk(med.medicine_id, { transaction: t });
        if (!medicine) {
          throw new ApiError(404, `Medicine not found: ${med.medicine_id}`);
        }

        // Validate nurse assignment
        if (!med.nurse_id) {
          throw new ApiError(400, `Nurse must be assigned for injectable: ${medicine.name}`);
        }

        const staff = await StaffDetails.findByPk(med.nurse_id, { transaction: t });
        if (!staff || staff.role !== 'NURSE_RECEPTIONIST') {
          throw new ApiError(404, 'Assigned nurse not found');
        }

        const instructions = {
          medicine_id: med.medicine_id,
          medicine_name: medicine.name,
          type: medicine.type,
          route: med.route || 'IV',
          infusion_duration: med.infusion_duration || null,
          duration_days: med.duration_days,
          assigned_nurse_code: staff.code
        };

        await NurseTask.create({
          visit_id,
          doctor_id,
          task_type_id: taskType.task_type_id,
          instructions: JSON.stringify(instructions),
          status: 'PENDING',
          assigned_at: new Date()
        }, { transaction: t });

        nurseTasksCreated++;
      }
    }

    // Log in system audit
    await SystemAuditLog.create({
      actor_user_id: doctor.user_id,
      actor_role: 'DOCTOR',
      action: 'CREATE_PRESCRIPTION_WITH_TASKS',
      entity_type: 'PRESCRIPTION',
      entity_id: prescriptionId,
      new_value: { 
        regular_medicines: regularMeds.length,
        injectable_medicines: injectableMeds.length,
        nurse_tasks: nurseTasksCreated 
      },
      remarks: `Prescription with ${nurseTasksCreated} nurse tasks created for visit ${visit_id}`
    }, { transaction: t });

    return { 
      prescription_id: prescriptionId, 
      nurse_tasks_created: nurseTasksCreated,
      regular_medicines: regularMeds.length,
      injectable_medicines: injectableMeds.length
    };
  });
};

// ============================================================================
// PATIENT QUEUE
// ============================================================================
export const getActiveDoctorVisits = async (doctor_id) => {
  const visits = await Visit.findAll({
    where: {
      doctor_id,
      status: {
        [Op.in]: ['SCHEDULED', 'ONGOING', 'DIAGNOSED', 'PRESCRIBED']
      }
    },
    include: [
      {
        model: Patient,
        attributes: ['patient_id', 'name', 'dob', 'gender', 'phone', 'patient_type', 'allergic_to']
      },
      {
        model: Doctor,
        attributes: ['doctor_id', 'name', 'specialization']
      },
      {
        model: Vitals,
        required: false,
        attributes: ['temperature', 'bp_systolic', 'bp_diastolic', 'heart_rate', 'cbg', 'spo2']
      }
    ],
    order: [['visit_date', 'ASC']]
  });

  // Helper function to calculate age from date of birth
  const calculateAge = (dob) => {
    if (!dob) return null;
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  return visits.map((v, index) => ({
    visit_id: v.visit_id,
    patient_id: v.patient_id,
    doctor_id: v.doctor_id,
    visit_date: v.visit_date,
    reason: v.reason,
    status: v.status,
    token_number: String(index + 1).padStart(3, '0'), // Generate token number
    patient_name: v.Patient?.name,
    patient_dob: v.Patient?.dob,
    age: calculateAge(v.Patient?.dob),
    gender: v.Patient?.gender,
    patient_gender: v.Patient?.gender,
    patient_phone: v.Patient?.phone,
    patient_type: v.Patient?.patient_type,
    patient_allergies: v.Patient?.allergic_to,
    blood_group: null, // Not in current schema
    chief_complaint: v.reason, // Alias for reason
    visit_type: 'OPD', // Default visit type
    doctor_name: v.Doctor?.name,
    doctor_specialization: v.Doctor?.specialization,
    vitals: v.Vital ? {
      temperature: v.Vital.temperature,
      bp_systolic: v.Vital.bp_systolic,
      bp_diastolic: v.Vital.bp_diastolic,
      heart_rate: v.Vital.heart_rate,
      cbg: v.Vital.cbg,
      spo2: v.Vital.spo2
    } : null
  }));
};

// ============================================================================
// PATIENT HISTORY
// ============================================================================
export const getPatientHistory = async (patient_id) => {
  // Get patient info
  const patient = await Patient.findByPk(patient_id, {
    attributes: ['patient_id', 'name', 'dob', 'gender', 'phone', 'patient_type', 'allergic_to']
  });

  if (!patient) {
    throw new ApiError(404, 'Patient not found');
  }

  // Get past visits with diagnoses
  const pastVisits = await Visit.findAll({
    where: {
      patient_id,
      status: {
        [Op.in]: ['COMPLETED', 'DIAGNOSED', 'PRESCRIBED', 'PHARMACY']
      }
    },
    include: [
      {
        model: Doctor,
        attributes: ['name', 'specialization']
      },
      {
        model: Diagnosis,
        required: false,
        attributes: ['diagnosis_name', 'complaints', 'remarks']
      },
      {
        model: Prescription,
        required: false,
        include: [
          {
            model: PrescriptionItem,
            include: [
              {
                model: Medicine,
                attributes: ['name', 'type']
              }
            ]
          }
        ]
      }
    ],
    order: [['visit_date', 'DESC']],
    limit: 10
  });

  return {
    patient: {
      patient_id: patient.patient_id,
      name: patient.name,
      dob: patient.dob,
      gender: patient.gender,
      phone: patient.phone,
      patient_type: patient.patient_type,
      allergies: patient.allergic_to
    },
    visits: pastVisits.map(v => ({
      visit_id: v.visit_id,
      visit_date: v.visit_date,
      reason: v.reason,
      status: v.status,
      doctor_name: v.Doctor?.name,
      doctor_specialization: v.Doctor?.specialization,
      diagnoses: v.Diagnoses?.map(d => ({
        diagnosis_name: d.diagnosis_name,
        complaints: d.complaints,
        remarks: d.remarks
      })) || [],
      prescriptions: v.Prescriptions?.map(p => ({
        prescription_id: p.prescription_id,
        created_at: p.created_at,
        medicines: p.PrescriptionItems?.map(pi => ({
          medicine_name: pi.Medicine?.name,
          medicine_type: pi.Medicine?.type,
          duration_days: pi.duration_days,
          dosage_per_day: pi.dosage_per_day
        })) || []
      })) || []
    }))
  };
};

// ============================================================================
// MEDICINES
// ============================================================================
export const searchMedicines = async (searchQuery) => {
  const whereClause = searchQuery 
    ? { name: { [Op.like]: `%${searchQuery}%` } }
    : {};

  const medicines = await Medicine.findAll({
    where: whereClause,
    attributes: ['medicine_id', 'name', 'type'],
    order: [['name', 'ASC']],
    limit: 50
  });

  return medicines.map(m => ({
    id: m.medicine_id,
    name: m.name,
    type: m.type
  }));
};

// ============================================================================
// STAFF (NURSES)
// ============================================================================
export const getAvailableNurses = async () => {
  const nurses = await StaffDetails.findAll({
    where: {
      role: 'NURSE_RECEPTIONIST',
      status: 'ACTIVE'
    },
    attributes: ['staff_id', 'name', 'code', 'phone', 'email'],
    order: [['name', 'ASC']]
  });

  return nurses.map(n => ({
    nurse_id: n.staff_id,
    name: n.name,
    code: n.code,
    phone: n.phone,
    email: n.email
  }));
};

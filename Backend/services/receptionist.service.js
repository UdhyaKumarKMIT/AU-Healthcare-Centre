import { 
  Patient, 
  PatientUser, 
  FamilyDetails,
  Visit, 
  Vitals, 
  Doctor,
  User,
  SystemAuditLog,
  sequelize
} from '../models/sequelize/index.js';
import { Op } from 'sequelize';
import bcrypt from 'bcrypt';
import ApiError from '../utils/ApiError.js';

// ============================================================================
// PATIENT REGISTRATION WITH COMPLETE DETAILS
// ============================================================================
export const registerPatient = async ({
  username,
  password,
  name,
  dob,
  gender,
  phone,
  patient_type,
  allergic_to,
  // Additional fields
  department,
  year,
  employeeId,
  designation,
  familyMembers,
  created_by_code // Receptionist code
}) => {
  // Check if username already exists
  const existingUser = await PatientUser.findOne({
    where: { username }
  });

  if (existingUser) {
    throw new ApiError(400, 'Username already registered');
  }

  const password_hash = await bcrypt.hash(password, 10);

  // Create patient and related records in transaction
  const result = await sequelize.transaction(async (t) => {
    // Create patient record
    const patient = await Patient.create({
      name,
      dob,
      gender,
      phone,
      patient_type,
      allergic_to: allergic_to || null
    }, { transaction: t });

    // Create patient user account
    await PatientUser.create({
      patient_id: patient.patient_id,
      username,
      password_hash,
      status: 'ACTIVE'
    }, { transaction: t });

    // Create family members if permanent staff
    if (patient_type === 'PERMANENT_STAFF' && familyMembers && Array.isArray(familyMembers)) {
      for (const member of familyMembers) {
        if (member.name && member.relation) {
          await FamilyDetails.create({
            patient_id: patient.patient_id,
            name: member.name,
            relation: member.relation.toUpperCase(),
            dob: member.dob || null,
            phone: member.phone || null
          }, { transaction: t });
        }
      }
    }

    // Log in system audit
    if (created_by_code) {
      await SystemAuditLog.create({
        actor_code: created_by_code,
        actor_role: 'NURSE_RECEPTIONIST',
        action: 'REGISTER_PATIENT',
        entity_type: 'PATIENT',
        entity_id: patient.patient_id,
        new_value: { 
          name, 
          patient_type, 
          department: patient_type === 'STUDENT' ? department : null,
          year: patient_type === 'STUDENT' ? year : null,
          employeeId: patient_type !== 'STUDENT' ? employeeId : null,
          designation: patient_type !== 'STUDENT' ? designation : null,
          family_members_count: familyMembers?.length || 0
        },
        remarks: `Patient registered: ${name} (${patient_type})`
      }, { transaction: t });
    }

    return { patient_id: patient.patient_id };
  });

  console.log('✅ Patient registered:', { 
    patient_id: result.patient_id, 
    username, 
    type: patient_type,
    family_members: familyMembers?.length || 0
  });
  
  return result;
};

// ============================================================================
// VISIT CREATION WITH COMPLETE VITALS
// ============================================================================
export const createVisit = async ({
  patient_id,
  doctor_id,
  reason,
  visit_type,
  created_by_code
}) => {
  // Validate patient exists
  const patient = await Patient.findByPk(patient_id);
  if (!patient) {
    throw new ApiError(404, 'Patient not found');
  }

  // Validate doctor exists
  const doctor = await Doctor.findByPk(doctor_id);
  if (!doctor) {
    throw new ApiError(404, 'Doctor not found');
  }

  // Validate visit type
  const validVisitTypes = ['OPD', 'IPD', 'EMERGENCY'];
  if (visit_type && !validVisitTypes.includes(visit_type)) {
    throw new ApiError(400, 'Invalid visit type. Must be OPD, IPD, or EMERGENCY');
  }

  const visit = await Visit.create({
    patient_id,
    doctor_id,
    visit_date: new Date(),
    reason,
    status: 'SCHEDULED',
    created_by_code
  });

  // Log in system audit
  if (created_by_code) {
    await SystemAuditLog.create({
      actor_code: created_by_code,
      actor_role: 'NURSE_RECEPTIONIST',
      action: 'CREATE_VISIT',
      entity_type: 'VISIT',
      entity_id: visit.visit_id,
      new_value: { patient_id, doctor_id, reason, visit_type },
      remarks: `Visit created for patient ${patient.name}`
    });
  }

  return { visit_id: visit.visit_id };
};

// ============================================================================
// ADD COMPLETE VITALS
// ============================================================================
export const addVitals = async ({
  visit_id,
  temperature,
  bp_systolic,
  bp_diastolic,
  heart_rate,
  cbg,
  spo2,
  recorded_by_code
}) => {
  // Check if visit exists
  const visit = await Visit.findByPk(visit_id);
  if (!visit) {
    throw new ApiError(404, 'Visit not found');
  }

  // Check if vitals already exist for this visit
  const existingVitals = await Vitals.findOne({ where: { visit_id } });
  if (existingVitals) {
    throw new ApiError(400, 'Vitals already recorded for this visit');
  }

  // Validate vital ranges
  if (temperature && (temperature < 90 || temperature > 110)) {
    throw new ApiError(400, 'Temperature must be between 90-110°F');
  }
  if (bp_systolic && (bp_systolic < 70 || bp_systolic > 200)) {
    throw new ApiError(400, 'Systolic BP must be between 70-200 mmHg');
  }
  if (bp_diastolic && (bp_diastolic < 40 || bp_diastolic > 130)) {
    throw new ApiError(400, 'Diastolic BP must be between 40-130 mmHg');
  }
  if (heart_rate && (heart_rate < 40 || heart_rate > 200)) {
    throw new ApiError(400, 'Heart rate must be between 40-200 bpm');
  }
  if (cbg && (cbg < 40 || cbg > 600)) {
    throw new ApiError(400, 'CBG must be between 40-600 mg/dL');
  }
  if (spo2 && (spo2 < 70 || spo2 > 100)) {
    throw new ApiError(400, 'SpO2 must be between 70-100%');
  }

  const vitals = await Vitals.create({
    visit_id,
    temperature: temperature || null,
    bp_systolic: bp_systolic || null,
    bp_diastolic: bp_diastolic || null,
    heart_rate: heart_rate || null,
    cbg: cbg || null,
    spo2: spo2 || null,
    recorded_by_code,
    recorded_at: new Date()
  });

  // Update visit status to ONGOING
  await visit.update({ status: 'ONGOING' });

  // Log in system audit
  if (recorded_by_code) {
    await SystemAuditLog.create({
      actor_code: recorded_by_code,
      actor_role: 'NURSE_RECEPTIONIST',
      action: 'RECORD_VITALS',
      entity_type: 'VITALS',
      entity_id: vitals.vitals_id,
      new_value: { temperature, bp_systolic, bp_diastolic, heart_rate, cbg, spo2 },
      remarks: `Vitals recorded for visit ${visit_id}`
    });
  }

  return vitals;
};

// ============================================================================
// GET ALL PATIENTS WITH FAMILY DETAILS
// ============================================================================
export const getAllPatients = async () => {
  const patients = await Patient.findAll({
    attributes: [
      'patient_id', 
      'name', 
      'dob', 
      'gender', 
      'phone', 
      'patient_type', 
      'allergic_to', 
      'created_at'
    ],
    include: [
      {
        model: FamilyDetails,
        attributes: ['family_id', 'name', 'relation', 'dob', 'phone'],
        required: false
      }
    ],
    order: [['created_at', 'DESC']]
  });

  return patients.map(p => ({
    patient_id: p.patient_id,
    name: p.name,
    dob: p.dob,
    gender: p.gender,
    phone: p.phone,
    patient_type: p.patient_type,
    allergic_to: p.allergic_to,
    created_at: p.created_at,
    family_members: p.FamilyDetails?.map(f => ({
      family_id: f.family_id,
      name: f.name,
      relation: f.relation,
      dob: f.dob,
      phone: f.phone
    })) || []
  }));
};

export const assignDoctorToVisit = async ({ visit_id, doctor_id }) => {
  const visit = await Visit.findByPk(visit_id);
  if (!visit) {
    throw new ApiError(404, 'Visit not found');
  }

  if (visit.status !== 'SCHEDULED') {
    throw new ApiError(400, 'Doctor can only be assigned to a scheduled visit');
  }

  const doctor = await Doctor.findByPk(doctor_id);
  if (!doctor) {
    throw new ApiError(404, 'Doctor not found');
  }

  if (doctor.availability_status !== 'AVAILABLE') {
    throw new ApiError(400, 'Doctor is not available for assignment');
  }

  await visit.update({ doctor_id });

  return { visit_id, doctor_id };
};

// ============================================================================
// DATA FETCHING
// ============================================================================


export const getAllDoctors = async () => {
  const doctors = await Doctor.findAll({
    attributes: ['doctor_id', 'name', 'specialization', 'phone', 'availability_status'],
    order: [['name', 'ASC']]
  });

  return doctors.map(d => ({
    doctor_id: d.doctor_id,
    name: d.name,
    specialization: d.specialization,
    phone: d.phone,
    availability_status: d.availability_status
  }));
};

export const getAllAvailableDoctors = async () => {
  const doctors = await Doctor.findAll({
    where: { availability_status: 'AVAILABLE' },
    attributes: ['doctor_id', 'name', 'specialization', 'phone'],
    order: [['name', 'ASC']]
  });

  return doctors.map(d => ({
    doctor_id: d.doctor_id,
    name: d.name,
    specialization: d.specialization,
    phone: d.phone,
    availability_status: 'AVAILABLE'
  }));
};

export const getAllVisits = async () => {
  const fourHoursAgo = new Date(Date.now() - 4 * 60 * 60 * 1000);

  const visits = await Visit.findAll({
    where: {
      visit_date: {
        [Op.gte]: fourHoursAgo
      }
    },
    include: [
      {
        model: Patient,
        attributes: ['name']
      },
      {
        model: Doctor,
        attributes: ['name']
      }
    ],
    order: [['visit_date', 'DESC']]
  });

  // Add sequential token numbers
  return visits.map((visit, index) => ({
    visit_id: visit.visit_id,
    patient_id: visit.patient_id,
    doctor_id: visit.doctor_id,
    reason: visit.reason,
    status: visit.status,
    visit_date: visit.visit_date,
    patient_name: visit.Patient?.name,
    doctor_name: visit.Doctor?.name,
    visit_type: 'OPD', // Default if not in model
    token: String(index + 1).padStart(3, '0')
  }));
};

// ============================================================================
// STATUS UPDATES
// ============================================================================

export const updateVisitStatus = async ({ visit_id, newStatus }) => {
  const visit = await Visit.findByPk(visit_id);
  if (!visit) {
    throw new ApiError(404, 'Visit not found');
  }

  // Validate status transitions
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
    throw new ApiError(400, 'Invalid visit status');
  }

  await visit.update({ status: newStatus });
};

export const updateDoctorAvailability = async (doctor_id, availability_status) => {
  const allowed = ['AVAILABLE', 'UNAVAILABLE'];

  if (!allowed.includes(availability_status)) {
    throw new ApiError(400, 'Invalid availability status');
  }

  const doctor = await Doctor.findByPk(doctor_id);
  if (!doctor) {
    throw new ApiError(404, 'Doctor not found');
  }

  await doctor.update({ availability_status });

  return { doctor_id, availability_status };
};
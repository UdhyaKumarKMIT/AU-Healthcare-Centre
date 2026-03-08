import sequelize from '../../config/sequelize.js';
import User from './User.js';
import Patient from './Patient.js';
import Doctor from './Doctor.js';
import StaffDetails from './StaffDetails.js';
import PatientUser from './PatientUser.js';
import FamilyDetails from './FamilyDetails.js';
import Visit from './Visit.js';
import Vitals from './Vitals.js';
import Diagnosis from './Diagnosis.js';
import NurseTaskMaster from './NurseTaskMaster.js';
import NurseTask from './NurseTask.js';
import NurseTransaction from './NurseTransaction.js';
import Medicine from './Medicine.js';
import Prescription from './Prescription.js';
import PrescriptionItem from './PrescriptionItems.js';
import PrescriptionTransaction from './PrescriptionTransaction.js';
import MedicineMainStock from './MedicineMainStock.js';
import StockAssignmentLog from './StockAssignmentLog.js';
import SystemAuditLog from './SystemAuditLog.js';
import PharmacyStock from './PharmacyStock.js';
import NurseStock from './NurseStock.js';
import DressingStock from './DressingStock.js';
import LabtechStock from './LabtechStock.js';
import LabTest from './LabTest.js';
import LabTask from './LabTask.js';

// User relations
User.hasOne(Doctor, { foreignKey: 'user_id' });
Doctor.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(StaffDetails, { foreignKey: 'user_id' });
StaffDetails.belongsTo(User, { foreignKey: 'user_id' });

// Patient relations
Patient.hasMany(PatientUser, { foreignKey: 'patient_id' });
PatientUser.belongsTo(Patient, { foreignKey: 'patient_id' });

Patient.hasMany(FamilyDetails, { foreignKey: 'patient_id' });
FamilyDetails.belongsTo(Patient, { foreignKey: 'patient_id' });

Patient.hasMany(Visit, { foreignKey: 'patient_id' });
Visit.belongsTo(Patient, { foreignKey: 'patient_id' });

Doctor.hasMany(Visit, { foreignKey: 'doctor_id' });
Visit.belongsTo(Doctor, { foreignKey: 'doctor_id' });

Visit.hasOne(Vitals, { foreignKey: 'visit_id' });
Vitals.belongsTo(Visit, { foreignKey: 'visit_id' });

Visit.hasMany(Diagnosis, { foreignKey: 'visit_id' });
Diagnosis.belongsTo(Visit, { foreignKey: 'visit_id' });

Doctor.hasMany(Diagnosis, { foreignKey: 'doctor_id' });
Diagnosis.belongsTo(Doctor, { foreignKey: 'doctor_id' });

NurseTaskMaster.hasMany(NurseTask, { foreignKey: 'task_type_id' });
NurseTask.belongsTo(NurseTaskMaster, { foreignKey: 'task_type_id' });

Visit.hasMany(NurseTask, { foreignKey: 'visit_id' });
NurseTask.belongsTo(Visit, { foreignKey: 'visit_id' });

Doctor.hasMany(NurseTask, { foreignKey: 'doctor_id' });
NurseTask.belongsTo(Doctor, { foreignKey: 'doctor_id' });

NurseTask.hasMany(NurseTransaction, { foreignKey: 'task_id' });
NurseTransaction.belongsTo(NurseTask, { foreignKey: 'task_id' });

Visit.hasMany(Prescription, { foreignKey: 'visit_id' });
Prescription.belongsTo(Visit, { foreignKey: 'visit_id' });

Doctor.hasMany(Prescription, { foreignKey: 'doctor_id' });
Prescription.belongsTo(Doctor, { foreignKey: 'doctor_id' });

Prescription.hasMany(PrescriptionItem, { foreignKey: 'prescription_id' });
PrescriptionItem.belongsTo(Prescription, { foreignKey: 'prescription_id' });

Medicine.hasMany(PrescriptionItem, { foreignKey: 'medicine_id' });
PrescriptionItem.belongsTo(Medicine, { foreignKey: 'medicine_id' });

Prescription.hasMany(PrescriptionTransaction, { foreignKey: 'prescription_id' });
PrescriptionTransaction.belongsTo(Prescription, { foreignKey: 'prescription_id' });

Medicine.hasMany(MedicineMainStock, { foreignKey: 'medicine_id' });
MedicineMainStock.belongsTo(Medicine, { foreignKey: 'medicine_id' });

Medicine.hasMany(StockAssignmentLog, { foreignKey: 'medicine_id' });
StockAssignmentLog.belongsTo(Medicine, { foreignKey: 'medicine_id' });

Medicine.hasMany(PharmacyStock, { foreignKey: 'medicine_id' });
PharmacyStock.belongsTo(Medicine, { foreignKey: 'medicine_id' });

Medicine.hasMany(NurseStock, { foreignKey: 'medicine_id' });
NurseStock.belongsTo(Medicine, { foreignKey: 'medicine_id' });

Medicine.hasMany(DressingStock, { foreignKey: 'medicine_id' });
DressingStock.belongsTo(Medicine, { foreignKey: 'medicine_id' });

Medicine.hasMany(LabtechStock, { foreignKey: 'medicine_id' });
LabtechStock.belongsTo(Medicine, { foreignKey: 'medicine_id' });

// Lab relations
LabTest.hasMany(LabTask, { foreignKey: 'lab_test_id' });
LabTask.belongsTo(LabTest, { foreignKey: 'lab_test_id' });

Doctor.hasMany(LabTask, { foreignKey: 'assigned_by_doctor_id' });
LabTask.belongsTo(Doctor, { foreignKey: 'assigned_by_doctor_id' });

User.hasMany(SystemAuditLog, { foreignKey: 'actor_user_id' });
SystemAuditLog.belongsTo(User, { foreignKey: 'actor_user_id' });

export {
    sequelize,
    User,
    Patient,
    Doctor,
    StaffDetails,
    PatientUser,
    FamilyDetails,
    Visit,
    Vitals,
    Diagnosis,
    NurseTaskMaster,
    NurseTask,
    NurseTransaction,
    Medicine,
    Prescription,
    PrescriptionItem,
    PrescriptionTransaction,
    MedicineMainStock,
    StockAssignmentLog,
    SystemAuditLog,
    PharmacyStock,
    NurseStock,
    DressingStock,
    LabtechStock,
    LabTest,
    LabTask,
};

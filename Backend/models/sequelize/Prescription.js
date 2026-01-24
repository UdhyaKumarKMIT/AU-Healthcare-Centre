import { DataTypes, Model } from 'sequelize';
import sequelize from '../../config/sequelize.js';

class Prescription extends Model {}

Prescription.init(
  {
    prescription_id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    patient_name: { type: DataTypes.STRING(100), allowNull: false },
    patient_id: { type: DataTypes.UUID, allowNull: true },
    doctor_id: { type: DataTypes.UUID, allowNull: true },
    prescription_date: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    notes: { type: DataTypes.TEXT, allowNull: true },
  },
  {
    sequelize,
    modelName: 'Prescription',
    tableName: 'prescription',
    timestamps: false,
  }
);

export default Prescription;

import { DataTypes, Model } from 'sequelize';
import sequelize from '../../config/sequelize.js';

class Prescription extends Model {}

Prescription.init(
  {
    prescription_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    visit_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'visit', key: 'visit_id' },
    },
    doctor_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'doctor', key: 'doctor_id' },
    },
    status: {
      type: DataTypes.ENUM('active', 'issued'),
      allowNull: false,
      defaultValue: 'active',
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'Prescription',
    tableName: 'prescription',
    timestamps: false, // Using explicit created_at and updated_at
  }
);

export default Prescription;

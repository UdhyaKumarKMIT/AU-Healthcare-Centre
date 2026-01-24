import { DataTypes, Model } from 'sequelize';
import sequelize from '../../config/sequelize.js';
import Prescription from './Prescription.js';
import Medicine from './Medicine.js';

class PrescriptionItems extends Model {}

PrescriptionItems.init(
  {
    item_id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    prescription_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'prescription', key: 'prescription_id' } },
    medicine_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'medicine', key: 'medicine_id' } },
    dosage: { type: DataTypes.STRING(50), allowNull: false },
    frequency: { type: DataTypes.STRING(50), allowNull: false },
    duration_days: { type: DataTypes.INTEGER, allowNull: false },
  },
  {
    sequelize,
    modelName: 'PrescriptionItems',
    tableName: 'prescription_items',
    timestamps: false,
  }
);

export default PrescriptionItems;

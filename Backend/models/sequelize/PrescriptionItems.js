import { DataTypes, Model } from 'sequelize';
import sequelize from '../../config/sequelize.js';
import Prescription from './Prescription.js';
import Medicine from './Medicine.js';

class PrescriptionItems extends Model {}

PrescriptionItems.init(
  {
    item_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    prescription_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'prescription', key: 'prescription_id' },
    },
    medicine_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'medicine', key: 'medicine_id' },
    },
    dosage_per_day: { type: DataTypes.INTEGER, allowNull: false },
    duration_days: { type: DataTypes.INTEGER, allowNull: false },
    quantity: { type: DataTypes.INTEGER, allowNull: false },
    is_external: { type: DataTypes.BOOLEAN, allowNull: false },
    external_notes: { type: DataTypes.TEXT, allowNull: true },
    food_timing: {
      type: DataTypes.ENUM('BEFORE', 'AFTER', 'WITH', 'EMPTY_STOMACH'),
      allowNull: true,
    },
    morning: { type: DataTypes.BOOLEAN, allowNull: true },
    afternoon: { type: DataTypes.BOOLEAN, allowNull: true },
    night: { type: DataTypes.BOOLEAN, allowNull: true },
  },
  {
    sequelize,
    modelName: 'PrescriptionItems',
    tableName: 'prescription_items',
    timestamps: false,
  }
);

export default PrescriptionItems;

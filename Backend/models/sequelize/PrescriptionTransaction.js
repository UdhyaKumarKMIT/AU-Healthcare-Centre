import { DataTypes, Model } from 'sequelize';
import sequelize from '../../config/sequelize.js';
import Prescription from './Prescription.js';

class PrescriptionTransaction extends Model {}

PrescriptionTransaction.init(
  {
    txn_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    prescription_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'prescription', key: 'prescription_id' },
    },
    issued_by_code: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    issued_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: true,
    },
    issued_days: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    sequelize,
    modelName: 'PrescriptionTransaction',
    tableName: 'prescription_transaction',
    timestamps: false,
  }
);

export default PrescriptionTransaction;

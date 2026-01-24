import { DataTypes, Model } from 'sequelize';
import sequelize from '../../config/sequelize.js';
import Prescription from './Prescription.js';

class PrescriptionTransaction extends Model {}

PrescriptionTransaction.init(
  {
    transaction_id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    prescription_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'prescription', key: 'prescription_id' } },
    transaction_date: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    total_amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    payment_status: { type: DataTypes.ENUM('PENDING', 'PAID', 'CANCELLED'), defaultValue: 'PENDING' },
    payment_method: { type: DataTypes.STRING(50), allowNull: true },
  },
  {
    sequelize,
    modelName: 'PrescriptionTransaction',
    tableName: 'prescription_transaction',
    timestamps: false,
  }
);

export default PrescriptionTransaction;

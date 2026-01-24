import { DataTypes, Model } from 'sequelize';
import sequelize from '../../config/sequelize.js';
import Medicine from './Medicine.js';
import PharmacyStock from './pharmacy_stock.js';

class PharmacyExpiredMedicineLog extends Model {}

PharmacyExpiredMedicineLog.init(
  {
    log_id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    medicine_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'medicine', key: 'medicine_id' } },
    batch_no: { type: DataTypes.STRING(50), allowNull: false },
    expired_quantity: { type: DataTypes.INTEGER, allowNull: false },
    expired_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    stock_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'pharmacy_stock', key: 'sub_stock_id' } },
  },
  {
    sequelize,
    modelName: 'PharmacyExpiredMedicineLog',
    tableName: 'pharmacy_expired_medicine_log',
    timestamps: false,
  }
);

export default PharmacyExpiredMedicineLog;

import { DataTypes, Model } from 'sequelize';
import sequelize from '../../config/sequelize.js';
import Medicine from './Medicine.js';
import PharmacyStock from './pharmacy_stock.js';

class PharmacyExpiredMedicineLog extends Model {}

PharmacyExpiredMedicineLog.init(
  {
    batch_no: {
      type: DataTypes.STRING(36),      // matches CHAR(36)
      allowNull: false,
      primaryKey: true,                // MySQL table does not define PK, but you can use batch_no as PK
    },
    medicine_id: {
      type: DataTypes.STRING(36),
      allowNull: false,
      references: { model: 'medicine', key: 'medicine_id' },
    }, 
    expiry: {
      type: DataTypes.DATEONLY,        // MySQL DATE type
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 0 },            // matches CHECK constraint
    },
    cleared_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW,
    },
    cleared_by_code: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'PharmacyExpiredMedicineLog',
    tableName: 'pharmacy_expired_medicine_log',
    timestamps: false,
  }
);

export default PharmacyExpiredMedicineLog;

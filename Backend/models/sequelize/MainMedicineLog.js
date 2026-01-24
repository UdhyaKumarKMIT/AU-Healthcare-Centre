import { DataTypes, Model } from 'sequelize';
import sequelize from '../../config/sequelize.js';
import Medicine from './Medicine.js';

class MainMedicineLog extends Model {}

MainMedicineLog.init(
  {
    batch_no: { type: DataTypes.UUID, allowNull: false, primaryKey: true },
    medicine_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'medicine', key: 'medicine_id' } },
    main_stock_id: { type: DataTypes.UUID, allowNull: false },
    expiry: { type: DataTypes.DATEONLY, allowNull: false },
    quantity: { type: DataTypes.INTEGER, allowNull: false },
    cleared_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  {
    sequelize,
    modelName: 'MainMedicineLog',
    tableName: 'main_medicine_log',
    timestamps: false,
  }
);

export default MainMedicineLog;

import { DataTypes, Model } from 'sequelize';
import sequelize from '../../config/sequelize.js';

class MedicineMainStock extends Model {}

MedicineMainStock.init(
  {
    main_stock_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    medicine_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'medicine', key: 'medicine_id' },
    },
    batch_no: { type: DataTypes.STRING(50), allowNull: false },
    mfd: { type: DataTypes.DATE, allowNull: true },
    expiry: { type: DataTypes.DATE, allowNull: true },
    quantity: { type: DataTypes.INTEGER, allowNull: false },
    dressing_stock: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    labtech_stock: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    nurse_stock: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    pharmacy_stock: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  },
  {
    sequelize,
    modelName: 'MedicineMainStock',
    tableName: 'medicine_main_stock',
    timestamps: false,
  }
);

export default MedicineMainStock;

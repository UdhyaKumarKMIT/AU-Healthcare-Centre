import { DataTypes, Model } from 'sequelize';
import sequelize from '../../config/sequelize.js';
import Medicine from './Medicine.js';

class LabtechStock extends Model {}

LabtechStock.init(
  {
    sub_stock_id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    medicine_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'medicine', key: 'medicine_id' } },
    batch_no: { type: DataTypes.STRING(50), allowNull: false },
    expiry: { type: DataTypes.DATE, allowNull: true },
    quantity: { type: DataTypes.INTEGER, allowNull: false },
    status: { type: DataTypes.ENUM('ACTIVE', 'EXPIRED'), allowNull: false },
  },
  {
    sequelize,
    modelName: 'LabtechStock',
    tableName: 'labtech_stock',
    timestamps: false,
  }
);

export default LabtechStock;

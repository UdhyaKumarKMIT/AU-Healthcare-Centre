import { DataTypes, Model } from 'sequelize';
import sequelize from '../../config/sequelize.js';
import Medicine from './Medicine.js';

class NurseStock extends Model {}

NurseStock.init(
  {
    sub_stock_id: {
      type: DataTypes.STRING(36),       // matches CHAR(36)
      defaultValue: DataTypes.UUIDV4,   // auto-generate UUID
      primaryKey: true,
      allowNull: false,
    },
    medicine_id: {
      type: DataTypes.STRING(36),       // matches CHAR(36)
      allowNull: false,
      references: { model: 'medicine', key: 'medicine_id' },
    },
    batch_no: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    expiry: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    issued_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('ACTIVE', 'EXPIRED'),
      allowNull: false,
      defaultValue: 'ACTIVE',
    },
    verification: {
      type: DataTypes.ENUM('done', 'waiting'),
      allowNull: false,
      defaultValue: 'waiting',
    },
  },
  {
    sequelize,
    modelName: 'NurseStock',
    tableName: 'nurse_stock',
    timestamps: false,
  }
);

export default NurseStock;

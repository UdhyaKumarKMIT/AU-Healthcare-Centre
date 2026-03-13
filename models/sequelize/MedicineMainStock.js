import { DataTypes, Model } from "sequelize";
import sequelize from "../../config/sequelize.js";
import Medicine from "./Medicine.js";

class MedicineMainStock extends Model {}

MedicineMainStock.init(
  {
    main_stock_id: {
      type: DataTypes.STRING(36), // matches CHAR(36) in MySQL
      defaultValue: DataTypes.UUIDV4, // auto-generate UUID
      primaryKey: true,
      allowNull: false,
    },
    medicine_id: {
      type: DataTypes.STRING(36), // matches CHAR(36)
      allowNull: false,
      references: { model: "medicine", key: "medicine_id" },
    },
    batch_no: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true, // matches UNIQUE KEY in MySQL
    },
    issued_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    expiry: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("active", "expired"),
      allowNull: false,
      defaultValue: "active",
    },
  },
  {
    sequelize,
    modelName: "MedicineMainStock",
    tableName: "medicine_main_stock",
    timestamps: false,
  }
);

export default MedicineMainStock;

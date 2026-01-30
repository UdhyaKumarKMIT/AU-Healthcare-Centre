import { DataTypes, Model } from "sequelize";
import sequelize from "../../config/sequelize.js";
import Medicine from "./Medicine.js";

class MainMedicineLog extends Model {}

MainMedicineLog.init(
  {
    batch_no: {
      type: DataTypes.STRING(36),
      allowNull: false,
    },

    medicine_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Medicine,
        key: "medicine_id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },

    main_stock_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    expiry: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },

    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 0,
      },
    },

    cleared_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: "MainMedicineLog",
    tableName: "main_medicine_log",
    timestamps: false,
  }
);

export default MainMedicineLog;

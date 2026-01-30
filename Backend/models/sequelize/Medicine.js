import { DataTypes, Model } from "sequelize";
import sequelize from "../../config/sequelize.js";

class Medicine extends Model {}

Medicine.init(
  {
    medicine_id: {
      type: DataTypes.STRING(36), // Matches CHAR(36) in MySQL
      defaultValue: DataTypes.UUIDV4, // Optional: auto-generate UUID
      primaryKey: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM("TABLET", "SYRUP", "OINTMENT", "INJECTION", "DROPS"),
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "Medicine",
    tableName: "medicine",
    timestamps: false,
  }
);

export default Medicine;

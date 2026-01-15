import { DataTypes, Model } from 'sequelize';
import sequelize from '../../config/sequelize.js';

class Medicine extends Model { }

Medicine.init(
    {
        medicine_id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        type: {
            type: DataTypes.ENUM('TABLET', 'SYRUP', 'OINTMENT', 'INJECTION', 'DROPS','EXTERNAL'),
            allowNull: false,
        },
    },
    {
        sequelize,
        modelName: 'Medicine',
        tableName: 'medicine',
        timestamps: false,
    }
);

export default Medicine;

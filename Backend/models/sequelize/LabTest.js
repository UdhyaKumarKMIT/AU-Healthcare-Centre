import { DataTypes, Model } from 'sequelize';
import sequelize from '../../config/sequelize.js';

class LabTest extends Model { }

LabTest.init(
    {
        lab_test_id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        test_name: {
            type: DataTypes.STRING(150),
            allowNull: false,
        },
        test_type: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
    },
    {
        sequelize,
        modelName: 'LabTest',
        tableName: 'lab_tests',
        timestamps: false,
    }
);

export default LabTest;

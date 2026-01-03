import { DataTypes, Model } from 'sequelize';
import sequelize from '../../config/sequelize.js';

class StaffDetails extends Model { }

StaffDetails.init(
    {
        staff_id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        user_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'users',
                key: 'user_id',
            },
        },
        name: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        role: {
            type: DataTypes.ENUM('NURSE', 'PHARMACIST', 'CLERICAL_ASSISTANT'),
            allowNull: false,
        },
        code: {
            type: DataTypes.STRING(50),
            allowNull: false,
            unique: true,
        },
        phone: {
            type: DataTypes.STRING(20),
            allowNull: true,
        },
        email: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        status: {
            type: DataTypes.ENUM('ACTIVE', 'INACTIVE'),
            allowNull: false,
        },
    },
    {
        sequelize,
        modelName: 'StaffDetails',
        tableName: 'staff_details',
        timestamps: false,
    }
);

export default StaffDetails;

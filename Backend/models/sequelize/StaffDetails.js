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
        user_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'users', // name of the target table
                key: 'user_id',
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
        },
        role: {
            type: DataTypes.ENUM('NURSE_RECEPTIONIST', 'PHARMACIST', 'CLERICAL_ASSISTANT'),
            allowNull: false,
        },
        code: {
            type: DataTypes.STRING(50),
            allowNull: false,
            // unique: true,  // Moved to indexes config
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
        indexes: [
            {
                unique: true,
                fields: ['code'],
                name: 'code'
            }
        ]
    }
);

export default StaffDetails;

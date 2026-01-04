import { DataTypes, Model } from 'sequelize';
import sequelize from '../../config/sequelize.js';

class User extends Model { }

User.init(
    {
        user_id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        username: {
            type: DataTypes.STRING(100),
            unique: true,
            allowNull: false,
        },
        password_hash: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        role: {
            type: DataTypes.ENUM('ADMIN', 'DOCTOR', 'NURSE_RECEPTIONIST', 'PHARMACIST', 'CLERICAL_ASSISTANT', 'LAB_TECHNICIAN'),
            allowNull: false,
        },
        status: {
            type: DataTypes.ENUM('ACTIVE', 'INACTIVE'),
            allowNull: false,
            defaultValue: 'ACTIVE',
        },
        created_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
        is_role_specific: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            comment: 'True for role-specific accounts (NURSE, PHARMACIST), False for user-specific accounts',
        },
    },
    {
        sequelize,
        modelName: 'User',
        tableName: 'users',
        timestamps: false,
    }
);

export default User;

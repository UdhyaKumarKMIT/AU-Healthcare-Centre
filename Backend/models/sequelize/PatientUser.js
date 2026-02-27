import { DataTypes, Model } from 'sequelize';
import sequelize from '../../config/sequelize.js';

class PatientUser extends Model { }

PatientUser.init(
    {
        patient_user_id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        patient_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'patient',
                key: 'patient_id',
            },
        },
        username: {
            type: DataTypes.STRING(100),
            allowNull: false,
            // unique: true,  // Moved to indexes config
        },
        password_hash: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        status: {
            type: DataTypes.ENUM('ACTIVE', 'INACTIVE'),
            allowNull: false,
        },
        created_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
    },
    {
        sequelize,
        modelName: 'PatientUser',
        tableName: 'patient_users',
        timestamps: false,
        indexes: [
            {
                unique: true,
                fields: ['username'],
                name: 'username'
            }
        ]
    }
);

export default PatientUser;

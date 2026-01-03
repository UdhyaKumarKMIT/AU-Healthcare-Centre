import { DataTypes, Model } from 'sequelize';
import sequelize from '../../config/sequelize.js';

class Patient extends Model { }

Patient.init(
    {
        patient_id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        dob: {
            type: DataTypes.DATEONLY,
            allowNull: true,
        },
        gender: {
            type: DataTypes.STRING(10),
            allowNull: true,
        },
        phone: {
            type: DataTypes.STRING(20),
            allowNull: true,
        },
        patient_type: {
            type: DataTypes.ENUM('STUDENT', 'TEMP_STAFF', 'PERMANENT_STAFF'),
            allowNull: false,
        },
        allergic_to: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        created_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
    },
    {
        sequelize,
        modelName: 'Patient',
        tableName: 'patient',
        timestamps: false,
    }
);

export default Patient;

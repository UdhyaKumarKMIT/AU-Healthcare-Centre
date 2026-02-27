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
        blood_group: {
            type: DataTypes.STRING(10),
            allowNull: true,
        },
        reg_number: {
            type: DataTypes.STRING(15),
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
        email: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        department: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        year: {
            type: DataTypes.STRING(20),
            allowNull: true,
        },
        employee_id: {
            type: DataTypes.STRING(50),
            allowNull: true,
        },
        designation: {
            type: DataTypes.STRING(100),
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

import { DataTypes, Model } from 'sequelize';
import sequelize from '../../config/sequelize.js';

class LabTask extends Model { }

LabTask.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        lab_test_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'lab_tests',
                key: 'lab_test_id',
            },
        },
        assigned_by_doctor_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'doctor',
                key: 'doctor_id',
            },
        },
        assigned_at: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        status: {
            type: DataTypes.STRING(50),
            allowNull: true,
        },
        completed_at: {
            type: DataTypes.DATE,
            allowNull: true,
        },
    },
    {
        sequelize,
        modelName: 'LabTask',
        tableName: 'lab_tasks',
        timestamps: false,
        indexes: [
            { fields: ['lab_test_id'], name: 'idx_lab_tasks_lab_test_id' },
            { fields: ['assigned_by_doctor_id'], name: 'idx_lab_tasks_assigned_by_doctor_id' },
            { fields: ['status'], name: 'idx_lab_tasks_status' },
        ],
    }
);

export default LabTask;

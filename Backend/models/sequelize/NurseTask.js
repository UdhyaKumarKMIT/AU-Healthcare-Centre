import { DataTypes, Model } from 'sequelize';
import sequelize from '../../config/sequelize.js';

class NurseTask extends Model { }

NurseTask.init(
    {
        task_id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        visit_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'visit',
                key: 'visit_id',
            },
        },
        doctor_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'doctor',
                key: 'doctor_id',
            },
        },
        task_type_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'nurse_task_master',
                key: 'task_type_id',
            },
        },
        instructions: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        status: {
            type: DataTypes.STRING(50),
            allowNull: true,
        },
        assigned_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            allowNull: true,
        },
    },
    {
        sequelize,
        modelName: 'NurseTask',
        tableName: 'nurse_task',
        timestamps: false,
    }
);

export default NurseTask;

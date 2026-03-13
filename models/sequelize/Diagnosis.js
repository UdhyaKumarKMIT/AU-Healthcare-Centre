import { DataTypes, Model } from 'sequelize';
import sequelize from '../../config/sequelize.js';

class Diagnosis extends Model { }

Diagnosis.init(
    {
        diagnosis_id: {
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
        complaints: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        diagnosis_name: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        remarks: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        created_at: {
            type: DataTypes.DATE,
            allowNull: true,
        },
    },
    {
        sequelize,
        modelName: 'Diagnosis',
        tableName: 'diagnosis',
        timestamps: false,
    }
);

export default Diagnosis;

import { DataTypes, Model } from 'sequelize';
import sequelize from '../../config/sequelize.js';

class Visit extends Model { }

Visit.init(
    {
        visit_id: {
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
        doctor_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'doctor',
                key: 'doctor_id',
            },
        },
        visit_date: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        reason: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        status: {
            type: DataTypes.ENUM(
                'SCHEDULED',
                'ONGOING',
                'DIAGNOSED',
                'PRESCRIBED',
                'NURSING',
                'PHARMACY',
                'COMPLETED',
                'CANCELLED'
            ),
            allowNull: false,
        },
        created_by_code: {
            type: DataTypes.STRING(50),
            allowNull: true,
        },
    },
    {
        sequelize,
        modelName: 'Visit',
        tableName: 'visit',
        timestamps: false,
    }
);

export default Visit;

import { DataTypes, Model } from 'sequelize';
import sequelize from '../../config/sequelize.js';

class Vitals extends Model { }

Vitals.init(
    {
        vitals_id: {
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
        temperature: {
            type: DataTypes.FLOAT,
            allowNull: false,
        },
        bp_systolic: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        bp_diastolic: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        heart_rate: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        cbg: {
            type: DataTypes.STRING(20),
            allowNull: false,
        },
        spo2: {
            type: DataTypes.FLOAT,
            allowNull: false,
        },
        recorded_by_code: {
            type: DataTypes.STRING(50),
            allowNull: true,
        },
        recorded_at: {
            type: DataTypes.DATE,
            allowNull: true,
        },
    },
    {
        sequelize,
        modelName: 'Vitals',
        tableName: 'vitals',
        timestamps: false,
    }
);

export default Vitals;

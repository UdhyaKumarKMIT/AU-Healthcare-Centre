import { DataTypes, Model } from 'sequelize';
import sequelize from '../../config/sequelize.js';

class PrescriptionItem extends Model { }

PrescriptionItem.init(
    {
        item_id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        prescription_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'prescription',
                key: 'prescription_id',
            },
        },
        medicine_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'medicine',
                key: 'medicine_id',
            },
        },
        dosage_per_day: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        duration_days: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        quantity: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        is_external: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
        },
        external_notes: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
    },
    {
        sequelize,
        modelName: 'PrescriptionItem',
        tableName: 'prescription_items',
        timestamps: false,
    }
);

export default PrescriptionItem;

import { DataTypes, Model } from 'sequelize';
import sequelize from '../../config/sequelize.js';

class StockAssignmentLog extends Model { }

StockAssignmentLog.init(
    {
        log_id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        medicine_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'medicine',
                key: 'medicine_id',
            },
        },
        batch_no: {
            type: DataTypes.STRING(50),
            allowNull: false,
        },
        to_stock: {
            type: DataTypes.ENUM('PHARMACY', 'NURSE', 'DRESSING'),
            allowNull: false,
        },
        quantity: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        assigned_by_code: {
            type: DataTypes.STRING(50),
            allowNull: true,
        },
        assigned_at: {
            type: DataTypes.DATE,
            allowNull: true,
            defaultValue: DataTypes.NOW,
        },
    },
    {
        sequelize,
        modelName: 'StockAssignmentLog',
        tableName: 'stock_assignment_log',
        timestamps: false,
    }
);

export default StockAssignmentLog;

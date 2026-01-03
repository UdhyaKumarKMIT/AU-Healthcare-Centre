import { DataTypes, Model } from 'sequelize';
import sequelize from '../../config/sequelize.js';

class NurseTransaction extends Model { }

NurseTransaction.init(
    {
        nurse_txn_id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        task_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'nurse_task',
                key: 'task_id',
            },
        },
        performed_by_code: {
            type: DataTypes.STRING(50),
            allowNull: true,
        },
        performed_at: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        remarks: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        status: {
            type: DataTypes.STRING(50),
            allowNull: true,
        },
    },
    {
        sequelize,
        modelName: 'NurseTransaction',
        tableName: 'nurse_transaction',
        timestamps: false,
    }
);

export default NurseTransaction;

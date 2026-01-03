import { DataTypes, Model } from 'sequelize';
import sequelize from '../../config/sequelize.js';

class NurseTaskMaster extends Model { }

NurseTaskMaster.init(
    {
        task_type_id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        task_name: {
            type: DataTypes.STRING(100),
            allowNull: false,
            unique: true,
        },
    },
    {
        sequelize,
        modelName: 'NurseTaskMaster',
        tableName: 'nurse_task_master',
        timestamps: false,
    }
);

export default NurseTaskMaster;

import { DataTypes, Model } from 'sequelize';
import sequelize from '../../config/sequelize.js';

class NurseStock extends Model { }

NurseStock.init(
    {
        sub_stock_id: {
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
        expiry: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        quantity: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
    },
    {
        sequelize,
        modelName: 'NurseStock',
        tableName: 'nurse_stock',
        timestamps: false,
    }
);

export default NurseStock;

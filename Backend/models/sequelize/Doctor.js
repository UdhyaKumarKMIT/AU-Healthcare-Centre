import { DataTypes, Model } from 'sequelize';
import sequelize from '../../config/sequelize.js';

class Doctor extends Model { }

Doctor.init(
    {
        doctor_id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        user_id: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        specialization: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        phone: {
            type: DataTypes.STRING(20),
            allowNull: true,
        },
        availability_status: {
            type: DataTypes.STRING,
            allowNull: true,
        },
    },
    {
        sequelize,
        modelName: 'Doctor',
        tableName: 'doctor',
        timestamps: false,
    }
);

export default Doctor;

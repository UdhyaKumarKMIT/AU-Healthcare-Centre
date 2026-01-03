import { DataTypes, Model } from 'sequelize';
import sequelize from '../../config/sequelize.js';

class FamilyDetails extends Model { }

FamilyDetails.init(
    {
        family_id: {
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
        name: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        relation: {
            type: DataTypes.STRING(50),
            allowNull: false,
        },
        dob: {
            type: DataTypes.DATEONLY,
            allowNull: true,
        },
        phone: {
            type: DataTypes.STRING(20),
            allowNull: true,
        },
    },
    {
        sequelize,
        modelName: 'FamilyDetails',
        tableName: 'family_details',
        timestamps: false,
    }
);

export default FamilyDetails;

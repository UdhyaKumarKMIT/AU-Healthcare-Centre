import { DataTypes, Model } from 'sequelize';
import sequelize from '../../config/sequelize.js';

class SystemAuditLog extends Model { }

SystemAuditLog.init(
    {
        log_id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        actor_user_id: {
            type: DataTypes.UUID,
            allowNull: true,
            references: {
                model: 'users',
                key: 'user_id',
            },
        },
        actor_code: {
            type: DataTypes.STRING(50),
            allowNull: true,
        },
        actor_role: {
            type: DataTypes.STRING(50),
            allowNull: true,
        },
        action: {
            type: DataTypes.STRING(50),
            allowNull: false,
        },
        entity_type: {
            type: DataTypes.STRING(50),
            allowNull: false,
        },
        entity_id: {
            type: DataTypes.UUID,
            allowNull: true,
        },
        old_value: {
            type: DataTypes.JSON,
            allowNull: true,
        },
        new_value: {
            type: DataTypes.JSON,
            allowNull: true,
        },
        remarks: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        ip_address: {
            type: DataTypes.STRING(45),
            allowNull: true,
        },
        user_agent: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        created_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
    },
    {
        sequelize,
        modelName: 'SystemAuditLog',
        tableName: 'system_audit_log',
        timestamps: false,
    }
);

export default SystemAuditLog;

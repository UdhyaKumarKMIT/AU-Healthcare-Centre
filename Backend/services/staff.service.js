import { StaffDetails } from '../models/sequelize/index.js';
import ApiError from '../utils/ApiError.js';

const ALLOWED_FIELDS = ['user_id', 'name', 'role', 'code', 'phone', 'email', 'status'];

export const createStaff = async ({ name, role, code, phone, email, status }) => {
    if (!name || !role || !code) {
        throw new ApiError(400, ' name, role and code are required');
    }

    const existing = await StaffDetails.findOne({ where: { code } });
    if (existing) {
        throw new ApiError(409, 'Staff code already exists');
    }

    const staff = await StaffDetails.create({
        name,
        role,
        code,
        phone: phone || null,
        email: email || null,
        status: status || 'ACTIVE',
    });

    return staff;
};

export const getAllStaff = async ({ role, status }) => {
    const where = {};
    if (role) {
        where.role = role;
    }
    if (status) {
        where.status = status;
    }

    const staff = await StaffDetails.findAll({
        where,
        order: [['name', 'ASC']],
    });

    return staff;
};

export const getStaffById = async (staff_id) => {
    const staff = await StaffDetails.findByPk(staff_id);
    return staff;
};

export const updateStaff = async (staff_id, updates) => {
    const staff = await StaffDetails.findByPk(staff_id);
    if (!staff) {
        return null;
    }

    for (const key of ALLOWED_FIELDS) {
        if (Object.prototype.hasOwnProperty.call(updates, key)) {
            staff[key] = updates[key];
        }
    }

    if (updates.code && updates.code !== staff.code) {
        const existing = await StaffDetails.findOne({ where: { code: updates.code } });
        if (existing && existing.staff_id !== staff_id) {
            throw new ApiError(409, 'Staff code already exists');
        }
    }

    await staff.save();
    return staff;
};

export const deleteStaff = async (staff_id) => {
    const deletedCount = await StaffDetails.destroy({ where: { staff_id } });
    return deletedCount > 0;
};

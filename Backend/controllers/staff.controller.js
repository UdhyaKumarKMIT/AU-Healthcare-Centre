import * as staffService from '../services/staff.service.js';

export const createStaff = async (req, res, next) => {
    try {
        const {  name, role, code, phone, email, status } = req.body;

        if (!name || !role || !code) {
            return res.status(400).json({
                success: false,
                message: 'name, role and code are required',
            });
        }

        const staff = await staffService.createStaff({
            name,
            role,
            code,
            phone,
            email,
            status,
        });

        res.status(201).json({ success: true, data: staff });
    } catch (err) {
        next(err);
    }
};

export const getStaff = async (req, res, next) => {
    try {
        const { role, status } = req.query;
        const staff = await staffService.getAllStaff({ role, status });
        res.json({ success: true, data: staff, count: staff.length });
    } catch (err) {
        next(err);
    }
};

export const getStaffById = async (req, res, next) => {
    try {
        const { staff_id } = req.params;
        const staff = await staffService.getStaffById(staff_id);

        if (!staff) {
            return res.status(404).json({ success: false, message: 'Staff not found' });
        }

        res.json({ success: true, data: staff });
    } catch (err) {
        next(err);
    }
};

export const updateStaff = async (req, res, next) => {
    try {
        const { staff_id } = req.params;
        const staff = await staffService.updateStaff(staff_id, req.body);

        if (!staff) {
            return res.status(404).json({ success: false, message: 'Staff not found' });
        }

        res.json({ success: true, data: staff });
    } catch (err) {
        next(err);
    }
};

export const deleteStaff = async (req, res, next) => {
    try {
        const { staff_id } = req.params;
        const ok = await staffService.deleteStaff(staff_id);

        if (!ok) {
            return res.status(404).json({ success: false, message: 'Staff not found' });
        }

        res.json({ success: true, message: 'Staff deleted' });
    } catch (err) {
        next(err);
    }
};

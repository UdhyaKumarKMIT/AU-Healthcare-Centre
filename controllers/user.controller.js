import * as userService from '../services/user.service.js';

export const createUser = async (req, res, next) => {
    try {
        const { username, password, role, status } = req.body;

        if (!username || !password || !role) {
            return res.status(400).json({
                success: false,
                message: 'username, password and role are required',
            });
        }

        const user = await userService.createUser({
            username,
            password,
            role,
            status ,
        });

        res.status(201).json({ success: true, data: user });
    } catch (err) {
        next(err);
    }
};

export const getUsers = async (req, res, next) => {
    try {
        const users = await userService.getAllUsers();
        res.json({ success: true, data: users });
    } catch (err) {
        next(err);
    }
};

export const getUserById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const user = await userService.getUserById(id);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.json({ success: true, data: user });
    } catch (err) {
        next(err);
    }
};

export const updateUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        const user = await userService.updateUser(id, req.body);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.json({ success: true, data: user });
    } catch (err) {
        next(err);
    }
};

export const deleteUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        const ok = await userService.deleteUser(id);

        if (!ok) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.json({ success: true, message: 'User deleted' });
    } catch (err) {
        next(err);
    }
};

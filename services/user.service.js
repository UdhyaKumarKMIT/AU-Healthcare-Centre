import { User } from '../models/sequelize/index.js';
import bcrypt from 'bcrypt';

export const createUser = async ({ username, password, role, status }) => {
    const password_hash = await bcrypt.hash(password, 10);
    const user = await User.create({ username, password_hash, role, status });
    return user;
};

export const getAllUsers = async () => {
    const users = await User.findAll({ order: [['created_at', 'DESC']] });
    return users;
};

export const getUserById = async (user_id) => {
    const user = await User.findByPk(user_id);
    return user;
};

export const updateUser = async (user_id, updates) => {
    const user = await User.findByPk(user_id);
    if (!user) return null;

    const allowedFields = ['username', 'role', 'status'];
    for (const key of allowedFields) {
        if (Object.prototype.hasOwnProperty.call(updates, key)) {
            user[key] = updates[key];
        }
    }

    if (Object.prototype.hasOwnProperty.call(updates, 'password') && updates.password) {
        user.password_hash = await bcrypt.hash(updates.password, 10);
    }

    await user.save();
    return user;
};

export const deleteUser = async (user_id) => {
    const deletedCount = await User.destroy({ where: { user_id } });
    return deletedCount > 0;
};

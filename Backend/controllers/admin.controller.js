import {createUser as createUserService} from '../services/admin.service.js';

export const createUser = async (req, res, next) => {
    try {
        const user = await createUserService(req.body);
        res.status(201).json({ message: 'User created successfully', user});
    } catch(error) {
        next(error);
    }
};
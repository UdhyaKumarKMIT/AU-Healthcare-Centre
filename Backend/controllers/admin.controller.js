const adminService = require('../services/admin.service');

const createUser = async (req, res, next) => {
    try {
        const user = await adminService.createUser(req.body);
        res.status(201).json({ message: 'User created successfully', user});
    } catch(error) {
        next(error);
    }
};

module.exports = {
    createUser
};
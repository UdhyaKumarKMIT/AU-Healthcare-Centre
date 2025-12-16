const adminService = require('../services/admin.service');

const createUser = async (req, res) => {
    try {
        const user = await adminService.createUser(req.body);
        res.status(201).json({ message: 'User created successfully', user});
    } catch(error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = {
    createUser
};
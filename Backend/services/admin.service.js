const bcrypt = require('bcrypt');
const user = require('../models/user.model');
const ROLES = require('../constants/roles');
const ApiError = require('../utils/ApiError');

const createUser = async ({name, email, password, role}) => {
    if(!name || !email || !password || !role) {
        throw new ApiError(400, 'All fields are required');
    }
    if(!Object.values(ROLES).includes(role)) {
        throw new ApiError(400, 'Invalid role specified');
    }
    const existingUser = await user.findByEmail(email);
    if(existingUser) {
        throw new ApiError(409, 'User with this email already exists');
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = await user.createUser({name, email, password: hashedPassword, role});
    return {id: userId, name, email, role};
};

module.exports = {
    createUser
};
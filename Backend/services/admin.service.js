const bcrypt = require('bcrypt');
const user = require('../models/user.model');
const ROLES = require('../constants/roles');

const createUser = async ({name, email, password, role}) => {
    if(!name || !email || !password || !role) {
        throw new Error('All fields are required');
    }
    if(!Object.values(ROLES).includes(role)) {
        throw new Error('Invalid role specified');
    }
    const existingUser = await user.findByEmail(email);
    if(existingUser) {
        throw new Error('User with this email already exists');
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = await user.createUser({name, email, password: hashedPassword, role});
    return {id: userId, name, email, role};
};

module.exports = {
    createUser
};
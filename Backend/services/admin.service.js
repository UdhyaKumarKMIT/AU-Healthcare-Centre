import bcrypt from 'bcrypt';
import * as user from '../models/user.model.js';
import ROLES from '../constants/roles.js';
import ApiError from '../utils/ApiError.js';

export const createUser = async ({name, email, password, role}) => {
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

// module.exports = {
//     createUser
// };
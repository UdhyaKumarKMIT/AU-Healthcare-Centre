import * as authService from '../services/auth.service.js';
import ApiError from '../utils/ApiError.js';

export const login = async (req, res, next) => {
  try {
    const { username, password, role } = req.body;
    
    if (!username || !password || !role) {
      throw new ApiError(400, 'Username, password, and role are required');
    }
    
    const result = await authService.login(username, password, role);
    res.json(result);
  } catch (error) {
    next(error);
  }
};
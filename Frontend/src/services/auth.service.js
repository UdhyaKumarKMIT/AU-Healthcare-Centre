import api from './api';

export const loginUserApi = (username, password, role) => {
  return api.post('/auth/login', { username, password, role });
};

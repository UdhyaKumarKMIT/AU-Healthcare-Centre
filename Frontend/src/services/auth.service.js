import api from './api';

export const loginUserApi = (email, password) => {
  return api.post('/auth/login', { email, password });
};

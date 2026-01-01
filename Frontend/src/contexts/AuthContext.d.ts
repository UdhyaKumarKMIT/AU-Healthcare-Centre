import React from 'react';

export interface User {
  user_id?: number;
  doctor_id?: number;
  nurse_id?: number;
  receptionist_id?: number;
  pharmacist_id?: number;
  student_id?: string;
  name?: string;
  email?: string;
  phone?: string;
  role?: string;
  token?: string;
  [key: string]: any;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (userData: User, token: string) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
}

export const useAuth: () => AuthContextType;
export const AuthProvider: React.FC<{ children: React.ReactNode }>;

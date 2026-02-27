import React, { createContext, useState, useContext, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Helper function to get role-based default route
const getRoleBasedRoute = (role) => {
  switch (role?.toUpperCase()) {
    case 'DOCTOR':
      return '/doctor/dashboard';
    case 'NURSE_RECEPTIONIST':
      return '/reception/dashboard';
    case 'ADMIN':
      return '/admin/dashboard';
    case 'PATIENT':
      return '/patient/dashboard';
    case 'PHARMACIST':
      return '/pharmacist/dashboard';
    case 'CLERICAL_ASSISTANT':
      return '/clerical_assistant/dashboard';
    case 'LAB_TECHNICIAN':
      return '/labtech/dashboard';
    default:
      return '/';
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialRoute, setInitialRoute] = useState(null);

  useEffect(() => {
    // Check for stored user session and validate token
    const storedUser = localStorage.getItem('mitHealthUser');
    const token = localStorage.getItem('token');

    if (storedUser && token) {
      try {
        // Decode and validate JWT token
        const decoded = jwtDecode(token);
        const currentTime = Date.now() / 1000;

        // Check if token is expired
        if (decoded.exp && decoded.exp < currentTime) {
          // Token expired - clear everything
          console.log('🔒 Token expired, clearing session');
          localStorage.removeItem('mitHealthUser');
          localStorage.removeItem('user');
          localStorage.removeItem('token');
          setUser(null);
          setInitialRoute('/login');
        } else {
          // Token is valid
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);

          // Set initial route based on user role if on root or login page
          const currentPath = window.location.pathname;
          if (currentPath === '/' || currentPath === '/login' || currentPath.startsWith('/login/')) {
            const roleRoute = getRoleBasedRoute(parsedUser.role);
            setInitialRoute(roleRoute);
          }
        }
      } catch (error) {
        console.error('❌ Token validation error:', error);
        // Invalid token - clear everything
        localStorage.removeItem('mitHealthUser');
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        setUser(null);
        setInitialRoute('/login');
      }
    }

    setLoading(false);
  }, []);

  const login = (userData, token) => {
    const userWithToken = {
      ...userData,
      token
    };
    setUser(userWithToken);

    localStorage.setItem('token', token);

    // Keep both keys for backward compatibility across the codebase
    localStorage.setItem('mitHealthUser', JSON.stringify(userWithToken));
    localStorage.setItem('user', JSON.stringify(userWithToken));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('mitHealthUser');
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  const updateUser = (updates) => {
    setUser(prev => {
      const updatedUser = { ...prev, ...updates };
      localStorage.setItem('mitHealthUser', JSON.stringify(updatedUser));
      return updatedUser;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        updateUser,
        isAuthenticated: !!user,
        isRoleSpecific: user?.isRoleSpecific || false,
        initialRoute,
        getRoleBasedRoute
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
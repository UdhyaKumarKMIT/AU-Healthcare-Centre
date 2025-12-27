import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored user session
    const storedUser = localStorage.getItem('mitHealthUser');
    const token = localStorage.getItem('token');
    if (storedUser && token) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (error) {
        localStorage.removeItem('mitHealthUser');
        localStorage.removeItem('token');
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
    
    localStorage.setItem('mitHealthUser', JSON.stringify(userWithToken));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('mitHealthUser');
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
        updateUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
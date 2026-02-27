import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { useAuth } from "../contexts/AuthContext";

const ProtectedRoute = ({ allowedRoles }) => {
  const { user, loading, getRoleBasedRoute } = useAuth();
  const token = localStorage.getItem("token");

  if (loading) {
    return <div>Loading...</div>;
  }

  // If token is missing, force login flow
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Validate token expiration
  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;

    if (decoded.exp && decoded.exp < currentTime) {
      // Token expired - clear storage and redirect to login
      console.log('🔒 Token expired in ProtectedRoute');
      localStorage.removeItem('token');
      localStorage.removeItem('mitHealthUser');
      localStorage.removeItem('user');
      return <Navigate to="/login" replace />;
    }
  } catch (err) {
    console.error('❌ Invalid token:', err);
    localStorage.removeItem('token');
    localStorage.removeItem('mitHealthUser');
    localStorage.removeItem('user');
    return <Navigate to="/login" replace />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const normalizedRole = String(user.role || '').trim().toUpperCase();

  if (allowedRoles && !allowedRoles.includes(normalizedRole)) {
    const roleRoute = getRoleBasedRoute(user.role);
    return <Navigate to={roleRoute} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;

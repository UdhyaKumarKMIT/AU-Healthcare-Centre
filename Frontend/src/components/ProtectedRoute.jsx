import React, { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { useAuth } from "../contexts/AuthContext";

const ProtectedRoute = ({ allowedRoles }) => {
  const { user, loading, getRoleBasedRoute, login } = useAuth();
  const token = localStorage.getItem("token");
  const [didTryRehydrate, setDidTryRehydrate] = useState(false);

  // If we have a token but the in-memory user is missing (common immediately
  // after login/navigation), rehydrate the user from localStorage to avoid a
  // blank screen or spurious redirects.
  useEffect(() => {
    if (loading) return;
    if (!token) return;
    if (user) return;
    if (didTryRehydrate) return;

    setDidTryRehydrate(true);

    const storedUser =
      localStorage.getItem("mitHealthUser") || localStorage.getItem("user");

    if (!storedUser) return;

    try {
      const parsedUser = JSON.parse(storedUser);
      // Leverage existing login() to keep storage keys consistent.
      login(parsedUser, token);
    } catch {
      // Ignore parse errors and let normal redirect logic handle it.
    }
  }, [loading, token, user, didTryRehydrate, login]);

  if (loading) {
    return <div>Loading...</div>;
  }

  // While we attempt a one-time rehydrate, keep UI stable.
  if (token && !user && !didTryRehydrate) {
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

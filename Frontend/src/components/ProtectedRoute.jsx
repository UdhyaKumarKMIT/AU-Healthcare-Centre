import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { useAuth } from "../contexts/AuthContext";

const ProtectedRoute = ({ allowedRoles }) => {
  const token = localStorage.getItem("token");

  // Check token for PHARMACIST role only
  if (allowedRoles.includes("PHARMACIST")) {
    if (!token) {
      return <Navigate to="/login" replace />;
    }

    try {
      const decoded = jwtDecode(token);
      if (!decoded.role || decoded.role !== "PHARMACIST") {
        return <Navigate to="/" replace />;
      }
    } catch (err) {
      localStorage.removeItem("token");
      return <Navigate to="/login" replace />;
    }

    return <Outlet />;
  }

  // For other roles, use AuthContext
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    switch (user.role) {
      case "DOCTOR":
        return <Navigate to="/doctor/dashboard" replace />;
      case "RECEPTIONIST":
        return <Navigate to="/reception/dashboard" replace />;
      case "ADMIN":
        return <Navigate to="/admin/dashboard" replace />;
      case "PATIENT":
        return <Navigate to="/" replace />;
      default:
        return <Navigate to="/login" replace />;
    }
  }

  return <Outlet />;
};

export default ProtectedRoute;

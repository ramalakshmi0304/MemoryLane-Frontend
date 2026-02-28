// src/routes/ProtectedRoute.jsx
import { Navigate, Outlet } from "react-router-dom"; // Added Outlet
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children, roles = [] }) => {
  const { user } = useAuth();

  // 1. Not logged in? Redirect to login
  if (!user) return <Navigate to="/login" replace />;

  // 2. Logged in but wrong role? Redirect to dashboard
  if (roles.length > 0 && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  // 3. Render children (if used as a wrapper) or Outlet (if used as a layout route)
  return children ? children : <Outlet />;
};

export default ProtectedRoute;
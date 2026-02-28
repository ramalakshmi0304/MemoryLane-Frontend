import React from "react";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";

// Auth Pages
import Login from "../pages/Login";
import Register from "../pages/Register";

// Feature Pages
import Home from "../pages/Home"; 
import Dashboard from "../pages/Dashboard"; 
import Timeline from "../pages/Timeline";
import Albums from "../pages/Albums";
import Reminisce from "../pages/Reminisce";
import CreateMemory from "../pages/CreateMemory";
import AdminDashboard from "../pages/AdminDashboard";
import AlbumDetail from "@/components/AlbumDetail";
import Milestones from "@/pages/Milestones";

// Components
import Navbar from "../components/Navbar";

const AppRoutes = ({ darkMode, toggleDarkMode }) => {
  const location = useLocation();

  const authRoutes = ["/login", "/register"];
  const hideNavbar = authRoutes.includes(location.pathname);

  // Helper to determine the default landing page based on role
  const getRedirectPath = () => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    if (!token) return "/";
    // If admin, their primary "Dashboard" is the AdminConsole page
    return user.role === "admin" ? "/admin" : "/dashboard";
  };

  return (
    <>
      {!hideNavbar && (
        <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
      )}

      <Routes>
        {/* --- Public Landing Page --- */}
        <Route path="/" element={<Home />} />
        
        {/* --- Auth routes --- */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/shared/v1/:slug" element={<AlbumDetail isPublicView={true} />} />

        {/* --- User Gallery Routes (Shared) --- */}
        <Route element={<ProtectedRoute roles={["admin", "user"]} />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/timeline" element={<Timeline />} />
          <Route path="/albums" element={<Albums />} />
          <Route path="/albums/:id" element={<AlbumDetail />} />
          <Route path="/reminisce" element={<Reminisce />} />
          <Route path="/create" element={<CreateMemory />} /> 
          <Route path="/milestones" element={<Milestones />} />
        </Route>

        {/* --- Admin Only Page --- */}
        <Route element={<ProtectedRoute roles={["admin"]} />}>
          <Route path="/admin" element={<AdminDashboard />} />
        </Route>

        {/* --- Error routes --- */}
        <Route
          path="/unauthorized"
          element={
            <div className="flex items-center justify-center min-h-screen">
              <h1 className="text-3xl font-bold text-red-600">403 - Unauthorized Access</h1>
            </div>
          }
        />

        {/* --- THE FIX: Smart Fallback Redirection --- */}
        <Route
          path="*"
          element={<Navigate to={getRedirectPath()} replace />}
        />
      </Routes>
    </>
  );
};

export default AppRoutes;
import { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";

import { AuthContext } from "../context/AuthContext";

function ProtectedRoute() {
  const { token, loading } = useContext(AuthContext);

  // Wait until authentication restoration finishes
  if (loading) {
    return <p>Checking authentication...</p>;
  }

  // Redirect if user is not authenticated
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Allow access
  return <Outlet />;
}

export default ProtectedRoute;

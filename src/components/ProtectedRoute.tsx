import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import type { UserRole } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: NonNullable<UserRole>[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { user, role, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loader"></div>
        <p>Verifying access...</p>
      </div>
    );
  }

  if (!user) {
    // Redirect to landing page but save the attempted location
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  if (allowedRoles && role && !allowedRoles.includes(role)) {
    // Role not authorized, redirect to unauthorized page or dashboard
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;

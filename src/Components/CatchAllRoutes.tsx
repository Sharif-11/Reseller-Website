import { Navigate, useLocation } from 'react-router-dom';
import { Role } from '../types/user.types';
import { useAuth } from '../Hooks/useAuth';


interface CatchAllRouteProps {
  children?: never; // Ensures no children can be passed
  redirectTo?: string;
  role?: Role; // Optional role restriction
}

/**
 * A catch-all route component that:
 * 1. Handles 404/undefined routes
 * 2. Can optionally enforce role-based access
 * 3. Provides customizable redirect behavior
 */
const CatchAllRoute = ({ 
  redirectTo = '/', 
  role 
}: CatchAllRouteProps) => {
  const { user } = useAuth();
  const location = useLocation();

  // Handle role-based restrictions if specified
  if (role) {
    if (!user) {
      return <Navigate to="/login" state={{ from: location }} replace />;
    }
    if (user.role !== role) {
      return <Navigate to="/not-authorized" replace />;
    }
  }

  // Default behavior for undefined routes
  return (
    <Navigate 
      to={redirectTo} 
      state={{ 
        from: location,
        is404: true // Additional state to identify 404 redirects
      }} 
      replace 
    />
  );
};

export default CatchAllRoute;
import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireAdmin = false 
}) => {
  const { user, isAuthenticated } = useAuth();

  // Verificar autenticación
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // Verificar permisos de admin si se requiere
  if (requireAdmin && user?.rol !== 'Administrador Site') {
    return <Navigate to="/" />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
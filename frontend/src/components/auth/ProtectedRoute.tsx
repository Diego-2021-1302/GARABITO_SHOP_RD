import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ('admin' | 'customer' | 'driver' | 'vendor')[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { isAuthenticated, user, _hasHydrated, token } = useAuthStore();
  const location = useLocation();

  // Si el store aún no ha terminado de cargar los datos del localStorage, mostramos un loader
  if (!_hasHydrated) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-white dark:bg-brand-dark">
        <div className="w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Si no hay token físico o no está autenticado, redirigir al login
  if (!token || !isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Verificación de ROL (asegurando que coincida con el backend)
  if (allowedRoles) {
    // Si no hay usuario o no tiene rol, denegar acceso por seguridad
    if (!user?.role) {
      console.error("Acceso denegado: Usuario sin rol definido");
      return <Navigate to="/" replace />;
    }

    const userRole = user.role.toLowerCase();
    const isAuthorized = allowedRoles.some(role => role.toLowerCase() === userRole);
    
    if (!isAuthorized) {
      console.warn(`Acceso denegado: El rol '${user.role}' no tiene permiso para ${location.pathname}`);
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;

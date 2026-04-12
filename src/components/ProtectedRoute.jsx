import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ roles }) {
  const { user, logout } = useAuth();
  
  // Verificar si hay un usuario autenticado o si es modo cliente (sin token)
  const isClientMode = typeof window !== 'undefined' && localStorage.getItem('clientEmail');
  const hasUser = user || isClientMode;
  
  if (!hasUser) return <Navigate to="/login" replace />;
  
  // Si el usuario está bloqueado, cerramos sesión y redirigimos al login
  if (user?.status === 'blocked') {
    logout();
    return <Navigate to="/login" replace />;
  }
  
  // Determinar el rol efectivo (usuario autenticado o cliente por email)
  const effectiveRole = user?.role || (isClientMode ? 'client' : null);
  if (roles && !roles.includes(effectiveRole)) return <Navigate to="/" replace />;
  
  return <Outlet />;
}

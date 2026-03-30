import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ roles }) {
  const { user, logout } = useAuth();
  
  if (!user) return <Navigate to="/login" replace />;
  
  // Si el usuario está bloqueado, cerramos sesión y redirigimos al login
  if (user.status === 'blocked') {
    logout();
    return <Navigate to="/login" replace />;
  }
  
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  
  return <Outlet />;
}

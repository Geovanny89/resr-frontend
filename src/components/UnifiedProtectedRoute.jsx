import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEmbeddedSlug } from '../hooks/useEmbeddedSlug';

/**
 * Componente UnifiedProtectedRoute
 * 
 * Protege rutas y detecta automáticamente el rol del usuario.
 * Si la app está embebida con un slug, verifica que el usuario pertenezca a ese negocio.
 * 
 * Soporta:
 * - Admin: Acceso a /admin/*
 * - Empleado: Acceso a /employee/*
 * - Cliente: Acceso a /my-appointments
 * - Público: Acceso a /:slug (sin autenticación)
 */
export default function UnifiedProtectedRoute({ 
  children, 
  roles = ['admin', 'employee', 'client'],
  requireAuth = true 
}) {
  const { token, user, business } = useAuth();
  const { embeddedSlug, isEmbedded } = useEmbeddedSlug();

  // Si no hay token y se requiere autenticación
  if (requireAuth && !token) {
    return <Navigate to="/login" replace />;
  }

  // Si hay token pero no hay usuario
  if (token && !user) {
    return <Navigate to="/login" replace />;
  }

  // Si se requiere un rol específico y el usuario no lo tiene
  if (requireAuth && roles.length > 0 && !roles.includes(user?.role)) {
    return <Navigate to="/login" replace />;
  }

  // Si la app está embebida, verificar que el usuario pertenezca al negocio
  if (isEmbedded && embeddedSlug) {
    // Para admins: verificar que el negocio coincida
    if (user?.role === 'admin' && business?.slug !== embeddedSlug) {
      return (
        <div style={{
          padding: 32,
          textAlign: 'center',
          color: '#e53e3e',
          background: '#fff5f5',
          borderRadius: 8,
          margin: 16
        }}>
          <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>
            ⚠️ Acceso Denegado
          </p>
          <p style={{ fontSize: 14, color: '#c53030' }}>
            Esta app está configurada para el negocio <strong>{embeddedSlug}</strong>.
            Tu cuenta pertenece a <strong>{business?.slug}</strong>.
          </p>
        </div>
      );
    }

    // Para empleados: verificar que el negocio coincida
    if (user?.role === 'employee') {
      // El empleado debe estar vinculado al negocio embebido
      // Esto se valida en el backend, aquí solo mostramos un mensaje
      if (business?.slug !== embeddedSlug) {
        return (
          <div style={{
            padding: 32,
            textAlign: 'center',
            color: '#e53e3e',
            background: '#fff5f5',
            borderRadius: 8,
            margin: 16
          }}>
            <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>
              ⚠️ Acceso Denegado
            </p>
            <p style={{ fontSize: 14, color: '#c53030' }}>
              No tienes permiso para acceder a esta app.
            </p>
          </div>
        );
      }
    }

    // Para clientes: no hay restricción de negocio
    // Los clientes pueden ver sus citas de cualquier negocio
  }

  return children;
}

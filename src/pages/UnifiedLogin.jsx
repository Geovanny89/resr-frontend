import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEmbeddedSlug } from '../hooks/useEmbeddedSlug';
import api from '../api/client';

export default function UnifiedLogin() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { embeddedSlug, isEmbedded } = useEmbeddedSlug();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = { email, password };
      
      // Si la app está embebida, enviar el slug para validación
      if (isEmbedded && embeddedSlug) {
        payload.businessSlug = embeddedSlug;
      }

      const res = await api.post('/auth/login', payload);
      
      // Guardar token y datos
      login(res.data.token, res.data.user, res.data.business);

      // Guardar slug embebido en localStorage si aplica
      if (isEmbedded && embeddedSlug) {
        localStorage.setItem('kdice_embedded_slug', embeddedSlug);
      }

      // Redirigir según rol
      if (res.data.user.role === 'admin') {
        navigate('/admin');
      } else if (res.data.user.role === 'employee') {
        navigate('/employee');
      } else if (res.data.user.role === 'client') {
        navigate('/my-appointments');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon">🎲</div>
          <h1>KDice</h1>
          <p>Sistema de Gestión de Citas</p>
        </div>

        {isEmbedded && embeddedSlug && (
          <div style={{
            background: '#dbeafe',
            color: '#1e40af',
            padding: 12,
            borderRadius: 8,
            marginBottom: 20,
            fontSize: 13,
            textAlign: 'center',
            fontWeight: 500
          }}>
            📱 App Embebida: <strong>{embeddedSlug}</strong>
          </div>
        )}

        <form onSubmit={handleLogin}>
          {error && (
            <div className="alert alert-error" style={{ marginBottom: 16 }}>
              {error}
            </div>
          )}

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className="btn-primary"
            style={{ width: '100%', marginTop: 20 }}
            disabled={loading}
          >
            {loading ? '⏳ Iniciando sesión...' : '🔓 Iniciar Sesión'}
          </button>
        </form>

        <div style={{ marginTop: 20, textAlign: 'center', fontSize: 13, color: 'var(--text-muted)' }}>
          ¿No tienes cuenta?{' '}
          <a
            href="/register"
            style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}
          >
            Regístrate aquí
          </a>
        </div>
      </div>
    </div>
  );
}

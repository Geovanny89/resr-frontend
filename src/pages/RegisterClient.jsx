import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/client';

export default function RegisterClient() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.name || !form.email || !form.password || !form.confirm) {
      setError('Todos los campos son requeridos');
      return;
    }

    if (form.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (form.password !== form.confirm) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/register', {
        name: form.name,
        email: form.email,
        password: form.password,
        role: 'client'
      });

      // Redirigir a login
      navigate('/login?registered=true');
    } catch (err) {
      setError(err.response?.data?.error || 'Error al registrarse');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px'
    }}>
      <style>{`
        @media (max-width: 480px) {
          .register-client-card { padding: 20px !important; }
        }
      `}</style>
      <div style={{
        background: 'white',
        borderRadius: 12,
        padding: 40,
        maxWidth: 420,
        width: '100%',
        boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
      }} className="register-client-card">
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8, color: '#2d3748' }}>
            Registrarse como Cliente
          </h1>
          <p style={{ color: '#718096', fontSize: 14 }}>
            Crea tu cuenta para reservar citas
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 16 }}>
          {error && (
            <div style={{
              background: '#fed7d7',
              color: '#c53030',
              padding: 12,
              borderRadius: 6,
              fontSize: 14,
              border: '1px solid #fc8181'
            }}>
              {error}
            </div>
          )}

          <div>
            <label style={{
              display: 'block',
              fontSize: 13,
              fontWeight: 600,
              marginBottom: 6,
              color: '#4a5568'
            }}>
              Nombre completo
            </label>
            <input
              type="text"
              name="name"
              placeholder="Tu nombre"
              value={form.name}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #e2e8f0',
                borderRadius: 6,
                fontSize: 14,
                fontFamily: 'inherit',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={e => e.target.style.borderColor = '#667eea'}
              onBlur={e => e.target.style.borderColor = '#e2e8f0'}
            />
          </div>

          <div>
            <label style={{
              display: 'block',
              fontSize: 13,
              fontWeight: 600,
              marginBottom: 6,
              color: '#4a5568'
            }}>
              Email
            </label>
            <input
              type="email"
              name="email"
              placeholder="tu@email.com"
              value={form.email}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #e2e8f0',
                borderRadius: 6,
                fontSize: 14,
                fontFamily: 'inherit',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={e => e.target.style.borderColor = '#667eea'}
              onBlur={e => e.target.style.borderColor = '#e2e8f0'}
            />
          </div>

          <div>
            <label style={{
              display: 'block',
              fontSize: 13,
              fontWeight: 600,
              marginBottom: 6,
              color: '#4a5568'
            }}>
              Contraseña
            </label>
            <input
              type="password"
              name="password"
              placeholder="Mínimo 6 caracteres"
              value={form.password}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #e2e8f0',
                borderRadius: 6,
                fontSize: 14,
                fontFamily: 'inherit',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={e => e.target.style.borderColor = '#667eea'}
              onBlur={e => e.target.style.borderColor = '#e2e8f0'}
            />
          </div>

          <div>
            <label style={{
              display: 'block',
              fontSize: 13,
              fontWeight: 600,
              marginBottom: 6,
              color: '#4a5568'
            }}>
              Confirmar contraseña
            </label>
            <input
              type="password"
              name="confirm"
              placeholder="Repite tu contraseña"
              value={form.confirm}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #e2e8f0',
                borderRadius: 6,
                fontSize: 14,
                fontFamily: 'inherit',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={e => e.target.style.borderColor = '#667eea'}
              onBlur={e => e.target.style.borderColor = '#e2e8f0'}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              background: loading ? '#cbd5e0' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              padding: '12px',
              fontSize: 16,
              fontWeight: 600,
              borderRadius: 6,
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              marginTop: 8
            }}
            onMouseEnter={e => {
              if (!loading) {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)';
              }
            }}
            onMouseLeave={e => {
              if (!loading) {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }
            }}
          >
            {loading ? '⏳ Registrando...' : '✅ Registrarse'}
          </button>
        </form>

        {/* Footer */}
        <div style={{
          textAlign: 'center',
          marginTop: 24,
          paddingTop: 24,
          borderTop: '1px solid #e2e8f0'
        }}>
          <p style={{ color: '#718096', fontSize: 14 }}>
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" style={{
              color: '#667eea',
              fontWeight: 600,
              textDecoration: 'none'
            }}>
              Inicia sesión
            </Link>
          </p>
          <p style={{ color: '#a0aec0', fontSize: 13, marginTop: 12 }}>
            ¿Eres vendedor?{' '}
            <Link to="/register-vendor" style={{
              color: '#667eea',
              fontWeight: 600,
              textDecoration: 'none'
            }}>
              Crea tu negocio aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

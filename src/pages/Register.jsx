import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api/client';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');

    if (form.password !== form.confirm) {
      setError('Las contraseñas no coinciden'); return;
    }
    if (form.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres'); return;
    }

    setLoading(true);
    try {
      await api.post('/auth/register', {
        name: form.name,
        email: form.email,
        password: form.password,
        role: 'client',
      });
      setSuccess('¡Cuenta creada! Redirigiendo al login...');
      setTimeout(() => navigate('/login'), 1800);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al registrarse');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      alignItems: 'center', justifyContent: 'center', background: '#f5f6fa',
    }}>
      <div className="card" style={{ width: '100%', maxWidth: 380, margin: '0 12px' }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>📱</div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#667eea' }}>k-dice</h1>
          <p style={{ fontSize: 13, color: '#718096', marginTop: 4 }}>Crear cuenta</p>
        </div>

        {error   && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nombre completo</label>
            <input
              type="text" required placeholder="Ej: Juan Pérez"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email" required placeholder="tu@email.com"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Contraseña</label>
            <input
              type="password" required placeholder="Mínimo 6 caracteres"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Confirmar contraseña</label>
            <input
              type="password" required placeholder="Repite la contraseña"
              value={form.confirm}
              onChange={e => setForm({ ...form, confirm: e.target.value })}
            />
          </div>

          <button
            className="btn-primary" type="submit"
            style={{ width: '100%', padding: '10px', marginTop: 8 }}
            disabled={loading}
          >
            {loading ? 'Creando cuenta...' : 'Registrarse'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: 13, color: '#718096', marginTop: 18 }}>
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" style={{ color: '#667eea', fontWeight: 600 }}>Inicia sesión</Link>
        </p>
      </div>
    </div>
  );
}

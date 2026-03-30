import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import { Mail, Lock, Eye, EyeOff, LogIn } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const [form, setForm]       = useState({ email: '', password: '' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw]   = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/login', form);
      login(res.data.token, res.data.user, res.data.business);
      const role = res.data.user.role;
      if (role === 'admin') navigate('/admin');
      else if (role === 'employee') navigate('/employee');
      else if (role === 'superadmin') navigate('/superadmin');
      else navigate('/my-appointments');
      } catch (err) {
        if (!err.response) {
          setError('No se pudo conectar al servidor. Revisa tu internet o la configuración del servidor.');
          console.error('Network Error:', err);
        } else {
          // Intentar obtener el mensaje de error del servidor
          const serverError = err.response.data?.error || err.response.data?.message || 'Error al iniciar sesión';
          setError(serverError);
          console.error('Login Error:', err.response.status, err.response.data);
        }
      } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo" style={{ textAlign: 'center' }}>
          <div style={{
            width: 100,
            height: 100,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #FF5E00 0%, #E0007F 50%, #4B0082 100%)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 20,
            overflow: 'hidden',
            boxShadow: '0 8px 24px rgba(255, 94, 0, 0.3)',
            border: '3px solid rgba(255, 255, 255, 0.2)'
          }}>
            <img src="/kdice-logo.svg" alt="KDice Reservas" 
                 style={{ 
                   width: 140, 
                   height: 140, 
                   objectFit: 'contain',
                   filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
                 }} />
          </div>
          <p style={{
            fontSize: '16px',
            color: '#4a5568',
            fontWeight: '500',
            margin: '0',
            textAlign: 'center'
          }}>
            Sistema de gestión de citas y pagos
          </p>
        </div>
        {error && <div className="alert alert-error"><span>⚠️</span> {error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Correo electrónico</label>
            <div className="input-group">
              <Mail className="input-icon" size={16} />
              <input type="email" placeholder="tu@correo.com" value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })} required />
            </div>
          </div>
          <div className="form-group">
            <label>Contraseña</label>
            <div className="input-group" style={{ position: 'relative' }}>
              <Lock className="input-icon" size={16} />
              <input type={showPw ? 'text' : 'password'} placeholder="••••••••"
                value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                style={{ paddingRight: 40 }} required />
              <button type="button" onClick={() => setShowPw(!showPw)}
                style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', padding: 4, color: 'var(--text-muted)' }}>
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <button type="submit" className="btn-primary w-full"
            style={{ marginTop: 8, justifyContent: 'center', height: 44 }} disabled={loading}>
            {loading ? <><div className="spinner" style={{ width: 16, height: 16 }} /> Ingresando...</>
              : <><LogIn size={16} /> Iniciar sesión</>}
          </button>
        </form>
        <div className="divider" />
        <div style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-muted)' }}>
          ¿No tienes cuenta?{' '}
          <Link to="/register-vendor" style={{ color: 'var(--primary)', fontWeight: 600 }}>Regístrate aquí</Link>
        </div>
      </div>
    </div>
  );
}

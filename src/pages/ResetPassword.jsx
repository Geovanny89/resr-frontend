import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import api from '../api/client';
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('Token de recuperación no encontrado. Por favor, solicita un nuevo enlace.');
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/reset-password', {
        token,
        newPassword: password
      });
      setSuccess(true);
      // Redirigir al login después de 3 segundos
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al restablecer la contraseña. El enlace puede haber expirado.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#f1f5f9', padding: 16 }}>
      <div className="auth-card" style={{ maxWidth: 400, width: '100%', padding: 32, background: 'white', borderRadius: 16, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: '#1e293b', marginBottom: 8 }}>Restablecer contraseña</h2>
          <p style={{ fontSize: 14, color: '#64748b' }}>Crea una nueva contraseña para tu cuenta</p>
        </div>

        {error && (
          <div style={{ marginBottom: 20, padding: '12px 16px', borderRadius: 10, background: '#fee2e2', color: '#b91c1c', fontSize: 13, display: 'flex', alignItems: 'center', gap: 10 }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ color: '#059669', marginBottom: 16 }}>
              <CheckCircle size={64} style={{ margin: '0 auto' }} />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#059669', marginBottom: 8 }}>¡Contraseña actualizada!</h3>
            <p style={{ fontSize: 14, color: '#64748b' }}>Tu contraseña ha sido restablecida con éxito. Serás redirigido al inicio de sesión en unos segundos...</p>
            <Link to="/login" style={{ display: 'inline-block', marginTop: 24, color: 'var(--primary)', fontWeight: 700, textDecoration: 'none' }}>
              Ir al Login ahora
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group" style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 6 }}>Nueva contraseña</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input 
                  type={showPw ? 'text' : 'password'} 
                  placeholder="Mínimo 6 caracteres" 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  disabled={!!error && !token}
                  style={{ width: '100%', padding: '12px 40px 12px 40px', borderRadius: 10, border: '1.5px solid #e2e8f0', outline: 'none', fontSize: 14 }}
                />
                <button 
                  type="button" 
                  onClick={() => setShowPw(!showPw)}
                  style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 6 }}>Confirmar contraseña</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input 
                  type={showPw ? 'text' : 'password'} 
                  placeholder="Repite tu contraseña" 
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  required
                  disabled={!!error && !token}
                  style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: 10, border: '1.5px solid #e2e8f0', outline: 'none', fontSize: 14 }}
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="btn-primary"
              disabled={loading || !!error}
              style={{ width: '100%', height: 48, borderRadius: 10, background: '#4f46e5', color: 'white', border: 'none', fontWeight: 700, fontSize: 15, cursor: 'pointer', opacity: (loading || !!error) ? 0.7 : 1 }}
            >
              {loading ? 'Procesando...' : 'Restablecer contraseña'}
            </button>

            <div style={{ textAlign: 'center', marginTop: 24 }}>
              <Link to="/login" style={{ fontSize: 14, color: '#64748b', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <ArrowLeft size={16} /> Volver al inicio de sesión
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

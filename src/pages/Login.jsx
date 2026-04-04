import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import { Mail, Lock, Eye, EyeOff, LogIn, User, ArrowRight, RefreshCw, X, ArrowLeft } from 'lucide-react';
import { Capacitor } from '@capacitor/core';

export default function Login() {
  const { login, loginAsClient: authLoginAsClient } = useAuth();
  const navigate  = useNavigate();
  const [isNative, setIsNative] = useState(false);
  const [form, setForm]       = useState({ email: '', password: '' });
  const [error, setError]     = useState('');
  const [debugInfo, setDebugInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw]   = useState(false);
  
  // Detectar si es app nativa
  useEffect(() => {
    const checkNative = async () => {
      try {
        const { Capacitor } = await import('@capacitor/core');
        setIsNative(Capacitor.isNativePlatform());
      } catch (e) {
        setIsNative(false);
      }
    };
    checkNative();
  }, []);
  
  // Estados para Cliente
  const [isClientMode, setIsClientMode] = useState(false);
  const [clientEmail, setClientEmail] = useState('');
  const [clientLoading, setClientLoading] = useState(false);

  // Estados para Recuperación de Contraseña
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setDebugInfo('');
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
        setError('No se pudo conectar al servidor. Revisa tu internet o la configuración del servidor (CORS/URL).');
        setDebugInfo(`BaseURL: ${api.defaults.baseURL} | Error: ${err.message}`);
        console.error('Network Error:', err);
      } else {
        const contentType = err.response.headers?.['content-type'] || '';
        if (contentType.includes('text/html')) {
          setError(`El servidor respondió con un error (Código: ${err.response.status}). Posible error de Nginx o servidor apagado.`);
        } else {
          const serverError = err.response.data?.error || err.response.data?.message || 'Error al iniciar sesión (Verifica tus credenciales)';
          setError(serverError);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClientLogin = async (e) => {
    e.preventDefault();
    if (!clientEmail) return;
    setClientLoading(true);
    setError('');
    try {
      // Usar la nueva función del AuthContext para que el sistema reconozca al cliente
      authLoginAsClient(clientEmail);
      // Redirigir a mis citas
      navigate('/my-appointments');
    } catch (err) {
      setError('Error al ingresar como cliente');
    } finally {
      setClientLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setForgotLoading(true);
    setError('');
    try {
      await api.post('/auth/forgot-password', { email: forgotEmail });
      setForgotSuccess(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al enviar la contraseña');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="auth-page" style={{ position: 'relative' }}>
      <div className="auth-card" style={{ maxWidth: 400, width: '100%', padding: 32 }}>
        {/* Back Button - solo en web */}
        {!isNative && (
          <button 
            onClick={() => navigate('/')}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 8, 
              background: 'none', 
              border: 'none', 
              color: 'var(--text-muted)', 
              cursor: 'pointer',
              fontSize: 14,
              marginBottom: 16,
              padding: 0
            }}
          >
            <ArrowLeft size={18} />
            Volver al inicio
          </button>
        )}
        
        <div className="auth-logo" style={{ textAlign: 'center' }}>
          <div style={{
            width: 90,
            height: 90,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #FF5E00 0%, #E0007F 50%, #4B0082 100%)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 16,
            overflow: 'hidden',
            boxShadow: '0 8px 24px rgba(255, 94, 0, 0.2)',
            border: '2px solid rgba(255, 255, 255, 0.1)'
          }}>
            <img src="/kdice.png" alt="KDice Reservas" 
                 style={{ 
                   width: 120, 
                   height: 120, 
                   objectFit: 'contain',
                 }} />
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-main)', marginBottom: 4 }}>
            {isClientMode ? 'Acceso Clientes' : 'Iniciar Sesión'}
          </h2>
          <p style={{
            fontSize: '14px',
            color: 'var(--text-muted)',
            fontWeight: '500',
            margin: '0 0 24px'
          }}>
            {isClientMode ? 'Ingresa tu correo para ver tus citas' : 'Gestión de citas y pagos'}
          </p>
        </div>

        {error && (
          <div className="alert alert-error" style={{ marginBottom: 20, padding: '12px 16px', borderRadius: 10, background: '#fee2e2', color: '#b91c1c', fontSize: 13, display: 'flex', alignItems: 'flex-start', gap: 10 }}>
            <span style={{ fontSize: 16 }}>⚠️</span>
            <div style={{ flex: 1 }}>
              {error}
              {debugInfo && <div style={{ fontSize: 10, opacity: 0.7, marginTop: 4 }}>{debugInfo}</div>}
            </div>
          </div>
        )}

        {!isClientMode ? (
          /* LOGIN NEGOCIO / EMPLEADO */
          <form onSubmit={handleSubmit}>
            <div className="form-group" style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 6, color: 'var(--text-main)' }}>Correo electrónico</label>
              <div className="input-group" style={{ position: 'relative' }}>
                <Mail className="input-icon" size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  type="email" 
                  placeholder="tu@correo.com" 
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })} 
                  required 
                  style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: 10, border: '1.5px solid var(--border)', outline: 'none', fontSize: 14 }}
                />
              </div>
            </div>
            <div className="form-group" style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-main)' }}>Contraseña</label>
              </div>
              <div className="input-group" style={{ position: 'relative' }}>
                <Lock className="input-icon" size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  type={showPw ? 'text' : 'password'} 
                  placeholder="••••••••"
                  value={form.password} 
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  required 
                  style={{ width: '100%', padding: '12px 40px 12px 40px', borderRadius: 10, border: '1.5px solid var(--border)', outline: 'none', fontSize: 14 }}
                />
                <button 
                  type="button" 
                  onClick={() => setShowPw(!showPw)}
                  style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex' }}
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button 
              type="submit" 
              className="btn-primary"
              style={{ width: '100%', height: 48, borderRadius: 10, background: 'var(--primary)', color: 'white', border: 'none', fontWeight: 700, fontSize: 15, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginTop: 12 }} 
              disabled={loading}
            >
              {loading ? 'Ingresando...' : <><LogIn size={18} /> Iniciar sesión</>}
            </button>
            <div style={{ textAlign: 'center', marginTop: 12 }}>
              <button 
                type="button" 
                onClick={() => setShowForgotModal(true)}
                style={{ fontSize: 13, color: 'var(--primary)', background: 'none', border: 'none', fontWeight: 600, cursor: 'pointer' }}
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>
          </form>
        ) : (
          /* ACCESO CLIENTE */
          <form onSubmit={handleClientLogin}>
            <div className="form-group" style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 6, color: 'var(--text-main)' }}>Tu correo electrónico</label>
              <div className="input-group" style={{ position: 'relative' }}>
                <Mail className="input-icon" size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  type="email" 
                  placeholder="ejemplo@correo.com" 
                  value={clientEmail}
                  onChange={e => setClientEmail(e.target.value)} 
                  required 
                  style={{ width: '100%', padding: '14px 14px 14px 40px', borderRadius: 10, border: '1.5px solid var(--border)', outline: 'none', fontSize: 15 }}
                />
              </div>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8, lineHeight: 1.4 }}>
                Ingresa el mismo correo que usaste al agendar tu cita para ver tu agenda y activar las notificaciones.
              </p>
            </div>
            <button 
              type="submit" 
              className="btn-primary"
              style={{ width: '100%', height: 52, borderRadius: 12, background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', border: 'none', fontWeight: 700, fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }} 
              disabled={clientLoading}
            >
              {clientLoading ? 'Buscando...' : <><User size={20} /> Ver mis citas</>}
            </button>
          </form>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '24px 0' }}>
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>O TAMBIÉN</span>
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
        </div>

        <button 
          onClick={() => setIsClientMode(!isClientMode)}
          style={{ width: '100%', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px', fontSize: 14, fontWeight: 600, color: 'var(--text-main)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
        >
          {isClientMode ? <><LogIn size={16} /> Soy Negocio / Empleado</> : <><User size={16} /> Soy Cliente (Ver mis citas)</>}
        </button>

        {!isClientMode && (
          <div style={{ textAlign: 'center', marginTop: 24, fontSize: 13, color: 'var(--text-muted)' }}>
            ¿No tienes cuenta?{' '}
            <Link to="/register-vendor" style={{ color: 'var(--primary)', fontWeight: 700 }}>Regístrate aquí</Link>
          </div>
        )}
      </div>

      {/* Modal Olvidé mi contraseña */}
      {showForgotModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, zIndex: 1000 }}>
          <div style={{ background: 'white', borderRadius: 16, maxWidth: 400, width: '100%', padding: 24, position: 'relative' }}>
            <button 
              onClick={() => { setShowForgotModal(false); setForgotSuccess(false); }}
              style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>
            
            <h3 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-main)', marginBottom: 12 }}>Recuperar contraseña</h3>
            
            {!forgotSuccess ? (
              <form onSubmit={handleForgotPassword}>
                <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 20, lineHeight: 1.5 }}>
                  Ingresa tu correo electrónico y te enviaremos una nueva contraseña para que puedas ingresar.
                </p>
                <div className="form-group" style={{ marginBottom: 20 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 6 }}>Correo electrónico</label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input 
                      type="email" 
                      placeholder="tu@correo.com" 
                      value={forgotEmail}
                      onChange={e => setForgotEmail(e.target.value)}
                      required
                      style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: 10, border: '1.5px solid var(--border)', outline: 'none' }}
                    />
                  </div>
                </div>
                <button 
                  type="submit" 
                  disabled={forgotLoading}
                  style={{ width: '100%', height: 48, borderRadius: 10, background: 'var(--primary)', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                >
                  {forgotLoading ? 'Enviando...' : <><RefreshCw size={18} /> Enviar contraseña</>}
                </button>
              </form>
            ) : (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>📧</div>
                <p style={{ fontWeight: 700, fontSize: 16, color: '#059669', marginBottom: 8 }}>¡Correo enviado!</p>
                <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  Revisa tu bandeja de entrada. Te hemos enviado un enlace para que puedas crear una nueva contraseña.
                </p>
                <button 
                  onClick={() => setShowForgotModal(false)}
                  style={{ width: '100%', height: 48, borderRadius: 10, background: 'var(--primary)', color: 'white', border: 'none', fontWeight: 700, marginTop: 24, cursor: 'pointer' }}
                >
                  Entendido
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

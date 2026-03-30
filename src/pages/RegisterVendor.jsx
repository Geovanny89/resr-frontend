import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function RegisterVendor() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [businessTypes, setBusinessTypes] = useState([]);
  const [loadingTypes, setLoadingTypes] = useState(true);
  const [form, setForm] = useState({
    // Datos personales
    name: '',
    email: '',
    password: '',
    confirm: '',
    // Datos del negocio
    businessName: '',
    businessType: 'barberia',
    description: '',
    phone: '',
    address: ''
  });

  useEffect(() => {
    loadBusinessTypes();
  }, []);

  const loadBusinessTypes = async () => {
    try {
      setLoadingTypes(true);
      const res = await api.get('/business-types');
      setBusinessTypes(res.data);
      // Establecer el tipo por defecto al primer tipo disponible
      if (res.data.length > 0) {
        setForm(prev => ({ ...prev, businessType: res.data[0].value }));
      }
    } catch (e) {
      console.error('Error al cargar tipos de negocio:', e);
      // Fallback a tipos por defecto si hay error
      setBusinessTypes([
        { value: 'barberia', label: 'Barbería', icon: '✂️' },
        { value: 'spa', label: 'Spa', icon: '💆' },
        { value: 'unas', label: 'Salón de Uñas', icon: '💅' },
        { value: 'otro', label: 'Otro', icon: '🏪' }
      ]);
    } finally {
      setLoadingTypes(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const validateStep1 = () => {
    if (!form.name || !form.email || !form.password || !form.confirm) {
      setError('Todos los campos son requeridos');
      return false;
    }
    if (form.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return false;
    }
    if (form.password !== form.confirm) {
      setError('Las contraseñas no coinciden');
      return false;
    }
    setError('');
    return true;
  };

  const validateStep2 = () => {
    if (!form.businessName || !form.businessType) {
      setError('El nombre y tipo de negocio son requeridos');
      return false;
    }
    setError('');
    return true;
  };

  const handleNextStep = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep2()) return;

    setLoading(true);
    try {
      const response = await api.post('/auth/register-vendor', {
        name: form.name,
        email: form.email,
        password: form.password,
        businessName: form.businessName,
        businessType: form.businessType,
        description: form.description,
        phone: form.phone,
        address: form.address
      });

      // Guardar token y redirigir
      login(response.data.token, response.data.business || null);
      navigate('/admin');
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
          .register-vendor-card { padding: 20px !important; }
          .register-vendor-actions { grid-template-columns: 1fr !important; }
        }
      `}</style>
      <div style={{
        background: 'white',
        borderRadius: 12,
        padding: 40,
        maxWidth: 500,
        width: '100%',
        boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
      }} className="register-vendor-card">
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8, color: '#2d3748' }}>
            Crear mi Negocio
          </h1>
          <p style={{ color: '#718096', fontSize: 14 }}>
            Paso {step} de 2
          </p>
          {/* Progress bar */}
          <div style={{
            marginTop: 16,
            height: 4,
            background: '#e2e8f0',
            borderRadius: 2,
            overflow: 'hidden'
          }}>
            <div style={{
              height: '100%',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              width: `${(step / 2) * 100}%`,
              transition: 'width 0.3s'
            }} />
          </div>
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

          {/* Paso 1: Datos Personales */}
          {step === 1 && (
            <>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: 13,
                  fontWeight: 600,
                  marginBottom: 6,
                  color: '#4a5568'
                }}>
                  Tu nombre completo
                </label>
                <input
                  type="text"
                  name="name"
                  placeholder="Juan Pérez"
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
                type="button"
                onClick={handleNextStep}
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  padding: '12px',
                  fontSize: 16,
                  fontWeight: 600,
                  borderRadius: 6,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  marginTop: 8
                }}
                onMouseEnter={e => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)';
                }}
                onMouseLeave={e => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                Siguiente →
              </button>
            </>
          )}

          {/* Paso 2: Datos del Negocio */}
          {step === 2 && (
            <>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: 13,
                  fontWeight: 600,
                  marginBottom: 6,
                  color: '#4a5568'
                }}>
                  Nombre del negocio *
                </label>
                <input
                  type="text"
                  name="businessName"
                  placeholder="Ej: Barbería El Rey"
                  value={form.businessName}
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
                  Tipo de negocio *
                </label>
                <select
                  name="businessType"
                  value={form.businessType}
                  onChange={handleChange}
                  disabled={loadingTypes}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #e2e8f0',
                    borderRadius: 6,
                    fontSize: 14,
                    fontFamily: 'inherit',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                    cursor: loadingTypes ? 'not-allowed' : 'pointer',
                    opacity: loadingTypes ? 0.6 : 1
                  }}
                  onFocus={e => e.target.style.borderColor = '#667eea'}
                  onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                >
                  {loadingTypes ? (
                    <option>Cargando tipos...</option>
                  ) : (
                    businessTypes.map(t => (
                      <option key={t.value} value={t.value}>
                        {t.icon} {t.label}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: 13,
                  fontWeight: 600,
                  marginBottom: 6,
                  color: '#4a5568'
                }}>
                  Descripción
                </label>
                <textarea
                  name="description"
                  placeholder="Describe tu negocio..."
                  value={form.description}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #e2e8f0',
                    borderRadius: 6,
                    fontSize: 14,
                    fontFamily: 'inherit',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                    minHeight: 80,
                    resize: 'vertical'
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
                  Teléfono
                </label>
                <input
                  type="tel"
                  name="phone"
                  placeholder="+57 300 123 4567"
                  value={form.phone}
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
                  Dirección
                </label>
                <input
                  type="text"
                  name="address"
                  placeholder="Calle 5 #10-20"
                  value={form.address}
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



              <div className="register-vendor-actions" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 8 }}>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  style={{
                    background: '#e2e8f0',
                    color: '#4a5568',
                    border: 'none',
                    padding: '12px',
                    fontSize: 16,
                    fontWeight: 600,
                    borderRadius: 6,
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={e => e.target.style.background = '#cbd5e0'}
                  onMouseLeave={e => e.target.style.background = '#e2e8f0'}
                >
                  ← Atrás
                </button>
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
                    transition: 'all 0.2s'
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
                  {loading ? '⏳ Creando...' : '✅ Crear Negocio'}
                </button>
              </div>
            </>
          )}
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
        </div>
      </div>
    </div>
  );
}

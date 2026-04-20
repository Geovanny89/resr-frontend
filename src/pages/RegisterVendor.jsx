import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft } from 'lucide-react';

export default function RegisterVendor() {
  const navigate = useNavigate();
  const { isDark, colors } = useTheme();
  const [isNative, setIsNative] = useState(false);
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
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
    address: '',
    hasFieldTechnicians: false,
    subscriptionPlan: 'basic',
  });

  useEffect(() => {
    loadBusinessTypes();
    // Detectar si es app nativa
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
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const validateStep1 = () => {
    if (!form.name || !form.email || !form.password || !form.confirm) {
      setError('Todos los campos son requeridos');
      return false;
    }
    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      setError('Ingresa un correo electrónico válido (ejemplo: tu@email.com)');
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

  const validateStep3 = () => {
    if (!form.subscriptionPlan) {
      setError('Debes seleccionar un plan de suscripción');
      return false;
    }
    setError('');
    return true;
  };

  const handleNextStep = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      setStep(3);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep3()) return;

    setLoading(true);
    try {
      await api.post('/auth/register-vendor', {
        name: form.name,
        email: form.email,
        password: form.password,
        businessName: form.businessName,
        businessType: form.businessType,
        description: form.description,
        phone: form.phone,
        address: form.address,
        hasFieldTechnicians: form.hasFieldTechnicians,
        subscriptionPlan: form.subscriptionPlan,
      });

      // Mostrar pantalla de éxito
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al registrarse');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: isDark ? colors.bg : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
        background: isDark ? colors.cardBg : 'white',
        borderRadius: 12,
        padding: 40,
        maxWidth: 500,
        width: '100%',
        boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
      }} className="register-vendor-card">
        {/* Pantalla de Éxito */}
        {success && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
            <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16, color: colors.text }}>
              ¡Negocio Creado Exitosamente!
            </h1>
            <p style={{ color: colors.textSecondary, fontSize: 16, marginBottom: 24, lineHeight: 1.6 }}>
              Tu empresa <strong>{form.businessName}</strong> ha sido registrada correctamente.
              <br /><br />
              Ahora puedes iniciar sesión con tu email y contraseña para comenzar a gestionar tu negocio.
            </p>
            <Link
              to="/login"
              style={{
                display: 'inline-block',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                padding: '14px 32px',
                fontSize: 16,
                fontWeight: 600,
                borderRadius: 8,
                cursor: 'pointer',
                textDecoration: 'none',
                transition: 'all 0.2s'
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
              Ir a Iniciar Sesión →
            </Link>
          </div>
        )}

        {/* Header */}
        {!success && (
        <>
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
              color: colors.textSecondary, 
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
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8, color: colors.text }}>
            Crear mi Negocio
          </h1>
          <p style={{ color: colors.textSecondary, fontSize: 14 }}>
            Paso {step} de 3
          </p>
          {/* Progress bar */}
          <div style={{
            marginTop: 16,
            height: 4,
            background: isDark ? colors.border : '#e2e8f0',
            borderRadius: 2,
            overflow: 'hidden'
          }}>
            <div style={{
              height: '100%',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              width: `${(step / 3) * 100}%`,
              transition: 'width 0.3s'
            }} />
          </div>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 16 }}>
          {error && (
            <div style={{
              background: '#fed7d7',
              color: colors.text,
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
                  color: colors.text
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
                    border: `1px solid ${isDark ? colors.border : '#e2e8f0'}`,
                    background: isDark ? colors.bgSecondary : 'white',
                    color: colors.text,
                    borderRadius: 6,
                    fontSize: 14,
                    fontFamily: 'inherit',
                    outline: 'none',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={e => e.target.style.borderColor = colors.primary}
                  onBlur={e => e.target.style.borderColor = isDark ? colors.border : '#e2e8f0'}
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: 13,
                  fontWeight: 600,
                  marginBottom: 6,
                  color: colors.text
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
                    border: `1px solid ${isDark ? colors.border : '#e2e8f0'}`,
                    background: isDark ? colors.bgSecondary : 'white',
                    color: colors.text,
                    borderRadius: 6,
                    fontSize: 14,
                    fontFamily: 'inherit',
                    outline: 'none',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={e => e.target.style.borderColor = colors.primary}
                  onBlur={e => e.target.style.borderColor = isDark ? colors.border : '#e2e8f0'}
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: 13,
                  fontWeight: 600,
                  marginBottom: 6,
                  color: colors.text
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
                    border: `1px solid ${isDark ? colors.border : '#e2e8f0'}`,
                    background: isDark ? colors.bgSecondary : 'white',
                    color: colors.text,
                    borderRadius: 6,
                    fontSize: 14,
                    fontFamily: 'inherit',
                    outline: 'none',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={e => e.target.style.borderColor = colors.primary}
                  onBlur={e => e.target.style.borderColor = isDark ? colors.border : '#e2e8f0'}
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: 13,
                  fontWeight: 600,
                  marginBottom: 6,
                  color: colors.text
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
                    border: `1px solid ${isDark ? colors.border : '#e2e8f0'}`,
                    background: isDark ? colors.bgSecondary : 'white',
                    color: colors.text,
                    borderRadius: 6,
                    fontSize: 14,
                    fontFamily: 'inherit',
                    outline: 'none',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={e => e.target.style.borderColor = colors.primary}
                  onBlur={e => e.target.style.borderColor = isDark ? colors.border : '#e2e8f0'}
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
                  color: colors.text
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
                    border: `1px solid ${isDark ? colors.border : '#e2e8f0'}`,
                    background: isDark ? colors.bgSecondary : 'white',
                    color: colors.text,
                    borderRadius: 6,
                    fontSize: 14,
                    fontFamily: 'inherit',
                    outline: 'none',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={e => e.target.style.borderColor = colors.primary}
                  onBlur={e => e.target.style.borderColor = isDark ? colors.border : '#e2e8f0'}
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: 13,
                  fontWeight: 600,
                  marginBottom: 6,
                  color: colors.text
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
                    border: `1px solid ${isDark ? colors.border : '#e2e8f0'}`,
                    background: isDark ? colors.bgSecondary : 'white',
                    color: colors.text,
                    borderRadius: 6,
                    fontSize: 14,
                    fontFamily: 'inherit',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                    cursor: loadingTypes ? 'not-allowed' : 'pointer',
                    opacity: loadingTypes ? 0.6 : 1
                  }}
                  onFocus={e => e.target.style.borderColor = colors.primary}
                  onBlur={e => e.target.style.borderColor = isDark ? colors.border : '#e2e8f0'}
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
                  color: colors.text
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
                    border: `1px solid ${isDark ? colors.border : '#e2e8f0'}`,
                    background: isDark ? colors.bgSecondary : 'white',
                    color: colors.text,
                    borderRadius: 6,
                    fontSize: 14,
                    fontFamily: 'inherit',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                    minHeight: 80,
                    resize: 'vertical'
                  }}
                  onFocus={e => e.target.style.borderColor = colors.primary}
                  onBlur={e => e.target.style.borderColor = isDark ? colors.border : '#e2e8f0'}
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: 13,
                  fontWeight: 600,
                  marginBottom: 6,
                  color: colors.text
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
                    border: `1px solid ${isDark ? colors.border : '#e2e8f0'}`,
                    background: isDark ? colors.bgSecondary : 'white',
                    color: colors.text,
                    borderRadius: 6,
                    fontSize: 14,
                    fontFamily: 'inherit',
                    outline: 'none',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={e => e.target.style.borderColor = colors.primary}
                  onBlur={e => e.target.style.borderColor = isDark ? colors.border : '#e2e8f0'}
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: 13,
                  fontWeight: 600,
                  marginBottom: 6,
                  color: colors.text
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
                    border: `1px solid ${isDark ? colors.border : '#e2e8f0'}`,
                    background: isDark ? colors.bgSecondary : 'white',
                    color: colors.text,
                    borderRadius: 6,
                    fontSize: 14,
                    fontFamily: 'inherit',
                    outline: 'none',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={e => e.target.style.borderColor = colors.primary}
                  onBlur={e => e.target.style.borderColor = isDark ? colors.border : '#e2e8f0'}
                />
              </div>

              {/* Checkbox para Técnicos a Domicilio */}
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 12,
                padding: 12,
                background: isDark ? 'rgba(59, 130, 246, 0.1)' : '#eff6ff',
                borderRadius: 8,
                border: `1px solid ${isDark ? 'rgba(59, 130, 246, 0.3)' : '#bfdbfe'}`,
                marginTop: 8
              }}>
                <input
                  type="checkbox"
                  id="hasFieldTechnicians"
                  name="hasFieldTechnicians"
                  checked={form.hasFieldTechnicians}
                  onChange={handleChange}
                  style={{
                    width: 20,
                    height: 20,
                    marginTop: 2,
                    cursor: 'pointer'
                  }}
                />
                <div style={{ flex: 1 }}>
                  <label 
                    htmlFor="hasFieldTechnicians"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      fontSize: 14,
                      fontWeight: 600,
                      color: isDark ? '#93c5fd' : '#1e40af',
                      cursor: 'pointer',
                      marginBottom: 4
                    }}
                  >
                    <span>🔧</span>
                    Servicios Técnicos a Domicilio
                  </label>
                  <p style={{
                    fontSize: 12,
                    color: colors.textSecondary,
                    margin: 0,
                    lineHeight: 1.4
                  }}>
                    Marcá esta opción si tu negocio envía técnicos a domicilio (ej: reparaciones, mantenimiento). 
                    <strong> No incluye recordatorios por WhatsApp</strong> - usarán principalmente la app móvil.
                  </p>
                </div>
              </div>

              <div className="register-vendor-actions" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 8 }}>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  style={{
                    background: isDark ? colors.bgSecondary : '#e2e8f0',
                    color: colors.text,
                    border: `1px solid ${isDark ? colors.border : 'transparent'}`,
                    padding: '12px',
                    fontSize: 16,
                    fontWeight: 600,
                    borderRadius: 6,
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={e => e.target.style.background = isDark ? colors.border : '#cbd5e0'}
                  onMouseLeave={e => e.target.style.background = isDark ? colors.bgSecondary : '#e2e8f0'}
                >
                  ← Atrás
                </button>
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
                    transition: 'all 0.2s'
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
              </div>
            </>
          )}

          {/* Paso 3: Plan de Suscripción */}
          {step === 3 && (
            <>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: 13,
                  fontWeight: 600,
                  marginBottom: 6,
                  color: colors.text
                }}>
                  Plan de Suscripción *
                </label>
                <select
                  name="subscriptionPlan"
                  value={form.subscriptionPlan}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: `1px solid ${isDark ? colors.border : '#e2e8f0'}`,
                    background: isDark ? colors.bgSecondary : 'white',
                    color: colors.text,
                    borderRadius: 6,
                    fontSize: 14,
                    fontFamily: 'inherit',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                    cursor: 'pointer'
                  }}
                  onFocus={e => e.target.style.borderColor = colors.primary}
                  onBlur={e => e.target.style.borderColor = isDark ? colors.border : '#e2e8f0'}
                >
                  <option value="basic">Básico - $70.000/mes (3 empleados)</option>
                  <option value="pro">Pro - $90.000/mes (5 empleados)</option>
                  <option value="premium">Premium - $130.000/mes (10 empleados)</option>
                </select>
              </div>

              <div style={{
                padding: 16,
                background: isDark ? 'rgba(102, 126, 234, 0.1)' : '#f3f4f6',
                borderRadius: 8,
                border: `1px solid ${isDark ? 'rgba(102, 126, 234, 0.3)' : '#e5e7eb'}`
              }}>
                <h4 style={{ margin: '0 0 12px 0', color: colors.text, fontSize: 14 }}>
                  📋 Resumen del Plan Seleccionado
                </h4>
                <div style={{ display: 'grid', gap: 8 }}>
                  {form.subscriptionPlan === 'basic' && (
                    <>
                      <p style={{ margin: 0, fontSize: 13, color: colors.textSecondary }}>
                        <strong style={{ color: colors.text }}>Plan Básico</strong> - Ideal para pequeños negocios
                      </p>
                      <ul style={{ margin: '8px 0', paddingLeft: 20, fontSize: 13, color: colors.textSecondary }}>
                        <li>3 empleados incluidos</li>
                        <li>Gestión de citas básica</li>
                        <li>Recordatorios por WhatsApp</li>
                        <li>Soporte por email</li>
                      </ul>
                    </>
                  )}
                  {form.subscriptionPlan === 'pro' && (
                    <>
                      <p style={{ margin: 0, fontSize: 13, color: colors.textSecondary }}>
                        <strong style={{ color: colors.text }}>Plan Pro</strong> - Para negocios en crecimiento
                      </p>
                      <ul style={{ margin: '8px 0', paddingLeft: 20, fontSize: 13, color: colors.textSecondary }}>
                        <li>5 empleados incluidos</li>
                        <li>Todas las funciones del plan Básico</li>
                        <li>Reportes avanzados</li>
                        <li>Soporte prioritario</li>
                      </ul>
                    </>
                  )}
                  {form.subscriptionPlan === 'premium' && (
                    <>
                      <p style={{ margin: 0, fontSize: 13, color: colors.textSecondary }}>
                        <strong style={{ color: colors.text }}>Plan Premium</strong> - Máxima capacidad
                      </p>
                      <ul style={{ margin: '8px 0', paddingLeft: 20, fontSize: 13, color: colors.textSecondary }}>
                        <li>10 empleados incluidos</li>
                        <li>Todas las funciones del plan Pro</li>
                        <li>API access</li>
                        <li>Soporte 24/7</li>
                      </ul>
                    </>
                  )}
                </div>
              </div>

              <div className="register-vendor-actions" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 8 }}>
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  style={{
                    background: isDark ? colors.bgSecondary : '#e2e8f0',
                    color: colors.text,
                    border: `1px solid ${isDark ? colors.border : 'transparent'}`,
                    padding: '12px',
                    fontSize: 16,
                    fontWeight: 600,
                    borderRadius: 6,
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={e => e.target.style.background = isDark ? colors.border : '#cbd5e0'}
                  onMouseLeave={e => e.target.style.background = isDark ? colors.bgSecondary : '#e2e8f0'}
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
          borderTop: `1px solid ${isDark ? colors.border : '#e2e8f0'}`
        }}>
          <p style={{ color: colors.textSecondary, fontSize: 14 }}>
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" style={{
              color: colors.primary,
              fontWeight: 600,
              textDecoration: 'none'
            }}>
              Inicia sesión
            </Link>
          </p>
        </div>
        </>
      )}
      </div>
    </div>
  );
}

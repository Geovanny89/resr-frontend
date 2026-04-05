import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import ThemeToggle from '../../components/ThemeToggle';
import api from '../../api/client';
import { Capacitor } from '@capacitor/core';
import notificationService from '../../services/notificationService';
import { Eye, EyeOff } from 'lucide-react';

const STATUS_LABELS = { 
  pending: 'Pendiente', 
  confirmed: 'Confirmada', 
  attention: 'En Atención', 
  done: 'Terminado', 
  cancelled: 'Cancelada' 
};

const STATUS_COLORS = { 
  pending: '#f6ad55', 
  confirmed: '#68d391', 
  attention: '#63b3ed', 
  done: '#4fd1c5', 
  cancelled: '#fc8181' 
};

export default function EmployeeDashboard() {
  const { user, logout } = useAuth();
  const { colors } = useTheme();
  const [employee, setEmployee] = useState(null);
  const [business, setBusiness] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDate, setSelectedDate] = useState(() => {
    return new Date().toLocaleDateString('en-CA', { timeZone: 'America/Bogota' });
  });

  useEffect(() => {
    loadEmployeeInfo();
  }, []);

  const loadEmployeeInfo = async () => {
    try {
      const response = await api.get('/employees/me/info');
      setEmployee(response.data);
      // También cargar info del negocio
      if (response.data?.businessId) {
        const bizRes = await api.get(`/businesses/by-id/${response.data.businessId}/public`);
        setBusiness(bizRes.data);
      }
    } catch (err) {
      setError('Error al cargar información del empleado');
    }
  };

  useEffect(() => {
    if (employee) {
      loadAppointments();
    }
  }, [employee, selectedDate]);

  // Programar notificaciones cuando se cargan las citas (solo en APK)
  useEffect(() => {
    if (Capacitor.isNativePlatform() && appointments.length > 0 && employee) {
      notificationService.scheduleMultipleNotifications(
        appointments,
        employee.id,
        employee.User?.name || 'Empleado'
      );
    }
  }, [appointments, employee]);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const startDate = selectedDate;
      const endDate = new Date(selectedDate);
      endDate.setDate(endDate.getDate() + 1);
      
      const response = await api.get(`/employees/${employee.id}/appointments`, {
        params: {
          startDate: startDate,
          endDate: endDate.toISOString().split('T')[0]
        }
      });
      setAppointments(response.data);
    } catch (err) {
      setError('Error al cargar citas');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await api.patch(`/appointments/${id}/status`, { status });
      loadAppointments();
    } catch (e) {
      alert('Error al actualizar el estado de la cita');
    }
  };

  const [showChangePwModal, setShowChangePwModal] = useState(false);
  const [pwForm, setPwForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [pwLoading, setPwLoading] = useState(false);
  const [pwSuccess, setPwSuccess] = useState(false);
  const [showPasswords, setShowPasswords] = useState({ old: false, new: false, confirm: false });

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }
    setPwLoading(true);
    try {
      await api.patch('/auth/change-password', {
        oldPassword: pwForm.oldPassword,
        newPassword: pwForm.newPassword
      });
      setPwSuccess(true);
      setShowChangePwModal(false);
      setPwForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setPwSuccess(false), 4000);
    } catch (err) {
      alert(err.response?.data?.error || 'Error al cambiar la contraseña');
    } finally {
      setPwLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
  };

  const getImgUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    const API_BASE_URL = api.defaults.baseURL || '';
    const BACKEND_URL = API_BASE_URL.replace(/\/api$/, '');
    const cleanUrl = url.startsWith('/') ? url : `/${url}`;
    return `${BACKEND_URL}${cleanUrl}`;
  };

  // Obtener iniciales para avatar placeholder
  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (!employee) {
    return (
      <div style={{
        minHeight: '100vh',
        background: colors.bg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 32, marginBottom: 16 }}>⏳</div>
          <p style={{ color: colors.textSecondary }}>Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: colors.bg }}>
      {/* Header */}
      <div className="employee-header" style={{
        background: colors.gradient,
        color: 'white',
        padding: '16px'
      }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div className="employee-header-content" style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 12
          }}>
            {/* Logo y nombre del negocio */}
            <div className="employee-brand" style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
              {business?.logoUrl ? (
                <img 
                  src={getImgUrl(business.logoUrl)} 
                  alt={business?.name}
                  className="employee-logo"
                  style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(255,255,255,0.3)', flexShrink: 0 }}
                />
              ) : (
                <div className="employee-logo" style={{ 
                  width: 44, 
                  height: 44, 
                  borderRadius: '50%', 
                  background: 'rgba(255,255,255,0.2)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  fontSize: 16,
                  fontWeight: 700,
                  flexShrink: 0
                }}>
                  {getInitials(business?.name)}
                </div>
              )}
              <div style={{ minWidth: 0, overflow: 'hidden' }}>
                <h1 className="employee-business-name" style={{ fontSize: 18, fontWeight: 700, marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {business?.name || 'Negocio'}
                </h1>
                <p className="employee-employee-name" style={{ opacity: 0.9, fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {employee?.User?.name} • {business?.type || 'Empleado'}
                </p>
              </div>
            </div>
            
            <div className="employee-header-buttons" style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
              <ThemeToggle />
              <button
                onClick={() => setShowChangePwModal(true)}
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  color: 'white',
                  border: '1px solid rgba(255,255,255,0.2)',
                  padding: '8px 12px',
                  borderRadius: 6,
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: 600,
                  whiteSpace: 'nowrap'
                }}
              >
                Cambiar Clave
              </button>
              <button
                onClick={handleLogout}
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  border: '1px solid rgba(255,255,255,0.3)',
                  padding: '8px 12px',
                  borderRadius: 6,
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: 600,
                  transition: 'all 0.2s',
                  whiteSpace: 'nowrap'
                }}
              >
                Salir
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '24px 16px' }}>
        <style>{`
          @media (max-width: 640px) {
            .employee-header { padding: 12px !important; }
            .employee-header-content { flex-direction: column !important; align-items: stretch !important; gap: 10px !important; }
            .employee-brand { width: 100%; }
            .employee-business-name { font-size: 16px !important; }
            .employee-employee-name { font-size: 11px !important; }
            .employee-logo { width: 36px !important; height: 36px !important; font-size: 14px !important; }
            .employee-header-buttons { width: 100%; justify-content: center; gap: 6px; }
            .employee-header-buttons button { font-size: 12px !important; padding: 6px 10px !important; flex: 1; }
            .employee-appointment-card { padding: 16px !important; }
            .employee-appointment-actions { flex-direction: column; }
            .employee-appointment-actions button { width: 100%; justify-content: center; }
          }
          @media (max-width: 480px) {
            .employee-business-name { font-size: 15px !important; max-width: 200px; }
            .employee-employee-name { font-size: 10px !important; }
            .employee-logo { width: 32px !important; height: 32px !important; }
          }
        `}</style>
        
        {/* Mensaje sutil de éxito */}
        {pwSuccess && (
          <div style={{
            background: colors.isDark ? '#064e3b' : '#d1fae5',
            border: `1px solid ${colors.isDark ? '#10b981' : '#10b981'}`,
            borderRadius: 8,
            padding: '12px 16px',
            marginBottom: 20,
            display: 'flex',
            alignItems: 'center',
            gap: 10
          }}>
            <span style={{ fontSize: 18 }}>✅</span>
            <span style={{ 
              fontSize: 14, 
              color: colors.isDark ? '#6ee7b7' : '#065f46',
              fontWeight: 500 
            }}>
              Su contraseña ha sido cambiada exitosamente
            </span>
          </div>
        )}
        
        {/* Selector de fecha */}
        <div style={{
          background: colors.cardBg,
          padding: 20,
          borderRadius: 12,
          marginBottom: 24,
          boxShadow: `0 2px 8px ${colors.shadow}`,
          border: `1px solid ${colors.border}`
        }}>
          <label style={{
            display: 'block',
            fontSize: 14,
            fontWeight: 600,
            marginBottom: 10,
            color: colors.text
          }}>
            Selecciona una fecha para ver tu agenda
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            style={{
              padding: '10px 12px',
              border: `1px solid ${colors.inputBorder}`,
              borderRadius: 6,
              fontSize: 14,
              fontFamily: 'inherit',
              cursor: 'pointer',
              background: colors.inputBg,
              color: colors.text,
              width: '100%',
              maxWidth: 300
            }}
          />
        </div>

        {/* Citas del día */}
        <div style={{
          background: colors.cardBg,
          padding: 24,
          borderRadius: 12,
          boxShadow: `0 2px 8px ${colors.shadow}`,
          border: `1px solid ${colors.border}`
        }}>
          <h2 style={{
            fontSize: 20,
            fontWeight: 700,
            marginBottom: 24,
            color: colors.text
          }}>
            📅 Agenda para {(() => {
              const [year, month, day] = selectedDate.split('-').map(Number);
              const date = new Date(year, month - 1, day);
              return date.toLocaleDateString('es-CO', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              });
            })()}
          </h2>

          {error && (
            <div style={{
              background: colors.isDark ? '#7f1d1d' : '#fed7d7',
              color: colors.isDark ? '#fca5a5' : '#c53030',
              padding: 16,
              borderRadius: 8,
              marginBottom: 24,
              border: `1px solid ${colors.isDark ? '#dc2626' : '#fc8181'}`
            }}>
              {error}
            </div>
          )}

          {loading && (
            <div style={{ textAlign: 'center', padding: 40 }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>⏳</div>
              <p style={{ color: colors.textSecondary }}>Cargando citas...</p>
            </div>
          )}

          {!loading && appointments.length === 0 && (
            <div style={{
              textAlign: 'center',
              padding: 40,
              background: colors.bgSecondary,
              borderRadius: 8
            }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>😊</div>
              <p style={{ color: colors.textSecondary, fontSize: 16 }}>
                No tienes citas programadas para esta fecha
              </p>
            </div>
          )}

          {!loading && appointments.length > 0 && (
            <div style={{ display: 'grid', gap: 16 }}>
              {appointments.map(apt => {
                const startTime = new Date(apt.startTime);
                const endTime = new Date(apt.endTime);
                const timeStr = startTime.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
                const endTimeStr = endTime.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });

                return (
                  <div key={apt.id} className="employee-appointment-card" style={{
                    padding: 20,
                    background: colors.cardBg,
                    border: `2px solid ${STATUS_COLORS[apt.status]}`,
                    borderRadius: 12,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 16,
                    boxShadow: `0 4px 6px ${colors.shadow}`
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 17, fontWeight: 700, color: colors.text }}>
                          {timeStr} - {endTimeStr}
                        </div>
                        <div style={{ fontSize: 15, fontWeight: 600, color: colors.text, marginTop: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {apt.clientName}
                        </div>
                        <div style={{ fontSize: 13, color: colors.primary, fontWeight: 600, marginTop: 2 }}>
                          {apt.Service?.name}
                        </div>
                        <div style={{ fontSize: 12, color: colors.textSecondary, marginTop: 4 }}>
                          📞 {apt.clientPhone}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <span style={{
                          display: 'inline-block',
                          padding: '4px 10px',
                          borderRadius: 20,
                          fontSize: 11,
                          fontWeight: 700,
                          background: STATUS_COLORS[apt.status],
                          color: 'white'
                        }}>
                          {STATUS_LABELS[apt.status]}
                        </span>
                      </div>
                    </div>

                    <div className="employee-appointment-actions" style={{ display: 'flex', gap: 8, flexWrap: 'wrap', borderTop: `1px solid ${colors.border}`, paddingTop: 16 }}>
                      {apt.status === 'pending' && (
                        <button onClick={() => handleStatusUpdate(apt.id, 'confirmed')} className="btn-primary" style={{ padding: '8px 14px', fontSize: 13, flex: 1, minWidth: 100 }}>
                          Confirmar
                        </button>
                      )}
                      {apt.status === 'confirmed' && (
                        <>
                          <button onClick={() => handleStatusUpdate(apt.id, 'attention')} className="btn-primary" style={{ padding: '8px 14px', fontSize: 13, background: STATUS_COLORS.attention, flex: 1, minWidth: 100 }}>
                            Iniciar Atención
                          </button>
                          <button onClick={() => handleStatusUpdate(apt.id, 'done')} className="btn-primary" style={{ padding: '8px 14px', fontSize: 13, background: STATUS_COLORS.done, flex: 1, minWidth: 100 }}>
                            Completar
                          </button>
                        </>
                      )}
                      {apt.status === 'attention' && (
                        <button onClick={() => handleStatusUpdate(apt.id, 'done')} className="btn-primary" style={{ padding: '8px 14px', fontSize: 13, background: STATUS_COLORS.done, flex: 1, minWidth: 100 }}>
                          Terminar
                        </button>
                      )}
                      {(apt.status === 'pending' || apt.status === 'confirmed' || apt.status === 'attention') && (
                        <button onClick={() => handleStatusUpdate(apt.id, 'cancelled')} style={{ padding: '8px 14px', fontSize: 13, background: '#ef4444', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600, flex: 1, minWidth: 100 }}>
                          Cancelar
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modal Cambiar Contraseña */}
      {showChangePwModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: colors.cardBg, padding: 24, borderRadius: 16, maxWidth: 400, width: '100%', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: colors.text, marginBottom: 8 }}>Cambiar Contraseña</h2>
            <p style={{ fontSize: 14, color: colors.textSecondary, marginBottom: 20 }}>Ingresa tu clave actual y la nueva para actualizarla.</p>
            
            <form onSubmit={handlePasswordChange}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: colors.text }}>Contraseña Actual</label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type={showPasswords.old ? 'text' : 'password'}
                    value={pwForm.oldPassword}
                    onChange={e => setPwForm({ ...pwForm, oldPassword: e.target.value })}
                    required
                    style={{ width: '100%', padding: '10px 40px 10px 12px', borderRadius: 8, border: `1px solid ${colors.border}`, background: colors.inputBg, color: colors.text }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, old: !showPasswords.old })}
                    style={{
                      position: 'absolute',
                      right: '8px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '4px',
                      color: colors.textSecondary
                    }}
                  >
                    {showPasswords.old ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: colors.text }}>Nueva Contraseña</label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type={showPasswords.new ? 'text' : 'password'}
                    value={pwForm.newPassword}
                    onChange={e => setPwForm({ ...pwForm, newPassword: e.target.value })}
                    required
                    style={{ width: '100%', padding: '10px 40px 10px 12px', borderRadius: 8, border: `1px solid ${colors.border}`, background: colors.inputBg, color: colors.text }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                    style={{
                      position: 'absolute',
                      right: '8px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '4px',
                      color: colors.textSecondary
                    }}
                  >
                    {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: colors.text }}>Confirmar Nueva Contraseña</label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type={showPasswords.confirm ? 'text' : 'password'}
                    value={pwForm.confirmPassword}
                    onChange={e => setPwForm({ ...pwForm, confirmPassword: e.target.value })}
                    required
                    style={{ width: '100%', padding: '10px 40px 10px 12px', borderRadius: 8, border: `1px solid ${colors.border}`, background: colors.inputBg, color: colors.text }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                    style={{
                      position: 'absolute',
                      right: '8px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '4px',
                      color: colors.textSecondary
                    }}
                  >
                    {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: 12 }}>
                <button 
                  type="button" 
                  onClick={() => setShowChangePwModal(false)}
                  style={{ flex: 1, padding: '12px', borderRadius: 8, border: 'none', background: colors.bgSecondary, color: colors.text, fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={pwLoading}
                  style={{ flex: 1, padding: '12px', borderRadius: 8, border: 'none', background: colors.primary, color: 'white', fontWeight: 700, cursor: 'pointer' }}
                >
                  {pwLoading ? 'Guardando...' : 'Actualizar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

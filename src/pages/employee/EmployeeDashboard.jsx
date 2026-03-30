import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import ThemeToggle from '../../components/ThemeToggle';
import api from '../../api/client';
import { Capacitor } from '@capacitor/core';
import notificationService from '../../services/notificationService';

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
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDate, setSelectedDate] = useState(() => {
    // Inicializar con la fecha actual en Colombia (YYYY-MM-DD)
    return new Date().toLocaleDateString('en-CA', { timeZone: 'America/Bogota' });
  });

  useEffect(() => {
    loadEmployeeInfo();
  }, []);

  const loadEmployeeInfo = async () => {
    try {
      const response = await api.get('/employees/me/info');
      setEmployee(response.data);
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

  const handleLogout = () => {
    logout();
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
      <div style={{
        background: colors.gradient,
        color: 'white',
        padding: '24px 16px'
      }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>
                👤 {employee.User.name}
              </h1>
              <p style={{ opacity: 0.9 }}>
                {employee.Business.name} • {employee.Business.type}
              </p>
            </div>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <ThemeToggle />
              <button
                onClick={handleLogout}
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  border: '1px solid rgba(255,255,255,0.3)',
                  padding: '8px 16px',
                  borderRadius: 6,
                  cursor: 'pointer',
                  fontSize: 14,
                  fontWeight: 600,
                  transition: 'all 0.2s'
                }}
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '32px 16px' }}>
        {/* Selector de fecha */}
        <div style={{
          background: colors.cardBg,
          padding: 24,
          borderRadius: 12,
          marginBottom: 24,
          boxShadow: `0 2px 8px ${colors.shadow}`,
          border: `1px solid ${colors.border}`
        }}>
          <label style={{
            display: 'block',
            fontSize: 14,
            fontWeight: 600,
            marginBottom: 12,
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
              color: colors.text
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
            📅 Agenda para {new Date(selectedDate).toLocaleDateString('es-CO', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
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
                  <div key={apt.id} style={{
                    padding: 20,
                    background: colors.cardBg,
                    border: `2px solid ${STATUS_COLORS[apt.status]}`,
                    borderRadius: 12,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 16,
                    boxShadow: `0 4px 6px ${colors.shadow}`
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ fontSize: 18, fontWeight: 700, color: colors.text }}>
                          {timeStr} - {endTimeStr}
                        </div>
                        <div style={{ fontSize: 16, fontWeight: 600, color: colors.text, marginTop: 4 }}>
                          {apt.clientName}
                        </div>
                        <div style={{ fontSize: 14, color: colors.primary, fontWeight: 600, marginTop: 2 }}>
                          {apt.Service.name}
                        </div>
                        <div style={{ fontSize: 13, color: colors.textSecondary, marginTop: 4 }}>
                          📞 {apt.clientPhone}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{
                          display: 'inline-block',
                          padding: '4px 12px',
                          borderRadius: 20,
                          fontSize: 12,
                          fontWeight: 700,
                          background: STATUS_COLORS[apt.status],
                          color: 'white'
                        }}>
                          {STATUS_LABELS[apt.status]}
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', borderTop: `1px solid ${colors.border}`, paddingTop: 16 }}>
                      {apt.status === 'pending' && (
                        <button onClick={() => handleStatusUpdate(apt.id, 'confirmed')} className="btn-primary" style={{ padding: '8px 16px', fontSize: 13 }}>
                          Confirmar
                        </button>
                      )}
                      {apt.status === 'confirmed' && (
                        <button onClick={() => handleStatusUpdate(apt.id, 'attention')} className="btn-primary" style={{ padding: '8px 16px', fontSize: 13, background: STATUS_COLORS.attention }}>
                          Iniciar Atención
                        </button>
                      )}
                      {apt.status === 'attention' && (
                        <button onClick={() => handleStatusUpdate(apt.id, 'done')} className="btn-primary" style={{ padding: '8px 16px', fontSize: 13, background: STATUS_COLORS.done }}>
                          Terminar
                        </button>
                      )}
                      {(apt.status === 'pending' || apt.status === 'confirmed') && (
                        <button onClick={() => handleStatusUpdate(apt.id, 'cancelled')} className="btn-danger" style={{ padding: '8px 16px', fontSize: 13 }}>
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
    </div>
  );
}

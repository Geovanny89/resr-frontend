import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import api from '../../api/client';
import AdminLayout from '../../components/AdminLayout';
import { ChevronLeft, ChevronRight, Calendar, Clock, User, MapPin, Car, CheckCircle, AlertCircle, Package } from 'lucide-react';

const DAYS_ES = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const SHORT_DAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MONTHS_ES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

const STATUS_LABELS = {
  pending: { label: 'Pendiente', color: '#f59e0b', bg: '#fef3c7' },
  confirmed: { label: 'Confirmada', color: '#3b82f6', bg: '#dbeafe' },
  on_the_way: { label: 'En Camino', color: '#8b5cf6', bg: '#ede9fe' },
  arrived: { label: 'Llegó', color: '#06b6d4', bg: '#cffafe' },
  attention: { label: 'En Atención', color: '#ec4899', bg: '#fce7f3' },
  done: { label: 'Completada', color: '#10b981', bg: '#d1fae5' },
  cancelled: { label: 'Cancelada', color: '#ef4444', bg: '#fee2e2' },
};

// Generar horas del día (6am a 10pm)
const HOURS = Array.from({ length: 17 }, (_, i) => i + 6);

function todayColombia() {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'America/Bogota' });
}

function getWeekDates(baseDate) {
  const date = new Date(baseDate);
  const day = date.getDay();
  const diff = date.getDate() - day;
  const sunday = new Date(date.setDate(diff));
  
  const weekDates = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(sunday);
    d.setDate(sunday.getDate() + i);
    weekDates.push(d);
  }
  return weekDates;
}

function formatDateISO(date) {
  return date.toISOString().split('T')[0];
}

function isSameDay(date1, date2) {
  return formatDateISO(date1) === formatDateISO(date2);
}

function getHourFromDate(dateStr) {
  return new Date(dateStr).getHours();
}

export default function Agenda() {
  const { business } = useAuth();
  const { colors } = useTheme();
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [viewMode, setViewMode] = useState('week'); // 'week' | 'day'
  const [selectedDate, setSelectedDate] = useState(new Date());

  const weekDates = useMemo(() => getWeekDates(currentWeek), [currentWeek]);
  const weekLabel = useMemo(() => {
    const start = weekDates[0];
    const end = weekDates[6];
    if (start.getMonth() === end.getMonth()) {
      return `${MONTHS_ES[start.getMonth()]} ${start.getFullYear()}`;
    }
    return `${MONTHS_ES[start.getMonth()]} - ${MONTHS_ES[end.getMonth()]} ${end.getFullYear()}`;
  }, [weekDates]);

  useEffect(() => {
    if (business?.id) {
      loadAppointments();
    }
  }, [business?.id, currentWeek, weekDates]);

  const loadAppointments = async () => {
    if (!business?.id) return;
    setLoading(true);
    try {
      const startDate = formatDateISO(weekDates[0]);
      const endDate = formatDateISO(weekDates[6]);
      
      const res = await api.get('/appointments', {
        params: {
          businessId: business.id,
          startDate,
          endDate,
        }
      });
      setAppointments(res.data);
    } catch (e) {
      console.error('Error loading appointments:', e);
    } finally {
      setLoading(false);
    }
  };

  const prevWeek = () => {
    const newWeek = new Date(currentWeek);
    newWeek.setDate(newWeek.getDate() - 7);
    setCurrentWeek(newWeek);
  };

  const nextWeek = () => {
    const newWeek = new Date(currentWeek);
    newWeek.setDate(newWeek.getDate() + 7);
    setCurrentWeek(newWeek);
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentWeek(today);
    setSelectedDate(today);
  };

  const getAppointmentsForDay = (date) => {
    return appointments.filter(apt => {
      const aptDate = new Date(apt.startTime);
      return isSameDay(aptDate, date);
    }).sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
  };

  const getAppointmentsForHour = (date, hour) => {
    return appointments.filter(apt => {
      const aptDate = new Date(apt.startTime);
      const aptHour = aptDate.getHours();
      return isSameDay(aptDate, date) && aptHour === hour;
    }).sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
  };

  const openDetail = (apt) => {
    setSelectedAppointment(apt);
    setShowDetailModal(true);
  };

  const isToday = (date) => isSameDay(date, new Date());

  // Solo mostrar para negocios con técnicos de campo
  if (!business?.hasFieldTechnicians) {
    return (
      <AdminLayout title="Agenda" subtitle="Vista calendario de citas">
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '60px 20px',
          textAlign: 'center',
        }}>
          <div style={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: colors.bgSecondary,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 20,
          }}>
            <Calendar size={40} color={colors.textMuted} />
          </div>
          <h2 style={{ 
            fontSize: 20, 
            fontWeight: 700, 
            color: colors.text,
            marginBottom: 8 
          }}>
            Función no disponible
          </h2>
          <p style={{ 
            fontSize: 14, 
            color: colors.textSecondary,
            maxWidth: 400,
            lineHeight: 1.5
          }}>
            La agenda calendario solo está disponible para negocios con <strong>técnicos a domicilio</strong>. 
            Activa esta opción en la configuración de tu negocio.
          </p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Agenda" subtitle="Vista calendario de citas">
      <style>{`
        .agenda-container { 
          background: ${colors.cardBg}; 
          border-radius: 12px; 
          border: 1px solid ${colors.border};
          overflow: hidden;
        }
        .agenda-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          border-bottom: 1px solid ${colors.border};
          background: ${colors.bgSecondary};
        }
        .agenda-nav {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .agenda-nav-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border: 1px solid ${colors.border};
          border-radius: 8px;
          background: ${colors.cardBg};
          color: ${colors.text};
          cursor: pointer;
          transition: all 0.2s;
        }
        .agenda-nav-btn:hover {
          background: ${colors.bgSecondary};
          border-color: ${colors.primary};
        }
        .agenda-today-btn {
          padding: 8px 16px;
          border: 1px solid ${colors.border};
          border-radius: 8px;
          background: ${colors.cardBg};
          color: ${colors.text};
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
        }
        .agenda-today-btn:hover {
          background: ${colors.primary};
          color: white;
          border-color: ${colors.primary};
        }
        .agenda-week-label {
          font-size: 18px;
          font-weight: 700;
          color: ${colors.text};
        }
        .agenda-grid {
          display: grid;
          grid-template-columns: 60px repeat(7, 1fr);
          overflow-x: auto;
        }
        .agenda-time-column {
          border-right: 1px solid ${colors.border};
          background: ${colors.bgSecondary};
        }
        .agenda-time-slot {
          height: 60px;
          display: flex;
          align-items: flex-start;
          justify-content: center;
          padding-top: 4px;
          font-size: 12px;
          color: ${colors.textSecondary};
          border-bottom: 1px solid ${colors.border};
        }
        .agenda-day-column {
          border-right: 1px solid ${colors.border};
          min-width: 140px;
        }
        .agenda-day-column:last-child {
          border-right: none;
        }
        .agenda-day-header {
          padding: 12px 8px;
          text-align: center;
          border-bottom: 1px solid ${colors.border};
          background: ${colors.bgSecondary};
        }
        .agenda-day-header.today {
          background: ${colors.primary}15;
        }
        .agenda-day-name {
          font-size: 11px;
          font-weight: 600;
          color: ${colors.textSecondary};
          text-transform: uppercase;
        }
        .agenda-day-number {
          font-size: 20px;
          font-weight: 700;
          color: ${colors.text};
          margin-top: 4px;
        }
        .agenda-day-header.today .agenda-day-number {
          color: ${colors.primary};
        }
        .agenda-slots {
          position: relative;
        }
        .agenda-slot {
          height: 60px;
          border-bottom: 1px solid ${colors.border}30;
          position: relative;
        }
        .agenda-appointment {
          position: absolute;
          left: 2px;
          right: 2px;
          border-radius: 6px;
          padding: 4px 6px;
          font-size: 11px;
          cursor: pointer;
          overflow: hidden;
          transition: transform 0.1s, box-shadow 0.1s;
          border-left: 3px solid;
        }
        .agenda-appointment:hover {
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
          z-index: 10;
        }
        .agenda-apt-client {
          font-weight: 600;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .agenda-apt-service {
          font-size: 10px;
          opacity: 0.9;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .agenda-apt-time {
          font-size: 9px;
          opacity: 0.8;
        }
        .agenda-stats {
          display: flex;
          gap: 16px;
          padding: 12px 20px;
          border-bottom: 1px solid ${colors.border};
          background: ${colors.cardBg};
        }
        .agenda-stat {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: ${colors.text};
        }
        .agenda-stat-value {
          font-weight: 700;
          color: ${colors.primary};
        }
        @media (max-width: 768px) {
          .agenda-grid {
            grid-template-columns: 50px repeat(7, minmax(100px, 1fr));
          }
          .agenda-nav {
            flex-wrap: wrap;
          }
          .agenda-week-label {
            font-size: 14px;
          }
        }
      `}</style>

      {/* Stats */}
      <div className="agenda-stats">
        <div className="agenda-stat">
          <Calendar size={16} color={colors.primary} />
          <span>Total: <span className="agenda-stat-value">{appointments.length}</span></span>
        </div>
        <div className="agenda-stat">
          <Clock size={16} color="#f59e0b" />
          <span>Pendientes: <span className="agenda-stat-value">{appointments.filter(a => a.status === 'pending').length}</span></span>
        </div>
        <div className="agenda-stat">
          <CheckCircle size={16} color="#10b981" />
          <span>Completadas: <span className="agenda-stat-value">{appointments.filter(a => a.status === 'done').length}</span></span>
        </div>
        <div className="agenda-stat">
          <Car size={16} color="#8b5cf6" />
          <span>En Camino: <span className="agenda-stat-value">{appointments.filter(a => a.technicianStatus === 'on_the_way').length}</span></span>
        </div>
        <div className="agenda-stat">
          <MapPin size={16} color="#06b6d4" />
          <span>Llegados: <span className="agenda-stat-value">{appointments.filter(a => a.technicianStatus === 'arrived').length}</span></span>
        </div>
      </div>

      <div className="agenda-container">
        {/* Header */}
        <div className="agenda-header">
          <div className="agenda-nav">
            <button className="agenda-nav-btn" onClick={prevWeek}>
              <ChevronLeft size={20} />
            </button>
            <span className="agenda-week-label">{weekLabel}</span>
            <button className="agenda-nav-btn" onClick={nextWeek}>
              <ChevronRight size={20} />
            </button>
          </div>
          <button className="agenda-today-btn" onClick={goToToday}>
            Hoy
          </button>
        </div>

        {/* Calendar Grid */}
        {loading ? (
          <div style={{ padding: 60, textAlign: 'center' }}>
            <div className="spinner" />
          </div>
        ) : (
          <div className="agenda-grid">
            {/* Time column */}
            <div className="agenda-time-column">
              <div style={{ height: '60px', borderBottom: `1px solid ${colors.border}` }} />
              {HOURS.map(hour => (
                <div key={hour} className="agenda-time-slot">
                  {hour}:00
                </div>
              ))}
            </div>

            {/* Day columns */}
            {weekDates.map((date, index) => {
              const dayAppointments = getAppointmentsForDay(date);
              const isTodayDate = isToday(date);
              
              return (
                <div key={index} className="agenda-day-column">
                  <div className={`agenda-day-header ${isTodayDate ? 'today' : ''}`}>
                    <div className="agenda-day-name">{SHORT_DAYS[date.getDay()]}</div>
                    <div className="agenda-day-number">{date.getDate()}</div>
                    {dayAppointments.length > 0 && (
                      <div style={{ 
                        fontSize: '10px', 
                        color: colors.primary, 
                        marginTop: '4px',
                        fontWeight: 600 
                      }}>
                        {dayAppointments.length} cita{dayAppointments.length !== 1 ? 's' : ''}
                      </div>
                    )}
                  </div>
                  <div className="agenda-slots">
                    {HOURS.map(hour => {
                      const hourAppointments = getAppointmentsForHour(date, hour);
                      
                      return (
                        <div key={hour} className="agenda-slot">
                          {hourAppointments.map((apt, idx) => {
                            const status = STATUS_LABELS[apt.status] || STATUS_LABELS.pending;
                            const techStatus = apt.technicianStatus;
                            const displayStatus = techStatus && techStatus !== 'not_started' && STATUS_LABELS[techStatus] 
                              ? STATUS_LABELS[techStatus] 
                              : status;
                            
                            const startTime = new Date(apt.startTime);
                            const endTime = new Date(apt.endTime);
                            const duration = (endTime - startTime) / (1000 * 60); // minutes
                            const startMinutes = startTime.getMinutes();
                            
                            return (
                              <div
                                key={apt.id}
                                className="agenda-appointment"
                                onClick={() => openDetail(apt)}
                                style={{
                                  top: `${(startMinutes / 60) * 100}%`,
                                  height: `${Math.max(24, (duration / 60) * 100)}%`,
                                  background: displayStatus.bg,
                                  borderLeftColor: displayStatus.color,
                                  color: displayStatus.color,
                                  zIndex: idx + 1,
                                }}
                              >
                                <div className="agenda-apt-time">
                                  {startTime.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })} - 
                                  {endTime.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
                                </div>
                                <div className="agenda-apt-client">{apt.clientName}</div>
                                <div className="agenda-apt-service">{apt.Service?.name}</div>
                                {apt.technicianStatus && apt.technicianStatus !== 'not_started' && (
                                  <div style={{ fontSize: '9px', marginTop: '2px' }}>
                                    {apt.technicianStatus === 'on_the_way' && '🚗 En camino'}
                                    {apt.technicianStatus === 'arrived' && '📍 Llegó'}
                                    {apt.technicianStatus === 'in_progress' && '🔧 En atención'}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedAppointment && (
        <div 
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
          }}
          onClick={() => setShowDetailModal(false)}
        >
          <div 
            style={{
              background: colors.cardBg,
              borderRadius: 16,
              maxWidth: 500,
              width: '100%',
              maxHeight: '90vh',
              overflow: 'auto',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ 
              padding: '20px 24px', 
              borderBottom: `1px solid ${colors.border}`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <h3 style={{ margin: 0, fontSize: '18px', color: colors.text }}>
                Detalle de Cita
              </h3>
              <button 
                onClick={() => setShowDetailModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: colors.textSecondary,
                }}
              >
                ×
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '24px' }}>
              {/* Status Badge */}
              <div style={{ 
                display: 'flex', 
                gap: 8, 
                marginBottom: 20,
                flexWrap: 'wrap',
              }}>
                <span style={{
                  padding: '6px 12px',
                  borderRadius: 20,
                  fontSize: '12px',
                  fontWeight: 600,
                  background: STATUS_LABELS[selectedAppointment.status]?.bg || '#f3f4f6',
                  color: STATUS_LABELS[selectedAppointment.status]?.color || '#374151',
                }}>
                  {STATUS_LABELS[selectedAppointment.status]?.label || selectedAppointment.status}
                </span>
                {selectedAppointment.technicianStatus && selectedAppointment.technicianStatus !== 'not_started' && (
                  <span style={{
                    padding: '6px 12px',
                    borderRadius: 20,
                    fontSize: '12px',
                    fontWeight: 600,
                    background: STATUS_LABELS[selectedAppointment.technicianStatus]?.bg || '#f3f4f6',
                    color: STATUS_LABELS[selectedAppointment.technicianStatus]?.color || '#374151',
                  }}>
                    {STATUS_LABELS[selectedAppointment.technicianStatus]?.label || selectedAppointment.technicianStatus}
                  </span>
                )}
              </div>

              {/* Client Info */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: '12px', color: colors.textSecondary, marginBottom: 4 }}>CLIENTE</div>
                <div style={{ fontSize: '18px', fontWeight: 700, color: colors.text }}>
                  {selectedAppointment.clientName}
                </div>
                <div style={{ fontSize: '14px', color: colors.textSecondary, marginTop: 4 }}>
                  📞 {selectedAppointment.clientPhone}
                </div>
              </div>

              {/* Service Info */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: '12px', color: colors.textSecondary, marginBottom: 4 }}>SERVICIO</div>
                <div style={{ fontSize: '16px', fontWeight: 600, color: colors.text }}>
                  {selectedAppointment.Service?.name}
                </div>
              </div>

              {/* Employee Info */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: '12px', color: colors.textSecondary, marginBottom: 4 }}>EMPLEADO ASIGNADO</div>
                <div style={{ fontSize: '16px', fontWeight: 600, color: colors.text }}>
                  <User size={16} style={{ display: 'inline', marginRight: 6 }} />
                  {selectedAppointment.Employee?.User?.name}
                </div>
              </div>

              {/* Time Info */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: '12px', color: colors.textSecondary, marginBottom: 4 }}>HORARIO</div>
                <div style={{ fontSize: '14px', color: colors.text }}>
                  <Clock size={16} style={{ display: 'inline', marginRight: 6 }} />
                  {new Date(selectedAppointment.startTime).toLocaleString('es-CO', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>

              {/* Tracking Timeline (for field technicians) */}
              {business?.hasFieldTechnicians && (
                <div style={{ 
                  marginTop: 24, 
                  padding: 16, 
                  background: colors.bgSecondary, 
                  borderRadius: 12,
                }}>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: colors.text, marginBottom: 12 }}>
                    📍 Seguimiento del Técnico
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {/* Travel Start */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        background: selectedAppointment.travelStartTime ? '#3b82f6' : '#d1d5db',
                      }} />
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: colors.text }}>
                          🚗 En Camino
                        </div>
                        <div style={{ fontSize: '11px', color: colors.textSecondary }}>
                          {selectedAppointment.travelStartTime 
                            ? new Date(selectedAppointment.travelStartTime).toLocaleString('es-CO', {
                                hour: '2-digit',
                                minute: '2-digit',
                                day: '2-digit',
                                month: 'short',
                              })
                            : 'No iniciado'
                          }
                        </div>
                      </div>
                    </div>

                    {/* Arrival */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        background: selectedAppointment.arrivalTime ? '#06b6d4' : '#d1d5db',
                      }} />
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: colors.text }}>
                          📍 Llegada al Destino
                        </div>
                        <div style={{ fontSize: '11px', color: colors.textSecondary }}>
                          {selectedAppointment.arrivalTime 
                            ? new Date(selectedAppointment.arrivalTime).toLocaleString('es-CO', {
                                hour: '2-digit',
                                minute: '2-digit',
                                day: '2-digit',
                                month: 'short',
                              })
                            : 'No llegó aún'
                          }
                        </div>
                      </div>
                    </div>

                    {/* Service Start */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        background: selectedAppointment.serviceStartTime ? '#ec4899' : '#d1d5db',
                      }} />
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: colors.text }}>
                          🔧 Inicio del Servicio
                        </div>
                        <div style={{ fontSize: '11px', color: colors.textSecondary }}>
                          {selectedAppointment.serviceStartTime 
                            ? new Date(selectedAppointment.serviceStartTime).toLocaleString('es-CO', {
                                hour: '2-digit',
                                minute: '2-digit',
                                day: '2-digit',
                                month: 'short',
                              })
                            : 'No iniciado'
                          }
                        </div>
                      </div>
                    </div>

                    {/* Completion */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        background: selectedAppointment.status === 'done' ? '#10b981' : '#d1d5db',
                      }} />
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: colors.text }}>
                          ✅ Servicio Completado
                        </div>
                        <div style={{ fontSize: '11px', color: colors.textSecondary }}>
                          {selectedAppointment.status === 'done' 
                            ? 'Completada'
                            : 'Pendiente'
                          }
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Parts/Supplies Used */}
                  {selectedAppointment.workReport?.partsUsed && selectedAppointment.workReport.partsUsed.length > 0 && (
                    <div style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${colors.border}` }}>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: colors.text, marginBottom: 8 }}>
                        <Package size={14} style={{ display: 'inline', marginRight: 6 }} />
                        Insumos Utilizados
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {selectedAppointment.workReport.partsUsed.map((part, idx) => (
                          <div key={idx} style={{ 
                            fontSize: '12px', 
                            color: colors.textSecondary,
                            display: 'flex',
                            justifyContent: 'space-between',
                          }}>
                            <span>{part.name}</span>
                            <span>{part.quantity} {part.unit}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Work Notes */}
                  {selectedAppointment.workReport?.diagnosis && (
                    <div style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${colors.border}` }}>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: colors.text, marginBottom: 8 }}>
                        📝 Diagnóstico
                      </div>
                      <div style={{ fontSize: '12px', color: colors.textSecondary }}>
                        {selectedAppointment.workReport.diagnosis}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

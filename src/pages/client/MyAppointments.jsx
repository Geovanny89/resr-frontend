import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import notificationService from '../../services/notificationService';
import { Capacitor } from '@capacitor/core';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  isSameMonth, 
  isSameDay, 
  addDays, 
  eachDayOfInterval,
  parseISO
} from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, MapPin, User as UserIcon, XCircle, LogOut, RefreshCw } from 'lucide-react';

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

export default function MyAppointments() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [view, setView] = useState('calendar'); // 'calendar' or 'list'
  const [listPage, setListPage] = useState(1);
  const listItemsPerPage = 5;

  // Recargar citas cada vez que se monta el componente
  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      // Obtener el email del localStorage cada vez (no solo al inicio)
      const clientEmail = localStorage.getItem('clientEmail');
      console.log('📧 Cargando citas para:', clientEmail);
      
      // Si hay un clientEmail en localStorage (modo cliente simplificado), usamos ese
      const params = clientEmail ? { email: clientEmail } : {};
      const response = await api.get('/appointments/my-client-appointments', { params });
      console.log('📋 Citas cargadas:', response.data.length);
      setAppointments(response.data);
      
      // Programar notificaciones automáticamente si estamos en APK
      if (Capacitor.isNativePlatform() && response.data.length > 0) {
        notificationService.scheduleMultipleNotifications(
          response.data,
          'client', // ID genérico para clientes
          'Cliente'
        );
      }
    } catch (e) {
      console.error("Error cargando citas", e);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('clientEmail');
    localStorage.removeItem('userRole');
    logout();
    navigate('/login');
  };

  const handleCancel = async (id) => {
    if (!window.confirm('¿Estás seguro de que deseas cancelar tu cita?')) return;
    try {
      await api.patch(`/appointments/${id}/cancel`);
      loadAppointments();
    } catch (e) {
      alert('Error al cancelar la cita');
    }
  };

  const renderHeader = () => {
    return (
      <div className="my-appointments-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, background: 'white', padding: '15px 20px', borderRadius: 12, boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
        <div className="my-appointments-month-controls" style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
          <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} style={{ background: '#edf2f7', border: 'none', padding: 8, borderRadius: '50%', cursor: 'pointer', display: 'flex' }}>
            <ChevronLeft size={20} color="#4a5568" />
          </button>
          <h2 className="my-appointments-month-title" style={{ fontSize: 18, fontWeight: 700, color: '#2d3748', minWidth: 150, textAlign: 'center', textTransform: 'capitalize' }}>
            {format(currentMonth, 'MMMM yyyy', { locale: es })}
          </h2>
          <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} style={{ background: '#edf2f7', border: 'none', padding: 8, borderRadius: '50%', cursor: 'pointer', display: 'flex' }}>
            <ChevronRight size={20} color="#4a5568" />
          </button>
        </div>
        <div style={{ display: 'flex', background: '#edf2f7', padding: 4, borderRadius: 8 }}>
          <button 
            onClick={() => setView('calendar')}
            style={{ 
              padding: '6px 16px', borderRadius: 6, border: 'none', fontSize: 14, fontWeight: 600, cursor: 'pointer',
              background: view === 'calendar' ? 'white' : 'transparent',
              boxShadow: view === 'calendar' ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
              color: view === 'calendar' ? '#667eea' : '#718096'
            }}
          >
            Calendario
          </button>
          <button 
            onClick={() => setView('list')}
            style={{ 
              padding: '6px 16px', borderRadius: 6, border: 'none', fontSize: 14, fontWeight: 600, cursor: 'pointer',
              background: view === 'list' ? 'white' : 'transparent',
              boxShadow: view === 'list' ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
              color: view === 'list' ? '#667eea' : '#718096'
            }}
          >
            Lista
          </button>
        </div>
      </div>
    );
  };

  const renderDays = () => {
    const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: 10 }}>
        {days.map(day => (
          <div key={day} style={{ textAlign: 'center', fontSize: 12, fontWeight: 700, color: '#a0aec0', textTransform: 'uppercase' }}>
            {day}
          </div>
        ))}
      </div>
    );
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });
    
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8 }}>
        {calendarDays.map(day => {
          const dayAppointments = appointments.filter(apt => isSameDay(parseISO(apt.startTime), day));
          const isSelected = isSameDay(day, selectedDate);
          const isCurrentMonth = isSameMonth(day, monthStart);
          
          return (
            <div 
              key={day.toString()}
              onClick={() => setSelectedDate(day)}
              style={{ 
                minHeight: 80, padding: 8, borderRadius: 12, cursor: 'pointer', transition: 'all 0.2s',
                background: isSelected ? '#ebf4ff' : 'white',
                border: isSelected ? '2px solid #667eea' : '2px solid transparent',
                boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                opacity: isCurrentMonth ? 1 : 0.4
              }}
            >
              <div style={{ fontSize: 14, fontWeight: 700, color: isSelected ? '#667eea' : '#4a5568', marginBottom: 4 }}>
                {format(day, 'd')}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {dayAppointments.slice(0, 2).map(apt => (
                  <div key={apt.id} style={{ 
                    height: 6, width: '100%', borderRadius: 3, 
                    background: STATUS_COLORS[apt.status] || '#cbd5e0' 
                  }} />
                ))}
                {dayAppointments.length > 2 && (
                  <div style={{ fontSize: 10, color: '#718096', fontWeight: 600 }}>
                    +{dayAppointments.length - 2} más
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderSelectedDateAppointments = () => {
    const dayAppointments = appointments.filter(apt => isSameDay(parseISO(apt.startTime), selectedDate));
    
    return (
      <div style={{ marginTop: 30 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: '#2d3748', marginBottom: 15, display: 'flex', alignItems: 'center', gap: 8 }}>
          <CalendarIcon size={18} />
          Citas para el {format(selectedDate, "d 'de' MMMM", { locale: es })}
        </h3>
        
        {dayAppointments.length === 0 ? (
          <div style={{ background: 'white', padding: 30, borderRadius: 12, textAlign: 'center', color: '#718096', border: '1px dashed #cbd5e0' }}>
            No tienes citas para este día
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 12 }}>
            {dayAppointments.map(apt => (
              <AppointmentCard key={apt.id} apt={apt} onCancel={handleCancel} />
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderListView = () => {
    if (appointments.length === 0) {
      return (
        <div style={{ textAlign: 'center', background: 'white', padding: '60px 20px', borderRadius: 16, boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
          <div style={{ fontSize: 64, marginBottom: 20 }}>📅</div>
          <h2 style={{ fontSize: 20, color: '#2d3748', marginBottom: 10, fontWeight: 700 }}>No tienes citas programadas</h2>
          <p style={{ color: '#718096', marginBottom: 30 }}>¡Reserva tu próxima cita en tu negocio favorito!</p>
          <Link to="/" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', textDecoration: 'none', padding: '12px 24px', borderRadius: 10, fontWeight: 600, display: 'inline-block' }}>
            Explorar Negocios
          </Link>
        </div>
      );
    }

    // Paginación
    const totalPages = Math.ceil(appointments.length / listItemsPerPage);
    const startIndex = (listPage - 1) * listItemsPerPage;
    const paginatedAppointments = appointments.slice(startIndex, startIndex + listItemsPerPage);

    return (
      <div>
        <div style={{ display: 'grid', gap: 16 }}>
          {paginatedAppointments.map(apt => (
            <AppointmentCard key={apt.id} apt={apt} onCancel={handleCancel} />
          ))}
        </div>
        
        {/* Paginación */}
        {totalPages > 1 && (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            gap: 12, 
            marginTop: 20,
            padding: '12px',
          }}>
            <button
              onClick={() => setListPage(p => Math.max(1, p - 1))}
              disabled={listPage === 1}
              style={{ 
                padding: '8px 12px', 
                borderRadius: 8, 
                border: 'none',
                background: listPage === 1 ? '#e2e8f0' : '#4f46e5',
                color: listPage === 1 ? '#a0aec0' : 'white',
                cursor: listPage === 1 ? 'not-allowed' : 'pointer',
                fontSize: 13,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 4
              }}
            >
              <ChevronLeft size={16} /> Anterior
            </button>
            <span style={{ fontSize: 14, fontWeight: 600, color: '#2d3748' }}>
              Página {listPage} de {totalPages}
            </span>
            <button
              onClick={() => setListPage(p => Math.min(totalPages, p + 1))}
              disabled={listPage === totalPages}
              style={{ 
                padding: '8px 12px', 
                borderRadius: 8, 
                border: 'none',
                background: listPage === totalPages ? '#e2e8f0' : '#4f46e5',
                color: listPage === totalPages ? '#a0aec0' : 'white',
                cursor: listPage === totalPages ? 'not-allowed' : 'pointer',
                fontSize: 13,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 4
              }}
            >
              Siguiente <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    );
  };

  const handleRebook = (bizSlug) => {
    // Redirigir directamente al flujo de agendado (/slug/book)
    navigate(`/${bizSlug}/book`);
  };

  const renderCalendar = () => (
    <div className="my-appointments-layout" style={{ 
      display: 'grid', 
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
      gap: 24, 
      alignItems: 'start' 
    }}>
      <div className="calendar-container">
        {renderHeader()}
        <div style={{ background: 'white', padding: 12, borderRadius: 16, boxShadow: '0 4px 6px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
          {renderDays()}
          {renderCells()}
        </div>
      </div>
      <div className="details-container">
        {renderSelectedDateAppointments()}
      </div>
    </div>
  );

  return (
    <div className="my-appointments-page" style={{ background: '#f8fafc', minHeight: '100vh', paddingBottom: 80 }}>
      <style>{`
        @media (max-width: 640px) {
          .my-appointments-header {
            flex-direction: column;
            gap: 12px;
            align-items: stretch !important;
          }
          .my-appointments-month-controls {
            justify-content: space-between;
          }
          .my-appointments-month-title {
            min-width: 0 !important;
            flex: 1;
          }
          .my-appointment-card {
            flex-direction: column;
            align-items: stretch !important;
          }
          .my-appointment-card-actions {
            margin-left: 0 !important;
            margin-top: 12px;
          }
          .my-appointment-card-actions button {
            width: 100%;
            justify-content: center;
          }
          .my-appointment-card-meta {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
      <div className="my-appointments-topbar" style={{ background: 'linear-gradient(135deg, #4f46e5, #4338ca)', padding: '24px 16px', color: 'white', borderBottomRightRadius: 24, borderBottomLeftRadius: 24, boxShadow: '0 4px 12px rgba(79, 70, 229, 0.2)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h1 style={{ fontSize: 24, fontWeight: 800 }}>Mis Citas</h1>
          <button onClick={handleLogout} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', padding: '8px 12px', borderRadius: 10, cursor: 'pointer' }}>
            <LogOut size={20} />
          </button>
        </div>
        
        <div style={{ display: 'flex', gap: 12, background: 'rgba(255,255,255,0.1)', padding: 4, borderRadius: 12 }}>
          <button 
            onClick={() => setView('calendar')}
            style={{ flex: 1, padding: '10px', borderRadius: 10, border: 'none', background: view === 'calendar' ? 'white' : 'transparent', color: view === 'calendar' ? '#4f46e5' : 'white', fontWeight: 700, fontSize: 14, transition: 'all 0.2s' }}
          >
            Calendario
          </button>
          <button 
            onClick={() => setView('list')}
            style={{ flex: 1, padding: '10px', borderRadius: 10, border: 'none', background: view === 'list' ? 'white' : 'transparent', color: view === 'list' ? '#4f46e5' : 'white', fontWeight: 700, fontSize: 14, transition: 'all 0.2s' }}
          >
            Lista
          </button>
        </div>
      </div>

      <div className="my-appointments-content" style={{ padding: 16 }}>
        {/* Sección de Negocios Frecuentes para re-agendar */}
        {appointments.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#2d3748', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <RefreshCw size={18} color="#4f46e5" /> Agendar nueva cita en:
            </h3>
            <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 8, scrollbarWidth: 'none' }}>
              {[...new Map(appointments.map(a => [a.Business.slug, a.Business])).values()].map(biz => (
                <button 
                  key={biz.slug}
                  onClick={() => handleRebook(biz.slug)}
                  style={{ 
                    flex: '0 0 auto',
                    background: 'white',
                    padding: '12px 20px',
                    borderRadius: 16,
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 4,
                    cursor: 'pointer'
                  }}
                >
                  <span style={{ fontWeight: 700, color: '#4f46e5', fontSize: 14 }}>{biz.name}</span>
                  <span style={{ fontSize: 11, color: '#718096' }}>Agendar →</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <div className="spinner" style={{ border: '4px solid #f3f3f3', borderTop: '4px solid #4f46e5', borderRadius: '50%', width: 40, height: 40, margin: '0 auto 16px', animation: 'spin 1s linear infinite' }}></div>
            <p style={{ color: '#718096' }}>Cargando tus citas...</p>
          </div>
        ) : appointments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', background: 'white', borderRadius: 20, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📅</div>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#2d3748', marginBottom: 8 }}>No tienes citas aún</h3>
            <p style={{ fontSize: 14, color: '#718096', lineHeight: 1.5, marginBottom: 24 }}>
              Cuando agendes una cita en cualquiera de nuestros negocios aliados, aparecerá aquí automáticamente.
            </p>
            <Link to="/" style={{ background: '#4f46e5', color: 'white', padding: '12px 24px', borderRadius: 12, textDecoration: 'none', fontWeight: 600, display: 'inline-flex' }}>
              Explorar Negocios
            </Link>
          </div>
        ) : (
          view === 'calendar' ? renderCalendar() : renderListView()
        )}
      </div>
    </div>
  );
}

function AppointmentCard({ apt, onCancel }) {
  const startTime = parseISO(apt.startTime);
  
  return (
    <div className="my-appointment-card" style={{ 
      background: 'white', padding: 20, borderRadius: 16, boxShadow: '0 2px 4px rgba(0,0,0,0.04)', 
      borderLeft: `6px solid ${STATUS_COLORS[apt.status]}`,
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      transition: 'transform 0.2s',
      cursor: 'default'
    }}>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <span style={{ 
            padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 800,
            background: STATUS_COLORS[apt.status], color: 'white', textTransform: 'uppercase'
          }}>
            {STATUS_LABELS[apt.status]}
          </span>
          <span style={{ color: '#a0aec0', fontSize: 12 }}>•</span>
          <span style={{ color: '#718096', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
            <Clock size={14} />
            {format(startTime, 'HH:mm')}
          </span>
        </div>
        
        <h3 style={{ fontSize: 17, fontWeight: 700, color: '#2d3748', marginBottom: 6 }}>{apt.Service?.name}</h3>
        
        <div className="my-appointment-card-meta" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#4a5568', fontSize: 13 }}>
            <MapPin size={14} color="#718096" />
            <span style={{ fontWeight: 500 }}>{apt.Business?.name}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#4a5568', fontSize: 13 }}>
            <UserIcon size={14} color="#718096" />
            <span>{apt.Employee?.User?.name}</span>
          </div>
        </div>
      </div>
      
      <div className="my-appointment-card-actions" style={{ marginLeft: 20 }}>
        {/* Solo mostrar cancelar para citas que aún pueden cancelarse */}
        {(apt.status === 'pending' || apt.status === 'confirmed') && (
          <button 
            onClick={() => onCancel(apt.id)}
            style={{ 
              background: '#fff5f5', border: '1px solid #feb2b2', color: '#e53e3e', 
              padding: '8px 12px', borderRadius: 10, fontSize: 13, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600,
              transition: 'all 0.2s'
            }}
            onMouseOver={e => { e.target.style.background = '#fed7d7' }}
            onMouseOut={e => { e.target.style.background = '#fff5f5' }}
          >
            <XCircle size={16} />
            Cancelar
          </button>
        )}
        {apt.status === 'done' && (
          <span style={{ fontSize: 12, color: '#059669', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
            ✓ Completada
          </span>
        )}
        {apt.status === 'cancelled' && (
          <span style={{ fontSize: 12, color: '#6b7280', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
            ✗ Cancelada
          </span>
        )}
      </div>
    </div>
  );
}

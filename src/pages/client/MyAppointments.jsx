import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
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
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, MapPin, User as UserIcon, XCircle } from 'lucide-react';

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
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [view, setView] = useState('calendar'); // 'calendar' or 'list'

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const response = await api.get('/appointments/my-client-appointments');
      setAppointments(response.data);
    } catch (e) {
      console.error("Error cargando citas", e);
    } finally {
      setLoading(false);
    }
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

    return (
      <div style={{ display: 'grid', gap: 16 }}>
        {appointments.map(apt => (
          <AppointmentCard key={apt.id} apt={apt} onCancel={handleCancel} />
        ))}
      </div>
    );
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f7fafc', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <style>{`
        @media (max-width: 900px) {
          .my-appointments-layout {
            grid-template-columns: 1fr !important;
            gap: 16px !important;
          }
          .my-appointments-header {
            flex-direction: column;
            align-items: stretch !important;
            gap: 12px;
          }
          .my-appointments-month-controls {
            justify-content: center;
          }
          .my-appointments-month-title {
            min-width: 0 !important;
            font-size: 16px !important;
          }
        }
        @media (max-width: 640px) {
          .my-appointments-topbar-inner {
            flex-direction: column;
            align-items: flex-start !important;
            gap: 10px;
          }
          .my-appointments-topbar-actions {
            width: 100%;
            justify-content: space-between;
          }
          .my-appointments-wrapper {
            padding: 20px 12px !important;
          }
          .my-appointments-title {
            font-size: 24px !important;
          }
          .my-appointment-card {
            flex-direction: column;
            align-items: flex-start !important;
            gap: 12px;
          }
          .my-appointment-card-meta {
            grid-template-columns: 1fr !important;
          }
          .my-appointment-card-actions {
            margin-left: 0 !important;
            width: 100%;
          }
        }
      `}</style>
      {/* Navbar */}
      <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '15px 20px', color: 'white', position: 'sticky', top: 0, zIndex: 10 }}>
        <div className="my-appointments-topbar-inner" style={{ maxWidth: 1000, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ background: 'white', padding: 6, borderRadius: 8, fontSize: 18 }}>🎲</div>
            <h1 style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.5px' }}>K-DICE</h1>
          </div>
          <div className="my-appointments-topbar-actions" style={{ display: 'flex', gap: 12 }}>
            <Link to="/" style={{ color: 'white', textDecoration: 'none', fontSize: 14, fontWeight: 600, padding: '6px 12px' }}>Inicio</Link>
            <button onClick={() => logout()} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', padding: '6px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>
              Salir
            </button>
          </div>
        </div>
      </div>

      <div className="my-appointments-wrapper" style={{ maxWidth: 1000, margin: '0 auto', padding: '30px 20px' }}>
        <div style={{ marginBottom: 30 }}>
          <h1 className="my-appointments-title" style={{ fontSize: 28, fontWeight: 800, color: '#1a202c', marginBottom: 8 }}>Mis Citas</h1>
          <p style={{ color: '#718096' }}>Gestiona tus reservas y horarios</p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 50 }}>
            <div className="spinner" style={{ border: '4px solid #f3f3f3', borderTop: '4px solid #667eea', borderRadius: '50%', width: 40, height: 40, margin: '0 auto 20px', animation: 'spin 1s linear infinite' }}></div>
            <p style={{ color: '#718096', fontWeight: 500 }}>Cargando tus citas...</p>
            <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
          </div>
        ) : (
          <>
            {view === 'calendar' ? (
              <div className="my-appointments-layout" style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: 30, alignItems: 'start' }}>
                <div className="calendar-container">
                  {renderHeader()}
                  <div style={{ background: 'white', padding: 20, borderRadius: 16, boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                    {renderDays()}
                    {renderCells()}
                  </div>
                </div>
                <div className="details-container">
                  {renderSelectedDateAppointments()}
                </div>
              </div>
            ) : (
              renderListView()
            )}
          </>
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
      </div>
    </div>
  );
}

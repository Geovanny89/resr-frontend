/**
 * Tarjeta de cita para la agenda
 * Extraído de Agenda.jsx
 */
import { getDisplayStatus, getTechnicianStatusIcon, hasVisibleTechnicianStatus } from '../../utils/appointmentStatus';
import { formatTime, getStartMinutes, getDurationMinutes } from '../../utils/calendar';

export default function AppointmentCard({ 
  appointment, 
  colors, 
  index = 0,
  total = 1,
  onClick,
  style = {}
}) {
  const displayStatus = getDisplayStatus(appointment);
  const startTime = new Date(appointment.startTime);
  const endTime = new Date(appointment.endTime);
  const duration = getDurationMinutes(appointment.startTime, appointment.endTime);
  const startMinutes = getStartMinutes(appointment.startTime);
  
  const showTechStatus = hasVisibleTechnicianStatus(appointment);
  
  return (
    <div
      className="agenda-appointment"
      onClick={onClick}
      style={{
        position: 'absolute',
        left: `${(index / total) * 100}%`,
        width: `calc(${(100 / total)}% - 4px)`,
        margin: '0 2px',
        top: `${(startMinutes / 60) * 100}%`,
        height: `calc(${(duration / 60) * 100}% - 2px)`,
        minHeight: '28px',
        borderRadius: '10px',
        padding: '6px 10px',
        fontSize: '11px',
        cursor: 'pointer',
        overflow: 'hidden',
        transition: 'transform 0.1s ease-out',
        border: `1px solid ${displayStatus.color}40`,
        borderLeft: `4px solid ${displayStatus.color}`,
        background: displayStatus.bg,
        color: displayStatus.color,
        boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
        zIndex: index + 1,
        display: 'flex',
        flexDirection: 'column',
        gap: '1px',
        ...style,
      }}

      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-1px) scale(1.02)';
        e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.1)';
        e.currentTarget.style.zIndex = '100';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'none';
        e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)';
        e.currentTarget.style.zIndex = index + 1;
      }}
    >
      <div style={{ 
        fontSize: '9px', 
        fontWeight: 700, 
        opacity: 0.7, 
        display: 'flex', 
        justifyContent: 'space-between',
        marginBottom: '2px'
      }}>
        <span>{formatTime(startTime)} - {formatTime(endTime)}</span>
        {showTechStatus && (
          <span>{getTechnicianStatusIcon(appointment.technicianStatus)}</span>
        )}
      </div>
      
      <div style={{ 
        fontWeight: 700, 
        fontSize: '12px',
        whiteSpace: 'nowrap', 
        overflow: 'hidden', 
        textOverflow: 'ellipsis',
        lineHeight: 1.2
      }}>
        {appointment.clientName}
      </div>
      
      <div style={{ 
        fontSize: '10px', 
        opacity: 0.8, 
        whiteSpace: 'nowrap', 
        overflow: 'hidden', 
        textOverflow: 'ellipsis',
        fontWeight: 500
      }}>
        {appointment.Service?.name}
      </div>

      {appointment.Employee?.User?.name && duration > 45 && (
        <div style={{ 
          fontSize: '9px', 
          marginTop: 'auto', 
          paddingTop: '4px',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          borderTop: `1px solid ${displayStatus.color}20`
        }}>
          <span style={{ opacity: 0.6 }}>👤</span>
          <span style={{ fontWeight: 600 }}>{appointment.Employee.User.name}</span>
        </div>
      )}
    </div>

  );
}

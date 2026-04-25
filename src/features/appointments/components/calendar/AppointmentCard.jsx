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
        left: '2px',
        right: '2px',
        top: `${(startMinutes / 60) * 100}%`,
        height: `${Math.max(24, (duration / 60) * 100)}%`,
        borderRadius: '6px',
        padding: '4px 6px',
        fontSize: '11px',
        cursor: 'pointer',
        overflow: 'hidden',
        transition: 'transform 0.1s, box-shadow 0.1s',
        borderLeft: `3px solid ${displayStatus.color}`,
        background: displayStatus.bg,
        color: displayStatus.color,
        zIndex: index + 1,
        ...style,
      }}
    >
      <div style={{ fontSize: '9px', opacity: 0.8 }}>
        {formatTime(startTime)} - {formatTime(endTime)}
      </div>
      <div style={{ fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {appointment.clientName}
      </div>
      <div style={{ fontSize: '10px', opacity: 0.9, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {appointment.Service?.name}
      </div>
      {appointment.Employee?.User?.name && (
        <div style={{ fontSize: '9px', marginTop: '2px', opacity: 0.8 }}>
          👤 {appointment.Employee.User.name}
        </div>
      )}
      {showTechStatus && (
        <div style={{ fontSize: '9px', marginTop: '2px' }}>
          {getTechnicianStatusIcon(appointment.technicianStatus)}
        </div>
      )}
    </div>
  );
}

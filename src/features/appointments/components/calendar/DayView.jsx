/**
 * Vista diaria de la agenda
 * Extraído de Agenda.jsx
 */
import { DAYS_ES } from '../../utils/calendar';
import { isToday } from '../../utils/calendar';
import TimeColumn from './TimeColumn';
import AppointmentCard from './AppointmentCard';

export default function DayView({
  colors,
  selectedDate,
  HOURS,
  getAppointmentsForDay,
  getAppointmentsForHour,
  onAppointmentClick,
}) {
  const dayAppointments = getAppointmentsForDay(selectedDate);
  const isTodayDate = isToday(selectedDate);
  
  return (
    <div 
      className="agenda-grid" 
      style={{ 
        display: 'grid',
        gridTemplateColumns: '60px 1fr',
        overflowX: 'auto',
      }}
    >
      <TimeColumn colors={colors} />

      {/* Single Day Column */}
      <div 
        className="agenda-day-column"
        style={{ borderRight: `1px solid ${colors.border}` }}
      >
        <div 
          className={`agenda-day-header ${isTodayDate ? 'today' : ''}`}
          style={{
            height: '140px',
            padding: '12px 8px',
            textAlign: 'center',
            borderBottom: `1px solid ${colors.border}`,
            background: isTodayDate ? `${colors.primary}15` : colors.bgSecondary,
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div style={{ fontSize: '11px', fontWeight: 600, color: colors.textSecondary, textTransform: 'uppercase' }}>
            {DAYS_ES[selectedDate.getDay()]}
          </div>
          <div style={{ fontSize: '20px', fontWeight: 700, color: isTodayDate ? colors.primary : colors.text, marginTop: '4px' }}>
            {selectedDate.getDate()}
          </div>
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
            const hourAppointments = getAppointmentsForHour(selectedDate, hour);
            
            return (
              <div 
                key={hour} 
                className="agenda-slot"
                style={{
                  height: '140px',
                  borderBottom: `1px solid ${colors.border}30`,
                  position: 'relative',
                }}
              >
                {hourAppointments.map((apt, idx) => (
                  <AppointmentCard
                    key={apt.id}
                    appointment={apt}
                    colors={colors}
                    index={idx}
                    onClick={() => onAppointmentClick(apt)}
                  />
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

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
      className="agenda-grid day-view" 
      style={{ 
        display: 'grid',
        background: colors.cardBg,
      }}
    >
      <TimeColumn colors={colors} />

      <div className="agenda-day-column">
        {/* Header 'Cuadro' similar a WeekView */}
        <div 
          className="agenda-day-header today"
          style={{
            height: '100px',
            padding: '12px 8px',
            textAlign: 'center',
            borderBottom: `1px solid ${colors.border}40`,
            background: colors.cardBg,
            borderTop: `3px solid ${colors.primary}`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            boxSizing: 'border-box',
            position: 'sticky',
            top: 0,
            zIndex: 5
          }}
        >
          <div style={{ 
            fontSize: '11px', 
            fontWeight: 700, 
            color: colors.primary, 
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            {DAYS_ES[selectedDate.getDay()]}
          </div>
          <div style={{ 
            fontSize: '28px', 
            fontWeight: 800, 
            color: colors.primary, 
            marginTop: '4px',
            lineHeight: 1
          }}>
            {selectedDate.getDate()}
          </div>
        </div>

        <div className="agenda-slots">
          {HOURS.map(hour => {
            const hourAppointments = getAppointmentsForHour(selectedDate, hour);
            
            return (
              <div 
                key={hour} 
                className="agenda-slot"
              >
                {hourAppointments.map((apt, idx) => (
                  <AppointmentCard
                    key={apt.id}
                    appointment={apt}
                    colors={colors}
                    index={idx}
                    total={hourAppointments.length}
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

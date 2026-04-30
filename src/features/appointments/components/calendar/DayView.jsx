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
            height: '100px',

            padding: '12px 8px',
            textAlign: 'center',
            borderBottom: `1px solid ${colors.border}`,
            background: isTodayDate ? `linear-gradient(to bottom, ${colors.primary}10, ${colors.primary}05)` : colors.bgSecondary,
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s ease',
            position: 'relative'
          }}
        >
          {isTodayDate && (
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: colors.primary,
              boxShadow: `0 2px 8px ${colors.primary}40`
            }} />
          )}
          <div style={{ 
            fontSize: '11px', 
            fontWeight: 700, 
            color: isTodayDate ? colors.primary : colors.textSecondary, 
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}>
            {DAYS_ES[selectedDate.getDay()]}
          </div>
          <div style={{ 
            fontSize: '32px', 
            fontWeight: 800, 
            color: isTodayDate ? colors.primary : colors.text, 
            marginTop: '2px',
            lineHeight: 1
          }}>
            {selectedDate.getDate()}
          </div>
          {dayAppointments.length > 0 && (
            <div style={{ 
              fontSize: '10px', 
              color: isTodayDate ? colors.primary : colors.textSecondary, 
              marginTop: '8px',
              fontWeight: 700,
              background: isTodayDate ? `${colors.primary}20` : `${colors.border}`,
              padding: '2px 12px',
              borderRadius: '20px'
            }}>
              {dayAppointments.length} cita{dayAppointments.length !== 1 ? 's' : ''} para hoy
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

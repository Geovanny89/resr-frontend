/**
 * Vista semanal de la agenda
 * Extraído de Agenda.jsx
 */
import { SHORT_DAYS, isToday } from '../../utils/calendar';
import TimeColumn from './TimeColumn';
import AppointmentCard from './AppointmentCard';

export default function WeekView({
  colors,
  weekDates,
  HOURS,
  getAppointmentsForDay,
  getAppointmentsForHour,
  onDayClick,
  onAppointmentClick,
}) {
  return (
    <div className="agenda-grid">

      <TimeColumn colors={colors} />

      {/* Day columns */}
      {weekDates.map((date, index) => {
        const dayAppointments = getAppointmentsForDay(date);
        const isTodayDate = isToday(date);
        
        return (
          <div 
            key={index} 
            className="agenda-day-column" 
            onClick={() => onDayClick(date)}
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
                  height: '3px',
                  background: colors.primary,
                  boxShadow: `0 2px 4px ${colors.primary}40`
                }} />
              )}
              <div style={{ 
                fontSize: '11px', 
                fontWeight: 700, 
                color: isTodayDate ? colors.primary : colors.textSecondary, 
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                {SHORT_DAYS[date.getDay()]}
              </div>
              <div style={{ 
                fontSize: '24px', 
                fontWeight: 800, 
                color: isTodayDate ? colors.primary : colors.text, 
                marginTop: '2px',
                lineHeight: 1
              }}>
                {date.getDate()}
              </div>
              {dayAppointments.length > 0 && (
                <div style={{ 
                  fontSize: '9px', 
                  color: isTodayDate ? colors.primary : colors.textSecondary, 
                  marginTop: '6px',
                  fontWeight: 600,
                  background: isTodayDate ? `${colors.primary}20` : `${colors.border}`,
                  padding: '2px 8px',
                  borderRadius: '12px'
                }}>
                  {dayAppointments.length} cita{dayAppointments.length !== 1 ? 's' : ''}
                </div>
              )}
            </div>

            <div className="agenda-slots">
              {HOURS.map(hour => {
                const hourAppointments = getAppointmentsForHour(date, hour);
                
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
                        onClick={(e) => {
                          e.stopPropagation();
                          onAppointmentClick(apt);
                        }}
                      />
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

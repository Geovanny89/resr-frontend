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
    <div 
      className="agenda-grid"
      style={{
        display: 'grid',
        gridTemplateColumns: '60px repeat(7, 1fr)',
        overflowX: 'auto',
      }}
    >
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
            style={{ 
              borderRight: `1px solid ${colors.border}`,
              minWidth: '140px',
              cursor: 'pointer',
            }}
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
                {SHORT_DAYS[date.getDay()]}
              </div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: isTodayDate ? colors.primary : colors.text, marginTop: '4px' }}>
                {date.getDate()}
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
                const hourAppointments = getAppointmentsForHour(date, hour);
                
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

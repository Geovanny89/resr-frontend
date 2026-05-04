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
    <div className="agenda-grid week-view">

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
            style={{ borderRight: `1px dashed ${colors.border}80` }}
          >
            <div 
              className={`agenda-day-header ${isTodayDate ? 'today' : ''}`}
              style={{
                height: '100px',
                padding: '12px 8px',
                textAlign: 'center',
                borderBottom: `1px solid ${colors.border}40`,
                background: isTodayDate ? colors.cardBg : colors.cardBg, // Fondo sólido para que no sea transparente al scroll
                borderTop: isTodayDate ? `3px solid ${colors.primary}` : 'none',
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
              {isTodayDate && isTodayDate && (
                 <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: colors.primary }} />
              )}
              <div style={{ 
                fontSize: '11px', 
                fontWeight: 700, 
                color: isTodayDate ? colors.primary : '#6b7280', 
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                {SHORT_DAYS[date.getDay()]}
              </div>
              <div style={{ 
                fontSize: '28px', 
                fontWeight: 800, 
                color: isTodayDate ? colors.primary : '#1f2937', 
                marginTop: '4px',
                lineHeight: 1
              }}>
                {date.getDate()}
              </div>
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

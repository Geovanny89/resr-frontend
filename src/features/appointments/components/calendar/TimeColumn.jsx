/**
 * Columna de horas para la agenda
 * Extraído de Agenda.jsx
 */
import { HOURS } from '../../utils/calendar';

export default function TimeColumn({ colors }) {
  return (
    <div 
      className="agenda-time-column"
      style={{
        borderRight: `1px solid ${colors.border}80`,
        background: colors.cardBg,
      }}
    >
      <div style={{ 
        height: '100px', 
        position: 'sticky', 
        top: 0, 
        zIndex: 6, 
        background: colors.cardBg,
        borderBottom: `1px solid ${colors.border}40` 
      }} />
      {HOURS.map(hour => {
        const ampm = hour >= 12 ? 'pm' : 'am';
        const displayHour = hour > 12 ? hour - 12 : (hour === 0 ? 12 : hour);
        const hourStr = String(displayHour).padStart(2, '0');

        return (
          <div key={hour} className="time-label-group" style={{ height: '100px', position: 'relative' }}>
            <div style={{ 
              position: 'absolute', 
              top: '-8px', 
              right: '8px',
              background: colors.cardBg,
              padding: '0 4px',
              zIndex: 2
            }}>
              <span className="time-main" style={{ fontSize: '11px', color: colors.textSecondary }}>
                {hourStr}:00
              </span>
            </div>
            <div className="time-sub" style={{ marginTop: '25px' }}>15</div>
            <div className="time-sub" style={{ marginTop: '15px' }}>30</div>
            <div className="time-sub" style={{ marginTop: '15px' }}>45</div>
          </div>
        );
      })}
    </div>
  );
}

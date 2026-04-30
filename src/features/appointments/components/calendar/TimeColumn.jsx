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
        borderRight: `1px solid ${colors.border}`,
        background: colors.bgSecondary,
      }}
    >
      <div style={{ height: '100px', borderBottom: `1px solid ${colors.border}` }} />
      {HOURS.map(hour => (
        <div 
          key={hour} 
          className="agenda-time-slot"
          style={{
            height: '120px',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            paddingTop: '4px',
            fontSize: '12px',
            fontWeight: 600,
            color: colors.textSecondary,
            borderBottom: `1px solid ${colors.border}40`,
          }}
        >
          {hour}:00
        </div>
      ))}

    </div>
  );
}

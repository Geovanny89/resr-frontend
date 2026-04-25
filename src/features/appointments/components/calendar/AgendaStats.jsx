/**
 * Barra de estadísticas para la agenda
 * Extraído de Agenda.jsx
 */
import { Calendar, Clock, CheckCircle, Car, MapPin } from 'lucide-react';
import { useAgendaStats } from '../../hooks/useAgendaStats';

export default function AgendaStats({ colors, appointments }) {
  const stats = useAgendaStats(appointments);
  
  return (
    <div 
      className="agenda-stats"
      style={{
        display: 'flex',
        gap: '16px',
        padding: '12px 20px',
        borderBottom: `1px solid ${colors.border}`,
        background: colors.cardBg,
        flexWrap: 'wrap',
      }}
    >
      <div className="agenda-stat" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: colors.text }}>
        <Calendar size={16} color={colors.primary} />
        <span>Total: <span style={{ fontWeight: 700, color: colors.primary }}>{stats.total}</span></span>
      </div>
      <div className="agenda-stat" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: colors.text }}>
        <Clock size={16} color="#f59e0b" />
        <span>Pendientes: <span style={{ fontWeight: 700, color: colors.primary }}>{stats.pending}</span></span>
      </div>
      <div className="agenda-stat" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: colors.text }}>
        <CheckCircle size={16} color="#10b981" />
        <span>Completadas: <span style={{ fontWeight: 700, color: colors.primary }}>{stats.done}</span></span>
      </div>
      <div className="agenda-stat" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: colors.text }}>
        <Car size={16} color="#8b5cf6" />
        <span>En Camino: <span style={{ fontWeight: 700, color: colors.primary }}>{stats.onTheWay}</span></span>
      </div>
      <div className="agenda-stat" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: colors.text }}>
        <MapPin size={16} color="#06b6d4" />
        <span>Llegados: <span style={{ fontWeight: 700, color: colors.primary }}>{stats.arrived}</span></span>
      </div>
    </div>
  );
}

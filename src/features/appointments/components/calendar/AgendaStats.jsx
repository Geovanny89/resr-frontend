/**
 * Barra de estadísticas para la agenda
 * Extraído de Agenda.jsx
 */
import { Calendar, Clock, CheckCircle, Car, MapPin, Zap } from 'lucide-react';
import { useAgendaStats } from '../../hooks/useAgendaStats';

export default function AgendaStats({ colors, appointments, hasFieldTechnicians }) {

  const stats = useAgendaStats(appointments);
  
  return (
    <div 
      className="agenda-stats"
      style={{
        display: 'flex',
        gap: '12px',
        padding: '16px 20px',
        background: `linear-gradient(to right, ${colors.bgSecondary}, ${colors.cardBg})`,
        borderBottom: `1px solid ${colors.border}`,
        flexWrap: 'wrap',
      }}
    >
      <StatChip icon={<Calendar size={14} />} label="Total" value={stats.total} color={colors.primary} bg={`${colors.primary}15`} />
      <StatChip icon={<Clock size={14} />} label="Pendientes" value={stats.pending} color="#f59e0b" bg="#f59e0b15" />
      <StatChip icon={<Zap size={14} />} label="En Atención" value={stats.attention} color="#ec4899" bg="#fce7f3" />
      <StatChip icon={<CheckCircle size={14} />} label="Finalizadas" value={stats.done} color="#10b981" bg="#10b98115" />
      
      {hasFieldTechnicians && (
        <>
          <StatChip icon={<Car size={14} />} label="En Camino" value={stats.onTheWay} color="#8b5cf6" bg="#8b5cf615" />
          <StatChip icon={<MapPin size={14} />} label="Llegados" value={stats.arrived} color="#06b6d4" bg="#06b6d415" />
        </>
      )}
    </div>

  );
}

function StatChip({ icon, label, value, color, bg }) {
  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: '8px', 
      padding: '6px 12px', 
      borderRadius: '20px', 
      background: bg,
      border: `1px solid ${color}30`,
      fontSize: '12px',
      fontWeight: 600,
      color: color,
      transition: 'all 0.2s ease',
      cursor: 'default'
    }}>
      <span style={{ display: 'flex', alignItems: 'center' }}>{icon}</span>
      <span style={{ opacity: 0.8 }}>{label}:</span>
      <span style={{ fontSize: '14px', fontWeight: 800 }}>{value}</span>
    </div>

  );
}

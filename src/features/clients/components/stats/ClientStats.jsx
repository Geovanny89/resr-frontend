import { Users, TrendingUp, DollarSign } from 'lucide-react';
import { fmt } from '../../utils/formatters';

export function ClientStats({ stats, colors }) {
  const items = [
    {
      icon: Users,
      label: 'Total clientes',
      value: stats.total,
      color: colors?.primary || '#667eea'
    },
    {
      icon: TrendingUp,
      label: 'Clientes frecuentes',
      value: stats.withMultipleVisits,
      color: '#10b981'
    },
    {
      icon: DollarSign,
      label: 'Ingresos totales',
      value: fmt(stats.totalRevenue),
      color: '#f59e0b'
    }
  ];

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: 16,
      marginBottom: 24
    }}>
      {items.map((stat, i) => (
        <div key={i} className="card" style={{
          padding: 20,
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          borderLeft: `4px solid ${stat.color}`
        }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: 12,
            background: `${stat.color}20`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <stat.icon size={24} color={stat.color} />
          </div>
          <div>
            <div style={{ fontSize: 24, fontWeight: 700, color: stat.color }}>{stat.value}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{stat.label}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

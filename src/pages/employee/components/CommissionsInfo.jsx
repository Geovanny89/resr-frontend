import { TrendingUp } from 'lucide-react';

export const CommissionsInfo = ({ data, colors }) => {
  if (data?.isTechnicalServices || data?.hasFieldTechnicians) return null;

  return (
    <div style={{
      marginTop: 24,
      padding: 16,
      background: colors.isDark ? 'rgba(59, 130, 246, 0.15)' : '#eff6ff',
      borderRadius: 8,
      border: `1px solid ${colors.isDark ? 'rgba(59, 130, 246, 0.3)' : '#bfdbfe'}`
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <TrendingUp size={20} color={colors.isDark ? '#60a5fa' : '#3b82f6'} style={{ flexShrink: 0, marginTop: 2 }} />
        <div>
          <p style={{ margin: '0 0 4px 0', fontSize: 14, fontWeight: 600, color: colors.isDark ? '#93c5fd' : '#1e40af' }}>
            ¿Cómo se calculan tus comisiones?
          </p>
          <p style={{ margin: 0, fontSize: 13, color: colors.isDark ? '#bfdbfe' : '#3b82f6', lineHeight: '1.5' }}>
            Tu comisión se calcula sobre el valor total de cada servicio (incluyendo cargos adicionales). 
            El porcentaje actual es del <strong style={{ color: colors.isDark ? '#60a5fa' : '#1e40af' }}>{data?.employee?.commissionPct || 0}%</strong> por servicio. 
            Algunos servicios pueden estar configurados sin comisión para el empleado.
          </p>
        </div>
      </div>
    </div>
  );
};

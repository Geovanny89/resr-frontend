import { Briefcase, CreditCard, DollarSign } from 'lucide-react';
import { fmt } from '../utils';

export const CommissionsSummaryCards = ({ data, colors }) => {
  // Vista para técnicos de campo
  if (data?.hasFieldTechnicians) {
    return (
      <>
        {/* Total Citas */}
        <div style={{
          background: colors.cardBg,
          padding: 16,
          borderRadius: 12,
          boxShadow: `0 2px 8px ${colors.shadow}`,
          border: `1px solid ${colors.border}`,
          textAlign: 'center'
        }}>
          <div style={{ fontSize: 24, fontWeight: 800, color: colors.primary }}>
            {data?.statusStats?.total || 0}
          </div>
          <div style={{ fontSize: 12, color: colors.textSecondary, marginTop: 4 }}>
            Total Citas
          </div>
        </div>

        {/* Pendientes */}
        <div style={{
          background: colors.cardBg,
          padding: 16,
          borderRadius: 12,
          boxShadow: `0 2px 8px ${colors.shadow}`,
          border: `1px solid ${colors.border}`,
          textAlign: 'center'
        }}>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#f59e0b' }}>
            {data?.statusStats?.pending || 0}
          </div>
          <div style={{ fontSize: 12, color: colors.textSecondary, marginTop: 4 }}>
            ⏳ Pendientes
          </div>
        </div>

        {/* Confirmadas */}
        <div style={{
          background: colors.cardBg,
          padding: 16,
          borderRadius: 12,
          boxShadow: `0 2px 8px ${colors.shadow}`,
          border: `1px solid ${colors.border}`,
          textAlign: 'center'
        }}>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#3b82f6' }}>
            {data?.statusStats?.confirmed || 0}
          </div>
          <div style={{ fontSize: 12, color: colors.textSecondary, marginTop: 4 }}>
            ✅ Confirmadas
          </div>
        </div>

        {/* En Atención */}
        <div style={{
          background: colors.cardBg,
          padding: 16,
          borderRadius: 12,
          boxShadow: `0 2px 8px ${colors.shadow}`,
          border: `1px solid ${colors.border}`,
          textAlign: 'center'
        }}>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#8b5cf6' }}>
            {data?.statusStats?.attention || 0}
          </div>
          <div style={{ fontSize: 12, color: colors.textSecondary, marginTop: 4 }}>
            🔧 En Atención
          </div>
        </div>

        {/* Completadas */}
        <div style={{
          background: colors.cardBg,
          padding: 16,
          borderRadius: 12,
          boxShadow: `0 2px 8px ${colors.shadow}`,
          border: `1px solid ${colors.border}`,
          textAlign: 'center'
        }}>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#10b981' }}>
            {data?.statusStats?.done || 0}
          </div>
          <div style={{ fontSize: 12, color: colors.textSecondary, marginTop: 4 }}>
            ✓ Completadas
          </div>
        </div>

        {/* Canceladas */}
        <div style={{
          background: colors.cardBg,
          padding: 16,
          borderRadius: 12,
          boxShadow: `0 2px 8px ${colors.shadow}`,
          border: `1px solid ${colors.border}`,
          textAlign: 'center'
        }}>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#ef4444' }}>
            {data?.statusStats?.cancelled || 0}
          </div>
          <div style={{ fontSize: 12, color: colors.textSecondary, marginTop: 4 }}>
            ✗ Canceladas
          </div>
        </div>
      </>
    );
  }

  // Vista normal / servicios técnicos
  return (
    <>
      {/* Total de Servicios - Siempre visible */}
      <div style={{
        background: colors.cardBg,
        padding: 20,
        borderRadius: 12,
        boxShadow: `0 2px 8px ${colors.shadow}`,
        border: `1px solid ${colors.border}`
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <div style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            background: `${colors.primary}15`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Briefcase size={20} color={colors.primary} />
          </div>
          <span style={{ fontSize: 13, color: colors.textSecondary, fontWeight: 500 }}>
            {data?.isTechnicalServices ? 'Servicios Realizados' : 'Citas Completadas'}
          </span>
        </div>
        <div style={{ fontSize: 28, fontWeight: 800, color: colors.text }}>
          {data?.totals?.count || 0}
        </div>
      </div>

      {/* Valor Total Servicios - Oculto para técnicos */}
      {!data?.isTechnicalServices && (
        <div style={{
          background: colors.cardBg,
          padding: 20,
          borderRadius: 12,
          boxShadow: `0 2px 8px ${colors.shadow}`,
          border: `1px solid ${colors.border}`
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <div style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: '#3b82f615',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <CreditCard size={20} color="#3b82f6" />
            </div>
            <span style={{ fontSize: 13, color: colors.textSecondary, fontWeight: 500 }}>
              Total Servicios
            </span>
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#3b82f6' }}>
            {fmt(data?.totals?.totalServices)}
          </div>
        </div>
      )}

      {/* Mi Comisión - Oculto para técnicos */}
      {!data?.isTechnicalServices && (
        <div style={{
          background: colors.cardBg,
          padding: 20,
          borderRadius: 12,
          boxShadow: `0 2px 8px ${colors.shadow}`,
          border: `1px solid ${colors.border}`,
          borderLeft: `4px solid #10b981`
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <div style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: '#10b98115',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <DollarSign size={20} color="#10b981" />
            </div>
            <div>
              <span style={{ fontSize: 13, color: colors.textSecondary, fontWeight: 500, display: 'block' }}>
                Tu Comisión
              </span>
              <span style={{ fontSize: 12, color: '#10b981', fontWeight: 600 }}>
                {data?.employee?.commissionPct || 0}% de cada servicio
              </span>
            </div>
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#10b981' }}>
            {fmt(data?.totals?.totalCommission)}
          </div>
        </div>
      )}
    </>
  );
};

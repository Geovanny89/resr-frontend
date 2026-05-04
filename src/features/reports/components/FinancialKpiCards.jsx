import { DollarSign, TrendingUp } from 'lucide-react';
import { fmt } from '../../../shared/utils/formatters';

export function FinancialKpiCards({
  displayIncome,
  displayInventory,
  displayNetProfit,
  displayMargin,
  displayCommissions,
  financialReport,
  enabledModules,
}) {
  return (
    <div
      className="grid-stats mb-4"
      style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}
    >
      {/* Ingresos */}
      <div className="stat-card" style={{ borderLeft: '3px solid #3b82f6', padding: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 6,
              background: '#dbeafe',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <DollarSign size={14} color="#3b82f6" />
          </div>
          <div>
            <div style={{ fontSize: 12, color: '#6b7280', fontWeight: 500 }}>Ingresos</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#3b82f6' }}>{fmt(displayIncome)}</div>
          </div>
        </div>
      </div>

      {/* Costo de Insumos */}
      {enabledModules.inventory && (
        <div className="stat-card" style={{ borderLeft: '3px solid #8b5cf6', padding: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 6,
                background: '#f3e8ff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 14,
              }}
            >
              📦
            </div>
            <div>
              <div style={{ fontSize: 12, color: '#6b7280', fontWeight: 500 }}>Insumos</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#8b5cf6' }}>
                {fmt(displayInventory)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Gastos Operativos */}
      {enabledModules.expenses && (
        <div className="stat-card" style={{ borderLeft: '3px solid #ef4444', padding: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 6,
                background: '#fee2e2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 14,
              }}
            >
              📉
            </div>
            <div>
              <div style={{ fontSize: 12, color: '#6b7280', fontWeight: 500 }}>Gastos</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#ef4444' }}>
                {fmt(financialReport?.details?.expenses?.total || 0)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Comisiones */}
      {displayCommissions > 0 && (
        <div className="stat-card" style={{ borderLeft: '3px solid #f59e0b', padding: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 6,
                background: '#fef3c7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 14,
              }}
            >
              👥
            </div>
            <div>
              <div style={{ fontSize: 12, color: '#6b7280', fontWeight: 500 }}>Comisiones</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#f59e0b' }}>
                {fmt(displayCommissions)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Descuentos */}
      {financialReport?.summary?.totalDiscounts > 0 && (
        <div className="stat-card" style={{ borderLeft: '3px solid #ec4899', padding: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 6,
                background: '#fce7f3',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 14,
              }}
            >
              🏷️
            </div>
            <div>
              <div style={{ fontSize: 12, color: '#6b7280', fontWeight: 500 }}>Descuentos</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#ec4899' }}>
                {fmt(financialReport.summary.totalDiscounts)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Utilidad Neta */}
      <div className="stat-card" style={{ borderLeft: '3px solid #10b981', padding: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 6,
              background: '#d1fae5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <TrendingUp size={14} color="#10b981" />
          </div>
          <div>
            <div style={{ fontSize: 12, color: '#6b7280', fontWeight: 500 }}>Utilidad Neta</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#10b981' }}>{fmt(displayNetProfit)}</div>
            <div style={{ fontSize: 10, color: '#9ca3af' }}>{(displayMargin || 0).toFixed(1)}% margen</div>
          </div>
        </div>
      </div>

      {/* Depósitos Retenidos */}
      {enabledModules.deposits && financialReport?.details?.deposits?.totalHeld > 0 && (
        <div className="stat-card" style={{ borderLeft: '3px solid #f59e0b', padding: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 6,
                background: '#fef3c7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 14,
              }}
            >
              🏦
            </div>
            <div>
              <div style={{ fontSize: 12, color: '#6b7280', fontWeight: 500 }}>Depósitos</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#f59e0b' }}>
                {fmt(financialReport.details.deposits.totalHeld)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ALERTAS: Ingresos no registrados en caja */}
      {financialReport?.summary?.unrecordedIncome > 0 && (
        <div className="stat-card" style={{ borderLeft: '3px solid #f43f5e', padding: '12px', background: '#fff1f2' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 6,
                background: '#ffe4e6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 14,
              }}
            >
              ⚠️
            </div>
            <div>
              <div style={{ fontSize: 12, color: '#e11d48', fontWeight: 700 }}>Descuadre</div>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#e11d48' }}>
                {fmt(financialReport.summary.unrecordedIncome)}
              </div>
              <div style={{ fontSize: 9, color: '#f43f5e', fontWeight: 500 }}>Citas sin caja</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

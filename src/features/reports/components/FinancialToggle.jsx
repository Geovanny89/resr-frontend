import { TrendingUp } from 'lucide-react';

export function FinancialToggle({ showFullFinancial, setShowFullFinancial, enabledModules }) {
  return (
    <div className="card mb-4" style={{ padding: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: showFullFinancial ? '#ecfdf5' : '#f3f4f6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <TrendingUp size={16} color={showFullFinancial ? '#10b981' : '#6b7280'} />
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text)' }}>
              {showFullFinancial ? '📊 Financiero Completo' : '📋 Solo Citas'}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              {showFullFinancial
                ? 'Incluye ingresos, gastos, insumos y depósitos'
                : 'Estadísticas de citas sin costos'}
            </div>
          </div>
        </div>

        <label
          style={{
            position: 'relative',
            display: 'inline-block',
            width: 44,
            height: 24,
            cursor: 'pointer',
          }}
        >
          <input
            type="checkbox"
            checked={showFullFinancial}
            onChange={(e) => setShowFullFinancial(e.target.checked)}
            style={{ opacity: 0, width: 0, height: 0 }}
          />
          <span
            style={{
              position: 'absolute',
              cursor: 'pointer',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: showFullFinancial ? '#10b981' : '#d1d5db',
              borderRadius: 24,
              transition: '0.3s',
            }}
          />
          <span
            style={{
              position: 'absolute',
              height: 18,
              width: 18,
              left: 3,
              bottom: 3,
              backgroundColor: 'white',
              borderRadius: '50%',
              transition: '0.3s',
              transform: showFullFinancial ? 'translateX(20px)' : 'translateX(0)',
            }}
          />
        </label>
      </div>

      {/* Module status */}
      {showFullFinancial && (
        <div style={{ marginTop: 10, padding: 8, background: '#f8fafc', borderRadius: 6 }}>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', fontSize: 11 }}>
            <span style={{ color: enabledModules.expenses ? '#10b981' : '#9ca3af' }}>
              {enabledModules.expenses ? '✓' : '✗'} Gastos
            </span>
            <span style={{ color: enabledModules.inventory ? '#10b981' : '#9ca3af' }}>
              {enabledModules.inventory ? '✓' : '✗'} Insumos
            </span>
            <span style={{ color: enabledModules.deposits ? '#10b981' : '#9ca3af' }}>
              {enabledModules.deposits ? '✓' : '✗'} Depósitos
            </span>
          </div>
          {!enabledModules.expenses && !enabledModules.inventory && !enabledModules.deposits && (
            <div style={{ marginTop: 4, fontSize: 10, color: '#f59e0b' }}>
              ⚠️ Activa módulos en "Mi Negocio → Módulos"
            </div>
          )}
        </div>
      )}
    </div>
  );
}

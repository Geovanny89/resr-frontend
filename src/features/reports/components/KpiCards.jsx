import { Calendar, CheckCircle, Clock, XCircle, DollarSign, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { fmt } from '../../../shared/utils/formatters';

export function KpiCards({ stats, business, comparison }) {
  const isTechnical = business?.isTechnicalServices || business?.hasFieldTechnicians;

  const renderVariation = (variation) => {
    if (variation === null || variation === undefined) return null;
    if (variation > 0) {
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#10b981', fontWeight: 600 }}>
          <TrendingUp size={12} />
          {variation.toFixed(1)}%
        </div>
      );
    } else if (variation < 0) {
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#ef4444', fontWeight: 600 }}>
          <TrendingDown size={12} />
          {Math.abs(variation).toFixed(1)}%
        </div>
      );
    } else {
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#6b7280', fontWeight: 600 }}>
          <Minus size={12} />
          0%
        </div>
      );
    }
  };

  return (
    <div className="grid-stats mb-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
      {/* Total citas */}
      <div className="stat-card" style={{ padding: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: '#ede9fe',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Calendar size={16} color="#8b5cf6" />
          </div>
          <div>
            <div style={{ fontSize: 12, color: '#6b7280', fontWeight: 500 }}>Total citas</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#1f2937' }}>{stats.totalAppointments}</div>
            {comparison?.total && renderVariation(comparison.total.variation)}
          </div>
        </div>
      </div>

      {/* Citas completadas */}
      <div className="stat-card" style={{ padding: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: '#d1fae5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <CheckCircle size={16} color="#10b981" />
          </div>
          <div>
            <div style={{ fontSize: 12, color: '#6b7280', fontWeight: 500 }}>Completadas</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#1f2937' }}>{stats.done.length}</div>
            {comparison?.completed && renderVariation(comparison.completed.variation)}
          </div>
        </div>
      </div>

      {!isTechnical ? (
        <>
          {/* Ingresos totales */}
          <div className="stat-card" style={{ padding: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: '#dbeafe',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <DollarSign size={16} color="#3b82f6" />
              </div>
              <div>
                <div style={{ fontSize: 12, color: '#6b7280', fontWeight: 500 }}>Ingresos</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#3b82f6' }}>{fmt(stats.totalRev)}</div>
                {comparison?.revenue && renderVariation(comparison.revenue.variation)}
              </div>
            </div>
          </div>

          {/* Ganancia del negocio */}
          <div className="stat-card" style={{ padding: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: '#ccfbf1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <TrendingUp size={16} color="#14b8a6" />
              </div>
              <div>
                <div style={{ fontSize: 12, color: '#6b7280', fontWeight: 500 }}>Ganancia</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#14b8a6' }}>{fmt(stats.ownerRev)}</div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Citas pendientes */}
          <div className="stat-card" style={{ padding: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: '#fef3c7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Clock size={16} color="#f59e0b" />
              </div>
              <div>
                <div style={{ fontSize: 12, color: '#6b7280', fontWeight: 500 }}>Pendientes</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#1f2937' }}>{stats.pendingCount}</div>
              </div>
            </div>
          </div>

          {/* Citas canceladas */}
          <div className="stat-card" style={{ padding: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: '#fee2e2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <XCircle size={16} color="#ef4444" />
              </div>
              <div>
                <div style={{ fontSize: 12, color: '#6b7280', fontWeight: 500 }}>Canceladas</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#1f2937' }}>{stats.cancelledCount}</div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

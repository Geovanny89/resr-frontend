/**
 * Payments Feature - IncomeDistributionBar Component
 */
import { fmt } from '../utils';

export function IncomeDistributionBar({ report }) {
  if (!report?.totals?.total) return null;

  const { total, ownerTotal, employeeTotal } = report.totals;
  const ownerPercent = ((ownerTotal / total) * 100).toFixed(1);
  const employeePercent = ((employeeTotal / total) * 100).toFixed(1);

  return (
    <div className="card mb-6">
      <div className="card-header">
        <div className="card-title">Distribución de ingresos</div>
      </div>
      <div style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13 }}>
          <span style={{ color: 'var(--success)', fontWeight: 600 }}>
            Negocio: {ownerPercent}%
          </span>
          <span style={{ color: 'var(--info)', fontWeight: 600 }}>
            Empleados: {employeePercent}%
          </span>
        </div>
        <div style={{ height: 12, background: 'var(--gray-200)', borderRadius: 999, overflow: 'hidden', display: 'flex' }}>
          <div style={{
            width: `${ownerPercent}%`,
            background: 'var(--success)', transition: 'width .6s ease'
          }} />
          <div style={{
            width: `${employeePercent}%`,
            background: 'var(--info)', transition: 'width .6s ease'
          }} />
        </div>
      </div>
    </div>
  );
}

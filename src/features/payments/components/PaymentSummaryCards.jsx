/**
 * Payments Feature - PaymentSummaryCards Component
 */
import { DollarSign, TrendingUp, Users, CheckCircle } from 'lucide-react';
import { fmt } from '../utils';

export function PaymentSummaryCards({ report, employeeCount }) {
  return (
    <div className="grid-3 mb-6">
      <div className="stat-card">
        <div className="stat-icon teal"><DollarSign size={22} /></div>
        <div className="stat-body">
          <div className="stat-value" style={{ fontSize: 22 }}>{fmt(report.totals?.total)}</div>
          <div className="stat-label">Ingresos totales del mes</div>
          <div className="stat-change up">
            <CheckCircle size={11} /> {report.appointments?.length || 0} citas completadas
          </div>
        </div>
      </div>
      <div className="stat-card">
        <div className="stat-icon green"><TrendingUp size={22} /></div>
        <div className="stat-body">
          <div className="stat-value" style={{ fontSize: 22 }}>{fmt(report.totals?.ownerTotal)}</div>
          <div className="stat-label">Saldo del negocio (dueño)</div>
          <div className="stat-change up">
            <TrendingUp size={11} /> Ganancia neta del período
          </div>
        </div>
      </div>
      <div className="stat-card">
        <div className="stat-icon blue"><Users size={22} /></div>
        <div className="stat-body">
          <div className="stat-value" style={{ fontSize: 22 }}>{fmt(report.totals?.employeeTotal)}</div>
          <div className="stat-label">Total a pagar empleados</div>
          <div className="stat-change" style={{ color: 'var(--warning)' }}>
            <Users size={11} /> {employeeCount} empleado(s) activos
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Payments Feature - EmployeeCard Component
 */
import { Mail, ChevronDown } from 'lucide-react';
import { fmt } from '../utils';

export function EmployeeCard({ 
  emp, 
  isExpanded, 
  onToggle, 
  onSendEmail, 
  sendingEmail, 
  emailResult 
}) {
  const getButtonText = () => {
    if (sendingEmail) return 'Enviando...';
    if (emailResult === 'sent') return '✅ Enviado';
    if (emailResult === 'simulated') return '⚠️ Simulado';
    if (emailResult === 'partial') return '✉️ Enviado (sin PDF)';
    if (emailResult?.startsWith('error')) return '❌ Error';
    return 'Email';
  };

  const getButtonTitle = () => {
    if (emailResult === 'partial') {
      return 'Email enviado sin PDF adjunto (restricción del servidor)';
    }
    return 'Enviar resumen por email';
  };

  return (
    <div className="card">
      {/* Header del empleado */}
      <div
        className="payments-employee-header"
        style={{ display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer' }}
        onClick={onToggle}
      >
        <div className="avatar" style={{ width: 44, height: 44, fontSize: 16 }}>
          {emp.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 15 }}>{emp.name}</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            {emp.appointments.length} cita(s) · {fmt(emp.total)} facturado
          </div>
        </div>

        {/* Montos */}
        <div className="payments-employee-amount" style={{ textAlign: 'right', marginRight: 8 }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--info)' }}>{fmt(emp.employeeEarns)}</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>A pagar al empleado</div>
        </div>

        {/* Acciones */}
        <div className="payments-employee-actions" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button
            className="btn-outline btn-sm"
            onClick={(e) => { e.stopPropagation(); onSendEmail(); }}
            disabled={sendingEmail}
            title={getButtonTitle()}
          >
            <Mail size={14} />
            {getButtonText()}
          </button>
          <ChevronDown
            size={18}
            style={{
              color: 'var(--text-muted)',
              transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)',
              transition: 'transform .2s'
            }}
          />
        </div>
      </div>
    </div>
  );
}

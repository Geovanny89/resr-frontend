import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import AdminLayout from '../../components/AdminLayout';
import { DollarSign, TrendingUp, Users, CheckCircle, Download, RefreshCw } from 'lucide-react';
import { 
  usePayments, 
  usePaymentPDF,
  MonthYearPicker,
  EmployeeDetail,
  EmployeeCard,
  TechnicalServicesBlock,
  getMonthLabel,
  fmt
} from '../../features/payments';

export default function Payments() {
  const { business } = useAuth();
  const { colors } = useTheme();
  
  // Custom hooks
  const {
    month,
    setMonth,
    report,
    loading,
    error,
    sendingEmail,
    emailResult,
    employees,
    loadReport,
    sendPaymentEmail,
  } = usePayments(business?.id);

  const { generateEmployeePDF, downloadFullPDF } = usePaymentPDF(business);

  // Local UI state
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [expandedEmp, setExpandedEmp] = useState(null);
  const [paginationPages, setPaginationPages] = useState({});
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 640);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 640);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Bloquear vista si es empresa de servicios técnicos o técnicos de campo
  if (business?.isTechnicalServices || business?.hasFieldTechnicians) {
    return <TechnicalServicesBlock business={business} />;
  }

  const monthLabel = getMonthLabel(month);

  const handleSendEmail = (empName) => {
    sendPaymentEmail(empName, generateEmployeePDF);
  };

  const handleDownloadPDF = () => {
    downloadFullPDF(employees, report, month);
  };

  return (
    <AdminLayout title="Pagos a Profesionales" subtitle="Comisiones y saldo del negocio">
      <style>{`
        @media (max-width: 640px) {
          .payments-controls-row {
            align-items: stretch !important;
          }
          .payments-controls-row > * {
            width: 100%;
          }
          .payments-controls-row button {
            width: 100%;
            justify-content: center;
          }
          .payments-employee-header {
            flex-wrap: wrap;
            align-items: flex-start !important;
          }
          .payments-employee-amount {
            width: 100%;
            text-align: left !important;
            margin-right: 0 !important;
          }
          .payments-employee-actions {
            width: 100%;
            justify-content: flex-start;
            flex-wrap: wrap;
          }
        }
      `}</style>
      {/* CONTROLES */}
      <div className="card mb-6">
        <div className="payments-controls-row" style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-700)' }}>Período:</label>
            <button
              onClick={() => setShowMonthPicker(!showMonthPicker)}
              style={{
                background: '#667eea', color: 'white', border: 'none', borderRadius: 6,
                padding: '8px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 6
              }}>
              📅 {monthLabel}
            </button>
          </div>

          <button className="btn-primary" onClick={loadReport} disabled={loading}>
            <RefreshCw size={15} className={loading ? 'spin' : ''} />
            {loading ? 'Cargando...' : 'Actualizar'}
          </button>
          {report && (
            <button className="btn-outline" onClick={handleDownloadPDF}>
              <Download size={15} /> Descargar PDF
            </button>
          )}
        </div>
      </div>

      {showMonthPicker && (
        <div style={{ marginBottom: 20, padding: 16, background: 'white', borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', display: 'flex', justifyContent: 'center' }}>
          <MonthYearPicker
            value={month}
            onChange={setMonth}
            onClose={() => setShowMonthPicker(false)}
          />
        </div>
      )}

      {error && <div className="alert alert-error"><span>⚠️</span> {error}</div>}

      {loading ? (
        <div className="loading-page"><div className="spinner" /><span>Calculando comisiones...</span></div>
      ) : report ? (
        <>
          {/* RESUMEN FINANCIERO */}
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
                <div className="stat-label">Total a pagar profesionales</div>
                <div className="stat-change" style={{ color: 'var(--warning)' }}>
                  <Users size={11} /> {employees.length} profesional(es) activos
                </div>
              </div>
            </div>
          </div>

          {/* BARRA DE DISTRIBUCIÓN */}
          {report.totals?.total > 0 && (
            <div className="card mb-6">
              <div className="card-header">
                <div className="card-title">Distribución de ingresos</div>
              </div>
              <div style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13 }}>
                  <span style={{ color: 'var(--success)', fontWeight: 600 }}>
                    Negocio: {((report.totals.ownerTotal / report.totals.total) * 100).toFixed(1)}%
                  </span>
                  <span style={{ color: 'var(--info)', fontWeight: 600 }}>
                    Profesionales: {((report.totals.employeeTotal / report.totals.total) * 100).toFixed(1)}%
                  </span>
                </div>
                <div style={{ height: 12, background: 'var(--gray-200)', borderRadius: 999, overflow: 'hidden', display: 'flex' }}>
                  <div style={{
                    width: `${(report.totals.ownerTotal / report.totals.total) * 100}%`,
                    background: 'var(--success)', transition: 'width .6s ease'
                  }} />
                  <div style={{
                    width: `${(report.totals.employeeTotal / report.totals.total) * 100}%`,
                    background: 'var(--info)', transition: 'width .6s ease'
                  }} />
                </div>
              </div>
            </div>
          )}

          {/* POR EMPLEADO */}
          {employees.length === 0 ? (
            <div className="card">
              <div className="empty-state">
                <div className="empty-state-icon">💼</div>
                <h3>Sin datos para este período</h3>
                <p>No hay citas completadas en {monthLabel}.</p>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {employees.map(emp => (
                <div key={emp.name} className="card">
                  <EmployeeCard
                    emp={emp}
                    isExpanded={expandedEmp === emp.name}
                    onToggle={() => setExpandedEmp(expandedEmp === emp.name ? null : emp.name)}
                    onSendEmail={() => handleSendEmail(emp.name)}
                    sendingEmail={sendingEmail[emp.name]}
                    emailResult={emailResult[emp.name]}
                  />

                  {/* Detalle expandible con paginación */}
                  {expandedEmp === emp.name && (
                    <EmployeeDetail 
                      emp={emp} 
                      paginationPages={paginationPages}
                      setPaginationPages={setPaginationPages}
                      isMobile={isMobile}
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">📊</div>
            <h3>Sin datos</h3>
            <p>Selecciona un período para ver los reportes.</p>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

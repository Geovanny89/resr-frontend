import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/client';
import AdminLayout from '../../components/AdminLayout';
import {
  DollarSign, TrendingUp, Users, Calendar, CheckCircle,
  Download, Mail, RefreshCw, ChevronDown, ChevronLeft, ChevronRight
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const fmt = (n) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n || 0);

const fmtDate = (d) =>
  new Date(d).toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' });

const MONTHS_ES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

// ─── Utilidades de fecha segura (sin desfase de zona horaria) ────────────────

function getMonthLabel(monthStr) {
  // monthStr es formato "YYYY-MM"
  if (!monthStr) return '';
  const [year, month] = monthStr.split('-').map(Number);
  const monthIndex = month - 1; // 0-11
  return `${MONTHS_ES[monthIndex]} ${year}`;
}

// ─── Selector de Mes/Año ────────────────────────────────────────────────────

function MonthYearPicker({ value, onChange, onClose }) {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1; // 1-12

  // Extraer correctamente año y mes del string YYYY-MM
  const [viewYear, setViewYear] = useState(value ? parseInt(value.split('-')[0]) : currentYear);
  const [viewMonth, setViewMonth] = useState(value ? parseInt(value.split('-')[1]) : currentMonth);

  const prevYear = () => setViewYear(v => v - 1);
  const nextYear = () => setViewYear(v => v + 1);

  const handleMonth = (monthNumber) => {
    const monthStr = String(monthNumber).padStart(2, '0');
    const result = `${viewYear}-${monthStr}`;
    onChange(result);
    onClose();
  };

  const isSelected = (monthNumber) => {
    if (!value) return false;
    const [y, m] = value.split('-').map(Number);
    return y === viewYear && m === monthNumber;
  };

  return (
    <div style={{
      background: 'white', borderRadius: 14, padding: 24, userSelect: 'none',
      maxWidth: 360, width: '100%', boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
    }}>
      {/* Selector de año */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <button type="button" onClick={prevYear}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#667eea', padding: 4 }}>
          <ChevronLeft size={18} />
        </button>
        <span style={{ fontWeight: 700, fontSize: 18, color: '#2d3748', minWidth: 80, textAlign: 'center' }}>
          {viewYear}
        </span>
        <button type="button" onClick={nextYear}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#667eea', padding: 4 }}>
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Grid de meses */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
        {MONTHS_ES.map((monthName, i) => {
          const monthNumber = i + 1; // 1-12
          const sel = isSelected(monthNumber);
          return (
            <button
              key={i}
              type="button"
              onClick={() => handleMonth(monthNumber)}
              style={{
                padding: '12px 8px', borderRadius: 8, fontSize: 13, fontWeight: sel ? 700 : 600,
                border: `2px solid ${sel ? '#667eea' : 'var(--border-color, #e2e8f0)'}`,
                background: sel ? '#667eea' : 'var(--bg-secondary, #f7fafc)',
                color: sel ? 'white' : '#2d3748',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}>
              {monthName.slice(0, 3)}
            </button>
          );
        })}
      </div>

      {value && (
        <div style={{ marginTop: 16, padding: 12, background: '#eef2ff', borderRadius: 8, textAlign: 'center', fontSize: 13, color: '#667eea', fontWeight: 600 }}>
          ✓ {getMonthLabel(value)}
        </div>
      )}
    </div>
  );
}

export default function Payments() {
  const { business } = useAuth();
  
  // Inicializar con el mes actual en formato YYYY-MM (sin desfase de zona horaria)
  const [month, setMonth] = useState(() => {
    const today = new Date();
    const year = today.getFullYear();
    const monthNum = today.getMonth() + 1;
    return `${year}-${String(monthNum).padStart(2, '0')}`;
  });

  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [report, setReport]     = useState(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [sendingEmail, setSendingEmail] = useState({});
  const [emailResult, setEmailResult]   = useState({});

  const loadReport = async () => {
    if (!business?.id) return;
    setLoading(true);
    setError('');
    try {
      // Enviar el mes en formato YYYY-MM
      const res = await api.get(`/employees/commission-report?businessId=${business.id}&month=${month}`);
      setReport(res.data);
    } catch (e) {
      setError(e.response?.data?.error || 'Error al cargar el reporte');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadReport(); }, [business, month]);

  // Agrupar por empleado
  const byEmployee = report?.appointments?.reduce((acc, appt) => {
    const name = appt.employee;
    if (!acc[name]) acc[name] = { name, appointments: [], total: 0, employeeEarns: 0, ownerEarns: 0 };
    acc[name].appointments.push(appt);
    acc[name].total        += appt.price;
    acc[name].employeeEarns += parseFloat(appt.employeeEarns);
    acc[name].ownerEarns   += parseFloat(appt.ownerEarns);
    return acc;
  }, {}) || {};

  const employees = Object.values(byEmployee);

  const sendPaymentEmail = async (employeeName) => {
    setSendingEmail(p => ({ ...p, [employeeName]: true }));
    try {
      const empData = byEmployee[employeeName];
      await api.post('/notifications/payment-summary', {
        businessId: business.id,
        employeeName,
        month,
        totalEarned: empData.employeeEarns,
        appointmentsCount: empData.appointments.length,
      });
      setEmailResult(p => ({ ...p, [employeeName]: 'sent' }));
      setTimeout(() => setEmailResult(p => ({ ...p, [employeeName]: null })), 4000);
    } catch (e) {
      setEmailResult(p => ({ ...p, [employeeName]: 'error' }));
      setTimeout(() => setEmailResult(p => ({ ...p, [employeeName]: null })), 4000);
    } finally {
      setSendingEmail(p => ({ ...p, [employeeName]: false }));
    }
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    const monthLabel = getMonthLabel(month);

    // Header
    doc.setFillColor(79, 70, 229);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('KDice POS — Reporte de Pagos', 14, 18);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`${business?.name || ''} · ${monthLabel}`, 14, 30);

    // Resumen
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text('Resumen Financiero', 14, 55);

    const totals = report?.totals || {};
    autoTable(doc, {
      startY: 60,
      head: [['Concepto', 'Monto']],
      body: [
        ['Ingresos totales del negocio', fmt(totals.total)],
        ['Ganancia del dueño', fmt(totals.ownerTotal)],
        ['Total a pagar empleados', fmt(totals.employeeTotal)],
      ],
      styles: { fontSize: 11 },
      headStyles: { fillColor: [79, 70, 229] },
    });

    // Por empleado
    let y = doc.lastAutoTable.finalY + 14;
    employees.forEach(emp => {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(`Empleado: ${emp.name}`, 14, y);
      y += 4;

      autoTable(doc, {
        startY: y,
        head: [['Fecha', 'Servicio', 'Precio', 'Empleado gana', 'Negocio gana']],
        body: emp.appointments.map(a => [
          fmtDate(a.date),
          a.service,
          fmt(a.price),
          fmt(a.employeeEarns),
          fmt(a.ownerEarns),
        ]),
        foot: [[
          '', 'TOTAL', fmt(emp.total), fmt(emp.employeeEarns), fmt(emp.ownerEarns)
        ]],
        styles: { fontSize: 9 },
        headStyles: { fillColor: [100, 116, 139] },
        footStyles: { fillColor: [241, 245, 249], textColor: [0, 0, 0], fontStyle: 'bold' },
      });
      y = doc.lastAutoTable.finalY + 12;
    });

    doc.save(`pagos-${month}.pdf`);
  };

  const [expandedEmp, setExpandedEmp] = useState(null);

  // Usar la función segura para obtener el label del mes
  const monthLabel = getMonthLabel(month);

  return (
    <AdminLayout title="Pagos a Empleados" subtitle="Comisiones y saldo del negocio">
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
            <button className="btn-outline" onClick={downloadPDF}>
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
                <div className="stat-label">Total a pagar empleados</div>
                <div className="stat-change" style={{ color: 'var(--warning)' }}>
                  <Users size={11} /> {employees.length} empleado(s) activos
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
                    Empleados: {((report.totals.employeeTotal / report.totals.total) * 100).toFixed(1)}%
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
                  {/* Header del empleado */}
                  <div
                    className="payments-employee-header"
                    style={{ display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer' }}
                    onClick={() => setExpandedEmp(expandedEmp === emp.name ? null : emp.name)}
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
                        onClick={e => { e.stopPropagation(); sendPaymentEmail(emp.name); }}
                        disabled={sendingEmail[emp.name]}
                        title="Enviar resumen por email"
                      >
                        <Mail size={14} />
                        {sendingEmail[emp.name] ? 'Enviando...' :
                          emailResult[emp.name] === 'sent' ? '✅ Enviado' :
                          emailResult[emp.name] === 'error' ? '❌ Error' : 'Email'}
                      </button>
                      <ChevronDown
                        size={18}
                        style={{
                          color: 'var(--text-muted)',
                          transform: expandedEmp === emp.name ? 'rotate(180deg)' : 'rotate(0)',
                          transition: 'transform .2s'
                        }}
                      />
                    </div>
                  </div>

                  {/* Detalle expandible */}
                  {expandedEmp === emp.name && (
                    <div style={{ marginTop: 16, borderTop: '1px solid var(--border)', paddingTop: 16 }}>
                      <div className="table-wrapper">
                        <table className="table">
                          <thead>
                            <tr>
                              <th>Fecha</th>
                              <th>Servicio</th>
                              <th>Precio del servicio</th>
                              <th>Empleado gana</th>
                              <th>Negocio gana</th>
                            </tr>
                          </thead>
                          <tbody>
                            {emp.appointments.map((a, i) => (
                              <tr key={i}>
                                <td style={{ whiteSpace: 'nowrap', fontSize: 12 }}>{fmtDate(a.date)}</td>
                                <td>{a.service}</td>
                                <td><span className="money">{fmt(a.price)}</span></td>
                                <td><span className="money positive">{fmt(a.employeeEarns)}</span></td>
                                <td><span className="money positive">{fmt(a.ownerEarns)}</span></td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot>
                            <tr style={{ background: 'var(--gray-50)', fontWeight: 700 }}>
                              <td colSpan={2} style={{ padding: '12px 16px', fontWeight: 700 }}>TOTALES</td>
                              <td style={{ padding: '12px 16px' }}><span className="money">{fmt(emp.total)}</span></td>
                              <td style={{ padding: '12px 16px' }}><span className="money positive">{fmt(emp.employeeEarns)}</span></td>
                              <td style={{ padding: '12px 16px' }}><span className="money positive">{fmt(emp.ownerEarns)}</span></td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    </div>
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

import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import AdminLayout from '../../components/AdminLayout';
import { CheckCircle, XCircle } from 'lucide-react';
import {
  useReportsData,
  useFinancialReport,
  RangeCalendarPicker,
  ReportFilters,
  KpiCards,
  FinancialToggle,
  FinancialKpiCards,
  FinancialDetail,
  ReportTabs,
  OverviewTab,
  EmployeesTab,
  ServicesTab,
  TrackingTab,
  AppointmentsTable,
  generatePDF,
  generateExcel,
  generateTrackingExcel,
} from '../../features/reports';

export default function Reports() {
  const { business, mainBusiness, branches: authBranches } = useAuth();
  const [period, setPeriod] = useState('month');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [showRangeCalendar, setShowRangeCalendar] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth <= 480 : false
  );
  const [showFullFinancial, setShowFullFinancial] = useState(false);
  const [toast, setToast] = useState(null);
  const [businessWithLogo, setBusinessWithLogo] = useState(business);

  // Use custom hooks for data fetching
  const {
    appointments,
    loading,
    error,
    range,
    stats,
    byStatus,
    byEmployee,
    byService,
    detailPage,
    setDetailPage,
    totalPages,
    paginatedAppointments,
    refresh,
  } = useReportsData({
    business,
    mainBusiness,
    period,
    customStart,
    customEnd,
    selectedBranchId: 'active',
    showFullFinancial,
  });

  const {
    financialReport,
    enabledModules,
    financialData,
    displayIncome,
    displayInventory,
    displayNetProfit,
    displayMargin,
  } = useFinancialReport({
    business,
    range,
    showFullFinancial,
    period,
  });

  useEffect(() => {
    setBusinessWithLogo(business);
  }, [business]);

  useEffect(() => {
    const handleResize = () => {
      if (typeof window === 'undefined') return;
      setIsMobile(window.innerWidth <= 480);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleDownloadPDF = async () => {
    try {
      await generatePDF({
        appointments,
        business,
        businessWithLogo,
        range,
        showFullFinancial,
        financialReport,
        enabledModules,
        period,
      });
    } catch (err) {
      showToast('Error al generar PDF', 'error');
    }
  };

  const handleDownloadExcel = async () => {
    try {
      await generateExcel({
        appointments,
        business,
        showFullFinancial,
        financialReport,
        enabledModules,
        period,
      });
      showToast('Excel descargado correctamente', 'success');
    } catch (err) {
      showToast('Error al generar Excel', 'error');
    }
  };

  const handleDownloadTracking = async () => {
    try {
      await generateTrackingExcel({ appointments, period });
      showToast('Reporte de seguimiento descargado', 'success');
    } catch (err) {
      showToast('Error al generar reporte', 'error');
    }
  };

  const isTechnical = business?.isTechnicalServices || business?.hasFieldTechnicians;

  return (
    <AdminLayout title="Informes" subtitle="Análisis de actividad y finanzas">
      {/* Toast */}
      {toast && (
        <div
          style={{
            position: 'fixed',
            top: 20,
            right: 20,
            zIndex: 9999,
            padding: '12px 20px',
            borderRadius: 10,
            fontWeight: 600,
            fontSize: 14,
            background: toast.type === 'error' ? '#fee2e2' : '#d1fae5',
            color: toast.type === 'error' ? '#991b1b' : '#065f46',
            border: `1px solid ${toast.type === 'error' ? '#fecaca' : '#a7f3d0'}`,
            boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            animation: 'fadeInDown 0.3s ease-out',
          }}
        >
          {toast.type === 'error' ? <XCircle size={16} /> : <CheckCircle size={16} />}
          {toast.msg}
        </div>
      )}

      <style>{`
        .reports-page { width: 100%; max-width: 100vw; overflow-x: clip; }
        .reports-page .card, .reports-page .grid-stats { min-width: 0; width: 100%; max-width: 100%; }
        .reports-page .reports-chart { width: 100%; max-width: 100%; overflow: hidden; }
        @media (max-width: 768px) {
          .reports-filter-row { align-items: stretch !important; flex-direction: column; }
          .reports-actions-right { margin-left: 0 !important; width: 100%; justify-content: space-between; }
        }
        @media (max-width: 640px) {
          .reports-tabs-row { display: none !important; }
          .reports-tab-select { display: block !important; }
          .reports-chart { height: 220px !important; max-width: 100%; overflow: hidden; margin-left: auto; margin-right: auto; }
          .reports-period-buttons { overflow-x: auto; -webkit-overflow-scrolling: touch; padding-bottom: 6px; max-width: 100%; }
          .reports-period-buttons::-webkit-scrollbar { height: 6px; }
          .reports-period-buttons button { flex: 0 0 auto; }
          .reports-actions-right { width: 100%; justify-content: space-between; }
        }
        @media (min-width: 641px) {
          .reports-tab-select { display: none !important; }
          .reports-desktop-only { display: block !important; }
          .reports-mobile-only { display: none !important; }
        }
        @media (max-width: 640px) {
          .reports-desktop-only { display: none !important; }
          .reports-mobile-only { display: block !important; }
        }
        @keyframes fadeInDown { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      <div className="reports-page">
        {/* Filters */}
        <ReportFilters
          period={period}
          setPeriod={setPeriod}
          customStart={customStart}
          customEnd={customEnd}
          setShowRangeCalendar={setShowRangeCalendar}
          showRangeCalendar={showRangeCalendar}
          authBranches={authBranches}
          selectedBranchId="active"
          setSelectedBranchId={() => {}}
          business={business}
          mainBusiness={mainBusiness}
          loading={loading}
          onRefresh={() => refresh(true)}
          onDownloadPDF={handleDownloadPDF}
          onDownloadExcel={handleDownloadExcel}
          hasAppointments={appointments.length > 0}
        />

        {/* Calendar picker */}
        {showRangeCalendar && period === 'custom' && (
          <div
            style={{
              marginBottom: 20,
              padding: 16,
              background: 'var(--card-bg)',
              borderRadius: 12,
              boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <RangeCalendarPicker
              startValue={customStart}
              endValue={customEnd}
              onStartChange={setCustomStart}
              onEndChange={setCustomEnd}
              onClose={() => setShowRangeCalendar(false)}
            />
          </div>
        )}

        {error && (
          <div className="alert alert-error">
            <span>⚠️</span> {error}
          </div>
        )}

        {loading ? (
          <div className="loading-page">
            <div className="spinner" />
            <span>Cargando datos...</span>
          </div>
        ) : (
          <>
            {/* KPI Cards */}
            <KpiCards stats={stats} business={business} />

            {/* Financial Toggle */}
            {period === 'month' && !business?.hasFieldTechnicians && (
              <FinancialToggle
                showFullFinancial={showFullFinancial}
                setShowFullFinancial={setShowFullFinancial}
                enabledModules={enabledModules}
              />
            )}

            {/* Financial KPI Cards */}
            {showFullFinancial && period === 'month' && (
              <FinancialKpiCards
                displayIncome={displayIncome}
                displayInventory={displayInventory}
                displayNetProfit={displayNetProfit}
                displayMargin={displayMargin}
                financialReport={financialReport}
                enabledModules={enabledModules}
              />
            )}

            {/* Financial Detail */}
            {showFullFinancial && period === 'month' && (
              <FinancialDetail
                financialReport={financialReport}
                enabledModules={enabledModules}
                financialData={financialData}
              />
            )}

            {/* Tabs */}
            <div className="card mb-6">
              <ReportTabs
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                hasFieldTechnicians={business?.hasFieldTechnicians}
              />

              {activeTab === 'overview' && <OverviewTab byStatus={byStatus} isMobile={isMobile} />}

              {activeTab === 'employees' && (
                <EmployeesTab byEmployee={byEmployee} isMobile={isMobile} isTechnical={isTechnical} />
              )}

              {activeTab === 'services' && (
                <ServicesTab byService={byService} isTechnical={isTechnical} />
              )}

              {activeTab === 'tracking' && business?.hasFieldTechnicians && (
                <TrackingTab appointments={appointments} onDownload={handleDownloadTracking} />
              )}
            </div>

            {/* Appointments Table */}
            {appointments.length > 0 && (
              <AppointmentsTable
                appointments={appointments}
                paginatedAppointments={paginatedAppointments}
                currentPage={detailPage}
                totalPages={totalPages}
                onPageChange={setDetailPage}
                isTechnical={isTechnical}
              />
            )}
          </>
        )}
      </div>
    </AdminLayout>
  );
}
              <div className="grid-stats mb-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
                {/* Ingresos */}
                <div className="stat-card" style={{ borderLeft: '3px solid #3b82f6', padding: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 6, background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
                      <div style={{ width: 28, height: 28, borderRadius: 6, background: '#f3e8ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>
                        📦
                      </div>
                      <div>
                        <div style={{ fontSize: 12, color: '#6b7280', fontWeight: 500 }}>Insumos</div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#8b5cf6' }}>{fmt(displayInventory)}</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Gastos Operativos */}
                {enabledModules.expenses && (
                  <div className="stat-card" style={{ borderLeft: '3px solid #ef4444', padding: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 28, height: 28, borderRadius: 6, background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>
                        📉
                      </div>
                      <div>
                        <div style={{ fontSize: 12, color: '#6b7280', fontWeight: 500 }}>Gastos</div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#ef4444' }}>{fmt(financialReport?.details?.expenses?.total || 0)}</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Utilidad Neta */}
                <div className="stat-card" style={{ borderLeft: '3px solid #10b981', padding: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 6, background: '#d1fae5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
                      <div style={{ width: 28, height: 28, borderRadius: 6, background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>
                        🏦
                      </div>
                      <div>
                        <div style={{ fontSize: 12, color: '#6b7280', fontWeight: 500 }}>Depósitos</div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#f59e0b' }}>{fmt(financialReport.details.deposits.totalHeld)}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* DETALLE FINANCIERO - DISEÑO COMPACTO */}
            {showFullFinancial && period === 'month' && financialReport && (
              <div className="card mb-4" style={{ padding: 16 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <TrendingUp size={16} color="#3b82f6" />
                  Detalle Financiero - {MONTHS_ES[parseInt(financialReport.period.month) - 1]} {financialReport.period.year}
                </h3>

                {/* Tabla de resumen - COMPACTA */}
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead>
                      <tr style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}>
                        <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: 600, fontSize: 12 }}>Concepto</th>
                        <th style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 600, fontSize: 12 }}>Monto</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '8px 10px' }}>
                          <span style={{ color: '#3b82f6', fontWeight: 600 }}>+</span> Ingresos por Citas
                        </td>
                        <td style={{ padding: '8px 10px', textAlign: 'right', color: '#3b82f6', fontWeight: 600 }}>
                          {fmt(financialData.totalIncome)}
                        </td>
                      </tr>
                      
                      {enabledModules.inventory && financialData.inventoryCost > 0 && (
                        <tr style={{ borderBottom: '1px solid var(--border)' }}>
                          <td style={{ padding: '8px 10px', paddingLeft: 20 }}>
                            <span style={{ color: '#8b5cf6' }}>-</span> Costo Insumos
                          </td>
                          <td style={{ padding: '8px 10px', textAlign: 'right', color: '#8b5cf6' }}>
                            -{fmt(financialData.inventoryCost)}
                          </td>
                        </tr>
                      )}
                      
                      {enabledModules.expenses && financialData.totalExpenses > 0 && (
                        <>
                          <tr style={{ borderBottom: '1px solid var(--border)' }}>
                            <td style={{ padding: '6px 10px', paddingLeft: 20, color: 'var(--text-muted)', fontSize: 11 }}>
                              <em>Gastos:</em>
                            </td>
                            <td style={{ padding: '6px 10px' }}></td>
                          </tr>
                          {Object.entries(financialReport?.details?.expenses?.byCategory || {}).map(([category, amount]) => {
                            const categoryLabels = {
                              arriendo: '🏠 Arriendo',
                              servicios: '💡 Servicios',
                              insumos: '📦 Insumos',
                              nomina: '👥 Nómina',
                              marketing: '📢 Marketing',
                              otros: '📋 Otros'
                            };
                            return (
                              <tr key={category} style={{ borderBottom: '1px solid var(--border)' }}>
                                <td style={{ padding: '6px 10px', paddingLeft: 32, fontSize: 12 }}>
                                  {categoryLabels[category] || category}
                                </td>
                                <td style={{ padding: '6px 10px', textAlign: 'right', fontSize: 12, color: '#ef4444' }}>
                                  -{fmt(amount)}
                                </td>
                              </tr>
                            );
                          })}
                        </>
                      )}
                      
                      <tr style={{ background: '#f8fafc', borderTop: '2px solid var(--border)' }}>
                        <td style={{ padding: 10, fontWeight: 700, fontSize: 13 }}>
                          = UTILIDAD NETA
                        </td>
                        <td style={{ padding: 10, textAlign: 'right', fontWeight: 700, fontSize: 14, 
                          color: financialData.netProfit >= 0 ? '#10b981' : '#ef4444' }}>
                          {fmt(financialData.netProfit)}
                        </td>
                      </tr>
                      
                      {enabledModules.deposits && financialReport?.details?.deposits?.totalHeld > 0 && (
                        <tr style={{ borderTop: '1px dashed var(--border)' }}>
                          <td style={{ padding: '8px 10px', color: '#f59e0b', fontSize: 12 }}>
                            <span style={{ fontWeight: 600 }}>+</span> Depósitos Retenidos
                          </td>
                          <td style={{ padding: '8px 10px', textAlign: 'right', color: '#f59e0b', fontWeight: 600, fontSize: 12 }}>
                            {fmt(financialReport.details.deposits.totalHeld)}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Nota al pie - COMPACTA */}
                <div style={{ marginTop: 12, padding: 8, background: '#f0f9ff', borderRadius: 6, fontSize: 11, color: '#0369a1' }}>
                  💡 Utilidad neta = Ingresos - Gastos - Insumos. Depósitos retenidos = anticipos sin aplicar.
                </div>
              </div>
            )}

            {/* TABS */}
            <div className="card mb-6">
            {/* Selector (solo móvil) */}
            <div className="reports-tab-select" style={{ display: 'none', marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6 }}>
                Vista
              </label>
              <select value={activeTab} onChange={(e) => setActiveTab(e.target.value)}>
                <option value="overview">Resumen</option>
                <option value="employees">Por empleado</option>
                <option value="services">Por servicio</option>
                {business?.hasFieldTechnicians && (
                  <option value="tracking">📍 Seguimiento</option>
                )}
              </select>
            </div>

            <div className="reports-tabs-row" style={{ display: 'flex', borderBottom: '1px solid var(--border)', marginBottom: 20 }}>
              {['overview', 'employees', 'services', ...(business?.hasFieldTechnicians ? ['tracking'] : [])].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    padding: '12px 20px', fontSize: 14, fontWeight: activeTab === tab ? 700 : 500,
                    color: activeTab === tab ? '#667eea' : '#718096',
                    borderBottom: activeTab === tab ? '2px solid #667eea' : '2px solid transparent',
                    background: 'none', borderLeft: 'none', borderTop: 'none', borderRight: 'none', cursor: 'pointer'
                  }}>
                  {tab === 'overview' && 'Resumen'}
                  {tab === 'employees' && 'Por empleado'}
                  {tab === 'services' && 'Por servicio'}
                  {tab === 'tracking' && '📍 Seguimiento'}
                </button>
              ))}
            </div>

            {activeTab === 'overview' && (
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: 'var(--text)' }}>Estado de citas</h3>
                {byStatus.length > 0 ? (
                  <div className="reports-chart" style={{ height: isMobile ? 220 : 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                        <Pie
                          data={byStatus}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={isMobile ? undefined : ({ name, value }) => `${name}: ${value}`}
                          outerRadius={isMobile ? 70 : 80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                        {byStatus.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                      </Pie>
                        <Tooltip />
                        {!isMobile && <Legend />}
                    </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <p style={{ textAlign: 'center', color: '#a0aec0' }}>Sin datos para mostrar</p>
                )}

                {/* Resumen/leyenda para móvil (evita labels cortados) */}
                {byStatus.length > 0 && (
                  <div className="reports-mobile-only" style={{ marginTop: 12 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 8 }}>
                      {byStatus.map((s, i) => (
                        <div
                          key={s.name}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: 10,
                            padding: '10px 12px',
                            borderRadius: 10,
                            background: 'var(--bg-secondary)',
                            border: '1px solid var(--border)',
                            minWidth: 0,
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                            <span style={{ width: 10, height: 10, borderRadius: 99, background: COLORS[i % COLORS.length], flexShrink: 0 }} />
                            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {s.name}
                            </span>
                          </div>
                          <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text)' }}>{s.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'employees' && (
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: 'var(--text)' }}>Desempeño por empleado</h3>
                {byEmployee.length > 0 ? (
                  <div className="reports-chart" style={{ height: isMobile ? 220 : 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={byEmployee} margin={{ top: 8, left: 0, right: 0, bottom: isMobile ? 48 : 32 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="name"
                          tick={{ fontSize: isMobile ? 9 : 10 }}
                          interval={0}
                          angle={-35}
                          textAnchor="end"
                          height={isMobile ? 60 : 50}
                        />
                        <YAxis tick={{ fontSize: isMobile ? 9 : 10 }} />
                        <Tooltip />
                        {!isMobile && <Legend />}
                        <Bar dataKey="citas" fill="#667eea" name="Citas" />
                        {!business?.isTechnicalServices && !business?.hasFieldTechnicians && <Bar dataKey="ingresos" fill="#10b981" name="Ingresos" />}
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <p style={{ textAlign: 'center', color: '#a0aec0' }}>Sin datos para mostrar</p>
                )}
              </div>
            )}

            {activeTab === 'services' && (
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: 'var(--text)' }}>Servicios más populares</h3>
                {byService.length > 0 ? (
                  <div style={{ display: 'grid', gap: 12 }}>
                    {byService.map((svc, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, background: 'var(--bg-secondary)', borderRadius: 8 }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600, color: 'var(--text)' }}>{svc.name}</div>
                          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{svc.count} cita(s)</div>
                        </div>
                        {!business?.isTechnicalServices && !business?.hasFieldTechnicians && (
                          <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--primary)' }}>{fmt(svc.revenue)}</div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ textAlign: 'center', color: '#a0aec0' }}>Sin datos para mostrar</p>
                )}
              </div>
            )}

            {/* TAB SEGUIMIENTO TÉCNICOS - Solo para negocios con técnicos de campo */}
            {activeTab === 'tracking' && business?.hasFieldTechnicians && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>📍 Seguimiento de Técnicos</h3>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                    {/* Select para cambiar items por página (visible en mobile) */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <label style={{ fontSize: 13, color: 'var(--text-muted)' }}>Mostrar:</label>
                      <select 
                        value={trackingPerPage} 
                        onChange={(e) => {
                          setTrackingPerPage(Number(e.target.value));
                          setTrackingPage(1); // Reset a página 1
                        }}
                        style={{
                          padding: '6px 10px',
                          borderRadius: 6,
                          border: '1px solid var(--border)',
                          background: 'var(--surface)',
                          color: 'var(--text)',
                          fontSize: 13
                        }}
                      >
                        <option value={5}>5 por página</option>
                        <option value={10}>10 por página</option>
                        <option value={20}>20 por página</option>
                        <option value={50}>50 por página</option>
                      </select>
                    </div>
                    <button
                      onClick={downloadTrackingReport}
                      className="btn-outline btn-sm"
                      disabled={appointments.length === 0}
                    >
                      <Download size={16} /> Descargar
                    </button>
                  </div>
                </div>
                
                {(() => {
                  const trackingAppointments = appointments
                    .filter(a => a.technicianStatus && a.technicianStatus !== 'not_started')
                    .sort((a, b) => new Date(b.travelStartTime || b.startTime) - new Date(a.travelStartTime || a.startTime));
                  
                  const totalPages = Math.ceil(trackingAppointments.length / trackingPerPage);
                  const startIndex = (trackingPage - 1) * trackingPerPage;
                  const paginatedAppointments = trackingAppointments.slice(startIndex, startIndex + trackingPerPage);
                  
                  return trackingAppointments.length > 0 ? (
                    <>
                      {/* Info de paginación */}
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center', 
                        marginBottom: 12,
                        fontSize: 13,
                        color: 'var(--text-muted)'
                      }}>
                        <span>Mostrando {startIndex + 1}-{Math.min(startIndex + trackingPerPage, trackingAppointments.length)} de {trackingAppointments.length} citas</span>
                      </div>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {paginatedAppointments.map(apt => {
                          const isExpanded = expandedTrackingId === apt.id;
                          return (
                      <div 
                        key={apt.id} 
                        style={{ 
                          border: '1px solid var(--border)', 
                          borderRadius: 12, 
                          overflow: 'hidden',
                          background: 'var(--surface)'
                        }}
                      >
                        {/* Header compacto - clickeable para expandir */}
                        <div 
                          onClick={() => setExpandedTrackingId(isExpanded ? null : apt.id)}
                          style={{
                            padding: 16,
                            cursor: 'pointer',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            background: isExpanded ? 'var(--bg-secondary)' : 'var(--surface)',
                            borderBottom: isExpanded ? '1px solid var(--border)' : 'none'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            {/* Icono de estado */}
                            <div style={{
                              width: 36,
                              height: 36,
                              borderRadius: '50%',
                              background: apt.travelStartTime ? '#3b82f6' : '#e5e7eb',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}>
                              <Car size={16} color="white" />
                            </div>
                            <div>
                              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>
                                {apt.clientName}
                              </div>
                              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                                {new Date(apt.startTime).toLocaleString('es-CO', {
                                  weekday: 'short',
                                  day: 'numeric',
                                  month: 'short',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </div>
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{
                              padding: '4px 10px',
                              borderRadius: 20,
                              fontSize: 11,
                              fontWeight: 600,
                              background: STATUS_LABELS[apt.status]?.bg || '#f3f4f6',
                              color: STATUS_LABELS[apt.status]?.color || '#374151',
                            }}>
                              {STATUS_LABELS[apt.status]?.label || apt.status}
                            </span>
                            {/* Icono de expandir/colapsar */}
                            <div style={{
                              transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                              transition: 'transform 0.2s'
                            }}>
                              <ChevronDown size={20} color="var(--text-muted)" />
                            </div>
                          </div>
                        </div>
                        
                        {/* Contenido expandido */}
                        {isExpanded && (
                          <div style={{ padding: 16 }}>
                        {/* Header de la cita */}
                        <div style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'flex-start',
                          marginBottom: 12,
                          paddingBottom: 12,
                          borderBottom: '1px solid var(--border)'
                        }}>
                          <div>
                            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>
                              {apt.clientName}
                            </div>
                            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
                              {new Date(apt.startTime).toLocaleString('es-CO', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                            <span style={{
                              padding: '4px 10px',
                              borderRadius: 20,
                              fontSize: 11,
                              fontWeight: 600,
                              background: STATUS_LABELS[apt.status]?.bg || '#f3f4f6',
                              color: STATUS_LABELS[apt.status]?.color || '#374151',
                            }}>
                              {STATUS_LABELS[apt.status]?.label || apt.status}
                            </span>
                          </div>
                        </div>

                        {/* Timeline de seguimiento */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                          {/* En Camino */}
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                            <div style={{
                              width: 28,
                              height: 28,
                              borderRadius: '50%',
                              background: apt.travelStartTime ? '#3b82f6' : '#e5e7eb',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0
                            }}>
                              <Car size={14} color="white" />
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>
                                🚗 En Camino
                              </div>
                              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                                {apt.travelStartTime 
                                  ? new Date(apt.travelStartTime).toLocaleString('es-CO', {
                                      hour: '2-digit',
                                      minute: '2-digit',
                                      day: '2-digit',
                                      month: 'short',
                                      year: 'numeric'
                                    })
                                  : 'No registrado'
                                }
                              </div>
                            </div>
                          </div>

                          {/* Llegada */}
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                            <div style={{
                              width: 28,
                              height: 28,
                              borderRadius: '50%',
                              background: apt.arrivalTime ? '#06b6d4' : '#e5e7eb',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0
                            }}>
                              <MapPin size={14} color="white" />
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>
                                📍 Llegada al Destino
                              </div>
                              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                                {apt.arrivalTime 
                                  ? new Date(apt.arrivalTime).toLocaleString('es-CO', {
                                      hour: '2-digit',
                                      minute: '2-digit',
                                      day: '2-digit',
                                      month: 'short',
                                      year: 'numeric'
                                    })
                                  : 'No llegó aún'
                                }
                              </div>
                            </div>
                          </div>

                          {/* Inicio Servicio */}
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                            <div style={{
                              width: 28,
                              height: 28,
                              borderRadius: '50%',
                              background: apt.serviceStartTime ? '#ec4899' : '#e5e7eb',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0
                            }}>
                              <Wrench size={14} color="white" />
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>
                                🔧 Inicio del Servicio
                              </div>
                              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                                {apt.serviceStartTime 
                                  ? new Date(apt.serviceStartTime).toLocaleString('es-CO', {
                                      hour: '2-digit',
                                      minute: '2-digit',
                                      day: '2-digit',
                                      month: 'short',
                                      year: 'numeric'
                                    })
                                  : 'No iniciado'
                                }
                              </div>
                            </div>
                          </div>

                          {/* Completado */}
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                            <div style={{
                              width: 28,
                              height: 28,
                              borderRadius: '50%',
                              background: apt.status === 'done' ? '#10b981' : '#e5e7eb',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0
                            }}>
                              <CheckCircle size={14} color="white" />
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>
                                ✅ Servicio Completado
                              </div>
                              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                                {apt.status === 'done' ? 'Completada' : 'Pendiente'}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Insumos utilizados */}
                        {apt.workReport?.partsUsed && apt.workReport.partsUsed.length > 0 && (
                          <div style={{ 
                            marginTop: 16, 
                            padding: 12, 
                            background: 'var(--bg-secondary)', 
                            borderRadius: 8 
                          }}>
                            <div style={{ 
                              fontSize: 13, 
                              fontWeight: 700, 
                              color: 'var(--text)',
                              marginBottom: 8,
                              display: 'flex',
                              alignItems: 'center',
                              gap: 6
                            }}>
                              <Package size={16} />
                              Insumos Utilizados
                            </div>
                            <div style={{ display: 'grid', gap: 6 }}>
                              {apt.workReport.partsUsed.map((part, idx) => (
                                <div key={idx} style={{ 
                                  display: 'flex', 
                                  justifyContent: 'space-between',
                                  fontSize: 12,
                                  color: 'var(--text-secondary)'
                                }}>
                                  <span>{part.name}</span>
                                  <span style={{ fontWeight: 600 }}>
                                    {part.quantity} {part.unit}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Diagnóstico */}
                        {apt.workReport?.diagnosis && (
                          <div style={{ 
                            marginTop: 12, 
                            padding: 12, 
                            background: '#fef3c7', 
                            borderRadius: 8,
                            borderLeft: '3px solid #f59e0b'
                          }}>
                            <div style={{ fontSize: 12, fontWeight: 700, color: '#92400e', marginBottom: 4 }}>
                              📝 Diagnóstico
                            </div>
                            <div style={{ fontSize: 12, color: '#78350f' }}>
                              {apt.workReport.diagnosis}
                            </div>
                          </div>
                        )}

                        {/* Solución */}
                        {apt.workReport?.solution && (
                          <div style={{ 
                            marginTop: 8, 
                            padding: 12, 
                            background: '#d1fae5', 
                            borderRadius: 8,
                            borderLeft: '3px solid #10b981'
                          }}>
                            <div style={{ fontSize: 12, fontWeight: 700, color: '#065f46', marginBottom: 4 }}>
                              🔧 Solución Aplicada
                            </div>
                            <div style={{ fontSize: 12, color: '#14532d' }}>
                              {apt.workReport.solution}
                            </div>
                          </div>
                        )}

                        {/* Cancelación */}
                        {apt.status === 'cancelled' && (
                          <div style={{ 
                            marginTop: 12, 
                            padding: 12, 
                            background: '#fee2e2', 
                            borderRadius: 8,
                            borderLeft: '3px solid #ef4444'
                          }}>
                            <div style={{ fontSize: 12, fontWeight: 700, color: '#991b1b' }}>
                              ❌ CITA CANCELADA
                            </div>
                          </div>
                        )}
                        </div>
                        )}
                      </div>
                      );
                    })}
                      </div>
                      
                      {/* Controles de paginación */}
                      {totalPages > 1 && (
                        <div style={{ 
                          display: 'flex', 
                          justifyContent: 'center', 
                          alignItems: 'center',
                          gap: 16,
                          marginTop: 20,
                          padding: '12px',
                          background: 'var(--bg-secondary)',
                          borderRadius: 8
                        }}>
                          <button
                            onClick={() => setTrackingPage(prev => Math.max(1, prev - 1))}
                            disabled={trackingPage === 1}
                            style={{
                              padding: '8px 16px',
                              borderRadius: 6,
                              border: '1px solid var(--border)',
                              background: trackingPage === 1 ? 'var(--bg-secondary)' : 'var(--surface)',
                              color: trackingPage === 1 ? 'var(--text-muted)' : 'var(--text)',
                              cursor: trackingPage === 1 ? 'not-allowed' : 'pointer',
                              fontSize: 13,
                              fontWeight: 600
                            }}
                          >
                            ← Anterior
                          </button>
                          
                          <span style={{ 
                            fontSize: 14, 
                            fontWeight: 600, 
                            color: 'var(--text)',
                            minWidth: 100,
                            textAlign: 'center'
                          }}>
                            Página {trackingPage} de {totalPages}
                          </span>
                          
                          <button
                            onClick={() => setTrackingPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={trackingPage === totalPages}
                            style={{
                              padding: '8px 16px',
                              borderRadius: 6,
                              border: '1px solid var(--border)',
                              background: trackingPage === totalPages ? 'var(--bg-secondary)' : 'var(--surface)',
                              color: trackingPage === totalPages ? 'var(--text-muted)' : 'var(--text)',
                              cursor: trackingPage === totalPages ? 'not-allowed' : 'pointer',
                              fontSize: 13,
                              fontWeight: 600
                            }}
                          >
                            Siguiente →
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    <div style={{ textAlign: 'center', padding: 40 }}>
                      <Package size={40} color="#cbd5e1" />
                      <p style={{ color: '#94a3b8', marginTop: 12 }}>
                        No hay citas con seguimiento de técnico en este período
                      </p>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>

          {/* TABLA DETALLADA */}
          {appointments.length > 0 && (
            <div className="card">
              <div className="card-header">
                <div className="card-title">Detalle de citas</div>
              </div>
              {/* Desktop: tabla */}
              <div className="table-wrapper reports-desktop-only">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th>Cliente</th>
                      <th>Servicio</th>
                      <th>Empleado</th>
                      {!business?.isTechnicalServices && !business?.hasFieldTechnicians && (
                        <>
                          <th>Precio</th>
                          <th>Adicional</th>
                          <th>Pago</th>
                          <th>Método</th>
                        </>
                      )}
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedAppointments.map(a => (
                      <tr key={a.id}>
                        <td style={{ fontSize: 13 }}>{new Date(a.startTime).toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short', timeZone: 'America/Bogota' })}</td>
                        <td>{a.clientName}</td>
                        <td>{a.Service?.name}</td>
                        <td>{a.Employee?.User?.name}</td>
                        {!business?.isTechnicalServices && !business?.hasFieldTechnicians && (
                          <>
                            <td><span className="money">{fmt(a.Service?.price)}</span></td>
                            <td><span className="money" style={{ color: '#d97706' }}>{fmt(a.additionalAmount)}</span></td>
                            <td>
                              <span className="money positive" style={{ fontWeight: 700 }}>{fmt(parseFloat(a.Service?.price || 0) + parseFloat(a.additionalAmount || 0))}</span>
                            </td>
                            <td>
                              {a.status === 'done' && a.paymentMethod ? (
                                <span style={{
                                  fontSize: 12,
                                  fontWeight: 700,
                                  color: a.paymentMethod === 'cash' ? '#059669' : '#0891b2',
                                  textTransform: 'uppercase',
                                  background: a.paymentMethod === 'cash' ? '#d1fae5' : '#cffafe',
                                  padding: '4px 10px',
                                  borderRadius: 6,
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 4,
                                  whiteSpace: 'nowrap'
                                }}>
                                  {a.paymentMethod === 'cash' ? '💵 Efectivo' : '📲 Transf.'}
                                </span>
                              ) : (
                                <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>—</span>
                              )}
                            </td>
                          </>
                        )}
                        <td><span className={`badge badge-${a.status}`}>{STATUS_LABELS[a.status]}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {/* Controles de paginación */}
                {totalPages > 1 && (
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
                    <button 
                      onClick={() => setDetailPage(p => Math.max(1, p - 1))}
                      disabled={detailPage === 1}
                      className="btn-outline btn-sm"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <span style={{ fontSize: 14, fontWeight: 600 }}>
                      Página {detailPage} de {totalPages}
                    </span>
                    <button 
                      onClick={() => setDetailPage(p => Math.min(totalPages, p + 1))}
                      disabled={detailPage === totalPages}
                      className="btn-outline btn-sm"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                )}
              </div>

              {/* Mobile: cards (sin overflow horizontal) */}
              <div className="reports-mobile-only">
                <div style={{ display: 'grid', gap: 10 }}>
                  {paginatedAppointments.map(a => (
                    <div
                          key={a.id}
                          style={{
                            border: '1px solid var(--border)',
                            borderRadius: 12,
                            padding: 12,
                            background: 'var(--surface)',
                            minWidth: 0,
                          }}
                        >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text)' }}>
                            {a.clientName || 'Cliente'}
                          </div>
                          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                            {new Date(a.startTime).toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short', timeZone: 'America/Bogota' })}
                          </div>
                        </div>
                        <span className={`badge badge-${a.status}`} style={{ flexShrink: 0 }}>
                          {STATUS_LABELS[a.status]}
                        </span>
                      </div>

                      <div style={{ display: 'grid', gap: 6, marginTop: 10 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
                          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Servicio</span>
                          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', textAlign: 'right' }}>
                            {a.Service?.name || '—'}
                          </span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
                          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Empleado</span>
                          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', textAlign: 'right' }}>
                            {a.Employee?.User?.name || '—'}
                          </span>
                        </div>
                        {a.status === 'done' && a.paymentMethod && (
                          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
                            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Mtd. Pago</span>
                            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', textAlign: 'right' }}>
                              {a.paymentMethod === 'cash' ? '💵 Efectivo' : '📲 Transf.'}
                            </span>
                          </div>
                        )}
                        {!business?.isTechnicalServices && !business?.hasFieldTechnicians && (
                          <div style={{ display: 'grid', gap: 6, marginTop: 10, padding: 10, background: 'var(--bg-secondary)', borderRadius: 8 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
                              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Precio Base</span>
                              <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text)' }}>{fmt(a.Service?.price)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
                              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Adicional</span>
                              <span style={{ fontSize: 11, fontWeight: 600, color: '#d97706' }}>{fmt(a.additionalAmount)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, marginTop: 4, paddingTop: 4, borderTop: '1px dashed var(--border)' }}>
                              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)' }}>TOTAL</span>
                              <span className="money positive" style={{ fontSize: 13, fontWeight: 800 }}>
                                {fmt(parseFloat(a.Service?.price || 0) + parseFloat(a.additionalAmount || 0))}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Controles de paginación móvil */}
                {totalPages > 1 && (
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, marginTop: 16 }}>
                    <button 
                      onClick={() => setDetailPage(p => Math.max(1, p - 1))}
                      disabled={detailPage === 1}
                      className="btn-outline btn-sm"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <span style={{ fontSize: 14, fontWeight: 600 }}>
                      Página {detailPage} de {totalPages}
                    </span>
                    <button 
                      onClick={() => setDetailPage(p => Math.min(totalPages, p + 1))}
                      disabled={detailPage === totalPages}
                      className="btn-outline btn-sm"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}
      </div>
    </AdminLayout>
  );
}

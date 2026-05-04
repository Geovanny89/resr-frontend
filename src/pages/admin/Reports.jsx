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
  generateExcelWithCharts,
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
  
  // Estados para filtros avanzados
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [analysisType, setAnalysisType] = useState('overview');
  const [employeeFilter, setEmployeeFilter] = useState('all');
  const [serviceFilter, setServiceFilter] = useState('all');

  // Use custom hooks for data fetching
  const {
    appointments,
    previousPeriodAppointments,
    loading,
    error,
    range,
    stats,
    previousStats,
    comparison,
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
    employeeFilter: employeeFilter,
  });

  const {
    financialReport,
    enabledModules,
    financialData,
    displayIncome,
    displayInventory,
    displayNetProfit,
    displayMargin,
    displayCommissions,
  } = useFinancialReport({
    business,
    range,
    showFullFinancial,
    period,
    employeeId: employeeFilter,
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
      console.log('Generando Excel con gráficas usando ExcelJS:', { appointments: appointments?.length, business, showFullFinancial, period, showAdvancedFilters, employeeFilter, analysisType });
      await generateExcelWithCharts({
        appointments,
        business,
        showFullFinancial,
        financialReport,
        enabledModules,
        period,
        analysisType,
        employeeFilter,
        showAdvancedFilters,
        previousPeriodAppointments,
        comparison,
      });
      showToast('Excel con gráficas descargado correctamente', 'success');
    } catch (err) {
      console.error('Error completo al generar Excel con gráficas:', err);
      console.error('Stack trace:', err.stack);
      showToast(`Error al generar Excel: ${err.message || 'Error desconocido'}`, 'error');
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
          analysisType={analysisType}
          setAnalysisType={setAnalysisType}
          employeeFilter={employeeFilter}
          setEmployeeFilter={setEmployeeFilter}
          serviceFilter={serviceFilter}
          setServiceFilter={setServiceFilter}
          showAdvancedFilters={showAdvancedFilters}
          setShowAdvancedFilters={setShowAdvancedFilters}
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
            <KpiCards stats={stats} business={business} comparison={comparison} />

            {/* Financial Toggle */}
            {(period === 'month' || period === 'day' || period === 'week') && !business?.hasFieldTechnicians && (
              <FinancialToggle
                showFullFinancial={showFullFinancial}
                setShowFullFinancial={setShowFullFinancial}
                enabledModules={enabledModules}
              />
            )}

            {/* Financial KPI Cards */}
            {showFullFinancial && (period === 'month' || period === 'day' || period === 'week') && (
              <FinancialKpiCards
                displayIncome={displayIncome}
                displayInventory={displayInventory}
                displayNetProfit={displayNetProfit}
                displayMargin={displayMargin}
                displayCommissions={displayCommissions}
                financialReport={financialReport}
                enabledModules={enabledModules}
              />
            )}

            {/* Financial Detail */}
            {showFullFinancial && (period === 'month' || period === 'day' || period === 'week') && (
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
                <EmployeesTab 
                  byEmployee={byEmployee} 
                  isMobile={isMobile} 
                  isTechnical={isTechnical}
                  analysisType={analysisType}
                  employeeFilter={employeeFilter}
                  showAdvancedFilters={showAdvancedFilters}
                />
              )}

              {activeTab === 'services' && (
                <ServicesTab byService={byService} isTechnical={isTechnical} isMobile={isMobile} />
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

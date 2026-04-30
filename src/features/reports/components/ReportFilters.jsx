import { RefreshCw, Download, FileSpreadsheet, Calendar, Filter, TrendingUp, Users, Target } from 'lucide-react';
import { formatDateES } from '../utils/reportHelpers';

export function ReportFilters({
  period,
  setPeriod,
  customStart,
  customEnd,
  setShowRangeCalendar,
  showRangeCalendar,
  authBranches,
  selectedBranchId,
  setSelectedBranchId,
  business,
  mainBusiness,
  loading,
  onRefresh,
  onDownloadPDF,
  onDownloadExcel,
  hasAppointments,
  analysisType = 'overview',
  setAnalysisType,
  employeeFilter = 'all',
  setEmployeeFilter,
  serviceFilter = 'all',
  setServiceFilter,
  showAdvancedFilters = false,
  setShowAdvancedFilters,
}) {
  const periodOptions = [
    { value: 'day', label: 'Hoy' },
    { value: 'week', label: 'Semana' },
    { value: 'month', label: 'Mes' },
    { value: 'quarter', label: 'Trimestre' },
    { value: 'year', label: 'Año' },
    { value: 'custom', label: 'Personalizado' },
  ];

  const analysisOptions = [
    { value: 'overview', label: 'General', icon: '📊' },
    { value: 'performance', label: 'Rendimiento', icon: '⚡' },
    { value: 'comparison', label: 'Comparativo', icon: '📈' },
    { value: 'tracking', label: 'Seguimiento', icon: '🎯' },
  ];

  const filterOptions = [
    { value: 'all', label: 'Todos' },
    { value: 'top', label: 'Top 10' },
    { value: 'high', label: 'Alto Rendimiento' },
    { value: 'low', label: 'Bajo Rendimiento' },
  ];

  return (
    <div className="card mb-6" style={{ background: 'linear-gradient(135deg, #667eea15 0%, #764ba215 100%)', border: '1px solid #667eea30' }}>
      {/* Header empleado */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, paddingBottom: 12, borderBottom: '1px solid #E5E7EB' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ 
            width: 40, 
            height: 40, 
            borderRadius: 10, 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center' 
          }}>
            <Filter size={20} color="white" />
          </div>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1F2937', margin: 0, marginBottom: 2 }}>Filtros Profesionales</h3>
            <p style={{ fontSize: 12, color: '#6B7280', margin: 0 }}>Análisis avanzado y seguimiento</p>
          </div>
        </div>
        
        <button
          className="btn-outline btn-sm"
          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          style={{ 
            background: showAdvancedFilters ? '#667eea' : 'white',
            color: showAdvancedFilters ? 'white' : '#667eea',
            border: '1px solid #667eea'
          }}
        >
          <TrendingUp size={14} />
          {showAdvancedFilters ? 'Básico' : 'Avanzado'}
        </button>
      </div>

      <div
        className="reports-filter-row"
        style={{ display: 'flex', alignItems: 'flex-end', gap: 16, flexWrap: 'wrap' }}
      >
        <div>
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 13,
              fontWeight: 600,
              marginBottom: 6,
              color: '#374151',
            }}
          >
            <Calendar size={14} color="#667eea" />
            Período de Análisis
          </label>
          <div className="reports-period-buttons" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {periodOptions.map((p) => (
              <button
                key={p.value}
                className={period === p.value ? 'btn-primary' : 'btn-secondary'}
                style={{ 
                  padding: '8px 16px', 
                  fontSize: 13, 
                  minWidth: 80, 
                  whiteSpace: 'nowrap',
                  background: period === p.value ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'white',
                  borderColor: period === p.value ? '#667eea' : '#E5E7EB'
                }}
                onClick={() => {
                  setPeriod(p.value);
                  setShowRangeCalendar(p.value === 'custom');
                }}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Filtros avanzados */}
        {showAdvancedFilters && (
          <>
            <div>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: 13,
                  fontWeight: 600,
                  marginBottom: 6,
                  color: '#374151',
                }}
              >
                <Target size={14} color="#667eea" />
                Tipo de Análisis
              </label>
              <select
                className="form-input"
                style={{ 
                  height: 42, 
                  background: 'white', 
                  border: '1px solid #E5E7EB',
                  borderRadius: 8,
                  padding: '0 12px'
                }}
                value={analysisType}
                onChange={(e) => setAnalysisType && setAnalysisType(e.target.value)}
              >
                {analysisOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.icon} {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: 13,
                  fontWeight: 600,
                  marginBottom: 6,
                  color: '#374151',
                }}
              >
                <Users size={14} color="#667eea" />
                Filtro Profesionales
              </label>
              <select
                className="form-input"
                style={{ 
                  height: 42, 
                  background: 'white', 
                  border: '1px solid #E5E7EB',
                  borderRadius: 8,
                  padding: '0 12px'
                }}
                value={employeeFilter}
                onChange={(e) => setEmployeeFilter && setEmployeeFilter(e.target.value)}
              >
                {filterOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}

        {authBranches.length > 0 && (
          <div style={{ flex: 1, minWidth: 200 }}>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 13,
                fontWeight: 600,
                marginBottom: 6,
                color: '#374151',
              }}
            >
              📍 Sucursal
            </label>
            <select
              className="form-input"
              style={{ 
                height: 42, 
                background: 'white', 
                border: '1px solid #E5E7EB',
                borderRadius: 8,
                padding: '0 12px'
              }}
              value={selectedBranchId}
              onChange={(e) => setSelectedBranchId(e.target.value)}
            >
              <option value="active">📍 Sede Actual ({business?.name})</option>
              <option value="all">🌎 Todas las sucursales (Consolidado)</option>
              <option value="main">🏠 Sede Principal ({mainBusiness?.name})</option>
              {authBranches.map((b) => (
                <option key={b.id} value={b.id}>
                  🏢 {b.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <button
          className="btn-ghost btn-sm"
          onClick={onRefresh}
          disabled={loading}
          style={{ 
            alignSelf: 'flex-end', 
            height: 42,
            background: 'white',
            border: '1px solid #E5E7EB',
            borderRadius: 8
          }}
        >
          <RefreshCw size={14} className={loading ? 'spin' : ''} />
          {loading ? 'Actualizando...' : 'Actualizar'}
        </button>

        <div className="reports-actions-right" style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          <button 
            className="btn-outline btn-sm" 
            onClick={onDownloadPDF} 
            disabled={!hasAppointments}
            style={{ 
              background: 'white',
              borderColor: '#3B82F6',
              color: '#3B82F6'
            }}
          >
            <Download size={14} /> PDF
          </button>
          <button
            className="btn-success btn-sm"
            onClick={onDownloadExcel}
            disabled={!hasAppointments}
            style={{ 
              background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
              border: 'none',
              color: 'white',
              boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.3)'
            }}
          >
            <FileSpreadsheet size={14} /> Excel Pro
          </button>
        </div>
      </div>

      {/* Custom date indicator mejorado */}
      {period === 'custom' && (customStart || customEnd) && !showRangeCalendar && (
        <div
          onClick={() => setShowRangeCalendar(true)}
          style={{
            marginTop: 16,
            padding: '16px 20px',
            background: 'linear-gradient(135deg, #667eea15 0%, #764ba215 100%)',
            borderRadius: 12,
            border: '2px dashed #667eea',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            gap: 12,
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = 'linear-gradient(135deg, #667eea25 0%, #764ba225 100%)';
            e.target.style.borderColor = '#764ba2';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'linear-gradient(135deg, #667eea15 0%, #764ba215 100%)';
            e.target.style.borderColor = '#667eea';
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 14, color: '#667eea' }}>
            <div style={{ 
              width: 32, 
              height: 32, 
              borderRadius: 8, 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}>
              <Calendar size={16} color="white" />
            </div>
            <div>
              <div style={{ fontWeight: 600, marginBottom: 2 }}>
                {customStart && customEnd
                  ? `${formatDateES(customStart)} → ${formatDateES(customEnd)}`
                  : customStart
                    ? `Desde: ${formatDateES(customStart)}`
                    : 'Seleccionar rango de fechas'}
              </div>
              <div style={{ fontSize: 12, color: '#6B7280' }}>
                {customStart && customEnd 
                  ? `Rango personalizado activo` 
                  : 'Configura tu período de análisis'}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 12, color: '#667eea', fontWeight: 600 }}>Editar</span>
            <div style={{ 
              width: 24, 
              height: 24, 
              borderRadius: '50%', 
              background: '#667eea', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}>
              <span style={{ color: 'white', fontSize: 12 }}>→</span>
            </div>
          </div>
        </div>
      )}

      {/* Indicadores de filtros activos */}
      {showAdvancedFilters && (
        <div style={{ 
          marginTop: 16, 
          padding: 12, 
          background: '#F0F9FF', 
          borderRadius: 8, 
          border: '1px solid #BAE6FD' 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#0369A1' }}>
            <Target size={14} />
            <span style={{ fontWeight: 600 }}>Filtros avanzados activos:</span>
            <span>
              Análisis: {analysisOptions.find(o => o.value === analysisType)?.label} | 
              Profesionales: {filterOptions.find(o => o.value === employeeFilter)?.label}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

import { useTheme } from '../../context/ThemeContext';
import { Calendar, ChevronLeft, ChevronRight, Download } from 'lucide-react';
import { useEmployeeCommissions } from './hooks/useEmployeeCommissions';
import { CommissionsViewSelector } from './components/CommissionsViewSelector';
import { CommissionsSummaryCards } from './components/CommissionsSummaryCards';
import { CommissionsTable } from './components/CommissionsTable';
import { CommissionsCards } from './components/CommissionsCards';
import { CommissionsPagination } from './components/CommissionsPagination';
import { CommissionsInsumosModal } from './components/CommissionsInsumosModal';
import { CommissionsInfo } from './components/CommissionsInfo';

export default function EmployeeCommissions() {
  const { colors } = useTheme();
  
  const {
    data,
    loading,
    error,
    view,
    currentDate,
    currentPage,
    statusMsg,
    showInsumosModal,
    insumosAppointment,
    inventoryItems,
    selectedInsumos,
    loadingInventory,
    savingInsumos,
    workNotes,
    diagnosis,
    solution,
    recommendations,
    workEvidences,
    setWorkEvidences,
    setCurrentPage,
    setWorkNotes,
    setDiagnosis,
    setSolution,
    setRecommendations,
    handleStatusChange,
    handleStartWorkDirectly,
    handleOpenInsumosModal,
    handleAddInsumo,
    handleRemoveInsumo,
    handleSaveInsumosAndStart,
    handlePrev,
    handleNext,
    getPeriodLabel,
    exportToCSV,
    handleViewChange,
    closeInsumosModal
  } = useEmployeeCommissions();

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '24px 16px' }}>
        
        {/* Selector de Vista y Navegación */}
        <div style={{
          background: colors.cardBg,
          padding: 20,
          borderRadius: 12,
          boxShadow: `0 2px 8px ${colors.shadow}`,
          border: `1px solid ${colors.border}`,
          marginBottom: 24
        }}>
          <CommissionsViewSelector view={view} onViewChange={handleViewChange} colors={colors} />

          {/* Navegación de Periodo */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
            flexWrap: 'nowrap'
          }}>
            <button
              onClick={handlePrev}
              style={{
                background: colors.bgSecondary,
                border: `1px solid ${colors.border}`,
                padding: '10px',
                borderRadius: 8,
                cursor: 'pointer',
                color: colors.text,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <ChevronLeft size={20} />
            </button>
            
            <div style={{ textAlign: 'center', flex: 1, minWidth: 0, maxWidth: 250 }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                gap: 8,
                flexWrap: 'wrap'
              }}>
                <Calendar size={18} color={colors.primary} />
                <span style={{ 
                  fontSize: 16, 
                  fontWeight: 700, 
                  color: colors.text, 
                  textTransform: 'capitalize' 
                }}>
                  {getPeriodLabel()}
                </span>
              </div>
              <span style={{ fontSize: 12, color: colors.textSecondary, marginTop: 4, display: 'block' }}>
                {data?.pagination?.total || 0} citas en total
              </span>
            </div>
            
            <button
              onClick={handleNext}
              style={{
                background: colors.bgSecondary,
                border: `1px solid ${colors.border}`,
                padding: '10px',
                borderRadius: 8,
                cursor: 'pointer',
                color: colors.text,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {error && (
          <div style={{
            background: colors.isDark ? '#7f1d1d' : '#fed7d7',
            color: colors.isDark ? '#fca5a5' : '#c53030',
            padding: 16,
            borderRadius: 8,
            marginBottom: 24,
            border: `1px solid ${colors.isDark ? '#dc2626' : '#fc8181'}`
          }}>
            {error}
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: 60 }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>⏳</div>
            <p style={{ color: colors.textSecondary }}>
              {data?.hasFieldTechnicians ? 'Cargando citas...' : data?.isTechnicalServices ? 'Cargando servicios...' : 'Cargando comisiones...'}
            </p>
          </div>
        ) : (
          <>
            {/* Tarjetas de Resumen */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: (data?.isTechnicalServices || data?.hasFieldTechnicians)
                ? 'repeat(auto-fit, minmax(140px, 1fr))' 
                : 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 16,
              marginBottom: 24
            }}>
              <CommissionsSummaryCards data={data} colors={colors} />
            </div>

            {/* Botón Exportar */}
            {data?.appointments?.length > 0 && (
              <div style={{ marginBottom: 16, textAlign: 'right' }}>
                <button
                  onClick={exportToCSV}
                  style={{
                    background: colors.bgSecondary,
                    border: `1px solid ${colors.border}`,
                    padding: '10px 16px',
                    borderRadius: 8,
                    cursor: 'pointer',
                    color: colors.text,
                    fontSize: 13,
                    fontWeight: 600,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8
                  }}
                >
                  <Download size={16} />
                  {data?.hasFieldTechnicians ? 'Exportar Citas' : data?.isTechnicalServices ? 'Exportar Servicios' : 'Exportar CSV'}
                </button>
              </div>
            )}

            {/* Lista de Citas - Visible para todos */}
            <div style={{
              background: colors.cardBg,
              borderRadius: 16,
              padding: 24,
              border: `1px solid ${colors.border}`
            }}>
              {/* Título y Contador */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 16,
                flexWrap: 'wrap',
                gap: 12
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                  <h2 style={{ fontSize: 18, fontWeight: 700, color: colors.text, margin: 0 }}>
                    Detalle de Servicios
                  </h2>
                  <span style={{ fontSize: 13, color: colors.textSecondary }}>
                    Mostrando {data?.appointments?.length || 0} de {data?.pagination?.total || 0} citas
                  </span>
                </div>
              </div>

              {data?.appointments?.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 40 }}>
                  <p style={{ color: colors.textSecondary, fontSize: 16 }}>
                    {data?.isTechnicalServices 
                      ? `No tienes servicios registrados en este ${view === 'day' ? 'día' : view === 'week' ? 'periodo' : 'mes'}`
                      : `No tienes citas completadas en este ${view === 'day' ? 'día' : view === 'week' ? 'periodo' : 'mes'}`}
                  </p>
                  <p style={{ color: colors.textMuted, fontSize: 13, marginTop: 8 }}>
                    {data?.isTechnicalServices 
                      ? 'Los servicios aparecerán cuando marques una cita como "Terminada"' 
                      : 'Las comisiones se generan cuando marcas una cita como "Terminada"'}
                  </p>
                </div>
              ) : (
                <>
                  <CommissionsTable 
                    data={data} 
                    colors={colors} 
                    handleStatusChange={handleStatusChange} 
                    handleStartWorkDirectly={handleStartWorkDirectly} 
                    handleOpenInsumosModal={handleOpenInsumosModal} 
                  />

                  <CommissionsCards 
                    data={data} 
                    colors={colors} 
                    handleStatusChange={handleStatusChange} 
                    handleStartWorkDirectly={handleStartWorkDirectly} 
                    handleOpenInsumosModal={handleOpenInsumosModal} 
                  />
                </>
              )}

              {/* Paginación - Abajo de la lista */}
              <CommissionsPagination 
                pagination={data?.pagination} 
                currentPage={currentPage} 
                setCurrentPage={setCurrentPage} 
                colors={colors} 
              />
            </div>

            {/* Info adicional - Solo visible si no es servicio técnico ni técnico de campo */}
            <CommissionsInfo data={data} colors={colors} />

            {/* Responsive styles */}
            <style>{`
              /* Desktop: mostrar tabla, ocultar cards */
              @media (min-width: 769px) {
                .desktop-view {
                  display: block !important;
                }
                .mobile-view {
                  display: none !important;
                }
              }
              
              /* Mobile: ocultar tabla, mostrar cards */
              @media (max-width: 768px) {
                .desktop-view {
                  display: none !important;
                }
                .mobile-view {
                  display: block !important;
                }
                
                .commissions-table {
                  font-size: 12px;
                }
                .commissions-table th,
                .commissions-table td {
                  padding: 10px 8px !important;
                }
                .commissions-table th:nth-child(1),
                .commissions-table td:nth-child(1) {
                  min-width: 85px;
                }
                .commissions-table th:nth-child(2),
                .commissions-table td:nth-child(2) {
                  width: auto;
                  min-width: 100px;
                }
                .commissions-table th:nth-child(3),
                .commissions-table td:nth-child(3) {
                  min-width: 75px;
                }
                .commissions-table th:nth-child(4),
                .commissions-table td:nth-child(4) {
                  min-width: 65px;
                }
              }
              
              @media (max-width: 480px) {
                .commissions-table th,
                .commissions-table td {
                  padding: 8px 6px !important;
                  font-size: 11px;
                }
                .commissions-table th:nth-child(1),
                .commissions-table td:nth-child(1) {
                  min-width: 70px;
                }
                .commissions-table th:nth-child(2),
                .commissions-table td:nth-child(2) {
                  min-width: 90px;
                }
                .commissions-table th:nth-child(3),
                .commissions-table td:nth-child(3) {
                  min-width: 65px;
                }
                .commissions-table th:nth-child(4),
                .commissions-table td:nth-child(4) {
                  min-width: 60px;
                }
              }
              
              @media (max-width: 360px) {
                .commissions-table th,
                .commissions-table td {
                  padding: 6px 4px !important;
                  font-size: 10px;
                }
              }
            `}</style>
          </>
        )}

        {/* Toast de mensajes */}
        {statusMsg && (
          <div style={{
            position: 'fixed',
            bottom: 20,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 9999,
            padding: '12px 24px',
            borderRadius: 8,
            fontWeight: 600,
            fontSize: 14,
            background: statusMsg.type === 'error' ? '#fee2e2' : '#d1fae5',
            color: statusMsg.type === 'error' ? '#991b1b' : '#065f46',
            border: `1px solid ${statusMsg.type === 'error' ? '#fecaca' : '#a7f3d0'}`,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
          }}>
            {statusMsg.text}
          </div>
        )}

        {/* Modal de Insumos para Técnicos de Campo */}
        <CommissionsInsumosModal
          show={showInsumosModal}
          insumosAppointment={insumosAppointment}
          inventoryItems={inventoryItems}
          selectedInsumos={selectedInsumos}
          loadingInventory={loadingInventory}
          savingInsumos={savingInsumos}
          workNotes={workNotes}
          diagnosis={diagnosis}
          solution={solution}
          recommendations={recommendations}
          workEvidences={workEvidences}
          colors={colors}
          onAddInsumo={handleAddInsumo}
          onRemoveInsumo={handleRemoveInsumo}
          onSave={handleSaveInsumosAndStart}
          onCancel={closeInsumosModal}
          setWorkNotes={setWorkNotes}
          setDiagnosis={setDiagnosis}
          setSolution={setSolution}
          setRecommendations={setRecommendations}
          onPhotosChange={setWorkEvidences}
        />
      </div>
  );
}

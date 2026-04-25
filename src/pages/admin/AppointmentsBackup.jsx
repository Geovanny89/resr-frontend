/**
 * PÁGINA DE CITAS - VERSIÓN REFACTORIZADA
 * ======================================
 * 
 * Cambios realizados:
 * - Extraídos hooks: useAppointments, useAppointmentActions
 * - Extraídos componentes: todos los modales y AppointmentGrid
 * - Reducido de ~3100 líneas a ~500 líneas
 * - Misma funcionalidad, código más mantenible
 */
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import api from '../../api/client';
import AdminLayout from '../../components/AdminLayout';
import { useSocket } from '../../hooks/useSocket';
import { WorkEvidenceUploader } from '../../components/WorkEvidenceUploader';
import { Plus, Clock, Check, X, Package } from 'lucide-react';

// ✅ COMPONENTES EXTRAÍDOS
import {
  AppointmentFilters,
  AppointmentsGrid,
  CompleteAppointmentModal,
  ExpressAppointmentModal,
  CreateAppointmentModal,
  EditAppointmentModal,
  TransferModal,
  ExtendTimeModal,
  NotesModal,
  CancelModal,
  AdditionalChargeModal,
  SendReceiptModal
} from '../../features/appointments/components';

// ✅ HOOKS EXTRAÍDOS
import { useAppointments, useAppointmentActions } from '../../features/appointments/hooks';

const fmt = (n) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n || 0);

export default function Appointments() {
  const { business, user } = useAuth();
  const { colors } = useTheme();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  
  // Estado para mensajes
  const [statusMsg, setStatusMsg] = useState(null);
  const showStatus = useCallback((text, type = 'success') => {
    setStatusMsg({ text, type });
    setTimeout(() => setStatusMsg(null), 3500);
  }, []);

  // HOOK: Datos de citas
  const {
    appointments,
    loading,
    currentPage,
    setCurrentPage,
    totalPages,
    paginatedAppointments,
    selectedDate,
    setSelectedDate,
    selectedEmployeeId,
    setSelectedEmployeeId,
    filteredAppointments,
    refresh,
    setAppointments
  } = useAppointments(business?.id);

  // HOOK: Acciones
  const {
    modals,
    selectedAppointment,
    loading: actionLoading,
    openModal,
    closeModal,
    setSelectedAppointment,
    handleStatusChange,
    handleCompleteAppointment,
    handleCancelAppointment,
    handleCreateAppointment,
    handleCreateExpress,
    handleUpdateAppointment,
    handleExtendTime,
    handleTransferAppointment,
    handleSaveAdditionalCharge,
    handleLoadNotes,
    handleAddNote,
    handleDeleteNote,
    handleSendReceipt,
    handleSaveInsumosAndStart
  } = useAppointmentActions({ business, showStatus, refresh });

  // Estados locales adicionales
  const [services, setServices] = useState([]);
  const [employees, setEmployees] = useState([]);
  
  // Estado para modales con datos específicos
  const [completeData, setCompleteData] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  
  // Estado para formulario express
  const [expressForm, setExpressForm] = useState({
    clientName: '',
    clientPhone: '',
    serviceId: '',
    employeeId: ''
  });
  
  // Estado para insumos
  const [inventoryItems, setInventoryItems] = useState([]);
  const [selectedInsumos, setSelectedInsumos] = useState([]);
  const [loadingInventory, setLoadingInventory] = useState(false);
  const [diagnosis, setDiagnosis] = useState('');
  const [solution, setSolution] = useState('');
  const [recommendations, setRecommendations] = useState('');
  const [workEvidences, setWorkEvidences] = useState([]);

  // Cargar servicios y empleados
  useEffect(() => {
    if (!business?.id) return;
    
    const loadData = async () => {
      try {
        const [servicesRes, employeesRes] = await Promise.all([
          api.get(`/services?businessId=${business.id}`),
          api.get(`/employees?businessId=${business.id}`)
        ]);
        setServices(servicesRes.data || []);
        setEmployees(employeesRes.data || []);
      } catch (e) {
        console.error('Error loading data:', e);
      }
    };
    
    loadData();
  }, [business?.id]);

  // Responsive
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // SOCKET.IO
  const handleAppointmentCreated = useCallback((appointment) => {
    refresh();
    showStatus(`📅 Nueva cita: ${appointment.clientName}`, 'info');
  }, [refresh, showStatus]);

  const handleAppointmentUpdated = useCallback(() => {
    refresh();
  }, [refresh]);

  const handleAppointmentCancelled = useCallback(() => {
    refresh();
    showStatus('❌ Cita cancelada', 'warning');
  }, [refresh, showStatus]);

  useSocket({
    businessId: business?.id,
    userId: user?.id,
    role: 'admin',
    onAppointmentCreated: handleAppointmentCreated,
    onAppointmentUpdated: handleAppointmentUpdated,
    onAppointmentCancelled: handleAppointmentCancelled
  });

  // HANDLERS DE MODALES
  const handleOpenComplete = (apt) => {
    setCompleteData(apt);
    setPaymentMethod('cash');
    openModal('complete', apt);
  };

  const handleExpressFormChange = (field, value) => {
    setExpressForm(prev => ({ ...prev, [field]: value }));
  };

  const handleExpressSubmit = async () => {
    const result = await handleCreateExpress(expressForm);
    if (result.success) {
      setExpressForm({ clientName: '', clientPhone: '', serviceId: '', employeeId: '' });
      closeModal('express');
    }
  };

  const handleConfirmComplete = async () => {
    const result = await handleCompleteAppointment(completeData, paymentMethod);
    if (result.success) {
      closeModal('complete');
      setCompleteData(null);
    }
  };

  const handleOpenInsumos = async (apt) => {
    setSelectedAppointment(apt);
    const report = apt.workReport || {};
    setDiagnosis(report.diagnosis || '');
    setSolution(report.solution || '');
    setRecommendations(report.recommendations || '');
    setWorkEvidences(apt.workEvidences || []);
    setSelectedInsumos([]);
    
    // Cargar inventario
    if (business?.enabledModules?.inventory) {
      setLoadingInventory(true);
      try {
        const res = await api.get('/inventory/items', { params: { businessId: business.id } });
        setInventoryItems(res.data || []);
      } catch (e) {
        console.error('Error cargando insumos:', e);
      } finally {
        setLoadingInventory(false);
      }
    }
    
    openModal('insumos', apt);
  };

  const handleAddInsumo = (itemId, quantity) => {
    const item = inventoryItems.find(i => i.id === itemId);
    if (!item || !quantity) return;
    
    setSelectedInsumos(prev => {
      const existing = prev.find(i => i.itemId === itemId);
      if (existing) {
        return prev.map(i => i.itemId === itemId ? { ...i, quantity: parseFloat(quantity) } : i);
      }
      return [...prev, { itemId, quantity: parseFloat(quantity), name: item.name, unit: item.unit }];
    });
  };

  const handleRemoveInsumo = (itemId) => {
    setSelectedInsumos(prev => prev.filter(i => i.itemId !== itemId));
  };

  const handleSaveInsumos = async () => {
    const result = await handleSaveInsumosAndStart(
      selectedAppointment,
      selectedInsumos,
      { diagnosis, solution, recommendations },
      workEvidences
    );
    
    if (result.success) {
      closeModal('insumos');
      setSelectedInsumos([]);
      setDiagnosis('');
      setSolution('');
      setRecommendations('');
      setWorkEvidences([]);
    }
  };

  // Handlers para acciones
  const handlers = {
    onStatusChange: handleStatusChange,
    onComplete: handleOpenComplete,
    onCancel: (apt) => { setSelectedAppointment(apt); openModal('cancel', apt); },
    onEdit: (apt) => { setSelectedAppointment(apt); openModal('edit', apt); },
    onTransfer: (apt) => { setSelectedAppointment(apt); openModal('transfer', apt); },
    onExtend: (apt) => { setSelectedAppointment(apt); openModal('extend', apt); },
    onNotes: (apt) => { setSelectedAppointment(apt); openModal('notes', apt); },
    onAdditionalCharge: (apt) => { setSelectedAppointment(apt); openModal('additionalCharge', apt); },
    onSendReceipt: (id) => { setSelectedAppointment({ id }); openModal('sendReceipt'); },
    onOpenInsumos: handleOpenInsumos
  };

  return (
    <AdminLayout title="Citas" subtitle="Administra tus servicios y disponibilidad">
      <style>{`
        @media (max-width: 768px) {
          .admin-appointments-grid { grid-template-columns: 1fr !important; }
        }
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Toast */}
      {statusMsg && (
        <div style={{
          position: 'fixed', top: 20, right: 20, zIndex: 9999,
          padding: '12px 20px', borderRadius: 10, fontWeight: 600, fontSize: 14,
          background: statusMsg.type === 'error' ? '#fee2e2' : '#d1fae5',
          color: statusMsg.type === 'error' ? '#991b1b' : '#065f46',
          border: `1px solid ${statusMsg.type === 'error' ? '#fecaca' : '#a7f3d0'}`,
          boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
          display: 'flex', alignItems: 'center', gap: 8,
          animation: 'fadeInDown 0.3s ease-out'
        }}>
          {statusMsg.type === 'error' ? <X size={16} /> : <Check size={16} />}
          {statusMsg.text}
        </div>
      )}

      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : '280px 1fr',
        gap: 24,
        alignItems: 'start',
        width: '100%',
        maxWidth: '1400px',
        margin: '0 auto',
      }} className="admin-appointments-grid">
        
        {/* Sidebar: Filtros */}
        <AppointmentFilters
          selectedDate={selectedDate}
          onDateSelect={setSelectedDate}
          selectedEmployeeId={selectedEmployeeId}
          onEmployeeChange={setSelectedEmployeeId}
          employees={employees}
          colors={colors}
          isMobile={isMobile}
        />

        {/* Main: Lista de citas */}
        <div className="card" style={{ minWidth: 0, display: 'flex', flexDirection: 'column', padding: '24px' }}>
          {/* Header con botones */}
          <div className="card-header" style={{ 
            marginBottom: 24,
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            justifyContent: 'space-between',
            alignItems: isMobile ? 'flex-start' : 'center',
            gap: 16
          }}>
            <div>
              <h2 style={{ 
                fontSize: isMobile ? 18 : 22, fontWeight: 800, color: colors.text,
                margin: 0, textTransform: 'capitalize'
              }}>
                Citas del {selectedDate.toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })}
                {selectedEmployeeId && (
                  <span style={{ fontSize: 16, color: colors.primary, fontWeight: 600 }}>
                    {' '}→ {employees.find(e => e.id === selectedEmployeeId)?.User?.name || 'Empleado'}
                  </span>
                )}
              </h2>
              <div style={{ fontSize: 14, color: colors.textSecondary, marginTop: 4 }}>
                {filteredAppointments.length} cita{filteredAppointments.length !== 1 ? 's' : ''} programada{filteredAppointments.length !== 1 ? 's' : ''}
                {selectedEmployeeId && ' para este empleado'}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', width: isMobile ? '100%' : 'auto' }}>
              <button
                onClick={() => openModal('create')}
                style={{
                  background: colors.primary, color: 'white', border: 'none',
                  borderRadius: 12, padding: '12px 24px', fontSize: 14, fontWeight: 700,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  gap: 8, flex: isMobile ? 1 : 'none', boxShadow: `0 4px 12px ${colors.primary}40`
                }}
              >
                <Plus size={18} /> Nueva Cita
              </button>
              
              {!business?.hasFieldTechnicians && (
                <button
                  onClick={() => openModal('express')}
                  style={{
                    background: '#f59e0b', color: 'white', border: 'none',
                    borderRadius: 12, padding: '12px 24px', fontSize: 14, fontWeight: 700,
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    gap: 8, flex: isMobile ? 1 : 'none', boxShadow: '0 4px 12px rgba(245, 158, 11, 0.4)'
                  }}
                >
                  <Clock size={18} /> Cita Express
                </button>
              )}
            </div>
          </div>

          {/* Grid de citas */}
          <AppointmentsGrid
            appointments={paginatedAppointments}
            loading={loading}
            isMobile={isMobile}
            colors={colors}
            business={business}
            currentPage={currentPage}
            totalPages={totalPages}
            onPrevPage={() => setCurrentPage(p => Math.max(1, p - 1))}
            onNextPage={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            filteredCount={filteredAppointments.length}
            selectedDate={selectedDate}
            selectedEmployeeId={selectedEmployeeId}
            employees={employees}
            handlers={handlers}
          />
        </div>
      </div>

      {/* ============ MODALES ============ */}

      {/* Crear Cita */}
      <CreateAppointmentModal
        isOpen={modals.create}
        onClose={() => closeModal('create')}
        onSubmit={handleCreateAppointment}
        services={services}
        employees={employees}
        business={business}
        isCreating={actionLoading.create}
        colors={colors}
      />

      {/* Cita Express */}
      <ExpressAppointmentModal
        isOpen={modals.express}
        onCancel={() => { closeModal('express'); setExpressForm({ clientName: '', clientPhone: '', serviceId: '', employeeId: '' }); }}
        onSubmit={handleExpressSubmit}
        form={expressForm}
        onFormChange={handleExpressFormChange}
        services={services}
        employees={employees}
        isCreating={actionLoading.express}
        colors={colors}
      />

      {/* Completar Cita */}
      <CompleteAppointmentModal
        isOpen={modals.complete}
        appointment={completeData}
        paymentMethod={paymentMethod}
        onPaymentMethodChange={setPaymentMethod}
        onComplete={handleConfirmComplete}
        onCancel={() => { closeModal('complete'); setCompleteData(null); }}
        isCompleting={actionLoading.complete}
        colors={colors}
      />

      {/* Editar Cita */}
      <EditAppointmentModal
        isOpen={modals.edit}
        onClose={() => closeModal('edit')}
        appointment={selectedAppointment}
        onSubmit={handleUpdateAppointment}
        services={services}
        employees={employees}
        business={business}
        isSaving={actionLoading.edit}
        colors={colors}
      />

      {/* Transferir */}
      <TransferModal
        isOpen={modals.transfer}
        onClose={() => closeModal('transfer')}
        appointment={selectedAppointment}
        employees={employees}
        business={business}
        onTransfer={handleTransferAppointment}
        isTransferring={actionLoading.transfer}
        colors={colors}
      />

      {/* Extender Tiempo */}
      <ExtendTimeModal
        isOpen={modals.extend}
        onClose={() => closeModal('extend')}
        appointment={selectedAppointment}
        onExtend={handleExtendTime}
        isSaving={actionLoading.extend}
        colors={colors}
      />

      {/* Notas */}
      <NotesModal
        isOpen={modals.notes}
        onClose={() => closeModal('notes')}
        appointment={selectedAppointment}
        onLoadNotes={handleLoadNotes}
        onAddNote={handleAddNote}
        onDeleteNote={handleDeleteNote}
        isSaving={actionLoading.addNote}
        colors={colors}
        onSuccess={() => refresh()}
      />

      {/* Cancelar */}
      <CancelModal
        isOpen={modals.cancel}
        onClose={() => closeModal('cancel')}
        appointment={selectedAppointment}
        onConfirm={async (apt) => {
          const result = await handleCancelAppointment(apt);
          if (result.success) closeModal('cancel');
        }}
        isCancelling={actionLoading.cancel}
        colors={colors}
      />

      {/* Cargo Adicional */}
      <AdditionalChargeModal
        isOpen={modals.additionalCharge}
        onClose={() => closeModal('additionalCharge')}
        appointment={selectedAppointment}
        onSave={handleSaveAdditionalCharge}
        isSaving={actionLoading.additionalCharge}
        colors={colors}
      />

      {/* Enviar Recibo */}
      <SendReceiptModal
        isOpen={modals.sendReceipt}
        onClose={() => closeModal('sendReceipt')}
        onConfirm={async () => {
          const result = await handleSendReceipt(selectedAppointment?.id);
          if (result.success) closeModal('sendReceipt');
        }}
        isSending={actionLoading.sendReceipt}
        colors={colors}
      />

      {/* Modal de Insumos */}
      {modals.insumos && selectedAppointment && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20
        }}>
          <div style={{
            background: colors.cardBg, borderRadius: 16, padding: 24,
            maxWidth: 500, width: '100%', maxHeight: '80vh',
            overflowY: 'auto', border: `1px solid ${colors.border}`
          }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Package size={24} color={colors.primary} />
              Iniciar Trabajo - Registrar Insumos
            </h2>
            
            <div style={{ fontSize: 14, color: colors.textSecondary, marginBottom: 20 }}>
              Cliente: <strong>{selectedAppointment.clientName}</strong> • {' '}
              Servicio: <strong>{selectedAppointment.Service?.name}</strong>
            </div>

            {/* Lista de insumos */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, display: 'block' }}>
                Seleccionar Insumos Usados:
              </label>
              
              {loadingInventory ? (
                <div style={{ textAlign: 'center', padding: 20 }}>
                  <div className="spinner" />
                  <p style={{ fontSize: 12, color: colors.textSecondary, marginTop: 8 }}>Cargando insumos...</p>
                </div>
              ) : inventoryItems.length === 0 ? (
                <div style={{ 
                  padding: 16, background: colors.bgSecondary, borderRadius: 8,
                  fontSize: 13, color: colors.textSecondary
                }}>
                  No hay insumos registrados en el inventario.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {inventoryItems.map(item => (
                    <div 
                      key={item.id}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: 12, background: colors.bgSecondary, borderRadius: 8,
                        border: `1px solid ${colors.border}`
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={selectedInsumos.some(i => i.itemId === item.id)}
                        onChange={(e) => {
                          if (e.target.checked) handleAddInsumo(item.id, 1);
                          else handleRemoveInsumo(item.id);
                        }}
                        style={{ width: 18, height: 18 }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 14, fontWeight: 600 }}>{item.name}</div>
                        <div style={{ fontSize: 12, color: colors.textSecondary }}>
                          Stock: {item.currentStock} {item.unit} • Costo: {fmt(item.costPerUnit)}/{item.unit}
                        </div>
                      </div>
                      {selectedInsumos.some(i => i.itemId === item.id) && (
                        <input
                          type="number"
                          min="0.1" step="0.1"
                          value={selectedInsumos.find(i => i.itemId === item.id)?.quantity || 1}
                          onChange={(e) => handleAddInsumo(item.id, e.target.value)}
                          style={{
                            width: 70, padding: '6px 8px', borderRadius: 6,
                            border: `1px solid ${colors.border}`, fontSize: 14, textAlign: 'center'
                          }}
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Resumen */}
            {selectedInsumos.length > 0 && (
              <div style={{ 
                marginBottom: 20, padding: 12, background: '#f0fdf4',
                borderRadius: 8, border: '1px solid #86efac'
              }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#166534', marginBottom: 6 }}>
                  📦 Insumos seleccionados ({selectedInsumos.length}):
                </div>
                <div style={{ fontSize: 12, color: '#166534' }}>
                  {selectedInsumos.map(i => `${i.name}: ${i.quantity} ${i.unit}`).join(', ')}
                </div>
              </div>
            )}

            {/* Diagnóstico */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, display: 'block' }}>
                🔍 Diagnóstico:
              </label>
              <textarea
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                placeholder="Describe el problema o diagnóstico técnico"
                rows={3}
                style={{
                  width: '100%', padding: 12, borderRadius: 8,
                  border: `1px solid ${colors.border}`, fontSize: 14, resize: 'vertical'
                }}
              />
            </div>

            {/* Solución */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, display: 'block' }}>
                🔧 Solución Aplicada:
              </label>
              <textarea
                value={solution}
                onChange={(e) => setSolution(e.target.value)}
                placeholder="Describe la solución o reparación realizada"
                rows={3}
                style={{
                  width: '100%', padding: 12, borderRadius: 8,
                  border: `1px solid ${colors.border}`, fontSize: 14, resize: 'vertical'
                }}
              />
            </div>

            {/* Recomendaciones */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, display: 'block' }}>
                💡 Recomendaciones:
              </label>
              <textarea
                value={recommendations}
                onChange={(e) => setRecommendations(e.target.value)}
                placeholder="Recomendaciones para el cliente"
                rows={2}
                style={{
                  width: '100%', padding: 12, borderRadius: 8,
                  border: `1px solid ${colors.border}`, fontSize: 14, resize: 'vertical'
                }}
              />
            </div>

            {/* Evidencias */}
            <WorkEvidenceUploader
              appointmentId={selectedAppointment?.id}
              photos={workEvidences}
              onPhotosChange={setWorkEvidences}
              apiUrl={import.meta.env.VITE_API_URL || ''}
              token={localStorage.getItem('token') || ''}
              colors={colors}
            />

            {/* Botones */}
            <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
              <button
                onClick={() => {
                  closeModal('insumos');
                  setSelectedInsumos([]);
                  setDiagnosis('');
                  setSolution('');
                  setRecommendations('');
                  setWorkEvidences([]);
                }}
                style={{
                  flex: 1, padding: 12, borderRadius: 10,
                  border: `1px solid ${colors.border}`, background: 'none',
                  fontWeight: 600, cursor: 'pointer'
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveInsumos}
                disabled={actionLoading.insumos}
                style={{
                  flex: 2, padding: 12, borderRadius: 10, border: 'none',
                  background: colors.primary, color: 'white', fontWeight: 700,
                  cursor: actionLoading.insumos ? 'not-allowed' : 'pointer',
                  opacity: actionLoading.insumos ? 0.7 : 1
                }}
              >
                {actionLoading.insumos ? 'Guardando...' : 'Iniciar Trabajo'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

  useEffect(() => {
    // Detectar si es móvil después de montar (seguro para APK)
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const loadAppointments = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/appointments?businessId=${business.id}`);
      if (Array.isArray(res.data)) {
        setAppointments(res.data);
      } else {
        setAppointments([]);
      }
    } catch (e) {
      console.error('Error al cargar citas:', e);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const loadServices = async () => {
    try {
      const res = await api.get(`/services?businessId=${business.id}`);
      if (Array.isArray(res.data)) {
        setServices(res.data);
      } else {
        setServices([]);
      }
    } catch (e) {
      console.error('Error al cargar servicios:', e);
      setServices([]);
    }
  };

  const loadEmployees = async () => {
    try {
      const res = await api.get(`/employees?businessId=${business.id}`);
      if (Array.isArray(res.data)) {
        setEmployees(res.data);
      } else {
        setEmployees([]);
      }
    } catch (e) {
      console.error('Error al cargar empleados:', e);
      setEmployees([]);
    }
  };

  // Cargar insumos del inventario
  const loadInventoryItems = async () => {
    if (!business?.enabledModules?.inventory) return;
    setLoadingInventory(true);
    try {
      const res = await api.get('/inventory/items', {
        params: { businessId: business.id }
      });
      setInventoryItems(res.data || []);
    } catch (e) {
      console.error('Error cargando insumos:', e);
      setInventoryItems([]);
    } finally {
      setLoadingInventory(false);
    }
  };

  // Funciones para flujo de técnicos de campo
  const handleStatusChange = async (appointment, newStatus) => {
    try {
      // Para técnicos de campo, usar endpoint específico para estados de seguimiento
      const isTechnicianStatus = ['on_the_way', 'arrived', 'in_progress'].includes(newStatus);
      const isFieldTech = business?.hasFieldTechnicians;
      
      if (isFieldTech && isTechnicianStatus) {
        await api.patch(`/appointments/${appointment.id}/technician-status`, { status: newStatus });
      } else {
        await api.patch(`/appointments/${appointment.id}/status`, { status: newStatus });
      }
      showStatus(`Cita marcada como: ${STATUS_LABELS[newStatus]?.label || newStatus}`);
      loadAppointments();
    } catch (e) {
      showStatus(e.response?.data?.error || 'Error al cambiar estado', 'error');
    }
  };

  const handleOpenInsumosModal = async (appointment) => {
    setInsumosAppointment(appointment);
    setSelectedInsumos([]);
    // Cargar datos del reporte técnico si existe
    const report = appointment.workReport || {};
    setDiagnosis(report.diagnosis || '');
    setSolution(report.solution || '');
    setRecommendations(report.recommendations || '');
    setWorkNotes(appointment.workNotes || '');
    setWorkEvidences(appointment.workEvidences || []); // Cargar evidencias existentes
    setClientSignature(appointment.clientSignature || null); // Cargar firma existente
    await loadInventoryItems();
    setShowInsumosModal(true);
  };

  const handleAddInsumo = (itemId, quantity) => {
    const item = inventoryItems.find(i => i.id === itemId);
    if (!item || !quantity) return;
    
    setSelectedInsumos(prev => {
      const existing = prev.find(i => i.itemId === itemId);
      if (existing) {
        return prev.map(i => i.itemId === itemId ? { ...i, quantity: parseFloat(quantity) } : i);
      }
      return [...prev, { itemId, quantity: parseFloat(quantity), name: item.name, unit: item.unit }];
    });
  };

  const handleRemoveInsumo = (itemId) => {
    setSelectedInsumos(prev => prev.filter(i => i.itemId !== itemId));
  };

  const handleSaveInsumosAndStart = async () => {
    if (!insumosAppointment) return;
    setSavingInsumos(true);
    try {
      // Guardar insumos usados
      for (const insumo of selectedInsumos) {
        await api.post('/inventory/usages', {
          itemId: insumo.itemId,
          quantity: insumo.quantity,
          date: new Date().toISOString().split('T')[0],
          notes: `Usado en cita #${insumosAppointment.id} - ${insumosAppointment.clientName}`,
          businessId: business.id,
          appointmentId: insumosAppointment.id
        });
      }
      
      // Guardar reporte técnico si hay datos
      if (diagnosis.trim() || solution.trim() || recommendations.trim()) {
        await api.post(`/appointments/${insumosAppointment.id}/technical-report`, {
          diagnosis: diagnosis,
          solution: solution,
          recommendations: recommendations,
          partsUsed: selectedInsumos.map(i => ({
            itemId: i.itemId,
            name: i.name,
            quantity: i.quantity,
            unit: i.unit
          }))
        });
      }

      // Guardar evidencias fotográficas si hay fotos
      if (workEvidences.length > 0) {
        await api.post(`/appointments/${insumosAppointment.id}/work-evidences`, {
          photos: workEvidences.map(photo => ({
            url: photo.url,
            description: photo.description || ''
          })),
          replaceAll: true
        });
      }

      // Guardar firma del cliente si existe
      if (clientSignature) {
        await api.post(`/appointments/${insumosAppointment.id}/client-signature`, {
          signature: clientSignature
        });
      }

      // Cambiar estado a "en atención"
      await api.patch(`/appointments/${insumosAppointment.id}/technician-status`, {
        status: 'in_progress'
      });
      
      showStatus('Insumos registrados y trabajo iniciado');
      setShowInsumosModal(false);
      setInsumosAppointment(null);
      setSelectedInsumos([]);
      setWorkNotes('');
      setDiagnosis('');
      setSolution('');
      setRecommendations('');
      setWorkEvidences([]);
      setClientSignature(null);
      loadAppointments();
    } catch (e) {
      showStatus(e.response?.data?.error || 'Error al guardar insumos', 'error');
    } finally {
      setSavingInsumos(false);
    }
  };

  const loadAvailableSlots = async (date, employeeId, serviceId) => {
    
    if (!date || !employeeId || !serviceId) {
      setAvailableSlots([]);
      return;
    }

    try {
      // Para empresas normales: allowPast=true (mostrar todas las horas incluidas pasadas)
      // Para técnicos a domicilio: allowPast=false (solo horas futuras disponibles)
      const allowPast = !business?.hasFieldTechnicians;
      const res = await api.get(`/appointments/availability?date=${date}&employeeId=${employeeId}&serviceId=${serviceId}&businessId=${business.id}&allowPast=${allowPast}`);

      let slots = res.data.availableSlots || [];

      // Eliminar duplicados (misma hora)
      const seenTimes = new Set();
      slots = slots.filter(slot => {
        if (seenTimes.has(slot.time)) {
          return false;
        }
        seenTimes.add(slot.time);
        return true;
      });

      setAvailableSlots(slots);
    } catch (e) {
      setAvailableSlots([]);
    }
  };

  const filteredAppointments = useMemo(() => {
    const dateStr = selectedDate.toLocaleDateString('en-CA', { timeZone: 'America/Bogota' });
    
    return appointments.filter(apt => {
      const aptDate = new Date(apt.startTime).toLocaleDateString('en-CA', { timeZone: 'America/Bogota' });
      const matchesDate = aptDate === dateStr;
      const matchesEmployee = selectedEmployeeId ? apt.employeeId === selectedEmployeeId : true;
      return matchesDate && matchesEmployee;
    });
  }, [appointments, selectedDate, selectedEmployeeId]);

  // Reiniciar a la primera página cuando cambia la FECHA o el EMPLEADO seleccionado
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedDate, selectedEmployeeId]);

  const paginatedAppointments = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    // Ordenar por hora y paginar
    return filteredAppointments
      .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
      .slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAppointments, currentPage]);

  // Handler para abrir modal de edición
  const handleOpenEditModal = (appointment) => {
    setEditingAppointment(appointment);
    const appointmentDate = appointment.startTime 
      ? new Date(appointment.startTime).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0];
    setEditForm({
      clientName: appointment.clientName || '',
      clientPhone: appointment.clientPhone || '',
      clientEmail: appointment.clientEmail || '',
      serviceId: appointment.serviceId || '',
      employeeId: appointment.employeeId || '',
      startTime: appointment.startTime ? new Date(appointment.startTime).toISOString().slice(0, 16) : '',
      notes: appointment.notes || '',
      selectedDate: appointmentDate
    });
    setEditAvailableSlots([]);
    setShowEditModal(true);
  };

  // Load available slots when employee or service changes in edit modal
  useEffect(() => {
    const loadEditAvailableSlots = async () => {
      if (!editingAppointment || !editForm.employeeId || !editForm.serviceId || !editForm.selectedDate) {
        setEditAvailableSlots([]);
        return;
      }

      try {
        const allowPast = !business?.hasFieldTechnicians;
        const res = await api.get(`/appointments/availability?date=${editForm.selectedDate}&employeeId=${editForm.employeeId}&serviceId=${editForm.serviceId}&businessId=${business.id}&allowPast=${allowPast}`);
        setEditAvailableSlots(res.data.availableSlots || []);
      } catch (e) {
        setEditAvailableSlots([]);
      }
    };

    loadEditAvailableSlots();
  }, [editForm.employeeId, editForm.serviceId, editForm.selectedDate, editingAppointment, business?.id]);

  // Handler para guardar edición
  const handleSaveEdit = async () => {
    if (!editingAppointment) return;
    
    setSavingEdit(true);
    try {
      const payload = {
        clientName: editForm.clientName,
        clientPhone: editForm.clientPhone,
        clientEmail: editForm.clientEmail,
        serviceId: editForm.serviceId,
        employeeId: editForm.employeeId,
        notes: editForm.notes
      };

      // Solo enviar startTime si cambió
      const originalTime = editingAppointment.startTime 
        ? new Date(editingAppointment.startTime).toISOString().slice(0, 16)
        : '';
      if (editForm.startTime && editForm.startTime !== originalTime) {
        // Convertir a formato con zona horaria Colombia
        payload.startTime = `${editForm.startTime}:00-05:00`;
      }

      await api.put(`/appointments/${editingAppointment.id}`, payload);
      
      setShowEditModal(false);
      setEditingAppointment(null);
      showStatus('Cita actualizada exitosamente');
      loadAppointments();
    } catch (e) {
      showStatus(e.response?.data?.error || 'Error al actualizar cita', 'error');
    } finally {
      setSavingEdit(false);
    }
  };

  // Handler para extender tiempo
  const handleExtendTimeRequest = () => {
    setShowExtendConfirm(true);
  };

  const handleConfirmExtend = async () => {
    if (!extendingAppointment || !extendMinutes) return;
    
    setSavingExtend(true);
    try {
      await api.patch(`/appointments/${extendingAppointment.id}/extend-time`, {
        additionalMinutes: parseInt(extendMinutes)
      });
      
      setShowExtendConfirm(false);
      setShowExtendModal(false);
      setExtendingAppointment(null);
      setExtendMinutes(15);
      showStatus(`Tiempo extendido en ${extendMinutes} minutos`);
      loadAppointments();
    } catch (e) {
      showStatus(e.response?.data?.error || 'Error al extender tiempo', 'error');
    } finally {
      setSavingExtend(false);
    }
  };

  // Handlers para notas
  const loadNotes = async (appointmentId) => {
    setLoadingNotes(true);
    try {
      const res = await api.get(`/appointments/${appointmentId}/notes`);
      setNotes(res.data || []);
    } catch (e) {
      console.error('Error loading notes:', e);
      setNotes([]);
    } finally {
      setLoadingNotes(false);
    }
  };

  const handleOpenNotesModal = (appointment) => {
    setNotesAppointment(appointment);
    setNewNoteContent('');
    loadNotes(appointment.id);
    setShowNotesModal(true);
  };

  const handleAddNote = async () => {
    if (!notesAppointment || !newNoteContent.trim()) return;
    
    setSavingNote(true);
    try {
      await api.post(`/appointments/${notesAppointment.id}/notes`, {
        content: newNoteContent.trim()
      });
      setNewNoteContent('');
      loadNotes(notesAppointment.id);
      showStatus('Nota agregada');
    } catch (e) {
      showStatus('Error al agregar nota', 'error');
    } finally {
      setSavingNote(false);
    }
  };

  const handleDeleteNoteRequest = (noteId) => {
    if (!notesAppointment) return;
    setNoteToDelete(noteId);
    setShowDeleteNoteConfirm(true);
  };

  const handleConfirmDeleteNote = async () => {
    if (!notesAppointment || !noteToDelete) return;
    
    try {
      await api.delete(`/appointments/${notesAppointment.id}/notes/${noteToDelete}`);
      loadNotes(notesAppointment.id);
      showStatus('Nota eliminada');
    } catch (e) {
      showStatus('Error al eliminar nota', 'error');
    } finally {
      setShowDeleteNoteConfirm(false);
      setNoteToDelete(null);
    }
  };

  // Helper para obtener acciones según el estado de la cita
  const getRowActions = (row) => {
    const isFieldTechnician = business?.hasFieldTechnicians || false;
    const hasInventory = business?.enabledModules?.inventory || false;
    
    // Flujo para técnicos de campo - usa technicianStatus en lugar de status
    if (isFieldTechnician) {
      const techStatus = row.technicianStatus || 'not_started';
      const actions = [
        {
          label: 'Editar',
          onClick: () => handleOpenEditModal(row),
          color: '#6366f1',
          show: ['pending', 'confirmed'].includes(row.status)
        },
        {
          label: 'En camino',
          onClick: () => handleStatusChange(row, 'on_the_way'),
          color: '#3b82f6',
          show: row.status === 'confirmed' && techStatus === 'not_started'
        },
        {
          label: 'Llegué',
          onClick: () => handleStatusChange(row, 'arrived'),
          color: '#06b6d4',
          show: techStatus === 'on_the_way'
        },
        {
          label: 'Iniciar',
          onClick: () => handleOpenInsumosModal(row),
          color: '#8b5cf6',
          show: techStatus === 'arrived' && row.status !== 'attention'
        },
        {
          label: 'Insumos',
          onClick: () => handleOpenInsumosModal(row),
          color: '#f59e0b',
          show: row.status === 'attention' && hasInventory
        },
        {
          label: 'Completar',
          onClick: () => {
            setCompleteAppointmentData(row);
            setShowCompleteModal(true);
          },
          color: '#22c55e',
          show: row.status === 'attention'
        },
        {
          label: 'Reasignar',
          onClick: () => handleOpenTransferModal(row),
          color: '#6366f1',
          show: ['pending', 'confirmed'].includes(row.status)
        },
        {
          label: 'Cancelar',
          onClick: () => handleCancel(row),
          color: '#ef4444',
          show: ['pending', 'confirmed', 'attention'].includes(row.status)
        }
      ];
      return actions.filter(a => a.show);
    }
    
    // Flujo normal (no técnico de campo)
    const actions = [
      {
        label: 'Editar',
        onClick: () => handleOpenEditModal(row),
        color: '#6366f1',
        show: ['pending', 'confirmed'].includes(row.status)
      },
      {
        label: 'Confirmar',
        onClick: () => handleStatusChange(row, 'confirmed'),
        color: '#10b981',
        show: row.status === 'pending'
      },
      {
        label: 'Atender',
        onClick: () => handleStatusChange(row, 'attention'),
        color: '#3b82f6',
        show: row.status === 'confirmed'
      },
      {
        label: 'Extender',
        onClick: () => { setExtendingAppointment(row); setExtendMinutes(15); setShowExtendModal(true); },
        color: '#f97316',
        show: row.status === 'attention'
      },
      {
        label: 'Completar',
        onClick: () => {
          setCompleteAppointmentData(row);
          setPaymentMethod('cash');
          setShowCompleteModal(true);
        },
        color: '#8b5cf6',
        show: ['confirmed', 'attention'].includes(row.status)
      },
      {
        label: 'Reasignar',
        onClick: () => handleOpenTransferModal(row),
        color: '#6366f1',
        show: ['pending', 'confirmed'].includes(row.status)
      },
      {
        label: 'Notas',
        onClick: () => handleOpenNotesModal(row),
        color: '#14b8a6',
        show: true
      },
      {
        label: 'Adicional',
        onClick: () => handleOpenAdditionalChargeModal(row),
        color: '#f59e0b',
        show: ['pending', 'confirmed', 'attention'].includes(row.status)
      },
      {
        label: 'Recibo',
        onClick: () => handleSendReceiptRequest(row.id),
        color: '#0ea5e9',
        show: row.status === 'done'
      },
      {
        label: 'Cancelar',
        onClick: () => handleCancel(row),
        color: '#ef4444',
        show: ['pending', 'confirmed', 'attention'].includes(row.status)
      }
    ];
    return actions.filter(a => a.show);
  };

  const totalPages = Math.ceil(filteredAppointments.length / itemsPerPage);

  const handleCompleteAppointment = async () => {
    if (!completeAppointmentData) return;
    setCompleting(true);
    try {
      await api.patch(`/appointments/${completeAppointmentData.id}/status`, { 
        status: 'done',
        paymentMethod: paymentMethod 
      });
      loadAppointments();
      setShowCompleteModal(false);
      setCompleteAppointmentData(null);
      showStatus('Cita completada exitosamente');
    } catch (e) {
      showStatus(e.response?.data?.error || 'Error al completar cita', 'error');
    } finally {
      setCompleting(false);
    }
  };

  const handleCancel = (appointment) => {
    setCancellingAppointment(appointment);
    setShowCancelConfirm(true);
  };

  const handleConfirmCancel = async () => {
    if (!cancellingAppointment) return;
    
    setCancelling(true);
    try {
      await api.patch(`/appointments/${cancellingAppointment.id}/cancel`);
      setShowCancelConfirm(false);
      setCancellingAppointment(null);
      showStatus('Cita cancelada exitosamente');
      loadAppointments();
    } catch (e) {
      console.error('Error al cancelar:', e);
      showStatus('Error al cancelar cita', 'error');
    } finally {
      setCancelling(false);
    }
  };

  const handleSendReceiptRequest = (appointmentId) => {
    setReceiptAppointmentId(appointmentId);
    setShowSendReceiptConfirm(true);
  };

  const handleConfirmSendReceipt = async () => {
    if (!receiptAppointmentId) return;
    setSendingReceipt(true);
    try {
      await api.post(`/appointments/${receiptAppointmentId}/send-receipt`);
      showStatus('Comprobante de pago enviado exitosamente');
    } catch (e) {
      console.error('Error al enviar comprobante:', e);
      showStatus('Error al enviar comprobante: ' + (e.response?.data?.error || e.message), 'error');
    } finally {
      setSendingReceipt(false);
      setShowSendReceiptConfirm(false);
      setReceiptAppointmentId(null);
    }
  };

  const handleOpenAdditionalChargeModal = (appointment) => {
    setSelectedAppointment(appointment);
    setAdditionalChargeForm({
      additionalAmount: appointment.additionalAmount || '',
      additionalNote: appointment.additionalNote || ''
    });
    setShowAdditionalChargeModal(true);
  };

  const handleSaveAdditionalCharge = async () => {
    if (!selectedAppointment) return;
    
    setSavingAdditionalCharge(true);
    try {
      await api.patch(`/appointments/${selectedAppointment.id}/additional-charge`, {
        additionalAmount: parseFloat(additionalChargeForm.additionalAmount) || 0,
        additionalNote: additionalChargeForm.additionalNote
      });
      
      setShowAdditionalChargeModal(false);
      showStatus('Cargo adicional guardado exitosamente');
      loadAppointments();
    } catch (e) {
      console.error('Error al guardar cargo adicional:', e);
      showStatus('Error al guardar cargo adicional: ' + (e.response?.data?.error || e.message), 'error');
    } finally {
      setSavingAdditionalCharge(false);
    }
  };

  const handleOpenTransferModal = (appointment) => {
    setSelectedTransferAppointment(appointment);
    setTransferEmployeeId('');
    setTransferAvailableSlots([]);
    setTransferSelectedSlot('');
    setTransferConflictError(null);
    setShowTransferModal(true);
  };

  // Load available slots when employee changes
  useEffect(() => {
    const loadTransferAvailableSlots = async () => {
      if (!selectedTransferAppointment || !transferEmployeeId) {
        setTransferAvailableSlots([]);
        return;
      }

      const dateStr = new Date(selectedTransferAppointment.startTime).toISOString().split('T')[0];
      try {
        const allowPast = !business?.hasFieldTechnicians;
        const res = await api.get(`/appointments/availability?date=${dateStr}&employeeId=${transferEmployeeId}&serviceId=${selectedTransferAppointment.serviceId}&businessId=${business.id}&allowPast=${allowPast}`);
        setTransferAvailableSlots(res.data.availableSlots || []);
      } catch (e) {
        setTransferAvailableSlots([]);
      }
    };

    loadTransferAvailableSlots();
  }, [transferEmployeeId, selectedTransferAppointment]);

  const handleTransferAppointment = async () => {
    if (!selectedTransferAppointment || !transferEmployeeId) return;
    
    setTransferring(true);
    setTransferConflictError(null);
    try {
      // Construir fecha con zona horaria Colombia explícita
      const dateStr = new Date(selectedTransferAppointment.startTime).toLocaleDateString('en-CA', { timeZone: 'America/Bogota' });
      const payload = {
        newEmployeeId: transferEmployeeId,
        newStartTime: transferSelectedSlot ? `${dateStr}T${transferSelectedSlot}:00-05:00` : undefined
      };

      await api.patch(`/appointments/${selectedTransferAppointment.id}/transfer`, payload);
      
      setShowTransferModal(false);
      showStatus(transferSelectedSlot 
        ? `Cita transferida a ${transferSelectedSlot}` 
        : 'Cita transferida exitosamente'
      );
      loadAppointments();
    } catch (e) {
      console.error('Error al transferir cita:', e);
      if (e.response?.status === 409 && e.response?.data?.requiresReschedule) {
        setTransferConflictError({
          message: e.response.data.error,
          conflict: e.response.data.conflictAppointment
        });
      } else if (e.response?.status === 403) {
        // Error 403: Empleado no tiene el servicio asignado - mensaje sutil
        showStatus(
          e.response?.data?.details || 'No se puede reasignar la cita a este empleado',
          'error'
        );
        setShowTransferModal(false);
      } else {
        // Otros errores - mensaje sutil
        showStatus(
          '❌ Error al transferir cita: ' + (e.response?.data?.error || e.message),
          'error'
        );
      }
    } finally {
      setTransferring(false);
    }
  };

  useEffect(() => {
    if (selectedDateModal && createForm.employeeId && createForm.serviceId) {
      loadAvailableSlots(selectedDateModal, createForm.employeeId, createForm.serviceId);
    }
  }, [selectedDateModal, createForm.employeeId, createForm.serviceId]);

  const handleExpressAppointment = () => {
     setExpressForm({
       clientName: '',
       clientPhone: '',
       serviceId: '',
       employeeId: ''
     });
     setShowExpressModal(true);
   };

  const handleCreateExpress = async () => {
    if (!expressForm.serviceId || !expressForm.employeeId) {
      showStatus('Por favor selecciona servicio y empleado', 'error');
      return;
    }
    
    setCreating(true);
    try {
      // Usar la hora actual en Colombia
      const now = new Date();
      // Ajustar manualmente a UTC-5 (Colombia) para que el servidor lo tome bien si es necesario, 
      // pero el backend ya maneja el offset. Enviamos el ISO normal.
      const startTime = now.toISOString();

      await api.post('/appointments', {
        businessId: business.id,
        ...expressForm,
        startTime,
        status: 'attention' // Iniciar atención de inmediato
      });
      
      await loadAppointments();
      setShowExpressModal(false);
      showStatus('Cita express iniciada');
    } catch (e) {
      showStatus(e.response?.data?.error || 'Error al crear cita express', 'error');
    } finally {
      setCreating(false);
    }
  };

  const handleCreateAppointment = async () => {
    if (!createForm.clientName || !createForm.serviceId || !createForm.employeeId || !createForm.startTime) {
      showStatus('Por favor completa todos los campos requeridos', 'error');
      return;
    }

    // Validar dirección para negocios con técnicos a domicilio
    if (business?.hasFieldTechnicians && !createForm.address) {
      showStatus('La dirección es requerida para servicios a domicilio', 'error');
      return;
    }

    setCreating(true);
    try {
      await api.post('/appointments', {
        businessId: business.id,
        ...createForm,
        startTime: new Date(createForm.startTime).toISOString()
      });
      
      await loadAppointments();
      resetCreateForm();
      setShowCreateModal(false);
      showStatus('Cita creada exitosamente');
    } catch (e) {
      showStatus(e.response?.data?.error || 'Error al crear cita', 'error');
    } finally {
      setCreating(false);
    }
  };

  const resetCreateForm = () => {
    setCreateForm({
      clientName: '',
      clientEmail: '',
      clientPhone: '',
      address: '',
      additionalEmployeeIds: [],
      serviceId: '',
      employeeId: '',
      startTime: '',
      notes: ''
    });
    setSelectedDateModal('');
    setAvailableSlots([]);
    setManualTime('');
  };

  const formatTime = (dateStr) => {
    return new Date(dateStr).toLocaleTimeString('es-CO', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: 'America/Bogota'
    });
  };

  const getDisabledDates = () => {
    // Puedes agregar lógica para deshabilitar fechas sin citas
    return [];
  };

  return (
    <AdminLayout title="Citas" subtitle="Administra tus servicios y disponibilidad">
      <style>{`
        @media (max-width: 768px) {
          .admin-appointments-grid {
            grid-template-columns: 1fr !important;
          }
        }
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Toast sutil */}
      {statusMsg && (
        <div style={{
          position: 'fixed', top: 20, right: 20, zIndex: 9999,
          padding: '12px 20px', borderRadius: 10, fontWeight: 600, fontSize: 14,
          background: statusMsg.type === 'error' ? '#fee2e2' : '#d1fae5',
          color: statusMsg.type === 'error' ? '#991b1b' : '#065f46',
          border: `1px solid ${statusMsg.type === 'error' ? '#fecaca' : '#a7f3d0'}`,
          boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
          display: 'flex', alignItems: 'center', gap: 8,
          animation: 'fadeInDown 0.3s ease-out'
        }}>
          {statusMsg.type === 'error' ? <X size={16} /> : <Check size={16} />}
          {statusMsg.text}
        </div>
      )}

      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : '280px 1fr',
        gap: 24,
        alignItems: 'start',
        width: '100%',
        maxWidth: '1400px',
        margin: '0 auto',
      }} className="admin-appointments-grid">
        {/* ✅ NUEVO: Componente de filtros extraído */}
        <AppointmentFilters
          selectedDate={selectedDate}
          onDateSelect={setSelectedDate}
          selectedEmployeeId={selectedEmployeeId}
          onEmployeeChange={setSelectedEmployeeId}
          employees={employees}
          getDisabledDates={getDisabledDates}
          colors={colors}
          isMobile={isMobile}
        />

        {/* Citas del día */}
        <div className="card" style={{ 
          minWidth: 0, // Evita que el grid se rompa con tablas largas
          display: 'flex', 
          flexDirection: 'column',
          padding: '24px'
        }}>
          <div className="card-header" style={{ 
            marginBottom: 24,
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            justifyContent: 'space-between',
            alignItems: isMobile ? 'flex-start' : 'center',
            gap: 16
          }}>
            <div>
              <h2 style={{ 
                fontSize: isMobile ? 18 : 22, 
                fontWeight: 800, 
                color: colors.text,
                margin: 0,
                textTransform: 'capitalize'
              }}>
                Citas del {selectedDate.toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })}
                {selectedEmployeeId && (
                  <span style={{ fontSize: 16, color: colors.primary, fontWeight: 600 }}>
                    {' '}→ {employees.find(e => e.id === selectedEmployeeId)?.User?.name || 'Empleado'}
                  </span>
                )}
              </h2>
              <div style={{ fontSize: 14, color: colors.textSecondary, marginTop: 4 }}>
                {filteredAppointments.length} cita{filteredAppointments.length !== 1 ? 's' : ''} programada{filteredAppointments.length !== 1 ? 's' : ''}
                {selectedEmployeeId && ' para este empleado'}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', width: isMobile ? '100%' : 'auto' }}>
              <button
                onClick={() => setShowCreateModal(true)}
                style={{
                  background: colors.primary,
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '12px 24px',
                  fontSize: '14px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  flex: isMobile ? 1 : 'none',
                  boxShadow: `0 4px 12px ${colors.primary}40`
                }}
              >
                <Plus size={18} />
                Nueva Cita
              </button>
              
              {!business?.hasFieldTechnicians && (
                <button
                  onClick={() => handleExpressAppointment()}
                  style={{
                    background: '#f59e0b',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '12px 24px',
                    fontSize: '14px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    flex: isMobile ? 1 : 'none',
                    boxShadow: '0 4px 12px rgba(245, 158, 11, 0.4)'
                  }}
                >
                  <Clock size={18} />
                  Cita Express
                </button>
              )}
            </div>
          </div>

          {/* VISTA DE AGENDA TIPO CALENDARIO */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: 40 }}>
              <div className="spinner" />
              <p style={{ marginTop: 12, color: colors.textSecondary }}>Cargando citas...</p>
            </div>
          ) : filteredAppointments.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: 60, 
              background: colors.bgSecondary,
              borderRadius: 12,
              border: `1px dashed ${colors.border}`
            }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>📅</div>
              <h3 style={{ fontSize: 18, fontWeight: 600, color: colors.text, marginBottom: 8 }}>
                No hay citas para esta fecha
              </h3>
              <p style={{ fontSize: 14, color: colors.textSecondary }}>
                {selectedEmployeeId 
                  ? 'Este empleado no tiene citas programadas. Selecciona otro empleado o fecha.'
                  : 'Selecciona otra fecha o crea una nueva cita.'
                }
              </p>
            </div>
          ) : (
            <div style={{ 
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: 10,
              maxHeight: '600px',
              overflowY: 'auto',
              paddingRight: 8
            }}>
              {/* Grid de citas ordenadas por hora */}
              {paginatedAppointments.map((apt, index) => {
                  const startTime = new Date(apt.startTime);
                  const endTime = new Date(apt.endTime);
                  const isPast = endTime < new Date();
                  
                  return (
                    <div 
                      key={apt.id}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        padding: 12,
                        background: colors.cardBg,
                        borderRadius: 10,
                        border: `1px solid ${colors.border}`,
                        borderLeft: `3px solid ${apt.Service?.color || (() => {
                          // Solo usar color del técnico si la cita NO está terminada ni cancelada
                          const isTerminalStatus = ['done', 'cancelled'].includes(apt.status);
                          const techStatus = !isTerminalStatus && business?.hasFieldTechnicians && apt.technicianStatus && apt.technicianStatus !== 'not_started'
                            ? apt.technicianStatus 
                            : null;
                          return techStatus ? STATUS_LABELS[techStatus]?.color : STATUS_LABELS[apt.status]?.color;
                        })() || '#3b82f6'}`,
                        opacity: isPast && apt.status !== 'done' ? 0.7 : 1,
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {/* Header compacto: Hora + Cliente + Estado */}
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        gap: 10,
                        marginBottom: 8
                      }}>
                        {/* Hora */}
                        <div style={{ 
                          fontSize: 14, 
                          fontWeight: 800, 
                          color: colors.primary,
                          minWidth: 110
                        }}>
                          {formatTime(apt.startTime)} - {formatTime(apt.endTime)}
                        </div>
                        
                        {/* Cliente */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ 
                            fontSize: 14, 
                            fontWeight: 700, 
                            color: colors.text,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}>
                            {apt.clientName || 'Sin nombre'}
                          </div>
                          <div style={{ fontSize: 11, color: colors.textSecondary }}>
                            {apt.Service?.durationMin} min • {apt.Service?.name}
                          </div>
                        </div>
                        
                        {/* ✅ NUEVO: Componente StatusBadge */}
                        {(() => {
                          const isTerminalStatus = ['done', 'cancelled'].includes(apt.status);
                          const techStatus = !isTerminalStatus && business?.hasFieldTechnicians && apt.technicianStatus && apt.technicianStatus !== 'not_started'
                            ? apt.technicianStatus 
                            : null;
                          const displayStatus = techStatus || apt.status;
                          return <StatusBadge status={displayStatus} size="sm" showIcon={false} />;
                        })()}
                      </div>

                      {/* Info adicional en una línea */}
                      <div style={{ 
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        fontSize: 11,
                        color: colors.textSecondary,
                        marginBottom: 8
                      }}>
                        <span>👤 {apt.Employee?.User?.name?.split(' ')[0] || 'Sin asignar'}</span>
                        {!business?.hasFieldTechnicians && !business?.isTechnicalServices && (
                          <>
                            <span>•</span>
                            <span style={{ color: '#10b981', fontWeight: 600 }}>
                              {fmt(apt.finalPrice || apt.Service?.price)}
                            </span>
                          </>
                        )}
                      </div>

                      {/* Acciones */}
                      <div style={{ 
                        display: 'flex', 
                        gap: 8, 
                        flexWrap: 'wrap',
                        paddingTop: 8,
                        borderTop: `1px solid ${colors.border}`
                      }}>
                        {getRowActions(apt).map((action, i) => (
                          <button
                            key={i}
                            onClick={(e) => {
                              e.stopPropagation();
                              action.onClick();
                            }}
                            style={{
                              padding: '4px 8px',
                              fontSize: 11,
                              fontWeight: 500,
                              borderRadius: 4,
                              border: 'none',
                              cursor: 'pointer',
                              whiteSpace: 'nowrap',
                              background: action.color?.includes('danger') ? '#fee2e2' 
                                : action.color?.includes('primary') ? colors.primary + '20'
                                : action.color?.includes('success') ? '#d1fae5'
                                : colors.bgSecondary,
                              color: action.color?.includes('danger') ? '#dc2626'
                                : action.color?.includes('primary') ? colors.primary
                                : action.color?.includes('success') ? '#059669'
                                : colors.text
                            }}
                          >
                            {action.label.replace(/[📧🔧✏️🗑️⏱️💰🔄]/g, '').trim()}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
            </div>
          )}

          {/* Paginación */}
          {!loading && totalPages > 1 && (
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              gap: isMobile ? 6 : 12, 
              marginTop: isMobile ? 16 : 24,
              padding: isMobile ? 10 : 16,
              background: colors.cardBg,
              borderRadius: isMobile ? 8 : 12,
              border: `1px solid ${colors.border}`,
              flexWrap: 'wrap'
            }}>
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                style={{
                  padding: isMobile ? '6px 12px' : '10px 20px',
                  borderRadius: 6,
                  border: 'none',
                  background: currentPage === 1 ? colors.bgSecondary : colors.primary,
                  color: currentPage === 1 ? colors.textSecondary : 'white',
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                  fontSize: isMobile ? 12 : 14,
                  fontWeight: 600
                }}
              >
                {isMobile ? '←' : '← Anterior'}
              </button>
              
              <span style={{ 
                fontSize: isMobile ? 13 : 15, 
                color: colors.text,
                fontWeight: 600,
                minWidth: isMobile ? 80 : 120,
                textAlign: 'center'
              }}>
                {isMobile ? `${currentPage}/${totalPages}` : `Página ${currentPage} de ${totalPages}`}
              </span>
              
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                style={{
                  padding: isMobile ? '6px 12px' : '10px 20px',
                  borderRadius: 6,
                  border: 'none',
                  background: currentPage === totalPages ? colors.bgSecondary : colors.primary,
                  color: currentPage === totalPages ? colors.textSecondary : 'white',
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                  fontSize: isMobile ? 12 : 14,
                  fontWeight: 600
                }}
              >
                {isMobile ? '→' : 'Siguiente →'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ✅ NUEVO: Modal Cita Express extraído a componente */}
      <ExpressAppointmentModal
        isOpen={showExpressModal}
        form={expressForm}
        onFormChange={(field, value) => setExpressForm(prev => ({...prev, [field]: value}))}
        onSubmit={handleCreateExpress}
        onCancel={() => setShowExpressModal(false)}
        isCreating={creating}
        services={services}
        employees={employees}
        colors={colors}
      />

      {/* Modal para crear nueva cita */}
      {showCreateModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: colors.cardBg,
            borderRadius: '12px',
            padding: '24px',
            maxWidth: '500px',
            width: '90%',
            maxHeight: '80vh',
            overflowY: 'auto',
            border: `1px solid ${colors.border}`
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: colors.text }}>Crear Nueva Cita</h2>
              <button
                onClick={() => {
                  resetCreateForm();
                  setShowCreateModal(false);
                  setManualTime('');
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: colors.textSecondary
                }}
              >
                ×
              </button>
            </div>
            
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: 600, color: colors.text }}>Servicio *</label>
              <select
                value={createForm.serviceId}
                onChange={(e) => setCreateForm({...createForm, serviceId: e.target.value})}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: `1px solid ${colors.border}`,
                  borderRadius: '6px',
                  fontSize: '14px',
                  background: colors.inputBg,
                  color: colors.text
                }}
              >
                <option value="">Selecciona un servicio</option>
                {services.map(service => (
                  <option key={service.id} value={service.id}>
                    {service.name} - {fmt(service.price)}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: 600, color: colors.text }}>Empleado *</label>
              <select
                value={createForm.employeeId}
                onChange={(e) => setCreateForm({...createForm, employeeId: e.target.value, additionalEmployeeIds: []})}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: `1px solid ${colors.border}`,
                  borderRadius: '6px',
                  fontSize: '14px',
                  background: colors.inputBg,
                  color: colors.text
                }}
              >
                <option value="">Selecciona un empleado</option>
                {employees.map(employee => (
                  <option key={employee.id} value={employee.id}>
                    {employee.User?.name || employee.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Empleados adicionales para citas grupales */}
            {createForm.employeeId && employees.filter(e => e.id !== createForm.employeeId).length > 0 && (
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: colors.text }}>
                  🤝 Empleados adicionales (Cita Grupal)
                </label>
                <div style={{ fontSize: '12px', color: colors.textSecondary, marginBottom: '8px' }}>
                  Selecciona empleados adicionales que trabajarán en paralelo (ej: manos y pies simultáneos)
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {employees
                    .filter(emp => emp.id !== createForm.employeeId)
                    .map(employee => {
                      const isSelected = createForm.additionalEmployeeIds.includes(employee.id);
                      return (
                        <button
                          key={employee.id}
                          type="button"
                          onClick={() => {
                            const newIds = isSelected
                              ? createForm.additionalEmployeeIds.filter(id => id !== employee.id)
                              : [...createForm.additionalEmployeeIds, employee.id];
                            setCreateForm({...createForm, additionalEmployeeIds: newIds});
                          }}
                          style={{
                            padding: '8px 12px',
                            border: `2px solid ${isSelected ? '#10b981' : colors.border}`,
                            borderRadius: '20px',
                            background: isSelected ? '#d1fae5' : colors.inputBg,
                            color: isSelected ? '#065f46' : colors.text,
                            cursor: 'pointer',
                            fontSize: '13px',
                            fontWeight: '500',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}
                        >
                          {isSelected ? '✓' : '+'} {employee.User?.name || employee.name}
                        </button>
                      );
                    })}
                </div>
                {createForm.additionalEmployeeIds.length > 0 && (
                  <div style={{ marginTop: '8px', fontSize: '12px', color: '#059669' }}>
                    ✓ {createForm.additionalEmployeeIds.length} empleado(s) adicional(es) seleccionado(s)
                  </div>
                )}
              </div>
            )}

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '14px', color: colors.text }}>
                📅 Fecha de la cita *
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="date"
                  value={selectedDateModal}
                  onChange={(e) => {
                    const newDate = e.target.value;
                    setSelectedDateModal(newDate);
                    setCreateForm({...createForm, startTime: ''});
                    setAvailableSlots([]);
                  }}
                  style={{
                    width: '100%',
                    padding: '15px 12px',
                    border: `2px solid ${colors.border}`,
                    borderRadius: '10px',
                    fontSize: '16px',
                    backgroundColor: colors.inputBg,
                    color: colors.text,
                    cursor: 'pointer',
                    appearance: 'none',
                    WebkitAppearance: 'none',
                    MozAppearance: 'none',
                    boxShadow: `0 2px 8px ${colors.shadow}`
                  }}
                  onClick={(e) => {
                    try {
                      e.target.showPicker?.();
                    } catch (err) {
                    }
                  }}
                />
                <div style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  pointerEvents: 'none',
                  color: colors.textSecondary,
                  fontSize: '20px'
                }}>
                  📅
                </div>
              </div>
            </div>

            {selectedDateModal && createForm.employeeId && createForm.serviceId && (
              <div style={{ marginBottom: '16px' }}>
                {isPastDate(selectedDateModal) ? (
                  // Input manual para fechas pasadas
                  <>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '14px', color: colors.text }}>
                      ⏰ Hora de la cita (retrospectiva)
                    </label>
                    <input
                      type="time"
                      value={manualTime}
                      onChange={(e) => {
                        setManualTime(e.target.value);
                        if (e.target.value) {
                          setCreateForm({...createForm, startTime: `${selectedDateModal}T${e.target.value}`});
                        }
                      }}
                      style={{
                        width: '100%',
                        padding: '15px 12px',
                        border: `2px solid ${colors.border}`,
                        borderRadius: '10px',
                        fontSize: '16px',
                        backgroundColor: colors.inputBg,
                        color: colors.text,
                        cursor: 'pointer'
                      }}
                    />
                    <div style={{ fontSize: '12px', color: colors.textSecondary, marginTop: '8px' }}>
                      ⚠️ Fecha pasada: selecciona manualmente la hora que tuvo la cita
                    </div>
                  </>
                ) : (
                  // Slots del backend para fechas futuras
                  <>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '14px', color: colors.text }}>
                      ⏰ Horarios disponibles
                    </label>
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', 
                      gap: '8px',
                      maxHeight: '180px',
                      overflowY: 'auto',
                      border: `2px solid ${colors.border}`,
                      borderRadius: '10px',
                      padding: '16px',
                      backgroundColor: colors.bgSecondary
                    }}>
                      {availableSlots.length > 0 ? (
                        availableSlots.map((slot, index) => (
                          <button
                            key={`${slot.time}-${index}`}
                            type="button"
                            onClick={() => {
                              setCreateForm({...createForm, startTime: slot.startTime});
                            }}
                            style={{
                              padding: '14px 10px',
                              border: `2px solid ${colors.border}`,
                              borderRadius: '8px',
                              background: createForm.startTime === slot.startTime ? '#10b981' : colors.inputBg,
                              color: createForm.startTime === slot.startTime ? '#ffffff' : colors.text,
                              cursor: 'pointer',
                              fontSize: '14px',
                              fontWeight: '600',
                              transition: 'all 0.2s ease',
                              boxShadow: createForm.startTime === slot.startTime 
                                ? '0 4px 6px rgba(16, 185, 129, 0.3)' 
                                : `0 2px 4px ${colors.shadow}`,
                              transform: createForm.startTime === slot.startTime ? 'scale(1.05)' : 'scale(1)'
                            }}
                          >
                            🕐 {slot.time}
                          </button>
                        ))
                      ) : (
                        <div style={{ 
                          gridColumn: '1 / -1', 
                          textAlign: 'center', 
                          color: colors.textSecondary,
                          padding: '30px 20px',
                          fontSize: '16px',
                          backgroundColor: colors.warning,
                          borderRadius: '8px',
                          border: `2px dashed ${colors.warning}`
                        }}>
                          {selectedDateModal && createForm.employeeId && createForm.serviceId 
                            ? '🔄 Cargando horarios...' 
                            : '📋 Selecciona todos los campos arriba'
                          }
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: 600, color: colors.text }}>Cliente *</label>
              <input
                type="text"
                value={createForm.clientName}
                onChange={(e) => setCreateForm({...createForm, clientName: e.target.value})}
                placeholder="Nombre del cliente"
                style={{
                  width: '100%',
                  padding: '10px',
                  border: `1px solid ${colors.border}`,
                  borderRadius: '6px',
                  fontSize: '14px',
                  background: colors.inputBg,
                  color: colors.text
                }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: 600, color: colors.text }}>Email</label>
              <input
                type="email"
                value={createForm.clientEmail}
                onChange={(e) => setCreateForm({...createForm, clientEmail: e.target.value})}
                placeholder="email@ejemplo.com"
                style={{
                  width: '100%',
                  padding: '10px',
                  border: `1px solid ${colors.border}`,
                  borderRadius: '6px',
                  fontSize: '14px',
                  background: colors.inputBg,
                  color: colors.text
                }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: 600, color: colors.text }}>Teléfono</label>
              <input
                type="tel"
                value={createForm.clientPhone}
                onChange={(e) => setCreateForm({...createForm, clientPhone: e.target.value})}
                placeholder="+57 300 000 0000"
                style={{
                  width: '100%',
                  padding: '10px',
                  border: `1px solid ${colors.border}`,
                  borderRadius: '6px',
                  fontSize: '14px',
                  background: colors.inputBg,
                  color: colors.text
                }}
              />
            </div>

            {/* Campo de dirección solo para negocios con técnicos a domicilio */}
            {business?.hasFieldTechnicians && (
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: 600, color: colors.text }}>
                  📍 Dirección *
                </label>
                <input
                  type="text"
                  value={createForm.address}
                  onChange={(e) => setCreateForm({...createForm, address: e.target.value})}
                  placeholder="Calle 123 # 45-67, Barrio, Ciudad"
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: `1px solid ${colors.border}`,
                    borderRadius: '6px',
                    fontSize: '14px',
                    background: colors.inputBg,
                    color: colors.text
                  }}
                />
                <div style={{ fontSize: '12px', color: colors.textSecondary, marginTop: '4px' }}>
                  Dirección completa donde el técnico prestará el servicio
                </div>
              </div>
            )}

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: 600, color: colors.text }}>Notas</label>
              <textarea
                value={createForm.notes}
                onChange={(e) => setCreateForm({...createForm, notes: e.target.value})}
                placeholder="Notas adicionales..."
                rows={3}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: `1px solid ${colors.border}`,
                  borderRadius: '6px',
                  fontSize: '14px',
                  background: colors.inputBg,
                  color: colors.text,
                  resize: 'vertical'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  resetCreateForm();
                  setShowCreateModal(false);
                }}
                style={{
                  background: colors.bgTertiary,
                  color: colors.text,
                  border: `1px solid ${colors.border}`,
                  borderRadius: '6px',
                  padding: '10px 20px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateAppointment}
                disabled={creating}
                style={{
                  background: creating ? colors.bgTertiary : '#10b981',
                  color: creating ? colors.text : 'white',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '10px 20px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: creating ? 'not-allowed' : 'pointer'
                }}
              >
                {creating ? 'Creando...' : 'Crear Cita'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ NUEVO: Modal de completar cita extraído a componente */}
      <CompleteAppointmentModal
        isOpen={showCompleteModal && !!completeAppointmentData}
        appointment={completeAppointmentData}
        paymentMethod={paymentMethod}
        onPaymentMethodChange={setPaymentMethod}
        onComplete={handleCompleteAppointment}
        onCancel={() => setShowCompleteModal(false)}
        isCompleting={completing}
        colors={colors}
      />

      {/* Modal para agregar cargo adicional */}
      {showAdditionalChargeModal && selectedAppointment && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: colors.cardBg,
            borderRadius: '12px',
            padding: '24px',
            maxWidth: '400px',
            width: '90%',
            border: `1px solid ${colors.border}`
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: colors.text }}>
                💰 {selectedAppointment.additionalAmount ? 'Editar' : 'Agregar'} Cargo Adicional
              </h2>
              <button
                onClick={() => {
                  setShowAdditionalChargeModal(false);
                  setSelectedAppointment(null);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: colors.textSecondary
                }}
              >
                ×
              </button>
            </div>

            <div style={{ marginBottom: '12px', padding: '12px', background: colors.bgSecondary, borderRadius: '8px' }}>
              <p style={{ margin: 0, fontSize: '13px', color: colors.textSecondary }}>
                Cita: <strong style={{ color: colors.text }}>{selectedAppointment.Service?.name}</strong>
              </p>
              <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: colors.textSecondary }}>
                Cliente: <strong style={{ color: colors.text }}>{selectedAppointment.clientName}</strong>
              </p>
              <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: colors.textSecondary }}>
                Precio base: <strong style={{ color: colors.text }}>{fmt(selectedAppointment.Service?.price)}</strong>
              </p>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: 600, color: colors.text }}>
                Monto Adicional ($)
              </label>
              <input
                type="number"
                value={additionalChargeForm.additionalAmount}
                onChange={(e) => setAdditionalChargeForm({...additionalChargeForm, additionalAmount: e.target.value})}
                placeholder="Ej: 10000"
                style={{
                  width: '100%',
                  padding: '10px',
                  border: `1px solid ${colors.border}`,
                  borderRadius: '6px',
                  fontSize: '14px',
                  background: colors.inputBg,
                  color: colors.text
                }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: 600, color: colors.text }}>
                Descripción (opcional)
              </label>
              <input
                type="text"
                value={additionalChargeForm.additionalNote}
                onChange={(e) => setAdditionalChargeForm({...additionalChargeForm, additionalNote: e.target.value})}
                placeholder="Ej: Figura complicada, diseño extra..."
                style={{
                  width: '100%',
                  padding: '10px',
                  border: `1px solid ${colors.border}`,
                  borderRadius: '6px',
                  fontSize: '14px',
                  background: colors.inputBg,
                  color: colors.text
                }}
              />
            </div>

            {additionalChargeForm.additionalAmount > 0 && (
              <div style={{ 
                marginBottom: '16px', 
                padding: '12px', 
                background: '#d1fae5', 
                borderRadius: '8px',
                border: '1px solid #10b981'
              }}>
                <p style={{ margin: 0, fontSize: '13px', color: '#065f46', fontWeight: 600 }}>
                  Total a pagar: {fmt((selectedAppointment.Service?.price || 0) + parseFloat(additionalChargeForm.additionalAmount || 0))}
                </p>
                <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#065f46' }}>
                  Base: {fmt(selectedAppointment.Service?.price)} + Adicional: {fmt(parseFloat(additionalChargeForm.additionalAmount || 0))}
                </p>
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setShowAdditionalChargeModal(false);
                  setSelectedAppointment(null);
                }}
                style={{
                  background: colors.bgTertiary,
                  color: colors.text,
                  border: `1px solid ${colors.border}`,
                  borderRadius: '6px',
                  padding: '10px 20px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveAdditionalCharge}
                disabled={savingAdditionalCharge}
                style={{
                  background: savingAdditionalCharge ? colors.bgTertiary : '#f59e0b',
                  color: savingAdditionalCharge ? colors.text : 'white',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '10px 20px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: savingAdditionalCharge ? 'not-allowed' : 'pointer'
                }}
              >
                {savingAdditionalCharge ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para transferir cita */}
      {showTransferModal && selectedTransferAppointment && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: colors.cardBg,
            borderRadius: '12px',
            padding: '24px',
            maxWidth: '400px',
            width: '90%',
            border: `1px solid ${colors.border}`
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: colors.text }}>
                🔄 Reasignar
              </h2>
              <button
                onClick={() => {
                  setShowTransferModal(false);
                  setSelectedTransferAppointment(null);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: colors.textSecondary
                }}
              >
                ×
              </button>
            </div>

            <div style={{ marginBottom: '16px', padding: '12px', background: colors.bgSecondary, borderRadius: '8px' }}>
              <p style={{ margin: 0, fontSize: '13px', color: colors.textSecondary }}>
                <strong style={{ color: colors.text }}>Servicio:</strong> {selectedTransferAppointment.Service?.name}
              </p>
              <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: colors.textSecondary }}>
                <strong style={{ color: colors.text }}>Cliente:</strong> {selectedTransferAppointment.clientName}
              </p>
              <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: colors.textSecondary }}>
                <strong style={{ color: colors.text }}>Hora:</strong> {formatTime(selectedTransferAppointment.startTime)}
              </p>
              <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: colors.textSecondary }}>
                <strong style={{ color: colors.text }}>Empleado actual:</strong> {selectedTransferAppointment.Employee?.User?.name}
              </p>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: colors.text }}>
                Transferir a:
              </label>
              <select
                value={transferEmployeeId}
                onChange={(e) => {
                  setTransferEmployeeId(e.target.value);
                  setTransferSelectedSlot('');
                }}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: `1px solid ${colors.border}`,
                  borderRadius: '6px',
                  fontSize: '14px',
                  background: colors.inputBg,
                  color: colors.text
                }}
              >
                <option value="">Selecciona un empleado</option>
                {employees
                  .filter(emp => emp.id !== selectedTransferAppointment.employeeId)
                  .map(employee => (
                    <option key={employee.id} value={employee.id}>
                      {employee.User?.name || employee.name}
                    </option>
                  ))
                }
              </select>
              <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: colors.textSecondary }}>
                Solo se muestran empleados disponibles a esta hora
              </p>
            </div>

            {/* Mostrar horarios disponibles del empleado destino */}
            {transferEmployeeId && transferAvailableSlots.length > 0 && (
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: colors.text }}>
                  {transferConflictError ? 'Selecciona un nuevo horario:' : 'Opcional: Cambiar horario (si no está libre a esta hora)'}
                </label>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', 
                  gap: '8px',
                  maxHeight: '150px',
                  overflowY: 'auto',
                  border: `1px solid ${colors.border}`,
                  borderRadius: '8px',
                  padding: '10px'
                }}>
                  {transferAvailableSlots.map((slot) => (
                    <button
                      key={slot.time}
                      type="button"
                      onClick={() => setTransferSelectedSlot(slot.time)}
                      style={{
                        padding: '8px',
                        border: `2px solid ${transferSelectedSlot === slot.time ? '#6366f1' : colors.border}`,
                        borderRadius: '6px',
                        background: transferSelectedSlot === slot.time ? '#6366f1' : colors.inputBg,
                        color: transferSelectedSlot === slot.time ? 'white' : colors.text,
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: '600'
                      }}
                    >
                      {slot.time}
                    </button>
                  ))}
                </div>
                {transferSelectedSlot && (
                  <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: '#10b981' }}>
                    ✓ Nueva hora: {transferSelectedSlot}
                  </p>
                )}
              </div>
            )}

            {transferConflictError && (
              <div style={{ 
                marginBottom: '16px', 
                padding: '12px', 
                background: '#fef2f2', 
                borderRadius: '8px',
                border: '1px solid #ef4444'
              }}>
                <p style={{ margin: 0, fontSize: '13px', color: '#dc2626' }}>
                  <strong>⚠️ Conflicto:</strong> {transferConflictError.message}
                </p>
                <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#7f1d1d' }}>
                  Selecciona un horario diferente arriba para transferir.
                </p>
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setShowTransferModal(false);
                  setSelectedTransferAppointment(null);
                }}
                style={{
                  background: colors.bgTertiary,
                  color: colors.text,
                  border: `1px solid ${colors.border}`,
                  borderRadius: '6px',
                  padding: '10px 20px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleTransferAppointment}
                disabled={transferring || !transferEmployeeId}
                style={{
                  background: transferring || !transferEmployeeId ? colors.bgTertiary : '#6366f1',
                  color: transferring || !transferEmployeeId ? colors.text : 'white',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '10px 20px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: transferring || !transferEmployeeId ? 'not-allowed' : 'pointer'
                }}
              >
                {transferring ? 'Transfiriendo...' : 'Transferir'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para extender tiempo */}
      {showExtendModal && extendingAppointment && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div style={{
            background: colors.cardBg, borderRadius: '12px', padding: '24px',
            maxWidth: '400px', width: '90%', border: `1px solid ${colors.border}`
          }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, color: colors.text }}>
              ⏱️ Extender Tiempo
            </h2>
            <p style={{ fontSize: 14, color: colors.textSecondary, marginBottom: 20 }}>
              Cliente: <strong>{extendingAppointment.clientName}</strong>
            </p>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: colors.text }}>
                Minutos adicionales
              </label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {[5, 10, 15, 20, 30].map(min => (
                  <button
                    key={min}
                    type="button"
                    onClick={() => setExtendMinutes(min)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: 8,
                      border: extendMinutes === min ? '2px solid #f97316' : `1px solid ${colors.border}`,
                      background: extendMinutes === min ? '#fff7ed' : colors.inputBg,
                      color: extendMinutes === min ? '#f97316' : colors.text,
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    +{min} min
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button 
                onClick={() => { setShowExtendModal(false); setExtendingAppointment(null); }} 
                style={{ flex: 1, padding: '10px', borderRadius: 8, border: `1px solid ${colors.border}`, background: 'none', color: colors.text }}
              >
                Cancelar
              </button>
              <button 
                onClick={handleExtendTimeRequest} 
                disabled={savingExtend}
                style={{ flex: 1, padding: '10px', borderRadius: 8, border: 'none', background: '#f97316', color: 'white', fontWeight: 700, opacity: savingExtend ? 0.7 : 1 }}
              >
                {savingExtend ? 'Guardando...' : 'Extender'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación para extender tiempo */}
      {showExtendConfirm && extendingAppointment && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0, 0, 0, 0.4)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', zIndex: 3500
        }}>
          <div style={{
            background: colors.cardBg, borderRadius: '16px', padding: '28px',
            maxWidth: '380px', width: '90%', textAlign: 'center',
            border: `1px solid ${colors.border}`,
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{
              width: 56, height: 56, borderRadius: '50%',
              background: '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px'
            }}>
              <Timer size={28} color="#f97316" />
            </div>
            
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, color: colors.text }}>
              ¿Extender tiempo?
            </h3>
            
            <p style={{ fontSize: 14, color: colors.textSecondary, marginBottom: 8 }}>
              Cliente: <strong>{extendingAppointment.clientName}</strong>
            </p>
            
            <p style={{ fontSize: 16, color: '#f97316', fontWeight: 700, marginBottom: 20 }}>
              +{extendMinutes} minutos
            </p>

            <div style={{ display: 'flex', gap: 12 }}>
              <button 
                onClick={() => setShowExtendConfirm(false)} 
                style={{ 
                  flex: 1, padding: '12px', borderRadius: 10, 
                  border: `1px solid ${colors.border}`, 
                  background: 'none', 
                  color: colors.text,
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                No, volver
              </button>
              <button 
                onClick={handleConfirmExtend} 
                disabled={savingExtend}
                style={{ 
                  flex: 1, padding: '12px', borderRadius: 10, 
                  border: 'none', 
                  background: '#f97316', 
                  color: 'white', 
                  fontWeight: 700, 
                  cursor: savingExtend ? 'not-allowed' : 'pointer',
                  opacity: savingExtend ? 0.7 : 1
                }}
              >
                {savingExtend ? 'Guardando...' : 'Sí, extender'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para editar cita */}
      {showEditModal && editingAppointment && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div style={{
            background: colors.cardBg, borderRadius: '12px', padding: '24px',
            maxWidth: '500px', width: '90%', maxHeight: '80vh', overflowY: 'auto',
            border: `1px solid ${colors.border}`
          }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20, color: colors.text }}>
              ✏️ Editar Cita
            </h2>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: 600, color: colors.text }}>Servicio</label>
              <select
                value={editForm.serviceId}
                onChange={(e) => setEditForm({...editForm, serviceId: e.target.value})}
                style={{ width: '100%', padding: '10px', borderRadius: 8, border: `1px solid ${colors.border}`, background: colors.inputBg, color: colors.text }}
              >
                <option value="">Selecciona servicio</option>
                {services.map(s => <option key={s.id} value={s.id}>{s.name} ({s.durationMin} min)</option>)}
              </select>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: 600, color: colors.text }}>Profesional</label>
              <select
                value={editForm.employeeId}
                onChange={(e) => setEditForm({...editForm, employeeId: e.target.value})}
                style={{ width: '100%', padding: '10px', borderRadius: 8, border: `1px solid ${colors.border}`, background: colors.inputBg, color: colors.text }}
              >
                <option value="">Selecciona profesional</option>
                {employees.map(e => <option key={e.id} value={e.id}>{e.User?.name}</option>)}
              </select>
            </div>

            {/* Selector de fecha */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: 600, color: colors.text }}>Fecha</label>
              <input
                type="date"
                value={editForm.selectedDate}
                onChange={(e) => {
                  setEditForm({...editForm, selectedDate: e.target.value, startTime: ''});
                  setEditAvailableSlots([]);
                }}
                style={{ width: '100%', padding: '10px', borderRadius: 8, border: `1px solid ${colors.border}`, background: colors.inputBg, color: colors.text }}
              />
            </div>

            {/* Horarios disponibles */}
            {editForm.employeeId && editForm.serviceId && editForm.selectedDate && (
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: colors.text }}>
                  Horarios disponibles
                </label>
                {editAvailableSlots.length === 0 ? (
                  <div style={{ 
                    padding: '12px', 
                    background: colors.bgSecondary, 
                    borderRadius: 8, 
                    color: colors.textSecondary,
                    fontSize: 14,
                    textAlign: 'center'
                  }}>
                    {editForm.employeeId && editForm.serviceId 
                      ? '📋 Selecciona fecha arriba para ver horarios'
                      : '⏳ Cargando horarios...'
                    }
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {editAvailableSlots.map((slot) => (
                      <button
                        key={slot.time}
                        type="button"
                        onClick={() => setEditForm({...editForm, startTime: `${editForm.selectedDate}T${slot.time}`})}
                        style={{
                          padding: '8px 14px',
                          borderRadius: 8,
                          border: editForm.startTime === `${editForm.selectedDate}T${slot.time}` 
                            ? '2px solid #3b82f6' 
                            : `1px solid ${colors.border}`,
                          background: editForm.startTime === `${editForm.selectedDate}T${slot.time}` 
                            ? '#eff6ff' 
                            : colors.inputBg,
                          color: editForm.startTime === `${editForm.selectedDate}T${slot.time}` 
                            ? '#3b82f6' 
                            : colors.text,
                          fontWeight: editForm.startTime === `${editForm.selectedDate}T${slot.time}` ? 700 : 500,
                          cursor: 'pointer',
                          fontSize: 13
                        }}
                      >
                        {slot.time}
                      </button>
                    ))}
                  </div>
                )}
                
                {/* Mostrar horario actual seleccionado */}
                {editForm.startTime && (
                  <div style={{ 
                    marginTop: 12, 
                    padding: '10px 14px', 
                    background: '#ecfdf5', 
                    borderRadius: 8,
                    border: '1px solid #a7f3d0',
                    fontSize: 14,
                    color: '#065f46'
                  }}>
                    <strong>Horario seleccionado:</strong> {new Date(editForm.startTime).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', hour12: true })}
                  </div>
                )}
              </div>
            )}

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: 600, color: colors.text }}>Nombre del Cliente</label>
              <input
                type="text"
                value={editForm.clientName}
                onChange={(e) => setEditForm({...editForm, clientName: e.target.value})}
                style={{ width: '100%', padding: '10px', borderRadius: 8, border: `1px solid ${colors.border}`, background: colors.inputBg, color: colors.text }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: 600, color: colors.text }}>Teléfono</label>
              <input
                type="tel"
                value={editForm.clientPhone}
                onChange={(e) => setEditForm({...editForm, clientPhone: e.target.value})}
                style={{ width: '100%', padding: '10px', borderRadius: 8, border: `1px solid ${colors.border}`, background: colors.inputBg, color: colors.text }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: 600, color: colors.text }}>Email</label>
              <input
                type="email"
                value={editForm.clientEmail}
                onChange={(e) => setEditForm({...editForm, clientEmail: e.target.value})}
                style={{ width: '100%', padding: '10px', borderRadius: 8, border: `1px solid ${colors.border}`, background: colors.inputBg, color: colors.text }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: 600, color: colors.text }}>Notas</label>
              <textarea
                value={editForm.notes}
                onChange={(e) => setEditForm({...editForm, notes: e.target.value})}
                rows={3}
                style={{ width: '100%', padding: '10px', borderRadius: 8, border: `1px solid ${colors.border}`, background: colors.inputBg, color: colors.text, resize: 'vertical' }}
              />
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button 
                onClick={() => { setShowEditModal(false); setEditingAppointment(null); }} 
                style={{ flex: 1, padding: '10px', borderRadius: 8, border: `1px solid ${colors.border}`, background: 'none', color: colors.text }}
              >
                Cancelar
              </button>
              <button 
                onClick={handleSaveEdit} 
                disabled={savingEdit}
                style={{ flex: 1, padding: '10px', borderRadius: 8, border: 'none', background: '#6366f1', color: 'white', fontWeight: 700, opacity: savingEdit ? 0.7 : 1 }}
              >
                {savingEdit ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Notas */}
      {showNotesModal && notesAppointment && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div style={{
            background: colors.cardBg, borderRadius: '12px', padding: '24px',
            maxWidth: '500px', width: '90%', maxHeight: '70vh', overflowY: 'auto',
            border: `1px solid ${colors.border}`
          }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, color: colors.text }}>
              📝 Notas de la Cita
            </h2>
            <p style={{ fontSize: 14, color: colors.textSecondary, marginBottom: 16 }}>
              Cliente: <strong>{notesAppointment.clientName}</strong> • Servicio: {notesAppointment.Service?.name}
            </p>

            {/* Lista de notas */}
            <div style={{ marginBottom: 20, maxHeight: 250, overflowY: 'auto' }}>
              {loadingNotes ? (
                <div style={{ textAlign: 'center', padding: 20, color: colors.textSecondary }}>Cargando...</div>
              ) : notes.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 20, color: colors.textSecondary, fontStyle: 'italic' }}>
                  No hay notas registradas
                </div>
              ) : (
                notes.map((note) => (
                  <div key={note.id} style={{
                    background: colors.bgSecondary,
                    padding: 12,
                    borderRadius: 8,
                    marginBottom: 8,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: 8
                  }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: 0, fontSize: 14, color: colors.text, whiteSpace: 'pre-wrap' }}>{note.content}</p>
                      <div style={{ marginTop: 6, fontSize: 11, color: colors.textMuted }}>
                        Por {note.authorName || 'Sistema'} • {new Date(note.createdAt).toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' })}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteNoteRequest(note.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#ef4444',
                        cursor: 'pointer',
                        padding: 4,
                        fontSize: 12
                      }}
                      title="Eliminar nota"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Agregar nueva nota */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: colors.text }}>
                Agregar nueva nota
              </label>
              <textarea
                value={newNoteContent}
                onChange={(e) => setNewNoteContent(e.target.value)}
                placeholder="Escribe una nota..."
                rows={3}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: 8,
                  border: `1px solid ${colors.border}`,
                  background: colors.inputBg,
                  color: colors.text,
                  resize: 'vertical'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button 
                onClick={() => { setShowNotesModal(false); setNotesAppointment(null); setNotes([]); }} 
                style={{ flex: 1, padding: '10px', borderRadius: 8, border: `1px solid ${colors.border}`, background: 'none', color: colors.text }}
              >
                Cerrar
              </button>
              <button 
                onClick={handleAddNote} 
                disabled={savingNote || !newNoteContent.trim()}
                style={{ flex: 1, padding: '10px', borderRadius: 8, border: 'none', background: '#14b8a6', color: 'white', fontWeight: 700, opacity: (savingNote || !newNoteContent.trim()) ? 0.7 : 1 }}
              >
                {savingNote ? 'Guardando...' : 'Agregar Nota'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación para cancelar cita */}
      {showCancelConfirm && cancellingAppointment && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0, 0, 0, 0.4)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div style={{
            background: colors.cardBg, borderRadius: '16px', padding: '28px',
            maxWidth: '380px', width: '90%', textAlign: 'center',
            border: `1px solid ${colors.border}`,
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{
              width: 56, height: 56, borderRadius: '50%',
              background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px'
            }}>
              <Trash2 size={28} color="#ef4444" />
            </div>
            
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, color: colors.text }}>
              ¿Cancelar esta cita?
            </h3>
            
            <p style={{ fontSize: 14, color: colors.textSecondary, marginBottom: 24, lineHeight: 1.5 }}>
              <strong>{cancellingAppointment.clientName}</strong><br/>
              {cancellingAppointment.Service?.name}<br/>
              {new Date(cancellingAppointment.startTime).toLocaleString('es-CO', { 
                dateStyle: 'short', 
                timeStyle: 'short',
                timeZone: 'America/Bogota'
              })}
            </p>

            <p style={{ fontSize: 13, color: '#92400e', background: '#fef3c7', padding: '10px 14px', borderRadius: 8, marginBottom: 20 }}>
              Esta acción no se puede deshacer
            </p>

            <div style={{ display: 'flex', gap: 12 }}>
              <button 
                onClick={() => { setShowCancelConfirm(false); setCancellingAppointment(null); }} 
                style={{ 
                  flex: 1, padding: '12px', borderRadius: 10, 
                  border: `1px solid ${colors.border}`, 
                  background: 'none', 
                  color: colors.text,
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                No, mantener
              </button>
              <button 
                onClick={handleConfirmCancel} 
                disabled={cancelling}
                style={{ 
                  flex: 1, padding: '12px', borderRadius: 10, 
                  border: 'none', 
                  background: '#ef4444', 
                  color: 'white', 
                  fontWeight: 700, 
                  cursor: cancelling ? 'not-allowed' : 'pointer',
                  opacity: cancelling ? 0.7 : 1
                }}
              >
                {cancelling ? 'Cancelando...' : 'Sí, cancelar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Confirmar eliminación de nota */}
      {showDeleteNoteConfirm && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', zIndex: 1000,
          padding: 20
        }} onClick={() => setShowDeleteNoteConfirm(false)}>
          <div style={{
            background: colors.cardBg, borderRadius: '16px', padding: '24px',
            maxWidth: '400px', width: '100%',
            border: `1px solid ${colors.border}`
          }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12, textAlign: 'center' }}>
              ¿Eliminar esta nota?
            </h3>
            <p style={{ fontSize: 14, color: colors.textSecondary, marginBottom: 24, textAlign: 'center' }}>
              Esta acción no se puede deshacer.
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button 
                onClick={() => setShowDeleteNoteConfirm(false)} 
                style={{ 
                  flex: 1, padding: '12px', borderRadius: 10, 
                  border: `1px solid ${colors.border}`, 
                  background: 'none', 
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Cancelar
              </button>
              <button 
                onClick={handleConfirmDeleteNote} 
                style={{ 
                  flex: 1, padding: '12px', borderRadius: 10, 
                  border: 'none', 
                  background: '#ef4444', 
                  color: 'white', 
                  fontWeight: 700, 
                  cursor: 'pointer'
                }}
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Confirmar envío de comprobante */}
      {showSendReceiptConfirm && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', zIndex: 1000,
          padding: 20
        }} onClick={() => setShowSendReceiptConfirm(false)}>
          <div style={{
            background: colors.cardBg, borderRadius: '16px', padding: '24px',
            maxWidth: '400px', width: '100%',
            border: `1px solid ${colors.border}`
          }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12, textAlign: 'center' }}>
              ¿Enviar comprobante de pago?
            </h3>
            <p style={{ fontSize: 14, color: colors.textSecondary, marginBottom: 24, textAlign: 'center' }}>
              Se enviará el comprobante por correo electrónico al cliente.
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button 
                onClick={() => setShowSendReceiptConfirm(false)} 
                style={{ 
                  flex: 1, padding: '12px', borderRadius: 10, 
                  border: `1px solid ${colors.border}`, 
                  background: 'none', 
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Cancelar
              </button>
              <button 
                onClick={handleConfirmSendReceipt} 
                disabled={sendingReceipt}
                style={{ 
                  flex: 1, padding: '12px', borderRadius: 10, 
                  border: 'none', 
                  background: '#0ea5e9', 
                  color: 'white', 
                  fontWeight: 700, 
                  cursor: sendingReceipt ? 'not-allowed' : 'pointer',
                  opacity: sendingReceipt ? 0.7 : 1
                }}
              >
                {sendingReceipt ? 'Enviando...' : 'Enviar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Insumos para Técnicos de Campo */}
      {showInsumosModal && insumosAppointment && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', zIndex: 1000,
          padding: 20
        }}>
          <div style={{
            background: colors.cardBg, borderRadius: '16px', padding: '24px',
            maxWidth: '500px', width: '100%', maxHeight: '80vh',
            overflowY: 'auto',
            border: `1px solid ${colors.border}`
          }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Package size={24} color={colors.primary} />
              Iniciar Trabajo - Registrar Insumos
            </h2>
            
            <div style={{ fontSize: 14, color: colors.textSecondary, marginBottom: 20 }}>
              Cliente: <strong>{insumosAppointment.clientName}</strong> • {' '}
              Servicio: <strong>{insumosAppointment.Service?.name}</strong>
            </div>

            {/* Lista de insumos disponibles */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, display: 'block' }}>
                Seleccionar Insumos Usados:
              </label>
              
              {loadingInventory ? (
                <div style={{ textAlign: 'center', padding: 20 }}>
                  <div className="spinner" />
                  <p style={{ fontSize: 12, color: colors.textSecondary, marginTop: 8 }}>
                    Cargando insumos...
                  </p>
                </div>
              ) : inventoryItems.length === 0 ? (
                <div style={{ 
                  padding: 16, 
                  background: colors.bgSecondary, 
                  borderRadius: 8,
                  fontSize: 13,
                  color: colors.textSecondary
                }}>
                  No hay insumos registrados en el inventario.{' '}
                  <a href="/admin/inventory" style={{ color: colors.primary }}>
                    Ir a Inventario →
                  </a>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {inventoryItems.map(item => (
                    <div 
                      key={item.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        padding: 12,
                        background: colors.bgSecondary,
                        borderRadius: 8,
                        border: `1px solid ${colors.border}`
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={selectedInsumos.some(i => i.itemId === item.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            handleAddInsumo(item.id, 1);
                          } else {
                            handleRemoveInsumo(item.id);
                          }
                        }}
                        style={{ width: 18, height: 18 }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 14, fontWeight: 600 }}>{item.name}</div>
                        <div style={{ fontSize: 12, color: colors.textSecondary }}>
                          Stock: {item.currentStock} {item.unit} • {' '}
                          Costo: {fmt(item.costPerUnit)}/{item.unit}
                        </div>
                      </div>
                      {selectedInsumos.some(i => i.itemId === item.id) && (
                        <input
                          type="number"
                          min="0.1"
                          step="0.1"
                          value={selectedInsumos.find(i => i.itemId === item.id)?.quantity || 1}
                          onChange={(e) => handleAddInsumo(item.id, e.target.value)}
                          style={{
                            width: 70,
                            padding: '6px 8px',
                            borderRadius: 6,
                            border: `1px solid ${colors.border}`,
                            fontSize: 14,
                            textAlign: 'center'
                          }}
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Resumen de insumos seleccionados */}
            {selectedInsumos.length > 0 && (
              <div style={{ 
                marginBottom: 20, 
                padding: 12, 
                background: '#f0fdf4', 
                borderRadius: 8,
                border: '1px solid #86efac'
              }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#166534', marginBottom: 6 }}>
                  📦 Insumos seleccionados ({selectedInsumos.length}):
                </div>
                <div style={{ fontSize: 12, color: '#166534' }}>
                  {selectedInsumos.map(i => `${i.name}: ${i.quantity} ${i.unit}`).join(', ')}
                </div>
              </div>
            )}

            {/* Diagnóstico */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, display: 'block' }}>
                🔍 Diagnóstico:
              </label>
              <textarea
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                placeholder="Describe el problema o diagnóstico técnico encontrado"
                rows={3}
                style={{
                  width: '100%',
                  padding: 12,
                  borderRadius: 8,
                  border: `1px solid ${colors.border}`,
                  fontSize: 14,
                  resize: 'vertical'
                }}
              />
            </div>

            {/* Solución */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, display: 'block' }}>
                🔧 Solución Aplicada:
              </label>
              <textarea
                value={solution}
                onChange={(e) => setSolution(e.target.value)}
                placeholder="Describe la solución o reparación realizada"
                rows={3}
                style={{
                  width: '100%',
                  padding: 12,
                  borderRadius: 8,
                  border: `1px solid ${colors.border}`,
                  fontSize: 14,
                  resize: 'vertical'
                }}
              />
            </div>

            {/* Recomendaciones */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, display: 'block' }}>
                💡 Recomendaciones:
              </label>
              <textarea
                value={recommendations}
                onChange={(e) => setRecommendations(e.target.value)}
                placeholder="Recomendaciones para el cliente o notas adicionales"
                rows={2}
                style={{
                  width: '100%',
                  padding: 12,
                  borderRadius: 8,
                  border: `1px solid ${colors.border}`,
                  fontSize: 14,
                  resize: 'vertical'
                }}
              />
            </div>

            {/* Evidencias Fotográficas */}
            <WorkEvidenceUploader
              appointmentId={insumosAppointment?.id}
              photos={workEvidences}
              onPhotosChange={setWorkEvidences}
              apiUrl={import.meta.env.VITE_API_URL || ''}
              token={localStorage.getItem('token') || ''}
              colors={colors}
            />

            {/* Firma del Cliente */}
            <SignatureCanvas
              signature={clientSignature}
              onSignatureChange={setClientSignature}
              colors={colors}
              width={400}
              height={150}
            />

            {/* Botones */}
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={() => {
                  setShowInsumosModal(false);
                  setInsumosAppointment(null);
                  setSelectedInsumos([]);
                  setWorkNotes('');
                  setDiagnosis('');
                  setSolution('');
                  setRecommendations('');
                  setWorkEvidences([]);
                  setClientSignature(null);
                }}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: 10,
                  border: `1px solid ${colors.border}`,
                  background: 'none',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveInsumosAndStart}
                disabled={savingInsumos}
                style={{
                  flex: 2,
                  padding: '12px',
                  borderRadius: 10,
                  border: 'none',
                  background: colors.primary,
                  color: 'white',
                  fontWeight: 700,
                  cursor: savingInsumos ? 'not-allowed' : 'pointer',
                  opacity: savingInsumos ? 0.7 : 1
                }}
              >
                {savingInsumos ? 'Guardando...' : 'Iniciar Trabajo'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

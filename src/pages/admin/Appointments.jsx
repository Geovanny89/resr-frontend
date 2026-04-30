/**
 * PÁGINA DE CITAS - VERSIÓN REFACTORIZADA
 * ======================================
 * 
 * Cambios realizados:
 * - Extraídos hooks: useAppointments, useAppointmentActions
 * - Extraídos componentes: todos los modales (incluyendo InsumosModal) y AppointmentGrid
 * - Reducido de ~3100 líneas a ~500 líneas
 * - Misma funcionalidad, código más mantenible
 */
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import api from '../../api/client';
import AdminLayout from '../../components/AdminLayout';
import { useSocket } from '../../hooks/useSocket';
import { Plus, Clock, Check, X } from 'lucide-react';

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
  SendReceiptModal,
  InsumosModal
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
  } = useAppointmentActions({ business, showStatus, refresh, setAppointments });

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

  // Recargar empleados cuando el componente se monta (para detectar nuevos empleados creados)
  useEffect(() => {
    if (business?.id) {
      const loadEmployees = async () => {
        try {
          const employeesRes = await api.get(`/employees?businessId=${business.id}`, { params: { noCache: true } });
          setEmployees(employeesRes.data || []);
        } catch (e) {
          console.error('Error loading employees:', e);
        }
      };
      loadEmployees();
    }
  }, []);

  // Responsive
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // SOCKET.IO
  const handleAppointmentCreated = useCallback((appointment) => {
    console.log('[Admin Socket] appointment:created recibido:', appointment.id);
    // Agregar cita al estado local inmediatamente
    setAppointments(prev => {
      if (prev.find(a => a.id === appointment.id)) return prev;
      return [...prev, appointment];
    });
    refresh();
    showStatus(`📅 Nueva cita: ${appointment.clientName}`, 'info');
  }, [refresh, showStatus, setAppointments]);

  const handleAppointmentUpdated = useCallback((appointment) => {
    console.log('[Admin Socket] appointment:updated recibido:', appointment.id, 'status:', appointment.status, 'technicianStatus:', appointment.technicianStatus, 'rating:', appointment.rating);
    setAppointments(prev => {
      const exists = prev.find(a => a.id === appointment.id);
      if (exists) {
        console.log('[Admin Socket] Actualizando cita existente en estado');
        return prev.map(a => a.id === appointment.id ? { 
          ...a, 
          ...appointment, 
          // Preservar status si no viene en el socket
          status: appointment.status || a.status,
          // Preservar technicianStatus si no viene o es undefined
          technicianStatus: appointment.technicianStatus !== undefined ? appointment.technicianStatus : a.technicianStatus,
          Service: appointment.Service || a.Service 
        } : a);
      }
      console.log('[Admin Socket] Cita no encontrada en lista actual, recargando...');
      refresh(true); // Forzar recarga sin caché
      return prev;
    });
  }, [refresh, setAppointments]);

  const handleAppointmentCancelled = useCallback((appointment) => {
    console.log('[Admin Socket] appointment:cancelled recibido:', appointment.id);
    setAppointments(prev => prev.filter(a => a.id !== appointment.id));
    showStatus('❌ Cita cancelada', 'warning');
  }, [setAppointments, showStatus]);

  // Refrescar citas al reconectar socket (evita perder actualizaciones mientras estaba desconectado)
  const handleSocketConnect = useCallback(() => {
    console.log('[Admin Socket] 🔄 Socket reconectado, refrescando citas...');
    refresh(true); // Forzar recarga sin caché
  }, [refresh]);

  useSocket({
    businessId: business?.id,
    userId: user?.id,
    role: 'admin',
    onAppointmentCreated: handleAppointmentCreated,
    onAppointmentUpdated: handleAppointmentUpdated,
    onAppointmentCancelled: handleAppointmentCancelled,
    onConnect: handleSocketConnect
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

  const handleCreateSubmit = async (form, manualTime, selectedDate) => {
    const result = await handleCreateAppointment(form, manualTime, selectedDate);
    if (result.success) {
      closeModal('create');
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
                    {' '}→ {employees.find(e => e.id === selectedEmployeeId)?.User?.name || 'Profesional'}
                  </span>
                )}
              </h2>
              <div style={{ fontSize: 14, color: colors.textSecondary, marginTop: 4 }}>
                {filteredAppointments.length} cita{filteredAppointments.length !== 1 ? 's' : ''} programada{filteredAppointments.length !== 1 ? 's' : ''}
                {selectedEmployeeId && ' para este profesional'}
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
        onSubmit={handleCreateSubmit}
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
        business={business}
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
        onSuccess={() => refresh(true)}
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
      <InsumosModal
        isOpen={modals.insumos}
        appointment={selectedAppointment}
        inventoryItems={inventoryItems}
        selectedInsumos={selectedInsumos}
        loadingInventory={loadingInventory}
        diagnosis={diagnosis}
        solution={solution}
        recommendations={recommendations}
        workEvidences={workEvidences}
        onClose={() => {
          closeModal('insumos');
          setSelectedInsumos([]);
          setDiagnosis('');
          setSolution('');
          setRecommendations('');
          setWorkEvidences([]);
        }}
        onAddInsumo={handleAddInsumo}
        onRemoveInsumo={handleRemoveInsumo}
        onSave={handleSaveInsumos}
        onDiagnosisChange={setDiagnosis}
        onSolutionChange={setSolution}
        onRecommendationsChange={setRecommendations}
        onWorkEvidencesChange={setWorkEvidences}
        isSaving={actionLoading.insumos}
        colors={colors}
      />
    </AdminLayout>
  );
}

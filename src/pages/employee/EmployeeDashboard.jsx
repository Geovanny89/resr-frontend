import { useEffect, useState, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import api from '../../api/client';
import { Capacitor } from '@capacitor/core';
import notificationService from '../../services/notificationService';

// Hooks personalizados
import { useEmployeeData } from './hooks/useEmployeeData';
import { useAppointments } from './hooks/useAppointments';
import { useSocket } from '../../hooks/useSocket';
import { useAppointmentHandlers } from './hooks/useAppointmentHandlers';
import { useModalHandlers } from './hooks/useModalHandlers';
import { useInventoryHandlers } from './hooks/useInventoryHandlers';
import { useNotesHandlers } from './hooks/useNotesHandlers';

// Componentes
import { DateSelector } from './components/DateSelector';
import { StatusFilter } from './components/StatusFilter';
import { Pagination } from './components/Pagination';
import { StatusToast } from './components/StatusToast';
import { ExpressModal } from './components/ExpressModal';
import { CompleteModal } from './components/CompleteModal';
import { AdditionalModal } from './components/AdditionalModal';
import { ExtendModal, ExtendConfirmModal } from './components/ExtendModal';
import { NotesModal, DeleteNoteConfirmModal } from './components/NotesModal';
import { InsumosModal } from './components/InsumosModal';
import { SignatureModal } from './components/SignatureModal';
import { ChangePasswordModal } from './components/ChangePasswordModal';
import { AppointmentCard } from './components/AppointmentCard';
import { STATUS_LABELS, STATUS_COLORS, BEAUTY_BUSINESS_TYPES } from './constants';
import { getImgUrl, getInitials } from './utils';

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const { colors } = useTheme();
  const location = useLocation();

  // Estado de fecha seleccionada
  const [selectedDate, setSelectedDate] = useState(() => {
    return new Date().toLocaleDateString('en-CA', { timeZone: 'America/Bogota' });
  });
  const selectedDateRef = useRef(selectedDate);

  // Sincronizar selectedDateRef cuando cambia selectedDate
  useEffect(() => {
    selectedDateRef.current = selectedDate;
  }, [selectedDate]);

  // Usar hooks personalizados
  const { employee, business, loading: employeeLoading, error, loadServices } = useEmployeeData();
  const { 
    appointments, 
    setAppointments,
    appointmentsRef, 
    loading: appointmentsLoading, 
    error: appointmentsError, 
    statusFilter, 
    currentPage, 
    setCurrentPage, 
    filteredAppointments, 
    paginatedAppointments, 
    totalPages, 
    loadAppointments, 
    handleFilterChange,
    forceRender 
  } = useAppointments(employee, selectedDate);

  // Estado de servicios
  const [services, setServices] = useState([]);
  useEffect(() => {
    if (employee?.businessId) {
      loadServices(employee.businessId).then(setServices);
    }
  }, [employee, loadServices]);

  // Estado de mensajes
  const [statusMsg, setStatusMsg] = useState(null);

  // Mostrar mensaje de estado
  const showStatus = (text, type = 'success') => {
    setStatusMsg({ text, type });
    setTimeout(() => setStatusMsg(null), 3000);
  };

  // Usar hooks personalizados
  const { 
    completing,
    setCompleting,
    showCompleteModal,
    completeAppointmentData,
    paymentMethod,
    setPaymentMethod,
    setShowCompleteModal,
    setCompleteAppointmentData,
    handleCreateExpress,
    handleStatusUpdate,
    handleCompleteAppointment
  } = useAppointmentHandlers(employee, business, loadAppointments, showStatus, setAppointments);

  const {
    showSignatureModal,
    signatureAppointment,
    clientSignature,
    setClientSignature,
    setShowSignatureModal,
    setSignatureAppointment,
    handleOpenSignatureModal,
    showAdditionalModal,
    selectedApt,
    additionalForm,
    setAdditionalForm,
    savingAdditional,
    setSavingAdditional,
    setShowAdditionalModal,
    setSelectedApt,
    handleOpenAdditionalModal,
    showExtendModal,
    extendingAppointment,
    extendMinutes,
    setExtendMinutes,
    savingExtend,
    setSavingExtend,
    showExtendConfirm,
    setShowExtendModal,
    setShowExtendConfirm,
    setExtendingAppointment,
    handleExtendClick,
    handleExtendTimeRequest,
    showInsumosModal,
    setShowInsumosModal
  } = useModalHandlers(() => {}, () => {});

  const {
    inventoryItems,
    selectedInsumos,
    setSelectedInsumos,
    loadingInventory,
    savingInsumos,
    diagnosis,
    setDiagnosis,
    solution,
    setSolution,
    recommendations,
    setRecommendations,
    workEvidences,
    setWorkEvidences,
    insumosAppointment,
    setInsumosAppointment,
    loadInventory,
    handleAddInsumo,
    handleRemoveInsumo,
    handleSaveInsumosAndStart,
    resetInsumosState
  } = useInventoryHandlers(employee, showStatus, loadAppointments);

  const {
    showNotesModal,
    notesAppointment,
    notes,
    newNoteContent,
    setNewNoteContent,
    loadingNotes,
    savingNote,
    deleteNoteConfirm,
    deletingNote,
    setShowNotesModal,
    setNotesAppointment,
    setNotes,
    setDeleteNoteConfirm,
    handleOpenNotesModal,
    handleAddNote,
    handleDeleteNote
  } = useNotesHandlers(showStatus, loadAppointments);

  // SOCKET.IO - Usando useSocket directamente (callbacksRef se actualiza cada render, sin stale closures)
  useSocket({
    businessId: employee?.businessId,
    employeeId: employee?.id,
    role: 'employee',

    // Nueva cita asignada al empleado
    onNewAssigned: (appointment) => {
      console.log('🔔 [Employee] appointment:new_assigned recibido:', appointment.id);
      const aptDate = new Date(appointment.startTime).toLocaleDateString('en-CA', { timeZone: 'America/Bogota' });
      if (aptDate !== selectedDateRef.current) return;
      if (appointmentsRef.current.find(a => a.id === appointment.id)) return;

      const newList = [...appointmentsRef.current, { ...appointment }];
      appointmentsRef.current = newList;
      setAppointments(newList);
      forceRender({});
      showStatus(`📅 Nueva cita: ${appointment.clientName}`, 'info');
    },

    // Respaldo: el empleado está en sala business: y recibe appointment:created
    onAppointmentCreated: (appointment) => {
      if (!employee?.id || String(appointment.employeeId) !== String(employee.id)) return;
      console.log('🔔 [Employee] appointment:created (respaldo) para mi empleado');
      const aptDate = new Date(appointment.startTime).toLocaleDateString('en-CA', { timeZone: 'America/Bogota' });
      if (aptDate !== selectedDateRef.current) return;
      if (appointmentsRef.current.find(a => a.id === appointment.id)) return;

      const newList = [...appointmentsRef.current, { ...appointment }];
      appointmentsRef.current = newList;
      setAppointments(newList);
      forceRender({});
      showStatus(`📅 Nueva cita: ${appointment.clientName}`, 'info');
    },

    // Cita actualizada
    onAppointmentUpdated: (appointment) => {
      console.log('🔔 [Employee] appointment:updated:', appointment.id, appointment.status);
      const aptDate = new Date(appointment.startTime).toLocaleDateString('en-CA', { timeZone: 'America/Bogota' });
      const exists = appointmentsRef.current.find(a => a.id === appointment.id);

      if (aptDate !== selectedDateRef.current) {
        if (exists) {
          const newList = appointmentsRef.current.filter(a => a.id !== appointment.id);
          appointmentsRef.current = newList;
          setAppointments(newList);
          forceRender({});
        }
        return;
      }

      let newList;
      if (exists) {
        newList = appointmentsRef.current.map(a =>
          a.id === appointment.id ? { ...a, ...appointment, Service: appointment.Service || a.Service } : a
        );
      } else {
        newList = [...appointmentsRef.current, { ...appointment }];
      }
      appointmentsRef.current = newList;
      setAppointments(newList);
      forceRender({});
    },

    // Cita cancelada
    onAppointmentCancelled: (appointment) => {
      console.log('🔔 [Employee] appointment:cancelled:', appointment.id);
      const newList = appointmentsRef.current.filter(a => a.id !== appointment.id);
      appointmentsRef.current = newList;
      setAppointments(newList);
      forceRender({});
      showStatus('❌ Cita cancelada', 'warning');
    },

    // Reconexión: recargar citas
    onConnect: () => {
      console.log('🔔 [Employee] Socket conectado, refrescando citas...');
      loadAppointments();
    }
  });

  // Programar notificaciones cuando se cargan las citas (solo en APK)
  useEffect(() => {
    if (Capacitor.isNativePlatform() && appointments.length > 0 && employee) {
      notificationService.scheduleMultipleNotifications(
        appointments,
        employee.id,
        'employee'
      );
    }
  }, [appointments, employee]);

  // Estados locales que no están en hooks
  const [showExpressModal, setShowExpressModal] = useState(false);
  const [expressForm, setExpressForm] = useState({
    clientName: '',
    clientPhone: '',
    address: '',
    serviceId: '',
    extraServices: []
  });
  const [showChangePwModal, setShowChangePwModal] = useState(false);
  const [pwForm, setPwForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [pwLoading, setPwLoading] = useState(false);
  const [pwSuccess, setPwSuccess] = useState(false);
  const [showPasswords, setShowPasswords] = useState({ old: false, new: false, confirm: false });

  // Detectar si se debe abrir el modal de cambiar contraseña desde la navegación
  useEffect(() => {
    if (location.state?.openChangePassword) {
      setShowChangePwModal(true);
      // Limpiar el estado para evitar reabrir al refrescar
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Handler local para crear cita express (wrapper del hook)
  const handleCreateExpressLocal = async () => {
    const success = await handleCreateExpress(expressForm, setExpressForm);
    if (success) {
      setShowExpressModal(false);
    }
  };

  // Handler local para abrir modal de insumos (inicializa estados)
  const handleOpenInsumosModalLocal = async (appointment) => {
    setInsumosAppointment(appointment);
    setSelectedInsumos([]);
    const report = appointment.workReport || {};
    setDiagnosis(report.diagnosis || '');
    setSolution(report.solution || '');
    setRecommendations(report.recommendations || '');
    setWorkEvidences(appointment.workEvidences || []);
    await loadInventory();
    setShowInsumosModal(true);
  };

  // Handler para completar con firma (no está en hooks porque tiene lógica específica)
  const handleCompleteWithSignature = async () => {
    if (!signatureAppointment) return;
    if (!clientSignature) {
      showStatus('La firma del cliente es obligatoria para completar el servicio', 'error');
      return;
    }

    setCompleting(true);
    try {
      const isBeautyBusiness = BEAUTY_BUSINESS_TYPES.includes(business?.type);

      if (isBeautyBusiness) {
        await api.patch(`/appointments/${signatureAppointment.id}/additional-charge`, {
          additionalAmount: 0,
          additionalNote: ''
        });
      }

      await api.patch(`/appointments/${signatureAppointment.id}/status`, { status: 'done' });
      await api.post(`/appointments/${signatureAppointment.id}/client-signature`, {
        signature: clientSignature
      });

      // Remover cita de la lista local inmediatamente
      setAppointments(prev => prev.filter(a => a.id !== signatureAppointment.id));

      setShowSignatureModal(false);
      setSignatureAppointment(null);
      setClientSignature(null);
      showStatus('Servicio completado y firma guardada exitosamente');
      // No recargar - el socket actualizará vía appointment:updated
    } catch (e) {
      showStatus(e.response?.data?.error || 'Error al completar cita', 'error');
    } finally {
      setCompleting(false);
    }
  };

  const handleSaveAdditionalCharge = async () => {
    if (!selectedApt) return;
    setSavingAdditional(true);
    try {
      await api.patch(`/appointments/${selectedApt.id}/additional-charge`, {
        additionalAmount: parseFloat(additionalForm.additionalAmount) || 0,
        additionalNote: additionalForm.additionalNote
      });
      showStatus('Cargo adicional guardado exitosamente');
      setShowAdditionalModal(false);
      setSelectedApt(null);
      // Recargar citas para actualizar la UI inmediatamente
      loadAppointments();
    } catch (e) {
      showStatus(e.response?.data?.error || 'Error al guardar cargo adicional', 'error');
    } finally {
      setSavingAdditional(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      showStatus('Las contraseñas no coinciden', 'error');
      return;
    }
    setPwLoading(true);
    try {
      await api.patch('/auth/change-password', {
        oldPassword: pwForm.oldPassword,
        newPassword: pwForm.newPassword
      });
      setPwSuccess(true);
      setShowChangePwModal(false);
      setPwForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setPwSuccess(false), 4000);
    } catch (err) {
      showStatus(err.response?.data?.error || 'Error al cambiar la contraseña', 'error');
    } finally {
      setPwLoading(false);
    }
  };

  // Handlers para AppointmentCard
  const handleStartWorkDirectly = async (appointment) => {
    try {
      await api.patch(`/appointments/${appointment.id}/technician-status`, { status: 'in_progress' });
      // Actualizar estado local inmediatamente
      // Cuando technicianStatus es in_progress, el backend también cambia status a attention
      setAppointments(prev => prev.map(a => 
        a.id === appointment.id ? { 
          ...a, 
          technicianStatus: 'in_progress',
          status: 'attention'
        } : a
      ));
      // No recargar - el socket actualizará vía appointment:updated
    } catch (e) {
      showStatus(e.response?.data?.error || 'Error al iniciar trabajo', 'error');
    }
  };

  // Handler para confirmar extensión de tiempo (no está en hooks)
  const handleExtendConfirm = async () => {
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
      showStatus('Tiempo extendido exitosamente');
      // No recargar - el socket actualizará vía appointment:updated
    } catch (e) {
      showStatus(e.response?.data?.error || 'Error al extender tiempo', 'error');
    } finally {
      setSavingExtend(false);
    }
  };

  const loading = employeeLoading || appointmentsLoading;

  if (!employee) {
    return (
      <div style={{
        minHeight: '100vh',
        background: colors.bg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>⏳</div>
          <p>Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ pointerEvents: 'auto' }}>
        <style>{`
          @media (max-width: 640px) {
            .employee-appointment-card { padding: 16px !important; }
            .employee-appointment-actions { flex-direction: column; }
            .employee-appointment-actions button { width: 100%; justify-content: center; }
          }
        `}</style>
        
        {/* Mensaje sutil de éxito */}
        {pwSuccess && (
          <div style={{
            background: colors.isDark ? '#064e3b' : '#d1fae5',
            border: `1px solid ${colors.isDark ? '#10b981' : '#10b981'}`,
            borderRadius: 8,
            padding: '12px 16px',
            marginBottom: 20,
            display: 'flex',
            alignItems: 'center',
            gap: 10
          }}>
            <span style={{ fontSize: 18 }}>✅</span>
            <span style={{ 
              fontSize: 14, 
              color: colors.isDark ? '#6ee7b7' : '#065f46',
              fontWeight: 500 
            }}>
              Su contraseña ha sido cambiada exitosamente
            </span>
          </div>
        )}
        
        {/* Selector de fecha y Botón Express */}
        <DateSelector 
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          colors={colors}
          business={business}
          onExpressClick={() => setShowExpressModal(true)}
        />

        {/* Citas del día */}
        <div style={{
          background: colors.cardBg,
          padding: 24,
          borderRadius: 12,
          boxShadow: `0 2px 8px ${colors.shadow}`,
          border: `1px solid ${colors.border}`,
          pointerEvents: 'auto'
        }}>
          <h2 style={{
            fontSize: 20,
            fontWeight: 700,
            marginBottom: 24,
            color: colors.text
          }}>
            📅 Agenda para {(() => {
              const [year, month, day] = selectedDate.split('-').map(Number);
              const date = new Date(year, month - 1, day);
              return date.toLocaleDateString('es-CO', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              });
            })()}
          </h2>

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

          {loading && (
            <div style={{ textAlign: 'center', padding: 40 }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>⏳</div>
              <p style={{ color: colors.textSecondary }}>Cargando citas...</p>
            </div>
          )}

          {/* Filtro de estado */}
          {!loading && appointments.length > 0 && (
            <StatusFilter 
              statusFilter={statusFilter}
              handleFilterChange={handleFilterChange}
              appointments={appointments}
              colors={colors}
            />
          )}

          {!loading && appointments.length === 0 && (
            <div style={{
              textAlign: 'center',
              padding: 40,
              background: colors.bgSecondary,
              borderRadius: 8
            }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>😊</div>
              <p style={{ color: colors.textSecondary, fontSize: 16 }}>
                No tienes citas programadas para esta fecha
              </p>
            </div>
          )}

          {!loading && paginatedAppointments.length > 0 && (
            <div style={{ display: 'grid', gap: 16 }}>
              {paginatedAppointments.map((apt) => (
                <AppointmentCard
                  key={apt.id}
                  apt={apt}
                  colors={colors}
                  business={business}
                  completing={completing}
                  onStatusUpdate={handleStatusUpdate}
                  onStartWorkDirectly={handleStartWorkDirectly}
                  onOpenInsumosModal={handleOpenInsumosModalLocal}
                  onOpenSignatureModal={handleOpenSignatureModal}
                  onOpenAdditionalModal={handleOpenAdditionalModal}
                  onOpenNotesModal={handleOpenNotesModal}
                  onExtendClick={handleExtendClick}
                />
              ))}
            </div>
          )}

          {/* Paginación */}
          <Pagination 
            currentPage={currentPage}
            totalPages={totalPages}
            setCurrentPage={setCurrentPage}
            colors={colors}
          />
        </div>

        {/* Modal Cita Express */}
        <ExpressModal
          show={showExpressModal}
          colors={colors}
          business={business}
          expressForm={expressForm}
          setExpressForm={setExpressForm}
          services={services}
          completing={completing}
          onClose={() => setShowExpressModal(false)}
          onSubmit={handleCreateExpressLocal}
        />

      {/* Modal Cambiar Contraseña */}
      <ChangePasswordModal
        show={showChangePwModal}
        colors={colors}
        pwForm={pwForm}
        setPwForm={setPwForm}
        pwLoading={pwLoading}
        showPasswords={showPasswords}
        setShowPasswords={setShowPasswords}
        onClose={() => setShowChangePwModal(false)}
        onSubmit={handlePasswordChange}
      />

      {/* Modal para completar cita con método de pago */}
      <CompleteModal
        show={showCompleteModal}
        colors={colors}
        completeAppointmentData={completeAppointmentData}
        setCompleteAppointmentData={setCompleteAppointmentData}
        services={services}
        paymentMethod={paymentMethod}
        setPaymentMethod={setPaymentMethod}
        completing={completing}
        onClose={() => setShowCompleteModal(false)}
        onSubmit={handleCompleteAppointment}
      />

      {/* Modal para cargo adicional standalone */}
      <AdditionalModal
        show={showAdditionalModal}
        colors={colors}
        additionalForm={additionalForm}
        setAdditionalForm={setAdditionalForm}
        savingAdditional={savingAdditional}
        onClose={() => {
          setShowAdditionalModal(false);
          setSelectedApt(null);
          setAdditionalForm({ additionalAmount: '', additionalNote: '' });
        }}
        onSubmit={handleSaveAdditionalCharge}
      />

      {/* Modal para extender tiempo */}
      <ExtendModal
        show={showExtendModal}
        colors={colors}
        extendingAppointment={extendingAppointment}
        extendMinutes={extendMinutes}
        setExtendMinutes={setExtendMinutes}
        savingExtend={savingExtend}
        onClose={() => { setShowExtendModal(false); setExtendingAppointment(null); }}
        onConfirm={handleExtendTimeRequest}
      />

      {/* Modal de confirmación para extender tiempo */}
      <ExtendConfirmModal
        show={showExtendConfirm}
        colors={colors}
        extendingAppointment={extendingAppointment}
        extendMinutes={extendMinutes}
        savingExtend={savingExtend}
        onClose={() => setShowExtendConfirm(false)}
        onConfirm={handleExtendConfirm}
      />

      {/* Modal de Notas */}
      <NotesModal
        show={showNotesModal}
        colors={colors}
        notesAppointment={notesAppointment}
        notes={notes}
        loadingNotes={loadingNotes}
        newNoteContent={newNoteContent}
        setNewNoteContent={setNewNoteContent}
        savingNote={savingNote}
        onDeleteNoteClick={setDeleteNoteConfirm}
        onClose={() => { setShowNotesModal(false); setNotesAppointment(null); setNotes([]); }}
        onAddNote={handleAddNote}
      />

      {/* Modal de confirmación para eliminar nota */}
      <DeleteNoteConfirmModal
        show={!!deleteNoteConfirm}
        colors={colors}
        deletingNote={deletingNote}
        onClose={() => setDeleteNoteConfirm(null)}
        onConfirm={handleDeleteNote}
      />

      {/* Toast de mensajes */}
      <StatusToast statusMsg={statusMsg} />

      {/* Modal de Detalles para Técnicos de Campo */}
      <InsumosModal
        show={showInsumosModal}
        colors={colors}
        insumosAppointment={insumosAppointment}
        inventoryItems={inventoryItems}
        selectedInsumos={selectedInsumos}
        loadingInventory={loadingInventory}
        savingInsumos={savingInsumos}
        diagnosis={diagnosis}
        solution={solution}
        recommendations={recommendations}
        workEvidences={workEvidences}
        onAddInsumo={handleAddInsumo}
        onRemoveInsumo={handleRemoveInsumo}
        onDiagnosisChange={setDiagnosis}
        onSolutionChange={setSolution}
        onRecommendationsChange={setRecommendations}
        onPhotosChange={setWorkEvidences}
        onClose={() => {
          setShowInsumosModal(false);
          setInsumosAppointment(null);
          setSelectedInsumos([]);
          setDiagnosis('');
          setSolution('');
          setRecommendations('');
          setWorkEvidences([]);
        }}
        onSubmit={handleSaveInsumosAndStart}
      />

      {/* Modal de Firma para Completar Servicio */}
      <SignatureModal
        show={showSignatureModal}
        colors={colors}
        signatureAppointment={signatureAppointment}
        clientSignature={clientSignature}
        onSignatureChange={setClientSignature}
        completing={completing}
        onClose={() => {
          setShowSignatureModal(false);
          setSignatureAppointment(null);
          setClientSignature(null);
        }}
        onSubmit={handleCompleteWithSignature}
      />
    </div>
  );
}

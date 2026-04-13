import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import api from '../../api/client';
import AdminLayout from '../../components/AdminLayout';
import ResponsiveTable from '../../components/ResponsiveTable';
import ResponsiveCalendar from '../../components/ResponsiveCalendar';
import { 
  Check, X, Mail, Plus, ChevronLeft, ChevronRight, 
  Play, CheckCircle2, Trash2, Repeat, DollarSign, Send, Clock,
  Calendar as CalendarIcon
} from 'lucide-react';

const STATUS_LABELS = {
  pending: { label: 'Pendiente', color: '#f59e0b', icon: <Clock size={14} /> },
  confirmed: { label: 'Confirmada', color: '#10b981', icon: <Check size={14} /> },
  attention: { label: 'En atención', color: '#3b82f6', icon: <Play size={14} /> },
  done: { label: 'Completada', color: '#8b5cf6', icon: <CheckCircle2 size={14} /> },
  cancelled: { label: 'Cancelada', color: '#ef4444', icon: <X size={14} /> }
};

const fmt = (n) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n || 0);

export default function Appointments() {
  const { business } = useAuth();
  const { colors } = useTheme();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [selectedDate, setSelectedDate] = useState(() => {
    // Inicializar con la fecha actual en Colombia
    const colombiaStr = new Date().toLocaleString("en-US", {timeZone: "America/Bogota"});
    return new Date(colombiaStr);
  });
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [services, setServices] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [createForm, setCreateForm] = useState({
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    serviceId: '',
    employeeId: '',
    startTime: '',
    notes: ''
  });
  const [creating, setCreating] = useState(false);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedDateModal, setSelectedDateModal] = useState('');
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState(null);

  const [showExpressModal, setShowExpressModal] = useState(false);
  const [expressForm, setExpressForm] = useState({
    clientName: '',
    clientPhone: '',
    serviceId: '',
    employeeId: ''
  });

  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [completeAppointmentData, setCompleteAppointmentData] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [completing, setCompleting] = useState(false);

  const showStatus = (text, type = 'success') => {
    setStatusMsg({ text, type });
    setTimeout(() => setStatusMsg(null), 3500);
  };
  const [showAdditionalChargeModal, setShowAdditionalChargeModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [additionalChargeForm, setAdditionalChargeForm] = useState({
    additionalAmount: '',
    additionalNote: ''
  });
  const [savingAdditionalCharge, setSavingAdditionalCharge] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [selectedTransferAppointment, setSelectedTransferAppointment] = useState(null);
  const [transferEmployeeId, setTransferEmployeeId] = useState('');
  const [transferring, setTransferring] = useState(false);
  const [transferAvailableSlots, setTransferAvailableSlots] = useState([]);
  const [transferSelectedSlot, setTransferSelectedSlot] = useState('');
  const [transferConflictError, setTransferConflictError] = useState(null);

  useEffect(() => {
    if (business?.id) {
      loadAppointments();
      loadServices();
      loadEmployees();
    }
  }, [business]);

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

  const loadAvailableSlots = async (date, employeeId, serviceId) => {
    
    if (!date || !employeeId || !serviceId) {
      setAvailableSlots([]);
      return;
    }

    try {
      const res = await api.get(`/appointments/availability?date=${date}&employeeId=${employeeId}&serviceId=${serviceId}&businessId=${business.id}`);
      
      const now = new Date();
      const todayStr = now.toLocaleDateString('en-CA', { timeZone: 'America/Bogota' });
      const nowTimeStr = now.toLocaleTimeString('en-US', { 
        timeZone: 'America/Bogota', 
        hour12: false, 
        hour: '2-digit', 
        minute: '2-digit' 
      });

      let slots = res.data.availableSlots || [];
      
      // Solo filtramos si es hoy para no mostrar horas pasadas
      if (date === todayStr) {
        slots = slots.filter(slot => slot.time >= nowTimeStr);
      }
      
      setAvailableSlots(slots);
    } catch (e) {
      setAvailableSlots([]);
    }
  };

  const filteredAppointments = useMemo(() => {
    const dateStr = selectedDate.toLocaleDateString('en-CA', { timeZone: 'America/Bogota' });
    
    return appointments.filter(apt => {
      const aptDate = new Date(apt.startTime).toLocaleDateString('en-CA', { timeZone: 'America/Bogota' });
      return aptDate === dateStr;
    });
  }, [appointments, selectedDate]);

  // Reiniciar a la primera página solo cuando cambia la FECHA seleccionada
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedDate]);

  const paginatedAppointments = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAppointments.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAppointments, currentPage]);

  // Helper para obtener acciones según el estado de la cita
  const getRowActions = (row) => {
    const actions = [
      {
        label: 'Confirmar',
        icon: <Check size={14} />,
        onClick: () => handleStatusChange(row.id, 'confirmed'),
        color: '#10b981',
        show: row.status === 'pending',
        title: 'Confirmar Cita'
      },
      {
        label: 'Atender',
        icon: <Play size={14} />,
        onClick: () => handleStatusChange(row.id, 'attention'),
        color: '#3b82f6',
        show: row.status === 'confirmed',
        title: 'Iniciar Atención'
      },
      {
        label: 'Completar',
        icon: <CheckCircle2 size={14} />,
        onClick: () => {
          setCompleteAppointmentData(row);
          setPaymentMethod('cash'); // Default
          setShowCompleteModal(true);
        },
        color: '#8b5cf6',
        show: ['confirmed', 'attention'].includes(row.status),
        title: 'Marcar como Completada'
      },
      {
        label: 'Reasignar',
        icon: <Repeat size={14} />,
        onClick: () => handleOpenTransferModal(row),
        color: '#6366f1',
        show: ['pending', 'confirmed', 'attention'].includes(row.status),
        title: 'Transferir a otro profesional'
      },
      {
        label: 'Adicional',
        icon: <DollarSign size={14} />,
        onClick: () => handleOpenAdditionalChargeModal(row),
        color: '#f59e0b',
        show: ['pending', 'confirmed', 'attention'].includes(row.status),
        title: row.additionalAmount ? 'Editar Cargo Adicional' : 'Agregar Cargo Adicional'
      },
      {
        label: 'Recibo',
        icon: <Send size={14} />,
        onClick: () => handleSendReceipt(row.id),
        color: '#0ea5e9',
        show: row.status === 'done',
        title: 'Enviar Comprobante por Email'
      },
      {
        label: 'Cancelar',
        icon: <Trash2 size={14} />,
        onClick: () => handleCancel(row.id),
        color: '#ef4444',
        show: ['pending', 'confirmed', 'attention'].includes(row.status),
        title: 'Cancelar Cita'
      }
    ];
    return actions.filter(a => a.show);
  };

  const totalPages = Math.ceil(filteredAppointments.length / itemsPerPage);

  const handleStatusChange = async (appointmentId, newStatus) => {
    try {
      await api.patch(`/appointments/${appointmentId}/status`, { status: newStatus });
      loadAppointments();
      showStatus('Estado actualizado');
    } catch (e) {
      showStatus(e.response?.data?.error || 'Error al cambiar estado', 'error');
    }
  };

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

  const handleCancel = async (appointmentId) => {
    if (!confirm('¿Cancelar esta cita?')) return;
    try {
      await api.patch(`/appointments/${appointmentId}/cancel`);
      loadAppointments();
    } catch (e) {
      console.error('Error al cancelar:', e);
    }
  };

  const handleSendReceipt = async (appointmentId) => {
    if (!confirm('¿Enviar comprobante de pago por correo?')) return;
    try {
      await api.post(`/appointments/${appointmentId}/send-receipt`);
      alert('✅ Comprobante de pago enviado exitosamente');
    } catch (e) {
      console.error('Error al enviar comprobante:', e);
      alert('❌ Error al enviar comprobante: ' + (e.response?.data?.error || e.message));
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
      alert('❌ Error al guardar cargo adicional: ' + (e.response?.data?.error || e.message));
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
        const res = await api.get(`/appointments/availability?date=${dateStr}&employeeId=${transferEmployeeId}&serviceId=${selectedTransferAppointment.serviceId}&businessId=${business.id}`);
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
      const payload = {
        newEmployeeId: transferEmployeeId,
        newStartTime: transferSelectedSlot ? `${new Date(selectedTransferAppointment.startTime).toISOString().split('T')[0]}T${transferSelectedSlot}` : undefined
      };

      await api.patch(`/appointments/${selectedTransferAppointment.id}/transfer`, payload);
      
      setShowTransferModal(false);
      showStatus(transferSelectedSlot 
        ? `Cita transferida a ${new Date(`${new Date(selectedTransferAppointment.startTime).toISOString().split('T')[0]}T${transferSelectedSlot}`).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}` 
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
      } else {
        alert('❌ Error al transferir cita: ' + (e.response?.data?.error || e.message));
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
      alert('Por favor selecciona servicio y empleado');
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
      alert('Por favor completa todos los campos requeridos');
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
      serviceId: '',
      employeeId: '',
      startTime: '',
      notes: ''
    });
    setSelectedDateModal('');
    setAvailableSlots([]);
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
        {/* Calendario */}
        <div className="card" style={{ 
          width: '100%', 
          position: isMobile ? 'relative' : 'sticky',
          top: isMobile ? 0 : '20px',
          padding: '20px'
        }}>
          <h3 style={{ fontSize: 15, fontWeight: 800, marginBottom: 16, color: colors.text, display: 'flex', alignItems: 'center', gap: 8 }}>
            <CalendarIcon size={18} color={colors.primary} />
            Selecciona fecha
          </h3>
          <ResponsiveCalendar
            onDateSelect={setSelectedDate}
            selectedDate={selectedDate}
            disabledDates={getDisabledDates()}
          />
        </div>

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
              </h2>
              <div style={{ fontSize: 14, color: colors.textSecondary, marginTop: 4 }}>
                {filteredAppointments.length} cita{filteredAppointments.length !== 1 ? 's' : ''} programada{filteredAppointments.length !== 1 ? 's' : ''}
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
            </div>
          </div>

          <div style={{ width: '100%', overflowX: 'auto', borderRadius: 12, border: `1px solid ${colors.border}` }}>
            <ResponsiveTable
              columns={[
                {
                  key: 'client',
                  label: 'Cliente',
                  render: (v, row) => (
                    <div style={{ minWidth: 140 }}>
                      <div style={{ fontWeight: 700, color: colors.text }}>{row.clientName || 'Sin nombre'}</div>
                      <div style={{ fontSize: 11, color: colors.textSecondary }}>{row.clientEmail || row.clientPhone || '—'}</div>
                    </div>
                  )
                },
                {
                  key: 'time',
                  label: 'Hora',
                  render: (v, row) => (
                    <div style={{ minWidth: 90, color: colors.primary, fontWeight: 800, fontSize: 14 }}>
                      {formatTime(row.startTime)}
                    </div>
                  )
                },
                {
                  key: 'service',
                  label: 'Servicio / Precio',
                  render: (v, row) => (
                    <div style={{ minWidth: 130 }}>
                      <div style={{ fontWeight: 600 }}>{row.Service?.name || '—'}</div>
                      <div style={{ fontSize: 11, color: colors.textSecondary }}>
                        {row.Service?.durationMin} min • {row.discountApplied > 0 ? (
                          <>
                            <span style={{ textDecoration: 'line-through', marginRight: 4 }}>{fmt(row.basePrice || row.Service?.price)}</span>
                            <span style={{ color: '#10b981', fontWeight: 700 }}>{fmt(row.finalPrice)}</span>
                          </>
                        ) : (
                          fmt(row.finalPrice || row.Service?.price)
                        )}
                        {row.additionalAmount > 0 && (
                          <div style={{ color: '#f59e0b', fontWeight: 600 }}>
                            + {fmt(row.additionalAmount)} (Adicional)
                          </div>
                        )}
                      </div>
                    </div>
                  )
                },
                {
                  key: 'employee',
                  label: 'Profesional',
                  render: (v, row) => (
                    <div style={{ minWidth: 110, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 24, height: 24, borderRadius: '50%', background: colors.bgSecondary, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700 }}>
                        {(row.Employee?.User?.name || 'P')[0]}
                      </div>
                      <span style={{ fontSize: 13 }}>{row.Employee?.User?.name || row.Employee?.name || '—'}</span>
                    </div>
                  )
                },
                {
                  key: 'status',
                  label: 'Estado',
                  render: (v) => (
                    <div style={{ minWidth: 100 }}>
                      <span
                        style={{
                          background: `${STATUS_LABELS[v]?.color}15`,
                          color: STATUS_LABELS[v]?.color || '#999',
                          padding: '6px 12px',
                          borderRadius: '8px',
                          fontSize: '12px',
                          fontWeight: 700,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          whiteSpace: 'nowrap',
                          border: `1px solid ${STATUS_LABELS[v]?.color}30`
                        }}
                      >
                        {STATUS_LABELS[v]?.icon}
                        {STATUS_LABELS[v]?.label || v}
                      </span>
                    </div>
                  )
                }
              ]}
              data={paginatedAppointments}
              actions={getRowActions}
              fullWidthActions={true}
              loading={loading}
              emptyMessage="No hay citas para esta fecha"
            />
          </div>

          {/* Paginación */}
          {totalPages > 1 && (
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              gap: 12, 
              marginTop: 20,
              padding: '12px',
              borderTop: '1px solid var(--border)'
            }}>
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="btn-outline btn-sm"
                style={{ padding: '6px 12px' }}
              >
                <ChevronLeft size={16} /> Anterior
              </button>
              <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>
                Página {currentPage} de {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="btn-outline btn-sm"
                style={{ padding: '6px 12px' }}
              >
                Siguiente <ChevronRight  size={16} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal para Cita Express */}
      {showExpressModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div style={{
            background: colors.cardBg, borderRadius: '12px', padding: '24px',
            maxWidth: '400px', width: '90%', border: `1px solid ${colors.border}`
          }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Cita Express (Sin cita previa)</h2>
            
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 4, fontSize: 13, fontWeight: 600 }}>Nombre del Cliente</label>
              <input
                type="text"
                value={expressForm.clientName}
                onChange={e => setExpressForm({...expressForm, clientName: e.target.value})}
                placeholder="Nombre completo"
                style={{ width: '100%', padding: '10px', borderRadius: 8, border: `1px solid ${colors.border}`, background: colors.inputBg, color: colors.text }}
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 4, fontSize: 13, fontWeight: 600 }}>Teléfono del Cliente</label>
              <input
                type="tel"
                value={expressForm.clientPhone}
                onChange={e => setExpressForm({...expressForm, clientPhone: e.target.value})}
                placeholder="Ej: 3001234567"
                style={{ width: '100%', padding: '10px', borderRadius: 8, border: `1px solid ${colors.border}`, background: colors.inputBg, color: colors.text }}
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 4, fontSize: 13, fontWeight: 600 }}>Servicio</label>
              <select
                value={expressForm.serviceId}
                onChange={e => setExpressForm({...expressForm, serviceId: e.target.value})}
                style={{ width: '100%', padding: '10px', borderRadius: 8, border: `1px solid ${colors.border}`, background: colors.inputBg, color: colors.text }}
              >
                <option value="">Selecciona servicio</option>
                {services.map(s => <option key={s.id} value={s.id}>{s.name} ({s.durationMin} min)</option>)}
              </select>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', marginBottom: 4, fontSize: 13, fontWeight: 600 }}>Profesional Disponible</label>
              <select
                value={expressForm.employeeId}
                onChange={e => setExpressForm({...expressForm, employeeId: e.target.value})}
                style={{ width: '100%', padding: '10px', borderRadius: 8, border: `1px solid ${colors.border}`, background: colors.inputBg, color: colors.text }}
              >
                <option value="">Selecciona profesional</option>
                {employees.map(e => <option key={e.id} value={e.id}>{e.User?.name}</option>)}
              </select>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => setShowExpressModal(false)} style={{ flex: 1, padding: '10px', borderRadius: 8, border: `1px solid ${colors.border}`, background: 'none', color: colors.text }}>Cancelar</button>
              <button 
                onClick={handleCreateExpress} 
                disabled={creating}
                style={{ flex: 1, padding: '10px', borderRadius: 8, border: 'none', background: '#f59e0b', color: 'white', fontWeight: 700 }}
              >
                {creating ? 'Iniciando...' : 'Iniciar Ya'}
              </button>
            </div>
          </div>
        </div>
      )}

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
                onChange={(e) => setCreateForm({...createForm, employeeId: e.target.value})}
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
                  min={new Date().toISOString().split('T')[0]}
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
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '14px', color: colors.text }}>
                  ⏰ Horarios disponibles ({availableSlots.length})
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
                        key={index}
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

      {/* Modal para completar cita con método de pago */}
      {showCompleteModal && completeAppointmentData && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div style={{
            background: colors.cardBg, borderRadius: '16px', padding: '28px',
            maxWidth: '420px', width: '90%', border: `1px solid ${colors.border}`,
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)'
          }}>
            <h2 style={{ margin: '0 0 8px 0', fontSize: '20px', fontWeight: 800, color: colors.text }}>
              ✅ Completar Cita
            </h2>
            <p style={{ margin: '0 0 24px 0', fontSize: '14px', color: colors.textSecondary }}>
              Selecciona el método de pago utilizado por <strong>{completeAppointmentData.clientName}</strong>.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 28 }}>
              <label 
                onClick={() => setPaymentMethod('cash')}
                style={{ 
                  display: 'flex', alignItems: 'center', gap: 14, padding: '16px', 
                  borderRadius: '12px', border: `2px solid ${paymentMethod === 'cash' ? colors.primary : colors.border}`,
                  background: paymentMethod === 'cash' ? `${colors.primary}08` : 'transparent',
                  cursor: 'pointer', transition: 'all 0.2s ease'
                }}
              >
                <div style={{ 
                  width: 20, height: 20, borderRadius: '50%', border: `2px solid ${paymentMethod === 'cash' ? colors.primary : colors.textTertiary}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  {paymentMethod === 'cash' && <div style={{ width: 10, height: 10, borderRadius: '50%', background: colors.primary }} />}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15, color: colors.text }}>💵 Efectivo</div>
                  <div style={{ fontSize: 12, color: colors.textSecondary }}>Pago recibido en físico</div>
                </div>
              </label>

              <label 
                onClick={() => setPaymentMethod('transfer')}
                style={{ 
                  display: 'flex', alignItems: 'center', gap: 14, padding: '16px', 
                  borderRadius: '12px', border: `2px solid ${paymentMethod === 'transfer' ? colors.primary : colors.border}`,
                  background: paymentMethod === 'transfer' ? `${colors.primary}08` : 'transparent',
                  cursor: 'pointer', transition: 'all 0.2s ease'
                }}
              >
                <div style={{ 
                  width: 20, height: 20, borderRadius: '50%', border: `2px solid ${paymentMethod === 'transfer' ? colors.primary : colors.textTertiary}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  {paymentMethod === 'transfer' && <div style={{ width: 10, height: 10, borderRadius: '50%', background: colors.primary }} />}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15, color: colors.text }}>📲 Transferencia</div>
                  <div style={{ fontSize: 12, color: colors.textSecondary }}>Nequi, Daviplata o Banco</div>
                </div>
              </label>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'stretch' }}>
              <button
                onClick={() => setShowCompleteModal(false)}
                style={{
                  flex: 1, background: 'transparent', color: colors.textSecondary,
                  border: `1px solid ${colors.border}`, borderRadius: '10px',
                  padding: '12px', fontSize: '14px', fontWeight: 600, cursor: 'pointer'
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleCompleteAppointment}
                disabled={completing}
                style={{
                  flex: 2, background: colors.primary, color: 'white',
                  border: 'none', borderRadius: '10px', padding: '12px',
                  fontSize: '14px', fontWeight: 700, cursor: completing ? 'not-allowed' : 'pointer',
                  boxShadow: `0 4px 12px ${colors.primary}40`
                }}
              >
                {completing ? 'Procesando...' : 'Confirmar Pago'}
              </button>
            </div>
          </div>
        </div>
      )}

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
    </AdminLayout>
  );
}

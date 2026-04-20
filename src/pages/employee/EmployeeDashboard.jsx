import { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import EmployeeLayout from '../../components/EmployeeLayout';
import api from '../../api/client';
import { useSocket } from '../../hooks/useSocket';
import { Capacitor } from '@capacitor/core';
import notificationService from '../../services/notificationService';
import { Eye, EyeOff, Timer, MessageSquare, Car, MapPin, Package, CheckCircle2, Play } from 'lucide-react';

const STATUS_LABELS = { 
  pending: 'Pendiente', 
  confirmed: 'Confirmada',
  on_the_way: 'En Camino',
  arrived: 'Llegó',
  attention: 'En Atención', 
  done: 'Terminado', 
  cancelled: 'Cancelada' 
};

const STATUS_COLORS = { 
  pending: '#f6ad55', 
  confirmed: '#68d391', 
  on_the_way: '#3b82f6',
  arrived: '#06b6d4',
  attention: '#63b3ed', 
  done: '#48bb78',
  cancelled: '#fc8181'
};

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const { colors } = useTheme();
  const [employee, setEmployee] = useState(null);
  const [business, setBusiness] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const appointmentsRef = useRef([]); // Ref persistente para sobrevivir desconexiones
  const [, forceRender] = useState({}); // Estado dummy para forzar re-render
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDate, setSelectedDate] = useState(() => {
    return new Date().toLocaleDateString('en-CA', { timeZone: 'America/Bogota' });
  });

  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [completeAppointmentData, setCompleteAppointmentData] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [completing, setCompleting] = useState(false);

  const [showAdditionalModal, setShowAdditionalModal] = useState(false);
  const [selectedApt, setSelectedApt] = useState(null);
  const [additionalForm, setAdditionalForm] = useState({
    additionalAmount: '',
    additionalNote: ''
  });
  const [savingAdditional, setSavingAdditional] = useState(false);

  const [showExpressModal, setShowExpressModal] = useState(false);
  const [expressForm, setExpressForm] = useState({
    clientName: '',
    clientPhone: '',
    serviceId: ''
  });
  const [services, setServices] = useState([]);

  // Estados para extender tiempo
  const [showExtendModal, setShowExtendModal] = useState(false);
  const [extendingAppointment, setExtendingAppointment] = useState(null);
  const [extendMinutes, setExtendMinutes] = useState(15);
  const [savingExtend, setSavingExtend] = useState(false);
  const [showExtendConfirm, setShowExtendConfirm] = useState(false);

  // Estados para notas
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [notesAppointment, setNotesAppointment] = useState(null);
  const [notes, setNotes] = useState([]);
  const [newNoteContent, setNewNoteContent] = useState('');
  const [loadingNotes, setLoadingNotes] = useState(false);
  const [savingNote, setSavingNote] = useState(false);

  // Estados para seguimiento de técnicos de campo (flujo de insumos)
  const [showInsumosModal, setShowInsumosModal] = useState(false);
  const [insumosAppointment, setInsumosAppointment] = useState(null);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [selectedInsumos, setSelectedInsumos] = useState([]);
  const [loadingInventory, setLoadingInventory] = useState(false);
  const [savingInsumos, setSavingInsumos] = useState(false);
  const [workNotes, setWorkNotes] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [solution, setSolution] = useState('');
  const [recommendations, setRecommendations] = useState('');
  const [statusMsg, setStatusMsg] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all'); // Filtro de estado: all, pending, confirmed, attention, done, cancelled

  useEffect(() => {
    loadEmployeeInfo();
  }, []);

  useEffect(() => {
    if (employee?.businessId) {
      loadServices(employee.businessId);
    }
  }, [employee]);

  const loadServices = async (businessId) => {
    try {
      const res = await api.get('/services', { params: { businessId, active: true } });
      setServices(res.data);
    } catch (err) {
      console.error('Error al cargar servicios');
    }
  };

  const handleCreateExpress = async () => {
    if (!expressForm.serviceId) {
      alert('Por favor selecciona un servicio');
      return;
    }
    setCompleting(true);
    try {
      const now = new Date();
      await api.post('/appointments', {
        businessId: employee.businessId,
        serviceId: expressForm.serviceId,
        employeeId: employee.id,
        clientName: expressForm.clientName,
        clientPhone: expressForm.clientPhone,
        startTime: now.toISOString(),
        status: 'attention'
      });
      loadAppointments();
      setShowExpressModal(false);
      setExpressForm({ clientName: '', clientPhone: '', serviceId: '' });
    } catch (e) {
      alert(e.response?.data?.error || 'Error al crear cita express');
    } finally {
      setCompleting(false);
    }
  };

  const loadEmployeeInfo = async () => {
    try {
      const response = await api.get('/employees/me/info');
      setEmployee(response.data);
      // También cargar info del negocio
      if (response.data?.businessId) {
        try {
          const bizRes = await api.get(`/businesses/by-id/${response.data.businessId}/public`);
          setBusiness(bizRes.data);
          console.log('Business cargado:', bizRes.data);
          console.log('hasFieldTechnicians:', bizRes.data?.hasFieldTechnicians);
        } catch (bizErr) {
          console.error('Error cargando negocio:', bizErr);
          setError('Error al cargar información del negocio');
        }
      } else {
        console.warn('Empleado sin businessId');
      }
    } catch (err) {
      console.error('Error cargando empleado:', err);
      setError('Error al cargar información del empleado');
    }
  };

  useEffect(() => {
    if (employee) {
      loadAppointments();
    }
  }, [employee, selectedDate]);

  // 🔔 Callbacks SOCKET.IO estables - SIN dependencias para evitar reconexiones
  const handleNewAssigned = useCallback((appointment) => {
    // Transformar al formato que espera el componente
    const normalizedAppointment = {
      id: appointment.id,
      startTime: appointment.startTime,
      endTime: appointment.endTime,
      clientName: appointment.clientName,
      clientPhone: appointment.clientPhone,
      status: appointment.status,
      Service: appointment.Service,
      technicianStatus: appointment.technicianStatus,
      ...appointment
    };

    // Usar ref para verificar duplicados (más estable)
    if (appointmentsRef.current.find(a => a.id === appointment.id)) {
      return;
    }

    // Actualizar ref primero (persistente) y luego estado
    const newAppointments = [...appointmentsRef.current, normalizedAppointment];
    appointmentsRef.current = newAppointments;
    setAppointments(newAppointments);
    forceRender({}); // FORZAR RE-RENDER

    showStatus(`📅 Nueva cita: ${appointment.clientName}`, 'info');
  }, []); // <- SIN dependencias

  const handleAppointmentUpdated = useCallback((appointment) => {
    const newAppointments = appointmentsRef.current.map(a => 
      a.id === appointment.id 
        ? { ...a, ...appointment, Service: appointment.Service || a.Service } 
        : a
    );
    appointmentsRef.current = newAppointments;
    setAppointments(newAppointments);
    forceRender({}); // FORZAR RE-RENDER
  }, []); // <- SIN dependencias

  const handleAppointmentCancelled = useCallback((appointment) => {
    const newAppointments = appointmentsRef.current.filter(a => a.id !== appointment.id);
    appointmentsRef.current = newAppointments;
    setAppointments(newAppointments);
    forceRender({}); // FORZAR RE-RENDER
    showStatus('❌ Cita cancelada', 'warning');
  }, []); // <- SIN dependencias

  // 🔔 SOCKET.IO: Actualizaciones en tiempo real
  const { subscribeToEmployeeAppointments, unsubscribeFromAppointments, isConnected } = useSocket({
    businessId: employee?.businessId,
    employeeId: employee?.id,
    role: 'employee',
    onNewAssigned: handleNewAssigned,
    onAppointmentUpdated: handleAppointmentUpdated,
    onAppointmentCancelled: handleAppointmentCancelled
  });

  // 🔔 Suscribirse a citas del empleado cuando cambia la fecha o el empleado
  useEffect(() => {
    if (employee?.id && selectedDate && isConnected) {
      subscribeToEmployeeAppointments(employee.id, selectedDate);
    }
    // Cleanup: desuscribirse cuando cambia la fecha o se desmonta
    return () => {
      if (employee?.id && selectedDate) {
        unsubscribeFromAppointments(employee.id, selectedDate);
      }
    };
  }, [employee?.id, selectedDate, isConnected, subscribeToEmployeeAppointments, unsubscribeFromAppointments]);

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

  const loadAppointments = async () => {
    try {
      setLoading(true);
      // El backend busca desde startDate 00:00 hasta endDate 23:59
      // Para un solo día, enviamos el mismo día en ambos parámetros
      const startDate = selectedDate;
      const endDate = selectedDate;
      
      const response = await api.get(`/employees/${employee.id}/appointments`, {
        params: {
          startDate: startDate,
          endDate: endDate
        }
      });
      setAppointments(response.data);
      appointmentsRef.current = response.data; // Sincronizar ref
    } catch (err) {
      setError('Error al cargar citas');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, status, apt = null) => {
    if (status === 'done') {
      setCompleteAppointmentData(apt || { id });
      setPaymentMethod('cash');
      setShowCompleteModal(true);
      return;
    }
    try {
      // Para técnicos de campo, usar endpoint específico para estados de seguimiento
      const isTechnicianStatus = ['on_the_way', 'arrived', 'in_progress'].includes(status);
      if (business?.hasFieldTechnicians && isTechnicianStatus) {
        await api.patch(`/appointments/${id}/technician-status`, { status });
      } else {
        await api.patch(`/appointments/${id}/status`, { status });
      }
      loadAppointments();
    } catch (e) {
      alert(e.response?.data?.error || 'Error al actualizar el estado de la cita');
    }
  };

  // Completar cita directamente sin modal de pago (para técnicos de campo)
  const handleCompleteTechnician = async (id) => {
    setCompleting(true);
    try {
      await api.patch(`/appointments/${id}/status`, { status: 'done' });
      loadAppointments();
      showStatus('Cita completada exitosamente');
    } catch (e) {
      alert(e.response?.data?.error || 'Error al completar cita');
    } finally {
      setCompleting(false);
    }
  };

  const handleCompleteAppointment = async () => {
    if (!completeAppointmentData) return;
    setCompleting(true);
    try {
      // Si el empleado agregó información adicional en el modal de completado,
      // primero actualizamos el cargo adicional
      if (additionalForm.additionalAmount) {
        await api.patch(`/appointments/${completeAppointmentData.id}/additional-charge`, {
          additionalAmount: parseFloat(additionalForm.additionalAmount) || 0,
          additionalNote: additionalForm.additionalNote
        });
      }

      await api.patch(`/appointments/${completeAppointmentData.id}/status`, { 
        status: 'done',
        paymentMethod: paymentMethod 
      });
      loadAppointments();
      setShowCompleteModal(false);
      setCompleteAppointmentData(null);
      setAdditionalForm({ additionalAmount: '', additionalNote: '' });
    } catch (e) {
      alert(e.response?.data?.error || 'Error al completar cita');
    } finally {
      setCompleting(false);
    }
  };

  const handleOpenAdditionalModal = (apt) => {
    setSelectedApt(apt);
    setAdditionalForm({
      additionalAmount: apt.additionalAmount || '',
      additionalNote: apt.additionalNote || ''
    });
    setShowAdditionalModal(true);
  };

  const handleSaveAdditionalCharge = async () => {
    if (!selectedApt) return;
    setSavingAdditional(true);
    try {
      await api.patch(`/appointments/${selectedApt.id}/additional-charge`, {
        additionalAmount: parseFloat(additionalForm.additionalAmount) || 0,
        additionalNote: additionalForm.additionalNote
      });
      loadAppointments();
      setShowAdditionalModal(false);
      setSelectedApt(null);
    } catch (e) {
      alert(e.response?.data?.error || 'Error al guardar cargo adicional');
    } finally {
      setSavingAdditional(false);
    }
  };

  const [showChangePwModal, setShowChangePwModal] = useState(false);
  const [pwForm, setPwForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [pwLoading, setPwLoading] = useState(false);
  const [pwSuccess, setPwSuccess] = useState(false);
  const [showPasswords, setShowPasswords] = useState({ old: false, new: false, confirm: false });

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      alert('Las contraseñas no coinciden');
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
      alert(err.response?.data?.error || 'Error al cambiar la contraseña');
    } finally {
      setPwLoading(false);
    }
  };

  // Handler para extender tiempo - abre modal de confirmación
  const handleExtendTimeRequest = () => {
    setShowExtendConfirm(true);
  };

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
      loadAppointments();
    } catch (e) {
      alert(e.response?.data?.error || 'Error al extender tiempo');
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
    } catch (e) {
      alert('Error al agregar nota');
    } finally {
      setSavingNote(false);
    }
  };

  // ============ HANDLERS PARA TÉCNICOS DE CAMPO ============

  // Mostrar mensaje de estado
  const showStatus = (text, type = 'success') => {
    setStatusMsg({ text, type });
    setTimeout(() => setStatusMsg(null), 3000);
  };

  // Cargar inventario para seleccionar insumos
  const loadInventory = async () => {
    if (!employee?.businessId) return;
    setLoadingInventory(true);
    try {
      const res = await api.get('/inventory/items', { params: { businessId: employee.businessId } });
      setInventoryItems(res.data || []);
    } catch (e) {
      console.error('Error loading inventory:', e);
      setInventoryItems([]);
    } finally {
      setLoadingInventory(false);
    }
  };

  // Iniciar trabajo directamente sin modal (para técnicos de campo)
  const handleStartWorkDirectly = async (appointment) => {
    try {
      // Cambiar estado a in_progress usando el endpoint de técnico
      await api.patch(`/appointments/${appointment.id}/technician-status`, { status: 'in_progress' });
      loadAppointments();
    } catch (e) {
      alert(e.response?.data?.error || 'Error al iniciar trabajo');
    }
  };

  // Abrir modal de insumos
  const handleOpenInsumosModal = async (appointment) => {
    setInsumosAppointment(appointment);
    setSelectedInsumos([]);
    // Cargar datos del reporte técnico si existe
    const report = appointment.workReport || {};
    setDiagnosis(report.diagnosis || '');
    setSolution(report.solution || '');
    setRecommendations(report.recommendations || '');
    setWorkNotes(appointment.workNotes || '');
    await loadInventory();
    setShowInsumosModal(true);
  };

  // Agregar insumo seleccionado
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

  // Remover insumo
  const handleRemoveInsumo = (itemId) => {
    setSelectedInsumos(prev => prev.filter(i => i.itemId !== itemId));
  };

  // Guardar insumos e iniciar trabajo
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
          notes: `Usado en cita #${insumosAppointment.id} - ${insumosAppointment.clientName || insumosAppointment.client}`,
          businessId: employee.businessId,
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
      loadAppointments();
    } catch (e) {
      showStatus(e.response?.data?.error || 'Error al guardar insumos', 'error');
    } finally {
      setSavingInsumos(false);
    }
  };

  // Agregar insumo al reporte
  const handleAddPart = (itemId, quantity) => {
    const item = inventoryItems.find(i => i.id === itemId);
    if (!item || quantity <= 0) return;
    
    setTechnicalReport(prev => ({
      ...prev,
      partsUsed: [...prev.partsUsed, {
        itemId: item.id,
        name: item.name,
        quantity: parseFloat(quantity),
        unit: item.unit
      }]
    }));
  };

  // Remover insumo del reporte
  const handleRemovePart = (index) => {
    setTechnicalReport(prev => ({
      ...prev,
      partsUsed: prev.partsUsed.filter((_, i) => i !== index)
    }));
  };

  // Guardar reporte técnico
  const handleSaveTechnicalReport = async () => {
    if (!technicalReportAppointment) return;
    
    setSavingTechnicalReport(true);
    try {
      await api.post(`/appointments/${technicalReportAppointment.id}/technical-report`, {
        diagnosis: technicalReport.diagnosis,
        solution: technicalReport.solution,
        recommendations: technicalReport.recommendations,
        partsUsed: technicalReport.partsUsed
      });
      
      loadAppointments();
      setShowTechnicalReportModal(false);
      setTechnicalReportAppointment(null);
    } catch (e) {
      alert(e.response?.data?.error || 'Error al guardar reporte');
    } finally {
      setSavingTechnicalReport(false);
    }
  };

  const getImgUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    const API_BASE_URL = api.defaults.baseURL || '';
    const BACKEND_URL = API_BASE_URL.replace(/\/api$/, '');
    const cleanUrl = url.startsWith('/') ? url : `/${url}`;
    return `${BACKEND_URL}${cleanUrl}`;
  };

  // Obtener iniciales para avatar placeholder
  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Filtrar y ordenar citas según el filtro de estado seleccionado
  const filteredAppointments = useMemo(() => {
    let filtered = appointments;
    if (statusFilter !== 'all') {
      filtered = appointments.filter(a => a.status === statusFilter);
    }
    // Ordenar: primero por prioridad de estado (confirmadas > en atención > pendientes > otras), luego por hora
    const statusPriority = {
      'confirmed': 1,     // Confirmadas primero (listas para atender)
      'in_progress': 2,     // En atención segundo
      'pending': 3,       // Pendientes tercero
      'done': 4,
      'completed': 4,
      'cancelled': 5
    };
    
    return filtered.sort((a, b) => {
      const priorityA = statusPriority[a.status] || 3;
      const priorityB = statusPriority[b.status] || 3;
      // Si tienen diferente prioridad, ordenar por prioridad
      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }
      // Si tienen misma prioridad, ordenar por hora
      return new Date(a.startTime) - new Date(b.startTime);
    });
  }, [appointments, statusFilter]);

  // Paginación de citas
  const paginatedAppointments = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAppointments.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAppointments, currentPage]);

  const totalPages = Math.ceil(filteredAppointments.length / itemsPerPage);

  // Reset a primera página cuando cambian las citas o el filtro
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter]);

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
    <EmployeeLayout>
      {/* Contenido */}
      <div>
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
        <div style={{
          display: 'flex',
          gap: 16,
          flexWrap: 'wrap',
          marginBottom: 24
        }}>
          <div style={{
            background: colors.cardBg,
            padding: 20,
            borderRadius: 12,
            boxShadow: `0 2px 8px ${colors.shadow}`,
            border: `1px solid ${colors.border}`,
            flex: 2,
            minWidth: 280
          }}>
            <label style={{
              display: 'block',
              fontSize: 14,
              fontWeight: 600,
              marginBottom: 10,
              color: colors.text
            }}>
              Selecciona una fecha para ver tu agenda
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              style={{
                padding: '10px 12px',
                border: `1px solid ${colors.inputBorder}`,
                borderRadius: 6,
                fontSize: 14,
                fontFamily: 'inherit',
                cursor: 'pointer',
                background: colors.inputBg,
                color: colors.text,
                width: '100%'
              }}
            />
          </div>

          {!business?.hasFieldTechnicians && (
            <button
              onClick={() => setShowExpressModal(true)}
              style={{
                flex: 1,
                minWidth: 150,
                background: '#f59e0b',
                color: 'white',
                border: 'none',
                borderRadius: 12,
                padding: '20px',
                fontSize: 16,
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8
              }}
            >
              <div style={{ fontSize: 24 }}>⚡</div>
              Cita Express
            </button>
          )}
        </div>

        {/* Citas del día */}
        <div style={{
          background: colors.cardBg,
          padding: 24,
          borderRadius: 12,
          boxShadow: `0 2px 8px ${colors.shadow}`,
          border: `1px solid ${colors.border}`
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
            <div style={{ marginBottom: 16, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {[
                { value: 'all', label: 'Todas', color: '#6b7280' },
                { value: 'pending', label: 'Pendientes', color: STATUS_COLORS.pending },
                { value: 'confirmed', label: 'Confirmadas', color: STATUS_COLORS.confirmed },
                { value: 'attention', label: 'En Atención', color: STATUS_COLORS.attention },
                { value: 'done', label: 'Completadas', color: STATUS_COLORS.done },
                { value: 'cancelled', label: 'Canceladas', color: STATUS_COLORS.cancelled }
              ].map(filter => (
                <button
                  key={filter.value}
                  onClick={() => setStatusFilter(filter.value)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: 20,
                    border: 'none',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                    background: statusFilter === filter.value ? filter.color : colors.bgSecondary,
                    color: statusFilter === filter.value ? 'white' : colors.text,
                    opacity: statusFilter === filter.value ? 1 : 0.8
                  }}
                >
                  {filter.label}
                  {filter.value !== 'all' && (
                    <span style={{ marginLeft: 6, fontSize: 11, opacity: 0.9 }}>
                      ({appointments.filter(a => a.status === filter.value).length})
                    </span>
                  )}
                </button>
              ))}
            </div>
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
              {paginatedAppointments.map((apt, index) => {
                const startTime = new Date(apt.startTime);
                const endTime = new Date(apt.endTime);
                const timeStr = startTime.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
                const endTimeStr = endTime.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });

                return (
                  <div key={apt.id} className="employee-appointment-card" style={{
                    padding: 20,
                    background: colors.cardBg,
                    border: `2px solid ${STATUS_COLORS[apt.status]}`,
                    borderRadius: 12,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 16,
                    boxShadow: `0 4px 6px ${colors.shadow}`
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 17, fontWeight: 700, color: colors.text }}>
                          {timeStr} - {endTimeStr}
                        </div>
                        <div style={{ fontSize: 15, fontWeight: 600, color: colors.text, marginTop: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {apt.clientName}
                        </div>
                        <div style={{ fontSize: 13, color: colors.primary, fontWeight: 600, marginTop: 2 }}>
                          {apt.Service?.name}
                        </div>
                        <div style={{ fontSize: 12, color: colors.textSecondary, marginTop: 4 }}>
                          📞 {apt.clientPhone}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <span style={{
                          display: 'inline-block',
                          padding: '4px 10px',
                          borderRadius: 20,
                          fontSize: 11,
                          fontWeight: 700,
                          background: STATUS_COLORS[apt.status],
                          color: 'white'
                        }}>
                          {STATUS_LABELS[apt.status]}
                        </span>
                      </div>
                    </div>

                    {/* Indicador de estado del técnico (solo para negocios con técnicos de campo) */}
                    {business?.hasFieldTechnicians && apt.technicianStatus && apt.technicianStatus !== 'not_started' && (
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 8, 
                        padding: '8px 12px', 
                        background: apt.technicianStatus === 'on_the_way' ? '#fef3c7' : apt.technicianStatus === 'arrived' ? '#dbeafe' : '#d1fae5',
                        borderRadius: 8,
                        marginBottom: 12,
                        fontSize: 12,
                        fontWeight: 600,
                        color: apt.technicianStatus === 'on_the_way' ? '#92400e' : apt.technicianStatus === 'arrived' ? '#1e40af' : '#065f46'
                      }}>
                        {apt.technicianStatus === 'on_the_way' && '🚗 En Camino'}
                        {apt.technicianStatus === 'arrived' && '📍 Llegó al Destino'}
                        {apt.technicianStatus === 'in_progress' && '🔧 En Atención'}
                        {apt.travelStartTime && apt.technicianStatus === 'on_the_way' && (
                          <span style={{ fontWeight: 400, marginLeft: 8 }}>
                            (Salió: {new Date(apt.travelStartTime).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })})
                          </span>
                        )}
                        {apt.arrivalTime && apt.technicianStatus === 'arrived' && (
                          <span style={{ fontWeight: 400, marginLeft: 8 }}>
                            (Llegó: {new Date(apt.arrivalTime).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })})
                          </span>
                        )}
                      </div>
                    )}

                    <div className="employee-appointment-actions" style={{ display: 'flex', gap: 8, flexWrap: 'wrap', borderTop: `1px solid ${colors.border}`, paddingTop: 16 }}>
                      {/* ========== UI PARA TÉCNICOS DE CAMPO ========== */}
                      {business?.hasFieldTechnicians ? (
                        <>
                          {/* Flujo estricto: pending → confirmed → on_the_way → arrived → attention → done */}
                          {/* Botón Confirmar - cuando está pendiente */}
                          {apt.status === 'pending' && (
                            <button
                              onClick={() => handleStatusUpdate(apt.id, 'confirmed')}
                              style={{ padding: '8px 14px', fontSize: 13, fontWeight: 600, borderRadius: 6, border: 'none', background: '#68d391', color: 'white', cursor: 'pointer', flex: 1, minWidth: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}
                            >
                              <CheckCircle2 size={14} /> Confirmar
                            </button>
                          )}
                          {/* Botón Cancelar para pendientes */}
                          {apt.status === 'pending' && (
                            <button onClick={() => handleStatusUpdate(apt.id, 'cancelled')} style={{ padding: '8px 14px', fontSize: 13, background: '#ef4444', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600, flex: 1, minWidth: 100 }}>
                              Cancelar
                            </button>
                          )}
                          {/* Botón En Camino - solo si está confirmada y no ha iniciado viaje */}
                          {apt.status === 'confirmed' && (!apt.technicianStatus || apt.technicianStatus === 'not_started') && (
                            <button
                              onClick={() => handleStatusUpdate(apt.id, 'on_the_way')}
                              style={{ padding: '8px 14px', fontSize: 13, fontWeight: 600, borderRadius: 6, border: 'none', background: '#3b82f6', color: 'white', cursor: 'pointer', flex: 1, minWidth: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}
                            >
                              <Car size={14} /> En Camino
                            </button>
                          )}
                          {/* Botón Llegué - cuando está en camino */}
                          {apt.technicianStatus === 'on_the_way' && (
                            <button
                              onClick={() => handleStatusUpdate(apt.id, 'arrived')}
                              style={{ padding: '8px 14px', fontSize: 13, fontWeight: 600, borderRadius: 6, border: 'none', background: '#06b6d4', color: 'white', cursor: 'pointer', flex: 1, minWidth: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}
                            >
                              <MapPin size={14} /> Llegué
                            </button>
                          )}
                          {/* Botones cuando llegó al destino: Iniciar Trabajo e Insumos lado a lado */}
                          {apt.technicianStatus === 'arrived' && apt.status !== 'attention' && (
                            <>
                              <button
                                onClick={() => handleStartWorkDirectly(apt)}
                                style={{ padding: '8px 14px', fontSize: 13, fontWeight: 600, borderRadius: 6, border: 'none', background: '#8b5cf6', color: 'white', cursor: 'pointer', flex: 1, minWidth: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}
                              >
                                <Play size={14} /> Iniciar Trabajo
                              </button>
                              <button
                                onClick={() => handleOpenInsumosModal(apt)}
                                style={{ padding: '8px 14px', fontSize: 13, fontWeight: 600, borderRadius: 6, border: 'none', background: '#f59e0b', color: 'white', cursor: 'pointer', flex: 1, minWidth: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}
                              >
                                <Package size={14} /> Insumos
                              </button>
                            </>
                          )}
                          {apt.status === 'attention' && (
                            <>
                              <button
                                onClick={() => handleOpenInsumosModal(apt)}
                                style={{ padding: '8px 14px', fontSize: 13, fontWeight: 600, borderRadius: 6, border: 'none', background: '#f59e0b', color: 'white', cursor: 'pointer', flex: 1, minWidth: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}
                              >
                                <Package size={14} /> Insumos
                              </button>
                              <button
                                onClick={() => handleCompleteTechnician(apt.id)}
                                disabled={completing}
                                style={{ padding: '8px 14px', fontSize: 13, fontWeight: 600, borderRadius: 6, border: 'none', background: '#22c55e', color: 'white', cursor: completing ? 'not-allowed' : 'pointer', opacity: completing ? 0.6 : 1, flex: 1, minWidth: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}
                              >
                                <CheckCircle2 size={14} /> {completing ? 'Completando...' : 'Completar'}
                              </button>
                            </>
                          )}
                          
                          {/* Botón Cancelar siempre disponibles para técnicos de campo */}
                          {(apt.status === 'confirmed' || apt.status === 'attention') && (
                            <button onClick={() => handleStatusUpdate(apt.id, 'cancelled')} style={{ padding: '8px 14px', fontSize: 13, background: '#ef4444', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600, flex: 1, minWidth: 100 }}>
                              Cancelar
                            </button>
                          )}
                        </>
                      ) : (
                        <>
                          {/* ========== UI NORMAL (NO TÉCNICOS DE CAMPO) ========== */}
                          {/* Mensaje cuando no se ha cargado el negocio */}
                          {!business && (
                            <div style={{ 
                              padding: '8px 12px', 
                              background: '#fee2e2', 
                              borderRadius: 6, 
                              fontSize: 12, 
                              color: '#991b1b',
                              marginBottom: 8,
                              width: '100%'
                            }}>
                              ⚠️ No se pudo cargar la información del negocio. Recarga la página.
                            </div>
                          )}
                          {/* Mensaje informativo cuando no tiene seguimiento habilitado */}
                          {business && !business.hasFieldTechnicians && (
                            <div style={{ 
                              padding: '8px 12px', 
                              background: colors.bgSecondary, 
                              borderRadius: 6, 
                              fontSize: 12, 
                              color: colors.textSecondary,
                              marginBottom: 8,
                              width: '100%'
                            }}>
                              ℹ️ Seguimiento no disponible. El negocio no tiene activada la opción "Técnicos a domicilio".
                            </div>
                          )}
                          {apt.status === 'pending' && (
                            <button onClick={() => handleStatusUpdate(apt.id, 'confirmed')} className="btn-primary" style={{ padding: '8px 14px', fontSize: 13, flex: 1, minWidth: 100 }}>
                              Confirmar
                            </button>
                          )}
                          {apt.status === 'confirmed' && (
                            <>
                              <button onClick={() => handleStatusUpdate(apt.id, 'attention')} className="btn-primary" style={{ padding: '8px 14px', fontSize: 13, background: STATUS_COLORS.attention, flex: 1, minWidth: 100 }}>
                                Iniciar Atención
                              </button>
                              <button onClick={() => handleStatusUpdate(apt.id, 'done', apt)} className="btn-primary" style={{ padding: '8px 14px', fontSize: 13, background: STATUS_COLORS.done, flex: 1, minWidth: 100 }}>
                                Completar
                              </button>
                              <button onClick={() => handleOpenAdditionalModal(apt)} style={{ padding: '8px 14px', fontSize: 13, background: '#f59e0b', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600, flex: 1, minWidth: 100 }}>
                                Adicional
                              </button>
                            </>
                          )}
                          {apt.status === 'attention' && (
                            <>
                              <button onClick={() => handleStatusUpdate(apt.id, 'done', apt)} className="btn-primary" style={{ padding: '8px 14px', fontSize: 13, background: STATUS_COLORS.done, flex: 1, minWidth: 100 }}>
                                Terminar
                              </button>
                              <button onClick={() => handleOpenAdditionalModal(apt)} style={{ padding: '8px 14px', fontSize: 13, background: '#f59e0b', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600, flex: 1, minWidth: 100 }}>
                                Adicional
                              </button>
                              <button onClick={() => { setExtendingAppointment(apt); setExtendMinutes(15); setShowExtendModal(true); }} style={{ padding: '8px 14px', fontSize: 13, background: '#f97316', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600, flex: 1, minWidth: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                                <Timer size={14} /> Extender
                              </button>
                            </>
                          )}
                          {/* Botón Notas - disponible en todos los estados */}
                          <button onClick={() => handleOpenNotesModal(apt)} style={{ padding: '8px 14px', fontSize: 13, background: '#14b8a6', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600, flex: 1, minWidth: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                            <MessageSquare size={14} /> Notas
                          </button>
                          {(apt.status === 'pending' || apt.status === 'confirmed' || apt.status === 'attention') && (
                            <button onClick={() => handleStatusUpdate(apt.id, 'cancelled')} style={{ padding: '8px 14px', fontSize: 13, background: '#ef4444', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600, flex: 1, minWidth: 100 }}>
                              Cancelar
                            </button>
                          )}
                        </>
                      )}
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
              gap: 12, 
              marginTop: 20,
              padding: 16,
              background: colors.cardBg,
              borderRadius: 12
            }}>
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                style={{
                  padding: '10px 20px',
                  borderRadius: 8,
                  border: 'none',
                  background: currentPage === 1 ? colors.bgSecondary : colors.primary,
                  color: currentPage === 1 ? colors.textSecondary : 'white',
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                  fontSize: 14,
                  fontWeight: 600
                }}
              >
                ← Anterior
              </button>
              
              <span style={{ 
                fontSize: 15, 
                color: colors.text,
                fontWeight: 600,
                minWidth: 100,
                textAlign: 'center'
              }}>
                Página {currentPage} de {totalPages}
              </span>
              
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                style={{
                  padding: '10px 20px',
                  borderRadius: 8,
                  border: 'none',
                  background: currentPage === totalPages ? colors.bgSecondary : colors.primary,
                  color: currentPage === totalPages ? colors.textSecondary : 'white',
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                  fontSize: 14,
                  fontWeight: 600
                }}
              >
                Siguiente →
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal Cita Express */}
      {showExpressModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', 
          zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16
        }}>
          <div style={{
            background: colors.cardBg, padding: 24, borderRadius: 16, 
            maxWidth: 400, width: '100%', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
            border: `1px solid ${colors.border}`
          }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: colors.text, marginBottom: 8 }}>⚡ Cita Express</h2>
            <p style={{ fontSize: 14, color: colors.textSecondary, marginBottom: 20 }}>
              Registra un cliente que acaba de llegar para atenderlo de inmediato.
            </p>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: colors.text }}>Nombre del Cliente</label>
              <input 
                type="text"
                value={expressForm.clientName}
                onChange={e => setExpressForm({ ...expressForm, clientName: e.target.value })}
                placeholder="Nombre completo"
                style={{ width: '100%', padding: '10px', borderRadius: 8, border: `1px solid ${colors.border}`, background: colors.inputBg, color: colors.text }}
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: colors.text }}>Teléfono del Cliente</label>
              <input 
                type="tel"
                value={expressForm.clientPhone}
                onChange={e => setExpressForm({ ...expressForm, clientPhone: e.target.value })}
                placeholder="Ej: 3001234567"
                style={{ width: '100%', padding: '10px', borderRadius: 8, border: `1px solid ${colors.border}`, background: colors.inputBg, color: colors.text }}
              />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: colors.text }}>Servicio</label>
              <select 
                value={expressForm.serviceId}
                onChange={e => setExpressForm({ ...expressForm, serviceId: e.target.value })}
                style={{ width: '100%', padding: '10px', borderRadius: 8, border: `1px solid ${colors.border}`, background: colors.inputBg, color: colors.text }}
              >
                <option value="">Selecciona un servicio</option>
                {services.map(s => (
                  <option key={s.id} value={s.id}>{s.name} ({s.durationMin} min)</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button 
                onClick={() => setShowExpressModal(false)}
                style={{ flex: 1, padding: '12px', borderRadius: 8, border: 'none', background: colors.bgSecondary, color: colors.text, fontWeight: 600, cursor: 'pointer' }}
              >
                Cancelar
              </button>
              <button 
                onClick={handleCreateExpress}
                disabled={completing}
                style={{ flex: 1, padding: '12px', borderRadius: 8, border: 'none', background: '#f59e0b', color: 'white', fontWeight: 700, cursor: 'pointer' }}
              >
                {completing ? 'Cargando...' : 'Atender Ya'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Cambiar Contraseña */}
      {showChangePwModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: colors.cardBg, padding: 24, borderRadius: 16, maxWidth: 400, width: '100%', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: colors.text, marginBottom: 8 }}>Cambiar Contraseña</h2>
            <p style={{ fontSize: 14, color: colors.textSecondary, marginBottom: 20 }}>Ingresa tu clave actual y la nueva para actualizarla.</p>
            
            <form onSubmit={handlePasswordChange}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: colors.text }}>Contraseña Actual</label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type={showPasswords.old ? 'text' : 'password'}
                    value={pwForm.oldPassword}
                    onChange={e => setPwForm({ ...pwForm, oldPassword: e.target.value })}
                    required
                    style={{ width: '100%', padding: '10px 40px 10px 12px', borderRadius: 8, border: `1px solid ${colors.border}`, background: colors.inputBg, color: colors.text }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, old: !showPasswords.old })}
                    style={{
                      position: 'absolute',
                      right: '8px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '4px',
                      color: colors.textSecondary
                    }}
                  >
                    {showPasswords.old ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: colors.text }}>Nueva Contraseña</label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type={showPasswords.new ? 'text' : 'password'}
                    value={pwForm.newPassword}
                    onChange={e => setPwForm({ ...pwForm, newPassword: e.target.value })}
                    required
                    style={{ width: '100%', padding: '10px 40px 10px 12px', borderRadius: 8, border: `1px solid ${colors.border}`, background: colors.inputBg, color: colors.text }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                    style={{
                      position: 'absolute',
                      right: '8px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '4px',
                      color: colors.textSecondary
                    }}
                  >
                    {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: colors.text }}>Confirmar Nueva Contraseña</label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type={showPasswords.confirm ? 'text' : 'password'}
                    value={pwForm.confirmPassword}
                    onChange={e => setPwForm({ ...pwForm, confirmPassword: e.target.value })}
                    required
                    style={{ width: '100%', padding: '10px 40px 10px 12px', borderRadius: 8, border: `1px solid ${colors.border}`, background: colors.inputBg, color: colors.text }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                    style={{
                      position: 'absolute',
                      right: '8px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '4px',
                      color: colors.textSecondary
                    }}
                  >
                    {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: 12 }}>
                <button 
                  type="button" 
                  onClick={() => setShowChangePwModal(false)}
                  style={{ flex: 1, padding: '12px', borderRadius: 8, border: 'none', background: colors.bgSecondary, color: colors.text, fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={pwLoading}
                  style={{ flex: 1, padding: '12px', borderRadius: 8, border: 'none', background: colors.primary, color: 'white', fontWeight: 700, cursor: 'pointer' }}
                >
                  {pwLoading ? 'Guardando...' : 'Actualizar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal para completar cita con método de pago */}
      {showCompleteModal && completeAppointmentData && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', zIndex: 3000
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

            <div style={{ marginBottom: '20px', padding: '12px', background: colors.bgSecondary, borderRadius: '8px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: colors.text, fontSize: '13px' }}>
                ¿Hubo algún cargo adicional? (Opcional)
              </label>
              <input
                type="number"
                value={additionalForm.additionalAmount}
                onChange={(e) => setAdditionalForm({...additionalForm, additionalAmount: e.target.value})}
                placeholder="Monto adicional (ej: 5000)"
                style={{
                  width: '100%', padding: '10px', border: `1px solid ${colors.border}`,
                  borderRadius: '6px', fontSize: '14px', background: colors.inputBg,
                  color: colors.text, marginBottom: '10px'
                }}
              />
              <textarea
                value={additionalForm.additionalNote}
                onChange={(e) => setAdditionalForm({...additionalForm, additionalNote: e.target.value})}
                placeholder="¿Qué se hizo adicional? (ej: diseño extra)"
                rows={2}
                style={{
                  width: '100%', padding: '10px', border: `1px solid ${colors.border}`,
                  borderRadius: '6px', fontSize: '14px', background: colors.inputBg,
                  color: colors.text, resize: 'none'
                }}
              />
            </div>

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
                  width: 20, height: 20, borderRadius: '50%', border: `2px solid ${paymentMethod === 'cash' ? colors.primary : colors.textSecondary}`,
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
                  width: 20, height: 20, borderRadius: '50%', border: `2px solid ${paymentMethod === 'transfer' ? colors.primary : colors.textSecondary}`,
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

      {/* Modal para cargo adicional standalone */}
      {showAdditionalModal && selectedApt && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', zIndex: 3000
        }}>
          <div style={{
            background: colors.cardBg, borderRadius: '16px', padding: '28px',
            maxWidth: '420px', width: '90%', border: `1px solid ${colors.border}`
          }}>
            <h2 style={{ margin: '0 0 16px 0', fontSize: '20px', fontWeight: 800, color: colors.text }}>
              💰 Cargo Adicional
            </h2>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: colors.text }}>
                Monto Adicional ($)
              </label>
              <input
                type="number"
                value={additionalForm.additionalAmount}
                onChange={(e) => setAdditionalForm({...additionalForm, additionalAmount: e.target.value})}
                placeholder="Ej: 5000"
                style={{
                  width: '100%', padding: '12px', border: `1px solid ${colors.border}`,
                  borderRadius: '10px', fontSize: '16px', background: colors.inputBg,
                  color: colors.text, marginBottom: '20px'
                }}
              />
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: colors.text }}>
                ¿Qué se hizo?
              </label>
              <textarea
                value={additionalForm.additionalNote}
                onChange={(e) => setAdditionalForm({...additionalForm, additionalNote: e.target.value})}
                placeholder="Describe el trabajo extra realizado..."
                rows={3}
                style={{
                  width: '100%', padding: '12px', border: `1px solid ${colors.border}`,
                  borderRadius: '10px', fontSize: '16px', background: colors.inputBg,
                  color: colors.text, resize: 'none'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => {
                  setShowAdditionalModal(false);
                  setSelectedApt(null);
                  setAdditionalForm({ additionalAmount: '', additionalNote: '' });
                }}
                style={{
                  flex: 1, background: 'transparent', color: colors.textSecondary,
                  border: `1px solid ${colors.border}`, borderRadius: '10px',
                  padding: '12px', fontSize: '14px', fontWeight: 600, cursor: 'pointer'
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveAdditionalCharge}
                disabled={savingAdditional}
                style={{
                  flex: 2, background: colors.primary, color: 'white',
                  border: 'none', borderRadius: '10px', padding: '12px',
                  fontSize: '14px', fontWeight: 700, cursor: savingAdditional ? 'not-allowed' : 'pointer'
                }}
              >
                {savingAdditional ? 'Guardando...' : 'Guardar'}
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
          alignItems: 'center', justifyContent: 'center', zIndex: 3000
        }}>
          <div style={{
            background: colors.cardBg, borderRadius: '16px', padding: '28px',
            maxWidth: '400px', width: '90%', border: `1px solid ${colors.border}`
          }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8, color: colors.text }}>
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
                      padding: '10px 16px',
                      borderRadius: 8,
                      border: extendMinutes === min ? '2px solid #f97316' : `1px solid ${colors.border}`,
                      background: extendMinutes === min ? '#fff7ed' : colors.inputBg,
                      color: extendMinutes === min ? '#f97316' : colors.text,
                      fontWeight: 600,
                      cursor: 'pointer',
                      flex: 1,
                      minWidth: 60
                    }}
                  >
                    +{min}m
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button 
                onClick={() => { setShowExtendModal(false); setExtendingAppointment(null); }} 
                style={{ 
                  flex: 1, padding: '12px', borderRadius: 10, 
                  border: `1px solid ${colors.border}`, 
                  background: 'none', 
                  color: colors.text,
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Cancelar
              </button>
              <button 
                onClick={handleExtendTimeRequest} 
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
                onClick={handleExtendConfirm} 
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

      {/* Modal de Notas */}
      {showNotesModal && notesAppointment && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', zIndex: 3000
        }}>
          <div style={{
            background: colors.cardBg, borderRadius: '16px', padding: '28px',
            maxWidth: '480px', width: '90%', maxHeight: '70vh', overflowY: 'auto',
            border: `1px solid ${colors.border}`
          }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8, color: colors.text }}>
              📝 Notas de la Cita
            </h2>
            <p style={{ fontSize: 14, color: colors.textSecondary, marginBottom: 20 }}>
              {notesAppointment.clientName} • {notesAppointment.Service?.name}
            </p>

            {/* Lista de notas */}
            <div style={{ marginBottom: 20, maxHeight: 200, overflowY: 'auto' }}>
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
                    marginBottom: 8
                  }}>
                    <p style={{ margin: 0, fontSize: 14, color: colors.text, whiteSpace: 'pre-wrap' }}>{note.content}</p>
                    <div style={{ marginTop: 6, fontSize: 11, color: colors.textMuted }}>
                      {note.authorName || 'Sistema'} • {new Date(note.createdAt).toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' })}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Agregar nueva nota */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: colors.text }}>
                Agregar nota
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
                style={{ 
                  flex: 1, padding: '12px', borderRadius: 10, 
                  border: `1px solid ${colors.border}`, 
                  background: 'none', 
                  color: colors.text,
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Cerrar
              </button>
              <button 
                onClick={handleAddNote} 
                disabled={savingNote || !newNoteContent.trim()}
                style={{ 
                  flex: 1, padding: '12px', borderRadius: 10, 
                  border: 'none', 
                  background: '#14b8a6', 
                  color: 'white', 
                  fontWeight: 700, 
                  cursor: (savingNote || !newNoteContent.trim()) ? 'not-allowed' : 'pointer',
                  opacity: (savingNote || !newNoteContent.trim()) ? 0.7 : 1
                }}
              >
                {savingNote ? 'Guardando...' : 'Agregar Nota'}
              </button>
            </div>
          </div>
        </div>
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
              Cliente: <strong>{insumosAppointment.clientName || insumosAppointment.client}</strong> • {' '}
              Servicio: <strong>{insumosAppointment.service || insumosAppointment.Service?.name}</strong>
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
                  No hay insumos registrados en el inventario.
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
                          Stock: {item.currentStock} {item.unit}
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
    </EmployeeLayout>
  );
}

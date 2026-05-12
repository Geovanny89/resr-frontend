import { useState, useEffect, useRef } from 'react';
import api from '../../../api/client';
import { getColombiaDateStr, getColombiaMonthStr, fmt, fmtDate, fmtTime } from '../utils';

export const useEmployeeCommissions = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [view, setView] = useState('month');
  const [currentDate, setCurrentDate] = useState(() => getColombiaDateStr());
  const [currentPage, setCurrentPage] = useState(1);
  const [statusMsg, setStatusMsg] = useState(null);

  // Estados para flujo de técnicos de campo (insumos y estados)
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
  const [workEvidences, setWorkEvidences] = useState([]);

  // Ref para rastrear la última petición y evitar race conditions
  const lastRequestRef = useRef(null);

  useEffect(() => {
    loadCommissions();
  }, [view, currentDate, currentPage]);

  const loadCommissions = async () => {
    const requestId = Date.now();
    lastRequestRef.current = requestId;
    
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/employees/me/commissions', {
        params: { 
          view, 
          date: view === 'month' ? currentDate.slice(0, 7) : currentDate,
          page: currentPage,
          limit: 10
        }
      });
      
      if (lastRequestRef.current !== requestId) {
        console.log('[FRONTEND] Ignoring stale response for', currentDate);
        return;
      }
      
      setData(res.data);
      console.log('[FRONTEND] Received data for', currentDate, ':', res.data);
    } catch (err) {
      if (lastRequestRef.current !== requestId) return;
      setError(err.response?.data?.error || 'Error al cargar comisiones');
    } finally {
      setLoading(false);
    }
  };

  const showStatus = (text, type = 'success') => {
    setStatusMsg({ text, type });
    setTimeout(() => setStatusMsg(null), 3000);
  };

  const loadInventoryItems = async () => {
    if (!data?.business?.enabledModules?.inventory) return;
    setLoadingInventory(true);
    try {
      const res = await api.get('/inventory/items', {
        params: { businessId: data.business.id }
      });
      setInventoryItems(res.data || []);
    } catch (e) {
      console.error('Error cargando insumos:', e);
      setInventoryItems([]);
    } finally {
      setLoadingInventory(false);
    }
  };

const handleStatusChange = async (appointment, newStatus) => {
  try {
    const isTechnicianStatus = ['on_the_way', 'arrived', 'in_progress'].includes(newStatus);

    if (data?.hasFieldTechnicians && isTechnicianStatus) {
      await api.patch(`/appointments/${appointment.id}/technician-status`, { status: newStatus });
    } else {
      await api.patch(`/appointments/${appointment.id}/status`, { status: newStatus });
    }

    // 🔥 UPDATE LOCAL
    setData(prev => ({
      ...prev,
      appointments: prev.appointments.map(apt => 
        apt.id === appointment.id 
          ? { 
              ...apt, 
              status: isTechnicianStatus ? apt.status : newStatus,
              technicianStatus: isTechnicianStatus ? newStatus : apt.technicianStatus
            }
          : apt
      )
    }));

    showStatus(`Cita marcada como: ${newStatus}`);

    // 🔥 REFRESH CONTROLADO
    setTimeout(loadCommissions, 1000);

  } catch (e) {
    showStatus(e.response?.data?.error || 'Error al cambiar estado', 'error');
    loadCommissions();
  }
};
  const handleStartWorkDirectly = async (appointment) => {
    try {
      await api.patch(`/appointments/${appointment.id}/technician-status`, { status: 'in_progress' });
      showStatus('Trabajo iniciado');
      
      // Actualizar estado local de forma optimista
      // El backend debería cambiar status a 'attention' automáticamente, pero lo actualizamos para UI inmediata
      if (data?.appointments) {
        setData(prev => ({
          ...prev,
          appointments: prev.appointments.map(apt => 
            apt.id === appointment.id 
              ? { ...apt, technicianStatus: 'in_progress', status: 'attention' }
              : apt
          )
        }));
      }
      
      // Recargar datos en background para sincronizar con el backend (con delay para evitar race condition)
      setTimeout(() => loadCommissions(), 500);
    } catch (e) {
      showStatus(e.response?.data?.error || 'Error al iniciar trabajo', 'error');
      // Si falla, recargar para restaurar el estado correcto
      loadCommissions();
    }
  };

  const handleOpenInsumosModal = async (appointment) => {
    setInsumosAppointment(appointment);
    setSelectedInsumos([]);
    const report = appointment.workReport || {};
    setDiagnosis(report.diagnosis || '');
    setSolution(report.solution || '');
    setRecommendations(report.recommendations || '');
    setWorkNotes(appointment.workNotes || '');
    setWorkEvidences(appointment.workEvidences || []);
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
      for (const insumo of selectedInsumos) {
        await api.post('/inventory/usages', {
          itemId: insumo.itemId,
          quantity: insumo.quantity,
          date: getColombiaDateStr(),
          notes: `Usado en cita con ${insumosAppointment.clientName || insumosAppointment.client}`,
          businessId: data.business.id,
          appointmentId: insumosAppointment.id
        });
      }

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
      loadCommissions();
    } catch (e) {
      showStatus(e.response?.data?.error || 'Error al guardar insumos', 'error');
    } finally {
      setSavingInsumos(false);
    }
  };

  const handlePrev = () => {
    setCurrentPage(1);
    if (view === 'day') {
      const d = new Date(currentDate + 'T00:00:00-05:00');
      d.setDate(d.getDate() - 1);
      setCurrentDate(getColombiaDateStr(d));
    } else if (view === 'week') {
      const d = new Date(currentDate + 'T00:00:00-05:00');
      d.setDate(d.getDate() - 7);
      setCurrentDate(getColombiaDateStr(d));
    } else {
      const [year, month] = currentDate.slice(0, 7).split('-').map(Number);
      const d = new Date(year, month - 2, 1);
      setCurrentDate(getColombiaMonthStr(d) + '-01');
    }
  };

  const handleNext = () => {
    setCurrentPage(1);
    
    if (view === 'day') {
      const d = new Date(currentDate + 'T00:00:00-05:00');
      d.setDate(d.getDate() + 1);
      setCurrentDate(getColombiaDateStr(d));
    } else if (view === 'week') {
      const d = new Date(currentDate + 'T00:00:00-05:00');
      d.setDate(d.getDate() + 7);
      setCurrentDate(getColombiaDateStr(d));
    } else {
      const [year, month] = currentDate.slice(0, 7).split('-').map(Number);
      const d = new Date(year, month - 1, 1);
      d.setMonth(d.getMonth() + 1);
      setCurrentDate(getColombiaMonthStr(d) + '-01');
    }
  };

  const getPeriodLabel = () => {
    if (view === 'day') {
      const [year, month, day] = currentDate.split('-').map(Number);
      const d = new Date(year, month - 1, day);
      return d.toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    } else if (view === 'week') {
      const d = new Date(currentDate + 'T00:00:00-05:00');
      const day = d.getDay();
      const diff = day === 0 ? -6 : 1 - day;
      const start = new Date(d.getTime() + diff * 24 * 60 * 60 * 1000);
      const end = new Date(start.getTime() + 6 * 24 * 60 * 60 * 1000);
      return `${start.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })} - ${end.toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })}`;
    } else {
      const [year, month] = currentDate.slice(0, 7).split('-').map(Number);
      const d = new Date(year, month - 1, 1);
      return d.toLocaleDateString('es-CO', { month: 'long', year: 'numeric' });
    }
  };

  const exportToCSV = () => {
    if (!data?.appointments?.length) return;
    
    const isTechnical = data?.isTechnicalServices;
    const isFieldTech = data?.hasFieldTechnicians;
    
    const headers = isFieldTech
      ? ['Fecha', 'Hora', 'Servicio', 'Cliente', 'Teléfono', 'Estado', 'Estado Técnico']
      : isTechnical 
        ? ['Fecha', 'Hora', 'Servicio', 'Cliente', 'Teléfono']
        : ['Fecha', 'Hora', 'Servicio', 'Cliente', 'Teléfono', 'Valor Servicio', 'Adicional', 'Total', 'Comisión', 'Método Pago'];
    
    const rows = data?.appointments?.map(apt => {
      if (isFieldTech) {
        const statusLabels = {
          pending: 'Pendiente',
          confirmed: 'Confirmada',
          attention: 'En Atención',
          done: 'Completada',
          cancelled: 'Cancelada'
        };
        const techStatusLabels = {
          not_started: 'No iniciado',
          on_the_way: 'En Camino',
          arrived: 'Llegó',
          in_progress: 'Iniciado'
        };
        return [
          fmtDate(apt.date),
          fmtTime(apt.date),
          apt.service,
          apt.client,
          apt.clientPhone || '',
          statusLabels[apt.status] || apt.status,
          techStatusLabels[apt.technicianStatus] || apt.technicianStatus || 'No iniciado'
        ];
      }
      if (isTechnical) {
        return [
          fmtDate(apt.date),
          fmtTime(apt.date),
          apt.service,
          apt.client,
          apt.clientPhone || ''
        ];
      }
      return [
        fmtDate(apt.date),
        fmtTime(apt.date),
        apt.service,
        apt.client,
        apt.clientPhone || '',
        fmt(apt.basePrice),
        fmt(apt.additional),
        fmt(apt.price),
        fmt(apt.myCommission),
        apt.paymentMethod === 'cash' ? 'Efectivo' : 'Transferencia'
      ];
    });
    
    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    const periodStr = view === 'month' ? currentDate.slice(0, 7) : currentDate;
    const fileName = isFieldTech
      ? `citas_${view}_${periodStr}_${data.employee.name.replace(/\s+/g, '_')}.csv`
      : isTechnical 
        ? `servicios_${view}_${periodStr}_${data.employee.name.replace(/\s+/g, '_')}.csv`
        : `comisiones_${view}_${periodStr}_${data.employee.name.replace(/\s+/g, '_')}.csv`;
    link.download = fileName;
    link.click();
  };

  const handleViewChange = (key) => {
    setView(key);
    setCurrentPage(1);
    if (key === 'month') {
      setCurrentDate(getColombiaMonthStr() + '-01');
    } else {
      setCurrentDate(getColombiaDateStr());
    }
  };

  const closeInsumosModal = () => {
    setShowInsumosModal(false);
    setInsumosAppointment(null);
    setSelectedInsumos([]);
    setWorkNotes('');
    setDiagnosis('');
    setSolution('');
    setRecommendations('');
    setWorkEvidences([]);
  };

  return {
    // Estado principal
    data,
    loading,
    error,
    view,
    currentDate,
    currentPage,
    statusMsg,
    
    // Estados de insumos
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
    
    // Setters
    setView,
    setCurrentDate,
    setCurrentPage,
    setWorkNotes,
    setDiagnosis,
    setSolution,
    setRecommendations,
    
    // Handlers
    loadCommissions,
    showStatus,
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
  };
};

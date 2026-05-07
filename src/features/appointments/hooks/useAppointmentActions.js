/**
 * Hook para manejar todas las acciones de citas
 * Extraído de Appointments.jsx para desacoplar la lógica
 */
import { useState, useCallback } from 'react';
import api from '../../../api/client';

const STATUS_LABELS = {
  pending: 'Pendiente',
  confirmed: 'Confirmada',
  attention: 'En atención',
  done: 'Completada',
  cancelled: 'Cancelada',
  no_show: 'No asistió',
  on_the_way: 'En camino',
  arrived: 'En sitio',
  in_progress: 'En progreso'
};

export function useAppointmentActions({ business, showStatus, refresh, setAppointments }) {
  // Estados para modales
  const [modals, setModals] = useState({
    create: false,
    express: false,
    complete: false,
    edit: false,
    transfer: false,
    extend: false,
    notes: false,
    cancel: false,
    deleteNote: false,
    additionalCharge: false,
    sendReceipt: false,
    insumos: false
  });

  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [loading, setLoading] = useState({});

  // Helpers
  const openModal = useCallback((name, appointment = null) => {
    setModals(prev => ({ ...prev, [name]: true }));
    if (appointment) setSelectedAppointment(appointment);
  }, []);

  const closeModal = useCallback((name) => {
    setModals(prev => ({ ...prev, [name]: false }));
    if (name !== 'complete' && name !== 'express') {
      // No limpiar selectedAppointment para complete/express que manejan su propio estado
    }
  }, []);

  const setLoadingState = useCallback((key, value) => {
    setLoading(prev => ({ ...prev, [key]: value }));
  }, []);

  // Acciones de estado
  const handleStatusChange = useCallback(async (appointment, newStatus) => {
    try {
      const isTechnicianStatus = ['on_the_way', 'arrived', 'in_progress'].includes(newStatus);
      const isFieldTech = business?.hasFieldTechnicians;

      if (isFieldTech && isTechnicianStatus) {
        await api.patch(`/appointments/${appointment.id}/technician-status`, { status: newStatus });
      } else {
        await api.patch(`/appointments/${appointment.id}/status`, { status: newStatus });
      }

      const statusLabel = STATUS_LABELS[newStatus] || newStatus;
      showStatus(`Cita marcada como: ${statusLabel}`);
      refresh(true);
    } catch (e) {
      showStatus(e.response?.data?.error || 'Error al cambiar estado', 'error');
    }
  }, [business, showStatus, refresh]);

  // Completar cita
  const handleCompleteAppointment = useCallback(async (appointment, options) => {
    if (!appointment) return { success: false };
    
    setLoadingState('complete', true);
    try {
      await api.patch(`/appointments/${appointment.id}/status`, { 
        status: 'done',
        ...options
      });
      refresh(true);
      showStatus('Cita completada exitosamente');
      return { success: true };
    } catch (e) {
      showStatus(e.response?.data?.error || 'Error al completar cita', 'error');
      return { success: false, error: e.response?.data?.error };
    } finally {
      setLoadingState('complete', false);
    }
  }, [showStatus, refresh]);

  // Cancelar cita
  const handleCancelAppointment = useCallback(async (appointment) => {
    if (!appointment) return { success: false };
    
    setLoadingState('cancel', true);
    try {
      await api.patch(`/appointments/${appointment.id}/cancel`);
      refresh(true);
      showStatus('Cita cancelada exitosamente');
      return { success: true };
    } catch (e) {
      showStatus('Error al cancelar cita', 'error');
      return { success: false, error: e.message };
    } finally {
      setLoadingState('cancel', false);
    }
  }, [showStatus, refresh]);

  // Crear cita
  const handleCreateAppointment = useCallback(async (formData, manualTime = '', selectedDateModal = '') => {
    if (!formData.clientName || !formData.serviceId || !formData.employeeId || !formData.startTime) {
      showStatus('Por favor completa todos los campos requeridos', 'error');
      return { success: false };
    }

    if (business?.hasFieldTechnicians && !formData.address) {
      showStatus('La dirección es requerida para servicios a domicilio', 'error');
      return { success: false };
    }

    setLoadingState('create', true);
    try {
      const res = await api.post('/appointments', {
        businessId: business.id,
        ...formData,
        startTime: new Date(formData.startTime).toISOString()
      });
      
      // Pequeño delay para dar tiempo al backend de completar operaciones
      await new Promise(resolve => setTimeout(resolve, 500));
      await refresh(true);
      showStatus('Cita creada exitosamente');
      return { success: true, data: res.data };
    } catch (e) {
      showStatus(e.response?.data?.error || 'Error al crear cita', 'error');
      return { success: false, error: e.response?.data?.error };
    } finally {
      setLoadingState('create', false);
    }
  }, [business, showStatus, refresh]);

  // Crear cita express
  const handleCreateExpress = useCallback(async (expressForm) => {
    if (!expressForm.serviceId || !expressForm.employeeId) {
      showStatus('Por favor selecciona servicio y empleado', 'error');
      return { success: false };
    }
    
    setLoadingState('express', true);
    try {
      const now = new Date();
      const startTime = now.toISOString();

      const res = await api.post('/appointments', {
        businessId: business.id,
        ...expressForm,
        startTime,
        status: 'attention'
      });
      
      // Pequeño delay para dar tiempo al backend de completar operaciones
      await new Promise(resolve => setTimeout(resolve, 500));
      await refresh(true);
      
      // También agregar la cita al estado local inmediatamente para que aparezca sin esperar al socket
      if (res.data && setAppointments) {
        setAppointments(prev => [...prev, res.data]);
      }
      
      showStatus('Cita express iniciada');
      return { success: true, data: res.data };
    } catch (e) {
      showStatus(e.response?.data?.error || 'Error al crear cita express', 'error');
      return { success: false };
    } finally {
      setLoadingState('express', false);
    }
  }, [business, showStatus, refresh, setAppointments]);

  // Actualizar cita
  const handleUpdateAppointment = useCallback(async (editingAppointment, editForm) => {
    if (!editingAppointment) return { success: false };
    
    setLoadingState('edit', true);
    try {
      const payload = {
        clientName: editForm.clientName,
        clientPhone: editForm.clientPhone,
        clientEmail: editForm.clientEmail,
        serviceId: editForm.serviceId,
        employeeId: editForm.employeeId,
        notes: editForm.notes
      };

      const originalTime = editingAppointment.startTime 
        ? new Date(editingAppointment.startTime).toLocaleString('sv-SE', { timeZone: 'America/Bogota' }).replace(' ', 'T').slice(0, 16)
        : '';
      
      if (editForm.startTime && editForm.startTime !== originalTime) {
        payload.startTime = `${editForm.startTime}:00-05:00`;
      }

      await api.put(`/appointments/${editingAppointment.id}`, payload);
      refresh(true);
      showStatus('Cita actualizada exitosamente');
      return { success: true };
    } catch (e) {
      showStatus(e.response?.data?.error || 'Error al actualizar cita', 'error');
      return { success: false };
    } finally {
      setLoadingState('edit', false);
    }
  }, [showStatus, refresh]);

  // Extender tiempo
  const handleExtendTime = useCallback(async (appointment, minutes) => {
    if (!appointment || !minutes) return { success: false };
    
    setLoadingState('extend', true);
    try {
      await api.patch(`/appointments/${appointment.id}/extend-time`, {
        additionalMinutes: parseInt(minutes)
      });
      
      refresh(true);
      showStatus(`Tiempo extendido en ${minutes} minutos`);
      return { success: true };
    } catch (e) {
      showStatus(e.response?.data?.error || 'Error al extender tiempo', 'error');
      return { success: false };
    } finally {
      setLoadingState('extend', false);
    }
  }, [showStatus, refresh]);

  // Transferir cita
  const handleTransferAppointment = useCallback(async (appointment, newEmployeeId, newSlotTime = '') => {
    if (!appointment || !newEmployeeId) return { success: false };
    
    setLoadingState('transfer', true);
    try {
      const dateStr = new Date(appointment.startTime).toLocaleDateString('en-CA', { timeZone: 'America/Bogota' });
      const payload = {
        newEmployeeId,
        newStartTime: newSlotTime ? `${dateStr}T${newSlotTime}:00-05:00` : undefined
      };

      await api.patch(`/appointments/${appointment.id}/transfer`, payload);
      
      refresh(true);
      showStatus(newSlotTime 
        ? `Cita transferida a ${newSlotTime}` 
        : 'Cita transferida exitosamente'
      );
      return { success: true };
    } catch (e) {
      if (e.response?.status === 409 && e.response?.data?.requiresReschedule) {
        return { 
          success: false, 
          requiresReschedule: true,
          error: e.response.data.error,
          conflict: e.response.data.conflictAppointment
        };
      } else if (e.response?.status === 403) {
        showStatus(e.response?.data?.details || 'No se puede reasignar la cita a este empleado', 'error');
        return { success: false };
      } else {
        showStatus('Error al transferir cita: ' + (e.response?.data?.error || e.message), 'error');
        return { success: false };
      }
    } finally {
      setLoadingState('transfer', false);
    }
  }, [showStatus, refresh]);

  // Cargo adicional
  const handleSaveAdditionalCharge = useCallback(async (appointment, amount, note) => {
    if (!appointment) return { success: false };
    
    setLoadingState('additionalCharge', true);
    try {
      await api.patch(`/appointments/${appointment.id}/additional-charge`, {
        additionalAmount: parseFloat(amount) || 0,
        additionalNote: note
      });
      
      refresh(true);
      showStatus('Cargo adicional guardado exitosamente');
      return { success: true };
    } catch (e) {
      showStatus('Error al guardar cargo adicional: ' + (e.response?.data?.error || e.message), 'error');
      return { success: false };
    } finally {
      setLoadingState('additionalCharge', false);
    }
  }, [showStatus, refresh]);

  // Notas
  const handleLoadNotes = useCallback(async (appointmentId) => {
    try {
      const res = await api.get(`/appointments/${appointmentId}/notes`);
      return res.data || [];
    } catch (e) {
      console.error('Error loading notes:', e);
      return [];
    }
  }, []);

  const handleAddNote = useCallback(async (appointmentId, content) => {
    if (!appointmentId || !content.trim()) return { success: false };

    setLoadingState('addNote', true);
    try {
      const res = await api.post(`/appointments/${appointmentId}/notes`, { content: content.trim() });
      showStatus('Nota agregada');
      return { success: true, data: res.data };
    } catch (e) {
      showStatus('Error al agregar nota', 'error');
      return { success: false };
    } finally {
      setLoadingState('addNote', false);
    }
  }, [showStatus]);

  const handleDeleteNote = useCallback(async (appointmentId, noteId) => {
    if (!appointmentId || !noteId) return { success: false };

    try {
      await api.delete(`/appointments/${appointmentId}/notes/${noteId}`);
      showStatus('Nota eliminada');
      return { success: true };
    } catch (e) {
      showStatus(e.response?.data?.error || 'Error al eliminar nota', 'error');
      return { success: false };
    }
  }, [showStatus]);

  // Enviar comprobante
  const handleSendReceipt = useCallback(async (appointmentId) => {
    if (!appointmentId) return { success: false };

    setLoadingState('sendReceipt', true);
    try {
      await api.post(`/appointments/${appointmentId}/send-receipt`);
      showStatus('Comprobante de pago enviado exitosamente');
      return { success: true };
    } catch (e) {
      showStatus('Error al enviar comprobante: ' + (e.response?.data?.error || e.message), 'error');
      return { success: false };
    } finally {
      setLoadingState('sendReceipt', false);
    }
  }, [showStatus]);

  // Descargar/Ver Orden de Servicio
  const handleDownloadServiceOrder = useCallback(async (appointmentId, download = false) => {
    if (!appointmentId) return { success: false };

    try {
      const response = await api.get(`/appointments/${appointmentId}/service-order?download=${download}`, {
        responseType: 'blob'
      });

      // Crear URL para el blob
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);

      if (download) {
        // Descargar archivo
        const link = document.createElement('a');
        link.href = url;
        link.download = `orden-servicio-${appointmentId.substring(0, 8).toUpperCase()}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showStatus('Orden de servicio descargada');
      } else {
        // Abrir en nueva pestaña para visualizar
        window.open(url, '_blank');
      }

      // Limpiar URL después de un momento
      setTimeout(() => window.URL.revokeObjectURL(url), 1000);

      return { success: true };
    } catch (e) {
      showStatus('Error al generar orden de servicio: ' + (e.response?.data?.error || e.message), 'error');
      return { success: false };
    }
  }, [showStatus]);

  // Insumos y reporte técnico
  const handleSaveInsumosAndStart = useCallback(async (appointment, insumos, report, evidences) => {
    if (!appointment) return { success: false };
    
    setLoadingState('insumos', true);
    try {
      // Guardar insumos usados
      for (const insumo of insumos) {
        await api.post('/inventory/usages', {
          itemId: insumo.itemId,
          quantity: insumo.quantity,
          date: new Date().toISOString().split('T')[0],
          notes: `Usado en cita #${appointment.id} - ${appointment.clientName}`,
          businessId: business.id,
          appointmentId: appointment.id
        });
      }
      
      // Guardar reporte técnico
      if (report.diagnosis?.trim() || report.solution?.trim() || report.recommendations?.trim()) {
        await api.post(`/appointments/${appointment.id}/technical-report`, {
          diagnosis: report.diagnosis,
          solution: report.solution,
          recommendations: report.recommendations,
          partsUsed: insumos.map(i => ({
            itemId: i.itemId,
            name: i.name,
            quantity: i.quantity,
            unit: i.unit
          }))
        });
      }

      // Guardar evidencias fotográficas
      if (evidences?.length > 0) {
        await api.post(`/appointments/${appointment.id}/work-evidences`, {
          photos: evidences.map(photo => ({
            url: photo.url,
            description: photo.description || ''
          })),
          replaceAll: true
        });
      }

      // Cambiar estado a "en atención"
      await api.patch(`/appointments/${appointment.id}/technician-status`, { status: 'in_progress' });
      
      refresh(true);
      showStatus('Insumos registrados y trabajo iniciado');
      return { success: true };
    } catch (e) {
      showStatus(e.response?.data?.error || 'Error al guardar insumos', 'error');
      return { success: false };
    } finally {
      setLoadingState('insumos', false);
    }
  }, [business, showStatus, refresh]);

  return {
    modals,
    selectedAppointment,
    loading,
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
    handleDownloadServiceOrder,
    handleSaveInsumosAndStart
  };
}

export default useAppointmentActions;

import { useState } from 'react';
import api from '../../../api/client';
import { BEAUTY_BUSINESS_TYPES } from '../constants';

export const useAppointmentHandlers = (employee, business, loadAppointments, showStatus, setAppointments) => {
  const [completing, setCompleting] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [completeAppointmentData, setCompleteAppointmentData] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('cash');

  const handleCreateExpress = async (expressForm, setExpressForm) => {
    if (!expressForm.serviceId) {
      showStatus('Por favor selecciona un servicio', 'error');
      return;
    }
    if (business?.hasFieldTechnicians && !expressForm.address) {
      showStatus('La dirección es requerida para servicios a domicilio', 'error');
      return;
    }
    setCompleting(true);
    try {
      const now = new Date();
      await api.post('/appointments', {
        ...expressForm,
        businessId: employee.businessId,
        employeeId: employee.id,
        startTime: now.toISOString(),
        status: 'attention'
      });
      loadAppointments();
      setExpressForm({ clientName: '', clientPhone: '', address: '', serviceId: '', extraServices: [] });
      return true;
    } catch (e) {
      showStatus(e.response?.data?.error || 'Error al crear cita express', 'error');
      return false;
    } finally {
      setCompleting(false);
    }
  };

  const handleStatusUpdate = async (id, status, apt = null) => {
    if (status === 'done') {
      setCompleteAppointmentData(apt || { id });
      setPaymentMethod('cash');
      setShowCompleteModal(true);
      return;
    }

    // Validación: No permitir cambio directo a 'attention' si hay flujo de técnico activo
    if (status === 'attention' && apt?.technicianStatus && ['on_the_way', 'arrived'].includes(apt.technicianStatus)) {
      showStatus('⚠️ El técnico está en camino o llegó. Usa "Iniciar Trabajo" en lugar de "Iniciar Atención"', 'warning');
      return;
    }

    try {
      const isTechnicianStatus = ['on_the_way', 'arrived', 'in_progress'].includes(status);
      if (business?.hasFieldTechnicians && isTechnicianStatus) {
        await api.patch(`/appointments/${id}/technician-status`, { status });
        // Actualizar estado local inmediatamente
        // Cuando technicianStatus es in_progress, el backend también cambia status a attention
        if (setAppointments) {
          setAppointments(prev => prev.map(a =>
            a.id === id ? {
              ...a,
              technicianStatus: status,
              status: status === 'in_progress' ? 'attention' : a.status
            } : a
          ));
        }
        // No llamar loadAppointments() inmediatamente para estados de técnico
        // El socket emitirá appointment:updated y actualizará la cita
        // La actualización local optimista es suficiente
      } else {
        await api.patch(`/appointments/${id}/status`, { status });
        // Actualizar estado local inmediatamente
        if (setAppointments) {
          setAppointments(prev => prev.map(a =>
            a.id === id ? { ...a, status } : a
          ));
        }
        // No recargar citas - el socket actualizará vía appointment:updated
      }
    } catch (e) {
      showStatus(e.response?.data?.error || 'Error al actualizar el estado de la cita', 'error');
    }
  };

  const handleCompleteAppointment = async (options = {}) => {
    if (!completeAppointmentData) return;
    setCompleting(true);
    try {
      const isBeautyBusiness = BEAUTY_BUSINESS_TYPES.includes(business?.type);

      if (isBeautyBusiness) {
        await api.patch(`/appointments/${completeAppointmentData.id}/additional-charge`, {
          additionalAmount: 0,
          additionalNote: ''
        });
      }

      await api.patch(`/appointments/${completeAppointmentData.id}/status`, {
        status: 'done',
        paymentMethod: paymentMethod,
        ...options
      });
      // Remover cita de la lista local inmediatamente
      setAppointments(prev => prev.filter(a => a.id !== completeAppointmentData.id));
      // No recargar - el socket emitirá appointment:updated y removerá la cita
      setShowCompleteModal(false);
      setCompleteAppointmentData(null);
    } catch (e) {
      showStatus(e.response?.data?.error || 'Error al completar cita', 'error');
    } finally {
      setCompleting(false);
    }
  };

  return {
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
  };
};

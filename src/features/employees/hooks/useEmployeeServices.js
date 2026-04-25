/**
 * Hook para manejar servicios de empleados
 * Extraído de Employees.jsx
 */
import { useState, useCallback } from 'react';
import api from '../../../api/client';

export function useEmployeeServices() {
  const [showModal, setShowModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [availableServices, setAvailableServices] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const openModal = useCallback(async (employee, businessSlug, businessId) => {
    setSelectedEmployee(employee);
    setShowModal(true);
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      // Cargar servicios disponibles del negocio
      const servicesRes = await api.get(`/businesses/${businessSlug}/public`);
      const businessData = servicesRes.data;
      setAvailableServices(businessData.Services || []);
      
      // Cargar servicios del empleado
      const empServicesRes = await api.get(`/employees/${employee.id}/services`);
      setSelectedServices(empServicesRes.data.services.map(s => s.id));
    } catch (e) {
      console.error('Error cargando servicios:', e);
      setError('Error al cargar servicios: ' + (e.response?.data?.error || e.message));
    } finally {
      setLoading(false);
    }
  }, []);

  const closeModal = useCallback(() => {
    setShowModal(false);
    setSelectedEmployee(null);
    setAvailableServices([]);
    setSelectedServices([]);
    setError('');
    setSuccess('');
  }, []);

  const toggleService = useCallback((serviceId) => {
    setSelectedServices(prev => 
      prev.includes(serviceId)
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  }, []);

  const saveServices = useCallback(async (businessId) => {
    if (!selectedEmployee) return { success: false };
    
    setSaving(true);
    setError('');
    
    try {
      await api.put(`/employees/${selectedEmployee.id}/services`, {
        serviceIds: selectedServices,
        businessId: businessId
      });
      setSuccess('Servicios actualizados correctamente');
      return { success: true };
    } catch (e) {
      const errorMsg = e.response?.data?.error || 'Error al guardar servicios';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setSaving(false);
    }
  }, [selectedEmployee, selectedServices]);

  const clearMessages = useCallback(() => {
    setError('');
    setSuccess('');
  }, []);

  return {
    // State
    showModal,
    selectedEmployee,
    availableServices,
    selectedServices,
    loading,
    saving,
    error,
    success,
    
    // Actions
    openModal,
    closeModal,
    toggleService,
    saveServices,
    clearMessages
  };
}

export default useEmployeeServices;

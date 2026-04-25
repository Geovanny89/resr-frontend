/**
 * Hook para manejar citas
 * Extraído de Appointments.jsx
 */
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import api from '../../../api/client';
import { getTodayISO } from '../../../shared/utils/formatters';

export function useAppointments(businessId, options = {}) {
  const { pageSize = 6 } = options;
  
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedDate, setSelectedDate] = useState(() => {
    const colombiaStr = new Date().toLocaleString("en-US", { timeZone: "America/Bogota" });
    return new Date(colombiaStr);
  });
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');

  // Ref para mantener citas actualizadas en callbacks
  const appointmentsRef = useRef([]);

  useEffect(() => {
    appointmentsRef.current = appointments;
  }, [appointments]);

  const loadAppointments = useCallback(async (skipCache = false) => {
    if (!businessId) return;

    try {
      setLoading(true);
      const res = await api.get(`/appointments?businessId=${businessId}`, skipCache ? { params: { noCache: true } } : {});
      setAppointments(res.data);
    } catch (e) {
      console.error('[useAppointments] Error loading:', e);
    } finally {
      setLoading(false);
    }
  }, [businessId]);

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  // Filtrar citas por fecha y empleado
  const filteredAppointments = useMemo(() => {
    return appointments.filter(apt => {
      const aptDate = new Date(apt.startTime).toLocaleDateString('en-CA', { timeZone: 'America/Bogota' });
      const selectedDateStr = selectedDate.toLocaleDateString('en-CA', { timeZone: 'America/Bogota' });
      
      const matchesDate = aptDate === selectedDateStr;
      const matchesEmployee = !selectedEmployeeId || String(apt.employeeId) === String(selectedEmployeeId);
      
      return matchesDate && matchesEmployee;
    });
  }, [appointments, selectedDate, selectedEmployeeId]);

  // Paginación
  const paginatedAppointments = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredAppointments.slice(start, start + pageSize);
  }, [filteredAppointments, currentPage, pageSize]);

  const totalPages = useMemo(() => Math.ceil(filteredAppointments.length / pageSize), [filteredAppointments, pageSize]);

  // Estadísticas rápidas
  const stats = {
    total: appointments.length,
    pending: appointments.filter(a => a.status === 'pending').length,
    confirmed: appointments.filter(a => a.status === 'confirmed').length,
    done: appointments.filter(a => a.status === 'done').length,
    cancelled: appointments.filter(a => a.status === 'cancelled').length,
    today: appointments.filter(a => {
      const aptDate = new Date(a.startTime).toLocaleDateString('en-CA', { timeZone: 'America/Bogota' });
      return aptDate === getTodayISO();
    }).length
  };

  // Mutaciones
  const updateAppointment = useCallback(async (id, data) => {
    try {
      const res = await api.put(`/appointments/${id}`, data);
      setAppointments(prev => prev.map(a => a.id === id ? { ...a, ...res.data } : a));
      return { success: true, data: res.data };
    } catch (e) {
      console.error('[useAppointments] Error updating:', e);
      return { success: false, error: e.response?.data?.error || e.message };
    }
  }, []);

  const deleteAppointment = useCallback(async (id) => {
    try {
      await api.delete(`/appointments/${id}`);
      setAppointments(prev => prev.filter(a => a.id !== id));
      return { success: true };
    } catch (e) {
      console.error('[useAppointments] Error deleting:', e);
      return { success: false, error: e.response?.data?.error || e.message };
    }
  }, []);

  const createAppointment = useCallback(async (data) => {
    try {
      const res = await api.post('/appointments', data);
      setAppointments(prev => [...prev, res.data]);
      return { success: true, data: res.data };
    } catch (e) {
      console.error('[useAppointments] Error creating:', e);
      return { success: false, error: e.response?.data?.error || e.message };
    }
  }, []);

  const changeStatus = useCallback(async (id, newStatus, additionalData = {}) => {
    try {
      const res = await api.patch(`/appointments/${id}/status`, { 
        status: newStatus,
        ...additionalData 
      });
      setAppointments(prev => prev.map(a => 
        a.id === id ? { ...a, ...res.data, Service: a.Service } : a
      ));
      return { success: true, data: res.data };
    } catch (e) {
      console.error('[useAppointments] Error changing status:', e);
      return { success: false, error: e.response?.data?.error || e.message };
    }
  }, []);

  return {
    // Data
    appointments,
    loading,
    stats,
    appointmentsRef,
    
    // Pagination
    currentPage,
    setCurrentPage,
    totalPages,
    paginatedAppointments,

    // Filters
    selectedDate,
    setSelectedDate,
    selectedEmployeeId,
    setSelectedEmployeeId,
    filteredAppointments,
    
    // Actions
    refresh: loadAppointments,
    updateAppointment,
    deleteAppointment,
    createAppointment,
    changeStatus,
    setAppointments
  };
}

export default useAppointments;

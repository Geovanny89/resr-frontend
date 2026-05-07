import { useState, useEffect, useRef, useMemo } from 'react';
import api from '../../../api/client';
import { STATUS_PRIORITY } from '../constants';

export const useAppointments = (employee, selectedDate) => {
  const [appointments, setAppointments] = useState([]);
  const appointmentsRef = useRef([]);
  const [, forceRender] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const loadAppointments = async () => {
    if (!employee) return;
    try {
      setLoading(true);
      const startDate = selectedDate;
      const endDate = selectedDate;
      
      const response = await api.get(`/employees/${employee.id}/appointments`, {
        params: {
          startDate: startDate,
          endDate: endDate
        }
      });
      setAppointments(response.data);
      appointmentsRef.current = response.data;
    } catch (err) {
      setError('Error al cargar citas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (employee) {
      loadAppointments();
    }
  }, [employee, selectedDate]);

  // Reset a primera página cuando cambian las citas o el filtro
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter]);

  // Filtrar y ordenar citas según el filtro de estado seleccionado
  const filteredAppointments = useMemo(() => {
    console.log('[Filter Debug] filteredAppointments recalculating, appointments.length:', appointments.length, 'statusFilter:', statusFilter);
    let filtered = appointments;
    
    // Excluir citas completadas y canceladas del filtro "all" - solo mostrar citas activas
    if (statusFilter === 'all') {
      // Mostrar todo excepto canceladas en la pestaña "Todas"
      filtered = appointments.filter(a => a.status !== 'cancelled');
    } else {
      filtered = appointments.filter(a => a.status === statusFilter);
    }
    
    console.log('[Filter Debug] filteredAppointments result length:', filtered.length);
    
    return filtered.sort((a, b) => {
      const priorityA = STATUS_PRIORITY[a.status] || 3;
      const priorityB = STATUS_PRIORITY[b.status] || 3;
      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }
      return new Date(a.startTime) - new Date(b.startTime);
    });
  }, [appointments, statusFilter]);

  // Paginación de citas
  const paginatedAppointments = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAppointments.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAppointments, currentPage]);

  const totalPages = Math.ceil(filteredAppointments.length / itemsPerPage);

  const handleFilterChange = (filterValue) => {
    console.log('[Filter Debug] handleFilterChange called with:', filterValue);
    setStatusFilter(filterValue);
  };

  return {
    appointments,
    setAppointments,
    appointmentsRef,
    loading,
    error,
    statusFilter,
    currentPage,
    setCurrentPage,
    filteredAppointments,
    paginatedAppointments,
    totalPages,
    loadAppointments,
    handleFilterChange,
    forceRender
  };
};

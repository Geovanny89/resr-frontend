/**
 * Hook para manejar estado de agenda/calendario
 * Extraído de Agenda.jsx
 */
import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import api from '../../../api/client';
import { useSocket } from '../../../hooks/useSocket';
import { getWeekDates, formatDateISO, isSameDay, getHourFromDate } from '../utils/calendar';

export function useAgenda({ businessId, userId, hasFieldTechnicians }) {
  // Estado de navegación
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [viewMode, setViewMode] = useState('week'); // 'week' | 'day'
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  // Estado de datos
  const [appointments, setAppointments] = useState([]);
  const appointmentsRef = useRef([]);
  const [, forceRender] = useState({});
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  
  // Estado de modal
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const selectedAppointmentRef = useRef(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Calcular fechas de la semana
  const weekDates = useMemo(() => getWeekDates(currentWeek), [currentWeek]);

  // Cargar empleados
  useEffect(() => {
    if (businessId) {
      loadEmployees();
    }
  }, [businessId]);

  const loadEmployees = async () => {
    try {
      const res = await api.get(`/employees?businessId=${businessId}`);
      const employeesData = Array.isArray(res.data) ? res.data : [];
      setEmployees(employeesData.filter(e => e.active));
    } catch (e) {
      console.error('Error loading employees:', e);
      setEmployees([]);
    }
  };

  // Cargar citas
  useEffect(() => {
    if (businessId) {
      loadAppointments();
    }
  }, [businessId, currentWeek, weekDates]);

  const loadAppointments = async () => {
    if (!businessId) return;
    setLoading(true);
    try {
      const startDate = formatDateISO(weekDates[0]);
      const endDate = formatDateISO(weekDates[6]);
      
      const res = await api.get('/appointments', {
        params: {
          businessId,
          startDate,
          endDate,
        }
      });
      setAppointments(res.data);
      appointmentsRef.current = res.data;
    } catch (e) {
      console.error('Error loading appointments:', e);
    } finally {
      setLoading(false);
    }
  };

  // Sincronizar ref con estado
  useEffect(() => {
    appointmentsRef.current = appointments;
  }, [appointments]);

  // Sincronizar selectedAppointmentRef
  useEffect(() => {
    selectedAppointmentRef.current = selectedAppointment;
  }, [selectedAppointment]);

  // 🔔 SOCKET.IO: Callbacks para actualizaciones en tiempo real
  const handleAppointmentCreated = useCallback((appointment) => {
    console.log('[Socket Agenda] appointment:created recibido:', appointment.id);
    
    // Verificar si la cita ya existe (evitar duplicados)
    const exists = appointmentsRef.current.some(a => a.id === appointment.id);
    if (exists) {
      console.log('[Socket Agenda] Cita ya existe, ignorando:', appointment.id);
      return;
    }
    
    // Verificar si la cita está dentro del rango de fechas actual
    const apptDate = new Date(appointment.startTime);
    const weekStart = weekDates[0];
    const weekEnd = weekDates[6];
    weekEnd.setHours(23, 59, 59, 999);
    
    const isInCurrentWeek = apptDate >= weekStart && apptDate <= weekEnd;
    console.log('[Socket Agenda] ¿Cita en semana actual?', isInCurrentWeek, {
      apptDate: apptDate.toISOString(),
      weekStart: weekStart.toISOString(),
      weekEnd: weekEnd.toISOString()
    });
    
    if (!isInCurrentWeek) {
      console.log('[Socket Agenda] Cita fuera de rango, ignorando');
      return;
    }
    
    const newAppointments = [...appointmentsRef.current, appointment];
    console.log('[Socket Agenda] Agregando cita. Total antes:', appointmentsRef.current.length, 'después:', newAppointments.length);
    appointmentsRef.current = newAppointments;
    setAppointments(newAppointments);
    forceRender({});
  }, [weekDates]);

  const handleAppointmentUpdated = useCallback((appointment) => {
    console.log('[Socket Agenda] appointment:updated recibido:', appointment.id, 'status:', appointment.status);
    
    const exists = appointmentsRef.current.some(a => a.id === appointment.id);
    if (!exists) {
      // Si la cita no existe en la lista, es posible que sea nueva para esta vista
      // Verificar si está en el rango de fechas actual
      const apptDate = new Date(appointment.startTime);
      const weekStart = weekDates[0];
      const weekEnd = weekDates[6];
      weekEnd.setHours(23, 59, 59, 999);
      
      if (apptDate >= weekStart && apptDate <= weekEnd) {
        console.log('[Socket Agenda] Cita no existe, agregándola a la lista');
        const newAppointments = [...appointmentsRef.current, appointment];
        appointmentsRef.current = newAppointments;
        setAppointments(newAppointments);
        forceRender({});
      } else {
        console.log('[Socket Agenda] Cita fuera de rango, ignorando');
      }
      return;
    }
    
    const newAppointments = appointmentsRef.current.map(a =>
      a.id === appointment.id ? { ...a, ...appointment, Service: appointment.Service || a.Service, Employee: appointment.Employee || a.Employee } : a
    );
    appointmentsRef.current = newAppointments;
    setAppointments(newAppointments);
    forceRender({});
    
    // Si la cita actualizada está seleccionada en el modal, actualizarla también
    if (selectedAppointmentRef.current?.id === appointment.id) {
      setSelectedAppointment(prev => ({ 
        ...prev, 
        ...appointment, 
        Service: appointment.Service || prev.Service,
        Employee: appointment.Employee || prev.Employee
      }));
    }
    
    console.log('[Socket Agenda] Cita actualizada en estado');
  }, [weekDates]);

  const handleAppointmentCancelled = useCallback((appointment) => {
    console.log('[Socket Agenda] appointment:cancelled recibido:', appointment.id);
    
    const exists = appointmentsRef.current.some(a => a.id === appointment.id);
    if (!exists) {
      console.log('[Socket Agenda] Cita no existe en lista, nada que eliminar');
      return;
    }
    
    const newAppointments = appointmentsRef.current.filter(a => a.id !== appointment.id);
    appointmentsRef.current = newAppointments;
    setAppointments(newAppointments);
    forceRender({});
    
    // Si la cita cancelada está seleccionada, cerrar el modal
    if (selectedAppointmentRef.current?.id === appointment.id) {
      setShowDetailModal(false);
      setSelectedAppointment(null);
    }
    
    console.log('[Socket Agenda] Cita eliminada de estado');
  }, []);

  // 🔔 SOCKET.IO: Conexión en tiempo real
  const { isConnected } = useSocket({
    businessId,
    userId,
    role: 'admin',
    onAppointmentCreated: handleAppointmentCreated,
    onAppointmentUpdated: handleAppointmentUpdated,
    onAppointmentCancelled: handleAppointmentCancelled,
  });

  // Navegación
  const prevWeek = useCallback(() => {
    const newWeek = new Date(currentWeek);
    newWeek.setDate(newWeek.getDate() - 7);
    setCurrentWeek(newWeek);
  }, [currentWeek]);

  const nextWeek = useCallback(() => {
    const newWeek = new Date(currentWeek);
    newWeek.setDate(newWeek.getDate() + 7);
    setCurrentWeek(newWeek);
  }, [currentWeek]);

  const goToToday = useCallback(() => {
    const today = new Date();
    setCurrentWeek(today);
    setSelectedDate(today);
    setViewMode('day');
  }, []);

  const switchToWeekView = useCallback(() => {
    setViewMode('week');
    setSelectedDate(new Date());
  }, []);

  const switchToDayView = useCallback((date) => {
    setViewMode('day');
    setSelectedDate(date);
  }, []);

  // Filtrar citas
  const getAppointmentsForDay = useCallback((date) => {
    return appointments.filter(apt => {
      const aptDate = new Date(apt.startTime);
      const matchesDate = isSameDay(aptDate, date);
      const matchesEmployee = selectedEmployeeId ? String(apt.employeeId) === selectedEmployeeId : true;
      return matchesDate && matchesEmployee;
    }).sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
  }, [appointments, selectedEmployeeId]);

  const getAppointmentsForHour = useCallback((date, hour) => {
    return appointments.filter(apt => {
      const aptDate = new Date(apt.startTime);
      const aptHourStr = aptDate.toLocaleTimeString('en-CA', { timeZone: 'America/Bogota', hour12: false });
      const aptHour = parseInt(aptHourStr.split(':')[0], 10);
      const matchesDate = isSameDay(aptDate, date) && aptHour === hour;
      const matchesEmployee = selectedEmployeeId ? String(apt.employeeId) === selectedEmployeeId : true;
      return matchesDate && matchesEmployee;
    }).sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
  }, [appointments, selectedEmployeeId]);

  // Filtradas para estadísticas
  const filteredAppointments = useMemo(() => {
    if (!selectedEmployeeId) return appointments;
    return appointments.filter(apt => String(apt.employeeId) === selectedEmployeeId);
  }, [appointments, selectedEmployeeId]);

  // Modal
  const openDetail = useCallback((apt) => {
    setSelectedAppointment(apt);
    setShowDetailModal(true);
  }, []);

  const closeDetail = useCallback(() => {
    setShowDetailModal(false);
    setSelectedAppointment(null);
  }, []);

  // Refresh manual
  const refresh = useCallback(() => {
    loadAppointments();
  }, [businessId, weekDates]);

  return {
    // Navegación
    currentWeek,
    weekDates,
    viewMode,
    selectedDate,
    prevWeek,
    nextWeek,
    goToToday,
    switchToWeekView,
    switchToDayView,
    
    // Datos
    appointments,
    loading,
    employees,
    selectedEmployeeId,
    setSelectedEmployeeId,
    filteredAppointments,
    
    // Filtrado
    getAppointmentsForDay,
    getAppointmentsForHour,
    
    // Modal
    selectedAppointment,
    showDetailModal,
    openDetail,
    closeDetail,
    
    // Socket
    isConnected,
    
    // Refresh
    refresh,
    loadEmployees,
  };
}

export default useAgenda;

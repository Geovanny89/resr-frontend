import { useCallback, useEffect } from 'react';
import { useSocket } from '../../../hooks/useSocket';

export const useSocketHandlers = (employee, selectedDate, selectedDateRef, appointmentsRef, setAppointments, forceRender, showStatus, loadAppointments) => {
  // Callbacks SOCKET.IO estables - SIN dependencias para evitar reconexiones
  const handleNewAssigned = useCallback((appointment) => {
    // Verificar si la cita pertenece a la fecha seleccionada actual
    const appointmentDate = new Date(appointment.startTime).toLocaleDateString('en-CA', { timeZone: 'America/Bogota' });
    const currentSelectedDate = selectedDateRef.current;

    if (appointmentDate !== currentSelectedDate) {
      return;
    }

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
    forceRender({});

    showStatus(`📅 Nueva cita: ${appointment.clientName}`, 'info');
  }, []);

  const handleAppointmentUpdated = useCallback((appointment) => {
    console.log('[Socket Debug] ⬇️ appointment:updated recibido:', {
      id: appointment.id,
      status: appointment.status,
      technicianStatus: appointment.technicianStatus,
      employeeId: appointment.employeeId,
      appointmentsInRef: appointmentsRef.current.length
    });
    const appointmentDate = new Date(appointment.startTime).toLocaleDateString('en-CA', { timeZone: 'America/Bogota' });
    const currentSelectedDate = selectedDateRef.current;
    console.log('[Socket Debug] appointmentDate:', appointmentDate, 'currentSelectedDate:', currentSelectedDate);

    const existsInCurrentList = appointmentsRef.current.find(a => a.id === appointment.id);
    console.log('[Socket Debug] existsInCurrentList:', !!existsInCurrentList, 'appointmentsRef.current.length:', appointmentsRef.current.length);

    if (appointmentDate !== currentSelectedDate) {
      console.log('[Socket Debug] La cita no pertenece a la fecha actual, omitiendo');
      if (existsInCurrentList) {
        const newAppointments = appointmentsRef.current.filter(a => a.id !== appointment.id);
        appointmentsRef.current = newAppointments;
        setAppointments(newAppointments);
        forceRender({});
      }
      return;
    }

    if (existsInCurrentList) {
      console.log('[Socket Debug] Actualizando cita existente...');
      const newAppointments = appointmentsRef.current.map(a =>
        a.id === appointment.id
          ? {
              ...a,
              ...appointment,
              // Preservar status local si el socket no trae uno válido
              status: appointment.status || a.status,
              // Preservar technicianStatus local si el socket no trae uno
              technicianStatus: appointment.technicianStatus !== undefined ? appointment.technicianStatus : a.technicianStatus,
              Service: appointment.Service || a.Service
            }
          : a
      );
      appointmentsRef.current = newAppointments;
      setAppointments(newAppointments);
      forceRender({});
      console.log('[Socket Debug] Cita actualizada en la lista, nuevo status:', appointment.status);
      // No recargar citas - la actualización local por socket es suficiente para evitar race conditions
    } else {
      // No agregar citas completadas o canceladas a la lista del empleado
      if (appointment.status === 'done' || appointment.status === 'cancelled') {
        console.log('[Socket Debug] Cita completada/cancelada, no se agrega a la lista activa');
        return;
      }
      console.log('[Socket Debug] Agregando nueva cita...');
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
      const newAppointments = [...appointmentsRef.current, normalizedAppointment];
      appointmentsRef.current = newAppointments;
      setAppointments(newAppointments);
      console.log('[Socket Debug] Nueva cita agregada a la lista');
    }
    forceRender({});
    console.log('[Socket Debug] forceRender llamado');
  }, []);

  const handleAppointmentCancelled = useCallback((appointment) => {
    console.log('[Socket Debug] appointment:cancelled recibido:', appointment.id);
    const newAppointments = appointmentsRef.current.filter(a => a.id !== appointment.id);
    appointmentsRef.current = newAppointments;
    setAppointments(newAppointments);
    forceRender({});
    showStatus('❌ Cita cancelada', 'warning');
  }, []);

  // SOCKET.IO: Actualizaciones en tiempo real
  const { subscribeToEmployeeAppointments, unsubscribeFromAppointments, isConnected, stats } = useSocket({
    businessId: employee?.businessId,
    employeeId: employee?.id,
    role: 'employee',
    onNewAssigned: handleNewAssigned,
    onAppointmentUpdated: handleAppointmentUpdated,
    onAppointmentCancelled: handleAppointmentCancelled
  });

  // Debug: mostrar estado de conexión y eventos recibidos
  useEffect(() => {
    console.log('[Socket Debug] isConnected:', isConnected, 'employee:', employee?.id, 'business:', employee?.businessId);
    console.log('[Socket Debug] Stats:', stats);
  }, [isConnected, stats, employee]);

  // Suscribirse a citas del empleado cuando cambia la fecha o el empleado
  // NO incluir isConnected en dependencias para evitar reconexiones constantes
  useEffect(() => {
    if (employee?.id && selectedDate && isConnected) {
      subscribeToEmployeeAppointments(employee.id, selectedDate);
    }
    return () => {
      if (employee?.id && selectedDate) {
        unsubscribeFromAppointments(employee.id, selectedDate);
      }
    };
  }, [employee?.id, selectedDate, subscribeToEmployeeAppointments, unsubscribeFromAppointments]);

  return { isConnected, stats };
};

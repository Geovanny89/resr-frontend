import { useEffect, useRef, useCallback, useState } from 'react';
import { io } from 'socket.io-client';
import { Capacitor } from '@capacitor/core';

// Helper para obtener token del localStorage
const getToken = () => localStorage.getItem('token');

// Detectar si estamos en APK (Capacitor) o web
const isNative = Capacitor.isNativePlatform();

// Construir URL del socket correctamente
function getSocketUrl() {
  // En APK usar producción
  if (isNative) {
    return import.meta.env.VITE_API_URL_PROD || 'https://tudominio.com';
  }
  
  // En web, verificar si VITE_API_URL es relativa (ej: '/api') o absoluta
  const apiUrl = import.meta.env.VITE_API_URL;
  
  if (!apiUrl || apiUrl.startsWith('/')) {
    // URL relativa - construir usando window.location
    // Eliminar '/api' si está presente para obtener solo el origen
    const origin = window.location.origin;
    // Si estás usando proxy de Vite, el backend está en :4000
    return 'http://localhost:4000';
  }
  
  // URL absoluta ya configurada
  return apiUrl;
}

const SOCKET_URL = getSocketUrl();

/**
 * Hook personalizado para manejar la conexión Socket.io
 * 
 * @param {Object} options - Opciones de configuración
 * @param {string} options.businessId - ID del negocio (requerido)
 * @param {string} options.userId - ID del usuario
 * @param {string} options.role - Rol del usuario (admin, employee, client)
 * @param {string} options.employeeId - ID del empleado (si aplica)
 * @param {boolean} options.autoConnect - Conectar automáticamente (default: true)
 * @param {Function} options.onAppointmentCreated - Callback cuando se crea una cita
 * @param {Function} options.onAppointmentUpdated - Callback cuando se actualiza una cita
 * @param {Function} options.onAppointmentCancelled - Callback cuando se cancela una cita
 * @param {Function} options.onNewAssigned - Callback cuando se asigna nueva cita a empleado
 * @param {Function} options.onConnect - Callback cuando se conecta
 * @param {Function} options.onDisconnect - Callback cuando se desconecta
 */
export function useSocket({
  businessId,
  userId,
  role,
  employeeId,
  autoConnect = true,
  onAppointmentCreated,
  onAppointmentUpdated,
  onAppointmentCancelled,
  onNewAssigned,
  onConnect,
  onDisconnect
}) {
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const [stats, setStats] = useState({ receivedEvents: 0, lastEvent: null });

  // REFS ESTABLES - Guardar valores para evitar reconexiones innecesarias
  const authRef = useRef({ userId, role, employeeId });
  const callbacksRef = useRef({
    onAppointmentCreated,
    onAppointmentUpdated,
    onAppointmentCancelled,
    onNewAssigned,
    onConnect,
    onDisconnect
  });

  // Actualizar refs sin causar re-renders
  useEffect(() => {
    authRef.current = { userId, role, employeeId };
  }, [userId, role, employeeId]);

  useEffect(() => {
    callbacksRef.current = {
      onAppointmentCreated,
      onAppointmentUpdated,
      onAppointmentCancelled,
      onNewAssigned,
      onConnect,
      onDisconnect
    };
  }, [onAppointmentCreated, onAppointmentUpdated, onAppointmentCancelled, onNewAssigned, onConnect, onDisconnect]);

  // Inicializar conexión - Solo cuando cambia businessId
  // El employeeId se lee directamente de los props en cada ejecución
  useEffect(() => {
    if (!businessId || !autoConnect) return;

    const token = getToken();

    // Configurar socket con auth - usar valores directamente
    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      auth: {
        token,
        businessId,
        userId,
        role,
        employeeId
      }
    });

    socketRef.current = socket;

    // Evento de conexión exitosa
    socket.on('connect', () => {
      setIsConnected(true);
      setConnectionError(null);
      callbacksRef.current.onConnect?.();
    });

    // Evento de desconexión
    socket.on('disconnect', (reason) => {
      setIsConnected(false);
      callbacksRef.current.onDisconnect?.(reason);
    });

    // Evento de error de conexión
    socket.on('connect_error', (error) => {
      setConnectionError(error.message);
    });


    // 🔔 Evento: Nueva cita creada (para admins)
    socket.on('appointment:created', (data) => {
      setStats(prev => ({
        receivedEvents: prev.receivedEvents + 1,
        lastEvent: { type: 'created', data, time: new Date() }
      }));
      callbacksRef.current.onAppointmentCreated?.(data);
    });

    // 🔔 Evento: Nueva cita asignada a empleado
    socket.on('appointment:new_assigned', (data) => {
      setStats(prev => ({
        receivedEvents: prev.receivedEvents + 1,
        lastEvent: { type: 'new_assigned', data, time: new Date() }
      }));
      callbacksRef.current.onNewAssigned?.(data);
    });

    // 🔔 Evento: Cita actualizada
    socket.on('appointment:updated', (data) => {
      setStats(prev => ({
        receivedEvents: prev.receivedEvents + 1,
        lastEvent: { type: 'updated', data, time: new Date() }
      }));
      callbacksRef.current.onAppointmentUpdated?.(data);
    });

    // 🔔 Evento: Cita cancelada
    socket.on('appointment:cancelled', (data) => {
      setStats(prev => ({
        receivedEvents: prev.receivedEvents + 1,
        lastEvent: { type: 'cancelled', data, time: new Date() }
      }));
      callbacksRef.current.onAppointmentCancelled?.(data);
    });

    // Evento de actualización por fecha (para recargar calendarios)
    socket.on('appointment:date_update', (data) => {
      // Fecha actualizada: data.date
    });

    // Limpiar al desmontar o cuando cambia businessId
    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [businessId, autoConnect]); // Solo reconectar cuando cambia businessId

  // Función para suscribirse a citas de empleado específico
  const subscribeToEmployeeAppointments = useCallback((empId, date) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('subscribe_appointments', {
        employeeId: empId,
        date
      });
    }
  }, []);

  // Función para desuscribirse
  const unsubscribeFromAppointments = useCallback((empId, date) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('unsubscribe_appointments', {
        employeeId: empId,
        date
      });
    }
  }, []);

  // Reconectar manualmente
  const reconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.connect();
    }
  }, []);

  // Desconectar manualmente
  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
    }
  }, []);

  return {
    socket: socketRef.current,
    isConnected,
    connectionError,
    stats,
    subscribeToEmployeeAppointments,
    unsubscribeFromAppointments,
    reconnect,
    disconnect
  };
}

/**
 * Hook simplificado para empleados - solo escucha citas asignadas
 */
export function useEmployeeSocket(employeeId, businessId, callbacks = {}) {
  return useSocket({
    businessId,
    employeeId,
    role: 'employee',
    onNewAssigned: callbacks.onNewAppointment,
    onAppointmentUpdated: callbacks.onAppointmentUpdate,
    onAppointmentCancelled: callbacks.onAppointmentCancel,
    ...callbacks
  });
}

/**
 * Hook simplificado para admins - escucha todas las citas del negocio
 */
export function useAdminSocket(businessId, userId, callbacks = {}) {
  return useSocket({
    businessId,
    userId,
    role: 'admin',
    onAppointmentCreated: callbacks.onNewAppointment,
    onAppointmentUpdated: callbacks.onAppointmentUpdate,
    onAppointmentCancelled: callbacks.onAppointmentCancel,
    ...callbacks
  });
}

export default useSocket;

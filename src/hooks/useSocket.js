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
    // URL relativa - usar el mismo origen (aprovechar proxy de Vite)
    // El proxy de Vite manejará '/socket.io' -> 'http://localhost:4000/socket.io'
    return window.location.origin;
  }
  
  // URL absoluta ya configurada - extraer solo el origen
  try {
    const url = new URL(apiUrl);
    return `${url.protocol}//${url.host}`;
  } catch {
    return apiUrl;
  }
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
 * @param {Function} options.onServiceCreated - Callback cuando se crea un servicio
 * @param {Function} options.onServiceUpdated - Callback cuando se actualiza un servicio
 * @param {Function} options.onServiceDeleted - Callback cuando se elimina un servicio
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
  onServiceCreated,
  onServiceUpdated,
  onServiceDeleted,
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
    onServiceCreated,
    onServiceUpdated,
    onServiceDeleted,
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
      onServiceCreated,
      onServiceUpdated,
      onServiceDeleted,
      onConnect,
      onDisconnect
    };
  }, [onAppointmentCreated, onAppointmentUpdated, onAppointmentCancelled, onNewAssigned, onServiceCreated, onServiceUpdated, onServiceDeleted, onConnect, onDisconnect]);

  // Inicializar conexión - Solo cuando cambia businessId
  // El employeeId se lee directamente de los props en cada ejecución
  useEffect(() => {
    console.log('[useSocket] useEffect triggered. businessId:', businessId, 'autoConnect:', autoConnect, 'role:', role);
    if (!businessId || !autoConnect) {
      console.log('[useSocket] Skipping connection - missing businessId or autoConnect disabled');
      // Si hay una conexión existente, desconectarla
      if (socketRef.current) {
        console.log('[useSocket] Desconectando socket existente por businessId inválido');
        socketRef.current.disconnect();
        socketRef.current = null;
        setIsConnected(false);
      }
      return;
    }

    // Si ya hay una conexión activa con el mismo businessId, no reconectar
    if (socketRef.current?.connected && socketRef.current?.auth?.businessId === businessId) {
      console.log('[useSocket] Socket ya conectado con mismo businessId, skipping');
      return;
    }

    // Desconectar socket anterior si existe
    if (socketRef.current) {
      console.log('[useSocket] Desconectando socket anterior antes de reconectar');
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    const token = getToken();
    console.log('[useSocket] Connecting to:', SOCKET_URL, 'with businessId:', businessId, 'role:', role, 'userId:', userId);

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
      console.log('[useSocket] Connected! Socket ID:', socket.id);
      console.log('[useSocket] Salas actuales:', socket.rooms ? Array.from(socket.rooms) : 'N/A (server-side only)');
      console.log('[useSocket] Auth enviado:', { businessId, role, userId, employeeId });
      setIsConnected(true);
      setConnectionError(null);
      callbacksRef.current.onConnect?.();
    });

    // Evento de desconexión
    socket.on('disconnect', (reason) => {
      console.log('[useSocket] Disconnected. Reason:', reason);
      setIsConnected(false);
      callbacksRef.current.onDisconnect?.(reason);
    });

    // Evento de error de conexión
    socket.on('connect_error', (error) => {
      console.error('[useSocket] Connection error:', error.message);
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

    // Evento: Cita actualizada
    socket.on('appointment:updated', (data) => {
      console.log('[useSocket] ⬇️ appointment:updated recibido:', {
        id: data.id,
        status: data.status,
        technicianStatus: data.technicianStatus,
        employeeId: data.employeeId,
        businessId: data.businessId
      });
      setStats(prev => ({
        receivedEvents: prev.receivedEvents + 1,
        lastEvent: { type: 'updated', data, time: new Date() }
      }));
      const callback = callbacksRef.current.onAppointmentUpdated;
      console.log('[useSocket] onAppointmentUpdated callback existe?', !!callback);
      if (callback) {
        console.log('[useSocket] Llamando onAppointmentUpdated...');
        callback(data);
        console.log('[useSocket] onAppointmentUpdated completado');
      }
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

    // 🔔 Eventos de servicios
    socket.on('service:created', (data) => {
      setStats(prev => ({
        receivedEvents: prev.receivedEvents + 1,
        lastEvent: { type: 'service_created', data, time: new Date() }
      }));
      callbacksRef.current.onServiceCreated?.(data);
    });

    socket.on('service:updated', (data) => {
      setStats(prev => ({
        receivedEvents: prev.receivedEvents + 1,
        lastEvent: { type: 'service_updated', data, time: new Date() }
      }));
      callbacksRef.current.onServiceUpdated?.(data);
    });

    socket.on('service:deleted', (data) => {
      setStats(prev => ({
        receivedEvents: prev.receivedEvents + 1,
        lastEvent: { type: 'service_deleted', data, time: new Date() }
      }));
      callbacksRef.current.onServiceDeleted?.(data);
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

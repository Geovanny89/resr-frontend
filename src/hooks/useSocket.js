import { useEffect, useRef, useCallback, useState } from 'react';
import { 
  getSocket, 
  subscribeToEvent, 
  unsubscribeFromEvent, 
  isSocketConnected,
  disconnectSocket,
  getCurrentSocket
} from './socketSingleton';

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
  const [isConnected, setIsConnected] = useState(isSocketConnected());
  const [connectionError, setConnectionError] = useState(null);
  const [stats, setStats] = useState({ receivedEvents: 0, lastEvent: null });

  // REF para almacenar los callbacks actuales sin causar re-renders
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

  // Actualizar callbacks sin causar re-renders
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

  // Inicializar/Conectar socket usando el singleton
  useEffect(() => {
    console.log('[useSocket] useEffect triggered. businessId:', businessId, 'autoConnect:', autoConnect, 'role:', role);
    
    if (!businessId || !autoConnect) {
      console.log('[useSocket] Skipping connection - missing businessId or autoConnect disabled');
      return;
    }

    // Obtener o crear conexión singleton
    const socket = getSocket(businessId, role, userId, employeeId);
    
    if (!socket) {
      console.error('[useSocket] No se pudo obtener socket');
      return;
    }

    console.log('[useSocket] Socket obtenido. Conectado:', socket.connected);
    setIsConnected(socket.connected);

    // Callback wrappers que llaman a los refs actuales
    const handleConnect = () => {
      console.log('[useSocket] Connected! Socket ID:', socket.id);
      setIsConnected(true);
      setConnectionError(null);
      callbacksRef.current.onConnect?.();
    };

    const handleDisconnect = (reason) => {
      console.log('[useSocket] Disconnected. Reason:', reason);
      setIsConnected(false);
      callbacksRef.current.onDisconnect?.(reason);
    };

    const handleConnectError = (error) => {
      console.error('[useSocket] Connection error:', error.message);
      setConnectionError(error.message);
    };

    const handleAppointmentCreated = (data) => {
      setStats(prev => ({
        receivedEvents: prev.receivedEvents + 1,
        lastEvent: { type: 'created', data, time: new Date() }
      }));
      callbacksRef.current.onAppointmentCreated?.(data);
    };

    const handleNewAssigned = (data) => {
      setStats(prev => ({
        receivedEvents: prev.receivedEvents + 1,
        lastEvent: { type: 'new_assigned', data, time: new Date() }
      }));
      callbacksRef.current.onNewAssigned?.(data);
    };

    const handleAppointmentUpdated = (data) => {
      console.log('[useSocket] ⬇️ appointment:updated recibido:', {
        id: data.id,
        status: data.status,
        employeeId: data.employeeId,
        businessId: data.businessId
      });
      setStats(prev => ({
        receivedEvents: prev.receivedEvents + 1,
        lastEvent: { type: 'updated', data, time: new Date() }
      }));
      callbacksRef.current.onAppointmentUpdated?.(data);
    };

    const handleAppointmentCancelled = (data) => {
      setStats(prev => ({
        receivedEvents: prev.receivedEvents + 1,
        lastEvent: { type: 'cancelled', data, time: new Date() }
      }));
      callbacksRef.current.onAppointmentCancelled?.(data);
    };

    const handleServiceCreated = (data) => {
      setStats(prev => ({
        receivedEvents: prev.receivedEvents + 1,
        lastEvent: { type: 'service_created', data, time: new Date() }
      }));
      callbacksRef.current.onServiceCreated?.(data);
    };

    const handleServiceUpdated = (data) => {
      setStats(prev => ({
        receivedEvents: prev.receivedEvents + 1,
        lastEvent: { type: 'service_updated', data, time: new Date() }
      }));
      callbacksRef.current.onServiceUpdated?.(data);
    };

    const handleServiceDeleted = (data) => {
      setStats(prev => ({
        receivedEvents: prev.receivedEvents + 1,
        lastEvent: { type: 'service_deleted', data, time: new Date() }
      }));
      callbacksRef.current.onServiceDeleted?.(data);
    };

    // Suscribir a eventos usando el singleton
    const unsubConnect = subscribeToEvent('connect', handleConnect);
    const unsubDisconnect = subscribeToEvent('disconnect', handleDisconnect);
    const unsubConnectError = subscribeToEvent('connect_error', handleConnectError);
    const unsubCreated = subscribeToEvent('appointment:created', handleAppointmentCreated);
    const unsubNewAssigned = subscribeToEvent('appointment:new_assigned', handleNewAssigned);
    const unsubUpdated = subscribeToEvent('appointment:updated', handleAppointmentUpdated);
    const unsubCancelled = subscribeToEvent('appointment:cancelled', handleAppointmentCancelled);
    const unsubServiceCreated = subscribeToEvent('service:created', handleServiceCreated);
    const unsubServiceUpdated = subscribeToEvent('service:updated', handleServiceUpdated);
    const unsubServiceDeleted = subscribeToEvent('service:deleted', handleServiceDeleted);

    // Si ya está conectado, llamar onConnect inmediatamente
    if (socket.connected) {
      handleConnect();
    }

    // Cleanup: solo desuscribir listeners, NO desconectar el socket
    return () => {
      console.log('[useSocket] Cleanup - desuscribiendo listeners (socket sigue conectado)');
      unsubConnect();
      unsubDisconnect();
      unsubConnectError();
      unsubCreated();
      unsubNewAssigned();
      unsubUpdated();
      unsubCancelled();
      unsubServiceCreated();
      unsubServiceUpdated();
      unsubServiceDeleted();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [businessId, autoConnect, role]); // Reconectar solo si cambia businessId o role

  // Función para suscribirse a citas de empleado específico
  const subscribeToEmployeeAppointments = useCallback((empId, date) => {
    const socket = getCurrentSocket();
    if (socket?.connected) {
      socket.emit('subscribe_appointments', {
        employeeId: empId,
        date
      });
    }
  }, []);

  // Función para desuscribirse
  const unsubscribeFromAppointments = useCallback((empId, date) => {
    const socket = getCurrentSocket();
    if (socket?.connected) {
      socket.emit('unsubscribe_appointments', {
        employeeId: empId,
        date
      });
    }
  }, []);

  // Reconectar manualmente
  const reconnect = useCallback(() => {
    const socket = getCurrentSocket();
    if (socket) {
      socket.connect();
    }
  }, []);

  // Desconectar manualmente (solo para cerrar sesión)
  const disconnect = useCallback(() => {
    disconnectSocket();
    setIsConnected(false);
  }, []);

  return {
    socket: getCurrentSocket(),
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

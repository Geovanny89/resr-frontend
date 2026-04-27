import { io } from 'socket.io-client';
import { Capacitor } from '@capacitor/core';

const isNative = Capacitor.isNativePlatform();

function getSocketUrl() {
  if (isNative) {
    return 'https://reservas.k-dice.com';
  }
  // Usar URL relativa para que funcione con el proxy de Vite
  return window.location.origin;
}

const SOCKET_URL = getSocketUrl();
console.log('[SocketSingleton] SOCKET_URL:', SOCKET_URL, 'isNative:', isNative);

// Singleton instance
let socket = null;
let currentConfig = null;
const listeners = new Map();

const getToken = () => localStorage.getItem('token');

/**
 * Obtiene o crea socket persistente
 */
export function getSocket(businessId, role, userId, employeeId) {
  const newConfig = { businessId, role, userId, employeeId };

  // Si ya existe conexión con misma config, reutilizar
  if (socket?.connected && currentConfig?.businessId === businessId && currentConfig?.role === role) {
    return socket;
  }

  // Si existe pero config diferente, desconectar
  if (socket) {
    socket.disconnect();
    socket = null;
  }

  if (!businessId) return null;

  currentConfig = newConfig;
  const token = getToken();

  console.log('[SocketSingleton] Conectando:', { businessId, role, userId, employeeId });

  socket = io(SOCKET_URL, {
    path: '/socket.io/',
    transports: isNative ? ['websocket', 'polling'] : ['polling'], // WebSocket en móvil, polling en web
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
    timeout: 20000,
    auth: { token, businessId, userId, role, employeeId }
  });

  // Re-suscribir listeners existentes
  listeners.forEach((callbacks, event) => {
    callbacks.forEach(cb => socket.on(event, cb));
  });

  socket.on('connect', () => {
    console.log('[SocketSingleton] ✅ Conectado! Socket ID:', socket.id);
  });

  socket.on('disconnect', (reason) => {
    console.log('[SocketSingleton] Desconectado:', reason);
  });

  socket.on('connect_error', (error) => {
    console.error('[SocketSingleton] Error de conexión:', error.message, error);
  });

  // Log inicial del estado
  console.log('[SocketSingleton] Estado inicial - connecting:', socket.connecting, 'connected:', socket.connected);

  return socket;
}

/**
 * Suscribe a evento (persistente entre renders)
 */
export function subscribeToEvent(event, callback) {
  if (!listeners.has(event)) {
    listeners.set(event, new Set());
  }
  listeners.get(event).add(callback);

  if (socket?.connected) {
    socket.on(event, callback);
  }

  // Retornar función para desuscribir
  return () => unsubscribeFromEvent(event, callback);
}

/**
 * Desuscribe de evento
 */
export function unsubscribeFromEvent(event, callback) {
  const callbacks = listeners.get(event);
  if (callbacks) {
    callbacks.delete(callback);
    if (socket?.connected) {
      socket.off(event, callback);
    }
  }
}

/**
 * Verifica si está conectado
 */
export function isSocketConnected() {
  return socket?.connected || false;
}

/**
 * Obtiene socket actual
 */
export function getCurrentSocket() {
  return socket;
}

/**
 * Desconectar (solo para logout)
 */
export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
    currentConfig = null;
    listeners.clear();
  }
}

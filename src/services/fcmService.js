import { FirebaseMessaging } from '@capacitor-firebase/messaging';
import { Capacitor } from '@capacitor/core';
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import api from '../api/client';

// Configuración de Firebase para la WEB (PWA)
const firebaseConfig = { 
  apiKey: "AIzaSyDvfjZXD_N6s5P07AQ_wXBFwWv_w3S_VmU", 
  authDomain: "reservas-kdice.firebaseapp.com", 
  projectId: "reservas-kdice", 
  storageBucket: "reservas-kdice.firebasestorage.app", 
  messagingSenderId: "399450737686", 
  appId: "1:399450737686:web:2ffdb70e29217f1f267937", 
  measurementId: "G-W8GW4QM4QM" 
}; 

// Clave VAPID pública de Firebase (Cloud Messaging > Web configuration)
const VAPID_KEY = "BIH4z_hHEiQOD_YBhYmjdVmj9TUfyD38zopaOGaF4amZjM__eMog2WNJgLR32J_wGcW4mQ8xDl3ZQisIsOZBDCw";

/**
 * Servicio para manejar Firebase Cloud Messaging (FCM)
 * Obtiene el token del dispositivo y lo envía al backend
 */
class FCMService {
  constructor() {
    this.isNative = Capacitor.isNativePlatform();
    this.token = null;
    this.webApp = !this.isNative ? initializeApp(firebaseConfig) : null;
    this.webMessaging = !this.isNative ? getMessaging(this.webApp) : null;
  }

  /**
   * Inicializa FCM y solicita permisos
   */
  async initialize() {
    // Verificamos si es plataforma nativa (Android APK)
    if (this.isNative) {
      try {
        const permission = await this.requestPermissionsNative();
        if (!permission) return false;
        await this.getTokenNative();
        this.setupTokenRefreshListenerNative();
        this.setupMessageListenerNative();
        return true;
      } catch (error) {
        console.error('[FCM] Error inicializando nativo:', error);
        return false;
      }
    }

    // --- MODO WEB / PWA (iPhone, Safari, Chrome, etc.) ---
    // En iPhone, Apple exige que la app esté "instalada" (Agregar a inicio) para permitir Push
    const isPWA = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

    // Si es iOS pero NO es PWA, informamos pero no inicializamos (no funcionará)
    if (isIOS && !isPWA) {
      console.log('[FCM-Web] En iOS las notificaciones requieren "Agregar a inicio"');
      return false;
    }

    try {
      // Solicitar permisos del navegador
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        console.warn('[FCM-Web] Permiso de notificaciones denegado por el usuario');
        return false;
      }

      await this.getTokenWeb();
      this.setupMessageListenerWeb();
      return true;
    } catch (error) {
      console.error('[FCM-Web] Error inicializando push web:', error);
      return false;
    }
  }

  /**
   * Solicita permisos (NATIVO)
   */
  async requestPermissionsNative() {
    try {
      const result = await FirebaseMessaging.requestPermissions();
      return result.receive === 'granted';
    } catch (error) {
      console.error('[FCM] Error permisos nativos:', error);
      return false;
    }
  }

  /**
   * Obtiene token (NATIVO)
   */
  async getTokenNative() {
    try {
      const result = await FirebaseMessaging.getToken();
      this.token = result.token;
      await this.registerTokenWithBackend(this.token);
      return this.token;
    } catch (error) {
      console.error('[FCM] Error token nativo:', error);
      return null;
    }
  }

  /**
   * Obtiene token (WEB/PWA)
   */
  async getTokenWeb() {
    try {
      const currentToken = await getToken(this.webMessaging, { vapidKey: VAPID_KEY });
      if (currentToken) {
        this.token = currentToken;
        console.log('[FCM-Web] Token obtenido:', this.token?.substring(0, 10) + '...');
        await this.registerTokenWithBackend(this.token);
      } else {
        console.warn('[FCM-Web] No se pudo obtener token web');
      }
      return this.token;
    } catch (error) {
      console.error('[FCM-Web] Error token web:', error);
      return null;
    }
  }

  /**
   * Envía el token FCM al backend
   */
  async registerTokenWithBackend(fcmToken) {
    if (!fcmToken) return;

    try {
      // 1. Verificar si hay token de autenticación (Admin/Empleado/Cliente Registrado)
      const authToken = localStorage.getItem('token');
      if (authToken) {
        await api.post('/auth/fcm-token', { fcmToken });
        console.log('[FCM] Token registrado para usuario autenticado');
        return;
      }

      // 2. Si no hay token de auth, verificar si es un cliente invitado por email (Modo APK)
      const clientEmail = localStorage.getItem('clientEmail');
      if (clientEmail) {
        await api.post('/auth/fcm-token-client', { email: clientEmail, fcmToken });
        console.log('[FCM] Token registrado para cliente invitado:', clientEmail);
        return;
      }

      console.log('[FCM] No hay sesión activa ni email de cliente, token no registrado');
    } catch (error) {
      console.error('[FCM] Error registrando token:', error.message);
    }
  }

  /**
   * Listener de refresco (NATIVO)
   */
  setupTokenRefreshListenerNative() {
    FirebaseMessaging.addListener('tokenReceived', async (event) => {
      this.token = event.token;
      await this.registerTokenWithBackend(this.token);
    });
  }

  /**
   * Listener de mensajes (NATIVO)
   */
  setupMessageListenerNative() {
    FirebaseMessaging.addListener('messageReceived', (event) => {
      if (event.notification) {
        this.showLocalNotification(event.notification);
      }
    });
  }

  /**
   * Listener de mensajes (WEB/PWA)
   */
  setupMessageListenerWeb() {
    onMessage(this.webMessaging, (payload) => {
      console.log('[FCM-Web] Mensaje en primer plano:', payload);
      if (payload.notification) {
        this.showLocalNotification(payload.notification);
      }
    });
  }

  /**
   * Muestra notificación local
   */
  async showLocalNotification(notification) {
    const { LocalNotifications } = await import('@capacitor/local-notifications');
    
    await LocalNotifications.schedule({
      notifications: [{
        id: Date.now(),
        title: notification.title || 'Notificación',
        body: notification.body || '',
        sound: 'default',
        channelId: 'appointment_notifications',
      }]
    });
  }

  /**
   * Elimina el token FCM (útil al cerrar sesión)
   */
  async deleteToken() {
    if (this.isNative) {
      try { await FirebaseMessaging.deleteToken(); } catch (e) {}
    }
    this.token = null;
    console.log('[FCM] Token eliminado');
  }
}

// Instancia singleton
const fcmService = new FCMService();

export default fcmService;

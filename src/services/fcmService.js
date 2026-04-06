import { FirebaseMessaging } from '@capacitor-firebase/messaging';
import { Capacitor } from '@capacitor/core';
import api from '../api/client';

/**
 * Servicio para manejar Firebase Cloud Messaging (FCM)
 * Obtiene el token del dispositivo y lo envía al backend
 */
class FCMService {
  constructor() {
    this.isNative = Capacitor.isNativePlatform();
    this.token = null;
  }

  /**
   * Inicializa FCM y solicita permisos
   */
  async initialize() {
    if (!this.isNative) {
      console.log('[FCM] No es plataforma nativa, FCM no disponible');
      return false;
    }

    try {
      // Solicitar permisos de notificación
      const permission = await this.requestPermissions();
      if (!permission) {
        console.log('[FCM] Permisos denegados');
        return false;
      }

      // Obtener token FCM
      await this.getToken();
      
      // Escuchar cambios de token
      this.setupTokenRefreshListener();
      
      // Escuchar mensajes en primer plano
      this.setupMessageListener();

      return true;
    } catch (error) {
      console.error('[FCM] Error inicializando:', error);
      return false;
    }
  }

  /**
   * Solicita permisos de notificación
   */
  async requestPermissions() {
    try {
      const result = await FirebaseMessaging.requestPermissions();
      return result.receive === 'granted';
    } catch (error) {
      console.error('[FCM] Error solicitando permisos:', error);
      return false;
    }
  }

  /**
   * Obtiene el token FCM actual y lo registra en el backend
   */
  async getToken() {
    if (!this.isNative) return null;

    try {
      const result = await FirebaseMessaging.getToken();
      this.token = result.token;
      console.log('[FCM] Token obtenido:', this.token?.substring(0, 20) + '...');
      
      // Enviar token al backend si hay sesión activa
      await this.registerTokenWithBackend(this.token);
      
      return this.token;
    } catch (error) {
      console.error('[FCM] Error obteniendo token:', error);
      return null;
    }
  }

  /**
   * Envía el token FCM al backend
   */
  async registerTokenWithBackend(fcmToken) {
    if (!fcmToken) return;

    try {
      // Verificar si hay token de autenticación
      const authToken = localStorage.getItem('token');
      if (!authToken) {
        console.log('[FCM] No hay sesión activa, token no registrado');
        return;
      }

      await api.post('/auth/fcm-token', { fcmToken });
      console.log('[FCM] Token registrado en backend');
    } catch (error) {
      console.error('[FCM] Error registrando token:', error.message);
    }
  }

  /**
   * Configura listener para cuando el token cambia
   */
  setupTokenRefreshListener() {
    if (!this.isNative) return;

    FirebaseMessaging.addListener('tokenReceived', async (event) => {
      console.log('[FCM] Token actualizado:', event.token?.substring(0, 20) + '...');
      this.token = event.token;
      await this.registerTokenWithBackend(this.token);
    });
  }

  /**
   * Configura listener para mensajes en primer plano
   */
  setupMessageListener() {
    if (!this.isNative) return;

    FirebaseMessaging.addListener('messageReceived', (event) => {
      console.log('[FCM] Mensaje recibido:', event.notification);
      
      // Mostrar notificación local si la app está abierta
      if (event.notification) {
        this.showLocalNotification(event.notification);
      }
    });
  }

  /**
   * Muestra notificación local cuando la app está en primer plano
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
    if (!this.isNative) return;

    try {
      await FirebaseMessaging.deleteToken();
      this.token = null;
      console.log('[FCM] Token eliminado');
    } catch (error) {
      console.error('[FCM] Error eliminando token:', error);
    }
  }

  /**
   * Suscribe a un topic (para notificaciones por tema)
   */
  async subscribeToTopic(topic) {
    if (!this.isNative) return;

    try {
      await FirebaseMessaging.subscribeToTopic({ topic });
      console.log(`[FCM] Suscrito a topic: ${topic}`);
    } catch (error) {
      console.error('[FCM] Error suscribiéndose a topic:', error);
    }
  }

  /**
   * Cancela suscripción a un topic
   */
  async unsubscribeFromTopic(topic) {
    if (!this.isNative) return;

    try {
      await FirebaseMessaging.unsubscribeFromTopic({ topic });
      console.log(`[FCM] Desuscrito de topic: ${topic}`);
    } catch (error) {
      console.error('[FCM] Error desuscribiéndose de topic:', error);
    }
  }
}

// Instancia singleton
const fcmService = new FCMService();

export default fcmService;

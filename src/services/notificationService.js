import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';

/**
 * Servicio de notificaciones para la APK
 * Programa notificaciones locales una hora antes de cada cita
 */
class NotificationService {
  constructor() {
    this.isNative = Capacitor.isNativePlatform();
    this.scheduledNotifications = new Map();
  }

  /**
   * Inicializa el servicio de notificaciones
   */
  async initialize() {
    if (!this.isNative) return;

    try {
      // Solicitar permisos
      const { display } = await LocalNotifications.requestPermissions();
      
      if (display === 'granted') {
        console.log('✅ Permisos de notificación concedidos');
        
        // Crear canal de notificaciones para Android
        await LocalNotifications.createChannel({
          id: 'appointment_reminders',
          name: 'Recordatorios de Citas',
          description: 'Notificaciones de recordatorio para tus citas programadas',
          importance: 5, // Importancia máxima (sonido, popup)
          visibility: 1, // Visible en pantalla de bloqueo
          sound: 'default',
          vibration: true
        });

        // Configurar listener para cuando se hace clic en notificación
        LocalNotifications.addListener('localNotificationActionPerformed', (notification) => {
          console.log('🔔 Notificación clickeada:', notification);
        });

        // Configurar listener para cuando llega una notificación
        LocalNotifications.addListener('localNotificationReceived', (notification) => {
          console.log('🔔 Notificación recibida:', notification);
          this.updateBadge();
        });

      } else {
        console.log('❌ Permisos de notificación denegados');
      }
    } catch (error) {
      console.error('Error inicializando notificaciones:', error);
    }
  }

  /**
   * Programa una notificación para una cita
   * @param {Object} appointment - Datos de la cita
   * @param {string} role - Rol del usuario ('employee' o 'client')
   */
  async scheduleAppointmentNotification(appointment, role = 'employee') {
    if (!this.isNative) return;

    try {
      const startTime = new Date(appointment.startTime);
      const now = new Date();

      // Tiempos de notificación: 1 hora antes y 30 minutos antes
      const times = [
        { offset: 60 * 60 * 1000, label: '1 hora' },
        { offset: 30 * 60 * 1000, label: '30 minutos' }
      ];

      for (const timeInfo of times) {
        const notificationTime = new Date(startTime.getTime() - timeInfo.offset);
        
        // No programar si la hora ya pasó
        if (notificationTime < now) continue;

        // Generar ID único basado en el ID de la cita y el offset
        const baseId = parseInt(appointment.id.toString().replace(/\D/g, '').slice(-7)) || Math.floor(Math.random() * 1000000);
        const notificationId = baseId + (timeInfo.offset / 60000); // Diferenciar por minutos

        const businessName = appointment.Business?.name || 'Negocio';
        const serviceName = appointment.Service?.name || 'Servicio';

        const title = role === 'client' ? `🔔 Recordatorio de Cita` : `📅 Nueva Cita Pendiente`;
        const body = role === 'client' 
          ? `Tu cita en "${businessName}" es en ${timeInfo.label} (${serviceName})`
          : `Tienes una cita con ${appointment.clientName || 'un cliente'} en ${timeInfo.label} (${serviceName})`;

        await LocalNotifications.schedule({
          notifications: [
            {
              id: notificationId,
              title,
              body,
              schedule: {
                at: notificationTime,
                allowWhileIdle: true,
              },
              sound: 'default',
              attachments: [],
              actionTypeId: '',
              extra: {
                appointmentId: appointment.id,
                role: role,
                type: 'appointment_reminder',
              },
              channelId: 'appointment_reminders',
              smallIcon: 'ic_launcher_foreground',
              iconColor: '#8B00CC',
            },
          ],
        });

        console.log(`✅ Notificación (${timeInfo.label}) programada para:`, appointment.id, 'a las:', notificationTime);
      }

    } catch (error) {
      console.error('Error programando notificación:', error);
    }
  }

  /**
   * Programa notificaciones para múltiples citas
   * @param {Array} appointments - Array de citas
   * @param {string} identifier - ID del empleado o correo del cliente
   * @param {string} role - 'employee' o 'client'
   */
  async scheduleMultipleNotifications(appointments, identifier, role = 'employee') {
    if (!this.isNative) return;

    // Cancelar notificaciones anteriores
    await this.cancelRoleNotifications(identifier, role);

    // Filtrar citas futuras válidas
    const futureAppointments = appointments.filter(apt => {
      const isFuture = new Date(apt.startTime) > new Date();
      const isConfirmed = ['pending', 'confirmed', 'attention'].includes(apt.status);
      return isFuture && isConfirmed;
    });

    console.log(`📅 Programando ${futureAppointments.length} notificaciones para rol: ${role}`);

    // Programar notificación para cada cita
    for (const appointment of futureAppointments) {
      await this.scheduleAppointmentNotification(appointment, role);
    }

    // Actualizar badge (puntico)
    await this.updateBadge(futureAppointments.length);
  }

  /**
   * Cancela notificaciones de un rol/usuario específico
   */
  async cancelRoleNotifications(identifier, role) {
    if (!this.isNative) return;

    try {
      const pending = await LocalNotifications.getPending();
      
      const notificationsToCancel = pending.notifications
        .filter(n => n.extra?.role === role)
        .map(n => n.id);

      if (notificationsToCancel.length > 0) {
        await LocalNotifications.cancel({
          notifications: notificationsToCancel.map(id => ({ id })),
        });
      }
    } catch (error) {
      console.error('Error cancelando notificaciones:', error);
    }
  }

  /**
   * Cancela una notificación específica
   * @param {string} appointmentId - ID de la cita
   */
  async cancelNotification(appointmentId) {
    if (!this.isNative) return;

    const notificationId = this.scheduledNotifications.get(appointmentId);
    if (notificationId) {
      await LocalNotifications.cancel({
        notifications: [{ id: notificationId }],
      });
      this.scheduledNotifications.delete(appointmentId);
      console.log('🗑️ Notificación cancelada:', appointmentId);
    }
  }

  /**
   * Actualiza el badge del icono
   * @param {number} count - Número de notificaciones pendientes
   */
  async updateBadge(count = null) {
    if (!this.isNative) return;

    try {
      if (count === null) {
        // Contar notificaciones pendientes
        const pending = await LocalNotifications.getPending();
        count = pending.notifications.length;
      }

      // Actualizar badge
      await App.setBadgeCount({ count });
      console.log('🔢 Badge actualizado:', count);
    } catch (error) {
      console.error('Error actualizando badge:', error);
    }
  }

  /**
   * Limpia todas las notificaciones
   */
  async clearAll() {
    if (!this.isNative) return;

    try {
      await LocalNotifications.cancel({ notifications: [] });
      await App.setBadgeCount({ count: 0 });
      this.scheduledNotifications.clear();
      console.log('🧹 Todas las notificaciones limpiadas');
    } catch (error) {
      console.error('Error limpiando notificaciones:', error);
    }
  }

  /**
   * Obtiene notificaciones pendientes
   */
  async getPendingNotifications() {
    if (!this.isNative) return [];

    try {
      const pending = await LocalNotifications.getPending();
      return pending.notifications;
    } catch (error) {
      console.error('Error obteniendo notificaciones pendientes:', error);
      return [];
    }
  }
}

// Instancia singleton
const notificationService = new NotificationService();

export default notificationService;

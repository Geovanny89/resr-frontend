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
   * @param {string} appointment.id - ID de la cita
   * @param {string} appointment.startTime - Fecha/hora de inicio (ISO string)
   * @param {string} appointment.clientName - Nombre del cliente
   * @param {string} appointment.Service?.name - Nombre del servicio
   * @param {string} employeeName - Nombre del empleado
   */
  async scheduleAppointmentNotification(appointment, employeeName = '') {
    if (!this.isNative) return;

    try {
      const startTime = new Date(appointment.startTime);
      const notificationTime = new Date(startTime.getTime() - (60 * 60 * 1000)); // 1 hora antes
      
      // No programar si la hora ya pasó
      if (notificationTime < new Date()) {
        console.log('⏰ Hora de notificación ya pasó, omitiendo:', appointment.id);
        return;
      }

      const notificationId = parseInt(appointment.id.toString().replace(/\D/g, '').slice(0, 9)) || Math.floor(Math.random() * 1000000);

      await LocalNotifications.schedule({
        notifications: [
          {
            id: notificationId,
            title: '🔔 Recordatorio de Cita',
            body: `Tienes una cita con ${appointment.clientName || 'un cliente'} en 1 hora - ${appointment.Service?.name || 'Servicio'}`,
            schedule: {
              at: notificationTime,
              allowWhileIdle: true,
            },
            channelId: 'appointment_reminders',
            smallIcon: 'ic_launcher_foreground', // Usar el icono que ya sabemos que existe
            iconColor: '#8B00CC',
            extra: {
              appointmentId: appointment.id,
              employeeId: appointment.employeeId,
              type: 'appointment_reminder',
            },
          },
        ],
      });

      this.scheduledNotifications.set(appointment.id, notificationId);
      console.log('✅ Notificación programada para:', appointment.id, 'a las:', notificationTime);

    } catch (error) {
      console.error('Error programando notificación:', error);
    }
  }

  /**
   * Programa notificaciones para múltiples citas
   * @param {Array} appointments - Array de citas
   * @param {string} employeeId - ID del empleado (para filtrar)
   * @param {string} employeeName - Nombre del empleado
   */
  async scheduleMultipleNotifications(appointments, employeeId, employeeName) {
    if (!this.isNative) return;

    // Cancelar notificaciones anteriores del empleado
    await this.cancelEmployeeNotifications(employeeId);

    // Filtrar citas futuras del empleado
    const futureAppointments = appointments.filter(apt => {
      const isForEmployee = apt.employeeId === employeeId;
      const isFuture = new Date(apt.startTime) > new Date();
      const isConfirmed = ['pending', 'confirmed', 'attention'].includes(apt.status);
      return isForEmployee && isFuture && isConfirmed;
    });

    console.log(`📅 Programando ${futureAppointments.length} notificaciones para ${employeeName}`);

    // Programar notificación para cada cita
    for (const appointment of futureAppointments) {
      await this.scheduleAppointmentNotification(appointment, employeeName);
    }

    // Actualizar badge
    await this.updateBadge(futureAppointments.length);
  }

  /**
   * Cancela notificaciones de un empleado
   * @param {string} employeeId - ID del empleado
   */
  async cancelEmployeeNotifications(employeeId) {
    if (!this.isNative) return;

    try {
      // Obtener notificaciones pendientes
      const pending = await LocalNotifications.getPending();
      
      // Cancelar notificaciones del empleado
      const notificationsToCancel = pending.notifications
        .filter(n => n.extra?.employeeId === employeeId)
        .map(n => n.id);

      if (notificationsToCancel.length > 0) {
        await LocalNotifications.cancel({
          notifications: notificationsToCancel.map(id => ({ id })),
        });
        console.log('🗑️ Notificaciones canceladas:', notificationsToCancel.length);
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

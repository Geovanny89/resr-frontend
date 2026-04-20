/**
 * EJEMPLOS DE USO DEL HOOK useSocket
 * 
 * Estos son ejemplos de cómo implementar el hook en diferentes componentes.
 * Copia y adapta según tus necesidades.
 */

import { useSocket, useAdminSocket, useEmployeeSocket } from './useSocket';
import { useToast } from '../context/ToastContext'; // Asume que tienes un contexto de toast

// ============================================================
// EJEMPLO 1: Dashboard de Admin - Escuchar todas las citas
// ============================================================
function AdminDashboard({ businessId, userId }) {
  const { showToast } = useToast();

  const { isConnected, stats } = useAdminSocket(
    businessId,
    userId,
    {
      onNewAppointment: (appointment) => {
        showToast({
          type: 'info',
          title: '📅 Nueva Cita Agendada',
          message: `${appointment.clientName} agendó ${appointment.Service?.name}`,
          duration: 5000
        });
        // Recargar lista de citas
        refetchAppointments();
      },
      onAppointmentUpdate: (appointment) => {
        showToast({
          type: 'warning',
          title: '🔄 Cita Actualizada',
          message: `Estado cambiado a: ${appointment.status}`,
          duration: 3000
        });
      },
      onAppointmentCancel: (appointment) => {
        showToast({
          type: 'error',
          title: '❌ Cita Cancelada',
          message: `${appointment.clientName} canceló su cita`,
          duration: 5000
        });
      }
    }
  );

  return (
    <div>
      <div className={`connection-status ${isConnected ? 'online' : 'offline'}`}>
        {isConnected ? '🟢 Conectado' : '🔴 Desconectado'}
      </div>
      <div>Eventos recibidos: {stats.receivedEvents}</div>
      {/* Resto del dashboard */}
    </div>
  );
}

// ============================================================
// EJEMPLO 2: Panel de Empleado - Solo citas asignadas
// ============================================================
function EmployeePanel({ employeeId, businessId }) {
  const { showToast } = useToast();
  const [myAppointments, setMyAppointments] = useState([]);

  const { isConnected, subscribeToEmployeeAppointments } = useEmployeeSocket(
    employeeId,
    businessId,
    {
      onNewAppointment: (appointment) => {
        showToast({
          type: 'success',
          title: '🎯 Nueva Cita Asignada',
          message: `Cliente: ${appointment.clientName}`,
          duration: 6000
        });
        // Agregar a la lista
        setMyAppointments(prev => [appointment, ...prev]);
        
        // Opcional: reproducir sonido
        playNotificationSound();
      },
      onAppointmentUpdate: (appointment) => {
        // Actualizar en la lista
        setMyAppointments(prev => 
          prev.map(ap => ap.id === appointment.id ? appointment : ap)
        );
      },
      onAppointmentCancel: (appointment) => {
        showToast({
          type: 'warning',
          title: '⚠️ Cita Cancelada',
          message: `La cita con ${appointment.clientName} fue cancelada`,
          duration: 5000
        });
        // Remover de la lista
        setMyAppointments(prev => 
          prev.filter(ap => ap.id !== appointment.id)
        );
      }
    }
  );

  // Suscribirse a citas del día
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    subscribeToEmployeeAppointments(employeeId, today);
  }, [employeeId, subscribeToEmployeeAppointments]);

  return (
    <div className="employee-panel">
      <header>
        <h2>Mis Citas</h2>
        <span className={isConnected ? 'badge-success' : 'badge-danger'}>
          {isConnected ? 'En vivo' : 'Desconectado'}
        </span>
      </header>
      <AppointmentList appointments={myAppointments} />
    </div>
  );
}

// ============================================================
// EJEMPLO 3: Calendario - Escuchar cambios por fecha
// ============================================================
function CalendarView({ businessId, userId, role, selectedDate }) {
  const [appointments, setAppointments] = useState([]);

  const { isConnected, subscribeToEmployeeAppointments } = useSocket({
    businessId,
    userId,
    role,
    onAppointmentCreated: (appointment) => {
      // Solo agregar si es la fecha seleccionada
      const apptDate = new Date(appointment.startTime).toISOString().split('T')[0];
      if (apptDate === selectedDate) {
        setAppointments(prev => [...prev, appointment]);
      }
    },
    onAppointmentUpdated: (appointment) => {
      setAppointments(prev => 
        prev.map(ap => ap.id === appointment.id ? appointment : ap)
      );
    },
    onAppointmentCancelled: (appointment) => {
      setAppointments(prev => 
        prev.filter(ap => ap.id !== appointment.id)
      );
    }
  });

  // Suscribirse a cambios de la fecha seleccionada
  useEffect(() => {
    subscribeToEmployeeAppointments(null, selectedDate);
  }, [selectedDate, subscribeToEmployeeAppointments]);

  return (
    <div className="calendar">
      <div className="calendar-header">
        <span>{selectedDate}</span>
        {isConnected && <span className="live-indicator">● En vivo</span>}
      </div>
      <CalendarGrid appointments={appointments} />
    </div>
  );
}

// ============================================================
// EJEMPLO 4: Uso avanzado con control manual
// ============================================================
function AdvancedSocketExample({ businessId, userId }) {
  const [notifications, setNotifications] = useState([]);

  const {
    socket,
    isConnected,
    connectionError,
    stats,
    reconnect,
    disconnect,
    subscribeToEmployeeAppointments
  } = useSocket({
    businessId,
    userId,
    role: 'admin',
    autoConnect: true,
    onConnect: () => {
      console.log('✅ Conectado al servidor de tiempo real');
    },
    onDisconnect: (reason) => {
      console.log('❌ Desconectado:', reason);
    },
    onAppointmentCreated: (data) => {
      setNotifications(prev => [{
        id: Date.now(),
        type: 'new',
        message: `Nueva cita: ${data.clientName}`,
        time: new Date()
      }, ...prev]);
    }
  });

  const handleManualReconnect = () => {
    reconnect();
  };

  const handleDisconnect = () => {
    disconnect();
  };

  return (
    <div className="socket-control-panel">
      <h3>Control de Conexión</h3>
      
      <div className="status-bar">
        <span>Estado: {isConnected ? '🟢 Conectado' : '🔴 Desconectado'}</span>
        {connectionError && <span className="error">Error: {connectionError}</span>}
      </div>

      <div className="stats">
        <p>Eventos recibidos: {stats.receivedEvents}</p>
        {stats.lastEvent && (
          <p>Último evento: {stats.lastEvent.type} - {stats.lastEvent.time.toLocaleTimeString()}</p>
        )}
      </div>

      <div className="controls">
        <button onClick={handleManualReconnect} disabled={isConnected}>
          Reconectar
        </button>
        <button onClick={handleDisconnect} disabled={!isConnected}>
          Desconectar
        </button>
      </div>

      <div className="notifications">
        <h4>Notificaciones en tiempo real</h4>
        {notifications.map(notif => (
          <div key={notif.id} className={`notification ${notif.type}`}>
            {notif.message}
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// Funciones auxiliares de ejemplo
// ============================================================
function playNotificationSound() {
  const audio = new Audio('/sounds/notification.mp3');
  audio.play().catch(() => {
    // Ignorar errores de reproducción (ej. usuario no interactuó)
  });
}

function refetchAppointments() {
  // Implementar según tu lógica de API
  console.log('Recargando citas...');
}

export { AdminDashboard, EmployeePanel, CalendarView, AdvancedSocketExample };
export default useSocket;

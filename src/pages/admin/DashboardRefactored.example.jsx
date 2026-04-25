/**
 * EJEMPLO: Dashboard refactorizado usando los nuevos hooks
 * Este archivo es solo demostrativo - muestra cómo se vería el Dashboard
 * usando la nueva arquitectura feature-based.
 * 
 * Para usar: copiar código relevante a Dashboard.jsx gradualmente
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AdminLayout from '../../components/AdminLayout';
import ResponsiveGrid from '../../components/ResponsiveGrid';
import {
  CalendarCheck, Users, DollarSign, TrendingUp, Clock,
  CheckCircle, XCircle, ArrowRight, AlertTriangle
} from 'lucide-react';

// NUEVO: Hooks extraídos
import { useWhatsApp } from '../../features/whatsapp/hooks';
import { useBusinessStats } from '../../features/business/hooks';
import { useStatusMessage } from '../../shared/hooks';

// NUEVO: Utilidades compartidas
import { fmt, fmtDate } from '../../shared/utils/formatters';
import { getStatusConfig } from '../../shared/constants';

export default function DashboardRefactored() {
  const { business } = useAuth();
  
  // NUEVO: WhatsApp hook (maneja todo el estado y lógica)
  const { 
    status: whatsappStatus, 
    qr: whatsappQR, 
    loading: checkingWA,
    error: waError,
    isConnected,
    canConnect,
    isBranchUsingParent,
    getQR,
    reset,
    stop,
    logout
  } = useWhatsApp(business);

  // NUEVO: Stats hook (maneja fetching automático)
  const { 
    stats, 
    upcoming, 
    finance, 
    loading,
    systemNotification,
    employeeRatings
  } = useBusinessStats(business?.id);

  // NUEVO: Toast messages hook
  const { statusMsg, showSuccess, showError } = useStatusMessage();

  // UI State (solo lo necesario para UI)
  const [showQRModal, setShowQRModal] = useState(false);
  const [showWhatsAppMenu, setShowWhatsAppMenu] = useState(false);
  const [showChangeNumberConfirm, setShowChangeNumberConfirm] = useState(false);

  // Modales de confirmación (pueden usar useModal también)
  const [confirmModals, setConfirmModals] = useState({
    reset: false,
    stop: false,
    logout: false
  });

  // Calcular días de suscripción
  const daysLeft = business?.subscriptionDaysLeft;
  const isExpiringSoon = daysLeft !== null && daysLeft <= 5 && daysLeft > 0;
  const isExpired = daysLeft !== null && daysLeft <= 0;

  // Cards de estadísticas (datos del hook)
  const statCards = [
    { label: 'Total citas',  value: stats.total,     icon: CalendarCheck, color: 'purple' },
    { label: 'Pendientes',   value: stats.pending,   icon: Clock,         color: 'yellow' },
    { label: 'Completadas',  value: stats.done,       icon: CheckCircle,   color: 'green' },
    { label: 'Canceladas',   value: stats.cancelled,  icon: XCircle,       color: 'red' },
  ];

  // Handlers simplificados
  const handleGetQR = async () => {
    setShowQRModal(true);
    await getQR();
  };

  const handleReset = async () => {
    await reset();
    showSuccess('QR reiniciado');
  };

  const handleStop = async () => {
    const result = await stop();
    if (result.success) {
      showSuccess('WhatsApp pausado');
    } else {
      showError('Error al pausar');
    }
  };

  const handleLogout = async () => {
    const result = await logout();
    if (result.success) {
      showSuccess('Sesión cerrada');
    }
  };

  // Render
  return (
    <AdminLayout title="Dashboard" subtitle={`Bienvenido · ${business?.name || ''}`}>
      {/* Notificación del sistema (del hook) */}
      {systemNotification && (
        <SystemNotification message={systemNotification} />
      )}

      {/* WhatsApp Status Bar (del hook) */}
      {!business?.hasFieldTechnicians && (
        <WhatsAppStatus 
          isConnected={isConnected}
          isBranchUsingParent={isBranchUsingParent}
          canConnect={canConnect}
          onConnect={() => setShowQRModal(true)}
          onGetQR={handleGetQR}
          checking={checkingWA}
        />
      )}

      {/* Alertas de suscripción */}
      {isExpiringSoon && <SubscriptionWarning days={daysLeft} />}
      {isExpired && <SubscriptionExpired days={daysLeft} />}

      {/* Stats Grid (datos del hook) */}
      <ResponsiveGrid gap={16} minWidth={140}>
        {statCards.map(card => (
          <StatCard key={card.label} {...card} />
        ))}
      </ResponsiveGrid>

      {/* Finanzas (del hook) */}
      {!business?.hasFieldTechnicians && (
        <FinanceSummary finance={finance} />
      )}

      {/* Próximas citas (del hook) */}
      <UpcomingAppointments 
        appointments={upcoming} 
        loading={loading}
        formatDate={fmtDate}
        getStatusConfig={getStatusConfig}
      />

      {/* Modales */}
      {showQRModal && (
        <QRModal 
          qr={whatsappQR}
          checking={checkingWA}
          error={waError}
          onClose={() => setShowQRModal(false)}
          onRetry={() => getQR(true)}
          onReset={handleReset}
        />
      )}

      {/* Toast */}
      {statusMsg && <Toast message={statusMsg} />}
    </AdminLayout>
  );
}

// Sub-componentes (futuro: mover a shared/components/)
function SystemNotification({ message }) {
  return (
    <div className="alert alert-info mb-4">
      <AlertTriangle /> {message}
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color }) {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${color}`}><Icon size={22} /></div>
      <div className="stat-body">
        <div className="stat-value">{value}</div>
        <div className="stat-label">{label}</div>
      </div>
    </div>
  );
}

function FinanceSummary({ finance }) {
  return (
    <ResponsiveGrid gap={16} minWidth={140}>
      <StatCard 
        label="Ingresos totales" 
        value={fmt(finance.totalRevenue)} 
        icon={DollarSign} 
        color="teal" 
      />
      <StatCard 
        label="Ganancia negocio" 
        value={fmt(finance.ownerRevenue)} 
        icon={TrendingUp} 
        color="green" 
      />
      <StatCard 
        label="Pago empleados" 
        value={fmt(finance.employeeRevenue)} 
        icon={Users} 
        color="blue" 
      />
    </ResponsiveGrid>
  );
}

function UpcomingAppointments({ appointments, loading, formatDate, getStatusConfig }) {
  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">Próximas citas</div>
        <Link to="/admin/appointments" className="btn-ghost btn-sm">
          Ver todas <ArrowRight size={14} />
        </Link>
      </div>
      <div className="table-wrapper">
        {loading ? (
          <div className="loading">Cargando...</div>
        ) : (
          <table className="table">
            <tbody>
              {appointments.map(apt => (
                <tr key={apt.id}>
                  <td>{apt.clientName}</td>
                  <td>{formatDate(apt.startTime)}</td>
                  <td>{apt.Service?.name}</td>
                  <td>
                    <span className={getStatusConfig(apt.status).cls}>
                      {getStatusConfig(apt.status).label}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function Toast({ message: { text, type } }) {
  return (
    <div className={`toast toast-${type}`}>
      {text}
    </div>
  );
}

// ... otros componentes

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/client';
import AdminLayout from '../../components/AdminLayout';
import ResponsiveGrid from '../../components/ResponsiveGrid';
import {
  CalendarCheck, Users, DollarSign, TrendingUp, Clock,
  CheckCircle, XCircle, ArrowRight, AlertTriangle
} from 'lucide-react';

// NUEVO: Utilidades compartidas (desde shared/utils)
// import { fmt, fmtDate } from '../../shared/utils/formatters';
// NUEVO: Hooks de features (desde features/)
// import { useWhatsApp } from '../../features/whatsapp/hooks';
// import { useBusinessStats } from '../../features/business/hooks';

// LEGACY: Mantener para compatibilidad (migrar a shared/utils/formatters)
const fmt = (n) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n || 0);
const fmtDate = (d) =>
  new Date(d).toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short', timeZone: 'America/Bogota' });

const STATUS_LABELS = {
  pending:   { label: 'Pendiente',   cls: 'badge-pending' },
  confirmed: { label: 'Confirmada',  cls: 'badge-confirmed' },
  attention: { label: 'En atención', cls: 'badge-attention' },
  done:      { label: 'Completada',  cls: 'badge-done' },
  cancelled: { label: 'Cancelada',   cls: 'badge-cancelled' },
};

export default function Dashboard() {
  const { business } = useAuth();
  console.log('[Dashboard] business:', business);
  console.log('[Dashboard] isTechnicalServices:', business?.isTechnicalServices);
  console.log('[Dashboard] hasFieldTechnicians:', business?.hasFieldTechnicians);

  const [upcoming, setUpcoming] = useState([]);
  const [stats, setStats]       = useState({ total: 0, pending: 0, confirmed: 0, done: 0, cancelled: 0 });
  const [finance, setFinance]   = useState({
    totalRevenue: 0,
    ownerRevenue: 0,
    employeeRevenue: 0,
    cashRevenue: 0,
    transferRevenue: 0
  });
  const [loading, setLoading]   = useState(true);
  const [whatsappStatus, setWhatsappStatus] = useState('disconnected');
  const [whatsappQR, setWhatsappQR] = useState(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [checkingWA, setCheckingWA] = useState(false);
  const [waError, setWaError] = useState(null);
  const [systemNotification, setSystemNotification] = useState(null);
  const [employeeRatings, setEmployeeRatings] = useState([]);
  const [showWhatsAppMenu, setShowWhatsAppMenu] = useState(false);
  const [showChangeNumberConfirm, setShowChangeNumberConfirm] = useState(false);

  // Toast notification state
  const [statusMsg, setStatusMsg] = useState(null);
  const showStatus = (text, type = 'success') => {
    setStatusMsg({ text, type });
    setTimeout(() => setStatusMsg(null), 3500);
  };

  // Estados para confirmaciones modales de WhatsApp
  const [showResetWAConfirm, setShowResetWAConfirm] = useState(false);
  const [showStopWAConfirm, setShowStopWAConfirm] = useState(false);
  const [showLogoutWAConfirm, setShowLogoutWAConfirm] = useState(false);

  // Calcular días restantes de suscripción
  const daysLeft = business?.subscriptionDaysLeft;
  const isExpiringSoon = daysLeft !== null && daysLeft <= 5 && daysLeft > 0;
  const isExpired = daysLeft !== null && daysLeft <= 0;

  const checkWAStatus = async () => {
    if (!business?.id) return;
    try {
      const bizIdToCheck = (business.isBranch && business.useParentWhatsApp && business.parentBusinessId)
        ? business.parentBusinessId
        : business.id;
      const res = await api.get(`/notifications/whatsapp/status?businessId=${bizIdToCheck}`);
      setWhatsappStatus(res.data.status);
    } catch (e) {
      console.error('Error checking WA status:', e);
    }
  };

  const getWAQR = async (force = false) => {
    if (!business?.id) return;
    if (business.isBranch && business.useParentWhatsApp) return; // No permitir vincular si usa el del padre
    setCheckingWA(true);
    setWaError(null);
    setWhatsappQR(null); // Limpiar QR anterior
    try {
      if (force) {
        await api.post(`/notifications/whatsapp/reset?businessId=${business.id}`);
        // IMPORTANTE: Dale tiempo a la Evolution API para limpiar la base de datos
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
      
      // Si hay sesión guardada, intentar conectar rápidamente sin QR
      if (whatsappStatus === 'session_saved' && !force) {
        const connectRes = await api.post(`/notifications/whatsapp/connect?businessId=${business.id}`);
        if (connectRes.data.status === 'connected') {
          // El backend inicia la conexión async, mostrar conectando temporalmente
          // El polling cada 10s actualizará el estado real
          setWhatsappStatus('connecting');
          setShowQRModal(false);
          setCheckingWA(false);
          return;
        }
      }
      
      const res = await api.get(`/notifications/whatsapp/qr?businessId=${business.id}`);
      if (res.data.qr) {
        setWhatsappQR(res.data.qr);
        setWhatsappStatus('connecting');
      } else if (res.data.status === 'connected') {
        setWhatsappStatus('connected');
        setShowQRModal(false);
      }
    } catch (e) {
      console.error('Error getting WA QR:', e);
      // Si el error es 500, es probable que la instancia se esté inicializando
      if (e.response?.status === 500) {
        setWaError("La instancia se está preparando. Espera 5 segundos e intenta de nuevo.");
      } else {
        setWaError(e.response?.data?.error || 'No se pudo generar el código QR. Intenta de nuevo.');
      }
    } finally {
      setCheckingWA(false);
    }
  };

  const resetWA = () => {
    setShowResetWAConfirm(true);
  };

  const handleConfirmResetWA = async () => {
    setShowResetWAConfirm(false);
    setWhatsappQR(null);
    getWAQR(true);
  };

  const stopWA = () => {
    setShowStopWAConfirm(true);
  };

  const handleConfirmStopWA = async () => {
    setShowStopWAConfirm(false);
    try {
      await api.post(`/notifications/whatsapp/stop?businessId=${business.id}`);
      setWhatsappStatus('disconnected');
      showStatus('Servicio de WhatsApp pausado');
    } catch (e) {
      console.error('Error stopping WA:', e);
      showStatus('Error al pausar WhatsApp', 'error');
    }
  };

  const logoutWA = () => {
    setShowLogoutWAConfirm(true);
  };

  const handleConfirmLogoutWA = async () => {
    setShowLogoutWAConfirm(false);
    try {
      await api.post(`/notifications/whatsapp/logout?businessId=${business.id}`);
      setWhatsappStatus('disconnected');
      setWhatsappQR(null);
      showStatus('Sesión de WhatsApp cerrada');
    } catch (e) {
      console.error('Error logging out WA:', e);
      showStatus('Error al cerrar sesión de WhatsApp', 'error');
    }
  };

  useEffect(() => {
    if (business?.id) {
      checkWAStatus();
      const interval = setInterval(checkWAStatus, 10000); // Check cada 10s normal
      return () => clearInterval(interval);
    }
  }, [business?.id]);

  // Polling más agresivo cuando el modal QR está abierto
  useEffect(() => {
    if (showQRModal && business?.id) {
      const fastInterval = setInterval(checkWAStatus, 2000); // Check cada 2s cuando QR está abierto
      return () => clearInterval(fastInterval);
    }
  }, [showQRModal, business?.id]);

  useEffect(() => {
    if (!business?.id) return;
    const load = async () => {
      try {
        setLoading(true);
        const month = new Date().toISOString().slice(0, 7);
        const [apptRes, reportRes, systemNotifRes, employeesRes] = await Promise.all([
          api.get(`/appointments?businessId=${business.id}`),
          api.get(`/employees/commission-report?businessId=${business.id}&month=${month}`).catch(() => ({ data: null })),
          api.get('/system-settings/global-notification').catch(() => ({ data: { message: null } })),
          api.get(`/employees?businessId=${business.id}`).catch(() => ({ data: [] })),
        ]);
        setSystemNotification(systemNotifRes.data?.message);
        setEmployeeRatings(employeesRes.data || []);
        const all = apptRes.data;
        setStats({
          total:     all.length,
          pending:   all.filter(a => a.status === 'pending').length,
          confirmed: all.filter(a => a.status === 'confirmed').length,
          done:      all.filter(a => a.status === 'done').length,
          cancelled: all.filter(a => a.status === 'cancelled').length,
        });
        const now = new Date();
        setUpcoming(
          all
            .filter(a => new Date(a.startTime) >= now && ['pending', 'confirmed'].includes(a.status))
            .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
            .slice(0, 6)
        );
        if (reportRes.data?.totals) {
          const allAppts = apptRes.data;
          const currentMonth = new Date().toISOString().slice(0, 7);
          const doneThisMonth = allAppts.filter(a => a.status === 'done' && a.startTime.startsWith(currentMonth));
          
          const cash = doneThisMonth
            .filter(a => a.paymentMethod === 'cash')
            .reduce((s, a) => s + parseFloat(a.Service?.price || 0) + parseFloat(a.additionalAmount || 0), 0);
            
          const transfer = doneThisMonth
            .filter(a => a.paymentMethod === 'transfer')
            .reduce((s, a) => s + parseFloat(a.Service?.price || 0) + parseFloat(a.additionalAmount || 0), 0);

          setFinance({
            totalRevenue:    reportRes.data.totals.total,
            ownerRevenue:    reportRes.data.totals.ownerTotal,
            employeeRevenue: reportRes.data.totals.employeeTotal,
            cashRevenue: cash,
            transferRevenue: transfer
          });
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [business]);

  const statCards = [
    { label: 'Total citas',  value: stats.total,     icon: CalendarCheck, color: 'purple' },
    { label: 'Pendientes',   value: stats.pending,   icon: Clock,         color: 'yellow' },
    { label: 'Completadas',  value: stats.done,       icon: CheckCircle,   color: 'green' },
    { label: 'Canceladas',   value: stats.cancelled,  icon: XCircle,       color: 'red' },
  ];

  return (
    <AdminLayout title="Dashboard" subtitle={`Bienvenido · ${business?.name || ''}`}>
      {/* NOTIFICACIÓN DEL SISTEMA (GLOBAL) */}
      {systemNotification && (
        <div style={{
          background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
          color: 'white', padding: '16px 20px', borderRadius: 12, marginBottom: 24,
          display: 'flex', alignItems: 'center', gap: 16, border: '1px solid #334155',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}>
          <div style={{ background: 'rgba(255,255,255,0.1)', padding: 10, borderRadius: 10 }}>
            <AlertTriangle color="#f59e0b" size={24} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 13, textTransform: 'uppercase', tracking: '0.05em', color: '#94a3b8', marginBottom: 4 }}>
              Aviso del Sistema
            </div>
            <div style={{ fontSize: 15, lineHeight: 1.5 }}>
              {systemNotification}
            </div>
          </div>
        </div>
      )}

      {/* WHATSAPP STATUS BAR - Solo para empresas que NO son técnicos a domicilio NI servicios técnicos */}
      {/* Si está conectado o tiene sesión guardada, mostrar como conectado permanentemente */}
      {/* Para sucursales, verificar el hasFieldTechnicians e isTechnicalServices del negocio padre */}
      {!(business?.isBranch 
        ? (business?.ParentBusiness?.hasFieldTechnicians || business?.parentHasFieldTechnicians) ||
          (business?.ParentBusiness?.isTechnicalServices || business?.parentIsTechnicalServices)
        : business?.hasFieldTechnicians || business?.isTechnicalServices
      ) && (
        (whatsappStatus === 'connected' || whatsappStatus === 'session_saved') ? (
          // Estado conectado/guardado - siempre verde con menú de opciones
          <div className="card mb-6" style={{ 
            background: '#ecfdf5', 
            border: '1px solid #10b981', 
            padding: '12px 20px', 
            borderRadius: 12 
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ fontSize: 20 }}>✅</div>
                <div>
                  <div style={{ 
                    fontWeight: 700, 
                    fontSize: 14, 
                    color: '#065f46'
                  }}>
                    {business?.isBranch && business?.useParentWhatsApp ? 'WhatsApp (Sede Principal)' : 'WhatsApp Conectado'}
                  </div>
                  <div style={{ fontSize: 12, color: '#059669' }}>
                    Los recordatorios automáticos y calificaciones están activos
                  </div>
                </div>
              </div>
              {/* Menú de opciones para WhatsApp */}
              {!business?.isBranch && (
                <div style={{ position: 'relative' }}>
                  <button 
                    onClick={() => setShowWhatsAppMenu(!showWhatsAppMenu)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      padding: '8px',
                      cursor: 'pointer',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4
                    }}
                  >
                    <span style={{ fontSize: 20 }}>⚙️</span>
                    <span style={{ fontSize: 12, color: '#065f46', fontWeight: 500 }}>Opciones</span>
                  </button>
                  
                  {showWhatsAppMenu && (
                    <div style={{
                      position: 'absolute',
                      right: 0,
                      top: '100%',
                      marginTop: 8,
                      background: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: 8,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                      zIndex: 100,
                      minWidth: 200
                    }}>
                      <button
                        onClick={() => {
                          setShowWhatsAppMenu(false);
                          setShowChangeNumberConfirm(true);
                        }}
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          textAlign: 'left',
                          border: 'none',
                          background: 'transparent',
                          cursor: 'pointer',
                          fontSize: 14,
                          color: '#dc2626',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8
                        }}
                      >
                        <span>📱</span> Cambiar número
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          // Estado desconectado - mostrar advertencia y botón para vincular
          <div className="card mb-6" style={{ 
            background: '#fff7ed', 
            border: '1px solid #f97316', 
            padding: '12px 20px', 
            borderRadius: 12 
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ fontSize: 20 }}>📲</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: '#9a3412' }}>
                    WhatsApp Desconectado
                  </div>
                  <div style={{ fontSize: 12, color: '#c2410c' }}>
                    {business?.isBranch && business?.useParentWhatsApp 
                      ? 'Usando conexión de la sede principal.' 
                      : 'Conecta tu WhatsApp para enviar recordatorios y recibir calificaciones'}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                {(!business?.isBranch || !business?.useParentWhatsApp) && (
                  <button 
                    onClick={() => { setShowQRModal(true); getWAQR(); }} 
                    className="btn-primary btn-sm"
                    disabled={checkingWA}
                  >
                    {checkingWA ? 'Generando...' : 'Vincular WhatsApp'}
                  </button>
                )}
              </div>
            </div>
          </div>
        )
      )}

      {/* MODAL QR WHATSAPP */}
      {showQRModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div className="card" style={{ maxWidth: 400, width: '100%', textAlign: 'center', padding: 30 }}>
            <h3 style={{ marginBottom: 10 }}>Vincular WhatsApp</h3>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>
              Abre WhatsApp en tu teléfono, ve a Dispositivos vinculados y escanea este código.
            </p>
            
            {checkingWA ? (
              <div style={{ height: 256, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 15 }}>
                <div className="spinner" />
                <span style={{ fontSize: 12 }}>Iniciando sesión segura...</span>
              </div>
            ) : waError ? (
              <div style={{ height: 256, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                <div style={{ color: '#ef4444', fontSize: 14, marginBottom: 10, padding: '0 20px' }}>{waError}</div>
                <button onClick={() => getWAQR(true)} className="btn-primary btn-sm">Reintentar</button>
                <button onClick={resetWA} className="btn-outline btn-sm" style={{ marginTop: 5 }}>Borrar Sesión y Reiniciar</button>
              </div>
            ) : whatsappQR ? (
              <div style={{ background: 'white', padding: 15, borderRadius: 12, display: 'inline-block', boxShadow: '0 0 0 1px #eee' }}>
                {whatsappQR.startsWith('data:image') ? (
                  <img src={whatsappQR} alt="WhatsApp QR" style={{ width: 256, height: 256, display: 'block' }} />
                ) : (
                  <div style={{ width: 256, height: 256, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0', padding: 20 }}>
                     <div style={{ fontSize: 12, color: '#64748b' }}>
                        <div style={{ fontSize: 24, marginBottom: 10 }}>⚠️</div>
                        Generando imagen del código...
                        <div style={{ marginTop: 10, fontSize: 10, wordBreak: 'break-all', opacity: 0.5 }}>{whatsappQR.substring(0, 30)}...</div>
                     </div>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ height: 256, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <button onClick={() => getWAQR(true)} className="btn-primary">Generar QR</button>
              </div>
            )}

            <div style={{ marginTop: 25, display: 'flex', gap: 10 }}>
              <button onClick={() => setShowQRModal(false)} className="btn-secondary" style={{ flex: 1 }}>Cerrar</button>
              {whatsappQR && <button onClick={resetWA} className="btn-outline" style={{ flex: 1 }}>Reiniciar</button>}
            </div>
          </div>
        </div>
      )}

      {/* ALERTAS DE SUSCRIPCIÓN */}
      {isExpiringSoon && (
        <div className="alert alert-warning" style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12, border: '1px solid #fbd38d', borderRadius: 12, padding: '16px 20px', background: '#fffaf0' }}>
          <div style={{ fontSize: 24 }}>⏳</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, color: '#9c4221', fontSize: 15 }}>Tu suscripción está por vencer</div>
            <div style={{ fontSize: 13, color: '#c05621' }}>Faltan <strong>{daysLeft} días</strong> para que tu cuenta sea bloqueada. Por favor realiza el pago pronto.</div>
          </div>
          <Link to="/admin/submit-payment" className="btn-primary" style={{ padding: '8px 16px', fontSize: 12 }}>
            Ir a pagar
          </Link>
        </div>
      )}

      {isExpired && (
        <div className="alert alert-danger" style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12, border: '1px solid #feb2b2', borderRadius: 12, padding: '16px 20px', background: '#fff5f5' }}>
          <div style={{ fontSize: 24 }}>🚫</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, color: '#9b2c2c', fontSize: 15 }}>Suscripción vencida</div>
            <div style={{ fontSize: 13, color: '#c53030' }}>Tu suscripción venció hace <strong>{Math.abs(daysLeft)} días</strong>. Tu cuenta está en riesgo de bloqueo total.</div>
          </div>
          <Link to="/admin/my-business" className="btn-danger" style={{ padding: '8px 16px', fontSize: 12 }}>
            Pagar ahora
          </Link>
        </div>
      )}

      {/* STATS CITAS */}
      <ResponsiveGrid gap={16} minWidth={140}>
        {statCards.map(c => {
          const Icon = c.icon;
          return (
            <div key={c.label} className="stat-card" style={{ height: '100%' }}>
              <div className={`stat-icon ${c.color}`}><Icon size={22} /></div>
              <div className="stat-body">
                <div className="stat-value">{c.value}</div>
                <div className="stat-label">{c.label}</div>
              </div>
            </div>
          );
        })}
      </ResponsiveGrid>

      {/* FINANZAS DEL MES */}
      {!business?.isTechnicalServices && !business?.hasFieldTechnicians && (
        <ResponsiveGrid gap={16} minWidth={140}>
          <div className="stat-card" style={{ height: '100%' }}>
            <div className="stat-icon teal"><DollarSign size={22} /></div>
            <div className="stat-body">
              <div className="stat-value" style={{ fontSize: 18 }}>{fmt(finance.totalRevenue)}</div>
              <div className="stat-label">Ingresos totales (mes)</div>
            </div>
          </div>
          <div className="stat-card" style={{ height: '100%' }}>
            <div className="stat-icon green"><TrendingUp size={22} /></div>
            <div className="stat-body">
              <div className="stat-value" style={{ fontSize: 18 }}>{fmt(finance.ownerRevenue)}</div>
              <div className="stat-label">Ganancia del negocio</div>
            </div>
          </div>
          <div className="stat-card" style={{ height: '100%' }}>
            <div className="stat-icon blue"><Users size={22} /></div>
            <div className="stat-body">
              <div className="stat-value" style={{ fontSize: 18 }}>{fmt(finance.employeeRevenue)}</div>
              <div className="stat-label">Pago a empleados</div>
            </div>
          </div>
        </ResponsiveGrid>
      )}

      {/* DESGLOSE POR MÉTODO DE PAGO */}
      {!business?.isTechnicalServices && !business?.hasFieldTechnicians && (
        <div className="card mb-6" style={{ padding: '20px' }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <TrendingUp size={16} /> Desglose de Ingresos (Mes Actual)
          </div>
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '140px', padding: '16px', borderRadius: '12px', background: '#f0fdf4', border: '1px solid #dcfce7' }}>
              <div style={{ fontSize: 12, color: '#166534', fontWeight: 600, marginBottom: 4 }}>💵 Efectivo</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#14532d' }}>{fmt(finance.cashRevenue)}</div>
            </div>
            <div style={{ flex: 1, minWidth: '140px', padding: '16px', borderRadius: '12px', background: '#eff6ff', border: '1px solid #dbeafe' }}>
              <div style={{ fontSize: 12, color: '#1e40af', fontWeight: 600, marginBottom: 4 }}>📲 Transferencia</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#1e3a8a' }}>{fmt(finance.transferRevenue)}</div>
            </div>
          </div>
        </div>
      )}

      {/* ACCESOS RÁPIDOS */}
      <ResponsiveGrid gap={16} minWidth={180}>
        {[
          { to: '/admin/appointments', icon: '📋', label: 'Gestionar Citas',  sub: 'Ver y actualizar estados', color: '#4f46e5' },
          { to: '/admin/reports',      icon: '📊', label: 'Ver Informes',     sub: 'Día, semana y mes',        color: '#10b981' },
          ...(!business?.isTechnicalServices ? [
            { to: '/admin/payments',     icon: '💰', label: 'Pagos Empleados',  sub: 'Calcular comisiones',      color: '#f59e0b' },
          ] : []),
          { to: '/admin/employees',    icon: '👥', label: 'Empleados',        sub: 'Gestionar equipo',         color: '#3b82f6' },
        ].map(item => (
          <Link key={item.to} to={item.to} style={{ textDecoration: 'none' }}>
            <div
              className="card"
              style={{ cursor: 'pointer', borderTop: `3px solid ${item.color}`, display: 'flex', alignItems: 'center', gap: 14 }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,.1)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = ''; }}
            >
              <div style={{ fontSize: 28 }}>{item.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>{item.label}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{item.sub}</div>
              </div>
              <ArrowRight size={16} style={{ color: 'var(--text-light)' }} />
            </div>
          </Link>
        ))}
      </ResponsiveGrid>

      {/* PRÓXIMAS CITAS */}
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Próximas citas</div>
            <div className="card-subtitle">Listado de citas programadas para hoy y adelante</div>
          </div>
          <Link to="/admin/appointments" className="btn-ghost btn-sm">Ver todas <ArrowRight size={14} /></Link>
        </div>
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Fecha y Hora</th>
                <th>Servicio</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {upcoming.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
                    No hay citas próximas
                  </td>
                </tr>
              ) : (
                upcoming.map(a => (
                  <tr key={a.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{a.clientName}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{a.clientPhone}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 500 }}>{fmtDate(a.startTime)}</div>
                    </td>
                    <td>{a.Service?.name}</td>
                    <td>
                      <span className={`badge ${STATUS_LABELS[a.status]?.cls}`}>
                        {STATUS_LABELS[a.status]?.label}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL DE CONFIRMACIÓN PARA CAMBIAR NÚMERO DE WHATSAPP */}
      {showChangeNumberConfirm && (
        <div className="modal-overlay" onClick={() => setShowChangeNumberConfirm(false)}>
          <div className="modal" style={{ maxWidth: 400 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>📱</span> Cambiar número de WhatsApp
              </h3>
              <button className="btn-ghost" onClick={() => setShowChangeNumberConfirm(false)}>✕</button>
            </div>
            <div style={{ padding: '20px' }}>
              <p style={{ margin: 0, color: 'var(--text)', lineHeight: 1.5 }}>
                ¿Estás seguro de que deseas cambiar el número de WhatsApp?
              </p>
              <p style={{ margin: '12px 0 0 0', color: 'var(--text-muted)', fontSize: 14 }}>
                Se borrará la sesión actual y deberás escanear un nuevo código QR para vincular otro número.
              </p>
            </div>
            <div className="modal-footer" style={{ justifyContent: 'flex-end', gap: 10 }}>
              <button 
                className="btn-ghost" 
                onClick={() => setShowChangeNumberConfirm(false)}
                disabled={checkingWA}
              >
                Cancelar
              </button>
              <button 
                className="btn-primary" 
                onClick={async () => {
                  try {
                    setCheckingWA(true);
                    await api.post(`/notifications/whatsapp/logout?businessId=${business.id}`);
                    setWhatsappStatus('disconnected');
                    setShowChangeNumberConfirm(false);
                    setShowQRModal(true);
                    getWAQR(true);
                    showStatus('✅ Número desvinculado. Escanea el nuevo QR.', 'success');
                  } catch (e) {
                    console.error('Error desvinculando:', e);
                    showStatus('❌ Error al desvincular. Intenta de nuevo.', 'error');
                  } finally {
                    setCheckingWA(false);
                  }
                }}
                disabled={checkingWA}
              >
                {checkingWA ? 'Procesando...' : 'Sí, cambiar número'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast notification */}
      {statusMsg && (
        <div style={{
          position: 'fixed', top: 20, right: 20, zIndex: 9999,
          padding: '12px 20px', borderRadius: 10, fontWeight: 600, fontSize: 14,
          background: statusMsg.type === 'error' ? '#fee2e2' : '#d1fae5',
          color: statusMsg.type === 'error' ? '#991b1b' : '#065f46',
          border: `1px solid ${statusMsg.type === 'error' ? '#fecaca' : '#a7f3d0'}`,
          boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
          display: 'flex', alignItems: 'center', gap: 8,
          animation: 'fadeInDown 0.3s ease-out'
        }}>
          {statusMsg.type === 'error' ? <XCircle size={16} /> : <CheckCircle size={16} />}
          {statusMsg.text}
        </div>
      )}

      {/* Modal: Confirmar Reset WA */}
      {showResetWAConfirm && (
        <div className="modal-overlay" onClick={() => setShowResetWAConfirm(false)}>
          <div className="modal" style={{ maxWidth: 400 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                <AlertTriangle size={20} color="#f59e0b" /> Generar nuevo QR
              </h3>
              <button className="btn-ghost" onClick={() => setShowResetWAConfirm(false)}>✕</button>
            </div>
            <div style={{ padding: '20px' }}>
              <p style={{ margin: 0, color: 'var(--text)', lineHeight: 1.5 }}>
                ¿Deseas generar un código QR <strong>NUEVO y LIMPIO</strong>? Esto cerrará cualquier conexión previa de esta sede.
              </p>
            </div>
            <div className="modal-footer" style={{ justifyContent: 'flex-end', gap: 10 }}>
              <button className="btn-ghost" onClick={() => setShowResetWAConfirm(false)}>Cancelar</button>
              <button className="btn-primary" onClick={handleConfirmResetWA}>Sí, generar nuevo</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Confirmar Stop WA */}
      {showStopWAConfirm && (
        <div className="modal-overlay" onClick={() => setShowStopWAConfirm(false)}>
          <div className="modal" style={{ maxWidth: 400 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                <AlertTriangle size={20} color="#f59e0b" /> Pausar WhatsApp
              </h3>
              <button className="btn-ghost" onClick={() => setShowStopWAConfirm(false)}>✕</button>
            </div>
            <div style={{ padding: '20px' }}>
              <p style={{ margin: 0, color: 'var(--text)', lineHeight: 1.5 }}>
                ¿Deseas pausar el servicio de WhatsApp? La sesión se mantendrá guardada para que puedas reconectar sin escanear el QR.
              </p>
            </div>
            <div className="modal-footer" style={{ justifyContent: 'flex-end', gap: 10 }}>
              <button className="btn-ghost" onClick={() => setShowStopWAConfirm(false)}>Cancelar</button>
              <button className="btn-primary" onClick={handleConfirmStopWA}>Sí, pausar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Confirmar Logout WA */}
      {showLogoutWAConfirm && (
        <div className="modal-overlay" onClick={() => setShowLogoutWAConfirm(false)}>
          <div className="modal" style={{ maxWidth: 400 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header" style={{ borderBottomColor: '#ef4444' }}>
              <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8, color: '#ef4444' }}>
                <AlertTriangle size={20} /> Cerrar sesión de WhatsApp
              </h3>
              <button className="btn-ghost" onClick={() => setShowLogoutWAConfirm(false)}>✕</button>
            </div>
            <div style={{ padding: '20px' }}>
              <p style={{ margin: 0, color: 'var(--text)', lineHeight: 1.5 }}>
                ¡ATENCIÓN! Esto cerrará la sesión por completo y <strong>BORRARÁ</strong> la conexión actual. Tendrás que escanear el código QR nuevamente para vincular tu WhatsApp.
              </p>
            </div>
            <div className="modal-footer" style={{ justifyContent: 'flex-end', gap: 10 }}>
              <button className="btn-ghost" onClick={() => setShowLogoutWAConfirm(false)}>Cancelar</button>
              <button 
                className="btn-danger" 
                onClick={handleConfirmLogoutWA}
                style={{ background: '#ef4444', color: 'white' }}
              >
                Sí, cerrar sesión
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

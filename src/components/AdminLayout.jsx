import { useState, useEffect, useMemo } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import MobileMenu from './MobileMenu';
import { Capacitor } from '@capacitor/core';
import ThemeToggle from './ThemeToggle';
import api from '../api/client';
import BranchSelector from './BranchSelector';
import {
  LayoutDashboard, Store, Scissors, Users, Calendar, ClipboardList,
  BarChart3, DollarSign, CreditCard, LogOut, Bell, AlertTriangle, Lock, Star,
  MessageCircle, RefreshCw, Smartphone, Tag, UserCircle,
  TrendingDown, Package, PiggyBank, CalendarDays, CalendarX, Palmtree
} from 'lucide-react';

export default function AdminLayout({ children, title, subtitle }) {
  const { user, business, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024);
  const [whatsappStatus, setWhatsappStatus] = useState('disconnected');
  const [loadingWA, setLoadingWA] = useState(false);

  // Función para obtener items de navegación según módulos habilitados
  // Usamos useMemo para re-evaluar cuando business cambia
  const navItems = useMemo(() => {
    const enabledModules = business?.enabledModules || {};

    return [
      {
        section: 'Principal',
        items: [
          { to: '/admin',              icon: LayoutDashboard, label: 'Dashboard',  exact: true },
          { to: '/admin/agenda', icon: CalendarDays, label: 'Agenda' },
          { to: '/admin/appointments', icon: ClipboardList,   label: 'Citas' },
          { to: '/admin/clients',      icon: UserCircle,       label: 'Mis Clientes' },
          { to: '/admin/ratings',      icon: Star,            label: 'Calificaciones' },
          { to: '/admin/promotions',   icon: Tag,             label: 'Promociones' },
        ]
      },
      {
        section: 'Gestión',
        items: [
          { to: '/admin/services',  icon: Scissors, label: 'Servicios' },
          { to: '/admin/employees', icon: Users,    label: 'Empleados' },
          { to: '/admin/schedule',  icon: Calendar, label: 'Horarios' },
          { to: '/admin/special-schedules', icon: CalendarX, label: 'Festivos y Especiales' },
          { to: '/admin/employee-vacations', icon: Palmtree, label: 'Vacaciones' },
          { to: '/admin/business',  icon: Store,    label: 'Mi Negocio' },
        ]
      },
      {
        section: 'Finanzas',
        items: [
          { to: '/admin/payments', icon: CreditCard, label: 'Pagos y Comisiones' },
          ...(enabledModules.inventory ? [{ to: '/admin/inventory', icon: Package, label: 'Insumos' }] : []),
          ...(enabledModules.expenses ? [{ to: '/admin/expenses', icon: TrendingDown, label: 'Gastos' }] : []),
          ...(enabledModules.deposits ? [{ to: '/admin/deposits', icon: PiggyBank, label: 'Depósitos' }] : []),
        ]
      },
      {
        section: 'Informes',
        items: [
          { to: '/admin/reports', icon: BarChart3, label: 'Informes' },
        ]
      },
      {
        section: 'Configuración',
        items: [
          { to: '/admin/change-password', icon: Lock, label: 'Cambiar contraseña' },
        ]
      }
    ];
  }, [JSON.stringify(business?.enabledModules)]);

  const checkWAStatus = async () => {
    if (!business?.id || !['admin', 'admin_suc'].includes(user?.role)) return;
    try {
      const res = await api.get(`/notifications/whatsapp/status?businessId=${business.id}`);
      setWhatsappStatus(res.data.status);
    } catch (e) {
      console.error('Error checking WA status in Layout:', e);
    }
  };

  useEffect(() => {
    if (business?.id && ['admin', 'admin_suc'].includes(user?.role)) {
      checkWAStatus();
      const interval = setInterval(checkWAStatus, 15000); // Check cada 15s en el layout
      return () => clearInterval(interval);
    }
  }, [business?.id, user?.role]);

  // Detectar cambios de tamaño de pantalla
  const subscriptionDaysLeft = business?.subscriptionDaysLeft ?? null;
  const showSubscriptionWarning = subscriptionDaysLeft !== null && subscriptionDaysLeft <= 5 && subscriptionDaysLeft > 0;

  // Detectar cambios de tamaño de pantalla
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 1024);
      if (window.innerWidth > 1024) setSidebarOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = () => { logout(); navigate('/login'); };

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'AD';

  const currentItem = navItems.flatMap(s => s.items).find(item =>
    item.exact ? location.pathname === item.to : location.pathname.startsWith(item.to)
  );
  const pageTitle = title || currentItem?.label || 'Panel';

  const handleCloseSidebar = () => setSidebarOpen(false);

  return (
    <div className="app-layout">
      <MobileMenu isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} onClose={handleCloseSidebar} />
      {/* SIDEBAR */}
      {/* Overlay para cerrar sidebar en móvil */}
      {isMobile && sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
            zIndex: 99, backdropFilter: 'blur(2px)'
          }}
        />
      )}
      <aside
        className={`sidebar ${isMobile && sidebarOpen ? 'open' : ''}`}
        onClick={e => e.stopPropagation()}
      >
        <div className="sidebar-logo">
          <div>
            <div className="sidebar-logo-name">KDice </div>
            <div className="sidebar-logo-sub">{business?.name || 'Sistema de Citas'}</div>
            {/* Badge del Plan de Suscripción */}
            {business?.subscriptionPlan && (
              <div style={{ 
                marginTop: '6px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '3px 8px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: 600,
                background: business.subscriptionPlan === 'premium' ? '#fef3c7' : business.subscriptionPlan === 'pro' ? '#e0e7ff' : '#d1fae5',
                color: business.subscriptionPlan === 'premium' ? '#92400e' : business.subscriptionPlan === 'pro' ? '#3730a3' : '#065f46',
              }}>
                <span>
                  {business.subscriptionPlan === 'basic' && '💚 Básico'}
                  {business.subscriptionPlan === 'pro' && '💙 Pro'}
                  {business.subscriptionPlan === 'premium' && '💛 Premium'}
                </span>
                <span style={{ opacity: 0.8 }}>·</span>
                <span>{(business.includedUsers || 2) + (business.additionalUsers || 0)} empleados</span>
              </div>
            )}
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map(section => {
            // Filtrar items según configuración del negocio
            const filteredItems = section.items.filter(item => {
              // Si es empresa técnica, ocultar el módulo de Pagos (comisiones)
              if (business?.isTechnicalServices && item.to === '/admin/payments') return false;
              // Si es técnicos a domicilio, ocultar Promociones
              if (business?.hasFieldTechnicians && item.to === '/admin/promotions') return false;
              return true;
            });

            if (filteredItems.length === 0) return null;

            return (
              <div key={section.section}>
                <div className="sidebar-section-label">{section.section}</div>
                {filteredItems.map(item => {
                  const Icon = item.icon;
                  const isActive = item.exact
                    ? location.pathname === item.to
                    : location.pathname.startsWith(item.to);
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.exact}
                      className={`sidebar-link ${isActive ? 'active' : ''}`}
                      onClick={() => isMobile && setSidebarOpen(false)}
                    >
                      <Icon className="nav-icon" size={18} />
                      {item.label}
                    </NavLink>
                  );
                })}
              </div>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user" onClick={handleLogout} title="Cerrar sesión">
            <div className="sidebar-avatar">{initials}</div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{user?.name || 'Usuario'}</div>
              <div className="sidebar-user-role">Administrador · Salir</div>
            </div>
            <LogOut size={14} style={{ color: 'rgba(255,255,255,.4)', flexShrink: 0 }} />
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <main className="main-content">
        <header className="topbar">
          <div className="topbar-left">
            <div className="topbar-title">{pageTitle}</div>
            {subtitle && <div className="topbar-subtitle">{subtitle}</div>}
          </div>
          <div className="topbar-actions">
            {/* Selector de Sucursales (Solo si hay sucursales) */}
            {user?.role === 'admin' && <BranchSelector />}

            {/* Indicador de WhatsApp Global - Solo para empresas que NO son técnicos a domicilio NI servicios técnicos */}
            {/* Si hay sesión guardada o conectada, mostrar como 'Conectado' permanentemente */}
            {/* Para sucursales, verificar el hasFieldTechnicians e isTechnicalServices del negocio padre */}
            {['admin', 'admin_suc'].includes(user?.role) && 
              !(business?.isBranch 
                ? (business?.ParentBusiness?.hasFieldTechnicians || business?.parentHasFieldTechnicians) ||
                  (business?.ParentBusiness?.isTechnicalServices || business?.parentIsTechnicalServices)
                : business?.hasFieldTechnicians || business?.isTechnicalServices
              ) && (
              <div 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 8, 
                  padding: '6px 12px', 
                  borderRadius: 20, 
                  // Si está conectado O tiene sesión guardada, mostrar verde
                  background: (whatsappStatus === 'connected' || whatsappStatus === 'session_saved')
                    ? 'rgba(16, 185, 129, 0.1)' 
                    : 'rgba(245, 158, 11, 0.1)',
                  border: `1px solid ${(whatsappStatus === 'connected' || whatsappStatus === 'session_saved')
                    ? 'rgba(16, 185, 129, 0.2)' 
                    : 'rgba(245, 158, 11, 0.2)'}`,
                  marginRight: 8,
                  cursor: 'pointer'
                }}
                onClick={() => navigate('/admin')} // Ir al dashboard para gestionar
                title={(whatsappStatus === 'connected' || whatsappStatus === 'session_saved')
                  ? 'WhatsApp configurado correctamente' 
                  : 'WhatsApp Desconectado - Clic para vincular'}
              >
                <div style={{ 
                  width: 8, 
                  height: 8, 
                  borderRadius: '50%', 
                  background: (whatsappStatus === 'connected' || whatsappStatus === 'session_saved')
                    ? '#10b981' 
                    : '#f59e0b',
                  boxShadow: (whatsappStatus === 'connected' || whatsappStatus === 'session_saved') 
                    ? '0 0 8px #10b981' 
                    : 'none'
                }} />
                <MessageCircle size={16} color={(whatsappStatus === 'connected' || whatsappStatus === 'session_saved')
                  ? '#10b981' 
                  : '#f59e0b'} />
                {!isMobile && (
                  <span style={{ 
                    fontSize: 12, 
                    fontWeight: 700, 
                    color: (whatsappStatus === 'connected' || whatsappStatus === 'session_saved')
                      ? '#065f46' 
                      : '#92400e'
                  }}>
                    {(whatsappStatus === 'connected' || whatsappStatus === 'session_saved')
                      ? 'WhatsApp Activo' 
                      : 'WhatsApp Offline'}
                  </span>
                )}
              </div>
            )}

            {!Capacitor.isNativePlatform() && business?.slug && (
              <a
                href={`/${business.slug}`}
                target="_blank"
                rel="noreferrer"
                className="btn-outline btn-sm topbar-public-link"
                style={{ textDecoration: 'none' }}
              >
                🔗 Página pública
              </a>
            )}
            <ThemeToggle />
            <button className="btn-ghost btn-icon" title="Notificaciones">
              <Bell size={18} />
            </button>
          </div>
        </header>

        <div className="page-content fade-in">
          {children}
        </div>
      </main>
    </div>
  );
}

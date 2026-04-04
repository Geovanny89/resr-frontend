import { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import MobileMenu from './MobileMenu';
import { Capacitor } from '@capacitor/core';
import ThemeToggle from './ThemeToggle';
import {
  LayoutDashboard, Store, Scissors, Users, Calendar, ClipboardList,
  BarChart3, DollarSign, CreditCard, LogOut, Bell, AlertTriangle, Lock
} from 'lucide-react';

const NAV_ITEMS = [
  {
    section: 'Principal',
    items: [
      { to: '/admin',              icon: LayoutDashboard, label: 'Dashboard',  exact: true },
      { to: '/admin/appointments', icon: ClipboardList,   label: 'Citas' },
    ]
  },
  {
    section: 'Gestión',
    items: [
      { to: '/admin/services',  icon: Scissors, label: 'Servicios' },
      { to: '/admin/employees', icon: Users,    label: 'Empleados' },
      { to: '/admin/schedule',  icon: Calendar, label: 'Horarios' },
      { to: '/admin/business',  icon: Store,    label: 'Mi Negocio' },
    ]
  },
  {
    section: 'Finanzas',
    items: [
      { to: '/admin/reports',  icon: BarChart3,  label: 'Informes' },
      { to: '/admin/payments', icon: DollarSign, label: 'Pagos' },
      { to: '/admin/submit-payment', icon: CreditCard, label: 'Enviar Pago' },
    ]
  },
  {
    section: 'Configuración',
    items: [
      { to: '/admin/change-password', icon: Lock, label: 'Cambiar contraseña' },
    ]
  }
];

export default function AdminLayout({ children, title, subtitle }) {
  const { user, business, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024);

  // Calcular días restantes de suscripción
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

  const currentItem = NAV_ITEMS.flatMap(s => s.items).find(item =>
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
            <div className="sidebar-logo-name">KDice POS</div>
            <div className="sidebar-logo-sub">{business?.name || 'Sistema de Citas'}</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {NAV_ITEMS.map(section => (
            <div key={section.section}>
              <div className="sidebar-section-label">{section.section}</div>
              {section.items.map(item => {
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
          ))}
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

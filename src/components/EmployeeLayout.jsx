import { useState, useEffect, Suspense } from 'react';
import { NavLink, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import MobileMenu from './MobileMenu';
import ThemeToggle from './ThemeToggle';
import api from '../api/client';
import {
  LayoutDashboard, ClipboardList, UserCircle, Star, DollarSign,
  Users, LogOut, Bell, Briefcase, Lock
} from 'lucide-react';

// Función para obtener items de navegación según tipo de negocio
const getNavItems = (business, onChangePassword) => {
  const isTechnical = business?.isTechnicalServices;
  const isFieldTech = business?.hasFieldTechnicians;

  return [
    {
      section: 'Principal',
      items: [
        { to: '/employee', icon: LayoutDashboard, label: 'Dashboard', exact: true },
        { to: '/employee/commissions', icon: (isTechnical || isFieldTech) ? Briefcase : DollarSign, label: (isTechnical || isFieldTech) ? 'Mis Servicios' : 'Mis Comisiones' },
        { to: '/employee/ratings', icon: Star, label: 'Mis Calificaciones' },
        { to: '/employee/clients', icon: Users, label: 'Mis Clientes' },
      ]
    },
    {
      section: 'Configuración',
      items: [
        { to: '/employee/profile', icon: UserCircle, label: 'Mi Perfil' },
        { action: 'changePassword', icon: Lock, label: 'Cambiar Contraseña', onClick: onChangePassword },
      ]
    }
  ];
};

export default function EmployeeLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024);
  // Cachear en sessionStorage para evitar parpadeo al navegar entre páginas
  const [business, setBusiness] = useState(() => {
    try {
      const cached = sessionStorage.getItem('employeeBusiness');
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });

  // Detectar cambios de tamaño de pantalla
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 1024);
      if (window.innerWidth > 1024) setSidebarOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Cargar info del negocio (con cache para evitar parpadeo)
  useEffect(() => {
    const loadBusiness = async () => {
      try {
        const res = await api.get('/employees/me/info');
        if (res.data?.businessId) {
          const bizRes = await api.get(`/businesses/by-id/${res.data.businessId}/public`);
          setBusiness(bizRes.data);
          // Guardar en cache para futuras navegaciones
          sessionStorage.setItem('employeeBusiness', JSON.stringify(bizRes.data));
        }
      } catch (e) {
        console.error('Error loading business:', e);
      }
    };
    loadBusiness();
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem('employeeBusiness');
    logout();
    navigate('/login');
  };

  const handleChangePassword = () => {
    navigate('/employee', { state: { openChangePassword: true } });
    if (isMobile) setSidebarOpen(false);
  };

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'EM';

  const currentItem = getNavItems(business, handleChangePassword).flatMap(s => s.items).find(item =>
    item.to && (item.exact ? location.pathname === item.to : location.pathname.startsWith(item.to))
  );
  const pageTitle = currentItem?.label || 'Panel';

  const handleCloseSidebar = () => setSidebarOpen(false);

  return (
    <div className="app-layout">
      <MobileMenu isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} onClose={handleCloseSidebar} />
      
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
      
      {/* SIDEBAR */}
      <aside
        className={`sidebar ${isMobile && sidebarOpen ? 'open' : ''}`}
        onClick={e => e.stopPropagation()}
      >
        <div className="sidebar-logo">
          <div>
            <div className="sidebar-logo-name">KDice</div>
            <div className="sidebar-logo-sub">{business?.name || 'Panel Empleado'}</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {getNavItems(business, handleChangePassword).map(section => (
            <div key={section.section}>
              <div className="sidebar-section-label">{section.section}</div>
              {section.items.map(item => {
                const Icon = item.icon;
                const isActive = item.to && (item.exact
                  ? location.pathname === item.to
                  : location.pathname.startsWith(item.to));
                if (item.action === 'changePassword') {
                  return (
                    <button
                      key={item.action}
                      onClick={item.onClick}
                      className="sidebar-link"
                      style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer' }}
                    >
                      <Icon className="nav-icon" size={18} />
                      {item.label}
                    </button>
                  );
                }
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
              <div className="sidebar-user-name">{user?.name || 'Empleado'}</div>
              <div className="sidebar-user-role">Empleado · Salir</div>
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
          </div>
          <div className="topbar-actions">
            <ThemeToggle />
            <button className="btn-ghost btn-icon" title="Notificaciones">
              <Bell size={18} />
            </button>
          </div>
        </header>

        <div className="page-content fade-in">
          <Suspense fallback={
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
              <div className="spinner" />
            </div>
          }>
            <Outlet />
          </Suspense>
        </div>
      </main>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Building2, Tag, LogOut, Bell, ShieldCheck, Menu, X,
} from 'lucide-react';

const NAV_ITEMS = [
  {
    section: 'Panel Principal',
    items: [
      { to: '/superadmin',                icon: LayoutDashboard, label: 'Dashboard',         exact: true },
    ]
  },
  {
    section: 'Gestión',
    items: [
      { to: '/superadmin/businesses',     icon: Building2,       label: 'Empresas' },
      { to: '/superadmin/business-types', icon: Tag,             label: 'Tipos de Empresa' },
    ]
  },
];

export default function SuperAdminLayout({ children, title, subtitle }) {
  const { user, logout } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile]       = useState(window.innerWidth <= 1024);

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
    : 'SA';

  const allItems    = NAV_ITEMS.flatMap(s => s.items);
  const currentItem = allItems.find(item =>
    item.exact ? location.pathname === item.to : location.pathname.startsWith(item.to)
  );
  const pageTitle = title || currentItem?.label || 'Super Admin';

  return (
    <div className="app-layout">
      {/* Overlay móvil */}
      {isMobile && sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 99, backdropFilter: 'blur(2px)' }}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`sidebar ${isMobile && sidebarOpen ? 'open' : ''}`}
        style={{ background: 'linear-gradient(180deg, #0c0a1e 0%, #1a0a2e 50%, #0c0a1e 100%)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Logo */}
        <div className="sidebar-logo" style={{ borderBottom: '1px solid rgba(139,92,246,.2)' }}>
          <div className="sidebar-logo-icon" style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}>
            <ShieldCheck size={20} color="#fff" />
          </div>
          <div>
            <div className="sidebar-logo-name" style={{ color: '#fff' }}>KDice POS</div>
            <div className="sidebar-logo-sub" style={{ color: '#a78bfa', opacity: 1, fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>
              Super Admin
            </div>
          </div>
          {isMobile && (
            <button
              onClick={() => setSidebarOpen(false)}
              style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#a78bfa', cursor: 'pointer', padding: 4 }}
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Nav */}
        <nav className="sidebar-nav">
          {NAV_ITEMS.map(section => (
            <div key={section.section}>
              <div className="sidebar-section-label" style={{ color: 'rgba(167,139,250,.5)' }}>
                {section.section}
              </div>
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
                    style={isActive
                      ? { background: 'linear-gradient(135deg, #7c3aed, #a855f7)', boxShadow: '0 4px 12px rgba(124,58,237,.5)' }
                      : { color: '#c4b5fd' }
                    }
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

        {/* Footer */}
        <div className="sidebar-footer" style={{ borderTop: '1px solid rgba(139,92,246,.2)' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '8px 12px', marginBottom: 8,
            background: 'rgba(124,58,237,.15)', borderRadius: 8,
            border: '1px solid rgba(124,58,237,.3)',
          }}>
            <ShieldCheck size={14} color="#a78bfa" />
            <span style={{ fontSize: 11, color: '#a78bfa', fontWeight: 700, textTransform: 'uppercase', letterSpacing: .5 }}>
              Acceso Total
            </span>
          </div>
          <div className="sidebar-user" onClick={handleLogout} title="Cerrar sesión" style={{ borderRadius: 8 }}>
            <div className="sidebar-avatar" style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}>
              {initials}
            </div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{user?.name || 'Super Admin'}</div>
              <div className="sidebar-user-role" style={{ color: '#a78bfa' }}>Super Admin · Salir</div>
            </div>
            <LogOut size={14} style={{ color: 'rgba(167,139,250,.5)', flexShrink: 0 }} />
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <main className="main-content">
        <header className="topbar" style={{ borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {isMobile && (
              <button
                onClick={() => setSidebarOpen(true)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: '#7c3aed', display: 'flex', alignItems: 'center' }}
              >
                <Menu size={22} />
              </button>
            )}
            <div>
              <div className="topbar-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <ShieldCheck size={18} color="#7c3aed" />
                {pageTitle}
              </div>
              {subtitle && <div className="topbar-subtitle">{subtitle}</div>}
            </div>
          </div>
          <div className="topbar-actions">
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '5px 12px', borderRadius: 20,
              background: 'linear-gradient(135deg, #ede9fe, #f5f3ff)',
              border: '1px solid #ddd6fe', fontSize: 12, fontWeight: 600, color: '#7c3aed',
            }}>
              <ShieldCheck size={13} />
              <span style={{ display: 'none' }} className="hide-xs">Panel Super Admin</span>
            </div>
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

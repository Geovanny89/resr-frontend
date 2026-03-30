import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/client';
import AdminLayout from '../../components/AdminLayout';
import ResponsiveGrid from '../../components/ResponsiveGrid';
import {
  CalendarCheck, Users, DollarSign, TrendingUp, Clock,
  CheckCircle, XCircle, ArrowRight
} from 'lucide-react';

const fmt = (n) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n || 0);
const fmtDate = (d) =>
  new Date(d).toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' });

const STATUS_LABELS = {
  pending:   { label: 'Pendiente',   cls: 'badge-pending' },
  confirmed: { label: 'Confirmada',  cls: 'badge-confirmed' },
  attention: { label: 'En atención', cls: 'badge-attention' },
  done:      { label: 'Completada',  cls: 'badge-done' },
  cancelled: { label: 'Cancelada',   cls: 'badge-cancelled' },
};

export default function Dashboard() {
  const { business } = useAuth();
  const [upcoming, setUpcoming] = useState([]);
  const [stats, setStats]       = useState({ total: 0, pending: 0, confirmed: 0, done: 0, cancelled: 0 });
  const [finance, setFinance]   = useState({ totalRevenue: 0, ownerRevenue: 0, employeeRevenue: 0 });
  const [loading, setLoading]   = useState(true);

  // Calcular días restantes de suscripción
  const daysLeft = business?.subscriptionDaysLeft;
  const isExpiringSoon = daysLeft !== null && daysLeft <= 5 && daysLeft > 0;
  const isExpired = daysLeft !== null && daysLeft <= 0;

  useEffect(() => {
    if (!business?.id) return;
    const load = async () => {
      try {
        setLoading(true);
        const month = new Date().toISOString().slice(0, 7);
        const [apptRes, reportRes] = await Promise.all([
          api.get(`/appointments?businessId=${business.id}`),
          api.get(`/employees/commission-report?businessId=${business.id}&month=${month}`).catch(() => ({ data: null })),
        ]);
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
          setFinance({
            totalRevenue:    reportRes.data.totals.total,
            ownerRevenue:    reportRes.data.totals.ownerTotal,
            employeeRevenue: reportRes.data.totals.employeeTotal,
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
      {/* ALERTAS DE SUSCRIPCIÓN */}
      {isExpiringSoon && (
        <div className="alert alert-warning" style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12, border: '1px solid #fbd38d', borderRadius: 12, padding: '16px 20px', background: '#fffaf0' }}>
          <div style={{ fontSize: 24 }}>⏳</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, color: '#9c4221', fontSize: 15 }}>Tu suscripción está por vencer</div>
            <div style={{ fontSize: 13, color: '#c05621' }}>Faltan <strong>{daysLeft} días</strong> para que tu cuenta sea bloqueada. Por favor realiza el pago pronto.</div>
          </div>
          <Link to="/admin/my-business" className="btn-primary" style={{ padding: '8px 16px', fontSize: 12 }}>
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
      <ResponsiveGrid gap={16} minWidth={150}>
        {statCards.map(c => {
          const Icon = c.icon;
          return (
            <div key={c.label} className="stat-card">
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
      <ResponsiveGrid gap={16} minWidth={200}>
        <div className="stat-card">
          <div className="stat-icon teal"><DollarSign size={22} /></div>
          <div className="stat-body">
            <div className="stat-value" style={{ fontSize: 20 }}>{fmt(finance.totalRevenue)}</div>
            <div className="stat-label">Ingresos totales (mes)</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green"><TrendingUp size={22} /></div>
          <div className="stat-body">
            <div className="stat-value" style={{ fontSize: 20 }}>{fmt(finance.ownerRevenue)}</div>
            <div className="stat-label">Ganancia del negocio</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon blue"><Users size={22} /></div>
          <div className="stat-body">
            <div className="stat-value" style={{ fontSize: 20 }}>{fmt(finance.employeeRevenue)}</div>
            <div className="stat-label">Pago a empleados</div>
          </div>
        </div>
      </ResponsiveGrid>

      {/* ACCESOS RÁPIDOS */}
      <ResponsiveGrid gap={16} minWidth={200}>
        {[
          { to: '/admin/appointments', icon: '📋', label: 'Gestionar Citas',  sub: 'Ver y actualizar estados', color: '#4f46e5' },
          { to: '/admin/reports',      icon: '📊', label: 'Ver Informes',     sub: 'Día, semana y mes',        color: '#10b981' },
          { to: '/admin/payments',     icon: '💰', label: 'Pagos Empleados',  sub: 'Calcular comisiones',      color: '#f59e0b' },
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
    </AdminLayout>
  );
}

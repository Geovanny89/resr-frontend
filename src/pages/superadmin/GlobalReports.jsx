import { useEffect, useState } from 'react';
import SuperAdminLayout from '../../components/SuperAdminLayout';
import api from '../../api/client';
import {
  TrendingUp, Users, Building2, Calendar, DollarSign,
  PieChart as PieChartIcon, BarChart3, Activity, Download, RefreshCw,
  CheckCircle, XCircle, Clock, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import {
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const COLORS = ['#7c3aed', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];

export default function GlobalReports() {
  const [stats, setStats] = useState(null);
  const [financial, setFinancial] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [toast, setToast] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (dateRange.start) params.append('startDate', dateRange.start);
      if (dateRange.end) params.append('endDate', dateRange.end);

      console.log('Cargando reportes...');
      
      const [statsRes, financialRes] = await Promise.all([
        api.get('/superadmin/reports/stats'),
        api.get(`/superadmin/reports/financial?${params}`)
      ]);

      console.log('Stats:', statsRes.data);
      console.log('Financial:', financialRes.data);

      setStats(statsRes.data);
      setFinancial(financialRes.data);
    } catch (err) {
      console.error('Error cargando reportes:', err);
      const errorMsg = err.response?.data?.error || err.message || 'Error desconocido';
      showToast(`Error al cargar reportes: ${errorMsg}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const exportData = () => {
    if (!stats) return;
    
    const data = {
      fecha: new Date().toISOString(),
      estadisticas: stats,
      financiero: financial
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte-global-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    showToast('Reporte exportado correctamente');
  };

  if (loading) {
    return (
      <SuperAdminLayout title="Reportes Globales" subtitle="Estadísticas del sistema">
        <div style={{ display: 'flex', justifyContent: 'center', padding: 100 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ 
              width: 48, height: 48, border: '3px solid var(--gray-100)', 
              borderTopColor: 'var(--primary)', borderRadius: '50%',
              animation: 'spin 1s linear infinite', margin: '0 auto 16px'
            }} />
            <p style={{ color: 'var(--text-muted)' }}>Cargando reportes...</p>
          </div>
        </div>
      </SuperAdminLayout>
    );
  }

  const userStats = stats?.users;
  const businessStats = stats?.businesses;
  const appointmentStats = stats?.appointments;

  // Datos para gráficos
  const usersByRole = userStats?.byRole?.map(r => ({
    name: r.role,
    value: parseInt(r.count)
  })) || [];

  const subscriptionData = businessStats?.bySubscription?.map(s => ({
    name: s.subscriptionStatus,
    value: parseInt(s.count)
  })) || [];

  return (
    <SuperAdminLayout title="Reportes Globales" subtitle="Estadísticas y métricas del sistema">
      <style>{`
        @media (max-width: 768px) {
          .reports-grid { grid-template-columns: 1fr 1fr !important; }
          .reports-charts { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 480px) {
          .reports-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: 20, right: 20, zIndex: 9999,
          padding: '12px 20px', borderRadius: 10, fontWeight: 600,
          background: toast.type === 'error' ? '#fee2e2' : '#d1fae5',
          color: toast.type === 'error' ? '#991b1b' : '#065f46',
          border: `1px solid ${toast.type === 'error' ? '#fecaca' : '#a7f3d0'}`,
          boxShadow: '0 4px 15px rgba(0,0,0,.15)'
        }}>
          {toast.type === 'error' ? <XCircle size={16} /> : <CheckCircle size={16} />}
          {toast.msg}
        </div>
      )}

      {/* Toolbar */}
      <div className="card" style={{ padding: '16px 20px', marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Desde:</span>
              <input
                type="date"
                value={dateRange.start}
                onChange={e => setDateRange(d => ({ ...d, start: e.target.value }))}
                style={{ width: 140 }}
              />
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Hasta:</span>
              <input
                type="date"
                value={dateRange.end}
                onChange={e => setDateRange(d => ({ ...d, end: e.target.value }))}
                style={{ width: 140 }}
              />
            </div>
            <button className="btn-outline btn-sm" onClick={loadData}>
              <RefreshCw size={14} />
            </button>
          </div>
          <button className="btn-outline" onClick={exportData}>
            <Download size={16} /> Exportar
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="reports-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginBottom: 24 }}>
        {/* Usuarios */}
        <div className="card" style={{ padding: 20, borderLeft: '4px solid #7c3aed' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: '#ede9fe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={20} color="#7c3aed" />
            </div>
            <div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Total Usuarios</div>
              <div style={{ fontSize: 28, fontWeight: 800 }}>{userStats?.total || 0}</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, fontSize: 12 }}>
            <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: 4 }}>
              <CheckCircle size={12} /> {userStats?.active || 0} activos
            </span>
            <span style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: 4 }}>
              <XCircle size={12} /> {userStats?.blocked || 0} bloqueados
            </span>
          </div>
        </div>

        {/* Negocios */}
        <div className="card" style={{ padding: 20, borderLeft: '4px solid #3b82f6' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Building2 size={20} color="#3b82f6" />
            </div>
            <div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Total Negocios</div>
              <div style={{ fontSize: 28, fontWeight: 800 }}>{businessStats?.total || 0}</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, fontSize: 12 }}>
            <span style={{ color: '#10b981' }}>{businessStats?.active || 0} activos</span>
            <span style={{ color: 'var(--text-muted)' }}>• {businessStats?.branches || 0} sucursales</span>
          </div>
        </div>

        {/* Citas */}
        <div className="card" style={{ padding: 20, borderLeft: '4px solid #10b981' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: '#d1fae5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Calendar size={20} color="#10b981" />
            </div>
            <div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Total Citas</div>
              <div style={{ fontSize: 28, fontWeight: 800 }}>{appointmentStats?.total || 0}</div>
            </div>
          </div>
          <div style={{ fontSize: 12 }}>
            <span style={{ color: 'var(--text-muted)' }}>{appointmentStats?.today || 0} hoy</span>
            <span style={{ color: 'var(--text-muted)', marginLeft: 8 }}>• {appointmentStats?.thisMonth || 0} este mes</span>
          </div>
        </div>

        {/* Ingresos */}
        {financial && (
          <div className="card" style={{ padding: 20, borderLeft: '4px solid #f59e0b' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <DollarSign size={20} color="#f59e0b" />
              </div>
              <div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Ingresos Totales</div>
                <div style={{ fontSize: 28, fontWeight: 800 }}>
                  ${financial.summary?.totalRevenue?.toLocaleString('es-CO') || 0}
                </div>
              </div>
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              {financial.summary?.totalAppointments || 0} citas • 
              Promedio: ${financial.summary?.averagePerAppointment?.toLocaleString('es-CO', { maximumFractionDigits: 0 }) || 0}
            </div>
          </div>
        )}
      </div>

      {/* Gráficos */}
      <div className="reports-charts" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
        {/* Usuarios por Rol */}
        {usersByRole.length > 0 && (
          <div className="card">
            <div style={{ padding: 20, borderBottom: '1px solid var(--border)' }}>
              <h3 style={{ margin: 0, fontSize: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <PieChartIcon size={18} color="#7c3aed" />
                Usuarios por Rol
              </h3>
            </div>
            <div style={{ padding: 20, height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={usersByRole}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {usersByRole.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Suscripciones */}
        {subscriptionData.length > 0 && (
          <div className="card">
            <div style={{ padding: 20, borderBottom: '1px solid var(--border)' }}>
              <h3 style={{ margin: 0, fontSize: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <BarChart3 size={18} color="#3b82f6" />
                Estado de Suscripciones
              </h3>
            </div>
            <div style={{ padding: 20, height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={subscriptionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="name" stroke="var(--text-muted)" />
                  <YAxis stroke="var(--text-muted)" />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]}>
                    {subscriptionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* Top Negocios por Ingresos */}
      {financial?.byBusiness && financial.byBusiness.length > 0 && (
        <div className="card" style={{ marginBottom: 24 }}>
          <div style={{ padding: 20, borderBottom: '1px solid var(--border)' }}>
            <h3 style={{ margin: 0, fontSize: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <TrendingUp size={18} color="#10b981" />
              Top Negocios por Ingresos
            </h3>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Negocio</th>
                  <th>Citas</th>
                  <th>Ingresos</th>
                  <th>Promedio</th>
                </tr>
              </thead>
              <tbody>
                {financial.byBusiness
                  .sort((a, b) => parseFloat(b.total) - parseFloat(a.total))
                  .slice(0, 10)
                  .map((biz, idx) => (
                    <tr key={biz.businessId}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{
                            width: 24, height: 24, borderRadius: '50%',
                            background: idx < 3 ? '#fef3c7' : 'var(--gray-100)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 12, fontWeight: 700, color: idx < 3 ? '#d97706' : 'var(--text-muted)'
                          }}>
                            {idx + 1}
                          </span>
                          <span style={{ fontWeight: 500 }}>{biz['Business.name'] || 'Negocio'}</span>
                        </div>
                      </td>
                      <td>{biz.appointments}</td>
                      <td style={{ fontWeight: 600, color: '#10b981' }}>
                        ${parseFloat(biz.total).toLocaleString('es-CO')}
                      </td>
                      <td style={{ color: 'var(--text-muted)' }}>
                        ${(parseFloat(biz.total) / parseInt(biz.appointments)).toLocaleString('es-CO', { maximumFractionDigits: 0 })}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Distribución de Usuarios por Rol - Tabla */}
      {userStats?.byRole && (
        <div className="card">
          <div style={{ padding: 20, borderBottom: '1px solid var(--border)' }}>
            <h3 style={{ margin: 0, fontSize: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Activity size={18} color="#7c3aed" />
              Distribución de Usuarios
            </h3>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Rol</th>
                  <th>Cantidad</th>
                  <th>Porcentaje</th>
                  <th>Visual</th>
                </tr>
              </thead>
              <tbody>
                {userStats.byRole
                  .sort((a, b) => parseInt(b.count) - parseInt(a.count))
                  .map((role, idx) => {
                    const percentage = ((parseInt(role.count) / userStats.total) * 100).toFixed(1);
                    return (
                      <tr key={role.role}>
                        <td>
                          <span style={{
                            fontSize: 12, padding: '3px 10px', borderRadius: 20, fontWeight: 600,
                            background: COLORS[idx % COLORS.length] + '20',
                            color: COLORS[idx % COLORS.length]
                          }}>
                            {role.role}
                          </span>
                        </td>
                        <td style={{ fontWeight: 600 }}>{role.count}</td>
                        <td>{percentage}%</td>
                        <td style={{ width: 200 }}>
                          <div style={{ height: 8, borderRadius: 99, background: 'var(--gray-100)', overflow: 'hidden' }}>
                            <div style={{
                              height: '100%', borderRadius: 99,
                              background: COLORS[idx % COLORS.length],
                              width: `${percentage}%`
                            }} />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </SuperAdminLayout>
  );
}

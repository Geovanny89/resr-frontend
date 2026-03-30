import { useEffect, useState } from 'react';
import SuperAdminLayout from '../../components/SuperAdminLayout';
import api from '../../api/client';
import {
  Building2, Tag, CheckCircle, XCircle, Clock, TrendingUp,
  AlertTriangle, ShieldCheck, Users, DollarSign, Activity
} from 'lucide-react';
import {
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

export default function SuperAdminHome() {
  const [businesses, setBusinesses] = useState([]);
  const [businessTypes, setBusinessTypes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/businesses'),
      api.get('/business-types/all'),
    ]).then(([bRes, tRes]) => {
      setBusinesses(bRes.data);
      setBusinessTypes(tRes.data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const totalBusinesses   = businesses.length;
  const activeBusinesses  = businesses.filter(b => b.status === 'active').length;
  const blockedBusinesses = businesses.filter(b => b.status === 'blocked').length;
  const paidBusinesses    = businesses.filter(b => b.subscriptionStatus === 'paid').length;
  const pendingPayment    = businesses.filter(b => b.subscriptionStatus === 'pending').length;
  const overduePayment    = businesses.filter(b => b.subscriptionStatus === 'overdue').length;
  const activeTypes       = businessTypes.filter(t => t.active).length;
  const pendingScreenshots = businesses.filter(b => b.paymentScreenshot && b.subscriptionStatus === 'pending').length;

  // Datos para gráficos
  const subscriptionData = [
    { name: 'Pagado', value: paidBusinesses, fill: '#10b981' },
    { name: 'Pendiente', value: pendingPayment, fill: '#f59e0b' },
    { name: 'Vencido', value: overduePayment, fill: '#ef4444' }
  ].filter(d => d.value > 0);

  const statusData = [
    { name: 'Activas', value: activeBusinesses, fill: '#059669' },
    { name: 'Bloqueadas', value: blockedBusinesses, fill: '#dc2626' }
  ].filter(d => d.value > 0);

  const businessesByType = businessTypes
    .map(type => ({
      name: type.label,
      count: businesses.filter(b => b.type === type.value).length,
      fill: ['#7c3aed', '#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#8b5cf6'][
        businessTypes.indexOf(type) % 8
      ]
    }))
    .filter(d => d.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  const recentBusinesses = [...businesses]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  if (loading) {
    return (
      <SuperAdminLayout title="Dashboard">
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: 48, height: 48, border: '3px solid #ede9fe', borderTopColor: '#7c3aed', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
            <p style={{ color: 'var(--text-muted)' }}>Cargando estadísticas...</p>
          </div>
        </div>
      </SuperAdminLayout>
    );
  }

  return (
    <SuperAdminLayout title="Dashboard" subtitle="Resumen general del sistema">
      <style>{`
        @media (max-width: 900px) {
          .sa-home-two-col { grid-template-columns: 1fr !important; }
        }
      `}</style>
      {/* Alerta de comprobantes pendientes */}
      {pendingScreenshots > 0 && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '14px 18px', borderRadius: 12, marginBottom: 24,
          background: 'linear-gradient(135deg, #fef3c7, #fffbeb)',
          border: '1px solid #fcd34d', color: '#92400e'
        }}>
          <AlertTriangle size={18} color="#f59e0b" />
          <div>
            <strong>{pendingScreenshots} comprobante{pendingScreenshots > 1 ? 's' : ''} de pago</strong> pendiente{pendingScreenshots > 1 ? 's' : ''} de revisión.
            <a href="/superadmin/businesses" style={{ marginLeft: 8, color: '#d97706', fontWeight: 700, textDecoration: 'underline' }}>
              Revisar ahora →
            </a>
          </div>
        </div>
      )}

      {/* Stats principales */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 28 }}>
        <StatCard
          icon={<Building2 size={22} />}
          color="purple"
          value={totalBusinesses}
          label="Total Empresas"
          gradient="linear-gradient(135deg, #7c3aed, #a855f7)"
        />
        <StatCard
          icon={<CheckCircle size={22} />}
          color="green"
          value={activeBusinesses}
          label="Empresas Activas"
          gradient="linear-gradient(135deg, #059669, #10b981)"
        />
        <StatCard
          icon={<XCircle size={22} />}
          color="red"
          value={blockedBusinesses}
          label="Empresas Bloqueadas"
          gradient="linear-gradient(135deg, #dc2626, #ef4444)"
        />
        <StatCard
          icon={<DollarSign size={22} />}
          color="teal"
          value={paidBusinesses}
          label="Pagos al Día"
          gradient="linear-gradient(135deg, #0d9488, #14b8a6)"
        />
        <StatCard
          icon={<Clock size={22} />}
          color="yellow"
          value={pendingPayment}
          label="Pagos Pendientes"
          gradient="linear-gradient(135deg, #d97706, #f59e0b)"
        />
        <StatCard
          icon={<Tag size={22} />}
          color="blue"
          value={activeTypes}
          label="Tipos de Empresa"
          gradient="linear-gradient(135deg, #1d4ed8, #3b82f6)"
        />
      </div>

      {/* Gráficos principales */}
      <div className="sa-home-two-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
        {/* Gráfico de Suscripciones */}
        {subscriptionData.length > 0 && (
          <div className="card">
            <div className="card-header">
              <div>
                <div className="card-title">Estado de Suscripciones</div>
                <div className="card-subtitle">Distribución de pagos</div>
              </div>
              <TrendingUp size={18} color="#7c3aed" />
            </div>
            <div style={{ height: 280, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={subscriptionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {subscriptionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value} empresas`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Gráfico de Estado */}
        {statusData.length > 0 && (
          <div className="card">
            <div className="card-header">
              <div>
                <div className="card-title">Estado de Empresas</div>
                <div className="card-subtitle">Activas vs Bloqueadas</div>
              </div>
              <Activity size={18} color="#7c3aed" />
            </div>
            <div style={{ height: 280 }}>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={statusData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="name" stroke="var(--text-muted)" />
                  <YAxis stroke="var(--text-muted)" />
                  <Tooltip 
                    contentStyle={{ background: 'var(--gray-50)', border: '1px solid var(--border)', borderRadius: 8 }}
                    formatter={(value) => `${value} empresas`}
                  />
                  <Bar dataKey="value" fill="#7c3aed" radius={[8, 8, 0, 0]}>
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* Gráfico de Empresas por Tipo */}
      {businessesByType.length > 0 && (
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="card-header">
            <div>
              <div className="card-title">Empresas por Tipo</div>
              <div className="card-subtitle">Distribución por categoría</div>
            </div>
            <Tag size={18} color="#7c3aed" />
          </div>
          <div style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={businessesByType} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis type="number" stroke="var(--text-muted)" />
                <YAxis dataKey="name" type="category" width={120} stroke="var(--text-muted)" />
                <Tooltip 
                  contentStyle={{ background: 'var(--gray-50)', border: '1px solid var(--border)', borderRadius: 8 }}
                  formatter={(value) => `${value} empresas`}
                />
                <Bar dataKey="count" fill="#7c3aed" radius={[0, 8, 8, 0]}>
                  {businessesByType.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Sección inferior: Estado de Suscripciones y Empresas Recientes */}
      <div className="sa-home-two-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Estado de suscripciones detallado */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Resumen de Suscripciones</div>
              <div className="card-subtitle">Detalles de pagos</div>
            </div>
            <DollarSign size={18} color="#7c3aed" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <ProgressBar label="Pagado" value={paidBusinesses} total={totalBusinesses} color="#10b981" />
            <ProgressBar label="Pendiente" value={pendingPayment} total={totalBusinesses} color="#f59e0b" />
            <ProgressBar label="Vencido" value={overduePayment} total={totalBusinesses} color="#ef4444" />
          </div>
        </div>

        {/* Empresas recientes */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Empresas Recientes</div>
              <div className="card-subtitle">Últimas registradas</div>
            </div>
            <Building2 size={18} color="#7c3aed" />
          </div>
          {recentBusinesses.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px 0' }}>Sin empresas registradas</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {recentBusinesses.map(b => (
                <div key={b.id} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 12px', borderRadius: 8, background: 'var(--gray-50)',
                  border: '1px solid var(--border)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 34, height: 34, borderRadius: 8,
                      background: b.status === 'active' ? '#ede9fe' : '#fee2e2',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 16
                    }}>
                      {businessTypes.find(t => t.value === b.type)?.icon || '🏪'}
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{b.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{b.type}</div>
                    </div>
                  </div>
                  <span style={{
                    fontSize: 11, padding: '3px 8px', borderRadius: 20, fontWeight: 600,
                    background: b.status === 'active' ? '#d1fae5' : '#fee2e2',
                    color: b.status === 'active' ? '#065f46' : '#991b1b'
                  }}>
                    {b.status === 'active' ? 'Activo' : 'Bloqueado'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </SuperAdminLayout>
  );
}

function StatCard({ icon, value, label, gradient }) {
  return (
    <div style={{
      borderRadius: 14, padding: '20px 22px',
      background: gradient,
      color: '#fff', boxShadow: '0 4px 15px rgba(0,0,0,.15)',
      display: 'flex', alignItems: 'center', gap: 14,
      transition: 'transform .2s, box-shadow .2s',
      cursor: 'default'
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,.2)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,.15)'; }}
    >
      <div style={{ opacity: .85 }}>{icon}</div>
      <div>
        <div style={{ fontSize: 28, fontWeight: 800, lineHeight: 1.1 }}>{value}</div>
        <div style={{ fontSize: 12, opacity: .85, marginTop: 3 }}>{label}</div>
      </div>
    </div>
  );
}

function ProgressBar({ label, value, total, color }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
        <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>{label}</span>
        <span style={{ fontSize: 13, fontWeight: 700, color }}>{value} ({pct}%)</span>
      </div>
      <div style={{ height: 8, borderRadius: 99, background: 'var(--gray-100)', overflow: 'hidden' }}>
        <div style={{
          height: '100%', borderRadius: 99, background: color,
          width: `${pct}%`, transition: 'width .6s ease'
        }} />
      </div>
    </div>
  );
}

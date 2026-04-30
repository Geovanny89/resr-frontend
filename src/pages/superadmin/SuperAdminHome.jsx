import { useEffect, useState } from 'react';
import SuperAdminLayout from '../../components/SuperAdminLayout';
import api from '../../api/client';
import {
  Building2, Tag, CheckCircle, XCircle, Clock, TrendingUp,
  AlertTriangle, ShieldCheck, Users, DollarSign, Activity, Star, Smartphone
} from 'lucide-react';
import {
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

export default function SuperAdminHome() {
  const [businesses, setBusinesses] = useState([]);
  const [businessTypes, setBusinessTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [globalNotif, setGlobalNotif] = useState({ value: '', isActive: false });
  const [testimonialCampaign, setTestimonialCampaign] = useState({ value: '', isActive: false });
  const [savingNotif, setSavingNotif] = useState(false);
  const [savingCampaign, setSavingCampaign] = useState(false);
  
  // App Version Control
  const [appVersionConfig, setAppVersionConfig] = useState({
    version: '1.0.0',
    forceUpdate: false,
    releaseNotes: '',
    downloadUrl: 'https://profesional.k-dice.com?autodownload=true#app'
  });
  const [savingAppVersion, setSavingAppVersion] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    Promise.all([
      api.get('/businesses'),
      api.get('/business-types/all'),
      api.get('/system-settings/global_notification'),
      api.get('/system-settings/testimonial_campaign'),
      api.get('/apk/version')
    ]).then(([bRes, tRes, nRes, cRes, aRes]) => {
      setBusinesses(bRes.data || []);
      setBusinessTypes(tRes.data || []);
      setGlobalNotif(nRes.data || { value: '', isActive: false });
      setTestimonialCampaign(cRes.data || { value: '', isActive: false });
      if (aRes.data) {
        setAppVersionConfig({
          version: aRes.data.version || '1.0.0',
          forceUpdate: aRes.data.forceUpdate || false,
          releaseNotes: Array.isArray(aRes.data.releaseNotes) ? aRes.data.releaseNotes.join('\n') : '',
          downloadUrl: aRes.data.downloadUrl || 'https://profesional.k-dice.com#download'
        });
      }
    }).catch((err) => {
      console.error('Error loading SuperAdmin stats:', err);
    }).finally(() => setLoading(false));
  }, []);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const saveGlobalNotification = async () => {
    setSavingNotif(true);
    try {
      const payload = { 
        value: globalNotif.value || '', 
        isActive: globalNotif.isActive || false 
      };
      const res = await api.put('/system-settings/global_notification', payload);
      setGlobalNotif(res.data);
      showToast('Notificación actualizada correctamente');
    } catch (e) {
      showToast('Error al guardar: ' + e.message, 'error');
    } finally {
      setSavingNotif(false);
    }
  };

  const saveTestimonialCampaign = async () => {
    setSavingCampaign(true);
    try {
      const payload = { 
        value: 'active', 
        isActive: testimonialCampaign.isActive 
      };
      const res = await api.put('/system-settings/testimonial_campaign', payload);
      setTestimonialCampaign(res.data);
      showToast('Campaña de testimonios actualizada');
    } catch (e) {
      showToast('Error al guardar campaña', 'error');
    } finally {
      setSavingCampaign(false);
    }
  };

  const totalBusinesses   = businesses.length;
  const activeBusinesses  = businesses.filter(b => b.status === 'active').length;
  const blockedBusinesses = businesses.filter(b => b.status === 'blocked').length;
  const paidBusinesses    = businesses.filter(b => b.subscriptionStatus === 'paid').length;
  const pendingPayment    = businesses.filter(b => b.subscriptionStatus === 'pending').length;
  const overduePayment    = businesses.filter(b => b.subscriptionStatus === 'overdue').length;
  const activeTypes       = businessTypes.filter(t => t.active).length;
  
  const pendingScreenshots = businesses.filter(b => 
    (b.paymentScreenshot && !b.paymentScreenshotViewed && b.subscriptionStatus === 'pending') ||
    (b.branchPaymentScreenshot && b.branchStatus === 'pending_approval')
  ).length;

  const pendingBranches = businesses.filter(b => b.isBranch && b.branchStatus === 'pending_approval').length;

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
            <div style={{ width: 48, height: 48, border: '3px solid var(--gray-100)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
            <p style={{ color: 'var(--text-muted)' }}>Cargando estadísticas...</p>
          </div>
        </div>
      </SuperAdminLayout>
    );
  }
  const saveAppVersionConfig = async () => {
    setSavingAppVersion(true);
    try {
      const configToSave = {
        ...appVersionConfig,
        releaseNotes: appVersionConfig.releaseNotes.split('\n').filter(n => n.trim() !== '')
      };
      await api.put('/system-settings/app_version_config', { value: JSON.stringify(configToSave) });
      alert('Configuración de App actualizada correctamente');
    } catch (e) {
      alert('Error al guardar configuración de App');
    } finally {
      setSavingAppVersion(false);
    }
  };
  return (
    <SuperAdminLayout title="Dashboard" subtitle="Resumen general del sistema">
      <style>{`
        @media (max-width: 1024px) {
          .sa-home-two-col { 
            grid-template-columns: 1fr !important; 
            gap: 16px !important;
          }
          .sa-home-stats-summary {
            display: none;
          }
        }
        @media (max-width: 640px) {
          .stat-grid {
            grid-template-columns: 1fr 1fr !important;
          }
        }
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Toast sutil */}
      {toast && (
        <div style={{
          position: 'fixed', top: 20, right: 20, zIndex: 9999,
          padding: '12px 20px', borderRadius: 10, fontWeight: 600, fontSize: 14,
          background: toast.type === 'error' ? '#fee2e2' : '#d1fae5',
          color: toast.type === 'error' ? '#991b1b' : '#065f46',
          border: `1px solid ${toast.type === 'error' ? '#fecaca' : '#a7f3d0'}`,
          boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
          display: 'flex', alignItems: 'center', gap: 8,
          animation: 'fadeInDown 0.3s ease-out'
        }}>
          {toast.type === 'error' ? <XCircle size={16} /> : <CheckCircle size={16} />}
          {toast.msg}
        </div>
      )}
      {/* Alerta de comprobantes pendientes */}
      <div className="sa-home-two-col" style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: 24, marginBottom: 24 }}>
        <div>
          {pendingScreenshots > 0 && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '14px 18px', borderRadius: 12, marginBottom: 12,
              background: 'var(--warning-bg)',
              border: '1px solid var(--warning-border)', color: 'var(--warning-text)'
            }}>
              <AlertTriangle size={18} color="var(--warning)" />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700 }}>{pendingScreenshots} solicitud(es) pendiente(s)</div>
                <div style={{ fontSize: 13, opacity: 0.9 }}>
                  {pendingBranches > 0 && <span>• {pendingBranches} sucursal(es) esperando aprobación. <br/></span>}
                  • {pendingScreenshots - pendingBranches} pago(s) de suscripción por revisar.
                </div>
              </div>
              <a href={pendingBranches > 0 ? "/superadmin/branches" : "/superadmin/businesses"} className="btn-primary" style={{ padding: '8px 16px', fontSize: 13, textDecoration: 'none' }}>
                Revisar ahora
              </a>
            </div>
          )}

          {/* Gestión de Notificación Global */}
          <div className="card" style={{ padding: 20 }}>
            <h3 style={{ fontSize: 16, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Activity size={18} color="var(--primary)" /> Notificación Global del Sistema
            </h3>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
              Este mensaje aparecerá en el dashboard de todos los administradores de negocios.
            </p>
            <div style={{ marginBottom: 16 }}>
              <textarea 
                className="input" 
                rows="3" 
                placeholder="Ej: Mantenimiento programado hoy a las 10:00 PM..."
                value={globalNotif.value}
                onChange={(e) => setGlobalNotif({ ...globalNotif, value: e.target.value })}
                style={{ width: '100%', borderRadius: 8, resize: 'none' }}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={globalNotif.isActive}
                  onChange={(e) => setGlobalNotif({ ...globalNotif, isActive: e.target.checked })}
                  style={{ width: 18, height: 18 }}
                />
                Activar mensaje para todos
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <button 
                  className="btn-primary" 
                  onClick={saveGlobalNotification}
                  disabled={savingNotif}
                  style={{ padding: '8px 20px', fontSize: 14 }}
                >
                  {savingNotif ? 'Guardando...' : 'Guardar '}
                </button>
              </div>
            </div>
          </div>

          {/* Campaña de Testimonios */}
          <div className="card" style={{ padding: 20, marginTop: 16, border: '1px solid #6366f1' }}>
            <h3 style={{ fontSize: 16, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8, color: '#4f46e5' }}>
              <Star size={18} fill="#4f46e5" /> Solicitar Testimonios (Social Proof)
            </h3>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
              Al activar esto, todos los negocios verán un banner en su dashboard invitándoles a dejar un testimonio. 
              <strong> Desaparecerá automáticamente para cada negocio una vez que envíen su reseña.</strong>
            </p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, cursor: 'pointer', fontWeight: 600 }}>
                <input 
                  type="checkbox" 
                  checked={testimonialCampaign.isActive}
                  onChange={(e) => setTestimonialCampaign({ ...testimonialCampaign, isActive: e.target.checked })}
                  style={{ width: 20, height: 20 }}
                />
                Lanzar campaña de testimonios
              </label>
              <button 
                className="btn-primary" 
                onClick={saveTestimonialCampaign}
                disabled={savingCampaign}
                style={{ padding: '8px 20px', fontSize: 14, background: '#6366f1' }}
              >
                {savingCampaign ? 'Guardando...' : 'Aplicar Cambio'}
              </button>
            </div>
          </div>

          {/* Control de Versión de la App */}
          <div className="card" style={{ padding: 20, marginTop: 16, border: '1px solid #10b981' }}>
            <h3 style={{ fontSize: 16, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8, color: '#059669' }}>
              <Smartphone size={18} /> Control de Versión App (APK)
            </h3>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
              Define la versión más reciente. Los usuarios con una versión inferior verán un aviso para descargar la nueva.
            </p>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Versión (ej: 1.0.2)</label>
                <input 
                  type="text" 
                  value={appVersionConfig.version}
                  onChange={(e) => setAppVersionConfig({ ...appVersionConfig, version: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg-input)', color: 'var(--text)' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>URL de descarga (Landing)</label>
                <input 
                  type="text" 
                  value={appVersionConfig.downloadUrl}
                  onChange={(e) => setAppVersionConfig({ ...appVersionConfig, downloadUrl: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg-input)', color: 'var(--text)' }}
                />
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Notas de la versión (una por línea)</label>
              <textarea 
                value={appVersionConfig.releaseNotes}
                onChange={(e) => setAppVersionConfig({ ...appVersionConfig, releaseNotes: e.target.value })}
                placeholder="Ej: Nuevo sistema de pagos&#10;Corrección de errores en agenda"
                style={{ width: '100%', padding: '8px', borderRadius: 6, border: '1px solid var(--border)', minHeight: 80, background: 'var(--bg-input)', color: 'var(--text)' }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={appVersionConfig.forceUpdate}
                  onChange={(e) => setAppVersionConfig({ ...appVersionConfig, forceUpdate: e.target.checked })}
                  style={{ width: 18, height: 18 }}
                />
                Forzar actualización (Bloquea la app hasta actualizar)
              </label>
              <button 
                className="btn-primary" 
                onClick={saveAppVersionConfig}
                disabled={savingAppVersion}
                style={{ padding: '8px 20px', fontSize: 14, background: '#10b981' }}
              >
                {savingAppVersion ? 'Guardando...' : 'Actualizar Versión'}
              </button>
            </div>
          </div>
        </div>

        <div className="card sa-home-stats-summary" style={{ padding: 20 }}>
          <h3 style={{ fontSize: 16, marginBottom: 16 }}>Resumen Rápido</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
              <span style={{ color: 'var(--text-muted)' }}>Negocios totales:</span>
              <strong>{totalBusinesses}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
              <span style={{ color: 'var(--text-muted)' }}>Suscripciones pagas:</span>
              <strong style={{ color: 'var(--success)' }}>{paidBusinesses}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
              <span style={{ color: 'var(--text-muted)' }}>Vencimientos:</span>
              <strong style={{ color: 'var(--danger)' }}>{overduePayment}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Stats principales */}
      <div className="stat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 28 }}>
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
                      background: b.status === 'active' ? 'var(--success-bg)' : 'var(--danger-bg)',
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
                    background: b.status === 'active' ? 'var(--success-bg)' : 'var(--danger-bg)',
                    color: b.status === 'active' ? 'var(--success-text)' : 'var(--danger-text)'
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

import { useEffect, useState } from 'react';
import SuperAdminLayout from '../../components/SuperAdminLayout';
import api from '../../api/client';
import {
  Activity, Search, Filter, Calendar, User, RefreshCw,
  CheckCircle, XCircle, AlertTriangle, Eye, X, Download,
  LogIn, LogOut, Edit, Trash2, Plus, Lock, Unlock, Key, Building2
} from 'lucide-react';


const ACTION_ICONS = {
  LOGIN: LogIn,
  LOGOUT: LogOut,
  CREATE_USER: Plus,
  UPDATE_USER: Edit,
  DELETE_USER: Trash2,
  BLOCK_USER: Lock,
  UNBLOCK_USER: Unlock,
  RESET_PASSWORD: Key,
  IMPERSONATE_USER: Eye,
  CREATE: Plus,
  UPDATE: Edit,
  DELETE: Trash2,
  CREATE_APPOINTMENT: Calendar,
  UPDATE_APPOINTMENT_STATUS: RefreshCw,
  UPDATE_BUSINESS: Building2,
  DELETE_BUSINESS: Trash2
};


const ACTION_LABELS = {
  LOGIN: { label: 'Inicio de sesión', color: '#10b981' },
  LOGOUT: { label: 'Cierre de sesión', color: '#6b7280' },
  CREATE_USER: { label: 'Creó usuario', color: '#3b82f6' },
  UPDATE_USER: { label: 'Actualizó usuario', color: '#f59e0b' },
  DELETE_USER: { label: 'Eliminó usuario', color: '#ef4444' },
  BLOCK_USER: { label: 'Bloqueó usuario', color: '#dc2626' },
  UNBLOCK_USER: { label: 'Desbloqueó usuario', color: '#10b981' },
  RESET_PASSWORD: { label: 'Reseteó contraseña', color: '#7c3aed' },
  IMPERSONATE_USER: { label: 'Ingresó como usuario', color: '#7c3aed' },
  CREATE: { label: 'Creó', color: '#3b82f6' },
  UPDATE: { label: 'Actualizó', color: '#f59e0b' },
  DELETE: { label: 'Eliminó', color: '#ef4444' },
  CREATE_APPOINTMENT: { label: 'Agendó Cita', color: '#10b981' },
  UPDATE_APPOINTMENT_STATUS: { label: 'Cambió Estado Cita', color: '#3b82f6' },
  UPDATE_BUSINESS: { label: 'Actualizó Negocio', color: '#f59e0b' },
  DELETE_BUSINESS: { label: 'Eliminó Negocio', color: '#ef4444' }
};


export default function ActivityLogs() {
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [showDetail, setShowDetail] = useState(null);
  const [businesses, setBusinesses] = useState([]);
  const [businessFilter, setBusinessFilter] = useState('');
  const [toast, setToast] = useState(null);


  useEffect(() => { loadLogs(); }, [pagination.page, actionFilter, businessFilter, startDate, endDate]);
  useEffect(() => { 
    loadStats(); 
    loadBusinesses();
  }, []);


  const loadLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page,
        limit: 10,
        ...(actionFilter && { action: actionFilter }),
        ...(businessFilter && { businessId: businessFilter }),
        ...(startDate && { startDate }),
        ...(endDate && { endDate })
      });

      
      const res = await api.get(`/superadmin/activity-logs?${params}`);
      setLogs(res.data?.logs || []);
      setPagination(res.data?.pagination || { page: 1, pages: 1, total: 0 });

    } catch (err) {
      showToast('Error al cargar logs', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const res = await api.get('/superadmin/activity-logs/stats');
      setStats(res.data);
    } catch (err) {
      console.error('Error cargando estadísticas:', err);
    }
  };
  
  const loadBusinesses = async () => {
    try {
      const res = await api.get('/businesses');
      setBusinesses(res.data || []);
    } catch (err) {
      console.error('Error cargando empresas:', err);
    }
  };


  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString('es-CO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getActionInfo = (action) => {
    return ACTION_LABELS[action] || { label: action, color: '#6b7280' };
  };

  const getActionIcon = (action) => {
    return ACTION_ICONS[action] || Activity;
  };

  return (
    <SuperAdminLayout title="Logs de Actividad" subtitle="Auditoría de acciones en el sistema">
      <style>{`
        @media (max-width: 768px) {
          .logs-toolbar { padding: 12px !important; }
          .logs-filters { flex-direction: column; align-items: stretch !important; gap: 8px !important; }
          .logs-filters select, .logs-filters input { width: 100% !important; }
          .date-range-container { flex-direction: column; align-items: stretch !important; }
          
          /* Transformar tabla en tarjetas robustas con GRID */
          .logs-table thead { display: none; }
          .logs-table tr { 
            display: grid !important;
            grid-template-areas: 
              "date details"
              "action action"
              "user user";
            grid-template-columns: 1fr auto;
            padding: 16px !important; 
            border-bottom: 1px solid var(--border);
            gap: 12px;
          }
          
          .logs-table td { 
            padding: 0 !important; 
            border: none !important; 
            display: flex;
            align-items: center;
          }
          
          .col-date { grid-area: date; font-weight: 600; }
          .col-details { grid-area: details; justify-content: flex-end; }
          .col-action { grid-area: action; }
          .col-user { 
            grid-area: user;
            padding-top: 10px !important;
            border-top: 1px dashed var(--border) !important;
            width: 100% !important;
          }
          
          .col-ip, .col-entity { display: none !important; }
        }
        
        .pagination-btn {
          width: 32px; height: 32px; border-radius: 8px; border: 1px solid var(--border);
          background: #fff; color: var(--text); cursor: pointer; font-weight: 600;
          display: flex; align-items: center; justify-content: center; transition: all 0.2s;
        }
        .pagination-btn:hover:not(:disabled) { border-color: var(--primary); color: var(--primary); }
        .pagination-btn.active { background: var(--primary); color: #fff; border-color: var(--primary); }
        .pagination-btn:disabled { opacity: 0.5; cursor: not-allowed; }
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

      {/* Estadísticas */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 20 }}>
          <div className="card" style={{ padding: 16, borderLeft: '4px solid #7c3aed' }}>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Total de acciones</div>
            <div style={{ fontSize: 24, fontWeight: 700 }}>{stats.total}</div>
          </div>
          {stats.actionsByType?.slice(0, 4).map(action => (
            <div key={action.action} className="card" style={{ padding: 16 }}>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>
                {getActionInfo(action.action).label}
              </div>
              <div style={{ fontSize: 24, fontWeight: 700, color: getActionInfo(action.action).color }}>
                {action.count}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Filtros */}
      <div className="logs-toolbar card" style={{ padding: '16px 20px', marginBottom: 20 }}>
        <div className="logs-filters" style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <select 
            value={actionFilter} 
            onChange={e => setActionFilter(e.target.value)}
            style={{ width: 180 }}
          >
            <option value="">Todas las acciones</option>
            {Object.entries(ACTION_LABELS).map(([key, { label }]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>

          <select 
            value={businessFilter} 
            onChange={e => setBusinessFilter(e.target.value)}
            style={{ width: 180 }}
          >
            <option value="">Todas las empresas</option>
            {businesses.map(biz => (
              <option key={biz.id} value={biz.id}>{biz.name}</option>
            ))}
          </select>

          
          <div className="date-range-container" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              style={{ width: 140 }}
            />
            <span style={{ color: 'var(--text-muted)' }}>a</span>
            <input
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              style={{ width: 140 }}
            />
          </div>

          <button className="btn-outline btn-sm" onClick={loadLogs}>
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* Tabla */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-container" style={{ overflowX: 'auto' }}>
          <table className="logs-table table">
            <thead>
              <tr>
                <th className="col-date">Fecha</th>
                <th className="col-action">Acción</th>
                <th className="col-user">Usuario</th>
                <th className="col-entity">Entidad</th>
                <th className="col-ip">IP</th>
                <th className="col-details" style={{ textAlign: 'right' }}>Detalles</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40 }}>Cargando...</td></tr>
              ) : logs.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
                  <Activity size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
                  <p>No se encontraron registros</p>
                </td></tr>
              ) : (logs || []).map(log => {
                const actionInfo = getActionInfo(log?.action);
                const ActionIcon = getActionIcon(log?.action);

                
                return (
                  <tr key={log.id}>
                    <td className="col-date" style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                      {formatDate(log.createdAt)}
                    </td>
                    <td className="col-action">
                      <span style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        fontSize: 12, padding: '4px 10px', borderRadius: 20, fontWeight: 600,
                        background: actionInfo.color + '20',
                        color: actionInfo.color,
                        width: 'fit-content'
                      }}>
                        <ActionIcon size={12} />
                        {actionInfo.label}
                      </span>
                    </td>
                    <td className="col-user">
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: 500, fontSize: 13 }}>
                          {log.User?.name || log.userEmail || 'Sistema'}
                        </span>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                          {log.User?.role || log.userRole || '-'}
                        </span>
                      </div>
                    </td>
                    <td className="col-entity">
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                        {log.entityType || '-'}
                      </span>
                    </td>
                    <td className="col-ip" style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                      {log.ipAddress || '-'}
                    </td>
                    <td className="col-details" style={{ textAlign: 'right' }}>
                      <button 
                        className="btn-outline btn-sm"
                        onClick={() => setShowDetail(log)}
                      >
                        <Eye size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {/* Paginación Mejorada */}
        {pagination.pages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6, padding: '16px 12px', borderTop: '1px solid var(--border)', flexWrap: 'wrap' }}>
            <button 
              type="button"
              className="pagination-btn" 
              onClick={() => setPagination(p => ({ ...p, page: 1 }))}
              disabled={pagination.page === 1}
              title="Primera página"
            >
              «
            </button>
            <button 
              type="button"
              className="pagination-btn" 
              onClick={() => setPagination(p => ({ ...p, page: Math.max(1, p.page - 1) }))}
              disabled={pagination.page === 1}
            >
              ‹
            </button>

            {/* Ventana de páginas (máximo 5) */}
            {(() => {
              const current = pagination.page;
              const total = pagination.pages;
              let start = Math.max(1, current - 2);
              let end = Math.min(total, start + 4);
              if (end - start < 4) start = Math.max(1, end - 4);
              
              const pages = [];
              for (let i = start; i <= end; i++) {
                pages.push(
                  <button
                    key={i}
                    type="button"
                    onClick={() => setPagination(p => ({ ...p, page: i }))}
                    className={`pagination-btn ${current === i ? 'active' : ''}`}
                  >
                    {i}
                  </button>
                );
              }
              return pages;
            })()}

            <button 
              type="button"
              className="pagination-btn" 
              onClick={() => setPagination(p => ({ ...p, page: Math.min(pagination.pages, p.page + 1) }))}
              disabled={pagination.page === pagination.pages}
            >
              ›
            </button>
            <button 
              type="button"
              className="pagination-btn" 
              onClick={() => setPagination(p => ({ ...p, page: pagination.pages }))}
              disabled={pagination.page === pagination.pages}
              title="Última página"
            >
              »
            </button>
            
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 8, width: '100%', textAlign: 'center', marginTop: 8 }}>
              Página {pagination.page} de {pagination.pages} ({pagination.total} registros)
            </div>
          </div>
        )}
      </div>

      {/* Modal: Detalle del Log */}
      {showDetail && (
        <div className="modal-overlay" onClick={() => setShowDetail(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 600 }}>
            <div className="modal-header">
              <div className="modal-title">Detalle de la Acción</div>
              <button className="btn-ghost btn-icon" onClick={() => setShowDetail(null)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div style={{ marginBottom: 20 }}>
                <div style={{ 
                  display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16,
                  padding: 16, background: 'var(--gray-50)', borderRadius: 8
                }}>
                  {(() => {
                    const Icon = getActionIcon(showDetail.action);
                    const info = getActionInfo(showDetail.action);
                    return (
                      <div style={{
                        width: 48, height: 48, borderRadius: 12,
                        background: info.color + '20',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}>
                        <Icon size={24} color={info.color} />
                      </div>
                    );
                  })()}
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 16 }}>
                      {getActionInfo(showDetail.action).label}
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
                      {formatDate(showDetail.createdAt)}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>
                      Usuario
                    </div>
                    <div style={{ fontWeight: 500 }}>{showDetail.User?.name || showDetail.userEmail || 'Sistema'}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      {showDetail.User?.role || showDetail.userRole || '-'}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>
                      IP Address
                    </div>
                    <div style={{ fontFamily: 'monospace', fontSize: 13 }}>{showDetail.ipAddress || 'N/A'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>
                      Entidad
                    </div>
                    <div>{showDetail.entityType || 'N/A'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>
                      ID Entidad
                    </div>
                    <div style={{ fontFamily: 'monospace', fontSize: 12 }}>{showDetail.entityId || 'N/A'}</div>
                  </div>
                </div>

                {showDetail.description && (
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>
                      Descripción
                    </div>
                    <div style={{ padding: 12, background: 'var(--gray-50)', borderRadius: 8, fontSize: 13 }}>
                      {showDetail.description}
                    </div>
                  </div>
                )}

                {showDetail.oldValues && (
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>
                      Valores Anteriores
                    </div>
                    <pre style={{ 
                      padding: 12, background: '#fee2e2', borderRadius: 8, 
                      fontSize: 12, overflow: 'auto', maxHeight: 200,
                      border: '1px solid #fecaca'
                    }}>
                      {JSON.stringify(showDetail.oldValues, null, 2)}
                    </pre>
                  </div>
                )}

                {showDetail.newValues && (
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>
                      Nuevos Valores
                    </div>
                    <pre style={{ 
                      padding: 12, background: '#d1fae5', borderRadius: 8, 
                      fontSize: 12, overflow: 'auto', maxHeight: 200,
                      border: '1px solid #a7f3d0'
                    }}>
                      {JSON.stringify(showDetail.newValues, null, 2)}
                    </pre>
                  </div>
                )}

                {showDetail.metadata && (
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>
                      Metadata Adicional
                    </div>
                    <pre style={{ 
                      padding: 12, background: 'var(--gray-50)', borderRadius: 8, 
                      fontSize: 12, overflow: 'auto', maxHeight: 200
                    }}>
                      {JSON.stringify(showDetail.metadata, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowDetail(null)}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </SuperAdminLayout>
  );
}

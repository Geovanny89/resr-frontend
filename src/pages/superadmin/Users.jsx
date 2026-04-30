import { useEffect, useState } from 'react';
import SuperAdminLayout from '../../components/SuperAdminLayout';
import api from '../../api/client';
import {
  Users as UsersIcon, Search, Plus, Edit2, Trash2, Lock, Unlock, Eye,
  Key, LogIn, X, CheckCircle, XCircle, User as UserIcon,
  Building2, Briefcase, Calendar, Filter, RefreshCw
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ROLE_LABELS = {
  superadmin: { label: 'SuperAdmin', color: '#7c3aed', bg: '#ede9fe' },
  admin: { label: 'Admin', color: '#059669', bg: '#d1fae5' },
  admin_suc: { label: 'Admin Suc.', color: '#0d9488', bg: '#ccfbf1' },
  employee: { label: 'Profesional', color: '#3b82f6', bg: '#dbeafe' },
  client: { label: 'Cliente', color: '#6b7280', bg: '#f3f4f6' }
};

const STATUS_LABELS = {
  active: { label: 'Activo', color: '#10b981', icon: CheckCircle },
  blocked: { label: 'Bloqueado', color: '#ef4444', icon: XCircle }
};

export default function UsersPage() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  
  // Modales
  const [showModal, setShowModal] = useState(false);
  const [showDetail, setShowDetail] = useState(null);
  const [showResetPass, setShowResetPass] = useState(null);
  const [showDelete, setShowDelete] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  
  // Formularios
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'client', status: 'active' });
  const [newPassword, setNewPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  // Estado para confirmación de impersonar
  const [showImpersonateConfirm, setShowImpersonateConfirm] = useState(false);
  const [userToImpersonate, setUserToImpersonate] = useState(null);

  useEffect(() => { loadUsers(); }, [pagination.page, search, roleFilter, statusFilter]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page,
        limit: 10,
        ...(search && { search }),
        ...(roleFilter && { role: roleFilter }),
        ...(statusFilter && { status: statusFilter })
      });
      
      const res = await api.get(`/superadmin/users?${params}`);
      setUsers(res.data.users);
      setPagination(res.data.pagination);
    } catch (err) {
      showToast('Error al cargar usuarios', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleOpenModal = (user = null) => {
    if (user) {
      setEditingUser(user);
      setForm({
        name: user.name,
        email: user.email,
        password: '',
        role: user.role,
        status: user.status
      });
    } else {
      setEditingUser(null);
      setForm({ name: '', email: '', password: '', role: 'client', status: 'active' });
    }
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingUser) {
        await api.put(`/superadmin/users/${editingUser.id}`, form);
        showToast('Usuario actualizado correctamente');
      } else {
        await api.post('/superadmin/users', form);
        showToast('Usuario creado correctamente');
      }
      setShowModal(false);
      loadUsers();
    } catch (err) {
      showToast(err.response?.data?.error || 'Error al guardar', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (user) => {
    try {
      await api.patch(`/superadmin/users/${user.id}/toggle-status`);
      showToast(`Usuario ${user.status === 'active' ? 'bloqueado' : 'desbloqueado'}`);
      loadUsers();
    } catch (err) {
      showToast('Error al cambiar estado', 'error');
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      showToast('La contraseña debe tener al menos 6 caracteres', 'error');
      return;
    }
    setSaving(true);
    try {
      const res = await api.post(`/superadmin/users/${showResetPass.id}/reset-password`, { newPassword });
      showToast(`Contraseña actualizada. Temporal: ${res.data.tempPassword}`);
      setShowResetPass(null);
      setNewPassword('');
    } catch (err) {
      showToast('Error al resetear contraseña', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      await api.delete(`/superadmin/users/${showDelete.id}`);
      showToast('Usuario eliminado correctamente');
      setShowDelete(null);
      loadUsers();
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message || 'Error desconocido';
      console.error('Error eliminando usuario:', err);
      showToast(`Error: ${errorMsg}`, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleImpersonate = (user) => {
    setUserToImpersonate(user);
    setShowImpersonateConfirm(true);
  };

  const confirmImpersonate = async () => {
    if (!userToImpersonate) return;
    
    try {
      const res = await api.post(`/superadmin/users/${userToImpersonate.id}/impersonate`);
      showToast(`Ingresando como ${userToImpersonate.name}...`);
      
      // Guardar token y redirigir
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      if (res.data.business) {
        localStorage.setItem('business', JSON.stringify(res.data.business));
      }
      
      // Redirigir según el rol
      window.location.href = res.data.redirectUrl;
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message || 'Error desconocido';
      console.error('[Impersonate Error]', err);
      showToast(`Error: ${errorMsg}`, 'error');
    } finally {
      setShowImpersonateConfirm(false);
      setUserToImpersonate(null);
    }
  };

  const openDetail = async (user) => {
    try {
      const res = await api.get(`/superadmin/users/${user.id}`);
      setShowDetail(res.data);
    } catch (err) {
      showToast('Error al cargar detalles', 'error');
    }
  };

  return (
    <SuperAdminLayout title="Gestión de Usuarios" subtitle="Administra todos los usuarios del sistema">
      <style>{`
        @media (max-width: 768px) {
          .users-toolbar { padding: 12px !important; }
          .users-filters { flex-direction: column; align-items: stretch !important; gap: 8px !important; }
          .users-filters > div, .users-filters select { width: 100% !important; flex: none !important; }
          
          /* Escondemos encabezados de tabla excepto el principal */
          .users-table thead { display: none; }
          
          .users-table tr { 
            display: flex; 
            flex-direction: column; 
            padding: 16px !important; 
            border-bottom: 1px solid var(--border);
            gap: 10px;
          }
          
          .users-table td { 
            padding: 0 !important; 
            border: none !important; 
            width: 100% !important; 
            display: flex;
            align-items: center;
          }
          
          /* Estilos específicos para celdas en móvil */
          .mobile-user-info { order: 1; }
          .mobile-role { order: 2; display: flex; gap: 8px; align-items: center; }
          .mobile-status { order: 3; }
          .mobile-actions { 
            order: 4; 
            justify-content: flex-start !important; 
            margin-top: 10px;
            padding-top: 10px !important;
            border-top: 1px dashed var(--border) !important;
            flex-wrap: wrap;
          }
          
          /* Columnas a ocultar totalmente en móvil */
          .col-biz, .col-reg { display: none !important; }
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

      {/* Toolbar */}
      <div className="users-toolbar card" style={{ padding: '16px 20px', marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'space-between' }}>
          <div className="users-filters" style={{ display: 'flex', gap: 12, flex: 1, flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: '1 1 240px' }}>
              <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Buscar por nombre o email..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ paddingLeft: 36, width: '100%' }}
              />
            </div>
            <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} style={{ width: 140 }}>
              <option value="">Todos los roles</option>
              <option value="superadmin">SuperAdmin</option>
              <option value="admin">Admin</option>
              <option value="admin_suc">Admin Suc.</option>
              <option value="employee">Profesional</option>
              <option value="client">Cliente</option>
            </select>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ width: 130 }}>
              <option value="">Todos los estados</option>
              <option value="active">Activos</option>
              <option value="blocked">Bloqueados</option>
            </select>
            <button className="btn-outline btn-sm" onClick={loadUsers}>
              <RefreshCw size={14} />
            </button>
          </div>
          <button 
            onClick={() => handleOpenModal()}
            style={{
              padding: '8px 18px', borderRadius: 8, fontSize: 13, fontWeight: 600,
              background: 'linear-gradient(135deg, #7c3aed, #a855f7)', color: '#fff',
              border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7
            }}
          >
            <Plus size={16} /> Nuevo Usuario
          </button>
        </div>
      </div>

      {/* Tabla */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="users-table table">
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Rol</th>
                <th>Estado</th>
                <th className="col-biz">Negocios</th>
                <th className="col-reg">Registro</th>
                <th style={{ textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40 }}>Cargando...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
                  <UsersIcon size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
                  <p>No se encontraron usuarios</p>
                </td></tr>
              ) : users.map(user => {
                const role = ROLE_LABELS[user.role] || ROLE_LABELS.client;
                const status = STATUS_LABELS[user.status];
                const StatusIcon = status.icon;
                const businessCount = user.Businesses?.length || 0;
                const isEmployee = user.Employees?.length > 0;
                
                return (
                  <tr key={user.id}>
                    <td className="mobile-user-info">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 36, height: 36, borderRadius: '50%',
                          background: 'linear-gradient(135deg, #667eea, #764ba2)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: '#fff', fontWeight: 700, fontSize: 14
                        }}>
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600 }}>{user.name}</div>
                          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="mobile-role">
                      <span style={{
                        fontSize: 11, padding: '3px 10px', borderRadius: 20, fontWeight: 600,
                        background: role.bg, color: role.color
                      }}>
                        {role.label}
                      </span>
                    </td>
                    <td className="mobile-status">
                      <span style={{
                        fontSize: 11, padding: '3px 10px', borderRadius: 20, fontWeight: 600,
                        display: 'flex', alignItems: 'center', gap: 4,
                        background: user.status === 'active' ? '#dcfce7' : '#fee2e2',
                        color: user.status === 'active' ? '#16a34a' : '#dc2626',
                        width: 'fit-content'
                      }}>
                        <StatusIcon size={12} /> {status.label}
                      </span>
                    </td>
                    <td className="col-biz">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
                        {businessCount > 0 && (
                          <><Building2 size={14} /> {businessCount}</>
                        )}
                        {isEmployee && (
                          <><Briefcase size={14} style={{ marginLeft: 8 }} /> Profesional</>
                        )}
                        {!businessCount && !isEmployee && (
                          <span style={{ color: 'var(--text-muted)' }}>-</span>
                        )}
                      </div>
                    </td>
                    <td className="col-reg" style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                      {new Date(user.createdAt).toLocaleDateString('es-CO')}
                    </td>
                    <td className="mobile-actions">
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                        <button 
                          className="btn-outline btn-sm" 
                          onClick={() => openDetail(user)}
                          title="Ver detalles"
                        >
                          <Eye size={14} />
                        </button>
                        <button 
                          className="btn-outline btn-sm" 
                          onClick={() => handleOpenModal(user)}
                          title="Editar"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button 
                          className={user.status === 'active' ? 'btn-warning btn-sm' : 'btn-success btn-sm'}
                          onClick={() => handleToggleStatus(user)}
                          title={user.status === 'active' ? 'Bloquear' : 'Desbloquear'}
                        >
                          {user.status === 'active' ? <Lock size={14} /> : <Unlock size={14} />}
                        </button>
                        <button 
                          className="btn-outline btn-sm"
                          onClick={() => setShowResetPass(user)}
                          title="Resetear contraseña"
                        >
                          <Key size={14} />
                        </button>
                        <button 
                          className="btn-outline btn-sm"
                          onClick={() => handleImpersonate(user)}
                          title="Ingresar como este usuario"
                          style={{ color: '#7c3aed' }}
                        >
                          <LogIn size={14} />
                        </button>
                        {user.role !== 'superadmin' && (
                          <button 
                            className="btn-danger btn-sm"
                            onClick={() => setShowDelete(user)}
                            title="Eliminar"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
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
              className="pagination-btn" 
              onClick={() => setPagination(p => ({ ...p, page: 1 }))}
              disabled={pagination.page === 1}
              title="Primera página"
            >
              «
            </button>
            <button 
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
              className="pagination-btn" 
              onClick={() => setPagination(p => ({ ...p, page: Math.min(pagination.pages, p.page + 1) }))}
              disabled={pagination.page === pagination.pages}
            >
              ›
            </button>
            <button 
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

      {/* Modal: Crear/Editar */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 480 }}>
            <div className="modal-header">
              <div className="modal-title">
                {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
              </div>
              <button className="btn-ghost btn-icon" onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Nombre completo *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    required
                    disabled={!!editingUser}
                  />
                </div>
                {!editingUser && (
                  <div className="form-group">
                    <label>Contraseña *</label>
                    <input
                      type="text"
                      value={form.password}
                      onChange={e => setForm({ ...form, password: e.target.value })}
                      required={!editingUser}
                      placeholder="Mínimo 6 caracteres"
                    />
                  </div>
                )}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="form-group">
                    <label>Rol *</label>
                    <select
                      value={form.role}
                      onChange={e => setForm({ ...form, role: e.target.value })}
                      disabled={editingUser?.role === 'superadmin'}
                    >
                      <option value="client">Cliente</option>
                      <option value="employee">Profesional</option>
                      <option value="admin_suc">Admin Sucursal</option>
                      <option value="admin">Admin</option>
                      <option value="superadmin">SuperAdmin</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Estado *</label>
                    <select
                      value={form.status}
                      onChange={e => setForm({ ...form, status: e.target.value })}
                      disabled={editingUser?.role === 'superadmin'}
                    >
                      <option value="active">Activo</option>
                      <option value="blocked">Bloqueado</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving ? 'Guardando...' : editingUser ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Detalle de usuario */}
      {showDetail && (
        <div className="modal-overlay" onClick={() => setShowDetail(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 600 }}>
            <div className="modal-header">
              <div className="modal-title">Detalles del Usuario</div>
              <button className="btn-ghost btn-icon" onClick={() => setShowDetail(null)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
                <div style={{
                  width: 64, height: 64, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #667eea, #764ba2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontWeight: 700, fontSize: 24
                }}>
                  {showDetail.user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 style={{ margin: 0 }}>{showDetail.user.name}</h3>
                  <p style={{ margin: '4px 0', color: 'var(--text-muted)' }}>{showDetail.user.email}</p>
                  <span style={{
                    fontSize: 12, padding: '3px 10px', borderRadius: 20, fontWeight: 600,
                    background: ROLE_LABELS[showDetail.user.role]?.bg || '#f3f4f6',
                    color: ROLE_LABELS[showDetail.user.role]?.color || '#6b7280'
                  }}>
                    {ROLE_LABELS[showDetail.user.role]?.label || showDetail.user.role}
                  </span>
                </div>
              </div>

              {showDetail.user.Businesses?.length > 0 && (
                <div style={{ marginBottom: 20 }}>
                  <h4 style={{ fontSize: 14, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Building2 size={16} /> Negocios ({showDetail.user.Businesses.length})
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {showDetail.user.Businesses.map(biz => (
                      <div key={biz.id} style={{
                        padding: 12, borderRadius: 8, background: 'var(--gray-50)',
                        border: '1px solid var(--border)'
                      }}>
                        <div style={{ fontWeight: 600 }}>{biz.name}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                          {biz.subscriptionStatus} • {biz.status}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {showDetail.user.Employees?.length > 0 && (
                <div style={{ marginBottom: 20 }}>
                  <h4 style={{ fontSize: 14, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Briefcase size={16} /> Empleo
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {showDetail.user.Employees.map(emp => (
                      <div key={emp.id} style={{
                        padding: 12, borderRadius: 8, background: 'var(--gray-50)',
                        border: '1px solid var(--border)'
                      }}>
                        <div style={{ fontWeight: 600 }}>{emp.Business?.name || 'Negocio'}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                          {emp.isManager ? 'Manager' : 'Profesional'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {showDetail.stats && (
                <div style={{ 
                  display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12,
                  padding: 16, background: 'var(--gray-50)', borderRadius: 8
                }}>
                  <div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Citas</div>
                    <div style={{ fontSize: 20, fontWeight: 700 }}>{showDetail.stats.appointmentsCount || 0}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Registro</div>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>
                      {new Date(showDetail.user.createdAt).toLocaleDateString('es-CO')}
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowDetail(null)}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Reset Password */}
      {showResetPass && (
        <div className="modal-overlay" onClick={() => setShowResetPass(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 400 }}>
            <div className="modal-header">
              <div className="modal-title">Resetear Contraseña</div>
              <button className="btn-ghost btn-icon" onClick={() => setShowResetPass(null)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <p style={{ marginBottom: 16, fontSize: 14, color: 'var(--text-muted)' }}>
                Nueva contraseña para <strong>{showResetPass.name}</strong>:
              </p>
              <div className="form-group">
                <label>Nueva contraseña *</label>
                <input
                  type="text"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  autoFocus
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowResetPass(null)}>
                Cancelar
              </button>
              <button 
                className="btn-primary" 
                onClick={handleResetPassword}
                disabled={saving || newPassword.length < 6}
              >
                {saving ? 'Guardando...' : 'Actualizar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Confirmar Eliminación */}
      {showDelete && (
        <div className="modal-overlay" onClick={() => setShowDelete(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 400 }}>
            <div className="modal-header" style={{ borderBottomColor: 'var(--danger)' }}>
              <div className="modal-title" style={{ color: 'var(--danger)' }}>¿Eliminar usuario?</div>
              <button className="btn-ghost btn-icon" onClick={() => setShowDelete(null)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                Estás a punto de eliminar a <strong>{showDelete.name}</strong> ({showDelete.email}).
                Esta acción no se puede deshacer.
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowDelete(null)}>
                Cancelar
              </button>
              <button 
                className="btn-danger" 
                onClick={handleDelete}
                disabled={saving}
              >
                {saving ? 'Eliminando...' : <><Trash2 size={14} /> Eliminar</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Confirmar Impersonación */}
      {showImpersonateConfirm && (
        <div className="modal-overlay" onClick={() => setShowImpersonateConfirm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 400 }}>
            <div className="modal-header" style={{ borderBottomColor: 'var(--warning)' }}>
              <div className="modal-title" style={{ color: 'var(--warning)' }}>⚠️ Ingresar como usuario</div>
              <button className="btn-ghost btn-icon" onClick={() => setShowImpersonateConfirm(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                ¿Ingresar como <strong>{userToImpersonate?.name}</strong>?<br/>
                Esto cerrará tu sesión actual de SuperAdmin.
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowImpersonateConfirm(false)}>
                Cancelar
              </button>
              <button 
                className="btn-primary" 
                onClick={confirmImpersonate}
                disabled={saving}
              >
                {saving ? 'Ingresando...' : <><LogIn size={14} /> Ingresar</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </SuperAdminLayout>
  );
}

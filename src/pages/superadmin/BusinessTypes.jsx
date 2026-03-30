import { useEffect, useState } from 'react';
import SuperAdminLayout from '../../components/SuperAdminLayout';
import api from '../../api/client';
import {
  Tag, Plus, Edit2, Trash2, ToggleLeft, ToggleRight,
  CheckCircle, XCircle, X, RefreshCw, Search, AlertTriangle
} from 'lucide-react';

const ICON_OPTIONS = [
  '✂️','💆','💅','💇','💈','🧖','🎨','✨','🐾','🏪',
  '🍕','🍔','☕','🍰','🏋️','🎭','📚','💻','🏥','🚗',
  '🌿','🎵','📷','🏠','⚽','🎯','💎','🌸','🔧','🎪'
];

const emptyForm = { value: '', label: '', icon: '🏪', order: 0, active: true };

export default function BusinessTypes() {
  const [types, setTypes]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm]           = useState(emptyForm);
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState('');
  const [toast, setToast]         = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => { loadTypes(); }, []);

  const loadTypes = async () => {
    setLoading(true);
    try {
      const res = await api.get('/business-types/all');
      setTypes(res.data);
    } catch {
      showToast('Error al cargar tipos de empresa', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleOpen = (type = null) => {
    setError('');
    if (type) {
      setEditingId(type.id);
      setForm({ value: type.value, label: type.label, icon: type.icon, order: type.order, active: type.active });
    } else {
      setEditingId(null);
      setForm(emptyForm);
    }
    setShowModal(true);
  };

  const handleClose = () => {
    setShowModal(false);
    setEditingId(null);
    setForm(emptyForm);
    setError('');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (editingId) {
        await api.put(`/business-types/${editingId}`, form);
        showToast('Tipo de empresa actualizado correctamente');
      } else {
        await api.post('/business-types', form);
        showToast('Tipo de empresa creado correctamente');
      }
      handleClose();
      loadTypes();
    } catch (e) {
      setError(e.response?.data?.error || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (type) => {
    try {
      await api.put(`/business-types/${type.id}`, { ...type, active: !type.active });
      showToast(`Tipo ${!type.active ? 'activado' : 'desactivado'} correctamente`);
      loadTypes();
    } catch {
      showToast('Error al cambiar estado', 'error');
    }
  };

  const handleDelete = async (type) => {
    setConfirmDelete(type);
  };

  const confirmDeleteAction = async () => {
    try {
      await api.delete(`/business-types/${confirmDelete.id}`);
      showToast('Tipo de empresa eliminado correctamente');
      setConfirmDelete(null);
      loadTypes();
    } catch {
      showToast('Error al eliminar', 'error');
      setConfirmDelete(null);
    }
  };

  const filtered = types.filter(t =>
    !search ||
    t.label.toLowerCase().includes(search.toLowerCase()) ||
    t.value.toLowerCase().includes(search.toLowerCase())
  );

  const activeCount   = types.filter(t => t.active).length;
  const inactiveCount = types.filter(t => !t.active).length;

  return (
    <SuperAdminLayout title="Tipos de Empresa" subtitle="Gestiona los tipos de negocio disponibles en la plataforma">
      <style>{`
        @media (max-width: 900px) {
          .sa-types-stats { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 480px) {
          .sa-types-modal-grid { grid-template-columns: 1fr !important; }
          .sa-types-icon-input { width: 100% !important; }
        }
      `}</style>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: 20, right: 20, zIndex: 9999,
          padding: '12px 20px', borderRadius: 10, fontWeight: 600, fontSize: 14,
          background: toast.type === 'error' ? '#fee2e2' : '#d1fae5',
          color: toast.type === 'error' ? '#991b1b' : '#065f46',
          border: `1px solid ${toast.type === 'error' ? '#fca5a5' : '#6ee7b7'}`,
          boxShadow: '0 4px 15px rgba(0,0,0,.15)',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          {toast.type === 'error' ? <XCircle size={16} /> : <CheckCircle size={16} />}
          {toast.msg}
        </div>
      )}

      {/* Stats rápidas */}
      <div className="sa-types-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        <div style={{
          borderRadius: 14, padding: '18px 20px',
          background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
          color: '#fff', boxShadow: '0 4px 15px rgba(124,58,237,.3)',
          display: 'flex', alignItems: 'center', gap: 14
        }}>
          <Tag size={24} style={{ opacity: .85 }} />
          <div>
            <div style={{ fontSize: 26, fontWeight: 800 }}>{types.length}</div>
            <div style={{ fontSize: 12, opacity: .85 }}>Total Tipos</div>
          </div>
        </div>
        <div style={{
          borderRadius: 14, padding: '18px 20px',
          background: 'linear-gradient(135deg, #059669, #10b981)',
          color: '#fff', boxShadow: '0 4px 15px rgba(16,185,129,.3)',
          display: 'flex', alignItems: 'center', gap: 14
        }}>
          <CheckCircle size={24} style={{ opacity: .85 }} />
          <div>
            <div style={{ fontSize: 26, fontWeight: 800 }}>{activeCount}</div>
            <div style={{ fontSize: 12, opacity: .85 }}>Tipos Activos</div>
          </div>
        </div>
        <div style={{
          borderRadius: 14, padding: '18px 20px',
          background: 'linear-gradient(135deg, #6b7280, #9ca3af)',
          color: '#fff', boxShadow: '0 4px 15px rgba(107,114,128,.3)',
          display: 'flex', alignItems: 'center', gap: 14
        }}>
          <XCircle size={24} style={{ opacity: .85 }} />
          <div>
            <div style={{ fontSize: 26, fontWeight: 800 }}>{inactiveCount}</div>
            <div style={{ fontSize: 12, opacity: .85 }}>Tipos Inactivos</div>
          </div>
        </div>
      </div>

      {/* Barra de herramientas */}
      <div className="card" style={{ marginBottom: 20, padding: '16px 20px' }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: '1 1 240px' }}>
            <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Buscar tipo de empresa..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ paddingLeft: 36, width: '100%' }}
            />
          </div>
          <button className="btn-outline btn-sm" onClick={loadTypes}>
            <RefreshCw size={14} /> Actualizar
          </button>
          <button
            onClick={() => handleOpen()}
            style={{
              padding: '8px 18px', borderRadius: 8, fontSize: 13, fontWeight: 600,
              background: 'linear-gradient(135deg, #7c3aed, #a855f7)', color: '#fff',
              border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7,
              boxShadow: '0 4px 12px rgba(124,58,237,.4)'
            }}
          >
            <Plus size={16} /> Nuevo Tipo
          </button>
        </div>
      </div>

      {/* Grid de tipos */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: 40, height: 40, border: '3px solid #ede9fe', borderTopColor: '#7c3aed', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 12px' }} />
            <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Cargando tipos de empresa...</p>
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <Tag size={48} color="#d1d5db" style={{ margin: '0 auto 16px' }} />
          <p style={{ color: 'var(--text-muted)', fontSize: 15 }}>No se encontraron tipos de empresa</p>
          <button
            onClick={() => handleOpen()}
            style={{
              marginTop: 16, padding: '8px 20px', borderRadius: 8, fontSize: 13, fontWeight: 600,
              background: 'linear-gradient(135deg, #7c3aed, #a855f7)', color: '#fff',
              border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 7
            }}
          >
            <Plus size={15} /> Crear primer tipo
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
          {filtered.map(type => (
            <div key={type.id} className="card" style={{
              padding: '18px 20px',
              opacity: type.active ? 1 : .65,
              border: type.active ? '1px solid var(--border)' : '1px dashed var(--border)',
              transition: 'all .2s'
            }}>
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 12, flexShrink: 0,
                  background: type.active
                    ? 'linear-gradient(135deg, #ede9fe, #f5f3ff)'
                    : 'var(--gray-100)',
                  border: type.active ? '1px solid #ddd6fe' : '1px solid var(--border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22
                }}>
                  {type.icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)', marginBottom: 2 }}>
                    {type.label}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                    {type.value}
                  </div>
                </div>
                <span style={{
                  fontSize: 11, padding: '3px 8px', borderRadius: 20, fontWeight: 600, flexShrink: 0,
                  background: type.active ? '#d1fae5' : '#f3f4f6',
                  color: type.active ? '#065f46' : '#6b7280'
                }}>
                  {type.active ? 'Activo' : 'Inactivo'}
                </span>
              </div>

              {/* Orden */}
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 14 }}>
                Orden de aparición: <strong style={{ color: 'var(--text)' }}>{type.order}</strong>
              </div>

              {/* Acciones */}
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => handleOpen(type)}
                  style={{
                    flex: 1, padding: '7px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                    background: 'var(--gray-50)', border: '1px solid var(--border)', color: 'var(--text)',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5
                  }}
                >
                  <Edit2 size={13} /> Editar
                </button>
                <button
                  onClick={() => handleToggle(type)}
                  title={type.active ? 'Desactivar' : 'Activar'}
                  style={{
                    padding: '7px 10px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                    background: type.active ? '#fef3c7' : '#d1fae5',
                    border: type.active ? '1px solid #fcd34d' : '1px solid #6ee7b7',
                    color: type.active ? '#92400e' : '#065f46',
                    cursor: 'pointer', display: 'flex', alignItems: 'center'
                  }}
                >
                  {type.active ? <ToggleLeft size={16} /> : <ToggleRight size={16} />}
                </button>
                <button
                  onClick={() => handleDelete(type)}
                  title="Eliminar"
                  style={{
                    padding: '7px 10px', borderRadius: 8, fontSize: 12,
                    background: '#fee2e2', border: '1px solid #fca5a5', color: '#dc2626',
                    cursor: 'pointer', display: 'flex', alignItems: 'center'
                  }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ===== MODAL: CREAR / EDITAR ===== */}
      {showModal && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'rgba(0,0,0,.6)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
          }}
          onClick={handleClose}
        >
          <div
            style={{
              background: 'var(--surface)', borderRadius: 16, maxWidth: 520, width: '100%',
              boxShadow: '0 25px 60px rgba(0,0,0,.3)', overflow: 'hidden', maxHeight: '90vh', overflowY: 'auto'
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '18px 22px', borderBottom: '1px solid var(--border)',
              background: 'linear-gradient(135deg, #0c0a1e, #1a0a2e)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 8,
                  background: 'rgba(124,58,237,.3)', border: '1px solid rgba(124,58,237,.5)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18
                }}>
                  {form.icon}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15, color: '#fff' }}>
                    {editingId ? 'Editar Tipo de Empresa' : 'Nuevo Tipo de Empresa'}
                  </div>
                  <div style={{ fontSize: 12, color: '#a78bfa' }}>
                    {editingId ? 'Modifica los datos del tipo' : 'Completa los datos del nuevo tipo'}
                  </div>
                </div>
              </div>
              <button onClick={handleClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#a78bfa' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave}>
              <div style={{ padding: '22px 22px 10px' }}>
                {error && (
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '10px 14px', borderRadius: 8, marginBottom: 16,
                    background: '#fee2e2', border: '1px solid #fca5a5', color: '#991b1b', fontSize: 13
                  }}>
                    <AlertTriangle size={15} /> {error}
                  </div>
                )}

                <div className="sa-types-modal-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div className="form-group">
                    <label>Identificador (value) *</label>
                    <input
                      type="text"
                      value={form.value}
                      onChange={e => setForm({ ...form, value: e.target.value.toLowerCase().replace(/\s/g, '-') })}
                      required
                      placeholder="barberia"
                      disabled={!!editingId}
                      style={{ opacity: editingId ? .6 : 1 }}
                    />
                    <div className="form-hint">Solo letras, números y guiones. No se puede cambiar.</div>
                  </div>
                  <div className="form-group">
                    <label>Nombre visible *</label>
                    <input
                      type="text"
                      value={form.label}
                      onChange={e => setForm({ ...form, label: e.target.value })}
                      required
                      placeholder="Barbería"
                    />
                  </div>
                </div>

                {/* Selector de icono */}
                <div className="form-group">
                  <label>Icono</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
                    {ICON_OPTIONS.map(ic => (
                      <button
                        key={ic}
                        type="button"
                        onClick={() => setForm({ ...form, icon: ic })}
                        style={{
                          width: 38, height: 38, borderRadius: 8, fontSize: 18,
                          border: form.icon === ic ? '2px solid #7c3aed' : '2px solid var(--border)',
                          background: form.icon === ic ? '#ede9fe' : 'var(--surface)',
                          cursor: 'pointer', transition: 'all .15s'
                        }}
                      >
                        {ic}
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    value={form.icon}
                    onChange={e => setForm({ ...form, icon: e.target.value })}
                    placeholder="O escribe un emoji personalizado"
                    className="sa-types-icon-input"
                    style={{ width: 200 }}
                  />
                </div>

                <div className="sa-types-modal-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div className="form-group">
                    <label>Orden de aparición</label>
                    <input
                      type="number"
                      value={form.order}
                      onChange={e => setForm({ ...form, order: parseInt(e.target.value) || 0 })}
                      min={0}
                    />
                    <div className="form-hint">Menor número = aparece primero</div>
                  </div>
                  <div className="form-group">
                    <label>Estado</label>
                    <select
                      value={form.active}
                      onChange={e => setForm({ ...form, active: e.target.value === 'true' })}
                    >
                      <option value="true">Activo</option>
                      <option value="false">Inactivo</option>
                    </select>
                  </div>
                </div>
              </div>

              <div style={{
                display: 'flex', gap: 10, padding: '14px 22px',
                borderTop: '1px solid var(--border)', justifyContent: 'flex-end'
              }}>
                <button type="button" className="btn-secondary btn-sm" onClick={handleClose}>
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    padding: '8px 20px', borderRadius: 8, fontSize: 13, fontWeight: 600,
                    background: 'linear-gradient(135deg, #7c3aed, #a855f7)', color: '#fff',
                    border: 'none', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? .7 : 1,
                    display: 'flex', alignItems: 'center', gap: 6
                  }}
                >
                  {saving ? 'Guardando...' : editingId ? 'Actualizar tipo' : 'Crear tipo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===== MODAL: CONFIRMAR ELIMINACIÓN ===== */}
      {confirmDelete && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 1100,
            background: 'rgba(0,0,0,.6)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
          }}
          onClick={() => setConfirmDelete(null)}
        >
          <div
            style={{
              background: 'var(--surface)', borderRadius: 16, maxWidth: 400, width: '100%',
              boxShadow: '0 25px 60px rgba(0,0,0,.3)', overflow: 'hidden'
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ padding: '24px 24px 20px', textAlign: 'center' }}>
              <div style={{
                width: 56, height: 56, borderRadius: 14, margin: '0 auto 16px',
                background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <Trash2 size={24} color="#dc2626" />
              </div>
              <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 8 }}>¿Eliminar tipo de empresa?</div>
              <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                Estás a punto de eliminar <strong>"{confirmDelete.label}"</strong>. Esta acción no se puede deshacer y puede afectar a las empresas que usan este tipo.
              </p>
            </div>
            <div style={{
              display: 'flex', gap: 10, padding: '14px 24px',
              borderTop: '1px solid var(--border)', justifyContent: 'center'
            }}>
              <button className="btn-secondary" onClick={() => setConfirmDelete(null)} style={{ minWidth: 100 }}>
                Cancelar
              </button>
              <button
                onClick={confirmDeleteAction}
                style={{
                  minWidth: 100, padding: '9px 20px', borderRadius: 8, fontSize: 13, fontWeight: 600,
                  background: '#dc2626', color: '#fff', border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 6
                }}
              >
                <Trash2 size={14} /> Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </SuperAdminLayout>
  );
}

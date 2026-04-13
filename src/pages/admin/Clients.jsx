import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import api from '../../api/client';
import AdminLayout from '../../components/AdminLayout';
import ResponsiveTable from '../../components/ResponsiveTable';
import {
  Users, Search, Phone, Mail, Calendar, DollarSign,
  ChevronLeft, ChevronRight, Clock, CheckCircle, XCircle,
  User, History, TrendingUp, Tag, Plus, X, Edit2, Trash2,
  Filter, MoreHorizontal
} from 'lucide-react';

const fmt = (n) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n || 0);

const fmtDate = (d) =>
  new Date(d).toLocaleString('es-CO', { dateStyle: 'short', timeZone: 'America/Bogota' });

const STATUS_LABELS = {
  pending: { label: 'Pendiente', color: '#f59e0b' },
  confirmed: { label: 'Confirmada', color: '#10b981' },
  attention: { label: 'En atención', color: '#3b82f6' },
  done: { label: 'Completada', color: '#8b5cf6' },
  cancelled: { label: 'Cancelada', color: '#ef4444' }
};

const TAG_COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#84cc16', '#22c55e',
  '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9', '#3b82f6',
  '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899',
  '#f43f5e', '#78716c', '#6b7280'
];

export default function Clients() {
  const { business } = useAuth();
  const { colors } = useTheme();
  const [clients, setClients] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedTagFilter, setSelectedTagFilter] = useState(null);
  const itemsPerPage = 6;

  // Modales
  const [showTagManager, setShowTagManager] = useState(false);
  const [showAssignTag, setShowAssignTag] = useState(false);
  const [clientForTag, setClientForTag] = useState(null);
  const [editingTag, setEditingTag] = useState(null);
  const [tagForm, setTagForm] = useState({ name: '', color: TAG_COLORS[0], description: '' });

  const loadClients = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/appointments/clients?businessId=${business.id}&search=${search}`);
      setClients(res.data.clients || []);
      setAvailableTags(res.data.availableTags || []);
    } catch (e) {
      console.error('Error loading clients:', e);
    } finally {
      setLoading(false);
    }
  };

  const loadTags = async () => {
    try {
      const res = await api.get(`/appointments/client-tags?businessId=${business.id}`);
      setAvailableTags(res.data || []);
    } catch (e) {
      console.error('Error loading tags:', e);
    }
  };

  // Crear/Actualizar etiqueta
  const saveTag = async (e) => {
    e.preventDefault();
    try {
      if (editingTag) {
        await api.put(`/appointments/client-tags/${editingTag.id}`, tagForm);
      } else {
        await api.post('/appointments/client-tags', { ...tagForm, businessId: business.id });
      }
      setTagForm({ name: '', color: TAG_COLORS[0], description: '' });
      setEditingTag(null);
      loadTags();
      loadClients();
    } catch (e) {
      console.error('Error saving tag:', e);
      alert(e.response?.data?.error || 'Error al guardar etiqueta');
    }
  };

  // Eliminar etiqueta
  const deleteTag = async (tagId) => {
    if (!confirm('¿Eliminar esta etiqueta? Se removerá de todos los clientes.')) return;
    try {
      await api.delete(`/appointments/client-tags/${tagId}`);
      loadTags();
      loadClients();
    } catch (e) {
      console.error('Error deleting tag:', e);
    }
  };

  // Asignar etiqueta a cliente
  const assignTag = async (tagId) => {
    try {
      await api.post('/appointments/client-tags/assign', {
        businessId: business.id,
        clientTagId: tagId,
        clientPhone: clientForTag?.phone,
        clientEmail: clientForTag?.email,
        clientName: clientForTag?.name
      });
      setShowAssignTag(false);
      setClientForTag(null);
      loadClients();
    } catch (e) {
      if (e.response?.status === 409) {
        alert('Esta etiqueta ya está asignada a este cliente');
      } else {
        console.error('Error assigning tag:', e);
      }
    }
  };

  // Remover etiqueta de cliente
  const removeTag = async (assignmentId) => {
    try {
      await api.delete(`/appointments/client-tags/assign/${assignmentId}`);
      loadClients();
      if (selectedClient) {
        // Actualizar el cliente seleccionado también
        const updatedClient = { ...selectedClient };
        updatedClient.tags = updatedClient.tags.filter(t => t.assignmentId !== assignmentId);
        setSelectedClient(updatedClient);
      }
    } catch (e) {
      console.error('Error removing tag:', e);
    }
  };

  useEffect(() => {
    if (business?.id) {
      loadClients();
    }
  }, [business?.id, search]);

  // Filtrar clientes por etiqueta
  const filteredClients = useMemo(() => {
    if (!selectedTagFilter) return clients;
    return clients.filter(c => c.tags.some(t => t.id === selectedTagFilter));
  }, [clients, selectedTagFilter]);

  // Paginación
  const totalPages = Math.ceil(filteredClients.length / itemsPerPage);
  const paginatedClients = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredClients.slice(start, start + itemsPerPage);
  }, [filteredClients, currentPage]);

  // Estadísticas
  const stats = useMemo(() => {
    const total = clients.length;
    const withMultipleVisits = clients.filter(c => c.totalAppointments > 1).length;
    const totalRevenue = clients.reduce((sum, c) => sum + c.totalSpent, 0);
    const avgPerClient = total > 0 ? totalRevenue / total : 0;

    return { total, withMultipleVisits, totalRevenue, avgPerClient };
  }, [clients]);

  const columns = [
    {
      key: 'name',
      label: 'Cliente',
      render: (v, row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${colors?.primary || '#667eea'}, ${colors?.secondary || '#764ba2'})`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 700,
            fontSize: 16
          }}>
            {v?.charAt(0)?.toUpperCase() || '?'}
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14 }}>{v || 'Sin nombre'}</div>
            {row.tags && row.tags.length > 0 && (
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 4 }}>
                {row.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    style={{
                      fontSize: 10,
                      padding: '2px 8px',
                      borderRadius: 12,
                      background: tag.color + '20',
                      color: tag.color,
                      fontWeight: 600
                    }}
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
            )}
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: row.tags?.length ? 4 : 0 }}>
              {row.totalAppointments} citas • Última: {row.lastVisit ? fmtDate(row.lastVisit) : 'N/A'}
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'contact',
      label: 'Contacto',
      render: (v, row) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {row.phone && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
              <Phone size={14} color="#10b981" />
              <a href={`tel:${row.phone}`} style={{ color: 'var(--text)', textDecoration: 'none' }}>
                {row.phone}
              </a>
            </div>
          )}
          {row.email && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
              <Mail size={14} color="#3b82f6" />
              <a href={`mailto:${row.email}`} style={{ color: 'var(--text)', textDecoration: 'none' }}>
                {row.email}
              </a>
            </div>
          )}
          {!row.phone && !row.email && (
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Sin contacto</span>
          )}
        </div>
      )
    },
    {
      key: 'stats',
      label: 'Estadísticas',
      render: (v, row) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div style={{ fontSize: 13, fontWeight: 500 }}>
            <CheckCircle size={14} style={{ display: 'inline', marginRight: 4, color: '#10b981' }} />
            {row.completedAppointments} completadas
          </div>
          <div style={{ fontSize: 13, fontWeight: 500 }}>
            <XCircle size={14} style={{ display: 'inline', marginRight: 4, color: '#ef4444' }} />
            {row.cancelledAppointments} canceladas
          </div>
          <div style={{ fontSize: 13, fontWeight: 600, color: colors?.primary || '#667eea' }}>
            <DollarSign size={14} style={{ display: 'inline', marginRight: 4 }} />
            {fmt(row.totalSpent)} total
          </div>
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Acciones',
      render: (v, row) => (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <button
            className="btn-outline btn-sm"
            onClick={() => setSelectedClient(row)}
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <History size={14} />
            Historial
          </button>
          <button
            className="btn-outline btn-sm"
            onClick={() => {
              setClientForTag(row);
              setShowAssignTag(true);
            }}
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <Tag size={14} />
            Etiquetas
          </button>
        </div>
      )
    }
  ];

  return (
    <AdminLayout title="Mis Clientes" subtitle="Gestiona tu base de clientes y su historial">
      {/* Estadísticas */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 16,
        marginBottom: 24
      }}>
        {[
          {
            icon: Users,
            label: 'Total clientes',
            value: stats.total,
            color: colors?.primary || '#667eea'
          },
          {
            icon: TrendingUp,
            label: 'Clientes frecuentes',
            value: stats.withMultipleVisits,
            color: '#10b981'
          },
          {
            icon: DollarSign,
            label: 'Ingresos totales',
            value: fmt(stats.totalRevenue),
            color: '#f59e0b'
          }
        ].map((stat, i) => (
          <div key={i} className="card" style={{
            padding: 20,
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            borderLeft: `4px solid ${stat.color}`
          }}>
            <div style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: `${stat.color}20`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <stat.icon size={24} color={stat.color} />
            </div>
            <div>
              <div style={{ fontSize: 24, fontWeight: 700, color: stat.color }}>{stat.value}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Búsqueda y filtros */}
      <div className="card" style={{ padding: 16, marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
            <Search size={18} style={{
              position: 'absolute',
              left: 12,
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)'
            }} />
            <input
              type="text"
              placeholder="Buscar por nombre, teléfono o email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px 10px 40px',
                borderRadius: 8,
                border: '1px solid var(--border)',
                fontSize: 14
              }}
            />
          </div>

          {/* Filtro por etiqueta */}
          {availableTags.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Filter size={18} color="var(--text-muted)" />
              <select
                value={selectedTagFilter || ''}
                onChange={(e) => setSelectedTagFilter(e.target.value || null)}
                style={{
                  padding: '10px 12px',
                  borderRadius: 8,
                  border: '1px solid var(--border)',
                  fontSize: 14,
                  background: 'var(--card-bg)'
                }}
              >
                <option value="">Todas las etiquetas</option>
                {availableTags.map(tag => (
                  <option key={tag.id} value={tag.id}>{tag.name}</option>
                ))}
              </select>
              {selectedTagFilter && (
                <button
                  className="btn-ghost btn-sm"
                  onClick={() => setSelectedTagFilter(null)}
                  style={{ padding: 4 }}
                >
                  <X size={16} />
                </button>
              )}
            </div>
          )}

          <button
            className="btn-secondary"
            onClick={() => {
              loadTags();
              setShowTagManager(true);
            }}
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <Tag size={16} />
            Gestionar etiquetas
          </button>

          <button
            className="btn-secondary"
            onClick={loadClients}
            disabled={loading}
          >
            {loading ? 'Cargando...' : 'Actualizar'}
          </button>
        </div>
      </div>

      {/* Tabla de clientes */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 60, textAlign: 'center', color: 'var(--text-muted)' }}>
            Cargando clientes...
          </div>
        ) : filteredClients.length === 0 ? (
          <div style={{ padding: 60, textAlign: 'center', color: 'var(--text-muted)' }}>
            <Users size={48} style={{ marginBottom: 16, opacity: 0.3 }} />
            <p>
              {search || selectedTagFilter
                ? 'No se encontraron clientes con ese criterio'
                : 'Aún no tienes clientes registrados'}
            </p>
          </div>
        ) : (
          <>
            <ResponsiveTable
              columns={columns}
              data={paginatedClients}
              keyExtractor={(row) => row.phone || row.email || row.name}
            />

            {/* Paginación */}
            {totalPages > 1 && (
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: 12,
                padding: 16,
                borderTop: '1px solid var(--border)'
              }}>
                <button
                  className="btn-ghost btn-sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft size={16} />
                </button>
                <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>
                  Página {currentPage} de {totalPages}
                </span>
                <button
                  className="btn-ghost btn-sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal de historial */}
      {selectedClient && (
        <div
          className="modal-overlay"
          onClick={() => setSelectedClient(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 20
          }}
        >
          <div
            className="modal"
            onClick={e => e.stopPropagation()}
            style={{ maxWidth: 700, maxHeight: '85vh' }}
          >
            {/* Header con color del tema */}
            <div style={{
              padding: '20px 24px',
              background: colors?.primary || '#667eea',
              color: 'white',
              borderRadius: '16px 16px 0 0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                <div style={{
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 700,
                  fontSize: 24,
                  border: '3px solid rgba(255,255,255,0.3)'
                }}>
                  {selectedClient.name?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: 'white' }}>{selectedClient.name}</h3>
                  <div style={{ display: 'flex', gap: 16, marginTop: 6, fontSize: 13, color: 'rgba(255,255,255,0.85)' }}>
                    {selectedClient.phone && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Phone size={14} /> {selectedClient.phone}
                      </span>
                    )}
                    {selectedClient.email && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Mail size={14} /> {selectedClient.email}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedClient(null)}
                className="btn-ghost btn-icon"
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  borderRadius: '50%',
                  width: 36,
                  height: 36,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Stats del cliente */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 24,
              padding: '24px 32px',
              background: 'var(--bg)',
              borderBottom: '2px solid var(--border)'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 32, fontWeight: 800, color: colors?.primary }}>
                  {selectedClient.totalAppointments}
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4, fontWeight: 500 }}>Citas totales</div>
              </div>
              <div style={{ textAlign: 'center', borderLeft: '1px solid var(--border)', borderRight: '1px solid var(--border)' }}>
                <div style={{ fontSize: 32, fontWeight: 800, color: '#10b981' }}>
                  {selectedClient.completedAppointments}
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4, fontWeight: 500 }}>Completadas</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 32, fontWeight: 800, color: '#f59e0b' }}>
                  {fmt(selectedClient.totalSpent)}
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4, fontWeight: 500 }}>Total gastado</div>
              </div>
            </div>

            {/* Historial de citas */}
            <div style={{ padding: 24, overflow: 'auto', maxHeight: 'calc(85vh - 200px)' }}>
              <h4 style={{ margin: '0 0 20px', fontSize: 14, fontWeight: 600, color: 'var(--text)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                <History size={18} style={{ display: 'inline', marginRight: 8, verticalAlign: 'middle' }} />
                Historial de citas ({selectedClient.appointments.length})
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {selectedClient.appointments.map((appt, idx) => (
                  <div
                    key={appt.id}
                    style={{
                      padding: '18px 20px',
                      borderRadius: 12,
                      border: '2px solid var(--border)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      background: 'var(--bg)',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = colors?.primary || '#667eea';
                      e.currentTarget.style.transform = 'translateX(4px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border)';
                      e.currentTarget.style.transform = 'translateX(0)';
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text)' }}>{appt.service}</div>
                      <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Calendar size={14} />
                        {fmtDate(appt.date)} • {appt.employee}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '6px 12px',
                        borderRadius: 20,
                        fontSize: 12,
                        fontWeight: 700,
                        background: `${STATUS_LABELS[appt.status]?.color}20`,
                        color: STATUS_LABELS[appt.status]?.color,
                        border: `2px solid ${STATUS_LABELS[appt.status]?.color}40`
                      }}>
                        {STATUS_LABELS[appt.status]?.label || appt.status}
                      </span>
                      <div style={{ fontSize: 15, fontWeight: 700, marginTop: 6, color: 'var(--text)' }}>
                        {fmt(appt.price)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Gestor de Etiquetas */}
      {showTagManager && (
        <div
          className="modal-overlay"
          onClick={() => {
            setShowTagManager(false);
            setEditingTag(null);
            setTagForm({ name: '', color: TAG_COLORS[0], description: '' });
          }}
        >
          <div
            className="modal"
            onClick={e => e.stopPropagation()}
            style={{ maxWidth: 500, maxHeight: '85vh' }}
          >
            {/* Header con color de fondo del tema */}
            <div style={{
              padding: '20px 24px',
              background: colors?.primary || '#667eea',
              color: 'white',
              borderRadius: '16px 16px 0 0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: 'white' }}>
                  <Tag size={22} style={{ display: 'inline', marginRight: 10, verticalAlign: 'middle' }} />
                  Gestionar Etiquetas
                </h3>
                <p style={{ margin: '4px 0 0', fontSize: 13, opacity: 0.9 }}>
                  Crea y administra etiquetas para tus clientes
                </p>
              </div>
              <button
                onClick={() => {
                  setShowTagManager(false);
                  setEditingTag(null);
                  setTagForm({ name: '', color: TAG_COLORS[0], description: '' });
                }}
                className="btn-ghost btn-icon"
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  borderRadius: '50%',
                  width: 36,
                  height: 36,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: 24, overflow: 'auto', maxHeight: 'calc(85vh - 80px)' }}>
              {/* Formulario de etiqueta */}
              <form onSubmit={saveTag} style={{ marginBottom: 28 }}>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8, color: 'var(--text)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Nombre de la etiqueta *
                  </label>
                  <input
                    type="text"
                    value={tagForm.name}
                    onChange={(e) => setTagForm({ ...tagForm, name: e.target.value })}
                    placeholder="Ej: VIP, Nuevo, Frecuente..."
                    required
                    className="form-control"
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: 10,
                      border: '2px solid var(--border)',
                      fontSize: 15,
                      background: 'var(--bg)',
                      color: 'var(--text)'
                    }}
                  />
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 10, color: 'var(--text)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Color
                  </label>
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', padding: 12, background: 'var(--bg)', borderRadius: 10, border: '2px solid var(--border)' }}>
                    {TAG_COLORS.map((color, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setTagForm({ ...tagForm, color })}
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: '50%',
                          background: color,
                          border: tagForm.color === color ? '3px solid var(--text)' : '3px solid transparent',
                          cursor: 'pointer',
                          boxShadow: tagForm.color === color ? '0 0 0 2px white, 0 0 0 4px ' + color : 'none'
                        }}
                      />
                    ))}
                  </div>
                </div>

                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8, color: 'var(--text)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Descripción (opcional)
                  </label>
                  <textarea
                    value={tagForm.description}
                    onChange={(e) => setTagForm({ ...tagForm, description: e.target.value })}
                    placeholder="Descripción de la etiqueta..."
                    rows={2}
                    className="form-control"
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: 10,
                      border: '2px solid var(--border)',
                      fontSize: 15,
                      background: 'var(--bg)',
                      color: 'var(--text)',
                      resize: 'vertical'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', gap: 12 }}>
                  <button
                    type="submit"
                    className="btn-primary"
                    style={{ 
                      flex: 1,
                      padding: '12px 20px',
                      borderRadius: 10,
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8
                    }}
                  >
                    <Plus size={18} />
                    {editingTag ? 'Actualizar Etiqueta' : 'Crear Etiqueta'}
                  </button>
                  {editingTag && (
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => {
                        setEditingTag(null);
                        setTagForm({ name: '', color: TAG_COLORS[0], description: '' });
                      }}
                      style={{ padding: '12px 20px', borderRadius: 10 }}
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              </form>

              {/* Lista de etiquetas existentes */}
              <div>
                <h4 style={{ margin: '0 0 16px', fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Etiquetas existentes ({availableTags.length})
                </h4>
                {availableTags.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: 32, background: 'var(--bg)', borderRadius: 12, border: '2px dashed var(--border)' }}>
                    <Tag size={32} color="var(--text-muted)" style={{ marginBottom: 8, opacity: 0.5 }} />
                    <p style={{ color: 'var(--text-muted)', fontSize: 14, margin: 0 }}>No hay etiquetas creadas aún</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {availableTags.map((tag) => (
                      <div
                        key={tag.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '14px 16px',
                          borderRadius: 12,
                          border: '2px solid var(--border)',
                          background: 'var(--bg)'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <span
                            style={{
                              width: 20,
                              height: 20,
                              borderRadius: 6,
                              background: tag.color,
                              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                            }}
                          />
                          <span style={{ fontWeight: 600, fontSize: 15, color: 'var(--text)' }}>{tag.name}</span>
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button
                            className="btn-ghost btn-sm"
                            onClick={() => {
                              setEditingTag(tag);
                              setTagForm({
                                name: tag.name,
                                color: tag.color,
                                description: tag.description || ''
                              });
                            }}
                            style={{ 
                              padding: '8px 12px',
                              borderRadius: 8,
                              display: 'flex',
                              alignItems: 'center',
                              gap: 6
                            }}
                          >
                            <Edit2 size={16} />
                            Editar
                          </button>
                          <button
                            className="btn-danger btn-sm"
                            onClick={() => deleteTag(tag.id)}
                            style={{ 
                              padding: '8px 12px',
                              borderRadius: 8,
                              display: 'flex',
                              alignItems: 'center',
                              gap: 6
                            }}
                          >
                            <Trash2 size={16} />
                            Eliminar
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Asignar Etiqueta a Cliente */}
      {showAssignTag && clientForTag && (
        <div
          className="modal-overlay"
          onClick={() => {
            setShowAssignTag(false);
            setClientForTag(null);
          }}
        >
          <div
            className="modal"
            onClick={e => e.stopPropagation()}
            style={{ maxWidth: 450, maxHeight: '80vh' }}
          >
            {/* Header con color del tema */}
            <div style={{
              padding: '20px 24px',
              background: colors?.primary || '#667eea',
              color: 'white',
              borderRadius: '16px 16px 0 0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: 'white' }}>
                  <User size={22} style={{ display: 'inline', marginRight: 10, verticalAlign: 'middle' }} />
                  Etiquetas de {clientForTag.name}
                </h3>
                <p style={{ margin: '4px 0 0', fontSize: 13, opacity: 0.9 }}>
                  Gestiona las etiquetas de este cliente
                </p>
              </div>
              <button
                onClick={() => {
                  setShowAssignTag(false);
                  setClientForTag(null);
                }}
                className="btn-ghost btn-icon"
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  borderRadius: '50%',
                  width: 36,
                  height: 36,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: 24, overflow: 'auto', maxHeight: 'calc(80vh - 80px)' }}>
              {/* Etiquetas actuales del cliente */}
              <div style={{ marginBottom: 28 }}>
                <h4 style={{ margin: '0 0 16px', fontSize: 13, fontWeight: 600, color: 'var(--text)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Etiquetas actuales ({clientForTag.tags?.length || 0})
                </h4>
                {clientForTag.tags?.length === 0 ? (
                  <div style={{ 
                    textAlign: 'center', 
                    padding: 24, 
                    background: 'var(--bg)', 
                    borderRadius: 12, 
                    border: '2px dashed var(--border)' 
                  }}>
                    <Tag size={28} color="var(--text-muted)" style={{ marginBottom: 8, opacity: 0.5 }} />
                    <p style={{ color: 'var(--text-muted)', fontSize: 14, margin: 0 }}>Sin etiquetas asignadas</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                    {clientForTag.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 8,
                          padding: '8px 14px',
                          borderRadius: 20,
                          background: tag.color + '20',
                          color: tag.color,
                          fontSize: 14,
                          fontWeight: 600,
                          border: '2px solid ' + tag.color + '40'
                        }}
                      >
                        <span style={{
                          width: 10,
                          height: 10,
                          borderRadius: '50%',
                          background: tag.color
                        }} />
                        {tag.name}
                        <button
                          onClick={() => removeTag(tag.assignmentId)}
                          style={{
                            background: tag.color + '30',
                            border: 'none',
                            padding: '4px',
                            cursor: 'pointer',
                            color: tag.color,
                            display: 'flex',
                            alignItems: 'center',
                            borderRadius: '50%',
                            marginLeft: 4
                          }}
                        >
                          <X size={14} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Agregar etiqueta */}
              <div>
                <h4 style={{ margin: '0 0 16px', fontSize: 13, fontWeight: 600, color: 'var(--text)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Agregar etiqueta
                </h4>
                {availableTags.length === 0 ? (
                  <div style={{ 
                    textAlign: 'center', 
                    padding: 24, 
                    background: 'var(--bg)', 
                    borderRadius: 12, 
                    border: '2px dashed var(--border)' 
                  }}>
                    <p style={{ color: 'var(--text-muted)', fontSize: 14, margin: 0 }}>
                      Primero crea etiquetas en "Gestionar etiquetas"
                    </p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {availableTags
                      .filter(tag => !clientForTag.tags?.some(t => t.id === tag.id))
                      .map((tag) => (
                        <button
                          key={tag.id}
                          onClick={() => assignTag(tag.id)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 12,
                            padding: '14px 16px',
                            borderRadius: 12,
                            border: '2px solid var(--border)',
                            background: 'var(--bg)',
                            cursor: 'pointer',
                            textAlign: 'left',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.borderColor = tag.color;
                            e.target.style.background = tag.color + '10';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.borderColor = 'var(--border)';
                            e.target.style.background = 'var(--bg)';
                          }}
                        >
                          <span
                            style={{
                              width: 20,
                              height: 20,
                              borderRadius: 6,
                              background: tag.color,
                              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                            }}
                          />
                          <span style={{ fontWeight: 600, fontSize: 15, color: 'var(--text)' }}>{tag.name}</span>
                        </button>
                      ))}
                    {availableTags.filter(tag => !clientForTag.tags?.some(t => t.id === tag.id)).length === 0 && (
                      <div style={{ 
                        textAlign: 'center', 
                        padding: 20, 
                        background: 'var(--bg)', 
                        borderRadius: 12, 
                        border: '2px dashed var(--border)' 
                      }}>
                        <p style={{ color: 'var(--text-muted)', fontSize: 14, margin: 0 }}>
                          Todas las etiquetas ya están asignadas
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

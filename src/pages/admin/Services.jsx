import { useState, useEffect, useMemo, useRef } from 'react';
import AdminLayout from '../../components/AdminLayout';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import ResponsiveTable from '../../components/ResponsiveTable';
import ResponsiveForm from '../../components/ResponsiveForm';
import { Camera, X, Loader2, FolderOpen, Plus, ChevronDown, ChevronUp, GripVertical } from 'lucide-react';

// URL base para imágenes
const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const BACKEND_URL = isLocal ? 'http://localhost:4000' : 'https://api-reservas.k-dice.com';

function getImgUrl(url) {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  const cleanUrl = url.startsWith('/') ? url : `/${url}`;
  const base = (api.defaults.baseURL && !api.defaults.baseURL.startsWith('/')) 
    ? api.defaults.baseURL.replace('/api', '') 
    : BACKEND_URL;
  return `${base}${cleanUrl}`;
}

  const empty = { name: '', description: '', price: '', durationMin: 60, isTechnicalService: false, priceOptional: false, hasEmployeeCommission: true, imageUrl: '', color: '#3b82f6', serviceGroupId: '' };
  const emptyGroup = { name: '', description: '', imageUrl: '', order: 0 };

export default function Services() {
  const { business } = useAuth();
  const fileInputRef = useRef(null);
  
  // Detectar si la empresa es de servicios técnicos o técnicos de campo (sin precios)
  const isTechnicalBusiness = business?.isTechnicalServices || business?.hasFieldTechnicians || false;
  
  const [services, setServices] = useState([]);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [expandedDesc, setExpandedDesc] = useState(new Set());

  // Estado para grupos de servicios
  const [serviceGroups, setServiceGroups] = useState([]);
  const [groupForm, setGroupForm] = useState(emptyGroup);
  const [editingGroup, setEditingGroup] = useState(null);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [uploadingGroupImage, setUploadingGroupImage] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState(new Set());
  const groupFileInputRef = useRef(null);

  const toggleDesc = (id) => {
    const newSet = new Set(expandedDesc);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setExpandedDesc(newSet);
  };

  const toggleGroup = (groupId) => {
    const newSet = new Set(expandedGroups);
    if (newSet.has(groupId)) {
      newSet.delete(groupId);
    } else {
      newSet.add(groupId);
    }
    setExpandedGroups(newSet);
  };

  // Cargar grupos de servicios
  const loadServiceGroups = () => {
    if (!business?.id) return;
    api.get(`/service-groups?businessId=${business.id}`)
      .then(r => {
        if (Array.isArray(r.data)) {
          setServiceGroups(r.data);
        } else {
          setServiceGroups([]);
        }
      })
      .catch(() => setServiceGroups([]));
  };

  useEffect(() => {
    if (business?.id) {
      loadServices();
      loadServiceGroups();
    }
  }, [business?.id]);

  // Manejar subida de imagen de grupo
  const handleGroupFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    setUploadingGroupImage(true);
    setError('');
    try {
      const res = await api.post('/upload', formData);
      setGroupForm(prev => ({ ...prev, imageUrl: res.data.url }));
      setSuccess('Imagen subida correctamente');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Error al subir la imagen del grupo');
    } finally {
      setUploadingGroupImage(false);
    }
  };

  // Guardar grupo
  const handleSaveGroup = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (editingGroup) {
        await api.put(`/service-groups/${editingGroup}`, groupForm);
        setSuccess('Grupo actualizado correctamente');
      } else {
        const res = await api.post('/service-groups', { ...groupForm, businessId: business.id });
        setSuccess('Grupo creado correctamente');
        // Auto-seleccionar el grupo recién creado en el formulario de servicio
        if (res.data?.id) {
          setForm(prev => ({ ...prev, serviceGroupId: res.data.id }));
        }
      }
      setGroupForm(emptyGroup);
      setEditingGroup(null);
      loadServiceGroups();
      setTimeout(() => setSuccess(''), 3000);
    } catch (e) {
      const errorMsg = e.response?.data?.error || 'Error al guardar el grupo';
      setError(errorMsg);
    }
  };

  // Editar grupo
  const handleEditGroup = (group) => {
    setEditingGroup(group.id);
    setGroupForm({
      name: group.name,
      description: group.description || '',
      imageUrl: group.imageUrl || '',
      order: group.order || 0
    });
  };

  // Eliminar grupo
  const handleDeleteGroup = async (id) => {
    if (!confirm('¿Eliminar este grupo? Los servicios asociados quedarán sin grupo.')) return;
    try {
      await api.delete(`/service-groups/${id}`);
      setSuccess('Grupo eliminado correctamente');
      loadServiceGroups();
      loadServices();
      setTimeout(() => setSuccess(''), 3000);
    } catch (e) {
      const errorMsg = e.response?.data?.error || 'Error al eliminar el grupo';
      setError(errorMsg);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    setUploading(true);
    setError('');
    try {
      const res = await api.post('/upload', formData);
      setForm(prev => ({ ...prev, imageUrl: res.data.url }));
      setSuccess('Imagen subida correctamente');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Error al subir la imagen');
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const loadServices = () => {
    if (!business?.id) return;
    setLoading(true);
    api.get(`/services/business/${business.id}`)
      .then(r => {
        if (Array.isArray(r.data)) {
          setServices(r.data);
        } else {
          setServices([]);
        }
      })
      .catch(() => setServices([]))
      .finally(() => setLoading(false));
  };

  const paginatedServices = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return services.slice(startIndex, startIndex + itemsPerPage);
  }, [services, currentPage]);

  const totalPages = Math.ceil(services.length / itemsPerPage);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    // Preparar datos finales según el tipo de negocio
    const bizId = business?.id;

    const finalForm = {
      name: form.name,
      description: form.description,
      durationMin: Number(form.durationMin),
      hasEmployeeCommission: form.hasEmployeeCommission,
      imageUrl: form.imageUrl,
      color: form.color,
      serviceGroupId: form.serviceGroupId || null,
      businessId: bizId, // Puede ser null, el backend lo resolverá
      // Si la empresa es de servicios técnicos, forzamos estos valores
      isTechnicalService: isTechnicalBusiness ? true : false,
      priceOptional: isTechnicalBusiness ? true : false,
      price: isTechnicalBusiness ? 0 : Number(form.price)
    };

    try {
      if (editing) {
        await api.put(`/services/${editing}`, finalForm);
        setSuccess('Servicio actualizado');
      } else {
        await api.post('/services', finalForm);
        setSuccess('Servicio creado exitosamente');
      }
      setForm(empty);
      setEditing(null);
      loadServices();
    } catch (e) {
      const errorMsg = e.response?.data?.error || e.response?.data?.message || 'Error al procesar';
      setError(errorMsg);
    }
  };

  const handleEdit = (svc) => {
    setEditing(svc.id);
    setForm({ 
      name: svc.name, 
      description: svc.description || '', 
      price: svc.price || '', 
      durationMin: svc.durationMin,
      isTechnicalService: svc.isTechnicalService || false,
      priceOptional: svc.priceOptional || false,
      hasEmployeeCommission: svc.hasEmployeeCommission !== false,
      imageUrl: svc.imageUrl || '',
      color: svc.color || '#3b82f6',
      serviceGroupId: svc.serviceGroupId || ''
    });
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este servicio?')) return;
    try {
      setError('');
      await api.delete(`/services/${id}`);
      setSuccess('Servicio eliminado correctamente');
      loadServices();
      setTimeout(() => setSuccess(''), 3000);
    } catch (e) {
      const errorMsg = e.response?.data?.error || e.message || 'Error al eliminar el servicio';
      setError(errorMsg);
      console.error('Error eliminando servicio:', e);
    }
  };

  return (
    <AdminLayout title="Servicios" subtitle="Gestiona los servicios que ofrece tu negocio">
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 2fr', gap: 20, alignItems: 'start' }}>
        {/* Formulario */}
        <div className="card">
          <h2 style={{ fontSize: 16, marginBottom: 14 }}>
            {editing ? '✏️ Editar servicio' : '➕ Nuevo servicio'}
          </h2>
          
          {/* Subida de Imagen */}
          <div style={{ marginBottom: 20, textAlign: 'center' }}>
            <div 
              onClick={() => fileInputRef.current?.click()}
              style={{
                width: '100%',
                height: 180,
                borderRadius: 16,
                border: '2px dashed var(--border)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                overflow: 'hidden',
                position: 'relative',
                background: form.imageUrl ? 'none' : 'var(--bg-secondary)',
                transition: 'all 0.3s'
              }}
            >
              {uploading ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                  <Loader2 className="animate-spin" size={32} color="var(--primary)" />
                  <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Subiendo...</span>
                </div>
              ) : form.imageUrl ? (
                <>
                  <img 
                    src={getImgUrl(form.imageUrl)} 
                    alt="Servicio" 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                  />
                  <div style={{ 
                    position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.3s' 
                  }} className="hover-overlay">
                    <Camera color="white" size={32} />
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setForm({...form, imageUrl: ''}); }}
                    style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: '50%', padding: 4, cursor: 'pointer' }}
                  >
                    <X size={16} color="white" />
                  </button>
                </>
              ) : (
                <>
                  <Camera size={32} color="var(--text-muted)" style={{ marginBottom: 8 }} />
                  <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-muted)' }}>Foto del servicio</span>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>(Opcional)</span>
                </>
              )}
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept="image/*" 
              style={{ display: 'none' }} 
            />
          </div>

          <ResponsiveForm
            fields={[
              {
                name: 'name',
                label: 'Nombre del servicio',
                type: 'text',
                required: true,
                placeholder: 'Ej: Corte de cabello',
                value: form.name,
                onChange: e => setForm({ ...form, name: e.target.value }),
                fullWidth: true
              },
              {
                name: 'description',
                label: 'Descripción',
                type: 'textarea',
                placeholder: 'Describe el servicio...',
                value: form.description,
                onChange: e => setForm({ ...form, description: e.target.value }),
                fullWidth: true,
                rows: 3
              },
              // Mostrar precio solo si NO es empresa de servicios técnicos
              ...(!isTechnicalBusiness ? [
                {
                  name: 'price',
                  label: 'Precio ($)',
                  type: 'number',
                  required: true,
                  placeholder: '0.00',
                  value: form.price,
                  onChange: e => setForm({ ...form, price: e.target.value })
                }
              ] : []),
              {
                name: 'durationMin',
                label: 'Duración (minutos)',
                type: 'number',
                required: true,
                placeholder: '60',
                value: form.durationMin,
                onChange: e => setForm({ ...form, durationMin: Number(e.target.value) })
              },
              {
                name: 'color',
                label: 'Color de identificación',
                type: 'custom',
                fullWidth: true,
                render: () => (
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 4 }}>
                    {['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#84cc16'].map(c => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setForm({ ...form, color: c })}
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 8,
                          background: c,
                          border: form.color === c ? '3px solid var(--text)' : '2px solid transparent',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                        title={c}
                      />
                    ))}
                  </div>
                )
              },
              // Selector de grupo de servicios
              ...(serviceGroups.length > 0 ? [{
                name: 'serviceGroupId',
                label: 'Grupo de servicios',
                type: 'custom',
                fullWidth: true,
                render: () => (
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <select
                      value={form.serviceGroupId || ''}
                      onChange={e => setForm({ ...form, serviceGroupId: e.target.value })}
                      style={{
                        flex: 1,
                        padding: '10px 12px',
                        borderRadius: 8,
                        border: '1px solid var(--border)',
                        fontSize: 14,
                        background: 'var(--bg)',
                        color: 'var(--text)'
                      }}
                    >
                      <option value="">Sin grupo</option>
                      {serviceGroups.map(group => (
                        <option key={group.id} value={group.id}>{group.name}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => setShowGroupModal(true)}
                      className="btn-outline btn-sm"
                      style={{ padding: '8px 12px', whiteSpace: 'nowrap' }}
                    >
                      <FolderOpen size={16} />
                      <span style={{ marginLeft: 6 }}>Gestionar</span>
                    </button>
                  </div>
                )
              }] : [{
                name: 'serviceGroupId',
                label: 'Grupo de servicios',
                type: 'custom',
                fullWidth: true,
                render: () => (
                  <button
                    type="button"
                    onClick={() => setShowGroupModal(true)}
                    className="btn-outline"
                    style={{ width: '100%', padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                  >
                    <Plus size={18} />
                    Crear grupos para organizar servicios
                  </button>
                )
              }])
            ]}
            onSubmit={handleSubmit}
            submitText={editing ? '💾 Actualizar' : '✅ Crear servicio'}
            error={error}
            success={success}
            columns={1}
          />
          {editing && (
            <button
              className="btn-secondary"
              style={{ marginTop: 12, width: '100%' }}
              onClick={() => {
                setEditing(null);
                setForm(empty);
                setError('');
                setSuccess('');
              }}
            >
              ❌ Cancelar edición
            </button>
          )}
        </div>

        {/* Tabla/Cards */}
        <div className="card" style={{ gridColumn: isMobile ? '1 / -1' : 'auto' }}>
          <div className="card-header" style={{ marginBottom: 16 }}>
            <div>
              <div className="card-title">📋 Servicios registrados</div>
              <div className="card-subtitle">{services.length} servicio{services.length !== 1 ? 's' : ''}</div>
            </div>
          </div>
          <ResponsiveTable
            columns={[
              { 
                key: 'imageUrl', 
                label: 'Imagen', 
                render: (v) => v ? (
                  <img 
                    src={getImgUrl(v)} 
                    style={{ width: 44, height: 44, borderRadius: 8, objectFit: 'cover' }} 
                  />
                ) : (
                  <div style={{ width: 44, height: 44, borderRadius: 8, background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Camera size={16} color="var(--text-muted)" />
                  </div>
                )
              },
              {
                key: 'color',
                label: 'Color',
                render: (v) => (
                  <div style={{ 
                    width: 24, 
                    height: 24, 
                    borderRadius: 6, 
                    background: v || '#3b82f6',
                    border: '2px solid var(--border)'
                  }} />
                )
              },
              { 
                key: 'name', 
                label: 'Nombre',
                render: (v, row) => (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <span style={{ fontWeight: 600, color: 'var(--text)' }}>{v}</span>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      {row.isTechnicalService && (
                        <span style={{ 
                          background: '#e0f2fe', 
                          color: '#0369a1', 
                          padding: '1px 6px', 
                          borderRadius: 3, 
                          fontSize: 10,
                          fontWeight: 600
                        }}>
                          Técnico
                        </span>
                      )}
                      {!row.hasEmployeeCommission && (
                        <span style={{ 
                          background: '#fef3c7', 
                          color: '#92400e', 
                          padding: '1px 6px', 
                          borderRadius: 3, 
                          fontSize: 10,
                          fontWeight: 600
                        }}>
                          Sin comisión
                        </span>
                      )}
                    </div>
                  </div>
                )
              },
              { 
                key: 'description', 
                label: 'Descripción',
                width: '250px',
                render: (v, row) => {
                  if (!v) return <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>—</span>;
                  const isExpanded = expandedDesc.has(row.id);
                  const shouldTruncate = v.length > 80;
                  
                  return (
                    <div style={{ maxWidth: 250 }}>
                      <div
                        style={{ 
                          display: isExpanded ? 'block' : '-webkit-box',
                          WebkitLineClamp: isExpanded ? 'unset' : 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          lineHeight: '1.4',
                          fontSize: 13,
                          color: 'var(--text-muted)'
                        }}
                      >
                        {v}
                      </div>
                      {shouldTruncate && (
                        <button
                          onClick={() => toggleDesc(row.id)}
                          style={{
                            background: 'none',
                            border: 'none',
                            padding: '4px 0 0',
                            fontSize: 11,
                            color: 'var(--primary)',
                            cursor: 'pointer',
                            fontWeight: 600,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4
                          }}
                        >
                          {isExpanded ? 'Ver menos' : 'Ver más'}
                          <span style={{ fontSize: 10 }}>{isExpanded ? '▲' : '▼'}</span>
                        </button>
                      )}
                    </div>
                  );
                }
              },
              // Columna de Grupo
              {
                key: 'Group',
                label: 'Grupo',
                render: (v, row) => {
                  const groupName = row.Group?.name || row.Group?.dataValues?.name;
                  return groupName ? (
                    <span style={{ 
                      background: 'var(--bg-secondary)', 
                      padding: '4px 10px', 
                      borderRadius: 12, 
                      fontSize: 12,
                      fontWeight: 500,
                      color: 'var(--text)',
                      border: '1px solid var(--border)'
                    }}>
                      {groupName}
                    </span>
                  ) : (
                    <span style={{ color: 'var(--text-muted)', fontSize: 12, fontStyle: 'italic' }}>
                      Sin grupo
                    </span>
                  );
                }
              },
              // Mostrar columna de precio solo si NO es empresa de servicios técnicos
              ...(!isTechnicalBusiness ? [
                { 
                  key: 'price', 
                  label: 'Precio', 
                  render: (v, row) => row.priceOptional ? 'A cotizar' : `$${Number(v || 0).toLocaleString('es-CO')}` 
                }
              ] : [
                { 
                  key: 'price', 
                  label: 'Precio', 
                  render: () => <span style={{ color: '#92400e', fontWeight: 600 }}>A cotizar</span>
                }
              ]),
              { key: 'durationMin', label: 'Duración', render: v => `${v} min` },
            ]}
            data={paginatedServices}
            actions={[
              { label: '✏️ Editar', onClick: (row) => handleEdit(row), color: 'var(--primary)' },
              { label: '🗑️ Eliminar', onClick: (row) => handleDelete(row.id), color: 'var(--danger)' }
            ]}
            fullWidthActions={false}
            loading={loading}
            emptyMessage="No hay servicios creados. ¡Crea uno para empezar!"
          />

          {/* Paginación */}
          {totalPages > 1 && (
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              gap: 12, 
              marginTop: 20,
              paddingTop: 16,
              borderTop: '1px solid var(--border)'
            }}>
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="btn-outline btn-sm"
                style={{ padding: '6px 12px' }}
              >
                Anterior
              </button>
              <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>
                Página {currentPage} de {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="btn-outline btn-sm"
                style={{ padding: '6px 12px' }}
              >
                Siguiente
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal para gestionar grupos de servicios */}
      {showGroupModal && (
        <div
          className="modal-overlay"
          onClick={() => {
            setShowGroupModal(false);
            setEditingGroup(null);
            setGroupForm(emptyGroup);
          }}
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
            style={{ maxWidth: 600, maxHeight: '85vh', width: '100%', overflow: 'auto' }}
          >
            <div style={{
              padding: '20px 24px',
              background: 'var(--primary)',
              color: 'white',
              borderRadius: '16px 16px 0 0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>
                  <FolderOpen size={22} style={{ display: 'inline', marginRight: 10, verticalAlign: 'middle' }} />
                  Grupos de Servicios
                </h3>
                <p style={{ margin: '4px 0 0', fontSize: 13, opacity: 0.9 }}>
                  Organiza tus servicios por categorías
                </p>
              </div>
              <button
                onClick={() => {
                  setShowGroupModal(false);
                  setEditingGroup(null);
                  setGroupForm(emptyGroup);
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

            <div style={{ padding: 24 }}>
              {/* Formulario de grupo */}
              <form onSubmit={handleSaveGroup} style={{ marginBottom: 28 }}>
                {/* Imagen del grupo */}
                <div style={{ marginBottom: 16, textAlign: 'center' }}>
                  <div
                    onClick={() => groupFileInputRef.current?.click()}
                    style={{
                      width: '100%',
                      height: 120,
                      borderRadius: 12,
                      border: '2px dashed var(--border)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      overflow: 'hidden',
                      position: 'relative',
                      background: groupForm.imageUrl ? 'none' : 'var(--bg-secondary)'
                    }}
                  >
                    {uploadingGroupImage ? (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                        <Loader2 className="animate-spin" size={24} color="var(--primary)" />
                        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Subiendo...</span>
                      </div>
                    ) : groupForm.imageUrl ? (
                      <>
                        <img
                          src={getImgUrl(groupForm.imageUrl)}
                          alt="Grupo"
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                        <button
                          onClick={(e) => { e.stopPropagation(); setGroupForm({...groupForm, imageUrl: ''}); }}
                          style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: '50%', padding: 4, cursor: 'pointer' }}
                        >
                          <X size={14} color="white" />
                        </button>
                      </>
                    ) : (
                      <>
                        <Camera size={24} color="var(--text-muted)" style={{ marginBottom: 4 }} />
                        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Imagen del grupo (opcional)</span>
                      </>
                    )}
                  </div>
                  <input
                    type="file"
                    ref={groupFileInputRef}
                    onChange={handleGroupFileChange}
                    accept="image/*"
                    style={{ display: 'none' }}
                  />
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8, color: 'var(--text)' }}>
                    Nombre del grupo *
                  </label>
                  <input
                    type="text"
                    value={groupForm.name}
                    onChange={(e) => setGroupForm({ ...groupForm, name: e.target.value })}
                    placeholder="Ej: Uñas, Cabello, Facial..."
                    required
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 8,
                      border: '1px solid var(--border)',
                      fontSize: 14,
                      background: 'var(--bg)',
                      color: 'var(--text)'
                    }}
                  />
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8, color: 'var(--text)' }}>
                    Descripción (opcional)
                  </label>
                  <textarea
                    value={groupForm.description}
                    onChange={(e) => setGroupForm({ ...groupForm, description: e.target.value })}
                    placeholder="Describe el grupo..."
                    rows={2}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 8,
                      border: '1px solid var(--border)',
                      fontSize: 14,
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
                    {editingGroup ? 'Actualizar Grupo' : 'Crear Grupo'}
                  </button>
                  {editingGroup && (
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => {
                        setEditingGroup(null);
                        setGroupForm(emptyGroup);
                      }}
                      style={{ padding: '12px 20px', borderRadius: 10 }}
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              </form>

              {/* Lista de grupos existentes */}
              <div>
                <h4 style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 600, color: 'var(--text-muted)' }}>
                  Grupos existentes ({serviceGroups.length})
                </h4>
                {serviceGroups.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: 32, background: 'var(--bg)', borderRadius: 12, border: '2px dashed var(--border)' }}>
                    <FolderOpen size={32} color="var(--text-muted)" style={{ marginBottom: 8, opacity: 0.5 }} />
                    <p style={{ color: 'var(--text-muted)', fontSize: 14, margin: 0 }}>No hay grupos creados aún</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {serviceGroups.map((group) => (
                      <div
                        key={group.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 12,
                          padding: 12,
                          background: 'var(--bg)',
                          borderRadius: 10,
                          border: '1px solid var(--border)'
                        }}
                      >
                        {group.imageUrl ? (
                          <img
                            src={getImgUrl(group.imageUrl)}
                            alt={group.name}
                            style={{ width: 48, height: 48, borderRadius: 8, objectFit: 'cover' }}
                          />
                        ) : (
                          <div style={{ width: 48, height: 48, borderRadius: 8, background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <FolderOpen size={20} color="var(--text-muted)" />
                          </div>
                        )}
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text)' }}>{group.name}</div>
                          {group.description && (
                            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{group.description}</div>
                          )}
                          {/* Lista de servicios del grupo */}
                          {group.Services && group.Services.length > 0 && (
                            <div style={{ 
                              marginTop: 8, 
                              padding: '8px 10px', 
                              background: 'var(--bg-secondary)', 
                              borderRadius: 6,
                              fontSize: 12 
                            }}>
                              <div style={{ fontWeight: 600, marginBottom: 4, color: 'var(--text-muted)', fontSize: 11 }}>
                                Servicios ({group.Services.length}):
                              </div>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                {group.Services.map(svc => (
                                  <div key={svc.id} style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: 6,
                                    padding: '3px 0'
                                  }}>
                                    <div style={{ 
                                      width: 8, 
                                      height: 8, 
                                      borderRadius: '50%', 
                                      background: svc.color || '#3b82f6' 
                                    }} />
                                    <span style={{ color: 'var(--text)' }}>{svc.name}</span>
                                    <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>
                                      ({svc.durationMin} min)
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          {(!group.Services || group.Services.length === 0) && (
                            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, fontStyle: 'italic' }}>
                              Sin servicios asignados
                            </div>
                          )}
                        </div>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button
                            onClick={() => handleEditGroup(group)}
                            className="btn-ghost btn-sm"
                            style={{ padding: 6 }}
                            title="Editar"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDeleteGroup(group.id)}
                            className="btn-ghost btn-sm"
                            style={{ padding: 6, color: 'var(--danger)' }}
                            title="Eliminar"
                          >
                            🗑️
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
    </AdminLayout>
  );
}

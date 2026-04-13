import { useState, useEffect, useMemo, useRef } from 'react';
import AdminLayout from '../../components/AdminLayout';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import ResponsiveTable from '../../components/ResponsiveTable';
import ResponsiveForm from '../../components/ResponsiveForm';
import { Camera, X, Loader2 } from 'lucide-react';

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

  const empty = { name: '', description: '', price: '', durationMin: 60, isTechnicalService: false, priceOptional: false, hasEmployeeCommission: true, imageUrl: '' };

export default function Services() {
  const { business } = useAuth();
  const fileInputRef = useRef(null);
  
  // Detectar si la empresa es de servicios técnicos
  const isTechnicalBusiness = business?.isTechnicalServices || false;
  
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

  const toggleDesc = (id) => {
    const newSet = new Set(expandedDesc);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setExpandedDesc(newSet);
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
    if (business?.id) loadServices();
  }, [business?.id]);

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
      imageUrl: svc.imageUrl || ''
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
              }
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
    </AdminLayout>
  );
}

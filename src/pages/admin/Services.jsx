import { useState, useEffect, useMemo } from 'react';
import AdminLayout from '../../components/AdminLayout';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import ResponsiveTable from '../../components/ResponsiveTable';
import ResponsiveForm from '../../components/ResponsiveForm';

  const empty = { name: '', description: '', price: '', durationMin: 60, isTechnicalService: false, priceOptional: false, hasEmployeeCommission: true };

export default function Services() {
  const { business } = useAuth();
  
  // Detectar si la empresa es de servicios técnicos
  const isTechnicalBusiness = business?.isTechnicalServices || false;
  
  const [services, setServices] = useState([]);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    if (business?.id) loadServices();
  }, [business]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const loadServices = () => {
    setLoading(true);
    api.get(`/services/business/${business.id}`)
      .then(r => setServices(r.data))
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
    const finalForm = {
      ...form,
      businessId: business.id,
      // Si la empresa es de servicios técnicos, forzamos estos valores
      isTechnicalService: isTechnicalBusiness ? true : false,
      priceOptional: isTechnicalBusiness ? true : false,
      price: isTechnicalBusiness ? 0 : form.price
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
      setError(e.response?.data?.error || 'Error al procesar');
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
      hasEmployeeCommission: svc.hasEmployeeCommission !== false
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
              { key: 'name', label: 'Nombre' },
              { key: 'description', label: 'Descripción', render: v => v || '—' },
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
              // Solo mostrar columna de tipo si NO es empresa de servicios técnicos
              ...(!isTechnicalBusiness ? [
                { 
                  key: 'type', 
                  label: 'Tipo', 
                  render: (v, row) => (
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      {row.isTechnicalService && (
                        <span style={{ 
                          background: '#e0f2fe', 
                          color: '#0369a1', 
                          padding: '2px 8px', 
                          borderRadius: 4, 
                          fontSize: 11,
                          fontWeight: 600
                        }}>
                          Técnico
                        </span>
                      )}
                      {!row.hasEmployeeCommission && (
                        <span style={{ 
                          background: '#fef3c7', 
                          color: '#92400e', 
                          padding: '2px 8px', 
                          borderRadius: 4, 
                          fontSize: 11,
                          fontWeight: 600
                        }}>
                          Sin comisión
                        </span>
                      )}
                    </div>
                  )
                }
              ] : [])
            ]}
            data={paginatedServices}
            actions={[
              { label: '✏️ Editar', onClick: (row) => handleEdit(row), color: 'var(--primary)' },
              { label: '🗑️ Eliminar', onClick: (row) => handleDelete(row.id), color: 'var(--danger)' }
            ]}
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

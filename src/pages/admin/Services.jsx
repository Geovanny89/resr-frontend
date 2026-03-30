import { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import ResponsiveTable from '../../components/ResponsiveTable';
import ResponsiveForm from '../../components/ResponsiveForm';

const empty = { name: '', description: '', price: '', durationMin: 60 };

export default function Services() {
  const { business } = useAuth();
  const [services, setServices] = useState([]);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      if (editing) {
        await api.put(`/services/${editing}`, form);
        setSuccess('Servicio actualizado');
      } else {
        await api.post('/services', { ...form, businessId: business.id });
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
    setForm({ name: svc.name, description: svc.description || '', price: svc.price, durationMin: svc.durationMin });
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este servicio?')) return;
    try {
      await api.delete(`/services/${id}`);
      loadServices();
    } catch (e) {
      setError('Error al eliminar');
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
              {
                name: 'price',
                label: 'Precio ($)',
                type: 'number',
                required: true,
                placeholder: '0.00',
                value: form.price,
                onChange: e => setForm({ ...form, price: e.target.value })
              },
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
              { key: 'price', label: 'Precio', render: v => `$${Number(v).toLocaleString('es-CO')}` },
              { key: 'durationMin', label: 'Duración', render: v => `${v} min` }
            ]}
            data={services}
            actions={[
              { label: '✏️ Editar', onClick: handleEdit, color: 'var(--primary)' },
              { label: '🗑️ Eliminar', onClick: handleDelete, color: 'var(--danger)' }
            ]}
            loading={loading}
            emptyMessage="No hay servicios creados. ¡Crea uno para empezar!"
          />
        </div>
      </div>
    </AdminLayout>
  );
}

import { useState, useEffect, useMemo } from 'react';
import AdminLayout from '../../components/AdminLayout';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import ResponsiveTable from '../../components/ResponsiveTable';
import ResponsiveForm from '../../components/ResponsiveForm';
import { Tag, Calendar, Percent, DollarSign, CheckCircle, XCircle } from 'lucide-react';

const empty = { 
  name: '', 
  description: '', 
  discountType: 'percentage', 
  discountValue: '', 
  startDate: '', 
  endDate: '', 
  active: true, 
  applyToAllServices: false,
  serviceId: ''
};

export default function Promotions() {
  const { business } = useAuth();
  
  const [promotions, setPromotions] = useState([]);
  const [services, setServices] = useState([]);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Toast notification state
  const [statusMsg, setStatusMsg] = useState(null);
  const showStatus = (text, type = 'success') => {
    setStatusMsg({ text, type });
    setTimeout(() => setStatusMsg(null), 3500);
  };

  // Estados para confirmación de eliminación
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [promotionToDelete, setPromotionToDelete] = useState(null);

  useEffect(() => {
    if (business?.id) {
      loadPromotions();
      loadServices();
    }
  }, [business]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const loadPromotions = (skipCache = false) => {
    setLoading(true);
    api.get(`/promotions/business/${business.id}`, skipCache ? { params: { noCache: true } } : {})
      .then(r => {
        if (Array.isArray(r.data)) {
          setPromotions(r.data);
        } else {
          setPromotions([]);
        }
      })
      .catch(() => setPromotions([]))
      .finally(() => setLoading(false));
  };

  const loadServices = (skipCache = false) => {
    api.get(`/services/business/${business.id}`, skipCache ? { params: { noCache: true } } : {})
      .then(r => setServices(r.data))
      .catch(() => setServices([]));
  };

  const paginatedPromotions = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return promotions.slice(startIndex, startIndex + itemsPerPage);
  }, [promotions, currentPage]);

  const totalPages = Math.ceil(promotions.length / itemsPerPage);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!form.startDate || !form.endDate) {
      setError('Las fechas son obligatorias');
      return;
    }

    const finalForm = {
      ...form,
      businessId: business.id,
      serviceId: form.applyToAllServices ? null : form.serviceId
    };

    try {
      if (editing) {
        await api.put(`/promotions/${editing}`, finalForm);
        setSuccess('¡Cambios guardados!');
      } else {
        await api.post('/promotions', finalForm);
        setSuccess('¡Promoción creada con éxito!');
      }
      setForm(empty);
      setEditing(null);
      loadPromotions(true);
      setTimeout(() => setSuccess(''), 4000);
    } catch (e) {
      const errorMsg = e.response?.data?.error || e.message || 'Ocurrió un error inesperado';
      setError(`❌ ${errorMsg}`);
      console.error('[PromotionForm] Error details:', e.response?.data || e.message);
    }
  };

  const handleEdit = (promo) => {
    setEditing(promo.id);
    setForm({ 
      name: promo.name, 
      description: promo.description || '', 
      discountType: promo.discountType,
      discountValue: promo.discountValue,
      startDate: promo.startDate.split('T')[0],
      endDate: promo.endDate.split('T')[0],
      active: promo.active,
      applyToAllServices: promo.applyToAllServices,
      serviceId: promo.serviceId || ''
    });
  };

  const handleDelete = (id) => {
    setPromotionToDelete(id);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!promotionToDelete) return;
    try {
      setError('');
      await api.delete(`/promotions/${promotionToDelete}`);
      showStatus('Promoción eliminada correctamente');
      loadPromotions(true);
    } catch (e) {
      showStatus(e.response?.data?.error || 'Error al eliminar', 'error');
    } finally {
      setShowDeleteConfirm(false);
      setPromotionToDelete(null);
    }
  };

  return (
    <AdminLayout title="Promociones" subtitle="Gestiona descuentos temporales">
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: isMobile ? '1fr' : '400px 1fr', 
        gap: 24, 
        alignItems: 'start' 
      }}>
        {/* Formulario */}
        <div className="card" style={{ padding: '24px', position: 'sticky', top: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <div style={{ background: 'var(--primary-bg)', color: 'var(--primary)', padding: 10, borderRadius: 12 }}>
              <Tag size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0, color: 'var(--text)' }}>
                {editing ? 'Editar promoción' : 'Nueva promoción'}
              </h2>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0 }}>
                Completa los datos para crear la oferta
              </p>
            </div>
          </div>
          
          <ResponsiveForm
            fields={[
              {
                name: 'name',
                label: 'Nombre de la promoción',
                type: 'text',
                required: true,
                placeholder: 'Ej: Especial de Verano',
                value: form.name,
                onChange: e => setForm({ ...form, name: e.target.value }),
                fullWidth: true
              },
              {
                name: 'applyToAllServices',
                label: '¿A qué servicios aplica?',
                type: 'select',
                options: [
                  { value: 'false', label: '📍 Un servicio específico' },
                  { value: 'true', label: '🌎 Todos los servicios' }
                ],
                value: String(form.applyToAllServices),
                onChange: e => setForm({ ...form, applyToAllServices: e.target.value === 'true', serviceId: e.target.value === 'true' ? '' : form.serviceId }),
                fullWidth: true
              },
              ...(!form.applyToAllServices ? [
                {
                  name: 'serviceId',
                  label: 'Selecciona el servicio',
                  type: 'select',
                  required: true,
                  options: services.map(s => ({ value: s.id, label: s.name })),
                  value: form.serviceId,
                  onChange: e => setForm({ ...form, serviceId: e.target.value }),
                  fullWidth: true
                }
              ] : []),
              {
                name: 'discountType',
                label: 'Tipo',
                type: 'select',
                options: [
                  { value: 'percentage', label: 'Porcentaje (%)' },
                  { value: 'fixed', label: 'Monto fijo ($)' }
                ],
                value: form.discountType,
                onChange: e => setForm({ ...form, discountType: e.target.value }),
              },
              {
                name: 'discountValue',
                label: 'Valor',
                type: 'number',
                required: true,
                placeholder: 'Ej: 20',
                value: form.discountValue,
                onChange: e => setForm({ ...form, discountValue: e.target.value }),
              },
              {
                name: 'startDate',
                label: 'Fecha Inicio',
                type: 'date',
                required: true,
                value: form.startDate,
                onChange: e => setForm({ ...form, startDate: e.target.value }),
              },
              {
                name: 'endDate',
                label: 'Fecha Fin',
                type: 'date',
                required: true,
                value: form.endDate,
                onChange: e => setForm({ ...form, endDate: e.target.value }),
              },
              {
                name: 'active',
                label: 'Estado de la promoción',
                type: 'select',
                options: [
                  { value: 'true', label: '✅ Activa' },
                  { value: 'false', label: '❌ Inactiva' }
                ],
                value: String(form.active),
                onChange: e => setForm({ ...form, active: e.target.value === 'true' }),
                fullWidth: true
              }
            ]}
            onSubmit={handleSubmit}
            submitText={editing ? 'Guardar Cambios' : 'Crear promoción'}
            error={error}
            success={success}
            columns={2}
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
              <div className="card-title">📋 Promociones registradas</div>
              <div className="card-subtitle">{promotions.length} promoción{promotions.length !== 1 ? 'es' : ''}</div>
            </div>
          </div>
          <ResponsiveTable
            columns={[
              { key: 'name', label: 'Nombre' },
              { 
                key: 'service', 
                label: 'Alcance', 
                render: (_, item) => item.applyToAllServices ? 'Todos los servicios' : (item.Service?.name || 'Servicio eliminado')
              },
              { 
                key: 'discount', 
                label: 'Descuento', 
                render: (_, item) => item.discountType === 'percentage' ? `${item.discountValue}%` : `$${item.discountValue}`
              },
              { 
                key: 'dates', 
                label: 'Vigencia', 
                render: (_, item) => (
                  <div style={{ fontSize: 12 }}>
                    <div>{new Date(item.startDate).toLocaleDateString()} al</div>
                    <div>{new Date(item.endDate).toLocaleDateString()}</div>
                  </div>
                )
              },
              { 
                key: 'active', 
                label: 'Estado', 
                render: v => v ? <span className="badge-success">Activa</span> : <span className="badge-error">Inactiva</span>
              }
            ]}
            data={paginatedPromotions}
            actions={[
              { label: '✏️ Editar', onClick: (row) => handleEdit(row), color: 'var(--primary)' },
              { label: '🗑️ Eliminar', onClick: (row) => handleDelete(row.id), color: 'var(--danger)' }
            ]}
            loading={loading}
          />
          
          {totalPages > 1 && (
            <div className="pagination" style={{ marginTop: 16, display: 'flex', justifyContent: 'center', gap: 8 }}>
              <button 
                disabled={currentPage === 1} 
                onClick={() => setCurrentPage(prev => prev - 1)}
                className="btn-small"
              >Anterior</button>
              <span style={{ alignSelf: 'center' }}>Página {currentPage} de {totalPages}</span>
              <button 
                disabled={currentPage === totalPages} 
                onClick={() => setCurrentPage(prev => prev + 1)}
                className="btn-small"
              >Siguiente</button>
            </div>
          )}
        </div>
      </div>

      {/* Toast notification */}
      {statusMsg && (
        <div style={{
          position: 'fixed', top: 20, right: 20, zIndex: 9999,
          padding: '12px 20px', borderRadius: 10, fontWeight: 600, fontSize: 14,
          background: statusMsg.type === 'error' ? '#fee2e2' : '#d1fae5',
          color: statusMsg.type === 'error' ? '#991b1b' : '#065f46',
          border: `1px solid ${statusMsg.type === 'error' ? '#fecaca' : '#a7f3d0'}`,
          boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
          display: 'flex', alignItems: 'center', gap: 8,
          animation: 'fadeInDown 0.3s ease-out'
        }}>
          {statusMsg.type === 'error' ? <XCircle size={16} /> : <Tag size={16} />}
          {statusMsg.text}
        </div>
      )}

      {/* Modal: Confirmar eliminación de promoción */}
      {showDeleteConfirm && (
        <div className="modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
          <div className="modal" style={{ maxWidth: 400 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ margin: 0 }}>¿Eliminar promoción?</h3>
              <button className="btn-ghost" onClick={() => setShowDeleteConfirm(false)}>✕</button>
            </div>
            <div style={{ padding: '20px' }}>
              <p style={{ margin: 0, color: 'var(--text)', lineHeight: 1.5 }}>
                Esta acción no se puede deshacer.
              </p>
            </div>
            <div className="modal-footer" style={{ justifyContent: 'flex-end', gap: 10 }}>
              <button className="btn-ghost" onClick={() => setShowDeleteConfirm(false)}>Cancelar</button>
              <button className="btn-danger" onClick={confirmDelete}>Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

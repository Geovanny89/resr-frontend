import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import api from '../../api/client';
import AdminLayout from '../../components/AdminLayout';
import ResponsiveTable from '../../components/ResponsiveTable';
import ResponsiveForm from '../../components/ResponsiveForm';
import { Upload } from 'lucide-react';

// URL base para imágenes - si es relativa, usar el dominio del backend
const API_BASE_URL = api.defaults.baseURL || '/api';
const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

// En desarrollo local el backend corre en el puerto 4000, en producción usamos el subdominio api-reservas
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

export default function Employees() {
  const { business } = useAuth();
  const { colors } = useTheme();
  const navigate = useNavigate();
  
  // Detectar si la empresa es de servicios técnicos
  const isTechnicalBusiness = business?.isTechnicalServices || false;
  
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editEmp, setEditEmp] = useState(null);
  const [form, setForm] = useState({ 
    name: '', 
    email: '', 
    password: '', 
    commissionPct: 0, 
    ownerPct: 100, 
    photoUrl: '', 
    description: '',
    specialty: '',
    isManager: false, 
    role: 'employee' 
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [uploading, setUploading] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [branches, setBranches] = useState([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState('');
  
  // Estados para gestión de servicios por empleado
  const [showServicesModal, setShowServicesModal] = useState(false);
  const [servicesEmp, setServicesEmp] = useState(null);
  const [availableServices, setAvailableServices] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);
  const [loadingServices, setLoadingServices] = useState(false);
  const [savingServices, setSavingServices] = useState(false);
  
  // Estado para información de suscripción
  const [subscriptionInfo, setSubscriptionInfo] = useState(null);
  
  // Estado para modal de agregar usuarios
  const [showAddUsersModal, setShowAddUsersModal] = useState(false);
  const [usersToAdd, setUsersToAdd] = useState(1);
  const [addingUsers, setAddingUsers] = useState(false);
  const ADDITIONAL_USER_PRICE = 20000;

  // Estado para modal de confirmación de eliminación
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    if (!business?.id) return;
    setLoading(true);
    try {
      // 1. Cargar empleados del negocio actual (o sucursal si estamos en una)
      const res = await api.get(`/employees?businessId=${business.id}`);
      setEmployees(res.data);

      // 2. Si es el negocio principal, cargar sucursales para poder asignar empleados/admins a ellas
      if (!business.isBranch) {
        const bRes = await api.get('/businesses/my/branches');
        setBranches(bRes.data || []);
      }
      
      // 3. Cargar información de suscripción del negocio ACTUAL (no del negocio principal del usuario)
      try {
        const subRes = await api.get(`/businesses/my/subscription-info?businessId=${business.id}`);
        setSubscriptionInfo(subRes.data);
      } catch (subErr) {
        // No se pudo cargar info de suscripción
      }
    } catch (e) {
      setError(e.response?.data?.error || 'Error al cargar empleados');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [business]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const paginatedEmployees = employees.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(employees.length / itemsPerPage);

  const openCreate = () => {
    setEditEmp(null);
    setForm({ 
      name: '', 
      email: '', 
      password: '', 
      commissionPct: 0, 
      ownerPct: 100, 
      photoUrl: '', 
      description: '',
      specialty: '',
      isManager: false,
      role: 'employee'
    });
    setSelectedBusinessId(business.id); // Por defecto el negocio actual
    setPhotoPreview(null);
    setError('');
    setSuccess('');
    setShowModal(true);
  };

  const openEdit = (emp) => {
    setEditEmp(emp);
    setForm({
      name: emp.User?.name || '',
      email: emp.User?.email || '',
      password: '',
      commissionPct: emp.commissionPct,
      ownerPct: emp.ownerPct,
      photoUrl: emp.photoUrl || '',
      description: emp.description || '',
      specialty: emp.specialty || '',
      isManager: emp.isManager || false,
      role: emp.User?.role || 'employee'
    });
    setSelectedBusinessId(emp.businessId);
    setPhotoPreview(emp.photoUrl ? getImgUrl(emp.photoUrl) : null);
    setError('');
    setSuccess('');
    setShowModal(true);
  };

  const handleCommissionChange = (val) => {
    const pct = Math.min(100, Math.max(0, parseFloat(val) || 0));
    setForm(f => ({ ...f, commissionPct: pct, ownerPct: parseFloat((100 - pct).toFixed(2)) }));
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Por favor selecciona una imagen válida');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('La imagen no debe superar 5MB');
      return;
    }

    setUploading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('image', file);

      const res = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const photoPath = res.data.path || res.data.url;
      setForm(f => ({ ...f, photoUrl: photoPath }));

      const reader = new FileReader();
      reader.onload = (event) => {
        setPhotoPreview(event.target.result);
      };
      reader.readAsDataURL(file);

      setSuccess('Foto subida correctamente');
    } catch (err) {
      setError(err.response?.data?.error || 'Error al subir la foto');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      if (editEmp) {
        await api.put(`/employees/${editEmp.id}`, {
          name: form.name,
          email: form.email,
          commissionPct: form.commissionPct,
          ownerPct: form.ownerPct,
          photoUrl: form.photoUrl,
          description: form.description,
          specialty: form.specialty,
          isManager: form.isManager,
          businessId: selectedBusinessId, // Permitir cambiar el negocio/sucursal asignado
          role: form.role
        });
        setSuccess('Empleado actualizado');
      } else {
        await api.post('/employees', {
          name: form.name,
          email: form.email,
          password: form.password,
          commissionPct: form.commissionPct,
          ownerPct: form.ownerPct,
          businessId: selectedBusinessId, // Usar el negocio/sucursal seleccionado
          photoUrl: form.photoUrl,
          description: form.description,
          specialty: form.specialty,
          isManager: form.isManager,
          role: form.role
        });
        const roleLabel = form.role === 'admin_suc' ? 'Administrador de Sucursal' : form.role === 'admin' ? 'Administrador' : 'Empleado';
        setSuccess(`✅ Usuario ${roleLabel.toLowerCase()} creado exitosamente`);
      }
      setShowModal(false);
      load();
    } catch (e) {
      setError(e.response?.data?.error || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const openDeleteModal = (emp) => {
    setEmployeeToDelete(emp);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setEmployeeToDelete(null);
    setDeleting(false);
  };

  const confirmDelete = async () => {
    if (!employeeToDelete) return;
    setDeleting(true);
    try {
      await api.delete(`/employees/${employeeToDelete.id}`);
      setSuccess('Empleado eliminado correctamente');
      closeDeleteModal();
      load();
      setTimeout(() => setSuccess(''), 3000);
    } catch (e) {
      setError(e.response?.data?.error || 'Error al eliminar el empleado');
    } finally {
      setDeleting(false);
    }
  };

  // ========== GESTIÓN DE SERVICIOS POR EMPLEADO ==========
  
  const openServicesModal = async (emp) => {
    setServicesEmp(emp);
    setShowServicesModal(true);
    setLoadingServices(true);
    setError('');
    
    try {
      // Cargar servicios disponibles del negocio usando el endpoint correcto
      const servicesRes = await api.get(`/businesses/${business.slug}/public`);
      const businessData = servicesRes.data;
      setAvailableServices(businessData.Services || []);
      
      // Cargar servicios del empleado
      const empServicesRes = await api.get(`/employees/${emp.id}/services`);
      setSelectedServices(empServicesRes.data.services.map(s => s.id));
    } catch (e) {
      console.error('Error cargando servicios:', e);
      setError('Error al cargar servicios: ' + (e.response?.data?.error || e.message));
    } finally {
      setLoadingServices(false);
    }
  };

  const toggleService = (serviceId) => {
    setSelectedServices(prev => 
      prev.includes(serviceId)
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const handleSaveServices = async () => {
    if (!servicesEmp) return;
    setSavingServices(true);
    setError('');
    
    try {
      await api.put(`/employees/${servicesEmp.id}/services`, {
        serviceIds: selectedServices,
        businessId: business.id
      });
      setSuccess('Servicios actualizados correctamente');
      setTimeout(() => setSuccess(''), 3000);
      load(); // Recargar empleados
    } catch (e) {
      setError(e.response?.data?.error || 'Error al guardar servicios');
    } finally {
      setSavingServices(false);
    }
  };

  const closeServicesModal = () => {
    setShowServicesModal(false);
    setServicesEmp(null);
    setAvailableServices([]);
    setSelectedServices([]);
    setError('');
  };

  return (
    <AdminLayout title="Empleados" subtitle="Gestiona tu equipo de trabajo">
      <style>{`
        @media (max-width: 480px) {
          .employees-modal-close {
            min-width: 40px;
          }
          .employees-photo {
            width: 84px !important;
            height: 84px !important;
          }
        }
      `}</style>
      
      {/* Banner de información de suscripción */}
      {subscriptionInfo && (
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '16px',
          padding: '20px 24px',
          marginBottom: '24px',
          color: 'white',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '20px',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '4px' }}>
              Plan {subscriptionInfo.planName}
            </div>
            <div style={{ fontSize: '24px', fontWeight: 700 }}>
              {subscriptionInfo.currentEmployees} de {subscriptionInfo.totalUsersAllowed} empleados
            </div>
            <div style={{ fontSize: '13px', opacity: 0.8, marginTop: '4px' }}>
              {subscriptionInfo.includedUsers} incluidos + {subscriptionInfo.additionalUsers} adicionales (el admin no cuenta)
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '13px', opacity: 0.9 }}>
                {subscriptionInfo.availableUsers > 0 ? 'Cupos disponibles' : 'Sin cupos'}
              </div>
              <div style={{ 
                fontSize: '28px', 
                fontWeight: 800,
                color: subscriptionInfo.availableUsers > 0 ? '#10b981' : '#ef4444'
              }}>
                {subscriptionInfo.availableUsers}
              </div>
            </div>
            
          </div>
        </div>
      )}
      
      <div style={{ marginBottom: 20 }}>
        <button
          onClick={openCreate}
          className="btn-primary"
          style={{ 
            width: isMobile ? '100%' : 'auto',
            opacity: subscriptionInfo?.availableUsers === 0 ? 0.5 : 1,
            cursor: subscriptionInfo?.availableUsers === 0 ? 'not-allowed' : 'pointer'
          }}
          disabled={subscriptionInfo?.availableUsers === 0}
        >
          ➕ Nuevo empleado
        </button>
        {subscriptionInfo?.availableUsers === 0 && (
          <div style={{ fontSize: '12px', color: '#ef4444', marginTop: '8px' }}>
            Has usado todos tus empleados permitidos ({subscriptionInfo?.currentEmployees} de {subscriptionInfo?.totalUsersAllowed}). El admin no cuenta. Contacta al administrador para agregar más cupos.
          </div>
        )}
      </div>

      <div className="card">
        <div className="card-header" style={{ marginBottom: 16 }}>
          <div>
            <div className="card-title">👥 Empleados registrados</div>
            <div className="card-subtitle">{employees.length} empleado{employees.length !== 1 ? 's' : ''}</div>
          </div>
        </div>

        <ResponsiveTable
          columns={[
            {
              key: 'name',
              label: 'Nombre',
              render: (v, row) => row.User?.name || '—'
            },
            {
              key: 'email',
              label: 'Email',
              render: (v, row) => row.User?.email || '—'
            },
            {
              key: 'commissionPct',
              label: 'Comisión',
              render: v => `${v}%`
            }
          ]}
          data={paginatedEmployees}
          actions={[
            { label: '💼 Servicios', onClick: openServicesModal, color: 'var(--info)' },
            { label: '✏️ Editar', onClick: openEdit, color: 'var(--primary)' },
            { label: '🗑️ Eliminar', onClick: openDeleteModal, color: 'var(--danger)' }
          ]}
          fullWidthActions={false}
          loading={loading}
          emptyMessage="No hay empleados. ¡Crea uno para empezar!"
        />

        {/* Paginación */}
        {totalPages > 1 && (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            gap: 12, 
            marginTop: 20,
            padding: '16px',
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

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                {editEmp ? '✏️ Editar empleado' : '➕ Nuevo empleado'}
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="employees-modal-close"
                style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              {/* Foto */}
              <div style={{ marginBottom: 20, textAlign: 'center' }}>
                {photoPreview ? (
                  <img
                    src={photoPreview}
                    alt="Preview"
                    style={{
                      width: 100,
                      height: 100,
                      borderRadius: '50%',
                      objectFit: 'cover',
                      marginBottom: 12
                    }}
                    className="employees-photo"
                  />
                ) : (
                  <div
                    style={{
                      width: 100,
                      height: 100,
                      borderRadius: '50%',
                      background: colors.bgTertiary,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 12px',
                      fontSize: 40
                    }}
                    className="employees-photo"
                  >
                    👤
                  </div>
                )}
                <label style={{ cursor: 'pointer', display: 'inline-block' }}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    disabled={uploading}
                    style={{ display: 'none' }}
                  />
                  <span className="btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    <Upload size={16} />
                    {uploading ? 'Subiendo...' : 'Subir foto'}
                  </span>
                </label>
              </div>

              <ResponsiveForm
                fields={[
                  {
                    name: 'name',
                    label: 'Nombre completo',
                    type: 'text',
                    required: true,
                    placeholder: 'Nombre del empleado',
                    value: form.name,
                    onChange: e => setForm({ ...form, name: e.target.value }),
                    fullWidth: true
                  },
                  {
                    name: 'specialty',
                    label: 'Especialidad / Cargo',
                    type: 'text',
                    placeholder: 'Ej: Manicurista, Barbero, Estilista...',
                    value: form.specialty,
                    onChange: e => setForm({ ...form, specialty: e.target.value }),
                    fullWidth: true,
                    hint: 'Este título aparecerá debajo del nombre del empleado en la página pública.'
                  },
                  {
                    name: 'description',
                    label: 'Perfil Profesional / Descripción',
                    type: 'textarea',
                    placeholder: 'Ej: Profesional en uñas estéticas con 4 años de experiencia...',
                    value: form.description,
                    onChange: e => setForm({ ...form, description: e.target.value }),
                    fullWidth: true,
                    rows: 3,
                    hint: 'Esta descripción aparecerá en la página pública para que los clientes conozcan al profesional.'
                  },
                  {
                    name: 'email',
                    label: 'Email',
                    type: 'email',
                    required: true,
                    placeholder: 'empleado@email.com',
                    value: form.email,
                    onChange: e => setForm({ ...form, email: e.target.value }),
                    fullWidth: true
                  },
                  ...(!editEmp ? [
                    {
                      name: 'password',
                      label: 'Contraseña',
                      type: 'password',
                      required: true,
                      placeholder: 'Mínimo 6 caracteres',
                      value: form.password,
                      onChange: e => setForm({ ...form, password: e.target.value }),
                      fullWidth: true
                    }
                  ] : []),
                  // Solo mostrar campos de comisión si NO es empresa de servicios técnicos
                  ...(!isTechnicalBusiness ? [
                    {
                      name: 'commissionPct',
                      label: 'Comisión (%)',
                      type: 'number',
                      min: 0,
                      max: 100,
                      value: form.commissionPct,
                      onChange: e => handleCommissionChange(e.target.value),
                      fullWidth: true
                    },
                    {
                      name: 'ownerPct',
                      label: 'Ganancia Negocio (%)',
                      type: 'number',
                      value: form.ownerPct,
                      onChange: () => {}, // Read-only field, calculated from commissionPct
                      disabled: true,
                      fullWidth: true
                    }
                  ] : []),
                  {
                    name: 'role',
                    label: 'Rol del Usuario',
                    type: 'select',
                    options: [
                      { value: 'employee', label: '👷 Empleado' },
                      { value: 'admin_suc', label: '👔 Administrador de Sucursal' },
                      { value: 'admin', label: '👑 Administrador Principal' }
                    ],
                    value: form.role,
                    onChange: e => setForm({ ...form, role: e.target.value }),
                    fullWidth: true,
                    hint: 'El rol determina los permisos del usuario en el sistema.'
                  },
                  {
                    name: 'isManager',
                    label: '¿Es el Administrador de la sede?',
                    type: 'select',
                    options: [
                      { value: 'false', label: 'No, es solo empleado' },
                      { value: 'true', label: 'Sí, es el administrador encargado' }
                    ],
                    value: String(form.isManager),
                    onChange: e => {
                      const isMgr = e.target.value === 'true';
                      setForm({ 
                        ...form, 
                        isManager: isMgr,
                        // Si es administrador, la comisión suele ser 0 o diferente
                        commissionPct: isMgr ? 0 : form.commissionPct,
                        ownerPct: isMgr ? 100 : form.ownerPct
                      });
                    },
                    fullWidth: true,
                    hint: 'Si activas esto, este usuario podrá administrar toda la sede (ver informes, gestionar empleados, etc.) y entrará directamente al Dashboard administrativo.'
                  },
                  // NUEVO: Selección de negocio/sucursal para asignar
                  ...(!business.isBranch && branches.length > 0 ? [{
                    name: 'businessId',
                    label: 'Asignar a Negocio/Sucursal',
                    type: 'select',
                    options: [
                      { value: business.id, label: `📍 Principal: ${business.name}` },
                      ...branches.map(b => ({ value: b.id, label: `🏢 Sucursal: ${b.name}` }))
                    ],
                    value: selectedBusinessId,
                    onChange: e => setSelectedBusinessId(e.target.value),
                    fullWidth: true,
                    hint: 'Selecciona en qué sucursal trabajará y/o administrará este usuario.'
                  }] : [])
                ]}
                onSubmit={handleSave}
                submitText={editEmp ? '💾 Actualizar' : '✅ Crear empleado'}
                error={error}
                success={success}
                columns={1}
              />
            </div>
          </div>
        </div>
      )}

      {/* ========== MODAL DE CONFIRMACIÓN DE ELIMINACIÓN ========== */}
      {showDeleteModal && employeeToDelete && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.6)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 20
        }} onClick={closeDeleteModal}>
          <div style={{
            background: colors.cardBg,
            borderRadius: 16,
            width: '100%',
            maxWidth: 420,
            boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
            textAlign: 'center'
          }} onClick={e => e.stopPropagation()}>
            {/* Icono */}
            <div style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: '#fee2e2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '24px auto 16px',
              fontSize: 32
            }}>
              🗑️
            </div>

            {/* Título */}
            <h3 style={{
              margin: '0 0 8px 0',
              fontSize: 20,
              fontWeight: 700,
              color: colors.text
            }}>
              ¿Eliminar empleado?
            </h3>

            {/* Descripción */}
            <p style={{
              margin: '0 24px 24px',
              fontSize: 14,
              color: colors.textSecondary,
              lineHeight: 1.5
            }}>
              ¿Estás seguro de que deseas eliminar a <strong>{employeeToDelete.User?.name}</strong>? Esta acción no se puede deshacer.
            </p>

            {/* Botones */}
            <div style={{
              padding: '16px 24px 24px',
              display: 'flex',
              gap: 12,
              justifyContent: 'center'
            }}>
              <button
                onClick={closeDeleteModal}
                disabled={deleting}
                style={{
                  padding: '10px 20px',
                  borderRadius: 8,
                  border: `1px solid ${colors.border}`,
                  background: colors.bg,
                  color: colors.text,
                  cursor: deleting ? 'not-allowed' : 'pointer',
                  fontWeight: 600,
                  opacity: deleting ? 0.6 : 1
                }}
              >
                No, cancelar
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                style={{
                  padding: '10px 20px',
                  borderRadius: 8,
                  border: 'none',
                  background: '#ef4444',
                  color: 'white',
                  cursor: deleting ? 'not-allowed' : 'pointer',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  opacity: deleting ? 0.6 : 1
                }}
              >
                {deleting ? (
                  <>
                    <span style={{
                      width: 14,
                      height: 14,
                      border: '2px solid rgba(255,255,255,0.3)',
                      borderTopColor: 'white',
                      borderRadius: '50%',
                      animation: 'spin 0.8s linear infinite',
                      display: 'inline-block'
                    }} />
                    Eliminando...
                  </>
                ) : (
                  'Sí, eliminar'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      {/* ========== MODAL DE GESTIÓN DE SERVICIOS ========== */}
      {showServicesModal && servicesEmp && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.6)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 20
        }} onClick={closeServicesModal}>
          <div style={{
            background: colors.cardBg,
            borderRadius: 16,
            width: '100%',
            maxWidth: 600,
            maxHeight: '90vh',
            overflow: 'auto',
            boxShadow: '0 25px 50px rgba(0,0,0,0.25)'
          }} onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div style={{
              padding: '20px 24px',
              borderBottom: `1px solid ${colors.border}`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: colors.text }}>
                  💼 Servicios de {servicesEmp.User?.name}
                </h3>
                <p style={{ margin: '4px 0 0 0', fontSize: 13, color: colors.textSecondary }}>
                  Selecciona los servicios que este empleado puede realizar
                </p>
              </div>
              <button
                onClick={closeServicesModal}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: 24,
                  cursor: 'pointer',
                  color: colors.textSecondary,
                  padding: '4px 8px'
                }}
              >
                ×
              </button>
            </div>

            {/* Content */}
            <div style={{ padding: '20px 24px' }}>
              {error && (
                <div style={{
                  background: '#fee2e2',
                  color: '#dc2626',
                  padding: '12px 16px',
                  borderRadius: 8,
                  marginBottom: 16,
                  fontSize: 14
                }}>
                  {error}
                </div>
              )}
              
              {success && (
                <div style={{
                  background: '#d1fae5',
                  color: '#059669',
                  padding: '12px 16px',
                  borderRadius: 8,
                  marginBottom: 16,
                  fontSize: 14
                }}>
                  {success}
                </div>
              )}

              {loadingServices ? (
                <div style={{ textAlign: 'center', padding: 40, color: colors.textSecondary }}>
                  Cargando servicios...
                </div>
              ) : availableServices.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 40, color: colors.textSecondary }}>
                  No hay servicios disponibles. Crea servicios primero.
                </div>
              ) : (
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                  gap: 10 
                }}>
                  {availableServices.map(service => {
                    const isSelected = selectedServices.includes(service.id);
                    return (
                      <div
                        key={service.id}
                        onClick={() => toggleService(service.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                          padding: '10px 12px',
                          borderRadius: 10,
                          border: `2px solid ${isSelected ? 'var(--primary)' : colors.border}`,
                          background: isSelected ? 'rgba(79, 70, 229, 0.08)' : colors.bg,
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          minHeight: 44
                        }}
                      >
                        {/* Checkbox circular */}
                        <div style={{
                          width: 20,
                          height: 20,
                          borderRadius: '50%',
                          border: `2px solid ${isSelected ? 'var(--primary)' : colors.border}`,
                          background: isSelected ? 'var(--primary)' : 'transparent',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.2s',
                          flexShrink: 0
                        }}>
                          {isSelected && <span style={{ color: 'white', fontSize: 12 }}>✓</span>}
                        </div>
                        
                        {/* Solo el nombre del servicio */}
                        <div style={{ 
                          fontWeight: isSelected ? 600 : 500, 
                          fontSize: 14, 
                          color: colors.text,
                          lineHeight: 1.3,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {service.name}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Info tip */}
              <div style={{
                marginTop: 20,
                padding: '12px 16px',
                background: '#f0f9ff',
                borderRadius: 8,
                borderLeft: '4px solid #0ea5e9'
              }}>
                <p style={{ margin: 0, fontSize: 13, color: '#0369a1' }}>
                  💡 <strong>Consejo:</strong> Si no asignas ningún servicio al empleado, 
                  podrá realizar todos los servicios por defecto. Asigna servicios específicos 
                  para limitar qué puede hacer.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div style={{
              padding: '16px 24px',
              borderTop: `1px solid ${colors.border}`,
              display: 'flex',
              gap: 12,
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={closeServicesModal}
                style={{
                  padding: '10px 20px',
                  borderRadius: 8,
                  border: `1px solid ${colors.border}`,
                  background: colors.bg,
                  color: colors.text,
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveServices}
                disabled={savingServices || loadingServices}
                style={{
                  padding: '10px 20px',
                  borderRadius: 8,
                  border: 'none',
                  background: 'var(--primary)',
                  color: 'white',
                  cursor: savingServices || loadingServices ? 'not-allowed' : 'pointer',
                  fontWeight: 600,
                  opacity: savingServices || loadingServices ? 0.7 : 1
                }}
              >
                {savingServices ? 'Guardando...' : '💾 Guardar servicios'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

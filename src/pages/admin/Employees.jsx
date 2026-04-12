import { useState, useEffect } from 'react';
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

  const handleDelete = async (emp) => {
    if (!confirm(`¿Eliminar a ${emp.User?.name}?`)) return;
    try {
      await api.delete(`/employees/${emp.id}`);
      load();
    } catch (e) {
      setError('Error al eliminar');
    }
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
      <div style={{ marginBottom: 20 }}>
        <button
          onClick={openCreate}
          className="btn-primary"
          style={{ width: isMobile ? '100%' : 'auto' }}
        >
          ➕ Nuevo empleado
        </button>
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
            { label: '✏️ Editar', onClick: openEdit, color: 'var(--primary)' },
            { label: '🗑️ Eliminar', onClick: handleDelete, color: 'var(--danger)' }
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
    </AdminLayout>
  );
}

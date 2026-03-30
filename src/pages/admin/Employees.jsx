import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/client';
import AdminLayout from '../../components/AdminLayout';
import ResponsiveTable from '../../components/ResponsiveTable';
import ResponsiveForm from '../../components/ResponsiveForm';
import { Upload } from 'lucide-react';

export default function Employees() {
  const { business } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editEmp, setEditEmp] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', password: '', commissionPct: 0, ownerPct: 100, photoUrl: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [uploading, setUploading] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const load = async () => {
    if (!business?.id) return;
    setLoading(true);
    try {
      const res = await api.get(`/employees?businessId=${business.id}`);
      setEmployees(res.data);
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

  const openCreate = () => {
    setEditEmp(null);
    setForm({ name: '', email: '', password: '', commissionPct: 0, ownerPct: 100, photoUrl: '' });
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
      photoUrl: emp.photoUrl || ''
    });
    setPhotoPreview(emp.photoUrl ? emp.photoUrl : null);
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
          photoUrl: form.photoUrl
        });
        setSuccess('Empleado actualizado');
      } else {
        await api.post('/employees', {
          name: form.name,
          email: form.email,
          password: form.password,
          commissionPct: form.commissionPct,
          businessId: business.id,
          photoUrl: form.photoUrl
        });
        setSuccess('Empleado creado');
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
          data={employees}
          actions={[
            { label: '✏️ Editar', onClick: openEdit, color: 'var(--primary)' },
            { label: '🗑️ Eliminar', onClick: handleDelete, color: 'var(--danger)' }
          ]}
          loading={loading}
          emptyMessage="No hay empleados. ¡Crea uno para empezar!"
        />
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
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
                      background: 'var(--gray-100)',
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
                    value: form.name,
                    onChange: e => setForm({ ...form, name: e.target.value }),
                    fullWidth: true
                  },
                  {
                    name: 'email',
                    label: 'Email',
                    type: 'email',
                    required: true,
                    value: form.email,
                    onChange: e => setForm({ ...form, email: e.target.value }),
                    fullWidth: true
                  },
                  ...(editEmp
                    ? []
                    : [
                      {
                        name: 'password',
                        label: 'Contraseña',
                        type: 'password',
                        required: true,
                        value: form.password,
                        onChange: e => setForm({ ...form, password: e.target.value }),
                        fullWidth: true
                      }
                    ]),
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
                    label: 'Para el negocio (%)',
                    type: 'number',
                    disabled: true,
                    value: form.ownerPct,
                    fullWidth: true
                  }
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

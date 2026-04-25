import { useState, useEffect } from 'react';
import { Upload } from 'lucide-react';
import ResponsiveForm from '../../../../components/ResponsiveForm';

const initialFormState = {
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
};

export default function EmployeeModal({
  isOpen,
  onClose,
  employee,
  business,
  branches,
  isTechnicalBusiness,
  subscriptionInfo,
  onSave,
  onUploadPhoto,
  error,
  success,
  saving
}) {
  const [form, setForm] = useState(initialFormState);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [selectedBusinessId, setSelectedBusinessId] = useState(business?.id || '');

  useEffect(() => {
    if (isOpen) {
      if (employee) {
        // Edit mode
        setForm({
          name: employee.User?.name || '',
          email: employee.User?.email || '',
          password: '',
          commissionPct: employee.commissionPct,
          ownerPct: employee.ownerPct,
          photoUrl: employee.photoUrl || '',
          description: employee.description || '',
          specialty: employee.specialty || '',
          isManager: employee.isManager || false,
          role: employee.User?.role || 'employee'
        });
        setSelectedBusinessId(employee.businessId);
        setPhotoPreview(employee.photoUrl ? getImgUrl(employee.photoUrl) : null);
      } else {
        // Create mode
        setForm(initialFormState);
        setSelectedBusinessId(business?.id || '');
        setPhotoPreview(null);
      }
    }
  }, [isOpen, employee, business?.id]);

  const handleCommissionChange = (val) => {
    const pct = Math.min(100, Math.max(0, parseFloat(val) || 0));
    setForm(f => ({ ...f, commissionPct: pct, ownerPct: parseFloat((100 - pct).toFixed(2)) }));
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const result = await onUploadPhoto(file);
    
    if (result.success) {
      setForm(f => ({ ...f, photoUrl: result.path }));
      
      const reader = new FileReader();
      reader.onload = (event) => {
        setPhotoPreview(event.target.result);
      };
      reader.readAsDataURL(file);
    }
    setUploading(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('EmployeeModal - handleSubmit llamado', { form, selectedBusinessId, employeeId: employee?.id });
    onSave({
      ...form,
      businessId: selectedBusinessId
    }, employee?.id);
  };

  const handleClose = () => {
    setPhotoPreview(null);
    setUploading(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            {employee ? '✏️ Editar empleado' : '➕ Nuevo empleado'}
          </div>
          <button
            onClick={handleClose}
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
                  background: 'var(--bg-tertiary)',
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
            fields={buildFormFields({
              form,
              setForm,
              employee,
              isTechnicalBusiness,
              business,
              branches,
              selectedBusinessId,
              setSelectedBusinessId,
              handleCommissionChange
            })}
            onSubmit={handleSubmit}
            submitText={employee ? '💾 Actualizar' : '✅ Crear empleado'}
            error={error}
            success={success}
            columns={1}
          />
        </div>
      </div>
    </div>
  );
}

function buildFormFields({
  form,
  setForm,
  employee,
  isTechnicalBusiness,
  business,
  branches,
  selectedBusinessId,
  setSelectedBusinessId,
  handleCommissionChange
}) {
  const fields = [
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
    }
  ];

  // Password field only for new employees
  if (!employee) {
    fields.push({
      name: 'password',
      label: 'Contraseña',
      type: 'password',
      required: true,
      placeholder: 'Mínimo 6 caracteres',
      value: form.password,
      onChange: e => setForm({ ...form, password: e.target.value }),
      fullWidth: true
    });
  }

  // Commission fields only for non-technical businesses
  if (!isTechnicalBusiness) {
    fields.push(
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
        onChange: () => {},
        disabled: true,
        fullWidth: true
      }
    );
  }

  // Role selection
  fields.push({
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
  });

  // Manager selection
  fields.push({
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
        commissionPct: isMgr ? 0 : form.commissionPct,
        ownerPct: isMgr ? 100 : form.ownerPct
      });
    },
    fullWidth: true,
    hint: 'Si activas esto, este usuario podrá administrar toda la sede y entrará directamente al Dashboard administrativo.'
  });

  // Branch selection for main businesses with branches
  if (!business?.isBranch && branches.length > 0) {
    fields.push({
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
    });
  }

  return fields;
}

// Helper function to get image URL (duplicated here for independence)
function getImgUrl(url) {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  
  const API_BASE_URL = 'https://api-reservas.k-dice.com';
  const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const BACKEND_URL = isLocal ? 'http://localhost:4000' : API_BASE_URL;
  
  const cleanUrl = url.startsWith('/') ? url : `/${url}`;
  return `${BACKEND_URL}${cleanUrl}`;
}

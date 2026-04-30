import { useEffect, useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import api from '../../api/client';
import { 
  User, 
  Camera, 
  Briefcase, 
  FileText,
  Save,
  Star,
  Users,
  Award,
  Loader2,
  Upload,
  X,
  Image as ImageIcon
} from 'lucide-react';

export default function EmployeeProfile() {
  const { user } = useAuth();
  const { colors } = useTheme();
  
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    specialty: '',
    description: '',
    photoUrl: ''
  });
  
  const [previousPhotoUrl, setPreviousPhotoUrl] = useState(''); // Guardar foto anterior para eliminarla
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);
  
  // Constantes para compresión
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  const MAX_WIDTH = 800; // Ancho máximo para fotos de perfil
  const MAX_HEIGHT = 800; // Alto máximo
  const JPEG_QUALITY = 0.8; // Calidad JPEG (0-1)
  
  // Función para eliminar imagen de Cloudinary
  const deleteImageFromCloudinary = async (url) => {
    if (!url || !url.includes('cloudinary.com')) return;
    try {
      await api.delete('/upload/image', { data: { url } });
      console.log('🗑️ Imagen anterior eliminada de Cloudinary');
    } catch (err) {
      // No mostrar error al usuario, solo loggear
      console.error('Error al eliminar imagen anterior:', err);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/employees/me/info');
      setProfile(res.data);
      const photoUrl = res.data.photoUrl || '';
      setFormData({
        specialty: res.data.specialty || '',
        description: res.data.description || '',
        photoUrl: photoUrl
      });
      // Guardar la foto actual como "anterior" para poder eliminarla después
      setPreviousPhotoUrl(photoUrl);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al cargar perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError('');
      setSuccess('');
      
      const res = await api.put('/employees/me/profile', formData);
      setProfile(prev => ({ ...prev, ...res.data.employee }));
      // Sincronizar la foto "anterior" con la actual después de guardar
      setPreviousPhotoUrl(formData.photoUrl);
      setSuccess('Perfil actualizado correctamente');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar cambios');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  // Función para comprimir imagen antes de subir
  const compressImage = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          // Calcular nuevas dimensiones manteniendo proporción
          let { width, height } = img;
          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);

          // Convertir a Blob con compresión
          canvas.toBlob(
            (blob) => {
              if (blob) {
                // Crear nuevo archivo con el blob comprimido
                const compressedFile = new File([blob], file.name, {
                  type: 'image/jpeg',
                  lastModified: Date.now()
                });
                resolve(compressedFile);
              } else {
                reject(new Error('Error al comprimir imagen'));
              }
            },
            'image/jpeg',
            JPEG_QUALITY
          );
        };
        img.onerror = () => reject(new Error('Error al cargar imagen'));
      };
      reader.onerror = () => reject(new Error('Error al leer archivo'));
    });
  };

  // Manejar selección de archivo
  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      setError('Por favor selecciona una imagen válida (JPG, PNG)');
      return;
    }

    // Validar tamaño
    if (file.size > MAX_FILE_SIZE) {
      setError('La imagen es muy grande. Máximo 5MB permitido.');
      return;
    }

    try {
      setUploadingPhoto(true);
      setUploadProgress(0);
      setError('');

      // Comprimir imagen
      const compressedFile = await compressImage(file);
      
      // Crear FormData para subida
      const formDataUpload = new FormData();
      formDataUpload.append('image', compressedFile);

      // Subir a Cloudinary vía backend
      const res = await api.post('/upload', formDataUpload, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(progress);
        }
      });

      // Guardar URL anterior antes de actualizar
      const oldPhotoUrl = previousPhotoUrl;
      
      // Actualizar el formulario con la nueva URL
      setFormData(prev => ({ ...prev, photoUrl: res.data.url }));
      // Actualizar la "foto anterior" ahora es la nueva
      setPreviousPhotoUrl(res.data.url);
      
      // Eliminar la foto anterior de Cloudinary (si existe y es diferente)
      if (oldPhotoUrl && oldPhotoUrl !== res.data.url) {
        await deleteImageFromCloudinary(oldPhotoUrl);
      }
      
      setSuccess('Foto subida correctamente');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al subir la foto. Intenta de nuevo.');
    } finally {
      setUploadingPhoto(false);
      setUploadProgress(0);
      // Limpiar input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Eliminar foto
  const handleRemovePhoto = async () => {
    const urlToDelete = formData.photoUrl;
    
    // Eliminar de Cloudinary primero
    if (urlToDelete) {
      await deleteImageFromCloudinary(urlToDelete);
    }
    
    // Limpiar del formulario y del estado de "anterior"
    setFormData(prev => ({ ...prev, photoUrl: '' }));
    setPreviousPhotoUrl('');
  };

  // Trigger file input click
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // Drag and drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        // Simular evento de cambio de archivo
        const syntheticEvent = { target: { files: [file] } };
        handleFileSelect(syntheticEvent);
      } else {
        setError('Por favor arrastra solo imágenes (JPG, PNG, WebP)');
      }
    }
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ textAlign: 'center' }}>
          <Loader2 size={40} className="spin" style={{ animation: 'spin 1s linear infinite', color: colors.primary }} />
          <p style={{ marginTop: 16, color: colors.textSecondary }}>Cargando perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '24px 16px' }}>
        {error && (
          <div style={{
            background: colors.isDark ? '#7f1d1d' : '#fed7d7',
            color: colors.isDark ? '#fca5a5' : '#c53030',
            padding: 16,
            borderRadius: 8,
            marginBottom: 24,
            border: `1px solid ${colors.isDark ? '#dc2626' : '#fc8181'}`
          }}>
            {error}
          </div>
        )}

        {success && (
          <div style={{
            background: colors.isDark ? '#064e3b' : '#d1fae5',
            color: colors.isDark ? '#6ee7b7' : '#059669',
            padding: 16,
            borderRadius: 8,
            marginBottom: 24,
            border: `1px solid ${colors.isDark ? '#10b981' : '#34d399'}`
          }}>
            {success}
          </div>
        )}

        {/* Foto de perfil */}
        <div style={{
          background: colors.cardBg,
          padding: 24,
          borderRadius: 12,
          boxShadow: `0 2px 8px ${colors.shadow}`,
          border: `1px solid ${colors.border}`,
          marginBottom: 24,
          textAlign: 'center'
        }}>
          <div style={{
            width: 120,
            height: 120,
            borderRadius: '50%',
            background: formData.photoUrl ? 'transparent' : colors.gradient,
            margin: '0 auto 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            border: `3px solid ${colors.primary}`,
            position: 'relative'
          }}>
            {formData.photoUrl ? (
              <img 
                src={formData.photoUrl} 
                alt={profile?.user?.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentElement.innerHTML = getInitials(profile?.user?.name);
                  e.target.parentElement.style.color = 'white';
                  e.target.parentElement.style.fontSize = '36px';
                  e.target.parentElement.style.fontWeight = '700';
                }}
              />
            ) : (
              <span style={{ color: 'white', fontSize: 36, fontWeight: 700 }}>
                {getInitials(profile?.user?.name)}
              </span>
            )}
          </div>
          
          <h2 style={{ fontSize: 20, fontWeight: 700, color: colors.text, marginBottom: 4 }}>
            {profile?.user?.name}
          </h2>
          <p style={{ fontSize: 14, color: colors.textSecondary, marginBottom: 16 }}>
            {profile?.business?.name}
          </p>
          
          {profile?.specialty && (
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: colors.primary + '15',
              color: colors.primary,
              padding: '6px 12px',
              borderRadius: 20,
              fontSize: 13,
              fontWeight: 600
            }}>
              <Briefcase size={14} />
              {profile.specialty}
            </div>
          )}
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} style={{
          background: colors.cardBg,
          padding: 24,
          borderRadius: 12,
          boxShadow: `0 2px 8px ${colors.shadow}`,
          border: `1px solid ${colors.border}`,
          marginBottom: 24
        }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: colors.text, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
            <User size={20} color={colors.primary} />
            Información Personal
          </h3>

          {/* Input de archivo oculto */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept="image/jpeg,image/png,image/webp"
            style={{ display: 'none' }}
          />

          {/* Área de subida de foto */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: colors.text, marginBottom: 12 }}>
              Foto de Perfil
            </label>
            
            <div 
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => {
                if (!uploadingPhoto && !formData.photoUrl) {
                  triggerFileInput();
                }
              }}
              style={{
                border: `2px dashed ${uploadingPhoto ? colors.primary : colors.border}`,
                borderRadius: 12,
                padding: 24,
                background: colors.bg,
                textAlign: 'center',
                transition: 'all 0.2s ease',
                cursor: !uploadingPhoto && !formData.photoUrl ? 'pointer' : 'default'
              }}
            >
              {uploadingPhoto ? (
                <div>
                  <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', color: colors.primary, margin: '0 auto 12px' }} />
                  <p style={{ fontSize: 14, color: colors.text, marginBottom: 8 }}>Subiendo foto...</p>
                  <div style={{
                    width: '100%',
                    height: 6,
                    background: colors.bgSecondary,
                    borderRadius: 3,
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: `${uploadProgress}%`,
                      height: '100%',
                      background: colors.primary,
                      transition: 'width 0.3s ease'
                    }} />
                  </div>
                  <p style={{ fontSize: 12, color: colors.textMuted, marginTop: 8 }}>{uploadProgress}%</p>
                </div>
              ) : formData.photoUrl ? (
                <div>
                  <div style={{
                    width: 100,
                    height: 100,
                    borderRadius: '50%',
                    margin: '0 auto 16px',
                    overflow: 'hidden',
                    border: `3px solid ${colors.primary}`
                  }}>
                    <img 
                      src={formData.photoUrl} 
                      alt="Foto de perfil"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                  <p style={{ fontSize: 13, color: colors.textSecondary, marginBottom: 12 }}>
                    ✓ Foto subida correctamente
                  </p>
                  <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                    <button
                      type="button"
                      onClick={triggerFileInput}
                      style={{
                        padding: '10px 16px',
                        borderRadius: 8,
                        border: `1px solid ${colors.border}`,
                        background: colors.cardBg,
                        color: colors.text,
                        fontSize: 13,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6
                      }}
                    >
                      <Upload size={16} />
                      Cambiar foto
                    </button>
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      style={{
                        padding: '10px 16px',
                        borderRadius: 8,
                        border: `1px solid ${colors.isDark ? '#dc2626' : '#fca5a5'}`,
                        background: colors.isDark ? '#7f1d1d' : '#fef2f2',
                        color: colors.isDark ? '#fca5a5' : '#dc2626',
                        fontSize: 13,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6
                      }}
                    >
                      <X size={16} />
                      Eliminar
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div style={{
                    width: 64,
                    height: 64,
                    borderRadius: '50%',
                    background: colors.bgSecondary,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px'
                  }}>
                    <ImageIcon size={28} color={colors.textSecondary} />
                  </div>
                  <p style={{ fontSize: 14, color: colors.text, marginBottom: 8 }}>
                    Arrastra una foto aquí o haz clic para seleccionar
                  </p>
                  <p style={{ fontSize: 12, color: colors.textMuted, marginBottom: 16 }}>
                    JPG, PNG o WebP. Máximo 5MB. Se comprimirá automáticamente.
                  </p>
                  <button
                    type="button"
                    onClick={triggerFileInput}
                    style={{
                      padding: '12px 24px',
                      borderRadius: 8,
                      border: 'none',
                      background: colors.gradient,
                      color: 'white',
                      fontSize: 14,
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 8
                    }}
                  >
                    <Camera size={18} />
                    Seleccionar Foto
                  </button>
                </div>
              )}
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: colors.text, marginBottom: 6 }}>
              Especialidad / Cargo
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Briefcase size={18} color={colors.textSecondary} style={{ position: 'absolute', marginLeft: 12 }} />
              <input
                type="text"
                name="specialty"
                value={formData.specialty}
                onChange={handleChange}
                placeholder="Ej: Manicurista, Barbero, Estilista..."
                style={{
                  width: '100%',
                  padding: '12px 16px 12px 40px',
                  borderRadius: 8,
                  border: `1px solid ${colors.border}`,
                  background: colors.bg,
                  color: colors.text,
                  fontSize: 14,
                  outline: 'none'
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: colors.text, marginBottom: 6 }}>
              Descripción Empleado
            </label>
            <div style={{ position: 'relative' }}>
              <FileText size={18} color={colors.textSecondary} style={{ position: 'absolute', top: 12, left: 12 }} />
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe tu experiencia, habilidades y servicios que ofreces..."
                rows={4}
                style={{
                  width: '100%',
                  padding: '12px 16px 12px 40px',
                  borderRadius: 8,
                  border: `1px solid ${colors.border}`,
                  background: colors.bg,
                  color: colors.text,
                  fontSize: 14,
                  outline: 'none',
                  resize: 'vertical',
                  minHeight: 100
                }}
              />
            </div>
            <p style={{ fontSize: 12, color: colors.textMuted, marginTop: 4 }}>
              Esta descripción será visible para los clientes en tu perfil público
            </p>
          </div>

          <button
            type="submit"
            disabled={saving}
            style={{
              width: '100%',
              padding: '14px 24px',
              borderRadius: 8,
              border: 'none',
              background: colors.gradient,
              color: 'white',
              fontSize: 15,
              fontWeight: 700,
              cursor: saving ? 'not-allowed' : 'pointer',
              opacity: saving ? 0.7 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8
            }}
          >
            {saving ? (
              <>
                <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                Guardando...
              </>
            ) : (
              <>
                <Save size={18} />
                Guardar Cambios
              </>
            )}
          </button>
        </form>

        {/* Estadísticas rápidas */}
        {profile && (
          <div style={{
            background: colors.cardBg,
            padding: 24,
            borderRadius: 12,
            boxShadow: `0 2px 8px ${colors.shadow}`,
            border: `1px solid ${colors.border}`
          }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: colors.text, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Award size={20} color={colors.primary} />
              Mi Actividad
            </h3>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
              gap: 16
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  background: `${colors.primary}15`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 8px'
                }}>
                  <Briefcase size={24} color={colors.primary} />
                </div>
                <div style={{ fontSize: 20, fontWeight: 800, color: colors.text }}>
                  {profile.services?.length || 0}
                </div>
                <div style={{ fontSize: 12, color: colors.textSecondary }}>
                  Servicios
                </div>
              </div>

              {!profile.business?.isTechnicalServices && (
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    width: 48,
                    height: 48,
                    borderRadius: 12,
                    background: '#f59e0b15',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 8px'
                  }}>
                    <Star size={24} color="#f59e0b" />
                  </div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: colors.text }}>
                    {profile.commissionPct || 0}%
                  </div>
                  <div style={{ fontSize: 12, color: colors.textSecondary }}>
                    Comisión
                  </div>
                </div>
              )}

              <div style={{ textAlign: 'center' }}>
                <div style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  background: '#10b98115',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 8px'
                }}>
                  <Users size={24} color="#10b981" />
                </div>
                <div style={{ fontSize: 20, fontWeight: 800, color: colors.text }}>
                  {profile.isManager ? 'Sí' : 'No'}
                </div>
                <div style={{ fontSize: 12, color: colors.textSecondary }}>
                  Manager
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
  );
}

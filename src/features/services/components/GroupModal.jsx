/**
 * Group management modal component
 */
import { useRef } from 'react';
import { Camera, X, Loader2, FolderOpen, Plus } from 'lucide-react';

// URL base para imágenes
const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const BACKEND_URL = isLocal ? 'http://localhost:4000' : 'https://api-reservas.k-dice.com';

function getImgUrl(url, api) {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  const cleanUrl = url.startsWith('/') ? url : `/${url}`;
  const base = (api?.defaults?.baseURL && !api.defaults.baseURL.startsWith('/')) 
    ? api.defaults.baseURL.replace('/api', '') 
    : BACKEND_URL;
  return `${base}${cleanUrl}`;
}

export function GroupModal({
  isOpen,
  onClose,
  api,
  serviceGroups,
  groupForm,
  setGroupForm,
  editingGroupId,
  setEditingGroupId,
  uploadingGroupImage,
  onGroupFileChange,
  onSaveGroup,
  onEditGroup,
  onDeleteGroup
}) {
  const groupFileInputRef = useRef(null);

  if (!isOpen) return null;

  const resetForm = () => {
    setEditingGroupId(null);
    onClose();
  };

  return (
    <div
      className="modal-overlay"
      onClick={resetForm}
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
        {/* Header */}
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
            onClick={resetForm}
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
          <form onSubmit={onSaveGroup} style={{ marginBottom: 28 }}>
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
                      src={getImgUrl(groupForm.imageUrl, api)}
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
                onChange={onGroupFileChange}
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
                {editingGroupId ? 'Actualizar Grupo' : 'Crear Grupo'}
              </button>
              {editingGroupId && (
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => {
                    setEditingGroupId(null);
                    setGroupForm({ name: '', description: '', imageUrl: '', order: 0 });
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
                        src={getImgUrl(group.imageUrl, api)}
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
                        onClick={() => onEditGroup(group)}
                        className="btn-ghost btn-sm"
                        style={{ padding: 6 }}
                        title="Editar"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => onDeleteGroup(group.id)}
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
  );
}

export default GroupModal;

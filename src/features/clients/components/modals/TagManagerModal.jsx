import { useState } from 'react';
import { Tag, X, Plus, Edit2, Trash2 } from 'lucide-react';
import { TAG_COLORS } from '../../constants';

export function TagManagerModal({ 
  availableTags, 
  colors, 
  onClose, 
  onSave, 
  onDelete,
  isOpen
}) {
  if (!isOpen) return null;

  const [editingTag, setEditingTag] = useState(null);
  const [tagForm, setTagForm] = useState({ name: '', color: TAG_COLORS[0], description: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await onSave(tagForm, editingTag);
    if (result.success) {
      setTagForm({ name: '', color: TAG_COLORS[0], description: '' });
      setEditingTag(null);
    }
  };

  const handleEdit = (tag) => {
    setEditingTag(tag);
    setTagForm({
      name: tag.name,
      color: tag.color,
      description: tag.description || ''
    });
  };

  const handleCancelEdit = () => {
    setEditingTag(null);
    setTagForm({ name: '', color: TAG_COLORS[0], description: '' });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 500, maxHeight: '85vh' }}>
        <div style={{
          padding: '20px 24px',
          background: colors?.primary || '#667eea',
          color: 'white',
          borderRadius: '16px 16px 0 0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: 'white' }}>
              <Tag size={22} style={{ display: 'inline', marginRight: 10, verticalAlign: 'middle' }} />
              Gestionar Etiquetas
            </h3>
            <p style={{ margin: '4px 0 0', fontSize: 13, opacity: 0.9 }}>
              Crea y administra etiquetas para tus clientes
            </p>
          </div>
          <button
            onClick={onClose}
            className="btn-ghost btn-icon"
            style={{
              background: 'rgba(255,255,255,0.2)',
              color: 'white',
              borderRadius: '50%',
              width: 36,
              height: 36
            }}
          >
            <X size={20} />
          </button>
        </div>

        <div style={{ padding: 24, overflow: 'auto', maxHeight: 'calc(85vh - 80px)' }}>
          <form onSubmit={handleSubmit} style={{ marginBottom: 28 }}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8, color: 'var(--text)' }}>
                Nombre de la etiqueta *
              </label>
              <input
                type="text"
                value={tagForm.name}
                onChange={(e) => setTagForm({ ...tagForm, name: e.target.value })}
                placeholder="Ej: VIP, Nuevo, Frecuente..."
                required
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: 10,
                  border: '2px solid var(--border)',
                  fontSize: 15,
                  background: 'var(--bg)',
                  color: 'var(--text)'
                }}
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 10, color: 'var(--text)' }}>
                Color
              </label>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', padding: 12, background: 'var(--bg)', borderRadius: 10, border: '2px solid var(--border)' }}>
                {TAG_COLORS.map((color, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setTagForm({ ...tagForm, color })}
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      background: color,
                      border: tagForm.color === color ? '3px solid var(--text)' : '3px solid transparent',
                      cursor: 'pointer',
                      boxShadow: tagForm.color === color ? '0 0 0 2px white, 0 0 0 4px ' + color : 'none'
                    }}
                  />
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8, color: 'var(--text)' }}>
                Descripción (opcional)
              </label>
              <textarea
                value={tagForm.description}
                onChange={(e) => setTagForm({ ...tagForm, description: e.target.value })}
                placeholder="Descripción de la etiqueta..."
                rows={2}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: 10,
                  border: '2px solid var(--border)',
                  fontSize: 15,
                  background: 'var(--bg)',
                  color: 'var(--text)',
                  resize: 'vertical'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button type="submit" className="btn-primary" style={{ flex: 1 }}>
                <Plus size={18} />
                {editingTag ? 'Actualizar Etiqueta' : 'Crear Etiqueta'}
              </button>
              {editingTag && (
                <button type="button" className="btn-secondary" onClick={handleCancelEdit}>
                  Cancelar
                </button>
              )}
            </div>
          </form>

          <div>
            <h4 style={{ margin: '0 0 16px', fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>
              Etiquetas existentes ({availableTags.length})
            </h4>
            {availableTags.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 32, background: 'var(--bg)', borderRadius: 12, border: '2px dashed var(--border)' }}>
                <Tag size={32} color="var(--text-muted)" style={{ marginBottom: 8, opacity: 0.5 }} />
                <p style={{ color: 'var(--text-muted)', fontSize: 14, margin: 0 }}>No hay etiquetas creadas aún</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {availableTags.map((tag) => (
                  <div
                    key={tag.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '14px 16px',
                      borderRadius: 12,
                      border: '2px solid var(--border)',
                      background: 'var(--bg)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{ width: 20, height: 20, borderRadius: 6, background: tag.color }} />
                      <span style={{ fontWeight: 600, fontSize: 15, color: 'var(--text)' }}>{tag.name}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn-ghost btn-sm" onClick={() => handleEdit(tag)}>
                        <Edit2 size={16} /> Editar
                      </button>
                      <button className="btn-danger btn-sm" onClick={() => onDelete(tag.id)}>
                        <Trash2 size={16} /> Eliminar
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

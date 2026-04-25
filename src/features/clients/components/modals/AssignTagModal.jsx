import { Tag, User, X } from 'lucide-react';

export function AssignTagModal({ 
  client, 
  availableTags, 
  colors, 
  onClose, 
  onAssign, 
  onRemove 
}) {
  if (!client) return null;

  const availableToAssign = availableTags.filter(
    tag => !client.tags?.some(t => t.id === tag.id)
  );

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 450, maxHeight: '80vh' }}>
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
              <User size={22} style={{ display: 'inline', marginRight: 10, verticalAlign: 'middle' }} />
              Etiquetas de {client.name}
            </h3>
            <p style={{ margin: '4px 0 0', fontSize: 13, opacity: 0.9 }}>
              Gestiona las etiquetas de este cliente
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

        <div style={{ padding: 24, overflow: 'auto', maxHeight: 'calc(80vh - 80px)' }}>
          <div style={{ marginBottom: 28 }}>
            <h4 style={{ margin: '0 0 16px', fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>
              Etiquetas actuales ({client.tags?.length || 0})
            </h4>
            {client.tags?.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 24, background: 'var(--bg)', borderRadius: 12, border: '2px dashed var(--border)' }}>
                <Tag size={28} color="var(--text-muted)" style={{ marginBottom: 8, opacity: 0.5 }} />
                <p style={{ color: 'var(--text-muted)', fontSize: 14, margin: 0 }}>Sin etiquetas asignadas</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                {client.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '8px 14px',
                      borderRadius: 20,
                      background: tag.color + '20',
                      color: tag.color,
                      fontSize: 14,
                      fontWeight: 600,
                      border: '2px solid ' + tag.color + '40'
                    }}
                  >
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: tag.color }} />
                    {tag.name}
                    <button
                      onClick={() => onRemove(tag.assignmentId)}
                      style={{
                        background: tag.color + '30',
                        border: 'none',
                        padding: 4,
                        cursor: 'pointer',
                        color: tag.color,
                        borderRadius: '50%',
                        marginLeft: 4
                      }}
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div>
            <h4 style={{ margin: '0 0 16px', fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>
              Agregar etiqueta
            </h4>
            {availableTags.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 24, background: 'var(--bg)', borderRadius: 12, border: '2px dashed var(--border)' }}>
                <p style={{ color: 'var(--text-muted)', fontSize: 14, margin: 0 }}>
                  Primero crea etiquetas en "Gestionar etiquetas"
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {availableToAssign.map((tag) => (
                  <button
                    key={tag.id}
                    onClick={() => onAssign(tag.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '14px 16px',
                      borderRadius: 12,
                      border: '2px solid var(--border)',
                      background: 'var(--bg)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = tag.color;
                      e.currentTarget.style.background = tag.color + '10';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border)';
                      e.currentTarget.style.background = 'var(--bg)';
                    }}
                  >
                    <span style={{ width: 20, height: 20, borderRadius: 6, background: tag.color }} />
                    <span style={{ fontWeight: 600, fontSize: 15, color: 'var(--text)' }}>{tag.name}</span>
                  </button>
                ))}
                {availableToAssign.length === 0 && (
                  <div style={{ textAlign: 'center', padding: 20, background: 'var(--bg)', borderRadius: 12, border: '2px dashed var(--border)' }}>
                    <p style={{ color: 'var(--text-muted)', fontSize: 14, margin: 0 }}>
                      Todas las etiquetas ya están asignadas
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

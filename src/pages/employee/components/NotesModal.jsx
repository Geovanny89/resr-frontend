import { X } from 'lucide-react';

export const NotesModal = ({ show, colors, notesAppointment, notes, loadingNotes, newNoteContent, setNewNoteContent, savingNote, deleteNoteConfirm, deletingNote, onClose, onAddNote, onDeleteNoteClick, onDeleteNoteConfirm }) => {
  if (!show || !notesAppointment) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', zIndex: 3000
    }}>
      <div style={{
        background: colors.cardBg, borderRadius: '16px', padding: '28px',
        maxWidth: '480px', width: '90%', maxHeight: '70vh', overflowY: 'auto',
        border: `1px solid ${colors.border}`
      }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8, color: colors.text }}>
          📝 Notas de la Cita
        </h2>
        <p style={{ fontSize: 14, color: colors.textSecondary, marginBottom: 20 }}>
          {notesAppointment.clientName} • {notesAppointment.Service?.name}
        </p>

        {/* Lista de notas */}
        <div style={{ marginBottom: 20, maxHeight: 200, overflowY: 'auto' }}>
          {loadingNotes ? (
            <div style={{ textAlign: 'center', padding: 20, color: colors.textSecondary }}>Cargando...</div>
          ) : notes.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 20, color: colors.textSecondary, fontStyle: 'italic' }}>
              No hay notas registradas
            </div>
          ) : (
            notes.map((note) => (
              <div key={note.id} style={{
                background: colors.bgSecondary,
                padding: 12,
                borderRadius: 8,
                marginBottom: 8,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                gap: 8
              }}>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontSize: 14, color: colors.text, whiteSpace: 'pre-wrap' }}>{note.content}</p>
                  <div style={{ marginTop: 6, fontSize: 11, color: colors.textMuted }}>
                    {note.authorName || 'Sistema'} • {new Date(note.createdAt).toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' })}
                  </div>
                </div>
                <button
                  onClick={() => onDeleteNoteClick(note.id)}
                  style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 4 }}
                >
                  <X size={16} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Agregar nueva nota */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: colors.text }}>
            Agregar nota
          </label>
          <textarea
            value={newNoteContent}
            onChange={(e) => setNewNoteContent(e.target.value)}
            placeholder="Escribe una nota..."
            rows={3}
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: 8,
              border: `1px solid ${colors.border}`,
              background: colors.inputBg,
              color: colors.text,
              resize: 'vertical'
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={onClose}
            style={{
              flex: 1, padding: '12px', borderRadius: 10,
              border: `1px solid ${colors.border}`,
              background: 'none',
              color: colors.text,
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Cerrar
          </button>
          <button
            onClick={onAddNote}
            disabled={savingNote || !newNoteContent.trim()}
            style={{
              flex: 1, padding: '12px', borderRadius: 10,
              border: 'none',
              background: '#14b8a6',
              color: 'white',
              fontWeight: 700,
              cursor: (savingNote || !newNoteContent.trim()) ? 'not-allowed' : 'pointer',
              opacity: (savingNote || !newNoteContent.trim()) ? 0.7 : 1
            }}
          >
            {savingNote ? 'Guardando...' : 'Agregar Nota'}
          </button>
        </div>
      </div>
    </div>
  );
};

export const DeleteNoteConfirmModal = ({ show, colors, deletingNote, onClose, onConfirm }) => {
  if (!show) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.6)',
        zIndex: 3500,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: colors.cardBg,
          borderRadius: 16,
          width: '100%',
          maxWidth: 420,
          boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
          textAlign: 'center'
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Icono */}
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            background: '#fee2e2',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '24px auto 16px',
            fontSize: 32
          }}
        >
          🗑️
        </div>

        {/* Título */}
        <h3
          style={{
            margin: '0 0 8px 0',
            fontSize: 20,
            fontWeight: 700,
            color: colors.text
          }}
        >
          ¿Eliminar esta nota?
        </h3>

        {/* Descripción */}
        <p
          style={{
            margin: '0 24px 24px',
            fontSize: 14,
            color: colors.textSecondary,
            lineHeight: 1.5
          }}
        >
          Esta acción no se puede deshacer.
        </p>

        {/* Botones */}
        <div
          style={{
            padding: '16px 24px 24px',
            display: 'flex',
            gap: 12,
            justifyContent: 'center'
          }}
        >
          <button
            onClick={onClose}
            disabled={deletingNote}
            style={{
              padding: '10px 20px',
              borderRadius: 8,
              border: `1px solid ${colors.border}`,
              background: colors.bg,
              color: colors.text,
              cursor: deletingNote ? 'not-allowed' : 'pointer',
              fontWeight: 600,
              opacity: deletingNote ? 0.6 : 1
            }}
          >
            No, cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={deletingNote}
            style={{
              padding: '10px 20px',
              borderRadius: 8,
              border: 'none',
              background: '#ef4444',
              color: 'white',
              cursor: deletingNote ? 'not-allowed' : 'pointer',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              opacity: deletingNote ? 0.6 : 1
            }}
          >
            {deletingNote ? (
              <>
                <span
                  style={{
                    width: 14,
                    height: 14,
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderTopColor: 'white',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite',
                    display: 'inline-block'
                  }}
                />
                Eliminando...
              </>
            ) : (
              'Sí, eliminar'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

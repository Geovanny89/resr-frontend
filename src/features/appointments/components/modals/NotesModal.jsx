/**
 * Modal para gestionar notas de cita
 * Extraído de Appointments.jsx
 */
import { useState, useEffect } from 'react';
import { X, MessageSquare } from 'lucide-react';

export function NotesModal({
  isOpen,
  onClose,
  appointment,
  onLoadNotes,
  onAddNote,
  onDeleteNote,
  isSaving,
  colors,
  onSuccess
}) {
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (isOpen && appointment) {
      loadNotes();
    }
  }, [isOpen, appointment]);

  const loadNotes = async () => {
    setLoading(true);
    try {
      const data = await onLoadNotes(appointment.id);
      setNotes(data);
    } catch (e) {
      console.error('[NotesModal] Error cargando notas:', e);
      setNotes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!newNote.trim()) return;

    setAdding(true);
    const noteContent = newNote.trim();
    
    const result = await onAddNote(appointment.id, noteContent);
    
    if (result.success) {
      // Agregar la nota devuelta por el backend al estado local
      setNotes(prev => [result.data, ...prev]);
      setNewNote('');
      onSuccess?.();
    } else {
      showStatus?.('Error al agregar nota', 'error');
    }
    
    setAdding(false);
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;

    setDeleting(true);
    const noteIdToDelete = deleteConfirm;
    
    // Eliminar la nota localmente de inmediato (optimistic update)
    setNotes(prev => prev.filter(note => note.id !== noteIdToDelete));
    setDeleteConfirm(null);
    
    const result = await onDeleteNote(appointment.id, noteIdToDelete);
    
    if (result.success) {
      onSuccess?.();
    } else {
      // Si falló, recargar para restaurar la nota
      await loadNotes();
    }
    setDeleting(false);
  };

  const handleClose = () => {
    setNotes([]);
    setNewNote('');
    setDeleteConfirm(null);
    onClose();
  };

  if (!isOpen || !appointment) return null;

  // Confirmación de eliminación
  if (deleteConfirm) {
    return (
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.6)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 20
        }}
        onClick={() => setDeleteConfirm(null)}
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
              onClick={() => setDeleteConfirm(null)}
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
              onClick={handleDelete}
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
  }

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', zIndex: 1000
    }}>
      <div style={{
        background: colors.cardBg, borderRadius: 12, padding: 24,
        maxWidth: 500, width: '90%', maxHeight: '80vh', overflowY: 'auto',
        border: `1px solid ${colors.border}`
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: colors.text }}>
            <MessageSquare size={20} style={{ marginRight: 8, display: 'inline' }} />
            Notas de la Cita
          </h2>
          <button onClick={handleClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: colors.textSecondary }}>
            <X size={24} />
          </button>
        </div>
        
        <p style={{ fontSize: 14, color: colors.textSecondary, marginBottom: 16 }}>
          Cliente: <strong>{appointment.clientName}</strong> • Servicio: {appointment.Service?.name}
        </p>

        {/* Lista de notas */}
        <div style={{ marginBottom: 20, maxHeight: 250, overflowY: 'auto' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: 20, color: colors.textSecondary }}>Cargando...</div>
          ) : notes.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 20, color: colors.textSecondary, fontStyle: 'italic' }}>
              No hay notas registradas
            </div>
          ) : (
            notes.map((note) => (
              <div key={note.id} style={{
                background: colors.bgSecondary, padding: 12, borderRadius: 8,
                marginBottom: 8, display: 'flex', justifyContent: 'space-between',
                alignItems: 'flex-start', gap: 8
              }}>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontSize: 14, color: colors.text, whiteSpace: 'pre-wrap' }}>{note.content}</p>
                  <div style={{ marginTop: 6, fontSize: 11, color: colors.textMuted }}>
                    Por {note.authorName || 'Sistema'} • {new Date(note.createdAt).toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' })}
                  </div>
                </div>
                <button
                  onClick={() => setDeleteConfirm(note.id)}
                  style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 4, fontSize: 12 }}
                >
                  <X size={16} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Nueva nota */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: colors.text }}>
            Agregar nueva nota
          </label>
          <textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Escribe una nota..."
            rows={3}
            style={{
              width: '100%', padding: 10, borderRadius: 8, border: `1px solid ${colors.border}`,
              background: colors.inputBg, color: colors.text, resize: 'vertical'
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button 
            onClick={handleClose} 
            style={{ flex: 1, padding: 10, borderRadius: 8, border: `1px solid ${colors.border}`, background: 'none', color: colors.text }}
          >
            Cerrar
          </button>
          <button 
            onClick={handleAdd} 
            disabled={adding || !newNote.trim()}
            style={{ 
              flex: 1, padding: 10, borderRadius: 8, border: 'none',
              background: '#14b8a6', color: 'white', fontWeight: 700,
              opacity: (adding || !newNote.trim()) ? 0.7 : 1, cursor: (adding || !newNote.trim()) ? 'not-allowed' : 'pointer'
            }}
          >
            {adding ? 'Guardando...' : 'Agregar Nota'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default NotesModal;

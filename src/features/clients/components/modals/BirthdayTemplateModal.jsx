import { useState, useEffect } from 'react';
import { Gift, X, Plus, Trash2, Save, CheckCircle2 } from 'lucide-react';
import api from '../../../../api/client';
import { useAuth } from '../../../../context/AuthContext';

export function BirthdayTemplateModal({ isOpen, onClose, colors }) {
  const { business } = useAuth();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [newContent, setNewContent] = useState('');
  const [status, setStatus] = useState(null);

  useEffect(() => {
    if (isOpen && business?.id) {
      loadTemplates();
    }
  }, [isOpen, business?.id]);

  const loadTemplates = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/appointments/birthday-templates?businessId=${business.id}`);
      setTemplates(res.data || []);
    } catch (e) {
      console.error('Error loading templates:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!newContent.trim()) return;

    setLoading(true);
    try {
      await api.post('/appointments/birthday-templates', {
        id: editingTemplate?.id,
        businessId: business.id,
        content: newContent.trim(),
        isActive: true
      });
      setNewContent('');
      setEditingTemplate(null);
      loadTemplates();
      setStatus({ type: 'success', text: 'Plantilla guardada correctamente' });
      setTimeout(() => setStatus(null), 3000);
    } catch (e) {
      setStatus({ type: 'error', text: e.response?.data?.error || 'Error al guardar' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/appointments/birthday-templates/${id}`);
      loadTemplates();
    } catch (e) {
      console.error('Error deleting template:', e);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center',
      justifyContent: 'center', zIndex: 1100, padding: 20
    }}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 600, width: '100%', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{
          padding: '20px 24px', background: colors?.primary || '#667eea',
          color: 'white', borderRadius: '16px 16px 0 0', display: 'flex',
          justifyContent: 'space-between', alignItems: 'center'
        }}>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>
            <Gift size={20} style={{ display: 'inline', marginRight: 10, verticalAlign: 'middle' }} />
            Plantillas de Cumpleaños
          </h3>
          <button onClick={onClose} className="btn-ghost btn-icon" style={{ color: 'white' }}><X size={20} /></button>
        </div>

        <div style={{ padding: 24, overflowY: 'auto', flex: 1 }}>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 20 }}>
            Crea hasta 10 mensajes diferentes. El sistema elegirá uno al azar para felicitar a tus clientes en su día.
          </p>

          <form onSubmit={handleSave} style={{ marginBottom: 30 }}>
            <div style={{ marginBottom: 12 }}>
              <textarea
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                placeholder="Escribe el mensaje de felicitación... (puedes usar el nombre del cliente pronto)"
                rows={3}
                style={{
                  width: '100%', padding: 12, borderRadius: 10, border: '2px solid var(--border)',
                  fontSize: 14, background: 'var(--bg)', color: 'var(--text)', resize: 'none'
                }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              {editingTemplate && (
                <button type="button" className="btn-secondary btn-sm" onClick={() => { setEditingTemplate(null); setNewContent(''); }}>
                  Cancelar
                </button>
              )}
              <button type="submit" className="btn-primary btn-sm" disabled={loading || !newContent.trim()}>
                {editingTemplate ? 'Actualizar' : 'Agregar Plantilla'}
              </button>
            </div>
          </form>

          {status && (
            <div style={{
              padding: '10px 15px', borderRadius: 8, marginBottom: 20,
              background: status.type === 'success' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
              color: status.type === 'success' ? '#16a34a' : '#dc2626',
              fontSize: 13, display: 'flex', alignItems: 'center', gap: 10
            }}>
              <CheckCircle2 size={16} /> {status.text}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {templates.length === 0 && !loading && (
              <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)', background: 'var(--bg-alt)', borderRadius: 12 }}>
                No hay plantillas creadas aún.
              </div>
            )}
            
            {templates.map(t => (
              <div key={t.id} style={{
                padding: 16, borderRadius: 12, border: '1px solid var(--border)',
                background: 'var(--bg-card)', position: 'relative', transition: 'all 0.2s'
              }}>
                <p style={{ margin: 0, fontSize: 14, color: 'var(--text)', whiteSpace: 'pre-wrap', marginBottom: 12 }}>
                  {t.content}
                </p>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 15 }}>
                  <button onClick={() => { setEditingTemplate(t); setNewContent(t.content); }} style={{ background: 'none', border: 'none', color: colors?.primary, cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', gap: 5 }}>
                    <Save size={14} /> Editar
                  </button>
                  <button onClick={() => handleDelete(t.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', gap: 5 }}>
                    <Trash2 size={14} /> Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

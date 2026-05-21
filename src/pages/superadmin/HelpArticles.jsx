import { useState, useEffect } from 'react';
import { 
  HelpCircle, Plus, Search, Edit2, Trash2, Image as ImageIcon, 
  X, Save, Eye, EyeOff, CheckCircle, XCircle, RefreshCw, AlertTriangle
} from 'lucide-react';
import api from '../../api/client';
import SuperAdminLayout from '../../components/SuperAdminLayout';

const HelpArticles = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'general',
    keywords: '',
    role: 'admin',
    order: 0,
    isActive: true,
    image: null
  });
  const [previewImage, setPreviewImage] = useState(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const res = await api.get('/help/articles');
      setArticles(res.data);
    } catch (error) {
      showToast('Error al cargar artículos', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleOpenModal = (article = null) => {
    if (article) {
      setEditingId(article.id);
      setFormData({
        title: article.title,
        content: article.content,
        category: article.category,
        keywords: article.keywords || '',
        role: article.role,
        order: article.order,
        isActive: article.isActive,
        image: null
      });
      setPreviewImage(article.imageUrl);
    } else {
      setEditingId(null);
      setFormData({
        title: '',
        content: '',
        category: 'general',
        keywords: '',
        role: 'admin',
        order: 0,
        isActive: true,
        image: null
      });
      setPreviewImage(null);
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingId(null);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, image: file });
      const reader = new FileReader();
      reader.onloadend = () => setPreviewImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null) data.append(key, formData[key]);
      });

      if (editingId) {
        await api.put(`/help/articles/${editingId}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        showToast('Artículo actualizado correctamente');
      } else {
        await api.post('/help/articles', data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        showToast('Artículo creado correctamente');
      }
      
      handleCloseModal();
      fetchArticles();
    } catch (error) {
      showToast('Error al guardar el artículo', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este artículo?')) return;
    try {
      await api.delete(`/help/articles/${id}`);
      showToast('Artículo eliminado correctamente');
      fetchArticles();
    } catch (error) {
      showToast('Error al eliminar', 'error');
    }
  };

  const filteredArticles = articles.filter(a => 
    a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeCount = articles.filter(a => a.isActive).length;
  const inactiveCount = articles.filter(a => !a.isActive).length;

  return (
    <SuperAdminLayout title="Centro de Ayuda" subtitle="Gestiona las guías y el chatbot administrativo">
      
      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: 20, right: 20, zIndex: 9999,
          padding: '12px 20px', borderRadius: 10, fontWeight: 600, fontSize: 14,
          background: toast.type === 'error' ? 'var(--danger-bg)' : 'var(--success-bg)',
          color: toast.type === 'error' ? 'var(--danger-text)' : 'var(--success-text)',
          border: `1px solid ${toast.type === 'error' ? 'var(--danger-border)' : 'var(--success-border)'}`,
          boxShadow: '0 4px 15px rgba(0,0,0,.15)',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          {toast.type === 'error' ? <XCircle size={16} /> : <CheckCircle size={16} />}
          {toast.msg}
        </div>
      )}

      {/* Stats rápidas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        <div style={{
          borderRadius: 14, padding: '18px 20px',
          background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
          color: '#fff', boxShadow: '0 4px 15px rgba(124,58,237,.3)',
          display: 'flex', alignItems: 'center', gap: 14
        }}>
          <HelpCircle size={24} style={{ opacity: .85 }} />
          <div>
            <div style={{ fontSize: 26, fontWeight: 800 }}>{articles.length}</div>
            <div style={{ fontSize: 12, opacity: .85 }}>Total Guías</div>
          </div>
        </div>
        <div style={{
          borderRadius: 14, padding: '18px 20px',
          background: 'linear-gradient(135deg, #059669, #10b981)',
          color: '#fff', boxShadow: '0 4px 15px rgba(16,185,129,.3)',
          display: 'flex', alignItems: 'center', gap: 14
        }}>
          <CheckCircle size={24} style={{ opacity: .85 }} />
          <div>
            <div style={{ fontSize: 26, fontWeight: 800 }}>{activeCount}</div>
            <div style={{ fontSize: 12, opacity: .85 }}>Activas</div>
          </div>
        </div>
        <div style={{
          borderRadius: 14, padding: '18px 20px',
          background: 'linear-gradient(135deg, #6b7280, #9ca3af)',
          color: '#fff', boxShadow: '0 4px 15px rgba(107,114,128,.3)',
          display: 'flex', alignItems: 'center', gap: 14
        }}>
          <XCircle size={24} style={{ opacity: .85 }} />
          <div>
            <div style={{ fontSize: 26, fontWeight: 800 }}>{inactiveCount}</div>
            <div style={{ fontSize: 12, opacity: .85 }}>Ocultas</div>
          </div>
        </div>
      </div>

      {/* Barra de herramientas */}
      <div className="card" style={{ marginBottom: 20, padding: '16px 20px' }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: '1 1 240px' }}>
            <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Buscar guía o categoría..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ paddingLeft: 36, width: '100%' }}
            />
          </div>
          <button className="btn-outline btn-sm" onClick={fetchArticles}>
            <RefreshCw size={14} /> Actualizar
          </button>
          <button
            onClick={() => handleOpenModal()}
            style={{
              padding: '8px 18px', borderRadius: 8, fontSize: 13, fontWeight: 600,
              background: 'linear-gradient(135deg, #7c3aed, #a855f7)', color: '#fff',
              border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7,
              boxShadow: '0 4px 12px rgba(124,58,237,.4)'
            }}
          >
            <Plus size={16} /> Nueva Guía
          </button>
        </div>
      </div>

      {/* Grid de guías */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
          <div className="spinner" />
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {filteredArticles.map(article => (
            <div key={article.id} className="card" style={{
              padding: 0,
              opacity: article.isActive ? 1 : .65,
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <div style={{ height: 140, background: 'var(--gray-50)', position: 'relative', overflow: 'hidden' }}>
                {article.imageUrl ? (
                  <img src={article.imageUrl} style={{ width: '100%', height: '100%', objectCover: 'cover' }} alt="" />
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--gray-200)' }}>
                    <ImageIcon size={48} />
                  </div>
                )}
                <div style={{
                  position: 'absolute', top: 12, left: 12,
                  background: 'rgba(255,255,255,0.9)', padding: '4px 10px', borderRadius: 20,
                  fontSize: 10, fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase'
                }}>
                  {article.category}
                </div>
              </div>
              <div style={{ padding: 18, flex: 1, display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 8 }}>{article.title}</h3>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16, lineClamp: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', flex: 1 }}>
                  {article.content}
                </p>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => handleOpenModal(article)}
                    style={{
                      flex: 1, padding: '7px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                      background: 'var(--gray-50)', border: '1px solid var(--border)', color: 'var(--text)',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5
                    }}
                  >
                    <Edit2 size={13} /> Editar
                  </button>
                  <button
                    onClick={() => handleDelete(article.id)}
                    style={{
                      padding: '7px 10px', borderRadius: 8,
                      background: 'var(--danger-bg)', border: '1px solid var(--danger-border)', color: 'var(--danger-text)',
                      cursor: 'pointer'
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL */}
      {showModal && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'rgba(0,0,0,.6)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
          }}
          onClick={handleCloseModal}
        >
          <div
            style={{
              background: 'var(--surface)', borderRadius: 16, maxWidth: 600, width: '100%',
              boxShadow: '0 25px 60px rgba(0,0,0,.3)', overflow: 'hidden', maxHeight: '90vh', overflowY: 'auto'
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '18px 22px', borderBottom: '1px solid var(--border)',
              background: 'linear-gradient(135deg, #0c0a1e, #1a0a2e)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <HelpCircle size={20} color="#a78bfa" />
                <div style={{ fontWeight: 700, fontSize: 15, color: '#fff' }}>
                  {editingId ? 'Editar Guía de Ayuda' : 'Nueva Guía de Ayuda'}
                </div>
              </div>
              <button onClick={handleCloseModal} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#a78bfa' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: 22 }}>
              <div className="form-group">
                <label>Título de la Guía *</label>
                <input
                  type="text" required value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ej: Cómo crear una cita"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div className="form-group">
                  <label>Categoría</label>
                  <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
                    <option value="general">General</option>
                    <option value="citas">Citas</option>
                    <option value="configuracion">Configuración</option>
                    <option value="finanzas">Finanzas</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Orden</label>
                  <input type="number" value={formData.order} onChange={e => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })} />
                </div>
              </div>

              <div className="form-group">
                <label>Contenido (Pasos e Instrucciones) *</label>
                <textarea
                  required rows={5} value={formData.content}
                  onChange={e => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Escribe las instrucciones detalladas aquí..."
                  style={{ width: '100%', padding: 12, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-input)', color: 'var(--text)', resize: 'none' }}
                />
              </div>

              <div className="form-group">
                <label>Palabras Clave (para el Chatbot)</label>
                <input
                  type="text" value={formData.keywords}
                  onChange={e => setFormData({ ...formData, keywords: e.target.value })}
                  placeholder="Ej: cita, agenda, turno, crear"
                />
              </div>

              <div className="form-group">
                <label>Imagen Explicativa</label>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <label style={{ flex: 1, height: 100, border: '2px dashed var(--border)', borderRadius: 12, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                    <ImageIcon size={24} color="var(--text-muted)" />
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Subir Imagen</span>
                    <input type="file" className="hidden" onChange={handleImageChange} accept="image/*" />
                  </label>
                  {previewImage && (
                    <div style={{ width: 100, height: 100, borderRadius: 12, overflow: 'hidden', border: '1px solid var(--border)' }}>
                      <img src={previewImage} style={{ width: '100%', height: '100%', objectCover: 'cover' }} alt="" />
                    </div>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                  <input type="checkbox" checked={formData.isActive} onChange={e => setFormData({ ...formData, isActive: e.target.checked })} />
                  Visible para los administradores
                </label>
              </div>

              <div style={{ display: 'flex', gap: 10, padding: '14px 0 0', borderTop: '1px solid var(--border)', justifyContent: 'flex-end' }}>
                <button type="button" className="btn-secondary btn-sm" onClick={handleCloseModal}>Cancelar</button>
                <button
                  type="submit" disabled={saving}
                  style={{
                    padding: '8px 20px', borderRadius: 8, fontSize: 13, fontWeight: 600,
                    background: 'linear-gradient(135deg, #7c3aed, #a855f7)', color: '#fff',
                    border: 'none', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? .7 : 1
                  }}
                >
                  {saving ? 'Guardando...' : editingId ? 'Actualizar Guía' : 'Publicar Guía'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </SuperAdminLayout>
  );
};

export default HelpArticles;

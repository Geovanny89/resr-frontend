import { useEffect, useState } from 'react';
import SuperAdminLayout from '../../components/SuperAdminLayout';
import api from '../../api/client';
import { 
  Star, CheckCircle, XCircle, Trash2, 
  MessageSquare, Building2, User, Clock 
} from 'lucide-react';

export default function PlatformReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchReviews = async () => {
    try {
      const res = await api.get('/platform-reviews/admin/all');
      setReviews(res.data || []);
    } catch (e) {
      console.error('Error fetching reviews:', e);
      // No crash — simplemente dejar la lista vacía
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleModerate = async (id, isApproved) => {
    try {
      await api.put(`/platform-reviews/admin/moderate/${id}`, { isApproved });
      setReviews(reviews.map(r => r.id === id ? { ...r, isApproved } : r));
      showToast(isApproved ? 'Reseña aprobada' : 'Reseña ocultada');
    } catch (e) {
      showToast('Error al moderar', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar esta reseña definitivamente?')) return;
    try {
      await api.delete(`/platform-reviews/admin/${id}`);
      setReviews(reviews.filter(r => r.id !== id));
      showToast('Reseña eliminada');
    } catch (e) {
      showToast('Error al eliminar', 'error');
    }
  };

  const renderStars = (rating) => {
    return Array(5).fill(0).map((_, i) => (
      <Star 
        key={i} 
        size={14} 
        fill={i < rating ? "#f59e0b" : "none"} 
        color={i < rating ? "#f59e0b" : "#d1d5db"} 
      />
    ));
  };

  return (
    <SuperAdminLayout title="Testimonios Landing" subtitle="Modera lo que los negocios dicen de tu plataforma">
      <style>{`
        .review-card {
          transition: all 0.2s ease;
          border: 1px solid var(--border);
        }
        .review-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
        }
        .badge {
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 11px;
          fontWeight: 700;
          text-transform: uppercase;
        }
        .badge-approved { background: #d1fae5; color: #065f46; }
        .badge-pending { background: #fee2e2; color: #991b1b; }
      `}</style>

      {toast && (
        <div style={{
          position: 'fixed', top: 20, right: 20, zIndex: 9999,
          padding: '12px 20px', borderRadius: 10, fontWeight: 600, fontSize: 14,
          background: toast.type === 'error' ? '#fee2e2' : '#d1fae5',
          color: toast.type === 'error' ? '#991b1b' : '#065f46',
          border: `1px solid ${toast.type === 'error' ? '#fecaca' : '#a7f3d0'}`,
          boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
          display: 'flex', alignItems: 'center', gap: 8
        }}>
          {toast.type === 'error' ? <XCircle size={16} /> : <CheckCircle size={16} />}
          {toast.msg}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: 50 }}>Cargando testimonios...</div>
      ) : reviews.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 60 }}>
          <MessageSquare size={48} color="#cbd5e1" style={{ marginBottom: 16 }} />
          <h3>No hay testimonios aún</h3>
          <p style={{ color: 'var(--text-muted)' }}>Las reseñas que envíen los negocios aparecerán aquí.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 20 }}>
          {reviews.map(review => (
            <div key={review.id} className="card review-card" style={{ padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{ display: 'flex', gap: 4 }}>
                  {renderStars(review.rating)}
                </div>
                <span className={`badge ${review.isApproved ? 'badge-approved' : 'badge-pending'}`}>
                  {review.isApproved ? 'Aprobado' : 'Oculto'}
                </span>
              </div>

              <p style={{ 
                fontSize: 14, 
                fontStyle: 'italic', 
                color: 'var(--text)', 
                marginBottom: 20,
                lineHeight: 1.6
              }}>
                "{review.comment}"
              </p>

              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Building2 size={18} color="var(--primary)" />
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>{review.businessName}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <User size={12} /> {review.reviewerName}
                    </div>
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: 8 }}>
                  <button 
                    onClick={() => handleModerate(review.id, !review.isApproved)}
                    className={review.isApproved ? "btn-secondary" : "btn-primary"}
                    style={{ padding: '6px 12px', fontSize: 12 }}
                  >
                    {review.isApproved ? 'Ocultar' : 'Aprobar'}
                  </button>
                  <button 
                    onClick={() => handleDelete(review.id)}
                    className="btn-outline"
                    style={{ padding: '6px', color: '#ef4444', borderColor: '#fee2e2' }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </SuperAdminLayout>
  );
}

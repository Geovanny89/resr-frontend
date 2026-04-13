import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, Check, Loader2 } from 'lucide-react';
import api from '../../api/client';

export default function RateEmployee() {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [appointment, setAppointment] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  useEffect(() => {
    // Verificar que la cita existe y está completada
    api.get(`/appointments/${appointmentId}/verify`)
      .then(r => {
        setAppointment(r.data);
        setLoading(false);
      })
      .catch(e => {
        setError(e.response?.data?.error || 'Cita no encontrada o no disponible para calificar');
        setLoading(false);
      });
  }, [appointmentId]);

  const submitRating = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post(`/appointments/${appointmentId}/rate`, { rating, comment });
      setSuccess(true);
    } catch (e) {
      setError(e.response?.data?.error || 'Error al enviar calificación');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <Loader2 size={48} className="spin" style={{ color: 'white' }} />
      </div>
    );
  }

  if (success) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: 20
      }}>
        <div style={{
          background: 'white',
          borderRadius: 24,
          padding: 48,
          textAlign: 'center',
          maxWidth: 400,
          width: '100%',
          boxShadow: '0 25px 50px rgba(0,0,0,0.25)'
        }}>
          <div style={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: '#10b981',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px'
          }}>
            <Check size={40} color="white" />
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 12, color: '#0f172a' }}>
            ¡Gracias!
          </h2>
          <p style={{ color: '#64748b', marginBottom: 24 }}>
            Tu calificación ha sido guardada exitosamente.
          </p>
          <button
            onClick={() => navigate('/')}
            style={{
              padding: '14px 28px',
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              color: 'white',
              border: 'none',
              borderRadius: 12,
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: 20
    }}>
      <div style={{
        background: 'white',
        borderRadius: 32,
        padding: 40,
        maxWidth: 480,
        width: '100%',
        boxShadow: '0 25px 50px rgba(0,0,0,0.25)'
      }}>
        <h1 style={{ 
          fontSize: 28, 
          fontWeight: 800, 
          textAlign: 'center', 
          marginBottom: 8,
          color: '#0f172a'
        }}>
          ¿Cómo fue tu atención?
        </h1>
        <p style={{ 
          textAlign: 'center', 
          color: '#64748b', 
          marginBottom: 32,
          fontSize: 16
        }}>
          {appointment?.employeeName && `Califica el servicio de ${appointment.employeeName}`}
          {appointment?.businessName && (
            <span style={{ display: 'block', marginTop: 4, fontSize: 14 }}>
              en {appointment.businessName}
            </span>
          )}
        </p>

        {error && (
          <div style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: 12,
            padding: 16,
            marginBottom: 24,
            color: '#dc2626',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={submitRating}>
          {/* Selector de estrellas */}
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <p style={{ fontSize: 14, color: '#64748b', marginBottom: 16 }}>
              Selecciona tu calificación:
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 4,
                    transition: 'transform 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.2)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  <Star 
                    size={48} 
                    fill={star <= rating ? '#fbbf24' : 'transparent'}
                    color={star <= rating ? '#fbbf24' : '#e2e8f0'}
                  />
                </button>
              ))}
            </div>
            <p style={{ fontSize: 14, color: '#667eea', fontWeight: 700, marginTop: 12 }}>
              {rating === 5 && '¡Excelente! ⭐'}
              {rating === 4 && 'Muy bueno 👍'}
              {rating === 3 && 'Bueno 🙂'}
              {rating === 2 && 'Regular 😕'}
              {rating === 1 && 'Necesita mejorar 😞'}
            </p>
          </div>

          {/* Comentario opcional */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ 
              display: 'block', 
              fontSize: 14, 
              fontWeight: 600, 
              marginBottom: 8,
              color: '#334155'
            }}>
              Comentario (opcional)
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Cuéntanos más sobre tu experiencia..."
              rows={3}
              style={{
                width: '100%',
                padding: '14px 18px',
                borderRadius: 12,
                border: '1px solid #e2e8f0',
                background: 'white',
                color: '#0f172a',
                fontSize: 15,
                outline: 'none',
                resize: 'vertical',
                fontFamily: 'inherit',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Botón enviar */}
          <button
            type="submit"
            disabled={submitting}
            style={{
              width: '100%',
              padding: '16px 32px',
              background: submitting ? '#94a3b8' : 'linear-gradient(135deg, #667eea, #764ba2)',
              color: 'white',
              border: 'none',
              borderRadius: 16,
              fontWeight: 700,
              fontSize: 16,
              cursor: submitting ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            {submitting ? 'Enviando...' : 'Enviar calificación'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function FeedbackBanner({ onAction }) {
  return (
    <div className="card mb-6" style={{ 
      background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', 
      color: 'white', 
      padding: '24px', 
      borderRadius: '16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 20,
      flexWrap: 'wrap',
      boxShadow: '0 10px 15px -3px rgba(139, 92, 246, 0.3)'
    }}>
      <div style={{ flex: 1, minWidth: 280 }}>
        <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8, color: 'white' }}>
          ¿Te gusta K-Dice POS? 🚀
        </h3>
        <p style={{ fontSize: 14, opacity: 0.9, color: 'white' }}>
          Tu opinión nos ayuda a crecer. Déjanos un testimonio y ayúdanos a que más negocios como el tuyo se unan a nuestra comunidad.
        </p>
      </div>
      <button 
        onClick={onAction}
        className="btn-primary"
        style={{ 
          background: 'white', 
          color: '#6366f1', 
          border: 'none', 
          padding: '12px 24px', 
          fontWeight: 700 
        }}
      >
        Dejar Testimonio
      </button>
    </div>
  );
}

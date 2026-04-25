export const Pagination = ({ currentPage, totalPages, setCurrentPage, colors }) => {
  if (totalPages <= 1) return null;

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      gap: 12, 
      marginTop: 20,
      padding: 16,
      background: colors.cardBg,
      borderRadius: 12
    }}>
      <button
        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
        disabled={currentPage === 1}
        style={{
          padding: '10px 20px',
          borderRadius: 8,
          border: 'none',
          background: currentPage === 1 ? colors.bgSecondary : colors.primary,
          color: currentPage === 1 ? colors.textSecondary : 'white',
          cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
          fontSize: 14,
          fontWeight: 600
        }}
      >
        ← Anterior
      </button>
      
      <span style={{ 
        fontSize: 15, 
        color: colors.text,
        fontWeight: 600,
        minWidth: 100,
        textAlign: 'center'
      }}>
        Página {currentPage} de {totalPages}
      </span>
      
      <button
        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
        disabled={currentPage === totalPages}
        style={{
          padding: '10px 20px',
          borderRadius: 8,
          border: 'none',
          background: currentPage === totalPages ? colors.bgSecondary : colors.primary,
          color: currentPage === totalPages ? colors.textSecondary : 'white',
          cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
          fontSize: 14,
          fontWeight: 600
        }}
      >
        Siguiente →
      </button>
    </div>
  );
};

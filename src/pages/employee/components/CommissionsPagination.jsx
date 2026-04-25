import { ChevronLeft, ChevronRight } from 'lucide-react';

export const CommissionsPagination = ({ pagination, currentPage, setCurrentPage, colors }) => {
  if (!pagination?.totalPages || pagination.totalPages <= 1) return null;

  return (
    <div style={{
      padding: '16px 20px',
      borderTop: `1px solid ${colors.border}`,
      background: colors.bgSecondary
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        flexWrap: 'nowrap'
      }}>
        <button
          onClick={() => setCurrentPage(1)}
          disabled={!pagination?.hasPrev}
          style={{
            padding: '8px',
            borderRadius: 6,
            border: `1px solid ${colors.border}`,
            background: colors.cardBg,
            cursor: pagination?.hasPrev ? 'pointer' : 'not-allowed',
            opacity: pagination?.hasPrev ? 1 : 0.5,
            color: colors.text,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}
        >
          <ChevronLeft size={16} />
        </button>
        
        <button
          onClick={() => setCurrentPage(p => p - 1)}
          disabled={!pagination?.hasPrev}
          style={{
            padding: '8px 12px',
            borderRadius: 6,
            border: `1px solid ${colors.border}`,
            background: colors.cardBg,
            cursor: pagination?.hasPrev ? 'pointer' : 'not-allowed',
            opacity: pagination?.hasPrev ? 1 : 0.5,
            color: colors.text,
            fontSize: 12,
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            flexShrink: 0
          }}
        >
          <ChevronLeft size={14} />
          Ant
        </button>

        <div style={{
          padding: '8px 16px',
          borderRadius: 6,
          background: colors.primary + '20',
          border: `1px solid ${colors.primary}50`,
          color: colors.primary,
          fontSize: 14,
          fontWeight: 700,
          minWidth: 70,
          textAlign: 'center',
          flexShrink: 0
        }}>
          {pagination?.page}/{pagination?.totalPages}
        </div>

        <button
          onClick={() => setCurrentPage(p => p + 1)}
          disabled={!pagination?.hasNext}
          style={{
            padding: '8px 12px',
            borderRadius: 6,
            border: `1px solid ${colors.border}`,
            background: colors.cardBg,
            cursor: pagination?.hasNext ? 'pointer' : 'not-allowed',
            opacity: pagination?.hasNext ? 1 : 0.5,
            color: colors.text,
            fontSize: 12,
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            flexShrink: 0
          }}
        >
          Sig
          <ChevronRight size={14} />
        </button>

        <button
          onClick={() => setCurrentPage(pagination?.totalPages)}
          disabled={!pagination?.hasNext}
          style={{
            padding: '8px',
            borderRadius: 6,
            border: `1px solid ${colors.border}`,
            background: colors.cardBg,
            cursor: pagination?.hasNext ? 'pointer' : 'not-allowed',
            opacity: pagination?.hasNext ? 1 : 0.5,
            color: colors.text,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}
        >
          <ChevronRight size={16} />
        </button>
      </div>
      
      <div style={{ textAlign: 'center', marginTop: 8 }}>
        <span style={{ fontSize: 12, color: colors.textMuted }}>
          Página {pagination?.page} de {pagination?.totalPages}
        </span>
      </div>
    </div>
  );
};

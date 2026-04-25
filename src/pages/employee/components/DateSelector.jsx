export const DateSelector = ({ selectedDate, setSelectedDate, colors, business, onExpressClick }) => {
  return (
    <div style={{
      display: 'flex',
      gap: 16,
      flexWrap: 'wrap',
      marginBottom: 24
    }}>
      <div style={{
        background: colors.cardBg,
        padding: 20,
        borderRadius: 12,
        boxShadow: `0 2px 8px ${colors.shadow}`,
        border: `1px solid ${colors.border}`,
        flex: 2,
        minWidth: 280
      }}>
        <label style={{
          display: 'block',
          fontSize: 14,
          fontWeight: 600,
          marginBottom: 10,
          color: colors.text
        }}>
          Selecciona una fecha para ver tu agenda
        </label>
        <input
          type="date"
          value={selectedDate}
          onChange={e => setSelectedDate(e.target.value)}
          style={{
            padding: '10px 12px',
            border: `1px solid ${colors.inputBorder}`,
            borderRadius: 6,
            fontSize: 14,
            fontFamily: 'inherit',
            cursor: 'pointer',
            background: colors.inputBg,
            color: colors.text,
            width: '100%'
          }}
        />
      </div>

      {!business?.hasFieldTechnicians && (
        <button
          onClick={onExpressClick}
          style={{
            flex: 1,
            minWidth: 150,
            background: '#f59e0b',
            color: 'white',
            border: 'none',
            borderRadius: 12,
            padding: '20px',
            fontSize: 16,
            fontWeight: 800,
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8
          }}
        >
          <div style={{ fontSize: 24 }}>⚡</div>
          Cita Express
        </button>
      )}
    </div>
  );
};

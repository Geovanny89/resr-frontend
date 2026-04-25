export const StatusToast = ({ statusMsg }) => {
  if (!statusMsg) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: 20,
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 9999,
      padding: '12px 24px',
      borderRadius: 8,
      fontWeight: 600,
      fontSize: 14,
      background: statusMsg.type === 'error' ? '#fee2e2' : '#d1fae5',
      color: statusMsg.type === 'error' ? '#991b1b' : '#065f46',
      border: `1px solid ${statusMsg.type === 'error' ? '#fecaca' : '#a7f3d0'}`,
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
    }}>
      {statusMsg.text}
    </div>
  );
};

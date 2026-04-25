export default function Toast({ toast }) {
  if (!toast) return null;

  return (
    <div style={{
      position:'fixed',
      top:20,
      right:20,
      zIndex:9999,
      padding:'12px 20px',
      borderRadius:10,
      background: toast.type === 'error' ? '#f56565' : '#48bb78',
      color:'white',
      fontWeight:600,
      boxShadow:'0 4px 20px rgba(0,0,0,0.2)',
      animation:'slideIn 0.3s ease'
    }}>
      {toast.type === 'error' ? '❌' : '✅'} {toast.msg}
      <style>{`@keyframes slideIn{from{transform:translateX(100%);opacity:0}to{transform:translateX(0);opacity:1}}`}</style>
    </div>
  );
}

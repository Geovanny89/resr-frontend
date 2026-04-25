import { AlertTriangle } from 'lucide-react';

export function LowStockAlert({ items, colors }) {
  if (!items || items.length === 0) return null;

  return (
    <div style={{
      background: '#fef3c7',
      border: '1px solid #f59e0b',
      borderRadius: 12,
      padding: 16,
      marginBottom: 20,
      display: 'flex',
      alignItems: 'center',
      gap: 12
    }}>
      <AlertTriangle size={24} color="#f59e0b" />
      <div>
        <strong style={{ color: '#92400e' }}>
          ⚠️ Stock bajo en {items.length} insumo(s)
        </strong>
        <div style={{ fontSize: 13, color: '#a16207', marginTop: 4 }}>
          {items.map(i => i.name).join(', ')}
        </div>
      </div>
    </div>
  );
}

export default LowStockAlert;

import { Plus, Minus, Upload } from 'lucide-react';

export function InventoryActions({
  onNewItem,
  onRecordUsage,
  onImport,
  colors
}) {
  return (
    <div style={{ 
      display: 'flex', 
      gap: 12, 
      marginBottom: 20,
      flexWrap: 'wrap'
    }}>
      <button
        onClick={onNewItem}
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '10px 16px',
          background: '#3b82f6', color: 'white',
          border: 'none', borderRadius: 8,
          fontWeight: 600, cursor: 'pointer',
          fontSize: 'clamp(12px, 3vw, 14px)'
        }}
      >
        <Plus size={18} />
        <span className="btn-text">Nuevo Insumo</span>
      </button>
      <button
        onClick={onRecordUsage}
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '10px 16px',
          background: '#f59e0b', color: 'white',
          border: 'none', borderRadius: 8,
          fontWeight: 600, cursor: 'pointer',
          fontSize: 'clamp(12px, 3vw, 14px)'
        }}
      >
        <Minus size={18} />
        <span className="btn-text">Registrar Consumo</span>
      </button>
      <button
        onClick={onImport}
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '10px 16px',
          background: '#10b981', color: 'white',
          border: 'none', borderRadius: 8,
          fontWeight: 600, cursor: 'pointer',
          fontSize: 'clamp(12px, 3vw, 14px)'
        }}
      >
        <Upload size={18} />
        <span className="btn-text">Importar Excel</span>
      </button>
    </div>
  );
}

export default InventoryActions;

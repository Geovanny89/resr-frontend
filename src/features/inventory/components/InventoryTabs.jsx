import { Box, Minus } from 'lucide-react';
import { TABS } from '../constants';

export function InventoryTabs({ activeTab, onChange, itemCount, usageCount, colors }) {
  return (
    <div style={{ 
      display: 'flex', 
      gap: 8, 
      marginBottom: 20,
      borderBottom: `1px solid ${colors.border}`,
      paddingBottom: 12
    }}>
      <button
        onClick={() => onChange(TABS.ITEMS)}
        style={{
          padding: '10px 20px',
          borderRadius: 8,
          border: 'none',
          background: activeTab === TABS.ITEMS ? '#3b82f6' : 'transparent',
          color: activeTab === TABS.ITEMS ? 'white' : colors.text,
          fontWeight: 600,
          cursor: 'pointer'
        }}
      >
        <Box size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} />
        Insumos ({itemCount})
      </button>
      <button
        onClick={() => onChange(TABS.USAGES)}
        style={{
          padding: '10px 20px',
          borderRadius: 8,
          border: 'none',
          background: activeTab === TABS.USAGES ? '#3b82f6' : 'transparent',
          color: activeTab === TABS.USAGES ? 'white' : colors.text,
          fontWeight: 600,
          cursor: 'pointer'
        }}
      >
        <Minus size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} />
        Consumos ({usageCount})
      </button>
    </div>
  );
}

export default InventoryTabs;

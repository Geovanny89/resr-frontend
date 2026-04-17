import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import api from '../../api/client';
import AdminLayout from '../../components/AdminLayout';
import ResponsiveTable from '../../components/ResponsiveTable';
import { Package, Plus, Minus, AlertTriangle, Box, Scale } from 'lucide-react';

const UNITS = [
  { value: 'unidad', label: 'Unidad' },
  { value: 'gramos', label: 'Gramos' },
  { value: 'mililitros', label: 'Mililitros' },
  { value: 'metros', label: 'Metros' },
  { value: 'porcion', label: 'Porción' }
];

export default function Inventory() {
  const { business } = useAuth();
  const { colors } = useTheme();
  const [items, setItems] = useState([]);
  const [usages, setUsages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showItemModal, setShowItemModal] = useState(false);
  const [showUsageModal, setShowUsageModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  
  const [itemForm, setItemForm] = useState({
    name: '',
    description: '',
    unit: 'unidad',
    currentStock: '',
    minStock: '',
    costPerUnit: '',
    supplier: ''
  });
  
  const [usageForm, setUsageForm] = useState({
    itemId: '',
    quantity: '',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });
  
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('items'); // 'items' | 'usages'

  useEffect(() => {
    if (business?.id) {
      loadItems();
      loadUsages();
    }
  }, [business]);

  const loadItems = async () => {
    try {
      const res = await api.get('/inventory/items', {
        params: { businessId: business.id }
      });
      setItems(res.data || []);
    } catch (e) {
      console.error('Error cargando insumos:', e);
    } finally {
      setLoading(false);
    }
  };

  const loadUsages = async () => {
    try {
      const res = await api.get('/inventory/usages', {
        params: { businessId: business.id }
      });
      setUsages(res.data || []);
    } catch (e) {
      console.error('Error cargando usos:', e);
    }
  };

  const handleSaveItem = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/inventory/items', {
        ...itemForm,
        businessId: business.id,
        currentStock: parseFloat(itemForm.currentStock) || 0,
        minStock: parseFloat(itemForm.minStock) || 0,
        costPerUnit: itemForm.costPerUnit ? parseFloat(itemForm.costPerUnit) : null
      });
      setShowItemModal(false);
      setItemForm({
        name: '', description: '', unit: 'unidad',
        currentStock: '', minStock: '', costPerUnit: '', supplier: ''
      });
      loadItems();
    } catch (e) {
      alert(e.response?.data?.error || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const handleRecordUsage = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/inventory/usages', {
        ...usageForm,
        businessId: business.id,
        quantity: parseFloat(usageForm.quantity)
      });
      setShowUsageModal(false);
      setUsageForm({
        itemId: '', quantity: '',
        date: new Date().toISOString().split('T')[0], notes: ''
      });
      loadItems();
      loadUsages();
    } catch (e) {
      alert(e.response?.data?.error || 'Error al registrar uso');
    } finally {
      setSaving(false);
    }
  };

  const getLowStockItems = () => items.filter(item => 
    parseFloat(item.currentStock) <= parseFloat(item.minStock)
  );

  return (
    <AdminLayout title="Insumos" subtitle="Control de materiales y consumo">
      {/* Alertas de stock bajo */}
      {getLowStockItems().length > 0 && (
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
              ⚠️ Stock bajo en {getLowStockItems().length} insumo(s)
            </strong>
            <div style={{ fontSize: 13, color: '#a16207', marginTop: 4 }}>
              {getLowStockItems().map(i => i.name).join(', ')}
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div style={{ 
        display: 'flex', 
        gap: 8, 
        marginBottom: 20,
        borderBottom: `1px solid ${colors.border}`,
        paddingBottom: 12
      }}>
        <button
          onClick={() => setActiveTab('items')}
          style={{
            padding: '10px 20px',
            borderRadius: 8,
            border: 'none',
            background: activeTab === 'items' ? '#3b82f6' : 'transparent',
            color: activeTab === 'items' ? 'white' : colors.text,
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          <Box size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} />
          Insumos ({items.length})
        </button>
        <button
          onClick={() => setActiveTab('usages')}
          style={{
            padding: '10px 20px',
            borderRadius: 8,
            border: 'none',
            background: activeTab === 'usages' ? '#3b82f6' : 'transparent',
            color: activeTab === 'usages' ? 'white' : colors.text,
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          <Minus size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} />
          Consumos ({usages.length})
        </button>
      </div>

      {/* Acciones */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        <button
          onClick={() => setShowItemModal(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '10px 16px',
            background: '#3b82f6', color: 'white',
            border: 'none', borderRadius: 8,
            fontWeight: 600, cursor: 'pointer'
          }}
        >
          <Plus size={18} />
          Nuevo Insumo
        </button>
        <button
          onClick={() => setShowUsageModal(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '10px 16px',
            background: '#f59e0b', color: 'white',
            border: 'none', borderRadius: 8,
            fontWeight: 600, cursor: 'pointer'
          }}
        >
          <Minus size={18} />
          Registrar Consumo
        </button>
      </div>

      {/* Tabla de Insumos */}
      {activeTab === 'items' && (
        <ResponsiveTable
          columns={[
            { key: 'name', label: 'Insumo' },
            { key: 'description', label: 'Descripción' },
            {
              key: 'currentStock',
              label: 'Stock Actual',
              render: (v, row) => {
                const isLow = parseFloat(v) <= parseFloat(row.minStock);
                return (
                  <span style={{
                    padding: '4px 10px',
                    borderRadius: 20,
                    background: isLow ? '#fef3c7' : '#d1fae5',
                    color: isLow ? '#92400e' : '#065f46',
                    fontWeight: 700,
                    fontSize: 13
                  }}>
                    {v} {row.unit}
                    {isLow && ' ⚠️'}
                  </span>
                );
              }
            },
            {
              key: 'minStock',
              label: 'Mínimo',
              render: (v, row) => `${v} ${row.unit}`
            },
            {
              key: 'costPerUnit',
              label: 'Costo/Unidad',
              render: (v) => v ? `$${parseFloat(v).toLocaleString('es-CO')}` : '-'
            },
            { key: 'supplier', label: 'Proveedor' }
          ]}
          data={items}
          loading={loading}
          emptyMessage="No hay insumos registrados"
        />
      )}

      {/* Tabla de Consumos */}
      {activeTab === 'usages' && (
        <ResponsiveTable
          columns={[
            {
              key: 'date',
              label: 'Fecha',
              render: (v) => new Date(v).toLocaleDateString('es-CO')
            },
            {
              key: 'InventoryItem',
              label: 'Insumo',
              render: (v) => v?.name || '-'
            },
            {
              key: 'quantity',
              label: 'Cantidad',
              render: (v, row) => `${v} ${row.InventoryItem?.unit || ''}`
            },
            { key: 'notes', label: 'Notas' }
          ]}
          data={usages}
          loading={loading}
          emptyMessage="No hay consumos registrados"
        />
      )}

      {/* Modal Nuevo Insumo */}
      {showItemModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: 16
        }}>
          <div style={{
            background: colors.cardBg, borderRadius: 16, padding: 28,
            maxWidth: 450, width: '100%', maxHeight: '90vh', overflowY: 'auto'
          }}>
            <h2 style={{ margin: '0 0 20px', fontSize: 20, fontWeight: 700, color: colors.text }}>
              <Package size={24} style={{ verticalAlign: 'middle', marginRight: 8 }} />
              Nuevo Insumo
            </h2>

            <form onSubmit={handleSaveItem}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 14 }}>
                  Nombre *
                </label>
                <input
                  type="text"
                  value={itemForm.name}
                  onChange={(e) => setItemForm({...itemForm, name: e.target.value})}
                  placeholder="Ej: Shampoo profesional"
                  required
                  style={{
                    width: '100%', padding: 10, borderRadius: 8,
                    border: `1px solid ${colors.border}`,
                    background: colors.inputBg, color: colors.text
                  }}
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 14 }}>
                  Descripción
                </label>
                <textarea
                  value={itemForm.description}
                  onChange={(e) => setItemForm({...itemForm, description: e.target.value})}
                  placeholder="Descripción del insumo..."
                  rows={2}
                  style={{
                    width: '100%', padding: 10, borderRadius: 8,
                    border: `1px solid ${colors.border}`,
                    background: colors.inputBg, color: colors.text,
                    resize: 'vertical'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                <div>
                  <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 14 }}>
                    <Scale size={16} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                    Unidad *
                  </label>
                  <select
                    value={itemForm.unit}
                    onChange={(e) => setItemForm({...itemForm, unit: e.target.value})}
                    required
                    style={{
                      width: '100%', padding: 10, borderRadius: 8,
                      border: `1px solid ${colors.border}`,
                      background: colors.inputBg, color: colors.text
                    }}
                  >
                    {UNITS.map(u => (
                      <option key={u.value} value={u.value}>{u.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 14 }}>
                    Stock Inicial
                  </label>
                  <input
                    type="number"
                    value={itemForm.currentStock}
                    onChange={(e) => setItemForm({...itemForm, currentStock: e.target.value})}
                    placeholder="0"
                    min="0"
                    step="0.01"
                    style={{
                      width: '100%', padding: 10, borderRadius: 8,
                      border: `1px solid ${colors.border}`,
                      background: colors.inputBg, color: colors.text
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                <div>
                  <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 14 }}>
                    Stock Mínimo
                  </label>
                  <input
                    type="number"
                    value={itemForm.minStock}
                    onChange={(e) => setItemForm({...itemForm, minStock: e.target.value})}
                    placeholder="Para alerta"
                    min="0"
                    step="0.01"
                    style={{
                      width: '100%', padding: 10, borderRadius: 8,
                      border: `1px solid ${colors.border}`,
                      background: colors.inputBg, color: colors.text
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 14 }}>
                    Costo por unidad
                  </label>
                  <input
                    type="number"
                    value={itemForm.costPerUnit}
                    onChange={(e) => setItemForm({...itemForm, costPerUnit: e.target.value})}
                    placeholder="$0.00"
                    min="0"
                    step="0.01"
                    style={{
                      width: '100%', padding: 10, borderRadius: 8,
                      border: `1px solid ${colors.border}`,
                      background: colors.inputBg, color: colors.text
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 14 }}>
                  Proveedor
                </label>
                <input
                  type="text"
                  value={itemForm.supplier}
                  onChange={(e) => setItemForm({...itemForm, supplier: e.target.value})}
                  placeholder="Nombre del proveedor"
                  style={{
                    width: '100%', padding: 10, borderRadius: 8,
                    border: `1px solid ${colors.border}`,
                    background: colors.inputBg, color: colors.text
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  type="button"
                  onClick={() => setShowItemModal(false)}
                  style={{
                    flex: 1, padding: 12, borderRadius: 10,
                    border: `1px solid ${colors.border}`,
                    background: 'none', color: colors.text,
                    fontWeight: 600, cursor: 'pointer'
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    flex: 1, padding: 12, borderRadius: 10,
                    border: 'none',
                    background: '#3b82f6', color: 'white',
                    fontWeight: 700,
                    cursor: saving ? 'not-allowed' : 'pointer',
                    opacity: saving ? 0.7 : 1
                  }}
                >
                  {saving ? 'Guardando...' : 'Guardar Insumo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Registrar Consumo */}
      {showUsageModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: 16
        }}>
          <div style={{
            background: colors.cardBg, borderRadius: 16, padding: 28,
            maxWidth: 400, width: '100%'
          }}>
            <h2 style={{ margin: '0 0 20px', fontSize: 20, fontWeight: 700, color: colors.text }}>
              <Minus size={24} style={{ verticalAlign: 'middle', marginRight: 8 }} />
              Registrar Consumo
            </h2>

            <form onSubmit={handleRecordUsage}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 14 }}>
                  Insumo *
                </label>
                <select
                  value={usageForm.itemId}
                  onChange={(e) => setUsageForm({...usageForm, itemId: e.target.value})}
                  required
                  style={{
                    width: '100%', padding: 10, borderRadius: 8,
                    border: `1px solid ${colors.border}`,
                    background: colors.inputBg, color: colors.text
                  }}
                >
                  <option value="">Selecciona insumo</option>
                  {items.map(item => (
                    <option key={item.id} value={item.id}>
                      {item.name} (Disp: {item.currentStock} {item.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                <div>
                  <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 14 }}>
                    Cantidad *
                  </label>
                  <input
                    type="number"
                    value={usageForm.quantity}
                    onChange={(e) => setUsageForm({...usageForm, quantity: e.target.value})}
                    placeholder="0.00"
                    required
                    min="0.01"
                    step="0.01"
                    style={{
                      width: '100%', padding: 10, borderRadius: 8,
                      border: `1px solid ${colors.border}`,
                      background: colors.inputBg, color: colors.text
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 14 }}>
                    Fecha *
                  </label>
                  <input
                    type="date"
                    value={usageForm.date}
                    onChange={(e) => setUsageForm({...usageForm, date: e.target.value})}
                    required
                    style={{
                      width: '100%', padding: 10, borderRadius: 8,
                      border: `1px solid ${colors.border}`,
                      background: colors.inputBg, color: colors.text
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 14 }}>
                  Notas
                </label>
                <textarea
                  value={usageForm.notes}
                  onChange={(e) => setUsageForm({...usageForm, notes: e.target.value})}
                  placeholder="Ej: Usado en cita de María..."
                  rows={2}
                  style={{
                    width: '100%', padding: 10, borderRadius: 8,
                    border: `1px solid ${colors.border}`,
                    background: colors.inputBg, color: colors.text,
                    resize: 'vertical'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  type="button"
                  onClick={() => setShowUsageModal(false)}
                  style={{
                    flex: 1, padding: 12, borderRadius: 10,
                    border: `1px solid ${colors.border}`,
                    background: 'none', color: colors.text,
                    fontWeight: 600, cursor: 'pointer'
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    flex: 1, padding: 12, borderRadius: 10,
                    border: 'none',
                    background: '#f59e0b', color: 'white',
                    fontWeight: 700,
                    cursor: saving ? 'not-allowed' : 'pointer',
                    opacity: saving ? 0.7 : 1
                  }}
                >
                  {saving ? 'Guardando...' : 'Registrar Consumo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

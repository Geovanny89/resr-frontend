import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import api from '../../api/client';
import AdminLayout from '../../components/AdminLayout';
import ResponsiveTable from '../../components/ResponsiveTable';
import { Package, Plus, Minus, AlertTriangle, Box, Scale, Pencil, Trash2, X, Upload, FileSpreadsheet, CheckCircle, AlertCircle, Info, Download } from 'lucide-react';

const UNITS = [
  { value: 'unidad', label: 'Unidad' },
  { value: 'gramos', label: 'Gramos' },
  { value: 'mililitros', label: 'Mililitros' },
  { value: 'metros', label: 'Metros' },
  { value: 'porcion', label: 'Porción' }
];

export default function Inventory() {
  const { business } = useAuth();
  const { colors, isDark } = useTheme();
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
  const [editingId, setEditingId] = useState(null);
  const [editingUsageId, setEditingUsageId] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [usageToDelete, setUsageToDelete] = useState(null);
  
  // Estados para importación Excel
  const [showImportModal, setShowImportModal] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const fileInputRef = useState(null);

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
      if (editingId) {
        // Actualizar insumo existente
        await api.put(`/inventory/items/${editingId}`, {
          ...itemForm,
          currentStock: parseFloat(itemForm.currentStock) || 0,
          minStock: parseFloat(itemForm.minStock) || 0,
          costPerUnit: itemForm.costPerUnit ? parseFloat(itemForm.costPerUnit) : null
        });
      } else {
        // Crear nuevo insumo
        await api.post('/inventory/items', {
          ...itemForm,
          businessId: business.id,
          currentStock: parseFloat(itemForm.currentStock) || 0,
          minStock: parseFloat(itemForm.minStock) || 0,
          costPerUnit: itemForm.costPerUnit ? parseFloat(itemForm.costPerUnit) : null
        });
      }
      closeItemModal();
      loadItems();
    } catch (e) {
      alert(e.response?.data?.error || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const handleEditItem = (item) => {
    setEditingId(item.id);
    setItemForm({
      name: item.name,
      description: item.description || '',
      unit: item.unit,
      currentStock: item.currentStock.toString(),
      minStock: item.minStock.toString(),
      costPerUnit: item.costPerUnit ? item.costPerUnit.toString() : '',
      supplier: item.supplier || ''
    });
    setShowItemModal(true);
  };

  const handleDeleteItem = (id) => {
    setItemToDelete(id);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      await api.delete(`/inventory/items/${itemToDelete}`);
      loadItems();
    } catch (e) {
      alert(e.response?.data?.error || 'Error al eliminar');
    } finally {
      setShowDeleteConfirm(false);
      setItemToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setItemToDelete(null);
    setUsageToDelete(null);
  };

  const closeItemModal = () => {
    setShowItemModal(false);
    setEditingId(null);
    setItemForm({
      name: '', description: '', unit: 'unidad',
      currentStock: '', minStock: '', costPerUnit: '', supplier: ''
    });
  };

  const handleRecordUsage = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingUsageId) {
        // Actualizar consumo existente
        await api.put(`/inventory/usages/${editingUsageId}`, {
          ...usageForm,
          quantity: parseFloat(usageForm.quantity)
        });
      } else {
        // Crear nuevo consumo
        await api.post('/inventory/usages', {
          ...usageForm,
          businessId: business.id,
          quantity: parseFloat(usageForm.quantity)
        });
      }
      closeUsageModal();
      loadItems();
      loadUsages();
    } catch (e) {
      alert(e.response?.data?.error || 'Error al guardar consumo');
    } finally {
      setSaving(false);
    }
  };

  const handleEditUsage = (usage) => {
    setEditingUsageId(usage.id);
    setUsageForm({
      itemId: usage.itemId,
      quantity: usage.quantity.toString(),
      date: usage.date.split('T')[0],
      notes: usage.notes || ''
    });
    setShowUsageModal(true);
  };

  const handleDeleteUsage = (id) => {
    setUsageToDelete(id);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteUsage = async () => {
    if (!usageToDelete) return;
    try {
      await api.delete(`/inventory/usages/${usageToDelete}`);
      loadItems();
      loadUsages();
    } catch (e) {
      alert(e.response?.data?.error || 'Error al eliminar consumo');
    } finally {
      setShowDeleteConfirm(false);
      setUsageToDelete(null);
    }
  };

  const closeUsageModal = () => {
    setShowUsageModal(false);
    setEditingUsageId(null);
    setUsageForm({
      itemId: '', quantity: '',
      date: new Date().toISOString().split('T')[0], notes: ''
    });
  };

  const getLowStockItems = () => items.filter(item => 
    parseFloat(item.currentStock) <= parseFloat(item.minStock)
  );

  // Handler para importar Excel
  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validar que sea un archivo Excel
    if (!file.name.match(/\.(xlsx|xls)$/i)) {
      alert('Por favor selecciona un archivo Excel (.xlsx o .xls)');
      return;
    }

    setImporting(true);
    setImportResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('businessId', business.id);

      const res = await api.post('/inventory/import-excel', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setImportResult(res.data);
      
      // Recargar la lista de insumos
      await loadItems();
    } catch (e) {
      console.error('Error importando Excel:', e);
      setImportResult({
        success: false,
        error: e.response?.data?.error || 'Error al procesar el archivo'
      });
    } finally {
      setImporting(false);
      // Limpiar el input
      e.target.value = '';
    }
  };

  const closeImportModal = () => {
    setShowImportModal(false);
    setImportResult(null);
  };

  // Descargar plantilla Excel
  const handleDownloadTemplate = () => {
    const headers = ['Nombre', 'Descripción', 'Unidad', 'Stock', 'Stock Minimo', 'Costo', 'Proveedor'];
    const exampleRow = ['Shampoo Profesional', 'Shampoo para cabello graso', 'mililitros', '500', '100', '15000', 'Distribuidora Belleza SAS'];
    const exampleRow2 = ['Tijeras Profesionales', 'Tijeras de corte', 'unidad', '5', '2', '45000', 'Equipos Peluqueria LTDA'];
    
    // Crear contenido CSV
    const csvContent = [
      headers.join(';'),
      exampleRow.join(';'),
      exampleRow2.join(';')
    ].join('\n');
    
    // Crear blob y descargar
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'plantilla_insumos.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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

      {/* Acciones - Responsive */}
      <div style={{ 
        display: 'flex', 
        gap: 12, 
        marginBottom: 20,
        flexWrap: 'wrap'
      }}>
        <button
          onClick={() => setShowItemModal(true)}
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
          onClick={() => setShowUsageModal(true)}
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
          onClick={() => setShowImportModal(true)}
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
            { key: 'supplier', label: 'Proveedor' },
            {
              key: 'actions',
              label: 'Acciones',
              render: (_, row) => (
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => handleEditItem(row)}
                    style={{
                      padding: '6px 10px',
                      background: '#3b82f6',
                      color: 'white',
                      border: 'none',
                      borderRadius: 6,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4
                    }}
                    title="Editar"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => handleDeleteItem(row.id)}
                    style={{
                      padding: '6px 10px',
                      background: '#ef4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: 6,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4
                    }}
                    title="Eliminar"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              )
            }
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
            { key: 'notes', label: 'Notas' },
            {
              key: 'actions',
              label: 'Acciones',
              render: (_, row) => (
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => handleEditUsage(row)}
                    style={{
                      padding: '6px 10px',
                      background: '#3b82f6',
                      color: 'white',
                      border: 'none',
                      borderRadius: 6,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4
                    }}
                    title="Editar"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => handleDeleteUsage(row.id)}
                    style={{
                      padding: '6px 10px',
                      background: '#ef4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: 6,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4
                    }}
                    title="Eliminar"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              )
            }
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: colors.text }}>
                <Package size={24} style={{ verticalAlign: 'middle', marginRight: 8 }} />
                {editingId ? 'Editar Insumo' : 'Nuevo Insumo'}
              </h2>
              <button onClick={closeItemModal} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={24} color={colors.textSecondary} />
              </button>
            </div>

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
                  onClick={closeItemModal}
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
                  {saving ? 'Guardando...' : editingId ? 'Actualizar Insumo' : 'Guardar Insumo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Registrar/Editar Consumo */}
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
              {editingUsageId ? 'Editar Consumo' : 'Registrar Consumo'}
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
                  onClick={closeUsageModal}
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
                  {saving ? 'Guardando...' : editingUsageId ? 'Actualizar Consumo' : 'Registrar Consumo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de confirmación para eliminar insumo/consumo */}
      {showDeleteConfirm && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: 16
        }} onClick={cancelDelete}>
          <div style={{
            background: colors.cardBg, borderRadius: 16, padding: 28,
            maxWidth: 380, width: '100%', textAlign: 'center'
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{
              width: 56, height: 56, borderRadius: '50%',
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px'
            }}>
              <Trash2 size={28} color="white" />
            </div>
            <h3 style={{ margin: '0 0 8px', fontSize: 18, color: colors.text }}>
              {usageToDelete ? '¿Eliminar consumo?' : '¿Eliminar insumo?'}
            </h3>
            <p style={{ margin: '0 0 20px', color: colors.textSecondary, fontSize: 14 }}>
              {usageToDelete ? 'El stock será restaurado automáticamente' : 'Esta acción no se puede deshacer'}
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button
                onClick={cancelDelete}
                style={{
                  padding: '10px 20px', borderRadius: 10,
                  border: `1px solid ${colors.border}`,
                  background: 'none', color: colors.text,
                  fontWeight: 600, cursor: 'pointer'
                }}
              >
                No, cancelar
              </button>
              <button
                onClick={usageToDelete ? confirmDeleteUsage : confirmDelete}
                style={{
                  padding: '10px 20px', borderRadius: 10,
                  border: 'none', background: '#ef4444', color: 'white',
                  fontWeight: 600, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 6
                }}
              >
                <Trash2 size={16} />
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Importación Excel */}
      {showImportModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: 16
        }} onClick={closeImportModal}>
          <div style={{
            background: colors.cardBg, borderRadius: 16, padding: 28,
            maxWidth: 500, width: '100%', maxHeight: '90vh', overflowY: 'auto'
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: colors.text }}>
                <FileSpreadsheet size={24} style={{ verticalAlign: 'middle', marginRight: 8, color: '#10b981' }} />
                Importar Insumos desde Excel
              </h2>
              <button onClick={closeImportModal} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={24} color={colors.textSecondary} />
              </button>
            </div>

            {!importResult ? (
              <div>
                {/* Botón descargar plantilla */}
                <button
                  onClick={handleDownloadTemplate}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    padding: '12px 16px',
                    background: colors.bgTertiary,
                    border: `1px dashed ${colors.border}`,
                    borderRadius: 8,
                    color: colors.text,
                    fontWeight: 600,
                    fontSize: 14,
                    cursor: 'pointer',
                    marginBottom: 16
                  }}
                >
                  <Download size={18} />
                  Descargar Plantilla (CSV)
                </button>

                <div style={{
                  background: isDark ? 'rgba(16, 185, 129, 0.1)' : '#ecfdf5',
                  border: `1px solid ${isDark ? 'rgba(16, 185, 129, 0.3)' : '#10b981'}`,
                  borderRadius: 8,
                  padding: 16,
                  marginBottom: 20
                }}>
                  <h4 style={{ margin: '0 0 12px', color: isDark ? '#34d399' : '#065f46', fontSize: 14 }}>
                    <Info size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} />
                    Formato esperado:
                  </h4>
                  <p style={{ margin: '0 0 8px', fontSize: 13, color: colors.textSecondary }}>
                    El archivo Excel debe tener una fila de encabezados con estas columnas:
                  </p>
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', 
                    gap: 8, 
                    fontSize: 12, 
                    color: colors.textTertiary 
                  }}>
                    <div>• <strong style={{color: colors.text}}>Nombre</strong> (req)</div>
                    <div>• <strong style={{color: colors.text}}>Descripción</strong></div>
                    <div>• <strong style={{color: colors.text}}>Unidad</strong></div>
                    <div>• <strong style={{color: colors.text}}>Stock</strong></div>
                    <div>• <strong style={{color: colors.text}}>Stock Mínimo</strong></div>
                    <div>• <strong style={{color: colors.text}}>Costo</strong></div>
                    <div>• <strong style={{color: colors.text}}>Proveedor</strong></div>
                  </div>
                  <p style={{ margin: '12px 0 0', fontSize: 12, color: isDark ? '#34d399' : '#059669' }}>
                    <CheckCircle size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                    Los insumos existentes se actualizarán sin afectar el stock actual
                  </p>
                </div>

                <div style={{
                  border: `2px dashed ${isDark ? 'rgba(16, 185, 129, 0.5)' : '#10b981'}`,
                  borderRadius: 12,
                  padding: 'clamp(20px, 5vw, 40px)',
                  textAlign: 'center',
                  background: isDark ? 'rgba(16, 185, 129, 0.05)' : '#f0fdf4'
                }}>
                  <Upload size={48} color={isDark ? '#34d399' : '#10b981'} style={{ marginBottom: 16 }} />
                  <p style={{ margin: '0 0 16px', fontSize: 16, color: colors.text, fontWeight: 500 }}>
                    Arrastra un archivo Excel aquí o haz clic para seleccionar
                  </p>
                  <input
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleFileSelect}
                    style={{ display: 'none' }}
                    id="excel-upload"
                  />
                  <label
                    htmlFor="excel-upload"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '12px 24px',
                      background: '#10b981',
                      color: 'white',
                      borderRadius: 8,
                      cursor: 'pointer',
                      fontWeight: 600,
                      fontSize: 'clamp(13px, 3vw, 14px)'
                    }}
                  >
                    <FileSpreadsheet size={18} />
                    Seleccionar Archivo
                  </label>
                </div>

                {importing && (
                  <div style={{ textAlign: 'center', marginTop: 20 }}>
                    <div style={{
                      width: 40,
                      height: 40,
                      border: `4px solid ${colors.border}`,
                      borderTop: `4px solid ${colors.success}`,
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite',
                      margin: '0 auto 12px'
                    }} />
                    <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
                    <p style={{ margin: 0, color: colors.textSecondary }}>Procesando archivo...</p>
                  </div>
                )}
              </div>
            ) : (
              <div>
                {importResult.success ? (
                  <div style={{ textAlign: 'center' }}>
                    <div style={{
                      width: 60,
                      height: 60,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 16px'
                    }}>
                      <CheckCircle size={32} color="white" />
                    </div>
                    <h3 style={{ margin: '0 0 8px', color: colors.text }}>
                      ¡Importación Exitosa!
                    </h3>
                    <p style={{ margin: '0 0 20px', color: colors.textSecondary, fontSize: 14 }}>
                      {importResult.message}
                    </p>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                      gap: 12,
                      marginBottom: 20
                    }}>
                      <div style={{
                        background: isDark ? 'rgba(16, 185, 129, 0.15)' : '#ecfdf5',
                        padding: 16,
                        borderRadius: 8,
                        textAlign: 'center'
                      }}>
                        <div style={{ fontSize: 24, fontWeight: 700, color: isDark ? '#34d399' : '#059669' }}>
                          {importResult.results?.created || 0}
                        </div>
                        <div style={{ fontSize: 12, color: isDark ? '#6ee7b7' : '#065f46' }}>Nuevos insumos</div>
                      </div>
                      <div style={{
                        background: isDark ? 'rgba(59, 130, 246, 0.15)' : '#dbeafe',
                        padding: 16,
                        borderRadius: 8,
                        textAlign: 'center'
                      }}>
                        <div style={{ fontSize: 24, fontWeight: 700, color: isDark ? '#60a5fa' : '#2563eb' }}>
                          {importResult.results?.updated || 0}
                        </div>
                        <div style={{ fontSize: 12, color: isDark ? '#93c5fd' : '#1e40af' }}>Actualizados</div>
                      </div>
                    </div>
                    {importResult.results?.errors?.length > 0 && (
                      <div style={{
                        background: isDark ? 'rgba(239, 68, 68, 0.1)' : '#fef2f2',
                        border: `1px solid ${isDark ? 'rgba(239, 68, 68, 0.3)' : '#fecaca'}`,
                        borderRadius: 8,
                        padding: 12,
                        marginBottom: 20,
                        textAlign: 'left'
                      }}>
                        <p style={{ margin: '0 0 8px', fontSize: 13, color: isDark ? '#f87171' : '#dc2626', fontWeight: 600 }}>
                          <AlertCircle size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                          Errores ({importResult.results.errors.length}):
                        </p>
                        <ul style={{ margin: 0, paddingLeft: 16, fontSize: 12, color: isDark ? '#fca5a5' : '#7f1d1d' }}>
                          {importResult.results.errors.slice(0, 5).map((err, idx) => (
                            <li key={idx}>Fila {err.row}: {err.error}</li>
                          ))}
                          {importResult.results.errors.length > 5 && (
                            <li>... y {importResult.results.errors.length - 5} errores más</li>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center' }}>
                    <div style={{
                      width: 60,
                      height: 60,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 16px'
                    }}>
                      <AlertCircle size={32} color="white" />
                    </div>
                    <h3 style={{ margin: '0 0 8px', color: colors.text }}>
                      Error en la Importación
                    </h3>
                    <p style={{ margin: '0 0 20px', color: colors.textSecondary, fontSize: 14 }}>
                      {importResult.error || 'Ocurrió un error al procesar el archivo'}
                    </p>
                  </div>
                )}
                <button
                  onClick={closeImportModal}
                  style={{
                    width: '100%',
                    padding: 12,
                    borderRadius: 10,
                    border: 'none',
                    background: '#3b82f6',
                    color: 'white',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Cerrar
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import AdminLayout from '../../components/AdminLayout';
import ResponsiveTable from '../../components/ResponsiveTable';
import { Pencil, Trash2, AlertCircle, CheckCircle } from 'lucide-react';
import {
  useInventory,
  useInventoryUsages,
  useInventoryImport,
  useInventoryUI,
  ItemModal,
  UsageModal,
  ImportModal,
  DeleteConfirmModal,
  LowStockAlert,
  InventoryActions,
  InventoryTabs,
  TABS
} from '../../features/inventory';

export default function Inventory() {
  const { business } = useAuth();
  const { colors, isDark } = useTheme();
  const businessId = business?.id;

  // UI State
  const {
    activeTab,
    setActiveTab,
    showItemModal,
    openItemModal,
    closeItemModal,
    showUsageModal,
    openUsageModal,
    closeUsageModal,
    showImportModal,
    openImportModal,
    closeImportModal,
    showDeleteConfirm,
    openDeleteConfirm,
    closeDeleteConfirm,
    statusMsg,
    showStatus
  } = useInventoryUI();

  // Inventory Items
  const {
    items,
    loading,
    saving: savingItem,
    form: itemForm,
    editingId: editingItemId,
    itemToDelete,
    setItemToDelete,
    setEditItem,
    resetForm: resetItemForm,
    updateFormField: updateItemFormField,
    saveItem,
    deleteItem,
    getLowStockItems,
    isLowStock,
    loadItems
  } = useInventory(businessId);

  // Inventory Usages
  const {
    usages,
    saving: savingUsage,
    form: usageForm,
    editingId: editingUsageId,
    usageToDelete,
    setUsageToDelete,
    setEditUsage,
    resetForm: resetUsageForm,
    updateFormField: updateUsageFormField,
    saveUsage,
    deleteUsage
  } = useInventoryUsages(businessId);

  // Import
  const {
    importing,
    importResult,
    handleFileSelect,
    downloadTemplate,
    resetResult
  } = useInventoryImport(businessId, () => {
    // Recargar insumos sin cache despues de importar
    loadItems?.(true);
  });

  const handleSaveItem = async (e) => {
    e.preventDefault();
    await saveItem(
      () => {
        closeItemModal();
        resetItemForm();
      },
      (error) => showStatus(error, 'error')
    );
  };

  const handleEditItem = (item) => {
    setEditItem(item);
    openItemModal();
  };

  const handleDeleteItem = (id) => {
    setItemToDelete(id);
    openDeleteConfirm();
  };

  const confirmDelete = async () => {
    await deleteItem(
      () => {
        closeDeleteConfirm();
        setItemToDelete(null);
      },
      (error) => {
        showStatus(error, 'error');
        closeDeleteConfirm();
      }
    );
  };

  const cancelDelete = () => {
    closeDeleteConfirm();
    setItemToDelete(null);
    setUsageToDelete(null);
  };

  const handleRecordUsage = async (e) => {
    e.preventDefault();
    await saveUsage(
      () => {
        closeUsageModal();
        resetUsageForm();
      },
      (error) => showStatus(error, 'error')
    );
  };

  const handleEditUsage = (usage) => {
    setEditUsage(usage);
    openUsageModal();
  };

  const handleDeleteUsage = (id) => {
    setUsageToDelete(id);
    openDeleteConfirm();
  };

  const confirmDeleteUsage = async () => {
    await deleteUsage(
      () => {
        closeDeleteConfirm();
        setUsageToDelete(null);
      },
      (error) => {
        showStatus(error, 'error');
        closeDeleteConfirm();
      }
    );
  };

  const handleFileSelectWrapper = async (e) => {
    const file = e.target.files[0];
    await handleFileSelect(file, (error) => showStatus(error, 'error'));
    e.target.value = '';
  };

  const handleCloseImportModal = () => {
    resetResult();
    closeImportModal();
  };

  return (
    <AdminLayout title="Insumos" subtitle="Control de materiales y consumo">
      <LowStockAlert items={getLowStockItems()} colors={colors} />

      <InventoryTabs
        activeTab={activeTab}
        onChange={setActiveTab}
        itemCount={items.length}
        usageCount={usages.length}
        colors={colors}
      />

      <InventoryActions
        onNewItem={openItemModal}
        onRecordUsage={openUsageModal}
        onImport={openImportModal}
        colors={colors}
      />

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
                const isLow = isLowStock(row);
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

      <ItemModal
        isOpen={showItemModal}
        onClose={closeItemModal}
        form={itemForm}
        onUpdateField={updateItemFormField}
        onSubmit={handleSaveItem}
        isEditing={editingItemId}
        isSaving={savingItem}
        colors={colors}
      />

      <UsageModal
        isOpen={showUsageModal}
        onClose={closeUsageModal}
        form={usageForm}
        onUpdateField={updateUsageFormField}
        onSubmit={handleRecordUsage}
        isEditing={editingUsageId}
        isSaving={savingUsage}
        items={items}
        colors={colors}
      />

      <DeleteConfirmModal
        isOpen={showDeleteConfirm}
        onClose={cancelDelete}
        onConfirm={usageToDelete ? confirmDeleteUsage : confirmDelete}
        isDeletingUsage={!!usageToDelete}
        colors={colors}
      />

      <ImportModal
        isOpen={showImportModal}
        onClose={handleCloseImportModal}
        onDownloadTemplate={downloadTemplate}
        onFileSelect={handleFileSelectWrapper}
        isImporting={importing}
        importResult={importResult}
        isDark={isDark}
        colors={colors}
      />

      {/* Toast notification */}
      {statusMsg && (
        <div style={{
          position: 'fixed', top: 20, right: 20, zIndex: 9999,
          padding: '12px 20px', borderRadius: 10, fontWeight: 600, fontSize: 14,
          background: statusMsg.type === 'error' ? '#fee2e2' : '#d1fae5',
          color: statusMsg.type === 'error' ? '#991b1b' : '#065f46',
          border: `1px solid ${statusMsg.type === 'error' ? '#fecaca' : '#a7f3d0'}`,
          boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
          display: 'flex', alignItems: 'center', gap: 8,
          animation: 'fadeInDown 0.3s ease-out'
        }}>
          {statusMsg.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle size={16} />}
          {statusMsg.text}
        </div>
      )}
    </AdminLayout>
  );
}

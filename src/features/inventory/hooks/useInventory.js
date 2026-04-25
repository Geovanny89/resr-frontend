/**
 * Hook for managing inventory items (insumos)
 * Extracted from Inventory.jsx
 */
import { useState, useEffect, useCallback } from 'react';
import api from '../../../api/client';
import { DEFAULT_ITEM_FORM } from '../constants';

export function useInventory(businessId) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(DEFAULT_ITEM_FORM);
  const [editingId, setEditingId] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);

  const loadItems = useCallback(async (skipCache = false) => {
    if (!businessId) return;
    try {
      setLoading(true);
      const res = await api.get('/inventory/items', {
        params: { businessId, noCache: skipCache || undefined }
      });
      setItems(res.data || []);
    } catch (e) {
      console.error('Error cargando insumos:', e);
    } finally {
      setLoading(false);
    }
  }, [businessId]);

  useEffect(() => {
    if (businessId) {
      loadItems();
    }
  }, [businessId, loadItems]);

  const resetForm = useCallback(() => {
    setForm(DEFAULT_ITEM_FORM);
    setEditingId(null);
  }, []);

  const setEditItem = useCallback((item) => {
    setEditingId(item.id);
    setForm({
      name: item.name,
      description: item.description || '',
      unit: item.unit,
      currentStock: item.currentStock.toString(),
      minStock: item.minStock.toString(),
      costPerUnit: item.costPerUnit ? item.costPerUnit.toString() : '',
      supplier: item.supplier || ''
    });
  }, []);

  const updateFormField = useCallback((field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  }, []);

  const saveItem = useCallback(async (onSuccess, onError) => {
    if (!businessId) return;
    setSaving(true);
    try {
      const payload = {
        ...form,
        currentStock: parseFloat(form.currentStock) || 0,
        minStock: parseFloat(form.minStock) || 0,
        costPerUnit: form.costPerUnit ? parseFloat(form.costPerUnit) : null
      };

      if (editingId) {
        await api.put(`/inventory/items/${editingId}`, payload);
      } else {
        await api.post('/inventory/items', {
          ...payload,
          businessId
        });
      }
      resetForm();
      await loadItems(true);
      onSuccess?.();
    } catch (e) {
      onError?.(e.response?.data?.error || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  }, [businessId, form, editingId, loadItems, resetForm]);

  const deleteItem = useCallback(async (onSuccess, onError) => {
    if (!itemToDelete) return;
    try {
      await api.delete(`/inventory/items/${itemToDelete}`);
      await loadItems(true);
      onSuccess?.();
    } catch (e) {
      onError?.(e.response?.data?.error || 'Error al eliminar');
    }
  }, [itemToDelete, loadItems]);

  const getLowStockItems = useCallback(() => {
    return items.filter(item => 
      parseFloat(item.currentStock) <= parseFloat(item.minStock)
    );
  }, [items]);

  const isLowStock = useCallback((item) => {
    return parseFloat(item.currentStock) <= parseFloat(item.minStock);
  }, []);

  return {
    items,
    loading,
    saving,
    form,
    editingId,
    itemToDelete,
    setItemToDelete,
    setEditItem,
    resetForm,
    updateFormField,
    saveItem,
    deleteItem,
    loadItems,
    getLowStockItems,
    isLowStock
  };
}

export default useInventory;

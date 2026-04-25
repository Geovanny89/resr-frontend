/**
 * Hook for managing inventory usages (consumos)
 * Extracted from Inventory.jsx
 */
import { useState, useEffect, useCallback } from 'react';
import api from '../../../api/client';
import { DEFAULT_USAGE_FORM } from '../constants';

export function useInventoryUsages(businessId, refreshItems) {
  const [usages, setUsages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(DEFAULT_USAGE_FORM);
  const [editingId, setEditingId] = useState(null);
  const [usageToDelete, setUsageToDelete] = useState(null);

  const loadUsages = useCallback(async (skipCache = false) => {
    if (!businessId) return;
    try {
      setLoading(true);
      const res = await api.get('/inventory/usages', {
        params: { businessId, noCache: skipCache || undefined }
      });
      setUsages(res.data || []);
    } catch (e) {
      console.error('Error cargando usos:', e);
    } finally {
      setLoading(false);
    }
  }, [businessId]);

  useEffect(() => {
    if (businessId) {
      loadUsages();
    }
  }, [businessId, loadUsages]);

  const resetForm = useCallback(() => {
    setForm(DEFAULT_USAGE_FORM);
    setEditingId(null);
  }, []);

  const setEditUsage = useCallback((usage) => {
    setEditingId(usage.id);
    setForm({
      itemId: usage.itemId,
      quantity: usage.quantity.toString(),
      date: usage.date.split('T')[0],
      notes: usage.notes || ''
    });
  }, []);

  const updateFormField = useCallback((field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  }, []);

  const saveUsage = useCallback(async (onSuccess, onError) => {
    if (!businessId) return;
    setSaving(true);
    try {
      const payload = {
        ...form,
        quantity: parseFloat(form.quantity)
      };

      if (editingId) {
        await api.put(`/inventory/usages/${editingId}`, payload);
      } else {
        await api.post('/inventory/usages', {
          ...payload,
          businessId
        });
      }
      resetForm();
      await loadUsages(true);
      refreshItems?.();
      onSuccess?.();
    } catch (e) {
      onError?.(e.response?.data?.error || 'Error al guardar consumo');
    } finally {
      setSaving(false);
    }
  }, [businessId, form, editingId, loadUsages, refreshItems, resetForm]);

  const deleteUsage = useCallback(async (onSuccess, onError) => {
    if (!usageToDelete) return;
    try {
      await api.delete(`/inventory/usages/${usageToDelete}`);
      await loadUsages(true);
      refreshItems?.();
      onSuccess?.();
    } catch (e) {
      onError?.(e.response?.data?.error || 'Error al eliminar consumo');
    }
  }, [usageToDelete, loadUsages, refreshItems]);

  return {
    usages,
    loading,
    saving,
    form,
    editingId,
    usageToDelete,
    setUsageToDelete,
    setEditUsage,
    resetForm,
    updateFormField,
    saveUsage,
    deleteUsage,
    loadUsages
  };
}

export default useInventoryUsages;

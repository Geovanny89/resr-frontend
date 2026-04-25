import { useState, useEffect, useCallback } from 'react';
import api from '../../../api/client';

export function useClientTags(businessId) {
  const [availableTags, setAvailableTags] = useState([]);

  const loadTags = useCallback(async (skipCache = false) => {
    if (!businessId) return;
    try {
      const res = await api.get(`/appointments/client-tags?businessId=${businessId}`, skipCache ? { params: { noCache: true } } : {});
      setAvailableTags(res.data || []);
      return res.data;
    } catch (e) {
      console.error('Error loading tags:', e);
      return [];
    }
  }, [businessId]);

  useEffect(() => {
    loadTags();
  }, [loadTags]);

  const saveTag = async (tagData, editingTag = null) => {
    try {
      if (editingTag) {
        await api.put(`/appointments/client-tags/${editingTag.id}`, tagData);
      } else {
        await api.post('/appointments/client-tags', { ...tagData, businessId });
      }
      await loadTags(true);
      return { success: true };
    } catch (e) {
      console.error('Error saving tag:', e);
      return { success: false, error: e.response?.data?.error || 'Error al guardar etiqueta' };
    }
  };

  const deleteTag = async (tagId) => {
    try {
      await api.delete(`/appointments/client-tags/${tagId}`);
      await loadTags(true);
      return { success: true };
    } catch (e) {
      console.error('Error deleting tag:', e);
      return { success: false, error: 'Error al eliminar etiqueta' };
    }
  };

  const assignTag = async (tagId, clientData) => {
    try {
      await api.post('/appointments/client-tags/assign', {
        businessId,
        clientTagId: tagId,
        clientPhone: clientData?.phone,
        clientEmail: clientData?.email,
        clientName: clientData?.name
      });
      return { success: true };
    } catch (e) {
      if (e.response?.status === 409) {
        return { success: false, error: 'Esta etiqueta ya está asignada a este cliente' };
      }
      console.error('Error assigning tag:', e);
      return { success: false, error: 'Error al asignar etiqueta' };
    }
  };

  const removeTag = async (assignmentId) => {
    try {
      await api.delete(`/appointments/client-tags/assign/${assignmentId}`);
      return { success: true };
    } catch (e) {
      console.error('Error removing tag:', e);
      return { success: false, error: 'Error al remover etiqueta' };
    }
  };

  return {
    availableTags,
    loadTags,
    saveTag,
    deleteTag,
    assignTag,
    removeTag
  };
}

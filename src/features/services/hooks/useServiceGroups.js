/**
 * Hook for managing service groups
 * Extracted from Services.jsx
 */
import { useState, useEffect, useCallback } from 'react';
import api from '../../../api/client';
import { DEFAULT_GROUP_FORM } from '../constants';

export function useServiceGroups(businessId) {
  const [serviceGroups, setServiceGroups] = useState([]);
  const [groupForm, setGroupForm] = useState(DEFAULT_GROUP_FORM);
  const [editingGroupId, setEditingGroupId] = useState(null);
  const [groupToDelete, setGroupToDelete] = useState(null);
  const [uploadingGroupImage, setUploadingGroupImage] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);

  const loadServiceGroups = useCallback(async (skipCache = false) => {
    if (!businessId) return;
    try {
      const res = await api.get(`/service-groups?businessId=${businessId}`, skipCache ? { params: { noCache: true } } : {});
      setServiceGroups(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error('Error loading service groups:', e);
      setServiceGroups([]);
    }
  }, [businessId]);

  useEffect(() => {
    if (businessId) {
      loadServiceGroups();
    }
  }, [businessId]);

  const resetGroupForm = useCallback(() => {
    setGroupForm(DEFAULT_GROUP_FORM);
    setEditingGroupId(null);
  }, []);

  const setEditGroup = useCallback((group) => {
    setEditingGroupId(group.id);
    setGroupForm({
      name: group.name,
      description: group.description || '',
      imageUrl: group.imageUrl || '',
      order: group.order || 0
    });
  }, []);

  const updateGroupFormField = useCallback((field, value) => {
    setGroupForm(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleGroupFileUpload = useCallback(async (file) => {
    if (!file) return null;

    const formData = new FormData();
    formData.append('image', file);

    setUploadingGroupImage(true);
    try {
      const res = await api.post('/upload', formData);
      return res.data.url;
    } catch (err) {
      console.error('Error uploading group image:', err);
      throw new Error('Error al subir la imagen del grupo');
    } finally {
      setUploadingGroupImage(false);
    }
  }, []);

  const saveGroup = useCallback(async (onSuccess, onError) => {
    if (!businessId) return;

    try {
      let response;
      if (editingGroupId) {
        response = await api.put(`/service-groups/${editingGroupId}`, groupForm);
        // Actualizar el grupo en la lista inmediatamente
        setServiceGroups(prev => prev.map(g => g.id === editingGroupId ? { ...g, ...response.data } : g));
      } else {
        response = await api.post('/service-groups', { ...groupForm, businessId });
        // Agregar el nuevo grupo a la lista inmediatamente
        setServiceGroups(prev => [...prev, response.data]);
      }
      resetGroupForm();
      onSuccess?.(response?.data);

      // Recargar en segundo plano para asegurar datos frescos sin caché
      await loadServiceGroups(true);
    } catch (e) {
      console.error('[useServiceGroups] Error al guardar grupo:', e);
      onError?.(e.response?.data?.error || 'Error al guardar el grupo');
    }
  }, [businessId, groupForm, editingGroupId, resetGroupForm]);

  const deleteGroup = useCallback(async (groupId, onSuccess, onError) => {
    if (!groupId) return;
    try {
      await api.delete(`/service-groups/${groupId}`);
      // Eliminar el grupo de la lista inmediatamente
      setServiceGroups(prev => prev.filter(g => g.id !== groupId));
      onSuccess?.();
      // Recargar en segundo plano para asegurar datos frescos sin caché
      await loadServiceGroups(true);
    } catch (e) {
      onError?.(e.response?.data?.error || 'Error al eliminar el grupo');
    }
  }, [loadServiceGroups]);

  const closeModal = useCallback(() => {
    setShowGroupModal(false);
    resetGroupForm();
  }, [resetGroupForm]);

  const openModal = useCallback(() => {
    setShowGroupModal(true);
  }, []);

  return {
    serviceGroups,
    groupForm,
    setGroupForm,
    editingGroupId,
    setEditingGroupId,
    groupToDelete,
    setGroupToDelete,
    uploadingGroupImage,
    showGroupModal,
    loadServiceGroups,
    resetGroupForm,
    setEditGroup,
    updateGroupFormField,
    handleGroupFileUpload,
    saveGroup,
    deleteGroup,
    closeModal,
    openModal
  };
}

export default useServiceGroups;

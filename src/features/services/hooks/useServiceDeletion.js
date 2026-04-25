/**
 * Hook for managing service and group deletion flow with confirmation
 * Extracted from Services.jsx
 */
import { useState, useCallback } from 'react';

export function useServiceDeletion(deleteService, deleteGroup, loadServices, showStatus) {
  const [serviceToDelete, setServiceToDelete] = useState(null);
  const [groupToDelete, setGroupToDelete] = useState(null);
  const [showDeleteServiceConfirm, setShowDeleteServiceConfirm] = useState(false);
  const [showDeleteGroupConfirm, setShowDeleteGroupConfirm] = useState(false);

  // Service deletion flow
  const handleDeleteService = useCallback((id) => {
    setServiceToDelete(id);
    setShowDeleteServiceConfirm(true);
  }, []);

  const confirmDeleteService = useCallback(async () => {
    await deleteService(
      serviceToDelete,
      () => {
        showStatus('Servicio eliminado correctamente');
        setShowDeleteServiceConfirm(false);
        setServiceToDelete(null);
      },
      (msg) => {
        showStatus(msg, 'error');
        setShowDeleteServiceConfirm(false);
        setServiceToDelete(null);
      }
    );
  }, [deleteService, showStatus, serviceToDelete]);

  const cancelDeleteService = useCallback(() => {
    setShowDeleteServiceConfirm(false);
    setServiceToDelete(null);
  }, []);

  // Group deletion flow
  const handleDeleteGroup = useCallback((id) => {
    setGroupToDelete(id);
    setShowDeleteGroupConfirm(true);
  }, []);

  const confirmDeleteGroup = useCallback(async () => {
    await deleteGroup(
      groupToDelete,
      () => {
        showStatus('Grupo eliminado correctamente');
        setShowDeleteGroupConfirm(false);
        setGroupToDelete(null);
      },
      (msg) => {
        showStatus(msg, 'error');
        setShowDeleteGroupConfirm(false);
        setGroupToDelete(null);
      }
    );
  }, [deleteGroup, showStatus, groupToDelete]);

  const cancelDeleteGroup = useCallback(() => {
    setShowDeleteGroupConfirm(false);
    setGroupToDelete(null);
  }, []);

  return {
    // Service deletion state
    serviceToDelete,
    showDeleteServiceConfirm,
    // Group deletion state
    groupToDelete,
    showDeleteGroupConfirm,
    // Service deletion handlers
    handleDeleteService,
    confirmDeleteService,
    cancelDeleteService,
    // Group deletion handlers
    handleDeleteGroup,
    confirmDeleteGroup,
    cancelDeleteGroup
  };
}

export default useServiceDeletion;

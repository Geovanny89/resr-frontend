/**
 * Hook for Inventory UI state management
 * Extracted from Inventory.jsx
 */
import { useState, useCallback } from 'react';
import { TABS } from '../constants';

export function useInventoryUI() {
  const [activeTab, setActiveTab] = useState(TABS.ITEMS);
  const [showItemModal, setShowItemModal] = useState(false);
  const [showUsageModal, setShowUsageModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [statusMsg, setStatusMsg] = useState(null);

  const showStatus = useCallback((text, type = 'success') => {
    setStatusMsg({ text, type });
    setTimeout(() => setStatusMsg(null), 3500);
  }, []);

  const openItemModal = useCallback(() => setShowItemModal(true), []);
  const closeItemModal = useCallback(() => {
    setShowItemModal(false);
  }, []);

  const openUsageModal = useCallback(() => setShowUsageModal(true), []);
  const closeUsageModal = useCallback(() => {
    setShowUsageModal(false);
  }, []);

  const openImportModal = useCallback(() => setShowImportModal(true), []);
  const closeImportModal = useCallback(() => {
    setShowImportModal(false);
  }, []);

  const openDeleteConfirm = useCallback(() => setShowDeleteConfirm(true), []);
  const closeDeleteConfirm = useCallback(() => {
    setShowDeleteConfirm(false);
  }, []);

  return {
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
  };
}

export default useInventoryUI;

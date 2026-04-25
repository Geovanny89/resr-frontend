/**
 * Hook for managing Services page UI state
 * Extracted from Services.jsx
 */
import { useState, useEffect, useCallback } from 'react';

export function useServicesUI() {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [expandedDesc, setExpandedDesc] = useState(new Set());
  const [expandedGroups, setExpandedGroups] = useState(new Set());
  const [statusMsg, setStatusMsg] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Delete confirmation modals
  const [showDeleteServiceConfirm, setShowDeleteServiceConfirm] = useState(false);
  const [showDeleteGroupConfirm, setShowDeleteGroupConfirm] = useState(false);

  // Mobile detection
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Toast notification
  const showStatus = useCallback((text, type = 'success') => {
    setStatusMsg({ text, type });
    setTimeout(() => setStatusMsg(null), 3500);
  }, []);

  const clearMessages = useCallback(() => {
    setError('');
    setSuccess('');
  }, []);

  // Description expansion toggle
  const toggleDesc = useCallback((id) => {
    setExpandedDesc(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  const isDescExpanded = useCallback((id) => expandedDesc.has(id), [expandedDesc]);

  // Group expansion toggle
  const toggleGroup = useCallback((groupId) => {
    setExpandedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(groupId)) {
        newSet.delete(groupId);
      } else {
        newSet.add(groupId);
      }
      return newSet;
    });
  }, []);

  const isGroupExpanded = useCallback((groupId) => expandedGroups.has(groupId), [expandedGroups]);

  return {
    isMobile,
    expandedDesc,
    expandedGroups,
    statusMsg,
    error,
    setError,
    success,
    setSuccess,
    showDeleteServiceConfirm,
    setShowDeleteServiceConfirm,
    showDeleteGroupConfirm,
    setShowDeleteGroupConfirm,
    showStatus,
    clearMessages,
    toggleDesc,
    isDescExpanded,
    toggleGroup,
    isGroupExpanded
  };
}

export default useServicesUI;

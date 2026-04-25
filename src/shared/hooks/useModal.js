/**
 * Hook genérico para manejar estado de modales
 * Reduce boilerplate de useState para cada modal
 */
import { useState, useCallback } from 'react';

export function useModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState(null);

  const open = useCallback((modalData = null) => {
    setData(modalData);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setData(null);
  }, []);

  const toggle = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  return {
    isOpen,
    data,
    open,
    close,
    toggle
  };
}

/**
 * Hook para múltiples modales identificados por key
 */
export function useModals(initialModals = {}) {
  const [modals, setModals] = useState(initialModals);

  const open = useCallback((key, data = null) => {
    setModals(prev => ({
      ...prev,
      [key]: { isOpen: true, data }
    }));
  }, []);

  const close = useCallback((key) => {
    setModals(prev => ({
      ...prev,
      [key]: { isOpen: false, data: null }
    }));
  }, []);

  const closeAll = useCallback(() => {
    setModals(prev => {
      const closed = {};
      Object.keys(prev).forEach(key => {
        closed[key] = { isOpen: false, data: null };
      });
      return closed;
    });
  }, []);

  const isOpen = useCallback((key) => {
    return modals[key]?.isOpen || false;
  }, [modals]);

  const getData = useCallback((key) => {
    return modals[key]?.data || null;
  }, [modals]);

  return {
    modals,
    open,
    close,
    closeAll,
    isOpen,
    getData
  };
}

export default useModal;

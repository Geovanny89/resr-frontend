/**
 * Hook para manejar mensajes de estado tipo toast
 * Común en muchos componentes
 */
import { useState, useCallback } from 'react';

export function useStatusMessage(defaultDuration = 3500) {
  const [statusMsg, setStatusMsg] = useState(null);

  const showStatus = useCallback((text, type = 'success', duration = defaultDuration) => {
    setStatusMsg({ text, type });
    
    const timer = setTimeout(() => {
      setStatusMsg(null);
    }, duration);

    return () => clearTimeout(timer);
  }, [defaultDuration]);

  const clearStatus = useCallback(() => {
    setStatusMsg(null);
  }, []);

  const showSuccess = useCallback((text, duration) => {
    return showStatus(text, 'success', duration);
  }, [showStatus]);

  const showError = useCallback((text, duration) => {
    return showStatus(text, 'error', duration);
  }, [showStatus]);

  const showInfo = useCallback((text, duration) => {
    return showStatus(text, 'info', duration);
  }, [showStatus]);

  return {
    statusMsg,
    showStatus,
    showSuccess,
    showError,
    showInfo,
    clearStatus
  };
}

export default useStatusMessage;

/**
 * Hook para manejar la conexión de WhatsApp Business
 * Extraído del Dashboard.jsx para reutilización
 */
import { useState, useEffect, useCallback } from 'react';
import api from '../../../api/client';

export function useWhatsApp(business) {
  const [status, setStatus] = useState('disconnected');
  const [qr, setQr] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const businessId = business?.id;
  const isBranch = business?.isBranch;
  const useParentWhatsApp = business?.useParentWhatsApp;
  const parentBusinessId = business?.parentBusinessId;

  // Determinar qué businessId usar para verificaciones
  const effectiveBusinessId = (isBranch && useParentWhatsApp && parentBusinessId) 
    ? parentBusinessId 
    : businessId;

  const checkStatus = useCallback(async () => {
    if (!effectiveBusinessId) return;
    
    try {
      const res = await api.get(`/notifications/whatsapp/status?businessId=${effectiveBusinessId}`);
      setStatus(res.data.status);
    } catch (e) {
      console.error('[useWhatsApp] Error checking status:', e);
    }
  }, [effectiveBusinessId]);

  const getQR = useCallback(async (force = false) => {
    if (!businessId) return;
    if (isBranch && useParentWhatsApp) return; // No permitir vincular si usa el del padre
    
    setLoading(true);
    setError(null);
    setQr(null);

    try {
      if (force) {
        await api.post(`/notifications/whatsapp/reset?businessId=${businessId}`);
      }

      // Si hay sesión guardada, intentar conectar rápidamente sin QR
      if (status === 'session_saved' && !force) {
        const connectRes = await api.post(`/notifications/whatsapp/connect?businessId=${businessId}`);
        if (connectRes.data.status === 'connected') {
          setStatus('connecting');
          setLoading(false);
          return { success: true, usedSession: true };
        }
      }

      const res = await api.get(`/notifications/whatsapp/qr?businessId=${businessId}`);
      
      if (res.data.qr) {
        setQr(res.data.qr);
        setStatus('connecting');
        return { success: true, qr: res.data.qr };
      } else if (res.data.status === 'connected') {
        setStatus('connected');
        return { success: true, connected: true };
      }
    } catch (e) {
      console.error('[useWhatsApp] Error getting QR:', e);
      const errorMsg = e.response?.data?.error || 'No se pudo generar el código QR';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, [businessId, isBranch, useParentWhatsApp, status]);

  const reset = useCallback(async () => {
    if (!businessId) return { success: false };
    
    setQr(null);
    return await getQR(true);
  }, [businessId, getQR]);

  const stop = useCallback(async () => {
    if (!businessId) return { success: false };
    
    try {
      await api.post(`/notifications/whatsapp/stop?businessId=${businessId}`);
      setStatus('disconnected');
      return { success: true };
    } catch (e) {
      console.error('[useWhatsApp] Error stopping:', e);
      return { success: false, error: e.message };
    }
  }, [businessId]);

  const logout = useCallback(async () => {
    if (!businessId) return { success: false };
    
    try {
      await api.post(`/notifications/whatsapp/logout?businessId=${businessId}`);
      setStatus('disconnected');
      setQr(null);
      return { success: true };
    } catch (e) {
      console.error('[useWhatsApp] Error logging out:', e);
      return { success: false, error: e.message };
    }
  }, [businessId]);

  // Polling automático de estado
  useEffect(() => {
    if (!effectiveBusinessId) return;
    
    checkStatus();
    const interval = setInterval(checkStatus, 10000); // Check cada 10s
    
    return () => clearInterval(interval);
  }, [effectiveBusinessId, checkStatus]);

  return {
    status,
    qr,
    loading,
    error,
    isConnected: status === 'connected' || status === 'session_saved',
    isConnecting: status === 'connecting',
    canConnect: !(isBranch && useParentWhatsApp),
    isBranchUsingParent: isBranch && useParentWhatsApp,
    checkStatus,
    getQR,
    reset,
    stop,
    logout,
    setStatus,
    setQr
  };
}

export default useWhatsApp;

import { useState, useEffect, useCallback } from 'react';
import api from '../../../api/client';

export function useClients(businessId) {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const loadClients = useCallback(async (skipCache = false) => {
    if (!businessId) return;
    setLoading(true);
    try {
      const res = await api.get(`/appointments/clients?businessId=${businessId}&search=${search}`, skipCache ? { params: { noCache: true } } : {});
      setClients(res.data.clients || []);
      return res.data;
    } catch (e) {
      console.error('Error loading clients:', e);
      return null;
    } finally {
      setLoading(false);
    }
  }, [businessId, search]);

  useEffect(() => {
    loadClients();
  }, [loadClients]);

  const updateClient = async (originalPhone, originalEmail, newData) => {
    try {
      await api.put(`/appointments/clients?businessId=${businessId}`, {
        originalPhone,
        originalEmail,
        newName: newData.name,
        newPhone: newData.phone,
        newEmail: newData.email,
        birthday: newData.birthday
      });
      await loadClients(true);
      return { success: true };
    } catch (e) {
      console.error('Error updating client:', e);
      return { success: false, error: e.response?.data?.error || 'Error al actualizar cliente' };
    }
  };

  const mergeClient = async (source, target) => {
    try {
      const res = await api.post(`/appointments/clients/merge?businessId=${businessId}`, {
        source,
        target
      });
      await loadClients(true);
      return { success: true, message: res.data?.message };
    } catch (e) {
      console.error('Error merging client:', e);
      return { success: false, error: e.response?.data?.error || 'Error al fusionar cliente' };
    }
  };

  return {
    clients,
    loading,
    search,
    setSearch,
    loadClients,
    updateClient,
    mergeClient
  };
}

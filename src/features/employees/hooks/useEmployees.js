/**
 * Hook para manejar empleados
 * Extraído de Employees.jsx
 */
import { useState, useEffect, useCallback } from 'react';
import api from '../../../api/client';

const API_BASE_URL = api.defaults.baseURL || '/api';
const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const BACKEND_URL = isLocal ? 'http://localhost:4000' : 'https://api-reservas.k-dice.com';

export function getImgUrl(url) {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  const cleanUrl = url.startsWith('/') ? url : `/${url}`;
  const base = (api.defaults.baseURL && !api.defaults.baseURL.startsWith('/')) 
    ? api.defaults.baseURL.replace('/api', '') 
    : BACKEND_URL;
  return `${base}${cleanUrl}`;
}

export function useEmployees(business) {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [branches, setBranches] = useState([]);
  const [subscriptionInfo, setSubscriptionInfo] = useState(null);
  
  const itemsPerPage = 10;
  const isTechnicalBusiness = business?.isTechnicalServices || false;

  const loadEmployees = useCallback(async (skipCache = false) => {
    if (!business?.id) return;
    setLoading(true);
    try {
      // 1. Cargar empleados del negocio actual
      const params = skipCache ? { businessId: business.id, noCache: true } : { businessId: business.id };
      const res = await api.get('/employees', { params });
      setEmployees(res.data);

      // 2. Si es el negocio principal, cargar sucursales
      if (!business.isBranch) {
        const bParams = skipCache ? { noCache: true } : {};
        const bRes = await api.get('/businesses/my/branches', { params: bParams });
        setBranches(bRes.data || []);
      }
      
      // 3. Cargar información de suscripción
      try {
        const subParams = skipCache ? { businessId: business.id, noCache: true } : { businessId: business.id };
        const subRes = await api.get('/businesses/my/subscription-info', { params: subParams });
        setSubscriptionInfo(subRes.data);
      } catch (subErr) {
        // No se pudo cargar info de suscripción
      }
    } catch (e) {
      setError(e.response?.data?.error || 'Error al cargar empleados');
    } finally {
      setLoading(false);
    }
  }, [business]);

  useEffect(() => {
    loadEmployees();
  }, [loadEmployees]);

  const paginatedEmployees = employees.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(employees.length / itemsPerPage);

  // Crear empleado
  const createEmployee = useCallback(async (data) => {
    console.log('useEmployees - createEmployee llamado', data);
    setSaving(true);
    try {
      const res = await api.post('/employees', data);
      console.log('useEmployees - respuesta del servidor', res.data);
      setSuccess(`✅ Usuario creado exitosamente`);
      await loadEmployees(true);
      return { success: true, data: res.data };
    } catch (e) {
      console.error('useEmployees - error al crear empleado', e);
      const errorMsg = e.response?.data?.error || 'Error al crear empleado';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setSaving(false);
    }
  }, [loadEmployees]);

  // Actualizar empleado
  const updateEmployee = useCallback(async (id, data) => {
    setSaving(true);
    try {
      const res = await api.put(`/employees/${id}`, data);
      setSuccess('Empleado actualizado');
      await loadEmployees(true);
      return { success: true, data: res.data };
    } catch (e) {
      const errorMsg = e.response?.data?.error || 'Error al actualizar empleado';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setSaving(false);
    }
  }, [loadEmployees]);

  // Eliminar empleado
  const deleteEmployee = useCallback(async (id) => {
    try {
      await api.delete(`/employees/${id}`);
      setSuccess('Empleado eliminado correctamente');
      await loadEmployees(true);
      return { success: true };
    } catch (e) {
      const errorMsg = e.response?.data?.error || 'Error al eliminar el empleado';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
  }, [loadEmployees]);

  // Resetear contraseña
  const resetEmployeePassword = useCallback(async (id, newPassword) => {
    setSaving(true);
    try {
      const res = await api.post(`/employees/${id}/reset-password`, { newPassword });
      setSuccess('Contraseña actualizada correctamente');
      return { success: true, tempPassword: res.data.tempPassword };
    } catch (e) {
      const errorMsg = e.response?.data?.error || 'Error al resetear la contraseña';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setSaving(false);
    }
  }, []);

  // Subir foto
  const uploadPhoto = useCallback(async (file) => {
    if (!file.type.startsWith('image/')) {
      return { success: false, error: 'Por favor selecciona una imagen válida' };
    }

    if (file.size > 5 * 1024 * 1024) {
      return { success: false, error: 'La imagen no debe superar 5MB' };
    }

    try {
      const formData = new FormData();
      formData.append('image', file);

      const res = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const photoPath = res.data.path || res.data.url;
      return { success: true, path: photoPath };
    } catch (err) {
      return { success: false, error: err.response?.data?.error || 'Error al subir la foto' };
    }
  }, []);

  const clearMessages = useCallback(() => {
    setError('');
    setSuccess('');
  }, []);

  return {
    // Data
    employees,
    paginatedEmployees,
    loading,
    saving,
    error,
    success,
    branches,
    subscriptionInfo,
    isTechnicalBusiness,
    
    // Pagination
    currentPage,
    setCurrentPage,
    totalPages,
    itemsPerPage,
    
    // Actions
    refresh: loadEmployees,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    resetEmployeePassword,
    uploadPhoto,
    clearMessages,
    getImgUrl
  };
}

export default useEmployees;

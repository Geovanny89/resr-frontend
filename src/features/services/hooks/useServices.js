/**
 * Hook for managing services
 * Extracted from Services.jsx
 */
import { useState, useEffect, useCallback, useMemo } from 'react';
import api from '../../../api/client';
import { DEFAULT_SERVICE_FORM, PAGINATION } from '../constants';

export function useServices(businessId, isTechnicalBusiness) {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(DEFAULT_SERVICE_FORM);
  const [editingId, setEditingId] = useState(null);
  const [serviceToDelete, setServiceToDelete] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [currentPage, setCurrentPage] = useState(PAGINATION.initialPage);
  const [search, setSearch] = useState('');

  const loadServices = useCallback(async (skipCache = false) => {
    if (!businessId) return;
    setLoading(true);
    try {
      const res = await api.get(`/services/business/${businessId}`, skipCache ? { params: { noCache: true } } : {});
      const servicesArray = Array.isArray(res.data) ? res.data : [];
      // Forzar nueva referencia para que React detecte el cambio
      setServices([...servicesArray]);
    } catch (e) {
      console.error('[useServices] Error loading services:', e);
      setServices([]);
    } finally {
      setLoading(false);
    }
  }, [businessId]);

  useEffect(() => {
    if (businessId) {
      loadServices();
    }
  }, [businessId, loadServices]);

  const filteredServices = useMemo(() => {
    let result = [...services];
    
    // Filter by search term
    if (search.trim()) {
      const lowSearch = search.toLowerCase().trim();
      result = result.filter(s => 
        (s.name && s.name.toLowerCase().includes(lowSearch)) ||
        (s.description && s.description.toLowerCase().includes(lowSearch))
      );
    }

    // Sort alphabetically (redundant if backend does it, but safe)
    result.sort((a, b) => (a.name || '').localeCompare(b.name || ''));

    return result;
  }, [services, search]);

  const paginatedServices = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGINATION.itemsPerPage;
    return filteredServices.slice(startIndex, startIndex + PAGINATION.itemsPerPage);
  }, [filteredServices, currentPage]);

  const totalPages = Math.ceil(filteredServices.length / PAGINATION.itemsPerPage);

  const resetForm = useCallback(() => {
    setForm(DEFAULT_SERVICE_FORM);
    setEditingId(null);
  }, []);

  const setEditService = useCallback((service) => {
    setEditingId(service.id);
    setForm({
      name: service.name,
      description: service.description || '',
      price: service.price || '',
      durationMin: service.durationMin,
      isTechnicalService: service.isTechnicalService || false,
      priceOptional: service.priceOptional || false,
      hasEmployeeCommission: service.hasEmployeeCommission !== false,
      imageUrl: service.imageUrl || '',
      color: service.color || '#3b82f6',
      serviceGroupId: service.serviceGroupId || '',
      suppliesCost: service.suppliesCost || 0
    });
  }, []);

  const updateFormField = useCallback((field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleFileUpload = useCallback(async (file) => {
    if (!file) return null;
    
    const formData = new FormData();
    formData.append('image', file);

    setUploading(true);
    try {
      const res = await api.post('/upload', formData);
      return res.data.url;
    } catch (err) {
      console.error('Error uploading image:', err);
      throw new Error('Error al subir la imagen');
    } finally {
      setUploading(false);
    }
  }, []);

  const saveService = useCallback(async (onSuccess, onError) => {
    if (!businessId) return;

    const finalForm = {
      name: form.name,
      description: form.description,
      durationMin: Number(form.durationMin),
      hasEmployeeCommission: form.hasEmployeeCommission,
      imageUrl: form.imageUrl,
      color: form.color,
      serviceGroupId: form.serviceGroupId || null,
      businessId: businessId,
      isTechnicalService: isTechnicalBusiness ? true : false,
      priceOptional: isTechnicalBusiness ? true : (form.price === '' || form.price === null || form.price === undefined),
      price: isTechnicalBusiness ? null : (form.price === '' || form.price === null || form.price === undefined ? null : Number(form.price)),
      suppliesCost: Number(form.suppliesCost || 0)
    };

    try {
      if (editingId) {
        await api.put(`/services/${editingId}`, finalForm);
      } else {
        await api.post('/services', finalForm);
      }
      resetForm();
      setCurrentPage(1);

      // Recargar servicios inmediatamente sin caché
      await loadServices(true);

      onSuccess?.();
    } catch (e) {
      console.error('[useServices] Error al guardar servicio:', e);
      onError?.(e.response?.data?.error || e.response?.data?.message || 'Error al procesar');
    }
  }, [businessId, form, editingId, isTechnicalBusiness, resetForm, setCurrentPage, loadServices]);

  const deleteService = useCallback(async (serviceId, onSuccess, onError) => {
    if (!serviceId) return;
    try {
      await api.delete(`/services/${serviceId}`);
      // Eliminar el servicio de la lista inmediatamente
      setServices(prev => {
        const newServices = prev.filter(s => s.id !== serviceId);
        // Ajustar página si la actual queda vacía
        const newTotalPages = Math.ceil(newServices.length / PAGINATION.itemsPerPage);
        if (currentPage > newTotalPages && newTotalPages > 0) {
          setCurrentPage(newTotalPages);
        }
        return newServices;
      });
      onSuccess?.();
    } catch (e) {
      onError?.(e.response?.data?.error || e.message || 'Error al eliminar el servicio');
    }
  }, [currentPage]);

  return {
    services,
    loading,
    form,
    setForm,
    editingId,
    setEditingId,
    serviceToDelete,
    setServiceToDelete,
    uploading,
    currentPage,
    setCurrentPage,
    search,
    setSearch,
    paginatedServices,
    totalPages,
    totalServices: filteredServices.length,
    loadServices,
    resetForm,
    setEditService,
    updateFormField,
    handleFileUpload,
    saveService,
    deleteService
  };
}

export default useServices;

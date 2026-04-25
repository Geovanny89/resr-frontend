/**
 * Hook para gestionar sucursales del negocio
 * Extraído de MyBusiness.jsx
 */
import { useState, useCallback, useEffect } from 'react';
import api from '../../../api/client';

const defaultBranchForm = {
  name: '',
  type: 'otro',
  address: '',
  phone: '',
  isTechnicalServices: false
};

export function useBranches(onToast, socket) {
  const [branches, setBranches] = useState([]);
  const [showBranchModal, setShowBranchModal] = useState(false);
  const [branchForm, setBranchForm] = useState(defaultBranchForm);
  const [branchScreenshot, setBranchScreenshot] = useState(null);
  const [submittingBranch, setSubmittingBranch] = useState(false);

  const loadBranches = useCallback(async (ctxBizId) => {
    try {
      const bRes = await api.get('/businesses/my/branches');
      setBranches(bRes.data || []);
      return bRes.data || [];
    } catch (branchErr) {
      console.log('No se pudieron cargar las sucursales:', branchErr.message);
      setBranches([]);
      return [];
    }
  }, []);

  // Escuchar actualizaciones de sucursales por socket (opcional)
  useEffect(() => {
    if (!socket) return;

    const handleBranchStatusUpdate = (data) => {
      console.log('📢 [Socket] Actualización de sucursal recibida:', data);
      setBranches(prev => prev.map(b => 
        b.id === data.branchId ? { 
          ...b, 
          branchStatus: data.branchStatus, 
          status: data.status 
        } : b
      ));
      onToast?.(data.approve ? '✅ Sucursal aprobada' : '❌ Sucursal rechazada', data.approve ? 'success' : 'error');
    };

    socket.on('branch:status_updated', handleBranchStatusUpdate);

    return () => {
      socket.off('branch:status_updated', handleBranchStatusUpdate);
    };
  }, [socket, onToast]);

  const handleBranchSubmit = useCallback(async (refreshBusiness, loadBusiness) => {
    if (!branchScreenshot) {
      onToast?.('El comprobante es obligatorio', 'error');
      return;
    }
    
    setSubmittingBranch(true);
    try {
      const fd = new FormData();
      fd.append('image', branchScreenshot);
      const uploadRes = await api.post('/upload', fd, { 
        headers: { 'Content-Type': 'multipart/form-data' } 
      });
      
      const imageUrl = uploadRes.data.url;
      
      const branchData = {
        name: branchForm.name,
        type: branchForm.type || 'otro',
        address: branchForm.address,
        phone: branchForm.phone,
        isTechnicalServices: branchForm.isTechnicalServices || false,
        branchPaymentScreenshot: imageUrl
      };
      
      await api.post('/businesses/request-branch', branchData);
      
      setShowBranchModal(false);
      setBranchForm(defaultBranchForm);
      setBranchScreenshot(null);
      
      onToast?.('✅ Solicitud enviada correctamente al administrador');
      
      if (refreshBusiness) await refreshBusiness();
      if (loadBusiness) await loadBusiness();
      
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message || 'Error al solicitar sucursal';
      onToast?.('❌ ' + errorMsg, 'error');
    } finally {
      setSubmittingBranch(false);
    }
  }, [branchForm, branchScreenshot, onToast]);

  const updateBranchField = useCallback((field, value) => {
    setBranchForm(prev => ({ ...prev, [field]: value }));
  }, []);

  const openBranchModal = useCallback(() => {
    setShowBranchModal(true);
  }, []);

  const closeBranchModal = useCallback(() => {
    setShowBranchModal(false);
    setBranchForm(defaultBranchForm);
    setBranchScreenshot(null);
  }, []);

  return {
    branches,
    setBranches,
    showBranchModal,
    branchForm,
    branchScreenshot,
    submittingBranch,
    loadBranches,
    handleBranchSubmit,
    updateBranchField,
    setBranchScreenshot,
    openBranchModal,
    closeBranchModal
  };
}

export default useBranches;

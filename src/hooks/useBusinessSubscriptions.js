import { useState, useCallback } from 'react';
import api from '../api/client';

const PLANS = {
  basic: { name: 'Básico', price: 70000, includedUsers: 3 },
  pro: { name: 'Pro', price: 90000, includedUsers: 5 },
  premium: { name: 'Premium', price: 130000, includedUsers: 10 }
};

const ADDITIONAL_USER_PRICE = 20000;

export function useBusinessSubscriptions({ businesses, setBusinesses, showToast }) {
  const [subModal, setSubModal] = useState(null);
  const [subForm, setSubForm] = useState({
    subscriptionStatus: '',
    lastPaymentDate: '',
    subscriptionStartDate: '',
    subscriptionEndDate: '',
    subscriptionPlan: 'basic',
    additionalUsers: 0,
    customMonthlyPrice: '',
    paymentAmount: '',
    paymentReference: ''
  });
  const [saving, setSaving] = useState(false);
  
  // Quick add modal state
  const [quickAddModal, setQuickAddModal] = useState(null);
  const [quickAddCount, setQuickAddCount] = useState(1);
  const [quickAdding, setQuickAdding] = useState(false);

  const calculateTotal = useCallback(() => {
    const additional = subForm.additionalUsers === '' ? 0 : (parseInt(subForm.additionalUsers) || 0);
    
    if (subForm.customMonthlyPrice && subForm.customMonthlyPrice !== '') {
      const customPrice = parseInt(subForm.customMonthlyPrice) || 0;
      return customPrice;
    }
    
    const plan = PLANS[subForm.subscriptionPlan] || PLANS.basic;
    return plan.price + (additional * ADDITIONAL_USER_PRICE);
  }, [subForm]);

  const openSubscriptionModal = useCallback((business) => {
    setSubForm({
      subscriptionStatus: business.subscriptionStatus || 'pending',
      lastPaymentDate: business.lastPaymentDate ? business.lastPaymentDate.split('T')[0] : '',
      subscriptionStartDate: business.subscriptionStartDate ? business.subscriptionStartDate.split('T')[0] : '',
      subscriptionEndDate: business.subscriptionEndDate ? business.subscriptionEndDate.split('T')[0] : '',
      subscriptionPlan: business.subscriptionPlan || 'basic',
      additionalUsers: business.additionalUsers || 0,
      customMonthlyPrice: business.customMonthlyPrice || '',
      paymentAmount: business.paymentAmount || '',
      paymentReference: business.paymentReference || ''
    });
    setSubModal(business);
  }, []);

  const handleSubscriptionUpdate = useCallback(async () => {
    if (!subModal) return;
    
    setSaving(true);
    try {
      // Limpiar fechas para evitar 'Invalid date' o strings vacíos que rompan Postgres
      const cleanDate = (d) => (d && d !== '' && d !== 'Invalid date') ? d : null;

      const response = await api.patch(`/businesses/${subModal.id}/subscription-dates`, {
        subscriptionStatus: subForm.subscriptionStatus,
        lastPaymentDate: cleanDate(subForm.lastPaymentDate),
        subscriptionStartDate: cleanDate(subForm.subscriptionStartDate),
        subscriptionEndDate: cleanDate(subForm.subscriptionEndDate),
        paymentAmount: subForm.paymentAmount === '' ? null : parseInt(subForm.paymentAmount),
        paymentReference: subForm.paymentReference
      });
      
      // Actualizar plan y usuarios adicionales
      await api.put(`/businesses/${subModal.id}/subscription-plan`, {
        subscriptionPlan: subForm.subscriptionPlan,
        additionalUsers: parseInt(subForm.additionalUsers) || 0,
        customMonthlyPrice: subForm.customMonthlyPrice === '' ? null : parseInt(subForm.customMonthlyPrice) || null
      });
      
      setBusinesses(prev => prev.map(b => 
        b.id === subModal.id ? { ...b, ...response.data } : b
      ));
      showToast('Suscripción y plan actualizados');
      setSubModal(null);
    } catch (err) {
      console.error('Error:', err);
      showToast('Error al actualizar suscripción', 'error');
    } finally {
      setSaving(false);
    }
  }, [subModal, subForm, setBusinesses, showToast]);

  const handleQuickAddUsers = useCallback(async () => {
    if (!quickAddModal || quickAddCount < 1) return;
    
    setQuickAdding(true);
    try {
      await api.post(`/businesses/${quickAddModal.id}/additional-users`, {
        count: parseInt(quickAddCount)
      });
      
      setBusinesses(prev => prev.map(b => 
        b.id === quickAddModal.id 
          ? { ...b, additionalUsers: (b.additionalUsers || 0) + parseInt(quickAddCount) }
          : b
      ));
      
      showToast(`✅ Se agregaron ${quickAddCount} usuarios a ${quickAddModal.name}`);
      setQuickAddModal(null);
      setQuickAddCount(1);
    } catch (err) {
      showToast('Error al agregar usuarios', 'error');
    } finally {
      setQuickAdding(false);
    }
  }, [quickAddModal, quickAddCount, setBusinesses, showToast]);

  const handleApprovePayment = useCallback(async (bizId, includeBranches = false) => {
    try {
      const response = await api.post(`/businesses/${bizId}/approve-payment`, { includeBranches });
      setBusinesses(prev => prev.map(b => 
        b.id === bizId ? { ...b, ...response.data.business, subscriptionStatus: 'paid' } : b
      ));
      
      const msg = includeBranches 
        ? 'Pago y sucursales aprobados correctamente. Todo activado por 30 días.'
        : 'Pago aprobado correctamente. Suscripción activada por 30 días.';
        
      showToast(msg);
      return true;
    } catch (err) {
      showToast('Error al aprobar el pago', 'error');
      return false;
    }
  }, [setBusinesses, showToast]);

  const handleApproveBranch = useCallback(async (bizId, approve) => {
    try {
      await api.post(`/businesses/${bizId}/approve-branch`, { approve });
      setBusinesses(prev => prev.map(b => 
        b.id === bizId ? { 
          ...b, 
          branchStatus: approve ? 'approved' : 'rejected', 
          status: approve ? 'active' : 'blocked',
          subscriptionStatus: approve ? 'paid' : b.subscriptionStatus
        } : b
      ));
      showToast(approve ? 'Sucursal aprobada y activada' : 'Sucursal rechazada');
      return true;
    } catch (err) {
      showToast('Error al procesar la sucursal', 'error');
      return false;
    }
  }, [setBusinesses, showToast]);

  const openQuickAddModal = useCallback((business) => {
    setQuickAddModal(business);
    setQuickAddCount(1);
  }, []);

  const updateSubForm = useCallback((updates) => {
    setSubForm(prev => ({ ...prev, ...updates }));
  }, []);

  return {
    // Constants
    PLANS,
    ADDITIONAL_USER_PRICE,
    
    // Subscription modal state
    subModal,
    setSubModal,
    subForm,
    updateSubForm,
    
    // Quick add modal state
    quickAddModal,
    setQuickAddModal,
    quickAddCount,
    setQuickAddCount,
    quickAdding,
    
    // Loading state
    saving,
    
    // Actions
    calculateTotal,
    openSubscriptionModal,
    handleSubscriptionUpdate,
    handleQuickAddUsers,
    handleApprovePayment,
    handleApproveBranch,
    openQuickAddModal
  };
}

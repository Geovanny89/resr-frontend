/**
 * Hook para gestionar métodos de pago del negocio
 * Extraído de MyBusiness.jsx
 */
import { useState, useCallback } from 'react';

export function usePaymentMethods(initialMethods = []) {
  const [paymentMethods, setPaymentMethods] = useState(initialMethods);
  const [paymentUploading, setPaymentUploading] = useState(false);

  const addPaymentMethod = useCallback(() => {
    setPaymentMethods(prev => [...prev, { name: '', number: '' }]);
  }, []);

  const removePaymentMethod = useCallback((index) => {
    setPaymentMethods(prev => prev.filter((_, i) => i !== index));
  }, []);

  const updatePaymentMethod = useCallback((index, field, value) => {
    setPaymentMethods(prev => {
      const newMethods = [...prev];
      newMethods[index] = { ...newMethods[index], [field]: value };
      return newMethods;
    });
  }, []);

  const setMethodsFromBusiness = useCallback((methodsData) => {
    let pmt = [];
    try { 
      if (typeof methodsData === 'string') {
        pmt = JSON.parse(methodsData || '[]');
      } else {
        pmt = methodsData || [];
      }
    } catch(e) { 
      pmt = []; 
    }
    setPaymentMethods(pmt);
  }, []);

  return {
    paymentMethods,
    setPaymentMethods,
    paymentUploading,
    setPaymentUploading,
    addPaymentMethod,
    removePaymentMethod,
    updatePaymentMethod,
    setMethodsFromBusiness
  };
}

export default usePaymentMethods;

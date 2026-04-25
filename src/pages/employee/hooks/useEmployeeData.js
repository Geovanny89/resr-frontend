import { useState, useEffect } from 'react';
import api from '../../../api/client';

export const useEmployeeData = () => {
  const [employee, setEmployee] = useState(null);
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadEmployeeInfo = async () => {
    try {
      const response = await api.get('/employees/me/info');
      setEmployee(response.data);
      // También cargar info del negocio
      if (response.data?.businessId) {
        try {
          const bizRes = await api.get(`/businesses/by-id/${response.data.businessId}/public`);
          setBusiness(bizRes.data);
          console.log('Business cargado:', bizRes.data);
          console.log('hasFieldTechnicians:', bizRes.data?.hasFieldTechnicians);
        } catch (bizErr) {
          console.error('Error cargando negocio:', bizErr);
          setError('Error al cargar información del negocio');
        }
      } else {
        console.warn('Empleado sin businessId');
      }
    } catch (err) {
      console.error('Error cargando empleado:', err);
      setError('Error al cargar información del empleado');
    } finally {
      setLoading(false);
    }
  };

  const loadServices = async (businessId) => {
    try {
      const res = await api.get('/services', { params: { businessId, active: true } });
      return res.data;
    } catch (err) {
      console.error('Error al cargar servicios');
      return [];
    }
  };

  useEffect(() => {
    loadEmployeeInfo();
  }, []);

  return {
    employee,
    business,
    loading,
    error,
    loadServices
  };
};

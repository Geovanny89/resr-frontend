import { useState, useEffect, useCallback } from 'react';
import api from '../../../api/client';

const BASE_STEPS = ['Servicio', 'Empleado', 'Fecha', 'Horario', 'Datos'];
const STEPS_WITH_DEPOSIT = ['Servicio', 'Empleado', 'Fecha', 'Horario', 'Datos', 'Anticipo'];

export function useBooking(slug, preselectedEmployeeId, preselectedServiceId) {
  const [business, setBusiness] = useState(null);
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [slots, setSlots] = useState([]);
  const [confirmed, setConfirmed] = useState(false);

  const [selected, setSelected] = useState({
    service: null,
    employee: null,
    date: '',
    slot: null,
    clientName: '',
    clientPhone: '',
    clientEmail: '',
    address: '',
    notes: '',
    depositAccepted: false,
  });

  const [hasPreviousData, setHasPreviousData] = useState(false);
  const [loadingClientData, setLoadingClientData] = useState(true);

  // Paginación
  const [servicesPage, setServicesPage] = useState(1);
  const [employeesPage, setEmployeesPage] = useState(1);

  // Precargar datos del cliente
  useEffect(() => {
    const loadClientData = async () => {
      const savedClientEmail = localStorage.getItem('clientEmail');
      if (savedClientEmail) {
        try {
          const response = await api.get('/appointments/my-client-appointments', {
            params: { email: savedClientEmail }
          });

          if (response.data && response.data.length > 0) {
            const lastApt = response.data[0];
            setSelected(prev => ({
              ...prev,
              clientName: lastApt.clientName || '',
              clientPhone: lastApt.clientPhone || '',
              clientEmail: savedClientEmail,
              address: lastApt.address || '',
            }));

            if (lastApt.clientName && lastApt.clientPhone) {
              setHasPreviousData(true);
            }
          } else {
            setSelected(prev => ({ ...prev, clientEmail: savedClientEmail }));
          }
        } catch (err) {
          setSelected(prev => ({ ...prev, clientEmail: savedClientEmail }));
        } finally {
          setLoadingClientData(false);
        }
      } else {
        setLoadingClientData(false);
      }
    };

    loadClientData();
  }, []);

  // Cargar datos del negocio
  useEffect(() => {
    api.get(`/businesses/${slug}/public`)
      .then(r => {
        setBusiness(r.data);
        const data = r.data;

        let newSelected = {};
        let jumpToStep = 0;

        if (preselectedServiceId && data.Services) {
          const svc = data.Services.find(s => String(s.id) === String(preselectedServiceId));
          if (svc) {
            newSelected.service = svc;
            jumpToStep = 1;
          }
        }

        if (preselectedEmployeeId && data.Employees) {
          const emp = data.Employees.find(e => String(e.id) === String(preselectedEmployeeId));
          if (emp) {
            newSelected.employee = emp;
            if (newSelected.service) jumpToStep = 2;
          }
        }

        if (Object.keys(newSelected).length > 0) {
          setSelected(prev => ({ ...prev, ...newSelected }));
          setStep(jumpToStep);
        }
      })
      .catch(() => setError('Negocio no encontrado'))
      .finally(() => setLoading(false));
  }, [slug, preselectedEmployeeId, preselectedServiceId]);

  // Redirigir si hay empleado preseleccionado
  useEffect(() => {
    if (step === 1 && preselectedEmployeeId) {
      setStep(selected.service ? 2 : 0);
    }
  }, [step, preselectedEmployeeId, selected.service]);

  // Cargar slots disponibles
  useEffect(() => {
    if (step === 3 && selected.date && selected.service) {
      setSlotsLoading(true);
      setSlots([]);
      const params = new URLSearchParams({ date: selected.date, serviceId: selected.service.id });
      api.get(`/businesses/${slug}/availability?${params}`, { params: { noCache: true } })
        .then(r => {
          const filtered = selected.employee
            ? r.data.filter(s => s.employeeId === selected.employee.id)
            : r.data;
          setSlots(filtered);
        })
        .catch(() => setSlots([]))
        .finally(() => setSlotsLoading(false));
    }
  }, [step, selected.date, selected.service, selected.employee, slug]);

  const calculateDepositAmount = useCallback(() => {
    const depositConfig = business?.depositConfig;
    const isDepositRequired = business?.enabledModules?.deposits && depositConfig?.required;

    if (!isDepositRequired || !selected.service) return 0;
    if (depositConfig?.amount > 0) return depositConfig.amount;

    const promo = selected.service?.Promotions && selected.service.Promotions.length > 0
      ? selected.service.Promotions[0]
      : null;
    let servicePrice = selected.service.price || 0;

    if (promo) {
      const discount = promo.discountType === 'percentage'
        ? servicePrice * (Number(promo.discountValue) / 100)
        : Number(promo.discountValue);
      servicePrice = Math.max(0, servicePrice - discount);
    }

    return Math.round(servicePrice * (depositConfig?.percentage || 30) / 100);
  }, [business, selected.service]);

  const depositAmount = calculateDepositAmount();
  const isDepositRequired = business?.enabledModules?.deposits && business?.depositConfig?.required;
  const effectiveSteps = isDepositRequired ? STEPS_WITH_DEPOSIT : BASE_STEPS;
  const maxStep = effectiveSteps.length - 1;

  const primary = business?.primaryColor || '#4f46e5';
  const secondary = business?.secondaryColor || '#7c3aed';
  const gradient = `linear-gradient(135deg, ${primary} 0%, ${secondary} 100%)`;

  return {
    business,
    step,
    setStep,
    loading,
    slotsLoading,
    submitting,
    setSubmitting,
    error,
    setError,
    slots,
    selected,
    setSelected,
    confirmed,
    setConfirmed,
    hasPreviousData,
    loadingClientData,
    servicesPage,
    setServicesPage,
    employeesPage,
    setEmployeesPage,
    depositAmount,
    isDepositRequired,
    effectiveSteps,
    maxStep,
    primary,
    secondary,
    gradient,
    depositConfig: business?.depositConfig,
  };
}

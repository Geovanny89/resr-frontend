/**
 * Hook para gestionar datos del negocio
 * Extraído de MyBusiness.jsx
 */
import { useState, useEffect, useCallback } from 'react';
import api from '../../../api/client';

const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const FALLBACK_BACKEND_URL = isLocal ? 'http://localhost:4000' : 'https://api-reservas.k-dice.com';

export function getImgUrl(url) {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  const cleanUrl = url.startsWith('/') ? url : `/${url}`;
  const base = (api.defaults.baseURL && !api.defaults.baseURL.startsWith('/')) 
    ? api.defaults.baseURL.replace('/api', '') 
    : FALLBACK_BACKEND_URL;
  return `${base}${cleanUrl}`;
}

const defaultFormState = {
  name: '',
  type: 'otro',
  description: '',
  phone: '',
  address: '',
  tagline: '',
  ctaText: 'Reservar cita ahora',
  businessHours: '',
  metaDescription: '',
  isTechnicalServices: false,
  hasFieldTechnicians: false,
  whatsapp: '',
  whatsappCatalog: '',
  instagram: '',
  facebook: '',
  tiktok: '',
  twitter: '',
  pinterest: '',
  youtube: '',
  website: '',
  primaryColor: '#667eea',
  secondaryColor: '#764ba2',
  logoUrl: '',
  bannerUrl: '',
  showPaymentMethods: false,
  mission: '',
  vision: '',
  showMissionVision: false,
  useParentWhatsApp: true,
  googleMapsUrl: '',
  enabledModules: { expenses: false, inventory: false, deposits: false },
  depositConfig: {
    required: false,
    amount: 0,
    percentage: 30,
    cancelationHours: 24,
    penaltyEnabled: true,
    termsText: 'El anticipo garantiza tu cita. Si cancelas con menos de 24 horas de anticipo o no asistes, el anticipo será retenido como penalidad.'
  }
};

export function useBusiness(ctxBiz, refreshBusiness) {
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(defaultFormState);
  const [showWhatsAppReconnect, setShowWhatsAppReconnect] = useState(false);

  const loadBusiness = useCallback(async () => {
    setLoading(true);
    try {
      const url = `/businesses/my/business${ctxBiz?.id ? `?businessId=${ctxBiz.id}` : ''}${ctxBiz?.id ? '&' : '?'}noCache=${Date.now()}`;
      const res = await api.get(url);
      const biz = res.data;
      setBusiness(biz);

      let gal = [];
      try { gal = JSON.parse(biz.gallery || '[]'); } catch(e) { gal = []; }
      
      let pmt = [];
      try { 
        if (typeof biz.paymentMethods === 'string') {
          pmt = JSON.parse(biz.paymentMethods || '[]');
        } else {
          pmt = biz.paymentMethods || [];
        }
      } catch(e) { pmt = []; }

      setForm({
        name: biz.name || '',
        type: biz.type || 'otro',
        description: biz.description || '',
        phone: biz.phone || '',
        address: biz.address || '',
        tagline: biz.tagline || '',
        ctaText: biz.ctaText || 'Reservar cita ahora',
        businessHours: biz.businessHours || '',
        metaDescription: biz.metaDescription || '',
        isTechnicalServices: biz.isTechnicalServices === true,
        hasFieldTechnicians: biz.hasFieldTechnicians === true,
        whatsapp: biz.whatsapp || '',
        whatsappCatalog: biz.whatsappCatalog || '',
        instagram: biz.instagram || '',
        facebook: biz.facebook || '',
        tiktok: biz.tiktok || '',
        twitter: biz.twitter || '',
        pinterest: biz.pinterest || '',
        youtube: biz.youtube || '',
        website: biz.website || '',
        primaryColor: biz.primaryColor || '#667eea',
        secondaryColor: biz.secondaryColor || '#764ba2',
        logoUrl: biz.logoUrl || '',
        bannerUrl: biz.bannerUrl || '',
        showPaymentMethods: biz.showPaymentMethods || false,
        mission: biz.mission || '',
        vision: biz.vision || '',
        showMissionVision: biz.showMissionVision || false,
        useParentWhatsApp: biz.useParentWhatsApp !== undefined ? biz.useParentWhatsApp : true,
        googleMapsUrl: biz.googleMapsUrl || '',
        enabledModules: biz.enabledModules || { expenses: false, inventory: false, deposits: false },
        depositConfig: biz.depositConfig || {
          required: false,
          amount: 0,
          percentage: 30,
          cancelationHours: 24,
          penaltyEnabled: true,
          termsText: 'El anticipo garantiza tu cita. Si cancelas con menos de 24 horas de anticipo o no asistes, el anticipo será retenido como penalidad.'
        }
      });

      return { business: biz, gallery: gal, paymentMethods: pmt };
    } catch(e) {
      if (e.response?.status !== 404) {
        console.error('Error loading business:', e);
      }
      return null;
    } finally {
      setLoading(false);
    }
  }, [ctxBiz?.id]);

  useEffect(() => {
    loadBusiness();
  }, [loadBusiness]);

  const saveBusiness = useCallback(async (gallery, paymentMethods, onSuccess, onError) => {
    setSaving(true);
    try {
      const originalWhatsApp = business?.whatsapp || '';
      const newWhatsApp = form.whatsapp || '';
      const whatsappChanged = originalWhatsApp !== newWhatsApp && newWhatsApp !== '';
      
      const payload = { 
        ...form, 
        gallery: JSON.stringify(gallery), 
        paymentMethods: JSON.stringify(paymentMethods) 
      };
      
      const response = await api.put(`/businesses/my/business${ctxBiz?.id ? `?businessId=${ctxBiz.id}` : ''}`, payload);
      
      // Actualizar el estado local con la respuesta del PUT
      setBusiness(response.data);
      
      // Actualizar el contexto global con los datos actualizados del PUT
      // para que el AdminLayout se actualice inmediatamente
      if (refreshBusiness) {
        await refreshBusiness(response.data);
      }
      
      if (whatsappChanged) {
        setShowWhatsAppReconnect(true);
      }
      
      onSuccess?.(whatsappChanged);
    } catch(e) {
      onError?.(e);
    } finally {
      setSaving(false);
    }
  }, [business, ctxBiz, form, refreshBusiness]);

  const handleReconnectWhatsApp = useCallback(async (onSuccess, onError) => {
    try {
      await api.post(`/notifications/whatsapp/logout?businessId=${business.id}`);
      setShowWhatsAppReconnect(false);
      onSuccess?.();
    } catch (e) {
      onError?.(e);
    }
  }, [business?.id]);

  const updateFormField = useCallback((field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  }, []);

  const updateNestedFormField = useCallback((parent, field, value) => {
    setForm(prev => ({ 
      ...prev, 
      [parent]: { ...(prev[parent] || {}), [field]: value }
    }));
  }, []);

  const updateModuleEnabled = useCallback((module, enabled) => {
    setForm(prev => ({ 
      ...prev, 
      enabledModules: { ...prev.enabledModules, [module]: enabled }
    }));
  }, []);

  const updateDepositConfig = useCallback((field, value) => {
    setForm(prev => ({ 
      ...prev, 
      depositConfig: { ...(prev.depositConfig || {}), [field]: value }
    }));
  }, []);

  const publicUrl = business ? `${window.location.origin}/${business.slug}` : '';
  const previewGradient = `linear-gradient(135deg, ${form.primaryColor || '#667eea'} 0%, ${form.secondaryColor || '#764ba2'} 100%)`;

  return {
    business,
    loading,
    saving,
    form,
    setForm,
    showWhatsAppReconnect,
    setShowWhatsAppReconnect,
    loadBusiness,
    saveBusiness,
    handleReconnectWhatsApp,
    updateFormField,
    updateNestedFormField,
    updateModuleEnabled,
    updateDepositConfig,
    publicUrl,
    previewGradient,
    getImgUrl
  };
}

export default useBusiness;

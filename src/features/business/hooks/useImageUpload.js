/**
 * Hook para gestionar subida de imágenes (logo, banner, comprobantes)
 * Extraído de MyBusiness.jsx
 */
import { useState, useCallback } from 'react';
import api from '../../../api/client';

export function useImageUpload(onToast) {
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);

  const handleUploadImage = useCallback(async (file, onSuccess) => {
    if (!file) return;
    try {
      const fd = new FormData();
      fd.append('image', file);
      const res = await api.post('/upload', fd, { 
        headers: { 'Content-Type': 'multipart/form-data' } 
      });
      onSuccess?.(res.data.url);
      onToast?.('Imagen subida correctamente');
      return res.data.url;
    } catch(e) {
      onToast?.('Error al subir imagen', 'error');
      return null;
    }
  }, [onToast]);

  const uploadLogo = useCallback(async (file, onSuccess) => {
    setUploadingLogo(true);
    const url = await handleUploadImage(file, onSuccess);
    setUploadingLogo(false);
    return url;
  }, [handleUploadImage]);

  const uploadBanner = useCallback(async (file, onSuccess) => {
    setUploadingBanner(true);
    const url = await handleUploadImage(file, onSuccess);
    setUploadingBanner(false);
    return url;
  }, [handleUploadImage]);

  const handlePaymentUpload = useCallback(async (file, onSuccess, onError) => {
    if (!file) return;
    try {
      const fd = new FormData();
      fd.append('screenshot', file);
      await api.post('/businesses/my/payment-screenshot', fd, { 
        headers: { 'Content-Type': 'multipart/form-data' } 
      });
      onToast?.('Comprobante enviado correctamente');
      onSuccess?.();
    } catch(e) {
      onToast?.('Error al subir comprobante', 'error');
      onError?.(e);
    }
  }, [onToast]);

  return {
    uploadingLogo,
    uploadingBanner,
    uploadLogo,
    uploadBanner,
    handlePaymentUpload,
    handleUploadImage
  };
}

export default useImageUpload;

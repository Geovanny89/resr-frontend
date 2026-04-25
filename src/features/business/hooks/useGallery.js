/**
 * Hook para gestionar la galería de imágenes del negocio
 * Extraído de MyBusiness.jsx
 */
import { useState, useCallback } from 'react';
import api from '../../../api/client';

const MAX_GALLERY_IMAGES = 20;

export function useGallery(initialGallery = [], onToast) {
  const [gallery, setGallery] = useState(initialGallery);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [imageToDelete, setImageToDelete] = useState(null);

  const handleGalleryUpload = useCallback(async (files) => {
    if (!files || files.length === 0) return;
    
    const currentCount = gallery.length;
    const newCount = currentCount + files.length;
    
    if (currentCount >= MAX_GALLERY_IMAGES) {
      onToast?.(`Solo puedes subir ${MAX_GALLERY_IMAGES} fotos. Elimina algunas para subir más.`, 'error');
      return;
    }
    
    if (newCount > MAX_GALLERY_IMAGES) {
      const allowed = MAX_GALLERY_IMAGES - currentCount;
      onToast?.(`Solo puedes subir ${allowed} foto(s) más. Límite: ${MAX_GALLERY_IMAGES} fotos.`, 'error');
      return;
    }
    
    setUploadingGallery(true);
    try {
      const fd = new FormData();
      Array.from(files).forEach(f => fd.append('images', f));
      const res = await api.post('/upload/gallery', fd, { 
        headers: { 'Content-Type': 'multipart/form-data' } 
      });
      setGallery(g => [...g, ...res.data.urls]);
      onToast?.(`${res.data.urls.length} imagen(es) subida(s)`);
      return res.data.urls;
    } catch(e) {
      onToast?.('Error al subir imágenes', 'error');
      return null;
    } finally {
      setUploadingGallery(false);
    }
  }, [gallery, onToast]);

  const handleRemoveGalleryImage = useCallback((url) => {
    setImageToDelete(url);
    setShowDeleteConfirm(true);
  }, []);

  const confirmDeleteImage = useCallback(async () => {
    if (!imageToDelete) return;
    try {
      await api.delete('/upload/gallery/remove', { data: { url: imageToDelete } });
      setGallery(g => g.filter(u => u !== imageToDelete));
      onToast?.('Imagen eliminada correctamente');
    } catch(e) {
      onToast?.('Error al eliminar imagen', 'error');
    } finally {
      setShowDeleteConfirm(false);
      setImageToDelete(null);
    }
  }, [imageToDelete, onToast]);

  const cancelDelete = useCallback(() => {
    setShowDeleteConfirm(false);
    setImageToDelete(null);
  }, []);

  const setGalleryFromBusiness = useCallback((galleryData) => {
    let gal = [];
    try { 
      gal = typeof galleryData === 'string' 
        ? JSON.parse(galleryData || '[]') 
        : (galleryData || []);
    } catch(e) { 
      gal = []; 
    }
    setGallery(gal);
  }, []);

  return {
    gallery,
    setGallery,
    uploadingGallery,
    showDeleteConfirm,
    imageToDelete,
    handleGalleryUpload,
    handleRemoveGalleryImage,
    confirmDeleteImage,
    cancelDelete,
    setGalleryFromBusiness,
    MAX_GALLERY_IMAGES
  };
}

export default useGallery;

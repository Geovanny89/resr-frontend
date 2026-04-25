/**
 * Payments Feature - PDF Utilities
 */
import api from '../../../api/client';

// Extraer la URL base del backend desde el cliente API
const API_BASE_URL = api.defaults.baseURL || '';
const BACKEND_URL = API_BASE_URL.replace(/\/api$/, '');

export async function loadLogoImage(logoUrl) {
  if (!logoUrl) return null;
  try {
    let fullUrl = logoUrl;
    if (logoUrl.startsWith('/')) {
      fullUrl = `${BACKEND_URL}${logoUrl}`;
    } else if (!logoUrl.startsWith('http')) {
      fullUrl = `${BACKEND_URL}/${logoUrl}`;
    }
    
    return new Promise((resolve) => {
      const img = new Image();
      console.log('Loading logo from:', fullUrl);
      img.crossOrigin = 'Anonymous';
      img.onload = () => {
        console.log('Logo image loaded successfully');
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        try {
          const dataURL = canvas.toDataURL('image/png');
          resolve(dataURL);
        } catch (e) {
          console.error('Canvas toDataURL failed (CORS?):', e);
          resolve(null);
        }
      };
      img.onerror = (e) => {
        console.error('Error loading image via object:', e);
        resolve(null);
      };
      img.src = fullUrl;
    });
  } catch (e) {
    console.error('Error in loadLogoImage:', e);
    return null;
  }
}

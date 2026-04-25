import api from '../../../api/client';

const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const BACKEND_URL = isLocal ? 'http://localhost:4000' : 'https://api-reservas.k-dice.com';

export function getImgUrl(url) {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  const cleanUrl = url.startsWith('/') ? url : `/${url}`;
  const base = (api.defaults.baseURL && !api.defaults.baseURL.startsWith('/'))
    ? api.defaults.baseURL.replace('/api', '')
    : BACKEND_URL;
  return `${base}${cleanUrl}`;
}

export function getGoogleMapsEmbedUrl(url) {
  if (!url) return null;

  if (url.includes('/embed')) return url;

  if (url.includes('maps.app.goo.gl') || url.includes('goo.gl/maps')) {
    return { isShortUrl: true, url };
  }

  if (url.includes('google.com/maps/place')) {
    const coordMatch = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (coordMatch) {
      const lat = coordMatch[1];
      const lng = coordMatch[2];
      return `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3000!2d${lng}!3d${lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0!2z${lat},${lng}!5e0!3m2!1ses!2sco!4v1`;
    }

    try {
      const urlObj = new URL(url);
      const q = urlObj.searchParams.get('q');
      if (q) {
        return `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3000!2d0!3d0!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0!2s${encodeURIComponent(q)}!5e0!3m2!1ses!2sco!4v1`;
      }
    } catch (e) {
      // URL inválida
    }

    const placeMatch = url.match(/\/place\/([^/@]+)/);
    if (placeMatch) {
      const placeName = decodeURIComponent(placeMatch[1].replace(/\+/g, ' '));
      return `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3000!2d0!3d0!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0!2s${encodeURIComponent(placeName)}!5e0!3m2!1ses!2sco!4v1`;
    }
  }

  return url;
}

export function isShortGoogleMapsUrl(url) {
  if (!url) return false;
  return url.includes('maps.app.goo.gl') || url.includes('goo.gl/maps');
}

export function getPaymentMethodImage(name) {
  const lower = (name || '').toLowerCase();
  if (lower.includes('nequi')) return '/nequi.png';
  if (lower.includes('daviplata')) return '/daviplat.png';
  if (lower.includes('llave') || lower.includes('breb-b') ||
      lower.includes('bre-b') || lower.includes('breb')) return '/Bre-B.png';
  if (lower.includes('davivienda')) return '/davivienda.png';
  if (lower.includes('bancolombia')) return '/bancolombia.png';
  if (lower.includes('banco')) return '/banco.png';
  return null;
}

import { useEffect, useState } from 'react';

/**
 * Hook personalizado para detectar si la app está corriendo como APK embebida
 * con un slug específico.
 * 
 * Retorna:
 * - embeddedSlug: El slug embebido (ej: 'latotyy'), o null si no está embebido
 * - isEmbedded: Boolean indicando si la app está embebida
 */
export function useEmbeddedSlug() {
  const [embeddedSlug, setEmbeddedSlug] = useState(null);
  const [isEmbedded, setIsEmbedded] = useState(false);

  useEffect(() => {
    // Método 1: Variable de entorno (para builds específicos)
    const envSlug = process.env.REACT_APP_BUSINESS_SLUG;
    if (envSlug) {
      setEmbeddedSlug(envSlug);
      setIsEmbedded(true);
      return;
    }

    // Método 2: Window variable (para inyección en tiempo de ejecución)
    if (window.__KDICE_EMBEDDED_SLUG__) {
      setEmbeddedSlug(window.__KDICE_EMBEDDED_SLUG__);
      setIsEmbedded(true);
      return;
    }

    // Método 3: LocalStorage (para persistencia entre recargas)
    const storedSlug = localStorage.getItem('kdice_embedded_slug');
    if (storedSlug) {
      setEmbeddedSlug(storedSlug);
      setIsEmbedded(true);
      return;
    }

    setIsEmbedded(false);
  }, []);

  return { embeddedSlug, isEmbedded };
}

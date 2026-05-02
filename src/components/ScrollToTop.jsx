import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Usar window.scrollTo(0, 0) de forma inmediata
    window.scrollTo(0, 0);
    
    // También intentar hacer scroll en el contenedor principal si existe
    const mainContent = document.querySelector('.main-content');
    if (mainContent) mainContent.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

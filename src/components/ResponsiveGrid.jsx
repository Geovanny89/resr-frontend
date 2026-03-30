import { useState } from 'react';

/**
 * Componente ResponsiveGrid
 * 
 * Grilla que se adapta automáticamente:
 * - Desktop (1024px+): 4 columnas
 * - Tablet (768px-1024px): 2 columnas
 * - Móvil (<768px): 1 columna
 * 
 * Props:
 * - children: Elementos a mostrar en la grilla
 * - gap: Espacio entre items (default: 16)
 * - minWidth: Ancho mínimo de cada item (default: 200px)
 */
export default function ResponsiveGrid({ 
  children, 
  gap = 16,
  minWidth = 200
}) {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isTablet, setIsTablet] = useState(window.innerWidth <= 1024);

  useState(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      setIsTablet(window.innerWidth <= 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  let columns = 4;
  if (isMobile) columns = 1;
  else if (isTablet) columns = 2;

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: gap,
        width: '100%'
      }}
    >
      {children}
    </div>
  );
}

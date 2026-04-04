import { useState, useEffect } from 'react';

/**
 * Componente ResponsiveGrid
 * 
 * Grilla que se adapta automáticamente:
 * - Desktop (1024px+): 4 columnas
 * - Tablet (768px-1024px): 2 columnas  
 * - Móvil (<768px): 1-2 columnas según minWidth
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
  const [columns, setColumns] = useState(4);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width <= 640) {
        setColumns(1);
      } else if (width <= 1024) {
        setColumns(2);
      } else {
        setColumns(4);
      }
    };
    
    handleResize(); // Initial check
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

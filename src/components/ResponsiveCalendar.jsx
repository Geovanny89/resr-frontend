import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * Componente ResponsiveCalendar
 * 
 * Calendario que se adapta a móviles:
 * - Desktop: Calendario completo
 * - Móvil: Vista simplificada con lista de días
 * 
 * Props:
 * - onDateSelect: Función cuando se selecciona una fecha
 * - selectedDate: Fecha seleccionada (Date object)
 * - disabledDates: Array de fechas deshabilitadas
 */
export default function ResponsiveCalendar({
  onDateSelect,
  selectedDate = new Date(),
  disabledDates = [],
  minDate = null,
  maxDate = null
}) {
  const [currentMonth, setCurrentMonth] = useState(new Date(selectedDate));
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useState(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const isDateDisabled = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    if (disabledDates.includes(dateStr)) return true;
    if (minDate && date < minDate) return true;
    if (maxDate && date > maxDate) return true;
    return false;
  };

  const isDateSelected = (date) => {
    return (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    );
  };

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const handleDateClick = (day) => {
    const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    if (!isDateDisabled(newDate)) {
      onDateSelect?.(newDate);
    }
  };

  const monthName = currentMonth.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
  const daysInMonth = getDaysInMonth(currentMonth);
  const firstDay = getFirstDayOfMonth(currentMonth);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyDays = Array.from({ length: firstDay }, (_, i) => i);

  // VISTA MÓVIL: Lista de días
  if (isMobile) {
    return (
      <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', padding: 16 }}>
        {/* Navegación */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <button
            onClick={handlePrevMonth}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
          >
            <ChevronLeft size={20} color="var(--primary)" />
          </button>
          <h3 style={{ fontSize: 14, fontWeight: 700, textTransform: 'capitalize', margin: 0 }}>
            {monthName}
          </h3>
          <button
            onClick={handleNextMonth}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
          >
            <ChevronRight size={20} color="var(--primary)" />
          </button>
        </div>

        {/* Lista de días */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8 }}>
          {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
            <div
              key={day}
              style={{
                textAlign: 'center',
                fontSize: 10,
                fontWeight: 600,
                color: 'var(--text-muted)',
                padding: 4
              }}
            >
              {day}
            </div>
          ))}
          {emptyDays.map((_, i) => (
            <div key={`empty-${i}`} />
          ))}
          {days.map(day => {
            const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
            const disabled = isDateDisabled(date);
            const selected = isDateSelected(date);

            return (
              <button
                key={day}
                onClick={() => handleDateClick(day)}
                disabled={disabled}
                style={{
                  padding: 8,
                  borderRadius: 'var(--radius-sm)',
                  border: selected ? '2px solid var(--primary)' : '1px solid var(--border)',
                  background: selected ? 'var(--primary-bg)' : 'var(--surface)',
                  color: disabled ? 'var(--text-light)' : 'var(--text)',
                  fontSize: 12,
                  fontWeight: selected ? 600 : 400,
                  cursor: disabled ? 'not-allowed' : 'pointer',
                  opacity: disabled ? 0.5 : 1,
                  transition: 'all 0.2s'
                }}
              >
                {day}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // VISTA DESKTOP: Calendario completo
return (
    <div style={{ 
      background: 'var(--surface)', 
      borderRadius: 'var(--radius)', 
      border: '1px solid var(--border)', 
      padding: '12px', // Reduje un poco el padding
      width: '100%',   // Ocupa el 100% de la columna de 300px o 380px que definiste
      boxSizing: 'border-box'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <button onClick={handlePrevMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
          <ChevronLeft size={18} color="var(--primary)" />
        </button>
        <h3 style={{ fontSize: 14, fontWeight: 700, textTransform: 'capitalize', margin: 0 }}>
          {monthName}
        </h3>
        <button onClick={handleNextMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
          <ChevronRight size={18} color="var(--primary)" />
        </button>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(7, 1fr)', 
        gap: '4px', // Reduje el espacio entre días para que quepan mejor
        width: '100%' 
      }}>
        {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
          <div key={day} style={{ 
            textAlign: 'center', 
            fontSize: 11, // Texto más pequeño para los encabezados
            fontWeight: 600, 
            color: 'var(--text-muted)', 
            paddingBottom: 8 
          }}>
            {day.substring(0, 1)} {/* Solo la primera letra (D, L, M...) ayuda a ahorrar espacio */}
          </div>
        ))}
        
        {emptyDays.map((_, i) => <div key={`empty-${i}`} />)}
        
        {days.map(day => {
          const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
          const disabled = isDateDisabled(date);
          const selected = isDateSelected(date);
          
          return (
            <button
              key={day}
              onClick={() => handleDateClick(day)}
              disabled={disabled}
              style={{
                aspectRatio: '1 / 1',
                width: '100%', // Se ajusta al ancho de la columna del grid
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '6px',
                border: selected ? '2px solid var(--primary)' : '1px solid transparent', // Borde transparente para evitar saltos
                background: selected ? 'var(--primary-bg)' : 'transparent',
                color: disabled ? 'var(--text-light)' : (selected ? 'var(--primary)' : 'var(--text)'),
                fontSize: 12,
                fontWeight: selected ? 700 : 400,
                cursor: disabled ? 'not-allowed' : 'pointer',
                opacity: disabled ? 0.4 : 1,
                padding: 0,
                transition: 'all 0.2s'
              }}
              onMouseEnter={e => !disabled && !selected && (e.target.style.background = '#f3f4f6')}
              onMouseLeave={e => !disabled && !selected && (e.target.style.background = 'transparent')}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );

}

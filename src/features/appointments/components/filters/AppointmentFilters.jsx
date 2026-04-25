/**
 * Componente de filtros para citas
 * Extraído de Appointments.jsx
 * Incluye: Calendario de selección de fecha + Filtro por empleado
 */
import { Calendar as CalendarIcon } from 'lucide-react';
import ResponsiveCalendar from '../../../../components/ResponsiveCalendar';

/**
 * Componente de filtros de citas
 * @param {Object} props
 * @param {Date} props.selectedDate - Fecha seleccionada
 * @param {Function} props.onDateSelect - Callback al seleccionar fecha
 * @param {string} props.selectedEmployeeId - ID del empleado seleccionado
 * @param {Function} props.onEmployeeChange - Callback al cambiar empleado
 * @param {Array} props.employees - Lista de empleados [{id, User: {name}}]
 * @param {Function} props.getDisabledDates - Función para obtener fechas deshabilitadas
 * @param {Object} props.colors - Objeto de colores del tema
 * @param {boolean} props.isMobile - Si es vista móvil
 * @param {object} props.style - Estilos adicionales para el contenedor
 */
export function AppointmentFilters({
  selectedDate,
  onDateSelect,
  selectedEmployeeId,
  onEmployeeChange,
  employees,
  getDisabledDates,
  colors,
  isMobile = false,
  style = {}
}) {
  const handleClearFilter = () => {
    onEmployeeChange('');
  };

  return (
    <div className="card" style={{ 
      width: '100%', 
      position: isMobile ? 'relative' : 'sticky',
      top: isMobile ? 0 : '20px',
      padding: '20px',
      ...style
    }}>
      {/* Sección de Calendario */}
      <h3 style={{ 
        fontSize: 15, 
        fontWeight: 800, 
        marginBottom: 16, 
        color: colors.text, 
        display: 'flex', 
        alignItems: 'center', 
        gap: 8 
      }}>
        <CalendarIcon size={18} color={colors.primary} />
        Selecciona fecha
      </h3>
      <ResponsiveCalendar
        onDateSelect={onDateSelect}
        selectedDate={selectedDate}
        disabledDates={getDisabledDates ? getDisabledDates() : []}
      />
      
      {/* Selector de Empleado */}
      <div style={{ 
        marginTop: 20, 
        paddingTop: 16, 
        borderTop: `1px solid ${colors.border}` 
      }}>
        <h3 style={{ 
          fontSize: 14, 
          fontWeight: 700, 
          marginBottom: 10, 
          color: colors.text, 
          display: 'flex', 
          alignItems: 'center', 
          gap: 6 
        }}>
          👤 Filtrar por Empleado
        </h3>
        <select
          value={selectedEmployeeId}
          onChange={(e) => onEmployeeChange(e.target.value)}
          style={{
            width: '100%',
            padding: '10px 12px',
            borderRadius: 8,
            border: `1px solid ${colors.border}`,
            background: colors.cardBg,
            color: colors.text,
            fontSize: 14,
            cursor: 'pointer'
          }}
        >
          <option value="">📋 Todos los empleados</option>
          {employees.map(emp => (
            <option key={emp.id} value={emp.id}>
              {emp.User?.name || 'Sin nombre'}
            </option>
          ))}
        </select>
        {selectedEmployeeId && (
          <button
            onClick={handleClearFilter}
            style={{
              marginTop: 8,
              padding: '6px 12px',
              fontSize: 12,
              color: colors.primary,
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            ✕ Limpiar filtro
          </button>
        )}
      </div>
    </div>
  );
}

export default AppointmentFilters;

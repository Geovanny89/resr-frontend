// Helper functions for reports

export const MONTHS_ES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export const DAYS_ES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

export const STATUS_LABELS = {
  pending: 'Pendiente',
  confirmed: 'Confirmada',
  attention: 'En atención',
  done: 'Completada',
  cancelled: 'Cancelada',
};

export const STATUS_CONFIG = {
  pending: { bg: '#fef3c7', color: '#92400e', label: 'Pendiente' },
  confirmed: { bg: '#dbeafe', color: '#1e40af', label: 'Confirmada' },
  attention: { bg: '#ede9fe', color: '#5b21b6', label: 'En atención' },
  done: { bg: '#d1fae5', color: '#065f46', label: 'Completada' },
  cancelled: { bg: '#fee2e2', color: '#991b1b', label: 'Cancelada' },
};

export const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6'];

export const EXPENSE_CATEGORIES = {
  arriendo: '🏠 Arriendo',
  servicios: '💡 Servicios',
  insumos: '📦 Insumos',
  nomina: '👥 Nómina',
  marketing: '📢 Marketing',
  otros: '📋 Otros'
};

export function todayColombia() {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'America/Bogota' });
}

export function buildCalendarDays(year, month) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);
  return days;
}

export function formatDateES(dateStr) {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const names = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
  return `${names[date.getDay()]}, ${d} de ${MONTHS_ES[m - 1]}`;
}

export function getDateRange(period, customStart, customEnd) {
  const todayStr = todayColombia();
  const now = new Date(`${todayStr}T00:00:00-05:00`);

  if (period === 'day') {
    const s = new Date(now);
    const e = new Date(now);
    e.setHours(23, 59, 59, 999);
    return { start: s, end: e, label: 'Hoy' };
  }
  if (period === 'week') {
    const s = new Date(now);
    s.setDate(now.getDate() - now.getDay());
    const e = new Date(s);
    e.setDate(s.getDate() + 6);
    e.setHours(23, 59, 59, 999);
    return { start: s, end: e, label: 'Esta semana' };
  }
  if (period === 'month') {
    const s = new Date(now.getFullYear(), now.getMonth(), 1);
    const e = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    return { start: s, end: e, label: 'Este mes' };
  }
  if (period === 'custom' && customStart && customEnd) {
    return {
      start: new Date(`${customStart}T00:00:00-05:00`),
      end: new Date(`${customEnd}T23:59:59-05:00`),
      label: `${formatDateES(customStart)} → ${formatDateES(customEnd)}`,
    };
  }
  return null;
}

// Calculate statistics from appointments
export function calculateStats(appointments, business) {
  const done = appointments.filter((a) => a.status === 'done');
  
  // Usar finalPrice si existe (es el valor real en Caja), sino sumar base + adicional
  const totalRev = done.reduce((s, a) => {
    const price = a.finalPrice !== undefined && a.finalPrice !== null 
      ? parseFloat(a.finalPrice) 
      : (parseFloat(a.basePrice || 0) + parseFloat(a.additionalAmount || 0));
    return s + price;
  }, 0);

  const empRev = done.reduce((s, a) => {
    // Para el pago al empleado, calculamos sobre el total generado en esa cita
    const priceForCommission = a.finalPrice !== undefined && a.finalPrice !== null 
      ? parseFloat(a.finalPrice) 
      : (parseFloat(a.basePrice || 0) + parseFloat(a.additionalAmount || 0));
      
    const commPct = parseFloat(a.Employee?.commissionPct || 0);
    const earned = a.employeeEarns
      ? parseFloat(a.employeeEarns)
      : (priceForCommission * commPct) / 100;
    return s + (isNaN(earned) ? 0 : earned);
  }, 0);

  const totalSupplies = done.reduce((s, a) => s + parseFloat(a.suppliesCost || 0), 0);
  const ownerRev = totalRev - empRev - totalSupplies;

  return {
    done,
    totalRev,
    empRev,
    ownerRev,
    totalSupplies,
    totalAppointments: appointments.length,
    pendingCount: appointments.filter((a) => a.status === 'pending').length,
    cancelledCount: appointments.filter((a) => a.status === 'cancelled').length,
  };
}

// Group data by status for pie chart
export function groupByStatus(appointments) {
  return Object.entries(
    appointments.reduce((acc, a) => {
      acc[a.status] = (acc[a.status] || 0) + 1;
      return acc;
    }, {})
  ).map(([status, count]) => ({
    name: STATUS_LABELS[status] || status,
    value: count,
  }));
}

// Group data by employee for bar chart - ACTUALIZADO para procesar todas las citas
export function groupByEmployee(appointments, isTechnical = false) {
  return Object.entries(
    appointments.reduce((acc, a) => {
      const name = a.Employee?.User?.name || 'Sin asignar';
      if (!acc[name]) {
        acc[name] = { 
          name, 
          total: 0,           // Total de citas
          done: 0,            // Citas completadas
          cancelled: 0,      // Citas canceladas
          pending: 0,        // Citas pendientes
          confirmed: 0,      // Citas confirmadas
          attention: 0,      // Citas en atención
          ingresos: 0,
          serviceDates: []
        };
      }
      
      // Incrementar el total de citas
      acc[name].total++;
      
      // Incrementar según el estado
      acc[name][a.status] = (acc[name][a.status] || 0) + 1;
      
      // Agregar fecha para cálculo de promedio por día (solo citas completadas)
      if (a.status === 'done' && a.startTime) {
        acc[name].serviceDates.push(new Date(a.startTime));
        
        // Calcular ingresos solo de citas completadas
        if (!isTechnical) {
          const price = a.finalPrice !== undefined && a.finalPrice !== null 
            ? parseFloat(a.finalPrice) 
            : (parseFloat(a.basePrice || 0) + parseFloat(a.additionalAmount || 0));
          acc[name].ingresos += price;
        }
      }
      
      return acc;
    }, {})
  ).map(([name, data]) => {
    // Calcular promedio de servicios por día (solo citas completadas)
    const uniqueDays = new Set(data.serviceDates.map(d => d.toDateString())).size;
    const avgServicesPerDay = uniqueDays > 0 ? data.serviceDates.length / uniqueDays : 0;
    
    // Mantener compatibilidad con el formato anterior que usaba 'citas'
    return {
      name: data.name,
      citas: data.done,        // Para compatibilidad con gráficas existentes
      done: data.done,
      cancelled: data.cancelled,
      pending: data.pending,
      confirmed: data.confirmed,
      attention: data.attention,
      total: data.total,       // Total real de citas
      ingresos: data.ingresos,
      avgServicesPerDay: avgServicesPerDay
    };
  });
}

// Group data by service for list
export function groupByService(done, isTechnical = false) {
  return Object.entries(
    done.reduce((acc, a) => {
      const name = a.Service?.name || 'Sin servicio';
      if (!acc[name]) acc[name] = { name, count: 0, revenue: 0 };
      acc[name].count++;
      if (!isTechnical) {
        const price = a.finalPrice !== undefined && a.finalPrice !== null 
          ? parseFloat(a.finalPrice) 
          : (parseFloat(a.basePrice || 0) + parseFloat(a.additionalAmount || 0));
        acc[name].revenue += price;
      }
      return acc;
    }, {})
  )
    .map(([, v]) => v)
    .sort((a, b) => b.revenue - a.revenue);
}

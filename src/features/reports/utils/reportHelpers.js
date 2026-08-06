// Helper functions for reports

// Parsea un valor como float y retorna 0 si es NaN (protege contra valores 'NaN' en la BD)
const safeFloat = (val) => { const n = parseFloat(val); return isNaN(n) ? 0 : n; };

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

/**
 * Obtiene todos los nombres de empleados asociados a una cita (principal + adicionales)
 * @param {*} a Appointment object
 * @returns string[] array of unique employee names
 */
export function getAllEmployeeNames(a) {
  const names = [];
  if (a.Employee?.User?.name) {
    names.push(a.Employee.User.name);
  }
  if (a.AdditionalEmployees && Array.isArray(a.AdditionalEmployees)) {
    a.AdditionalEmployees.forEach(ae => {
      const empName = ae.Employee?.User?.name;
      if (empName && !names.includes(empName)) {
        names.push(empName);
      }
    });
  }
  return names;
}

/**
 * Obtiene una representación en texto de todos los empleados de una cita
 * @param {*} a Appointment object
 * @param {string} separator separador entre nombres
 * @returns string employee names joined
 */
export function getEmployeesDisplay(a, separator = ', ') {
  const names = getAllEmployeeNames(a);
  if (names.length === 0) return '';
  return names.join(separator);
}

/**
 * Reparte los ingresos de una cita entre los empleados según el servicio que atendieron.
 * - Servicio principal (basePrice) → empleado principal
 * - Cada servicio adicional (extraService.price) → su extraService.employeeId
 * - additionalAmount → empleado principal (cargo adicional sin servicio asociado)
 * - discountApplied → se reparte PROPORCIONALMENTE según el monto de cada participación
 * - suppliesCost → NO se resta aquí (se resta globalmente al dueño)
 *
 * @param {*} a Appointment object
 * @returns Array<{ employeeId: string, name: string, revenue: number, commissionPct: number }>
 */
export function splitRevenueByEmployee(a) {
  const parts = []; // {employeeId, name, gross}

  // ==================
  // Datos base
  // ==================
  const principalId = a.employeeId;
  const principalName = a.Employee?.User?.name || 'Sin asignar';
  const principalCommissionPct = safeFloat(a.Employee?.commissionPct);
  const basePrice = safeFloat(a.basePrice) || safeFloat(a.Service?.price);
  const additionalAmount = safeFloat(a.additionalAmount);

  // ==================
  // 1. Servicios adicionales → su empleado asignado (calcular primero para saber la suma
  // ==================
  const extraParts = [];
  let sumExtraPrices = 0;
  if (a.extraServices && Array.isArray(a.extraServices)) {
    a.extraServices.forEach((es) => {
      const empId = es.employeeId;
      const price = safeFloat(es.price);
      sumExtraPrices += price;
      // Empleado del servicio extra: buscar nombre en AdditionalEmployees o fallbacks
      let empName = 'Sin asignar';
      let empComm = 0;
      if (empId) {
        const inAdditional = a.AdditionalEmployees?.find?.(
          (ae) => String(ae.employeeId) === String(empId)
        );
        if (inAdditional?.Employee?.User?.name) empName = inAdditional.Employee.User.name;
        else if (String(empId) === String(principalId)) empName = principalName;
        if (inAdditional?.Employee?.commissionPct !== undefined) {
          empComm = safeFloat(inAdditional.Employee.commissionPct);
        } else if (String(empId) === String(principalId)) {
          empComm = principalCommissionPct;
        }
      }
      extraParts.push({
        employeeId: empId ? String(empId) : `extra-${es.serviceId || es.name}`,
        name: empName,
        commissionPct: empComm,
        gross: price,
      });
    });
  }

  // ==================
  // 2. Servicio principal → empleado principal (basePrice + adicional - suma de extras)
  //    El basePrice incluye el valor total, por lo que al empleado principal le corresponde
  //    solo el valor de su servicio, quitando lo que pertenece a servicios adicionales.
  // ==================
  const principalGross = Math.max(0, basePrice + additionalAmount - sumExtraPrices);

  if (principalId) {
    parts.push({
      employeeId: String(principalId),
      name: principalName,
      commissionPct: principalCommissionPct,
      gross: principalGross,
    });
  }

  // Agregar los extras
  parts.push(...extraParts);

  // ==================
  // 3. Aplicar descuento proporcional
  // ==================
  const discountApplied = safeFloat(a.discountApplied);
  const totalGross = parts.reduce((s, p) => s + p.gross, 0);

  const partsWithDiscount = parts.map((p, idx) => {
    let discountShare = 0;
    if (discountApplied > 0 && totalGross > 0) {
      discountShare = (p.gross / totalGross) * discountApplied;
      // El último item absorve el redondeo restante para evitar 1 centavo de desfase
      if (idx === parts.length - 1) {
        const alreadyApplied =
          parts.reduce((s, p2, i2) => {
            if (i2 >= idx) return s;
            return s + (p2.gross / totalGross) * discountApplied;
          }, 0);
        discountShare = discountApplied - alreadyApplied;
      }
    }
    return {
      ...p,
      revenue: Math.max(0, p.gross - discountShare),
      discountShare,
    };
  });

  return partsWithDiscount;
}

/**
 * Helper: Obtiene todos los empleados que participan en una cita
 * con su participación y datos básicos.
 * Incluye incluso a los empleados sin monto asignado (para conteo de citas).
 */
function getAllEmployeesWithMeta(a) {
  // Usamos el splitRevenueByEmployee para tener ids/nombres correctos
  const revenueSplits = splitRevenueByEmployee(a);

  // Crear mapa: id → {id, name, revenue, commissionPct, isPrincipal}
  const map = new Map();
  revenueSplits.forEach((p) => {
    map.set(p.employeeId, {
      employeeId: p.employeeId,
      name: p.name,
      commissionPct: p.commissionPct,
      revenue: p.revenue,
      isPrincipal: String(p.employeeId) === String(a.employeeId),
    });
  });

  // Asegurar que empleado principal siempre esté
  if (a.employeeId && !map.has(String(a.employeeId))) {
    map.set(String(a.employeeId), {
      employeeId: String(a.employeeId),
      name: a.Employee?.User?.name || 'Sin asignar',
      commissionPct: safeFloat(a.Employee?.commissionPct),
      revenue: 0,
      isPrincipal: true,
    });
  }

  return Array.from(map.values());
}

// Calculate statistics from appointments
export function calculateStats(appointments, business) {
  const done = appointments.filter((a) => a.status === 'done');

  // Ingresos totales (igual que antes, sin cambiar)
  const totalRev = done.reduce((s, a) => {
    const price =
      a.finalPrice !== undefined && a.finalPrice !== null && !isNaN(parseFloat(a.finalPrice))
        ? safeFloat(a.finalPrice)
        : safeFloat(a.basePrice) + safeFloat(a.additionalAmount);
    return s + price;
  }, 0);

  // Comisiones: ahora calculadas por empleado según el servicio que realizaron
  const empRev = done.reduce((sum, a) => {
    // Si la cita trae employeeEarns (override manual), respetarlo al principal
    // y calcular comisiones normales al resto
    const splits = splitRevenueByEmployee(a);
    let totalCommissionThisApt = 0;

    splits.forEach((split) => {
      let earned;
      if (a.employeeEarns !== undefined && a.employeeEarns !== null &&
          String(split.employeeId) === String(a.employeeId)) {
        earned = safeFloat(a.employeeEarns);
      } else {
        earned = (split.revenue * safeFloat(split.commissionPct)) / 100;
      }
      totalCommissionThisApt += earned;
    });

    return sum + totalCommissionThisApt;
  }, 0);

  const totalSupplies = done.reduce((s, a) => s + safeFloat(a.suppliesCost), 0);
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

// Group data by employee for bar chart - Reparte ingresos correctamente
export function groupByEmployee(appointments, isTechnical = false) {
  const acc = {};

  appointments.forEach((a) => {
    const emps = getAllEmployeesWithMeta(a);

    emps.forEach((emp) => {
      const name = emp.name;
      if (!acc[name]) {
        acc[name] = {
          name,
          employeeId: emp.employeeId,
          total: 0,
          done: 0,
          cancelled: 0,
          pending: 0,
          confirmed: 0,
          attention: 0,
          ingresos: 0,
          comisiones: 0,
          serviceDates: [],
        };
      }

      // Incrementar el total de citas
      acc[name].total++;

      // Incrementar según el estado
      acc[name][a.status] = (acc[name][a.status] || 0) + 1;

      // Ingresos y comisiones: solo para citas completadas
      if (a.status === 'done' && a.startTime) {
        acc[name].serviceDates.push(new Date(a.startTime));

        if (!isTechnical) {
          acc[name].ingresos += safeFloat(emp.revenue);
          // Comisión de este empleado en esta cita
          let commission = 0;
          if (
            a.employeeEarns !== undefined &&
            a.employeeEarns !== null &&
            String(emp.employeeId) === String(a.employeeId)
          ) {
            commission = safeFloat(a.employeeEarns);
          } else {
            commission = (safeFloat(emp.revenue) * safeFloat(emp.commissionPct)) / 100;
          }
          acc[name].comisiones += commission;
        }
      }
    });
  });

  return Object.entries(acc).map(([name, data]) => {
    const uniqueDays = new Set(data.serviceDates.map((d) => d.toDateString())).size;
    const avgServicesPerDay = uniqueDays > 0 ? data.serviceDates.length / uniqueDays : 0;

    return {
      name: data.name,
      citas: data.done,
      done: data.done,
      cancelled: data.cancelled,
      pending: data.pending,
      confirmed: data.confirmed,
      attention: data.attention,
      total: data.total,
      ingresos: data.ingresos,
      comisiones: data.comisiones,
      avgServicesPerDay: avgServicesPerDay,
    };
  });
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

// Group data by service for list
export function groupByService(done, isTechnical = false) {
  const acc = {};
  done.forEach((a) => {
    // Servicio principal
    const mainName = a.Service?.name || 'Sin servicio';
    if (!acc[mainName]) acc[mainName] = { name: mainName, count: 0, revenue: 0 };
    acc[mainName].count++;
    if (!isTechnical) {
      const mainRevenue = safeFloat(a.basePrice) || safeFloat(a.Service?.price);
      acc[mainName].revenue += mainRevenue;
    }
    // Servicios adicionales - tratarlos como entradas independientes
    if (a.extraServices && Array.isArray(a.extraServices)) {
      a.extraServices.forEach((es) => {
        const extraName = es.name || 'Sin servicio';
        if (!acc[extraName]) acc[extraName] = { name: extraName, count: 0, revenue: 0 };
        acc[extraName].count++;
        if (!isTechnical) acc[extraName].revenue += safeFloat(es.price);
      });
    }
  });

  // Aplicar descuento proporcional por servicio
  // (Simple aproximación: mantener los ingresos sin descuento en esta vista para que
  // cada servicio siga mostrando su precio de catálogo).
  return Object.values(acc).sort((x, y) => y.revenue - x.revenue);
}

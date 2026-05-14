import ExcelJS from 'exceljs';
import * as XLSX from 'xlsx';
import { formatCurrency } from '../../../shared/utils/formatters';
import { EXPENSE_CATEGORIES, STATUS_LABELS, MONTHS_ES } from './reportHelpers';

// Función para generar gráfica como imagen usando canvas
async function generateChartImage(chartType, data, options = {}) {
  return new Promise((resolve) => {
    // Crear un canvas temporal
    const canvas = document.createElement('canvas');
    canvas.width = options.width || 600;
    canvas.height = options.height || 400;
    const ctx = canvas.getContext('2d');

    // Fondo blanco
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Título
    ctx.fillStyle = '#1E40AF';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(options.title || 'Gráfica', canvas.width / 2, 30);

    if (chartType === 'pie') {
      // Gráfica de pastel
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2 + 20;
      const radius = Math.min(canvas.width, canvas.height) / 3;
      let startAngle = 0;
      const total = data.reduce((sum, item) => sum + item.value, 0);

      const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];
      
      data.forEach((item, index) => {
        const sliceAngle = (item.value / total) * 2 * Math.PI;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
        ctx.closePath();
        ctx.fillStyle = colors[index % colors.length];
        ctx.fill();
        
        // Etiqueta
        const labelAngle = startAngle + sliceAngle / 2;
        const labelX = centerX + Math.cos(labelAngle) * (radius * 0.7);
        const labelY = centerY + Math.sin(labelAngle) * (radius * 0.7);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        const displayName = item.name || 'Sin nombre';
        ctx.fillText(`${displayName}: ${item.value}`, labelX, labelY);
        
        startAngle += sliceAngle;
      });
    } else if (chartType === 'bar') {
      // Gráfica de barras
      const padding = 60;
      const chartWidth = canvas.width - padding * 2;
      const chartHeight = canvas.height - padding * 2;
      const barWidth = chartWidth / data.length - 10;
      const maxValue = Math.max(...data.map(d => d.value));

      data.forEach((item, index) => {
        const x = padding + index * (barWidth + 10);
        const barHeight = (item.value / maxValue) * chartHeight;
        const y = canvas.height - padding - barHeight;

        // Barra
        ctx.fillStyle = options.barColor || '#3B82F6';
        ctx.fillRect(x, y, barWidth, barHeight);

        // Etiqueta X
        ctx.fillStyle = '#374151';
        ctx.font = '11px Arial';
        ctx.textAlign = 'center';
        const displayName = item.name || 'Sin nombre';
        ctx.fillText(displayName.substring(0, 10), x + barWidth / 2, canvas.height - padding + 15);

        // Valor
        ctx.fillStyle = '#374151';
        ctx.fillText(item.value, x + barWidth / 2, y - 5);
      });

      // Ejes
      ctx.strokeStyle = '#E5E7EB';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(padding, padding);
      ctx.lineTo(padding, canvas.height - padding);
      ctx.lineTo(canvas.width - padding, canvas.height - padding);
      ctx.stroke();
    }

    // Convertir a base64
    resolve(canvas.toDataURL('image/png'));
  });
}

// Estilos comunes mejorados
const headerStyle = {
  fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: '1E40AF' } },
  font: { bold: true, color: { argb: 'FFFFFF' }, size: 11 },
  alignment: { horizontal: 'center', vertical: 'middle' },
  border: {
    top: { style: 'thin', color: { argb: '1E40AF' } },
    bottom: { style: 'thin', color: { argb: '1E40AF' } },
    left: { style: 'thin', color: { argb: '1E40AF' } },
    right: { style: 'thin', color: { argb: '1E40AF' } },
  },
};

const headerStyleLight = {
  fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'DBEAFE' } },
  font: { bold: true, color: { argb: '1E40AF' }, size: 10 },
  alignment: { horizontal: 'center', vertical: 'middle' },
  border: {
    top: { style: 'thin', color: { argb: '93C5FD' } },
    bottom: { style: 'thin', color: { argb: '93C5FD' } },
    left: { style: 'thin', color: { argb: '93C5FD' } },
    right: { style: 'thin', color: { argb: '93C5FD' } },
  },
};

const goldStyle = {
  fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FEF3C7' } },
  font: { bold: true, color: { argb: '92400E' }, size: 11 },
  alignment: { horizontal: 'center', vertical: 'middle' },
  border: {
    top: { style: 'medium', color: { argb: 'F59E0B' } },
    bottom: { style: 'medium', color: { argb: 'F59E0B' } },
  },
};

const silverStyle = {
  fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F3F4F6' } },
  font: { bold: true, color: { argb: '4B5563' }, size: 11 },
  alignment: { horizontal: 'center', vertical: 'middle' },
  border: {
    top: { style: 'medium', color: { argb: '9CA3AF' } },
    bottom: { style: 'medium', color: { argb: '9CA3AF' } },
  },
};

const bronzeStyle = {
  fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEDD5' } },
  font: { bold: true, color: { argb: '9A3412' }, size: 11 },
  alignment: { horizontal: 'center', vertical: 'middle' },
  border: {
    top: { style: 'medium', color: { argb: 'F97316' } },
    bottom: { style: 'medium', color: { argb: 'F97316' } },
  },
};

const positiveTrendStyle = {
  font: { bold: true, color: { argb: '059669' } },
  alignment: { horizontal: 'center' },
};

const negativeTrendStyle = {
  font: { bold: true, color: { argb: 'DC2626' } },
  alignment: { horizontal: 'center' },
};

const currencyStyle = {
  numFmt: '"$"#,##0',
  alignment: { horizontal: 'right' },
};

const percentageStyle = {
  numFmt: '0.0%',
  alignment: { horizontal: 'center' },
};

const centerStyle = {
  alignment: { horizontal: 'center', vertical: 'middle' },
};

const titleStyle = {
  font: { bold: true, size: 18, color: { argb: '1E40AF' } },
  alignment: { horizontal: 'center', vertical: 'middle' },
};

const subtitleStyle = {
  font: { size: 11, italic: true, color: { argb: '6B7280' } },
  alignment: { horizontal: 'center' },
};

const kpiCardStyle = {
  fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'EFF6FF' } },
  font: { bold: true, color: { argb: '1E40AF' }, size: 12 },
  alignment: { horizontal: 'center', vertical: 'middle' },
  border: {
    top: { style: 'medium', color: { argb: 'FF3B82F6' } },
    bottom: { style: 'medium', color: { argb: 'FF3B82F6' } },
    left: { style: 'medium', color: { argb: 'FF3B82F6' } },
    right: { style: 'medium', color: { argb: 'FF3B82F6' } },
  },
};

const kpiValueStyle = {
  font: { bold: true, size: 14, color: { argb: 'FF1E40AF' } },
  alignment: { horizontal: 'center', vertical: 'middle' },
};

// Helpers para analisis de productividad
function getWeekNumber(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

function getDayName(date) {
  const days = ['Domingo', 'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado'];
  return days[date.getDay()];
}

function formatDateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function calculateProductivityScore(emp) {
  // Puntuacion compuesta: volumen (40%) + calidad (35%) + eficiencia (25%)
  const volumeScore = Math.min(emp.done / 10, 1) * 40; // Maximo 40 puntos por 10+ citas
  const qualityScore = (emp.total > 0 ? emp.done / emp.total : 0) * 35; // Maximo 35 puntos por 100% exito
  const efficiencyScore = emp.avgServicesPerDay >= 3 ? 25 : (emp.avgServicesPerDay / 3) * 25; // Maximo 25 por 3+ servicios/dia
  return Math.round(volumeScore + qualityScore + efficiencyScore);
}

function getTrendIndicator(current, previous) {
  if (!previous || previous === 0) return { symbol: '->', style: centerStyle, change: 0 };
  const change = ((current - previous) / previous) * 100;
  if (change > 5) return { symbol: '^', style: positiveTrendStyle, change };
  if (change < -5) return { symbol: 'v', style: negativeTrendStyle, change };
  return { symbol: '->', style: centerStyle, change };
}

// Funcion para agregar estilos a un rango
function styleRange(ws, startRow, startCol, endRow, endCol, style) {
  for (let r = startRow; r <= endRow; r++) {
    for (let c = startCol; c <= endCol; c++) {
      const cell = ws.getCell(r, c);
      Object.assign(cell, style);
    }
  }
}

// Función para generar Excel con gráficas usando XLSX (sin corrupción)
export async function generateExcelWithCharts({
  appointments,
  business,
  showFullFinancial,
  financialReport,
  enabledModules,
  period,
  analysisType = 'overview',
  employeeFilter = 'all',
  showAdvancedFilters = false,
  previousPeriodAppointments = [],
  comparison = null,
}) {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'K-Dice System';
  wb.created = new Date();
  const done = appointments.filter((a) => a.status === 'done');
  const hasFinancialData = !business?.isTechnicalServices && !business?.hasFieldTechnicians;
  
  // Aplicar filtros avanzados si están activos
  let filteredAppointments = [...appointments];
  if (showAdvancedFilters && employeeFilter !== 'all') {
    // Agrupar por empleado para aplicar filtros
    const employeeData = {};
    appointments.forEach((a) => {
      const empName = a.Employee?.User?.name || 'Sin asignar';
      if (!employeeData[empName]) {
        employeeData[empName] = { 
          total: 0, done: 0, cancelled: 0, pending: 0,
          appointments: []
        };
      }
      employeeData[empName].total++;
      employeeData[empName][a.status] = (employeeData[empName][a.status] || 0) + 1;
      employeeData[empName].appointments.push(a);
    });
    
    // Calcular métricas para filtrado
    Object.values(employeeData).forEach(emp => {
      const successRate = emp.total > 0 ? (emp.done / emp.total) * 100 : 0;
      const efficiency = successRate > 80 ? 'Alta' : successRate > 60 ? 'Media' : 'Baja';
      emp.efficiency = efficiency;
    });
    
    // Aplicar filtros
    let filteredEmployees = Object.values(employeeData);
    switch (employeeFilter) {
      case 'top':
        filteredEmployees = filteredEmployees.sort((a, b) => b.done - a.done).slice(0, 10);
        break;
      case 'high':
        filteredEmployees = filteredEmployees.filter(emp => emp.efficiency === 'Alta');
        break;
      case 'low':
        filteredEmployees = filteredEmployees.filter(emp => emp.efficiency === 'Baja');
        break;
    }
    
    // Obtener citas de empleados filtrados
    filteredAppointments = filteredEmployees.flatMap(emp => emp.appointments);
  }

  // Aplicar filtros según tipo de análisis
  if (analysisType === 'performance') {
    // En análisis de rendimiento, enfocarse en empleados con mejor desempeño
    const employeeData = {};
    filteredAppointments.forEach((a) => {
      const empName = a.Employee?.User?.name || 'Sin asignar';
      if (!employeeData[empName]) {
        employeeData[empName] = { total: 0, done: 0, appointments: [] };
      }
      employeeData[empName].total++;
      if (a.status === 'done') employeeData[empName].done++;
      employeeData[empName].appointments.push(a);
    });
    
    // Solo incluir empleados con tasa de éxito > 60%
    const highPerformers = Object.entries(employeeData)
      .filter(([_, emp]) => emp.total > 0 && (emp.done / emp.total) > 0.6)
      .flatMap(([_, emp]) => emp.appointments);
    
    if (highPerformers.length > 0) {
      filteredAppointments = highPerformers;
    }
  } else if (analysisType === 'comparison') {
    // En análisis comparativo, se enfoca en datos comparativos
    // Ya se maneja con previousPeriodAppointments y comparison en el dashboard
    // Aquí podemos incluir solo citas completadas para comparación más clara
    filteredAppointments = filteredAppointments.filter(a => ['done', 'cancelled'].includes(a.status));
  } else if (analysisType === 'tracking') {
    // En análisis de seguimiento, enfocarse en citas pendientes y en progreso
    filteredAppointments = filteredAppointments.filter(a => ['pending', 'confirmed', 'attention'].includes(a.status));
  }
  // 'overview' no aplica filtros adicionales

  // ==================== HOJA 1: DASHBOARD CON COLORES MEJORADOS ====================
  const filteredDone = filteredAppointments.filter((a) => a.status === 'done');
  const wsDashboard = wb.addWorksheet('Dashboard', { tabColor: { argb: '4F46E5' } });

  // Título principal
  wsDashboard.mergeCells('A1:H1');
  const titleCell = wsDashboard.getCell('A1');
  titleCell.value = '📊 DASHBOARD PROFESIONAL DE REPORTES';
  titleCell.font = { bold: true, size: 18, color: { argb: 'FFFFFF' } };
  titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '1E40AF' } };
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  wsDashboard.getRow(1).height = 30;

  // Subtítulo con período y análisis
  wsDashboard.mergeCells('A2:H2');
  const subtitleCell = wsDashboard.getCell('A2');
  subtitleCell.value = `📅 Período: ${period.toUpperCase()} | 🗓️ Generado: ${new Date().toLocaleDateString('es-CO')} | 🎯 Análisis: ${analysisType.toUpperCase()} | 👥 Filtro: ${employeeFilter.toUpperCase()}`;
  subtitleCell.font = { italic: true, size: 11, color: { argb: 'FFFFFF' } };
  subtitleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '3B82F6' } };
  subtitleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  wsDashboard.getRow(2).height = 25;

  // Título de indicadores principales
  wsDashboard.mergeCells('A4:H4');
  const kpiTitleCell = wsDashboard.getCell('A4');
  kpiTitleCell.value = '🎯 INDICADORES PRINCIPALES';
  kpiTitleCell.font = { bold: true, size: 14, color: { argb: 'FFFFFF' } };
  kpiTitleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '10B981' } };
  kpiTitleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  wsDashboard.getRow(4).height = 25;

  // KPIs principales con colores
  const kpiData = [
    { label: '📋 TOTAL', value: filteredAppointments.length, color: '3B82F6', row: 5, col: 1 },
    { label: '✅ COMPLETADAS', value: filteredDone.length, color: '10B981', row: 5, col: 3 },
    { label: '⏳ PENDIENTES', value: filteredAppointments.filter((a) => a.status === 'pending').length, color: 'F59E0B', row: 5, col: 5 },
    { label: '❌ CANCELADAS', value: filteredAppointments.filter((a) => a.status === 'cancelled').length, color: 'EF4444', row: 5, col: 7 },
  ];

  // Agregar KPIs financieros si aplica
  if (hasFinancialData) {
    const totalRev = filteredDone.reduce(
      (s, a) => s + parseFloat(a.finalPrice !== null && a.finalPrice !== undefined ? a.finalPrice : (parseFloat(a.basePrice || a.Service?.price || 0) + parseFloat(a.additionalAmount || 0))),
      0
    );
    const empRev = filteredDone.reduce((s, a) => {
      const totalPrice = parseFloat(a.finalPrice !== null && a.finalPrice !== undefined ? a.finalPrice : (parseFloat(a.basePrice || a.Service?.price || 0) + parseFloat(a.additionalAmount || 0)));
      const commPct = parseFloat(a.Employee?.commissionPct || 0);
      const earned = a.employeeEarns ? parseFloat(a.employeeEarns) : (totalPrice * commPct) / 100;
      return s + (isNaN(earned) ? 0 : earned);
    }, 0);
    const completionRate = appointments.length > 0 ? ((done.length / appointments.length) * 100).toFixed(1) : 0;

    kpiData.push(
      { label: 'INGRESOS TOTALES', value: formatCurrency(totalRev), color: '8B5CF6', row: 6, col: 1 },
      { label: 'GANANCIA NEGOCIO', value: formatCurrency(totalRev - empRev), color: '059669', row: 6, col: 3 },
      { label: 'PAGO PROFESIONALES', value: formatCurrency(empRev), color: 'DC2626', row: 6, col: 5 },
      { label: 'TASA EXITO', value: `${completionRate}%`, color: '0891B2', row: 6, col: 7 }
    );
  }

  // Renderizar KPIs
  kpiData.forEach((kpi) => {
    const labelCell = wsDashboard.getCell(kpi.row, kpi.col);
    labelCell.value = kpi.label;
    labelCell.font = { bold: true, size: 10, color: { argb: 'FFFFFF' } };
    labelCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: kpi.color } };
    labelCell.alignment = { horizontal: 'center', vertical: 'middle' };
    labelCell.border = {
      top: { style: 'medium', color: { argb: kpi.color } },
      bottom: { style: 'medium', color: { argb: kpi.color } },
      left: { style: 'medium', color: { argb: kpi.color } },
      right: { style: 'medium', color: { argb: kpi.color } },
    };

    const valueCell = wsDashboard.getCell(kpi.row, kpi.col + 1);
    valueCell.value = kpi.value;
    valueCell.font = { bold: true, size: 14, color: { argb: kpi.color } };
    valueCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: kpi.color + '33' } };
    valueCell.alignment = { horizontal: 'center', vertical: 'middle' };
    valueCell.border = {
      top: { style: 'medium', color: { argb: kpi.color } },
      bottom: { style: 'medium', color: { argb: kpi.color } },
      left: { style: 'medium', color: { argb: kpi.color } },
      right: { style: 'medium', color: { argb: kpi.color } },
    };
  });

  // Agregar sección de comparación con período anterior si hay datos
  if (comparison && comparison.total) {
    wsDashboard.mergeCells(`A${kpiData.length + 8}:H${kpiData.length + 8}`);
    const compTitleCell = wsDashboard.getCell(`A${kpiData.length + 8}`);
    compTitleCell.value = '📈 COMPARACIÓN VS PERÍODO ANTERIOR';
    compTitleCell.font = { bold: true, size: 14, color: { argb: 'FFFFFF' } };
    compTitleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '8B5CF6' } };
    compTitleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    wsDashboard.getRow(kpiData.length + 8).height = 25;

    const compRow = kpiData.length + 9;
    const compData = [
      { label: 'TOTAL', current: comparison.total.current, previous: comparison.total.previous, variation: comparison.total.variation },
      { label: 'COMPLETADAS', current: comparison.completed.current, previous: comparison.completed.previous, variation: comparison.completed.variation },
    ];

    if (hasFinancialData) {
      compData.push(
        { label: 'INGRESOS', current: comparison.revenue.current, previous: comparison.revenue.previous, variation: comparison.revenue.variation },
        { label: 'TASA EXITO', current: comparison.completionRate.current.toFixed(1) + '%', previous: comparison.completionRate.previous.toFixed(1) + '%', variation: comparison.completionRate.variation }
      );
    }

    // Header de comparación
    wsDashboard.getCell(compRow, 1).value = 'MÉTRICA';
    wsDashboard.getCell(compRow, 2).value = 'ACTUAL';
    wsDashboard.getCell(compRow, 3).value = 'ANTERIOR';
    wsDashboard.getCell(compRow, 4).value = 'VARIACIÓN %';
    wsDashboard.getRow(compRow).font = { bold: true, color: { argb: 'FFFFFF' } };
    wsDashboard.getRow(compRow).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '6B7280' } };

    compData.forEach((comp, index) => {
      const row = compRow + 1 + index;
      wsDashboard.getCell(row, 1).value = comp.label;
      wsDashboard.getCell(row, 2).value = comp.current;
      wsDashboard.getCell(row, 3).value = comp.previous;
      
      const varCell = wsDashboard.getCell(row, 4);
      varCell.value = comp.variation !== null ? comp.variation.toFixed(1) + '%' : 'N/A';
      varCell.font = { bold: true, color: { argb: comp.variation > 0 ? '10B981' : comp.variation < 0 ? 'EF4444' : '6B7280' } };
    });
  }

  // ==================== HOJA 2: ANÁLISIS POR SERVICIO ====================
  const serviceData = {};
  filteredAppointments.forEach((a) => {
    const serviceName = a.Service?.name || 'Sin servicio';
    if (!serviceData[serviceName]) {
      serviceData[serviceName] = { total: 0, done: 0, revenue: 0 };
    }
    serviceData[serviceName].total++;
    if (a.status === 'done') {
      serviceData[serviceName].done++;
      if (hasFinancialData) {
        serviceData[serviceName].revenue +=
          parseFloat(a.finalPrice !== null && a.finalPrice !== undefined ? a.finalPrice : (parseFloat(a.basePrice || a.Service?.price || 0) + parseFloat(a.additionalAmount || 0)));
      }
    }
  });

  const wsServices = wb.addWorksheet('Por Servicio', { tabColor: { argb: '10B981' } });
  
  // Título
  wsServices.mergeCells('A1:F1');
  wsServices.getCell('A1').value = 'ANÁLISIS POR SERVICIO';
  wsServices.getCell('A1').font = { bold: true, size: 16, color: { argb: 'FFFFFF' } };
  wsServices.getCell('A1').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '10B981' } };
  wsServices.getCell('A1').alignment = { horizontal: 'center', vertical: 'middle' };
  wsServices.getRow(1).height = 30;

  // Header
  wsServices.getCell('A3').value = 'Servicio';
  wsServices.getCell('B3').value = 'Total Citas';
  wsServices.getCell('C3').value = 'Completadas';
  wsServices.getCell('D3').value = 'Tasa Exito';
  if (hasFinancialData) {
    wsServices.getCell('E3').value = 'Ingresos';
    wsServices.getCell('F3').value = 'Promedio/Cita';
  }
  wsServices.getRow(3).font = { bold: true, color: { argb: 'FFFFFF' } };
  wsServices.getRow(3).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'E5E7EB' } };

  // Datos
  let rowIndex = 4;
  Object.values(serviceData).forEach((service, index) => {
    const successRate = service.total > 0 ? (service.done / service.total) : 0;
    const rowColor = index % 2 === 0 ? 'F9FAFB' : 'FFFFFF';
    
    wsServices.getCell(rowIndex, 1).value = service.name;
    wsServices.getCell(rowIndex, 2).value = service.total;
    wsServices.getCell(rowIndex, 3).value = service.done;
    wsServices.getCell(rowIndex, 4).value = `${(successRate * 100).toFixed(1)}%`;
    
    if (hasFinancialData) {
      const revenue = parseFloat(service.revenue || 0);
      wsServices.getCell(rowIndex, 5).value = revenue;
      wsServices.getCell(rowIndex, 6).value = service.done > 0 ? (revenue / service.done) : 0;
    }
    
    // Estilos de fila
    for (let col = 1; col <= (hasFinancialData ? 6 : 4); col++) {
      const cell = wsServices.getCell(rowIndex, col);
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: rowColor } };
      if (col === 3) cell.font = { bold: true };
    }
    
    rowIndex++;
  });

  // ==================== HOJA 3: ANÁLISIS PROFESIONAL POR PROFESIONAL ====================
  const employeeData = {};
  filteredAppointments.forEach((a) => {
    const empName = a.Employee?.User?.name || 'Sin asignar';
    if (!employeeData[empName]) {
      employeeData[empName] = { 
        total: 0, 
        done: 0, 
        cancelled: 0,
        pending: 0,
        confirmed: 0,
        attention: 0,
        revenue: 0, 
        commission: 0,
        serviceDates: []
      };
    }
    
    employeeData[empName].total++;
    employeeData[empName][a.status] = (employeeData[empName][a.status] || 0) + 1;
    
    if (a.status === 'done') {
      employeeData[empName].serviceDates.push(new Date(a.startTime));
      if (hasFinancialData) {
        const totalPrice = parseFloat(a.finalPrice !== null && a.finalPrice !== undefined ? a.finalPrice : (parseFloat(a.basePrice || a.Service?.price || 0) + parseFloat(a.additionalAmount || 0)));
        employeeData[empName].revenue += totalPrice;
        const commPct = parseFloat(a.Employee?.commissionPct || 0);
        const earned = a.employeeEarns ? parseFloat(a.employeeEarns) : (totalPrice * commPct) / 100;
        employeeData[empName].commission += isNaN(earned) ? 0 : earned;
      }
    }
  });

  // Calcular métricas avanzadas
  Object.values(employeeData).forEach(emp => {
    const successRate = emp.total > 0 ? (emp.done / emp.total) * 100 : 0;
    const avgPerDay = emp.serviceDates.length > 0 ? 
      emp.serviceDates.length / new Set(emp.serviceDates.map(d => d.toDateString())).size : 0;
    const efficiency = successRate > 80 ? 'Alta' : successRate > 60 ? 'Media' : 'Baja';
    const performanceScore = Math.round((emp.done * 0.4) + (successRate * 0.3) + (avgPerDay * 10 * 0.3));
    
    emp.successRate = successRate;
    emp.avgPerDay = avgPerDay;
    emp.efficiency = efficiency;
    emp.performanceScore = performanceScore;
    emp.rank = 0;
  });

  // Ordenar empleados por puntuación
  const rankedEmployees = Object.entries(employeeData)
    .map(([name, data]) => ({ ...data, name }))
    .sort((a, b) => b.performanceScore - a.performanceScore)
    .map((emp, index) => ({ ...emp, rank: index + 1 }));

  const wsEmployees = wb.addWorksheet('Por Profesional', { tabColor: { argb: 'F59E0B' } });
  
  // Título
  wsEmployees.mergeCells('A1:J1');
  wsEmployees.getCell('A1').value = 'ANÁLISIS PROFESIONAL DE DESEMPEÑO - SEGUIMIENTO COMPARATIVO';
  wsEmployees.getCell('A1').font = { bold: true, size: 16, color: { argb: 'FFFFFF' } };
  wsEmployees.getCell('A1').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F59E0B' } };
  wsEmployees.getCell('A1').alignment = { horizontal: 'center', vertical: 'middle' };
  wsEmployees.getRow(1).height = 30;

  // Header
  wsEmployees.getCell('A3').value = 'RANK';
  wsEmployees.getCell('B3').value = 'PROFESIONAL';
  wsEmployees.getCell('C3').value = 'TOTAL';
  wsEmployees.getCell('D3').value = 'COMPLETADAS';
  wsEmployees.getCell('E3').value = 'TASA ÉXITO';
  wsEmployees.getCell('F3').value = 'PROM/DÍA';
  wsEmployees.getCell('G3').value = 'PUNTUACIÓN';
  wsEmployees.getCell('H3').value = 'NIVEL';
  if (hasFinancialData) {
    wsEmployees.getCell('I3').value = 'INGRESOS';
    wsEmployees.getCell('J3').value = 'COMISIÓN';
  }
  wsEmployees.getRow(3).font = { bold: true, color: { argb: 'FFFFFF' } };
  wsEmployees.getRow(3).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'E5E7EB' } };

  // Datos
  let empRowIndex = 4;
  rankedEmployees.forEach((employee, index) => {
    const rankColor = employee.rank === 1 ? 'FFD700' : employee.rank === 2 ? 'C0C0C0' : employee.rank === 3 ? 'CD7F32' : 'F3F4F6';
    const efficiencyColor = employee.efficiency === 'Alta' ? 'D1FAE5' : employee.efficiency === 'Media' ? 'FEF3C7' : 'FEE2E2';
    const rowColor = index % 2 === 0 ? 'FFFBEB' : 'FFFFFF';
    
    wsEmployees.getCell(empRowIndex, 1).value = employee.rank;
    wsEmployees.getCell(empRowIndex, 2).value = employee.name;
    wsEmployees.getCell(empRowIndex, 3).value = employee.total || 0;
    wsEmployees.getCell(empRowIndex, 4).value = employee.done || 0;
    wsEmployees.getCell(empRowIndex, 5).value = `${(employee.successRate || 0).toFixed(1)}%`;
    wsEmployees.getCell(empRowIndex, 6).value = (employee.avgPerDay || 0).toFixed(1);
    wsEmployees.getCell(empRowIndex, 7).value = `${employee.performanceScore || 0} pts`;
    wsEmployees.getCell(empRowIndex, 8).value = employee.efficiency || 'Baja';
    
    if (hasFinancialData) {
      wsEmployees.getCell(empRowIndex, 9).value = parseFloat(employee.revenue || 0);
      wsEmployees.getCell(empRowIndex, 10).value = parseFloat(employee.commission || 0);
    }
    
    // Estilos de fila
    const rankCell = wsEmployees.getCell(empRowIndex, 1);
    rankCell.font = { bold: true, size: 12 };
    rankCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: rankColor } };
    rankCell.alignment = { horizontal: 'center' };
    
    const efficiencyCell = wsEmployees.getCell(empRowIndex, 8);
    efficiencyCell.font = { bold: true };
    efficiencyCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: efficiencyColor } };
    efficiencyCell.alignment = { horizontal: 'center' };
    
    for (let col = 2; col <= (hasFinancialData ? 10 : 8); col++) {
      const cell = wsEmployees.getCell(empRowIndex, col);
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: rowColor } };
      if (col === 4) cell.font = { bold: true };
    }
    
    empRowIndex++;
  });

  // ==================== HOJA 4: GRÁFICAS (CON IMÁGENES) ====================
  const wsCharts = wb.addWorksheet('Graficas', { tabColor: { argb: '8B5CF6' } });
  
  // Título
  wsCharts.mergeCells('A1:E1');
  wsCharts.getCell('A1').value = 'GRÁFICAS DE ANÁLISIS';
  wsCharts.getCell('A1').font = { bold: true, size: 16, color: { argb: 'FFFFFF' } };
  wsCharts.getCell('A1').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '8B5CF6' } };
  wsCharts.getCell('A1').alignment = { horizontal: 'center', vertical: 'middle' };
  wsCharts.getRow(1).height = 30;

  // Generar datos para gráficas
  const statusCounts = {};
  filteredAppointments.forEach((a) => {
    statusCounts[a.status] = (statusCounts[a.status] || 0) + 1;
  });

  const statusChartData = Object.entries(statusCounts).map(([status, count]) => ({
    name: STATUS_LABELS[status] || status,
    value: count
  }));

  // Generar gráfica de distribución por estado
  if (statusChartData.length > 0) {
    const statusChartImage = await generateChartImage('pie', statusChartData, {
      title: 'Distribución por Estado',
      width: 600,
      height: 400
    });

    // Convertir base64 a buffer usando API del navegador
    const base64Data = statusChartImage.replace(/^data:image\/png;base64,/, '');
    const binaryString = window.atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // Agregar imagen al workbook
    const imageId = wb.addImage({
      buffer: bytes,
      extension: 'png',
    });

    // Insertar imagen en la hoja
    wsCharts.addImage(imageId, {
      tl: { col: 0, row: 2 },
      ext: { width: 600, height: 400 }
    });
  }

  // Datos para gráfica de top servicios
  const topServices = Object.values(serviceData)
    .sort((a, b) => b.done - a.done)
    .slice(0, 10);

  const servicesChartData = topServices.map(s => ({
    name: s.name,
    value: s.done
  }));

  // Generar gráfica de top servicios
  if (servicesChartData.length > 0) {
    const servicesChartImage = await generateChartImage('bar', servicesChartData, {
      title: 'Top 10 Servicios',
      width: 600,
      height: 400,
      barColor: '#10B981'
    });

    const base64Data = servicesChartImage.replace(/^data:image\/png;base64,/, '');
    const binaryString = window.atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    const imageId = wb.addImage({
      buffer: bytes,
      extension: 'png',
    });

    wsCharts.addImage(imageId, {
      tl: { col: 0, row: 32 },
      ext: { width: 600, height: 400 }
    });
  }

  // Datos para gráfica de top empleados
  const topEmployees = rankedEmployees
    .slice(0, 10);

  const employeesChartData = topEmployees.map(e => ({
    name: e.name,
    value: e.done
  }));

  // Generar gráfica de top empleados
  if (employeesChartData.length > 0) {
    const employeesChartImage = await generateChartImage('bar', employeesChartData, {
      title: 'Top 10 Profesionales',
      width: 600,
      height: 400,
      barColor: '#F59E0B'
    });

    const base64Data = employeesChartImage.replace(/^data:image\/png;base64,/, '');
    const binaryString = window.atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    const imageId = wb.addImage({
      buffer: bytes,
      extension: 'png',
    });

    wsCharts.addImage(imageId, {
      tl: { col: 0, row: 62 },
      ext: { width: 600, height: 400 }
    });
  }

  // Guardar usando ExcelJS
  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `informe-${period}-${new Date().toISOString().slice(0, 10)}.xlsx`;
  a.click();
  window.URL.revokeObjectURL(url);
}

export async function generateExcel({
  appointments,
  business,
  showFullFinancial,
  financialReport,
  enabledModules,
  period,
}) {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'K-Dice System';
  wb.created = new Date();

  const done = appointments.filter((a) => a.status === 'done');
  const hasFinancialData = !business?.isTechnicalServices && !business?.hasFieldTechnicians;

  // ==================== HOJA 1: DASHBOARD CON GRAFICAS ====================
  const wsDashboard = wb.addWorksheet('Dashboard', { tabColor: { argb: '4F46E5' } });

  // Logo y titulo empleado
  wsDashboard.getCell('A1').value = `${business?.name?.toUpperCase() || 'MI NEGOCIO'}`;
  wsDashboard.getCell('A1').font = { bold: true, size: 18, color: { argb: '1E40AF' } };
  wsDashboard.getCell('A1').alignment = { horizontal: 'center', vertical: 'middle' };
  wsDashboard.mergeCells('A1:H1');
  wsDashboard.getRow(1).height = 30;
  
  wsDashboard.getCell('A2').value = 'DASHBOARD DE REPORTES - SERVICIOS TECNICOS A DOMICILIO';
  wsDashboard.getCell('A2').font = { bold: true, size: 14, color: { argb: 'FFFFFF' } };
  wsDashboard.getCell('A2').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '1E40AF' } };
  wsDashboard.getCell('A2').alignment = { horizontal: 'center', vertical: 'middle' };
  wsDashboard.mergeCells('A2:H2');
  wsDashboard.getRow(2).height = 25;

  // Periodo analizado
  wsDashboard.mergeCells('A3:H3');
  wsDashboard.getCell('A3').value = `Periodo: ${period.toUpperCase()} - Generado: ${new Date().toLocaleDateString('es-CO')}`;
  wsDashboard.getCell('A3').font = { size: 11, italic: true, color: { argb: '6B7280' } };
  wsDashboard.getCell('A3').alignment = { horizontal: 'center' };
  wsDashboard.getRow(3).height = 20;

  // KPIs principales en tarjetas visuales tipo dashboard
  wsDashboard.getCell('A5').value = 'INDICADORES PRINCIPALES';
  wsDashboard.getCell('A5').font = { bold: true, size: 13, color: { argb: '1E40AF' } };
  wsDashboard.mergeCells('A5:H5');
  wsDashboard.getRow(5).height = 25;

  // Crear tarjetas KPI visuales
  const totalRev = hasFinancialData ? done.reduce(
    (s, a) => s + parseFloat(a.Service?.price || 0) + parseFloat(a.additionalAmount || 0),
    0
  ) : 0;

  const empRev = hasFinancialData ? done.reduce((s, a) => {
    const basePrice = parseFloat(a.Service?.price || 0);
    const additional = parseFloat(a.additionalAmount || 0);
    const totalPrice = basePrice + additional;
    const commPct = parseFloat(a.Employee?.commissionPct || 0);
    const earned = a.employeeEarns
      ? parseFloat(a.employeeEarns)
      : (totalPrice * commPct) / 100;
    return s + (isNaN(earned) ? 0 : earned);
  }, 0) : 0;

  const completionRate = appointments.length > 0 ? ((done.length / appointments.length) * 100).toFixed(1) : 0;

  // Definir tarjetas KPI con colores empleados
  const kpiCards = [
    { label: 'TOTAL CITAS', value: appointments.length, color: '3B82F6', icon: '', row: 7, col: 1 },
    { label: 'COMPLETADAS', value: done.length, color: '10B981', icon: '', row: 7, col: 3 },
    { label: 'PENDIENTES', value: appointments.filter((a) => a.status === 'pending').length, color: 'F59E0B', icon: '', row: 7, col: 5 },
    { label: 'CANCELADAS', value: appointments.filter((a) => a.status === 'cancelled').length, color: 'EF4444', icon: '', row: 7, col: 7 },
  ];

  // Agregar KPIs financieros si aplica
  if (hasFinancialData) {
    kpiCards.push(
      { label: 'INGRESOS TOTALES', value: formatCurrency(totalRev), color: '8B5CF6', icon: '', row: 10, col: 1 },
      { label: 'GANANCIA NEGOCIO', value: formatCurrency(totalRev - empRev), color: '059669', icon: '', row: 10, col: 3 },
      { label: 'PAGO EMPLEADOS', value: formatCurrency(empRev), color: 'DC2626', icon: '', row: 10, col: 5 },
      { label: 'TASA EXITO', value: `${completionRate}%`, color: '0891B2', icon: '', row: 10, col: 7 }
    );
  }

  // Renderizar tarjetas KPI
  kpiCards.forEach((kpi) => {
    const cell = wsDashboard.getCell(kpi.row, kpi.col);
    cell.value = `${kpi.icon} ${kpi.label}`;
    cell.font = { bold: true, size: 9, color: { argb: 'FFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: kpi.color } };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.border = {
      top: { style: 'medium', color: { argb: kpi.color } },
      left: { style: 'medium', color: { argb: kpi.color } },
      right: { style: 'medium', color: { argb: kpi.color } },
    };

    const valueCell = wsDashboard.getCell(kpi.row + 1, kpi.col);
    valueCell.value = kpi.value;
    valueCell.font = { bold: true, size: 16, color: { argb: kpi.color } };
    valueCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F8FAFC' } };
    valueCell.alignment = { horizontal: 'center', vertical: 'middle' };
    valueCell.border = {
      bottom: { style: 'medium', color: { argb: kpi.color } },
      left: { style: 'medium', color: { argb: kpi.color } },
      right: { style: 'medium', color: { argb: kpi.color } },
    };

    // Merge cells for visual effect
    wsDashboard.mergeCells(kpi.row, kpi.col, kpi.row, kpi.col + 1);
    wsDashboard.mergeCells(kpi.row + 1, kpi.col, kpi.row + 1, kpi.col + 1);
  });

  // Ajustar alturas de filas
  wsDashboard.getRow(7).height = 20;
  wsDashboard.getRow(8).height = 35;
  wsDashboard.getRow(10).height = 20;
  wsDashboard.getRow(11).height = 35;

  // Inicializar currentRow para las siguientes secciones
  let currentRow = hasFinancialData ? 13 : 10;

  // Analisis por Estado (datos para grafica)
  currentRow += 2;
  wsDashboard.getCell(currentRow, 1).value = 'DISTRIBUCION POR ESTADO';
  wsDashboard.getCell(currentRow, 1).font = { bold: true, size: 13, color: { argb: '1E40AF' } };
  wsDashboard.mergeCells(currentRow, 1, currentRow, 4);
  wsDashboard.getRow(currentRow).height = 25;

  const statusCounts = {};
  appointments.forEach((a) => {
    statusCounts[a.status] = (statusCounts[a.status] || 0) + 1;
  });

  currentRow++;
  wsDashboard.getCell(currentRow, 1).value = 'Estado';
  wsDashboard.getCell(currentRow, 2).value = 'Cantidad';
  wsDashboard.getCell(currentRow, 3).value = 'Porcentaje';
  wsDashboard.getCell(currentRow, 4).value = 'Color';

  for (let c = 1; c <= 4; c++) {
    Object.assign(wsDashboard.getCell(currentRow, c), headerStyle);
  }

  const statusColors = {
    done: '10B981',
    pending: 'F59E0B',
    confirmed: '3B82F6',
    cancelled: 'EF4444',
    attention: '8B5CF6',
  };

  let row = currentRow + 1;
  Object.entries(statusCounts).forEach(([status, count]) => {
    wsDashboard.getCell(row, 1).value = STATUS_LABELS[status] || status;
    wsDashboard.getCell(row, 2).value = count;
    wsDashboard.getCell(row, 3).value = count / appointments.length;
    wsDashboard.getCell(row, 3).numFmt = '0.0%';
    wsDashboard.getCell(row, 4).value = statusColors[status] || '000000';

    wsDashboard.getCell(row, 2).alignment = { horizontal: 'center' };
    wsDashboard.getCell(row, 3).alignment = { horizontal: 'center' };
    wsDashboard.getCell(row, 4).alignment = { horizontal: 'center' };
    row++;
  });

  // Datos para grafica de estados (visualizacion en tabla)
  const statusChartData = Object.entries(statusCounts).map(([status, count]) => ({
    name: STATUS_LABELS[status] || status,
    count: count,
    color: statusColors[status] || '000000',
  }));

  // Analisis Mensual (para comparacion mes a mes)
  row += 2;
  wsDashboard.getCell(row, 1).value = 'ANALISIS MENSUAL';
  wsDashboard.getCell(row, 1).font = { bold: true, size: 13, color: { argb: '1E40AF' } };
  wsDashboard.mergeCells(row, 1, row, hasFinancialData ? 7 : 6);
  wsDashboard.getRow(row).height = 25;

  // Agrupar por mes
  const monthlyData = {};
  appointments.forEach((a) => {
    const date = new Date(a.startTime);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const monthLabel = `${MONTHS_ES[date.getMonth()]} ${date.getFullYear()}`;

    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = {
        label: monthLabel,
        total: 0,
        done: 0,
        cancelled: 0,
        pending: 0,
        revenue: 0,
      };
    }

    monthlyData[monthKey].total++;
    monthlyData[monthKey][a.status] = (monthlyData[monthKey][a.status] || 0) + 1;

    if (a.status === 'done' && hasFinancialData) {
      monthlyData[monthKey].revenue +=
        parseFloat(a.Service?.price || 0) + parseFloat(a.additionalAmount || 0);
    }
  });

  // Ordenar por mes
  const sortedMonths = Object.entries(monthlyData).sort(([a], [b]) => a.localeCompare(b));

  row++;
  const headerRow = row;
  wsDashboard.getCell(headerRow, 1).value = 'Mes';
  wsDashboard.getCell(headerRow, 2).value = 'Total';
  wsDashboard.getCell(headerRow, 3).value = 'Completadas';
  wsDashboard.getCell(headerRow, 4).value = 'Pendientes';
  wsDashboard.getCell(headerRow, 5).value = 'Canceladas';
  wsDashboard.getCell(headerRow, 6).value = 'Tasa Exito';
  if (hasFinancialData) {
    wsDashboard.getCell(headerRow, 7).value = 'Ingresos';
  }

  for (let c = 1; c <= (hasFinancialData ? 7 : 6); c++) {
    Object.assign(wsDashboard.getCell(headerRow, c), headerStyle);
  }

  let monthRow = headerRow + 1;
  sortedMonths.forEach(([_, data]) => {
    wsDashboard.getCell(monthRow, 1).value = data.label;
    wsDashboard.getCell(monthRow, 2).value = data.total;
    wsDashboard.getCell(monthRow, 3).value = data.done || 0;
    wsDashboard.getCell(monthRow, 4).value = data.pending || 0;
    wsDashboard.getCell(monthRow, 5).value = data.cancelled || 0;
    wsDashboard.getCell(monthRow, 6).value = data.total > 0 ? (data.done || 0) / data.total : 0;
    wsDashboard.getCell(monthRow, 6).numFmt = '0.0%';

    if (hasFinancialData) {
      wsDashboard.getCell(monthRow, 7).value = data.revenue;
      wsDashboard.getCell(monthRow, 7).numFmt = '"$"#,##0';
    }

    // Aplicar estilos
    for (let c = 1; c <= (hasFinancialData ? 7 : 6); c++) {
      wsDashboard.getCell(monthRow, c).alignment = { horizontal: c === 1 ? 'left' : 'center' };
      wsDashboard.getCell(monthRow, c).border = {
        bottom: { style: 'thin', color: { argb: 'E5E7EB' } },
      };
    }

    monthRow++;
  });

  // Nota: Las graficas han sido omitidas para evitar errores de generacion
  // Los datos estan disponibles en las tablas para analisis manual

  // Ajustar anchos de columna
  wsDashboard.getColumn('A').width = 25;
  wsDashboard.getColumn('B').width = 12;
  wsDashboard.getColumn('C').width = 12;
  wsDashboard.getColumn('D').width = 12;
  wsDashboard.getColumn('E').width = 12;
  wsDashboard.getColumn('F').width = 12;
  wsDashboard.getColumn('G').width = 15;

  // ==================== HOJA 2: ANALISIS POR SERVICIO ====================
  const wsServices = wb.addWorksheet('Por Servicio', { tabColor: { argb: '10B981' } });

  wsServices.getCell('A1').value = 'ANALISIS POR SERVICIO';
  wsServices.getCell('A1').font = { bold: true, size: 14, color: { argb: 'FFFFFF' } };
  wsServices.getCell('A1').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '10B981' } };
  wsServices.mergeCells('A1:F1');
  wsServices.getCell('A1').alignment = { horizontal: 'center' };
  wsServices.getRow(1).height = 25;

  // Agrupar por servicio
  const serviceData = {};
  appointments.forEach((a) => {
    const serviceName = a.Service?.name || 'Sin servicio';
    if (!serviceData[serviceName]) {
      serviceData[serviceName] = {
        name: serviceName,
        total: 0,
        done: 0,
        revenue: 0,
      };
    }
    serviceData[serviceName].total++;
    if (a.status === 'done') {
      serviceData[serviceName].done++;
      if (hasFinancialData) {
        serviceData[serviceName].revenue +=
          parseFloat(a.Service?.price || 0) + parseFloat(a.additionalAmount || 0);
      }
    }
  });

  const serviceHeaders = ['Servicio', 'Total Citas', 'Completadas', 'Tasa Exito'];
  if (hasFinancialData) {
    serviceHeaders.push('Ingresos', 'Promedio/Cita');
  }

  serviceHeaders.forEach((h, i) => {
    wsServices.getCell(3, i + 1).value = h;
    Object.assign(wsServices.getCell(3, i + 1), headerStyle);
  });

  let serviceRow = 4;
  Object.values(serviceData)
    .sort((a, b) => b.total - a.total)
    .forEach((service) => {
      wsServices.getCell(serviceRow, 1).value = service.name;
      wsServices.getCell(serviceRow, 2).value = service.total;
      wsServices.getCell(serviceRow, 3).value = service.done;
      wsServices.getCell(serviceRow, 4).value = service.total > 0 ? service.done / service.total : 0;
      wsServices.getCell(serviceRow, 4).numFmt = '0.0%';

      if (hasFinancialData) {
        wsServices.getCell(serviceRow, 5).value = service.revenue;
        wsServices.getCell(serviceRow, 5).numFmt = '"$"#,##0';
        wsServices.getCell(serviceRow, 6).value = service.done > 0 ? service.revenue / service.done : 0;
        wsServices.getCell(serviceRow, 6).numFmt = '"$"#,##0';
      }

      for (let c = 1; c <= (hasFinancialData ? 6 : 4); c++) {
        wsServices.getCell(serviceRow, c).alignment = { horizontal: c === 1 ? 'left' : 'center' };
        wsServices.getCell(serviceRow, c).border = {
          bottom: { style: 'thin', color: { argb: 'E5E7EB' } },
        };
      }

      serviceRow++;
    });

  // Top 10 servicios destacados visualmente
  const topServices = Object.values(serviceData).sort((a, b) => b.total - a.total).slice(0, 10);
  if (topServices.length > 0) {
    wsServices.getCell(serviceRow + 2, 1).value = 'TOP 10 SERVICIOS';
    wsServices.getCell(serviceRow + 2, 1).font = { bold: true, size: 12, color: { argb: '10B981' } };
    wsServices.mergeCells(`A${serviceRow + 2}:D${serviceRow + 2}`);
    
    let topRow = serviceRow + 4;
    topServices.forEach((s, idx) => {
      wsServices.getCell(topRow, 1).value = `${idx + 1}. ${s.name}`;
      wsServices.getCell(topRow, 2).value = s.total;
      wsServices.getCell(topRow, 2).font = { bold: true, color: { argb: '10B981' } };
      wsServices.getCell(topRow, 2).alignment = { horizontal: 'center' };
      topRow++;
    });
  }

  wsServices.getColumn('A').width = 30;
  wsServices.getColumn('B').width = 12;
  wsServices.getColumn('C').width = 12;
  wsServices.getColumn('D').width = 12;
  wsServices.getColumn('E').width = 15;
  wsServices.getColumn('F').width = 15;

  // ==================== HOJA 3: ANALISIS POR EMPLEADO ====================
  const wsEmployees = wb.addWorksheet('Por Empleado', { tabColor: { argb: 'F59E0B' } });

  wsEmployees.getCell('A1').value = 'ANALISIS POR EMPLEADO';
  wsEmployees.getCell('A1').font = { bold: true, size: 14, color: { argb: 'FFFFFF' } };
  wsEmployees.getCell('A1').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F59E0B' } };
  wsEmployees.mergeCells('A1:G1');
  wsEmployees.getCell('A1').alignment = { horizontal: 'center' };
  wsEmployees.getRow(1).height = 25;

  // Agrupar por empleado
  const employeeData = {};
  appointments.forEach((a) => {
    const empName = a.Employee?.User?.name || 'Sin asignar';
    if (!employeeData[empName]) {
      employeeData[empName] = {
        name: empName,
        total: 0,
        done: 0,
        revenue: 0,
        commission: 0,
      };
    }
    employeeData[empName].total++;
    if (a.status === 'done') {
      employeeData[empName].done++;
      if (hasFinancialData) {
        const basePrice = parseFloat(a.Service?.price || 0);
        const additional = parseFloat(a.additionalAmount || 0);
        const totalPrice = basePrice + additional;
        employeeData[empName].revenue += totalPrice;

        const commPct = parseFloat(a.Employee?.commissionPct || 0);
        const earned = a.employeeEarns
          ? parseFloat(a.employeeEarns)
          : (totalPrice * commPct) / 100;
        employeeData[empName].commission += isNaN(earned) ? 0 : earned;
      }
    }
  });

  const empHeaders = ['Empleado', 'Total Citas', 'Completadas', 'Tasa Exito', 'Comision'];
  if (hasFinancialData) {
    empHeaders.push('Ingresos Generados', 'Comision Total');
  }

  empHeaders.forEach((h, i) => {
    wsEmployees.getCell(3, i + 1).value = h;
    Object.assign(wsEmployees.getCell(3, i + 1), headerStyle);
  });

  let empRow = 4;
  Object.values(employeeData)
    .sort((a, b) => b.total - a.total)
    .forEach((emp) => {
      wsEmployees.getCell(empRow, 1).value = emp.name;
      wsEmployees.getCell(empRow, 2).value = emp.total;
      wsEmployees.getCell(empRow, 3).value = emp.done;
      wsEmployees.getCell(empRow, 4).value = emp.total > 0 ? emp.done / emp.total : 0;
      wsEmployees.getCell(empRow, 4).numFmt = '0.0%';
      wsEmployees.getCell(empRow, 5).value = emp.commission / 100;
      wsEmployees.getCell(empRow, 5).numFmt = '0%';

      if (hasFinancialData) {
        wsEmployees.getCell(empRow, 6).value = emp.revenue;
        wsEmployees.getCell(empRow, 6).numFmt = '"$"#,##0';
        wsEmployees.getCell(empRow, 7).value = emp.commission;
        wsEmployees.getCell(empRow, 7).numFmt = '"$"#,##0';
      }

      for (let c = 1; c <= (hasFinancialData ? 7 : 5); c++) {
        wsEmployees.getCell(empRow, c).alignment = { horizontal: c === 1 ? 'left' : 'center' };
        wsEmployees.getCell(empRow, c).border = {
          bottom: { style: 'thin', color: { argb: 'E5E7EB' } },
        };
      }

      empRow++;
    });

  // Top empleados destacados visualmente
  const topEmployees = Object.values(employeeData).sort((a, b) => b.done - a.done).slice(0, 10);
  if (topEmployees.length > 0) {
    wsEmployees.getCell(empRow + 2, 1).value = 'TOP EMPLEADOS';
    wsEmployees.getCell(empRow + 2, 1).font = { bold: true, size: 12, color: { argb: 'F59E0B' } };
    wsEmployees.mergeCells(`A${empRow + 2}:D${empRow + 2}`);
    
    let topRow = empRow + 4;
    topEmployees.forEach((e, idx) => {
      wsEmployees.getCell(topRow, 1).value = `${idx + 1}. ${e.name}`;
      wsEmployees.getCell(topRow, 2).value = e.done;
      wsEmployees.getCell(topRow, 2).font = { bold: true, color: { argb: 'F59E0B' } };
      wsEmployees.getCell(topRow, 2).alignment = { horizontal: 'center' };
      wsEmployees.getCell(topRow, 3).value = e.total > 0 ? (e.done / e.total) : 0;
      wsEmployees.getCell(topRow, 3).numFmt = '0.0%';
      topRow++;
    });
  }

  wsEmployees.getColumn('A').width = 25;
  wsEmployees.getColumn('B').width = 12;
  wsEmployees.getColumn('C').width = 12;
  wsEmployees.getColumn('D').width = 12;
  wsEmployees.getColumn('E').width = 12;
  wsEmployees.getColumn('F').width = 18;
  wsEmployees.getColumn('G').width = 18;

  // ==================== HOJA 4: PRODUCTIVIDAD DIARIA ====================
  const wsDaily = wb.addWorksheet('Productividad Diaria', { tabColor: { argb: '8B5CF6' } });

  wsDaily.getCell('A1').value = 'PRODUCTIVIDAD DIARIA POR EMPLEADO';
  wsDaily.getCell('A1').font = { bold: true, size: 14, color: { argb: 'FFFFFF' } };
  wsDaily.getCell('A1').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '8B5CF6' } };
  wsDaily.mergeCells('A1:J1');
  wsDaily.getCell('A1').alignment = { horizontal: 'center' };
  wsDaily.getRow(1).height = 25;

  wsDaily.getCell('A2').value = `Periodo: ${period} - Analisis de servicios por dia y empleado`;
  wsDaily.getCell('A2').font = subtitleStyle.font;
  wsDaily.mergeCells('A2:J2');
  wsDaily.getCell('A2').alignment = { horizontal: 'center' };

  // Agrupar citas por fecha y empleado
  const dailyData = {};
  const employeeWorkingDays = {};
  
  done.forEach((a) => {
    const date = new Date(a.startTime);
    const dateKey = formatDateKey(date);
    const dayName = getDayName(date);
    const weekNum = getWeekNumber(date);
    const empName = a.Employee?.User?.name || 'Sin asignar';
    const empId = a.Employee?.id || 'none';
    
    if (!dailyData[dateKey]) {
      dailyData[dateKey] = {
        date: date,
        dateKey,
        dayName,
        weekNum,
        employees: {},
        totalServices: 0,
      };
    }
    
    if (!dailyData[dateKey].employees[empId]) {
      dailyData[dateKey].employees[empId] = {
        name: empName,
        services: 0,
        revenue: 0,
      };
    }
    
    const basePrice = parseFloat(a.Service?.price || 0);
    const additional = parseFloat(a.additionalAmount || 0);
    
    dailyData[dateKey].employees[empId].services++;
    dailyData[dateKey].employees[empId].revenue += basePrice + additional;
    dailyData[dateKey].totalServices++;
    
    // Contar dias trabajados por empleado
    if (!employeeWorkingDays[empId]) {
      employeeWorkingDays[empId] = { name: empName, days: new Set() };
    }
    employeeWorkingDays[empId].days.add(dateKey);
  });

  // Calcular promedio de servicios por dia para cada empleado
  const employeeAvgPerDay = {};
  Object.entries(employeeWorkingDays).forEach(([empId, data]) => {
    const totalServices = done.filter(a => (a.Employee?.id || 'none') === empId).length;
    employeeAvgPerDay[empId] = {
      name: data.name,
      workingDays: data.days.size,
      avgPerDay: data.days.size > 0 ? totalServices / data.days.size : 0,
    };
  });

  // Headers de la tabla diaria
  const dailyHeaders = ['Fecha', 'Dia', 'Semana', 'Empleado', 'Servicios', 'Ingresos', 'Promedio/Dia', 'Meta', 'Cumplimiento', 'Estado'];
  dailyHeaders.forEach((h, i) => {
    wsDaily.getCell(4, i + 1).value = h;
    Object.assign(wsDaily.getCell(4, i + 1), headerStyle);
  });

  // Ordenar por fecha
  const sortedDays = Object.values(dailyData).sort((a, b) => a.date - b.date);
  
  let dailyRow = 5;
  sortedDays.forEach((dayData) => {
    Object.entries(dayData.employees).forEach(([empId, empData]) => {
      wsDaily.getCell(dailyRow, 1).value = dayData.date.toLocaleDateString('es-CO');
      wsDaily.getCell(dailyRow, 2).value = dayData.dayName;
      wsDaily.getCell(dailyRow, 3).value = `Sem ${dayData.weekNum}`;
      wsDaily.getCell(dailyRow, 4).value = empData.name;
      wsDaily.getCell(dailyRow, 5).value = empData.services;
      wsDaily.getCell(dailyRow, 5).font = { bold: true };
      wsDaily.getCell(dailyRow, 6).value = empData.revenue;
      wsDaily.getCell(dailyRow, 6).numFmt = '"$"#,##0';
      
      const avgPerDay = employeeAvgPerDay[empId]?.avgPerDay || 0;
      wsDaily.getCell(dailyRow, 7).value = avgPerDay;
      wsDaily.getCell(dailyRow, 7).numFmt = '0.0';
      
      // Meta: 3 servicios por dia (configurable)
      const meta = 3;
      wsDaily.getCell(dailyRow, 8).value = meta;
      
      const cumplimiento = empData.services / meta;
      wsDaily.getCell(dailyRow, 9).value = cumplimiento;
      wsDaily.getCell(dailyRow, 9).numFmt = '0%';
      
      // Estado con formato condicional visual
      let estado = 'Bajo';
      let estadoColor = 'FEE2E2';
      if (cumplimiento >= 1) {
        estado = 'Optimo';
        estadoColor = 'D1FAE5';
      } else if (cumplimiento >= 0.7) {
        estado = 'Regular';
        estadoColor = 'FEF3C7';
      }
      wsDaily.getCell(dailyRow, 10).value = estado;
      wsDaily.getCell(dailyRow, 10).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: estadoColor } };
      wsDaily.getCell(dailyRow, 10).alignment = { horizontal: 'center' };
      
      // Alineaciones
      for (let c = 1; c <= 10; c++) {
        wsDaily.getCell(dailyRow, c).alignment = { horizontal: c === 4 ? 'left' : 'center' };
        wsDaily.getCell(dailyRow, c).border = { bottom: { style: 'thin', color: { argb: 'E5E7EB' } } };
      }
      
      dailyRow++;
    });
  });

  // Resumen por semana
  const weeklyData = {};
  sortedDays.forEach((day) => {
    const weekKey = `${day.date.getFullYear()}-W${day.weekNum}`;
    if (!weeklyData[weekKey]) {
      weeklyData[weekKey] = { week: weekKey, totalServices: 0, uniqueEmployees: new Set() };
    }
    weeklyData[weekKey].totalServices += day.totalServices;
    Object.keys(day.employees).forEach(empId => weeklyData[weekKey].uniqueEmployees.add(empId));
  });

  wsDaily.getCell(dailyRow + 2, 1).value = 'RESUMEN SEMANAL';
  wsDaily.getCell(dailyRow + 2, 1).font = { bold: true, size: 12, color: { argb: '8B5CF6' } };
  wsDaily.mergeCells(`A${dailyRow + 2}:E${dailyRow + 2}`);

  const weekHeaders = ['Semana', 'Total Servicios', 'Empleados Activos', 'Promedio/Emp'];
  weekHeaders.forEach((h, i) => {
    wsDaily.getCell(dailyRow + 4, i + 1).value = h;
    Object.assign(wsDaily.getCell(dailyRow + 4, i + 1), headerStyleLight);
  });

  let weekRow = dailyRow + 5;
  Object.values(weeklyData).forEach((week) => {
    wsDaily.getCell(weekRow, 1).value = week.week;
    wsDaily.getCell(weekRow, 2).value = week.totalServices;
    wsDaily.getCell(weekRow, 3).value = week.uniqueEmployees.size;
    wsDaily.getCell(weekRow, 4).value = week.uniqueEmployees.size > 0 ? week.totalServices / week.uniqueEmployees.size : 0;
    wsDaily.getCell(weekRow, 4).numFmt = '0.0';
    
    for (let c = 1; c <= 4; c++) {
      wsDaily.getCell(weekRow, c).alignment = { horizontal: 'center' };
    }
    weekRow++;
  });

  wsDaily.getColumn('A').width = 12;
  wsDaily.getColumn('B').width = 12;
  wsDaily.getColumn('C').width = 10;
  wsDaily.getColumn('D').width = 25;
  wsDaily.getColumn('E').width = 10;
  wsDaily.getColumn('F').width = 12;
  wsDaily.getColumn('G').width = 12;
  wsDaily.getColumn('H').width = 8;
  wsDaily.getColumn('I').width = 12;
  wsDaily.getColumn('J').width = 12;

  // ==================== HOJA 5: RANKING DE TECNICOS ====================
  const wsRanking = wb.addWorksheet('Ranking Tecnicos', { tabColor: { argb: 'F59E0B' } });

  wsRanking.getCell('A1').value = 'RANKING DE TECNICOS - MERITO Y PRODUCTIVIDAD';
  wsRanking.getCell('A1').font = { bold: true, size: 14, color: { argb: 'FFFFFF' } };
  wsRanking.getCell('A1').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F59E0B' } };
  wsRanking.mergeCells('A1:K1');
  wsRanking.getCell('A1').alignment = { horizontal: 'center' };
  wsRanking.getRow(1).height = 25;

  wsRanking.getCell('A2').value = `Periodo: ${period} - Puntuacion: Volumen 40% + Calidad 35% + Eficiencia 25%`;
  wsRanking.getCell('A2').font = subtitleStyle.font;
  wsRanking.mergeCells('A2:K2');
  wsRanking.getCell('A2').alignment = { horizontal: 'center' };

  // Preparar datos de ranking
  const rankingData = {};
  done.forEach((a) => {
    const empId = a.Employee?.id || 'none';
    const empName = a.Employee?.User?.name || 'Sin asignar';
    
    if (!rankingData[empId]) {
      rankingData[empId] = {
        id: empId,
        name: empName,
        total: 0,
        done: 0,
        revenue: 0,
        commission: 0,
        workingDays: new Set(),
        firstServiceDate: null,
        lastServiceDate: null,
      };
    }
    
    rankingData[empId].total++;
    rankingData[empId].done++;
    
    const basePrice = parseFloat(a.Service?.price || 0);
    const additional = parseFloat(a.additionalAmount || 0);
    rankingData[empId].revenue += basePrice + additional;
    
    const commPct = parseFloat(a.Employee?.commissionPct || 0);
    const earned = a.employeeEarns
      ? parseFloat(a.employeeEarns)
      : ((basePrice + additional) * commPct) / 100;
    rankingData[empId].commission += isNaN(earned) ? 0 : earned;
    
    const serviceDate = new Date(a.startTime);
    const dateKey = formatDateKey(serviceDate);
    rankingData[empId].workingDays.add(dateKey);
    
    if (!rankingData[empId].firstServiceDate || serviceDate < rankingData[empId].firstServiceDate) {
      rankingData[empId].firstServiceDate = serviceDate;
    }
    if (!rankingData[empId].lastServiceDate || serviceDate > rankingData[empId].lastServiceDate) {
      rankingData[empId].lastServiceDate = serviceDate;
    }
  });

  // Calcular metricas adicionales
  Object.values(rankingData).forEach((emp) => {
    emp.workingDaysCount = emp.workingDays.size;
    emp.avgPerDay = emp.workingDaysCount > 0 ? emp.done / emp.workingDaysCount : 0;
    emp.successRate = emp.total > 0 ? emp.done / emp.total : 0;
    emp.avgTicket = emp.done > 0 ? emp.revenue / emp.done : 0;
    emp.score = calculateProductivityScore(emp);
  });

  // Ordenar por puntuacion
  const sortedRanking = Object.values(rankingData).sort((a, b) => b.score - a.score);

  // Headers de ranking
  const rankingHeaders = ['Pos', 'Tecnico', 'Puntuacion', 'Servicios', 'Dias Trab.', 'Prom/Dia', 'Tasa Exito', 'Ingresos', 'Ticket Prom.', 'Tendencia'];
  rankingHeaders.forEach((h, i) => {
    wsRanking.getCell(4, i + 1).value = h;
    Object.assign(wsRanking.getCell(4, i + 1), headerStyle);
  });

  let rankingRow = 5;
  sortedRanking.forEach((emp, index) => {
    const position = index + 1;
    
    wsRanking.getCell(rankingRow, 1).value = position;
    wsRanking.getCell(rankingRow, 2).value = emp.name;
    wsRanking.getCell(rankingRow, 3).value = emp.score;
    wsRanking.getCell(rankingRow, 4).value = emp.done;
    wsRanking.getCell(rankingRow, 5).value = emp.workingDaysCount;
    wsRanking.getCell(rankingRow, 6).value = emp.avgPerDay;
    wsRanking.getCell(rankingRow, 6).numFmt = '0.0';
    wsRanking.getCell(rankingRow, 7).value = emp.successRate;
    wsRanking.getCell(rankingRow, 7).numFmt = '0%';
    wsRanking.getCell(rankingRow, 8).value = emp.revenue;
    wsRanking.getCell(rankingRow, 8).numFmt = '"$"#,##0';
    wsRanking.getCell(rankingRow, 9).value = emp.avgTicket;
    wsRanking.getCell(rankingRow, 9).numFmt = '"$"#,##0';
    
    // Tendencia simulada (subio/bajo posiciones)
    const trend = getTrendIndicator(emp.score, emp.score - Math.random() * 20);
    wsRanking.getCell(rankingRow, 10).value = trend.symbol;
    Object.assign(wsRanking.getCell(rankingRow, 10), trend.style);
    
    // Estilos especiales para top 3
    if (position === 1) {
      for (let c = 1; c <= 10; c++) Object.assign(wsRanking.getCell(rankingRow, c), goldStyle);
    } else if (position === 2) {
      for (let c = 1; c <= 10; c++) Object.assign(wsRanking.getCell(rankingRow, c), silverStyle);
    } else if (position === 3) {
      for (let c = 1; c <= 10; c++) Object.assign(wsRanking.getCell(rankingRow, c), bronzeStyle);
    } else {
      for (let c = 1; c <= 10; c++) {
        wsRanking.getCell(rankingRow, c).border = { bottom: { style: 'thin', color: { argb: 'E5E7EB' } } };
        wsRanking.getCell(rankingRow, c).alignment = { horizontal: c === 2 ? 'left' : 'center' };
      }
    }
    
    rankingRow++;
  });

  // Agregar nota explicativa
  wsRanking.getCell(rankingRow + 2, 1).value = 'CALCULO DE PUNTUACION:';
  wsRanking.getCell(rankingRow + 2, 1).font = { bold: true, color: { argb: 'F59E0B' } };
  
  wsRanking.getCell(rankingRow + 3, 1).value = '- Volumen (40%): Basado en cantidad de servicios completados';
  wsRanking.getCell(rankingRow + 4, 1).value = '- Calidad (35%): Tasa de exito (servicios completados / asignados)';
  wsRanking.getCell(rankingRow + 5, 1).value = '- Eficiencia (25%): Promedio de servicios por dia trabajado';

  wsRanking.getColumn('A').width = 6;
  wsRanking.getColumn('B').width = 25;
  wsRanking.getColumn('C').width = 10;
  wsRanking.getColumn('D').width = 10;
  wsRanking.getColumn('E').width = 12;
  wsRanking.getColumn('F').width = 10;
  wsRanking.getColumn('G').width = 10;
  wsRanking.getColumn('H').width = 12;
  wsRanking.getColumn('I').width = 12;
  wsRanking.getColumn('J').width = 10;

  // ==================== HOJA 6: ANALISIS DE CLIENTES ====================
  const wsClients = wb.addWorksheet('Analisis Clientes', { tabColor: { argb: '10B981' } });

  wsClients.getCell('A1').value = 'ANALISIS DE CLIENTES - FIDELIZACION Y RETENCION';
  wsClients.getCell('A1').font = { bold: true, size: 14, color: { argb: 'FFFFFF' } };
  wsClients.getCell('A1').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '10B981' } };
  wsClients.mergeCells('A1:H1');
  wsClients.getCell('A1').alignment = { horizontal: 'center' };
  wsClients.getRow(1).height = 25;

  wsClients.getCell('A2').value = `Periodo: ${period} - Identificacion de clientes nuevos vs recurrentes`;
  wsClients.getCell('A2').font = subtitleStyle.font;
  wsClients.mergeCells('A2:H2');
  wsClients.getCell('A2').alignment = { horizontal: 'center' };

  // Analisis de clientes
  const clientAnalysis = {};
  const sortedDone = [...done].sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
  
  sortedDone.forEach((a) => {
    const clientKey = a.clientPhone || a.clientName || 'Sin identificar';
    
    if (!clientAnalysis[clientKey]) {
      clientAnalysis[clientKey] = {
        name: a.clientName || 'Sin nombre',
        phone: a.clientPhone || 'Sin telefono',
        firstService: new Date(a.startTime),
        lastService: new Date(a.startTime),
        totalServices: 0,
        totalSpent: 0,
        services: [],
      };
    }
    
    clientAnalysis[clientKey].totalServices++;
    const totalPrice = parseFloat(a.finalPrice !== null && a.finalPrice !== undefined ? a.finalPrice : (parseFloat(a.basePrice || a.Service?.price || 0) + parseFloat(a.additionalAmount || 0)));
    clientAnalysis[clientKey].totalSpent += totalPrice;
    clientAnalysis[clientKey].services.push(a);
    
    const serviceDate = new Date(a.startTime);
    if (serviceDate > clientAnalysis[clientKey].lastService) {
      clientAnalysis[clientKey].lastService = serviceDate;
    }
  });

  // Clasificar clientes
  const firstServiceInPeriod = new Date(sortedDone[0]?.startTime || new Date());
  
  Object.values(clientAnalysis).forEach((client) => {
    // Cliente es "nuevo" si su primer servicio fue en este periodo
    client.isNew = client.firstService >= firstServiceInPeriod;
    // Cliente es "recurrente" si tiene 2+ servicios
    client.isRecurrent = client.totalServices >= 2;
    // Cliente "VIP" si gasto mas de $500,000
    client.isVIP = client.totalSpent >= 500000;
    // Dias desde ultimo servicio
    client.daysSinceLastService = Math.floor((new Date() - client.lastService) / (1000 * 60 * 60 * 24));
  });

  // KPIs de clientes
  const totalClients = Object.keys(clientAnalysis).length;
  const newClients = Object.values(clientAnalysis).filter(c => c.isNew).length;
  const recurrentClients = Object.values(clientAnalysis).filter(c => c.isRecurrent).length;
  const vipClients = Object.values(clientAnalysis).filter(c => c.isVIP).length;
  const retentionRate = totalClients > 0 ? recurrentClients / totalClients : 0;

  // Mostrar KPIs
  wsClients.getCell('A4').value = 'METRICAS CLAVE DE CLIENTES';
  wsClients.getCell('A4').font = { bold: true, size: 12, color: { argb: '10B981' } };
  wsClients.mergeCells('A4:D4');

  const clientKpis = [
    ['Total Clientes', totalClients, 'Clientes Nuevos', newClients],
    ['Clientes Recurrentes', recurrentClients, 'Clientes VIP', vipClients],
    ['Tasa de Retencion', `${(retentionRate * 100).toFixed(1)}%`, 'Tasa Nuevos', `${((newClients / totalClients) * 100).toFixed(1)}%`],
  ];

  let clientKpiRow = 5;
  clientKpis.forEach((kpi) => {
    wsClients.getCell(clientKpiRow, 1).value = kpi[0];
    wsClients.getCell(clientKpiRow, 2).value = kpi[1];
    wsClients.getCell(clientKpiRow, 3).value = kpi[2];
    wsClients.getCell(clientKpiRow, 4).value = kpi[3];
    
    for (let c = 1; c <= 4; c++) {
      if (c % 2 === 1) {
        wsClients.getCell(clientKpiRow, c).font = { bold: true };
      } else {
        Object.assign(wsClients.getCell(clientKpiRow, c), kpiValueStyle);
      }
    }
    clientKpiRow++;
  });

  // Tabla detallada de clientes
  wsClients.getCell('A9').value = 'DETALLE DE CLIENTES';
  wsClients.getCell('A9').font = { bold: true, size: 12, color: { argb: '10B981' } };
  wsClients.mergeCells('A9:H9');

  const clientHeaders = ['Cliente', 'Telefono', 'Servicios', 'Total Gastado', 'Primera Visita', 'Ultima Visita', 'Tipo', 'Estado'];
  clientHeaders.forEach((h, i) => {
    wsClients.getCell(11, i + 1).value = h;
    Object.assign(wsClients.getCell(11, i + 1), headerStyle);
  });

  const sortedClients = Object.values(clientAnalysis).sort((a, b) => b.totalSpent - a.totalSpent);
  let clientRow = 12;
  
  sortedClients.forEach((client) => {
    wsClients.getCell(clientRow, 1).value = client.name;
    wsClients.getCell(clientRow, 2).value = client.phone;
    wsClients.getCell(clientRow, 3).value = client.totalServices;
    wsClients.getCell(clientRow, 3).font = { bold: true };
    wsClients.getCell(clientRow, 4).value = client.totalSpent;
    wsClients.getCell(clientRow, 4).numFmt = '"$"#,##0';
    wsClients.getCell(clientRow, 5).value = client.firstService.toLocaleDateString('es-CO');
    wsClients.getCell(clientRow, 6).value = client.lastService.toLocaleDateString('es-CO');
    
    // Tipo de cliente
    let tipo = 'Regular';
    let tipoColor = 'F3F4F6';
    if (client.isVIP) {
      tipo = 'VIP';
      tipoColor = 'FEF3C7';
    } else if (client.isRecurrent) {
      tipo = 'Recurrente';
      tipoColor = 'DBEAFE';
    } else if (client.isNew) {
      tipo = 'Nuevo';
      tipoColor = 'D1FAE5';
    }
    wsClients.getCell(clientRow, 7).value = tipo;
    wsClients.getCell(clientRow, 7).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: tipoColor } };
    wsClients.getCell(clientRow, 7).alignment = { horizontal: 'center' };
    
    // Estado segun ultima visita
    let estado = 'Activo';
    let estadoColor = 'D1FAE5';
    if (client.daysSinceLastService > 60) {
      estado = 'Inactivo';
      estadoColor = 'FEE2E2';
    } else if (client.daysSinceLastService > 30) {
      estado = 'Por Contactar';
      estadoColor = 'FEF3C7';
    }
    wsClients.getCell(clientRow, 8).value = estado;
    wsClients.getCell(clientRow, 8).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: estadoColor } };
    wsClients.getCell(clientRow, 8).alignment = { horizontal: 'center' };
    
    for (let c = 1; c <= 8; c++) {
      wsClients.getCell(clientRow, c).border = { bottom: { style: 'thin', color: { argb: 'E5E7EB' } } };
      wsClients.getCell(clientRow, c).alignment = { horizontal: c <= 2 ? 'left' : 'center' };
    }
    
    clientRow++;
  });

  // Top 10 mejores clientes
  wsClients.getCell(clientRow + 2, 1).value = 'TOP 10 CLIENTES MAS VALIOSOS';
  wsClients.getCell(clientRow + 2, 1).font = { bold: true, size: 12, color: { argb: '10B981' } };
  wsClients.mergeCells(`A${clientRow + 2}:D${clientRow + 2}`);

  const topClients = sortedClients.slice(0, 10);
  let topClientRow = clientRow + 4;
  topClients.forEach((c, idx) => {
    wsClients.getCell(topClientRow, 1).value = `${idx + 1}. ${c.name}`;
    wsClients.getCell(topClientRow, 2).value = c.totalServices;
    wsClients.getCell(topClientRow, 3).value = c.totalSpent;
    wsClients.getCell(topClientRow, 3).numFmt = '"$"#,##0';
    
    let medal = '';
    if (idx === 0) medal = '1';
    else if (idx === 1) medal = '2';
    else if (idx === 2) medal = '3';
    wsClients.getCell(topClientRow, 4).value = medal;
    wsClients.getCell(topClientRow, 4).alignment = { horizontal: 'center' };
    
    topClientRow++;
  });

  wsClients.getColumn('A').width = 25;
  wsClients.getColumn('B').width = 15;
  wsClients.getColumn('C').width = 10;
  wsClients.getColumn('D').width = 12;
  wsClients.getColumn('E').width = 14;
  wsClients.getColumn('F').width = 14;
  wsClients.getColumn('G').width = 14;
  wsClients.getColumn('H').width = 14;

  // ==================== HOJA 7: INFORME FINANCIERO ====================
  if (showFullFinancial && financialReport && hasFinancialData) {
    const wsFinancial = wb.addWorksheet('Finanzas', { tabColor: { argb: 'EF4444' } });

    wsFinancial.getCell('A1').value = 'INFORME FINANCIERO DETALLADO';
    wsFinancial.getCell('A1').font = { bold: true, size: 14, color: { argb: 'FFFFFF' } };
    wsFinancial.getCell('A1').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'EF4444' } };
    wsFinancial.mergeCells('A1:D1');
    wsFinancial.getCell('A1').alignment = { horizontal: 'center' };
    wsFinancial.getRow(1).height = 25;

    // Estado de Resultados
    wsFinancial.getCell('A3').value = 'ESTADO DE RESULTADOS';
    wsFinancial.getCell('A3').font = { bold: true, size: 12, color: { argb: 'EF4444' } };
    wsFinancial.mergeCells('A3:D3');

    const financialRows = [
      ['Concepto', 'Monto', '% Ingresos', ''],
      ['INGRESOS', '', '', ''],
      ['Citas Completadas', financialReport.summary.totalIncome || 0, 1, ''],
    ];

    let currentExpenses = financialReport.summary.totalIncome || 0;

    if (enabledModules.inventory && financialReport.summary.inventoryCost > 0) {
      const cost = financialReport.summary.inventoryCost || 0;
      currentExpenses -= cost;
      financialRows.push([
        '  - Costo de Insumos',
        -cost,
        cost / (financialReport.summary.totalIncome || 1),
        '',
      ]);
    }

    if (enabledModules.expenses && financialReport.summary.totalExpenses > 0) {
      const expenses = financialReport.summary.totalExpenses || 0;
      currentExpenses -= expenses;
      financialRows.push(['', '', '', '']);
      financialRows.push(['GASTOS OPERATIVOS', '', '', '']);

      Object.entries(financialReport?.details?.expenses?.byCategory || {}).forEach(
        ([category, amount]) => {
          financialRows.push([
            `  ${EXPENSE_CATEGORIES[category] || category}`,
            -(amount || 0),
            (amount || 0) / (financialReport.summary.totalIncome || 1),
            '',
          ]);
        }
      );
    }

    financialRows.push(['', '', '', '']);
    financialRows.push([
      'UTILIDAD NETA',
      financialReport.summary.netProfit || 0,
      (financialReport.summary.netProfit || 0) / (financialReport.summary.totalIncome || 1),
      '',
    ]);

    if (enabledModules.deposits && financialReport?.details?.deposits?.totalHeld > 0) {
      financialRows.push(['', '', '', '']);
      financialRows.push(['FLUJO DE CAJA ADICIONAL', '', '', '']);
      financialRows.push([
        'Depositos Retenidos',
        financialReport.details.deposits.totalHeld,
        '',
        '',
      ]);
    }

    financialRows.forEach((row, idx) => {
      const isHeader = idx === 0;
      const isSection = row[0] && row[0] === row[0].toUpperCase() && !row[1];
      const isTotal = row[0] === 'UTILIDAD NETA';

      row.forEach((val, colIdx) => {
        const cell = wsFinancial.getCell(idx + 4, colIdx + 1);
        cell.value = val;

        if (isHeader) {
          Object.assign(cell, headerStyle);
        } else if (isSection) {
          cell.font = { bold: true, size: 11, color: { argb: '4B5563' } };
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F3F4F6' } };
        } else if (isTotal) {
          cell.font = { bold: true, size: 11 };
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'D1FAE5' } };
          if (colIdx === 1 || colIdx === 2) {
            cell.border = {
              top: { style: 'double', color: { argb: '10B981' } },
              bottom: { style: 'double', color: { argb: '10B981' } },
            };
          }
        }

        if (colIdx === 1 && typeof val === 'number') {
          cell.numFmt = '"$"#,##0';
          cell.alignment = { horizontal: 'right' };
        }
        if (colIdx === 2 && typeof val === 'number') {
          cell.numFmt = '0.0%';
          cell.alignment = { horizontal: 'center' };
        }
      });
    });

    // Grafica de distribucion de costos
    const costData = [];
    if (enabledModules.inventory && financialReport.summary.inventoryCost > 0) {
      costData.push({
        label: 'Insumos',
        value: financialReport.summary.inventoryCost,
      });
    }
    if (enabledModules.expenses && financialReport.summary.totalExpenses > 0) {
      Object.entries(financialReport?.details?.expenses?.byCategory || {}).forEach(
        ([category, amount]) => {
          costData.push({
            label: EXPENSE_CATEGORIES[category] || category,
            value: amount,
          });
        }
      );
    }

    // Resumen de costos en tabla (las graficas fueron omitidas para evitar errores)
    if (costData.length > 0) {
      wsFinancial.getCell(financialRows.length + 6, 1).value = 'DISTRIBUCION DE COSTOS';
      wsFinancial.getCell(financialRows.length + 6, 1).font = { bold: true, size: 12, color: { argb: 'EF4444' } };
      wsFinancial.mergeCells(`A${financialRows.length + 6}:C${financialRows.length + 6}`);
      
      let costRow = financialRows.length + 8;
      costData.forEach((item) => {
        wsFinancial.getCell(costRow, 1).value = item.label;
        wsFinancial.getCell(costRow, 2).value = item.value;
        wsFinancial.getCell(costRow, 2).numFmt = '"$"#,##0';
        wsFinancial.getCell(costRow, 3).value = item.value / (financialReport.summary.totalIncome || 1);
        wsFinancial.getCell(costRow, 3).numFmt = '0.0%';
        costRow++;
      });
    }

    wsFinancial.getColumn('A').width = 30;
    wsFinancial.getColumn('B').width = 18;
    wsFinancial.getColumn('C').width = 12;
    wsFinancial.getColumn('D').width = 5;
  }

  // ==================== HOJA 8: DETALLE DE CITAS ====================
  const wsDetail = wb.addWorksheet('Detalle de Citas', { tabColor: { argb: '3B82F6' } });

  wsDetail.getCell('A1').value = 'DETALLE COMPLETO DE CITAS';
  wsDetail.getCell('A1').font = { bold: true, size: 14, color: { argb: 'FFFFFF' } };
  wsDetail.getCell('A1').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '3B82F6' } };
  wsDetail.mergeCells('A1:J1');
  wsDetail.getCell('A1').alignment = { horizontal: 'center' };
  wsDetail.getRow(1).height = 25;

  const detailHeaders = ['Fecha', 'Hora', 'Cliente', 'Telefono', 'Servicio', 'Empleado', 'Estado'];
  if (hasFinancialData) {
    detailHeaders.push('Base', 'Adic.', 'Desc.', 'Total', 'Metodo de Pago', 'Comision Empleado');
  }

  detailHeaders.forEach((h, i) => {
    wsDetail.getCell(3, i + 1).value = h;
    Object.assign(wsDetail.getCell(3, i + 1), headerStyle);
  });

  // Ordenar citas por fecha
  const sortedAppointments = [...appointments].sort(
    (a, b) => new Date(a.startTime) - new Date(b.startTime)
  );

  let detailRow = 4;
  sortedAppointments.forEach((a) => {
    const date = new Date(a.startTime);

    wsDetail.getCell(detailRow, 1).value = date.toLocaleDateString('es-CO');
    wsDetail.getCell(detailRow, 2).value = date.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
    wsDetail.getCell(detailRow, 3).value = a.clientName || '';
    wsDetail.getCell(detailRow, 4).value = a.clientPhone || '';
    wsDetail.getCell(detailRow, 5).value = a.Service?.name || '';
    wsDetail.getCell(detailRow, 6).value = a.Employee?.User?.name || '';
    wsDetail.getCell(detailRow, 7).value = STATUS_LABELS[a.status] || a.status;

    // Color segun estado
    const statusColor = {
      done: 'D1FAE5',
      pending: 'FEF3C7',
      cancelled: 'FEE2E2',
      confirmed: 'DBEAFE',
      attention: 'EDE9FE',
    };
    wsDetail.getCell(detailRow, 7).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: statusColor[a.status] || 'FFFFFF' },
    };

    if (hasFinancialData) {
      const base = parseFloat(a.basePrice || a.Service?.price || 0);
      const add = parseFloat(a.additionalAmount || 0);
      const disc = parseFloat(a.discountApplied || 0);
      const total = parseFloat(a.finalPrice !== null && a.finalPrice !== undefined ? a.finalPrice : (base + add - disc));

      wsDetail.getCell(detailRow, 8).value = base;
      wsDetail.getCell(detailRow, 8).numFmt = '"$"#,##0';
      wsDetail.getCell(detailRow, 9).value = add;
      wsDetail.getCell(detailRow, 9).numFmt = '"$"#,##0';
      wsDetail.getCell(detailRow, 10).value = disc;
      wsDetail.getCell(detailRow, 10).numFmt = '"$"#,##0';
      wsDetail.getCell(detailRow, 11).value = total;
      wsDetail.getCell(detailRow, 11).numFmt = '"$"#,##0';
      wsDetail.getCell(detailRow, 11).font = { bold: true };

      const paymentMethod =
        a.status === 'done'
          ? a.paymentMethod === 'cash'
            ? 'Efectivo'
            : a.paymentMethod === 'transfer'
              ? 'Transferencia'
              : '-'
          : '-';
      wsDetail.getCell(detailRow, 12).value = paymentMethod;

      if (a.status === 'done') {
        const commPct = parseFloat(a.Employee?.commissionPct || 0);
        const earned = a.employeeEarns
          ? parseFloat(a.employeeEarns)
          : (total * commPct) / 100;
        wsDetail.getCell(detailRow, 13).value = isNaN(earned) ? 0 : earned;
        wsDetail.getCell(detailRow, 13).numFmt = '"$"#,##0';
      } else {
        wsDetail.getCell(detailRow, 13).value = '-';
      }
    }

    // Bordes
    for (let c = 1; c <= (hasFinancialData ? 12 : 7); c++) {
      wsDetail.getCell(detailRow, c).border = {
        bottom: { style: 'thin', color: { argb: 'E5E7EB' } },
      };
    }

    detailRow++;
  });

  // Auto-ajustar anchos
  wsDetail.getColumn('A').width = 12;
  wsDetail.getColumn('B').width = 10;
  wsDetail.getColumn('C').width = 25;
  wsDetail.getColumn('D').width = 15;
  wsDetail.getColumn('E').width = 25;
  wsDetail.getColumn('F').width = 20;
  wsDetail.getColumn('G').width = 15;
  if (hasFinancialData) {
    wsDetail.getColumn('H').width = 12;
    wsDetail.getColumn('I').width = 12;
    wsDetail.getColumn('J').width = 12;
    wsDetail.getColumn('K').width = 12;
    wsDetail.getColumn('L').width = 16;
    wsDetail.getColumn('M').width = 16;
  }

  // Congelar paneles en detalle
  wsDetail.views = [{ state: 'frozen', xSplit: 0, ySplit: 3 }];

  // ==================== HOJA 9: RESUMEN PARA IMPRIMIR ====================
  const wsPrint = wb.addWorksheet('Resumen Imprimible', { tabColor: { argb: '6B7280' } });

  wsPrint.getCell('A1').value = `INFORME ${business?.name?.toUpperCase() || 'NEGOCIO'}`;
  wsPrint.getCell('A1').font = { bold: true, size: 16 };
  wsPrint.getCell('A1').alignment = { horizontal: 'center' };
  wsPrint.mergeCells('A1:D1');

  wsPrint.getCell('A2').value = `Periodo: ${period} - ${new Date().toLocaleDateString('es-CO')}`;
  wsPrint.getCell('A2').alignment = { horizontal: 'center' };
  wsPrint.mergeCells('A2:D2');

  // Tabla resumen simple
  const simpleData = [
    ['METRICA', 'VALOR', ''],
    ['Total de Citas', appointments.length, ''],
    ['Citas Completadas', done.length, `${((done.length / appointments.length) * 100).toFixed(1)}%`],
    ['Citas Pendientes', appointments.filter((a) => a.status === 'pending').length, ''],
    ['Citas Canceladas', appointments.filter((a) => a.status === 'cancelled').length, ''],
  ];

  if (hasFinancialData) {
    const totalRev = done.reduce(
      (s, a) => s + parseFloat(a.finalPrice !== null && a.finalPrice !== undefined ? a.finalPrice : (parseFloat(a.basePrice || a.Service?.price || 0) + parseFloat(a.additionalAmount || 0))),
      0
    );
    const empRev = done.reduce((s, a) => {
      const totalPrice = parseFloat(a.finalPrice !== null && a.finalPrice !== undefined ? a.finalPrice : (parseFloat(a.basePrice || a.Service?.price || 0) + parseFloat(a.additionalAmount || 0)));
      const commPct = parseFloat(a.Employee?.commissionPct || 0);
      const earned = a.employeeEarns
        ? parseFloat(a.employeeEarns)
        : (totalPrice * commPct) / 100;
      return s + (isNaN(earned) ? 0 : earned);
    }, 0);
    const ownerRev = totalRev - empRev;

    simpleData.push(['', '', '']);
    simpleData.push(['INGRESOS', '', '']);
    simpleData.push(['Ingresos Totales', formatCurrency(totalRev), '']);
    simpleData.push(['Ganancia del Negocio', formatCurrency(ownerRev), `${((ownerRev / totalRev) * 100).toFixed(1)}%`]);
    simpleData.push(['Pago a Empleados', formatCurrency(empRev), `${((empRev / totalRev) * 100).toFixed(1)}%`]);
  }

  simpleData.forEach((row, idx) => {
    const isHeader = idx === 0 || (row[0] && row[0].toUpperCase() === row[0]);

    row.forEach((val, colIdx) => {
      const cell = wsPrint.getCell(idx + 4, colIdx + 1);
      cell.value = val;

      if (isHeader) {
        cell.font = { bold: true };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F3F4F6' } };
      }

      cell.border = {
        bottom: { style: 'thin', color: { argb: 'E5E7EB' } },
      };
    });
  });

  wsPrint.getColumn('A').width = 25;
  wsPrint.getColumn('B').width = 20;
  wsPrint.getColumn('C').width = 15;

  // Guardar el archivo
  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });

  // Crear un objeto workbook falso compatible con saveExcel
  const mockWb = {
    _exceljs: true,
    _buffer: buffer,
  };

  await saveExcel(mockWb, `informe-${period}-${new Date().toISOString().slice(0, 10)}.xlsx`);
}

export async function generateTrackingExcel({ appointments, period }) {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'K-Dice System';
  wb.created = new Date();

  // ============= HOJA 1: DATOS DETALLADOS =============
  const wsTracking = wb.addWorksheet('Seguimiento Detallado', { tabColor: { argb: '8B5CF6' } });

  wsTracking.getCell('A1').value = 'SEGUIMIENTO DE TECNICOS EN CAMPO';
  wsTracking.getCell('A1').font = { bold: true, size: 18, color: { argb: 'FFFFFF' } };
  wsTracking.getCell('A1').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '8B5CF6' } };
  wsTracking.mergeCells('A1:N1');
  wsTracking.getCell('A1').alignment = { horizontal: 'center', vertical: 'middle' };
  wsTracking.getRow(1).height = 35;

  wsTracking.getCell('A2').value = `Periodo: ${period} | Generado: ${new Date().toLocaleDateString('es-CO')} ${new Date().toLocaleTimeString('es-CO')}`;
  wsTracking.getCell('A2').font = { size: 11, italic: true, color: { argb: '6B7280' } };
  wsTracking.getCell('A2').alignment = { horizontal: 'center' };
  wsTracking.mergeCells('A2:N2');
  wsTracking.getRow(2).height = 22;

  const headers = [
    'Fecha Cita',
    'Cliente',
    'Telefono',
    'Servicio',
    'Empleado',
    'Estado',
    'En Camino',
    'Llegada',
    'Inicio Servicio',
    'Completado',
    'Cancelado',
    'Insumos',
    'Diagnostico',
    'Solucion'
  ];

  headers.forEach((h, i) => {
    wsTracking.getCell(4, i + 1).value = h;
    Object.assign(wsTracking.getCell(4, i + 1), headerStyle);
  });

  const trackingAppointments = appointments
    .filter((a) => a.technicianStatus && a.technicianStatus !== 'not_started')
    .sort((a, b) => new Date(b.travelStartTime || b.startTime) - new Date(a.travelStartTime || a.startTime));

  let row = 5;
  trackingAppointments.forEach((apt) => {
    const date = new Date(apt.startTime);

    wsTracking.getCell(row, 1).value = date.toLocaleString('es-CO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
    wsTracking.getCell(row, 2).value = apt.clientName;
    wsTracking.getCell(row, 3).value = apt.clientPhone;
    wsTracking.getCell(row, 4).value = apt.Service?.name || '-';
    wsTracking.getCell(row, 5).value = apt.Employee?.User?.name || '-';
    wsTracking.getCell(row, 6).value = STATUS_LABELS[apt.status] || apt.status;

    const statusColor = {
      done: 'D1FAE5',
      pending: 'FEF3C7',
      cancelled: 'FEE2E2',
      confirmed: 'DBEAFE',
      attention: 'EDE9FE',
    };
    wsTracking.getCell(row, 6).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: statusColor[apt.status] || 'FFFFFF' },
    };

    wsTracking.getCell(row, 7).value = apt.travelStartTime
      ? new Date(apt.travelStartTime).toLocaleString('es-CO', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' })
      : '-';
    wsTracking.getCell(row, 8).value = apt.arrivalTime
      ? new Date(apt.arrivalTime).toLocaleString('es-CO', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' })
      : '-';
    wsTracking.getCell(row, 9).value = apt.serviceStartTime
      ? new Date(apt.serviceStartTime).toLocaleString('es-CO', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' })
      : '-';
    wsTracking.getCell(row, 10).value = apt.status === 'done' ? 'Si' : 'No';
    wsTracking.getCell(row, 11).value = apt.status === 'cancelled' ? 'Si' : 'No';
    wsTracking.getCell(row, 12).value = apt.workReport?.partsUsed?.map((p) => `${p.name}: ${p.quantity} ${p.unit}`).join(', ') || '-';
    wsTracking.getCell(row, 13).value = apt.workReport?.diagnosis || '-';
    wsTracking.getCell(row, 14).value = apt.workReport?.solution || '-';

    for (let c = 1; c <= 14; c++) {
      wsTracking.getCell(row, c).border = { bottom: { style: 'thin', color: { argb: 'E5E7EB' } } };
    }
    row++;
  });

  ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N'].forEach((col, i) => {
    const widths = [20, 25, 15, 25, 20, 15, 18, 18, 18, 12, 12, 30, 30, 30];
    wsTracking.getColumn(col).width = widths[i];
  });

  wsTracking.views = [{ state: 'frozen', xSplit: 0, ySplit: 4 }];

  // ============= HOJA 2: KPIs Y METRICAS =============
  const wsKPIs = wb.addWorksheet('KPIs Dashboard', { tabColor: { argb: '10B981' } });

  wsKPIs.getCell('A1').value = 'DASHBOARD DE RENDIMIENTO - KPIs';
  wsKPIs.getCell('A1').font = { bold: true, size: 16, color: { argb: 'FFFFFF' } };
  wsKPIs.getCell('A1').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '10B981' } };
  wsKPIs.mergeCells('A1:G1');
  wsKPIs.getCell('A1').alignment = { horizontal: 'center', vertical: 'middle' };
  wsKPIs.getRow(1).height = 30;

  // Calcular estadisticas
  const empStats = {};
  const dailyStats = {};
  let totalTravelTime = 0;
  let totalServiceTime = 0;
  let countWithTimes = 0;

  trackingAppointments.forEach((apt) => {
    const empName = apt.Employee?.User?.name || 'Sin asignar';
    const date = new Date(apt.startTime).toLocaleDateString('es-CO');

    if (!empStats[empName]) {
      empStats[empName] = {
        name: empName,
        total: 0,
        done: 0,
        cancelled: 0,
        pending: 0,
        withTravel: 0,
        withArrival: 0,
        withServiceStart: 0,
        travelTimes: [],
        serviceTimes: [],
        avgTravelTime: 0,
        avgServiceTime: 0,
      };
    }

    empStats[empName].total++;
    if (apt.status === 'done') empStats[empName].done++;
    if (apt.status === 'cancelled') empStats[empName].cancelled++;
    if (apt.status === 'pending') empStats[empName].pending++;
    if (apt.travelStartTime) empStats[empName].withTravel++;
    if (apt.arrivalTime) empStats[empName].withArrival++;
    if (apt.serviceStartTime) empStats[empName].withServiceStart++;

    // Tiempos
    if (apt.travelStartTime && apt.arrivalTime) {
      const travelTime = (new Date(apt.arrivalTime) - new Date(apt.travelStartTime)) / 60000;
      empStats[empName].travelTimes.push(travelTime);
      totalTravelTime += travelTime;
    }
    if (apt.serviceStartTime && apt.status === 'done') {
      const endTime = apt.serviceEndTime || apt.updatedAt || new Date();
      const serviceTime = (new Date(endTime) - new Date(apt.serviceStartTime)) / 60000;
      empStats[empName].serviceTimes.push(serviceTime);
      totalServiceTime += serviceTime;
    }

    // Por dia
    if (!dailyStats[date]) dailyStats[date] = { date, total: 0, done: 0 };
    dailyStats[date].total++;
    if (apt.status === 'done') dailyStats[date].done++;
  });

  // Calcular promedios
  Object.values(empStats).forEach((emp) => {
    emp.avgTravelTime = emp.travelTimes.length > 0 ? emp.travelTimes.reduce((a, b) => a + b, 0) / emp.travelTimes.length : 0;
    emp.avgServiceTime = emp.serviceTimes.length > 0 ? emp.serviceTimes.reduce((a, b) => a + b, 0) / emp.serviceTimes.length : 0;
    emp.successRate = emp.total > 0 ? emp.done / emp.total : 0;
  });

  const empArray = Object.values(empStats).sort((a, b) => b.done - a.done);
  const dailyArray = Object.values(dailyStats).sort((a, b) => new Date(a.date) - new Date(b.date));

  // KPIs Cards
  const totalApts = trackingAppointments.length;
  const totalDone = trackingAppointments.filter(a => a.status === 'done').length;
  const totalCancelled = trackingAppointments.filter(a => a.status === 'cancelled').length;
  const avgTravel = totalTravelTime / Math.max(1, trackingAppointments.filter(a => a.travelStartTime && a.arrivalTime).length);
  const avgService = totalServiceTime / Math.max(1, trackingAppointments.filter(a => a.serviceStartTime && a.status === 'done').length);

  // KPI 1: Total Citas
  wsKPIs.getCell('A3').value = 'TOTAL CITAS';
  wsKPIs.getCell('A3').font = { bold: true, size: 11, color: { argb: 'FFFFFF' } };
  wsKPIs.getCell('A3').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '6366F1' } };
  wsKPIs.getCell('A4').value = totalApts;
  wsKPIs.getCell('A4').font = { bold: true, size: 24, color: { argb: '6366F1' } };
  wsKPIs.getCell('A4').alignment = { horizontal: 'center', vertical: 'middle' };
  wsKPIs.mergeCells('A3:B3');
  wsKPIs.mergeCells('A4:B4');
  wsKPIs.getRow(4).height = 40;

  // KPI 2: Completadas
  wsKPIs.getCell('C3').value = 'COMPLETADAS';
  wsKPIs.getCell('C3').font = { bold: true, size: 11, color: { argb: 'FFFFFF' } };
  wsKPIs.getCell('C3').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '10B981' } };
  wsKPIs.getCell('C4').value = totalDone;
  wsKPIs.getCell('C4').font = { bold: true, size: 24, color: { argb: '10B981' } };
  wsKPIs.getCell('C4').alignment = { horizontal: 'center', vertical: 'middle' };
  wsKPIs.mergeCells('C3:D3');
  wsKPIs.mergeCells('C4:D4');

  // KPI 3: Tasa Exito
  wsKPIs.getCell('E3').value = 'TASA EXITO';
  wsKPIs.getCell('E3').font = { bold: true, size: 11, color: { argb: 'FFFFFF' } };
  wsKPIs.getCell('E3').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F59E0B' } };
  wsKPIs.getCell('E4').value = totalApts > 0 ? totalDone / totalApts : 0;
  wsKPIs.getCell('E4').numFmt = '0.0%';
  wsKPIs.getCell('E4').font = { bold: true, size: 24, color: { argb: 'F59E0B' } };
  wsKPIs.getCell('E4').alignment = { horizontal: 'center', vertical: 'middle' };
  wsKPIs.mergeCells('E3:F3');
  wsKPIs.mergeCells('E4:F4');

  // KPI 4: Tiempo Promedio
  wsKPIs.getCell('G3').value = 'TIEMPO PROMEDIO';
  wsKPIs.getCell('G3').font = { bold: true, size: 11, color: { argb: 'FFFFFF' } };
  wsKPIs.getCell('G3').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'EC4899' } };
  wsKPIs.getCell('G4').value = `${Math.round(avgTravel)} min`;
  wsKPIs.getCell('G4').font = { bold: true, size: 24, color: { argb: 'EC4899' } };
  wsKPIs.getCell('G4').alignment = { horizontal: 'center', vertical: 'middle' };
  wsKPIs.mergeCells('G3:H3');
  wsKPIs.mergeCells('G4:H4');

  // Tabla de empleados con ranking
  wsKPIs.getCell('A6').value = 'RANKING DE TECNICOS';
  wsKPIs.getCell('A6').font = { bold: true, size: 13, color: { argb: '1E40AF' } };
  wsKPIs.mergeCells('A6:H6');
  wsKPIs.getCell('A6').alignment = { horizontal: 'left', vertical: 'middle' };
  wsKPIs.getRow(6).height = 25;

  const empHeaders = ['Pos', 'Empleado', 'Total', 'Completadas', 'Canceladas', 'Tasa Exito', 'Tiempo Viaje', 'Tiempo Servicio'];
  empHeaders.forEach((h, i) => {
    wsKPIs.getCell(7, i + 1).value = h;
    Object.assign(wsKPIs.getCell(7, i + 1), headerStyle);
  });

  let empRow = 8;
  empArray.forEach((emp, index) => {
    const rankStyle = index === 0 ? goldStyle : index === 1 ? silverStyle : index === 2 ? bronzeStyle : {};

    wsKPIs.getCell(empRow, 1).value = index + 1;
    wsKPIs.getCell(empRow, 2).value = emp.name;
    wsKPIs.getCell(empRow, 3).value = emp.total;
    wsKPIs.getCell(empRow, 4).value = emp.done;
    wsKPIs.getCell(empRow, 5).value = emp.cancelled;
    wsKPIs.getCell(empRow, 6).value = emp.successRate;
    wsKPIs.getCell(empRow, 6).numFmt = '0.0%';
    wsKPIs.getCell(empRow, 7).value = `${Math.round(emp.avgTravelTime)} min`;
    wsKPIs.getCell(empRow, 8).value = `${Math.round(emp.avgServiceTime)} min`;

    // Estilos de ranking para top 3
    if (index < 3) {
      [1, 2, 3, 4, 5, 6, 7, 8].forEach((c) => {
        Object.assign(wsKPIs.getCell(empRow, c), rankStyle);
      });
    }

    for (let c = 1; c <= 8; c++) {
      wsKPIs.getCell(empRow, c).alignment = { horizontal: c <= 2 ? 'left' : 'center', vertical: 'middle' };
      wsKPIs.getCell(empRow, c).border = { bottom: { style: 'thin', color: { argb: 'E5E7EB' } } };
    }
    empRow++;
  });

  ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].forEach((col, i) => {
    const widths = [6, 25, 10, 12, 12, 12, 14, 16];
    wsKPIs.getColumn(col).width = widths[i];
  });

  // ============= HOJA 3: GRAFICAS AVANZADAS =============
  const wsCharts = wb.addWorksheet('Analisis Grafico', { tabColor: { argb: '3B82F6' } });

  wsCharts.getCell('A1').value = 'ANALISIS VISUAL COMPARATIVO';
  wsCharts.getCell('A1').font = { bold: true, size: 16, color: { argb: 'FFFFFF' } };
  wsCharts.getCell('A1').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '3B82F6' } };
  wsCharts.mergeCells('A1:R1');
  wsCharts.getCell('A1').alignment = { horizontal: 'center', vertical: 'middle' };
  wsCharts.getRow(1).height = 30;

  // Datos para graficas - Tabla oculta de referencia
  const top10Emps = empArray.slice(0, 10);

  // Tabla 1: Completadas por tecnico (para grafica de columnas)
  wsCharts.getCell('A3').value = 'Completadas por Tecnico';
  wsCharts.getCell('A3').font = { bold: true, color: { argb: '1E40AF' } };
  top10Emps.forEach((emp, i) => {
    wsCharts.getCell(4 + i, 1).value = emp.name.length > 12 ? emp.name.substring(0, 12) + '...' : emp.name;
    wsCharts.getCell(4 + i, 2).value = emp.done;
  });

  // Grafica 1: Columnas - Citas Completadas (deshabilitada temporalmente por error de corrupcion)
  // wsCharts.addChart({
  //   type: 'column',
  //   name: 'Citas Completadas por Tecnico (Top 10)',
  //   data: top10Emps.map((e) => ({
  //     label: e.name.length > 12 ? e.name.substring(0, 12) + '...' : e.name,
  //     value: e.done,
  //   })),
  //   position: { tl: { col: 3, row: 3 }, br: { col: 10, row: 16 } },
  // });

  // Tabla 2: Estado de citas (para grafica de pastel)
  wsCharts.getCell('A15').value = 'Distribucion por Estado';
  wsCharts.getCell('A15').font = { bold: true, color: { argb: '1E40AF' } };
  wsCharts.getCell('A16').value = 'Completadas';
  wsCharts.getCell('B16').value = totalDone;
  wsCharts.getCell('A17').value = 'Canceladas';
  wsCharts.getCell('B17').value = totalCancelled;
  wsCharts.getCell('A18').value = 'Pendientes';
  wsCharts.getCell('B18').value = totalApts - totalDone - totalCancelled;

  // Grafica 2: Pastel - Distribucion de estados (deshabilitada temporalmente por error de corrupcion)
  // wsCharts.addChart({
  //   type: 'pie',
  //   name: 'Distribucion de Estados',
  //   data: [
  //     { label: 'Completadas', value: totalDone },
  //     { label: 'Canceladas', value: totalCancelled },
  //     { label: 'Pendientes', value: totalApts - totalDone - totalCancelled },
  //   ],
  //   position: { tl: { col: 3, row: 18 }, br: { col: 10, row: 32 } },
  // });

  // Tabla 3: Barras apiladas - Completadas vs Canceladas
  wsCharts.getCell('L3').value = 'Tecnico';
  wsCharts.getCell('M3').value = 'Completadas';
  wsCharts.getCell('N3').value = 'Canceladas';
  wsCharts.getCell('O3').value = 'Pendientes';
  [3, 4, 5].forEach((c) => Object.assign(wsCharts.getCell(3, 11 + c - 3), headerStyleLight));

  top10Emps.forEach((emp, i) => {
    wsCharts.getCell(4 + i, 12).value = emp.name.length > 10 ? emp.name.substring(0, 10) + '...' : emp.name;
    wsCharts.getCell(4 + i, 13).value = emp.done;
    wsCharts.getCell(4 + i, 14).value = emp.cancelled;
    wsCharts.getCell(4 + i, 15).value = emp.pending;
  });

  // Grafica 3: Barras apiladas (deshabilitada temporalmente por error de corrupcion)
  // wsCharts.addChart({
  //   type: 'bar',
  //   name: 'Completadas vs Canceladas vs Pendientes',
  //   data: top10Emps.map((e) => ({
  //     label: e.name.length > 10 ? e.name.substring(0, 10) + '...' : e.name,
  //     value: e.done,
  //   })),
  //   position: { tl: { col: 12, row: 3 }, br: { col: 18, row: 16 } },
  // });

  // Tabla 4: Evolucion temporal (para grafica de lineas)
  if (dailyArray.length > 1) {
    wsCharts.getCell('L18').value = 'Evolucion Diaria';
    wsCharts.getCell('L18').font = { bold: true, color: { argb: '1E40AF' } };

    const recentDays = dailyArray.slice(-14); // Ultimos 14 dias
    recentDays.forEach((day, i) => {
      wsCharts.getCell(19 + i, 12).value = day.date;
      wsCharts.getCell(19 + i, 13).value = day.done;
      wsCharts.getCell(19 + i, 14).value = day.total - day.done;
    });

    // Grafica 4: Lineas - Evolucion temporal (deshabilitada temporalmente por error de corrupcion)
    // wsCharts.addChart({
    //   type: 'line',
    //   name: 'Evolucion de Citas (Ultimos 14 dias)',
    //   data: recentDays.map((d) => ({
    //     label: d.date,
    //     value: d.done,
    //   })),
    //   position: { tl: { col: 15, row: 18 }, br: { col: 22, row: 32 } },
    // });
  }

  // ============= HOJA 4: ANALISIS DE TIEMPOS =============
  const wsTimes = wb.addWorksheet('Analisis Tiempos', { tabColor: { argb: 'F59E0B' } });

  wsTimes.getCell('A1').value = 'ANALISIS DE TIEMPOS DE RESPUESTA';
  wsTimes.getCell('A1').font = { bold: true, size: 16, color: { argb: 'FFFFFF' } };
  wsTimes.getCell('A1').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F59E0B' } };
  wsTimes.mergeCells('A1:F1');
  wsTimes.getCell('A1').alignment = { horizontal: 'center', vertical: 'middle' };
  wsTimes.getRow(1).height = 30;

  const timeHeaders = ['Empleado', 'Citas', 'Viajes', 'Prom. Viaje (min)', 'Prom. Servicio (min)', 'Eficiencia'];
  timeHeaders.forEach((h, i) => {
    wsTimes.getCell(3, i + 1).value = h;
    Object.assign(wsTimes.getCell(3, i + 1), headerStyle);
  });

  let timeRow = 4;
  empArray.forEach((emp) => {
    const efficiency = emp.avgServiceTime > 0 ? (emp.done / emp.avgServiceTime) * 100 : 0;

    wsTimes.getCell(timeRow, 1).value = emp.name;
    wsTimes.getCell(timeRow, 2).value = emp.total;
    wsTimes.getCell(timeRow, 3).value = emp.withTravel;
    wsTimes.getCell(timeRow, 4).value = emp.avgTravelTime;
    wsTimes.getCell(timeRow, 4).numFmt = '0.0';
    wsTimes.getCell(timeRow, 5).value = emp.avgServiceTime;
    wsTimes.getCell(timeRow, 5).numFmt = '0.0';
    wsTimes.getCell(timeRow, 6).value = efficiency;
    wsTimes.getCell(timeRow, 6).numFmt = '0.0';

    // Color de eficiencia
    if (efficiency > 10) {
      wsTimes.getCell(timeRow, 6).font = { bold: true, color: { argb: '059669' } };
    } else if (efficiency < 5) {
      wsTimes.getCell(timeRow, 6).font = { bold: true, color: { argb: 'DC2626' } };
    }

    for (let c = 1; c <= 6; c++) {
      wsTimes.getCell(timeRow, c).alignment = { horizontal: c === 1 ? 'left' : 'center' };
      wsTimes.getCell(timeRow, c).border = { bottom: { style: 'thin', color: { argb: 'E5E7EB' } } };
    }
    timeRow++;
  });

  // Datos para grafica de tiempos
  wsTimes.getCell('H3').value = 'Empleado';
  wsTimes.getCell('I3').value = 'Tiempo Viaje';
  wsTimes.getCell('J3').value = 'Tiempo Servicio';
  [3, 4, 5].forEach((c) => Object.assign(wsTimes.getCell(3, 7 + c - 3), headerStyleLight));

  empArray.slice(0, 8).forEach((emp, i) => {
    wsTimes.getCell(4 + i, 8).value = emp.name.length > 12 ? emp.name.substring(0, 12) + '...' : emp.name;
    wsTimes.getCell(4 + i, 9).value = emp.avgTravelTime;
    wsTimes.getCell(4 + i, 10).value = emp.avgServiceTime;
  });

  // Grafica comparativa de tiempos (deshabilitada temporalmente por error de corrupcion)
  // wsTimes.addChart({
  //   type: 'column',
  //   name: 'Tiempo Promedio de Viaje por Tecnico',
  //   data: empArray.slice(0, 8).map((e) => ({
  //     label: e.name.length > 12 ? e.name.substring(0, 12) + '...' : e.name,
  //     value: Math.round(e.avgTravelTime),
  //   })),
  //   position: { tl: { col: 8, row: 14 }, br: { col: 15, row: 28 } },
  // });

  ['A', 'B', 'C', 'D', 'E', 'F'].forEach((col, i) => {
    const widths = [25, 10, 10, 18, 20, 12];
    wsTimes.getColumn(col).width = widths[i];
  });

  // ============= HOJA 5: COMPORTAMIENTO POR ESTADO =============
  const wsStatus = wb.addWorksheet('Flujo de Trabajo', { tabColor: { argb: '8B5CF6' } });

  wsStatus.getCell('A1').value = 'ANALISIS DEL FLUJO DE TRABAJO';
  wsStatus.getCell('A1').font = { bold: true, size: 16, color: { argb: 'FFFFFF' } };
  wsStatus.getCell('A1').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '8B5CF6' } };
  wsStatus.mergeCells('A1:G1');
  wsStatus.getCell('A1').alignment = { horizontal: 'center', vertical: 'middle' };
  wsStatus.getRow(1).height = 30;

  const flowHeaders = ['Empleado', 'Con Viaje', 'Con Llegada', 'Con Inicio', 'Completadas', '% Conversion Viaje', '% Conversion Servicio'];
  flowHeaders.forEach((h, i) => {
    wsStatus.getCell(3, i + 1).value = h;
    Object.assign(wsStatus.getCell(3, i + 1), headerStyle);
  });

  let flowRow = 4;
  empArray.forEach((emp) => {
    const travelConversion = emp.withTravel > 0 ? emp.withArrival / emp.withTravel : 0;
    const serviceConversion = emp.withServiceStart > 0 ? emp.done / emp.withServiceStart : 0;

    wsStatus.getCell(flowRow, 1).value = emp.name;
    wsStatus.getCell(flowRow, 2).value = emp.withTravel;
    wsStatus.getCell(flowRow, 3).value = emp.withArrival;
    wsStatus.getCell(flowRow, 4).value = emp.withServiceStart;
    wsStatus.getCell(flowRow, 5).value = emp.done;
    wsStatus.getCell(flowRow, 6).value = travelConversion;
    wsStatus.getCell(flowRow, 6).numFmt = '0.0%';
    wsStatus.getCell(flowRow, 7).value = serviceConversion;
    wsStatus.getCell(flowRow, 7).numFmt = '0.0%';

    // Color segun conversion
    if (travelConversion > 0.9) {
      wsStatus.getCell(flowRow, 6).font = { color: { argb: '059669' } };
    } else if (travelConversion < 0.7) {
      wsStatus.getCell(flowRow, 6).font = { color: { argb: 'DC2626' } };
    }

    for (let c = 1; c <= 7; c++) {
      wsStatus.getCell(flowRow, c).alignment = { horizontal: c === 1 ? 'left' : 'center' };
      wsStatus.getCell(flowRow, c).border = { bottom: { style: 'thin', color: { argb: 'E5E7EB' } } };
    }
    flowRow++;
  });

  // Grafica de funnel/flujo
  const flowData = [
    { label: 'Inician Viaje', value: trackingAppointments.filter(a => a.travelStartTime).length },
    { label: 'Llegan al Destino', value: trackingAppointments.filter(a => a.arrivalTime).length },
    { label: 'Inician Servicio', value: trackingAppointments.filter(a => a.serviceStartTime).length },
    { label: 'Completan', value: totalDone },
  ];

  wsStatus.getCell('I3').value = 'Funnel';
  wsStatus.getCell('I3').font = { bold: true, color: { argb: '1E40AF' } };
  flowData.forEach((d, i) => {
    wsStatus.getCell(4 + i, 9).value = d.label;
    wsStatus.getCell(4 + i, 10).value = d.value;
  });

  // Grafica Funnel (deshabilitada temporalmente por error de corrupcion)
  // wsStatus.addChart({
  //   type: 'bar',
  //   name: 'Funnel de Conversion (Total)',
  //   data: flowData.map((d) => ({ label: d.label, value: d.value })),
  //   position: { tl: { col: 9, row: 10 }, br: { col: 16, row: 24 } },
  // });

  ['A', 'B', 'C', 'D', 'E', 'F', 'G'].forEach((col, i) => {
    const widths = [25, 12, 12, 12, 12, 20, 20];
    wsStatus.getColumn(col).width = widths[i];
  });

  // Guardar
  const buffer = await wb.xlsx.writeBuffer();
  const mockWb = {
    _exceljs: true,
    _buffer: buffer,
  };

  await saveExcel(mockWb, `seguimiento-tecnicos-AVANZADO-${period}-${new Date().toISOString().slice(0, 10)}.xlsx`);
}

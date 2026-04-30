import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { savePDF } from '../../../utils/fileDownload';
import { fmt } from '../../../shared/utils/formatters';
import { STATUS_LABELS, EXPENSE_CATEGORIES } from './reportHelpers';

// Extraer la URL base del backend desde el cliente API
import api from '../../../api/client';
const API_BASE_URL = api.defaults.baseURL || '';
const BACKEND_URL = API_BASE_URL.replace(/\/api$/, '');

// Helper para cargar logo del negocio
async function loadLogoImage(logoUrl, makeCircular = false) {
  if (!logoUrl) return null;

  let fullUrl = logoUrl;
  if (logoUrl.startsWith('/')) {
    fullUrl = `${window.location.origin}${logoUrl}`;
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const size = 100;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');

        ctx.clearRect(0, 0, size, size);

        if (makeCircular) {
          ctx.beginPath();
          ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
          ctx.closePath();
          ctx.clip();
        } else {
          const r = 15;
          ctx.beginPath();
          ctx.moveTo(r, 0);
          ctx.lineTo(size - r, 0);
          ctx.quadraticCurveTo(size, 0, size, r);
          ctx.lineTo(size, size - r);
          ctx.quadraticCurveTo(size, size, size - r, size);
          ctx.lineTo(r, size);
          ctx.quadraticCurveTo(0, size, 0, size - r);
          ctx.lineTo(0, r);
          ctx.quadraticCurveTo(0, 0, r, 0);
          ctx.closePath();
          ctx.clip();
        }

        const scale = Math.max(size / img.width, size / img.height);
        const x = (size - img.width * scale) / 2;
        const y = (size - img.height * scale) / 2;
        ctx.drawImage(img, x, y, img.width * scale, img.height * scale);

        ctx.strokeStyle = makeCircular ? '#e0e0e0' : '#d0d0d0';
        ctx.lineWidth = 2;
        if (makeCircular) {
          ctx.beginPath();
          ctx.arc(size / 2, size / 2, size / 2 - 1, 0, Math.PI * 2);
          ctx.stroke();
        } else {
          const r = 15;
          ctx.beginPath();
          ctx.moveTo(r, 1);
          ctx.lineTo(size - r, 1);
          ctx.quadraticCurveTo(size - 1, 1, size - 1, r);
          ctx.lineTo(size - 1, size - r);
          ctx.quadraticCurveTo(size - 1, size - 1, size - r, size - 1);
          ctx.lineTo(r, size - 1);
          ctx.quadraticCurveTo(1, size - 1, 1, size - r);
          ctx.lineTo(1, r);
          ctx.quadraticCurveTo(1, 1, r, 1);
          ctx.stroke();
        }

        const dataUrl = canvas.toDataURL('image/png');
        resolve(dataUrl);
      } catch (err) {
        resolve(null);
      }
    };

    img.onerror = () => resolve(null);

    const separator = fullUrl.includes('?') ? '&' : '?';
    img.src = `${fullUrl}${separator}_t=${Date.now()}`;
    setTimeout(() => resolve(null), 5000);
  });
}

export async function generatePDF({
  appointments,
  business,
  businessWithLogo,
  range,
  showFullFinancial,
  financialReport,
  enabledModules,
  period,
}) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 14;

  const colors = {
    primary: [60, 60, 60],
    secondary: [100, 100, 100],
    light: [240, 240, 240],
    white: [255, 255, 255],
    black: [30, 30, 30],
    accent: [79, 70, 229],
  };

  let yPos = 20;
  const done = appointments.filter((a) => a.status === 'done');

  // Logo
  if (businessWithLogo?.logoUrl) {
    try {
      const logoData = await loadLogoImage(businessWithLogo.logoUrl, false);
      if (logoData) {
        doc.addImage(logoData, 'PNG', margin, 10, 26, 26);
      }
    } catch (e) {
      // Silently fail
    }
  }

  // Título del negocio
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(...colors.black);
  doc.text(businessWithLogo?.name || business?.name || 'Mi Negocio', pageWidth - margin, yPos, {
    align: 'right',
  });

  // Subtítulo
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(...colors.secondary);
  doc.text('Informe de Actividad', pageWidth - margin, yPos + 7, { align: 'right' });

  // Período
  doc.setFontSize(9);
  const periodLabel =
    range?.start && range?.end
      ? `${range.start.toLocaleDateString('es-CO', { day: '2-digit', month: 'short' })} - ${range.end.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })}`
      : range?.label || '';
  doc.text(periodLabel, pageWidth - margin, yPos + 13, { align: 'right' });

  // Línea separadora
  yPos = 40;
  doc.setDrawColor(...colors.primary);
  doc.setLineWidth(0.5);
  doc.line(margin, yPos, pageWidth - margin, yPos);

  // Sección: Resumen
  yPos += 15;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(...colors.black);
  doc.text('Resumen del Período', margin, yPos);

  // Tabla de resumen
  yPos += 8;
  const totalRev = done.reduce(
    (s, a) => s + parseFloat(a.Service?.price || 0) + parseFloat(a.additionalAmount || 0),
    0
  );
  const empRev = done.reduce((s, a) => {
    const basePrice = parseFloat(a.Service?.price || 0);
    const additional = parseFloat(a.additionalAmount || 0);
    const totalPrice = basePrice + additional;
    const commPct = parseFloat(a.Employee?.commissionPct || 0);
    const earned = a.employeeEarns
      ? parseFloat(a.employeeEarns)
      : (totalPrice * commPct) / 100;
    return s + (isNaN(earned) ? 0 : earned);
  }, 0);
  const ownerRev = totalRev - empRev;

  const summaryBody = [
    ['Total citas', appointments.length.toString()],
    ['Citas completadas', done.length.toString()],
    ['Citas pendientes', appointments.filter((a) => a.status === 'pending').length.toString()],
    ['Citas canceladas', appointments.filter((a) => a.status === 'cancelled').length.toString()],
  ];

  if (!business?.isTechnicalServices && !business?.hasFieldTechnicians) {
    summaryBody.push(['Ingresos totales', fmt(totalRev)]);
    summaryBody.push(['Ganancia del negocio', fmt(ownerRev)]);
    summaryBody.push(['Pago a profesionales', fmt(empRev)]);
  }

  // Informe financiero completo
  if (showFullFinancial && period === 'month' && financialReport && !business?.isTechnicalServices) {
    summaryBody.push(['', '']);
    summaryBody.push(['─── INFORME FINANCIERO COMPLETO ───', '']);
    summaryBody.push(['Ingresos por Citas', fmt(financialReport.summary.totalIncome || 0)]);

    if (enabledModules.inventory) {
      summaryBody.push(['Costo de Insumos', fmt(financialReport.summary.inventoryCost || 0)]);
    }

    if (enabledModules.expenses) {
      summaryBody.push(['Gastos Operativos', fmt(financialReport.summary.totalExpenses || 0)]);
    }

    summaryBody.push(['Utilidad Neta', fmt(financialReport.summary.netProfit || 0)]);

    if (enabledModules.deposits && financialReport?.details?.deposits?.totalHeld > 0) {
      summaryBody.push(['Depósitos Retenidos', fmt(financialReport.details.deposits.totalHeld)]);
    }
  }

  autoTable(doc, {
    startY: yPos,
    head: [['Métrica', 'Valor']],
    body: summaryBody,
    theme: 'plain',
    headStyles: {
      fillColor: colors.light,
      textColor: colors.black,
      fontStyle: 'bold',
      fontSize: 10,
    },
    bodyStyles: {
      fontSize: 10,
      textColor: colors.black,
    },
    columnStyles: {
      0: { fontStyle: 'normal', cellWidth: 60 },
      1: { fontStyle: 'bold', halign: 'right' },
    },
    styles: {
      cellPadding: 5,
      lineColor: [220, 220, 220],
      lineWidth: 0.1,
    },
    margin: { left: margin, right: margin },
  });

  // Resumen de pagos a empleados
  const employeePayments = done.reduce((acc, a) => {
    const name = a.Employee?.User?.name || 'Sin asignar';
    const basePrice = parseFloat(a.Service?.price || 0);
    const additional = parseFloat(a.additionalAmount || 0);
    const totalPrice = basePrice + additional;
    const commPct = parseFloat(a.Employee?.commissionPct || 0);
    const earned = a.employeeEarns
      ? parseFloat(a.employeeEarns)
      : (totalPrice * commPct) / 100;

    if (!acc[name]) {
      acc[name] = { name, citas: 0, total: 0 };
    }
    acc[name].citas++;
    acc[name].total += isNaN(earned) ? 0 : earned;
    return acc;
  }, {});

  const employeeList = Object.values(employeePayments);

  if (employeeList.length > 0) {
    yPos = doc.lastAutoTable.finalY + 15;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(...colors.black);
    doc.text(
      business?.isTechnicalServices || business?.hasFieldTechnicians
        ? 'Citas por Profesional'
        : 'Resumen de Pagos a Profesionales',
      margin,
      yPos
    );

    yPos += 8;
    const empHead =
      business?.isTechnicalServices || business?.hasFieldTechnicians
        ? [['Profesional', 'Citas completadas']]
        : [['Profesional', 'Citas completadas', 'Total a pagar']];

    const empBody = employeeList.map((emp) => {
      const row = [emp.name, emp.citas.toString()];
      if (!business?.isTechnicalServices && !business?.hasFieldTechnicians) row.push(fmt(emp.total));
      return row;
    });

    const empFoot =
      business?.isTechnicalServices || business?.hasFieldTechnicians
        ? [['TOTAL', done.length.toString()]]
        : [['TOTAL', done.length.toString(), fmt(empRev)]];

    autoTable(doc, {
      startY: yPos,
      head: empHead,
      body: empBody,
      foot: empFoot,
      theme: 'plain',
      headStyles: {
        fillColor: colors.light,
        textColor: colors.black,
        fontStyle: 'bold',
        fontSize: 10,
      },
      bodyStyles: {
        fontSize: 10,
        textColor: colors.black,
      },
      footStyles: {
        fillColor: [220, 220, 220],
        textColor: colors.black,
        fontStyle: 'bold',
        fontSize: 10,
      },
      columnStyles: {
        0: { cellWidth: business?.isTechnicalServices || business?.hasFieldTechnicians ? 130 : 80 },
        1: { cellWidth: 50, halign: 'center' },
        ...(business?.isTechnicalServices || business?.hasFieldTechnicians
          ? {}
          : { 2: { cellWidth: 50, halign: 'right', fontStyle: 'bold' } }),
      },
      styles: {
        cellPadding: 5,
        lineColor: [220, 220, 220],
        lineWidth: 0.1,
      },
      margin: { left: margin, right: margin },
    });
  }

  // Detalle de citas
  yPos = doc.lastAutoTable.finalY + 15;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(...colors.black);
  doc.text('Detalle de Citas', margin, yPos);

  const appointmentsHead =
    business?.isTechnicalServices || business?.hasFieldTechnicians
      ? [['Fecha', 'Cliente', 'Servicio', 'Profesional', 'Estado']]
      : [['Fecha', 'Cliente', 'Servicio', 'Profesional', 'Precio', 'Adicional', 'Pago', 'Estado']];

  const appointmentsBody = appointments.map((a) => {
    const row = [
      new Date(a.startTime).toLocaleString('es-CO', {
        dateStyle: 'short',
        timeStyle: 'short',
        timeZone: 'America/Bogota',
      }),
      a.clientName || '',
      a.Service?.name || '',
      a.Employee?.User?.name || '',
    ];
    if (!business?.isTechnicalServices && !business?.hasFieldTechnicians) {
      const base = parseFloat(a.Service?.price || 0);
      const add = parseFloat(a.additionalAmount || 0);
      row.push(fmt(base));
      row.push(fmt(add));
      const pm =
        a.paymentMethod === 'cash' ? 'Efectivo' : a.paymentMethod === 'transfer' ? 'Transf.' : '-';
      row.push(pm);
    }
    row.push(STATUS_LABELS[a.status] || a.status);
    return row;
  });

  autoTable(doc, {
    startY: yPos,
    head: appointmentsHead,
    body: appointmentsBody,
    theme: 'plain',
    headStyles: {
      fillColor: colors.light,
      textColor: colors.black,
      fontStyle: 'bold',
      fontSize: 8,
    },
    bodyStyles: {
      fontSize: 7,
      textColor: colors.black,
    },
    columnStyles: business?.isTechnicalServices
      ? {
          0: { cellWidth: 35 },
          1: { cellWidth: 40 },
          2: { cellWidth: 45 },
          3: { cellWidth: 35 },
          4: { cellWidth: 25, halign: 'center' },
        }
      : {
          0: { cellWidth: 24 },
          1: { cellWidth: 26 },
          2: { cellWidth: 28 },
          3: { cellWidth: 26 },
          4: { cellWidth: 22, halign: 'right' },
          5: { cellWidth: 22, halign: 'right' },
          6: { cellWidth: 22, halign: 'right', fontStyle: 'bold' },
          7: { cellWidth: 20, halign: 'center' },
        },
    styles: {
      cellPadding: 4,
      lineColor: [220, 220, 220],
      lineWidth: 0.1,
      overflow: 'linebreak',
    },
    margin: { left: margin, right: margin },
    alternateRowStyles: {
      fillColor: [250, 250, 250],
    },
  });

  // Footer
  const footerY = doc.internal.pageSize.getHeight() - 15;
  doc.setDrawColor(...colors.light);
  doc.setLineWidth(0.3);
  doc.line(margin, footerY - 5, pageWidth - margin, footerY - 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...colors.secondary);
  doc.text(`Generado el ${new Date().toLocaleString('es-CO')} • K-Dice Reservas`, margin, footerY);

  await savePDF(doc, `informe-${period}-${new Date().toISOString().slice(0, 10)}.pdf`);
}

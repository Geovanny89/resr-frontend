/**
 * Payments Feature - usePaymentPDF Hook
 * Maneja la generación de PDFs para reportes de pagos
 */
import { useCallback } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { savePDF } from '../../../utils/fileDownload';
import { 
  loadLogoImage, 
  getMonthLabel, 
  fmtDate, 
  fmt, 
  PDF_COLORS 
} from '../utils';

export function usePaymentPDF(business) {
  const margin = 14;
  const colors = PDF_COLORS;

  // Generar PDF individual para un empleado (retorna base64)
  const generateEmployeePDF = useCallback(async (emp, month) => {
    const doc = new jsPDF();
    const monthLabel = getMonthLabel(month);
    const pageWidth = doc.internal.pageSize.getWidth();
    
    let yPos = 20;

    // Agregar logo si existe - con estilo redondeado
    if (business?.logoUrl) {
      try {
        const logoData = await loadLogoImage(business.logoUrl);
        if (logoData) {
          // Fondo redondeado sutil
          doc.setFillColor(245, 245, 245);
          doc.setDrawColor(220, 220, 220);
          doc.roundedRect(margin, 10, 26, 26, 4, 4, 'FD');
          // Logo
          doc.addImage(logoData, 'PNG', margin + 1, 11, 24, 24);
        }
      } catch (e) {
        console.error('Error adding logo to PDF:', e);
      }
    }

    // Header limpio - nombre del negocio
    const titleX = business?.logoUrl ? margin + 35 : margin;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(...colors.black);
    doc.text(business?.name || 'Mi Negocio', titleX, 25);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(...colors.secondary);
    doc.text('Reporte de Pagos', titleX, 32);
    doc.setFontSize(9);
    doc.text(monthLabel, titleX, 38);

    // Fecha de emisión (alineada derecha)
    doc.setFontSize(9);
    doc.text(
      `Emitido: ${new Date().toLocaleString('es-CO')}`,
      pageWidth - 20,
      20,
      { align: 'right' }
    );

    // Línea separadora elegante
    yPos = 45;
    doc.setDrawColor(...colors.primary);
    doc.setLineWidth(0.5);
    doc.line(margin, yPos, pageWidth - margin, yPos);

    // Info del empleado
    yPos = 58;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(...colors.black);
    doc.text(`Empleado: ${emp.name}`, margin, yPos);
    
    yPos += 12;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(...colors.secondary);
    doc.text(`Total a recibir: ${fmt(emp.employeeEarns)}`, margin, yPos);
    yPos += 7;
    doc.text(`Citas completadas: ${emp.appointments.length}`, margin, yPos);

    // Detalle de citas con tabla limpia
    yPos += 15;
    autoTable(doc, {
      startY: yPos,
      head: [['Fecha', 'Cliente', 'Servicio', 'Gana']],
      body: emp.appointments.map(a => [
        fmtDate(a.date),
        a.client || '—',
        a.service,
        fmt(a.employeeEarns),
      ]),
      foot: [[
        '', '', 'TOTAL', fmt(emp.employeeEarns)
      ]],
      theme: 'plain',
      headStyles: {
        fillColor: colors.light,
        textColor: colors.black,
        fontStyle: 'bold',
        fontSize: 10,
      },
      bodyStyles: {
        fontSize: 9,
        textColor: colors.black,
      },
      footStyles: {
        fillColor: [250, 250, 250],
        textColor: colors.black,
        fontStyle: 'bold',
        fontSize: 10,
      },
      styles: {
        cellPadding: 5,
        lineColor: [220, 220, 220],
        lineWidth: 0.1,
      },
      margin: { left: margin, right: margin },
      alternateRowStyles: {
        fillColor: [252, 252, 252],
      },
    });

    // Footer
    const footerY = doc.internal.pageSize.getHeight() - 20;
    doc.setDrawColor(...colors.light);
    doc.setLineWidth(0.3);
    doc.line(margin, footerY - 8, pageWidth - margin, footerY - 8);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...colors.secondary);
    doc.text('Este documento certifica que el pago fue recibido.', pageWidth / 2, footerY, { align: 'center' });

    // Retornar como base64
    return doc.output('datauristring').split(',')[1];
  }, [business, colors, margin]);

  // Descargar PDF completo con todos los empleados
  const downloadFullPDF = useCallback(async (employees, report, month) => {
    const doc = new jsPDF();
    const monthLabel = getMonthLabel(month);
    const pageWidth = doc.internal.pageSize.getWidth();
    
    let yPos = 20;

    // Agregar logo si existe - con estilo redondeado
    if (business?.logoUrl) {
      try {
        const logoData = await loadLogoImage(business.logoUrl);
        if (logoData) {
          // Fondo redondeado sutil
          doc.setFillColor(245, 245, 245);
          doc.setDrawColor(220, 220, 220);
          doc.roundedRect(margin, 10, 26, 26, 4, 4, 'FD');
          // Logo
          doc.addImage(logoData, 'PNG', margin + 1, 11, 24, 24);
        }
      } catch (e) {
        console.error('Error adding logo to PDF:', e);
      }
    }

    // Header limpio
    const titleX = business?.logoUrl ? margin + 35 : margin;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(...colors.black);
    doc.text(business?.name || 'Mi Negocio', titleX, 25);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(...colors.secondary);
    doc.text('Reporte de Pagos', titleX, 32);
    doc.setFontSize(9);
    doc.text(monthLabel, titleX, 38);

    // Fecha de emisión (alineada derecha)
    doc.setFontSize(9);
    doc.text(
      `Emitido: ${new Date().toLocaleString('es-CO')}`,
      pageWidth - 20,
      20,
      { align: 'right' }
    );

    // Línea separadora elegante
    yPos = 45;
    doc.setDrawColor(...colors.primary);
    doc.setLineWidth(0.5);
    doc.line(margin, yPos, pageWidth - margin, yPos);

    // Resumen Financiero
    yPos = 58;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(...colors.black);
    doc.text('Resumen Financiero', margin, yPos);

    const totals = report?.totals || {};
    autoTable(doc, {
      startY: yPos + 8,
      head: [['Concepto', 'Monto']],
      body: [
        ['Ingresos totales del negocio', fmt(totals.total)],
        ['Ganancia del dueño', fmt(totals.ownerTotal)],
        ['Total a pagar empleados', fmt(totals.employeeTotal)],
      ],
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
        0: { fontStyle: 'normal' },
        1: { fontStyle: 'bold', halign: 'right' },
      },
      styles: {
        cellPadding: 5,
        lineColor: [220, 220, 220],
        lineWidth: 0.1,
      },
      margin: { left: margin, right: margin },
    });

    // Por empleado
    let y = doc.lastAutoTable.finalY + 15;
    employees.forEach(emp => {
      // Verificar si necesitamos nueva página
      if (y > 250) {
        doc.addPage();
        y = 20;
      }
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...colors.black);
      doc.text(`Empleado: ${emp.name}`, margin, y);
      y += 6;

      autoTable(doc, {
        startY: y,
        head: [['Fecha', 'Cliente', 'Servicio', 'Total']],
        body: emp.appointments.map(a => [
          fmtDate(a.date),
          a.client || '—',
          a.service,
          fmt(a.employeeEarns),
        ]),
        foot: [[
          '', '', 'TOTAL', fmt(emp.employeeEarns)
        ]],
        theme: 'plain',
        headStyles: {
          fillColor: colors.light,
          textColor: colors.black,
          fontStyle: 'bold',
          fontSize: 9,
        },
        bodyStyles: {
          fontSize: 8,
          textColor: colors.black,
        },
        footStyles: {
          fillColor: [250, 250, 250],
          textColor: colors.black,
          fontStyle: 'bold',
          fontSize: 9,
        },
        styles: {
          cellPadding: 4,
          lineColor: [220, 220, 220],
          lineWidth: 0.1,
          overflow: 'linebreak',
        },
        margin: { left: margin, right: margin },
        alternateRowStyles: {
          fillColor: [252, 252, 252],
        },
      });
      y = doc.lastAutoTable.finalY + 12;
    });

    // Footer
    const footerY = doc.internal.pageSize.getHeight() - 15;
    doc.setDrawColor(...colors.light);
    doc.setLineWidth(0.3);
    doc.line(margin, footerY - 5, pageWidth - margin, footerY - 5);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...colors.secondary);
    doc.text('Este documento certifica que los pagos fueron calculados correctamente.', pageWidth / 2, footerY, { align: 'center' });

    // Usar savePDF para compatibilidad con APK
    await savePDF(doc, `pagos-${month}.pdf`);
  }, [business, colors, margin]);

  return {
    generateEmployeePDF,
    downloadFullPDF,
  };
}

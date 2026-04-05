import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import api from '../../api/client';
import AdminLayout from '../../components/AdminLayout';
import {
  DollarSign, TrendingUp, Users, Calendar, CheckCircle,
  Download, Mail, RefreshCw, ChevronDown, ChevronLeft, ChevronRight
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { savePDF } from '../../utils/fileDownload';

const fmt = (n) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n || 0);

const fmtDate = (d) =>
  new Date(d).toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' });

// Extraer la URL base del backend desde el cliente API
const API_BASE_URL = api.defaults.baseURL || '';
const BACKEND_URL = API_BASE_URL.replace(/\/api$/, ''); // Quitar el sufijo /api si existe

// ─── Helper para cargar logo del negocio ──────────────────────────────────────
async function loadLogoImage(logoUrl) {
  if (!logoUrl) return null;
  try {
    let fullUrl = logoUrl;
    if (logoUrl.startsWith('/')) {
      fullUrl = `${BACKEND_URL}${logoUrl}`;
    } else if (!logoUrl.startsWith('http')) {
      fullUrl = `${BACKEND_URL}/${logoUrl}`;
    }
    
    return new Promise((resolve) => {
      const img = new Image();
      console.log('Loading logo from:', fullUrl);
      img.crossOrigin = 'Anonymous';
      img.onload = () => {
        console.log('Logo image loaded successfully');
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        try {
          const dataURL = canvas.toDataURL('image/png');
          resolve(dataURL);
        } catch (e) {
          console.error('Canvas toDataURL failed (CORS?):', e);
          resolve(null);
        }
      };
      img.onerror = (e) => {
        console.error('Error loading image via object:', e);
        resolve(null);
      };
      img.src = fullUrl;
    });
  } catch (e) {
    console.error('Error in loadLogoImage:', e);
    return null;
  }
}

const MONTHS_ES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

// ─── Componente para detalle de empleado con paginación ────────────────
function EmployeeDetail({ emp, paginationPages, setPaginationPages, isMobile }) {
  const { colors } = useTheme();
  const itemsPerPage = 5;
  const currentPage = paginationPages[emp.name] || 1;
  const totalPages = Math.ceil(emp.appointments.length / itemsPerPage);
  
  const paginatedAppointments = emp.appointments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  const setPage = (page) => {
    setPaginationPages(prev => ({ ...prev, [emp.name]: page }));
  };
  
  return (
    <div style={{ marginTop: 16, borderTop: '1px solid var(--border)', paddingTop: 16 }}>
      {!isMobile ? (
        /* Vista para pantallas grandes (Tabla) */
        <div className="table-wrapper">
          <table className="table" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Servicio</th>
                <th>Precio</th>
                <th>Empleado gana</th>
                <th>Negocio gana</th>
              </tr>
            </thead>
            <tbody>
              {paginatedAppointments.map((a, i) => (
                <tr key={i}>
                  <td style={{ whiteSpace: 'nowrap', fontSize: 12 }}>{fmtDate(a.date)}</td>
                  <td>{a.service}</td>
                  <td><span className="money">{fmt(a.price)}</span></td>
                  <td><span className="money positive">{fmt(a.employeeEarns)}</span></td>
                  <td><span className="money positive">{fmt(a.ownerEarns)}</span></td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ background: colors.bgSecondary, fontWeight: 700 }}>
                <td colSpan={2} style={{ padding: '12px 16px', fontWeight: 700, color: colors.text }}>TOTALES</td>
                <td style={{ padding: '12px 16px' }}><span className="money">{fmt(emp.total)}</span></td>
                <td style={{ padding: '12px 16px' }}><span className="money positive">{fmt(emp.employeeEarns)}</span></td>
                <td style={{ padding: '12px 16px' }}><span className="money positive">{fmt(emp.ownerEarns)}</span></td>
              </tr>
            </tfoot>
          </table>
        </div>
      ) : (
        /* Vista para pantallas pequeñas (Cards) */
        <div style={{ display: 'grid', gap: 12 }}>
          {paginatedAppointments.map((a, i) => (
            <div key={i} style={{ 
              background: colors.bgSecondary, 
              borderRadius: 12, 
              padding: 12, 
              border: `1px solid ${colors.border}`,
              fontSize: '13px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, borderBottom: `1px solid ${colors.border}`, paddingBottom: 6 }}>
                <span style={{ fontWeight: 700, color: colors.text }}>{fmtDate(a.date)}</span>
                <span style={{ fontWeight: 800, color: 'var(--primary)' }}>{a.service}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <div>
                  <div style={{ fontSize: '11px', color: colors.textSecondary }}>Precio total:</div>
                  <div style={{ fontWeight: 700, color: colors.text }}>{fmt(a.price)}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '11px', color: colors.textSecondary }}>Comisión Emp:</div>
                  <div style={{ fontWeight: 700, color: 'var(--success)' }}>{fmt(a.employeeEarns)}</div>
                </div>
                <div style={{ gridColumn: 'span 2', marginTop: 4, paddingTop: 4, borderTop: `1px dashed ${colors.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: colors.textSecondary }}>GANANCIA NEGOCIO:</span>
                  <span style={{ fontSize: '15px', fontWeight: 800, color: 'var(--success)' }}>{fmt(a.ownerEarns)}</span>
                </div>
              </div>
            </div>
          ))}

          {/* Totales en móvil */}
          <div style={{ 
            background: 'var(--primary)', 
            color: 'white', 
            borderRadius: 12, 
            padding: 14, 
            marginTop: 4,
            boxShadow: '0 4px 6px rgba(79, 70, 229, 0.2)'
          }}>
            <div style={{ fontSize: '12px', opacity: 0.9, marginBottom: 4, fontWeight: 600 }}>RESUMEN DE ESTA PÁGINA</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Total Facturado:</span>
              <span style={{ fontWeight: 800 }}>{fmt(paginatedAppointments.reduce((s, a) => s + parseFloat(a.price), 0))}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
              <span>Ganancia Negocio:</span>
              <span style={{ fontSize: '18px', fontWeight: 900 }}>{fmt(paginatedAppointments.reduce((s, a) => s + parseFloat(a.ownerEarns), 0))}</span>
            </div>
          </div>
        </div>
      )}

      {/* Paginación (Mejorada para móvil) */}
      {totalPages > 1 && (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          gap: 10, 
          marginTop: 16,
          padding: '10px 0',
          borderTop: '1px solid var(--border)'
        }}>
          <button
            className="btn-outline btn-sm"
            disabled={currentPage === 1}
            onClick={(e) => { e.stopPropagation(); setPage(currentPage - 1); }}
            style={{ minWidth: '80px', height: '36px' }}
          >
            ← Ant.
          </button>
          <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)', minWidth: '100px', textAlign: 'center' }}>
            {currentPage} / {totalPages}
          </span>
          <button
            className="btn-outline btn-sm"
            disabled={currentPage >= totalPages}
            onClick={(e) => { e.stopPropagation(); setPage(currentPage + 1); }}
            style={{ minWidth: '80px', height: '36px' }}
          >
            Sig. →
          </button>
        </div>
      )}
      <div style={{ textAlign: 'center', fontSize: '11px', color: 'var(--text-muted)', marginTop: 8 }}>
        Mostrando {paginatedAppointments.length} de {emp.appointments.length} citas
      </div>
    </div>
  );
}

// ─── Utilidades de fecha segura (sin desfase de zona horaria) ────────────────

function getMonthLabel(monthStr) {
  // monthStr es formato "YYYY-MM"
  if (!monthStr) return '';
  const [year, month] = monthStr.split('-').map(Number);
  const monthIndex = month - 1; // 0-11
  return `${MONTHS_ES[monthIndex]} ${year}`;
}

// ─── Selector de Mes/Año ────────────────────────────────────────────────────

function MonthYearPicker({ value, onChange, onClose }) {
  const { colors } = useTheme();
  // Obtener fecha actual en zona horaria de Colombia (UTC-5)
  const today = new Date();
  const colombiaDateStr = today.toLocaleString('en-CA', { timeZone: 'America/Bogota', year: 'numeric', month: '2-digit', day: '2-digit' });
  const [yearStr, monthStr] = colombiaDateStr.split('-');
  const currentYear = parseInt(yearStr);
  const currentMonth = parseInt(monthStr); // Ya es 1-12

  // Extraer correctamente año y mes del string YYYY-MM
  const [viewYear, setViewYear] = useState(value ? parseInt(value.split('-')[0]) : currentYear);
  const [viewMonth, setViewMonth] = useState(value ? parseInt(value.split('-')[1]) : currentMonth);

  const prevYear = () => setViewYear(v => v - 1);
  const nextYear = () => setViewYear(v => v + 1);

  const handleMonth = (monthNumber) => {
    const monthStr = String(monthNumber).padStart(2, '0');
    const result = `${viewYear}-${monthStr}`;
    onChange(result);
    onClose();
  };

  const isSelected = (monthNumber) => {
    if (!value) return false;
    const [y, m] = value.split('-').map(Number);
    return y === viewYear && m === monthNumber;
  };

  return (
    <div style={{
      background: colors.cardBg, borderRadius: 14, padding: 24, userSelect: 'none',
      maxWidth: 360, width: '100%', boxShadow: `0 4px 12px ${colors.shadow}`, border: `1px solid ${colors.border}`
    }}>
      {/* Selector de año */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <button type="button" onClick={prevYear}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)', padding: 4 }}>
          <ChevronLeft size={18} />
        </button>
        <span style={{ fontWeight: 700, fontSize: 18, color: colors.text, minWidth: 80, textAlign: 'center' }}>
          {viewYear}
        </span>
        <button type="button" onClick={nextYear}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)', padding: 4 }}>
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Grid de meses */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
        {MONTHS_ES.map((monthName, i) => {
          const monthNumber = i + 1; // 1-12
          const sel = isSelected(monthNumber);
          return (
            <button
              key={i}
              type="button"
              onClick={() => handleMonth(monthNumber)}
              style={{
                padding: '12px 8px', borderRadius: 8, fontSize: 13, fontWeight: sel ? 700 : 600,
                border: `2px solid ${sel ? 'var(--primary)' : colors.border}`,
                background: sel ? 'var(--primary)' : colors.bgSecondary,
                color: sel ? 'white' : colors.text,
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}>
              {monthName.slice(0, 3)}
            </button>
          );
        })}
      </div>

      {value && (
        <div style={{ marginTop: 16, padding: 12, background: colors.bgSecondary, borderRadius: 8, textAlign: 'center', fontSize: 13, color: 'var(--primary)', fontWeight: 600 }}>
          ✓ {getMonthLabel(value)}
        </div>
      )}
    </div>
  );
}

export default function Payments() {
  const { business } = useAuth();
  
  // Inicializar con el mes actual en formato YYYY-MM (zona horaria Colombia UTC-5)
  const [month, setMonth] = useState(() => {
    const today = new Date();
    const colombiaDateStr = today.toLocaleString('en-CA', { timeZone: 'America/Bogota', year: 'numeric', month: '2-digit', day: '2-digit' });
    const [yearStr, monthStr] = colombiaDateStr.split('-');
    return `${yearStr}-${monthStr}`;
  });

  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [report, setReport]     = useState(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [sendingEmail, setSendingEmail] = useState({});
  const [emailResult, setEmailResult]   = useState({});

  const loadReport = async () => {
    if (!business?.id) return;
    setLoading(true);
    setError('');
    console.log('🔍 Cargando reporte para mes:', month); // DEBUG
    try {
      const url = `/employees/commission-report?businessId=${business.id}&month=${month}`;
      console.log('🔍 URL de petición:', url); // DEBUG
      const res = await api.get(url);
      // Asegurarnos de que los cálculos del negocio sean los reales (Total - Comisión)
      const data = res.data;
      if (data.appointments) {
        data.appointments = data.appointments.map(appt => {
          const price = parseFloat(appt.price);
          const empEarns = parseFloat(appt.employeeEarns);
          // Forzar el cálculo real en el frontend por si el backend aún no se ha actualizado
          const ownerEarns = price - empEarns;
          return { ...appt, ownerEarns: ownerEarns.toFixed(2) };
        });
        
        // Recalcular totales
        const total = data.appointments.reduce((acc, a) => acc + parseFloat(a.price), 0);
        const employeeTotal = data.appointments.reduce((acc, a) => acc + parseFloat(a.employeeEarns), 0);
        const ownerTotal = total - employeeTotal;
        
        data.totals = {
          total,
          employeeTotal,
          ownerTotal
        };
      }
      setReport(data);
    } catch (e) {
      setError(e.response?.data?.error || 'Error al cargar el reporte');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadReport(); }, [business, month]);

  // Agrupar por empleado
  const byEmployee = report?.appointments?.reduce((acc, appt) => {
    const name = appt.employee;
    if (!acc[name]) acc[name] = { name, appointments: [], total: 0, employeeEarns: 0, ownerEarns: 0 };
    acc[name].appointments.push(appt);
    acc[name].total        += appt.price;
    acc[name].employeeEarns += parseFloat(appt.employeeEarns);
    acc[name].ownerEarns   += parseFloat(appt.ownerEarns);
    return acc;
  }, {}) || {};

  const employees = Object.values(byEmployee);

  const sendPaymentEmail = async (employeeName) => {
    setSendingEmail(p => ({ ...p, [employeeName]: true }));
    try {
      const empData = byEmployee[employeeName];
      
      // Generar PDF individual del empleado - AGREGAR AWAIT
      const pdfBase64 = await generateEmployeePDF(empData, month, business?.name);
      
      console.log('PDF Base64 length:', pdfBase64?.length);
      console.log('PDF Base64 starts with:', pdfBase64?.substring(0, 50));

      await api.post('/notifications/payment-summary', {
        businessId: business.id,
        employeeName,
        month,
        totalEarned: empData.employeeEarns,
        appointmentsCount: empData.appointments.length,
        pdfBase64, // Adjuntar PDF
      });
      setEmailResult(p => ({ ...p, [employeeName]: 'sent' }));
      setTimeout(() => setEmailResult(p => ({ ...p, [employeeName]: null })), 4000);
    } catch (e) {
      setEmailResult(p => ({ ...p, [employeeName]: 'error' }));
      setTimeout(() => setEmailResult(p => ({ ...p, [employeeName]: null })), 4000);
    } finally {
      setSendingEmail(p => ({ ...p, [employeeName]: false }));
    }
  };

  // Generar PDF individual para un empleado (retorna base64)
  const generateEmployeePDF = async (emp, month, businessName) => {
    const doc = new jsPDF();
    const monthLabel = getMonthLabel(month);
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 14;
    
    // Colores profesionales y sobrios
    const colors = {
      primary: [55, 65, 81],      // Gris oscuro
      secondary: [107, 114, 128], // Gris medio
      light: [243, 244, 246],     // Gris claro
      accent: [16, 185, 129],     // Verde éxito
      white: [255, 255, 255],
      black: [31, 41, 55],
    };

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
    doc.text(businessName || 'Mi Negocio', titleX, 25);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(...colors.secondary);
    doc.text('Reporte de Pagos', titleX, 32);
    doc.setFontSize(9);
    doc.text(monthLabel, titleX, 38);

    // Fecha de emisión (alineada derecha)
    doc.setFontSize(9);
    doc.text(`Emitido: ${new Date().toLocaleString('es-CO')}`, pageWidth - 80, 20, { align: 'left' });

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
      head: [['Fecha', 'Servicio', 'Empleado gana']],
      body: emp.appointments.map(a => [
        fmtDate(a.date),
        a.service,
        fmt(a.employeeEarns),
      ]),
      foot: [[
        '', 'TOTAL', fmt(emp.employeeEarns)
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
  };

  // Descargar PDF completo con todos los empleados
  const downloadPDF = async () => {
    const doc = new jsPDF();
    const monthLabel = getMonthLabel(month);
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 14;
    
    // Colores profesionales y sobrios
    const colors = {
      primary: [55, 65, 81],      // Gris oscuro
      secondary: [107, 114, 128], // Gris medio
      light: [243, 244, 246],     // Gris claro
      accent: [16, 185, 129],     // Verde éxito
      white: [255, 255, 255],
      black: [31, 41, 55],
    };

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
    doc.text(`Emitido: ${new Date().toLocaleString('es-CO')}`, pageWidth - 80, 20, { align: 'left' });

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
        head: [['Fecha', 'Servicio', 'Empleado gana']],
        body: emp.appointments.map(a => [
          fmtDate(a.date),
          a.service,
          fmt(a.employeeEarns),
        ]),
        foot: [[
          '', 'TOTAL', fmt(emp.employeeEarns)
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
  };

  const [expandedEmp, setExpandedEmp] = useState(null);
  const [paginationPages, setPaginationPages] = useState({}); // Estado de paginación por empleado
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 640);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 640);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Usar la función segura para obtener el label del mes
  const monthLabel = getMonthLabel(month);

  return (
    <AdminLayout title="Pagos a Empleados" subtitle="Comisiones y saldo del negocio">
      <style>{`
        @media (max-width: 640px) {
          .payments-controls-row {
            align-items: stretch !important;
          }
          .payments-controls-row > * {
            width: 100%;
          }
          .payments-controls-row button {
            width: 100%;
            justify-content: center;
          }
          .payments-employee-header {
            flex-wrap: wrap;
            align-items: flex-start !important;
          }
          .payments-employee-amount {
            width: 100%;
            text-align: left !important;
            margin-right: 0 !important;
          }
          .payments-employee-actions {
            width: 100%;
            justify-content: flex-start;
            flex-wrap: wrap;
          }
        }
      `}</style>
      {/* CONTROLES */}
      <div className="card mb-6">
        <div className="payments-controls-row" style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-700)' }}>Período:</label>
            <button
              onClick={() => setShowMonthPicker(!showMonthPicker)}
              style={{
                background: '#667eea', color: 'white', border: 'none', borderRadius: 6,
                padding: '8px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 6
              }}>
              📅 {monthLabel}
            </button>
          </div>

          <button className="btn-primary" onClick={loadReport} disabled={loading}>
            <RefreshCw size={15} className={loading ? 'spin' : ''} />
            {loading ? 'Cargando...' : 'Actualizar'}
          </button>
          {report && (
            <button className="btn-outline" onClick={downloadPDF}>
              <Download size={15} /> Descargar PDF
            </button>
          )}
        </div>
      </div>

      {showMonthPicker && (
        <div style={{ marginBottom: 20, padding: 16, background: 'white', borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', display: 'flex', justifyContent: 'center' }}>
          <MonthYearPicker
            value={month}
            onChange={setMonth}
            onClose={() => setShowMonthPicker(false)}
          />
        </div>
      )}

      {error && <div className="alert alert-error"><span>⚠️</span> {error}</div>}

      {loading ? (
        <div className="loading-page"><div className="spinner" /><span>Calculando comisiones...</span></div>
      ) : report ? (
        <>
          {/* RESUMEN FINANCIERO */}
          <div className="grid-3 mb-6">
            <div className="stat-card">
              <div className="stat-icon teal"><DollarSign size={22} /></div>
              <div className="stat-body">
                <div className="stat-value" style={{ fontSize: 22 }}>{fmt(report.totals?.total)}</div>
                <div className="stat-label">Ingresos totales del mes</div>
                <div className="stat-change up">
                  <CheckCircle size={11} /> {report.appointments?.length || 0} citas completadas
                </div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon green"><TrendingUp size={22} /></div>
              <div className="stat-body">
                <div className="stat-value" style={{ fontSize: 22 }}>{fmt(report.totals?.ownerTotal)}</div>
                <div className="stat-label">Saldo del negocio (dueño)</div>
                <div className="stat-change up">
                  <TrendingUp size={11} /> Ganancia neta del período
                </div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon blue"><Users size={22} /></div>
              <div className="stat-body">
                <div className="stat-value" style={{ fontSize: 22 }}>{fmt(report.totals?.employeeTotal)}</div>
                <div className="stat-label">Total a pagar empleados</div>
                <div className="stat-change" style={{ color: 'var(--warning)' }}>
                  <Users size={11} /> {employees.length} empleado(s) activos
                </div>
              </div>
            </div>
          </div>

          {/* BARRA DE DISTRIBUCIÓN */}
          {report.totals?.total > 0 && (
            <div className="card mb-6">
              <div className="card-header">
                <div className="card-title">Distribución de ingresos</div>
              </div>
              <div style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13 }}>
                  <span style={{ color: 'var(--success)', fontWeight: 600 }}>
                    Negocio: {((report.totals.ownerTotal / report.totals.total) * 100).toFixed(1)}%
                  </span>
                  <span style={{ color: 'var(--info)', fontWeight: 600 }}>
                    Empleados: {((report.totals.employeeTotal / report.totals.total) * 100).toFixed(1)}%
                  </span>
                </div>
                <div style={{ height: 12, background: 'var(--gray-200)', borderRadius: 999, overflow: 'hidden', display: 'flex' }}>
                  <div style={{
                    width: `${(report.totals.ownerTotal / report.totals.total) * 100}%`,
                    background: 'var(--success)', transition: 'width .6s ease'
                  }} />
                  <div style={{
                    width: `${(report.totals.employeeTotal / report.totals.total) * 100}%`,
                    background: 'var(--info)', transition: 'width .6s ease'
                  }} />
                </div>
              </div>
            </div>
          )}

          {/* POR EMPLEADO */}
          {employees.length === 0 ? (
            <div className="card">
              <div className="empty-state">
                <div className="empty-state-icon">💼</div>
                <h3>Sin datos para este período</h3>
                <p>No hay citas completadas en {monthLabel}.</p>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {employees.map(emp => (
                <div key={emp.name} className="card">
                  {/* Header del empleado */}
                  <div
                    className="payments-employee-header"
                    style={{ display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer' }}
                    onClick={() => setExpandedEmp(expandedEmp === emp.name ? null : emp.name)}
                  >
                    <div className="avatar" style={{ width: 44, height: 44, fontSize: 16 }}>
                      {emp.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 15 }}>{emp.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                        {emp.appointments.length} cita(s) · {fmt(emp.total)} facturado
                      </div>
                    </div>

                    {/* Montos */}
                    <div className="payments-employee-amount" style={{ textAlign: 'right', marginRight: 8 }}>
                      <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--info)' }}>{fmt(emp.employeeEarns)}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>A pagar al empleado</div>
                    </div>

                    {/* Acciones */}
                    <div className="payments-employee-actions" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <button
                        className="btn-outline btn-sm"
                        onClick={e => { e.stopPropagation(); sendPaymentEmail(emp.name); }}
                        disabled={sendingEmail[emp.name]}
                        title="Enviar resumen por email"
                      >
                        <Mail size={14} />
                        {sendingEmail[emp.name] ? 'Enviando...' :
                          emailResult[emp.name] === 'sent' ? '✅ Enviado' :
                          emailResult[emp.name] === 'error' ? '❌ Error' : 'Email'}
                      </button>
                      <ChevronDown
                        size={18}
                        style={{
                          color: 'var(--text-muted)',
                          transform: expandedEmp === emp.name ? 'rotate(180deg)' : 'rotate(0)',
                          transition: 'transform .2s'
                        }}
                      />
                    </div>
                  </div>

                  {/* Detalle expandible con paginación - CORREGIDO */}
                  {expandedEmp === emp.name && (
                    <EmployeeDetail 
                      emp={emp} 
                      paginationPages={paginationPages}
                      setPaginationPages={setPaginationPages}
                      isMobile={isMobile}
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">📊</div>
            <h3>Sin datos</h3>
            <p>Selecciona un período para ver los reportes.</p>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

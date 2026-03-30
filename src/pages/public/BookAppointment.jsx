import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/client';
import ThemeToggle from '../../components/ThemeToggle';
import { useTheme } from '../../context/ThemeContext';

const STEPS = ['Servicio', 'Empleado', 'Fecha', 'Horario', 'Datos'];

const MONTHS_ES = [
  'Enero','Febrero','Marzo','Abril','Mayo','Junio',
  'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre',
];
const DAYS_ES = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];

function todayColombia() {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'America/Bogota' });
}

function buildCalendarDays(year, month) {
  const firstDay    = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);
  return days;
}

function formatDateES(dateStr) {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-').map(Number);
  const names = ['domingo','lunes','martes','miércoles','jueves','viernes','sábado'];
  const date  = new Date(y, m - 1, d);
  return `${names[date.getDay()]}, ${d} de ${MONTHS_ES[m - 1]} de ${y}`;
}

// ─── Calendario ────────────────────────────────────────────────────────────────

function CalendarPicker({ value, onChange, minDate, colors }) {
  const today = minDate || todayColombia();
  const [y, m] = today.split('-').map(Number);
  const [viewYear,  setViewYear]  = useState(value ? parseInt(value.split('-')[0]) : y);
  const [viewMonth, setViewMonth] = useState(value ? parseInt(value.split('-')[1]) - 1 : m - 1);

  const days = useMemo(() => buildCalendarDays(viewYear, viewMonth), [viewYear, viewMonth]);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(v => v - 1); setViewMonth(11); }
    else setViewMonth(v => v - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(v => v + 1); setViewMonth(0); }
    else setViewMonth(v => v + 1);
  };

  const pad = (n) => String(n).padStart(2, '0');
  const toStr = (day) => `${viewYear}-${pad(viewMonth + 1)}-${pad(day)}`;

  const isPast     = (day) => !day || toStr(day) < today;
  const isSelected = (day) => !!day && !!value && toStr(day) === value;
  const isToday    = (day) => !!day && toStr(day) === today;
  const canGoPrev  = () => !(viewYear === y && viewMonth === m - 1);

  const handleDay = (day) => {
    if (!day || isPast(day)) return;
    onChange(toStr(day));
  };

  return (
    <div style={{
      background: colors.cardBg, borderRadius: 16,
      boxShadow: `0 4px 20px ${colors.shadow}`,
      padding: '20px', userSelect: 'none',
      width: '100%', maxWidth: 340,
      border: `1px solid ${colors.border}`,
    }}>
      {/* Cabecera */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <button
          onClick={prevMonth}
          disabled={!canGoPrev()}
          style={{
            background: canGoPrev() ? '#eef2ff' : colors.bgSecondary,
            border: 'none', borderRadius: 8, width: 36, height: 36,
            cursor: canGoPrev() ? 'pointer' : 'not-allowed',
            fontSize: 18, color: canGoPrev() ? '#4f46e5' : colors.textSecondary,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >‹</button>
        <span style={{ fontWeight: 700, fontSize: 15, color: colors.text }}>
          {MONTHS_ES[viewMonth]} {viewYear}
        </span>
        <button
          onClick={nextMonth}
          style={{
            background: '#eef2ff', border: 'none', borderRadius: 8,
            width: 36, height: 36, cursor: 'pointer', fontSize: 18, color: '#4f46e5',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >›</button>
      </div>

      {/* Días de la semana */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, marginBottom: 6 }}>
        {DAYS_ES.map(d => (
          <div key={d} style={{ textAlign: 'center', fontSize: 11, fontWeight: 700, color: colors.textSecondary, padding: '4px 0' }}>
            {d}
          </div>
        ))}
      </div>

      {/* Días del mes */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 3 }}>
        {days.map((day, i) => {
          const past     = isPast(day);
          const selected = isSelected(day);
          const today_   = isToday(day);
          return (
            <div
              key={i}
              onClick={() => handleDay(day)}
              style={{
                textAlign: 'center', padding: '8px 2px', borderRadius: 8, fontSize: 13,
                fontWeight: selected ? 700 : today_ ? 600 : 400,
                cursor: day && !past ? 'pointer' : 'default',
                background: selected ? '#4f46e5' : today_ && !selected ? '#eef2ff' : 'transparent',
                color: !day ? 'transparent' : past ? colors.textSecondary : selected ? 'white' : today_ ? '#4f46e5' : colors.text,
                border: today_ && !selected ? '1.5px solid #4f46e5' : '1.5px solid transparent',
                transition: 'all 0.15s',
              }}
            >
              {day || ''}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Componente Principal ───────────────────────────────────────────────────────

export default function BookAppointment() {
  const { slug }    = useParams();
  const navigate    = useNavigate();
  const { colors }  = useTheme();
  const [business, setBusiness]     = useState(null);
  const [step, setStep]             = useState(0);
  const [loading, setLoading]       = useState(true);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState('');
  const [slots, setSlots]           = useState([]);
  const [confirmed, setConfirmed]   = useState(false);

  const [selected, setSelected] = useState({
    service: null, employee: null, date: '', slot: null,
    clientName: '', clientPhone: '', clientEmail: '', notes: '',
  });

  useEffect(() => {
    api.get(`/businesses/${slug}/public`)
      .then(r => setBusiness(r.data))
      .catch(() => setError('Negocio no encontrado'))
      .finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    if (step === 3 && selected.date && selected.service) {
      setSlotsLoading(true);
      setSlots([]);
      const params = new URLSearchParams({ date: selected.date, serviceId: selected.service.id });
      api.get(`/businesses/${slug}/availability?${params}`)
        .then(r => {
          const filtered = selected.employee
            ? r.data.filter(s => s.employeeId === selected.employee.id)
            : r.data;
          setSlots(filtered);
        })
        .catch(() => setSlots([]))
        .finally(() => setSlotsLoading(false));
    }
  }, [step, selected.date, selected.service, selected.employee]);

  const handleSubmit = async () => {
    setSubmitting(true);
    setError('');
    try {
      await api.post('/appointments', {
        businessId:  business.id,
        serviceId:   selected.service.id,
        employeeId:  selected.slot.employeeId,
        clientName:  selected.clientName,
        clientPhone: selected.clientPhone,
        clientEmail: selected.clientEmail,
        startTime:   selected.slot.startTime,
        notes:       selected.notes,
      });
      setConfirmed(true);
    } catch (e) {
      setError(e.response?.data?.error || 'Error al reservar la cita');
    } finally {
      setSubmitting(false);
    }
  };

  const formatSlotTime = (startTime) =>
    new Date(startTime).toLocaleTimeString('es-CO', {
      hour: '2-digit', minute: '2-digit', hour12: true,
      timeZone: 'America/Bogota',
    });

  const primary   = business?.primaryColor   || '#4f46e5';
  const secondary = business?.secondaryColor || '#7c3aed';
  const gradient  = `linear-gradient(135deg, ${primary} 0%, ${secondary} 100%)`;

  // ── Loading ──
  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: colors.bg }}>
      <div style={{ textAlign: 'center', color: colors.textSecondary }}>
        <div style={{ width: 44, height: 44, border: `4px solid ${colors.border}`, borderTopColor: primary, borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
        <p>Cargando...</p>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    </div>
  );

  if (error && !business) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: colors.bg, padding: 20 }}>
      <div style={{ textAlign: 'center', maxWidth: 400 }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>😕</div>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: colors.text, marginBottom: 8 }}>Negocio no encontrado</h2>
        <p style={{ color: colors.textSecondary }}>{error}</p>
      </div>
    </div>
  );

  // ── Confirmación ──
  if (confirmed) return (
    <div style={{ minHeight: '100vh', background: colors.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{
        background: colors.cardBg, border: `1px solid ${colors.border}`, borderRadius: 20, padding: '40px 32px',
        maxWidth: 480, width: '100%', textAlign: 'center',
        boxShadow: `0 8px 32px ${colors.shadow}`,
      }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: colors.text, marginBottom: 8 }}>¡Cita reservada!</h2>
        <p style={{ color: colors.textSecondary, marginBottom: 24 }}>Tu cita ha sido registrada exitosamente.</p>
        <div style={{
          background: colors.bgSecondary, border: `1px solid ${colors.border}`, borderRadius: 12, padding: '16px 20px',
          marginBottom: 24, textAlign: 'left', fontSize: 14, lineHeight: 1.8, color: colors.text,
        }}>
          <div><strong>Servicio:</strong> {selected.service?.name}</div>
          <div><strong>Empleado:</strong> {selected.slot?.employeeName}</div>
          <div><strong>Fecha:</strong> {formatDateES(selected.date)}</div>
          <div><strong>Hora:</strong> {formatSlotTime(selected.slot?.startTime)} (hora Colombia)</div>
          <div><strong>Nombre:</strong> {selected.clientName}</div>
        </div>
        <button
          onClick={() => navigate(`/${slug}`)}
          style={{
            background: gradient, color: 'white', border: 'none',
            borderRadius: 10, padding: '12px 32px', fontSize: 15,
            fontWeight: 700, cursor: 'pointer', width: '100%',
          }}
        >
          Volver al inicio
        </button>
      </div>
    </div>
  );

  // ── Flujo principal ──
  return (
    <div style={{ minHeight: '100vh', background: colors.bg, color: colors.text, fontFamily: "'Inter', system-ui, sans-serif" }}>
      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        .book-slot:hover{transform:translateY(-2px);box-shadow:0 6px 16px rgba(79,70,229,0.2)!important}
        .book-svc:hover{border-color:${primary}!important;box-shadow:0 4px 12px rgba(79,70,229,0.12)!important}
        .book-emp:hover{border-color:${primary}!important;background:#f5f3ff!important}
        @media(max-width:480px){
          .book-steps span{display:none}
          .book-steps .step-sep{display:none}
          .book-action-row button{width:100%!important;max-width:none!important;flex:1 1 auto!important}
          .book-action-row{flex-direction:column}
        }
      `}</style>

      {/* Toggle de tema (público) */}
      <div style={{ position: 'fixed', top: 14, right: 14, zIndex: 1200 }}>
        <ThemeToggle />
      </div>

      {/* Header */}
      <div style={{ background: gradient, padding: '14px 16px', color: 'white' }}>
        <div style={{ maxWidth: 720, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={() => navigate(`/${slug}`)}
            style={{
              background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white',
              borderRadius: 8, padding: '7px 14px', cursor: 'pointer', fontSize: 13,
              fontWeight: 600, flexShrink: 0,
            }}
          >
            ← Volver
          </button>
          {business?.logoUrl && (
            <img src={business.logoUrl} alt="logo" style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(255,255,255,0.8)', flexShrink: 0 }} />
          )}
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: 16, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {business?.name}
            </div>
            <div style={{ fontSize: 12, opacity: 0.85 }}>Reservar cita</div>
          </div>
        </div>
      </div>

      {/* Indicador de pasos */}
      <div style={{ background: colors.cardBg, borderBottom: `1px solid ${colors.border}`, padding: '12px 16px' }}>
        <div className="book-steps" style={{ maxWidth: 720, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 4, minWidth: 'max-content' }}>
          {STEPS.map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{
                width: 26, height: 26, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 700, flexShrink: 0,
                background: i < step ? primary : i === step ? secondary : colors.bgSecondary,
                color: i <= step ? 'white' : colors.textSecondary,
                transition: 'all 0.2s',
              }}>
                {i < step ? '✓' : i + 1}
              </div>
              <span className="step-label" style={{
                fontSize: 12, color: i <= step ? primary : colors.textSecondary,
                fontWeight: i === step ? 700 : 400,
              }}>{s}</span>
              {i < STEPS.length - 1 && (
                <div className="step-sep" style={{ width: 20, height: 1, background: colors.border, margin: '0 2px' }} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Contenido */}
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '24px 16px 48px' }}>
        {error && (
          <div style={{
            background: '#fee2e2', color: '#991b1b', padding: '12px 16px',
            borderRadius: 10, marginBottom: 16, fontSize: 14, borderLeft: '4px solid #ef4444',
          }}>
            {error}
          </div>
        )}

        {/* ── PASO 0: Servicio ── */}
        {step === 0 && (
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: colors.text, marginBottom: 4 }}>¿Qué servicio necesitas?</h2>
            <p style={{ fontSize: 13, color: colors.textSecondary, marginBottom: 20 }}>Selecciona el servicio que deseas reservar</p>
            {(!business?.Services || business.Services.length === 0) ? (
              <div style={{ background: colors.cardBg, borderRadius: 14, padding: 40, textAlign: 'center', color: colors.textSecondary, boxShadow: `0 2px 8px ${colors.shadow}`, border: `1px solid ${colors.border}` }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
                <p style={{ fontWeight: 600, color: colors.text }}>Sin servicios disponibles</p>
                <p style={{ fontSize: 13, marginTop: 4 }}>Este negocio aún no tiene servicios configurados.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {business.Services.map(svc => (
                  <div
                    key={svc.id}
                    className="book-svc"
                    onClick={() => { setSelected(s => ({ ...s, service: svc })); setStep(1); }}
                    style={{
                      background: colors.cardBg, borderRadius: 14, padding: '16px 20px',
                      border: `2px solid ${selected.service?.id === svc.id ? primary : colors.border}`,
                      cursor: 'pointer', display: 'flex', justifyContent: 'space-between',
                      alignItems: 'center', boxShadow: `0 1px 4px ${colors.shadow}`,
                      transition: 'all 0.15s', gap: 12,
                    }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 16, color: colors.text, marginBottom: 4 }}>{svc.name}</div>
                      {svc.description && <div style={{ fontSize: 13, color: colors.textSecondary, marginBottom: 4 }}>{svc.description}</div>}
                      <div style={{ fontSize: 12, color: colors.textSecondary }}>⏱ {svc.durationMin} min</div>
                    </div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: '#059669', flexShrink: 0 }}>
                      ${Number(svc.price).toLocaleString('es-CO')}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── PASO 1: Empleado ── */}
        {step === 1 && (
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: colors.text, marginBottom: 4 }}>¿Con quién quieres tu cita?</h2>
            <p style={{ fontSize: 13, color: colors.textSecondary, marginBottom: 20 }}>
              Servicio: <strong>{selected.service?.name}</strong>
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12, marginBottom: 20 }}>
              {/* Cualquier disponible */}
              <div
                className="book-emp"
                onClick={() => { setSelected(s => ({ ...s, employee: null })); setStep(2); }}
                style={{
                  background: colors.cardBg, borderRadius: 14, padding: '20px 12px', textAlign: 'center',
                  border: `2px solid ${colors.border}`, cursor: 'pointer',
                  boxShadow: `0 1px 4px ${colors.shadow}`, transition: 'all 0.15s',
                }}
              >
                <div style={{ fontSize: 36, marginBottom: 8 }}>🎲</div>
                <div style={{ fontWeight: 700, fontSize: 13, color: colors.text }}>Cualquier disponible</div>
                <div style={{ fontSize: 11, color: colors.textSecondary, marginTop: 4 }}>Ver todos los horarios</div>
              </div>

              {(business?.Employees || []).map(emp => (
                <div
                  key={emp.id}
                  className="book-emp"
                  onClick={() => { setSelected(s => ({ ...s, employee: emp })); setStep(2); }}
                  style={{
                    background: selected.employee?.id === emp.id ? '#eef2ff' : colors.cardBg,
                    borderRadius: 14, padding: '20px 12px', textAlign: 'center',
                    border: `2px solid ${selected.employee?.id === emp.id ? primary : colors.border}`,
                    cursor: 'pointer', boxShadow: `0 1px 4px ${colors.shadow}`, transition: 'all 0.15s',
                  }}
                >
                  <div style={{
                    width: 56, height: 56, borderRadius: '50%',
                    background: '#eef2ff', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', margin: '0 auto 10px',
                    overflow: 'hidden', border: `2px solid ${colors.border}`,
                  }}>
                    {emp.photoUrl
                      ? <img src={emp.photoUrl} alt={emp.User?.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <span style={{ fontSize: 24 }}>👤</span>
                    }
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 13, color: colors.text }}>{emp.User?.name}</div>
                </div>
              ))}
            </div>
            <button
              onClick={() => setStep(0)}
              style={{ background: colors.bgSecondary, color: colors.text, border: 'none', borderRadius: 8, padding: '8px 16px', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}
            >
              ← Cambiar servicio
            </button>
          </div>
        )}

        {/* ── PASO 2: Fecha ── */}
        {step === 2 && (
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: colors.text, marginBottom: 4 }}>¿Qué día prefieres?</h2>
            <p style={{ fontSize: 13, color: colors.textSecondary, marginBottom: 20 }}>
              {selected.service?.name} · {selected.employee ? `Con ${selected.employee.User?.name}` : 'Cualquier empleado'}
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
              <CalendarPicker
                value={selected.date}
                minDate={todayColombia()}
                onChange={(date) => setSelected(s => ({ ...s, date, slot: null }))}
                colors={colors}
              />
            </div>

            {selected.date && (
              <div style={{
                background: '#eef2ff', border: `1.5px solid ${primary}`,
                borderRadius: 10, padding: '12px 16px', marginBottom: 16,
                fontSize: 14, color: '#3730a3',
              }}>
                <strong>✓ Fecha seleccionada:</strong> {formatDateES(selected.date)}
              </div>
            )}

            <div className="book-action-row" style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button
                onClick={() => setStep(1)}
                style={{ background: colors.bgSecondary, color: colors.text, border: 'none', borderRadius: 8, padding: '10px 18px', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}
              >
                ← Atrás
              </button>
              <button
                disabled={!selected.date}
                onClick={() => setStep(3)}
                style={{
                  background: selected.date ? gradient : colors.bgSecondary,
                  color: selected.date ? 'white' : colors.textSecondary,
                  border: 'none', borderRadius: 8, padding: '10px 20px',
                  cursor: selected.date ? 'pointer' : 'not-allowed',
                  fontSize: 13, fontWeight: 700, flex: 1, maxWidth: 260,
                }}
              >
                Ver horarios disponibles →
              </button>
            </div>
          </div>
        )}

        {/* ── PASO 3: Horario ── */}
        {step === 3 && (
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: colors.text, marginBottom: 4 }}>Elige tu horario</h2>
            <p style={{ fontSize: 13, color: colors.textSecondary, marginBottom: 16 }}>
              {selected.service?.name} · {formatDateES(selected.date)}
            </p>

            {slotsLoading ? (
              <div style={{ background: colors.cardBg, borderRadius: 14, padding: 48, textAlign: 'center', boxShadow: `0 2px 8px ${colors.shadow}`, border: `1px solid ${colors.border}` }}>
                <div style={{ width: 40, height: 40, border: `4px solid ${colors.border}`, borderTopColor: primary, borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
                <p style={{ color: colors.textSecondary, fontSize: 14 }}>Buscando horarios disponibles...</p>
              </div>
            ) : slots.length === 0 ? (
              <div style={{ background: colors.cardBg, borderRadius: 14, padding: 48, textAlign: 'center', color: colors.textSecondary, boxShadow: `0 2px 8px ${colors.shadow}`, border: `1px solid ${colors.border}` }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>😕</div>
                <p style={{ fontWeight: 700, color: colors.text, marginBottom: 6 }}>No hay horarios disponibles</p>
                <p style={{ fontSize: 13 }}>Intenta con otro día o selecciona un empleado diferente.</p>
              </div>
            ) : (
              <>
                <p style={{ fontSize: 12, color: colors.textSecondary, marginBottom: 14 }}>
                  {slots.length} horario{slots.length !== 1 ? 's' : ''} disponible{slots.length !== 1 ? 's' : ''} · Hora Colombia (UTC-5)
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 10, marginBottom: 20 }}>
                  {slots.map((slot, i) => {
                    const isSel = selected.slot === slot;
                    return (
                      <div
                        key={i}
                        className="book-slot"
                        onClick={() => setSelected(s => ({ ...s, slot }))}
                        style={{
                          background: isSel ? primary : colors.cardBg,
                          borderRadius: 12, padding: '14px 12px',
                          border: `2px solid ${isSel ? primary : colors.border}`,
                          cursor: 'pointer',
                          boxShadow: isSel ? `0 4px 16px ${primary}40` : `0 1px 4px ${colors.shadow}`,
                          transition: 'all 0.15s', textAlign: 'center',
                        }}
                      >
                        <div style={{ fontWeight: 800, fontSize: 18, color: isSel ? 'white' : colors.text }}>
                          {formatSlotTime(slot.startTime)}
                        </div>
                        <div style={{ fontSize: 11, color: isSel ? 'rgba(255,255,255,0.8)' : colors.textSecondary, marginTop: 4 }}>
                          {slot.employeeName}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            <div className="book-action-row" style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button
                onClick={() => setStep(2)}
                style={{ background: colors.bgSecondary, color: colors.text, border: 'none', borderRadius: 8, padding: '10px 18px', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}
              >
                ← Cambiar fecha
              </button>
              {selected.slot && (
                <button
                  onClick={() => setStep(4)}
                  style={{
                    background: gradient, color: 'white', border: 'none',
                    borderRadius: 8, padding: '10px 20px', cursor: 'pointer',
                    fontSize: 13, fontWeight: 700, flex: 1, maxWidth: 260,
                  }}
                >
                  Continuar →
                </button>
              )}
            </div>
          </div>
        )}

        {/* ── PASO 4: Datos del cliente ── */}
        {step === 4 && (
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: colors.text, marginBottom: 4 }}>Tus datos</h2>
            <p style={{ fontSize: 13, color: colors.textSecondary, marginBottom: 20 }}>
              Completa tu información para confirmar la cita
            </p>

            {/* Resumen */}
            <div style={{
              background: colors.cardBg, borderRadius: 14, padding: '16px 20px',
              marginBottom: 20, boxShadow: `0 2px 8px ${colors.shadow}`,
              borderLeft: `4px solid ${primary}`,
              border: `1px solid ${colors.border}`,
            }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: colors.text, marginBottom: 8 }}>Resumen de tu cita</div>
              <div style={{ fontSize: 13, color: colors.text, lineHeight: 1.8 }}>
                <div>📋 <strong>{selected.service?.name}</strong></div>
                <div>👤 {selected.slot?.employeeName}</div>
                <div>📅 {formatDateES(selected.date)}</div>
                <div>🕐 {formatSlotTime(selected.slot?.startTime)} (hora Colombia)</div>
                <div style={{ fontWeight: 700, color: '#059669', marginTop: 4 }}>
                  💰 ${Number(selected.service?.price).toLocaleString('es-CO')}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 6, color: colors.text }}>
                  Nombre completo *
                </label>
                <input
                  type="text"
                  placeholder="Tu nombre completo"
                  value={selected.clientName}
                  onChange={e => setSelected(s => ({ ...s, clientName: e.target.value }))}
                  required
                  style={{ width: '100%', padding: '11px 14px', border: `1.5px solid ${colors.border}`, borderRadius: 10, fontSize: 14, outline: 'none', background: colors.cardBg, color: colors.text }}
                />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 6, color: colors.text }}>
                  Teléfono *
                </label>
                <input
                  type="tel"
                  placeholder="Tu número de teléfono"
                  value={selected.clientPhone}
                  onChange={e => setSelected(s => ({ ...s, clientPhone: e.target.value }))}
                  required
                  style={{ width: '100%', padding: '11px 14px', border: `1.5px solid ${colors.border}`, borderRadius: 10, fontSize: 14, outline: 'none', background: colors.cardBg, color: colors.text }}
                />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 6, color: colors.text }}>
                  Email (opcional)
                </label>
                <input
                  type="email"
                  placeholder="tu@email.com"
                  value={selected.clientEmail}
                  onChange={e => setSelected(s => ({ ...s, clientEmail: e.target.value }))}
                  style={{ width: '100%', padding: '11px 14px', border: `1.5px solid ${colors.border}`, borderRadius: 10, fontSize: 14, outline: 'none', background: colors.cardBg, color: colors.text }}
                />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 6, color: colors.text }}>
                  Notas (opcional)
                </label>
                <textarea
                  placeholder="Alguna indicación especial..."
                  value={selected.notes}
                  onChange={e => setSelected(s => ({ ...s, notes: e.target.value }))}
                  rows={3}
                  style={{ width: '100%', padding: '11px 14px', border: `1.5px solid ${colors.border}`, borderRadius: 10, fontSize: 14, outline: 'none', resize: 'vertical', background: colors.cardBg, color: colors.text }}
                />
              </div>
            </div>

            <div className="book-action-row" style={{ display: 'flex', gap: 10, marginTop: 20, flexWrap: 'wrap' }}>
              <button
                onClick={() => setStep(3)}
                style={{ background: colors.bgSecondary, color: colors.text, border: 'none', borderRadius: 8, padding: '11px 18px', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}
              >
                ← Atrás
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting || !selected.clientName || !selected.clientPhone}
                style={{
                  background: (!selected.clientName || !selected.clientPhone) ? colors.bgSecondary : gradient,
                  color: (!selected.clientName || !selected.clientPhone) ? colors.textSecondary : 'white',
                  border: 'none', borderRadius: 8, padding: '11px 24px',
                  cursor: (!selected.clientName || !selected.clientPhone || submitting) ? 'not-allowed' : 'pointer',
                  fontSize: 14, fontWeight: 700, flex: 1, maxWidth: 300,
                }}
              >
                {submitting ? '⏳ Reservando...' : '✅ Confirmar cita'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
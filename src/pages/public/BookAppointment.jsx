import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../api/client';
import ThemeToggle from '../../components/ThemeToggle';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useBooking, formatDateES, formatSlotTime } from '../../features/booking';
import {
  ConfirmationScreen,
  ServiceStep,
  EmployeeStep,
  DateStep,
  TimeSlotStep,
  ClientDataStep,
  DepositStep,
} from '../../features/booking';

// Helper for image URLs
function getImgUrl(url) {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const FALLBACK_BACKEND_URL = isLocal ? 'http://localhost:4000' : 'https://api-reservas.k-dice.com';
  const cleanUrl = url.startsWith('/') ? url : `/${url}`;
  const base = (api.defaults.baseURL && !api.defaults.baseURL.startsWith('/'))
    ? api.defaults.baseURL.replace('/api', '')
    : FALLBACK_BACKEND_URL;
  return `${base}${cleanUrl}`;
}

export default function BookAppointment() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedEmployeeId = searchParams.get('employeeId');
  const preselectedServiceId = searchParams.get('serviceId');
  const { colors } = useTheme();
  const { user } = useAuth();

  const {
    business,
    step,
    setStep,
    loading,
    slotsLoading,
    submitting,
    setSubmitting,
    error,
    setError,
    slots,
    selected,
    setSelected,
    confirmed,
    setConfirmed,
    hasPreviousData,
    loadingClientData,
    servicesPage,
    setServicesPage,
    employeesPage,
    setEmployeesPage,
    depositAmount,
    isDepositRequired,
    effectiveSteps,
    primary,
    secondary,
    gradient,
    depositConfig,
  } = useBooking(slug, preselectedEmployeeId, preselectedServiceId);

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    setError('');
    try {
      // Validar dirección para negocios con técnicos a domicilio
      if (business?.hasFieldTechnicians && !selected.address) {
        setError('La dirección es requerida para servicios a domicilio');
        setSubmitting(false);
        return;
      }

      // Construir fecha ISO con zona horaria Colombia explícita
      const startTimeIso = selected.slot.localTime
        ? `${selected.date}T${selected.slot.localTime}:00-05:00`
        : null;

      await api.post('/appointments', {
        businessId: business.id,
        serviceId: selected.service.id,
        employeeId: selected.slot.employeeId,
        clientName: selected.clientName,
        clientPhone: selected.clientPhone,
        clientEmail: selected.clientEmail,
        address: selected.address,
        startTime: startTimeIso,
        notes: selected.notes,
        depositAmount: isDepositRequired ? depositAmount : null,
        depositAccepted: isDepositRequired ? selected.depositAccepted : false,
      });
      setConfirmed(true);
    } catch (e) {
      setError(e.response?.data?.error || 'Error al reservar la cita');
    } finally {
      setSubmitting(false);
    }
  };

  const handleBack = () => {
    if (step > 0) {
      if (preselectedEmployeeId && step === 2) {
        setStep(0);
      } else {
        setStep(step - 1);
      }
    } else {
      // Si el usuario está autenticado como cliente (APK), volver a sus citas
      if (user?.role === 'client' || localStorage.getItem('clientEmail')) {
        navigate('/my-appointments', { replace: true });
      } else {
        navigate(`/${slug}`, { replace: true });
      }
    }
  };

  const handleConfirmBack = () => {
    if (user?.role === 'client' || localStorage.getItem('clientEmail')) {
      navigate('/my-appointments', { replace: true });
    } else {
      navigate(`/${slug}`, { replace: true });
    }
  };

  // Loading state
  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: colors.bg }}>
        <div style={{ textAlign: 'center', color: colors.textSecondary }}>
          <div style={{ width: 44, height: 44, border: `4px solid ${colors.border}`, borderTopColor: primary, borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
          <p>Cargando...</p>
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !business) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: colors.bg, padding: 20 }}>
        <div style={{ textAlign: 'center', maxWidth: 400 }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>😕</div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: colors.text, marginBottom: 8 }}>Negocio no encontrado</h2>
          <p style={{ color: colors.textSecondary }}>{error}</p>
        </div>
      </div>
    );
  }

  // Confirmation screen
  if (confirmed) {
    return (
      <ConfirmationScreen
        selected={selected}
        colors={colors}
        gradient={gradient}
        onBack={handleConfirmBack}
      />
    );
  }

  // Main booking flow
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
            onClick={handleBack}
            style={{
              background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white',
              borderRadius: 8, padding: '7px 14px', cursor: 'pointer', fontSize: 13,
              fontWeight: 600, flexShrink: 0,
            }}
          >
            ← Volver
          </button>
          {business?.logoUrl && (
            <img src={getImgUrl(business.logoUrl)} alt="logo" style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(255,255,255,0.8)', flexShrink: 0 }} />
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
          {effectiveSteps.map((s, i) => {
            if (preselectedEmployeeId && s === 'Empleado') return null;
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <div style={{
                  width: 24, height: 24, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 700,
                  background: i <= step ? primary : colors.bgSecondary,
                  color: i <= step ? 'white' : colors.textSecondary,
                  transition: '0.2s'
                }}>{i + 1}</div>
                <span style={{
                  fontSize: 12, color: i <= step ? primary : colors.textSecondary,
                  fontWeight: i === step ? 700 : 400,
                }}>{s}</span>
                {i < effectiveSteps.length - 1 && (
                  <div className="step-sep" style={{ width: 20, height: 1, background: colors.border, margin: '0 2px' }} />
                )}
              </div>
            );
          })}
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

        {step === 0 && (
          <ServiceStep
            business={business}
            selected={selected}
            setSelected={setSelected}
            setStep={setStep}
            servicesPage={servicesPage}
            setServicesPage={setServicesPage}
            colors={colors}
            primary={primary}
            preselectedEmployeeId={preselectedEmployeeId}
          />
        )}

        {step === 1 && !preselectedEmployeeId && (
          <EmployeeStep
            business={business}
            selected={selected}
            setSelected={setSelected}
            setStep={setStep}
            employeesPage={employeesPage}
            setEmployeesPage={setEmployeesPage}
            colors={colors}
            primary={primary}
            api={api}
          />
        )}

        {step === 2 && (
          <DateStep
            selected={selected}
            setSelected={setSelected}
            setStep={setStep}
            handleBack={handleBack}
            colors={colors}
            gradient={gradient}
            primary={primary}
          />
        )}

        {step === 3 && (
          <TimeSlotStep
            selected={selected}
            setSelected={setSelected}
            setStep={setStep}
            slots={slots}
            slotsLoading={slotsLoading}
            hasPreviousData={hasPreviousData}
            loadingClientData={loadingClientData}
            submitting={submitting}
            handleSubmit={handleSubmit}
            colors={colors}
            gradient={gradient}
            primary={primary}
          />
        )}

        {step === 4 && (
          <ClientDataStep
            business={business}
            selected={selected}
            setSelected={setSelected}
            setStep={setStep}
            isDepositRequired={isDepositRequired}
            depositAmount={depositAmount}
            submitting={submitting}
            handleSubmit={handleSubmit}
            colors={{ ...colors, primary }}
            gradient={gradient}
          />
        )}

        {step === 5 && isDepositRequired && (
          <DepositStep
            selected={selected}
            setSelected={setSelected}
            setStep={setStep}
            depositAmount={depositAmount}
            depositConfig={depositConfig}
            submitting={submitting}
            handleSubmit={handleSubmit}
            colors={colors}
            gradient={gradient}
          />
        )}
      </div>
    </div>
  );
}

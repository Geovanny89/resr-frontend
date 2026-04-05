import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import api from '../../api/client';
import AdminLayout from '../../components/AdminLayout';
import { DollarSign, Upload, Smartphone, CreditCard, CheckCircle, AlertCircle, Copy, Check } from 'lucide-react';

// DATOS DE PAGO DEL ADMIN - Aquí configuras tus datos
const ADMIN_PAYMENT_INFO = {
  nequi: {
    number: '3507918591',
    label: 'Nequi',
    color: '#7B1FA2',
    icon: Smartphone
  },
  llave: {
    number: '@DLGCR08701',
    label: 'Llave Bancaria',
    color: '#1976D2',
    icon: CreditCard
  }
};

const MONTHLY_PRICE = 60000;

export default function SubmitPayment() {
  const { business } = useAuth();
  const { colors } = useTheme();
  const [paymentMethod, setPaymentMethod] = useState('nequi');
  const [paymentReference, setPaymentReference] = useState('');
  const [screenshot, setScreenshot] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const currentMethod = ADMIN_PAYMENT_INFO[paymentMethod];
  const Icon = currentMethod.icon;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentMethod.number);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('El archivo no debe superar 5MB');
        return;
      }
      setScreenshot(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!screenshot) {
      setError('Por favor sube el comprobante de pago');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const data = new FormData();
      data.append('paymentAmount', MONTHLY_PRICE);
      data.append('paymentMethod', paymentMethod);
      data.append('paymentReference', paymentReference);
      // Enviamos los datos del método seleccionado para que el admin sepa por dónde llegó
      if (paymentMethod === 'nequi') {
        data.append('adminNequiNumber', ADMIN_PAYMENT_INFO.nequi.number);
      } else {
        data.append('adminLlaveBancaria', ADMIN_PAYMENT_INFO.llave.number);
      }
      data.append('screenshot', screenshot);

      await api.post('/businesses/my/submit-payment', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al enviar el pago');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <AdminLayout title="Pago Enviado" subtitle="Tu pago está pendiente de verificación">
        <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
          <div style={{ 
            width: 80, 
            height: 80, 
            borderRadius: '50%', 
            background: colors.successBg, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            margin: '0 auto 24px'
          }}>
            <CheckCircle size={40} color={colors.success} />
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16, color: colors.text }}>¡Pago enviado!</h2>
          <p style={{ color: colors.textSecondary, maxWidth: 400, margin: '0 auto 24px', lineHeight: 1.6 }}>
            Tu comprobante de pago ha sido recibido y está siendo verificado. 
            Recibirás una notificación cuando el pago sea confirmado.
          </p>
          <button 
            onClick={() => window.location.href = '/admin'}
            className="btn-primary"
          >
            Volver al Dashboard
          </button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Pagar Suscripción" subtitle="Paga tu suscripción mensual de $60,000">
      <div className="card">
        {error && (
          <div className="alert alert-error" style={{ marginBottom: 24 }}>
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        {/* PASO 1: Seleccionar método y ver datos */}
        <div style={{ marginBottom: 32 }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>
            Paso 1: Realiza el pago
          </h3>
          
          {/* Selector de método - responsive */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', 
            gap: 12, 
            marginBottom: 24 
          }}>
            {Object.entries(ADMIN_PAYMENT_INFO).map(([key, method]) => {
              const MethodIcon = method.icon;
              const isSelected = paymentMethod === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setPaymentMethod(key)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 8,
                    padding: '16px 12px',
                    borderRadius: 12,
                    border: `2px solid ${isSelected ? method.color : colors.border}`,
                    background: isSelected ? `${method.color}10` : colors.cardBg,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    minWidth: 0
                  }}
                >
                  <MethodIcon size={24} color={method.color} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: isSelected ? method.color : colors.textSecondary, textAlign: 'center' }}>
                    {method.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Datos de pago destacados - responsive */}
          <div 
            style={{
              background: `linear-gradient(135deg, ${currentMethod.color}15, ${currentMethod.color}05)`,
              border: `2px solid ${currentMethod.color}`,
              borderRadius: 16,
              padding: '24px 16px',
              textAlign: 'center'
            }}
          >
            <p style={{ fontSize: 14, color: colors.textSecondary, marginBottom: 12 }}>
              Transfiere <strong style={{ color: colors.text }}>${MONTHLY_PRICE.toLocaleString('es-CO')} COP</strong> a:
            </p>
            
            <div 
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 12,
                background: colors.cardBg,
                borderRadius: 12,
                padding: '16px',
                marginBottom: 16,
                boxShadow: `0 2px 8px ${colors.shadow}`,
                border: `1px solid ${colors.border}`
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Icon size={24} color={currentMethod.color} />
                <span 
                  style={{ 
                    fontSize: 'clamp(20px, 6vw, 28px)', 
                    fontWeight: 800, 
                    color: currentMethod.color,
                    fontFamily: 'monospace',
                    letterSpacing: 1,
                    wordBreak: 'break-all'
                  }}
                >
                  {currentMethod.number}
                </span>
              </div>
              <button
                type="button"
                onClick={handleCopy}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '8px 16px',
                  borderRadius: 8,
                  border: 'none',
                  background: copied ? colors.successBg : colors.bgSecondary,
                  color: copied ? colors.success : colors.text,
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: 600,
                  width: '100%',
                  justifyContent: 'center'
                }}
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? 'Copiado' : 'Copiar número'}
              </button>
            </div>

            <p style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 1.5 }}>
              {paymentMethod === 'nequi' 
                ? 'Abre tu app de Nequi → Envía dinero → Pega el número arriba'
                : 'Abre tu app bancaria → Envía por Llave Bancaria → Pega el código arriba'
              }
            </p>
          </div>
        </div>

        {/* PASO 2: Subir comprobante */}
        <form onSubmit={handleSubmit}>
          <div style={{ borderTop: `2px dashed ${colors.border}`, paddingTop: 32, marginBottom: 32 }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, color: colors.text }}>
              Paso 2: Sube el comprobante
            </h3>

            {/* Referencia (opcional) */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 8, color: colors.text }}>
                Número de referencia del pago (opcional)
              </label>
              <input
                type="text"
                value={paymentReference}
                onChange={(e) => setPaymentReference(e.target.value)}
                placeholder="Ej: 123456789"
                className="input"
                style={{ background: colors.inputBg, color: colors.text, borderColor: colors.border }}
              />
            </div>

            {/* Upload */}
            <div
              style={{
                border: previewUrl ? `2px solid ${currentMethod.color}` : `2px dashed ${colors.border}`,
                borderRadius: 16,
                padding: previewUrl ? 16 : 40,
                textAlign: 'center',
                background: previewUrl ? colors.bgSecondary : colors.cardBg,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onClick={() => document.getElementById('screenshot-input').click()}
            >
              {previewUrl ? (
                <div>
                  <img
                    src={previewUrl}
                    alt="Comprobante"
                    style={{ maxWidth: '100%', maxHeight: 300, borderRadius: 8, marginBottom: 12 }}
                  />
                  <p style={{ fontSize: 13, color: colors.textSecondary }}>Haz clic para cambiar el comprobante</p>
                </div>
              ) : (
                <>
                  <div 
                    style={{
                      width: 64,
                      height: 64,
                      borderRadius: '50%',
                      background: `${currentMethod.color}15`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 16px'
                    }}
                  >
                    <Upload size={28} color={currentMethod.color} />
                  </div>
                  <p style={{ fontSize: 16, fontWeight: 600, color: colors.text, marginBottom: 8 }}>
                    Sube el screenshot del comprobante
                  </p>
                  <p style={{ fontSize: 13, color: colors.textSecondary }}>
                    JPG, PNG o PDF hasta 5MB
                  </p>
                </>
              )}
              <input
                id="screenshot-input"
                type="file"
                accept="image/*,.pdf"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="btn-primary"
            disabled={loading || !screenshot}
            style={{ 
              width: '100%', 
              padding: '16px 24px',
              fontSize: 16,
              opacity: !screenshot ? 0.5 : 1
            }}
          >
            {loading ? 'Enviando...' : 'Enviar comprobante de pago'}
          </button>

          {!screenshot && (
            <p style={{ fontSize: 12, color: colors.textMuted, textAlign: 'center', marginTop: 12 }}>
              Debes subir el comprobante para continuar
            </p>
          )}
        </form>
      </div>
    </AdminLayout>
  );
}

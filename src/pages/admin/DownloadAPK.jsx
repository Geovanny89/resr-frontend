import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Importamos useNavigate
import { useAuth } from '../../context/AuthContext';
import api from '../../api/client';
import { ArrowLeft } from 'lucide-react'; // Usamos Lucide para un icono limpio

export default function DownloadAPK() {
  const { user, business } = useAuth();
  const navigate = useNavigate(); // Inicializamos el hook
  const [loading, setLoading] = useState(false);
  const [apkStatus, setApkStatus] = useState(null);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (business?.id) {
      loadAPKStatus();
    }
  }, [business]);

  const loadAPKStatus = async () => {
    try {
      // Verificar si la APK global existe en la carpeta pública
      const response = await fetch('/apk/kdice-reservas.apk', { method: 'HEAD' });
      
      if (response.ok) {
        const contentLength = response.headers.get('content-length');
        const sizeInMB = contentLength ? (contentLength / 1024 / 1024).toFixed(1) : null;
        
        setApkStatus({
          apkReady: true,
          apkSize: sizeInMB ? `${sizeInMB} MB` : 'Desconocido',
          lastGenerated: new Date().toISOString(),
          universal: true
        });
      } else {
        setApkStatus({
          apkReady: false,
          apkSize: null,
          lastGenerated: null,
          universal: true
        });
      }
    } catch (e) {
      console.error('Error checking APK status:', e);
      setApkStatus({
        apkReady: false,
        apkSize: null,
        lastGenerated: null,
        universal: true
      });
    }
  };

  if (!business) {
    return (
      <div style={{ padding: 32, textAlign: 'center', color: '#e53e3e' }}>
        <p>No tienes un negocio registrado</p>
      </div>
    );
  }

  const handleDownloadAPK = async () => {
    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      // Descargar APK global directamente desde la carpeta pública
      const downloadUrl = '/apk/kdice-reservas.apk';
      
      // Verificar si el archivo existe
      const response = await fetch(downloadUrl, { method: 'HEAD' });
      if (!response.ok) {
        setError('La APK no está disponible. Contacta al administrador para que suba la APK generada desde Android Studio.');
        setLoading(false);
        return;
      }

      setSuccessMsg('¡APK lista! Iniciando descarga...');

      // Crear link de descarga
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = 'kdice-reservas.apk';
      link.setAttribute('target', '_blank');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    } catch (e) {
      setError('Error al descargar la APK. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const cardStyle = {
    background: 'white',
    borderRadius: 16,
    padding: 32,
    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
    marginBottom: 24,
  };

  return (
    <div className="download-apk-root" style={{ padding: 32, maxWidth: 800, width: '100%' }}>
      <style>{`
        @media (max-width: 768px) {
          .download-apk-root { padding: 16px !important; }
          .download-apk-card { padding: 18px !important; }
          .download-apk-feature-grid { grid-template-columns: 1fr !important; }
          .download-apk-actions { grid-template-columns: 1fr !important; }
          .back-button { margin-bottom: 12px !important; }
        }
      `}</style>

      {/* Botón Volver */}
      <button 
        onClick={() => navigate(-1)} 
        className="back-button"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'none',
          border: 'none',
          color: '#667eea',
          cursor: 'pointer',
          fontWeight: 600,
          marginBottom: 20,
          padding: '8px 0',
          fontSize: '15px'
        }}
      >
        <ArrowLeft size={20} />
        Volver
      </button>

      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8, color: '#1a202c' }}>
        📱 Descargar App Móvil KDice
      </h1>
      <p style={{ color: '#718096', marginBottom: 32 }}>
        Descarga la aplicación móvil real para gestionar tu negocio desde Android
      </p>

      {/* Info del negocio */}
      <div className="download-apk-card" style={cardStyle}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1a202c', marginBottom: 16 }}>
          Tu Negocio
        </h2>
        <div style={{ background: '#f7fafc', borderRadius: 8, padding: 16, border: '1px solid #e2e8f0', marginBottom: 20 }}>
          <p style={{ margin: '6px 0', color: '#4a5568' }}>
            <strong>Nombre:</strong> {business.name}
          </p>
          <p style={{ margin: '6px 0', color: '#4a5568' }}>
            <strong>Slug:</strong>{' '}
            <code style={{ background: '#edf2f7', padding: '2px 8px', borderRadius: 4 }}>{business.slug}</code>
          </p>
        </div>

        {/* Estado de la APK */}
        {apkStatus && (
          <div style={{
            background: apkStatus.apkReady ? '#f0fff4' : '#fff5f5',
            border: `1px solid ${apkStatus.apkReady ? '#9ae6b4' : '#feb2b2'}`,
            borderRadius: 8, padding: 16, marginBottom: 20,
          }}>
            <p style={{ margin: 0, color: apkStatus.apkReady ? '#22543d' : '#c53030', fontWeight: 600 }}>
              {apkStatus.apkReady ? '✅ APK disponible' : '⚠️ APK no disponible'}
              {apkStatus.apkSize && ` — ${apkStatus.apkSize}`}
            </p>
            {apkStatus.lastGenerated && (
              <p style={{ margin: '4px 0 0', color: '#718096', fontSize: 13 }}>
                Última actualización: {new Date(apkStatus.lastGenerated).toLocaleDateString('es')}
              </p>
            )}
          </div>
        )}

        {/* Aviso informativo */}
        <div style={{
          background: '#eef2ff', borderRadius: 8, padding: 16,
          border: '1px solid #c7d2fe', marginBottom: 24,
        }}>
          <p style={{ margin: 0, color: '#4c51bf', fontSize: 14 }}>
            ℹ️ Esta es una APK universal <strong>KDice Reservas</strong>. Al instalarla e iniciar sesión con tu cuenta de <strong>{business.name}</strong>,
            verás automáticamente los datos de tu negocio.
          </p>
        </div>

        {/* Mensajes */}
        {error && (
          <div style={{ background: '#fed7d7', color: '#c53030', padding: 16, borderRadius: 8, marginBottom: 20, fontSize: 14 }}>
            ❌ {error}
          </div>
        )}
        {successMsg && (
          <div style={{ background: '#c6f6d5', color: '#22543d', padding: 16, borderRadius: 8, marginBottom: 20, fontSize: 14 }}>
            ✅ {successMsg}
          </div>
        )}

        {/* Botón de descarga */}
        <div className="download-apk-actions" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16 }}>
          <button
            onClick={handleDownloadAPK}
            disabled={loading}
            style={{
              background: loading ? '#a0aec0' : '#667eea',
              color: 'white', border: 'none', borderRadius: 12,
              padding: '18px 24px', fontWeight: 700, fontSize: 16,
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s', textAlign: 'center',
              boxShadow: loading ? 'none' : '0 4px 12px rgba(102,126,234,0.4)',
            }}
          >
            {loading ? '⏳ Preparando descarga...' : '📥 Descargar APK para Android'}
          </button>

          <div style={{
            background: '#f7f8fc', border: '2px dashed #e2e8f0',
            borderRadius: 12, padding: '18px 24px', textAlign: 'center',
            color: '#a0aec0', fontSize: 14,
          }}>
            🍎 iOS — Contacta a soporte
          </div>
        </div>
      </div>

      {/* Instrucciones */}
      <div className="download-apk-card" style={{ ...cardStyle, background: '#f7fafc', boxShadow: 'none', border: '1px solid #e2e8f0' }}>
        <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1a202c', marginBottom: 20 }}>
          📖 Cómo instalar la APK en Android
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
          {[
            { num: '1', title: 'Descarga', desc: 'Toca el botón "Descargar APK" y espera que termine' },
            { num: '2', title: 'Ajustes', desc: 'Habilita "Fuentes desconocidas" en los ajustes de tu teléfono' },
            { num: '3', title: 'Instala', desc: 'Abre el archivo APK desde tu carpeta de Descargas' },
            { num: '4', title: 'Inicia sesión', desc: 'Usa tu cuenta de admin o cliente' },
          ].map((step) => (
            <div key={step.num} style={{
              background: 'white', borderRadius: 12, padding: 20,
              border: '1px solid #e2e8f0', textAlign: 'center',
            }}>
              <div style={{
                width: 40, height: 40, borderRadius: '50%', background: '#667eea',
                color: 'white', fontWeight: 800, fontSize: 18,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 12px',
              }}>
                {step.num}
              </div>
              <p style={{ fontWeight: 700, color: '#2d3748', margin: '0 0 8px' }}>{step.title}</p>
              <p style={{ color: '#718096', fontSize: 13, margin: 0, lineHeight: 1.6 }}>{step.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Funcionalidades */}
      <div className="download-apk-card" style={{ ...cardStyle, background: '#fef5e7', boxShadow: 'none', border: '1px solid #f9e79f', marginTop: 0 }}>
        <h3 style={{ fontSize: 18, fontWeight: 700, color: '#7d6608', marginBottom: 16 }}>
          ✨ Funcionalidades de la App
        </h3>
        <div className="download-apk-feature-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <p style={{ fontWeight: 700, color: '#5d4e37', marginBottom: 8 }}>👑 Admin</p>
            <ul style={{ color: '#5d4e37', lineHeight: 1.8, paddingLeft: 20, margin: 0 }}>
              <li>Ver citas del día</li>
              <li>Cambiar estados</li>
              <li>Gestionar servicios</li>
            </ul>
          </div>
          <div>
            <p style={{ fontWeight: 700, color: '#5d4e37', marginBottom: 8 }}>👤 Cliente</p>
            <ul style={{ color: '#5d4e37', lineHeight: 1.8, paddingLeft: 20, margin: 0 }}>
              <li>Ver citas agendadas</li>
              <li>Historial completo</li>
              <li>Info de empleados</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
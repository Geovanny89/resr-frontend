import { useState, useEffect } from 'react';
import api from '../api/client';
import { Download, Smartphone, CheckCircle, AlertCircle, Clock } from 'lucide-react';

export default function DownloadAPKPublic() {
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [apkInfo, setApkInfo] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    checkAPKAvailability();
  }, []);

  const checkAPKAvailability = async () => {
    try {
      const res = await api.get('/apk/check-update/kdice');
      setApkInfo(res.data);
    } catch (e) {
      console.error('Error checking APK:', e);
    }
  };

  const handleDownload = async () => {
    setDownloading(true);
    setError('');

    try {
      // Descargar desde URL directa
      const downloadUrl = '/downloads/kdice-app.apk';
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = 'kdice-app.apk';
      link.setAttribute('target', '_blank');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setTimeout(() => setDownloading(false), 2000);
    } catch (e) {
      setError('Error al descargar la APK. Intenta de nuevo.');
      setDownloading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '20px',
        padding: '40px',
        maxWidth: '500px',
        width: '100%',
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
        textAlign: 'center'
      }}>
        {/* Logo y título */}
        <div style={{ marginBottom: '30px' }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '20px',
            background: 'linear-gradient(135deg, #FF5E00 0%, #E0007F 50%, #4B0082 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
            fontSize: '40px',
            overflow: 'hidden'
          }}>
            <img src="/kdice-logo.svg" alt="KDice" style={{ width: '70px', height: '84px', objectFit: 'contain' }} />
          </div>
          <h1 style={{
            fontSize: '28px',
            fontWeight: '800',
            color: '#1a202c',
            marginBottom: '8px',
            margin: 0
          }}>
            KDice POS
          </h1>
          <p style={{
            color: '#718096',
            fontSize: '16px',
            margin: '8px 0 0'
          }}>
            App Móvil para Gestión de Negocios
          </p>
        </div>

        {/* Estado de la APK */}
        {apkInfo && (
          <div style={{
            background: apkInfo.apkExists ? '#f0fff4' : '#fff5f5',
            border: `2px solid ${apkInfo.apkExists ? '#9ae6b4' : '#feb2b2'}`,
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '24px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              {apkInfo.apkExists ? (
                <CheckCircle size={20} color="#22543d" />
              ) : (
                <AlertCircle size={20} color="#c53030" />
              )}
              <span style={{
                fontWeight: '600',
                color: apkInfo.apkExists ? '#22543d' : '#c53030'
              }}>
                {apkInfo.apkExists ? 'APK Disponible' : 'APK No Disponible'}
              </span>
            </div>
            {apkInfo.currentVersion && (
              <p style={{
                margin: '8px 0 0',
                fontSize: '14px',
                color: '#718096'
              }}>
                Versión: {apkInfo.currentVersion.fileName} • 
                Tamaño: {apkInfo.currentVersion.size ? `${(apkInfo.currentVersion.size / 1024 / 1024).toFixed(1)} MB` : 'N/A'}
              </p>
            )}
          </div>
        )}

        {/* Mensaje de error */}
        {error && (
          <div style={{
            background: '#fed7d7',
            color: '#c53030',
            padding: '16px',
            borderRadius: '12px',
            marginBottom: '24px',
            fontSize: '14px'
          }}>
            ❌ {error}
          </div>
        )}

        {/* Botón de descarga */}
        <button
          onClick={handleDownload}
          disabled={downloading || !apkInfo?.apkExists}
          style={{
            width: '100%',
            background: downloading || !apkInfo?.apkExists ? '#a0aec0' : '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            padding: '18px 24px',
            fontSize: '18px',
            fontWeight: '700',
            cursor: downloading || !apkInfo?.apkExists ? 'not-allowed' : 'pointer',
            transition: 'all 0.3s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            marginBottom: '30px'
          }}
        >
          {downloading ? (
            <>
              <div style={{
                width: '20px',
                height: '20px',
                border: '2px solid #ffffff',
                borderTop: '2px solid transparent',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }} />
              Descargando...
            </>
          ) : (
            <>
              <Download size={20} />
              Descargar APK para Android
            </>
          )}
        </button>

        {/* Información importante */}
        <div style={{
          background: '#f7fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '20px',
          textAlign: 'left',
          marginBottom: '24px'
        }}>
          <h3 style={{
            fontSize: '16px',
            fontWeight: '700',
            color: '#1a202c',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Smartphone size={18} />
            Información Importante
          </h3>
          <div style={{ fontSize: '14px', color: '#4a5568', lineHeight: '1.6' }}>
            <p style={{ margin: '0 0 12px' }}>
              <strong>🏢 Para dueños y empleados:</strong> Inicia sesión con tu cuenta para acceder a tu negocio.
            </p>
            <p style={{ margin: '0 0 12px' }}>
              <strong>👥 Para clientes:</strong> Regístrate o inicia sesión para agendar citas.
            </p>
            <p style={{ margin: '0' }}>
              <strong>🌐 URLs configuradas:</strong><br />
              • API: <code style={{ background: '#edf2f7', padding: '2px 6px', borderRadius: '4px' }}>https://reservas.k-dice.com/api</code><br />
              • Web: <code style={{ background: '#edf2f7', padding: '2px 6px', borderRadius: '4px' }}>https://reservas.k-dice.com</code>
            </p>
          </div>
        </div>

        {/* Instrucciones */}
        <div style={{
          background: '#edf2f7',
          borderRadius: '12px',
          padding: '20px',
          textAlign: 'left'
        }}>
          <h3 style={{
            fontSize: '16px',
            fontWeight: '700',
            color: '#1a202c',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Clock size={18} />
            Pasos de Instalación
          </h3>
          <div style={{ fontSize: '14px', color: '#4a5568', lineHeight: '1.6' }}>
            <p style={{ margin: '0 0 8px' }}>
              <strong>1.</strong> Descarga el archivo APK
            </p>
            <p style={{ margin: '0 0 8px' }}>
              <strong>2.</strong> Habilita "Fuentes desconocidas" en Ajustes &gt; Seguridad
            </p>
            <p style={{ margin: '0 0 8px' }}>
              <strong>3.</strong> Abre el archivo APK descargado
            </p>
            <p style={{ margin: '0' }}>
              <strong>4.</strong> Toca "Instalar" y espera la finalización
            </p>
          </div>
        </div>

        {/* Enlace a web */}
        <div style={{ marginTop: '24px' }}>
          <p style={{ fontSize: '14px', color: '#718096', margin: '0' }}>
            ¿Prefieres usar la versión web?{' '}
            <a 
              href="https://reservas.k-dice.com" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{
                color: '#667eea',
                fontWeight: '600',
                textDecoration: 'none'
              }}
            >
              Ir a la web →
            </a>
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ArrowLeft, Download, FileCode, CheckCircle, AlertCircle } from 'lucide-react';

export default function DownloadAPK() {
  const { business } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [apkStatus, setApkStatus] = useState(null);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    loadAPKStatus();
  }, []);

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
          lastGenerated: new Date().toLocaleString(),
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

  const handleDownloadAPK = async () => {
    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      // Descargar APK global directamente desde la carpeta pública
      const downloadUrl = '/apk/kdice-reservas.apk';
      
      // Verificar si el archivo existe antes de intentar descargar
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
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
    maxWidth: 500,
    margin: '40px auto',
    textAlign: 'center'
  };

  const buttonStyle = {
    background: 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)',
    color: 'white',
    border: 'none',
    padding: '14px 28px',
    borderRadius: 12,
    fontSize: 16,
    fontWeight: 600,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    width: '100%',
    transition: 'all 0.2s ease',
    boxShadow: '0 4px 6px -1px rgba(79, 70, 229, 0.4)'
  };

  return (
    <div style={{ padding: 20, minHeight: '100vh', background: '#f8fafc' }}>
      <button 
        onClick={() => navigate(-1)} 
        style={{ 
          background: 'none', 
          border: 'none', 
          display: 'flex', 
          alignItems: 'center', 
          gap: 8, 
          color: '#64748b', 
          cursor: 'pointer',
          fontSize: 15,
          fontWeight: 500,
          marginBottom: 20
        }}
      >
        <ArrowLeft size={18} /> Volver
      </button>

      <div style={cardStyle}>
        <div style={{ 
          width: 64, 
          height: 64, 
          background: '#eef2ff', 
          borderRadius: 20, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          margin: '0 auto 24px',
          color: '#4f46e5'
        }}>
          <FileCode size={32} />
        </div>

        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#1e293b', marginBottom: 12 }}>
          Descargar APK
        </h1>
        <p style={{ color: '#64748b', marginBottom: 32, lineHeight: 1.6 }}>
          Descarga la última versión de la aplicación para Android e instálala en tu dispositivo móvil.
        </p>

        {apkStatus?.apkReady ? (
          <div style={{ 
            background: '#f0fdf4', 
            border: '1px solid #bbf7d0', 
            borderRadius: 12, 
            padding: 16, 
            marginBottom: 24,
            textAlign: 'left'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#166534', fontWeight: 600, marginBottom: 8 }}>
              <CheckCircle size={18} /> Versión disponible
            </div>
            <div style={{ fontSize: 14, color: '#166534', opacity: 0.8 }}>
              Tamaño: <strong>{apkStatus.apkSize}</strong><br />
              Generada: <strong>{apkStatus.lastGenerated}</strong>
            </div>
          </div>
        ) : (
          <div style={{ 
            background: '#fff7ed', 
            border: '1px solid #ffedd5', 
            borderRadius: 12, 
            padding: 16, 
            marginBottom: 24,
            textAlign: 'left'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#9a3412', fontWeight: 600, marginBottom: 8 }}>
              <AlertCircle size={18} /> Sin versión disponible
            </div>
            <p style={{ fontSize: 13, color: '#9a3412', opacity: 0.8, margin: 0 }}>
              El administrador aún no ha subido la APK.
            </p>
          </div>
        )}

        <button 
          onClick={handleDownloadAPK} 
          disabled={loading || !apkStatus?.apkReady}
          style={{
            ...buttonStyle,
            opacity: (loading || !apkStatus?.apkReady) ? 0.6 : 1,
            cursor: (loading || !apkStatus?.apkReady) ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Preparando...' : (
            <>
              <Download size={20} /> Descargar ahora
            </>
          )}
        </button>

        {error && <p style={{ color: '#ef4444', marginTop: 16, fontSize: 14 }}>{error}</p>}
        {successMsg && <p style={{ color: '#22c55e', marginTop: 16, fontSize: 14 }}>{successMsg}</p>}
      </div>
    </div>
  );
}

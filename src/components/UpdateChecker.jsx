import { useEffect, useState } from 'react';
import { App } from '@capacitor/app';
import { Preferences } from '@capacitor/preferences';
import api from '../api/client';

export default function UpdateChecker() {
  const [showUpdate, setShowUpdate] = useState(false);
  const [updateInfo, setUpdateInfo] = useState(null);
  const [isNative, setIsNative] = useState(false);

  useEffect(() => {
    checkForUpdate();
  }, []);

  const checkForUpdate = async () => {
    try {
      // Verificar si estamos en app nativa (Capacitor)
      const appInfo = await App.getInfo();
      setIsNative(true);
      
      // Obtener versión almacenada localmente
      const { value: savedVersion } = await Preferences.get({ key: 'appVersion' });
      const currentVersion = savedVersion || appInfo.version || '1.0.0';

      // Consultar versión del servidor
      const response = await api.get('/apk/version');
      const serverVersion = response.data;

      // Comparar versiones
      if (isNewerVersion(serverVersion.version, currentVersion)) {
        setUpdateInfo(serverVersion);
        setShowUpdate(true);
      }

      // Guardar versión del servidor
      await Preferences.set({
        key: 'appVersion',
        value: serverVersion.version
      });

    } catch (e) {
      // Si no es Capacitor (web), ignorar
      console.log('Update check skipped:', e.message);
    }
  };

  // Comparar versiones semánticas (1.0.0 vs 1.0.1)
  const isNewerVersion = (newVersion, currentVersion) => {
    const newParts = newVersion.split('.').map(Number);
    const currentParts = currentVersion.split('.').map(Number);
    
    for (let i = 0; i < Math.max(newParts.length, currentParts.length); i++) {
      const newPart = newParts[i] || 0;
      const currentPart = currentParts[i] || 0;
      
      if (newPart > currentPart) return true;
      if (newPart < currentPart) return false;
    }
    return false;
  };

  const handleDownload = () => {
    if (updateInfo?.downloadUrl) {
      window.open(updateInfo.downloadUrl, '_blank');
    }
    setShowUpdate(false);
  };

  const handleLater = () => {
    setShowUpdate(false);
  };

  if (!showUpdate || !isNative) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: 20
    }}>
      <div style={{
        background: 'white',
        borderRadius: 16,
        padding: 24,
        maxWidth: 360,
        width: '100%',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>📱</div>
        
        <h2 style={{ margin: '0 0 8px', fontSize: 20, fontWeight: 700 }}>
          {updateInfo?.forceUpdate ? 'Actualización Requerida' : 'Nueva Actualización'}
        </h2>
        
        <p style={{ margin: '0 0 16px', color: '#666', fontSize: 14 }}>
          Versión {updateInfo?.version} disponible
        </p>

        {updateInfo?.releaseNotes && (
          <div style={{ 
            textAlign: 'left', 
            background: '#f5f5f5', 
            padding: 12, 
            borderRadius: 8,
            marginBottom: 20,
            fontSize: 13
          }}>
            <p style={{ margin: '0 0 8px', fontWeight: 600 }}>Novedades:</p>
            <ul style={{ margin: 0, paddingLeft: 16 }}>
              {updateInfo.releaseNotes.map((note, i) => (
                <li key={i} style={{ marginBottom: 4 }}>{note}</li>
              ))}
            </ul>
          </div>
        )}

        <button
          onClick={handleDownload}
          style={{
            width: '100%',
            padding: '14px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: 'none',
            borderRadius: 8,
            fontSize: 16,
            fontWeight: 600,
            cursor: 'pointer',
            marginBottom: 12
          }}
        >
          Descargar Ahora
        </button>

        {!updateInfo?.forceUpdate && (
          <button
            onClick={handleLater}
            style={{
              width: '100%',
              padding: '12px',
              background: 'transparent',
              color: '#666',
              border: '1px solid #ddd',
              borderRadius: 8,
              fontSize: 14,
              cursor: 'pointer'
            }}
          >
            Más Tarde
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * Componente para subir evidencias fotográficas del trabajo
 * Usado en el modal de insumos del técnico de soporte domiciliario
 */
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Camera, X, Upload, Image as ImageIcon, Aperture, FlipHorizontal } from 'lucide-react';

/**
 * @param {Object} props
 * @param {string} props.appointmentId - ID de la cita
 * @param {Array} props.photos - Fotos existentes [{url, description}]
 * @param {Function} props.onPhotosChange - Callback cuando cambian las fotos
 * @param {string} props.apiUrl - URL base de la API
 * @param {string} props.token - Token de autenticación
 * @param {Object} props.colors - Colores del tema
 */
export function WorkEvidenceUploader({
  appointmentId,
  photos = [],
  onPhotosChange,
  apiUrl,
  token,
  colors = {}
}) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [facingMode, setFacingMode] = useState('environment'); // 'environment' = trasera, 'user' = frontal
  const cameraInputRef = useRef(null);
  const galleryInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const defaultColors = {
    primary: '#3b82f6',
    border: '#e5e7eb',
    bgSecondary: '#f3f4f6',
    text: '#1f2937',
    textSecondary: '#6b7280',
    ...colors
  };

  // Detener stream de cámara
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setShowCamera(false);
    setCameraError(null);
  }, []);

  // Limpiar al desmontar
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  // Subir foto a Cloudinary
  const uploadPhoto = async (file) => {
    if (!file) return;

    setUploading(true);
    setUploadProgress('Subiendo...');

    try {
      const formData = new FormData();
      formData.append('photo', file);
      formData.append('description', '');

      const response = await fetch(
        `${apiUrl}/upload/work-evidence/${appointmentId}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formData
        }
      );

      const data = await response.json();

      if (response.ok) {
        const newPhoto = {
          url: data.url,
          public_id: data.public_id,
          description: ''
        };
        const newPhotos = [...photos, newPhoto];
        onPhotosChange?.(newPhotos);
      } else {
        console.error('Error subiendo foto:', data.error);
        alert('Error: ' + (data.error || 'No se pudo subir la foto'));
      }
    } catch (error) {
      console.error('Error subiendo foto:', error);
      alert('Error de conexión al subir foto');
    } finally {
      setUploading(false);
      setUploadProgress(null);
    }
  };

  // Manejar selección de archivo
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    
    // Validar límite de 5 fotos
    if (photos.length + files.length > 5) {
      alert('Máximo 5 fotos permitidas');
      return;
    }

    // Validar tipo de archivo
    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        alert('Solo se permiten imágenes');
        return;
      }
      if (file.size > 10 * 1024 * 1024) { // 10MB
        alert('La imagen es muy grande. Máximo 10MB');
        return;
      }
    }

    // Subir cada archivo
    files.forEach(file => uploadPhoto(file));
  };

  // Eliminar foto
  const removePhoto = (index) => {
    const newPhotos = photos.filter((_, i) => i !== index);
    onPhotosChange?.(newPhotos);
  };

  // Actualizar descripción
  const updateDescription = (index, description) => {
    const newPhotos = [...photos];
    newPhotos[index].description = description;
    onPhotosChange?.(newPhotos);
  };

  // Iniciar cámara con getUserMedia
  const startCamera = async () => {
    setCameraError(null);
    try {
      // Verificar soporte de getUserMedia
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        // Fallback: usar input file con capture
        cameraInputRef.current?.click();
        return;
      }

      const constraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      setShowCamera(true);
    } catch (err) {
      console.error('Error accediendo a la cámara:', err);
      setCameraError('No se pudo acceder a la cámara. Verifica los permisos.');
      // Fallback al input file
      cameraInputRef.current?.click();
    }
  };

  // Capturar foto desde la cámara
  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    // Configurar canvas al tamaño del video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Convertir a blob
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `captura_${Date.now()}.jpg`, { type: 'image/jpeg' });
        uploadPhoto(file);
      }
    }, 'image/jpeg', 0.9);
    
    // Detener cámara después de capturar
    stopCamera();
  };

  // Cambiar entre cámara frontal y trasera
  const switchCamera = async () => {
    const newFacingMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(newFacingMode);
    
    // Reiniciar cámara con nuevo facingMode
    if (streamRef.current) {
      stopCamera();
      setTimeout(() => {
        startCamera();
      }, 100);
    }
  };

  // Abrir galería
  const openGallery = () => {
    galleryInputRef.current?.click();
  };

  return (
    <div style={{ marginBottom: 20 }}>
      <label style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, display: 'block' }}>
        📸 Evidencias Fotográficas (Opcional):
      </label>
      
      <p style={{ fontSize: 12, color: defaultColors.textSecondary, marginBottom: 12 }}>
        Sube hasta 5 fotos del trabajo realizado. Estas fotos aparecerán en el comprobante del cliente.
      </p>

      {/* Grid de fotos */}
      {photos.length > 0 && (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(2, 1fr)', 
          gap: 12, 
          marginBottom: 16 
        }}>
          {photos.map((photo, index) => (
            <div 
              key={index}
              style={{
                position: 'relative',
                background: defaultColors.bgSecondary,
                borderRadius: 8,
                overflow: 'hidden',
                border: `1px solid ${defaultColors.border}`
              }}
            >
              <img 
                src={photo.url} 
                alt={`Evidencia ${index + 1}`}
                style={{
                  width: '100%',
                  height: 120,
                  objectFit: 'cover',
                  display: 'block'
                }}
              />
              
              {/* Botón eliminar */}
              <button
                onClick={() => removePhoto(index)}
                style={{
                  position: 'absolute',
                  top: 4,
                  right: 4,
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  background: '#ef4444',
                  color: 'white',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 0
                }}
                disabled={uploading}
              >
                <X size={14} />
              </button>

              {/* Input descripción */}
              <input
                type="text"
                placeholder="Descripción..."
                value={photo.description || ''}
                onChange={(e) => updateDescription(index, e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  border: 'none',
                  borderTop: `1px solid ${defaultColors.border}`,
                  fontSize: 12,
                  background: 'white'
                }}
              />
            </div>
          ))}
        </div>
      )}

      {/* Contador de fotos */}
      {photos.length > 0 && (
        <div style={{ 
          fontSize: 12, 
          color: defaultColors.textSecondary, 
          marginBottom: 12,
          textAlign: 'center'
        }}>
          {photos.length} de 5 fotos
        </div>
      )}

      {/* Canvas oculto para capturar foto */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* Vista previa de la cámara */}
      {showCamera && (
        <div style={{
          marginBottom: 16,
          background: '#000',
          borderRadius: 12,
          overflow: 'hidden',
          position: 'relative'
        }}>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            style={{
              width: '100%',
              height: 250,
              objectFit: 'cover',
              display: 'block'
            }}
          />
          
          {/* Controles de la cámara */}
          <div style={{
            position: 'absolute',
            bottom: 12,
            left: 0,
            right: 0,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 20,
            padding: '0 16px'
          }}>
            {/* Botón cambiar cámara */}
            <button
              onClick={switchCamera}
              style={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.3)',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                backdropFilter: 'blur(4px)'
              }}
            >
              <FlipHorizontal size={22} color="white" />
            </button>

            {/* Botón capturar */}
            <button
              onClick={capturePhoto}
              style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                background: 'white',
                border: '4px solid rgba(255,255,255,0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <Aperture size={32} color={defaultColors.primary} />
            </button>

            {/* Botón cancelar */}
            <button
              onClick={stopCamera}
              style={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.3)',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                backdropFilter: 'blur(4px)'
              }}
            >
              <X size={22} color="white" />
            </button>
          </div>

          {/* Indicador de modo */}
          <div style={{
            position: 'absolute',
            top: 12,
            right: 12,
            padding: '4px 10px',
            background: 'rgba(0,0,0,0.5)',
            borderRadius: 20,
            fontSize: 11,
            color: 'white',
            textTransform: 'uppercase',
            letterSpacing: 0.5
          }}>
            {facingMode === 'environment' ? 'Cámara Trasera' : 'Cámara Frontal'}
          </div>
        </div>
      )}

      {/* Error de cámara */}
      {cameraError && (
        <div style={{
          padding: 12,
          background: '#fee2e2',
          borderRadius: 8,
          fontSize: 12,
          color: '#991b1b',
          marginBottom: 12,
          textAlign: 'center'
        }}>
          {cameraError}
        </div>
      )}

      {/* Botones de acción */}
      {photos.length < 5 && !showCamera && (
        <div style={{ display: 'flex', gap: 10 }}>
          {/* Input file oculto para CÁMARA (fallback) */}
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
            disabled={uploading}
          />

          {/* Input file oculto para GALERÍA (sin capture) */}
          <input
            ref={galleryInputRef}
            type="file"
            accept="image/*"
            multiple={photos.length < 4}
            onChange={handleFileSelect}
            style={{ display: 'none' }}
            disabled={uploading}
          />

          {/* Botón cámara (usa getUserMedia primero) */}
          <button
            onClick={startCamera}
            disabled={uploading}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              padding: '10px 12px',
              borderRadius: 8,
              border: `1px solid ${defaultColors.border}`,
              background: defaultColors.bgSecondary,
              color: defaultColors.text,
              fontSize: 13,
              fontWeight: 600,
              cursor: uploading ? 'not-allowed' : 'pointer',
              opacity: uploading ? 0.7 : 1
            }}
          >
            <Camera size={16} />
            Cámara
          </button>

          {/* Botón galería/archivos */}
          <button
            onClick={openGallery}
            disabled={uploading}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              padding: '10px 12px',
              borderRadius: 8,
              border: `1px solid ${defaultColors.border}`,
              background: defaultColors.bgSecondary,
              color: defaultColors.text,
              fontSize: 13,
              fontWeight: 600,
              cursor: uploading ? 'not-allowed' : 'pointer',
              opacity: uploading ? 0.7 : 1
            }}
          >
            <ImageIcon size={16} />
            Galería
          </button>
        </div>
      )}

      {/* Estado de subida */}
      {uploading && (
        <div style={{ 
          textAlign: 'center', 
          padding: 12, 
          marginTop: 12,
          background: defaultColors.bgSecondary,
          borderRadius: 8
        }}>
          <div style={{ 
            width: 20, 
            height: 20, 
            border: `2px solid ${defaultColors.border}`,
            borderTopColor: defaultColors.primary,
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 8px'
          }} />
          <style>{`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}</style>
          <span style={{ fontSize: 12, color: defaultColors.textSecondary }}>
            {uploadProgress}
          </span>
        </div>
      )}

      {/* Mensaje cuando ya hay 5 fotos */}
      {photos.length >= 5 && (
        <div style={{ 
          padding: 12, 
          background: '#fef3c7', 
          borderRadius: 8,
          fontSize: 12,
          color: '#92400e',
          textAlign: 'center'
        }}>
          ✅ Máximo de 5 fotos alcanzado. Elimina una foto para agregar más.
        </div>
      )}
    </div>
  );
}

export default WorkEvidenceUploader;

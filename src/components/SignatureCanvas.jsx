/**
 * Componente Canvas para capturar la firma del cliente
 * Usado en el flujo de completar servicio del técnico
 */
import React, { useRef, useState, useEffect } from 'react';
import { Pen, X, Check, Trash2 } from 'lucide-react';

/**
 * @param {Object} props
 * @param {string} props.signature - Firma existente (base64 data URL)
 * @param {Function} props.onSignatureChange - Callback cuando cambia la firma (base64 o null)
 * @param {Object} props.colors - Colores del tema
 * @param {number} props.width - Ancho del canvas (default: 300)
 * @param {number} props.height - Alto del canvas (default: 150)
 */
export function SignatureCanvas({
  signature = null,
  onSignatureChange,
  colors = {},
  width = 300,
  height = 150
}) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  const defaultColors = {
    primary: '#3b82f6',
    border: '#e5e7eb',
    bgSecondary: '#f3f4f6',
    text: '#1f2937',
    textSecondary: '#6b7280',
    ...colors
  };

  // Cargar firma existente si la hay
  useEffect(() => {
    if (signature && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        setHasSignature(true);
      };
      img.src = signature;
    }
  }, [signature]);

  // Obtener coordenadas del touch/mouse
  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    if (e.touches && e.touches.length > 0) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY
      };
    } else {
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY
      };
    }
  };

  // Iniciar dibujo
  const startDrawing = (e) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const { x, y } = getCoordinates(e);

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#1f2937'; // Color de la firma

    setIsDrawing(true);
  };

  // Dibujar
  const draw = (e) => {
    if (!isDrawing) return;
    e.preventDefault();

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const { x, y } = getCoordinates(e);

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  // Terminar dibujo
  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    setHasSignature(true);

    // Guardar firma como base64
    const canvas = canvasRef.current;
    const dataUrl = canvas.toDataURL('image/png');
    onSignatureChange?.(dataUrl);
  };

  // Limpiar canvas
  const clearSignature = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
    onSignatureChange?.(null);
  };

  return (
    <div style={{ marginBottom: 20 }}>
      <label style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, display: 'block' }}>
        ✍️ Firma del Cliente (Obligatoria):
      </label>

      <p style={{ fontSize: 12, color: defaultColors.textSecondary, marginBottom: 12 }}>
        El cliente debe firmar para confirmar que el servicio fue realizado satisfactoriamente.
      </p>

      {/* Canvas Container */}
      <div
        style={{
          position: 'relative',
          border: `2px solid ${hasSignature ? defaultColors.primary : defaultColors.border}`,
          borderRadius: 12,
          overflow: 'hidden',
          background: '#ffffff',
          boxShadow: hasSignature ? `0 0 0 3px ${defaultColors.primary}20` : 'none'
        }}
      >
        {/* Línea guía de firma */}
        <div
          style={{
            position: 'absolute',
            bottom: 30,
            left: '10%',
            right: '10%',
            height: 1,
            background: defaultColors.border,
            pointerEvents: 'none'
          }}
        />

        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          style={{
            width: '100%',
            height: 'auto',
            display: 'block',
            cursor: 'crosshair',
            touchAction: 'none' // Prevenir scroll en móviles mientras firma
          }}
        />

        {/* Texto guía si no hay firma */}
        {!hasSignature && (
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              color: defaultColors.textSecondary,
              fontSize: 14,
              pointerEvents: 'none',
              textAlign: 'center'
            }}
          >
            <Pen size={24} style={{ marginBottom: 8, opacity: 0.5 }} />
            <div>Firme aquí</div>
          </div>
        )}
      </div>

      {/* Botones de acción */}
      <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
        <button
          onClick={clearSignature}
          type="button"
          disabled={!hasSignature}
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
            cursor: hasSignature ? 'pointer' : 'not-allowed',
            opacity: hasSignature ? 1 : 0.5
          }}
        >
          <Trash2 size={16} />
          Borrar
        </button>

        {hasSignature && (
          <div
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              padding: '10px 12px',
              borderRadius: 8,
              background: '#dcfce7',
              color: '#166534',
              fontSize: 13,
              fontWeight: 600
            }}
          >
            <Check size={16} />
            Firmado
          </div>
        )}
      </div>
    </div>
  );
}

export default SignatureCanvas;

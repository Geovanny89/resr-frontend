import { X, Download, Upload, FileSpreadsheet, CheckCircle, Info, AlertCircle } from 'lucide-react';

export function ImportModal({
  isOpen,
  onClose,
  onDownloadTemplate,
  onFileSelect,
  isImporting,
  importResult,
  isDark,
  colors
}) {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: 16
    }} onClick={onClose}>
      <div style={{
        background: colors.cardBg, borderRadius: 16, padding: 28,
        maxWidth: 500, width: '100%', maxHeight: '90vh', overflowY: 'auto'
      }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: colors.text }}>
            <FileSpreadsheet size={24} style={{ verticalAlign: 'middle', marginRight: 8, color: '#10b981' }} />
            Importar Insumos desde Excel
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <X size={24} color={colors.textSecondary} />
          </button>
        </div>

        {!importResult ? (
          <div>
            <button
              onClick={onDownloadTemplate}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                padding: '12px 16px',
                background: colors.bgTertiary,
                border: `1px dashed ${colors.border}`,
                borderRadius: 8,
                color: colors.text,
                fontWeight: 600,
                fontSize: 14,
                cursor: 'pointer',
                marginBottom: 16
              }}
            >
              <Download size={18} />
              Descargar Plantilla (CSV)
            </button>

            <div style={{
              background: isDark ? 'rgba(16, 185, 129, 0.1)' : '#ecfdf5',
              border: `1px solid ${isDark ? 'rgba(16, 185, 129, 0.3)' : '#10b981'}`,
              borderRadius: 8,
              padding: 16,
              marginBottom: 20
            }}>
              <h4 style={{ margin: '0 0 12px', color: isDark ? '#34d399' : '#065f46', fontSize: 14 }}>
                <Info size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} />
                Formato esperado:
              </h4>
              <p style={{ margin: '0 0 8px', fontSize: 13, color: colors.textSecondary }}>
                El archivo Excel debe tener una fila de encabezados con estas columnas:
              </p>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', 
                gap: 8, 
                fontSize: 12, 
                color: colors.textTertiary 
              }}>
                <div>• <strong style={{color: colors.text}}>Nombre</strong> (req)</div>
                <div>• <strong style={{color: colors.text}}>Descripción</strong></div>
                <div>• <strong style={{color: colors.text}}>Unidad</strong></div>
                <div>• <strong style={{color: colors.text}}>Stock</strong></div>
                <div>• <strong style={{color: colors.text}}>Stock Mínimo</strong></div>
                <div>• <strong style={{color: colors.text}}>Costo</strong></div>
                <div>• <strong style={{color: colors.text}}>Proveedor</strong></div>
              </div>
              <p style={{ margin: '12px 0 0', fontSize: 12, color: isDark ? '#34d399' : '#059669' }}>
                <CheckCircle size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                Los insumos existentes se actualizarán sin afectar el stock actual
              </p>
            </div>

            <div style={{
              border: `2px dashed ${isDark ? 'rgba(16, 185, 129, 0.5)' : '#10b981'}`,
              borderRadius: 12,
              padding: 'clamp(20px, 5vw, 40px)',
              textAlign: 'center',
              background: isDark ? 'rgba(16, 185, 129, 0.05)' : '#f0fdf4'
            }}>
              <Upload size={48} color={isDark ? '#34d399' : '#10b981'} style={{ marginBottom: 16 }} />
              <p style={{ margin: '0 0 16px', fontSize: 16, color: colors.text, fontWeight: 500 }}>
                Arrastra un archivo Excel aquí o haz clic para seleccionar
              </p>
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={onFileSelect}
                style={{ display: 'none' }}
                id="excel-upload"
              />
              <label
                htmlFor="excel-upload"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '12px 24px',
                  background: '#10b981',
                  color: 'white',
                  borderRadius: 8,
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: 'clamp(13px, 3vw, 14px)'
                }}
              >
                <FileSpreadsheet size={18} />
                Seleccionar Archivo
              </label>
            </div>

            {isImporting && (
              <div style={{ textAlign: 'center', marginTop: 20 }}>
                <div style={{
                  width: 40,
                  height: 40,
                  border: `4px solid ${colors.border}`,
                  borderTop: `4px solid ${colors.success}`,
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                  margin: '0 auto 12px'
                }} />
                <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
                <p style={{ margin: 0, color: colors.textSecondary }}>Procesando archivo...</p>
              </div>
            )}
          </div>
        ) : (
          <div>
            {importResult.success ? (
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  width: 60,
                  height: 60,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px'
                }}>
                  <CheckCircle size={32} color="white" />
                </div>
                <h3 style={{ margin: '0 0 8px', color: colors.text }}>
                  ¡Importación Exitosa!
                </h3>
                <p style={{ margin: '0 0 20px', color: colors.textSecondary, fontSize: 14 }}>
                  {importResult.message}
                </p>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                  gap: 12,
                  marginBottom: 20
                }}>
                  <div style={{
                    background: isDark ? 'rgba(16, 185, 129, 0.15)' : '#ecfdf5',
                    padding: 16,
                    borderRadius: 8,
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: 24, fontWeight: 700, color: isDark ? '#34d399' : '#059669' }}>
                      {importResult.results?.created || 0}
                    </div>
                    <div style={{ fontSize: 12, color: isDark ? '#6ee7b7' : '#065f46' }}>Nuevos insumos</div>
                  </div>
                  <div style={{
                    background: isDark ? 'rgba(59, 130, 246, 0.15)' : '#dbeafe',
                    padding: 16,
                    borderRadius: 8,
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: 24, fontWeight: 700, color: isDark ? '#60a5fa' : '#2563eb' }}>
                      {importResult.results?.updated || 0}
                    </div>
                    <div style={{ fontSize: 12, color: isDark ? '#93c5fd' : '#1e40af' }}>Actualizados</div>
                  </div>
                </div>
                {importResult.results?.errors?.length > 0 && (
                  <div style={{
                    background: isDark ? 'rgba(239, 68, 68, 0.1)' : '#fef2f2',
                    border: `1px solid ${isDark ? 'rgba(239, 68, 68, 0.3)' : '#fecaca'}`,
                    borderRadius: 8,
                    padding: 12,
                    marginBottom: 20,
                    textAlign: 'left'
                  }}>
                    <p style={{ margin: '0 0 8px', fontSize: 13, color: isDark ? '#f87171' : '#dc2626', fontWeight: 600 }}>
                      <AlertCircle size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                      Errores ({importResult.results.errors.length}):
                    </p>
                    <ul style={{ margin: 0, paddingLeft: 16, fontSize: 12, color: isDark ? '#fca5a5' : '#7f1d1d' }}>
                      {importResult.results.errors.slice(0, 5).map((err, idx) => (
                        <li key={idx}>Fila {err.row}: {err.error}</li>
                      ))}
                      {importResult.results.errors.length > 5 && (
                        <li>... y {importResult.results.errors.length - 5} errores más</li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  width: 60,
                  height: 60,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px'
                }}>
                  <AlertCircle size={32} color="white" />
                </div>
                <h3 style={{ margin: '0 0 8px', color: colors.text }}>
                  Error en la Importación
                </h3>
                <p style={{ margin: '0 0 20px', color: colors.textSecondary, fontSize: 14 }}>
                  {importResult.error || 'Ocurrió un error al procesar el archivo'}
                </p>
              </div>
            )}
            <button
              onClick={onClose}
              style={{
                width: '100%',
                padding: 12,
                borderRadius: 10,
                border: 'none',
                background: '#3b82f6',
                color: 'white',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Cerrar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ImportModal;

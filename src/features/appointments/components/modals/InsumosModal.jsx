/**
 * Modal para registrar detalles al iniciar trabajo
 * Extraído de Appointments.jsx
 */
import { Package } from 'lucide-react';
import { WorkEvidenceUploader } from '../../../../components/WorkEvidenceUploader';

const fmt = (n) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n || 0);

/**
 * Modal de insumos
 * @param {Object} props
 * @param {boolean} props.isOpen - Si el modal está abierto
 * @param {Object} props.appointment - Datos de la cita
 * @param {Array} props.inventoryItems - Items del inventario
 * @param {Array} props.selectedInsumos - Insumos seleccionados
 * @param {boolean} props.loadingInventory - Estado de carga del inventario
 * @param {string} props.diagnosis - Diagnóstico técnico
 * @param {string} props.solution - Solución aplicada
 * @param {string} props.recommendations - Recomendaciones
 * @param {Array} props.workEvidences - Evidencias de trabajo
 * @param {Function} props.onClose - Callback al cerrar
 * @param {Function} props.onAddInsumo - Callback al agregar insumo (itemId, quantity)
 * @param {Function} props.onRemoveInsumo - Callback al remover insumo (itemId)
 * @param {Function} props.onSave - Callback al guardar
 * @param {Function} props.onDiagnosisChange - Callback al cambiar diagnóstico
 * @param {Function} props.onSolutionChange - Callback al cambiar solución
 * @param {Function} props.onRecommendationsChange - Callback al cambiar recomendaciones
 * @param {Function} props.onWorkEvidencesChange - Callback al cambiar evidencias
 * @param {boolean} props.isSaving - Estado de carga al guardar
 * @param {Object} props.colors - Colores del tema
 */
export function InsumosModal({
  isOpen,
  appointment,
  inventoryItems,
  selectedInsumos,
  loadingInventory,
  diagnosis,
  solution,
  recommendations,
  workEvidences,
  onClose,
  onAddInsumo,
  onRemoveInsumo,
  onSave,
  onDiagnosisChange,
  onSolutionChange,
  onRecommendationsChange,
  onWorkEvidencesChange,
  isSaving,
  colors
}) {
  if (!isOpen || !appointment) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20
    }}>
      <div style={{
        background: colors.cardBg, borderRadius: 16, padding: 24,
        maxWidth: 500, width: '100%', maxHeight: '80vh',
        overflowY: 'auto', border: `1px solid ${colors.border}`
      }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Package size={24} color={colors.primary} />
          Detalles del Trabajo
        </h2>
        
        <div style={{ fontSize: 14, color: colors.textSecondary, marginBottom: 20 }}>
          Cliente: <strong>{appointment.clientName}</strong> • {' '}
          Servicio: <strong>{appointment.Service?.name}</strong>
        </div>

        {/* Lista de insumos */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, display: 'block' }}>
            Insumos Utilizados:
          </label>
          
          {loadingInventory ? (
            <div style={{ textAlign: 'center', padding: 20 }}>
              <div className="spinner" />
              <p style={{ fontSize: 12, color: colors.textSecondary, marginTop: 8 }}>Cargando inventario...</p>
            </div>
          ) : inventoryItems.length === 0 ? (
            <div style={{ 
              padding: 16, background: colors.bgSecondary, borderRadius: 8,
              fontSize: 13, color: colors.textSecondary
            }}>
              No hay insumos registrados en el inventario.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {inventoryItems.map(item => (
                <div 
                  key={item.id}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: 12, background: colors.bgSecondary, borderRadius: 8,
                    border: `1px solid ${colors.border}`
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selectedInsumos.some(i => i.itemId === item.id)}
                    onChange={(e) => {
                      if (e.target.checked) onAddInsumo(item.id, 1);
                      else onRemoveInsumo(item.id);
                    }}
                    style={{ width: 18, height: 18 }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{item.name}</div>
                    <div style={{ fontSize: 12, color: colors.textSecondary }}>
                      Stock: {item.currentStock} {item.unit} • Costo: {fmt(item.costPerUnit)}/{item.unit}
                    </div>
                  </div>
                  {selectedInsumos.some(i => i.itemId === item.id) && (
                    <input
                      type="number"
                      min="0.1" step="0.1"
                      value={selectedInsumos.find(i => i.itemId === item.id)?.quantity || 1}
                      onChange={(e) => onAddInsumo(item.id, e.target.value)}
                      style={{
                        width: 70, padding: '6px 8px', borderRadius: 6,
                        border: `1px solid ${colors.border}`, fontSize: 14, textAlign: 'center'
                      }}
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Resumen */}
        {selectedInsumos.length > 0 && (
          <div style={{ 
            marginBottom: 20, padding: 12, background: '#f0fdf4',
            borderRadius: 8, border: '1px solid #86efac'
          }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#166534', marginBottom: 6 }}>
              📦 Insumos utilizados ({selectedInsumos.length}):
            </div>
            <div style={{ fontSize: 12, color: '#166534' }}>
              {selectedInsumos.map(i => `${i.name}: ${i.quantity} ${i.unit}`).join(', ')}
            </div>
          </div>
        )}

        {/* Diagnóstico */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, display: 'block' }}>
            🔍 Diagnóstico:
          </label>
          <textarea
            value={diagnosis}
            onChange={(e) => onDiagnosisChange(e.target.value)}
            placeholder="Describe el problema o diagnóstico técnico"
            rows={3}
            style={{
              width: '100%', padding: 12, borderRadius: 8,
              border: `1px solid ${colors.border}`, fontSize: 14, resize: 'vertical'
            }}
          />
        </div>

        {/* Solución */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, display: 'block' }}>
            🔧 Solución Aplicada:
          </label>
          <textarea
            value={solution}
            onChange={(e) => onSolutionChange(e.target.value)}
            placeholder="Describe la solución o reparación realizada"
            rows={3}
            style={{
              width: '100%', padding: 12, borderRadius: 8,
              border: `1px solid ${colors.border}`, fontSize: 14, resize: 'vertical'
            }}
          />
        </div>

        {/* Recomendaciones */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, display: 'block' }}>
            💡 Recomendaciones:
          </label>
          <textarea
            value={recommendations}
            onChange={(e) => onRecommendationsChange(e.target.value)}
            placeholder="Recomendaciones para el cliente"
            rows={2}
            style={{
              width: '100%', padding: 12, borderRadius: 8,
              border: `1px solid ${colors.border}`, fontSize: 14, resize: 'vertical'
            }}
          />
        </div>

        {/* Evidencias */}
        <WorkEvidenceUploader
          appointmentId={appointment?.id}
          photos={workEvidences}
          onPhotosChange={onWorkEvidencesChange}
          apiUrl={import.meta.env.VITE_API_URL || ''}
          token={localStorage.getItem('token') || ''}
          colors={colors}
        />

        {/* Botones */}
        <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
          <button
            onClick={onClose}
            style={{
              flex: 1, padding: 12, borderRadius: 10,
              border: `1px solid ${colors.border}`, background: 'none',
              fontWeight: 600, cursor: 'pointer'
            }}
          >
            Cancelar
          </button>
          <button
            onClick={onSave}
            disabled={isSaving}
            style={{
              flex: 2, padding: 12, borderRadius: 10, border: 'none',
              background: colors.primary, color: 'white', fontWeight: 700,
              cursor: isSaving ? 'not-allowed' : 'pointer',
              opacity: isSaving ? 0.7 : 1
            }}
          >
            {isSaving ? 'Guardando...' : 'Confirmar'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default InsumosModal;

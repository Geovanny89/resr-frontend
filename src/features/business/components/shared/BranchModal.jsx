import { X, Upload, CheckCircle } from 'lucide-react';
import { useRef } from 'react';

export default function BranchModal({ 
  show, 
  onClose, 
  onSubmit,
  branchForm,
  onUpdateField,
  branchScreenshot,
  onScreenshotChange,
  submitting
}) {
  const branchPaymentRef = useRef();

  if (!show) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div className="card" onClick={e => e.stopPropagation()} style={{ maxWidth: 500, width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>Nueva Sucursal</h3>
          <button 
            type="button" 
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
          >
            <X size={24} />
          </button>
        </div>
        <form onSubmit={onSubmit}>
          <div className="form-group">
            <label>Nombre de la sucursal *</label>
            <input 
              type="text" 
              value={branchForm.name} 
              onChange={e => onUpdateField('name', e.target.value)} 
              required 
              placeholder="Ej: Barbería El Rey - Sucursal Norte"
            />
          </div>
          <div className="form-group">
            <label>Dirección *</label>
            <input 
              type="text" 
              value={branchForm.address} 
              onChange={e => onUpdateField('address', e.target.value)} 
              required 
              placeholder="Calle..."
            />
          </div>
          <div className="form-group">
            <label>Teléfono</label>
            <input 
              type="tel" 
              value={branchForm.phone} 
              onChange={e => onUpdateField('phone', e.target.value)} 
              placeholder="300..."
            />
          </div>


          <div className="form-group">
            <label>Comprobante de Pago (50% de descuento) *</label>
            <div style={{ 
              border: '2px dashed var(--border)', borderRadius: 12, padding: 20, textAlign: 'center', cursor: 'pointer',
              background: branchScreenshot ? '#f0fdf4' : 'transparent'
            }} onClick={() => branchPaymentRef.current.click()}>
              {branchScreenshot ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, color: '#166534', fontWeight: 600 }}>
                  <CheckCircle size={20}/> Archivo seleccionado
                </div>
              ) : (
                <div style={{ color: 'var(--text-muted)' }}>
                  <Upload size={24} style={{ marginBottom: 8 }}/>
                  <div>Haz clic para subir el comprobante</div>
                </div>
              )}
            </div>
            <input ref={branchPaymentRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => onScreenshotChange(e.target.files[0])}/>
          </div>
          
          <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
            <button type="button" className="btn-secondary" style={{ flex: 1 }} onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn-primary" style={{ flex: 1 }} disabled={submitting}>
              {submitting ? 'Enviando...' : 'Enviar Solicitud'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

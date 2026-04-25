import { Store } from 'lucide-react';

export default function MissionVisionTab({ 
  form, 
  onUpdateField, 
  onSubmit, 
  saving 
}) {
  return (
    <div className="card">
      <h3 style={{fontSize:16,fontWeight:700,marginBottom:20,display:'flex',alignItems:'center',gap:8}}>
        <Store size={18} style={{color:'var(--primary)'}}/> Misión y Visión
      </h3>
      
      <div className="form-group" style={{ marginBottom: 24, background: '#f8fafc', padding: 16, borderRadius: 12, border: '1px solid var(--border)' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', margin: 0 }}>
          <input 
            type="checkbox" 
            checked={form.showMissionVision} 
            onChange={e => onUpdateField('showMissionVision', e.target.checked)}
            style={{ width: 20, height: 20 }}
          />
          <div>
            <div style={{ fontWeight: 700, fontSize: 14 }}>Mostrar Misión y Visión en la página</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 400 }}>
              Activa esta opción para mostrar tu misión y visión en la landing page.
            </div>
          </div>
        </label>
      </div>

      {form.showMissionVision && (
        <div style={{display:'flex',flexDirection:'column',gap:16}}>
          <div className="form-group">
            <label style={{fontSize:12,fontWeight:600,color:'var(--text-muted)'}}>Misión</label>
            <textarea
              value={form.mission || ''} 
              onChange={e => onUpdateField('mission', e.target.value)}
              placeholder="Describe la misión de tu empresa..."
              rows={4}
              style={{width:'100%',padding:12,borderRadius:8,border:'1px solid var(--border)',resize:'vertical'}}
            />
            <p style={{fontSize:11,color:'var(--text-muted)',marginTop:4}}>
              ¿Cuál es el propósito de tu empresa? ¿Qué te motiva a ofrecer tus servicios?
            </p>
          </div>

          <div className="form-group">
            <label style={{fontSize:12,fontWeight:600,color:'var(--text-muted)'}}>Visión</label>
            <textarea
              value={form.vision || ''} 
              onChange={e => onUpdateField('vision', e.target.value)}
              placeholder="Describe la visión de tu empresa..."
              rows={4}
              style={{width:'100%',padding:12,borderRadius:8,border:'1px solid var(--border)',resize:'vertical'}}
            />
            <p style={{fontSize:11,color:'var(--text-muted)',marginTop:4}}>
              ¿Hacia dónde quieres llevar tu empresa? ¿Qué aspiras lograr a largo plazo?
            </p>
          </div>
        </div>
      )}
      
      <button type="submit" className="btn-primary" style={{marginTop:24}} disabled={saving}>
        {saving ? 'Guardando...' : '💾 Guardar Misión y Visión'}
      </button>
    </div>
  );
}

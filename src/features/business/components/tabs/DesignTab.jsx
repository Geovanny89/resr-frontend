import { Palette } from 'lucide-react';

const COLOR_PRESETS = [
  {name:'Violeta',  p:'#667eea',s:'#764ba2'},
  {name:'Esmeralda',p:'#11998e',s:'#38ef7d'},
  {name:'Coral',    p:'#f093fb',s:'#f5576c'},
  {name:'Dorado',   p:'#f7971e',s:'#ffd200'},
  {name:'Océano',   p:'#2193b0',s:'#6dd5ed'},
  {name:'Noche',    p:'#1a1a2e',s:'#16213e'},
  {name:'Rosa',     p:'#ee0979',s:'#ff6a00'},
  {name:'Verde',    p:'#134e5e',s:'#71b280'},
];

export default function DesignTab({ 
  form, 
  onUpdateField, 
  onSubmit, 
  saving,
  previewGradient
}) {
  return (
    <div className="card">
      <h3 style={{fontSize:16,fontWeight:700,marginBottom:20,display:'flex',alignItems:'center',gap:8}}>
        <Palette size={18} style={{color:'var(--primary)'}}/> Colores y diseño
      </h3>
      <div className="my-business-design-grid" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20,marginBottom:24}}>
        <div className="form-group">
          <label>Color primario</label>
          <div style={{display:'flex',gap:8,alignItems:'center'}}>
            <input type="color" value={form.primaryColor||'#667eea'} onChange={e=>onUpdateField('primaryColor', e.target.value)}
              style={{width:48,height:40,padding:2,border:'1px solid var(--border)',borderRadius:8,cursor:'pointer'}}/>
            <input type="text" value={form.primaryColor||'#667eea'} onChange={e=>onUpdateField('primaryColor', e.target.value)}
              style={{flex:1,fontFamily:'monospace'}} placeholder="#667eea"/>
          </div>
        </div>
        <div className="form-group">
          <label>Color secundario</label>
          <div style={{display:'flex',gap:8,alignItems:'center'}}>
            <input type="color" value={form.secondaryColor||'#764ba2'} onChange={e=>onUpdateField('secondaryColor', e.target.value)}
              style={{width:48,height:40,padding:2,border:'1px solid var(--border)',borderRadius:8,cursor:'pointer'}}/>
            <input type="text" value={form.secondaryColor||'#764ba2'} onChange={e=>onUpdateField('secondaryColor', e.target.value)}
              style={{flex:1,fontFamily:'monospace'}} placeholder="#764ba2"/>
          </div>
        </div>
      </div>
      
      <div style={{borderRadius:16,overflow:'hidden',marginBottom:20,boxShadow:'0 4px 20px rgba(0,0,0,0.1)'}}>
        <div style={{background:previewGradient,padding:'32px 24px',textAlign:'center',color:'white'}}>
          <div style={{width:60,height:60,borderRadius:'50%',background:'rgba(255,255,255,0.2)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:28,margin:'0 auto 12px'}}>🏪</div>
          <div style={{fontSize:20,fontWeight:800,marginBottom:4}}>Vista previa</div>
          <div style={{fontSize:13,opacity:0.85}}>{form.tagline || 'Tu slogan aquí'}</div>
        </div>
        <div style={{background:'white',padding:'16px 24px',display:'flex',justifyContent:'center'}}>
          <button style={{background:previewGradient,color:'white',border:'none',borderRadius:10,padding:'10px 28px',fontWeight:700,cursor:'default'}}>
            {form.ctaText || 'Reservar cita ahora'}
          </button>
        </div>
      </div>
      
      <div style={{marginBottom:20}}>
        <label style={{fontSize:13,fontWeight:600,color:'var(--text-muted)',display:'block',marginBottom:10}}>Paletas predefinidas</label>
        <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
          {COLOR_PRESETS.map(preset => (
            <button key={preset.name} type="button"
              onClick={()=>{
                onUpdateField('primaryColor', preset.p);
                onUpdateField('secondaryColor', preset.s);
              }}
              style={{border:'2px solid transparent',borderRadius:10,padding:'6px 14px',cursor:'pointer',fontSize:12,fontWeight:600,color:'white',
                background:`linear-gradient(135deg,${preset.p},${preset.s})`,
                outline:(form.primaryColor===preset.p)?'3px solid #667eea':'none',
              }}>
              {preset.name}
            </button>
          ))}
        </div>
      </div>
      
      <button type="submit" className="btn-primary" disabled={saving}>
        {saving ? 'Guardando...' : '💾 Guardar diseño'}
      </button>
    </div>
  );
}

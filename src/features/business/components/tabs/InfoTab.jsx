import { Store } from 'lucide-react';

export default function InfoTab({ form, onUpdateField, onSubmit, saving }) {
  return (
    <div className="card">
      <h3 style={{fontSize:16,fontWeight:700,marginBottom:20,display:'flex',alignItems:'center',gap:8}}>
        <Store size={18} style={{color:'var(--primary)'}}/>  Información del negocio
      </h3>
      <div className="my-business-info-grid" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
        <div className="form-group" style={{gridColumn:'1/-1'}}>
          <label>Nombre del negocio *</label>
          <input type="text" value={form.name} onChange={e => onUpdateField('name', e.target.value)} required/>
        </div>
        <div className="form-group">
          <label>Teléfono</label>
          <input type="tel" value={form.phone} onChange={e => onUpdateField('phone', e.target.value)} placeholder="+57 300 000 0000"/>
        </div>
        <div className="form-group">
          <label>Dirección</label>
          <input type="text" value={form.address} onChange={e => onUpdateField('address', e.target.value)} placeholder="Calle 10 #5-30, Ciudad"/>
        </div>
        <div className="form-group" style={{gridColumn:'1/-1'}}>
          <label>Google Maps (URL de ubicación)</label>
          <input 
            type="text" 
            value={form.googleMapsUrl} 
            onChange={e => onUpdateField('googleMapsUrl', e.target.value)} 
            placeholder="https://www.google.com/maps/embed?pb=..."
          />
          <small style={{color:'var(--text-muted)'}}>
            Pega aquí la URL de Google Maps (modo embed) para mostrar el mapa en tu página pública. 
            <a href="https://www.google.com/maps" target="_blank" rel="noreferrer" style={{color:'var(--primary)'}}>Abrir Google Maps</a>
          </small>
        </div>
        <div className="form-group" style={{gridColumn:'1/-1'}}>
          <label>Descripción del negocio</label>
          <textarea value={form.description} onChange={e => onUpdateField('description', e.target.value)} rows={4} placeholder="Describe tu negocio, servicios especiales, experiencia..."/>
        </div>
        <div className="form-group" style={{gridColumn:'1/-1'}}>
          <label>Slogan / Tagline</label>
          <input type="text" value={form.tagline} onChange={e => onUpdateField('tagline', e.target.value)} placeholder="Tu estilo, nuestra pasión"/>
          <small style={{color:'var(--text-muted)'}}>Aparece debajo del nombre en tu página pública</small>
        </div>
        <div className="form-group">
          <label>Texto del botón de reserva</label>
          <input type="text" value={form.ctaText} onChange={e => onUpdateField('ctaText', e.target.value)} placeholder="Reservar cita ahora"/>
        </div>
        <div className="form-group">
          <label>Meta descripción (SEO)</label>
          <input type="text" value={form.metaDescription} onChange={e => onUpdateField('metaDescription', e.target.value)} placeholder="Descripción para buscadores..."/>
        </div>

      </div>

      <button type="submit" className="btn-primary" style={{ marginTop: 24 }} disabled={saving}>
        {saving ? 'Guardando...' : '💾 Guardar cambios'}
      </button>
    </div>
  );
}

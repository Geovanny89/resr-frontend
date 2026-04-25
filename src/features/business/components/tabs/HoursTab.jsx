import { Clock } from 'lucide-react';

export default function HoursTab({ 
  form, 
  onUpdateField, 
  onSubmit, 
  saving 
}) {
  return (
    <div className="card">
      <h3 style={{fontSize:16,fontWeight:700,marginBottom:8,display:'flex',alignItems:'center',gap:8}}>
        <Clock size={18} style={{color:'var(--primary)'}}/> Horario de atención
      </h3>
      <p style={{fontSize:13,color:'var(--text-muted)',marginBottom:16}}>
        Este texto aparece en el footer de tu página pública. Puedes escribirlo libremente.
      </p>
      <br/>
      <div className="form-group">
        <label>Horario (texto libre)</label>
        <textarea 
          value={form.businessHours} 
          onChange={e=>onUpdateField('businessHours', e.target.value)} 
          rows={4}
          placeholder="Lun-Vie: 9am - 7pm&#10;Sábado: 9am - 5pm&#10;Domingo: Cerrado"
        />
      </div>
      <button type="submit" className="btn-primary" disabled={saving}>
        {saving ? 'Guardando...' : '💾 Guardar horario'}
      </button>
    </div>
  );
}

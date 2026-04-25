import { Store, Image, Share2, Clock, CreditCard, Palette, Globe } from 'lucide-react';

const TABS = [
  { id: 'info',    icon: Store,   label: 'Información' },
  { id: 'branches', icon: Globe,  label: 'Sucursales' },
  { id: 'media',   icon: Image,   label: 'Logo & Banner' },
  { id: 'gallery', icon: Image,   label: 'Galería' },
  { id: 'social',  icon: Share2,  label: 'Redes Sociales' },
  { id: 'payments', icon: CreditCard, label: 'Métodos de Pago' },
  { id: 'mission-vision', icon: Store, label: 'Misión y Visión' },
  { id: 'design',  icon: Palette, label: 'Diseño' },
  { id: 'hours',   icon: Clock,   label: 'Horarios' },
  { id: 'modules', icon: Store,   label: 'Módulos' },
];

export default function TabNavigation({ activeTab, onChange, isBranch }) {
  return (
    <>
      {/* Selector (solo móvil) */}
      <div className="my-business-tab-select" style={{ display: 'none', marginBottom: 16 }}>
        <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6 }}>
          Sección
        </label>
        <select value={activeTab} onChange={(e) => onChange(e.target.value)}>
          {TABS
            .filter(t => t.id !== 'branches' || !isBranch)
            .map(t => (
            <option key={t.id} value={t.id}>{t.label}</option>
          ))}
        </select>
      </div>
      
      {/* Tabs */}
      <div className="my-business-tabs" style={{display:'flex',gap:4,background:'var(--bg-secondary)',borderRadius:12,padding:4,marginBottom:24,flexWrap:'wrap'}}>
        {TABS
          .filter(t => t.id !== 'branches' || !isBranch)
          .map(t => {
          const Icon = t.icon;
          return (
            <button key={t.id} onClick={()=>onChange(t.id)}
              style={{display:'flex',alignItems:'center',gap:6,padding:'8px 16px',borderRadius:8,border:'none',cursor:'pointer',fontSize:13,fontWeight:600,transition:'all 0.2s',
                background:activeTab===t.id?'white':'transparent',
                color:activeTab===t.id?'var(--primary)':'var(--text-muted)',
                boxShadow:activeTab===t.id?'0 2px 8px rgba(0,0,0,0.1)':'none',
              }}>
              <Icon size={14}/> {t.label}
            </button>
          );
        })}
      </div>
    </>
  );
}

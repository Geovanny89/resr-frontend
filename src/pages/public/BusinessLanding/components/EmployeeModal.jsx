import { X } from 'lucide-react';
import { getImgUrl } from '../utils';

export default function EmployeeModal({ emp, onClose, primary, secondary, navigate, slug }) {
  if (!emp) return null;

  const isDark = document.querySelector('.landing-root.dark') !== null;
  
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="employee-modal-content" 
        onClick={e => e.stopPropagation()}
        style={{
          background: isDark ? '#1e293b' : 'white',
          border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.08)'
        }}
      >
        <button onClick={onClose} className="modal-close-btn-alt">
          <X size={20} />
        </button>
        
        <div className="employee-modal-header">
          {emp.photoUrl ? (
            <img src={getImgUrl(emp.photoUrl)} alt={emp.User?.name} className="employee-modal-img" />
          ) : (
            <div className="employee-modal-avatar-placeholder" style={{ backgroundColor: `${primary}20`, color: primary }}>
              {emp.User?.name?.charAt(0)}
            </div>
          )}
          <div className="employee-modal-header-overlay" />
          <div className="employee-modal-info">
            <h3 className="employee-modal-name">{emp.User?.name}</h3>
            <div className="employee-modal-badge" style={{ backgroundColor: primary }}>
              {emp.specialty || (emp.isManager ? 'Administrador' : 'Especialista')}
            </div>
          </div>
        </div>
        
        <div className="employee-modal-body" style={{ color: isDark ? '#f1f5f9' : '#0f172a' }}>
          {emp.description && (
            <>
              <h4 className="employee-modal-section-title" style={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}>Sobre mí</h4>
              <p className="employee-modal-description" style={{ color: isDark ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.85)' }}>
                {emp.description}
              </p>
            </>
          )}
          
          <button 
            className="employee-modal-cta"
            style={{ background: `linear-gradient(135deg, ${primary}, ${secondary})`, boxShadow: `0 10px 20px ${primary}30` }}
            onClick={() => {
              onClose();
              navigate(`/${slug}/book?employeeId=${emp.id}`);
            }}
          >
            Reservar con {emp.User?.name?.split(' ')[0] || (emp.specialty || 'especialista')}
          </button>
        </div>
      </div>
    </div>
  );
}

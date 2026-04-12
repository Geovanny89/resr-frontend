import { useAuth } from '../context/AuthContext';
import { Store, ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

export default function BranchSelector() {
  const { business, mainBusiness, branches, switchBusiness } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Cerrar al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Solo mostrar si hay sucursales
  if (!branches || branches.length === 0) return null;

  const handleSwitch = (id) => {
    switchBusiness(id);
    setIsOpen(false);
  };

  const activeIsMain = business?.id === mainBusiness?.id;

  return (
    <div className="branch-selector-container" ref={dropdownRef} style={{ position: 'relative' }}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="branch-selector-btn"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '6px 12px',
          borderRadius: 8,
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          cursor: 'pointer',
          color: 'var(--text)',
          fontSize: 13,
          fontWeight: 600,
          transition: 'all 0.2s'
        }}
      >
        <Store size={16} style={{ color: 'var(--primary)' }} />
        <span style={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {business?.name || 'Seleccionar Sede'}
        </span>
        <ChevronDown size={14} style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
      </button>

      {isOpen && (
        <div 
          className="branch-dropdown"
          style={{
            position: 'absolute',
            top: 'calc(100% + 5px)',
            right: 0,
            width: 220,
            background: 'var(--surface)',
            borderRadius: 10,
            boxShadow: 'var(--shadow-lg)',
            border: '1px solid var(--border)',
            zIndex: 1000,
            overflow: 'hidden',
            padding: 4
          }}
        >
          <div style={{ padding: '8px 12px', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Sede Principal
          </div>
          <button
            onClick={() => handleSwitch(mainBusiness.id)}
            style={{
              width: '100%',
              textAlign: 'left',
              padding: '10px 12px',
              background: activeIsMain ? 'var(--primary-bg)' : 'transparent',
              color: activeIsMain ? 'var(--primary)' : 'var(--text)',
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: activeIsMain ? 700 : 500,
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}
          >
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: activeIsMain ? 'var(--primary)' : '#cbd5e1' }} />
            {mainBusiness?.name}
          </button>

          <div style={{ padding: '12px 12px 8px', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Sucursales
          </div>
          {branches.map(branch => {
            const isActive = business?.id === branch.id;
            return (
              <button
                key={branch.id}
                onClick={() => handleSwitch(branch.id)}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '10px 12px',
                  background: isActive ? 'var(--primary-bg)' : 'transparent',
                  color: isActive ? 'var(--primary)' : 'var(--text)',
                  border: 'none',
                  borderRadius: 6,
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: isActive ? 700 : 500,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8
                }}
              >
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: isActive ? 'var(--primary)' : '#cbd5e1' }} />
                {branch.name}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

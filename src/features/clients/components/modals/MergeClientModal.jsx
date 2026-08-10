import { useState, useMemo, useEffect, useRef } from 'react';
import { GitMerge, X, AlertTriangle, Search } from 'lucide-react';

/**
 * Modal para fusionar/eliminar un cliente duplicado.
 * Las citas se conservan y pasan al cliente destino.
 */
export function MergeClientModal({ client, clients = [], colors, onClose, onMerge }) {
  const [search, setSearch] = useState('');
  const [targetKey, setTargetKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showList, setShowList] = useState(false);
  const searchRef = useRef(null);
  const listRef = useRef(null);

  const clientKey = (c) => {
    if (c.phone) return `p:${String(c.phone).replace(/\D/g, '').slice(-10)}`;
    if (c.email) return `e:${String(c.email).toLowerCase().trim()}`;
    if (c.name) return `n:${String(c.name).trim().toLowerCase()}`;
    return '';
  };

  const sourceKey = clientKey(client);

  const options = useMemo(() => {
    return (clients || [])
      .filter(c => clientKey(c) && clientKey(c) !== sourceKey)
      .sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  }, [clients, sourceKey]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return options.slice(0, 40);
    return options.filter(c => {
      const name = (c.name || '').toLowerCase();
      const phone = (c.phone || '').toLowerCase();
      const email = (c.email || '').toLowerCase();
      return name.includes(q) || phone.includes(q) || email.includes(q);
    }).slice(0, 40);
  }, [options, search]);

  const selected = options.find(c => clientKey(c) === targetKey);

  useEffect(() => {
    const onDocClick = (e) => {
      if (
        listRef.current && !listRef.current.contains(e.target) &&
        searchRef.current && !searchRef.current.contains(e.target)
      ) {
        setShowList(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  if (!client) return null;

  const handleSelect = (c) => {
    setTargetKey(clientKey(c));
    setSearch(c.name || c.phone || c.email || '');
    setShowList(false);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!selected) {
      setError('Selecciona el cliente que se conservará');
      return;
    }
    setLoading(true);
    const result = await onMerge(
      { name: client.name, phone: client.phone, email: client.email },
      { name: selected.name, phone: selected.phone, email: selected.email }
    );
    setLoading(false);
    if (result.success) {
      onClose();
    } else {
      setError(result.error || 'No se pudo fusionar el cliente');
    }
  };

  const labelOf = (c) => {
    const parts = [c.name || 'Sin nombre'];
    if (c.phone) parts.push(c.phone);
    if (c.email) parts.push(c.email);
    parts.push(`${c.totalAppointments || 0} citas`);
    return parts;
  };

  return (
    <div
      className="modal-overlay"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: 20
      }}
    >
      <div
        className="modal"
        onClick={e => e.stopPropagation()}
        style={{ maxWidth: 480, width: '100%', background: colors?.cardBg || '#fff', borderRadius: 16 }}
      >
        <div style={{
          padding: '20px 24px',
          background: '#dc2626',
          color: 'white',
          borderRadius: '16px 16px 0 0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
            <GitMerge size={20} />
            Eliminar duplicado
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            style={{
              background: 'rgba(255,255,255,0.25)',
              color: '#ffffff',
              border: '1px solid rgba(255,255,255,0.5)',
              borderRadius: '50%',
              width: 36,
              height: 36,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              padding: 0,
              lineHeight: 1
            }}
          >
            <X size={20} color="#ffffff" strokeWidth={2.5} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: 24 }}>
          <div style={{
            background: '#fef3c7',
            border: '1px solid #f59e0b',
            borderRadius: 10,
            padding: 12,
            marginBottom: 16,
            display: 'flex',
            gap: 10,
            fontSize: 13,
            color: '#92400e'
          }}>
            <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: 2 }} />
            <div>
              Las citas de <strong>{client.name || 'este cliente'}</strong>
              {client.phone ? ` (${client.phone})` : ''} se conservan y se unen al cliente que elijas.
              El duplicado desaparece de la lista.
            </div>
          </div>

          <div style={{ marginBottom: 16, fontSize: 14, color: colors?.text || '#111' }}>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>Cliente a eliminar</div>
            <div style={{ color: colors?.textSecondary || '#666' }}>
              {client.name || 'Sin nombre'}
              {client.phone ? ` · ${client.phone}` : ''}
              {client.email ? ` · ${client.email}` : ''}
              {!client.phone && !client.email ? ' · Sin contacto' : ''}
              {' · '}{client.totalAppointments || 0} cita(s)
            </div>
          </div>

          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8, color: colors?.text || '#111' }}>
            Buscar cliente a conservar
          </label>

          <div style={{ position: 'relative', marginBottom: 8 }} ref={searchRef}>
            <Search
              size={16}
              style={{
                position: 'absolute',
                left: 12,
                top: '50%',
                transform: 'translateY(-50%)',
                color: colors?.textSecondary || '#9ca3af',
                pointerEvents: 'none'
              }}
            />
            <input
              type="text"
              value={search}
              placeholder="Escribe nombre, teléfono o email..."
              autoComplete="off"
              onFocus={() => setShowList(true)}
              onChange={(e) => {
                setSearch(e.target.value);
                setShowList(true);
                // Si cambia el texto y no coincide con el seleccionado, limpia selección
                if (selected) {
                  const selLabel = selected.name || selected.phone || selected.email || '';
                  if (e.target.value !== selLabel) setTargetKey('');
                }
              }}
              style={{
                width: '100%',
                padding: '12px 14px 12px 38px',
                borderRadius: 10,
                border: `1.5px solid ${selected ? '#10b981' : (colors?.border || '#e5e7eb')}`,
                background: colors?.inputBg || '#fff',
                color: colors?.text || '#111',
                fontSize: 14,
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />

            {showList && (
              <div
                ref={listRef}
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  top: 'calc(100% + 4px)',
                  maxHeight: 240,
                  overflowY: 'auto',
                  background: colors?.cardBg || '#fff',
                  border: `1px solid ${colors?.border || '#e5e7eb'}`,
                  borderRadius: 10,
                  boxShadow: '0 10px 25px rgba(0,0,0,0.12)',
                  zIndex: 20
                }}
              >
                {filtered.length === 0 ? (
                  <div style={{ padding: 14, fontSize: 13, color: colors?.textSecondary || '#666' }}>
                    {search.trim() ? 'Sin resultados' : 'Escribe para buscar entre tus clientes'}
                  </div>
                ) : (
                  filtered.map(c => {
                    const key = clientKey(c);
                    const isActive = key === targetKey;
                    const [name, ...rest] = labelOf(c);
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => handleSelect(c)}
                        style={{
                          width: '100%',
                          textAlign: 'left',
                          padding: '10px 14px',
                          border: 'none',
                          borderBottom: `1px solid ${colors?.border || '#f3f4f6'}`,
                          background: isActive ? `${colors?.primary || '#667eea'}12` : 'transparent',
                          cursor: 'pointer',
                          color: colors?.text || '#111'
                        }}
                      >
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{name}</div>
                        <div style={{ fontSize: 12, color: colors?.textSecondary || '#6b7280', marginTop: 2 }}>
                          {rest.join(' · ')}
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            )}
          </div>

          {selected && (
            <div style={{
              fontSize: 12,
              color: '#065f46',
              background: '#ecfdf5',
              border: '1px solid #a7f3d0',
              borderRadius: 8,
              padding: '8px 10px',
              marginBottom: 8
            }}>
              Seleccionado: <strong>{selected.name || 'Sin nombre'}</strong>
              {selected.phone ? ` · ${selected.phone}` : ''}
            </div>
          )}

          {error && (
            <div style={{ color: '#dc2626', fontSize: 13, marginBottom: 12 }}>{error}</div>
          )}

          <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                padding: 12,
                borderRadius: 10,
                border: `1px solid ${colors?.border || '#e5e7eb'}`,
                background: 'transparent',
                color: colors?.textSecondary || '#666',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !targetKey}
              style={{
                flex: 2,
                padding: 12,
                borderRadius: 10,
                border: 'none',
                background: '#dc2626',
                color: 'white',
                fontWeight: 700,
                cursor: loading || !targetKey ? 'not-allowed' : 'pointer',
                opacity: loading || !targetKey ? 0.7 : 1
              }}
            >
              {loading ? 'Fusionando...' : 'Fusionar y eliminar duplicado'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default MergeClientModal;

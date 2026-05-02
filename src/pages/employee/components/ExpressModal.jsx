import { useState, useEffect } from 'react';
import api from '../../../api/client';

export const ExpressModal = ({ show, colors, expressForm, setExpressForm, services, business, completing, onClose, onSubmit }) => {
  const [clients, setClients] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredClients, setFilteredClients] = useState([]);
  const [serviceSearch, setServiceSearch] = useState('');
  const [extraSearch, setExtraSearch] = useState('');
  const [showServiceList, setShowServiceList] = useState(false);
  const [showExtraList, setShowExtraList] = useState(false);

  // Cargar clientes al abrir el modal
  useEffect(() => {
    if (show && business?.id) {
      const loadClients = async () => {
        try {
          const res = await api.get(`/appointments/clients?businessId=${business.id}`);
          setClients(res.data.clients || []);
        } catch (e) {
          console.error('Error cargando clientes:', e);
        }
      };
      loadClients();
    }
  }, [show, business?.id]);

  if (!show) return null;

  const handleClientNameChange = (val) => {
    setExpressForm({ ...expressForm, clientName: val });
    if (val.length > 1) {
      const filtered = clients.filter(c => 
        c.name.toLowerCase().includes(val.toLowerCase()) || 
        (c.phone && c.phone.includes(val))
      ).slice(0, 5);
      setFilteredClients(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setShowSuggestions(false);
    }
  };

  const selectClient = (client) => {
    setExpressForm({
      ...expressForm,
      clientName: client.name,
      clientPhone: client.phone || '',
      address: client.address || expressForm.address || ''
    });
    setShowSuggestions(false);
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', 
      zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16
    }}>
      <div style={{
        background: colors.cardBg, padding: 24, borderRadius: 16, 
        maxWidth: 400, width: '100%', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
        border: `1px solid ${colors.border}`
      }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: colors.text, marginBottom: 8 }}>⚡ Cita Express</h2>
        <p style={{ fontSize: 14, color: colors.textSecondary, marginBottom: 20 }}>
          Registra un cliente que acaba de llegar para atenderlo de inmediato.
        </p>

        {/* BUSCADOR DE CLIENTE FRECUENTE */}
        <div style={{ marginBottom: 20, position: 'relative', padding: '10px', background: colors.bgSecondary, borderRadius: 8, border: `1px dashed ${colors.border}` }}>
          <label style={{ display: 'block', marginBottom: 4, fontWeight: 700, fontSize: 12, color: '#f59e0b' }}>🔍 ¿Cliente frecuente?</label>
          <input
            type="text"
            value={expressForm.clientName}
            onChange={(e) => handleClientNameChange(e.target.value)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            onFocus={() => expressForm.clientName.length > 1 && setShowSuggestions(filteredClients.length > 0)}
            placeholder="Buscar por nombre o cel..."
            autoComplete="off"
            style={{ width: '100%', padding: '10px', borderRadius: 8, border: `2px solid #f59e0b`, background: colors.inputBg, color: colors.text }}
          />
          
          {showSuggestions && (
            <div style={{
              position: 'absolute', top: '100%', left: 10, right: 10, 
              background: colors.cardBg, border: `1px solid ${colors.border}`,
              borderRadius: '0 0 8px 8px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
              zIndex: 100, maxHeight: 150, overflowY: 'auto'
            }}>
              {filteredClients.map((c, i) => (
                <div
                  key={i}
                  onClick={() => selectClient(c)}
                  style={{
                    padding: '10px', cursor: 'pointer', borderBottom: i < filteredClients.length - 1 ? `1px solid ${colors.border}` : 'none',
                    display: 'flex', flexDirection: 'column', gap: 2
                  }}
                >
                  <span style={{ fontWeight: 600, fontSize: 13, color: colors.text }}>{c.name}</span>
                  {c.phone && <span style={{ fontSize: 11, color: colors.textSecondary }}>📱 {c.phone}</span>}
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: colors.text }}>Nombre del Cliente</label>
          <input 
            type="text"
            value={expressForm.clientName}
            onChange={e => setExpressForm({ ...expressForm, clientName: e.target.value })}
            placeholder="Nombre completo"
            style={{ width: '100%', padding: '10px', borderRadius: 8, border: `1px solid ${colors.border}`, background: colors.inputBg, color: colors.text }}
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: colors.text }}>Teléfono del Cliente</label>
          <input 
            type="tel"
            value={expressForm.clientPhone}
            onChange={e => setExpressForm({ ...expressForm, clientPhone: e.target.value })}
            placeholder="Ej: 3001234567"
            style={{ width: '100%', padding: '10px', borderRadius: 8, border: `1px solid ${colors.border}`, background: colors.inputBg, color: colors.text }}
          />
        </div>

        {business?.hasFieldTechnicians && (
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: colors.text }}>
              📍 Dirección *
            </label>
            <input 
              type="text"
              value={expressForm.address}
              onChange={e => setExpressForm({ ...expressForm, address: e.target.value })}
              placeholder="Calle 123 # 45-67, Barrio, Ciudad"
              style={{ width: '100%', padding: '10px', borderRadius: 8, border: `1px solid ${colors.border}`, background: colors.inputBg, color: colors.text }}
            />
            <div style={{ fontSize: 12, color: colors.textSecondary, marginTop: 4 }}>
              Dirección donde se prestará el servicio
            </div>
          </div>
        )}

        {/* Servicio Principal con Buscador */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: colors.text }}>Servicio Principal</label>
          <div style={{ position: 'relative' }}>
            <div 
              onClick={() => setShowServiceList(!showServiceList)}
              style={{ 
                width: '100%', padding: '10px 12px', border: `1px solid ${colors.border}`, 
                borderRadius: 8, fontSize: 14, background: colors.inputBg, color: colors.text,
                cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
              }}
            >
              <span style={{ opacity: !expressForm.serviceId && !serviceSearch ? 0.6 : 1 }}>
                {serviceSearch || (expressForm.serviceId ? services.find(s => s.id === expressForm.serviceId)?.name : 'Selecciona un servicio...')}
              </span>
              <span style={{ fontSize: 12, opacity: 0.5 }}>▼</span>
            </div>

            {showServiceList && (
              <div style={{
                position: 'absolute', top: '100%', left: 0, right: 0, 
                background: colors.cardBg, border: `1px solid ${colors.border}`,
                borderRadius: 8, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                zIndex: 110, marginTop: 4, overflow: 'hidden'
              }}>
                <div style={{ padding: '8px', borderBottom: `1px solid ${colors.border}`, background: colors.bgSecondary }}>
                  <input
                    autoFocus
                    type="text"
                    placeholder="Buscar servicio..."
                    value={serviceSearch}
                    onChange={(e) => setServiceSearch(e.target.value)}
                    style={{ 
                      width: '100%', padding: '6px 10px', border: `1px solid ${colors.border}`, 
                      borderRadius: 4, fontSize: 13, background: colors.cardBg, color: colors.text 
                    }}
                  />
                </div>
                <div style={{ maxHeight: 200, overflowY: 'auto' }}>
                  {services
                    .filter(s => s.name.toLowerCase().includes(serviceSearch.toLowerCase()))
                    .map(s => (
                      <div
                        key={s.id}
                        onClick={() => {
                          setExpressForm({ ...expressForm, serviceId: s.id });
                          setServiceSearch('');
                          setShowServiceList(false);
                        }}
                        style={{ 
                          padding: '10px 12px', cursor: 'pointer', borderBottom: `1px solid ${colors.border}`,
                          background: expressForm.serviceId === s.id ? colors.bgSecondary : 'transparent'
                        }}
                      >
                        <div style={{ fontWeight: 600, fontSize: 14, color: colors.text }}>{s.name}</div>
                        <div style={{ fontSize: 12, color: colors.textSecondary }}>{s.durationMin} min</div>
                      </div>
                    ))
                  }
                </div>
              </div>
            )}
            
            {/* Click outside to close */}
            {showServiceList && (
              <div 
                onClick={() => setShowServiceList(false)}
                style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 109 }} 
              />
            )}
          </div>
        </div>

        {/* Servicios Adicionales */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: colors.text }}>
            ➕ ¿Agregar más servicios?
          </label>
          
          {/* Lista de extras seleccionados */}
          {expressForm.extraServices?.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
              {expressForm.extraServices.map(s => (
                <div key={s.serviceId} style={{ 
                  background: '#dbeafe', color: '#1e40af', padding: '4px 10px', 
                  borderRadius: 16, fontSize: 12, display: 'flex', alignItems: 'center', gap: 6,
                  border: '1px solid #bfdbfe'
                }}>
                  <span>{s.name}</span>
                  <span 
                    style={{ cursor: 'pointer', fontWeight: 700 }} 
                    onClick={() => setExpressForm({ ...expressForm, extraServices: expressForm.extraServices.filter(x => x.serviceId !== s.serviceId) })}
                  >
                    ✕
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Buscador de extras simple */}
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="Añadir otro servicio..."
              value={extraSearch}
              onFocus={() => setShowExtraList(true)}
              onChange={(e) => setExtraSearch(e.target.value)}
              style={{ width: '100%', padding: '8px 10px', border: `1px dashed ${colors.border}`, borderRadius: 8, fontSize: 13, background: colors.inputBg, color: colors.text }}
            />
            {showExtraList && extraSearch && (
              <div style={{
                position: 'absolute', bottom: '100%', left: 0, right: 0, 
                background: colors.cardBg, border: `1px solid ${colors.border}`,
                borderRadius: 8, boxShadow: '0 -4px 6px -1px rgba(0,0,0,0.1)',
                zIndex: 110, maxHeight: 150, overflowY: 'auto'
              }}>
                {services
                  .filter(s => s.name.toLowerCase().includes(extraSearch.toLowerCase()))
                  .filter(s => s.id !== expressForm.serviceId && !expressForm.extraServices?.find(x => x.serviceId === s.id))
                  .map(s => (
                    <div
                      key={s.id}
                      onClick={() => {
                        const newExtras = [...(expressForm.extraServices || []), { serviceId: s.id, name: s.name, price: s.price, durationMin: s.durationMin }];
                        setExpressForm({ ...expressForm, extraServices: newExtras });
                        setExtraSearch('');
                        setShowExtraList(false);
                      }}
                      style={{ padding: '8px 12px', cursor: 'pointer', borderBottom: `1px solid ${colors.border}` }}
                    >
                      <span style={{ fontSize: 13, color: colors.text }}>{s.name}</span>
                    </div>
                  ))
                }
              </div>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button 
            onClick={onClose}
            style={{ flex: 1, padding: '12px', borderRadius: 8, border: 'none', background: colors.bgSecondary, color: colors.text, fontWeight: 600, cursor: 'pointer' }}
          >
            Cancelar
          </button>
          <button 
            onClick={onSubmit}
            disabled={completing}
            style={{ flex: 1, padding: '12px', borderRadius: 8, border: 'none', background: '#f59e0b', color: 'white', fontWeight: 700, cursor: 'pointer' }}
          >
            {completing ? 'Cargando...' : 'Atender Ya'}
          </button>
        </div>
      </div>
    </div>
  );
};

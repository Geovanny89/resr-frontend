import { useState, useEffect } from 'react';
import api from '../../../api/client';

export const ExpressModal = ({ show, colors, expressForm, setExpressForm, services, business, completing, onClose, onSubmit }) => {
  const [clients, setClients] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredClients, setFilteredClients] = useState([]);

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

        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: colors.text }}>Servicio</label>
          <select 
            value={expressForm.serviceId}
            onChange={e => setExpressForm({ ...expressForm, serviceId: e.target.value })}
            style={{ width: '100%', padding: '10px', borderRadius: 8, border: `1px solid ${colors.border}`, background: colors.inputBg, color: colors.text }}
          >
            <option value="">Selecciona un servicio</option>
            {services.map(s => (
              <option key={s.id} value={s.id}>{s.name} ({s.durationMin} min)</option>
            ))}
          </select>
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

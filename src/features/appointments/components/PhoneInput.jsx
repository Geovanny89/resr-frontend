/**
 * Componente reutilizable: Input de teléfono con selector de prefijo de país.
 * Guarda el número completo en formato: +57XXXXXXXXXX
 */

const COUNTRY_CODES = [
  { iso: 'co', label: 'Colombia',    code: '+57'  },
  { iso: 've', label: 'Venezuela',   code: '+58'  },
  { iso: 'mx', label: 'México',      code: '+52'  },
  { iso: 'us', label: 'EEUU/Canadá', code: '+1'   },
  { iso: 'ar', label: 'Argentina',   code: '+54'  },
  { iso: 'br', label: 'Brasil',      code: '+55'  },
  { iso: 'ec', label: 'Ecuador',     code: '+593' },
  { iso: 'pe', label: 'Perú',        code: '+51'  },
  { iso: 'cl', label: 'Chile',       code: '+56'  },
  { iso: 'py', label: 'Paraguay',    code: '+595' },
  { iso: 'uy', label: 'Uruguay',     code: '+598' },
  { iso: 'bo', label: 'Bolivia',     code: '+591' },
  { iso: 'pa', label: 'Panamá',      code: '+507' },
  { iso: 'cr', label: 'Costa Rica',  code: '+506' },
];

function parsePhone(value = '') {
  if (!value) return { countryCode: '+57', localNumber: '' };
  const clean = value.replace(/[\s\-\(\)]/g, '');
  const sorted = [...COUNTRY_CODES].sort((a, b) => b.code.length - a.code.length);
  for (const c of sorted) {
    if (clean.startsWith(c.code)) {
      return { countryCode: c.code, localNumber: clean.slice(c.code.length) };
    }
  }
  return { countryCode: '+57', localNumber: clean.replace(/^\+/, '') };
}

export function PhoneInput({ value, onChange, colors, placeholder = 'Número de teléfono' }) {
  const { countryCode, localNumber } = parsePhone(value);
  const currentCountry = COUNTRY_CODES.find(c => c.code === countryCode) || COUNTRY_CODES[0];

  const handleCodeChange = (e) => {
    const newCode = e.target.value;
    onChange(newCode + localNumber);
  };

  const handleNumberChange = (e) => {
    let raw = e.target.value;
    if (raw.startsWith('+')) {
      const parsed = parsePhone(raw);
      onChange(parsed.countryCode + parsed.localNumber);
      return;
    }
    const digits = raw.replace(/\D/g, '');
    onChange(countryCode + digits);
  };

  const containerStyle = {
    display: 'flex',
    alignItems: 'stretch',
    borderRadius: 12,
    border: `1.5px solid ${colors?.border || '#e2e8f0'}`,
    background: colors?.inputBg || 'white',
    overflow: 'hidden',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
  };

  return (
    <div className="phone-input-container" style={containerStyle}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        background: colors?.bgSecondary || '#f8fafc',
        borderRight: `1.5px solid ${colors?.border || '#e2e8f0'}`,
        padding: '0 10px',
        position: 'relative',
        minWidth: 100,
      }}>
        {/* Bandera con imagen real (FlagCDN) */}
        <img 
          src={`https://flagcdn.com/w20/${currentCountry.iso}.png`}
          alt={currentCountry.label}
          style={{ width: 20, height: 'auto', borderRadius: 2, marginRight: 6 }}
        />
        <select
          value={countryCode}
          onChange={handleCodeChange}
          style={{
            appearance: 'none',
            background: 'transparent',
            border: 'none',
            padding: '10px 18px 10px 2px',
            fontSize: 14,
            fontWeight: 600,
            color: colors?.text || '#334155',
            cursor: 'pointer',
            outline: 'none',
            margin: 0,
            width: '100%',
          }}
        >
          {COUNTRY_CODES.map((c) => (
            <option key={c.iso} value={c.code}>
               {c.code}
            </option>
          ))}
        </select>
        <div style={{
          position: 'absolute',
          right: 10,
          pointerEvents: 'none',
          fontSize: 10,
          color: colors?.textSecondary || '#94a3b8'
        }}>
          ▼
        </div>
      </div>

      <input
        type="tel"
        value={localNumber}
        onChange={handleNumberChange}
        placeholder={placeholder}
        inputMode="numeric"
        style={{
          flex: 1,
          padding: '12px 16px',
          border: 'none',
          background: 'transparent',
          color: colors?.text || '#1e293b',
          fontSize: 15,
          fontWeight: 500,
          outline: 'none',
          width: '100%',
        }}
        onFocus={(e) => {
          e.target.parentElement.style.borderColor = 'var(--primary)';
          e.target.parentElement.style.boxShadow = '0 0 0 3px rgba(var(--primary-rgb, 79, 70, 229), 0.1)';
        }}
        onBlur={(e) => {
          e.target.parentElement.style.borderColor = colors?.border || '#e2e8f0';
          e.target.parentElement.style.boxShadow = '0 1px 2px rgba(0,0,0,0.05)';
        }}
      />
    </div>
  );
}

export default PhoneInput;

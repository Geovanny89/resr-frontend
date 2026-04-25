const EMPLOYEES_PER_PAGE = 8;

function getImgUrl(url, api) {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const FALLBACK_BACKEND_URL = isLocal ? 'http://localhost:4000' : 'https://api-reservas.k-dice.com';
  const cleanUrl = url.startsWith('/') ? url : `/${url}`;
  const base = (api.defaults.baseURL && !api.defaults.baseURL.startsWith('/'))
    ? api.defaults.baseURL.replace('/api', '')
    : FALLBACK_BACKEND_URL;
  return `${base}${cleanUrl}`;
}

export default function EmployeeStep({
  business,
  selected,
  setSelected,
  setStep,
  employeesPage,
  setEmployeesPage,
  colors,
  primary,
  api,
}) {
  const allEmployees = business?.Employees || [];
  const serviceId = selected.service?.id;

  const employees = allEmployees.filter(emp => {
    if (!emp.Services) return false;
    if (emp.Services.length === 0) return true;
    return emp.Services.some(s => s.id === serviceId);
  });

  const totalPages = Math.ceil(employees.length / EMPLOYEES_PER_PAGE);
  const startIndex = (employeesPage - 1) * EMPLOYEES_PER_PAGE;
  const paginatedEmployees = employees.slice(startIndex, startIndex + EMPLOYEES_PER_PAGE);

  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 800, color: colors.text, marginBottom: 4 }}>¿Con quién quieres tu cita?</h2>
      <p style={{ fontSize: 13, color: colors.textSecondary, marginBottom: 20 }}>
        Servicio: <strong>{selected.service?.name}</strong>
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12, marginBottom: 20 }}>
        {/* Cualquier disponible */}
        {employees.length > 1 && (
          <div
            className="book-emp"
            onClick={() => { setSelected(s => ({ ...s, employee: null })); setStep(2); }}
            style={{
              background: colors.cardBg,
              borderRadius: 14,
              padding: '20px 12px',
              textAlign: 'center',
              border: `2px solid ${colors.border}`,
              cursor: 'pointer',
              boxShadow: `0 1px 4px ${colors.shadow}`,
              transition: 'all 0.15s',
            }}
          >
            <img src="/kdice.png" alt="KDice" style={{ width: 40, height: 40, marginBottom: 8, objectFit: 'cover', borderRadius: '50%' }} />
            <div style={{ fontWeight: 700, fontSize: 13, color: colors.text }}>Cualquier disponible</div>
            <div style={{ fontSize: 11, color: colors.textSecondary, marginTop: 4 }}>Ver todos los horarios</div>
          </div>
        )}

        {paginatedEmployees.map(emp => (
          <div
            key={emp.id}
            className="book-emp"
            onClick={() => { setSelected(s => ({ ...s, employee: emp })); setStep(2); }}
            style={{
              background: selected.employee?.id === emp.id ? '#eef2ff' : colors.cardBg,
              borderRadius: 14,
              padding: '20px 12px',
              textAlign: 'center',
              border: `2px solid ${selected.employee?.id === emp.id ? primary : colors.border}`,
              cursor: 'pointer',
              boxShadow: `0 1px 4px ${colors.shadow}`,
              transition: 'all 0.15s',
            }}
          >
            <div style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: '#eef2ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 10px',
              overflow: 'hidden',
              border: `2px solid ${colors.border}`,
            }}>
              {emp.photoUrl
                ? <img src={getImgUrl(emp.photoUrl, api)} alt={emp.User?.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <span style={{ fontSize: 24 }}>👤</span>
              }
            </div>
            <div style={{ fontWeight: 700, fontSize: 13, color: colors.text }}>{emp.User?.name}</div>
            {emp.specialty && (
              <div style={{ fontSize: 10, color: primary, marginTop: 2, fontWeight: 600 }}>
                {emp.specialty}
              </div>
            )}
            {emp.Services && emp.Services.length > 0 && (
              <div style={{
                fontSize: 9,
                color: colors.textSecondary,
                marginTop: 4,
                lineHeight: 1.3,
                display: '-webkit-box',
                WebkitLineClamp: 1,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}>
                {emp.Services.slice(0, 3).map(s => s.name).join(', ')}
                {emp.Services.length > 3 && ` +${emp.Services.length - 3} más`}
              </div>
            )}
            {emp.description && !emp.Services?.length && (
              <div style={{
                fontSize: 10,
                color: colors.textSecondary,
                marginTop: 4,
                lineHeight: 1.2,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                fontStyle: 'italic'
              }}>
                {emp.description}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Sin empleados */}
      {employees.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '40px 20px',
          background: colors.bg,
          borderRadius: 12,
          border: `1px dashed ${colors.border}`
        }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>👤</div>
          <p style={{ color: colors.text, fontWeight: 600, marginBottom: 8 }}>No hay especialistas disponibles</p>
          <p style={{ color: colors.textSecondary, fontSize: 13 }}>
            Ningún empleado tiene asignado este servicio.<br />
            Contacta al negocio para más información.
          </p>
        </div>
      )}

      {/* Paginación */}
      {employees.length > EMPLOYEES_PER_PAGE && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, marginBottom: 20, padding: '12px' }}>
          <button
            onClick={() => setEmployeesPage(p => Math.max(1, p - 1))}
            disabled={employeesPage === 1}
            style={{
              padding: '8px 12px',
              borderRadius: 8,
              border: 'none',
              background: employeesPage === 1 ? colors.bgSecondary : primary,
              color: employeesPage === 1 ? colors.textSecondary : 'white',
              cursor: employeesPage === 1 ? 'not-allowed' : 'pointer',
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            ‹ Anterior
          </button>
          <span style={{ fontSize: 14, fontWeight: 600, color: colors.text }}>
            {employeesPage} / {totalPages}
          </span>
          <button
            onClick={() => setEmployeesPage(p => Math.min(totalPages, p + 1))}
            disabled={employeesPage === totalPages}
            style={{
              padding: '8px 12px',
              borderRadius: 8,
              border: 'none',
              background: employeesPage === totalPages ? colors.bgSecondary : primary,
              color: employeesPage === totalPages ? colors.textSecondary : 'white',
              cursor: employeesPage === totalPages ? 'not-allowed' : 'pointer',
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            Siguiente ›
          </button>
        </div>
      )}

      <button
        onClick={() => setStep(0)}
        style={{ background: colors.bgSecondary, color: colors.text, border: 'none', borderRadius: 8, padding: '8px 16px', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}
      >
        ← Cambiar servicio
      </button>
    </div>
  );
}

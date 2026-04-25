import { getImgUrl } from '../utils';

export default function TeamSection({ business, primary, setEmployeeModal }) {
  if (!business.Employees || business.Employees.length === 0) return null;

  return (
    <section style={{ marginBottom: 100 }}>
      <div className="section-header">
        <span className="section-label">NUESTRO EQUIPO</span>
        <h2 className="section-title" style={{ color: business.isDark ? 'white' : '#0f172a' }}>
          Especialistas a tu Servicio
        </h2>
      </div>
      <div className="team-grid">
        {business.Employees.map(emp => (
          <div 
            key={emp.id} 
            className="team-member-card" 
            onClick={() => setEmployeeModal(emp)}
            style={{
              backgroundColor: business.isDark ? '#1e293b' : '#ffffff',
              border: business.isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.08)',
              boxShadow: business.isDark ? '0 20px 50px -12px rgba(0,0,0,0.4)' : '0 20px 50px -12px rgba(0,0,0,0.08)'
            }}
          >
            <div className="team-avatar-container">
              {emp.photoUrl ? (
                <img src={getImgUrl(emp.photoUrl)} alt={emp.User?.name} className="team-avatar-img" />
              ) : (
                <div className="team-avatar-img" style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  fontSize: 48, 
                  background: `${primary}10`, 
                  color: primary 
                }}>
                  {emp.User?.name?.charAt(0)}
                </div>
              )}
            </div>
            <h3 className="team-member-name" style={{ color: business.isDark ? 'white' : '#0f172a' }}>
              {emp.User?.name}
            </h3>
            <p className="team-member-role">
              {emp.specialty || (emp.isManager ? 'Director' : 'Especialista')}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

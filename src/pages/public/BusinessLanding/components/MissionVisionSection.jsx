import { useState } from 'react';
import { Star, Zap } from 'lucide-react';

export default function MissionVisionSection({ business, primary, secondary }) {
  const [expandedMission, setExpandedMission] = useState(false);
  const [expandedVision, setExpandedVision] = useState(false);
  
  const MAX_TEXT_LENGTH = 150;
  
  if (!business.showMissionVision || (!business.mission && !business.vision)) return null;

  return (
    <div className="mv-container">
      {business.mission && (
        <div className="mv-card" style={{
          background: business.isDark ? 'rgba(15, 23, 42, 0.8)' : 'rgba(255, 255, 255, 0.75)',
          borderColor: business.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.4)'
        }}>
          <div className="mv-icon" style={{ background: `linear-gradient(135deg, ${primary} 0%, ${secondary} 100%)` }}>
            <Star size={32} color="white" />
          </div>
          <h2 className="mv-title" style={{ 
            position: 'relative', 
            zIndex: 1,
            color: business.isDark ? 'white' : '#0f172a'
          }}>
            Nuestra Misión
          </h2>
          <p className={`mv-text ${!expandedMission && business.mission.length > MAX_TEXT_LENGTH ? 'mv-text-truncated' : ''}`} style={{ color: business.isDark ? 'rgba(255,255,255,0.85)' : 'rgba(15, 23, 42, 0.7)' }}>
            {business.mission}
          </p>
          {business.mission.length > MAX_TEXT_LENGTH && (
            <button className="mv-read-more" onClick={() => setExpandedMission(!expandedMission)}>
              {expandedMission ? 'Ver menos' : 'Leer más'}
              <span style={{ fontSize: 10 }}>{expandedMission ? '▲' : '▼'}</span>
            </button>
          )}
        </div>
      )}
      {business.vision && (
        <div className="mv-card" style={{
          background: business.isDark ? 'rgba(15, 23, 42, 0.8)' : 'rgba(255, 255, 255, 0.75)',
          borderColor: business.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.4)'
        }}>
          <div className="mv-icon" style={{ background: `linear-gradient(135deg, ${primary} 0%, ${secondary} 100%)` }}>
            <Zap size={32} color="white" />
          </div>
          <h2 className="mv-title" style={{ 
            position: 'relative', 
            zIndex: 1,
            color: business.isDark ? 'white' : '#0f172a'
          }}>
            Nuestra Visión
          </h2>
          <p className={`mv-text ${!expandedVision && business.vision.length > MAX_TEXT_LENGTH ? 'mv-text-truncated' : ''}`} style={{ color: business.isDark ? 'rgba(255,255,255,0.85)' : 'rgba(15, 23, 42, 0.7)' }}>
            {business.vision}
          </p>
          {business.vision.length > MAX_TEXT_LENGTH && (
            <button className="mv-read-more" onClick={() => setExpandedVision(!expandedVision)}>
              {expandedVision ? 'Ver menos' : 'Leer más'}
              <span style={{ fontSize: 10 }}>{expandedVision ? '▲' : '▼'}</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}

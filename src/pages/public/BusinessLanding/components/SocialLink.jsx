import { useState } from 'react';

export default function SocialLink({ href, iconUrl, label, color, invert, hoverColor }) {
  if (!href) return null;
  const url = href.startsWith('http') ? href : `https://${href}`;
  const [isHovered, setIsHovered] = useState(false);

  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      title={label}
      className="social-sidebar-link"
      style={{
        '--link-color': color,
        backgroundColor: isHovered && hoverColor ? hoverColor : undefined
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {iconUrl && <img src={iconUrl} alt={label} style={{ width: 20, height: 20, filter: invert ? 'invert(1)' : 'none' }} />}
    </a>
  );
}

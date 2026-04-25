import SocialLink from './SocialLink';

export default function SocialSidebar({ business, primary, isDark }) {
  const hasSocials = !!(business.instagram || business.facebook || business.tiktok || 
    business.twitter || business.pinterest || business.youtube || business.website);
  
  if (!hasSocials) return null;

  return (
    <div className="social-sidebar">
      {business.instagram && (
        <SocialLink 
          href={business.instagram} 
          iconUrl="/instagram.png" 
          label="Instagram" 
          color="#E1306C" 
        />
      )}
      {business.facebook && (
        <SocialLink 
          href={business.facebook} 
          iconUrl="/facebook.png" 
          label="Facebook" 
          color="#1877F2" 
        />
      )}
      {business.tiktok && (
        <SocialLink 
          href={business.tiktok} 
          iconUrl="/tik-tok.png" 
          label="TikTok" 
          color="#000000" 
          invert={isDark} 
        />
      )}
      {business.twitter && (
        <SocialLink 
          href={business.twitter} 
          iconUrl="/x.png" 
          label="X" 
          color="#000000" 
          invert={isDark} 
          hoverColor="#1DA1F2" 
        />
      )}
      {business.pinterest && (
        <SocialLink 
          href={business.pinterest} 
          iconUrl="/pinterest.png" 
          label="Pinterest" 
          color="#E60023" 
        />
      )}
      {business.youtube && (
        <SocialLink 
          href={business.youtube} 
          iconUrl="/youtube.png" 
          label="YouTube" 
          color="#FF0000" 
        />
      )}
      {business.website && (
        <SocialLink 
          href={business.website} 
          iconUrl="/web.png" 
          label="Website" 
          color={primary} 
        />
      )}
    </div>
  );
}

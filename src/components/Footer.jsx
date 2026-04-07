import React from 'react';
import { useIsMobile } from '../hooks/useIsMobile';
import { STRINGS } from '../constants/strings';
import { THEME } from '../constants/theme';

export default function Footer({ language, onNavigate, currentPage }) {
  const isAdminPage = currentPage === 'admin';
  const isMobile = useIsMobile();
  const t = STRINGS[language];
  const FOOTER_TEXT = isAdminPage
    ? 'rgba(11,11,12,0.78)'
    : 'rgba(255,255,255,0.72)';
  const FOOTER_TITLE = isAdminPage
    ? 'rgba(11,11,12,0.92)'
    : 'rgba(255,255,255,0.90)';
  const FOOTER_SUBTLE = isAdminPage
    ? 'rgba(11,11,12,0.42)'
    : 'rgba(255,255,255,0.52)';
  const FOOTER_HOVER = THEME.accent; // Lokaly oranje

  const containerStyle = {
    borderTop: isAdminPage
      ? '1px solid rgba(15,23,42,0.10)'
      : `1px solid var(--lokaly-border)`,
    marginTop: isAdminPage ? 0 : 36,
    padding: isMobile ? '22px 16px 26px' : '26px 40px 30px',
    background: isAdminPage
      ? '#FFFFFF'
      : 'linear-gradient(180deg, rgba(0,0,0,0.00), rgba(0,0,0,0.55))',
    color: isAdminPage ? '#0B0B0C' : 'var(--lokaly-muted)',
  };

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: isMobile ? '1fr' : 'repeat(4,minmax(0,1fr))',
    gap: 18,
    maxWidth: 1120,
    margin: '0 auto',
  };

  const brandStyle = {
    fontWeight: 900,
    color: THEME.accent, // ✅ hele logo oranje
    fontSize: 16,
    marginBottom: 8,
    letterSpacing: 0.2,
    fontFamily: THEME.fontDisplay,
  };

  const columnTitleStyle = {
    fontWeight: 650,
    color: FOOTER_TITLE,
    marginBottom: 10,
    letterSpacing: 0.8,
    fontSize: 11,
    textTransform: 'uppercase',
    fontFamily: THEME.fontDisplay,
  };

  const linkBtnBase = {
    display: 'block',
    width: '100%',
    textAlign: 'left',
    padding: '4px 0',
    marginBottom: 6,
    border: 'none',
    background: 'transparent',
    color: FOOTER_TEXT,
    fontSize: 12,
    lineHeight: 1.35,
    cursor: 'pointer',
    transition: 'color 160ms ease, text-decoration-color 160ms ease',
  };

  function FooterLink({ children, page, disabled = false }) {
    const [hover, setHover] = React.useState(false);
    const [pressed, setPressed] = React.useState(false);

    const isActive = hover || pressed;
    const FOOTER_TEXT = isAdminPage
      ? 'rgba(11,11,12,0.78)'
      : 'rgba(255,255,255,0.72)';
    const FOOTER_SUBTLE = isAdminPage
      ? 'rgba(11,11,12,0.42)'
      : 'rgba(255,255,255,0.45)';

    return (
      <button
        type="button"
        onClick={() => {
          if (disabled) return;
          if (onNavigate) onNavigate(page);
        }}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => {
          setHover(false);
          setPressed(false);
        }}
        onMouseDown={() => setPressed(true)}
        onMouseUp={() => setPressed(false)}
        onTouchStart={() => setPressed(true)}
        onTouchEnd={() => setPressed(false)}
        style={{
          ...linkBtnBase, // ✅ dit is de fix: spread i.p.v. ".linkBtnBase"
          cursor: disabled ? 'not-allowed' : 'pointer',
          color: disabled
            ? FOOTER_SUBTLE
            : isActive
            ? THEME.orange
            : FOOTER_TEXT,
          textDecoration: disabled ? 'none' : isActive ? 'underline' : 'none',
          textDecorationColor: THEME.orange,
          textUnderlineOffset: 3,
        }}
        aria-disabled={disabled}
      >
        {children}
      </button>
    );
  }

  return (
    <footer style={containerStyle}>
      <div style={gridStyle}>
        <div>
          <div style={brandStyle}>
            Lokaly<span style={{ color: 'inherit' }}>.</span>
          </div>

          <p
            style={{
              margin: 0,
              maxWidth: 360,
              lineHeight: 1.55,
              fontSize: 12,
              color: FOOTER_TEXT,
            }}
          >
            {t.discoverAmsterdam}
            <br />
            {t.discoverSubtitle}
          </p>
        </div>

        <div>
          <div style={columnTitleStyle}>{t.platform}</div>
          <FooterLink page="about">{t.aboutLokaly}</FooterLink>
          <FooterLink page="how">{t.howItWorks}</FooterLink>
          <FooterLink page="organizers">{t.forOrganizers}</FooterLink>
        </div>

        <div>
          <div style={columnTitleStyle}>{t.info}</div>
          <FooterLink page="privacy">{t.privacy}</FooterLink>
          <FooterLink page="terms">{t.terms}</FooterLink>
          <FooterLink page="contact">{t.contact}</FooterLink>
          <FooterLink page="feedback">{t.feedback}</FooterLink>
        </div>

        <div>
          <div style={columnTitleStyle}>{t.cities}</div>
          <FooterLink page="home">{t.amsterdamBeta}</FooterLink>
          <FooterLink page="home" disabled>
            {t.soonUtrecht}
          </FooterLink>
          <FooterLink page="home" disabled>
            {t.soonRotterdam}
          </FooterLink>
        </div>
      </div>

      <div
        style={{
          maxWidth: 1120,
          margin: '18px auto 0',
          paddingTop: 12,
          borderTop: `1px solid var(--lokaly-border)`,
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          justifyContent: 'space-between',
          gap: 6,
          lineHeight: 1.4,
          fontSize: 11,
          color: isAdminPage ? 'rgba(11,11,12,0.62)' : 'rgba(255,255,255,0.68)',
        }}
      >
        <span>{t.footerMadeIn}</span>
        <span>{t.allRights}</span>
      </div>
    </footer>
  );
}

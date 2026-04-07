import React from 'react';
import { THEME } from '../constants/theme';
import { STRINGS } from '../constants/strings';
import { CATEGORIES } from '../constants/categories';
import { useIsMobile } from '../hooks/useIsMobile';
import { IconPin } from './icons';

// Helper functie om de juiste naam te kiezen op basis van taal
function getLocalizedName(nameValue, language) {
  if (!nameValue) return '';
  if (typeof nameValue === 'string') {
    const category = CATEGORIES.find(c =>
      c.name === nameValue || c.name_nl === nameValue || c.name_en === nameValue || c.slug === nameValue
    );
    if (category) {
      return language === 'nl' ? category.name_nl : category.name_en;
    }
    return nameValue;
  }
  return '';
}

// 1) 1 losse hero kaart (zelfde inhoud/design als je huidige Hero)
export default function HeroCard({ location, onOpen, language }) {
  const t = STRINGS[language] || STRINGS.nl;
  const isMobile = useIsMobile();
  const [isHovered, setIsHovered] = React.useState(false);

  if (!location) return null;

  const districtName =
    location?.districtName ||
    location?.district_name ||
    location?.district ||
    location?.neighborhood ||
    '';

  const categoryLabelRaw =
    location?.categoryName ||
    location?.category_name ||
    location?.category ||
    location?.type ||
    '';

  const categoryLabel = getLocalizedName(categoryLabelRaw, language);

  const heroDesc =
    location?.shortDescription ||
    location?.short_description ||
    location?.subtitle ||
    location?.tagline ||
    location?.description ||
    '';

  // ✅ zelfde “1 hoek rond”
  const heroCornerRadius = isMobile ? '16px 0 0 0' : '20px 0 0 0';

  const heroCard = {
    width: '100%',
    borderRadius: heroCornerRadius,
    overflow: 'hidden',
    position: 'relative',
    cursor: 'pointer',
    background: '#000',
    border: `1px solid ${
      isHovered ? 'rgba(255,90,31,0.22)' : 'rgba(255,255,255,0.10)'
    }`,
    boxShadow: isHovered
      ? '0 26px 70px rgba(0,0,0,0.55)'
      : '0 18px 52px rgba(0,0,0,0.40)',
    transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
    transition:
      'transform 180ms ease, box-shadow 220ms ease, border-color 220ms ease',
  };

  const heroImg = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block',
    transform: isHovered ? 'scale(1.03)' : 'scale(1)',
    transition: 'transform 300ms ease',
    filter: 'contrast(1.03) saturate(1.05)',
  };

  // ✅ pill match navbar (zoals je al deed)
  const pill = {
    position: 'absolute',
    top: 14,
    left: 14,
    zIndex: 3,
    padding: isMobile ? '6px 10px' : '7px 12px',
    borderRadius: isMobile ? '10px 0 10px 0' : '12px 0 12px 0',
    border: '1px solid rgba(255,255,255,0.14)',
    background: 'rgba(255,255,255,0.06)',
    color: 'rgba(255,255,255,0.92)',
    fontFamily: THEME.font,
    fontSize: isMobile ? 12 : 12.5,
    fontWeight: 400,
    letterSpacing: 0.1,
    textTransform: 'none',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
  };

  // --- MOBILE LAYOUT ---
  if (isMobile) {
    const mobileHeight = 330;

    const bottomDock = {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      padding: '14px 12px 12px',
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      zIndex: 3,
    };

    const titleStyle = {
      margin: 0,
      fontFamily: THEME.fontDisplay,
      fontSize: 18,
      fontWeight: 500,
      letterSpacing: -0.2,
      lineHeight: 1.15,
      color: 'rgba(235,240,255,0.88)',
      textShadow: '0 10px 22px rgba(0,0,0,0.35)',
      display: '-webkit-box',
      WebkitLineClamp: 2,
      WebkitBoxOrient: 'vertical',
      overflow: 'hidden',
    };

    const descStyle = {
      margin: '2px 0 0 0',
      fontFamily: THEME.font,
      fontSize: 12,
      fontWeight: 450,
      lineHeight: 1.25,
      color: 'rgba(235,240,255,0.74)',
      textShadow: '0 10px 22px rgba(0,0,0,0.30)',
      display: '-webkit-box',
      WebkitLineClamp: 2,
      WebkitBoxOrient: 'vertical',
      overflow: 'hidden',
    };

    const metaRow = {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-start',
      gap: 10,
      flexWrap: 'wrap',
      marginTop: 6,
    };

    const leftMeta = {
      display: districtName ? 'inline-flex' : 'none',
      alignItems: 'center',
      gap: 8,
      padding: '6px 10px',
      borderRadius: '10px 0 10px 0',
      border: '1px solid rgba(255,255,255,0.14)',
      background: 'rgba(255,255,255,0.06)',
      color: 'rgba(255,255,255,0.92)',
      fontFamily: THEME.font,
      fontSize: 12,
      fontWeight: 400,
      letterSpacing: 0.1,
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    };

    const catPill = {
      display: categoryLabel ? 'inline-flex' : 'none',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '6px 10px',
      borderRadius: '10px 0 10px 0',
      border: '1px solid rgba(255,255,255,0.14)',
      background: 'rgba(255,255,255,0.06)',
      color: 'rgba(255,255,255,0.92)',
      fontFamily: THEME.font,
      fontSize: 12,
      fontWeight: 400,
      letterSpacing: 0.1,
      width: 'fit-content',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
    };

    return (
      <div
        style={{ ...heroCard, height: mobileHeight }}
        onClick={onOpen}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <img
          src={location?.mainImage || location?.imageUrl || FALLBACK_IMAGE}
          alt={location?.name || ''}
          style={heroImg}
          loading="eager"
          fetchPriority="high"
          decoding="async"
        />

        <div style={pill}>{t.featured}</div>

        <div style={bottomDock}>
          <h2 style={titleStyle}>{location?.name}</h2>
          {heroDesc ? <p style={descStyle}>{heroDesc}</p> : null}

          <div style={metaRow}>
            <div style={leftMeta}>
              <IconPin size={14} color="rgba(255,255,255,0.78)" />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {districtName}
              </span>
            </div>

            {categoryLabel ? (
              <span style={catPill}>{categoryLabel}</span>
            ) : null}
          </div>
        </div>
      </div>
    );
  }

  // --- DESKTOP LAYOUT ---
  const desktopHeight = 'min(560px, 52vh)';

  const contentWrap = {
    position: 'absolute',
    left: 22,
    bottom: 18,
    zIndex: 3,
    width: 'min(560px, 62%)',
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  };

  const titleStyleDesktop = {
    margin: 0,
    fontFamily: THEME.fontDisplay,
    fontSize: 34,
    lineHeight: 1.05,
    fontWeight: 500,
    letterSpacing: -0.2,
    color: 'rgba(235,240,255,0.88)',
    textShadow: '0 18px 36px rgba(0,0,0,0.45)',
  };

  const descStyleDesktop = {
    margin: 0,
    fontFamily: THEME.font,
    fontSize: 14,
    fontWeight: 450,
    lineHeight: 1.35,
    color: 'rgba(235,240,255,0.74)',
    textShadow: '0 16px 30px rgba(0,0,0,0.40)',
    maxWidth: 520,
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  };

  const metaRowDesktop = {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    flexWrap: 'wrap',
  };

  const metaPill = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    padding: '9px 14px',
    borderRadius: '12px 0 12px 0',
    border: '1px solid rgba(255,255,255,0.14)',
    background: 'rgba(255,255,255,0.06)',
    color: 'rgba(255,255,255,0.92)',
    fontFamily: THEME.font,
    fontSize: 12.5,
    fontWeight: 400,
    letterSpacing: 0.1,
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
  };

  return (
    <div
      style={{ ...heroCard, height: desktopHeight }}
      onClick={onOpen}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <img
        src={location?.mainImage || location?.imageUrl || FALLBACK_IMAGE}
        alt={location?.name || ''}
        style={heroImg}
        loading="eager"
        fetchPriority="high"
        decoding="async"
      />

      <div style={pill}>{t.featured}</div>

      <div style={contentWrap}>
        <h1 style={titleStyleDesktop}>{location?.name}</h1>
        {heroDesc ? <p style={descStyleDesktop}>{heroDesc}</p> : null}

        <div style={metaRowDesktop}>
          {districtName ? (
            <span style={metaPill}>
              <IconPin size={15} color="rgba(255,255,255,0.90)" />
              {districtName}
            </span>
          ) : null}

          {categoryLabel ? <span style={metaPill}>{categoryLabel}</span> : null}
        </div>
      </div>
    </div>
  );
}